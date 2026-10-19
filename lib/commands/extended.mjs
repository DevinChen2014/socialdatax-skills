import { readFileSync } from "node:fs";

// Regenerate with scripts/sync_socialdatax_cli_contracts.py --write.
export const TOOL_CONTRACTS = JSON.parse(
  readFileSync(new URL("./tool-contracts.json", import.meta.url), "utf8")
);
export const EXTENDED_COMMANDS = [];
const camel = (name) => name.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
export const optionFlag = (name) => `--${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/([a-z])(\d)/g, "$1-$2")}`;

function add(platform, action, tools, metadata = {}) {
  EXTENDED_COMMANDS.push({ platform, action, tools: [tools].flat(), ...metadata });
}
function pair(platform, action, stem, idSuffix, urlSuffix = "url", metadata = {}) {
  add(platform, action, [`${stem}_${idSuffix}`, `${stem}_${urlSuffix}`], metadata);
}
for (const platform of ["xhs", "douyin", "tiktok", "weibo", "zhihu", "instagram", "x", "bilibili", "toutiao"]) {
  add(platform, "user-search", `${platform}_search_users`);
}
for (const platform of ["xhs", "douyin", "tiktok", "weibo", "zhihu", "x", "bilibili", "kuaishou", "youtube", "toutiao"]) {
  add(platform, "search-suggestions", `${platform}_search_suggestions`);
}
add("x", "user-replies", [
  "x_get_user_replies_by_user_id",
  "x_get_user_replies_by_username",
  "x_get_user_replies_by_profile_url",
]);
add("instagram", "tag-search", "instagram_search_tags");
add("weibo", "user-suggestions", "weibo_search_user_suggestions");
add("youtube", "channel-search", "youtube_search_channels");
add("wechat", "user-search", "wechat_search_finder_user");
add("xhs", "search-images", "xhs_search_images");
for (const [platform, idSuffix] of [["xhs", "sku_id"], ["douyin", "product_id"]]) {
  add(platform, "product-search", `${platform}_search_products`);
  pair(platform, "product-detail", `${platform}_get_product_detail_by`, idSuffix);
}
add("xhs", "product-reviews", "xhs_get_product_reviews");
add("xhs", "product-review-replies", "xhs_get_product_review_replies");
add("xhs", "product-review-reply-replies", "xhs_get_product_review_reply_replies");
for (const part of ["profile", "notes_performance", "fans_profile", "fans_summary", "metrics_trend", "commercial_overview"]) {
  add("xhs", `pgy-creator-${part.replaceAll("_", "-")}`, `xhs_pgy_get_creator_${part}`);
}
pair("xhs", "topic-notes", "xhs_get_topic_notes_by", "page_id", "topic_url", { aliases: { topic_url: "url" } });
add("xhs", "resolve-user-id", "xhs_get_user_id_by_encrypted_user_id");
add("douyin", "user-info", "douyin_get_user_info_by_douyin_id", { whenOption: "douyinId" });
add("wechat", "article-search", "wechat_search_mp_articles");
add("wechat", "mp-account-info", "wechat_get_mp_account_info_by_account_id");
add("wechat", "mp-account-articles", "wechat_get_mp_account_articles_by_account_id");
add("wechat", "article-comments", "wechat_get_mp_article_comments_by_url");
add("wechat", "article-replies", "wechat_get_mp_article_comment_replies_by_url");
add("wechat", "share-link", "wechat_get_video_share_url_by_object_id");
for (const [action, name] of [["likers", "liker_list"], ["reposts", "repost_list"]]) {
  add("weibo", action, `weibo_get_post_${name}_by_post_url`, { aliases: { post_url: "url" }, whenOption: "url" });
}
for (const [action, suffix] of [
  ["forum-posts", "get_forum_posts"], ["forum-detail", "get_forum_detail"],
  ["search-suggestions", "search_suggestions"], ["user-search", "search_users"],
  ["search-general", "search_general"], ["search", "search_posts"],
  ["forum-search", "search_posts_in_forum"], ["replies", "get_post_comment_replies"],
]) add("tieba", action, `baidu_tieba_${suffix}`);
pair("tieba", "detail", "baidu_tieba_get_post_detail_by", "thread_id");
pair("tieba", "comments", "baidu_tieba_get_post_comments_by", "thread_id");
for (const [action, suffix] of [["user-info", "info"], ["user-posts", "posts"], ["user-forums", "followed_forums"]]) {
  pair("tieba", action, `baidu_tieba_get_user_${suffix}_by`, "user_id", "profile_url");
}
for (const [action, suffix] of [
  ["search", "search_videos"], ["user-search", "search_users"],
  ["search-suggestions", "search_suggestions"], ["hot-search", "get_hot_search_list"],
]) add("haokan", action, `haokan_${suffix}`);
pair("haokan", "detail", "haokan_get_video_detail_by", "video_id");
pair("haokan", "comments", "haokan_get_video_comments_by", "video_id");
pair("haokan", "replies", "haokan_get_comment_replies_by", "video_id");
pair("haokan", "user-info", "haokan_get_user_info_by", "user_id", "url", { aliases: { url: "profileUrl" } });
pair("haokan", "user-posts", "haokan_get_user_posted_videos_by", "user_id", "profile_url");
add("account", "balance", "socialdatax_get_points_balance");
add("docs", "search", "search_api_docs");
add("docs", "operation", "get_api_operation");
add("docs", "openapi", "get_openapi_spec");
for (const [platform, urlSuffix, idSuffix] of [
  ["bilibili", "video_url", "bvid"], ["zhihu", "video_url", "zvideo_id"],
  ["instagram", "post_url", "post_id"], ["x", "post_url", "post_id"],
  ["tiktok", "url", "aweme_id"], ["youtube", "url", "video_id"],
]) {
  const jobTool = `${platform}_get_video_speech_text_job`;
  add(platform, "transcript", [
    `${platform}_submit_video_speech_text_by_${urlSuffix}`,
    `${platform}_submit_video_speech_text_by_${idSuffix}`, jobTool,
  ], { aliases: { video_url: "url", post_url: "url" }, jobTool });
}

export function findExtendedCommand(platform, action, options = {}) {
  return EXTENDED_COMMANDS.find((definition) => definition.platform === platform && definition.action === action &&
    (!definition.whenOption || options[definition.whenOption] !== undefined));
}
export function parameterOption(definition, name) {
  return definition.aliases?.[name] || camel(name);
}
export function extendedCommandOptions(definition) {
  const names = new Set(["pretty", "sourceClient", "sourcePlatform", "sourceSkill"]);
  for (const tool of definition.tools) {
    for (const name of Object.keys(TOOL_CONTRACTS[tool].parameters)) names.add(parameterOption(definition, name));
    if (TOOL_CONTRACTS[tool].parameters.page_token) {
      for (const name of ["pages", "all", "maxItems"]) names.add(name);
    }
  }
  if (definition.jobTool) names.add("maxWaitSeconds");
  return [...names];
}

function parseParameter(value, originalSchema, flag) {
  const schema = originalSchema.anyOf
    ? originalSchema.anyOf.find((entry) => entry.type !== "null") : originalSchema;
  if (value === "null" && originalSchema.anyOf?.some((entry) => entry.type === "null")) return null;
  let parsed = value;
  if (schema.type === "boolean") {
    if (value === true || value === "true") parsed = true;
    else if (value === false || value === "false") parsed = false;
    else throw new Error(`${flag} must be true or false.`);
  } else if (schema.type === "integer") {
    if (!/^-?\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value))) {
      throw new Error(`${flag} must be a safe integer.`);
    }
    parsed = Number(value);
  } else if (typeof value !== "string" || (originalSchema.required && !value.trim())) {
    throw new Error(`${flag} requires a non-empty value.`);
  }
  if (schema.enum && !schema.enum.includes(parsed)) throw new Error(`${flag} must be one of: ${schema.enum.join(", ")}.`);
  if (schema.pattern && !new RegExp(schema.pattern).test(parsed)) throw new Error(`${flag} does not match the required format.`);
  if ((schema.minLength !== undefined && [...parsed].length < schema.minLength) ||
      (schema.maxLength !== undefined && [...parsed].length > schema.maxLength)) throw new Error(`${flag} has an invalid length.`);
  if ((schema.minimum !== undefined && parsed < schema.minimum) ||
      (schema.maximum !== undefined && parsed > schema.maximum) ||
      (schema.exclusiveMinimum !== undefined && parsed <= schema.exclusiveMinimum)) throw new Error(`${flag} is outside the allowed range.`);
  return parsed;
}

export function buildExtendedCall(definition, options) {
  let tool = definition.tools[0];
  if (definition.tools.length > 1) {
    const choices = definition.tools.map((name) => ({ name, selector: Object.entries(TOOL_CONTRACTS[name].parameters).find(([, schema]) => schema.required)?.[0] }));
    const selected = choices.filter(({ selector }) => options[parameterOption(definition, selector)] !== undefined);
    if (selected.length !== 1) throw new Error(`Use exactly one of ${choices.map(({ selector }) => optionFlag(parameterOption(definition, selector))).join(", ")}.`);
    tool = selected[0].name;
  }
  const toolArguments = {};
  for (const [name, schema] of Object.entries(TOOL_CONTRACTS[tool].parameters)) {
    const option = parameterOption(definition, name);
    if (options[option] === undefined) {
      if (schema.required) throw new Error(`Missing ${optionFlag(option)} for ${definition.platform} ${definition.action}.`);
    } else toolArguments[name] = parseParameter(options[option], schema, optionFlag(option));
  }
  return { tool, toolArguments, ...(definition.jobTool ? {
    transcriptJobTool: definition.jobTool, transcriptJobArgument: "job_id", transcriptIsJobLookup: tool === definition.jobTool,
  } : {}) };
}

export function extendedHelp(platform, action) {
  const definitions = EXTENDED_COMMANDS.filter((entry) => (!platform || entry.platform === platform) && (!action || entry.action === action));
  return definitions.map((definition) => {
    const lines = [`  ${definition.platform} ${definition.action}`];
    for (const tool of definition.tools) {
      const contract = TOOL_CONTRACTS[tool];
      lines.push(`    ${tool}`);
      if (platform && action) lines.push(`    ${contract.description}`);
      for (const [name, schema] of Object.entries(contract.parameters)) {
        const values = schema.enum ? schema.enum.join("|") : (Array.isArray(schema.type) ? schema.type.join("|") : schema.type);
        lines.push(`      ${optionFlag(parameterOption(definition, name))} <${values}>${schema.required ? " (required)" : ""}`);
      }
    }
    if (definition.tools.some((tool) => TOOL_CONTRACTS[tool].parameters.page_token)) {
      const pages = definition.action === "search" ? "--pages <n>" : "--pages <n> or --all";
      lines.push(`    Pagination: --page-token <token>, ${pages}, --max-items <n>. Preserve the full returned next_page_token.`);
    }
    if (definition.platform === "douyin" && definition.action === "product-search") {
      lines.push("    --min-price / --max-price: positive integer CNY yuan (元); min <= max. Omit or use null for no limit.");
    }
    if (definition.jobTool) lines.push("    --max-wait-seconds <n>; queries the same job until terminal. Do not resubmit unfinished jobs.");
    lines.push("    --pretty; --source-client, --source-platform, --source-skill");
    return lines.join("\n");
  }).join("\n\n");
}
