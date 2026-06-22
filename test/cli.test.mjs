import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(packageDir, "cli.mjs");
const removedDouyinApiKeyEnv = ["DOUYIN", "MCP", "API", "KEY"].join("_");

function runCli(args) {
  const env = { ...process.env };
  delete env.SOCIALDATAX_API_KEY;
  delete env.SOCIAL_MEDIA_MCP_API_KEY;
  delete env.SOCIAL_MEDIA_XHS_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_DOUYIN_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_KUAISHOU_MCP_UPSTREAM_URL;
  delete env.SOCIAL_MEDIA_MCP_UPSTREAM_URL;
  delete env.XHS_MCP_API_KEY;
  delete env.XHS_MCP_UPSTREAM_URL;
  delete env.DOUYIN_MCP_UPSTREAM_URL;
  delete env.KUAISHOU_MCP_UPSTREAM_URL;

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

async function runCliWithMockMcp(args, extraEnv = {}, structuredContentForToolCall) {
  const toolCalls = [];
  const toolCallAuthorizationHeaders = [];
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
      SOCIAL_MEDIA_WEIBO_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      SOCIAL_MEDIA_WECHAT_MCP_UPSTREAM_URL: `http://127.0.0.1:${address.port}/mcp`,
      ...extraEnv,
    });
    return { result, toolCalls, toolCallAuthorizationHeaders };
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
  ]) {
    assert.ok(
      packageJson.keywords.includes(keyword),
      `package keywords should include ${keyword}`
    );
  }
  assert.match(readme, /media transcript skill/);
  assert.match(readme, /speech-to-text transcript skill/);
  assert.match(readme, /口播转文字 skill/);
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
    assert.match(result.stdout, /douyin hot-search --pretty/);
    assert.match(result.stdout, /douyin user-series --profile-url/);
    assert.match(result.stdout, /kuaishou hot-search --pretty/);
    assert.match(result.stdout, /kuaishou search --keyword/);
    assert.match(result.stdout, /kuaishou user-info --profile-url/);
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

  assert.match(skill, /douyin user-series --sec-user-id/);
  assert.match(skill, /douyin user-series --profile-url/);
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
  assert.match(skill, /https:\/\/socialdatax\.52choujiang\.com/);
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

test("xhs detail rejects page because it is not a detail option", () => {
  const result = runCli(["xhs", "detail", "--note-id", "a", "--page", "2"]);

  assertCliError(result, "Unsupported option --page\\.");
});

test("xhs search rejects malformed page before checking the API key", () => {
  const result = runCli([
    "xhs",
    "search",
    "--keyword",
    "foo",
    "--page",
    "1abc",
  ]);

  assertCliError(
    result,
    "--page must be an integer greater than or equal to 1\\."
  );
});

test("xhs search with valid page reaches the missing API key error", () => {
  const result = runCli(["xhs", "search", "--keyword", "foo", "--page", "1"]);

  assertCliError(
    result,
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("xhs search keeps sort and filter options omitted unless explicitly provided", () => {
  const cli = readFileSync(cliPath, "utf8");

  assert.match(
    cli,
    /const sortType = parseSemanticOption\(\n    options\.sortType \|\| "general",\n    "--sort-type",\n    XHS_SEARCH_SORT_TYPES,\n    XHS_LEGACY_SEARCH_SORT_TYPE_ALIASES,\n    XHS_SEARCH_SORT_TYPES\.join\(", "\)\n  \);/
  );
  assert.match(
    cli,
    /if \(options\.noteType !== undefined\) \{\n    toolArguments\.note_type = noteType;\n  \}/
  );
  assert.match(
    cli,
    /if \(options\.publishTimeRange !== undefined\) \{\n    toolArguments\.publish_time_range = publishTimeRange;\n  \}/
  );
  assert.doesNotMatch(cli, /sort_type: sortType/);
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
        page: 1,
        sort_type: "like_count_descending",
      },
    },
  ]);
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

  assert.equal(packageJson.version, "0.2.7");
  assert.equal(pluginManifest.version, "0.2.7");
  assert.match(pluginSource, /const PLUGIN_VERSION = "0\.2\.7";/);
  assert.match(readme, /Version: `0\.2\.7`/);
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
    /sends the key only to the fixed endpoint `https:\/\/mcp\.52choujiang\.com\/douyin\/mcp`/
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
  assert.match(pluginSource, /previous non-empty next_page_token to continue/);
  assert.match(pluginSource, /Empty next_page_token means there is no next page/);
  assert.match(pluginSource, /Do not parse, modify, or reuse tokens across pagination chains/);
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

  assert.equal(packageJson.version, "0.1.17");
  assert.equal(pluginManifest.version, "0.1.17");
  assert.match(pluginSource, /const PLUGIN_VERSION = "0\.1\.17";/);
  assert.match(readme, /Version: `0\.1\.17`/);

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
  assert.match(
    pluginSource,
    /time_descending \(latest published first\), like_count_descending \(most liked first\), comment_count_descending \(most commented first\), or collect_count_descending \(most collected first\)/
  );
  assert.doesNotMatch(
    pluginSource,
    /popularity_descending|comment_descending|collect_descending/
  );
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

  assertCliError(result, 'Unsupported Douyin command "share-link"\\. Use hot-search, search, detail, comments, replies, user-info, user-posts, user-series\\.');
});

test("douyin live-info is not a public direct CLI command", () => {
  const result = runCli([
    "douyin",
    "live-info",
    "--url",
    "https://live.douyin.com/test",
  ]);

  assertCliError(result, 'Unsupported Douyin command "live-info"\\. Use hot-search, search, detail, comments, replies, user-info, user-posts, user-series\\.');
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
    "latest",
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
      sort_type: "latest",
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
    runCli(["weibo", "search", "--keyword", "foo"]),
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
  assertCliError(
    runCli(["wechat", "search", "--keyword", "foo"]),
    "Missing API Key\\. Set SOCIALDATAX_API_KEY before running direct CLI calls\\."
  );
});

test("xhs search pages follow returned next_page and aggregate items", async () => {
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
            next_page: 2,
          }
        : {
            items: [{ note_id: "note-2" }],
            next_page: null,
          };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(toolCalls.map((call) => call.arguments), [
    { keyword: "露营", page: 1 },
    { keyword: "露营", page: 2 },
  ]);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.data.items, [
    { note_id: "note-1" },
    { note_id: "note-2" },
  ]);
  assert.equal(payload.data.page_count, 2);
  assert.equal(payload.data.item_count, 2);
  assert.equal(payload.data.next_page, null);
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
            next_page: 2,
          }
        : {
            items: [
              { note_id: "note-1", title: "first duplicate" },
              { note_id: "note-3", title: "third" },
            ],
            next_page: null,
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
            next_page: 2,
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
            next_page: null,
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
            next_page: 2,
          }
        : {
            items: [
              {
                note_id: "note-b",
                author: { user_id: "author-1" },
                publish_time: 1700000000,
              },
            ],
            next_page: null,
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
          next_page: 2,
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
          next_page: 3,
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
        next_page: null,
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

test("xhs search paginated output treats empty next_page as complete", async () => {
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
        next_page: "",
      };
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.data.next_page, null);
});

test("comments include replies builds a nested comment tree", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "douyin",
      "comments",
      "--aweme-id",
      "aweme-1",
      "--include-replies",
      "--pretty",
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
      "--pages",
      "2",
    ],
    {},
    () => ({
      items: [{ note_id: "note-1" }],
      next_page: 1,
    })
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Pagination stopped because next_page repeated\./);
  assert.equal(toolCalls.length, 1);
});

test("paginated commands do not reject repeated next marker when page limit is reached", async () => {
  const { result, toolCalls } = await runCliWithMockMcp(
    [
      "xhs",
      "search",
      "--keyword",
      "露营",
      "--pages",
      "1",
    ],
    {},
    () => ({
      items: [{ note_id: "note-1" }],
      next_page: 1,
    })
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(toolCalls.length, 1);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.data.next_page, null);
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
  assert.match(result.stdout, /Package: socialdatax-skills@0\.2\.10/);
  assert.match(result.stdout, /Website: https:\/\/socialdatax\.52choujiang\.com/);
  assert.doesNotMatch(result.stdout, /Source: https:\/\/socialdatax\.52choujiang\.com/);
  assert.match(result.stdout, /npm lifecycle scripts: none declared by this package/);
  assert.match(result.stdout, /install does not store API keys/);
  assert.match(result.stdout, /social media content intelligence workflows/);
  assert.doesNotMatch(result.stdout, /read-only social media intelligence workflows/);
  assert.match(result.stdout, /XHS \/ Xiaohongshu \/ RedNote/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/xhs\/mcp/);
  assert.match(result.stdout, /Douyin \/ 抖音/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/douyin\/mcp/);
  assert.match(result.stdout, /Kuaishou \/ 快手 \/ Kwai/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/kuaishou\/mcp/);
  assert.match(result.stdout, /Weibo \/ 微博/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/weibo\/mcp/);
  assert.match(result.stdout, /WeChat Channels \/ 视频号/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/wechat\/mcp/);
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
  assert.equal(report.package.version, "0.2.10");
  assert.equal(report.package.homepage, "https://socialdatax.52choujiang.com");
  assert.equal(report.package.repository, undefined);
  assert.deepEqual(report.package.npmLifecycleScripts, []);
  assert.equal(report.install.apiKeyStored, false);
  assert.equal(report.install.mcpConfigChanged, false);
  assert.equal(report.security.readOnly, false);
  assert.equal(report.security.directCliReadOnly, true);
  assert.equal(report.security.platformMcpMaySubmitAnalysisJobs, true);
  assert.equal(report.security.accountActions, false);
  assert.equal(report.security.readsLocalBrowserData, false);
  assert.equal(report.security.readsBrowserCookies, undefined);
  assert.equal(report.security.readsLocalAccountSession, undefined);
  assert.equal(report.platforms.length, 5);
  assert.equal(report.platform.endpointOverrideActive, false);
  assert.equal(report.platform.registryName, "com.52choujiang/xhs-insights");
  assert.equal(report.platform.futureRegistryName, "com.socialdatax/xhs-insights");
  assert.equal(report.platform.legacyRegistryName, undefined);
  assert.equal(report.platform.defaultEndpoint, "https://mcp.52choujiang.com/xhs/mcp");
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
  assert.equal(douyinPlatform.defaultEndpoint, "https://mcp.52choujiang.com/douyin/mcp");
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
  assert.equal(kuaishouPlatform.defaultEndpoint, "https://mcp.52choujiang.com/kuaishou/mcp");
  assert.equal(kuaishouPlatform.tools.length, 14);
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_get_hot_search_list"));
  assert.ok(kuaishouPlatform.tools.includes("kuaishou_search_videos"));
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
  const weiboPlatform = report.platforms.find(
    (platform) => platform.id === "weibo"
  );
  assert.equal(weiboPlatform.registryName, "com.52choujiang/weibo-insights");
  assert.equal(weiboPlatform.futureRegistryName, "com.socialdatax/weibo-insights");
  assert.equal(weiboPlatform.defaultEndpoint, "https://mcp.52choujiang.com/weibo/mcp");
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
  assert.equal(wechatPlatform.registryName, "com.52choujiang/wechat-channels-insights");
  assert.equal(wechatPlatform.futureRegistryName, "com.socialdatax/wechat-channels-insights");
  assert.equal(wechatPlatform.defaultEndpoint, "https://mcp.52choujiang.com/wechat/mcp");
  assert.equal(wechatPlatform.tools.length, 13);
  assert.ok(wechatPlatform.tools.includes("wechat_get_hot_search_list"));
  assert.ok(wechatPlatform.tools.includes("wechat_search_videos"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_video_comment_replies_by_comment_id"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_user_posted_videos_by_url"));
  assert.ok(wechatPlatform.tools.includes("wechat_submit_video_speech_text_by_video_url"));
  assert.ok(wechatPlatform.tools.includes("wechat_submit_video_speech_text_by_encrypted_object_id"));
  assert.ok(wechatPlatform.tools.includes("wechat_get_video_speech_text_job"));
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
  const douyinSubmitTranscriptTool = douyinPlatform.toolDetails.find(
    (tool) => tool.name === "douyin_submit_video_speech_text_by_aweme_id"
  );
  const kuaishouSubmitTranscriptTool = kuaishouPlatform.toolDetails.find(
    (tool) => tool.name === "kuaishou_submit_video_speech_text_by_photo_id"
  );
  const weiboSubmitTranscriptTool = weiboPlatform.toolDetails.find(
    (tool) => tool.name === "weibo_submit_video_speech_text_by_post_id"
  );
  const wechatSubmitTranscriptTool = wechatPlatform.toolDetails.find(
    (tool) => tool.name === "wechat_submit_video_speech_text_by_encrypted_object_id"
  );
  assert.match(xhsSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(xhsSubmitTranscriptTool.description, /提交完成后最多短等 15 秒/);
  assert.match(douyinSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(douyinSubmitTranscriptTool.description, /提交完成后最多短等 15 秒/);
  assert.match(kuaishouSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(kuaishouSubmitTranscriptTool.description, /提交完成后最多短等 15 秒/);
  assert.match(weiboSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(weiboSubmitTranscriptTool.description, /提交完成后最多短等 15 秒/);
  assert.match(wechatSubmitTranscriptTool.description, /speech-to-text transcript/);
  assert.match(wechatSubmitTranscriptTool.description, /提交完成后最多短等 15 秒/);
  assert.doesNotMatch(result.stdout, /69cf45899948d391e7b5e879/);
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
  assert.equal(report.platform.defaultEndpoint, "https://mcp.52choujiang.com/xhs/mcp");
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
  assert.equal(douyinPlatform.defaultEndpoint, "https://mcp.52choujiang.com/douyin/mcp");
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
  assert.equal(kuaishouPlatform.defaultEndpoint, "https://mcp.52choujiang.com/kuaishou/mcp");
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
  assert.equal(weiboPlatform.defaultEndpoint, "https://mcp.52choujiang.com/weibo/mcp");
  assert.equal(weiboPlatform.endpointOverrideActive, true);
  assert.equal(wechatPlatform.endpoint, "https://example.com/wechat/mcp");
  assert.equal(wechatPlatform.defaultEndpoint, "https://mcp.52choujiang.com/wechat/mcp");
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
    /`xhs_get_note_comments_by_note_url` \| Fetch paginated first-level comments directly from a shared note URL, short link, or share text\./
  );
  assert.doesNotMatch(
    readme,
    /`xhs_get_note_comments_by_note_url` \|[^\n]*note ID/
  );
  assert.match(
    commentsSkill,
    /`xhs_get_note_comments_by_note_url`: use for note URLs, short links, or share text\./
  );
  assert.doesNotMatch(
    commentsSkill,
    /`xhs_get_note_comments_by_note_url`: [^\n]*note ID/
  );
  assert.match(
    cli,
    /description:\s*"Fetch paginated first-level comments from a note URL, short link, or share text\."/
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
    'douyin search --keyword "露营桌"',
    'douyin detail --aweme-id "<aweme_id>"',
    'douyin comments --aweme-id "<aweme_id>"',
    'douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>"',
    'douyin user-info --sec-user-id "<sec_user_id>"',
    'douyin user-info --profile-url "<profile_url_or_share_text>"',
    'douyin user-posts --sec-user-id "<sec_user_id>"',
    'douyin user-posts --profile-url "<profile_url_or_share_text>"',
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
    'kuaishou search --keyword "露营桌"',
    'kuaishou detail --photo-id "<photo_id>"',
    'kuaishou detail --url "<kuaishou_content_url_or_share_text>"',
    'kuaishou comments --photo-id "<photo_id>"',
    'kuaishou comments --url "<kuaishou_content_url_or_share_text>"',
    'kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>"',
    'kuaishou user-info --user-id "<user_id>"',
    'kuaishou user-info --profile-url "<profile_url_or_share_text>"',
    'kuaishou user-posts --user-id "<user_id>"',
    'kuaishou user-posts --profile-url "<profile_url_or_share_text>"',
  ]) {
    assert.match(readme, new RegExp(escapeRegExp(example)));
  }
  assert.match(readme, /Kuaishou search uses `--keyword` and optional `--page-token`/);
});

test("direct CLI README examples include public weibo and wechat actions", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");

  for (const example of [
    'weibo hot-search',
    'weibo search --keyword "露营桌"',
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
    'wechat hot-search',
    'wechat search --keyword "露营桌"',
    'wechat detail --encrypted-object-id "<encrypted_object_id>"',
    'wechat detail --url "<wechat_video_url_or_share_text>"',
    'wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>"',
    'wechat comments --url "<wechat_video_url_or_share_text>"',
    'wechat replies --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --comment-id "<comment_id>"',
    'wechat user-info --user-id "<finder_user_id>"',
    'wechat user-posts --user-id "<finder_user_id>"',
    'wechat user-posts --url "<wechat_video_url_or_share_text>"',
  ]) {
    assert.match(readme, new RegExp(escapeRegExp(example)));
  }
  assert.match(readme, /Weibo and WeChat Channels search use `--keyword` and optional `--page-token`/);
  assert.match(readme, /WeChat Channels search filters use semantic values/);
});

test("direct CLI docs keep search pagination platform-specific", () => {
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  const help = runCli(["--help"]);

  assert.equal(help.status, 0);
  assert.match(help.stdout, /--page <number>\s+XHS search only/);
  assert.match(
    help.stdout,
    /--page-token <token>\s+Continue token-paginated commands with the complete returned next_page_token/
  );
  assert.match(help.stdout, /For Douyin, Kuaishou, Weibo, and WeChat Channels search, omit it on the first request/);
  assert.match(help.stdout, /weibo hot-search --pretty/);
  assert.match(help.stdout, /weibo search --keyword/);
  assert.match(help.stdout, /wechat hot-search --pretty/);
  assert.match(help.stdout, /wechat search --keyword/);
  assert.match(
    readme,
    /XHS search uses numeric `--page`; Douyin, Kuaishou, Weibo, and WeChat Channels search do not accept `--page`\./
  );
  assert.match(
    readme,
    /`douyin_search_videos` \| Search Douyin works by keyword with optional `page_token` continuation and filters; do not pass `page`\./
  );
  assert.match(
    readme,
    /`kuaishou_search_videos` \| Search Kuaishou works by natural-language keyword with optional `page_token` continuation; do not pass `page`\./
  );
  assert.doesNotMatch(readme, /douyin_search_videos` \| Search Douyin works by keyword with optional paging/);
  assert.doesNotMatch(readme, /kuaishou_search_videos` \| Search Kuaishou works by natural-language keyword with optional paging/);
});

test("user skill docs describe douyin profile-url entry without legacy url wording", () => {
  for (const skillName of ["media-user-info", "media-user-posts"]) {
    const skill = readFileSync(
      join(packageDir, "skills", skillName, "SKILL.md"),
      "utf8"
    );

    assert.match(skill, /douyin user-[a-z-]+ --profile-url/);
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
  assert.match(result.stdout, /--photo-id <photo_id>/);
  assert.match(
    result.stdout,
    /--sort-type <general\|time_descending\|like_count_descending>/
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
  assert.match(result.stdout, /Dry run: would install 7 skills for openclaw/);
  assert.match(result.stdout, /media-search/);
  assert.match(result.stdout, /media-transcript/);
  assert.match(result.stdout, /media-user-posts/);
  assert.match(result.stdout, /socialdatax-content-research-assistant/);
  assert.equal(spawnSync("test", ["-e", destination]).status, 1);
});

test("list output documents aggregate skill and Douyin creator series", () => {
  const result = runCli(["list"]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /socialdatax-content-research-assistant/);
  assert.match(result.stdout, /cross-platform content research/);
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
