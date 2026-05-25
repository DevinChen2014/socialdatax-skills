---
name: media-user-posts
description: Retrieve social media creator content lists from platform user IDs, profile URLs, short links, or share text for account research and content style analysis. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, and Douyin / 抖音 creators.
metadata:
  openclaw:
    requires:
      env:
        - SOCIALDATAX_API_KEY
      bins:
        - node
        - npm
    primaryEnv: SOCIALDATAX_API_KEY
    emoji: "🗂️"
    homepage: https://socialdatax.com
    install:
      - kind: node
        package: "socialdatax-skills"
        bins: []
---

# Media User Posts

Use this skill when the user wants a creator's published content list, content style analysis, recent-topic review, creator benchmarking, or account tracking for supported social media platforms.

Current platform support:

- Xiaohongshu / XHS / RedNote creator notes through the `xhs_get_user_posted_notes_by_*` tools.
- Douyin / 抖音 creator works, including video and image/text posts, through the `douyin_get_user_posted_videos_by_*` tools.
- Douyin / 抖音 creator short-drama series through the `douyin_get_user_series_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. To get or manage an API Key, open <https://socialdatax.com> and follow the website API Key access flow. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-series --profile-url "<profile_url_or_share_text>" --pretty
```

- XHS `--user-id <user_id>`: preferred when the creator ID is already known.
- XHS `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `--sec-user-id <sec_user_id>`: preferred when the creator sec_user_id is already known.
- Douyin `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `user-series`: use for a creator's short-drama series list instead of regular published works.
- `--page-token <next_page_token>`: opaque pagination token; pass back exactly the token returned by the previous page and do not reuse it across users.
- `--pretty`: output formatting only.

Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

If MCP tools are already available in the current agent, use one of these tools:

- `xhs_get_user_posted_notes_by_user_id`: preferred when `user_id` is already known.
- `xhs_get_user_posted_notes_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_posted_videos_by_sec_user_id`: preferred when `sec_user_id` is already known.
- `douyin_get_user_posted_videos_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_series_by_sec_user_id`: preferred for creator short-drama series when `sec_user_id` is already known.
- `douyin_get_user_series_by_profile_url`: use for creator short-drama series from profile URLs, short links, or profile share text.

Creator content-list and series pagination use `page_token`. Pass back exactly the returned `next_page_token`; tokens are bound to the current user and command family and should not be reused across users.

## Output Guidance

Summarize content-list evidence by title or description, summary, publish time, interaction counts, media links, and content type when present. For Douyin image/text posts, use `image_urls` rather than assuming a video playback URL exists. For short-drama series, report series IDs, titles, descriptions, covers, prices, and author facts when present. Use returned content IDs to chain into detail or comment analysis when needed.
