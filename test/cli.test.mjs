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
  delete env.SOCIAL_MEDIA_MCP_UPSTREAM_URL;
  delete env.XHS_MCP_API_KEY;
  delete env.XHS_MCP_UPSTREAM_URL;
  delete env.DOUYIN_MCP_UPSTREAM_URL;

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

async function runCliWithMockMcp(args, extraEnv = {}) {
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
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: payload.id,
            result: {
              content: [],
              structuredContent: { ok: true },
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
    assert.match(result.stdout, /douyin hot-search --pretty/);
    assert.match(result.stdout, /douyin user-series --profile-url/);
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

  assert.match(skill, /name: socialdatax-content-research-assistant/);
  assert.match(skill, /SOCIALDATAX_API_KEY/);
  assert.match(skill, /https:\/\/socialdatax\.com/);
  assert.match(skill, /npx -y socialdatax-skills@latest xhs search/);
  assert.match(skill, /npx -y socialdatax-skills@latest douyin search/);
  assert.match(skill, /npx -y socialdatax-skills@latest douyin hot-search/);
  assert.match(skill, /Xiaohongshu|小红书/);
  assert.match(skill, /Douyin|抖音/);
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

  assert.equal(packageJson.version, "0.2.4");
  assert.equal(pluginManifest.version, "0.2.4");
  assert.match(pluginSource, /const PLUGIN_VERSION = "0\.2\.4";/);
  assert.match(readme, /Version: `0\.2\.4`/);
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
  assert.match(pluginSource, /Douyin 抖音 Content Insights MCP/);
  assert.match(pluginSource, /Search Douyin works by keyword/);
  assert.match(pluginSource, /structured work details/);
  assert.match(pluginSource, /video and image\/text works/);
  assert.doesNotMatch(pluginSource, /short video research/);
  assert.doesNotMatch(JSON.stringify(pluginManifest), /short video research/);
  assert.doesNotMatch(readme, /short video research/);
  assert.match(pluginSource, /Creator Works/);
  assert.match(JSON.stringify(pluginManifest), /Content Insights MCP/);
  assert.match(JSON.stringify(pluginManifest), /search video and image\/text works/);
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

  assert.equal(packageJson.version, "0.1.12");
  assert.equal(pluginManifest.version, "0.1.12");
  assert.match(pluginSource, /const PLUGIN_VERSION = "0\.1\.12";/);
  assert.match(readme, /Version: `0\.1\.12`/);

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

test("doctor prints human-readable safety summary", () => {
  const result = runCli(["doctor"]);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /socialdatax-skills doctor/);
  assert.match(result.stdout, /Package: socialdatax-skills@0\.2\.3/);
  assert.match(result.stdout, /Website: https:\/\/socialdatax\.com/);
  assert.doesNotMatch(result.stdout, /Source: https:\/\/socialdatax\.com/);
  assert.match(result.stdout, /npm lifecycle scripts: none declared by this package/);
  assert.match(result.stdout, /install does not store API keys/);
  assert.match(result.stdout, /XHS \/ Xiaohongshu \/ RedNote/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/xhs\/mcp/);
  assert.match(result.stdout, /Douyin \/ 抖音/);
  assert.match(result.stdout, /endpoint: https:\/\/mcp\.52choujiang\.com\/douyin\/mcp/);
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
  assert.equal(report.package.version, "0.2.3");
  assert.equal(report.package.homepage, "https://socialdatax.com");
  assert.equal(report.package.repository, undefined);
  assert.deepEqual(report.package.npmLifecycleScripts, []);
  assert.equal(report.install.apiKeyStored, false);
  assert.equal(report.install.mcpConfigChanged, false);
  assert.equal(report.security.readOnly, true);
  assert.equal(report.security.readsLocalBrowserData, false);
  assert.equal(report.security.readsBrowserCookies, undefined);
  assert.equal(report.security.readsLocalAccountSession, undefined);
  assert.equal(report.platforms.length, 2);
  assert.equal(report.platform.endpointOverrideActive, false);
  assert.equal(report.platform.registryName, "com.52choujiang/xhs-insights");
  assert.equal(report.platform.futureRegistryName, "com.socialdatax/xhs-insights");
  assert.equal(report.platform.legacyRegistryName, undefined);
  assert.equal(report.platform.defaultEndpoint, "https://mcp.52choujiang.com/xhs/mcp");
  assert.equal(report.platform.tools.length, 10);
  assert.ok(report.platform.tools.includes("xhs_get_note_sub_comments_by_comment_id"));
  const douyinPlatform = report.platforms.find(
    (platform) => platform.id === "douyin"
  );
  assert.equal(douyinPlatform.registryName, "com.52choujiang/douyin-insights");
  assert.equal(douyinPlatform.futureRegistryName, "com.socialdatax/douyin-insights");
  assert.equal(douyinPlatform.legacyRegistryName, undefined);
  assert.equal(douyinPlatform.defaultEndpoint, "https://mcp.52choujiang.com/douyin/mcp");
  assert.equal(douyinPlatform.tools.length, 13);
  assert.ok(douyinPlatform.tools.includes("douyin_get_hot_search_list"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_video_comment_replies_by_comment_id"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_user_series_by_sec_user_id"));
  assert.ok(douyinPlatform.tools.includes("douyin_get_user_series_by_profile_url"));
  assert.ok(!douyinPlatform.tools.includes("douyin_get_comment_replies_by_comment_id"));
  assert.ok(!douyinPlatform.tools.includes("douyin_get_video_share_link_by_aweme_id"));
  assert.ok(!douyinPlatform.tools.includes("douyin_get_live_info_by_url"));
  const detailByUrlTool = report.platform.toolDetails.find(
    (tool) => tool.name === "xhs_get_note_detail_by_note_url"
  );
  const commentsByUrlTool = report.platform.toolDetails.find(
    (tool) => tool.name === "xhs_get_note_comments_by_note_url"
  );
  assert.match(detailByUrlTool.description, /short link, share text, or note ID/);
  assert.match(commentsByUrlTool.description, /note URL, short link, or share text/);
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
  assert.doesNotMatch(searchSkill, /hot|热度/);
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
  assert.match(result.stdout, /Dry run: would install 6 skills for openclaw/);
  assert.match(result.stdout, /media-search/);
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
  assert.match(result.stdout, /media-user-posts/);
  assert.match(result.stdout, /Douyin creator short-drama series/);
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
