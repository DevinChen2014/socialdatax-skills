---
name: "media-user-info"
description: "Retrieve social media creator profile information from platform user IDs, profile URLs, short links, or share text. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, Douyin / 抖音, Kuaishou / 快手, Weibo / 微博, and WeChat Channels / 视频号 creators."
source_client: "socialdatax-skills"
source_platform: "npm"
source_skill: "media-user-info"
metadata:
  openclaw:
    requires:
      env:
        - "SOCIALDATAX_API_KEY"
      bins:
        - "node"
        - "npm"
    primaryEnv: "SOCIALDATAX_API_KEY"
    install:
      - kind: "node"
        package: "socialdatax-skills"
        bins: []
    emoji: "👤"
    homepage: "https://socialdatax.com/?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media User Info

Use this skill when the user wants creator profile data, account basics, creator positioning, audience scale, or profile lookup for supported social media platforms.

Current platform support:

- Xiaohongshu / XHS / RedNote creators through the `xhs_get_user_info_by_*` tools.
- Douyin / 抖音 creators through the `douyin_get_user_info_by_*` tools.
- Kuaishou / 快手 creators through the `kuaishou_get_user_info_by_*` tools.
- Kuaishou / 快手 creator discovery through `kuaishou_search_users` before profile lookup when only an account keyword or niche is known.
- Weibo / 微博 creators through the `weibo_get_user_info_by_*` tools.
- WeChat Channels / 视频号 creators through `wechat_get_user_info_by_user_id`.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-info

npx -y socialdatax-skills@latest xhs user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-info

npx -y socialdatax-skills@latest douyin user-info \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-info

npx -y socialdatax-skills@latest douyin user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-info

npx -y socialdatax-skills@latest kuaishou user-search \
  --keyword "<creator_keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-info

npx -y socialdatax-skills@latest kuaishou user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-info

npx -y socialdatax-skills@latest kuaishou user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-info

npx -y socialdatax-skills@latest weibo user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-info

npx -y socialdatax-skills@latest weibo user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-info

npx -y socialdatax-skills@latest wechat user-info \
  --user-id "<finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-info
```

Optional arguments:

- XHS `--user-id <user_id>`: preferred when the creator ID is already known from another result.
- XHS `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `--sec-user-id <sec_user_id>`: preferred when the creator sec_user_id is already known.
- Douyin `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- `--pretty`: output formatting only.
- Kuaishou `user-search --keyword <creator_keyword>`: use when the user only has a creator name, account keyword, or niche and needs possible Kuaishou user_id candidates before profile lookup.
- Kuaishou user-search `--page-token <next_page_token>`: opaque pagination token; omit it on the first request and continue only with the complete returned `next_page_token` from the same creator-search chain.
- Kuaishou user-search `--pages <n>` and `--max-items <n>`: fetch and merge bounded creator-search pages; user-search does not support `--since-days` because creator search results are accounts, not published content items.
- Kuaishou `--user-id <user_id>`: use only when a non-empty creator user_id is already known.
- Kuaishou `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text. Live/fw-user profile shares are supported; successful profile results return a reusable non-empty user_id.
- Weibo `--user-id <user_id>`: preferred when the creator user_id is already known.
- Weibo `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- WeChat Channels / 视频号 `--user-id <finder_user_id>`: use when the creator user_id ending with `@finder` is already known.
- `--source-client socialdatax-skills --source-platform npm --source-skill media-user-info`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_get_user_info_by_user_id`
- `xhs_get_user_info_by_profile_url`
- `douyin_get_user_info_by_sec_user_id`
- `douyin_get_user_info_by_profile_url`
- `kuaishou_search_users`
- `kuaishou_get_user_info_by_user_id`
- `kuaishou_get_user_info_by_profile_url`
- `weibo_get_user_info_by_user_id`
- `weibo_get_user_info_by_profile_url`
- `wechat_get_user_info_by_user_id`

If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_user_info_by_user_id`: preferred when `user_id` is already known from search, detail, comments, or creator note lists.
- `xhs_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_info_by_sec_user_id`: preferred when `sec_user_id` is already known from search, detail, comments, or creator work lists.
- `douyin_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
- `kuaishou_search_users`: use when the user only has a creator keyword and needs possible Kuaishou user_id candidates. Pass `keyword`; pass `page_token` only for continuation. Do not pass `page`.
- `kuaishou_get_user_info_by_user_id`: preferred when a non-empty `user_id` is already known from search, detail, comments, or creator work lists.
- `kuaishou_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text, including live/fw-user profile shares; successful results return a reusable non-empty `user_id`.
- `weibo_get_user_info_by_user_id`: preferred when `user_id` is already known.
- `weibo_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
- `wechat_get_user_info_by_user_id`: use when the WeChat Channels / 视频号 creator user_id ending with `@finder` is already known.

## Output Guidance

Report profile fields such as name, platform IDs, bio, verification, follower count, following count, received like count, IP location, and gender when available. Separate profile facts from strategic interpretation.
For Kuaishou creator search results, present account candidates separately from confirmed profile facts; use a returned `user_id` for profile lookup when the user chooses a candidate.
