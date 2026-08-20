---
name: "media-user-posts"
description: "Retrieve social media creator content lists from platform-supported user IDs, usernames, channel URLs, profile URLs, short links, or share text for account research and content style analysis. Supported input forms vary by platform. This version is backed by hosted platform MCP services and supports Xiaohongshu / XHS / RedNote, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, and WeChat Channels creators."
source_client: "socialdatax-skills"
source_platform: "github"
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
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media User Posts

Use this skill when the user wants a creator's published content list, content style analysis, recent-topic review, creator benchmarking, or account tracking for supported social media platforms.

Current platform support:

- Xiaohongshu / XHS / RedNote creator notes through the `xhs_get_user_posted_notes_by_*` tools.
- Douyin / 抖音 creator works, including video and image/text posts, through the `douyin_get_user_posted_videos_by_*` tools.
- Douyin / 抖音 creator short-drama series through the `douyin_get_user_series_by_*` tools.
- Kuaishou / 快手 creator works through the `kuaishou_get_user_posted_videos_by_*` tools.
- Bilibili / 哔哩哔哩 / B站 creator videos, articles, and dynamics through the `bilibili_get_user_posted_*` tools.
- Zhihu / 知乎 creator articles through `zhihu_get_user_posted_articles_by_profile_url`.
- Instagram creator posts through the `instagram_get_user_posts_by_*` tools.
- X / Twitter creator posts through the `x_get_user_posts_by_*` tools.
- YouTube channel videos and Shorts through `youtube_get_user_posted_videos_by_channel_url`.
- TikTok creator posts through the `tiktok_get_user_posts_by_*` tools.
- Weibo / 微博 creator posts through the `weibo_get_user_posts_by_*` tools.
- WeChat Channels / 视频号 creator videos through the `wechat_get_user_posted_videos_by_*` tools; the user_id entrypoint requires a `v2_...@finder` user_id.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest xhs user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest xhs user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-posts \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-posts \
  --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-series \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-series \
  --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest douyin user-series \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest kuaishou user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest kuaishou user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest kuaishou user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest bilibili user-videos \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest bilibili user-videos \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest bilibili user-articles \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest bilibili user-articles \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest bilibili user-dynamics \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest bilibili user-dynamics \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest zhihu user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest zhihu user-posts \
  --profile-url "<profile_url_or_share_text>" --all --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest instagram user-posts \
  --username "<username>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest instagram user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest instagram user-posts \
  --username "<username>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-posts \
  --username "<username>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-posts \
  --username "<username>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest youtube user-posts \
  --channel-url "<youtube_channel_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest youtube user-posts \
  --channel-url "<youtube_channel_url>" --all --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest tiktok user-posts \
  --tiktok-id "<tiktok_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest tiktok user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest tiktok user-posts \
  --tiktok-id "<tiktok_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest weibo user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest weibo user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest weibo user-posts \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<v2_finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<v2_finder_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --url "<wechat_work_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts
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
- `--since-days <1-365>`: available only on XHS, Douyin, Kuaishou, Weibo, and WeChat Channels creator content-list commands. Do not pass it to Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, or Douyin `user-series` commands.
- `--pretty`: output formatting only.
- Kuaishou `--user-id <user_id>`: use only when a non-empty creator user_id is already known.
- Kuaishou `--profile-url <profile_url_or_share_text>`: use only for a profile URL, short link, or profile share text that resolves directly to a non-empty user_id. For live/fw-user profile shares, call Kuaishou creator profile first and use the returned non-empty user_id.
- Bilibili `user-videos`, `user-articles`, and `user-dynamics`: use `--user-id <user_id>` or `--profile-url <profile_url_or_share_text>` depending on the available creator entrypoint.
- Bilibili `user-videos --sort-type <time_descending|view_count_descending|collect_count_descending>`: optional creator video-list sort order; omit it for default sorting.
- Zhihu `--profile-url <profile_url_or_share_text>`: use for creator article lists from a Zhihu profile URL.
- Instagram `--username <username>` or `--profile-url <profile_url_or_share_text>`: use exactly one creator post-list entrypoint.
- X / Twitter `--user-id <user_id>`, `--username <username>`, or `--profile-url <profile_url_or_share_text>`: use exactly one creator post-list entrypoint.
- YouTube `--channel-url <youtube_channel_url>`: use for channel videos and Shorts lists.
- YouTube `user-posts --video-type <video|short>`: optional channel video-list filter; omit it for default channel videos.
- TikTok `--tiktok-id <tiktok_id>` or `--profile-url <profile_url_or_share_text>`: use exactly one creator post-list entrypoint.
- Weibo `--user-id <user_id>`: preferred when the creator user_id is already known.
- Weibo `--profile-url <profile_url>`: use for a Weibo user profile URL.
- WeChat Channels / 视频号 `--user-id <v2_finder_user_id>`: preferred when the creator `v2_...@finder` user_id is already known.
- WeChat Channels / 视频号 `--url <wechat_work_url_or_share_text>`: use a video or image-post link or share text to resolve the author and list that creator's videos.
- `--source-client socialdatax-skills --source-platform github --source-skill media-user-posts`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged creator content or series items in `data.items` and adds `page_count`, `item_count`, and `next_page_token`.
For recent creator research, prefer CLI `--since-days 30` or another user-specified day window. `--since-days` applies to creator content lists only, not Douyin `user-series`.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_get_user_posted_notes_by_user_id`, `xhs_get_user_posted_notes_by_profile_url`
- DOUYIN: `douyin_get_user_posted_videos_by_sec_user_id`, `douyin_get_user_posted_videos_by_profile_url`, `douyin_get_user_series_by_sec_user_id`, `douyin_get_user_series_by_profile_url`
- KUAISHOU: `kuaishou_get_user_posted_videos_by_user_id`, `kuaishou_get_user_posted_videos_by_profile_url`
- BILIBILI: `bilibili_get_user_posted_videos_by_user_id`, `bilibili_get_user_posted_videos_by_profile_url`, `bilibili_get_user_posted_articles_by_user_id`, `bilibili_get_user_posted_articles_by_profile_url`, `bilibili_get_user_posted_dynamics_by_user_id`, `bilibili_get_user_posted_dynamics_by_profile_url`
- ZHIHU: `zhihu_get_user_posted_articles_by_profile_url`
- INSTAGRAM: `instagram_get_user_posts_by_username`, `instagram_get_user_posts_by_profile_url`
- X: `x_get_user_posts_by_user_id`, `x_get_user_posts_by_username`, `x_get_user_posts_by_profile_url`
- YOUTUBE: `youtube_get_user_posted_videos_by_channel_url`
- TIKTOK: `tiktok_get_user_posts_by_tiktok_id`, `tiktok_get_user_posts_by_profile_url`
- WEIBO: `weibo_get_user_posts_by_user_id`, `weibo_get_user_posts_by_profile_url`
- WECHAT: `wechat_get_user_posted_videos_by_user_id`, `wechat_get_user_posted_videos_by_url`

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
- `bilibili_get_user_posted_videos_by_user_id` and `bilibili_get_user_posted_videos_by_profile_url`: use for Bilibili creator video lists; optional `sort_type` accepts `time_descending`, `view_count_descending`, or `collect_count_descending`.
- `bilibili_get_user_posted_articles_by_user_id` and `bilibili_get_user_posted_articles_by_profile_url`: use for Bilibili creator article lists.
- `bilibili_get_user_posted_dynamics_by_user_id` and `bilibili_get_user_posted_dynamics_by_profile_url`: use for Bilibili creator dynamic lists.
- `zhihu_get_user_posted_articles_by_profile_url`: use for Zhihu creator article lists.
- `instagram_get_user_posts_by_username` and `instagram_get_user_posts_by_profile_url`: use for Instagram creator post lists.
- `x_get_user_posts_by_user_id`, `x_get_user_posts_by_username`, and `x_get_user_posts_by_profile_url`: use for X creator post lists.
- `youtube_get_user_posted_videos_by_channel_url`: use for YouTube channel videos and Shorts; optional `video_type` accepts `video` or `short`.
- `tiktok_get_user_posts_by_tiktok_id` and `tiktok_get_user_posts_by_profile_url`: use for TikTok creator post lists.
- `weibo_get_user_posts_by_user_id`: preferred when `user_id` is already known.
- `weibo_get_user_posts_by_profile_url`: use for Weibo user profile URLs.
Weibo creator post pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `wechat_get_user_posted_videos_by_user_id`: preferred when the WeChat Channels / 视频号 `v2_...@finder` user_id is already known.
- `wechat_get_user_posted_videos_by_url`: use a WeChat Channels / 视频号 video or image-post link or share text to resolve the author and list that creator's videos.
WeChat Channels / 视频号 creator video pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
`--since-days` uses CLI-side filtering only and is not an MCP tool argument; for MCP-only calls, continue pages as needed and filter returned `publish_time` values in your analysis.

## Output Guidance

Summarize content-list evidence by title or description, summary, publish time, interaction counts, media links, and content type when present.
For XHS creator note-list results, copy each returned `note_id` exactly; do not pass or display only a prefix.
For Douyin image/text posts, use `image_urls` rather than assuming a video playback URL exists.
For Douyin short-drama series, report series IDs, titles, descriptions, covers, prices, and author facts when present.
Use returned content IDs to chain into detail or comment analysis when needed.
For Bilibili creator lists, keep videos, articles, and dynamics separate when more than one command family is used.
For YouTube creator lists, distinguish regular videos and Shorts when the returned data provides that signal.
For Zhihu, Instagram, X / Twitter, and TikTok creator lists, preserve returned public content IDs and URLs for follow-up detail or comment analysis.
For Weibo creator posts, report post IDs, content, media, publish time, interaction counts, and author facts when present.
For WeChat Channels / 视频号 creator videos, report object IDs, descriptions, media, publish time, interaction counts, and author facts when present.

## Troubleshooting

- If an SDK/dependency, npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. If the current environment has permission, install or restore automatically. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- For non-balance network or API errors, preserve the error message, check `SOCIALDATAX_API_KEY`, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
