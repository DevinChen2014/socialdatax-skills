---
name: "media-user-posts"
description: "Retrieve social media creator content lists from platform user IDs, profile URLs, short links, or share text for account research and content style analysis. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, Douyin / 抖音, Kuaishou / 快手, Weibo / 微博, and WeChat Channels / 视频号 creators."
source_client: "socialdatax-skills"
source_platform: "npm"
source_skill: "media-user-posts"
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
    emoji: "🗂️"
    homepage: "https://socialdatax.com/ai?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media User Posts

Use this skill when the user wants a creator's published content list, content style analysis, recent-topic review, creator benchmarking, or account tracking for supported social media platforms.

Current platform support:

- Xiaohongshu / XHS / RedNote creator notes through the `xhs_get_user_posted_notes_by_*` tools.
- Douyin / 抖音 creator works, including video and image/text posts, through the `douyin_get_user_posted_videos_by_*` tools.
- Douyin / 抖音 creator short-drama series through the `douyin_get_user_series_by_*` tools.
- Kuaishou / 快手 creator works through the `kuaishou_get_user_posted_videos_by_*` tools.
- Weibo / 微博 creator posts through the `weibo_get_user_posts_by_*` tools.
- WeChat Channels / 视频号 creator videos through the `wechat_get_user_posted_videos_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名；do not infer alternate domains。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest xhs user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest xhs user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-posts \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-posts \
  --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-series \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-series \
  --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-series \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest kuaishou user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest kuaishou user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest kuaishou user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest weibo user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest weibo user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest weibo user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<finder_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-user-posts
```

Optional arguments:

- XHS `--user-id <user_id>`: preferred when the creator ID is already known.
- XHS `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `--sec-user-id <sec_user_id>`: preferred when the creator sec_user_id is already known.
- Douyin `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `user-series`: use for a creator's short-drama series list instead of regular published works.
- `--page-token <next_page_token>`: opaque pagination token; pass the complete returned `next_page_token` back unchanged for the same creator content-list or series chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages of creator content or creator series.
- `--all`: continue until `next_page_token` is empty; there is no default item or page cap.
- `--max-items <n>`: stop after collecting N creator content or series items.
- `--since-days <1-365>`: keep only creator content whose public `publish_time` is within the last N days. When `--pages` is omitted, the CLI continues creator content lists until the publish-time boundary is reached.
- `--pretty`: output formatting only.
- Kuaishou `--user-id <user_id>`: use only when a non-empty creator user_id is already known.
- Kuaishou `--profile-url <profile_url_or_share_text>`: use only for a profile URL, short link, or profile share text that resolves directly to a non-empty user_id. For live/fw-user profile shares, call Kuaishou creator profile first and use the returned non-empty user_id.
- Weibo `--user-id <user_id>`: preferred when the creator user_id is already known.
- Weibo `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- WeChat Channels / 视频号 `--user-id <finder_user_id>`: preferred when the creator user_id ending with `@finder` is already known.
- WeChat Channels / 视频号 `--url <wechat_video_url_or_share_text>`: use a video link or share text to resolve the author and list that creator's videos.
- `--source-client socialdatax-skills --source-platform npm --source-skill media-user-posts`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged creator content or series items in `data.items` and adds `page_count`, `item_count`, and `next_page_token`.
For recent creator research, prefer CLI `--since-days 30` or another user-specified day window. `--since-days` applies to creator content lists only, not Douyin `user-series`.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_get_user_posted_notes_by_user_id`
- `xhs_get_user_posted_notes_by_profile_url`
- `douyin_get_user_posted_videos_by_sec_user_id`
- `douyin_get_user_posted_videos_by_profile_url`
- `douyin_get_user_series_by_sec_user_id`
- `douyin_get_user_series_by_profile_url`
- `kuaishou_get_user_posted_videos_by_user_id`
- `kuaishou_get_user_posted_videos_by_profile_url`
- `weibo_get_user_posts_by_user_id`
- `weibo_get_user_posts_by_profile_url`
- `wechat_get_user_posted_videos_by_user_id`
- `wechat_get_user_posted_videos_by_url`

If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_user_posted_notes_by_user_id`: preferred when `user_id` is already known.
- `xhs_get_user_posted_notes_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_posted_videos_by_sec_user_id`: preferred when `sec_user_id` is already known.
- `douyin_get_user_posted_videos_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_series_by_sec_user_id`: preferred for creator short-drama series when `sec_user_id` is already known.
- `douyin_get_user_series_by_profile_url`: use for creator short-drama series from profile URLs, short links, or profile share text.

Creator content-list and series pagination use opaque `page_token` values. Pass the complete returned `next_page_token` back unchanged for the same user and command family. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Prefer CLI `--pages`, `--all`, and `--max-items` when the user asks for multiple pages or all available creator content.
- `kuaishou_get_user_posted_videos_by_user_id`: preferred when a non-empty `user_id` is already known.
- `kuaishou_get_user_posted_videos_by_profile_url`: use only for profile URLs, short links, or profile share text that resolves directly to a non-empty `user_id`; for live/fw-user profile shares, call Kuaishou creator profile first and use the returned non-empty `user_id`.
Kuaishou creator work pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `weibo_get_user_posts_by_user_id`: preferred when `user_id` is already known.
- `weibo_get_user_posts_by_profile_url`: use for profile URLs, short links, or profile share text.
Weibo creator post pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `wechat_get_user_posted_videos_by_user_id`: preferred when the WeChat Channels / 视频号 `@finder` user_id is already known.
- `wechat_get_user_posted_videos_by_url`: use a WeChat Channels / 视频号 video link or share text to resolve the author and list that creator's videos.
WeChat Channels / 视频号 creator video pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
`--since-days` uses CLI-side filtering only and is not an MCP tool argument; for MCP-only calls, continue pages as needed and filter returned `publish_time` values in your analysis.

## Output Guidance

Summarize content-list evidence by title or description, summary, publish time, interaction counts, media links, and content type when present.
For XHS creator note-list results, copy each returned `note_id` as the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
For Douyin image/text posts, use `image_urls` rather than assuming a video playback URL exists.
For Douyin short-drama series, report series IDs, titles, descriptions, covers, prices, and author facts when present.
Use returned content IDs to chain into detail or comment analysis when needed.
For Weibo creator posts, report post IDs, content, media, publish time, interaction counts, and author facts when present.
For WeChat Channels / 视频号 creator videos, report object IDs, descriptions, media, publish time, interaction counts, and author facts when present.

## Troubleshooting

- For non-balance network or API errors, preserve the error message, check `SOCIALDATAX_API_KEY`, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
