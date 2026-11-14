import { existsSync, lstatSync, readFileSync, mkdirSync, openSync, closeSync, writeFileSync, renameSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join, win32 } from "node:path";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

export const API_KEY_ENV_NAMES = ["SOCIALDATAX_API_KEY", "SOCIAL_MEDIA_MCP_API_KEY"];
export const credentialPath = () => join(homedir(), ".config", "socialdatax", "credentials.json");
const MAX_CREDENTIAL_BYTES = 65536;

// Windows chmod does not implement owner-only access. Use the current user's SID,
// not a localized account name; paths are stdin data, never PowerShell source.
const WINDOWS_CREDENTIAL_ACL = `
$ErrorActionPreference = 'Stop'
try {
  $request = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String([Console]::In.ReadToEnd())) | ConvertFrom-Json
  $target = [string]$request.path
  $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
  $attributes = [IO.File]::GetAttributes($target)
  if ($attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse point' }
  $directory = [bool]($attributes -band [IO.FileAttributes]::Directory)
  if ($request.action -eq 'protect') {
    if ($directory) {
      $acl = New-Object System.Security.AccessControl.DirectorySecurity
      $flags = 'OICI'
    } else {
      $acl = New-Object System.Security.AccessControl.FileSecurity
      $flags = ''
    }
    $acl.SetSecurityDescriptorSddlForm("D:P(A;$flags;FA;;;$($sid.Value))", [System.Security.AccessControl.AccessControlSections]::Access)
    $acl.SetOwner($sid)
    if ($directory) { [IO.Directory]::SetAccessControl($target, $acl) }
    else { [IO.File]::SetAccessControl($target, $acl) }
  }
  $actual = Get-Acl -LiteralPath $target
  $rules = @($actual.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
  if (-not $actual.AreAccessRulesProtected -or $actual.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -ne $sid.Value -or $rules.Count -ne 1) { throw 'Non-private ACL' }
  $rule = $rules[0]
  if ($rule.IdentityReference.Value -ne $sid.Value -or $rule.AccessControlType -ne 'Allow' -or $rule.IsInherited -or $rule.FileSystemRights -ne [System.Security.AccessControl.FileSystemRights]::FullControl) { throw 'Unexpected access rule' }
  if ($directory -and $rule.InheritanceFlags -ne ([System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [System.Security.AccessControl.InheritanceFlags]::ObjectInherit)) { throw 'Missing child protection' }
  'ok'
} catch { exit 1 }
`;

function windowsCredentialAcl(path, action) {
  const executable = win32.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  const result = spawnSync(executable, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(WINDOWS_CREDENTIAL_ACL, "utf16le").toString("base64")], {
    input: Buffer.from(JSON.stringify({ path, action }), "utf8").toString("base64"),
    encoding: "utf8", windowsHide: true, timeout: 10000, maxBuffer: 65536,
  });
  if (result.error || result.status !== 0 || result.stdout.trim() !== "ok") {
    throw Object.assign(new Error("Windows credential permissions could not be verified or restricted. Use your own Windows terminal and an ACL-capable user profile; do not share the Key."), { code: "SDX_CREDENTIAL_ACL" });
  }
}

function readCredentialFile(file) {
  try {
    const info = lstatSync(file);
    if (!info.isFile() || info.size > MAX_CREDENTIAL_BYTES) throw new Error("invalid");
    if (process.platform === "win32") windowsCredentialAcl(file, "check");
    else if (info.mode & 0o077) {
      throw new Error("permissions");
    }
    const data = JSON.parse(readFileSync(file, "utf8"));
    if (!data || Array.isArray(data) || typeof data !== "object" ||
        typeof data.apiKey !== "string") throw new Error("invalid");
    return data;
  } catch (error) {
    if (error.code === "SDX_CREDENTIAL_ACL") throw error;
    if (error.code === "ENOENT") return null;
    if (error.code === "EACCES" || error.code === "EPERM") {
      throw new Error("Cannot access local credential file. Check the current user, home directory and file or sandbox permissions.");
    }
    if (error.message === "permissions") {
      throw new Error("Local credential file must be readable only by its owner (chmod 600).");
    }
    throw new Error("Invalid local credential file. Repair it locally without sharing its content.");
  }
}

export function resolveApiKey(env = process.env, file = credentialPath()) {
  const existing = API_KEY_ENV_NAMES.map(name => env[name]?.trim()).find(Boolean);
  if (existing) return { apiKey: existing, source: "environment" };
  const apiKey = readCredentialFile(file)?.apiKey.trim();
  return { apiKey: apiKey || null, source: apiKey ? "file" : null };
}

export function saveApiKey(key, file = credentialPath()) {
  key = key.trim();
  if (!key || /[\r\n\0]/.test(key)) throw new Error("API Key must be a non-empty single line.");
  if (process.platform === "win32") {
    mkdirSync(dirname(file), { recursive: true });
    windowsCredentialAcl(dirname(file), "protect");
    if (existsSync(file)) {
      if (!lstatSync(file).isFile()) throw new Error("Invalid local credential file.");
      windowsCredentialAcl(file, "protect");
    }
  }
  const existing = readCredentialFile(file) || {};
  const content = JSON.stringify({ ...existing, apiKey: key }) + "\n";
  if (Buffer.byteLength(content, "utf8") > MAX_CREDENTIAL_BYTES) {
    throw new Error("Local credential file is too large; the original credential was not replaced.");
  }
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.${process.pid}.tmp`;
  let created = false;
  try {
    const descriptor = openSync(temporary, "wx", 0o600);
    created = true;
    try { writeFileSync(descriptor, content); }
    finally { closeSync(descriptor); }
    if (process.platform === "win32") windowsCredentialAcl(temporary, "protect");
    renameSync(temporary, file);
    created = false;
  } finally {
    if (created) rmSync(temporary, { force: true });
  }
}

export async function runAuth(args) {
  if (args.length !== 1 || !["login", "status"].includes(args[0])) {
    throw new Error("Usage: socialdatax-skills auth login | auth status (no Key arguments).");
  }
  if (args[0] === "status") {
    const { apiKey, source } = resolveApiKey();
    console.log(JSON.stringify({ apiKeyReadable: Boolean(apiKey), source }));
    return;
  }
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    throw new Error("Run auth login in your own interactive terminal; do not send the Key through chat, arguments, or captured stdin.");
  }
  // Readline handles editing; its terminal output is discarded so the Key is never echoed.
  const muted = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const reader = createInterface({ input: process.stdin, output: muted, terminal: true });
  process.stderr.write("API Key (hidden; saved locally): ");
  try {
    const key = await reader.question("");
    saveApiKey(key);
    console.log(`\nAPI Key saved to ${credentialPath()}. CLI commands load it automatically when no environment Key is set.`);
  } finally {
    reader.close();
    muted.end();
  }
}
