import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { createServer } from "node:http";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { open as openFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { readToken as readPublishToken } from "../../../scripts/publish_social_media_insights_skills.mjs";
import { decryptWechatMediaCommand } from "../cli.mjs";
import { downloadBilibiliVideoFromManifest } from "../lib/media/bilibili-download.mjs";
import { downloadPlatformMediaFromUrl } from "../lib/media/platform-download.mjs";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(packageDir, "cli.mjs");
const removedDouyinApiKeyEnv = ["DOUYIN", "MCP", "API", "KEY"].join("_");

async function listenHttpServer(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
}

async function closeHttpServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function httpServerUrl(server, path = "/") {
  const address = server.address();
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
  return `http://127.0.0.1:${address.port}${path}`;
}

function runCli(args) {
  const env = { ...process.env };
  delete env.SOCIALDATAX_API_KEY;
  delete env.SOCIALDATAX_SOURCE_CLIENT;
  delete env.SOCIALDATAX_SOURCE_PLATFORM;
  delete env.SOCIALDATAX_SOURCE_SKILL;
  delete env.SOCIAL_MEDIA_MCP_API_KEY;
  delete env.SOCIAL_MEDIA_XHS_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_DOUYIN_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_KUAISHOU_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_BILIBILI_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_MCP_UPSTREAM_URL;
  delete env.XHS_MCP_API_KEY;
  delete env.XHS_MCP_UPSTREAM_URL;
  delete env.DOUYIN_MCP_UPSTREAM_URL;
  delete env.KUAISHOU_MCP_UPSTREAM_URL;
  delete env.BILIBILI_MCP_UPSTREAM_URL;

  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: packageDir,
    env,
    encoding: "utf8",
  });
}

function runCliWithEnv(args, extraEnv) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: packageDir,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
  });
}

function runCliWithEnvAsync(args, extraEnv) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd: packageDir,
      env: { ...process.env, ...extraEnv },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(
        new Error(
          `CLI timed out. stdout=${JSON.stringify(stdout)} stderr=${JSON.stringify(stderr)}`
        )
      );
    }, 10000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (status, signal) => {
      clearTimeout(timeout);
      resolve({ status, signal, stdout, stderr });
    });
  });
}

function extractDirectCliExamples(markdown) {
  const examples = [];
  let inBashBlock = false;
  let current = [];

  const flushCurrent = () => {
    if (current.length === 0) {
      return;
    }
    examples.push(
      current
        .map((line) => line.trim().replace(/\\$/, "").trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
    );
    current = [];
  };

  for (const line of markdown.split("\n")) {
    if (line === "```bash") {
      inBashBlock = true;
      continue;
    }
    if (inBashBlock && line === "```") {
      flushCurrent();
      inBashBlock = false;
      continue;
    }
    if (!inBashBlock) {
      continue;
    }
    if (line.startsWith("npx -y socialdatax-skills@latest ")) {
      flushCurrent();
      current = [line];
    } else if (current.length > 0 && line.trim() !== "") {
      current.push(line);
    }
  }
  flushCurrent();

  return examples;
}

function hasDirectCliExample(markdown, command) {
  return extractDirectCliExamples(markdown).some((example) =>
    example.includes(`npx -y socialdatax-skills@latest ${command}`)
  );
}

function assertDirectCliExample(markdown, command, message) {
  assert.ok(
    hasDirectCliExample(markdown, command),
    message ?? `expected direct CLI example for ${command}`
  );
}

function readWechatCapture(fileName) {
  return JSON.parse(
    readFileSync(join(packageDir, "..", "..", "capture", "wechat", fileName), "utf8")
  );
}

function firstWechatDetailMediaFromCapture(fileName, predicate) {
  const raw = readWechatCapture(fileName);
  const mediaItems = raw.data?.object?.objectDesc?.media;
  assert.ok(Array.isArray(mediaItems), `expected detail media array in ${fileName}`);
  const media = mediaItems.find(predicate);
  assert.ok(media, `expected matching detail media in ${fileName}`);
  return media;
}

function appendWechatDecodeKey(url, decodeKey) {
  return `${url}${url.includes("?") ? "&" : "?"}k=${encodeURIComponent(decodeKey)}`;
}

function makeBilibiliDownloadManifest() {
  return {
    platform: "bilibili",
    title: "测试 Bilibili 视频",
    bvid: "BV1test",
    aid: "123",
    cid: "456",
    page: 1,
    selected_quality: "1080P 高清",
    expires_at: null,
    headers: {
      Referer: "https://www.bilibili.com/",
      "User-Agent": "SocialDataX-Test-UA",
    },
    download_manifest: {
      mode: "dash",
      tracks: [
        {
          type: "video",
          url: "http://127.0.0.1/video.m4s",
          codec: "avc1.640028",
          quality: "1080P 高清",
          width: 1920,
          height: 1080,
          ext: "m4s",
          bandwidth: 1800000,
        },
        {
          type: "audio",
          url: "http://127.0.0.1/audio.m4s",
          codec: "mp4a.40.2",
          quality: "",
          width: null,
          height: null,
          ext: "m4s",
          bandwidth: 128000,
        },
      ],
      merge: {
        container: "mp4",
        strategy: "ffmpeg_copy",
      },
    },
  };
}

function mp4Box(type, payload) {
  const box = Buffer.alloc(8 + payload.length);
  box.writeUInt32BE(box.length, 0);
  box.write(type, 4, 4, "ascii");
  payload.copy(box, 8);
  return box;
}

function makeWechatVvcMp4WithOneByteNalLengthMetadata() {
  const vvcConfigPayload = Buffer.from([0x01, 0x00, 0x00, 0x37, 0x01, 0x02]);
  const visualSampleEntryHeader = Buffer.alloc(78);
  return Buffer.concat([
    mp4Box("ftyp", Buffer.from("isom0000", "ascii")),
    mp4Box(
      "moov",
      mp4Box(
        "trak",
        mp4Box(
          "mdia",
          mp4Box(
            "minf",
            mp4Box(
              "stbl",
              mp4Box(
                "stsd",
                Buffer.concat([
                  Buffer.from([0x00, 0x00, 0x00, 0x00]),
                  Buffer.from([0x00, 0x00, 0x00, 0x01]),
                  mp4Box(
                    "vvc1",
                    Buffer.concat([
                      visualSampleEntryHeader,
                      mp4Box("vvcC", vvcConfigPayload),
                    ])
                  ),
                ])
              )
            )
          )
        )
      )
    ),
    mp4Box("mdat", Buffer.from([0x00, 0x00, 0x00, 0xf6, 0xaa, 0xbb])),
  ]);
}

async function runCliWithMockMcp(args, extraEnv = {}, structuredContentForToolCall) {
  const toolCalls = [];
  const toolCallAuthorizationHeaders = [];
  const toolCallSourceClientHeaders = [];
  const toolCallSourcePlatformHeaders = [];
  const toolCallSourceSkillHeaders = [];
  const server = createServer((request, response) => {
    if (request.method === "GET") {
      response.writeHead(405).end();
      return;
    }
    if (request.method !== "POST") {
      response.writeHead(405).end();
      return;
    }

    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      const payload = JSON.parse(body);
      if (payload.method === "initialize") {
        response.writeHead(200, {
          "content-type": "application/json",
          "mcp-session-id": "test-session",
        });
        response.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: payload.id,
            result: {
              protocolVersion: payload.params.protocolVersion,
              capabilities: {},
              serverInfo: { name: "mock-mcp", version: "0.0.0" },
            },
          })
        );
        return;
      }
      if (payload.method === "notifications/initialized") {
        response.writeHead(202).end();
        return;
      }
      if (payload.method === "tools/call") {
        toolCallAuthorizationHeaders.push(request.headers.authorization ?? null);
        toolCallSourceClientHeaders.push(
          request.headers["x-socialdatax-client"] ?? null
        );
        toolCallSourcePlatformHeaders.push(
          request.headers["x-socialdatax-source-platform"] ?? null
        );
        toolCallSourceSkillHeaders.push(
          request.headers["x-socialdatax-source-skill"] ?? null
        );
        toolCalls.push(payload.params);
        const structuredContent = structuredContentForToolCall
          ? structuredContentForToolCall(payload.params, toolCalls.length)
          : { ok: true };
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: payload.id,
            result: {
              content: [],
              structuredContent,
            },
          })
        );
        return;
      }

      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: `unexpected ${payload.method}` }));
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  try {
    const address = server.address();
    assert.notEqual(address, null);
    assert.notEqual(typeof address, "string");
    const result = await runCliWithEnvAsync(args, {
      SOCIALDATAX_API_KEY: "test-key",
      SOCIAL_MEDIA_XHS_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIAL_MEDIA_DOUYIN_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIAL_MEDIA_KUAISHOU_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIAL_MEDIA_BILIBILI_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIAL_MEDIA_WEIBO_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIAL_MEDIA_WECHAT_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIALDATAX_SENSITIVE_CHECK_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      ...extraEnv,
    });
    return {
      result,
      toolCalls,
      toolCallAuthorizationHeaders,
      toolCallSourceClientHeaders,
      toolCallSourcePlatformHeaders,
      toolCallSourceSkillHeaders,
    };
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function assertCliError(result, expectedMessage) {
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, new RegExp(`\\] ${expectedMessage}\\n$`));
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unixSecondsDaysAgo(days) {
  return Math.floor(Date.now() / 1000) - days * 86400;
}

function assertOpenClawPackageMetadataMatchesManifest({
  packageJson,
  pluginManifest,
  provider,
}) {
  assert.deepEqual(
    packageJson.openclaw.runtimeRequirements,
    pluginManifest.runtimeRequirements
  );
  assert.deepEqual(packageJson.runtimeRequirements, pluginManifest.runtimeRequirements);
  assert.deepEqual(packageJson.openclaw.environment, pluginManifest.environment);
  assert.deepEqual(packageJson.openclaw.configUiHints, pluginManifest.configUiHints);
  assert.deepEqual(packageJson.requires, pluginManifest.requires);
  assert.equal(packageJson.primaryEnv, pluginManifest.primaryEnv);
  assert.deepEqual(packageJson.networkTargets, pluginManifest.networkTargets);
  assert.deepEqual(packageJson.metadata[provider], pluginManifest.metadata[provider]);
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractReturnedNoteUrlGuidance(text, label = "text") {
  const normalized = normalizeWhitespace(text);
  const start = normalized.toLowerCase().indexOf("returned `note_url`");
  assert.notEqual(start, -1, `${label} should mention returned note_url`);
  const nullStart = normalized.toLowerCase().indexOf("if `note_url` is null", start);
  return nullStart === -1 ? normalized.slice(start) : normalized.slice(start, nullStart);
}

function assertPreservesReturnedNoteUrl(text, label = "text") {
  const guidance = extractReturnedNoteUrlGuidance(text, label);

  assert.match(
    guidance,
    /such as|例如/,
    `${label} should make usage scenarios examples`
  );
  assert.match(
    guidance,
    /final answers|最终回答/,
    `${label} should cover final answers`
  );
  assert.match(guidance, /display|展示/, `${label} should cover display`);
  assert.match(
    guidance,
    /preserve (?:it exactly as the|the) full URL(?: exactly)?/,
    `${label} should require preserving the full URL`
  );
  assert.match(
    guidance,
    /including `xsec_token`(?: query parameters)?/,
    `${label} should require preserving xsec_token`
  );
  assert.match(
    guidance,
    /link assembled from `note_id`|do not rebuild links from `note_id`|synthesize the URL from `note_id`/i,
    `${label} should forbid rebuilding links from note_id`
  );
}

function assertDoesNotSynthesizeNoteUrlFromIdWhenMissing(text, label = "text") {
  const normalized = normalizeWhitespace(text);
  assert.match(
    normalized,
    /If `note_url` is null, do not synthesize a public link from `note_id`/i,
    `${label} should forbid synthesizing public links when note_url is null`
  );
}

test("public package version metadata stays aligned", () => {
  const packageJson = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf8")
  );
  const packageLock = JSON.parse(
    readFileSync(join(packageDir, "package-lock.json"), "utf8")
  );
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const cli = readFileSync(cliPath, "utf8");
  const versionPattern = escapeRegExp(packageJson.version);

  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[""].version, packageJson.version);
  assert.match(
    cli,
    new RegExp(`const PACKAGE_VERSION = "${versionPattern}";`)
  );
  assert.match(
    readme,
    new RegExp(`Current public capability version: \`${versionPattern}\``)
  );
});

test("publish script reads npm auth token from user npmrc", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-npm-token-config-"));
  const npmrcPath = join(tempDir, ".npmrc");
  writeFileSync(
    npmrcPath,
    "//registry.npmjs.org/:_authToken=fake-publish-token\nregistry=https://registry.npmjs.org/\n"
  );

  try {
    const token = await readPublishToken({
      env: {
        ...process.env,
        NPM_TOKEN: "",
        NPM_CONFIG_USERCONFIG: npmrcPath,
      },
    });
    assert.equal(token, "fake-publish-token");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("brand migration preserves published package ids and endpoint ids", () => {
  const packageJson = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf8")
  );
  const xhsOpenclawDir = join(dirname(packageDir), "xhs-insights-openclaw");
  const douyinOpenclawDir = join(dirname(packageDir), "douyin-insights-openclaw");
  const xhsOpenclaw = JSON.parse(
    readFileSync(join(xhsOpenclawDir, "openclaw.plugin.json"), "utf8")
  );
  const douyinOpenclaw = JSON.parse(
    readFileSync(join(douyinOpenclawDir, "openclaw.plugin.json"), "utf8")
  );

  assert.equal(packageJson.name, "socialdatax-skills");
  assert.deepEqual(packageJson.bin, {
    "socialdatax-skills": "cli.mjs",
  });
  assert.equal(xhsOpenclaw.id, "xhs-insights-openclaw-plugin");
  assert.deepEqual(xhsOpenclaw.providers, ["xhs-insights"]);
  assert.equal(douyinOpenclaw.id, "douyin-insights-openclaw-plugin");
  assert.deepEqual(douyinOpenclaw.providers, ["douyin-insights"]);
});

test("douyin package surface only documents the shared API key", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const cli = readFileSync(cliPath, "utf8");

  assert.doesNotMatch(readme, new RegExp(removedDouyinApiKeyEnv));
  assert.doesNotMatch(cli, new RegExp(removedDouyinApiKeyEnv));
});

test("public docs and doctor report only advertise the SocialDataX API key", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const legacyXhsApiKeyEnv = ["XHS", "MCP", "API", "KEY"].join("_");
  const legacySharedApiKeyEnv = ["SOCIAL", "MEDIA", "MCP", "API", "KEY"].join("_");

  assert.doesNotMatch(readme, new RegExp(legacyXhsApiKeyEnv));
  assert.doesNotMatch(readme, new RegExp(legacySharedApiKeyEnv));

  const result = runCli(["doctor", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);

  assert.deepEqual(report.security.apiKeyEnv, ["SOCIALDATAX_API_KEY"]);
  assert.equal(report.security.legacyApiKeyEnv, undefined);
  assert.equal(report.security.platformApiKeyEnv, undefined);
});

test("README preserves opaque page tokens", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  assert.match(readme, /complete returned `next_page_token`/);
  assert.match(
    readme,
    /Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses/
  );
});

test("README preserves returned XHS note URLs", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  assertPreservesReturnedNoteUrl(readme, "README");
  assertDoesNotSynthesizeNoteUrlFromIdWhenMissing(readme, "README");
});

test("public package discovery terms include transcript workflows", () => {
  const packageJson = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf8")
  );
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  for (const keyword of [
    "media-transcript",
    "speech-to-text",
    "transcript",
    "video-transcript",
    "bilibili",
    "bilibili-data",
    "bilibili-download",
  ]) {
    assert.ok(
      packageJson.keywords.includes(keyword),
      `package keywords should include ${keyword}`
    );
  }
  assert.match(readme, /media transcript skill/);
  assert.match(readme, /speech-to-text transcript skill/);
  assert.match(readme, /口播转文字 skill/);
  assert.match(readme, /xhs transcript --url "<note_url_or_share_text>"/);
  assert.match(readme, /xhs transcript --note-id "<note_id>"/);
  assert.match(readme, /xhs transcript --job-id "<job_id>"/);
  assert.match(readme, /xhs download-media --url "<xhs_media_url>" --output-dir \.\/downloads/);
  assert.match(readme, /douyin download-media --url "<douyin_media_url>" --output-dir \.\/downloads/);
  assert.match(readme, /kuaishou download-media --url "<kuaishou_media_url>" --output-dir \.\/downloads/);
  assert.match(readme, /weibo download-media --url "<weibo_media_url>" --output-dir \.\/downloads/);
  assert.match(readme, /XHS \/ Douyin \/ Kuaishou \/ Weibo local media download/);
  assert.match(readme, /Transcript commands submit a bounded video speech-to-text job/);
  assert.match(readme, /the CLI automatically continues matching get-job requests for up to 1200 seconds by default/);
  assert.match(readme, /--max-wait-seconds <seconds>/);
  assert.doesNotMatch(readme, /--no-wait/);
  assert.match(readme, /Direct CLI transcript commands wait and poll the same job by default/);
});

test("direct CLI keeps legacy shared API key env as runtime fallback", async () => {
  const { result, toolCalls, toolCallAuthorizationHeaders } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
    ],
    {
      SOCIALDATAX_API_KEY: "",
      SOCIAL_MEDIA_MCP_API_KEY: "legacy-test-key",
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "xhs_search_notes");
  assert.equal(toolCallAuthorizationHeaders[0], "Bearer legacy-test-key");
});

test("direct CLI prefers SocialDataX API key over legacy fallback env", async () => {
  const { result, toolCalls, toolCallAuthorizationHeaders } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
    ],
    {
      SOCIALDATAX_API_KEY: "primary-test-key",
      SOCIAL_MEDIA_MCP_API_KEY: "legacy-test-key",
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "xhs_search_notes");
  assert.equal(toolCallAuthorizationHeaders[0], "Bearer primary-test-key");
});

test("xhs download-media validates required local options", () => {
  assertCliError(
    runCli(["xhs", "download-media"]),
    "Missing --url for xhs download-media\\."
  );
  assertCliError(
    runCli([
      "xhs",
      "download-media",
      "--url",
      "https://sns-img.example.test/media.jpg",
    ]),
    "Missing --output or --output-dir for xhs download-media\\."
  );
  assertCliError(
    runCli([
      "xhs",
      "download-media",
      "--url",
      "https://sns-img.example.test/media.jpg",
      "--output",
      "media.jpg",
      "--output-dir",
      ".",
    ]),
    "Use only one of --output or --output-dir for xhs download-media\\."
  );
  assertCliError(
    runCli([
      "xhs",
      "download-media",
      "--url",
      "https://sns-img.example.test/media.jpg",
      "--output",
      "media.jpg",
      "--pretty=false",
    ]),
    "--pretty does not take a value\\."
  );
});

test("xhs download-media CLI saves a media URL locally without API key", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-cli-download-"));
  const outputDir = join(tempDir, "downloads");
  const body = Buffer.from("xhs-cli-media-body");
  const mediaRequests = [];
  const mediaServer = createServer((request, response) => {
    mediaRequests.push({
      url: request.url,
      referer: request.headers.referer,
      userAgent: request.headers["user-agent"],
      acceptEncoding: request.headers["accept-encoding"],
      range: request.headers.range,
    });
    response.writeHead(200, {
      "content-type": "image/jpeg",
      "content-length": String(body.length),
    });
    response.end(body);
  });

  await listenHttpServer(mediaServer);

  try {
    const result = await runCliWithEnvAsync(
      [
        "xhs",
        "download-media",
        "--url",
        httpServerUrl(mediaServer, "/media.jpg?imageView2/2/w/1080"),
        "--output-dir",
        outputDir,
        "--pretty",
      ],
      {
        SOCIALDATAX_API_KEY: "",
        SOCIAL_MEDIA_MCP_API_KEY: "",
      }
    );

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.platform, "xhs");
    assert.equal(payload.action, "download-media");
    assert.equal(payload.status, "downloaded");
    assert.equal(payload.output_path, join(outputDir, "media.jpg"));
    assert.equal(payload.output_bytes, body.length);
    assert.equal(payload.resumed, false);
    assert.equal(payload.content_type, "image/jpeg");
    assert.equal(readFileSync(payload.output_path, "utf8"), "xhs-cli-media-body");
    assert.equal(existsSync(`${payload.output_path}.part`), false);
    assert.deepEqual(mediaRequests, [
      {
        url: "/media.jpg?imageView2/2/w/1080",
        referer: "https://www.xiaohongshu.com/",
        userAgent: "Mozilla/5.0 (compatible; SocialDataX/1.0; +https://socialdatax.com)",
        acceptEncoding: "identity",
        range: undefined,
      },
    ]);
  } finally {
    await closeHttpServer(mediaServer);
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("douyin/kuaishou/weibo download-media validates required local options", () => {
  for (const platform of ["douyin", "kuaishou", "weibo"]) {
    assertCliError(
      runCli([platform, "download-media"]),
      `Missing --url for ${platform} download-media\\.`
    );
    assertCliError(
      runCli([
        platform,
        "download-media",
        "--url",
        "https://media.example.test/item.mp4",
      ]),
      `Missing --output or --output-dir for ${platform} download-media\\.`
    );
    assertCliError(
      runCli([
        platform,
        "download-media",
        "--url",
        "https://media.example.test/item.mp4",
        "--output",
        "media.mp4",
        "--output-dir",
        ".",
      ]),
      `Use only one of --output or --output-dir for ${platform} download-media\\.`
    );
    assertCliError(
      runCli([
        platform,
        "download-media",
        "--url",
        "https://media.example.test/item.mp4",
        "--output",
        "media.mp4",
        "--source-client",
        "socialdatax-skills",
      ]),
      "Unsupported option --source-client\\."
    );
  }
});

test("douyin/kuaishou/weibo download-media CLI saves media URLs with platform referers", async () => {
  const cases = [
    {
      platform: "douyin",
      path: "/music",
      contentType: "audio/mp4",
      expectedFile: "music.m4a",
      referer: "https://www.douyin.com/",
    },
    {
      platform: "kuaishou",
      path: "/video-play",
      contentType: "video/mp4",
      expectedFile: "video-play.mp4",
      referer: "https://www.kuaishou.com/",
    },
    {
      platform: "weibo",
      path: "/image",
      contentType: "image/jpeg",
      expectedFile: "image.jpg",
      referer: "https://weibo.com/",
    },
  ];

  for (const item of cases) {
    const tempDir = mkdtempSync(join(tmpdir(), `sdx-${item.platform}-download-`));
    const outputDir = join(tempDir, "downloads");
    const body = Buffer.from(`${item.platform}-media-body`);
    const mediaRequests = [];
    const mediaServer = createServer((request, response) => {
      mediaRequests.push({
        url: request.url,
        referer: request.headers.referer,
        userAgent: request.headers["user-agent"],
        acceptEncoding: request.headers["accept-encoding"],
        range: request.headers.range,
      });
      response.writeHead(200, {
        "content-type": item.contentType,
        "content-length": String(body.length),
      });
      response.end(body);
    });

    await listenHttpServer(mediaServer);

    try {
      const result = await runCliWithEnvAsync(
        [
          item.platform,
          "download-media",
          "--url",
          httpServerUrl(mediaServer, item.path),
          "--output-dir",
          outputDir,
          "--pretty",
        ],
        {
          SOCIALDATAX_API_KEY: "",
          SOCIAL_MEDIA_MCP_API_KEY: "",
        }
      );

      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      const payload = JSON.parse(result.stdout);
      assert.equal(payload.platform, item.platform);
      assert.equal(payload.action, "download-media");
      assert.equal(payload.status, "downloaded");
      assert.equal(payload.output_path, join(outputDir, item.expectedFile));
      assert.equal(payload.output_bytes, body.length);
      assert.equal(payload.resumed, false);
      assert.equal(payload.content_type, item.contentType);
      assert.equal(readFileSync(payload.output_path, "utf8"), `${item.platform}-media-body`);
      assert.equal(existsSync(`${payload.output_path}.part`), false);
      assert.deepEqual(mediaRequests, [
        {
          url: item.path,
          referer: item.referer,
          userAgent: "Mozilla/5.0 (compatible; SocialDataX/1.0; +https://socialdatax.com)",
          acceptEncoding: "identity",
          range: undefined,
        },
      ]);
    } finally {
      await closeHttpServer(mediaServer);
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

test("platform download-media skips existing output with the requested platform id", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-weibo-existing-output-"));
  const outputPath = join(tempDir, "media.jpg");
  writeFileSync(outputPath, "existing-weibo-media");

  try {
    const result = await downloadPlatformMediaFromUrl(
      "weibo",
      "https://wx1.example.test/media.jpg",
      { output: outputPath },
      {
        fetchMedia: async () => {
          throw new Error("fetch should not be called for existing output");
        },
      }
    );

    assert.deepEqual(result, {
      platform: "weibo",
      action: "download-media",
      status: "skipped_existing",
      url: "https://wx1.example.test/media.jpg",
      output_path: outputPath,
      output_bytes: Buffer.byteLength("existing-weibo-media"),
    });
    assert.equal(readFileSync(outputPath, "utf8"), "existing-weibo-media");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media skips an existing output file", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-existing-output-"));
  const outputPath = join(tempDir, "media.mp4");
  writeFileSync(outputPath, "existing-media");

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      "https://sns-video.example.test/media.mp4",
      { output: outputPath },
      {
        fetchMedia: async () => {
          throw new Error("fetch should not be called for existing output");
        },
      }
    );

    assert.deepEqual(result, {
      platform: "xhs",
      action: "download-media",
      status: "skipped_existing",
      url: "https://sns-video.example.test/media.mp4",
      output_path: outputPath,
      output_bytes: Buffer.byteLength("existing-media"),
    });
    assert.equal(readFileSync(outputPath, "utf8"), "existing-media");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media does not overwrite an output file created while downloading", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-raced-output-"));
  const outputPath = join(tempDir, "media.jpg");

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => ({
            ok: true,
            status: 200,
            headers: {
              get(name) {
                const normalized = String(name).toLowerCase();
                if (normalized === "content-length") {
                  return "9";
                }
                if (normalized === "content-type") {
                  return "image/jpeg";
                }
                return null;
              },
            },
            body: (async function* mediaBody() {
              yield Buffer.from("new-");
              writeFileSync(outputPath, "existing-during-download");
              yield Buffer.from("media");
            })(),
          }),
          retryDelayMs: 0,
        }
      ),
      /XHS media download output file already exists\./
    );

    assert.equal(readFileSync(outputPath, "utf8"), "existing-during-download");
    assert.equal(readFileSync(`${outputPath}.part`, "utf8"), "new-media");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media infers output-dir extensions from response content type", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-content-type-ext-"));
  const cases = [
    {
      url: "https://sns-img.example.test/xhs-photo?imageView2/2/w/1080",
      contentType: "image/jpeg; charset=binary",
      body: "jpeg-body",
      expectedFileName: "xhs-photo.jpg",
    },
    {
      url: "https://sns-img.example.test/xhs-heif?imageView2/2/w/1440/format/heif",
      contentType: "image/heif",
      body: "heif-body",
      expectedFileName: "xhs-heif.heif",
    },
    {
      url: "https://sns-img.example.test/xhs-query-heif?imageView2/2/w/1440/format/heif",
      contentType: null,
      body: "query-heif-body",
      expectedFileName: "xhs-query-heif.heif",
    },
    {
      url: "https://sns-video.example.test/xhs-video",
      contentType: "video/mp4",
      body: "mp4-body",
      expectedFileName: "xhs-video.mp4",
    },
  ];

  try {
    for (const testCase of cases) {
      const body = Buffer.from(testCase.body);
      const result = await downloadPlatformMediaFromUrl(
        "xhs",
        testCase.url,
        { outputDir: tempDir },
        {
          fetchMedia: async () => ({
            ok: true,
            status: 200,
            headers: {
              get(name) {
                const normalized = String(name).toLowerCase();
                if (normalized === "content-length") {
                  return String(body.length);
                }
                if (normalized === "content-type") {
                  return testCase.contentType;
                }
                return null;
              },
            },
            body: (async function* mediaBody() {
              yield body;
            })(),
          }),
          now: () => new Date("2026-07-17T12:00:00Z"),
        }
      );

      const outputPath = join(tempDir, testCase.expectedFileName);
      assert.equal(result.output_path, outputPath);
      assert.equal(result.output_bytes, body.length);
      assert.equal(readFileSync(outputPath, "utf8"), testCase.body);
      assert.equal(existsSync(`${outputPath}.part`), false);
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media skips an existing output-dir file after content type inference", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-inferred-existing-"));
  const outputPath = join(tempDir, "xhs-photo.jpg");
  writeFileSync(outputPath, "existing-photo");
  let bodyRead = false;

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      "https://sns-img.example.test/xhs-photo?imageView2/2/w/1080",
      { outputDir: tempDir },
      {
        fetchMedia: async () => ({
          ok: true,
          status: 200,
          headers: {
            get(name) {
              const normalized = String(name).toLowerCase();
              if (normalized === "content-length") {
                return "9";
              }
              if (normalized === "content-type") {
                return "image/jpeg";
              }
              return null;
            },
          },
          body: (async function* mediaBody() {
            bodyRead = true;
            yield Buffer.from("new-photo");
          })(),
        }),
      }
    );

    assert.deepEqual(result, {
      platform: "xhs",
      action: "download-media",
      status: "skipped_existing",
      url: "https://sns-img.example.test/xhs-photo?imageView2/2/w/1080",
      output_path: outputPath,
      output_bytes: Buffer.byteLength("existing-photo"),
    });
    assert.equal(bodyRead, false);
    assert.equal(readFileSync(outputPath, "utf8"), "existing-photo");
    assert.equal(existsSync(join(tempDir, "xhs-photo.bin.part")), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media falls back when final hard link is unavailable", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-link-fallback-"));
  const outputPath = join(tempDir, "media.jpg");
  const body = Buffer.from("link-fallback-media");
  let linkAttempts = 0;

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      "https://sns-img.example.test/media.jpg",
      { output: outputPath },
      {
        fetchMedia: async () => ({
          ok: true,
          status: 200,
          headers: {
            get(name) {
              const normalized = String(name).toLowerCase();
              if (normalized === "content-length") {
                return String(body.length);
              }
              if (normalized === "content-type") {
                return "image/jpeg";
              }
              return null;
            },
          },
          body: (async function* mediaBody() {
            yield body;
          })(),
        }),
        linkFile: async () => {
          linkAttempts += 1;
          const error = new Error("hard link unavailable");
          error.code = "EPERM";
          throw error;
        },
      }
    );

    assert.equal(linkAttempts, 1);
    assert.equal(result.status, "downloaded");
    assert.equal(result.output_path, outputPath);
    assert.equal(result.output_bytes, body.length);
    assert.equal(readFileSync(outputPath, "utf8"), "link-fallback-media");
    assert.equal(existsSync(`${outputPath}.part`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media skips existing inferred output after a complete part range", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-416-existing-"));
  const outputPath = join(tempDir, "xhs-photo.jpg");
  const partPath = join(tempDir, "xhs-photo.bin.part");
  writeFileSync(outputPath, "existing-photo");
  writeFileSync(partPath, "part-body");

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      "https://sns-img.example.test/xhs-photo?imageView2/2/w/1080",
      { outputDir: tempDir },
      {
        fetchMedia: async () => ({
          ok: false,
          status: 416,
          headers: {
            get(name) {
              const normalized = String(name).toLowerCase();
              if (normalized === "content-range") {
                return "bytes */9";
              }
              if (normalized === "content-type") {
                return "image/jpeg";
              }
              return null;
            },
          },
          body: null,
        }),
      }
    );

    assert.deepEqual(result, {
      platform: "xhs",
      action: "download-media",
      status: "skipped_existing",
      url: "https://sns-img.example.test/xhs-photo?imageView2/2/w/1080",
      output_path: outputPath,
      output_bytes: Buffer.byteLength("existing-photo"),
    });
    assert.equal(readFileSync(outputPath, "utf8"), "existing-photo");
    assert.equal(readFileSync(partPath, "utf8"), "part-body");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media does not finalize missing part files from 416 responses", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-416-missing-part-"));
  const outputPath = join(tempDir, "media.jpg");
  let attempts = 0;

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => {
            attempts += 1;
            return {
              ok: false,
              status: 416,
              headers: {
                get(name) {
                  return String(name).toLowerCase() === "content-range"
                    ? "bytes */0"
                    : null;
                },
              },
              body: null,
            };
          },
          retryDelayMs: 0,
        }
      ),
      /XHS media download failed before completion\./
    );

    assert.equal(attempts, 10);
    assert.equal(existsSync(outputPath), false);
    assert.equal(existsSync(`${outputPath}.part`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media rejects partial 206 responses without content-range", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-206-without-range-"));
  const outputPath = join(tempDir, "media.jpg");
  let attempts = 0;
  let bodyRead = false;

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => {
            attempts += 1;
            return {
              ok: true,
              status: 206,
              headers: {
                get(name) {
                  const normalized = String(name).toLowerCase();
                  if (normalized === "content-length") {
                    return "5";
                  }
                  if (normalized === "content-type") {
                    return "image/jpeg";
                  }
                  return null;
                },
              },
              body: (async function* partialBody() {
                bodyRead = true;
                yield Buffer.from("abcde");
              })(),
            };
          },
          retryDelayMs: 0,
        }
      ),
      /XHS media download failed before completion\./
    );

    assert.equal(attempts, 10);
    assert.equal(bodyRead, false);
    assert.equal(existsSync(outputPath), false);
    assert.equal(existsSync(`${outputPath}.part`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media rejects unusable partial content ranges", async () => {
  const cases = [
    {
      contentRange: "bytes 0-9/5",
      contentLength: "10",
    },
    {
      contentRange: "bytes 0-9/*",
      contentLength: "10",
    },
    {
      contentRange: "bytes 0-9/10",
      contentLength: "5",
    },
  ];

  for (const testCase of cases) {
    const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-invalid-range-"));
    const outputPath = join(tempDir, "media.jpg");
    let attempts = 0;
    let bodyRead = false;

    try {
      await assert.rejects(
        downloadPlatformMediaFromUrl(
          "xhs",
          "https://sns-img.example.test/media.jpg",
          { output: outputPath },
          {
            fetchMedia: async () => {
              attempts += 1;
              return {
                ok: true,
                status: 206,
                headers: {
                  get(name) {
                    const normalized = String(name).toLowerCase();
                    if (normalized === "content-range") {
                      return testCase.contentRange;
                    }
                    if (normalized === "content-length") {
                      return testCase.contentLength;
                    }
                    if (normalized === "content-type") {
                      return "image/jpeg";
                    }
                    return null;
                  },
                },
                body: (async function* partialBody() {
                  bodyRead = true;
                  yield Buffer.from("0123456789");
                })(),
              };
            },
            retryDelayMs: 0,
          }
        ),
        /XHS media download failed before completion\./
      );

      assert.equal(attempts, 10, testCase.contentRange);
      assert.equal(bodyRead, false, testCase.contentRange);
      assert.equal(existsSync(outputPath), false, testCase.contentRange);
      assert.equal(existsSync(`${outputPath}.part`), false, testCase.contentRange);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

test("xhs download-media restarts stale part after mismatched content-range", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-stale-range-"));
  const outputPath = join(tempDir, "media.mp4");
  writeFileSync(`${outputPath}.part`, "hello");
  const requests = [];
  let staleBodyRead = false;

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      "https://sns-video.example.test/media.mp4",
      { output: outputPath },
      {
        fetchMedia: async (_url, request) => {
          requests.push(request.headers.Range);
          if (requests.length === 1) {
            return {
              ok: true,
              status: 206,
              headers: {
                get(name) {
                  const normalized = String(name).toLowerCase();
                  if (normalized === "content-range") {
                    return "bytes 0-4/11";
                  }
                  if (normalized === "content-length") {
                    return "5";
                  }
                  if (normalized === "content-type") {
                    return "video/mp4";
                  }
                  return null;
                },
              },
              body: (async function* staleBody() {
                staleBodyRead = true;
                yield Buffer.from("hello");
              })(),
            };
          }
          return {
            ok: true,
            status: 200,
            headers: {
              get(name) {
                const normalized = String(name).toLowerCase();
                if (normalized === "content-length") {
                  return "11";
                }
                if (normalized === "content-type") {
                  return "video/mp4";
                }
                return null;
              },
            },
            body: (async function* mediaBody() {
              yield Buffer.from("hello world");
            })(),
          };
        },
        retryDelayMs: 0,
      }
    );

    assert.equal(result.status, "downloaded");
    assert.equal(result.output_path, outputPath);
    assert.equal(result.output_bytes, 11);
    assert.equal(result.resumed, false);
    assert.deepEqual(requests, ["bytes=5-", undefined]);
    assert.equal(staleBodyRead, false);
    assert.equal(readFileSync(outputPath, "utf8"), "hello world");
    assert.equal(existsSync(`${outputPath}.part`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media retries bodies longer than declared size", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-long-body-"));
  const outputPath = join(tempDir, "media.jpg");
  let attempts = 0;

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => {
            attempts += 1;
            return {
              ok: true,
              status: 200,
              headers: {
                get(name) {
                  const normalized = String(name).toLowerCase();
                  if (normalized === "content-length") {
                    return "5";
                  }
                  if (normalized === "content-type") {
                    return "image/jpeg";
                  }
                  return null;
                },
              },
              body: (async function* longBody() {
                yield Buffer.from("too-long");
              })(),
            };
          },
          retryDelayMs: 0,
        }
      ),
      /XHS media download failed before completion\./
    );

    assert.equal(attempts, 10);
    assert.equal(existsSync(`${outputPath}.part`), false);
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media rejects bodies longer than partial content range", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-long-range-body-"));
  const outputPath = join(tempDir, "media.jpg");
  let attempts = 0;

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => {
            attempts += 1;
            return {
              ok: true,
              status: 206,
              headers: {
                get(name) {
                  const normalized = String(name).toLowerCase();
                  if (normalized === "content-range") {
                    return "bytes 0-4/10";
                  }
                  if (normalized === "content-type") {
                    return "image/jpeg";
                  }
                  return null;
                },
              },
              body: (async function* longRangeBody() {
                yield Buffer.from("0123456789");
              })(),
            };
          },
          retryDelayMs: 0,
        }
      ),
      /XHS media download failed before completion\./
    );

    assert.equal(attempts, 10);
    assert.equal(existsSync(outputPath), false);
    assert.equal(existsSync(`${outputPath}.part`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media resumes from a part file with valid content-range", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-resume-"));
  const outputPath = join(tempDir, "media.mp4");
  writeFileSync(`${outputPath}.part`, "hello");
  const requests = [];
  const mediaServer = createServer((request, response) => {
    requests.push({
      range: request.headers.range,
      acceptEncoding: request.headers["accept-encoding"],
    });
    response.writeHead(206, {
      "content-type": "video/mp4",
      "content-range": "bytes 5-10/11",
      "content-length": "6",
    });
    response.end(" world");
  });

  await listenHttpServer(mediaServer);

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      httpServerUrl(mediaServer, "/video.mp4"),
      { output: outputPath }
    );

    assert.equal(result.status, "downloaded");
    assert.equal(result.output_path, outputPath);
    assert.equal(result.output_bytes, 11);
    assert.equal(result.resumed, true);
    assert.equal(readFileSync(outputPath, "utf8"), "hello world");
    assert.equal(existsSync(`${outputPath}.part`), false);
    assert.deepEqual(requests, [
      {
        range: "bytes=5-",
        acceptEncoding: "identity",
      },
    ]);
  } finally {
    await closeHttpServer(mediaServer);
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media restarts part download when server ignores range", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-range-ignored-"));
  const outputPath = join(tempDir, "media.jpg");
  writeFileSync(`${outputPath}.part`, "stale-part");
  const requests = [];
  const mediaServer = createServer((request, response) => {
    requests.push(request.headers.range);
    response.writeHead(200, {
      "content-type": "image/jpeg",
      "content-length": "9",
    });
    response.end("new-media");
  });

  await listenHttpServer(mediaServer);

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      httpServerUrl(mediaServer, "/media.jpg"),
      { output: outputPath }
    );

    assert.equal(result.status, "downloaded");
    assert.equal(result.resumed, false);
    assert.equal(readFileSync(outputPath, "utf8"), "new-media");
    assert.deepEqual(requests, ["bytes=10-"]);
  } finally {
    await closeHttpServer(mediaServer);
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media retries short bodies and preserves part file on failure", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-short-body-"));
  const outputPath = join(tempDir, "media.jpg");
  let attempts = 0;

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => {
            attempts += 1;
            return {
              ok: true,
              status: 200,
              headers: {
                get(name) {
                  const normalized = String(name).toLowerCase();
                  if (normalized === "content-length") {
                    return "10";
                  }
                  if (normalized === "content-type") {
                    return "image/jpeg";
                  }
                  return null;
                },
              },
              body: (async function* shortBody() {
                yield Buffer.from("short");
              })(),
            };
          },
          retryDelayMs: 0,
        }
      ),
      /XHS media download failed before completion\./
    );

    assert.equal(attempts, 10);
    assert.equal(readFileSync(`${outputPath}.part`, "utf8"), "short");
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media retries transient network errors", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-network-retry-"));
  const outputPath = join(tempDir, "media.jpg");
  let attempts = 0;

  try {
    const result = await downloadPlatformMediaFromUrl(
      "xhs",
      "https://sns-img.example.test/media.jpg",
      { output: outputPath },
      {
        fetchMedia: async () => {
          attempts += 1;
          if (attempts < 10) {
            throw new TypeError("fetch failed");
          }
          return {
            ok: true,
            status: 200,
            headers: {
              get(name) {
                const normalized = String(name).toLowerCase();
                if (normalized === "content-length") {
                  return "13";
                }
                if (normalized === "content-type") {
                  return "image/jpeg";
                }
                return null;
              },
            },
            body: (async function* mediaBody() {
              yield Buffer.from("retried-media");
            })(),
          };
        },
        retryDelayMs: 0,
      }
    );

    assert.equal(attempts, 10);
    assert.equal(result.status, "downloaded");
    assert.equal(readFileSync(outputPath, "utf8"), "retried-media");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media cancels unread error response bodies", async () => {
  const cases = [
    {
      status: 500,
      expectedAttempts: 10,
      expectedError: /XHS media download failed before completion\./,
    },
    {
      status: 403,
      expectedAttempts: 1,
      expectedError: /XHS media link is unavailable or expired\./,
    },
  ];

  for (const testCase of cases) {
    const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-error-body-"));
    const outputPath = join(tempDir, "media.jpg");
    let attempts = 0;
    let cancelCount = 0;

    try {
      await assert.rejects(
        downloadPlatformMediaFromUrl(
          "xhs",
          "https://sns-img.example.test/media.jpg",
          { output: outputPath },
          {
            fetchMedia: async () => {
              attempts += 1;
              return {
                ok: false,
                status: testCase.status,
                headers: {
                  get() {
                    return null;
                  },
                },
                body: {
                  async cancel() {
                    cancelCount += 1;
                  },
                },
              };
            },
            retryDelayMs: 0,
          }
        ),
        testCase.expectedError
      );

      assert.equal(attempts, testCase.expectedAttempts);
      assert.equal(cancelCount, testCase.expectedAttempts);
      assert.equal(existsSync(outputPath), false);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

test("xhs download-media cancels oversized content-length response bodies", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-large-body-cancel-"));
  const outputPath = join(tempDir, "media.jpg");
  let cancelCount = 0;

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          maxDownloadBytes: 4,
          fetchMedia: async () => ({
            ok: true,
            status: 200,
            headers: {
              get(name) {
                const normalized = String(name).toLowerCase();
                if (normalized === "content-length") {
                  return "5";
                }
                if (normalized === "content-type") {
                  return "image/jpeg";
                }
                return null;
              },
            },
            body: {
              async cancel() {
                cancelCount += 1;
              },
            },
          }),
        }
      ),
      /Media download is too large for local media processing\./
    );

    assert.equal(cancelCount, 1);
    assert.equal(existsSync(outputPath), false);
    assert.equal(existsSync(`${outputPath}.part`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("xhs download-media reports expired or unavailable links", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-xhs-expired-link-"));
  const outputPath = join(tempDir, "media.jpg");

  try {
    await assert.rejects(
      downloadPlatformMediaFromUrl(
        "xhs",
        "https://sns-img.example.test/media.jpg",
        { output: outputPath },
        {
          fetchMedia: async () => ({
            ok: false,
            status: 403,
            headers: {
              get() {
                return null;
              },
            },
            body: null,
          }),
          retryDelayMs: 0,
        }
      ),
      /XHS media link is unavailable or expired\. Get a fresh media URL from the XHS detail result and retry\./
    );
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download saves dash tracks and merges them with ffmpeg", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-download-"));
  const outputDir = join(tempDir, "downloads");
  const outputPath = join(outputDir, "bilibili-output.mp4");
  const ffmpegArgsPath = join(tempDir, "ffmpeg-args.json");
  const ffmpegPath = join(tempDir, "fake-ffmpeg.js");
  const videoBody = Buffer.from("video-track-body");
  const audioBody = Buffer.from("audio-track-body");
  const mediaRequests = [];
  const mediaServer = createServer((request, response) => {
    mediaRequests.push({
      url: request.url,
      referer: request.headers.referer,
      userAgent: request.headers["user-agent"],
      cookie: request.headers.cookie,
      authorization: request.headers.authorization,
      xInternalToken: request.headers["x-internal-token"],
    });
    if (request.url === "/video.m4s") {
      response.writeHead(200, {
        "content-type": "video/mp4",
        "content-length": String(videoBody.length),
      });
      response.end(videoBody);
      return;
    }
    if (request.url === "/audio.m4s") {
      response.writeHead(200, {
        "content-type": "video/mp4",
        "content-length": String(audioBody.length),
      });
      response.end(audioBody);
      return;
    }
    response.writeHead(404).end();
  });

  writeFileSync(
    ffmpegPath,
    [
      "#!/usr/bin/env node",
      "const fs = require('node:fs');",
      "if (process.argv[2] === '-version') { process.exit(0); }",
      `fs.writeFileSync(${JSON.stringify(ffmpegArgsPath)}, JSON.stringify(process.argv.slice(2)));`,
      "fs.writeFileSync(process.argv[process.argv.length - 1], 'merged-output');",
    ].join("\n")
  );
  chmodSync(ffmpegPath, 0o755);

  await new Promise((resolve, reject) => {
    mediaServer.once("error", reject);
    mediaServer.listen(0, "127.0.0.1", () => {
      mediaServer.off("error", reject);
      resolve();
    });
  });

  try {
    const address = mediaServer.address();
    assert.notEqual(address, null);
    assert.notEqual(typeof address, "string");
    const mediaBaseUrl = `http://127.0.0.1:${address.port}`;

    const { result, toolCalls } = await runCliWithMockMcp(
      [
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        outputPath,
        "--ffmpeg-path",
        ffmpegPath,
        "--keep-tracks",
        "--pretty",
      ],
      {},
      () => ({
        platform: "bilibili",
        title: "测试 Bilibili 视频",
        bvid: "BV1test",
        aid: "123",
        cid: "456",
        page: 1,
        selected_quality: "1080P 高清",
        expires_at: null,
        headers: {
          Referer: "https://www.bilibili.com/",
          "User-Agent": "SocialDataX-Test-UA",
          Cookie: "SESSDATA=secret",
          Authorization: "Bearer secret",
          "X-Internal-Token": "secret",
        },
        download_manifest: {
          mode: "dash",
          tracks: [
            {
              type: "video",
              url: `${mediaBaseUrl}/video.m4s`,
              backup_urls: [],
              codec: "avc1.640028",
              quality: "1080P 高清",
              width: 1920,
              height: 1080,
              ext: "m4s",
              bandwidth: 1800000,
            },
            {
              type: "audio",
              url: `${mediaBaseUrl}/audio.m4s`,
              backup_urls: [],
              codec: "mp4a.40.2",
              quality: "",
              width: null,
              height: null,
              ext: "m4s",
              bandwidth: 128000,
            },
          ],
          merge: {
            container: "mp4",
            strategy: "ffmpeg_copy",
          },
        },
      })
    );

    assert.equal(result.status, 0, result.stderr);
    assert.equal(toolCalls.length, 1);
    assert.equal(toolCalls[0].name, "bilibili_get_video_download_links");
    assert.deepEqual(toolCalls[0].arguments, {
      url: "https://www.bilibili.com/video/BV1test",
    });

    const payload = JSON.parse(result.stdout);
    assert.equal(payload.platform, "bilibili");
    assert.equal(payload.action, "download");
    assert.equal(payload.bvid, "BV1test");
    assert.equal(payload.selected_quality, "1080P 高清");
    assert.equal(payload.output_path, outputPath);
    assert.equal(payload.tracks.length, 2);
    assert.equal(payload.tracks[0].type, "video");
    assert.equal(payload.tracks[0].bytes_written, videoBody.length);
    assert.equal(payload.tracks[1].type, "audio");
    assert.equal(payload.tracks[1].bytes_written, audioBody.length);

    assert.equal(readFileSync(outputPath, "utf8"), "merged-output");
    assert.equal(readFileSync(payload.tracks[0].path, "utf8"), "video-track-body");
    assert.equal(readFileSync(payload.tracks[1].path, "utf8"), "audio-track-body");
    assert.deepEqual(mediaRequests, [
      {
        url: "/video.m4s",
        referer: "https://www.bilibili.com/",
        userAgent: "SocialDataX-Test-UA",
        cookie: undefined,
        authorization: undefined,
        xInternalToken: undefined,
      },
      {
        url: "/audio.m4s",
        referer: "https://www.bilibili.com/",
        userAgent: "SocialDataX-Test-UA",
        cookie: undefined,
        authorization: undefined,
        xInternalToken: undefined,
      },
    ]);

    const ffmpegArgs = JSON.parse(readFileSync(ffmpegArgsPath, "utf8"));
    assert.deepEqual(ffmpegArgs, [
      "-y",
      "-i",
      payload.tracks[0].path,
      "-i",
      payload.tracks[1].path,
      "-c",
      "copy",
      outputPath,
    ]);
    assert.equal(existsSync(payload.tracks[0].path), true);
    assert.equal(existsSync(payload.tracks[1].path), true);
  } finally {
    await new Promise((resolve, reject) => {
      mediaServer.close((error) => (error ? reject(error) : resolve()));
    });
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download derives output file from output-dir and removes tracks by default", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-output-dir-"));
  const outputDir = join(tempDir, "downloads");
  const manifest = makeBilibiliDownloadManifest();
  const trackBodies = new Map([
    [manifest.download_manifest.tracks[0].url, Buffer.from("video-track")],
    [manifest.download_manifest.tracks[1].url, Buffer.from("audio-track")],
  ]);
  const ffmpegCalls = [];

  const fetchMedia = async (url) => {
    const body = trackBodies.get(url);
    assert.ok(body, `unexpected Bilibili track url ${url}`);
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "content-length" ? String(body.length) : null;
        },
      },
      body: (async function* trackChunks() {
        yield body;
      })(),
    };
  };
  const spawnProcess = (_command, args) => {
    ffmpegCalls.push(args);
    const child = new EventEmitter();
    child.stderr = new EventEmitter();
    child.stderr.setEncoding = () => {};
    process.nextTick(() => {
      if (args[0] !== "-version") {
        writeFileSync(args.at(-1), "merged-output");
      }
      child.emit("close", 0);
    });
    return child;
  };

  try {
    const result = await downloadBilibiliVideoFromManifest(
      manifest,
      { outputDir },
      { fetchMedia, spawnProcess }
    );

    assert.equal(result.output_path, join(outputDir, "测试 Bilibili 视频-BV1test.mp4"));
    assert.equal(result.tracks_kept, false);
    assert.equal(readFileSync(result.output_path, "utf8"), "merged-output");
    assert.deepEqual(ffmpegCalls[0], ["-version"]);
    assert.deepEqual(ffmpegCalls[1], [
      "-y",
      "-i",
      result.tracks[0].path,
      "-i",
      result.tracks[1].path,
      "-c",
      "copy",
      result.output_path,
    ]);
    assert.equal(existsSync(result.tracks[0].path), false);
    assert.equal(existsSync(result.tracks[1].path), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download validates local output before API key checks", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-local-validation-"));
  const existingOutput = join(tempDir, "existing.mp4");
  const outputDirFile = join(tempDir, "not-a-directory");
  const parentFile = join(tempDir, "not-a-parent-directory");
  writeFileSync(existingOutput, "existing-output");
  writeFileSync(outputDirFile, "plain-file");
  writeFileSync(parentFile, "plain-file");

  try {
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--output",
        existingOutput,
      ]),
      "Missing --url for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
      ]),
      "Missing --output or --output-dir for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        join(tempDir, "video.mp4"),
        "--output-dir",
        tempDir,
      ]),
      "Use only one of --output or --output-dir for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        join(tempDir, "video-with-flag-value.mp4"),
        "--keep-tracks=false",
      ]),
      "--keep-tracks does not take a value\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        join(tempDir, "video-with-pretty-value.mp4"),
        "--pretty=false",
      ]),
      "--pretty does not take a value\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        existingOutput,
      ]),
      "Bilibili download output file already exists\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        tempDir,
      ]),
      "--output must be a file path for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output-dir",
        outputDirFile,
      ]),
      "--output-dir must be a directory for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        join(parentFile, "video.mp4"),
      ]),
      "--output parent path must be a directory for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        join(parentFile, "child", "video.mp4"),
      ]),
      "--output parent path must be a directory for bilibili download\\."
    );
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output-dir",
        join(parentFile, "downloads"),
      ]),
      "--output-dir parent path must be a directory for bilibili download\\."
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download reports missing API key before ffmpeg checks", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-api-key-before-ffmpeg-"));
  const outputPath = join(tempDir, "video.mp4");
  const missingFfmpegPath = join(tempDir, "missing-ffmpeg");

  try {
    assertCliError(
      runCli([
        "bilibili",
        "download",
        "--url",
        "https://www.bilibili.com/video/BV1test",
        "--output",
        outputPath,
        "--ffmpeg-path",
        missingFfmpegPath,
      ]),
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download checks ffmpeg before requesting download links", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-cli-ffmpeg-missing-"));
  const outputPath = join(tempDir, "video.mp4");
  const missingFfmpegPath = join(tempDir, "missing-ffmpeg");

  try {
    const { result, toolCalls } = await runCliWithMockMcp([
      "bilibili",
      "download",
      "--url",
      "https://www.bilibili.com/video/BV1test",
      "--output",
      outputPath,
      "--ffmpeg-path",
      missingFfmpegPath,
    ]);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /ffmpeg not found/);
    assert.match(result.stderr, new RegExp(escapeRegExp(missingFfmpegPath)));
    assert.equal(toolCalls.length, 0);
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download refuses to overwrite an existing output file", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-output-exists-"));
  const outputPath = join(tempDir, "video.mp4");
  writeFileSync(outputPath, "existing-output");

  try {
    await assert.rejects(
      downloadBilibiliVideoFromManifest(
        makeBilibiliDownloadManifest(),
        { output: outputPath },
        {
          fetchMedia: async () => {
            throw new Error("fetch should not be called");
          },
          spawnProcess: () => {
            throw new Error("ffmpeg should not be called");
          },
        }
      ),
      /Bilibili download output file already exists\./
    );
    assert.equal(readFileSync(outputPath, "utf8"), "existing-output");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download refuses to overwrite existing track files", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-track-exists-"));
  const outputPath = join(tempDir, "video.mp4");
  const videoTrackPath = `${outputPath}.video.m4s`;
  writeFileSync(videoTrackPath, "existing-track");

  try {
    await assert.rejects(
      downloadBilibiliVideoFromManifest(
        makeBilibiliDownloadManifest(),
        { output: outputPath },
        {
          fetchMedia: async () => {
            throw new Error("fetch should not be called");
          },
          spawnProcess: () => {
            throw new Error("ffmpeg should not be called");
          },
        }
      ),
      /Bilibili video track file already exists\./
    );
    assert.equal(readFileSync(videoTrackPath, "utf8"), "existing-track");
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download removes reserved track placeholder after download failure", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-track-fails-"));
  const outputPath = join(tempDir, "video.mp4");
  const videoTrackPath = `${outputPath}.video.m4s`;

  try {
    await assert.rejects(
      downloadBilibiliVideoFromManifest(
        makeBilibiliDownloadManifest(),
        { output: outputPath },
        {
          fetchMedia: async () => ({
            ok: false,
            status: 503,
            headers: {
              get() {
                return null;
              },
            },
            body: null,
          }),
          spawnProcess: (_command, args) => {
            assert.deepEqual(args, ["-version"]);
            const child = new EventEmitter();
            child.stderr = new EventEmitter();
            child.stderr.setEncoding = () => {};
            process.nextTick(() => {
              child.emit("close", 0);
            });
            return child;
          },
        }
      ),
      /Bilibili video track download failed with HTTP 503\./
    );
    assert.equal(existsSync(videoTrackPath), false);
    assert.equal(existsSync(outputPath), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download keeps merged output when track cleanup fails", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-cleanup-fails-"));
  const outputPath = join(tempDir, "video.mp4");
  const ffmpegPath = join(tempDir, "fake-ffmpeg.js");
  const manifest = makeBilibiliDownloadManifest();
  const trackBodies = new Map([
    [manifest.download_manifest.tracks[0].url, Buffer.from("video-track")],
    [manifest.download_manifest.tracks[1].url, Buffer.from("audio-track")],
  ]);
  const fetchMedia = async (url) => {
    const body = trackBodies.get(url);
    assert.ok(body, `unexpected Bilibili track url ${url}`);
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "content-length" ? String(body.length) : null;
        },
      },
      body: (async function* trackChunks() {
        yield body;
      })(),
    };
  };

  writeFileSync(
    ffmpegPath,
    [
      "#!/usr/bin/env node",
      "const fs = require('node:fs');",
      "const path = require('node:path');",
      "if (process.argv[2] === '-version') { process.exit(0); }",
      "const output = process.argv[process.argv.length - 1];",
      "fs.writeFileSync(output, 'merged-output');",
      "fs.chmodSync(path.dirname(output), 0o500);",
    ].join("\n")
  );
  chmodSync(ffmpegPath, 0o755);

  try {
    const result = await downloadBilibiliVideoFromManifest(
      manifest,
      { output: outputPath, ffmpegPath },
      { fetchMedia }
    );

    assert.equal(result.tracks_kept, true);
    assert.equal(readFileSync(outputPath, "utf8"), "merged-output");
    assert.equal(existsSync(result.tracks[0].path), true);
    assert.equal(existsSync(result.tracks[1].path), true);
  } finally {
    chmodSync(tempDir, 0o700);
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("bilibili download suggests ffmpeg install commands when ffmpeg is missing", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sdx-bilibili-ffmpeg-missing-"));
  const outputPath = join(tempDir, "video.mp4");
  const manifest = makeBilibiliDownloadManifest();
  let fetchCalled = false;
  const fetchMedia = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called");
  };
  const spawnProcess = () => {
    const child = new EventEmitter();
    child.stderr = new EventEmitter();
    child.stderr.setEncoding = () => {};
    process.nextTick(() => {
      const error = new Error("spawn ffmpeg ENOENT");
      error.code = "ENOENT";
      child.emit("error", error);
    });
    return child;
  };

  try {
    await assert.rejects(
      () =>
        downloadBilibiliVideoFromManifest(
          manifest,
          { output: outputPath },
          { fetchMedia, spawnProcess }
        ),
      (error) => {
        assert.match(error.message, /ffmpeg not found/);
        assert.match(error.message, /macOS.*brew install ffmpeg/s);
        assert.match(error.message, /Ubuntu\/Debian.*sudo apt install ffmpeg/s);
        assert.match(error.message, /Windows.*winget install Gyan\.FFmpeg/s);
        assert.match(error.message, /--ffmpeg-path/);
        return true;
      }
    );
    assert.equal(fetchCalled, false);
    assert.equal(existsSync(outputPath), false);
    assert.equal(existsSync(`${outputPath}.video.m4s`), false);
    assert.equal(existsSync(`${outputPath}.audio.m4s`), false);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("cli still runs when invoked through an npm-style symlink", () => {
  const destination = mkdtempSync(join(tmpdir(), "smi-test-bin-"));
  try {
    const binPath = join(destination, "socialdatax-skills");
    symlinkSync(cliPath, binPath);

    const result = spawnSync(binPath, ["--help"], {
      cwd: packageDir,
      env: { ...process.env },
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /^socialdatax-skills\n/);
    assert.match(result.stdout, /douyin user-info --profile-url/);
    assert.match(result.stdout, /xhs hot-search --pretty/);
    assert.match(result.stdout, /xhs transcript --url/);
    assert.match(result.stdout, /xhs download-media --url "<xhs_media_url>" --output-dir \.\/downloads/);
    assert.match(result.stdout, /douyin hot-search --pretty/);
    assert.match(result.stdout, /douyin user-series --profile-url/);
    assert.match(result.stdout, /douyin transcript --aweme-id/);
    assert.match(result.stdout, /douyin download-media --url "<douyin_media_url>" --output-dir \.\/downloads/);
    assert.match(result.stdout, /kuaishou hot-search --pretty/);
    assert.match(result.stdout, /kuaishou search --keyword/);
    assert.match(result.stdout, /kuaishou user-search --keyword/);
    assert.match(result.stdout, /kuaishou user-info --profile-url/);
    assert.match(result.stdout, /kuaishou transcript --photo-id/);
    assert.match(result.stdout, /kuaishou download-media --url "<kuaishou_media_url>" --output-dir \.\/downloads/);
    assert.match(result.stdout, /weibo transcript --post-url/);
    assert.match(result.stdout, /weibo download-media --url "<weibo_media_url>" --output-dir \.\/downloads/);
    assert.match(result.stdout, /wechat transcript --encrypted-object-id/);
    assert.match(result.stdout, /wechat decrypt-media --media-url/);
    assert.match(result.stdout, /sensitive-check text --text/);
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
});

test("npm pack only includes public skill package files", () => {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: packageDir,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const [pack] = JSON.parse(result.stdout);
  const paths = pack.files.map((file) => file.path).sort();

  assert.deepEqual(paths, [
    "LICENSE",
    "README.md",
    "assets/logo.png",
    "cli.mjs",
    "lib/media/bilibili-download.mjs",
    "lib/media/common.mjs",
    "lib/media/platform-download.mjs",
    "lib/media/wechat-decrypt.mjs",
    "package.json",
    "skills/media-comments/SKILL.md",
    "skills/media-comments/agents/openai.yaml",
    "skills/media-detail/SKILL.md",
    "skills/media-detail/agents/openai.yaml",
    "skills/media-search/SKILL.md",
    "skills/media-search/agents/openai.yaml",
    "skills/media-transcript/SKILL.md",
    "skills/media-transcript/agents/openai.yaml",
    "skills/media-user-info/SKILL.md",
    "skills/media-user-info/agents/openai.yaml",
    "skills/media-user-posts/SKILL.md",
    "skills/media-user-posts/agents/openai.yaml",
    "skills/sensitive-check/SKILL.md",
    "skills/sensitive-check/agents/openai.yaml",
    "skills/socialdatax-content-research-assistant/SKILL.md",
    "skills/socialdatax-content-research-assistant/agents/openai.yaml",
  ]);
  assert.equal(
    paths.some(
      (path) =>
        path.startsWith("node_modules/") ||
        path.endsWith(".tgz") ||
        path === "Dockerfile" ||
        path === "server-card.json" ||
        path === "mcp.json"
    ),
    false
  );
});

test("media user posts skill documents Douyin creator series commands", () => {
  const skill = readFileSync(
    join(packageDir, "skills", "media-user-posts", "SKILL.md"),
    "utf8"
  );

  assertDirectCliExample(skill, "douyin user-series --sec-user-id");
  assertDirectCliExample(skill, "douyin user-series --profile-url");
  assert.match(skill, /douyin_get_user_series_by_sec_user_id/);
  assert.match(skill, /douyin_get_user_series_by_profile_url/);
  assert.match(skill, /short-drama series/);
});

test("aggregate content research skill documents safe SocialDataX entrypoints", () => {
  const skill = readFileSync(
    join(packageDir, "skills", "socialdatax-content-research-assistant", "SKILL.md"),
    "utf8"
  );

  assert.match(skill, /name: "?socialdatax-content-research-assistant"?/);
  assert.match(skill, /SOCIALDATAX_API_KEY/);
  assert.match(skill, /https:\/\/socialdatax\.com/);
  assert.match(skill, /npx -y socialdatax-skills@latest xhs search/);
  assert.match(skill, /npx -y socialdatax-skills@latest xhs hot-search/);
  assert.match(skill, /npx -y socialdatax-skills@latest douyin search/);
  assert.match(skill, /npx -y socialdatax-skills@latest douyin hot-search/);
  assert.match(skill, /npx -y socialdatax-skills@latest kuaishou search/);
  assert.match(skill, /npx -y socialdatax-skills@latest kuaishou hot-search/);
  assert.match(skill, /npx -y socialdatax-skills@latest weibo search/);
  assert.match(skill, /npx -y socialdatax-skills@latest weibo hot-search/);
  assert.match(skill, /npx -y socialdatax-skills@latest wechat search/);
  assert.match(skill, /npx -y socialdatax-skills@latest wechat hot-search/);
  assert.match(
    readFileSync(join(packageDir, "README.md"), "utf8"),
    /`media-transcript`: submit and check video 口播转文字 \/ speech-to-text transcript jobs/
  );
  assert.match(skill, /Xiaohongshu|小红书/);
  assert.match(skill, /Douyin|抖音/);
  assert.match(skill, /Kuaishou|快手/);
  assert.match(skill, /Weibo|微博/);
  assert.match(skill, /WeChat Channels|视频号/);
  assert.doesNotMatch(skill, /52choujiang\.com\/assistant/);
  assert.doesNotMatch(skill, /SOCIAL_MEDIA_MCP_API_KEY/);
});

test("media detail skills document local media download commands", () => {
  const npmSkill = readFileSync(
    join(packageDir, "skills", "media-detail", "SKILL.md"),
    "utf8"
  );
  const openclawSkill = readFileSync(
    join(
      packageDir,
      "..",
      "socialdatax-openclaw-skills",
      "socialdatax-xhs-detail",
      "SKILL.md"
    ),
    "utf8"
  );
  const douyinSkill = readFileSync(
    join(
      packageDir,
      "..",
      "socialdatax-openclaw-skills",
      "socialdatax-douyin-detail",
      "SKILL.md"
    ),
    "utf8"
  );
  const kuaishouSkill = readFileSync(
    join(
      packageDir,
      "..",
      "socialdatax-openclaw-skills",
      "socialdatax-kuaishou-detail",
      "SKILL.md"
    ),
    "utf8"
  );
  const weiboSkill = readFileSync(
    join(
      packageDir,
      "..",
      "socialdatax-openclaw-skills",
      "socialdatax-weibo-detail",
      "SKILL.md"
    ),
    "utf8"
  );

  for (const skill of [npmSkill, openclawSkill]) {
    assert.match(skill, /image_items\[\]\.image_url/);
    assert.match(skill, /image_items\[\]\.live_photo\.video_url/);
    assert.match(skill, /video\.video_url/);
    assert.match(skill, /xhs download-media --url "<media_url>" --output-dir <directory> --pretty/);
    assert.match(skill, /does not require `SOCIALDATAX_API_KEY`/);
  }

  assert.match(openclawSkill, /optional XHS local save command writes only/);
  assert.match(npmSkill, /images\[\]\.url/);
  assert.match(npmSkill, /images\[\]\.live_photo\.play_url/);
  assert.match(npmSkill, /video\.play_url/);
  assert.match(npmSkill, /music\.play_url/);
  assert.match(npmSkill, /cover_image_url/);
  assert.match(npmSkill, /image_urls\[\]/);
  assert.match(npmSkill, /douyin download-media --url "<media_url>" --output-dir <directory> --pretty/);
  assert.match(npmSkill, /kuaishou download-media --url "<media_url>" --output-dir <directory> --pretty/);
  assert.match(npmSkill, /weibo download-media --url "<media_url>" --output-dir <directory> --pretty/);
  assert.match(npmSkill, /optional XHS, Douyin, Kuaishou, and Weibo local save commands write only/);
  assert.match(douyinSkill, /images\[\]\.url/);
  assert.match(douyinSkill, /images\[\]\.live_photo\.play_url/);
  assert.match(douyinSkill, /douyin download-media --url "<media_url>" --output-dir <directory> --pretty/);
  assert.match(douyinSkill, /optional Douyin local save command writes only/);
  assert.match(kuaishouSkill, /images\[\]\.url/);
  assert.match(kuaishouSkill, /kuaishou download-media --url "<media_url>" --output-dir <directory> --pretty/);
  assert.match(kuaishouSkill, /optional Kuaishou local save command writes only/);
  assert.match(weiboSkill, /weibo download-media --url "<media_url>" --output-dir <directory> --pretty/);
  assert.match(weiboSkill, /optional Weibo local save command writes only/);
});

test("xhs search rejects note-id because it is not a search option", () => {
  const result = runCli([
    "xhs",
    "search",
    "--keyword",
    "foo",
    "--note-id",
    "123",
  ]);

  assertCliError(result, "Unsupported option --note-id\\.");
});

test("sensitive-check text sends text to MCP but omits arguments from CLI output", async () => {
  const text = "这个方法百分百治愈焦虑";
  const { result, toolCalls, toolCallAuthorizationHeaders } =
    await runCliWithMockMcp([
      "sensitive-check",
      "text",
      "--text",
      text,
      "--platform",
      "xhs",
      "--pretty",
    ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "check_sensitive_text",
      arguments: {
        text,
        platform: "xhs",
      },
    },
  ]);
  assert.equal(toolCallAuthorizationHeaders[0], "Bearer test-key");
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "sensitive-check",
    tool: "check_sensitive_text",
    data: { ok: true },
  });
  assert.doesNotMatch(result.stdout, new RegExp(text));
});

test("sensitive-check text validates required text and platform before API key", () => {
  assertCliError(
    runCli(["sensitive-check", "text", "--platform", "xhs"]),
    "Missing --text for sensitive-check text\\."
  );
  assertCliError(
    runCli([
      "sensitive-check",
      "text",
      "--text",
      "hello",
      "--platform",
      "twitter",
    ]),
    'Unsupported --platform "twitter"\\. Use one of: generic, xhs, douyin, kuaishou\\.'
  );
});

test("xhs detail rejects page because it is not a detail option", () => {
  const result = runCli(["xhs", "detail", "--note-id", "a", "--page", "2"]);

  assertCliError(result, "Unsupported option --page\\.");
});

test("xhs search rejects page because it is not a search option", () => {
  const result = runCli([
    "xhs",
    "search",
    "--keyword",
    "foo",
    "--page",
    "2",
  ]);

  assertCliError(result, "Unsupported option --page\\.");
});

test("xhs search first page reaches the missing API key error", () => {
  const result = runCli(["xhs", "search", "--keyword", "foo"]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("direct CLI sends source attribution headers without changing tool arguments", async () => {
  const {
    result,
    toolCalls,
    toolCallSourceClientHeaders,
    toolCallSourcePlatformHeaders,
    toolCallSourceSkillHeaders,
  } = await runCliWithMockMcp([
    "xhs",
    "search",
    "--keyword",
    "露营",
    "--source-client",
    "socialdatax-skills",
    "--source-platform",
    "modelscope",
    "--source-skill",
    "xhs-content-research",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "xhs_search_notes",
      arguments: {
        keyword: "露营",
      },
    },
  ]);
  assert.deepEqual(toolCallSourceClientHeaders, ["socialdatax-skills"]);
  assert.deepEqual(toolCallSourcePlatformHeaders, ["modelscope"]);
  assert.deepEqual(toolCallSourceSkillHeaders, ["xhs-content-research"]);
});

test("direct CLI accepts source attribution from environment", async () => {
  const {
    result,
    toolCalls,
    toolCallSourceClientHeaders,
    toolCallSourcePlatformHeaders,
    toolCallSourceSkillHeaders,
  } = await runCliWithMockMcp(
    ["xhs", "search", "--keyword", "露营"],
    {
      SOCIALDATAX_SOURCE_CLIENT: "socialdatax-skills",
      SOCIALDATAX_SOURCE_PLATFORM: "skillhub",
      SOCIALDATAX_SOURCE_SKILL: "xhs-topic-analysis-v2",
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "xhs_search_notes");
  assert.deepEqual(toolCallSourceClientHeaders, ["socialdatax-skills"]);
  assert.deepEqual(toolCallSourcePlatformHeaders, ["skillhub"]);
  assert.deepEqual(toolCallSourceSkillHeaders, ["xhs-topic-analysis-v2"]);
});

test("transcript direct commands submit or check jobs with one entrypoint", async () => {
  const cases = [
    {
      args: ["xhs", "transcript", "--url", "https://xhslink.com/a1", "--pretty"],
      tool: "xhs_submit_video_speech_text_by_note_url",
      toolArguments: { note_url: "https://xhslink.com/a1" },
    },
    {
      args: ["xhs", "transcript", "--note-id", "note-1"],
      tool: "xhs_submit_video_speech_text_by_note_id",
      toolArguments: { note_id: "note-1" },
    },
    {
      args: ["xhs", "transcript", "--job-id", "job-1"],
      tool: "xhs_get_video_speech_text_job",
      toolArguments: { job_id: "job-1" },
      callArguments: { job_id: "job-1", wait_seconds: 240 },
    },
    {
      args: ["douyin", "transcript", "--url", "https://v.douyin.com/a1"],
      tool: "douyin_submit_video_speech_text_by_video_url",
      toolArguments: { video_url: "https://v.douyin.com/a1" },
    },
    {
      args: ["douyin", "transcript", "--aweme-id", "aweme-1"],
      tool: "douyin_submit_video_speech_text_by_aweme_id",
      toolArguments: { aweme_id: "aweme-1" },
    },
    {
      args: ["douyin", "transcript", "--job-id", "job-2"],
      tool: "douyin_get_video_speech_text_job",
      toolArguments: { job_id: "job-2" },
      callArguments: { job_id: "job-2", wait_seconds: 240 },
    },
    {
      args: ["kuaishou", "transcript", "--url", "https://v.kuaishou.com/a1"],
      tool: "kuaishou_submit_video_speech_text_by_video_url",
      toolArguments: { video_url: "https://v.kuaishou.com/a1" },
    },
    {
      args: ["kuaishou", "transcript", "--photo-id", "photo-1"],
      tool: "kuaishou_submit_video_speech_text_by_photo_id",
      toolArguments: { photo_id: "photo-1" },
    },
    {
      args: ["kuaishou", "transcript", "--job-id", "job-3"],
      tool: "kuaishou_get_video_speech_text_job",
      toolArguments: { job_id: "job-3" },
      callArguments: { job_id: "job-3", wait_seconds: 240 },
    },
    {
      args: ["weibo", "transcript", "--post-url", "https://weibo.com/1/A"],
      tool: "weibo_submit_video_speech_text_by_post_url",
      toolArguments: { post_url: "https://weibo.com/1/A" },
    },
    {
      args: ["weibo", "transcript", "--post-id", "post-1"],
      tool: "weibo_submit_video_speech_text_by_post_id",
      toolArguments: { post_id: "post-1" },
    },
    {
      args: ["weibo", "transcript", "--job-id", "job-4"],
      tool: "weibo_get_video_speech_text_job",
      toolArguments: { job_id: "job-4" },
      callArguments: { job_id: "job-4", wait_seconds: 240 },
    },
    {
      args: ["wechat", "transcript", "--url", "https://channels.weixin.qq.com/a1"],
      tool: "wechat_submit_video_speech_text_by_video_url",
      toolArguments: { video_url: "https://channels.weixin.qq.com/a1" },
    },
    {
      args: ["wechat", "transcript", "--encrypted-object-id", "enc-1"],
      tool: "wechat_submit_video_speech_text_by_encrypted_object_id",
      toolArguments: { encrypted_object_id: "enc-1" },
    },
    {
      args: ["wechat", "transcript", "--job-id", "job-5"],
      tool: "wechat_get_video_speech_text_job",
      toolArguments: { job_id: "job-5" },
      callArguments: { job_id: "job-5", wait_seconds: 240 },
    },
  ];

  for (const item of cases) {
    const { result, toolCalls } = await runCliWithMockMcp(
      item.args,
      {},
      ({ arguments: args }) => ({
        job_id: args.job_id || "tr-test",
        status: "succeeded",
        is_terminal: true,
        transcript: {
          text: "口播内容",
          segments: [{ start_ms: 0, end_ms: 1200, text: "口播内容" }],
        },
      })
    );

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(toolCalls, [
      {
        name: item.tool,
        arguments: item.callArguments || item.toolArguments,
      },
    ]);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.tool, item.tool);
    assert.deepEqual(payload.arguments, item.toolArguments);
  }
});

test("transcript direct CLI polls the same job until terminal by default", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    ["douyin", "transcript", "--url", "https://v.douyin.com/a1", "--pretty"],
    {},
    ({ name, arguments: args }, callIndex) => {
      if (name === "douyin_submit_video_speech_text_by_video_url") {
        assert.deepEqual(args, { video_url: "https://v.douyin.com/a1" });
        return {
          job_id: "tr-1",
          status: "running",
          is_terminal: false,
          next_poll_after_seconds: 0,
        };
      }
      assert.equal(name, "douyin_get_video_speech_text_job");
      assert.deepEqual(args, { job_id: "tr-1", wait_seconds: 240 });
      return callIndex === 2
        ? {
            job_id: "tr-1",
            status: "running",
            is_terminal: false,
            next_poll_after_seconds: 0,
          }
        : {
            job_id: "tr-1",
            status: "succeeded",
            is_terminal: true,
            transcript: {
              text: "口播内容",
              segments: [{ start_ms: 0, end_ms: 1200, text: "口播内容" }],
            },
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.name), [
    "douyin_submit_video_speech_text_by_video_url",
    "douyin_get_video_speech_text_job",
    "douyin_get_video_speech_text_job",
  ]);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.tool, "douyin_submit_video_speech_text_by_video_url");
  assert.deepEqual(payload.arguments, { video_url: "https://v.douyin.com/a1" });
  assert.equal(payload.data.status, "succeeded");
  assert.equal(payload.data.is_terminal, true);
  assert.equal(payload.data.transcript.text, "口播内容");
});

test("transcript direct commands require exactly one entrypoint", () => {
  assertCliError(
    runCli(["xhs", "transcript"]),
    "Missing input\\. Use exactly one of --url, --note-id, or --job-id\\."
  );
  assertCliError(
    runCli(["douyin", "transcript", "--url", "https://v.douyin.com/a1", "--aweme-id", "aweme-1"]),
    "Use exactly one of --url, --aweme-id, or --job-id\\."
  );
  assertCliError(
    runCli(["kuaishou", "transcript", "--photo-id", "photo-1", "--job-id", "job-1"]),
    "Use exactly one of --url, --photo-id, or --job-id\\."
  );
  assertCliError(
    runCli(["weibo", "transcript", "--url", "https://weibo.com/1/A"]),
    "Unsupported option --url\\."
  );
  assertCliError(
    runCli(["douyin", "transcript", "--url", "https://v.douyin.com/a1", "--no-wait"]),
    "Unsupported option --no-wait\\."
  );
  assertCliError(
    runCli(["douyin", "transcript", "--url", "https://v.douyin.com/a1", "--max-wait-seconds", "0"]),
    "--max-wait-seconds must be an integer greater than or equal to 1\\."
  );
  assertCliError(
    runCli(["wechat", "transcript", "--encrypted-object-id", "enc-1", "--job-id", "job-1"]),
    "Use exactly one of --url, --encrypted-object-id, or --job-id\\."
  );
});

test("wechat decrypt-media downloads and decrypts a detail media URL without API key", async () => {
  const encryptedMedia = Buffer.from(
    "9924d87a25344af3eb492e0b51154bdc66892d7461696c",
    "hex"
  );
  const plaintextMedia = Buffer.from("plain-video-prefix-tail");
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchCalls = [];
  const fetchMedia = async (url, init) => {
    fetchCalls.push({ url, init });
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "x-enclen" ? "18" : null;
        },
      },
      body: (async function* encryptedChunks() {
        yield encryptedMedia;
      })(),
    };
  };

  try {
    const result = await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.equal(fetchCalls.length, 1);
    assert.equal(
      fetchCalls[0].url,
      "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460"
    );
    assert.deepEqual(fetchCalls[0].init.headers, {
      Referer: "https://weixin.qq.com/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    });
    assert.equal(fetchCalls[0].init.redirect, "manual");
    assert.ok(fetchCalls[0].init.signal instanceof AbortSignal);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
    assert.deepEqual(result, {
      platform: "wechat",
      action: "decrypt-media",
      output_path: outputPath,
      decrypted: true,
      bytes_written: plaintextMedia.length,
    });
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media saves media as-is when no encrypted prefix is reported", async () => {
  const plaintextMedia = Buffer.from("plain-video-without-encryption");
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-plain-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get() {
        return null;
      },
    },
    body: (async function* plainChunks() {
      yield plaintextMedia.subarray(0, 7);
      yield plaintextMedia.subarray(7);
    })(),
  });

  try {
    const result = await decryptWechatMediaCommand(
      {
        mediaUrl: "http://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
    assert.deepEqual(result, {
      platform: "wechat",
      action: "decrypt-media",
      output_path: outputPath,
      decrypted: false,
      bytes_written: plaintextMedia.length,
    });
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media patches VVC MP4 NAL length metadata to 4-byte prefixes", async () => {
  const plaintextMedia = makeWechatVvcMp4WithOneByteNalLengthMetadata();
  const encryptedMedia = Buffer.from(
    "e948b9032d6d45eae65f2e4b11571e8a0ff1e0c5f0aecf4737c9c177df9b4199a82f112ae7c9f8994518ec15a0822d83793bca3da94b9fc88dfe1f3cc3b7ae8814bd3d0755fb415bfeaf87573113405f4c55ddbe25f0031dfc3328f75c50ef5384ffda34d9ecebbaed4209ef87e5201207a15090e891b5f96f6fc17d3b071e8768739dbf0ea223c13c57f05ff6e32bd38a4e663950140e1e6fa1fe5ba640775b0f75ef82bbbd7fed7cd2814cc862c6b69f6f6d9d9f8efd549687",
    "hex"
  );
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-vvc-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen"
          ? String(encryptedMedia.length)
          : null;
      },
    },
    body: (async function* plainChunks() {
      yield encryptedMedia;
    })(),
  });

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "http://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    const output = readFileSync(outputPath);
    const vvcConfigTypeOffset = output.indexOf(Buffer.from("vvcC", "ascii"));
    assert.notEqual(vvcConfigTypeOffset, -1);
    assert.equal(plaintextMedia[vvcConfigTypeOffset + 8], 0x01);
    assert.equal(output[vvcConfigTypeOffset + 8], 0x07);
    assert.deepEqual(output.subarray(0, vvcConfigTypeOffset + 8), plaintextMedia.subarray(0, vvcConfigTypeOffset + 8));
    assert.deepEqual(output.subarray(vvcConfigTypeOffset + 9), plaintextMedia.subarray(vvcConfigTypeOffset + 9));
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media leaves VVC metadata unchanged when media is not decrypted", async () => {
  const plaintextMedia = makeWechatVvcMp4WithOneByteNalLengthMetadata();
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-vvc-plain-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get() {
        return null;
      },
    },
    body: (async function* plainChunks() {
      yield plaintextMedia;
    })(),
  });

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "http://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts a real detail video media URL shape from capture", async () => {
  const media = firstWechatDetailMediaFromCapture(
    "finder_video_detail_by_url_anxgb9mb8i_20260610.json",
    (item) => item?.mediaType === 4 && typeof item.url === "string"
  );
  const mediaUrl = appendWechatDecodeKey(
    `${media.url}${media.urlToken ?? ""}`,
    media.decodeKey
  );
  const plaintextMedia = Buffer.from("plain-video-from-real-detail-shape");
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-capture-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl,
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(fetchCalls, [mediaUrl]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media follows allowed WeChat media redirects", async () => {
  const encryptedMedia = Buffer.from(
    "9924d87a25344af3eb492e0b51154bdc66892d7461696c",
    "hex"
  );
  const plaintextMedia = Buffer.from("plain-video-prefix-tail");
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-redirect-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    if (fetchCalls.length === 1) {
      return {
        ok: false,
        status: 302,
        headers: {
          get(name) {
            return name.toLowerCase() === "location"
              ? "http://wxapp.tc.qq.com/251/20302/stodownload?token=next"
              : null;
          },
        },
        body: null,
      };
    }
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "x-enclen" ? "18" : null;
        },
      },
      body: (async function* encryptedChunks() {
        yield encryptedMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(fetchCalls, [
      "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
      "http://wxapp.tc.qq.com/251/20302/stodownload?token=next",
    ]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects redirects outside WeChat media URLs", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-bad-redirect-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: false,
      status: 302,
      headers: {
        get(name) {
          return name.toLowerCase() === "location"
            ? "http://127.0.0.1:1/media.mp4"
            : null;
        },
      },
      body: null,
    };
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Media URL cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
    );
    assert.deepEqual(fetchCalls, [
      "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
    ]);
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts allowed-domain media URL shapes when k exists", async () => {
  const media = firstWechatDetailMediaFromCapture(
    "finder_video_detail_by_url_aol7dtqqwb_image_20260622.json",
    (item) => item?.mediaType === 2 && typeof item.url === "string"
  );
  const mediaUrl = appendWechatDecodeKey(
    `${media.url}${media.urlToken ?? ""}`,
    "330933460"
  );
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-image-capture-"));
  const outputPath = join(outputDir, "video.mp4");
  const plaintextMedia = Buffer.from("allowed-domain-new-shape");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl,
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(fetchCalls, [mediaUrl]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media CLI rejects non-WeChat media hosts before downloading", () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-host-"));
  const outputPath = join(outputDir, "video.mp4");

  try {
    const result = runCli([
      "wechat",
      "decrypt-media",
      "--media-url",
      "http://127.0.0.1:1/media.mp4?k=330933460",
      "--output",
      outputPath,
    ]);
    assertCliError(
      result,
      "Media URL cannot be decrypted\\. Use the video\\.video_url returned by SocialDataX WeChat detail\\."
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects invalid encrypted prefix length before writing output", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-bad-enclen-"));
  const outputPath = join(outputDir, "video.mp4");
  let bodyRead = false;
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen" ? "not-a-number" : null;
      },
    },
    body: (async function* encryptedChunks() {
      bodyRead = true;
      yield Buffer.from("encrypted");
    })(),
  });

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Downloaded media cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
    );
    assert.equal(bodyRead, false);
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects oversized encrypted prefix length before streaming media", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-large-enclen-"));
  const outputPath = join(outputDir, "video.mp4");
  let bodyRead = false;
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen" ? "11" : null;
      },
    },
    body: (async function* encryptedChunks() {
      bodyRead = true;
      yield Buffer.from("encrypted");
    })(),
  });

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia, maxDownloadBytes: 10 }
      ),
      /Media download is too large for local media processing\./
    );
    assert.equal(bodyRead, false);
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media decrypts media prefixes without a full-prefix allocation", async () => {
  const encryptedMedia = Buffer.from(
    "9924d87a25344af3eb492e0b51154bdc6689cd2dfca8cc1c47a5a08ac5c4569bcc4a7e8bfadff49e2c60c1e5ac822fc80957ab28b4128bcde99b7065c0b1b88a7dc5107334922d778ec3e65a29485507",
    "hex"
  );
  const plaintextMedia = Buffer.from(
    "plain-video-prefix-tail-plain-video-prefix-tail-plain-video-prefix-tail-plain-vi"
  );
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-chunked-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen" ? String(encryptedMedia.length) : null;
      },
    },
    body: (async function* encryptedChunks() {
      yield encryptedMedia.subarray(0, 27);
      yield encryptedMedia.subarray(27, 53);
      yield encryptedMedia.subarray(53);
    })(),
  });
  const originalAlloc = Buffer.alloc;
  Buffer.alloc = function allocWithBound(size, ...args) {
    if (size > 64) {
      throw new Error(`Unexpected full-prefix allocation: ${size}`);
    }
    return originalAlloc.call(Buffer, size, ...args);
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    Buffer.alloc = originalAlloc;
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects oversized content-length before writing output", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-too-large-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        if (name.toLowerCase() === "content-length") {
          return "11";
        }
        return name.toLowerCase() === "x-enclen" ? "8" : null;
      },
    },
    body: (async function* encryptedChunks() {
      yield Buffer.from("encrypted");
    })(),
  });

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia, maxDownloadBytes: 10 }
      ),
      /Media download is too large for local media processing\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects unsafe integer content-length before writing output", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-unsafe-length-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        if (name.toLowerCase() === "content-length") {
          return "9007199254740993";
        }
        return name.toLowerCase() === "x-enclen" ? "8" : null;
      },
    },
    body: (async function* encryptedChunks() {
      yield Buffer.from("encrypted");
    })(),
  });

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia, maxDownloadBytes: 10 }
      ),
      /Media download is too large for local media processing\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media stops when streamed media exceeds the local size limit", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-stream-large-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen" ? "8" : null;
      },
    },
    body: (async function* encryptedChunks() {
      yield Buffer.from("12345");
      yield Buffer.from("678901");
    })(),
  });

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia, maxDownloadBytes: 10 }
      ),
      /Media download is too large for local media processing\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media matches the Python Isaac64 vector across generator rollover", async () => {
  const encryptedMedia = Buffer.from(
    Array.from({ length: 4096 }, (_, index) => index % 256)
  );
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-long-vector-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen"
          ? String(encryptedMedia.length)
          : null;
      },
    },
    body: (async function* encryptedChunks() {
      yield encryptedMedia.subarray(0, 1500);
      yield encryptedMedia.subarray(1500, 2600);
      yield encryptedMedia.subarray(2600);
    })(),
  });

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.equal(
      createHash("sha256").update(readFileSync(outputPath)).digest("hex"),
      "15350eb1ca63c3d277dbd6bd5c1ee3fbba2932c8ff76111e8ec275f0438166f6"
    );
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media maps aborted downloads to a clear timeout error", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-timeout-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => {
    const error = new Error("operation aborted");
    error.name = "TimeoutError";
    throw error;
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Media download timed out\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects non-http media URLs before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-invalid-url-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "data:text/plain,video?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Invalid --media-url\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts new allowed-domain media paths when k exists", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-path-"));
  const outputPath = join(outputDir, "video.mp4");
  const plaintextMedia = Buffer.from("new-path-media");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/new/video/path?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );
    assert.deepEqual(fetchCalls, [
      "https://wxapp.tc.qq.com/new/video/path?k=330933460",
    ]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects decode keys outside uint64 before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-large-key-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=18446744073709551616",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Media URL cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts other WeChat stodownload paths when k exists", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-image-path-"));
  const outputPath = join(outputDir, "video.mp4");
  const plaintextMedia = Buffer.from("other-stodownload-path");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/251/20304/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );
    assert.deepEqual(fetchCalls, [
      "https://wxapp.tc.qq.com/251/20304/stodownload?k=330933460",
    ]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts findermp media host when k exists", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-finder-host-"));
  const outputPath = join(outputDir, "video.mp4");
  const plaintextMedia = Buffer.from("finder-host-media");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://findermp.video.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );
    assert.deepEqual(fetchCalls, [
      "https://findermp.video.qq.com/251/20302/stodownload?k=330933460",
    ]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts wst wxapp media host when k exists", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-wst-host-"));
  const outputPath = join(outputDir, "video.mp4");
  const plaintextMedia = Buffer.from("wst-host-media");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wst.wxapp.tc.qq.com/161/20304/snscosdownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );
    assert.deepEqual(fetchCalls, [
      "https://wst.wxapp.tc.qq.com/161/20304/snscosdownload?k=330933460",
    ]);
    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media accepts wxapp and video media host subtrees when k exists", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-subtrees-"));
  const mediaUrls = [
    "https://cdn.wxapp.tc.qq.com/new/video/path?k=330933460",
    "https://cdn.video.qq.com/new/video/path?k=330933460",
  ];
  const plaintextMedia = Buffer.from("subtree-host-media");
  const fetchCalls = [];
  const fetchMedia = async (url) => {
    fetchCalls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return null;
        },
      },
      body: (async function* plainChunks() {
        yield plaintextMedia;
      })(),
    };
  };

  try {
    for (const [index, mediaUrl] of mediaUrls.entries()) {
      const outputPath = join(outputDir, `video-${index}.mp4`);
      await decryptWechatMediaCommand(
        {
          mediaUrl,
          output: outputPath,
        },
        { fetchMedia }
      );
      assert.deepEqual(readFileSync(outputPath), plaintextMedia);
    }
    assert.deepEqual(fetchCalls, mediaUrls);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects lookalike WeChat media hosts before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-lookalike-host-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com.evil.invalid/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Media URL cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects broad qq.com parent hosts before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-parent-host-"));
  const fetchMedia = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    for (const [index, mediaUrl] of [
      "https://qq.com/media.mp4?k=330933460",
      "https://tc.qq.com/media.mp4?k=330933460",
      "https://video.qq.com/media.mp4?k=330933460",
    ].entries()) {
      await assert.rejects(
        decryptWechatMediaCommand(
          {
            mediaUrl,
            output: join(outputDir, `video-${index}.mp4`),
          },
          { fetchMedia }
        ),
        /Media URL cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
      );
      assert.throws(() => readFileSync(join(outputDir, `video-${index}.mp4`)), /ENOENT/);
    }
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects non-default media URL ports before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-port-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com:8443/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Media URL cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects media URL credentials before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-credentials-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => {
    throw new Error("fetch should not be called");
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://user:pass@wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputPath,
        },
        { fetchMedia }
      ),
      /Media URL cannot be decrypted\. Use the video\.video_url returned by SocialDataX WeChat detail\./
    );
    assert.throws(() => readFileSync(outputPath), /ENOENT/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media rejects directory output paths before downloading", async () => {
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-output-dir-"));
  let fetchCalled = false;
  const fetchMedia = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called");
  };

  try {
    await assert.rejects(
      decryptWechatMediaCommand(
        {
          mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
          output: outputDir,
        },
        { fetchMedia }
      ),
      /--output must be a file path for wechat decrypt-media\./
    );
    assert.equal(fetchCalled, false);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media completes when file writes are partial", async () => {
  const encryptedMedia = Buffer.from(
    "9924d87a25344af3eb492e0b51154bdc66892d7461696c",
    "hex"
  );
  const plaintextMedia = Buffer.from("plain-video-prefix-tail");
  const outputDir = mkdtempSync(join(tmpdir(), "socialdatax-wechat-media-partial-write-"));
  const outputPath = join(outputDir, "video.mp4");
  const fetchMedia = async () => ({
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "x-enclen" ? "18" : null;
      },
    },
    body: (async function* encryptedChunks() {
      yield encryptedMedia;
    })(),
  });
  const probe = await openFile(join(outputDir, "probe.tmp"), "w");
  const fileHandlePrototype = Object.getPrototypeOf(probe);
  await probe.close();
  const originalWrite = fileHandlePrototype.write;
  const partialWriteLengths = [];
  fileHandlePrototype.write = function writePartialBuffer(
    buffer,
    offset = 0,
    length,
    position
  ) {
    if (Buffer.isBuffer(buffer)) {
      const requestedLength =
        typeof length === "number" ? length : buffer.length - offset;
      if (requestedLength > 1) {
        const partialLength = Math.max(1, Math.floor(requestedLength / 2));
        partialWriteLengths.push({
          requestedLength,
          partialLength,
        });
        return originalWrite.call(this, buffer, offset, partialLength, position);
      }
    }
    return originalWrite.apply(this, arguments);
  };

  try {
    await decryptWechatMediaCommand(
      {
        mediaUrl: "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
        output: outputPath,
      },
      { fetchMedia }
    );

    assert.deepEqual(readFileSync(outputPath), plaintextMedia);
    assert.ok(
      partialWriteLengths.some(
        ({ requestedLength, partialLength }) => partialLength < requestedLength
      )
    );
  } finally {
    fileHandlePrototype.write = originalWrite;
    rmSync(outputDir, { recursive: true, force: true });
  }
});

test("wechat decrypt-media requires the media URL decrypt key before API key checks", () => {
  const result = runCli([
    "wechat",
    "decrypt-media",
    "--media-url",
    "https://wxapp.tc.qq.com/251/20302/stodownload",
    "--output",
    "video.mp4",
  ]);

  assertCliError(
    result,
    "Media URL cannot be decrypted\\. Use the video\\.video_url returned by SocialDataX WeChat detail\\."
  );
});

test("wechat decrypt-media rejects API source metadata options", () => {
  const result = runCli([
    "wechat",
    "decrypt-media",
    "--media-url",
    "https://wxapp.tc.qq.com/251/20302/stodownload?k=330933460",
    "--output",
    "video.mp4",
    "--source-client",
    "socialdatax-skills",
  ]);

  assertCliError(result, "Unsupported option --source-client\\.");
});

test("direct CLI rejects non-slug source skill before checking the API key", () => {
  const result = runCli([
    "xhs",
    "search",
    "--keyword",
    "foo",
    "--source-skill",
    "skillhub/xhs-content-research",
  ]);

  assertCliError(
    result,
    "--source-skill must be a lowercase skill slug using letters, numbers, and hyphens\\."
  );
});

test("xhs search keeps sort and filter options omitted unless explicitly provided", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    ["xhs", "search", "--keyword", "露营"],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      return {
        items: [{ note_id: "note-1" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [{ keyword: "露营" }]);
});

test("xhs search accepts all public sort values before checking the API key", () => {
  for (const sortType of [
    "general",
    "time_descending",
    "like_count_descending",
    "comment_count_descending",
    "collect_count_descending",
  ]) {
    const result = runCli([
      "xhs",
      "search",
      "--keyword",
      "foo",
      "--sort-type",
      sortType,
    ]);

    assertCliError(
      result,
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
  }
});

test("xhs search maps legacy sort aliases to public MCP arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "xhs",
    "search",
    "--keyword",
    "露营",
    "--sort-type",
    "popularity_descending",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "xhs_search_notes",
      arguments: {
        keyword: "露营",
        sort_type: "like_count_descending",
      },
    },
  ]);
});

test("xhs search maps page-token to MCP arguments without legacy page", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "xhs",
    "search",
    "--keyword",
    "露营",
    "--page-token",
    "next-search-token",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "xhs_search_notes",
      arguments: {
        keyword: "露营",
        page_token: "next-search-token",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "xhs",
    tool: "xhs_search_notes",
    arguments: {
      keyword: "露营",
      page_token: "next-search-token",
    },
    data: { ok: true },
  });
});

test("xhs comments maps comment sort type to MCP arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "xhs",
    "comments",
    "--note-id",
    "note-1",
    "--page-token",
    "next-comments-token",
    "--sort-type",
    "time_descending",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "xhs_get_note_comments_by_note_id",
      arguments: {
        note_id: "note-1",
        page_token: "next-comments-token",
        sort_type: "time_descending",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "xhs",
    tool: "xhs_get_note_comments_by_note_id",
    arguments: {
      note_id: "note-1",
      page_token: "next-comments-token",
      sort_type: "time_descending",
    },
    data: { ok: true },
  });
});

test("xhs comments maps every public comment sort type to MCP arguments", async () => {
  for (const sortType of ["default", "time_descending", "like_count_descending"]) {
    const { result, toolCalls } = await runCliWithMockMcp([
      "xhs",
      "comments",
      "--note-id",
      "note-1",
      "--sort-type",
      sortType,
    ]);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(toolCalls, [
      {
        name: "xhs_get_note_comments_by_note_id",
        arguments: {
          note_id: "note-1",
          sort_type: sortType,
        },
      },
    ]);
  }
});

test("xhs comments keeps comment sort type for URL pagination", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "comments",
      "--url",
      "https://www.xiaohongshu.com/explore/note-1",
      "--sort-type",
      "like_count_descending",
      "--pages",
      "2",
    ],
    {},
    ({ name, arguments: args }) => {
      assert.equal(name, "xhs_get_note_comments_by_note_url");
      assert.equal(args.sort_type, "like_count_descending");
      if (args.page_token) {
        return {
          items: [{ comment_id: "comment-2" }],
          next_page_token: "",
        };
      }
      return {
        items: [{ comment_id: "comment-1" }],
        next_page_token: "next-comments-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "xhs_get_note_comments_by_note_url",
      arguments: {
        note_url: "https://www.xiaohongshu.com/explore/note-1",
        sort_type: "like_count_descending",
      },
    },
    {
      name: "xhs_get_note_comments_by_note_url",
      arguments: {
        note_url: "https://www.xiaohongshu.com/explore/note-1",
        sort_type: "like_count_descending",
        page_token: "next-comments-token",
      },
    },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { comment_id: "comment-1" },
    { comment_id: "comment-2" },
  ]);
  assert.equal(payload.data.page_count, 2);
});

test("xhs comments accepts only public comment sort values before checking the API key", () => {
  for (const sortType of ["default", "time_descending", "like_count_descending"]) {
    const result = runCli([
      "xhs",
      "comments",
      "--note-id",
      "note-1",
      "--sort-type",
      sortType,
    ]);

    assertCliError(
      result,
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
  }

  const invalidSearchSort = runCli([
    "xhs",
    "comments",
    "--note-id",
    "note-1",
    "--sort-type",
    "general",
  ]);
  assertCliError(
    invalidSearchSort,
    'Unsupported --sort-type "general"\\. Use one of: default, time_descending, like_count_descending\\.'
  );
});

test("xhs search accepts public note type and publish time filters before checking the API key", () => {
  for (const noteType of ["all", "image", "video"]) {
    const result = runCli([
      "xhs",
      "search",
      "--keyword",
      "foo",
      "--note-type",
      noteType,
    ]);

    assertCliError(
      result,
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
  }

  for (const publishTimeRange of ["all", "day", "week", "half_year"]) {
    const result = runCli([
      "xhs",
      "search",
      "--keyword",
      "foo",
      "--publish-time-range",
      publishTimeRange,
    ]);

    assertCliError(
      result,
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
  }
});

test("xhs search rejects non-contract sort aliases before checking the API key", () => {
  for (const sortType of ["latest", "hot", "likes_descending"]) {
    const result = runCli([
      "xhs",
      "search",
      "--keyword",
      "foo",
      "--sort-type",
      sortType,
    ]);

    assertCliError(
      result,
      `Unsupported --sort-type "${sortType}"\\. Use one of: general, time_descending, like_count_descending, comment_count_descending, collect_count_descending\\.`
    );
  }
});

test("xhs search rejects unsupported note type and publish time filters before checking the API key", () => {
  const unsupportedNoteType = runCli([
    "xhs",
    "search",
    "--keyword",
    "foo",
    "--note-type",
    "live",
  ]);
  assertCliError(
    unsupportedNoteType,
    'Unsupported --note-type "live"\\. Use one of: all, image, video\\.'
  );

  const unsupportedPublishTimeRange = runCli([
    "xhs",
    "search",
    "--keyword",
    "foo",
    "--publish-time-range",
    "month",
  ]);
  assertCliError(
    unsupportedPublishTimeRange,
    'Unsupported --publish-time-range "month"\\. Use one of: all, day, week, half_year\\.'
  );
});

test("xhs detail still rejects note-id and url together", () => {
  const result = runCli(["xhs", "detail", "--note-id", "a", "--url", "b"]);

  assertCliError(result, "Use only one of --note-id or --url\\.");
});

test("xhs sub-comments requires note-id", () => {
  const result = runCli([
    "xhs",
    "sub-comments",
    "--comment-id",
    "comment-1",
  ]);

  assertCliError(result, "Missing --note-id for xhs sub-comments\\.");
});

test("xhs sub-comments requires comment-id", () => {
  const result = runCli([
    "xhs",
    "sub-comments",
    "--note-id",
    "note-1",
  ]);

  assertCliError(result, "Missing --comment-id for xhs sub-comments\\.");
});

test("xhs sub-comments with valid inputs reaches the missing API key error", () => {
  const result = runCli([
    "xhs",
    "sub-comments",
    "--note-id",
    "note-1",
    "--comment-id",
    "comment-1",
  ]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("douyin search rejects unsupported semantic filters before checking the API key", () => {
  const result = runCli([
    "douyin",
    "search",
    "--keyword",
    "foo",
    "--sort-type",
    "recent",
  ]);

  assertCliError(
    result,
    'Unsupported --sort-type "recent"\\. Use one of: general, time_descending, like_count_descending\\.'
  );
});

test("douyin search rejects unsupported filter values before checking the API key", () => {
  const invalidCases = [
    [
      "--sort-type",
      "3",
      'Unsupported --sort-type "3". Use one of: general, time_descending, like_count_descending.',
    ],
    [
      "--duration-range",
      "long",
      'Unsupported --duration-range "long". Use one of: all, under_1_minute, one_to_five_minutes, over_5_minutes.',
    ],
  ];

  for (const [flag, value, message] of invalidCases) {
    const result = runCli([
      "douyin",
      "search",
      "--keyword",
      "foo",
      flag,
      value,
    ]);

    assertCliError(result, message);
  }
});

test("douyin search keeps filter options omitted unless explicitly provided", () => {
  const cli = readFileSync(cliPath, "utf8");

  assert.match(
    cli,
    /if \(options\.sortType !== undefined\) \{\n    toolArguments\.sort_type = parseAllowedStringOption\(\n      options\.sortType,\n      "--sort-type",\n      DOUYIN_SEARCH_SORT_TYPES,\n      DOUYIN_SEARCH_SORT_TYPES\.join\(", "\)\n    \);\n  \}/
  );
  assert.match(
    cli,
    /toolArguments\.publish_time_range = parseAllowedStringOption\(\n      options\.publishTimeRange,\n      "--publish-time-range",\n      DOUYIN_SEARCH_PUBLISH_TIME_RANGES,\n      DOUYIN_SEARCH_PUBLISH_TIME_RANGES\.join\(", "\)\n    \);/
  );
  assert.match(
    cli,
    /toolArguments\.duration_range = parseAllowedStringOption\(\n      options\.durationRange,\n      "--duration-range",\n      DOUYIN_SEARCH_DURATION_RANGES,\n      DOUYIN_SEARCH_DURATION_RANGES\.join\(", "\)\n    \);/
  );
  assert.match(
    cli,
    /if \(options\.contentType !== undefined\) \{\n    toolArguments\.content_type = parseAllowedStringOption\(\n      options\.contentType,\n      "--content-type",\n      DOUYIN_SEARCH_CONTENT_TYPES,\n      DOUYIN_SEARCH_CONTENT_TYPES\.join\(", "\)\n    \);\n  \}/
  );
  assert.doesNotMatch(cli, /DOUYIN_LEGACY_SEARCH_/);
  assert.doesNotMatch(cli, /resolveCompatibleOption/);
  assert.doesNotMatch(cli, /sort_type:\s*\n\s*options\.sortType === undefined/);
  assert.doesNotMatch(cli, /publish_time:\s*\n\s*options\.publishTime === undefined/);
  assert.doesNotMatch(cli, /filter_duration:\s*options\.filterDuration === undefined/);
  assert.doesNotMatch(cli, /content_type:\s*\n\s*options\.contentType === undefined/);
});

test("douyin search with valid inputs reaches the missing API key error", () => {
  const result = runCli([
    "douyin",
    "search",
    "--keyword",
    "foo",
    "--page-token",
    "next-page",
  ]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("douyin search with explicit filters reaches the missing API key error", () => {
  const result = runCli([
    "douyin",
    "search",
    "--keyword",
    "foo",
    "--sort-type",
    "like_count_descending",
    "--publish-time-range",
    "week",
    "--duration-range",
    "one_to_five_minutes",
    "--content-type",
    "image",
  ]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("douyin search maps explicit filters to MCP tool arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "douyin",
    "search",
    "--keyword",
    "露营",
    "--page-token",
    "next-token",
    "--sort-type",
    "time_descending",
    "--publish-time-range",
    "week",
    "--duration-range",
    "one_to_five_minutes",
    "--content-type",
    "image",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "douyin_search_videos",
      arguments: {
        keyword: "露营",
        sort_type: "time_descending",
        publish_time_range: "week",
        duration_range: "one_to_five_minutes",
        content_type: "image",
        page_token: "next-token",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "douyin",
    tool: "douyin_search_videos",
    arguments: {
      keyword: "露营",
      sort_type: "time_descending",
      publish_time_range: "week",
      duration_range: "one_to_five_minutes",
      content_type: "image",
      page_token: "next-token",
    },
    data: { ok: true },
  });
});

test("douyin search rejects legacy numeric filters and flags", () => {
  for (const [args, message] of [
    [
      [
        "douyin",
        "search",
        "--keyword",
        "foo",
        "--sort-type",
        "2",
      ],
      'Unsupported --sort-type "2"\\. Use one of: general, time_descending, like_count_descending\\.',
    ],
    [
      [
        "douyin",
        "search",
        "--keyword",
        "foo",
        "--content-type",
        "2",
      ],
      'Unsupported --content-type "2"\\. Use one of: all, video, image\\.',
    ],
  ]) {
    const result = runCli(args);
    assertCliError(result, message);
  }

  const publishTimeResult = runCli([
    "douyin",
    "search",
    "--keyword",
    "foo",
    "--publish-time",
    "7",
  ]);
  assertCliError(publishTimeResult, "Unsupported option --publish-time\\.");

  const durationResult = runCli([
    "douyin",
    "search",
    "--keyword",
    "foo",
    "--filter-duration",
    "1-5",
  ]);
  assertCliError(durationResult, "Unsupported option --filter-duration\\.");
});

test("douyin detail still rejects aweme-id and url together", () => {
  const result = runCli([
    "douyin",
    "detail",
    "--aweme-id",
    "763",
    "--url",
    "https://www.douyin.com/video/763",
  ]);

  assertCliError(result, "Use only one of --aweme-id or --url\\.");
});

test("douyin user-info maps profile-url to profile_url tool arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "douyin",
    "user-info",
    "--profile-url",
    "https://www.douyin.com/user/sec-user-1",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "douyin_get_user_info_by_profile_url",
      arguments: {
        profile_url: "https://www.douyin.com/user/sec-user-1",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "douyin",
    tool: "douyin_get_user_info_by_profile_url",
    arguments: {
      profile_url: "https://www.douyin.com/user/sec-user-1",
    },
    data: { ok: true },
  });
});

test("douyin user-posts maps profile-url and page-token to profile_url tool arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "douyin",
    "user-posts",
    "--profile-url",
    "https://www.douyin.com/user/sec-user-1",
    "--page-token",
    "next-token",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "douyin_get_user_posted_videos_by_profile_url",
      arguments: {
        profile_url: "https://www.douyin.com/user/sec-user-1",
        page_token: "next-token",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "douyin",
    tool: "douyin_get_user_posted_videos_by_profile_url",
    arguments: {
      profile_url: "https://www.douyin.com/user/sec-user-1",
      page_token: "next-token",
    },
    data: { ok: true },
  });
});

test("douyin user profile direct commands reject legacy url option", () => {
  for (const action of ["user-info", "user-posts"]) {
    const result = runCli([
      "douyin",
      action,
      "--url",
      "https://www.douyin.com/user/sec-user-1",
    ]);

    assertCliError(result, "Unsupported option --url\\.");
  }
});

test("douyin openclaw plugin only exposes profile-url user tools", () => {
  const openclawDir = join(dirname(packageDir), "douyin-insights-openclaw");
  const pluginSource = readFileSync(join(openclawDir, "index.js"), "utf8");
  const pluginManifest = JSON.parse(
    readFileSync(join(openclawDir, "openclaw.plugin.json"), "utf8")
  );
  const packageJson = JSON.parse(
    readFileSync(join(openclawDir, "package.json"), "utf8")
  );
  const readme = readFileSync(join(openclawDir, "README.md"), "utf8");

  assert.equal(packageJson.version, "0.2.8");
  assert.equal(pluginManifest.version, "0.2.8");
  assert.match(pluginSource, /const PLUGIN_VERSION = "0\.2\.8";/);
  assert.match(readme, /Version: `0\.2\.8`/);
  assert.deepEqual(Object.keys(pluginManifest.configSchema.properties), [
    "connectionTimeoutMs",
  ]);
  assert.deepEqual(pluginManifest.providerAuthChoices[0], {
    provider: "douyin-insights",
    method: "api-key",
    choiceId: "socialdatax-api-key",
    choiceLabel: "SocialDataX API Key",
    choiceHint: "Used only to authorize requests to the hosted Douyin Insights MCP service.",
    groupId: "socialdatax",
    groupLabel: "SocialDataX / 社媒数据助手",
    optionKey: "socialDataxApiKey",
    cliFlag: "--socialdatax-api-key",
    cliOption: "--socialdatax-api-key <key>",
    cliDescription: "SOCIALDATAX_API_KEY used by the hosted MCP service.",
    onboardingScopes: ["social-media-research"],
    assistantPriority: 0,
  });
  assert.deepEqual(Object.keys(packageJson.openclaw.configUiHints), [
    "connectionTimeoutMs",
  ]);
  assertOpenClawPackageMetadataMatchesManifest({
    packageJson,
    pluginManifest,
    provider: "douyin-insights",
  });
  assert.match(
    readme,
    /sends the key only to the fixed endpoint `https:\/\/mcp\.socialdatax\.com\/douyin\/mcp`/
  );
  assert.match(
    pluginSource,
    /const apiKey = readFirstEnv\(API_KEY_ENV_NAMES\);/
  );
  assert.match(
    pluginSource,
    /const DEFAULT_API_KEY_ENV = "SOCIALDATAX_API_KEY";\nconst LEGACY_API_KEY_ENV = "SOCIAL_MEDIA_MCP_API_KEY";\nconst API_KEY_ENV_NAMES = \[DEFAULT_API_KEY_ENV, LEGACY_API_KEY_ENV\];/
  );
  assert.match(
    pluginSource,
    /Missing API Key\. Set \$\{DEFAULT_API_KEY_ENV\} before using \$\{PLUGIN_NAME\}\./
  );
  assert.match(
    pluginSource,
    /new StreamableHTTPClientTransport\(new URL\(DEFAULT_ENDPOINT_URL\)/
  );
  assert.doesNotMatch(pluginSource, /configured\.apiKeyEnv|configured\.endpointUrl/);
  assert.deepEqual(
    pluginManifest.contracts.tools.filter((tool) =>
      tool.includes("user_info")
    ),
    [
      "douyin-insights__douyin_get_user_info_by_sec_user_id",
      "douyin-insights__douyin_get_user_info_by_profile_url",
    ]
  );
  assert.deepEqual(
    pluginManifest.contracts.tools.filter((tool) =>
      tool.includes("user_posted")
    ),
    [
      "douyin-insights__douyin_get_user_posted_videos_by_sec_user_id",
      "douyin-insights__douyin_get_user_posted_videos_by_profile_url",
    ]
  );
  assert.equal(pluginManifest.contracts.tools.length, 13);
  assert.ok(
    pluginManifest.contracts.tools.includes(
      "douyin-insights__douyin_get_hot_search_list"
    )
  );
  assert.ok(
    pluginManifest.contracts.tools.includes(
      "douyin-insights__douyin_get_video_comment_replies_by_comment_id"
    )
  );
  assert.deepEqual(
    pluginManifest.contracts.tools.filter((tool) => tool.includes("user_series")),
    [
      "douyin-insights__douyin_get_user_series_by_sec_user_id",
      "douyin-insights__douyin_get_user_series_by_profile_url",
    ]
  );
  assert.match(pluginSource, /Get Douyin Hot Search List/);
  assert.match(pluginSource, /Get Douyin Comment Replies By Comment ID/);
  assert.match(
    pluginSource,
    /pass both aweme ID and comment ID, and use page_token to continue pagination/
  );
  const serverCard = JSON.parse(
    readFileSync(join(dirname(packageDir), "douyin-insights", "server-card.json"), "utf8")
  );
  const serverCardRepliesTool = serverCard.tools.find(
    (tool) => tool.name === "douyin_get_video_comment_replies_by_comment_id"
  );
  assert.equal(
    serverCardRepliesTool.description,
    "Fetch paginated replies under a first-level comment; pass both aweme_id and comment_id, and use page_token to continue pagination."
  );
  assert.match(pluginSource, /Get Douyin Creator Series By ID/);
  assert.match(readme, /creator short-drama series/);
  assert.doesNotMatch(
    pluginSource,
    /douyin_get_user_info_by_url|douyin_get_user_posted_videos_by_url/
  );
  assert.doesNotMatch(
    JSON.stringify(pluginManifest),
    /douyin_get_user_info_by_url|douyin_get_user_posted_videos_by_url/
  );
  assert.match(pluginSource, /社媒数据助手 抖音 MCP \| Douyin MCP/);
  assert.match(pluginSource, /Search Douyin works by keyword/);
  assert.match(pluginSource, /structured work details/);
  assert.match(pluginSource, /video and image\/text works/);
  assert.doesNotMatch(pluginSource, /short video research/);
  assert.doesNotMatch(JSON.stringify(pluginManifest), /short video research/);
  assert.doesNotMatch(readme, /short video research/);
  assert.match(pluginSource, /Creator Works/);
  assert.match(JSON.stringify(pluginManifest), /社媒数据助手 抖音 MCP \| Douyin MCP/);
  assert.doesNotMatch(JSON.stringify(pluginManifest), /Content Insights MCP/);
  assert.match(JSON.stringify(pluginManifest), /作品搜索/);
  assert.doesNotMatch(
    JSON.stringify(pluginManifest),
    /search video and image\/text works/
  );
  assert.doesNotMatch(
    pluginSource,
    /Search Douyin Videos|Video Detail|Creator Videos|structured video details|creator video lists/
  );
  assert.doesNotMatch(
    JSON.stringify(pluginManifest),
    /Video Insights MCP|read video details|creator video lists/
  );
  assert.doesNotMatch(pluginSource, /const PAGE_TOKEN_PROPERTY = \{\n  anyOf:/);
  assert.match(pluginSource, /const PAGE_TOKEN_PROPERTY = \{\n  type: "string",/);
  assert.match(pluginSource, /complete returned next_page_token back unchanged/);
  assert.match(
    pluginSource,
    /Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses/
  );
  assert.doesNotMatch(pluginSource, /previous non-empty next_page_token to continue/);
  assert.doesNotMatch(pluginSource, /Do not parse, modify, or reuse tokens across pagination chains/);
  assert.match(
    pluginSource,
    /sort_type: \{\n\s+type: "string",\n\s+enum: \["general", "time_descending", "like_count_descending"\],\n\s+default: "general",/
  );
  assert.match(
    pluginSource,
    /time_descending \(latest published first\), or like_count_descending \(most liked first\)/
  );
  assert.match(
    pluginSource,
    /publish_time_range: \{\n\s+type: "string",\n\s+enum: \["all", "day", "week", "half_year"\],\n\s+default: "all",/
  );
  assert.match(
    pluginSource,
    /duration_range: \{\n\s+type: "string",\n\s+enum: \["all", "under_1_minute", "one_to_five_minutes", "over_5_minutes"\],\n\s+default: "all",/
  );
  assert.match(
    pluginSource,
    /content_type: \{\n\s+type: "string",\n\s+enum: \["all", "video", "image"\],\n\s+default: "all",/
  );
  assert.doesNotMatch(
    pluginSource,
    /(sort_type|publish_time_range|duration_range|content_type): \{\n\s+anyOf:/
  );
});

test("xhs openclaw search schema documents semantic sort enums", () => {
  const openclawDir = join(dirname(packageDir), "xhs-insights-openclaw");
  const pluginSource = readFileSync(join(openclawDir, "index.js"), "utf8");
  const pluginManifest = JSON.parse(
    readFileSync(join(openclawDir, "openclaw.plugin.json"), "utf8")
  );
  const packageJson = JSON.parse(
    readFileSync(join(openclawDir, "package.json"), "utf8")
  );
  const readme = readFileSync(join(openclawDir, "README.md"), "utf8");

  assert.equal(packageJson.version, "0.1.19");
  assert.equal(pluginManifest.version, "0.1.19");
  assert.match(pluginSource, /const PLUGIN_VERSION = "0\.1\.19";/);
  assert.match(readme, /Version: `0\.1\.19`/);

  assert.deepEqual(pluginManifest.providerAuthChoices[0], {
    provider: "xhs-insights",
    method: "api-key",
    choiceId: "socialdatax-api-key",
    choiceLabel: "SocialDataX API Key",
    choiceHint: "Used only to authorize requests to the hosted XHS Insights MCP service.",
    groupId: "socialdatax",
    groupLabel: "SocialDataX / 社媒数据助手",
    optionKey: "socialDataxApiKey",
    cliFlag: "--socialdatax-api-key",
    cliOption: "--socialdatax-api-key <key>",
    cliDescription: "SOCIALDATAX_API_KEY used by the hosted MCP service.",
    onboardingScopes: ["social-media-research"],
    assistantPriority: 0,
  });
  assertOpenClawPackageMetadataMatchesManifest({
    packageJson,
    pluginManifest,
    provider: "xhs-insights",
  });

  assert.match(
    pluginSource,
    /const DEFAULT_API_KEY_ENV = "SOCIALDATAX_API_KEY";\nconst LEGACY_API_KEY_ENV = "SOCIAL_MEDIA_MCP_API_KEY";\nconst API_KEY_ENV_NAMES = \[DEFAULT_API_KEY_ENV, LEGACY_API_KEY_ENV\];/
  );
  assert.match(
    pluginSource,
    /Missing API Key\. Set \$\{DEFAULT_API_KEY_ENV\} before using \$\{PLUGIN_NAME\}\./
  );
  assert.match(
    pluginSource,
    /社媒数据助手 小红书 MCP \| Xiaohongshu XHS RedNote MCP/
  );
  assert.equal(pluginManifest.contracts.tools.length, 11);
  assert.ok(
    pluginManifest.contracts.tools.includes(
      "xhs-insights__xhs_get_search_hot_list"
    )
  );
  assert.match(pluginSource, /Get XHS Search Hot List/);
  assert.match(readme, /search hot list/);

  assert.match(
    pluginSource,
    /enum: \[\n\s+"general",\n\s+"time_descending",\n\s+"like_count_descending",\n\s+"comment_count_descending",\n\s+"collect_count_descending",\n\s+\]/
  );
  const searchDefinition = pluginSource.match(
    /name: "xhs-insights__xhs_search_notes",[\s\S]*?name: "xhs-insights__xhs_get_note_detail_by_note_url"/
  )?.[0];
  assert.ok(searchDefinition, "xhs search tool definition should exist");
  assert.match(searchDefinition, /page_token: PAGE_TOKEN_PROPERTY/);
  assert.doesNotMatch(searchDefinition, /\n\s+page: \{/);
  assert.doesNotMatch(searchDefinition, /Search result page number/);
  assert.match(
    pluginSource,
    /complete returned next_page_token back unchanged/
  );
  assert.match(
    pluginSource,
    /time_descending \(latest published first\), like_count_descending \(most liked first\), comment_count_descending \(most commented first\), or collect_count_descending \(most collected first\)/
  );
  assert.doesNotMatch(
    pluginSource,
    /popularity_descending|comment_descending|collect_descending/
  );

  for (const toolName of [
    "xhs-insights__xhs_get_note_comments_by_note_id",
    "xhs-insights__xhs_get_note_comments_by_note_url",
  ]) {
    const commentDefinition = pluginSource.match(
      new RegExp(`name: "${toolName}",[\\s\\S]*?\\n  \\},\\n  \\{`)
    )?.[0];
    assert.ok(commentDefinition, `${toolName} definition should exist`);
    assert.match(commentDefinition, /optional comment sort_type/);
    assert.match(commentDefinition, /sort_type: \{/);
    assert.match(
      commentDefinition,
      /enum: \["default", "time_descending", "like_count_descending"\]/
    );
    assert.match(commentDefinition, /default \(platform default\)/);
  }
});

test("xhs openclaw preserves returned note URLs in search and detail guidance", () => {
  const openclawDir = join(dirname(packageDir), "xhs-insights-openclaw");
  const pluginSource = readFileSync(join(openclawDir, "index.js"), "utf8");
  const readme = readFileSync(join(openclawDir, "README.md"), "utf8");
  const extractDescription = (toolName) => {
    const match = pluginSource.match(
      new RegExp(`name: "${toolName}",[\\s\\S]*?description: "([^"]+)"`)
    );
    assert.notEqual(match, null, `${toolName} should have a description`);
    return match[1];
  };
  assertPreservesReturnedNoteUrl(
    extractDescription("xhs-insights__xhs_search_notes"),
    "xhs_search_notes description"
  );
  const detailByUrlDescription = extractDescription(
    "xhs-insights__xhs_get_note_detail_by_note_url"
  );
  assertPreservesReturnedNoteUrl(
    detailByUrlDescription,
    "xhs_get_note_detail_by_note_url description"
  );
  assertDoesNotSynthesizeNoteUrlFromIdWhenMissing(
    detailByUrlDescription,
    "xhs_get_note_detail_by_note_url description"
  );
  const detailByIdDescription = extractDescription(
    "xhs-insights__xhs_get_note_detail_by_note_id"
  );
  assertPreservesReturnedNoteUrl(
    detailByIdDescription,
    "xhs_get_note_detail_by_note_id description"
  );
  assertDoesNotSynthesizeNoteUrlFromIdWhenMissing(
    detailByIdDescription,
    "xhs_get_note_detail_by_note_id description"
  );
  assertPreservesReturnedNoteUrl(readme, "OpenClaw README");
  assertDoesNotSynthesizeNoteUrlFromIdWhenMissing(readme, "OpenClaw README");
});

test("douyin replies direct command maps aweme id and comment id", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "douyin",
    "replies",
    "--aweme-id",
    "aweme-1",
    "--comment-id",
    "comment-1",
    "--page-token",
    "next",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "douyin_get_video_comment_replies_by_comment_id");
  assert.deepEqual(toolCalls[0].arguments, {
    aweme_id: "aweme-1",
    comment_id: "comment-1",
    page_token: "next",
  });
});

test("xhs hot-search direct command reaches the missing API key error", () => {
  const result = runCli(["xhs", "hot-search"]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("xhs hot-search maps to the public MCP tool", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(["xhs", "hot-search"]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "xhs_get_search_hot_list");
  assert.deepEqual(toolCalls[0].arguments, {});
});

test("douyin hot-search direct command reaches the missing API key error", () => {
  const result = runCli(["douyin", "hot-search"]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("douyin hot-search maps to the public MCP tool", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(["douyin", "hot-search"]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "douyin_get_hot_search_list");
  assert.deepEqual(toolCalls[0].arguments, {});
});

test("douyin comments with valid inputs reaches the missing API key error", () => {
  const result = runCli([
    "douyin",
    "comments",
    "--aweme-id",
    "aweme-1",
  ]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("douyin share-link is not a public direct CLI command", () => {
  const result = runCli([
    "douyin",
    "share-link",
    "--aweme-id",
    "aweme-1",
  ]);

  assertCliError(result, 'Unsupported Douyin command "share-link"\\. Use hot-search, search, detail, comments, replies, user-info, user-posts, user-series, transcript, download-media\\.');
});

test("douyin live-info is not a public direct CLI command", () => {
  const result = runCli([
    "douyin",
    "live-info",
    "--url",
    "https://live.douyin.com/test",
  ]);

  assertCliError(result, 'Unsupported Douyin command "live-info"\\. Use hot-search, search, detail, comments, replies, user-info, user-posts, user-series, transcript, download-media\\.');
});

test("douyin user-series direct command maps profile-url and page-token", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "douyin",
    "user-series",
    "--profile-url",
    "https://www.douyin.com/user/sec-user-1",
    "--page-token",
    "next",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "douyin_get_user_series_by_profile_url");
  assert.deepEqual(toolCalls[0].arguments, {
    profile_url: "https://www.douyin.com/user/sec-user-1",
    page_token: "next",
  });
});

test("douyin user-series direct command maps sec-user-id", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "douyin",
    "user-series",
    "--sec-user-id",
    "sec-1",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls[0].name, "douyin_get_user_series_by_sec_user_id");
  assert.deepEqual(toolCalls[0].arguments, {
    sec_user_id: "sec-1",
  });
});

test("kuaishou hot-search direct command reaches the missing API key error", () => {
  const result = runCli(["kuaishou", "hot-search"]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("kuaishou hot-search maps to the public MCP tool", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(["kuaishou", "hot-search"]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "kuaishou_get_hot_search_list",
      arguments: {},
    },
  ]);
});

test("kuaishou search maps keyword and page-token to MCP arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "kuaishou",
    "search",
    "--keyword",
    "露营",
    "--page-token",
    "next-token",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "kuaishou_search_videos",
      arguments: {
        keyword: "露营",
        page_token: "next-token",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "kuaishou",
    tool: "kuaishou_search_videos",
    arguments: {
      keyword: "露营",
      page_token: "next-token",
    },
    data: { ok: true },
  });
});

test("kuaishou user-search maps keyword and page-token to MCP arguments", async () => {
  const { result, toolCalls } = await runCliWithMockMcp([
    "kuaishou",
    "user-search",
    "--keyword",
    "露营",
    "--page-token",
    "next-token",
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls, [
    {
      name: "kuaishou_search_users",
      arguments: {
        keyword: "露营",
        page_token: "next-token",
      },
    },
  ]);
  assert.deepEqual(JSON.parse(result.stdout), {
    platform: "kuaishou",
    tool: "kuaishou_search_users",
    arguments: {
      keyword: "露营",
      page_token: "next-token",
    },
    data: { ok: true },
  });
});

test("kuaishou user-search pages deduplicate repeated user ids", async () => {
  let callCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    ["kuaishou", "user-search", "--keyword", "露营", "--pages", "2"],
    {},
    ({ name, arguments: args }) => {
      assert.equal(name, "kuaishou_search_users");
      assert.equal(args.keyword, "露营");
      assert.equal(args.page, undefined);
      callCount += 1;
      return callCount === 1
        ? {
            items: [
              { user_id: "user-1", name: "first" },
              { user_id: "user-2", name: "second" },
            ],
            next_page_token: "next-users",
          }
        : {
            items: [
              { user_id: "user-1", name: "duplicate" },
              { user_id: "user-3", name: "third" },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { keyword: "露营" },
    { keyword: "露营", page_token: "next-users" },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.data.items.map((item) => item.user_id),
    ["user-1", "user-2", "user-3"]
  );
  assert.equal(payload.data.item_count, 3);
});

test("douyin and kuaishou search pages use page-token continuation only", async () => {
  const douyin = await runCliWithMockMcp(
    ["douyin", "search", "--keyword", "露营", "--pages", "2"],
    {},
    ({ name, arguments: args }, index) => {
      assert.equal(name, "douyin_search_videos");
      assert.equal(args.keyword, "露营");
      assert.equal(args.page, undefined);
      return index === 1
        ? { items: [{ aweme_id: "aweme-1" }], next_page_token: "next-douyin" }
        : { items: [{ aweme_id: "aweme-2" }], next_page_token: "" };
    }
  );
  assert.equal(douyin.result.status, 0, douyin.result.stderr);
  assert.deepEqual(douyin.toolCalls.map((call) => call.arguments), [
    { keyword: "露营" },
    { keyword: "露营", page_token: "next-douyin" },
  ]);

  const kuaishou = await runCliWithMockMcp(
    ["kuaishou", "search", "--keyword", "露营", "--pages", "2"],
    {},
    ({ name, arguments: args }, index) => {
      assert.equal(name, "kuaishou_search_videos");
      assert.equal(args.keyword, "露营");
      assert.equal(args.page, undefined);
      return index === 1
        ? { items: [{ photo_id: "photo-1" }], next_page_token: "next-kuaishou" }
        : { items: [{ photo_id: "photo-2" }], next_page_token: "" };
    }
  );
  assert.equal(kuaishou.result.status, 0, kuaishou.result.stderr);
  assert.deepEqual(kuaishou.toolCalls.map((call) => call.arguments), [
    { keyword: "露营" },
    { keyword: "露营", page_token: "next-kuaishou" },
  ]);
});

test("kuaishou detail comments and replies map public identifiers", async () => {
  const detail = await runCliWithMockMcp([
    "kuaishou",
    "detail",
    "--photo-id",
    "photo-1",
  ]);
  assert.equal(detail.result.status, 0, detail.result.stderr);
  assert.deepEqual(detail.toolCalls[0], {
    name: "kuaishou_get_video_detail_by_photo_id",
    arguments: { photo_id: "photo-1" },
  });

  const comments = await runCliWithMockMcp([
    "kuaishou",
    "comments",
    "--url",
    "https://www.kuaishou.com/short-video/photo-1",
    "--page-token",
    "next",
  ]);
  assert.equal(comments.result.status, 0, comments.result.stderr);
  assert.deepEqual(comments.toolCalls[0], {
    name: "kuaishou_get_video_comments_by_url",
    arguments: {
      url: "https://www.kuaishou.com/short-video/photo-1",
      page_token: "next",
    },
  });

  const replies = await runCliWithMockMcp([
    "kuaishou",
    "replies",
    "--photo-id",
    "photo-1",
    "--comment-id",
    "comment-1",
  ]);
  assert.equal(replies.result.status, 0, replies.result.stderr);
  assert.deepEqual(replies.toolCalls[0], {
    name: "kuaishou_get_video_comment_replies_by_comment_id",
    arguments: {
      photo_id: "photo-1",
      comment_id: "comment-1",
    },
  });
});

test("kuaishou user commands map profile urls and user ids", async () => {
  const userInfo = await runCliWithMockMcp([
    "kuaishou",
    "user-info",
    "--profile-url",
    "https://www.kuaishou.com/profile/user-1",
  ]);
  assert.equal(userInfo.result.status, 0, userInfo.result.stderr);
  assert.deepEqual(userInfo.toolCalls[0], {
    name: "kuaishou_get_user_info_by_profile_url",
    arguments: {
      profile_url: "https://www.kuaishou.com/profile/user-1",
    },
  });

  const userPosts = await runCliWithMockMcp([
    "kuaishou",
    "user-posts",
    "--user-id",
    "user-1",
    "--page-token",
    "next",
  ]);
  assert.equal(userPosts.result.status, 0, userPosts.result.stderr);
  assert.deepEqual(userPosts.toolCalls[0], {
    name: "kuaishou_get_user_posted_videos_by_user_id",
    arguments: {
      user_id: "user-1",
      page_token: "next",
    },
  });
});

test("kuaishou validates direct command options before checking the API key", () => {
  const unsupported = runCli([
    "kuaishou",
    "search",
    "--keyword",
    "foo",
    "--sort-type",
    "time_descending",
  ]);
  assertCliError(unsupported, "Unsupported option --sort-type\\.");

  const unsupportedCreatorSinceDays = runCli([
    "kuaishou",
    "user-search",
    "--keyword",
    "foo",
    "--since-days",
    "7",
  ]);
  assertCliError(unsupportedCreatorSinceDays, "Unsupported option --since-days\\.");

  const missingPhotoId = runCli([
    "kuaishou",
    "replies",
    "--comment-id",
    "comment-1",
  ]);
  assertCliError(missingPhotoId, "Missing --photo-id for kuaishou replies\\.");

  const valid = runCli([
    "kuaishou",
    "search",
    "--keyword",
    "foo",
  ]);
  assertCliError(
    valid,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("weibo direct commands map public read operations", async () => {
  const hotSearch = await runCliWithMockMcp(["weibo", "hot-search"]);
  assert.equal(hotSearch.result.status, 0, hotSearch.result.stderr);
  assert.deepEqual(hotSearch.toolCalls[0], {
    name: "weibo_get_hot_search_list",
    arguments: {},
  });

  const search = await runCliWithMockMcp([
    "weibo",
    "search",
    "--keyword",
    "露营",
    "--page-token",
    "next",
  ]);
  assert.equal(search.result.status, 0, search.result.stderr);
  assert.deepEqual(search.toolCalls[0], {
    name: "weibo_search_posts",
    arguments: {
      keyword: "露营",
      page_token: "next",
    },
  });

  const detail = await runCliWithMockMcp([
    "weibo",
    "detail",
    "--post-url",
    "https://weibo.com/123/post-1",
  ]);
  assert.equal(detail.result.status, 0, detail.result.stderr);
  assert.deepEqual(detail.toolCalls[0], {
    name: "weibo_get_post_detail_by_post_url",
    arguments: {
      post_url: "https://weibo.com/123/post-1",
    },
  });

  const comments = await runCliWithMockMcp([
    "weibo",
    "comments",
    "--post-id",
    "post-1",
    "--page-token",
    "next",
  ]);
  assert.equal(comments.result.status, 0, comments.result.stderr);
  assert.deepEqual(comments.toolCalls[0], {
    name: "weibo_get_post_comments_by_post_id",
    arguments: {
      post_id: "post-1",
      page_token: "next",
    },
  });

  const replies = await runCliWithMockMcp([
    "weibo",
    "replies",
    "--post-id",
    "post-1",
    "--comment-id",
    "comment-1",
  ]);
  assert.equal(replies.result.status, 0, replies.result.stderr);
  assert.deepEqual(replies.toolCalls[0], {
    name: "weibo_get_post_comment_replies_by_comment_id",
    arguments: {
      post_id: "post-1",
      comment_id: "comment-1",
    },
  });

  const likers = await runCliWithMockMcp([
    "weibo",
    "likers",
    "--post-id",
    "post-1",
    "--page-token",
    "next",
  ]);
  assert.equal(likers.result.status, 0, likers.result.stderr);
  assert.deepEqual(likers.toolCalls[0], {
    name: "weibo_get_post_liker_list_by_post_id",
    arguments: {
      post_id: "post-1",
      page_token: "next",
    },
  });

  const reposts = await runCliWithMockMcp([
    "weibo",
    "reposts",
    "--post-id",
    "post-1",
  ]);
  assert.equal(reposts.result.status, 0, reposts.result.stderr);
  assert.deepEqual(reposts.toolCalls[0], {
    name: "weibo_get_post_repost_list_by_post_id",
    arguments: {
      post_id: "post-1",
    },
  });
});

test("weibo user commands map profile urls and user ids", async () => {
  const userInfo = await runCliWithMockMcp([
    "weibo",
    "user-info",
    "--profile-url",
    "https://weibo.com/u/user-1",
  ]);
  assert.equal(userInfo.result.status, 0, userInfo.result.stderr);
  assert.deepEqual(userInfo.toolCalls[0], {
    name: "weibo_get_user_info_by_profile_url",
    arguments: {
      profile_url: "https://weibo.com/u/user-1",
    },
  });

  const userPosts = await runCliWithMockMcp([
    "weibo",
    "user-posts",
    "--user-id",
    "user-1",
    "--page-token",
    "next",
  ]);
  assert.equal(userPosts.result.status, 0, userPosts.result.stderr);
  assert.deepEqual(userPosts.toolCalls[0], {
    name: "weibo_get_user_posts_by_user_id",
    arguments: {
      user_id: "user-1",
      page_token: "next",
    },
  });
});

test("wechat direct commands map public Video Channels operations", async () => {
  const hotSearch = await runCliWithMockMcp(["wechat", "hot-search"]);
  assert.equal(hotSearch.result.status, 0, hotSearch.result.stderr);
  assert.deepEqual(hotSearch.toolCalls[0], {
    name: "wechat_get_hot_search_list",
    arguments: {},
  });

  const search = await runCliWithMockMcp([
    "wechat",
    "search",
    "--keyword",
    "露营",
    "--sort-type",
    "time_descending",
    "--duration-range",
    "under_5_min",
    "--page-token",
    "next",
  ]);
  assert.equal(search.result.status, 0, search.result.stderr);
  assert.deepEqual(search.toolCalls[0], {
    name: "wechat_search_videos",
    arguments: {
      keyword: "露营",
      sort_type: "time_descending",
      duration_range: "under_5_min",
      page_token: "next",
    },
  });

  const detail = await runCliWithMockMcp([
    "wechat",
    "detail",
    "--encrypted-object-id",
    "export/id-1",
  ]);
  assert.equal(detail.result.status, 0, detail.result.stderr);
  assert.deepEqual(detail.toolCalls[0], {
    name: "wechat_get_video_detail_by_encrypted_object_id",
    arguments: {
      encrypted_object_id: "export/id-1",
    },
  });

  const comments = await runCliWithMockMcp([
    "wechat",
    "comments",
    "--object-id",
    "object-1",
    "--object-nonce-id",
    "nonce-1",
    "--page-token",
    "next",
  ]);
  assert.equal(comments.result.status, 0, comments.result.stderr);
  assert.deepEqual(comments.toolCalls[0], {
    name: "wechat_get_video_comments_by_object_id",
    arguments: {
      object_id: "object-1",
      object_nonce_id: "nonce-1",
      page_token: "next",
    },
  });

  const replies = await runCliWithMockMcp([
    "wechat",
    "replies",
    "--object-id",
    "object-1",
    "--object-nonce-id",
    "nonce-1",
    "--comment-id",
    "comment-1",
  ]);
  assert.equal(replies.result.status, 0, replies.result.stderr);
  assert.deepEqual(replies.toolCalls[0], {
    name: "wechat_get_video_comment_replies_by_comment_id",
    arguments: {
      object_id: "object-1",
      object_nonce_id: "nonce-1",
      comment_id: "comment-1",
    },
  });
});

test("wechat user commands map url and finder user ids", async () => {
  const userInfo = await runCliWithMockMcp([
    "wechat",
    "user-info",
    "--user-id",
    "v2_demo@finder",
  ]);
  assert.equal(userInfo.result.status, 0, userInfo.result.stderr);
  assert.deepEqual(userInfo.toolCalls[0], {
    name: "wechat_get_user_info_by_user_id",
    arguments: {
      user_id: "v2_demo@finder",
    },
  });

  const userPosts = await runCliWithMockMcp([
    "wechat",
    "user-posts",
    "--url",
    "https://weixin.qq.com/sph/ANxgB9MB8i",
    "--page-token",
    "next",
  ]);
  assert.equal(userPosts.result.status, 0, userPosts.result.stderr);
  assert.deepEqual(userPosts.toolCalls[0], {
    name: "wechat_get_user_posted_videos_by_url",
    arguments: {
      url: "https://weixin.qq.com/sph/ANxgB9MB8i",
      page_token: "next",
    },
  });
});

test("wechat article command maps official account article url", async () => {
  const article = await runCliWithMockMcp([
    "wechat",
    "article",
    "--url",
    "https://mp.weixin.qq.com/s/cyog0u9QpLFvdBsh9JR3_g",
  ]);

  assert.equal(article.result.status, 0, article.result.stderr);
  assert.deepEqual(article.toolCalls[0], {
    name: "wechat_get_mp_article_detail_by_url",
    arguments: {
      url: "https://mp.weixin.qq.com/s/cyog0u9QpLFvdBsh9JR3_g",
    },
  });
});

test("wechat search accepts semantic sort values and rejects legacy sort names", () => {
  for (const sortType of [
    "all",
    "time_descending",
    "collect_count_descending",
  ]) {
    const result = runCli([
      "wechat",
      "search",
      "--keyword",
      "foo",
      "--sort-type",
      sortType,
    ]);

    assertCliError(
      result,
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
  }

  for (const sortType of ["general", "latest", "popular", "popularity_descending"]) {
    const result = runCli([
      "wechat",
      "search",
      "--keyword",
      "foo",
      "--sort-type",
      sortType,
    ]);

    assertCliError(
      result,
      `Unsupported --sort-type "${sortType}"\\. Use one of: all, time_descending, collect_count_descending\\.`
    );
  }
});


test("weibo and wechat validate direct command options before checking the API key", () => {
  assertCliError(
    runCli(["weibo", "search", "--keyword", "foo", "--page", "2"]),
    "Unsupported option --page\\."
  );
  assertCliError(
    runCli(["weibo", "replies", "--comment-id", "comment-1"]),
    "Missing --post-id for weibo replies\\."
  );
  assertCliError(
    runCli(["wechat", "search", "--keyword", "foo", "--content-type", "video"]),
    "Unsupported option --content-type\\."
  );
  assertCliError(
    runCli(["wechat", "replies", "--object-id", "object-1", "--comment-id", "comment-1"]),
    "Missing --object-nonce-id for wechat replies\\."
  );
  assertCliError(
    runCli(["wechat", "article"]),
    "Missing --url for wechat article\\."
  );
  assertCliError(
    runCli(["wechat"]),
    "Missing WeChat command\\. Use .*article.*\\."
  );
  assertCliError(
    runCli(["wechat", "unknown"]),
    'Unsupported WeChat command "unknown"\\. Use .*article.*\\.'
  );
  assertCliError(
    runCli(["weibo", "search", "--keyword", "foo"]),
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
  assertCliError(
    runCli(["wechat", "search", "--keyword", "foo"]),
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("xhs search pages require returned next_page_token to aggregate items", async () => {
  let searchCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [{ note_id: "note-1" }],
            next_page_token: "next-search-token",
          }
        : {
            items: [{ note_id: "note-2" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { keyword: "露营" },
    { keyword: "露营", page_token: "next-search-token" },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { note_id: "note-1" },
    { note_id: "note-2" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page_token, "");
});

test("xhs search pages ignore legacy next_page without next_page_token", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      return {
        items: [{ note_id: "note-1" }],
        next_page: 2,
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [{ keyword: "露营" }]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [{ note_id: "note-1" }]);
  assert.equal(payload.data.page_count, 1);
  assert.equal(payload.data.item_count, 1);
  assert.equal(payload.data.next_page_token, "");
  assert.equal(Object.hasOwn(payload.data, "next_page"), false);
});

test("since-days validates values before direct CLI calls", () => {
  for (const validValue of ["1", "7", "30", "365"]) {
    const result = runCli([
      "xhs",
      "search",
      "--keyword",
      "foo",
      "--since-days",
      validValue,
    ]);
    assertCliError(
      result,
      "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
    );
  }

  for (const invalidValue of ["0", "-1", "1.5", "abc", "366"]) {
    const result = runCli([
      "xhs",
      "search",
      "--keyword",
      "foo",
      "--since-days",
      invalidValue,
    ]);
    assertCliError(
      result,
      "--since-days must be an integer between 1 and 365\\."
    );
  }
});

test("since-days is only supported for search and user-posts", () => {
  assertCliError(
    runCli(["xhs", "detail", "--note-id", "note-1", "--since-days", "7"]),
    "Unsupported option --since-days\\."
  );
  assertCliError(
    runCli(["douyin", "user-series", "--sec-user-id", "sec-1", "--since-days", "7"]),
    "Unsupported option --since-days\\."
  );
  assertCliError(
    runCli(["weibo", "likers", "--post-id", "post-1", "--since-days", "7"]),
    "Unsupported option --since-days\\."
  );
  assertCliError(
    runCli(["kuaishou", "user-search", "--keyword", "露营", "--since-days", "7"]),
    "Unsupported option --since-days\\."
  );
});

test("xhs search since-days defaults to latest sorting and week native filter", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--since-days",
      "7",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      return {
        items: [
          { note_id: "recent-note", publish_time: unixSecondsDaysAgo(2) },
          { note_id: "old-note", publish_time: unixSecondsDaysAgo(8) },
          { note_id: "missing-time" },
        ],
        next_page_token: "next-search-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    {
      keyword: "露营",
      sort_type: "time_descending",
      publish_time_range: "week",
    },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items.map((item) => item.note_id), ["recent-note"]);
  assert.equal(payload.data.page_count, 1);
  assert.equal(payload.data.item_count, 1);
  assert.equal(payload.data.next_page_token, "next-search-token");
});

test("search since-days respects explicit sort and publish-time filters", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "search",
      "--keyword",
      "露营",
      "--since-days",
      "7",
      "--sort-type",
      "like_count_descending",
      "--publish-time-range",
      "day",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_search_videos");
      return {
        items: [{ aweme_id: "recent-aweme", publish_time: unixSecondsDaysAgo(1) }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    {
      keyword: "露营",
      sort_type: "like_count_descending",
      publish_time_range: "day",
    },
  ]);
});

test("search since-days applies platform-specific default latest sorting only where supported", async () => {
  const douyin = await runCliWithMockMcp(
    ["douyin", "search", "--keyword", "露营", "--since-days", "1"],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_search_videos");
      return {
        items: [{ aweme_id: "aweme-1", publish_time: unixSecondsDaysAgo(0) }],
        next_page_token: "",
      };
    }
  );
  const kuaishou = await runCliWithMockMcp(
    ["kuaishou", "search", "--keyword", "露营", "--since-days", "7"],
    {},
    ({ name }) => {
      assert.equal(name, "kuaishou_search_videos");
      return {
        items: [{ photo_id: "photo-1", publish_time: unixSecondsDaysAgo(2) }],
        next_page_token: "",
      };
    }
  );
  const weibo = await runCliWithMockMcp(
    ["weibo", "search", "--keyword", "露营", "--since-days", "7"],
    {},
    ({ name }) => {
      assert.equal(name, "weibo_search_posts");
      return {
        items: [{ post_id: "post-1", publish_time: unixSecondsDaysAgo(2) }],
        next_page_token: "",
      };
    }
  );
  const wechat = await runCliWithMockMcp(
    ["wechat", "search", "--keyword", "露营", "--since-days", "7"],
    {},
    ({ name }) => {
      assert.equal(name, "wechat_search_videos");
      return {
        items: [{ encrypted_object_id: "object-1", publish_time: unixSecondsDaysAgo(2) }],
        next_page_token: "",
      };
    }
  );

  assert.equal(douyin.result.status, 0, douyin.result.stderr);
  assert.equal(kuaishou.result.status, 0, kuaishou.result.stderr);
  assert.equal(weibo.result.status, 0, weibo.result.stderr);
  assert.equal(wechat.result.status, 0, wechat.result.stderr);
  assert.deepEqual(douyin.toolCalls[0].arguments, {
    keyword: "露营",
    sort_type: "time_descending",
    publish_time_range: "day",
  });
  assert.deepEqual(kuaishou.toolCalls[0].arguments, { keyword: "露营" });
  assert.deepEqual(weibo.toolCalls[0].arguments, { keyword: "露营" });
  assert.deepEqual(wechat.toolCalls[0].arguments, {
    keyword: "露营",
    sort_type: "time_descending",
  });
});

test("search since-days filters within requested pages only", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "kuaishou",
      "search",
      "--keyword",
      "露营",
      "--since-days",
      "7",
      "--pages",
      "2",
      "--max-items",
      "2",
    ],
    {},
    ({ name, arguments: args }) => {
      assert.equal(name, "kuaishou_search_videos");
      if (args.page_token) {
        return {
          items: [
            { photo_id: "photo-2", publish_time: unixSecondsDaysAgo(3) },
            { photo_id: "photo-3", publish_time: unixSecondsDaysAgo(4) },
          ],
          next_page_token: "still-has-more",
        };
      }
      return {
        items: [
          { photo_id: "old-photo", publish_time: unixSecondsDaysAgo(9) },
          { photo_id: "photo-1", publish_time: unixSecondsDaysAgo(1) },
        ],
        next_page_token: "next-search-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 2);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items.map((item) => item.photo_id), [
    "photo-1",
    "photo-2",
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page_token, "still-has-more");
});

test("xhs search pagination de-duplicates repeated note ids", async () => {
  let searchCallCount = 0;
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [
              { note_id: "note-1", title: "first" },
              { note_id: "note-2", title: "second" },
            ],
            next_page_token: "next-search-token",
          }
        : {
            items: [
              { note_id: "note-1", title: "first duplicate" },
              { note_id: "note-3", title: "third" },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { note_id: "note-1", title: "first" },
    { note_id: "note-2", title: "second" },
    { note_id: "note-3", title: "third" },
  ]);
  assert.equal(payload.data.item_count, 3);
});

test("xhs search pagination de-duplicates same note content with different note ids", async () => {
  let searchCallCount = 0;
  const sameAuthor = { user_id: "author-1", name: "作者" };
  const coverImageUrl =
    "https://sns-na-i6.xhscdn.com/notes_pre_post/cover-token?imageView2/2/w/1440/format/heif&q=45";
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [
              {
                note_id: "note-a",
                title: "同一篇笔记",
                author: sameAuthor,
                publish_time: 1700000000,
                cover_image_url: coverImageUrl,
              },
            ],
            next_page_token: "next-search-token",
          }
        : {
            items: [
              {
                note_id: "note-b",
                title: "同一篇笔记",
                author: sameAuthor,
                publish_time: 1700000000,
                cover_image_url: coverImageUrl,
              },
              {
                note_id: "note-c",
                title: "新笔记",
                author: sameAuthor,
                publish_time: 1700000001,
                cover_image_url:
                  "https://sns-na-i6.xhscdn.com/notes_pre_post/other-token?imageView2/2/w/1440/format/heif",
              },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.data.items.map((item) => item.note_id),
    ["note-a", "note-c"]
  );
  assert.equal(payload.data.item_count, 2);
});

test("xhs search fingerprint de-duplication keeps items without complete evidence", async () => {
  let searchCallCount = 0;
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [
              {
                note_id: "note-a",
                author: { user_id: "author-1" },
                publish_time: 1700000000,
              },
            ],
            next_page_token: "next-search-token",
          }
        : {
            items: [
              {
                note_id: "note-b",
                author: { user_id: "author-1" },
                publish_time: 1700000000,
              },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.data.items.map((item) => item.note_id),
    ["note-a", "note-b"]
  );
  assert.equal(payload.data.item_count, 2);
});

test("xhs search de-duplication records skipped alias note ids", async () => {
  let searchCallCount = 0;
  const sameAuthor = { user_id: "author-1" };
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "3",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      searchCallCount += 1;
      if (searchCallCount === 1) {
        return {
          items: [
            {
              note_id: "note-a",
              author: sameAuthor,
              publish_time: 1700000000,
              cover_image_url: "https://sns-na-i6.xhscdn.com/cover-a?imageView2/2/w/1440",
            },
          ],
          next_page_token: "next-search-token-2",
        };
      }
      if (searchCallCount === 2) {
        return {
          items: [
            {
              note_id: "note-b",
              author: sameAuthor,
              publish_time: 1700000000,
              cover_image_url: "https://sns-na-i6.xhscdn.com/cover-a?imageView2/2/w/1440",
            },
          ],
          next_page_token: "next-search-token-3",
        };
      }
      return {
        items: [
          {
            note_id: "note-b",
            author: sameAuthor,
            publish_time: 1700000001,
            cover_image_url: "https://sns-na-i6.xhscdn.com/cover-b?imageView2/2/w/1440",
          },
          {
            note_id: "note-c",
            author: sameAuthor,
            publish_time: 1700000002,
            cover_image_url: "https://sns-na-i6.xhscdn.com/cover-c?imageView2/2/w/1440",
          },
        ],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.data.items.map((item) => item.note_id),
    ["note-a", "note-c"]
  );
  assert.equal(payload.data.item_count, 2);
});

test("douyin search pagination de-duplicates repeated aweme ids", async () => {
  let searchCallCount = 0;
  const { result } = await runCliWithMockMcp(
    [
      "douyin",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_search_videos");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [{ aweme_id: "aweme-1" }, { aweme_id: "aweme-2" }],
            next_page_token: "next-search-token",
          }
        : {
            items: [{ aweme_id: "aweme-1" }, { aweme_id: "aweme-3" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { aweme_id: "aweme-1" },
    { aweme_id: "aweme-2" },
    { aweme_id: "aweme-3" },
  ]);
  assert.equal(payload.data.item_count, 3);
});

test("kuaishou search pagination de-duplicates repeated photo ids", async () => {
  let searchCallCount = 0;
  const { result } = await runCliWithMockMcp(
    [
      "kuaishou",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "kuaishou_search_videos");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [{ photo_id: "photo-1" }, { photo_id: "photo-2" }],
            next_page_token: "next-search-token",
          }
        : {
            items: [{ photo_id: "photo-1" }, { photo_id: "photo-3" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { photo_id: "photo-1" },
    { photo_id: "photo-2" },
    { photo_id: "photo-3" },
  ]);
  assert.equal(payload.data.item_count, 3);
});

test("search max-items counts unique items after de-duplication", async () => {
  let searchCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "3",
      "--max-items",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_search_videos");
      searchCallCount += 1;
      return searchCallCount === 1
        ? {
            items: [{ aweme_id: "aweme-1" }],
            next_page_token: "next-search-token",
          }
        : {
            items: [
              { aweme_id: "aweme-1", title: "duplicate" },
              { aweme_id: "aweme-2" },
              { aweme_id: "aweme-3" },
            ],
            next_page_token: "still-has-more",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 2);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { aweme_id: "aweme-1" },
    { aweme_id: "aweme-2" },
  ]);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page_token, "still-has-more");
});

test("token paginated commands aggregate items and keep next token when max-items stops early", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--all",
      "--max-items",
      "2",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_video_comments_by_aweme_id");
      return {
        items: [
          { comment_id: "comment-1" },
          { comment_id: "comment-2" },
          { comment_id: "comment-3" },
        ],
        next_page_token: "next-comments-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 1);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { comment_id: "comment-1" },
    { comment_id: "comment-2" },
  ]);
  assert.equal(payload.data.page_count, 1);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page_token, "next-comments-token");
});

test("comment pagination de-duplicates repeated comment ids across all pages", async () => {
  let commentsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--all",
      "--pretty",
    ],
    {},
    ({ name, arguments: args }) => {
      assert.equal(name, "douyin_get_video_comments_by_aweme_id");
      commentsCallCount += 1;
      return commentsCallCount === 1
        ? {
            items: [
              { comment_id: "comment-1", content: "first" },
              { comment_id: "comment-2", content: "second" },
            ],
            next_page_token: "next-comments-token",
          }
        : {
            items: [
              { comment_id: "comment-2", content: "second duplicate" },
              { comment_id: "comment-3", content: "third" },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { aweme_id: "aweme-1" },
    { aweme_id: "aweme-1", page_token: "next-comments-token" },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { comment_id: "comment-1", content: "first" },
    { comment_id: "comment-2", content: "second" },
    { comment_id: "comment-3", content: "third" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 3);
  assert.equal(payload.data.next_page_token, "");
});

test("comment pagination de-duplicates repeated comment ids across requested pages", async () => {
  let commentsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_video_comments_by_aweme_id");
      commentsCallCount += 1;
      return commentsCallCount === 1
        ? {
            items: [
              { comment_id: "comment-1" },
              { comment_id: "comment-2" },
            ],
            next_page_token: "next-comments-token",
          }
        : {
            items: [
              { comment_id: "comment-1" },
              { comment_id: "comment-3" },
            ],
            next_page_token: "unused-token",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 2);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { comment_id: "comment-1" },
    { comment_id: "comment-2" },
    { comment_id: "comment-3" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 3);
  assert.equal(payload.data.next_page_token, "unused-token");
});

test("comment max-items counts unique comments after de-duplication", async () => {
  let commentsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--all",
      "--max-items",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_video_comments_by_aweme_id");
      commentsCallCount += 1;
      return commentsCallCount === 1
        ? {
            items: [{ comment_id: "comment-1" }],
            next_page_token: "next-comments-token",
          }
        : {
            items: [
              { comment_id: "comment-1", content: "duplicate" },
              { comment_id: "comment-2" },
              { comment_id: "comment-3" },
            ],
            next_page_token: "still-has-more",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 2);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { comment_id: "comment-1" },
    { comment_id: "comment-2" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page_token, "still-has-more");
});

test("comment pagination keeps items without comment ids when de-duplicating", async () => {
  let commentsCallCount = 0;
  const { result } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_video_comments_by_aweme_id");
      commentsCallCount += 1;
      return commentsCallCount === 1
        ? {
            items: [{ content: "missing id 1" }, { comment_id: "comment-1" }],
            next_page_token: "next-comments-token",
          }
        : {
            items: [{ content: "missing id 2" }, { comment_id: "comment-1" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { content: "missing id 1" },
    { comment_id: "comment-1" },
    { content: "missing id 2" },
  ]);
  assert.equal(payload.data.item_count, 3);
});

test("max-items alone keeps a single-page paginated envelope", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "kuaishou",
      "user-posts",
      "--user-id",
      "user-1",
      "--max-items",
      "1",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "kuaishou_get_user_posted_videos_by_user_id");
      return {
        items: [{ photo_id: "photo-1" }, { photo_id: "photo-2" }],
        next_page_token: "next-posts-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 1);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [{ photo_id: "photo-1" }]);
  assert.equal(payload.data.page_count, 1);
  assert.equal(payload.data.item_count, 1);
  assert.equal(payload.data.next_page_token, "next-posts-token");
});

test("douyin user-posts pagination de-duplicates repeated aweme ids", async () => {
  let postsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "user-posts",
      "--sec-user-id",
      "sec-user-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_user_posted_videos_by_sec_user_id");
      postsCallCount += 1;
      return postsCallCount === 1
        ? {
            items: [{ aweme_id: "aweme-1" }],
            next_page_token: "next-posts-token",
          }
        : {
            items: [{ aweme_id: "aweme-1" }, { aweme_id: "aweme-2" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { sec_user_id: "sec-user-1" },
    { sec_user_id: "sec-user-1", page_token: "next-posts-token" },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { aweme_id: "aweme-1" },
    { aweme_id: "aweme-2" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
});

test("xhs user-posts pagination de-duplicates same note content with different note ids", async () => {
  let postsCallCount = 0;
  const sameAuthor = { user_id: "author-1" };
  const coverImageUrl =
    "https://sns-webpic-qc.xhscdn.com/202606041619/hash/c/notes_pre_post/cover-token!nd_dft_wlteh_webp_3";
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "user-posts",
      "--user-id",
      "author-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_get_user_posted_notes_by_user_id");
      postsCallCount += 1;
      return postsCallCount === 1
        ? {
            items: [
              {
                note_id: "note-a",
                author: sameAuthor,
                publish_time: 1700000000,
                cover_image_url: coverImageUrl,
              },
            ],
            next_page_token: "next-posts-token",
          }
        : {
            items: [
              {
                note_id: "note-b",
                author: sameAuthor,
                publish_time: 1700000000,
                cover_image_url: coverImageUrl,
              },
              {
                note_id: "note-c",
                author: sameAuthor,
                publish_time: 1700000001,
                cover_image_url:
                  "https://sns-webpic-qc.xhscdn.com/202606041619/hash/c/notes_pre_post/other-token!nd_dft_wlteh_webp_3",
              },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.data.items.map((item) => item.note_id),
    ["note-a", "note-c"]
  );
  assert.equal(payload.data.item_count, 2);
});

test("xhs user-posts fingerprint de-duplication keeps items without meaningful publish time", async () => {
  let postsCallCount = 0;
  const sameAuthor = { user_id: "author-1" };
  const coverImageUrl =
    "https://sns-webpic-qc.xhscdn.com/202606041619/hash/c/notes_pre_post/cover-token!nd_dft_wlteh_webp_3";
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "user-posts",
      "--user-id",
      "author-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_get_user_posted_notes_by_user_id");
      postsCallCount += 1;
      return postsCallCount === 1
        ? {
            items: [
              {
                note_id: "note-a",
                author: sameAuthor,
                publish_time: 0,
                cover_image_url: coverImageUrl,
              },
            ],
            next_page_token: "next-posts-token",
          }
        : {
            items: [
              {
                note_id: "note-b",
                author: sameAuthor,
                publish_time: 0,
                cover_image_url: coverImageUrl,
              },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(
    payload.data.items.map((item) => item.note_id),
    ["note-a", "note-b"]
  );
  assert.equal(payload.data.item_count, 2);
});

test("kuaishou user-posts pagination de-duplicates repeated photo ids", async () => {
  let postsCallCount = 0;
  const { result } = await runCliWithMockMcp(
    [
      "kuaishou",
      "user-posts",
      "--user-id",
      "user-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "kuaishou_get_user_posted_videos_by_user_id");
      postsCallCount += 1;
      return postsCallCount === 1
        ? {
            items: [{ photo_id: "photo-1" }, { photo_id: "photo-2" }],
            next_page_token: "next-posts-token",
          }
        : {
            items: [{ photo_id: "photo-1" }, { photo_id: "photo-3" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { photo_id: "photo-1" },
    { photo_id: "photo-2" },
    { photo_id: "photo-3" },
  ]);
  assert.equal(payload.data.item_count, 3);
});

test("user-posts since-days auto paginates until the publish-time boundary", async () => {
  let postsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "user-posts",
      "--user-id",
      "author-1",
      "--since-days",
      "7",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_get_user_posted_notes_by_user_id");
      postsCallCount += 1;
      return postsCallCount === 1
        ? {
            items: [
              { note_id: "recent-note-1", publish_time: unixSecondsDaysAgo(1) },
              { note_id: "missing-time" },
            ],
            next_page_token: "next-posts-token",
          }
        : {
            items: [
              { note_id: "recent-note-2", publish_time: unixSecondsDaysAgo(2) },
              { note_id: "old-note", publish_time: unixSecondsDaysAgo(8) },
            ],
            next_page_token: "still-has-more",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { user_id: "author-1" },
    { user_id: "author-1", page_token: "next-posts-token" },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items.map((item) => item.note_id), [
    "recent-note-1",
    "recent-note-2",
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page_token, "still-has-more");
  assert.equal(payload.data.stopped_by_since_days, true);
});

test("user-posts since-days missing publish times do not trigger boundary stop", async () => {
  let postsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "user-posts",
      "--sec-user-id",
      "sec-user-1",
      "--since-days",
      "7",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_user_posted_videos_by_sec_user_id");
      postsCallCount += 1;
      return postsCallCount === 1
        ? {
            items: [{ aweme_id: "missing-time" }],
            next_page_token: "next-posts-token",
          }
        : {
            items: [{ aweme_id: "recent-aweme", publish_time: unixSecondsDaysAgo(1) }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 2);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items.map((item) => item.aweme_id), ["recent-aweme"]);
  assert.equal(payload.data.stopped_by_since_days, undefined);
});

test("since-days filters before applying max-items", async () => {
  const { result } = await runCliWithMockMcp(
    [
      "weibo",
      "user-posts",
      "--user-id",
      "user-1",
      "--since-days",
      "7",
      "--max-items",
      "1",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "weibo_get_user_posts_by_user_id");
      return {
        items: [
          { post_id: "old-post", publish_time: unixSecondsDaysAgo(10) },
          { post_id: "recent-post-1", publish_time: unixSecondsDaysAgo(1) },
          { post_id: "recent-post-2", publish_time: unixSecondsDaysAgo(2) },
        ],
        next_page_token: "next-posts-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items.map((item) => item.post_id), ["recent-post-1"]);
  assert.equal(payload.data.item_count, 1);
  assert.equal(payload.data.stopped_by_since_days, true);
});

test("user-posts since-days max-items does not report a time boundary without old items", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "wechat",
      "user-posts",
      "--user-id",
      "finder-user-1",
      "--since-days",
      "7",
      "--max-items",
      "1",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "wechat_get_user_posted_videos_by_user_id");
      return {
        items: [
          { encrypted_object_id: "object-1", publish_time: unixSecondsDaysAgo(1) },
          { encrypted_object_id: "object-2", publish_time: unixSecondsDaysAgo(2) },
        ],
        next_page_token: "next-posts-token",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 1);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items.map((item) => item.encrypted_object_id), ["object-1"]);
  assert.equal(payload.data.item_count, 1);
  assert.equal(payload.data.next_page_token, "next-posts-token");
  assert.equal(payload.data.stopped_by_since_days, undefined);
});

test("douyin user-series pagination de-duplicates repeated series ids", async () => {
  let seriesCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "user-series",
      "--sec-user-id",
      "sec-user-1",
      "--pages",
      "2",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_user_series_by_sec_user_id");
      seriesCallCount += 1;
      return seriesCallCount === 1
        ? {
            items: [{ series_id: "series-1" }, { series_id: "series-2" }],
            next_page_token: "next-series-token",
          }
        : {
            items: [{ series_id: "series-1" }, { series_id: "series-3" }],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { sec_user_id: "sec-user-1" },
    { sec_user_id: "sec-user-1", page_token: "next-series-token" },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { series_id: "series-1" },
    { series_id: "series-2" },
    { series_id: "series-3" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 3);
});

test("token paginated commands include empty next token when the last page omits it", async () => {
  const { result } = await runCliWithMockMcp(
    [
      "douyin",
      "user-posts",
      "--sec-user-id",
      "sec-user-1",
      "--pages",
      "1",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_user_posted_videos_by_sec_user_id");
      return {
        items: [{ aweme_id: "aweme-1" }],
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.data.next_page_token, "");
});

test("xhs search paginated output treats empty next_page_token as complete", async () => {
  const { result } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "1",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "xhs_search_notes");
      return {
        items: [{ note_id: "note-1" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.data.next_page_token, "");
});

test("comments include replies builds a nested comment tree", async () => {
  const {
    result,
    toolCalls,
    toolCallSourceClientHeaders,
    toolCallSourcePlatformHeaders,
    toolCallSourceSkillHeaders,
  } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--include-replies",
      "--pretty",
      "--source-client",
      "socialdatax-skills",
      "--source-platform",
      "skillhub",
      "--source-skill",
      "socialdatax-comment-insights",
    ],
    {},
    ({ name, arguments: args }) => {
      if (name === "douyin_get_video_comments_by_aweme_id") {
        return {
          items: [
            {
              comment_id: "comment-1",
              aweme_id: "aweme-1",
              reply_count: 2,
            },
            {
              comment_id: "comment-2",
              aweme_id: "aweme-1",
              reply_count: 0,
            },
          ],
          next_page_token: "",
        };
      }
      assert.equal(name, "douyin_get_video_comment_replies_by_comment_id");
      return args.page_token
        ? {
            items: [{ comment_id: "reply-2", aweme_id: "aweme-1" }],
            next_page_token: "",
          }
        : {
            items: [{ comment_id: "reply-1", aweme_id: "aweme-1" }],
            next_page_token: "next-replies-token",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.name), [
    "douyin_get_video_comments_by_aweme_id",
    "douyin_get_video_comment_replies_by_comment_id",
    "douyin_get_video_comment_replies_by_comment_id",
  ]);
  assert.deepEqual(toolCallSourceClientHeaders, [
    "socialdatax-skills",
    "socialdatax-skills",
    "socialdatax-skills",
  ]);
  assert.deepEqual(toolCallSourcePlatformHeaders, [
    "skillhub",
    "skillhub",
    "skillhub",
  ]);
  assert.deepEqual(toolCallSourceSkillHeaders, [
    "socialdatax-comment-insights",
    "socialdatax-comment-insights",
    "socialdatax-comment-insights",
  ]);
  assert.deepEqual(toolCalls[1].arguments, {
    aweme_id: "aweme-1",
    comment_id: "comment-1",
  });
  assert.deepEqual(toolCalls[2].arguments, {
    aweme_id: "aweme-1",
    comment_id: "comment-1",
    page_token: "next-replies-token",
  });
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items[0].replies, [
    { comment_id: "reply-1", aweme_id: "aweme-1" },
    { comment_id: "reply-2", aweme_id: "aweme-1" },
  ]);
  assert.equal(payload.data.items[0].replies_page_count, 2);
  assert.equal(payload.data.items[0].replies_next_page_token, "");
  assert.deepEqual(payload.data.items[1].replies, []);
  assert.equal(payload.data.items[1].replies_page_count, 0);
});

test("comments include replies fetches replies once for duplicate top-level comments", async () => {
  let commentsCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--all",
      "--include-replies",
      "--pretty",
    ],
    {},
    ({ name, arguments: args }) => {
      if (name === "douyin_get_video_comments_by_aweme_id") {
        commentsCallCount += 1;
        return commentsCallCount === 1
          ? {
              items: [{ comment_id: "comment-1", reply_count: 1 }],
              next_page_token: "next-comments-token",
            }
          : {
              items: [
                { comment_id: "comment-1", reply_count: 1 },
                { comment_id: "comment-2", reply_count: 0 },
              ],
              next_page_token: "",
            };
      }
      assert.equal(name, "douyin_get_video_comment_replies_by_comment_id");
      assert.equal(args.comment_id, "comment-1");
      return {
        items: [{ comment_id: "reply-1" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.name), [
    "douyin_get_video_comments_by_aweme_id",
    "douyin_get_video_comment_replies_by_comment_id",
    "douyin_get_video_comments_by_aweme_id",
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    {
      comment_id: "comment-1",
      reply_count: 1,
      replies: [{ comment_id: "reply-1" }],
      replies_page_count: 1,
      replies_next_page_token: "",
    },
    {
      comment_id: "comment-2",
      reply_count: 0,
      replies: [],
      replies_page_count: 0,
      replies_next_page_token: "",
    },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
});

test("comment reply pagination de-duplicates repeated reply ids", async () => {
  let repliesCallCount = 0;
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "replies",
      "--aweme-id",
      "aweme-1",
      "--comment-id",
      "comment-1",
      "--all",
      "--pretty",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_video_comment_replies_by_comment_id");
      repliesCallCount += 1;
      return repliesCallCount === 1
        ? {
            items: [
              { comment_id: "reply-1" },
              { comment_id: "reply-2" },
            ],
            next_page_token: "next-replies-token",
          }
        : {
            items: [
              { comment_id: "reply-2", content: "duplicate" },
              { comment_id: "reply-3" },
            ],
            next_page_token: "",
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { aweme_id: "aweme-1", comment_id: "comment-1" },
    {
      aweme_id: "aweme-1",
      comment_id: "comment-1",
      page_token: "next-replies-token",
    },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { comment_id: "reply-1" },
    { comment_id: "reply-2" },
    { comment_id: "reply-3" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 3);
});

test("comments include replies falls back to parent content id", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--include-replies",
    ],
    {},
    ({ name }) => {
      if (name === "douyin_get_video_comments_by_aweme_id") {
        return {
          items: [{ comment_id: "comment-1", reply_count: 1 }],
          next_page_token: "",
        };
      }
      assert.equal(name, "douyin_get_video_comment_replies_by_comment_id");
      return {
        items: [{ comment_id: "reply-1" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls[1].arguments, {
    aweme_id: "aweme-1",
    comment_id: "comment-1",
  });
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items[0].replies, [{ comment_id: "reply-1" }]);
});

test("comments include replies falls back to top-level returned content id", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "comments",
      "--url",
      "https://www.xiaohongshu.com/explore/note-1",
      "--include-replies",
    ],
    {},
    ({ name }) => {
      if (name === "xhs_get_note_comments_by_note_url") {
        return {
          note_id: "note-1",
          items: [{ comment_id: "comment-1", reply_count: 1 }],
          next_page_token: "",
        };
      }
      assert.equal(name, "xhs_get_note_sub_comments_by_comment_id");
      return {
        items: [{ comment_id: "reply-1" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls[1].arguments, {
    note_id: "note-1",
    comment_id: "comment-1",
  });
});

test("comments include replies reuses resolved content id across URL pages", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "comments",
      "--url",
      "https://www.xiaohongshu.com/explore/note-1",
      "--pages",
      "2",
      "--include-replies",
    ],
    {},
    ({ name, arguments: args }) => {
      if (name === "xhs_get_note_comments_by_note_url") {
        if (args.page_token) {
          return {
            items: [{ comment_id: "comment-2", reply_count: 1 }],
            next_page_token: "",
          };
        }
        return {
          note_id: "note-1",
          items: [{ comment_id: "comment-1", reply_count: 0 }],
          next_page_token: "next-comments-token",
        };
      }
      assert.equal(name, "xhs_get_note_sub_comments_by_comment_id");
      return {
        items: [{ comment_id: "reply-2" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.name), [
    "xhs_get_note_comments_by_note_url",
    "xhs_get_note_comments_by_note_url",
    "xhs_get_note_sub_comments_by_comment_id",
  ]);
  assert.deepEqual(toolCalls[2].arguments, {
    note_id: "note-1",
    comment_id: "comment-2",
  });
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.data.note_id, "note-1");
});

test("xhs comments include replies keeps parent sort without passing it to replies", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "comments",
      "--url",
      "https://www.xiaohongshu.com/explore/note-1",
      "--sort-type",
      "like_count_descending",
      "--pages",
      "2",
      "--include-replies",
    ],
    {},
    ({ name, arguments: args }) => {
      if (name === "xhs_get_note_comments_by_note_url") {
        assert.equal(args.sort_type, "like_count_descending");
        if (args.page_token) {
          return {
            items: [{ comment_id: "comment-2", reply_count: 1 }],
            next_page_token: "",
          };
        }
        return {
          note_id: "note-1",
          items: [{ comment_id: "comment-1", reply_count: 0 }],
          next_page_token: "next-comments-token",
        };
      }
      assert.equal(name, "xhs_get_note_sub_comments_by_comment_id");
      assert.equal(args.sort_type, undefined);
      return {
        items: [{ comment_id: "reply-2" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.name), [
    "xhs_get_note_comments_by_note_url",
    "xhs_get_note_comments_by_note_url",
    "xhs_get_note_sub_comments_by_comment_id",
  ]);
  assert.deepEqual(toolCalls[0].arguments, {
    note_url: "https://www.xiaohongshu.com/explore/note-1",
    sort_type: "like_count_descending",
  });
  assert.deepEqual(toolCalls[1].arguments, {
    note_url: "https://www.xiaohongshu.com/explore/note-1",
    page_token: "next-comments-token",
    sort_type: "like_count_descending",
  });
  assert.deepEqual(toolCalls[2].arguments, {
    note_id: "note-1",
    comment_id: "comment-2",
  });
});

test("comments include replies only fetches replies for retained max-items", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "kuaishou",
      "comments",
      "--photo-id",
      "photo-1",
      "--include-replies",
      "--max-items",
      "1",
    ],
    {},
    ({ name, arguments: args }) => {
      if (name === "kuaishou_get_video_comments_by_photo_id") {
        return {
          items: [
            { comment_id: "comment-1", reply_count: 1 },
            { comment_id: "comment-2", reply_count: 1 },
          ],
          next_page_token: "next-comments-token",
        };
      }
      assert.equal(name, "kuaishou_get_video_comment_replies_by_comment_id");
      assert.equal(args.comment_id, "comment-1");
      return {
        items: [{ comment_id: "reply-1" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.name), [
    "kuaishou_get_video_comments_by_photo_id",
    "kuaishou_get_video_comment_replies_by_comment_id",
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    {
      comment_id: "comment-1",
      reply_count: 1,
      replies: [{ comment_id: "reply-1" }],
      replies_page_count: 1,
      replies_next_page_token: "",
    },
  ]);
  assert.equal(payload.data.next_page_token, "next-comments-token");
});

test("comments include replies treats numeric string zero reply count as no replies", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--include-replies",
    ],
    {},
    ({ name }) => {
      assert.equal(name, "douyin_get_video_comments_by_aweme_id");
      return {
        items: [{ comment_id: "comment-1", reply_count: "0" }],
        next_page_token: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 1);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items[0].replies, []);
  assert.equal(payload.data.items[0].replies_page_count, 0);
});

test("direct pagination rejects unsupported combinations before checking the API key", () => {
  assertCliError(
    runCli(["douyin", "search", "--keyword", "露营", "--all"]),
    "--all is not supported for douyin search\\. Use --pages instead\\."
  );
  assertCliError(
    runCli(["kuaishou", "comments", "--photo-id", "photo-1", "--all", "--pages", "2"]),
    "Use only one of --all or --pages\\."
  );
  assertCliError(
    runCli(["xhs", "sub-comments", "--note-id", "note-1", "--comment-id", "comment-1", "--include-replies"]),
    "--include-replies is only supported for xhs comments\\."
  );
});

test("paginated commands reject next marker that repeats the current request", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--page-token",
      "same-token",
      "--pages",
      "2",
    ],
    {},
    () => ({
      items: [{ note_id: "note-1" }],
      next_page_token: "same-token",
    })
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Pagination stopped because next_page_token repeated\./);
  assert.equal(toolCalls.length, 1);
});

test("paginated commands do not reject repeated next marker when page limit is reached", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--page-token",
      "same-token",
      "--pages",
      "1",
    ],
    {},
    () => ({
      items: [{ note_id: "note-1" }],
      next_page_token: "same-token",
    })
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 1);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.data.next_page_token, "");
});

test("paginated commands reject repeated next_page_token", async () => {
  const { result } = await runCliWithMockMcp(
    [
      "kuaishou",
      "comments",
      "--photo-id",
      "photo-1",
      "--all",
    ],
    {},
    () => ({
      items: [{ comment_id: "comment-1", photo_id: "photo-1", has_replies: false }],
      next_page_token: "same-token",
    })
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Pagination stopped because next_page_token repeated\./
  );
});

test("doctor prints human-readable safety summary", () => {
  const result = runCli(["doctor"]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /socialdatax-skills doctor/);
  assert.match(result.stdout, /Package: socialdatax-skills@0\.2\.31/);
  assert.match(result.stdout, /Website: https:\/\/socialdatax\.com/);
  assert.doesNotMatch(result.stdout, /Source: https:\/\/socialdatax\.com/);
  assert.match(result.stdout, /npm lifecycle scripts: none declared by this package/);
  assert.match(result.stdout, /install does not store API keys/);
  assert.match(result.stdout, /social media content intelligence workflows/);
  assert.match(result.stdout, /some commands submit bounded analysis jobs such as video speech-to-text transcript/);
  assert.doesNotMatch(result.stdout, /read-only social media intelligence workflows/);
  assert.match(result.stdout, /XHS \/ Xiaohongshu \/ RedNote/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/xhs\/mcp/);
  assert.match(result.stdout, /Douyin \/ 抖音/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/douyin\/mcp/);
  assert.match(result.stdout, /Kuaishou \/ 快手 \/ Kwai/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/kuaishou\/mcp/);
  assert.match(result.stdout, /Bilibili \/ 哔哩哔哩 \/ B站/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/bilibili\/mcp/);
  assert.match(result.stdout, /Weibo \/ 微博/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/weibo\/mcp/);
  assert.match(result.stdout, /WeChat \/ 微信/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/wechat\/mcp/);
  assert.match(result.stdout, /Sensitive Words Check \/ 敏感词检测/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.socialdatax\.com\/sensitive-check\/mcp/);
});

test("verify is an alias for doctor", () => {
  const result = runCli(["verify"]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /socialdatax-skills doctor/);
});

test("doctor json prints parseable safety summary", () => {
  const result = runCli(["doctor", "--json"]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const report = JSON.parse(result.stdout);
  assert.equal(report.package.name, "socialdatax-skills");
  assert.equal(report.package.version, "0.2.31");
  assert.equal(report.package.homepage, "https://socialdatax.com");
  assert.equal(report.package.repository, undefined);
  assert.deepEqual(report.package.npmLifecycleScripts, []);
  assert.equal(report.install.apiKeyStored, false);
  assert.equal(report.install.mcpConfigChanged, false);
  assert.equal(report.security.readOnly, false);
  assert.equal(report.security.directCliReadOnly, false);
  assert.equal(report.security.directCliMaySubmitAnalysisJobs, true);
  assert.equal(report.security.platformMcpMaySubmitAnalysisJobs, true);
  assert.equal(report.security.accountActions, false);
  assert.equal(report.security.readsLocalBrowserData, false);
  assert.equal(report.security.readsBrowserCookies, undefined);
  assert.equal(report.security.readsLocalAccountSession, undefined);
  assert.equal(report.platforms.length, 7);
  assert.equal(report.platform.endpointOverrideActive, false);
  assert.equal(report.platform.registryName, "com.52choujiang/xhs-insights");
  assert.equal(report.platform.futureRegistryName, "com.socialdatax/xhs-insights");
  assert.equal(report.platform.legacyRegistryName, undefined);
  assert.equal(report.platform.defaultEndpoint, "https://mcp.socialdatax.com/xhs/mcp");
  assert.equal(report.platform.tools.length, 14);
  assert.ok(report.platform.tools.includes("xhs_get_search_hot_list"));
  assert.ok(report.platform.tools.includes("xhs_get_note_sub_comments_by_comment_id"));
  assert.ok(report.platform.tools.includes("xhs_submit_video_speech_text_by_note_url"));
  assert.ok(report.platform.tools.includes("xhs_submit_video_speech_text_by_note_id"));
  assert.ok(report.platform.tools.includes("xhs_get_video_speech_text_job"));
  const douyinPlatform = report.platforms.find(
    (platform) => platform.id === "douyin"
  );
  assert.equal(douyinPlatform.registryName, "com.52choujiang/douyin-insights");
  assert.equal(douyinPlatform.futureRegistryName, "com.socialdatax/douyin-insights");
  assert.equal(douyinPlatform.legacyRegistryName, undefined);
  assert.equal(douyinPlatform.defaultEndpoint, "https://mcp.socialdatax.com/douyin/mcp");
  assert.equal(douyinPlatform.tools.length, 16);
  assert.ok(douyinPlatform.tools.includes("douyin_get_hot_search_list"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_video_comment_replies_by_comment_id"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_user_series_by_sec_user_id"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_user_series_by_profile_url"));
  assert.ok(douyinPlatform.tools.includes("douyin_submit_video_speech_text_by_video_url"));
  assert.ok(douyinPlatform.tools.includes("douyin_submit_video_speech_text_by_aweme_id"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_video_speech_text_job"));
  assert.ok(!douyinPlatform.tools.includes("douyin_get_comment_replies_by_comment_id"));
  assert.ok(!douyinPlatform.tools.includes("douyin_get_video_share_link_by_aweme_id"));
  assert.ok(!douyinPlatform.tools.includes("douyin_get_live_info_by_url"));
  const douyinSearchTool = douyinPlatform.toolDetails.find(
    (tool) => tool.name === "douyin_search_videos"
  );
  assert.equal(
    douyinSearchTool.description,
    "Search Douyin works by keyword with optional page_token continuation and filters; do not pass page."
  );
  const douyinRepliesTool = douyinPlatform.toolDetails.find(
    (tool) => tool.name === "douyin_get_video_comment_replies_by_comment_id"
  );
  assert.equal(
    douyinRepliesTool.description,
    "Fetch paginated replies under a first-level Douyin comment; pass both aweme_id and comment_id, and use page_token to continue pagination."
  );
  const kuaishouPlatform = report.platforms.find(
    (platform) => platform.id === "kuaishou"
  );
  assert.equal(kuaishouPlatform.registryName, "com.52choujiang/kuaishou-insights");
  assert.equal(kuaishouPlatform.futureRegistryName, "com.socialdatax/kuaishou-insights");
  assert.equal(kuaishouPlatform.defaultEndpoint, "https://mcp.socialdatax.com/kuaishou/mcp");
  assert.equal(kuaishouPlatform.tools.length, 15);
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_get_hot_search_list"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_search_videos"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_search_users"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_get_video_comment_replies_by_comment_id"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_get_user_posted_videos_by_profile_url"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_submit_video_speech_text_by_video_url"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_submit_video_speech_text_by_photo_id"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_get_video_speech_text_job"));
  const kuaishouSearchTool = kuaishouPlatform.toolDetails.find(
    (tool) => tool.name === "kuaishou_search_videos"
  );
  assert.equal(
    kuaishouSearchTool.description,
    "Search Kuaishou works by natural-language keyword with optional page_token continuation; do not pass page."
  );
  const kuaishouUserSearchTool = kuaishouPlatform.toolDetails.find(
    (tool) => tool.name === "kuaishou_search_users"
  );
  assert.equal(
    kuaishouUserSearchTool.description,
    "Search Kuaishou creators by keyword with optional page_token continuation; do not pass page."
  );
  const bilibiliPlatform = report.platforms.find(
    (platform) => platform.id === "bilibili"
  );
  assert.equal(bilibiliPlatform.displayName, "Bilibili / 哔哩哔哩 / B站");
  assert.equal(bilibiliPlatform.registryName, "com.52choujiang/bilibili-insights");
  assert.equal(bilibiliPlatform.futureRegistryName, "com.socialdatax/bilibili-insights");
  assert.equal(bilibiliPlatform.defaultEndpoint, "https://mcp.socialdatax.com/bilibili/mcp");
  assert.equal(bilibiliPlatform.tools.length, 1);
  assert.ok(bilibiliPlatform.tools.includes("bilibili_get_video_download_links"));
  const weiboPlatform = report.platforms.find(
    (platform) => platform.id === "weibo"
  );
  assert.equal(weiboPlatform.registryName, "com.52choujiang/weibo-insights");
  assert.equal(weiboPlatform.futureRegistryName, "com.socialdatax/weibo-insights");
  assert.equal(weiboPlatform.defaultEndpoint, "https://mcp.socialdatax.com/weibo/mcp");
  assert.equal(weiboPlatform.tools.length, 16);
  assert.ok(weiboPlatform.tools.includes("weibo_get_hot_search_list"));
  assert.ok(weiboPlatform.tools.includes("weibo_search_posts"));
  assert.ok(weiboPlatform.tools.includes("weibo_get_post_comment_replies_by_comment_id"));
  assert.ok(weiboPlatform.tools.includes("weibo_get_post_liker_list_by_post_id"));
  assert.ok(weiboPlatform.tools.includes("weibo_get_post_repost_list_by_post_id"));
  assert.ok(weiboPlatform.tools.includes("weibo_get_user_posts_by_profile_url"));
  assert.ok(weiboPlatform.tools.includes("weibo_submit_video_speech_text_by_post_url"));
  assert.ok(weiboPlatform.tools.includes("weibo_submit_video_speech_text_by_post_id"));
  assert.ok(weiboPlatform.tools.includes("weibo_get_video_speech_text_job"));
  const wechatPlatform = report.platforms.find(
    (platform) => platform.id === "wechat"
  );
  assert.equal(wechatPlatform.displayName, "WeChat / 微信");
  assert.equal(wechatPlatform.registryName, "com.52choujiang/wechat-channels-insights");
  assert.equal(wechatPlatform.futureRegistryName, "com.socialdatax/wechat-channels-insights");
  assert.equal(wechatPlatform.defaultEndpoint, "https://mcp.socialdatax.com/wechat/mcp");
  assert.equal(wechatPlatform.tools.length, 14);
  assert.ok(wechatPlatform.tools.includes("wechat_get_hot_search_list"));
  assert.ok(wechatPlatform.tools.includes("wechat_search_videos"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_mp_article_detail_by_url"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_video_comment_replies_by_comment_id"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_user_posted_videos_by_url"));
  assert.ok(wechatPlatform.tools.includes("wechat_submit_video_speech_text_by_video_url"));
  assert.ok(wechatPlatform.tools.includes("wechat_submit_video_speech_text_by_encrypted_object_id"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_video_speech_text_job"));
  const sensitiveCheckPlatform = report.platforms.find(
    (platform) => platform.id === "sensitive-check"
  );
  assert.equal(sensitiveCheckPlatform.registryName, "sensitive-check");
  assert.equal(sensitiveCheckPlatform.futureRegistryName, "com.socialdatax/sensitive-check");
  assert.equal(sensitiveCheckPlatform.defaultEndpoint, "https://mcp.socialdatax.com/sensitive-check/mcp");
  assert.equal(sensitiveCheckPlatform.tools.length, 1);
  assert.ok(sensitiveCheckPlatform.tools.includes("check_sensitive_text"));
  const sensitiveTextTool = sensitiveCheckPlatform.toolDetails.find(
    (tool) => tool.name === "check_sensitive_text"
  );
  assert.match(sensitiveTextTool.description, /sensitive-content risks/);
  const detailByUrlTool = report.platform.toolDetails.find(
    (tool) => tool.name === "xhs_get_note_detail_by_note_url"
  );
  const commentsByUrlTool = report.platform.toolDetails.find(
    (tool) => tool.name === "xhs_get_note_comments_by_note_url"
  );
  assert.match(detailByUrlTool.description, /short link, or share text/);
  assert.doesNotMatch(detailByUrlTool.description, /note ID/);
  assert.match(commentsByUrlTool.description, /note URL, short link, or share text/);
  const xhsSubmitTranscriptTool = report.platform.toolDetails.find(
    (tool) => tool.name === "xhs_submit_video_speech_text_by_note_url"
  );
  const xhsJobTranscriptTool = report.platform.toolDetails.find(
    (tool) => tool.name === "xhs_get_video_speech_text_job"
  );
  const douyinSubmitTranscriptTool = douyinPlatform.toolDetails.find(
    (tool) => tool.name === "douyin_submit_video_speech_text_by_aweme_id"
  );
  const douyinJobTranscriptTool = douyinPlatform.toolDetails.find(
    (tool) => tool.name === "douyin_get_video_speech_text_job"
  );
  const kuaishouSubmitTranscriptTool = kuaishouPlatform.toolDetails.find(
    (tool) => tool.name === "kuaishou_submit_video_speech_text_by_photo_id"
  );
  const kuaishouJobTranscriptTool = kuaishouPlatform.toolDetails.find(
    (tool) => tool.name === "kuaishou_get_video_speech_text_job"
  );
  const weiboSubmitTranscriptTool = weiboPlatform.toolDetails.find(
    (tool) => tool.name === "weibo_submit_video_speech_text_by_post_id"
  );
  const weiboJobTranscriptTool = weiboPlatform.toolDetails.find(
    (tool) => tool.name === "weibo_get_video_speech_text_job"
  );
  const wechatSubmitTranscriptTool = wechatPlatform.toolDetails.find(
    (tool) => tool.name === "wechat_submit_video_speech_text_by_encrypted_object_id"
  );
  const wechatJobTranscriptTool = wechatPlatform.toolDetails.find(
    (tool) => tool.name === "wechat_get_video_speech_text_job"
  );
  assert.match(xhsSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(xhsSubmitTranscriptTool.description, /提交后最多等待 210 秒/);
  assert.match(xhsSubmitTranscriptTool.description, /同一个 job_id 直到终态/);
  assert.match(xhsJobTranscriptTool.description, /content context/);
  assert.match(xhsJobTranscriptTool.description, /is_terminal is true/);
  assert.match(xhsJobTranscriptTool.description, /not summary/);
  assert.match(douyinSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(douyinSubmitTranscriptTool.description, /提交后最多等待 210 秒/);
  assert.match(douyinSubmitTranscriptTool.description, /同一个 job_id 直到终态/);
  assert.match(douyinJobTranscriptTool.description, /content context/);
  assert.match(douyinJobTranscriptTool.description, /is_terminal is true/);
  assert.match(douyinJobTranscriptTool.description, /not summary/);
  assert.match(kuaishouSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(kuaishouSubmitTranscriptTool.description, /提交后最多等待 210 秒/);
  assert.match(kuaishouSubmitTranscriptTool.description, /同一个 job_id 直到终态/);
  assert.match(kuaishouJobTranscriptTool.description, /content context/);
  assert.match(kuaishouJobTranscriptTool.description, /is_terminal is true/);
  assert.match(kuaishouJobTranscriptTool.description, /not summary/);
  assert.match(weiboSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(weiboSubmitTranscriptTool.description, /提交后最多等待 210 秒/);
  assert.match(weiboSubmitTranscriptTool.description, /同一个 job_id 直到终态/);
  assert.match(weiboJobTranscriptTool.description, /content context/);
  assert.match(weiboJobTranscriptTool.description, /is_terminal is true/);
  assert.match(weiboJobTranscriptTool.description, /not summary/);
  assert.match(wechatSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(wechatSubmitTranscriptTool.description, /提交后最多等待 210 秒/);
  assert.match(wechatSubmitTranscriptTool.description, /同一个 job_id 直到终态/);
  assert.match(wechatJobTranscriptTool.description, /content context/);
  assert.match(wechatJobTranscriptTool.description, /is_terminal is true/);
  assert.match(wechatJobTranscriptTool.description, /not summary/);
  assert.doesNotMatch(result.stdout, /69cf45899948d391e7b5e879/);
});

test("README documents transcript job output as transcript plus content context", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  assert.match(
    readme,
    /Check an XHS speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request\. Continue querying the same job_id until is_terminal is true\. Returns transcript plus content context, not summary\./
  );
  assert.match(
    readme,
    /Check a Douyin speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request\. Continue querying the same job_id until is_terminal is true\. Returns transcript plus content context, not summary\./
  );
  assert.match(
    readme,
    /Check a Kuaishou speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request\. Continue querying the same job_id until is_terminal is true\. Returns transcript plus content context, not summary\./
  );
  assert.match(
    readme,
    /Check a Weibo speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request\. Continue querying the same job_id until is_terminal is true\. Returns transcript plus content context, not summary\./
  );
  assert.match(
    readme,
    /Check a WeChat Channels \/ 视频号 speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request\. Continue querying the same job_id until is_terminal is true\. Returns transcript plus content context, not summary\./
  );
});

test("doctor json reports the active endpoint when an upstream override is set", () => {
  const result = runCliWithEnv(["doctor", "--json"], {
    SOCIAL_MEDIA_XHS_MCP_UPSTREAM_URL: "https://example.com/xhs/mcp",
    SOCIAL_MEDIA_MCP_UPSTREAM_URL: "",
    XHS_MCP_UPSTREAM_URL: "",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const report = JSON.parse(result.stdout);
  assert.equal(report.platform.endpoint, "https://example.com/xhs/mcp");
  assert.equal(report.platform.defaultEndpoint, "https://mcp.socialdatax.com/xhs/mcp");
  assert.equal(report.platform.endpointOverrideActive, true);
});

test("doctor json reports the active douyin endpoint when an upstream override is set", () => {
  const result = runCliWithEnv(["doctor", "--json"], {
    SOCIAL_MEDIA_DOUYIN_MCP_UPSTREAM_URL: "https://example.com/douyin/mcp",
    SOCIAL_MEDIA_MCP_UPSTREAM_URL: "",
    DOUYIN_MCP_UPSTREAM_URL: "",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const report = JSON.parse(result.stdout);
  const douyinPlatform = report.platforms.find(
    (platform) => platform.id === "douyin"
  );
  assert.equal(douyinPlatform.endpoint, "https://example.com/douyin/mcp");
  assert.equal(douyinPlatform.defaultEndpoint, "https://mcp.socialdatax.com/douyin/mcp");
  assert.equal(douyinPlatform.endpointOverrideActive, true);
});

test("doctor json reports the active kuaishou endpoint when an upstream override is set", () => {
  const result = runCliWithEnv(["doctor", "--json"], {
    SOCIAL_MEDIA_KUAISHOU_MCP_UPSTREAM_URL: "https://example.com/kuaishou/mcp",
    SOCIAL_MEDIA_MCP_UPSTREAM_URL: "",
    KUAISHOU_MCP_UPSTREAM_URL: "",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const report = JSON.parse(result.stdout);
  const kuaishouPlatform = report.platforms.find(
    (platform) => platform.id === "kuaishou"
  );
  assert.equal(kuaishouPlatform.endpoint, "https://example.com/kuaishou/mcp");
  assert.equal(kuaishouPlatform.defaultEndpoint, "https://mcp.socialdatax.com/kuaishou/mcp");
  assert.equal(kuaishouPlatform.endpointOverrideActive, true);
});

test("doctor json reports active weibo and wechat endpoints when upstream overrides are set", () => {
  const result = runCliWithEnv(["doctor", "--json"], {
    SOCIAL_MEDIA_WEIBO_MCP_UPSTREAM_URL: "https://example.com/weibo/mcp",
    SOCIAL_MEDIA_WECHAT_MCP_UPSTREAM_URL: "https://example.com/wechat/mcp",
    SOCIAL_MEDIA_MCP_UPSTREAM_URL: "",
    WEIBO_MCP_UPSTREAM_URL: "",
    WECHAT_MCP_UPSTREAM_URL: "",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  const report = JSON.parse(result.stdout);
  const weiboPlatform = report.platforms.find(
    (platform) => platform.id === "weibo"
  );
  const wechatPlatform = report.platforms.find(
    (platform) => platform.id === "wechat"
  );
  assert.equal(weiboPlatform.endpoint, "https://example.com/weibo/mcp");
  assert.equal(weiboPlatform.defaultEndpoint, "https://mcp.socialdatax.com/weibo/mcp");
  assert.equal(weiboPlatform.endpointOverrideActive, true);
  assert.equal(wechatPlatform.endpoint, "https://example.com/wechat/mcp");
  assert.equal(wechatPlatform.defaultEndpoint, "https://mcp.socialdatax.com/wechat/mcp");
  assert.equal(wechatPlatform.endpointOverrideActive, true);
});

test("direct content url options are not treated as upstream endpoint overrides", () => {
  const cli = readFileSync(cliPath, "utf8");

  assert.match(
    cli,
    /function resolveUpstreamUrl\(platform\) \{\n  return readFirstEnv\(platform\.upstreamEnv\) \|\| platform\.endpoint;\n\}/
  );
  assert.doesNotMatch(cli, /resolveUpstreamUrl\(platform, options\)/);
  assert.doesNotMatch(cli, /options\.url \|\| readFirstEnv\(platform\.upstreamEnv\)/);
});

test("public comments URL docs do not advertise note ID input", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const commentsSkill = readFileSync(
    join(packageDir, "skills", "media-comments", "SKILL.md"),
    "utf8"
  );
  const cli = readFileSync(cliPath, "utf8");

  assert.match(
    readme,
    /`xhs_get_note_comments_by_note_url` \| Fetch paginated first-level comments directly from a shared note URL, short link, or share text; accepts optional comment `sort_type`\./
  );
  assert.doesNotMatch(
    readme,
    /`xhs_get_note_comments_by_note_url` \|[^\n]*note ID/
  );
  assert.match(
    commentsSkill,
    /`xhs_get_note_comments_by_note_url`: use for note URLs, short links, or share text; optional `sort_type` accepts `default`, `time_descending`, or `like_count_descending`\./
  );
  assert.doesNotMatch(
    commentsSkill,
    /`xhs_get_note_comments_by_note_url`: [^\n]*note ID/
  );
  assert.match(
    cli,
    /description:\s*"Fetch paginated first-level comments from a note URL, short link, or share text\."/
  );
  assert.doesNotMatch(
    cli,
    /Fetch paginated first-level comments[^\n"]*with optional sort/
  );
});

test("douyin url-entry docs distinguish content links from playback urls", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const detailSkill = readFileSync(
    join(packageDir, "skills", "media-detail", "SKILL.md"),
    "utf8"
  );
  const commentsSkill = readFileSync(
    join(packageDir, "skills", "media-comments", "SKILL.md"),
    "utf8"
  );
  const cli = readFileSync(cliPath, "utf8");
  const openclawIndex = readFileSync(
    join(packageDir, "..", "douyin-insights-openclaw", "index.js"),
    "utf8"
  );

  assert.match(readme, /Douyin content page link, short link, or share text/);
  assert.match(detailSkill, /do not pass `video\.play_url`/);
  assert.match(commentsSkill, /do not pass `video\.play_url`/);
  assert.match(cli, /not video\.play_url/);
  assert.match(openclawIndex, /do not pass video\.play_url/);
  assert.doesNotMatch(readme, /shared video link/);
});

test("douyin comment pagination docs only expose next_page_token continuation", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const douyinWorkflows = readme
    .split("Current Douyin workflows include:", 2)[1]
    .split("## XHS Tools", 1)[0];
  const commentsSkill = readFileSync(
    join(packageDir, "skills", "media-comments", "SKILL.md"),
    "utf8"
  );
  const openclawCommentsSkill = readFileSync(
    join(
      packageDir,
      "..",
      "socialdatax-openclaw-skills",
      "socialdatax-douyin-comments",
      "SKILL.md"
    ),
    "utf8"
  );

  assert.match(
    douyinWorkflows,
    /Continue Douyin comment and reply pagination only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request\./
  );
  assert.match(
    commentsSkill,
    /For Douyin comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request\./
  );
  assert.doesNotMatch(douyinWorkflows, /has_more|total_count/);
  assert.doesNotMatch(commentsSkill, /has_more|total_count/);
  assert.doesNotMatch(openclawCommentsSkill, /has_more|total_count/);
  for (const skillText of [commentsSkill, openclawCommentsSkill]) {
    assert.match(skillText, /use `image_urls` for attached pictures/);
    assert.match(skillText, /`sticker\.static_url` is a static preview/);
    assert.match(skillText, /`sticker\.animated_url` is the animated resource/);
    assert.doesNotMatch(skillText, /video_urls/);
  }
});

test("direct CLI README examples include all public douyin actions", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  for (const example of [
    'douyin search --keyword "露营"',
    'douyin detail --aweme-id "<aweme_id>"',
    'douyin comments --aweme-id "<aweme_id>"',
    'douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>"',
    'douyin user-info --sec-user-id "<sec_user_id>"',
    'douyin user-info --profile-url "<profile_url_or_share_text>"',
    'douyin user-posts --sec-user-id "<sec_user_id>"',
    'douyin user-posts --profile-url "<profile_url_or_share_text>"',
    'douyin transcript --url "<douyin_content_url_or_share_text>"',
    'douyin transcript --aweme-id "<aweme_id>"',
    'douyin transcript --job-id "<job_id>"',
    'douyin download-media --url "<douyin_media_url>" --output-dir ./downloads',
  ]) {
    assert.match(readme, new RegExp(escapeRegExp(example)));
  }
  assert.doesNotMatch(readme, /douyin_get_comment_replies_by_comment_id/);
  assert.doesNotMatch(readme, /douyin share-link/);
  assert.doesNotMatch(readme, /douyin_get_video_share_link_by_aweme_id/);
  assert.doesNotMatch(readme, /douyin live-info/);
  assert.doesNotMatch(readme, /douyin_get_live_info_by_url/);
  assert.match(readme, /Douyin search filters use semantic values/);
  assert.match(readme, /`--sort-type`\s+supports `general`,\s+`time_descending`, and `like_count_descending`/);
  assert.match(readme, /`--publish-time-range`\s+supports\s+`all`, `day`, `week`, and `half_year`/);
  assert.match(readme, /`--duration-range`\s+supports `all`,\s+`under_1_minute`, `one_to_five_minutes`, and `over_5_minutes`/);
  assert.match(readme, /`--content-type`\s+supports `all`, `video`, and `image`/);
  assert.doesNotMatch(readme, /Douyin search filters use the same numeric values/);
});

test("direct CLI README examples include all public kuaishou actions", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  for (const example of [
    'kuaishou hot-search',
    'kuaishou search --keyword "露营"',
    'kuaishou user-search --keyword "露营"',
    'kuaishou detail --photo-id "<photo_id>"',
    'kuaishou detail --url "<kuaishou_content_url_or_share_text>"',
    'kuaishou comments --photo-id "<photo_id>"',
    'kuaishou comments --url "<kuaishou_content_url_or_share_text>"',
    'kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>"',
    'kuaishou user-info --user-id "<user_id>"',
    'kuaishou user-info --profile-url "<profile_url_or_share_text>"',
    'kuaishou user-posts --user-id "<user_id>"',
    'kuaishou user-posts --profile-url "<profile_url_or_share_text>"',
    'kuaishou transcript --url "<kuaishou_content_url_or_share_text>"',
    'kuaishou transcript --photo-id "<photo_id>"',
    'kuaishou transcript --job-id "<job_id>"',
    'kuaishou download-media --url "<kuaishou_media_url>" --output-dir ./downloads',
  ]) {
    assert.match(readme, new RegExp(escapeRegExp(example)));
  }
  assert.match(readme, /kuaishou hot-search/);
  assert.match(readme, /kuaishou_get_hot_search_list/);
  assert.match(
    readme,
    /XHS, Douyin, Kuaishou, Weibo, and WeChat Channels search use `--keyword` and optional `--page-token`/
  );
  assert.doesNotMatch(readme, /露营博主/);
  assert.match(readme, /Kuaishou search does not accept Douyin semantic filters/);
  assert.match(readme, /`kuaishou user-search` does not support `--since-days`/);
});

test("direct CLI README examples include public bilibili download", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  assert.match(
    readme,
    /bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir \.\/downloads/
  );
  assert.match(readme, /Bilibili hosted MCP endpoint: `https:\/\/mcp\.socialdatax\.com\/bilibili\/mcp`/);
  assert.match(readme, /bilibili_get_video_download_links/);
  assert.match(readme, /download-links request consumes 10 credits/);
  assert.match(readme, /Local Bilibili download merge requires `ffmpeg`/);
});

test("direct CLI README examples include public weibo and wechat actions", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  for (const example of [
    'weibo hot-search',
    'weibo search --keyword "露营"',
    'weibo detail --post-id "<post_id>"',
    'weibo detail --post-url "<weibo_post_url_or_share_text>"',
    'weibo comments --post-id "<post_id>"',
    'weibo comments --post-url "<weibo_post_url_or_share_text>"',
    'weibo replies --post-id "<post_id>" --comment-id "<comment_id>"',
    'weibo likers --post-id "<post_id>"',
    'weibo reposts --post-id "<post_id>"',
    'weibo user-info --user-id "<user_id>"',
    'weibo user-info --profile-url "<profile_url_or_share_text>"',
    'weibo user-posts --user-id "<user_id>"',
    'weibo user-posts --profile-url "<profile_url_or_share_text>"',
    'weibo transcript --post-url "<weibo_post_url_or_share_text>"',
    'weibo transcript --post-id "<post_id>"',
    'weibo transcript --job-id "<job_id>"',
    'weibo download-media --url "<weibo_media_url>" --output-dir ./downloads',
    'wechat hot-search',
    'wechat search --keyword "露营"',
    'wechat detail --encrypted-object-id "<encrypted_object_id>"',
    'wechat detail --url "<wechat_video_url_or_share_text>"',
    'wechat decrypt-media --media-url "<video.video_url>" --output video.mp4',
    'wechat article --url "<mp_article_url_or_share_text>"',
    'wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>"',
    'wechat comments --url "<wechat_video_url_or_share_text>"',
    'wechat replies --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --comment-id "<comment_id>"',
    'wechat user-info --user-id "<finder_user_id>"',
    'wechat user-posts --user-id "<finder_user_id>"',
    'wechat user-posts --url "<wechat_video_url_or_share_text>"',
    'wechat transcript --url "<wechat_video_url_or_share_text>"',
    'wechat transcript --encrypted-object-id "<encrypted_object_id>"',
    'wechat transcript --job-id "<job_id>"',
  ]) {
    assert.match(readme, new RegExp(escapeRegExp(example)));
  }
  assert.match(
    readme,
    /XHS, Douyin, Kuaishou, Weibo, and WeChat Channels search use `--keyword` and optional `--page-token`/
  );
  assert.match(readme, /WeChat Channels search filters use semantic values/);
  assert.match(readme, /wechat_get_mp_article_detail_by_url/);
  assert.match(readme, /WeChat \/ 微信 hosted MCP endpoint/);
  assert.match(readme, /WeChat Official Account skills/);
  assert.match(readme, /微信公众号 skills/);
  assert.match(readme, /Current WeChat \/ 微信 workflows include:/);
  assert.match(
    readme,
    /WeChat Official Account \/ 微信公众号 article link or share text/
  );
  assert.match(
    readme,
    /`--sort-type`\s+supports\s+`all`,\s+`time_descending`, and `collect_count_descending`/
  );
  assert.doesNotMatch(readme, /`--sort-type`\s+supports\s+`general`,\s+`latest`, and `popular`/);
});

test("direct CLI docs keep search pagination platform-specific", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const help = runCli(["--help"]);

  assert.equal(help.status, 0);
  assert.doesNotMatch(help.stdout, /--page <number>/);
  assert.match(
    help.stdout,
    /--page-token <token>\s+Continue token-paginated commands with the complete returned next_page_token/
  );
  assert.match(
    help.stdout,
    /Content link, short link, or share text for URL-based detail\/comment\/article commands/
  );
  assert.match(help.stdout, /For search, omit it on the first request/);
  assert.match(help.stdout, /weibo hot-search --pretty/);
  assert.match(help.stdout, /weibo search --keyword/);
  assert.match(help.stdout, /kuaishou hot-search --pretty/);
  assert.match(help.stdout, /bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir \.\/downloads/);
  assert.match(help.stdout, /xhs download-media --url "<xhs_media_url>" --output-dir \.\/downloads/);
  assert.match(help.stdout, /douyin download-media --url "<douyin_media_url>" --output-dir \.\/downloads/);
  assert.match(help.stdout, /kuaishou download-media --url "<kuaishou_media_url>" --output-dir \.\/downloads/);
  assert.match(help.stdout, /weibo download-media --url "<weibo_media_url>" --output-dir \.\/downloads/);
  assert.match(help.stdout, /--ffmpeg-path <path>/);
  assert.match(help.stdout, /wechat hot-search --pretty/);
  assert.match(help.stdout, /wechat search --keyword/);
  assert.match(
    help.stdout,
    /--sort-type <all\|time_descending\|collect_count_descending>/
  );
  assert.match(
    readme,
    /Search pagination uses `--page-token` when continuing with a returned `next_page_token`\./
  );
  assert.doesNotMatch(readme, /XHS search also keeps numeric `--page`/);
  assert.match(
    readme,
    /`douyin_search_videos` \| Search Douyin works by keyword with optional `page_token` continuation and filters; do not pass `page`\./
  );
  assert.match(
    readme,
    /`kuaishou_search_videos` \| Search Kuaishou works by natural-language keyword with optional `page_token` continuation; do not pass `page`\./
  );
  assert.match(
    readme,
    /`kuaishou_search_users` \| Search Kuaishou creators by keyword with optional `page_token` continuation; do not pass `page`\./
  );
  assert.doesNotMatch(readme, /douyin_search_videos` \| Search Douyin works by keyword with optional paging/);
  assert.doesNotMatch(readme, /kuaishou_search_videos` \| Search Kuaishou works by natural-language keyword with optional paging/);
});

test("direct platform subcommand help exits successfully", () => {
  const flagHelp = runCli(["wechat", "article", "--help"]);

  assert.equal(flagHelp.status, 0, flagHelp.stderr);
  assert.equal(flagHelp.stderr, "");
  assert.match(
    flagHelp.stdout,
    /wechat article --url "<mp_article_url_or_share_text>"/
  );

  const positionalHelp = runCli(["wechat", "article", "help"]);

  assert.equal(positionalHelp.status, 0, positionalHelp.stderr);
  assert.equal(positionalHelp.stderr, "");
  assert.match(
    positionalHelp.stdout,
    /wechat article --url "<mp_article_url_or_share_text>"/
  );
});

test("user skill docs describe douyin profile-url entry without legacy url wording", () => {
  for (const skillName of ["media-user-info", "media-user-posts"]) {
    const skill = readFileSync(
      join(packageDir, "skills", skillName, "SKILL.md"),
      "utf8"
    );

    assert.ok(
      extractDirectCliExamples(skill).some((example) =>
        /npx -y socialdatax-skills@latest douyin user-[a-z-]+ --profile-url/.test(
          example
        )
      )
    );
    assert.match(skill, /profile URL option/);
    assert.doesNotMatch(skill, /douyin user-[a-z-]+ --url/);
    assert.doesNotMatch(skill, /the URL option for a single command/);
    assert.doesNotMatch(
      skill,
      /douyin_get_user_(info|posted_videos)_by_url/
    );
    assert.doesNotMatch(
      skill,
      /bio or signature|liked count|favorited count|posted content count|received collect count|pin status/
    );
  }
});

test("help and search skill document the five public sort meanings", () => {
  const result = runCli(["--help"]);
  const searchSkill = readFileSync(
    join(packageDir, "skills", "media-search", "SKILL.md"),
    "utf8"
  );

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(
    result.stdout,
    /--sort-type <general\|time_descending\|like_count_descending\|comment_count_descending\|collect_count_descending>/
  );
  assert.match(result.stdout, /like_count_descending=most liked/);
  assert.match(result.stdout, /comment_count_descending=most commented/);
  assert.match(result.stdout, /collect_count_descending=most collected/);
  assert.match(result.stdout, /--note-type <all\|image\|video>/);
  assert.match(result.stdout, /--publish-time-range <all\|day\|week\|half_year>/);
  assert.match(result.stdout, /douyin search --keyword/);
  assert.match(
    result.stdout,
    /douyin user-info --profile-url "<profile_url_or_share_text>"/
  );
  assert.match(
    result.stdout,
    /douyin user-posts --profile-url "<profile_url_or_share_text>"/
  );
  assert.doesNotMatch(result.stdout, /douyin share-link/);
  assert.doesNotMatch(result.stdout, /douyin live-info/);
  assert.match(
    result.stdout,
    /douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>"/
  );
  assert.match(result.stdout, /kuaishou hot-search --pretty/);
  assert.match(result.stdout, /kuaishou search --keyword/);
  assert.match(
    result.stdout,
    /kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>"/
  );
  assert.match(
    result.stdout,
    /Kuaishou creator works tool from a profile link or share text that resolves directly to a non-empty user_id/
  );
  assert.match(result.stdout, /--photo-id <photo_id>/);
  assert.match(
    result.stdout,
    /--sort-type <general\|time_descending\|like_count_descending>/
  );
  assert.match(
    result.stdout,
    /--sort-type <all\|time_descending\|collect_count_descending>/
  );
  assert.match(
    result.stdout,
    /--duration-range <all\|under_1_minute\|one_to_five_minutes\|over_5_minutes>/
  );
  assert.match(result.stdout, /--content-type <all\|video\|image>/);
  assert.doesNotMatch(result.stdout, /--publish-time <number>/);
  assert.doesNotMatch(result.stdout, /--filter-duration <value>/);
  assert.doesNotMatch(result.stdout, /--content-type <number>/);
  assert.doesNotMatch(result.stdout, /0 general, 2 latest, 1 most liked/);

  assert.match(searchSkill, /`like_count_descending`: most liked first\./);
  assert.match(searchSkill, /`comment_count_descending`: most commented first\./);
  assert.match(searchSkill, /`collect_count_descending`: most collected first\./);
  assert.match(searchSkill, /`image`: image\/text notes\./);
  assert.match(searchSkill, /`half_year`: published within half a year\./);
  assert.match(searchSkill, /`note_type`: optional search filter/);
  assert.match(searchSkill, /`publish_time_range`: optional search filter/);
  assert.match(searchSkill, /`douyin_search_videos`/);
  assert.match(searchSkill, /`like_count_descending`: most liked first\./);
  assert.match(searchSkill, /`week`: published within one week\./);
  assert.match(searchSkill, /`all`: no sort restriction\./);
  assert.match(searchSkill, /`collect_count_descending`: hottest first \/ most collected first\./);
  assert.doesNotMatch(searchSkill, /one of `general`, `latest`, `popular`/);
  assert.match(searchSkill, /`one_to_five_minutes`: 1-5 minutes\./);
  assert.match(searchSkill, /`image`: image\/text posts\./);
  assert.match(searchSkill, /omit it for the default sort/);
  assert.match(searchSkill, /omit it for no publish-time filter/);
  assert.match(searchSkill, /omit it for no duration filter/);
  assert.match(searchSkill, /omit it for all content types/);
  assert.doesNotMatch(searchSkill, /Douyin `--sort-type <number>`/);
  assert.doesNotMatch(searchSkill, /`filter_duration`: optional duration filter/);
  assert.doesNotMatch(searchSkill, /`publish_time`: optional numeric publish-time filter/);
  assert.doesNotMatch(searchSkill, /hot-search|热榜|热搜/);
});

test("search skill tells agents not to pass page to douyin or kuaishou MCP search", () => {
  const searchSkill = readFileSync(
    join(packageDir, "skills", "media-search", "SKILL.md"),
    "utf8"
  );
  const douyinSection = searchSkill.split("For Douyin, call `douyin_search_videos` with:", 2)[1]
    .split("For Kuaishou, call `kuaishou_search_videos` with:", 1)[0];

  assert.match(
    douyinSection,
    /Do not pass `page` to `douyin_search_videos`; omit `page_token` on the first request\./
  );
  assert.match(douyinSection, /- `page_token`: optional opaque pagination token/);
  assert.doesNotMatch(douyinSection, /- `page`: optional/);
  assert.match(
    searchSkill,
    /Do not pass `page` to `kuaishou_search_videos`; omit `page_token` on the first request\./
  );
});

test("install dry-run previews one skill without writing files", () => {
  const destination = join(
    tmpdir(),
    `smi-test-dry-run-one-${Date.now()}-${process.pid}`
  );
  const result = runCli([
    "install",
    "media-search",
    "--target",
    "openclaw",
    "--path",
    destination,
    "--dry-run",
  ]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /Dry run: would install 1 skill for openclaw/);
  assert.match(result.stdout, /No files were written/);
  assert.match(result.stdout, /No MCP server configuration would be changed/);
  assert.equal(spawnSync("test", ["-e", destination]).status, 1);
});

test("install dry-run previews all skills under custom parent", () => {
  const destination = join(
    tmpdir(),
    `smi-test-dry-run-all-${Date.now()}-${process.pid}`
  );
  const result = runCli([
    "install",
    "--target",
    "openclaw",
    "--path",
    destination,
    "--dry-run",
  ]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /Dry run: would install 8 skills for openclaw/);
  assert.match(result.stdout, /media-search/);
  assert.match(result.stdout, /media-transcript/);
  assert.match(result.stdout, /media-user-posts/);
  assert.match(result.stdout, /sensitive-check/);
  assert.match(result.stdout, /socialdatax-content-research-assistant/);
  assert.equal(spawnSync("test", ["-e", destination]).status, 1);
});

test("install success keeps source attribution automatic without extra user setup", () => {
  const parent = mkdtempSync(join(tmpdir(), "smi-test-install-one-"));
  const destination = join(parent, "media-search");

  try {
    const result = runCli([
      "install",
      "media-search",
      "--target",
      "openclaw",
      "--path",
      destination,
    ]);

    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /Installed 1 skill for openclaw/);
    assert.match(result.stdout, /No API key was stored by this installer/);
    assert.match(result.stdout, /Configure your API Key before making authenticated calls/);
    assert.match(
      result.stdout,
      /Direct CLI examples in installed SKILL\.md files already include source attribution for agents/
    );
    assert.match(result.stdout, /No extra source attribution setup is required/);
    assert.doesNotMatch(result.stdout, /SOCIALDATAX_SOURCE_CLIENT/);
    assert.doesNotMatch(result.stdout, /SOCIALDATAX_SOURCE_PLATFORM/);
    assert.doesNotMatch(result.stdout, /SOCIALDATAX_SOURCE_SKILL/);
    assert.doesNotMatch(result.stdout, /--source-client/);
    assert.doesNotMatch(result.stdout, /npx -y socialdatax-skills@latest xhs search/);
    assert.doesNotMatch(result.stdout, /Direct CLI examples:/);
    const installedSkill = readFileSync(join(destination, "SKILL.md"), "utf8");
    assert.match(installedSkill, /name:\s*"media-search"/);
    assert.match(
      installedSkill,
      /--source-client socialdatax-skills --source-platform npm --source-skill media-search/
    );
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("list output documents aggregate skill and Douyin creator series", () => {
  const result = runCli(["list"]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /socialdatax-content-research-assistant/);
  assert.match(result.stdout, /cross-platform content research/);
  assert.match(result.stdout, /WeChat Official Account articles/);
  assert.match(result.stdout, /media-transcript/);
  assert.match(result.stdout, /speech-to-text transcript jobs/);
  assert.match(result.stdout, /media-user-posts/);
  assert.match(result.stdout, /Douyin creator short-drama series/);
  assert.match(result.stdout, /Kuaishou/);
});

test("install dry-run reports existing destination without force", () => {
  const destination = mkdtempSync(join(tmpdir(), "smi-test-existing-"));
  try {
    const result = runCli([
      "install",
      "media-search",
      "--target",
      "openclaw",
      "--path",
      destination,
      "--dry-run",
    ]);

    assertCliError(
      result,
      "Skill already exists at .*\\. Re-run with --force to replace it\\."
    );
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
});

test("install dry-run with force previews replacement without writing files", () => {
  const destination = mkdtempSync(join(tmpdir(), "smi-test-replace-"));
  const nestedDir = join(destination, "untouched");
  mkdirSync(nestedDir);
  writeFileSync(
    join(destination, "SKILL.md"),
    "---\nname: media-search\n---\n\n# Existing\n"
  );

  try {
    const result = runCli([
      "install",
      "media-search",
      "--target",
      "openclaw",
      "--path",
      destination,
      "--dry-run",
      "--force",
    ]);

    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /\(would replace\)/);
    assert.equal(spawnSync("test", ["-d", nestedDir]).status, 0);
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
});

test("top-level platform command is no longer supported", () => {
  const result = runCli(["--platform", "xhs"]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /\] --platform is no longer supported by this skills package\./);
  assert.match(result.stderr, /mcp-remote/);
  assert.match(result.stderr, /com\.52choujiang\/xhs-insights/);
  assert.match(result.stderr, /com\.52choujiang\/douyin-insights/);
});

test("top-level inline platform command is no longer supported", () => {
  const result = runCli(["--platform=xhs"]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /\] --platform=xhs is no longer supported by this skills package\./);
  assert.match(result.stderr, /mcp-remote/);
  assert.match(result.stderr, /com\.52choujiang\/xhs-insights/);
  assert.match(result.stderr, /com\.52choujiang\/douyin-insights/);
});

test("print-config is no longer supported by the skills package", () => {
  const result = runCli(["print-config", "--platform", "xhs"]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /\] print-config is no longer supported by this skills package\./);
  assert.match(result.stderr, /hosted streamable HTTP/);
  assert.match(result.stderr, /mcp-remote/);
  assert.doesNotMatch(result.stdout, /streamable_http/);
});
