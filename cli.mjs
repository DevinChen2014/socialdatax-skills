#!/usr/bin/env node

import { existsSync, realpathSync } from "node:fs";
import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "socialdatax-skills";
const PACKAGE_VERSION = "0.2.10";
const PACKAGE_SPEC = `${PACKAGE_NAME}@latest`;
const LOG_PREFIX = `[${PACKAGE_NAME}]`;
const MIN_NODE_VERSION = "20.18.1";
const HOMEPAGE_URL = "https://socialdatax.52choujiang.com";
const PRIMARY_API_KEY_ENV = "SOCIALDATAX_API_KEY";
const LEGACY_API_KEY_ENV = "SOCIAL_MEDIA_MCP_API_KEY";
const API_KEY_ENV_NAMES = [PRIMARY_API_KEY_ENV, LEGACY_API_KEY_ENV];
const AVAILABLE_SKILLS = [
  {
    name: "socialdatax-content-research-assistant",
    summary:
      "Coordinate cross-platform content research across XHS, Douyin, Kuaishou, Weibo, and WeChat Channels.",
    emoji: "🔎",
  },
  {
    name: "media-search",
    summary:
      "Search XHS notes, Douyin works, Kuaishou works, Weibo posts, and WeChat Channels videos by keyword.",
    emoji: "🔍",
  },
  {
    name: "media-detail",
    summary:
      "Read structured content details and metrics for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels.",
    emoji: "📄",
  },
  {
    name: "media-comments",
    summary:
      "Fetch and analyze XHS, Douyin, Kuaishou, Weibo, and WeChat Channels comments/replies.",
    emoji: "💬",
  },
  {
    name: "media-transcript",
    summary:
      "Submit and check video speech-to-text transcript jobs for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels through hosted MCP tools.",
    emoji: "🎙️",
  },
  {
    name: "media-user-info",
    summary:
      "Retrieve creator profile information for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels.",
    emoji: "👤",
  },
  {
    name: "media-user-posts",
    summary:
      "Retrieve creator content lists for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels, including Douyin creator short-drama series.",
    emoji: "🗂️",
  },
];
const AVAILABLE_SKILL_NAMES = AVAILABLE_SKILLS.map((skill) => skill.name);
const BOOLEAN_OPTIONS = new Set([
  "all",
  "dryRun",
  "force",
  "includeReplies",
  "json",
  "pretty",
]);
const DIRECT_BOOLEAN_OPTIONS = new Set(["all", "includeReplies", "pretty"]);
const INSTALL_TARGETS = ["openclaw", "hermes", "agents", "codex", "claude-code", "claude"];
const VALID_SCOPES = ["user", "workspace", "shared"];
const XHS_DIRECT_ACTION_OPTIONS = {
  "hot-search": ["pretty"],
  search: [
    "keyword",
    "page",
    "pages",
    "all",
    "maxItems",
    "sortType",
    "noteType",
    "publishTimeRange",
    "pretty",
  ],
  detail: ["noteId", "url", "pretty"],
  comments: [
    "noteId",
    "url",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  "sub-comments": [
    "noteId",
    "commentId",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  "user-info": ["userId", "profileUrl", "pretty"],
  "user-posts": ["userId", "profileUrl", "pageToken", "pages", "all", "maxItems", "pretty"],
};
const XHS_DIRECT_ACTION_NAMES = Object.keys(XHS_DIRECT_ACTION_OPTIONS).join(", ");
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
  pages: "--pages",
  maxItems: "--max-items",
  all: "--all",
  includeReplies: "--include-replies",
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
    "pages",
    "all",
    "maxItems",
    "sortType",
    "publishTimeRange",
    "durationRange",
    "contentType",
    "pretty",
  ],
  detail: ["awemeId", "url", "pretty"],
  comments: [
    "awemeId",
    "url",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  replies: [
    "awemeId",
    "commentId",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  "user-info": ["secUserId", "profileUrl", "pretty"],
  "user-posts": ["secUserId", "profileUrl", "pageToken", "pages", "all", "maxItems", "pretty"],
  "user-series": ["secUserId", "profileUrl", "pageToken", "pages", "all", "maxItems", "pretty"],
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
  pages: "--pages",
  maxItems: "--max-items",
  all: "--all",
  includeReplies: "--include-replies",
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
const KUAISHOU_DIRECT_ACTION_OPTIONS = {
  "hot-search": ["pretty"],
  search: ["keyword", "pageToken", "pages", "all", "maxItems", "pretty"],
  detail: ["photoId", "url", "pretty"],
  comments: [
    "photoId",
    "url",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  replies: [
    "photoId",
    "commentId",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  "user-info": ["userId", "profileUrl", "pretty"],
  "user-posts": ["userId", "profileUrl", "pageToken", "pages", "all", "maxItems", "pretty"],
};
const KUAISHOU_DIRECT_ACTION_NAMES = Object.keys(KUAISHOU_DIRECT_ACTION_OPTIONS).join(", ");
const KUAISHOU_OPTION_DISPLAY_NAMES = {
  keyword: "--keyword",
  pageToken: "--page-token",
  pages: "--pages",
  maxItems: "--max-items",
  all: "--all",
  includeReplies: "--include-replies",
  url: "--url",
  profileUrl: "--profile-url",
  photoId: "--photo-id",
  commentId: "--comment-id",
  userId: "--user-id",
};
const WEIBO_DIRECT_ACTION_OPTIONS = {
  "hot-search": ["pretty"],
  search: ["keyword", "pageToken", "pages", "all", "maxItems", "pretty"],
  detail: ["postId", "postUrl", "pretty"],
  comments: [
    "postId",
    "postUrl",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  replies: [
    "postId",
    "commentId",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  likers: ["postId", "pageToken", "pages", "all", "maxItems", "pretty"],
  reposts: ["postId", "pageToken", "pages", "all", "maxItems", "pretty"],
  "user-info": ["userId", "profileUrl", "pretty"],
  "user-posts": ["userId", "profileUrl", "pageToken", "pages", "all", "maxItems", "pretty"],
};
const WEIBO_DIRECT_ACTION_NAMES = Object.keys(WEIBO_DIRECT_ACTION_OPTIONS).join(", ");
const WEIBO_OPTION_DISPLAY_NAMES = {
  keyword: "--keyword",
  pageToken: "--page-token",
  pages: "--pages",
  maxItems: "--max-items",
  all: "--all",
  includeReplies: "--include-replies",
  postId: "--post-id",
  postUrl: "--post-url",
  commentId: "--comment-id",
  profileUrl: "--profile-url",
  userId: "--user-id",
};
const WECHAT_DIRECT_ACTION_OPTIONS = {
  "hot-search": ["pretty"],
  search: [
    "keyword",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "sortType",
    "durationRange",
    "pretty",
  ],
  detail: ["encryptedObjectId", "url", "pretty"],
  comments: [
    "objectId",
    "objectNonceId",
    "url",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  replies: [
    "objectId",
    "objectNonceId",
    "commentId",
    "pageToken",
    "pages",
    "all",
    "maxItems",
    "includeReplies",
    "pretty",
  ],
  "user-info": ["userId", "pretty"],
  "user-posts": ["userId", "url", "pageToken", "pages", "all", "maxItems", "pretty"],
};
const WECHAT_DIRECT_ACTION_NAMES = Object.keys(WECHAT_DIRECT_ACTION_OPTIONS).join(", ");
const WECHAT_SEARCH_SORT_TYPES = ["all", "latest", "popular"];
const WECHAT_SEARCH_DURATION_RANGES = [
  "all",
  "under_5_min",
  "between_5_and_20_min",
  "over_20_min",
];
const WECHAT_OPTION_DISPLAY_NAMES = {
  keyword: "--keyword",
  pageToken: "--page-token",
  pages: "--pages",
  maxItems: "--max-items",
  all: "--all",
  includeReplies: "--include-replies",
  sortType: "--sort-type",
  durationRange: "--duration-range",
  url: "--url",
  encryptedObjectId: "--encrypted-object-id",
  objectId: "--object-id",
  objectNonceId: "--object-nonce-id",
  commentId: "--comment-id",
  userId: "--user-id",
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
        name: "xhs_get_search_hot_list",
        description:
          "Fetch the Xiaohongshu / XHS / RedNote search hot list with title and heat value.",
      },
      {
        name: "xhs_search_notes",
        description:
          "Search Xiaohongshu / XHS / RedNote notes by keyword with optional sort and filters.",
      },
      {
        name: "xhs_get_note_detail_by_note_url",
        description:
          "Resolve a note link, short link, or share text into structured details.",
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
      {
        name: "xhs_submit_video_speech_text_by_note_url",
        description:
          "Submit a video note speech-to-text transcript task from a note link, short link, or share text; 提交完成后最多短等 15 秒.",
      },
      {
        name: "xhs_submit_video_speech_text_by_note_id",
        description:
          "Submit a video note speech-to-text transcript task from a note_id; 提交完成后最多短等 15 秒.",
      },
      {
        name: "xhs_get_video_speech_text_job",
        description:
          "Check a video note speech-to-text transcript job by job_id without starting a new task.",
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
        description: "Fetch paginated replies under a first-level Douyin comment; pass both aweme_id and comment_id, and use page_token to continue pagination.",
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
        description:
          "Search Douyin works by keyword with optional page_token continuation and filters; do not pass page.",
      },
      {
        name: "douyin_submit_video_speech_text_by_video_url",
        description:
          "Submit a Douyin work video speech-to-text transcript task from a work page link, short link, or share text; 提交完成后最多短等 15 秒.",
      },
      {
        name: "douyin_submit_video_speech_text_by_aweme_id",
        description:
          "Submit a Douyin work video speech-to-text transcript task from an aweme_id; 提交完成后最多短等 15 秒.",
      },
      {
        name: "douyin_get_video_speech_text_job",
        description:
          "Check a Douyin video speech-to-text transcript job by job_id without starting a new task.",
      },
    ],
  },
  kuaishou: {
    id: "kuaishou",
    displayName: "Kuaishou / 快手 / Kwai",
    status: "public",
    registryName: "com.52choujiang/kuaishou-insights",
    futureRegistryName: "com.socialdatax/kuaishou-insights",
    endpoint: "https://mcp.52choujiang.com/kuaishou/mcp",
    apiKeyEnv: API_KEY_ENV_NAMES,
    upstreamEnv: [
      "SOCIAL_MEDIA_KUAISHOU_MCP_UPSTREAM_URL",
      "SOCIAL_MEDIA_MCP_UPSTREAM_URL",
      "KUAISHOU_MCP_UPSTREAM_URL",
    ],
    tools: [
      {
        name: "kuaishou_get_hot_search_list",
        description: "Get the current Kuaishou / 快手 short-video hot list.",
      },
      {
        name: "kuaishou_search_videos",
        description:
          "Search Kuaishou works by natural-language keyword with optional page_token continuation; do not pass page.",
      },
      {
        name: "kuaishou_get_video_detail_by_photo_id",
        description: "Fetch structured Kuaishou work details when the caller already has a photo_id.",
      },
      {
        name: "kuaishou_get_video_detail_by_url",
        description: "Resolve a Kuaishou work page link, short link, or share text into structured work details.",
      },
      {
        name: "kuaishou_get_video_comments_by_photo_id",
        description: "Fetch paginated first-level comments when the caller already has a photo_id.",
      },
      {
        name: "kuaishou_get_video_comments_by_url",
        description: "Fetch paginated first-level comments directly from a Kuaishou work page link, short link, or share text.",
      },
      {
        name: "kuaishou_get_video_comment_replies_by_comment_id",
        description: "Fetch paginated replies under a first-level comment by photo_id and comment_id.",
      },
      {
        name: "kuaishou_get_user_info_by_user_id",
        description: "Fetch creator profile data when the caller already has a user_id.",
      },
      {
        name: "kuaishou_get_user_info_by_profile_url",
        description: "Resolve a Kuaishou profile link, short link, or share text into creator profile data.",
      },
      {
        name: "kuaishou_get_user_posted_videos_by_user_id",
        description: "Fetch a paginated list of works published by a creator when the caller already has a user_id.",
      },
      {
        name: "kuaishou_get_user_posted_videos_by_profile_url",
        description: "Fetch a paginated list of works published by a creator from a profile link, short link, or share text.",
      },
      {
        name: "kuaishou_submit_video_speech_text_by_video_url",
        description:
          "Submit a Kuaishou work video speech-to-text transcript task from a work page link, short link, or share text; 提交完成后最多短等 15 秒.",
      },
      {
        name: "kuaishou_submit_video_speech_text_by_photo_id",
        description:
          "Submit a Kuaishou work video speech-to-text transcript task from a photo_id; 提交完成后最多短等 15 秒.",
      },
      {
        name: "kuaishou_get_video_speech_text_job",
        description:
          "Check a Kuaishou video speech-to-text transcript job by job_id without starting a new task.",
      },
    ],
  },
  weibo: {
    id: "weibo",
    displayName: "Weibo / 微博",
    status: "public",
    registryName: "com.52choujiang/weibo-insights",
    futureRegistryName: "com.socialdatax/weibo-insights",
    endpoint: "https://mcp.52choujiang.com/weibo/mcp",
    apiKeyEnv: API_KEY_ENV_NAMES,
    upstreamEnv: [
      "SOCIAL_MEDIA_WEIBO_MCP_UPSTREAM_URL",
      "SOCIAL_MEDIA_MCP_UPSTREAM_URL",
      "WEIBO_MCP_UPSTREAM_URL",
    ],
    tools: [
      {
        name: "weibo_get_hot_search_list",
        description: "Fetch the current Weibo / 微博 hot-search list.",
      },
      {
        name: "weibo_search_posts",
        description:
          "Search Weibo posts by keyword with optional page_token continuation; do not pass page.",
      },
      {
        name: "weibo_get_post_detail_by_post_id",
        description: "Fetch structured Weibo post details when the caller already has a post_id.",
      },
      {
        name: "weibo_get_post_detail_by_post_url",
        description: "Resolve a Weibo post URL, short link, or share text into structured post details.",
      },
      {
        name: "weibo_get_post_comments_by_post_id",
        description: "Fetch paginated first-level comments when the caller already has a post_id.",
      },
      {
        name: "weibo_get_post_comments_by_post_url",
        description: "Fetch paginated first-level comments from a Weibo post URL, short link, or share text.",
      },
      {
        name: "weibo_get_post_comment_replies_by_comment_id",
        description: "Fetch paginated replies under a first-level comment by post_id and comment_id.",
      },
      {
        name: "weibo_get_post_liker_list_by_post_id",
        description: "Fetch a paginated list of users who liked a Weibo post by post_id.",
      },
      {
        name: "weibo_get_post_repost_list_by_post_id",
        description: "Fetch a paginated repost list for a Weibo post by post_id.",
      },
      {
        name: "weibo_get_user_info_by_user_id",
        description: "Fetch creator profile data when the caller already has a user_id.",
      },
      {
        name: "weibo_get_user_info_by_profile_url",
        description: "Resolve a Weibo profile URL, short link, or share text into creator profile data.",
      },
      {
        name: "weibo_get_user_posts_by_user_id",
        description: "Fetch a paginated list of posts published by a creator when the caller already has a user_id.",
      },
      {
        name: "weibo_get_user_posts_by_profile_url",
        description: "Fetch creator posts from a profile URL, short link, or profile share text.",
      },
      {
        name: "weibo_submit_video_speech_text_by_post_url",
        description:
          "Submit a Weibo video speech-to-text transcript task from a post URL, short link, or share text; 提交完成后最多短等 15 秒.",
      },
      {
        name: "weibo_submit_video_speech_text_by_post_id",
        description:
          "Submit a Weibo video speech-to-text transcript task from a post_id; 提交完成后最多短等 15 秒.",
      },
      {
        name: "weibo_get_video_speech_text_job",
        description:
          "Check a Weibo video speech-to-text transcript job by job_id without starting a new task.",
      },
    ],
  },
  wechat: {
    id: "wechat",
    displayName: "WeChat Channels / 视频号",
    status: "public",
    registryName: "com.52choujiang/wechat-channels-insights",
    futureRegistryName: "com.socialdatax/wechat-channels-insights",
    endpoint: "https://mcp.52choujiang.com/wechat/mcp",
    apiKeyEnv: API_KEY_ENV_NAMES,
    upstreamEnv: [
      "SOCIAL_MEDIA_WECHAT_MCP_UPSTREAM_URL",
      "SOCIAL_MEDIA_MCP_UPSTREAM_URL",
      "WECHAT_MCP_UPSTREAM_URL",
    ],
    tools: [
      {
        name: "wechat_get_hot_search_list",
        description: "Fetch the current WeChat Channels / 视频号 hot-search list.",
      },
      {
        name: "wechat_search_videos",
        description:
          "Search WeChat Channels / 视频号 videos by keyword with optional page_token continuation and filters; do not pass page.",
      },
      {
        name: "wechat_get_video_detail_by_encrypted_object_id",
        description: "Fetch structured video details when encrypted_object_id is already known.",
      },
      {
        name: "wechat_get_video_detail_by_url",
        description: "Resolve a WeChat Channels / 视频号 video link or share text into structured video details.",
      },
      {
        name: "wechat_get_video_comments_by_object_id",
        description: "Fetch paginated first-level comments when object_id and object_nonce_id are known.",
      },
      {
        name: "wechat_get_video_comments_by_url",
        description: "Fetch paginated first-level comments from a WeChat Channels / 视频号 video link or share text.",
      },
      {
        name: "wechat_get_video_comment_replies_by_comment_id",
        description: "Fetch paginated replies under a first-level comment by object_id, object_nonce_id, and comment_id.",
      },
      {
        name: "wechat_get_user_info_by_user_id",
        description: "Fetch creator profile data when the finder user_id is already known.",
      },
      {
        name: "wechat_get_user_posted_videos_by_user_id",
        description: "Fetch a paginated list of videos published by a creator when the finder user_id is already known.",
      },
      {
        name: "wechat_get_user_posted_videos_by_url",
        description: "Fetch creator videos from a WeChat Channels / 视频号 video link or share text.",
      },
      {
        name: "wechat_submit_video_speech_text_by_video_url",
        description:
          "Submit a WeChat Channels / 视频号 video speech-to-text transcript task from a video link or share text; 提交完成后最多短等 15 秒.",
      },
      {
        name: "wechat_submit_video_speech_text_by_encrypted_object_id",
        description:
          "Submit a WeChat Channels / 视频号 video speech-to-text transcript task from an encrypted_object_id; 提交完成后最多短等 15 秒.",
      },
      {
        name: "wechat_get_video_speech_text_job",
        description:
          "Check a WeChat Channels / 视频号 video speech-to-text transcript job by job_id without starting a new task.",
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
    } else if (command === "kuaishou") {
      await runKuaishouDirectCommand(cliArgs.slice(1));
    } else if (command === "weibo") {
      await runWeiboDirectCommand(cliArgs.slice(1));
    } else if (command === "wechat") {
      await runWechatDirectCommand(cliArgs.slice(1));
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
  validateDirectPaginationOptions("xhs", action, options);
  for (const key of allowedOptions) {
    if (!DIRECT_BOOLEAN_OPTIONS.has(key)) {
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
  validateDirectPaginationOptions("douyin", action, options);
  for (const key of allowedOptions) {
    if (!DIRECT_BOOLEAN_OPTIONS.has(key)) {
      requireOptionValue(options, key, DOUYIN_OPTION_DISPLAY_NAMES[key]);
    }
  }
}

function validateKuaishouDirectActionOptions(action, options) {
  const allowedOptions = KUAISHOU_DIRECT_ACTION_OPTIONS[action];
  if (!allowedOptions) {
    return;
  }

  validateKnownOptions(options, allowedOptions);
  validateDirectPaginationOptions("kuaishou", action, options);
  for (const key of allowedOptions) {
    if (!DIRECT_BOOLEAN_OPTIONS.has(key)) {
      requireOptionValue(options, key, KUAISHOU_OPTION_DISPLAY_NAMES[key]);
    }
  }
}

function validateWeiboDirectActionOptions(action, options) {
  const allowedOptions = WEIBO_DIRECT_ACTION_OPTIONS[action];
  if (!allowedOptions) {
    return;
  }

  validateKnownOptions(options, allowedOptions);
  validateDirectPaginationOptions("weibo", action, options);
  for (const key of allowedOptions) {
    if (!DIRECT_BOOLEAN_OPTIONS.has(key)) {
      requireOptionValue(options, key, WEIBO_OPTION_DISPLAY_NAMES[key]);
    }
  }
}

function validateWechatDirectActionOptions(action, options) {
  const allowedOptions = WECHAT_DIRECT_ACTION_OPTIONS[action];
  if (!allowedOptions) {
    return;
  }

  validateKnownOptions(options, allowedOptions);
  validateDirectPaginationOptions("wechat", action, options);
  for (const key of allowedOptions) {
    if (!DIRECT_BOOLEAN_OPTIONS.has(key)) {
      requireOptionValue(options, key, WECHAT_OPTION_DISPLAY_NAMES[key]);
    }
  }
}

function validateDirectPaginationOptions(platformId, action, options) {
  validateFlagOption(options, "pretty", "--pretty");
  validateFlagOption(options, "all", "--all");
  validateFlagOption(options, "includeReplies", "--include-replies");
  if (options.all && options.pages !== undefined) {
    throw new Error("Use only one of --all or --pages.");
  }
  if (options.pages !== undefined) {
    parsePositiveIntegerOption(options.pages, "--pages");
  }
  if (options.maxItems !== undefined) {
    parsePositiveIntegerOption(options.maxItems, "--max-items");
  }
  if (options.all && action === "search") {
    throw new Error(`--all is not supported for ${platformId} search. Use --pages instead.`);
  }
  if (options.includeReplies && action !== "comments") {
    throw new Error(`--include-replies is only supported for ${platformId} comments.`);
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
  console.log(`Authenticated data calls require ${PRIMARY_API_KEY_ENV} at runtime.`);
  console.log("Data calls do not perform login, posting, editing, liking, commenting, or account actions.");
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
      readOnly: false,
      directCliReadOnly: true,
      platformMcpMaySubmitAnalysisJobs: true,
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
  console.log("- social media content intelligence workflows.");
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
  console.log(`  npx -y ${PACKAGE_SPEC} xhs hot-search --pretty`);
  console.log("      Call the XHS search hot list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs detail --note-id "<note_id>" --pretty`);
  console.log("      Call the XHS note detail tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs comments --note-id "<note_id>" --pretty`);
  console.log("      Call the XHS comments tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} xhs comments --note-id "<note_id>" --all --include-replies --pretty`);
  console.log("      Fetch all XHS first-level comments and nested replies.");
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
  console.log(`  npx -y ${PACKAGE_SPEC} douyin comments --aweme-id "<aweme_id>" --all --include-replies --pretty`);
  console.log("      Fetch all Douyin first-level comments and nested replies.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty`
  );
  console.log("      Call the Douyin comment replies tool with aweme_id and comment_id; use page_token for pagination.");
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
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou hot-search --pretty`);
  console.log("      Call the Kuaishou short-video hot list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou search --keyword "露营桌" --pretty`);
  console.log("      Call the Kuaishou work search tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou detail --photo-id "<photo_id>" --pretty`);
  console.log("      Call the Kuaishou work detail tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou detail --url "<kuaishou_content_url_or_share_text>" --pretty`);
  console.log("      Call the Kuaishou work detail tool from a work link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou comments --photo-id "<photo_id>" --pretty`);
  console.log("      Call the Kuaishou work comments tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou comments --photo-id "<photo_id>" --all --include-replies --pretty`);
  console.log("      Fetch all Kuaishou first-level comments and nested replies.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou comments --url "<kuaishou_content_url_or_share_text>" --pretty`);
  console.log("      Call the Kuaishou work comments tool from a work link or share text.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty`
  );
  console.log("      Call the Kuaishou comment replies tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou user-info --user-id "<user_id>" --pretty`);
  console.log("      Call the Kuaishou creator profile tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou user-info --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Kuaishou creator profile tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou user-posts --user-id "<user_id>" --pretty`);
  console.log("      Call the Kuaishou creator works tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} kuaishou user-posts --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Kuaishou creator works tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo hot-search --pretty`);
  console.log("      Call the Weibo hot-search list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo search --keyword "露营桌" --pretty`);
  console.log("      Call the Weibo post search tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo detail --post-id "<post_id>" --pretty`);
  console.log("      Call the Weibo post detail tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo detail --post-url "<weibo_post_url_or_share_text>" --pretty`);
  console.log("      Call the Weibo post detail tool from a post link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo comments --post-id "<post_id>" --pretty`);
  console.log("      Call the Weibo post comments tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo comments --post-url "<weibo_post_url_or_share_text>" --pretty`);
  console.log("      Call the Weibo post comments tool from a post link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty`);
  console.log("      Call the Weibo comment replies tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo likers --post-id "<post_id>" --pretty`);
  console.log("      Call the Weibo post liker list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo reposts --post-id "<post_id>" --pretty`);
  console.log("      Call the Weibo post repost list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo user-info --user-id "<user_id>" --pretty`);
  console.log("      Call the Weibo creator profile tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo user-info --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Weibo creator profile tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo user-posts --user-id "<user_id>" --pretty`);
  console.log("      Call the Weibo creator posts tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} weibo user-posts --profile-url "<profile_url_or_share_text>" --pretty`);
  console.log("      Call the Weibo creator posts tool from a profile link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat hot-search --pretty`);
  console.log("      Call the WeChat Channels / 视频号 hot-search list tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat search --keyword "露营桌" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 video search tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat detail --encrypted-object-id "<encrypted_object_id>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 video detail tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat detail --url "<wechat_video_url_or_share_text>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 video detail tool from a video link or share text.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 video comments tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat comments --url "<wechat_video_url_or_share_text>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 video comments tool from a video link or share text.");
  console.log("");
  console.log(
    `  npx -y ${PACKAGE_SPEC} wechat replies --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --comment-id "<comment_id>" --pretty`
  );
  console.log("      Call the WeChat Channels / 视频号 comment replies tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat user-info --user-id "<finder_user_id>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 creator profile tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat user-posts --user-id "<finder_user_id>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 creator videos tool directly and print JSON.");
  console.log("");
  console.log(`  npx -y ${PACKAGE_SPEC} wechat user-posts --url "<wechat_video_url_or_share_text>" --pretty`);
  console.log("      Call the WeChat Channels / 视频号 creator videos tool from a video link or share text.");
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
  console.log("  --photo-id <photo_id>");
  console.log("  --post-id <post_id>");
  console.log("  --post-url <weibo-post-url-or-share-text>");
  console.log("  --encrypted-object-id <encrypted_object_id>");
  console.log("  --object-id <object_id>");
  console.log("  --object-nonce-id <object_nonce_id>");
  console.log("  --comment-id <comment_id>");
  console.log("  --profile-url <profile-url-or-share-text>");
  console.log("  --user-id <user_id>");
  console.log("  --sec-user-id <sec_user_id>");
  console.log("  --page <number>");
  console.log("      XHS search only. Douyin, Kuaishou, Weibo, and WeChat Channels search do not accept --page.");
  console.log("  --pages <number>");
  console.log("      Fetch and merge N pages from the current starting point for search, comments, replies, creator content lists, and creator series.");
  console.log("  --all");
  console.log("      Continue comments, replies, creator content lists, and creator series until next_page_token is empty; not supported for search.");
  console.log("  --max-items <number>");
  console.log("      Stop after collecting this many primary items.");
  console.log("  --include-replies");
  console.log("      For comments commands, also fetch nested second-level replies for each returned first-level comment.");
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
  console.log("      Continue token-paginated commands with the complete returned next_page_token. For Douyin, Kuaishou, Weibo, and WeChat Channels search, omit it on the first request.");
  console.log("  --sort-type <all|latest|popular>");
  console.log("      WeChat Channels / 视频号 search sort; omit for default sort.");
  console.log("  --duration-range <all|under_5_min|between_5_and_20_min|over_20_min>");
  console.log("      WeChat Channels / 视频号 duration filter; omit for no duration filter.");
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
  console.error("  com.52choujiang/kuaishou-insights");
  console.error("  com.52choujiang/weibo-insights");
  console.error("  com.52choujiang/wechat-channels-insights");
  console.error("Future SocialDataX namespace drafts are kept for a later endpoint migration:");
  console.error("  com.socialdatax/xhs-insights");
  console.error("  com.socialdatax/douyin-insights");
  console.error("  com.socialdatax/kuaishou-insights");
  console.error("  com.socialdatax/weibo-insights");
  console.error("  com.socialdatax/wechat-channels-insights");
  console.error("");
  console.error("Use hosted streamable HTTP when your client supports remote MCP:");
  console.error("  https://mcp.52choujiang.com/xhs/mcp");
  console.error("  https://mcp.52choujiang.com/douyin/mcp");
  console.error("  https://mcp.52choujiang.com/kuaishou/mcp");
  console.error("  https://mcp.52choujiang.com/weibo/mcp");
  console.error("  https://mcp.52choujiang.com/wechat/mcp");
  console.error("");
  console.error("For command/stdio-only clients, use mcp-remote:");
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/xhs/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/douyin/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/kuaishou/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/weibo/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
  console.error(`  npx -y mcp-remote https://mcp.52choujiang.com/wechat/mcp --header "Authorization: Bearer <${PRIMARY_API_KEY_ENV}>"`);
}

async function runXhsDirectCommand(args) {
  const { options, positional } = parseCommandArgs(args);
  const action = positional[0];
  if (!action) {
    throw new Error(
      `Missing XHS command. Use ${XHS_DIRECT_ACTION_NAMES}.`
    );
  }
  if (positional.length > 1) {
    throw new Error(`Unexpected argument: ${positional[1]}`);
  }
  validateXhsDirectActionOptions(action, options);

  const operation = buildXhsOperation(action, options);
  const data = shouldUsePaginatedDirectOutput(options)
    ? await callPaginatedDirectOperation(operation, options)
    : await callDirectOperation(operation);
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
  const data = shouldUsePaginatedDirectOutput(options)
    ? await callPaginatedDirectOperation(operation, options)
    : await callDirectOperation(operation);
  const envelope = {
    platform: operation.platform.id,
    tool: operation.tool,
    arguments: operation.arguments,
    data,
  };
  process.stdout.write(JSON.stringify(envelope, null, options.pretty ? 2 : 0));
  process.stdout.write("\n");
}

async function runKuaishouDirectCommand(args) {
  const { options, positional } = parseCommandArgs(args);
  const action = positional[0];
  if (!action) {
    throw new Error(
      `Missing Kuaishou command. Use ${KUAISHOU_DIRECT_ACTION_NAMES}.`
    );
  }
  if (positional.length > 1) {
    throw new Error(`Unexpected argument: ${positional[1]}`);
  }
  validateKuaishouDirectActionOptions(action, options);

  const operation = buildKuaishouOperation(action, options);
  const data = shouldUsePaginatedDirectOutput(options)
    ? await callPaginatedDirectOperation(operation, options)
    : await callDirectOperation(operation);
  const envelope = {
    platform: operation.platform.id,
    tool: operation.tool,
    arguments: operation.arguments,
    data,
  };
  process.stdout.write(JSON.stringify(envelope, null, options.pretty ? 2 : 0));
  process.stdout.write("\n");
}

async function runWeiboDirectCommand(args) {
  const { options, positional } = parseCommandArgs(args);
  const action = positional[0];
  if (!action) {
    throw new Error(
      `Missing Weibo command. Use ${WEIBO_DIRECT_ACTION_NAMES}.`
    );
  }
  if (positional.length > 1) {
    throw new Error(`Unexpected argument: ${positional[1]}`);
  }
  validateWeiboDirectActionOptions(action, options);

  const operation = buildWeiboOperation(action, options);
  const data = shouldUsePaginatedDirectOutput(options)
    ? await callPaginatedDirectOperation(operation, options)
    : await callDirectOperation(operation);
  const envelope = {
    platform: operation.platform.id,
    tool: operation.tool,
    arguments: operation.arguments,
    data,
  };
  process.stdout.write(JSON.stringify(envelope, null, options.pretty ? 2 : 0));
  process.stdout.write("\n");
}

async function runWechatDirectCommand(args) {
  const { options, positional } = parseCommandArgs(args);
  const action = positional[0];
  if (!action) {
    throw new Error(
      `Missing WeChat Channels command. Use ${WECHAT_DIRECT_ACTION_NAMES}.`
    );
  }
  if (positional.length > 1) {
    throw new Error(`Unexpected argument: ${positional[1]}`);
  }
  validateWechatDirectActionOptions(action, options);

  const operation = buildWechatOperation(action, options);
  const data = shouldUsePaginatedDirectOutput(options)
    ? await callPaginatedDirectOperation(operation, options)
    : await callDirectOperation(operation);
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
    case "hot-search":
      return buildDirectOperation("hot-search", {
        tool: "xhs_get_search_hot_list",
        toolArguments: {},
      });
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
        `Unsupported XHS command "${action}". Use ${XHS_DIRECT_ACTION_NAMES}.`
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

function buildKuaishouOperation(action, options) {
  switch (action) {
    case "hot-search":
      return buildDirectOperation(
        "hot-search",
        {
          tool: "kuaishou_get_hot_search_list",
          toolArguments: {},
        },
        PLATFORMS.kuaishou
      );
    case "search":
      return buildDirectOperation(
        "search",
        buildKuaishouSearchCall(options),
        PLATFORMS.kuaishou
      );
    case "detail":
      return buildDirectOperation(
        "detail",
        buildOneOfCall(options, {
          idOption: "photoId",
          urlOption: "url",
          idTool: "kuaishou_get_video_detail_by_photo_id",
          urlTool: "kuaishou_get_video_detail_by_url",
          idArgument: "photo_id",
          urlArgument: "url",
          idDisplay: "--photo-id",
          urlDisplay: "--url",
        }),
        PLATFORMS.kuaishou
      );
    case "comments":
      return buildDirectOperation(
        "comments",
        buildOneOfCall(options, {
          idOption: "photoId",
          urlOption: "url",
          idTool: "kuaishou_get_video_comments_by_photo_id",
          urlTool: "kuaishou_get_video_comments_by_url",
          idArgument: "photo_id",
          urlArgument: "url",
          idDisplay: "--photo-id",
          urlDisplay: "--url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.kuaishou
      );
    case "replies":
      return buildDirectOperation(
        "replies",
        buildKuaishouRepliesCall(options),
        PLATFORMS.kuaishou
      );
    case "user-info":
      return buildDirectOperation(
        "user-info",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "profileUrl",
          idTool: "kuaishou_get_user_info_by_user_id",
          urlTool: "kuaishou_get_user_info_by_profile_url",
          idArgument: "user_id",
          urlArgument: "profile_url",
          idDisplay: "--user-id",
          urlDisplay: "--profile-url",
        }),
        PLATFORMS.kuaishou
      );
    case "user-posts":
      return buildDirectOperation(
        "user-posts",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "profileUrl",
          idTool: "kuaishou_get_user_posted_videos_by_user_id",
          urlTool: "kuaishou_get_user_posted_videos_by_profile_url",
          idArgument: "user_id",
          urlArgument: "profile_url",
          idDisplay: "--user-id",
          urlDisplay: "--profile-url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.kuaishou
      );
    default:
      throw new Error(
        `Unsupported Kuaishou command "${action}". Use ${KUAISHOU_DIRECT_ACTION_NAMES}.`
      );
  }
}

function buildWeiboOperation(action, options) {
  switch (action) {
    case "hot-search":
      return buildDirectOperation(
        "hot-search",
        {
          tool: "weibo_get_hot_search_list",
          toolArguments: {},
        },
        PLATFORMS.weibo
      );
    case "search":
      return buildDirectOperation(
        "search",
        buildWeiboSearchCall(options),
        PLATFORMS.weibo
      );
    case "detail":
      return buildDirectOperation(
        "detail",
        buildOneOfCall(options, {
          idOption: "postId",
          urlOption: "postUrl",
          idTool: "weibo_get_post_detail_by_post_id",
          urlTool: "weibo_get_post_detail_by_post_url",
          idArgument: "post_id",
          urlArgument: "post_url",
          idDisplay: "--post-id",
          urlDisplay: "--post-url",
        }),
        PLATFORMS.weibo
      );
    case "comments":
      return buildDirectOperation(
        "comments",
        buildOneOfCall(options, {
          idOption: "postId",
          urlOption: "postUrl",
          idTool: "weibo_get_post_comments_by_post_id",
          urlTool: "weibo_get_post_comments_by_post_url",
          idArgument: "post_id",
          urlArgument: "post_url",
          idDisplay: "--post-id",
          urlDisplay: "--post-url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.weibo
      );
    case "replies":
      return buildDirectOperation(
        "replies",
        buildWeiboRepliesCall(options),
        PLATFORMS.weibo
      );
    case "likers":
      return buildDirectOperation(
        "likers",
        buildWeiboPostListByPostIdCall(options, "likers", "weibo_get_post_liker_list_by_post_id"),
        PLATFORMS.weibo
      );
    case "reposts":
      return buildDirectOperation(
        "reposts",
        buildWeiboPostListByPostIdCall(options, "reposts", "weibo_get_post_repost_list_by_post_id"),
        PLATFORMS.weibo
      );
    case "user-info":
      return buildDirectOperation(
        "user-info",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "profileUrl",
          idTool: "weibo_get_user_info_by_user_id",
          urlTool: "weibo_get_user_info_by_profile_url",
          idArgument: "user_id",
          urlArgument: "profile_url",
          idDisplay: "--user-id",
          urlDisplay: "--profile-url",
        }),
        PLATFORMS.weibo
      );
    case "user-posts":
      return buildDirectOperation(
        "user-posts",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "profileUrl",
          idTool: "weibo_get_user_posts_by_user_id",
          urlTool: "weibo_get_user_posts_by_profile_url",
          idArgument: "user_id",
          urlArgument: "profile_url",
          idDisplay: "--user-id",
          urlDisplay: "--profile-url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.weibo
      );
    default:
      throw new Error(
        `Unsupported Weibo command "${action}". Use ${WEIBO_DIRECT_ACTION_NAMES}.`
      );
  }
}

function buildWechatOperation(action, options) {
  switch (action) {
    case "hot-search":
      return buildDirectOperation(
        "hot-search",
        {
          tool: "wechat_get_hot_search_list",
          toolArguments: {},
        },
        PLATFORMS.wechat
      );
    case "search":
      return buildDirectOperation(
        "search",
        buildWechatSearchCall(options),
        PLATFORMS.wechat
      );
    case "detail":
      return buildDirectOperation(
        "detail",
        buildOneOfCall(options, {
          idOption: "encryptedObjectId",
          urlOption: "url",
          idTool: "wechat_get_video_detail_by_encrypted_object_id",
          urlTool: "wechat_get_video_detail_by_url",
          idArgument: "encrypted_object_id",
          urlArgument: "url",
          idDisplay: "--encrypted-object-id",
          urlDisplay: "--url",
        }),
        PLATFORMS.wechat
      );
    case "comments":
      return buildDirectOperation(
        "comments",
        buildWechatCommentsCall(options),
        PLATFORMS.wechat
      );
    case "replies":
      return buildDirectOperation(
        "replies",
        buildWechatRepliesCall(options),
        PLATFORMS.wechat
      );
    case "user-info":
      return buildDirectOperation(
        "user-info",
        buildRequiredIdCall(options, {
          idOption: "userId",
          tool: "wechat_get_user_info_by_user_id",
          idArgument: "user_id",
          idDisplay: "--user-id",
          platformLabel: "wechat user-info",
        }),
        PLATFORMS.wechat
      );
    case "user-posts":
      return buildDirectOperation(
        "user-posts",
        buildOneOfCall(options, {
          idOption: "userId",
          urlOption: "url",
          idTool: "wechat_get_user_posted_videos_by_user_id",
          urlTool: "wechat_get_user_posted_videos_by_url",
          idArgument: "user_id",
          urlArgument: "url",
          idDisplay: "--user-id",
          urlDisplay: "--url",
          pageToken: options.pageToken,
        }),
        PLATFORMS.wechat
      );
    default:
      throw new Error(
        `Unsupported WeChat Channels command "${action}". Use ${WECHAT_DIRECT_ACTION_NAMES}.`
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

function buildRequiredIdCall(
  options,
  {
    idOption,
    tool,
    idArgument,
    idDisplay,
    platformLabel,
    pageToken,
  }
) {
  const idValue = options[idOption];
  if (!idValue) {
    throw new Error(`Missing ${idDisplay} for ${platformLabel}.`);
  }
  const toolArguments = {
    [idArgument]: idValue,
  };
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

function buildKuaishouSearchCall(options) {
  if (!options.keyword) {
    throw new Error("Missing --keyword for kuaishou search.");
  }
  const toolArguments = {
    keyword: options.keyword,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "kuaishou_search_videos",
    toolArguments,
  };
}

function buildWeiboSearchCall(options) {
  if (!options.keyword) {
    throw new Error("Missing --keyword for weibo search.");
  }
  const toolArguments = {
    keyword: options.keyword,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "weibo_search_posts",
    toolArguments,
  };
}

function buildWechatSearchCall(options) {
  if (!options.keyword) {
    throw new Error("Missing --keyword for wechat search.");
  }
  const toolArguments = {
    keyword: options.keyword,
  };
  if (options.sortType !== undefined) {
    toolArguments.sort_type = parseAllowedStringOption(
      options.sortType,
      "--sort-type",
      WECHAT_SEARCH_SORT_TYPES,
      WECHAT_SEARCH_SORT_TYPES.join(", ")
    );
  }
  if (options.durationRange !== undefined) {
    toolArguments.duration_range = parseAllowedStringOption(
      options.durationRange,
      "--duration-range",
      WECHAT_SEARCH_DURATION_RANGES,
      WECHAT_SEARCH_DURATION_RANGES.join(", ")
    );
  }
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "wechat_search_videos",
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

function buildKuaishouRepliesCall(options) {
  if (!options.photoId) {
    throw new Error("Missing --photo-id for kuaishou replies.");
  }
  if (!options.commentId) {
    throw new Error("Missing --comment-id for kuaishou replies.");
  }
  const toolArguments = {
    photo_id: options.photoId,
    comment_id: options.commentId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "kuaishou_get_video_comment_replies_by_comment_id",
    toolArguments,
  };
}

function buildWeiboRepliesCall(options) {
  if (!options.postId) {
    throw new Error("Missing --post-id for weibo replies.");
  }
  if (!options.commentId) {
    throw new Error("Missing --comment-id for weibo replies.");
  }
  const toolArguments = {
    post_id: options.postId,
    comment_id: options.commentId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "weibo_get_post_comment_replies_by_comment_id",
    toolArguments,
  };
}

function buildWeiboPostListByPostIdCall(options, action, tool) {
  if (!options.postId) {
    throw new Error(`Missing --post-id for weibo ${action}.`);
  }
  const toolArguments = {
    post_id: options.postId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool,
    toolArguments,
  };
}

function buildWechatCommentsCall(options) {
  const hasObjectInput = Boolean(options.objectId || options.objectNonceId);
  const hasUrlInput = Boolean(options.url);
  if (hasObjectInput && hasUrlInput) {
    throw new Error("Use only one of --object-id/--object-nonce-id or --url.");
  }
  if (hasUrlInput) {
    const toolArguments = {
      url: options.url,
    };
    if (options.pageToken) {
      toolArguments.page_token = options.pageToken;
    }
    return {
      tool: "wechat_get_video_comments_by_url",
      toolArguments,
    };
  }
  if (!options.objectId) {
    throw new Error("Missing --object-id for wechat comments.");
  }
  if (!options.objectNonceId) {
    throw new Error("Missing --object-nonce-id for wechat comments.");
  }
  const toolArguments = {
    object_id: options.objectId,
    object_nonce_id: options.objectNonceId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "wechat_get_video_comments_by_object_id",
    toolArguments,
  };
}

function buildWechatRepliesCall(options) {
  if (!options.objectId) {
    throw new Error("Missing --object-id for wechat replies.");
  }
  if (!options.objectNonceId) {
    throw new Error("Missing --object-nonce-id for wechat replies.");
  }
  if (!options.commentId) {
    throw new Error("Missing --comment-id for wechat replies.");
  }
  const toolArguments = {
    object_id: options.objectId,
    object_nonce_id: options.objectNonceId,
    comment_id: options.commentId,
  };
  if (options.pageToken) {
    toolArguments.page_token = options.pageToken;
  }
  return {
    tool: "wechat_get_video_comment_replies_by_comment_id",
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

function shouldUsePaginatedDirectOutput(options) {
  return Boolean(
    options.all ||
      options.pages !== undefined ||
      options.maxItems !== undefined ||
      options.includeReplies
  );
}

async function callPaginatedDirectOperation(operation, options) {
  const pagination = parseDirectPaginationOptions(options);
  return collectPaginatedDirectData(operation, pagination, {
    includeReplies: Boolean(options.includeReplies),
  });
}

function parseDirectPaginationOptions(options) {
  return {
    all: Boolean(options.all),
    pages:
      options.pages === undefined
        ? undefined
        : parsePositiveIntegerOption(options.pages, "--pages"),
    maxItems:
      options.maxItems === undefined
        ? undefined
        : parsePositiveIntegerOption(options.maxItems, "--max-items"),
  };
}

async function collectPaginatedDirectData(
  operation,
  pagination,
  { includeReplies = false } = {}
) {
  const pageLimit = pagination.all ? Number.POSITIVE_INFINITY : pagination.pages || 1;
  const collectedItems = [];
  const itemDedupeState = createPaginatedItemDedupeState();
  const seenNextMarkers = initialPaginationMarkers(operation);
  let pageCount = 0;
  let lastPageData;
  let nextMarker;
  let parentContextData = {};
  let currentOperation = cloneDirectOperation(operation);

  while (pageCount < pageLimit) {
    const pageData = await callDirectOperation(currentOperation);
    pageCount += 1;
    lastPageData = pageData;
    parentContextData = mergeParentContextData(parentContextData, pageData);

    const pageItems = uniquePaginatedPageItems(
      operation,
      directPageItems(pageData),
      itemDedupeState
    );
    const candidateItems = itemsForRemainingLimit(
      pageItems,
      collectedItems.length,
      pagination.maxItems
    );
    const decoratedItems =
      includeReplies && operation.operation === "comments"
        ? await attachRepliesToCommentItems(
            currentOperation,
            candidateItems,
            parentContextData
          )
        : candidateItems;
    appendItemsWithLimit(collectedItems, decoratedItems, pagination.maxItems);

    nextMarker = readNextPageMarker(currentOperation, pageData);
    const markerKey = nextMarker === undefined ? undefined : String(nextMarker);
    const markerRepeated =
      markerKey !== undefined && seenNextMarkers.has(markerKey);
    if (
      !nextMarker ||
      reachedMaxItems(collectedItems, pagination.maxItems) ||
      pageCount >= pageLimit
    ) {
      if (markerRepeated) {
        nextMarker = undefined;
      }
      break;
    }
    if (markerRepeated) {
      throw new Error(
        `Pagination stopped because ${nextMarkerName(currentOperation)} repeated.`
      );
    }
    seenNextMarkers.add(markerKey);
    currentOperation = operationWithNextPageMarker(currentOperation, nextMarker);
  }

  return buildPaginatedData({
    operation,
    lastPageData,
    parentContextData,
    items: collectedItems,
    pageCount,
    nextMarker,
  });
}

function cloneDirectOperation(operation) {
  return {
    ...operation,
    arguments: { ...operation.arguments },
  };
}

function directPageItems(pageData) {
  return Array.isArray(pageData?.items) ? pageData.items : [];
}

function createPaginatedItemDedupeState() {
  return { seenKeys: new Set() };
}

function uniquePaginatedPageItems(operation, items, itemDedupeState) {
  const uniqueItems = [];
  for (const item of items) {
    const dedupeKeys = paginatedItemDedupeKeys(operation, item);
    if (dedupeKeys.length === 0) {
      uniqueItems.push(item);
      continue;
    }
    if (dedupeKeys.some((key) => itemDedupeState.seenKeys.has(key))) {
      recordPaginatedItemDedupeKeys(itemDedupeState, dedupeKeys);
      continue;
    }
    recordPaginatedItemDedupeKeys(itemDedupeState, dedupeKeys);
    uniqueItems.push(item);
  }
  return uniqueItems;
}

function recordPaginatedItemDedupeKeys(itemDedupeState, dedupeKeys) {
  for (const key of dedupeKeys) {
    itemDedupeState.seenKeys.add(key);
  }
}

function paginatedItemDedupeKeys(operation, item) {
  if (shouldDeduplicateCommentItems(operation)) {
    const commentId = itemStringField(item, "comment_id");
    return commentId ? [`comment:${commentId}`] : [];
  }
  if (!shouldDeduplicateContentItems(operation)) {
    return [];
  }
  const keys = [];
  const itemId = contentItemId(operation, item);
  if (itemId) {
    keys.push(`${operation.operation}:${operation.platform.id}:id:${itemId}`);
  }
  const xhsFingerprint = xhsContentItemFingerprint(operation, item);
  if (xhsFingerprint) {
    keys.push(`${operation.operation}:xhs:fingerprint:${xhsFingerprint}`);
  }
  return keys;
}

function shouldDeduplicateCommentItems(operation) {
  return ["comments", "replies", "sub-comments"].includes(operation.operation);
}

function shouldDeduplicateContentItems(operation) {
  return ["search", "user-posts", "user-series"].includes(operation.operation);
}

function contentItemId(operation, item) {
  switch (operation.platform.id) {
    case "xhs":
      return itemStringField(item, "note_id");
    case "douyin":
      if (operation.operation === "user-series") {
        return itemStringField(item, "series_id");
      }
      return itemStringField(item, "aweme_id");
    case "kuaishou":
      return itemStringField(item, "photo_id");
    case "weibo":
      return itemStringField(item, "post_id");
    case "wechat":
      return (
        itemStringField(item, "encrypted_object_id") ||
        itemStringField(item, "object_id")
      );
    default:
      return undefined;
  }
}

function xhsContentItemFingerprint(operation, item) {
  if (
    operation.platform.id !== "xhs" ||
    !shouldDeduplicateContentItems(operation)
  ) {
    return undefined;
  }
  const authorId = itemStringField(item?.author, "user_id");
  const publishTime = itemStringField(item, "publish_time");
  const publishTimeNumber = Number(publishTime);
  const coverToken = xhsImageUrlToken(item?.cover_image_url);
  if (
    !authorId ||
    !publishTime ||
    !Number.isFinite(publishTimeNumber) ||
    publishTimeNumber <= 0 ||
    !coverToken
  ) {
    return undefined;
  }
  return `${authorId}\t${publishTime}\t${coverToken}`;
}

function xhsImageUrlToken(imageUrl) {
  const urlValue = stringValue(imageUrl);
  if (!urlValue) {
    return undefined;
  }
  let pathname;
  try {
    pathname = new URL(urlValue).pathname;
  } catch {
    return undefined;
  }
  let token = pathname.replace(/^\/+/, "");
  const webpicContentIndex = token.indexOf("/c/");
  if (webpicContentIndex !== -1) {
    token = token.slice(webpicContentIndex + 3);
  }
  token = token.split("!", 1)[0];
  return token || undefined;
}

function itemStringField(item, field) {
  if (!item || typeof item !== "object") {
    return undefined;
  }
  return stringValue(item[field]);
}

function stringValue(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value);
}

function mergeParentContextData(current, pageData) {
  return {
    ...current,
    ...pickDefinedFields(pageData, [
      "note_id",
      "aweme_id",
      "photo_id",
      "post_id",
      "object_id",
      "object_nonce_id",
    ]),
  };
}

function pickDefinedFields(source, fields) {
  if (!source || typeof source !== "object") {
    return {};
  }
  const picked = {};
  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null && source[field] !== "") {
      picked[field] = source[field];
    }
  }
  return picked;
}

function itemsForRemainingLimit(items, collectedItemCount, maxItems) {
  if (maxItems === undefined) {
    return items;
  }
  const remaining = maxItems - collectedItemCount;
  return remaining > 0 ? items.slice(0, remaining) : [];
}

function appendItemsWithLimit(target, source, maxItems) {
  if (maxItems === undefined) {
    target.push(...source);
    return;
  }
  const remaining = maxItems - target.length;
  if (remaining <= 0) {
    return;
  }
  target.push(...source.slice(0, remaining));
}

function reachedMaxItems(items, maxItems) {
  return maxItems !== undefined && items.length >= maxItems;
}

function readNextPageMarker(operation, pageData) {
  if (operation.platform.id === "xhs" && operation.operation === "search") {
    const page = pageData?.next_page;
    return page === undefined || page === null || page === "" ? undefined : page;
  }
  const token = pageData?.next_page_token;
  return typeof token === "string" && token ? token : undefined;
}

function nextMarkerName(operation) {
  return operation.platform.id === "xhs" && operation.operation === "search"
    ? "next_page"
    : "next_page_token";
}

function initialPaginationMarkers(operation) {
  const marker = currentPageMarker(operation);
  return marker === undefined ? new Set() : new Set([String(marker)]);
}

function currentPageMarker(operation) {
  if (operation.platform.id === "xhs" && operation.operation === "search") {
    return operation.arguments.page;
  }
  return operation.arguments.page_token;
}

function operationWithNextPageMarker(operation, nextMarker) {
  const nextOperation = cloneDirectOperation(operation);
  if (operation.platform.id === "xhs" && operation.operation === "search") {
    nextOperation.arguments.page = nextMarker;
  } else {
    nextOperation.arguments.page_token = nextMarker;
  }
  return nextOperation;
}

function buildPaginatedData({
  operation,
  lastPageData,
  parentContextData,
  items,
  pageCount,
  nextMarker,
}) {
  const data = {
    ...(lastPageData && typeof lastPageData === "object" ? lastPageData : {}),
    ...parentContextData,
    items,
    page_count: pageCount,
    item_count: items.length,
  };
  if (operation.platform.id === "xhs" && operation.operation === "search") {
    data.next_page = nextMarker ?? null;
  } else {
    data.next_page_token = nextMarker || "";
  }
  return data;
}

async function attachRepliesToCommentItems(operation, items, pageData) {
  const decorated = [];
  for (const item of items) {
    const comment = { ...item };
    if (commentMayHaveReplies(comment)) {
      const repliesOperation = buildRepliesOperationForComment(
        operation.platform,
        comment,
        operation.arguments,
        pageData
      );
      const repliesData = await collectPaginatedDirectData(
        repliesOperation,
        { all: true, pages: undefined, maxItems: undefined },
        { includeReplies: false }
      );
      comment.replies = repliesData.items;
      comment.replies_page_count = repliesData.page_count;
      comment.replies_next_page_token = repliesData.next_page_token || "";
    } else {
      comment.replies = [];
      comment.replies_page_count = 0;
      comment.replies_next_page_token = "";
    }
    decorated.push(comment);
  }
  return decorated;
}

function commentMayHaveReplies(comment) {
  if (typeof comment.reply_count === "number") {
    return comment.reply_count > 0;
  }
  const replyCount = parseNonNegativeIntegerString(comment.reply_count);
  if (replyCount !== undefined) {
    return replyCount > 0;
  }
  if (typeof comment.has_replies === "boolean") {
    return comment.has_replies;
  }
  return true;
}

function parseNonNegativeIntegerString(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function buildRepliesOperationForComment(platform, comment, parentArguments, parentData) {
  if (!comment.comment_id) {
    throw new Error("Cannot fetch comment replies because comment_id is missing.");
  }
  switch (platform.id) {
    case "xhs":
      {
        const noteId = comment.note_id || parentArguments.note_id || parentData?.note_id;
        if (!noteId) {
          throw new Error("Cannot fetch XHS comment replies because note_id is missing.");
        }
        return buildDirectOperation(
          "sub-comments",
          {
            tool: "xhs_get_note_sub_comments_by_comment_id",
            toolArguments: {
              note_id: noteId,
              comment_id: comment.comment_id,
            },
          },
          platform
        );
      }
    case "douyin":
      {
        const awemeId = comment.aweme_id || parentArguments.aweme_id || parentData?.aweme_id;
        if (!awemeId) {
          throw new Error("Cannot fetch Douyin comment replies because aweme_id is missing.");
        }
        return buildDirectOperation(
          "replies",
          {
            tool: "douyin_get_video_comment_replies_by_comment_id",
            toolArguments: {
              aweme_id: awemeId,
              comment_id: comment.comment_id,
            },
          },
          platform
        );
      }
    case "kuaishou":
      {
        const photoId = comment.photo_id || parentArguments.photo_id || parentData?.photo_id;
        if (!photoId) {
          throw new Error("Cannot fetch Kuaishou comment replies because photo_id is missing.");
        }
        return buildDirectOperation(
          "replies",
          {
            tool: "kuaishou_get_video_comment_replies_by_comment_id",
            toolArguments: {
              photo_id: photoId,
              comment_id: comment.comment_id,
            },
          },
          platform
        );
      }
    case "weibo":
      {
        const postId = comment.post_id || parentArguments.post_id || parentData?.post_id;
        if (!postId) {
          throw new Error("Cannot fetch Weibo comment replies because post_id is missing.");
        }
        return buildDirectOperation(
          "replies",
          {
            tool: "weibo_get_post_comment_replies_by_comment_id",
            toolArguments: {
              post_id: postId,
              comment_id: comment.comment_id,
            },
          },
          platform
        );
      }
    case "wechat":
      {
        const objectId =
          comment.object_id || parentArguments.object_id || parentData?.object_id;
        const objectNonceId =
          comment.object_nonce_id ||
          parentArguments.object_nonce_id ||
          parentData?.object_nonce_id;
        if (!objectId || !objectNonceId) {
          throw new Error("Cannot fetch WeChat Channels comment replies because object_id or object_nonce_id is missing.");
        }
        return buildDirectOperation(
          "replies",
          {
            tool: "wechat_get_video_comment_replies_by_comment_id",
            toolArguments: {
              object_id: objectId,
              object_nonce_id: objectNonceId,
              comment_id: comment.comment_id,
            },
          },
          platform
        );
      }
    default:
      throw new Error(`Unsupported comment reply platform: ${platform.id}.`);
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
