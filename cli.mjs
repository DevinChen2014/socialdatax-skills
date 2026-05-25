#!/usr/bin/env node

import { existsSync, realpathSync } from "node:fs";
import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "socialdatax-skills";
const PACKAGE_VERSION = "0.2.3";
const PACKAGE_SPEC = `${PACKAGE_NAME}@latest`;
const LOG_PREFIX = `[${PACKAGE_NAME}]`;
const MIN_NODE_VERSION = "20.18.1";
const HOMEPAGE_URL = "https://socialdatax.com";
const PRIMARY_API_KEY_ENV = "SOCIALDATAX_API_KEY";
const LEGACY_API_KEY_ENV = "SOCIAL_MEDIA_MCP_API_KEY";
const API_KEY_ENV_NAMES = [PRIMARY_API_KEY_ENV, LEGACY_API_KEY_ENV];
const AVAILABLE_SKILLS = [
  {
    name: "socialdatax-content-research-assistant",
    summary:
      "Coordinate cross-platform content research across XHS and Douyin.",
    emoji: "🔎",
  },
  {
    name: "media-search",
    summary: "Search XHS notes and Douyin works by keyword with optional filters.",
    emoji: "🔍",
  },
  {
    name: "media-detail",
    summary: "Read structured content details and metrics for XHS and Douyin.",
    emoji: "📄",
  },
  {
    name: "media-comments",
    summary: "Fetch and analyze XHS comments/replies and Douyin comments/replies.",
    emoji: "💬",
  },
  {
    name: "media-user-info",
    summary: "Retrieve creator profile information for XHS and Douyin.",
    emoji: "👤",
  },
  {
    name: "media-user-posts",
    summary:
      "Retrieve creator content lists for XHS and Douyin, including Douyin creator short-drama series.",
    emoji: "🗂️",
  },
];
const AVAILABLE_SKILL_NAMES = AVAILABLE_SKILLS.map((skill) => skill.name);
const BOOLEAN_OPTIONS = new Set(["dryRun", "force", "json", "pretty"]);
const INSTALL_TARGETS = ["openclaw", "hermes", "agents", "codex", "claude-code", "claude"];
const VALID_SCOPES = ["user", "workspace", "shared"];
const XHS_DIRECT_ACTION_OPTIONS = {
  search: ["keyword", "page", "sortType", "noteType", "publishTimeRange", "pretty"],
  detail: ["noteId", "url", "pretty"],
  comments: ["noteId", "url", "pageToken", "pretty"],
  "sub-comments": ["noteId", "commentId", "pageToken", "pretty"],
  "user-info": ["userId", "profileUrl", "pretty"],
  "user-posts": ["userId", "profileUrl", "pageToken", "pretty"],
};
const XHS_OPTION_DISPLAY_NAMES = {
  keyword: "--keyword",
  page: "--page",
  sortType: "--sort-type",
  noteType: "--note-type",
  publishTimeRange: "--publish-time-range",
  url: "--url",
  noteId: "--note-id",
  commentId: "--comment-id",
  pageToken: "--page-token",
  profileUrl: "--profile-url",
  userId: "--user-id",
};
const XHS_SEARCH_SORT_TYPES = [
  "general",
  "time_descending",
  "like_count_descending",
  "comment_count_descending",
  "collect_count_descending",
];
const XHS_LEGACY_SEARCH_SORT_TYPE_ALIASES = {
  popularity_descending: "like_count_descending",
  comment_descending: "comment_count_descending",
  collect_descending: "collect_count_descending",
};
const DOUYIN_DIRECT_ACTION_OPTIONS = {
  "hot-search": ["pretty"],
  search: [
    "keyword",
    "pageToken",
    "sortType",
    "publishTimeRange",
    "durationRange",
    "contentType",
    "pretty",
  ],
  detail: ["awemeId", "url", "pretty"],
  comments: ["awemeId", "url", "pageToken", "pretty"],
  replies: ["awemeId", "commentId", "pageToken", "pretty"],
  "user-info": ["secUserId", "profileUrl", "pretty"],
  "user-posts": ["secUserId", "profileUrl", "pageToken", "pretty"],
  "user-series": ["secUserId", "profileUrl", "pageToken", "pretty"],
};
const DOUYIN_DIRECT_ACTION_NAMES = Object.keys(DOUYIN_DIRECT_ACTION_OPTIONS).join(", ");
const DOUYIN_SEARCH_SORT_TYPES = ["general", "time_descending", "like_count_descending"];
const DOUYIN_SEARCH_PUBLISH_TIME_RANGES = ["all", "day", "week", "half_year"];
const DOUYIN_SEARCH_DURATION_RANGES = [
  "all",
  "under_1_minute",
  "one_to_five_minutes",
  "over_5_minutes",
];
const DOUYIN_SEARCH_CONTENT_TYPES = ["all", "video", "image"];
const DOUYIN_OPTION_DISPLAY_NAMES = {
  keyword: "--keyword",
  pageToken: "--page-token",
  sortType: "--sort-type",
  publishTimeRange: "--publish-time-range",
  durationRange: "--duration-range",
  contentType: "--content-type",
  url: "--url",
  profileUrl: "--profile-url",
  awemeId: "--aweme-id",
  commentId: "--comment-id",
  secUserId: "--sec-user-id",
};
const PLATFORMS = {
  xhs: {
    id: "xhs",
    displayName: "XHS / Xiaohongshu / RedNote",
    status: "public",
    registryName: "com.52choujiang/xhs-insights",
    futureRegistryName: "com.socialdatax/xhs-insights",
    endpoint: "https://mcp.52choujiang.com/xhs/mcp",
    apiKeyEnv: API_KEY_ENV_NAMES,
    upstreamEnv: [
      "SOCIAL_MEDIA_XHS_MCP_UPSTREAM_URL",
      "SOCIAL_MEDIA_MCP_UPSTREAM_URL",
      "XHS_MCP_UPSTREAM_URL",
    ],
    tools: [
      {
        name: "xhs_search_notes",
        description:
          "Search Xiaohongshu / XHS / RedNote notes by keyword with optional sort and filters.",
      },
      {
        name: "xhs_get_note_detail_by_note_url",
        description:
          "Resolve a note link, short link, share text, or note ID into structured details.",
      },
      {
        name: "xhs_get_note_detail_by_note_id",
        description: "Fetch structured note details by note ID.",
      },
      {
        name: "xhs_get_note_comments_by_note_id",
        description: "Fetch paginated first-level comments by note ID.",
      },
      {
        name: "xhs_get_note_comments_by_note_url",
        description:
          "Fetch paginated first-level comments from a note URL, short link, or share text.",
      },
      {
        name: "xhs_get_note_sub_comments_by_comment_id",
        description:
          "Fetch paginated replies under a first-level comment by note ID and comment ID.",
      },
      {
        name: "xhs_get_user_info_by_user_id",
        description: "Fetch creator profile data by user ID.",
      },
      {
        name: "xhs_get_user_info_by_profile_url",
        description:
          "Resolve a profile link, short link, or share text into creator data.",
      },
      {
        name: "xhs_get_user_posted_notes_by_user_id",
        description: "Fetch a paginated list of notes published by a creator.",
      },
      {
        name: "xhs_get_user_posted_notes_by_profile_url",
        description:
          "Fetch creator notes from a profile link, short link, or share text.",
      },
    ],
  },
  douyin: {
    id: "douyin",
    displayName: "Douyin / 抖音",
    status: "public",
    registryName: "com.52choujiang/douyin-insights",
    futureRegistryName: "com.socialdatax/douyin-insights",
    endpoint: "https://mcp.52choujiang.com/douyin/mcp",
    apiKeyEnv: API_KEY_ENV_NAMES,
    upstreamEnv: [
      "SOCIAL_MEDIA_DOUYIN_MCP_UPSTREAM_URL",
      "SOCIAL_MEDIA_MCP_UPSTREAM_URL",
      "DOUYIN_MCP_UPSTREAM_URL",
    ],
    tools: [
      {
        name: "douyin_get_hot_search_list",
        description: "Fetch the current Douyin main hot search list.",
      },
      {
        name: "douyin_get_video_detail_by_aweme_id",
        description: "Fetch structured Douyin work details by aweme_id.",
      },
      {
        name: "douyin_get_video_detail_by_url",
        description: "Resolve a Douyin content page link, short link, or share text into structured details.",
      },
      {
        name: "douyin_get_video_comments_by_aweme_id",
        description: "Fetch paginated first-level comments by aweme_id.",
      },
      {
        name: "douyin_get_video_comments_by_url",
        description: "Fetch paginated first-level comments from a Douyin content page link, short link, or share text.",
      },
      {
        name: "douyin_get_video_comment_replies_by_comment_id",
        description: "Fetch paginated replies under a first-level Douyin comment by aweme_id and comment_id.",
      },
      {
        name: "douyin_get_user_info_by_sec_user_id",
        description: "Fetch creator profile data by sec_user_id.",
      },
      {
        name: "douyin_get_user_info_by_profile_url",
        description: "Resolve a Douyin profile link, short link, or share text into creator profile data.",
      },
      {
        name: "douyin_get_user_posted_videos_by_sec_user_id",
        description: "Fetch a paginated list of works published by a creator.",
      },
      {
        name: "douyin_get_user_posted_videos_by_profile_url",
        description: "Fetch creator works from a profile link, short link, or share text.",
      },
      {
        name: "douyin_get_user_series_by_sec_user_id",
        description: "Fetch a paginated list of short-drama series published by a creator.",
      },
      {
        name: "douyin_get_user_series_by_profile_url",
        description: "Fetch creator short-drama series from a profile link, short link, or share text.",
      },
      {
        name: "douyin_search_videos",
        description: "Search Douyin works by keyword with optional paging and filters.",
      },
    ],
  },
};
const currentDir = dirname(fileURLToPath(import.meta.url));
let mcpSdkModules;

const cliArgs = process.argv.slice(2);
const command = cliArgs[0];

function isMainModule() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return (
      realpathSync(fileURLToPath(import.meta.url)) ===
      realpathSync(resolve(process.argv[1]))
    );
  } catch {
    return fileURLToPath(import.meta.url) === resolve(process.argv[1]);
  }
}

if (isMainModule()) {
  try {
    if (command === "install") {
      await installSkills(cliArgs.slice(1));
    } else if (command === "list") {
      listSkills();
    } else if (command === "doctor" || command === "verify") {
      printDoctor(cliArgs.slice(1));
    } else if (command === "xhs") {
      await runXhsDirectCommand(cliArgs.slice(1));
    } else if (command === "douyin") {
      await runDouyinDirectCommand(cliArgs.slice(1));
    } else if (command === "--platform" || command?.startsWith("--platform=") || command === "print-config") {
      printRemovedMcpConfigHelp(command);
      process.exitCode = 1;
    } else if (command === "--help" || command === "-h" || command === "help") {
      printHelp();
    } else if (!command) {
      printHelp();
    } else {
      console.error(`${LOG_PREFIX} Unknown command: ${command}`);
      console.error("");
      printHelp();
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} ${error.message}`);
    process.exit(1);
  }
}

function parseCommandArgs(args) {
  const options = {};
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const optionText = arg.slice(2);
    const equalsIndex = optionText.indexOf("=");
    const rawKey =
      equalsIndex === -1 ? optionText : optionText.slice(0, equalsIndex);
    const inlineValue =
      equalsIndex === -1 ? undefined : optionText.slice(equalsIndex + 1);
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    if (BOOLEAN_OPTIONS.has(key)) {
      options[key] = inlineValue ?? true;
      continue;
    }

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return { options, positional };
}

function parseOptions(args) {
  return parseCommandArgs(args).options;
}

function toKebabCase(key) {
  return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function validateKnownOptions(options, allowedOptions) {
  for (const key of Object.keys(options)) {
    if (!allowedOptions.includes(key)) {
      throw new Error(`Unsupported option --${toKebabCase(key)}.`);
    }
  }
}

function requireOptionValue(options, key, displayName) {
  if (options[key] === true || options[key] === "") {
    throw new Error(`Missing value for ${displayName}.`);
  }
}

function validateFlagOption(options, key, displayName) {
  if (options[key] !== undefined && options[key] !== true) {
    throw new Error(`${displayName} does not take a value.`);
  }
}

function validateXhsDirectActionOptions(action, options) {
  const allowedOptions = XHS_DIRECT_ACTION_OPTIONS[action];
  if (!allowedOptions) {
    return;
  }

  validateKnownOptions(options, allowedOptions);
  validateFlagOption(options, "pretty", "--pretty");
  for (const key of allowedOptions) {
    if (key !== "pretty") {
      requireOptionValue(options, key, XHS_OPTION_DISPLAY_NAMES[key]);
    }
  }
}

function validateDouyinDirectActionOptions(action, options) {
  const allowedOptions = DOUYIN_DIRECT_ACTION_OPTIONS[action];
  if (!allowedOptions) {
    return;
  }

  validateKnownOptions(options, allowedOptions);
  validateFlagOption(options, "pretty", "--pretty");
  for (const key of allowedOptions) {
    if (key !== "pretty") {
      requireOptionValue(options, key, DOUYIN_OPTION_DISPLAY_NAMES[key]);
    }
  }
}

function parsePositiveIntegerOption(value, displayName) {
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new Error(`${displayName} must be an integer greater than or equal to 1.`);
  }
  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${displayName} must be an integer greater than or equal to 1.`);
  }
  return parsed;
}

function parseAllowedStringOption(value, displayName, allowedValues, label) {
  const normalized = String(value).trim();
  if (!allowedValues.includes(normalized)) {
    throw new Error(
      `Unsupported ${displayName} "${normalized}". Use one of: ${label}.`
    );
  }
  return normalized;
}

function parseSemanticOption(value, displayName, allowedValues, legacyAliases, label) {
  const normalized = String(value).trim();
  const canonical = legacyAliases[normalized] || normalized;
  if (!allowedValues.includes(canonical)) {
    throw new Error(
      `Unsupported ${displayName} "${normalized}". Use one of: ${label}.`
    );
  }
  return canonical;
}

function validateInstallTarget(target) {
  if (!INSTALL_TARGETS.includes(target)) {
    throw new Error(
      `Unsupported --target "${target}". Use one of: openclaw, hermes, agents, codex, claude-code, or claude.`
    );
  }
}

function parseNodeVersion(version) {
  return version
    .replace(/^v/, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10));
}

function ensureSupportedNodeVersion() {
  const current = parseNodeVersion(process.versions.node);
  const minimum = parseNodeVersion(MIN_NODE_VERSION);
  for (let index = 0; index < minimum.length; index += 1) {
    const currentPart = current[index] || 0;
    const minimumPart = minimum[index] || 0;
    if (currentPart > minimumPart) {
      return;
    }
    if (currentPart < minimumPart) {
      throw new Error(
        `Node.js ${MIN_NODE_VERSION} or newer is required. Current version: ${process.version}.`
      );
    }
  }
}

function validateScope(scope) {
  if (!VALID_SCOPES.includes(scope)) {
    throw new Error(
      `Unsupported --scope "${scope}". Use one of: ${VALID_SCOPES.join(", ")}.`
    );
  }
}

function validateTargetScope(target, scope, hasCustomPath) {
  if (hasCustomPath) {
    return;
  }
  if (scope === "shared" && target !== "hermes") {
    throw new Error(
      '--scope shared is only supported with --target hermes. Use --target agents for the shared AgentSkills directory.'
    );
  }
}

function readFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
}

function resolveUpstreamUrl(platform) {
  return readFirstEnv(platform.upstreamEnv) || platform.endpoint;
}

function expandHome(path) {
  if (!path || path === "~") {
    return homedir();
  }
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}

function resolveInstallDir({ target, scope, customPath, skillName }) {
  if (customPath) {
    return resolve(expandHome(customPath));
  }

  switch (target) {
    case "openclaw":
      if (scope === "workspace") {
        return resolve(process.cwd(), "skills", skillName);
      }
      return join(
        process.env.OPENCLAW_SKILLS_DIR ||
          join(homedir(), ".openclaw", "workspace", "skills"),
        skillName
      );
    case "hermes":
      if (scope === "workspace") {
        return resolve(process.cwd(), "skills", skillName);
      }
      if (scope === "shared") {
        return join(homedir(), ".agents", "skills", skillName);
      }
      return join(homedir(), ".hermes", "skills", skillName);
    case "agents":
      if (scope === "workspace") {
        return resolve(process.cwd(), "skills", skillName);
      }
      return join(homedir(), ".agents", "skills", skillName);
    case "codex":
      if (scope === "workspace") {
        return resolve(process.cwd(), ".codex", "skills", skillName);
      }
      return join(homedir(), ".codex", "skills", skillName);
    case "claude-code":
    case "claude":
      if (scope === "workspace") {
        return resolve(process.cwd(), ".claude", "skills", skillName);
      }
      return join(homedir(), ".claude", "skills", skillName);
    default:
      throw new Error(
        "Missing or unsupported --target. Use openclaw, hermes, agents, codex, claude-code, or claude."
      );
  }
}

function resolveSkillNames(positional) {
  if (positional.length === 0) {
    return AVAILABLE_SKILL_NAMES;
  }

  for (const skillName of positional) {
    if (!AVAILABLE_SKILL_NAMES.includes(skillName)) {
      throw new Error(
        `Unsupported skill "${skillName}". Available skills: ${AVAILABLE_SKILL_NAMES.join(", ")}.`
      );
    }
  }
  return positional;
}

async function installSkills(args) {
  const { options, positional } = parseCommandArgs(args);
  validateKnownOptions(options, ["target", "scope", "path", "force", "dryRun"]);
  const target = options.target;
  const scope = options.scope || "user";
  requireOptionValue(options, "target", "--target");
  requireOptionValue(options, "scope", "--scope");
  requireOptionValue(options, "path", "--path");
  validateFlagOption(options, "force", "--force");
  validateFlagOption(options, "dryRun", "--dry-run");
  if (!target && !options.path) {
    throw new Error(
      "Missing --target. Use openclaw, hermes, agents, codex, claude-code, or claude; or provide --path."
    );
  }
  if (target) {
    validateInstallTarget(target);
  }
  validateScope(scope);
  validateTargetScope(target, scope, Boolean(options.path));
  const skillNames = resolveSkillNames(positional);
  const dryRun = Boolean(options.dryRun);
  const installed = [];

  for (const skillName of skillNames) {
    const destination = resolveInstallDestination({
      skillName,
      target,
      scope,
      path: options.path,
      usePathAsParent: skillNames.length > 1,
    });
    if (dryRun) {
      await validateInstallPlan({
        skillName,
        destination,
        force: options.force,
      });
    } else {
      await installOneSkill({
        skillName,
        destination,
        force: options.force,
      });
    }
    installed.push({ skillName, destination });
  }

  if (dryRun) {
    console.log(
      `Dry run: would install ${installed.length} skill${
        installed.length === 1 ? "" : "s"
      } for ${target || "custom"}:`
    );
    for (const item of installed) {
      const suffix = existsSync(item.destination)
        ? options.force
          ? " (would replace)"
          : " (exists)"
        : "";
      console.log(`- ${item.skillName}: ${item.destination}${suffix}`);
    }
    console.log("");
    console.log("No files were written.");
    console.log("No API key is required for dry-run.");
    console.log("No MCP server configuration would be changed.");
    return;
  }

  console.log(
    `Installed ${installed.length} skill${
      installed.length === 1 ? "" : "s"
    } for ${target || "custom"}:`
  );
  for (const item of installed) {
    console.log(`- ${item.skillName}: ${item.destination}`);
  }
  console.log("");
  console.log("No MCP server setup is required for the bundled skills.");
  console.log("No API key was stored by this installer.");
  console.log("No MCP server configuration was changed.");
  console.log("Installed files are AgentSkills files only.");
  console.log(`Data calls are read-only and require ${PRIMARY_API_KEY_ENV} at runtime.`);
  console.log("Configure your API Key before making authenticated calls:");
  console.log(`  export ${PRIMARY_API_KEY_ENV}="<${PRIMARY_API_KEY_ENV}>"`);
  console.log("");
  console.log("Direct CLI examples:");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs search --keyword "露营桌" --pretty`);
  console.log(`  npx -y ${PACKAGE_SPEC} xhs detail --note-id "<note_id>" --pretty`);
}

function resolveInstallDestination({
  skillName,
  target,
  scope,
  path,
  usePathAsParent,
}) {
  const customPath = path && usePathAsParent ? join(path, skillName) : path;
  return resolveInstallDir({
    target,
    scope,
    customPath,
    skillName,
  });
}

async function validateInstallPlan({ skillName, destination, force }) {
  const sourceDir = join(currentDir, "skills", skillName);

  if (!existsSync(sourceDir)) {
    throw new Error(
      `Skill source directory not found: ${sourceDir}. Reinstall ${PACKAGE_NAME}.`
    );
  }

  if (existsSync(destination) && !force) {
    throw new Error(
      `Skill already exists at ${destination}. Re-run with --force to replace it.`
    );
  }

  if (existsSync(destination) && force) {
    await ensureSafeToReplaceSkill(destination, skillName);
  }
}

async function installOneSkill({
  skillName,
  destination,
  force,
}) {
  const sourceDir = join(currentDir, "skills", skillName);

  if (!existsSync(sourceDir)) {
    throw new Error(
      `Skill source directory not found: ${sourceDir}. Reinstall ${PACKAGE_NAME}.`
    );
  }

  if (existsSync(destination) && !force) {
    throw new Error(
      `Skill already exists at ${destination}. Re-run with --force to replace it.`
    );
  }

  if (existsSync(destination) && force) {
    await ensureSafeToReplaceSkill(destination, skillName);
    await rm(destination, { recursive: true, force: true });
  }

  await mkdir(dirname(destination), { recursive: true });
  await cp(sourceDir, destination, { recursive: true });
}

async function ensureSafeToReplaceSkill(destination, skillName) {
  const destinationStats = await stat(destination);
  if (!destinationStats.isDirectory()) {
    throw new Error(
      `Refusing to replace ${destination}: existing path is not a skill directory. Remove it manually or choose a different --path.`
    );
  }

  const skillFile = join(destination, "SKILL.md");
  if (!existsSync(skillFile)) {
    throw new Error(
      `Refusing to replace ${destination}: existing directory does not contain SKILL.md. Remove it manually or choose a different --path.`
    );
  }

  const existingSkillName = extractSkillName(await readFile(skillFile, "utf8"));
  if (existingSkillName !== skillName) {
    throw new Error(
      `Refusing to replace ${destination}: existing SKILL.md is for "${existingSkillName || "unknown"}", not "${skillName}". Remove it manually or choose a different --path.`
    );
  }
}

function extractSkillName(markdown) {
  const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return undefined;
  }

  const nameMatch = frontmatterMatch[1].match(/^name:\s*["']?([^"'\n]+)["']?\s*$/m);
  return nameMatch?.[1]?.trim();
}

function listSkills() {
  console.log("\nAvailable skills:\n");
  for (const skill of AVAILABLE_SKILLS) {
    console.log(`  ${skill.emoji} ${skill.name}`);
    console.log(`     ${skill.summary}`);
    console.log();
  }
}

function buildDoctorReport() {
  const platforms = Object.values(PLATFORMS).map((platform) => {
    const endpoint = resolveUpstreamUrl(platform);
    return {
      id: platform.id,
      displayName: platform.displayName,
      registryName: platform.registryName,
      futureRegistryName: platform.futureRegistryName,
      endpoint,
      defaultEndpoint: platform.endpoint,
      endpointOverrideActive: endpoint !== platform.endpoint,
      transport: "streamable-http",
      tools: platform.tools.map((tool) => tool.name),
      toolDetails: platform.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
      })),
    };
  });
  return {
    package: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      homepage: HOMEPAGE_URL,
      license: "MIT",
      npmLifecycleScripts: [],
    },
    runtime: {
      currentNode: process.version,
      minimumNode: MIN_NODE_VERSION,
      recommendedNode: "22 LTS or newer",
    },
    install: {
      writes: "AgentSkills directories only",
      apiKeyStored: false,
      mcpConfigChanged: false,
      supportsDryRun: true,
    },
    security: {
      readOnly: true,
      accountActions: false,
      readsLocalBrowserData: false,
      requiresApiKeyAtRuntime: true,
      apiKeyEnv: [PRIMARY_API_KEY_ENV],
    },
    platforms,
    platform: platforms.find((platform) => platform.id === "xhs"),
  };
}

function printDoctor(args) {
  const { options, positional } = parseCommandArgs(args);
  if (positional.length > 0) {
    throw new Error(`Unexpected argument: ${positional[0]}`);
  }
  validateKnownOptions(options, ["json"]);
  validateFlagOption(options, "json", "--json");
  const report = buildDoctorReport();

  if (options.json) {
    process.stdout.write(JSON.stringify(report, null, 2));
    process.stdout.write("\n");
    return;
  }

  console.log(`${PACKAGE_NAME} doctor`);
  console.log("");
  console.log(`Package: ${report.package.name}@${report.package.version}`);
  console.log(`Website: ${report.package.homepage}`);
  console.log(`License: ${report.package.license}`);
  console.log(`Node: current ${report.runtime.currentNode}; minimum ${report.runtime.minimumNode}; recommended ${report.runtime.recommendedNode}`);
  console.log("");
  console.log("Install safety:");
  console.log("- npm lifecycle scripts: none declared by this package.");
  console.log("- install writes AgentSkills files only.");
  console.log("- install does not store API keys.");
  console.log("- install does not change MCP server configuration.");
  console.log("- install --dry-run previews destinations without writing files.");
  console.log("");
  console.log("Runtime data calls:");
  console.log("- read-only social media intelligence workflows.");
  console.log("- no login, posting, editing, liking, commenting, or other account actions.");
  console.log("- no local browser data access.");
  console.log(`- requires ${PRIMARY_API_KEY_ENV} only when making authenticated data calls.`);
  console.log("");
  console.log("Platform MCPs:");
  for (const platform of report.platforms) {
    console.log(`- ${platform.displayName}`);
    console.log(`  registry: ${platform.registryName}`);
    if (platform.futureRegistryName) {
      console.log(`  future registry: ${platform.futureRegistryName}`);
    }
    console.log(`  endpoint: ${platform.endpoint}`);
    if (platform.endpointOverrideActive) {
      console.log(`  default endpoint: ${platform.defaultEndpoint}`);
    }
    console.log(`  transport: ${platform.transport}`);
    console.log(`  tools: ${platform.tools.length}`);
  }
}

function printHelp() {
  console.log(`${PACKAGE_NAME}`);
  console.log("");
  console.log("Commands:");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs search --keyword "露营桌" --pretty`);
  console.log("      Call the XHS search tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs detail --note-id "<note_id>" --pretty`);
  console.log("      Call the XHS note detail tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs comments --note-id "<note_id>" --pretty`);
  console.log("      Call the XHS comments tool directly and print JSON.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty`
  );
  console.log("      Call the XHS comment replies tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs user-info --user-id "<user_id>" --pretty`);
  console.log("      Call the XHS creator profile tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs user-posts --user-id "<user_id>" --pretty`);
  console.log("      Call the XHS creator posts tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin hot-search --pretty`);
  console.log("      Call the Douyin main hot search list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin search --keyword "露营桌" --pretty`);
  console.log("      Call the Douyin work search tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin detail --aweme-id "<aweme_id>" --pretty`);
  console.log("      Call the Douyin work detail tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin comments --aweme-id "<aweme_id>" --pretty`);
  console.log("      Call the Douyin work comments tool directly and print JSON.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty`
  );
  console.log("      Call the Douyin comment replies tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin user-info --sec-user-id "<sec_user_id>" --pretty`);
  console.log("      Call the Douyin creator profile tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin user-info --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Douyin creator profile tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin user-posts --sec-user-id "<sec_user_id>" --pretty`);
  console.log("      Call the Douyin creator works tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin user-posts --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Douyin creator works tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin user-series --sec-user-id "<sec_user_id>" --pretty`);
  console.log("      Call the Douyin creator short-drama series tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} douyin user-series --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Douyin creator short-drama series tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} list`);
  console.log("      List available skills.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} doctor`);
  console.log("      Print package safety and privacy summary without making data calls.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} doctor --json`);
  console.log("      Print the same summary as JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install --target openclaw`);
  console.log("      Install all skills to ~/.openclaw/workspace/skills.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install --target openclaw --dry-run`);
  console.log("      Preview OpenClaw install destinations without writing files.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install media-search --target openclaw`);
  console.log("      Install only the search skill to ~/.openclaw/workspace/skills.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install media-user-info --target openclaw`);
  console.log("      Install only the creator profile skill to ~/.openclaw/workspace/skills.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} install media-comments media-detail --target openclaw`
  );
  console.log("      Install multiple selected skills.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} install media-search --target openclaw --scope workspace`
  );
  console.log("      Install one skill to ./skills/<skill-name>.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install media-search --target hermes`);
  console.log("      Install one skill to ~/.hermes/skills.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} install media-search --target hermes --scope shared`
  );
  console.log("      Install one skill to ~/.agents/skills.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install media-search --target agents`);
  console.log("      Install one skill to ~/.agents/skills.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} install media-search --target codex`);
  console.log("      Install one skill to ~/.codex/skills.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} install media-search --target codex --scope workspace`
  );
  console.log("      Install one skill to ./.codex/skills.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} install media-search --target claude-code`
  );
  console.log("      Install one skill to ~/.claude/skills.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} install media-search --target claude-code --scope workspace`
  );
  console.log("      Install one skill to ./.claude/skills.");
  console.log("");
  console.log("Available skills:");
  console.log(`  ${AVAILABLE_SKILL_NAMES.join(", ")}`);
  console.log("");
  console.log("Options:");
  console.log("  --keyword <text>");
  console.log("  --url <url-or-share-text>");
  console.log("      For Douyin detail/comments, pass a content page link, short link, or share text, not video.play_url.");
  console.log("  --note-id <note_id>");
  console.log("  --aweme-id <aweme_id>");
  console.log("  --comment-id <comment_id>");
  console.log("  --profile-url <profile-url-or-share-text>");
  console.log("  --user-id <user_id>");
  console.log("  --sec-user-id <sec_user_id>");
  console.log("  --page <number>");
  console.log("  --sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>");
  console.log("      XHS sort meanings: general=default, time_descending=newest, like_count_descending=most liked, comment_count_descending=most commented, collect_count_descending=most collected.");
  console.log("  --note-type <all|image|video>  XHS search note type filter; default is all.");
  console.log("  --publish-time-range <all|day|week|half_year>");
  console.log("      XHS search publish-time filter; default is all.");
  console.log("  --sort-type <general|time_descending|like_count_descending>");
  console.log("      Douyin search sort; omit for default sort.");
  console.log("  --publish-time-range <all|day|week|half_year>");
  console.log("      Douyin publish-time filter; omit for no filter.");
  console.log("  --duration-range <all|under_1_minute|one_to_five_minutes|over_5_minutes>");
  console.log("      Douyin duration filter; omit for no duration filter.");
  console.log("  --content-type <all|video|image>");
  console.log("      Douyin content type filter; omit for all content types.");
  console.log("  --page-token <token>");
  console.log("  --pretty            Pretty-print direct CLI JSON output.");
  console.log("  --json              Print doctor output as JSON.");
  console.log("  --target <openclaw|hermes|agents|codex|claude-code|claude>");
  console.log("      For install.");
  console.log("  --scope <user|workspace|shared>  shared is only for --target hermes.");
  console.log("  --path <directory>   Override install destination.");
  console.log("  --dry-run           Preview install without writing files.");
  console.log("  --force              Replace an existing directory for the same skill.");
}

function printRemovedMcpConfigHelp(command) {
  console.error(`${LOG_PREFIX} ${command} is no longer supported by this skills package.`);
  console.error("");
  console.error("This package now installs AgentSkills and provides direct CLI data commands only.");
  console.error("For MCP client configuration, use the platform MCP listings:");
  console.error("  com.52choujiang/xhs-insights");
  console.error("  com.52choujiang/douyin-insights");
  console.error("Future SocialDataX namespace drafts are kept for a later endpoint migration:");
  console.error("  com.socialdatax/xhs-insights");
  console.error("  com.socialdatax/douyin-insights");
  console.error("");
  console.error("Use hosted streamable HTTP when your client supports remote MCP:");
  console.error("  https://mcp.52choujiang.com/xhs/mcp");
  console.error("  https://mcp.52choujiang.com/douyin/mcp");
  console.error("");
  console.error("For command/stdio-only clients, use mcp-remote:");
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/xhs/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/douyin/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
}

async function runXhsDirectCommand(args) {
  const { options, positional } = parseCommandArgs(args);
  const action = positional[0];
  if (!action) {
    throw new Error(
      `Missing XHS command. Use search, detail, comments, sub-comments, user-info, or user-posts.`
    );
  }
  if (positional.length > 1) {
    throw new Error(`Unexpected argument: ${positional[1]}`);
  }
  validateXhsDirectActionOptions(action, options);

  const operation = buildXhsOperation(action, options);
  const data = await callDirectOperation(operation);
  const envelope = {
    platform: operation.platform.id,
    tool: operation.tool,
    arguments: operation.arguments,
    data,
  };
  process.stdout.write(JSON.stringify(envelope, null, options.pretty ? 2 : 0));
  process.stdout.write("\n");
}

async function runDouyinDirectCommand(args) {
  const { options, positional } = parseCommandArgs(args);
  const action = positional[0];
  if (!action) {
    throw new Error(
      `Missing Douyin command. Use ${DOUYIN_DIRECT_ACTION_NAMES}.`
    );
  }
  if (positional.length > 1) {
    throw new Error(`Unexpected argument: ${positional[1]}`);
  }
  validateDouyinDirectActionOptions(action, options);

  const operation = buildDouyinOperation(action, options);
  const data = await callDirectOperation(operation);
  const envelope = {
    platform: operation.platform.id,
    tool: operation.tool,
    arguments: operation.arguments,
    data,
  };
  process.stdout.write(JSON.stringify(envelope, null, options.pretty ? 2 : 0));
  process.stdout.write("\n");
}

function buildXhsOperation(action, options) {
  switch (action) {
    case "search":
      return buildDirectOperation("search", buildXhsSearchCall(options));
    case "detail":
      return buildDirectOperation(
        "detail",
        buildOneOfCall(options, {
          idOption: "noteId",
          urlOption: "url",
          idTool: "xhs_get_note_detail_by_note_id",
          urlTool: "xhs_get_note_detail_by_note_url",
          idArgument: "note_id",
          urlArgument: "note_url",
          idDisplay: "--note-id",
          urlDisplay: "--url",
        })
      );
    case "comments":
      return buildDirectOperation(
        "comments",
        buildOneOfCall(options, {
          idOption: "noteId",
          urlOption: "url",
          idTool: "xhs_get_note_comments_by_note_id",
          urlTool: "xhs_get_note_comments_by_note_url",
          idArgument: "note_id",
          urlArgument: "note_url",
          idDisplay: "--note-id",
          urlDisplay: "--url",
          pageToken: options.pageToken,
        })
      );
    case "sub-comments":
      return buildDirectOperation(
        "sub-comments",
        buildXhsSubCommentsCall(options)
      );
    case "user-info":
      return buildDirectOperation(
        "user-info",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "profileUrl",
          idTool: "xhs_get_user_info_by_user_id",
          urlTool: "xhs_get_user_info_by_profile_url",
          idArgument: "user_id",
          urlArgument: "profile_url",
          idDisplay: "--user-id",
          urlDisplay: "--profile-url",
        })
      );
    case "user-posts":
      return buildDirectOperation(
        "user-posts",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "profileUrl",
          idTool: "xhs_get_user_posted_notes_by_user_id",
          urlTool: "xhs_get_user_posted_notes_by_profile_url",
          idArgument: "user_id",
          urlArgument: "profile_url",
          idDisplay: "--user-id",
          urlDisplay: "--profile-url",
          pageToken: options.pageToken,
        })
      );
    default:
      throw new Error(
        `Unsupported XHS command "${action}". Use search, detail, comments, sub-comments, user-info, or user-posts.`
      );
  }
}

function buildDouyinOperation(action, options) {
  switch (action) {
    case "hot-search":
      return buildDirectOperation(
        "hot-search",
        {
          tool: "douyin_get_hot_search_list",
          toolArguments: {},
        },
        PLATFORMS.douyin
      );
    case "search":
      return buildDirectOperation(
        "search",
        buildDouyinSearchCall(options),
        PLATFORMS.douyin
      );
    case "detail":
      return buildDirectOperation(
        "detail",
        buildOneOfCall(options, {
          idOption: "awemeId",
          urlOption: "url",
          idTool: "douyin_get_video_detail_by_aweme_id",
          urlTool: "douyin_get_video_detail_by_url",
          idArgument: "aweme_id",
          urlArgument: "url",
          idDisplay: "--aweme-id",
          urlDisplay: "--url",
        }),
        PLATFORMS.douyin
      );
    case "comments":
      return buildDirectOperation(
        "comments",
        buildOneOfCall(options, {
          idOption: "awemeId",
          urlOption: "url",
          idTool: "douyin_get_video_comments_by_aweme_id",
          urlTool: "douyin_get_video_comments_by_url",
          idArgument: "aweme_id",
          urlArgument: "url",
          idDisplay: "--aweme-id",
          urlDisplay: "--url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.douyin
      );
    case "replies":
      return buildDirectOperation(
        "replies",
        buildDouyinRepliesCall(options),
        PLATFORMS.douyin
      );
    case "user-info":
      return buildDirectOperation(
        "user-info",
        buildOneOfCall(options, {
          idOption: "secUserId",
          urlOption: "profileUrl",
          idTool: "douyin_get_user_info_by_sec_user_id",
          urlTool: "douyin_get_user_info_by_profile_url",
          idArgument: "sec_user_id",
          urlArgument: "profile_url",
          idDisplay: "--sec-user-id",
          urlDisplay: "--profile-url",
        }),
        PLATFORMS.douyin
      );
    case "user-posts":
      return buildDirectOperation(
        "user-posts",
        buildOneOfCall(options, {
          idOption: "secUserId",
          urlOption: "profileUrl",
          idTool: "douyin_get_user_posted_videos_by_sec_user_id",
          urlTool: "douyin_get_user_posted_videos_by_profile_url",
          idArgument: "sec_user_id",
          urlArgument: "profile_url",
          idDisplay: "--sec-user-id",
          urlDisplay: "--profile-url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.douyin
      );
    case "user-series":
      return buildDirectOperation(
        "user-series",
        buildOneOfCall(options, {
          idOption: "secUserId",
          urlOption: "profileUrl",
          idTool: "douyin_get_user_series_by_sec_user_id",
          urlTool: "douyin_get_user_series_by_profile_url",
          idArgument: "sec_user_id",
          urlArgument: "profile_url",
          idDisplay: "--sec-user-id",
          urlDisplay: "--profile-url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.douyin
      );
    default:
      throw new Error(
        `Unsupported Douyin command "${action}". Use ${DOUYIN_DIRECT_ACTION_NAMES}.`
      );
  }
}

function buildDirectOperation(operation, { tool, toolArguments }, platform = PLATFORMS.xhs) {
  return {
    platform,
    operation,
    backend: "mcp",
    tool,
    arguments: toolArguments,
  };
}

function buildXhsSearchCall(options) {
  if (!options.keyword) {
    throw new Error("Missing --keyword for xhs search.");
  }
  const page =
    options.page === undefined
      ? 1
      : parsePositiveIntegerOption(options.page, "--page");
  const sortType = parseSemanticOption(
    options.sortType || "general",
    "--sort-type",
    XHS_SEARCH_SORT_TYPES,
    XHS_LEGACY_SEARCH_SORT_TYPE_ALIASES,
    XHS_SEARCH_SORT_TYPES.join(", ")
  );
  const noteType = options.noteType || "all";
  const allowedNoteTypes = ["all", "image", "video"];
  if (!allowedNoteTypes.includes(noteType)) {
    throw new Error(
      `Unsupported --note-type "${noteType}". Use one of: ${allowedNoteTypes.join(", ")}.`
    );
  }
  const publishTimeRange = options.publishTimeRange || "all";
  const allowedPublishTimeRanges = ["all", "day", "week", "half_year"];
  if (!allowedPublishTimeRanges.includes(publishTimeRange)) {
    throw new Error(
      `Unsupported --publish-time-range "${publishTimeRange}". Use one of: ${allowedPublishTimeRanges.join(", ")}.`
    );
  }
  const toolArguments = {
    keyword: options.keyword,
    page,
  };
  if (options.sortType !== undefined) {
    toolArguments.sort_type = sortType;
  }
  if (options.noteType !== undefined) {
    toolArguments.note_type = noteType;
  }
  if (options.publishTimeRange !== undefined) {
    toolArguments.publish_time_range = publishTimeRange;
  }
  return {
    tool: "xhs_search_notes",
    toolArguments,
  };
}

function buildOneOfCall(
  options,
  {
    idOption,
    urlOption,
    idTool,
    urlTool,
    idArgument,
    urlArgument,
    idDisplay,
    urlDisplay,
    pageToken,
  }
) {
  const idValue = options[idOption];
  const urlValue = options[urlOption];
  if (idValue && urlValue) {
    throw new Error(`Use only one of ${idDisplay} or ${urlDisplay}.`);
  }
  if (!idValue && !urlValue) {
    throw new Error(`Missing input. Use ${idDisplay} or ${urlDisplay}.`);
  }
  const toolArguments = {};
  const tool = idValue ? idTool : urlTool;
  toolArguments[idValue ? idArgument : urlArgument] = idValue || urlValue;
  if (pageToken) {
    toolArguments.page_token = pageToken;
  }
  return { tool, toolArguments };
}

function buildDouyinSearchCall(options) {
  if (!options.keyword) {
    throw new Error("Missing --keyword for douyin search.");
  }
  const toolArguments = {
    keyword: options.keyword,
  };
  if (options.sortType !== undefined) {
    toolArguments.sort_type = parseAllowedStringOption(
      options.sortType,
      "--sort-type",
      DOUYIN_SEARCH_SORT_TYPES,
      DOUYIN_SEARCH_SORT_TYPES.join(", ")
    );
  }
  if (options.publishTimeRange !== undefined) {
    toolArguments.publish_time_range = parseAllowedStringOption(
      options.publishTimeRange,
      "--publish-time-range",
      DOUYIN_SEARCH_PUBLISH_TIME_RANGES,
      DOUYIN_SEARCH_PUBLISH_TIME_RANGES.join(", ")
    );
  }
  if (options.durationRange !== undefined) {
    toolArguments.duration_range = parseAllowedStringOption(
      options.durationRange,
      "--duration-range",
      DOUYIN_SEARCH_DURATION_RANGES,
      DOUYIN_SEARCH_DURATION_RANGES.join(", ")
    );
  }
  if (options.contentType !== undefined) {
    toolArguments.content_type = parseAllowedStringOption(
      options.contentType,
      "--content-type",
      DOUYIN_SEARCH_CONTENT_TYPES,
      DOUYIN_SEARCH_CONTENT_TYPES.join(", ")
    );
  }
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "douyin_search_videos",
    toolArguments,
  };
}

function buildDouyinRepliesCall(options) {
  if (!options.awemeId) {
    throw new Error("Missing --aweme-id for douyin replies.");
  }
  if (!options.commentId) {
    throw new Error("Missing --comment-id for douyin replies.");
  }
  const toolArguments = {
    aweme_id: options.awemeId,
    comment_id: options.commentId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "douyin_get_video_comment_replies_by_comment_id",
    toolArguments,
  };
}


function buildXhsSubCommentsCall(options) {
  if (!options.noteId) {
    throw new Error("Missing --note-id for xhs sub-comments.");
  }
  if (!options.commentId) {
    throw new Error("Missing --comment-id for xhs sub-comments.");
  }
  const toolArguments = {
    note_id: options.noteId,
    comment_id: options.commentId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "xhs_get_note_sub_comments_by_comment_id",
    toolArguments,
  };
}

async function callDirectOperation(operation) {
  switch (operation.backend) {
    case "mcp":
      return callMcpBackend(operation);
    default:
      throw new Error(`Unsupported direct CLI backend: ${operation.backend}.`);
  }
}

async function callMcpBackend(operation) {
  ensureSupportedNodeVersion();
  const { platform, tool } = operation;
  const apiKey = readFirstEnv(platform.apiKeyEnv);
  if (!apiKey) {
    throw new Error(
      `Missing API Key. Set ${PRIMARY_API_KEY_ENV} before running direct CLI calls.`
    );
  }

  const { Client, StreamableHTTPClientTransport } = await loadMcpSdkModules();
  const upstreamUrl = resolveUpstreamUrl(platform);
  const client = new Client(
    { name: PACKAGE_NAME, version: PACKAGE_VERSION },
    { capabilities: {} }
  );
  const transport = new StreamableHTTPClientTransport(new URL(upstreamUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: tool,
      arguments: operation.arguments,
    });
    if (result.isError) {
      const errorMessage =
        result.structuredContent?.message ||
        extractTextContent(result.content) ||
        `MCP tool ${tool} returned an error.`;
      const error = new Error(errorMessage);
      error.structuredContent = result.structuredContent;
      throw error;
    }
    return result.structuredContent ?? result;
  } catch (error) {
    throw formatDirectCallError({ error, operation, upstreamUrl });
  } finally {
    await client.close().catch(() => {});
  }
}

async function loadMcpSdkModules() {
  if (!mcpSdkModules) {
    const [{ Client }, { StreamableHTTPClientTransport }] = await Promise.all([
      import("@modelcontextprotocol/sdk/client/index.js"),
      import("@modelcontextprotocol/sdk/client/streamableHttp.js"),
    ]);
    mcpSdkModules = { Client, StreamableHTTPClientTransport };
  }
  return mcpSdkModules;
}

function formatDirectCallError({ error, operation, upstreamUrl }) {
  const message = error?.message || String(error);
  if (error?.structuredContent) {
    return error;
  }
  return new Error(
    `Direct CLI call failed for ${operation.platform.id}/${operation.operation} at ${upstreamUrl}: ${message}`
  );
}

function extractTextContent(content) {
  if (!Array.isArray(content)) {
    return undefined;
  }
  return content
    .filter((item) => item?.type === "text" && item.text)
    .map((item) => item.text)
    .join("\n")
    .trim();
}
