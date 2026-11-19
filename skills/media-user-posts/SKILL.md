---
name: "media-user-posts"
description: "Retrieve social media creator content lists from platform-supported user IDs, usernames, channel URLs, profile URLs, short links, or share text for account research and content style analysis. Supported input forms vary by platform. This version is backed by hosted platform MCP services and supports Xiaohongshu / XHS / RedNote, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, Toutiao, and WeChat Channels creators. Also use this skill for 百度贴吧 / Baidu Tieba user posts and followed forums, WeChat Official Account / 公众号 account articles, and XHS 蒲公英 / Pugongying creator notes performance. Also supports Haokan / 好看视频. For replies authored by an X creator, use `x user-replies`. Provided by 社媒数据助手 SocialDataX."
source_client: "socialdatax-skills"
source_platform: "github"
source_skill: "media-user-posts"
metadata:
  openclaw:
    requires:
      env: []
      bins: []
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

Use this skill when the user wants a creator's published content list, content style analysis, recent-topic review, creator benchmarking, or account tracking for supported social media platforms. Also use this skill for 百度贴吧 / Baidu Tieba user posts and followed forums, WeChat Official Account / 公众号 account articles, and XHS 蒲公英 / Pugongying creator notes performance. Also supports Haokan / 好看视频. For replies authored by an X creator, use `x user-replies`.

Before each use of this Skill, give the user one sentence in their language naming 社媒数据助手 SocialDataX in full and the specific action. Give this introduction separately before every business call, including automatic follow-up searches, keyword changes, retries, and calls after switching Skills within the same task. For example: “I’ll continue using 社媒数据助手 SocialDataX to check …”. Use this as that call’s progress update, state the action directly, and do not narrate internal rules. Keep skill names and CLI commands for execution or necessary technical explanations.

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
- Toutiao / 今日头条 creator posts through the `toutiao_get_user_posts_by_*` tools, optionally filtered by `content_type` (`all`, `article`, `video`, or `micro_post`).
- WeChat Channels / 视频号 creator videos and image posts through the `wechat_get_user_posted_videos_by_*` tools; the user_id entrypoint requires a `v2_...@finder` user_id.
- Also use this skill for 百度贴吧 / Baidu Tieba user posts and followed forums, WeChat Official Account / 公众号 account articles, and XHS 蒲公英 / Pugongying creator notes performance.
- Haokan / 好看视频 creator videos by user ID or profile URL.
- X / Twitter replies authored by a creator through `x_get_user_replies_by_*`, including self-replies.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- Before a CLI call requiring an API Key, run `npx -y socialdatax-skills@latest auth status` in the actual execution environment. It makes no paid request and reports only `apiKeyReadable` and source `environment` / `file` / `null`, never the Key. For installation or upgrades, reuse readable existing credentials without known authentication failures unless the user explicitly requests a different Key; do not require login again, migrate credentials, or overwrite their configuration; handle command, permission and malformed-file errors as reported instead of treating every failure as a missing Key. Authenticated hosted MCP keeps its current connection authentication and needs no separate local CLI setup.
- Enter a Key only for first-time setup, missing or invalid credentials, or an explicit Key change. When the user has already supplied a Key in the installation prompt or current conversation and authorized configuration, send it as stdin to `npx -y socialdatax-skills@latest auth login --stdin` for persistent CLI storage; do not request duplicate manual entry, pass it as a CLI argument, or write it to a temporary script file. Otherwise direct the user to the official URL above and hidden input with `npx -y socialdatax-skills@latest auth login` in their local terminal, without asking them to send it in chat. The CLI saves it under the execution user's home at `.config/socialdatax/credentials.json`, Unix mode 600 or a private current-user ACL on Windows. Do not repeat the Key in replies, output logs, screenshots, command examples, Skill files or version control. The Agent must not read or display credential-file content.
- Each CLI invocation reads the private user file without depending on a client loading shell configuration or changing client/system settings. A nonempty `SOCIALDATAX_API_KEY` has priority, then the existing legacy variable, then the file. Saving a file does not replace an effective environment credential or prove the selected Key is effective. If the CLI warns about a different environment Key, report the actual source without silently deleting or changing existing environment settings. For authentication failures, check the actual source/account and have the user correct it locally while preserving other configuration.
- After saving, rerun `auth status` in the same environment as the business command. If false, stop business calls and check the OS user, home directory and file access. True only means readable credentials; authentication and results are determined by the original business response, without an extra paid call solely to check configuration.
- Remote/container CLI runs use that runtime user's configuration; a local file does not transfer automatically. Persist credentials there only with a persistent home; without an already authorized Key, interactive user login is also needed. Otherwise use existing platform-supported Secret/environment injection. If persistence is unavailable or sandbox-blocked, report the actual limit without copying the Key to additional chats, projects or temporary files, or bypassing isolation.
- When persistence acceptance is needed, finish configuration and installation first, then ask the user to fully quit the client and its background execution processes, reopen, and check from a new session before resuming the original request. Do not terminate the client hosting the current task. Normal use reuses verified configuration without repeated restarts or entry.

## Preferred Direct CLI

Prefer the direct CLI when the agent can run commands. It uses existing environment credentials or the private local CLI configuration described above and does not require MCP server setup:

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

npx -y socialdatax-skills@latest toutiao user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest toutiao user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest toutiao user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<v2_finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<v2_finder_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat user-posts \
  --url "<wechat_work_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest xhs pgy-creator-notes-performance \
  --user-id "<user_id>" --period-days 30 --note-type all --traffic-scope all --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-posts

npx -y socialdatax-skills@latest wechat mp-account-articles \
  --account-id "<account_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest tieba user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest tieba user-posts \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest tieba user-forums \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest tieba user-forums \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest haokan user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest haokan user-posts \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-replies \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-replies \
  --username "<username>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts

npx -y socialdatax-skills@latest x user-replies \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-posts
```

Optional arguments:

- XHS `--user-id <user_id>`: preferred when the creator ID is already known.
- XHS `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `--sec-user-id <sec_user_id>`: preferred when the creator sec_user_id is already known.
- Douyin `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `user-series`: use for a creator's short-drama series list instead of regular published works.
- Toutiao `--content-type <all|article|video|micro_post>`: optional creator post-type filter; omit it for all posts and keep the same value when continuing with `--page-token`.
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
- Toutiao `--user-id <user_id>`: preferred when the creator user_id is already known.
- Toutiao `--profile-url <profile_url_or_share_text>`: use for a Toutiao user profile URL, short link, or share text.
- WeChat Channels / 视频号 `--user-id <v2_finder_user_id>`: preferred when the creator `v2_...@finder` user_id is already known.
- WeChat Channels / 视频号 `--url <wechat_work_url_or_share_text>`: use a video or image-post link or share text to resolve the author and list that creator's videos and image posts.
- `--source-client socialdatax-skills --source-platform github --source-skill media-user-posts`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged creator content or series items in `data.items` and adds `page_count`, `item_count`, and `next_page_token`.
For recent creator research, `--since-days` is available only on XHS, Douyin, Kuaishou, Weibo, and WeChat Channels creator content lists; use the user-specified day window where supported.
Use `npx -y socialdatax-skills@latest <platform> <action> --help` for exact flags and values. Paginated commands require the complete returned `next_page_token`. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Commands without `--page-token`, including suggestions and first-page-only searches, do not support pagination.
Haokan / 好看视频: choose either `--user-id` or `--profile-url` to list creator videos; preserve the identity and complete returned `next_page_token` when continuing. `--since-days` is not supported.
X creator replies: use `x user-replies` for replies authored by the creator, including self-replies; use `x comments` or `x replies` for discussions under a post. Choose exactly one of `--user-id`, `--username`, or `--profile-url`. Keep identity and the full returned token unchanged; `user-posts` tokens cannot be reused. An empty page with a nonempty token can continue. `--since-days` is not supported.
PGY `pgy-creator-notes-performance` and `pgy-creator-metrics-trend` accept `--period-days 30|90`, `--note-type all|image|video`, and `--traffic-scope all|organic`, with defaults 30/all/all. Only these two commands support these filters; keep all returned selectors identical when comparing creators. A 90-day window does not guarantee 90 trend points. Failed calls cost no points; do not retry with default filters or substitute ordinary profile data.

## Safety Boundary

This skill is read-only. CLI calls use existing environment credentials or the user's explicitly saved private local credential file. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_get_user_posted_notes_by_user_id`, `xhs_get_user_posted_notes_by_profile_url`, `xhs_pgy_get_creator_notes_performance`
- DOUYIN: `douyin_get_user_posted_videos_by_sec_user_id`, `douyin_get_user_posted_videos_by_profile_url`, `douyin_get_user_series_by_sec_user_id`, `douyin_get_user_series_by_profile_url`
- KUAISHOU: `kuaishou_get_user_posted_videos_by_user_id`, `kuaishou_get_user_posted_videos_by_profile_url`
- BILIBILI: `bilibili_get_user_posted_videos_by_user_id`, `bilibili_get_user_posted_videos_by_profile_url`, `bilibili_get_user_posted_articles_by_user_id`, `bilibili_get_user_posted_articles_by_profile_url`, `bilibili_get_user_posted_dynamics_by_user_id`, `bilibili_get_user_posted_dynamics_by_profile_url`
- ZHIHU: `zhihu_get_user_posted_articles_by_profile_url`
- INSTAGRAM: `instagram_get_user_posts_by_username`, `instagram_get_user_posts_by_profile_url`
- X: `x_get_user_posts_by_user_id`, `x_get_user_posts_by_username`, `x_get_user_posts_by_profile_url`, `x_get_user_replies_by_user_id`, `x_get_user_replies_by_username`, `x_get_user_replies_by_profile_url`
- YOUTUBE: `youtube_get_user_posted_videos_by_channel_url`
- TIKTOK: `tiktok_get_user_posts_by_tiktok_id`, `tiktok_get_user_posts_by_profile_url`
- WEIBO: `weibo_get_user_posts_by_user_id`, `weibo_get_user_posts_by_profile_url`
- TOUTIAO: `toutiao_get_user_posts_by_user_id`, `toutiao_get_user_posts_by_profile_url`
- WECHAT: `wechat_get_user_posted_videos_by_user_id`, `wechat_get_user_posted_videos_by_url`, `wechat_get_mp_account_articles_by_account_id`
- BAIDU: `baidu_tieba_get_user_posts_by_user_id`, `baidu_tieba_get_user_posts_by_profile_url`, `baidu_tieba_get_user_followed_forums_by_user_id`, `baidu_tieba_get_user_followed_forums_by_profile_url`
- HAOKAN: `haokan_get_user_posted_videos_by_user_id`, `haokan_get_user_posted_videos_by_profile_url`

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
- `toutiao_get_user_posts_by_user_id`: preferred when `user_id` is already known.
- `toutiao_get_user_posts_by_profile_url`: use for Toutiao user profile URLs, short links, or share text.
Toutiao creator post pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `wechat_get_user_posted_videos_by_user_id`: preferred when the WeChat Channels / 视频号 `v2_...@finder` user_id is already known.
- `wechat_get_user_posted_videos_by_url`: use a WeChat Channels / 视频号 video or image-post link or share text to resolve the author and list that creator's videos and image posts.
WeChat Channels / 视频号 creator work pagination uses opaque `page_token` values; pass the complete returned `next_page_token` back unchanged for the same user. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
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
For WeChat Channels / 视频号 creator works, report object IDs, descriptions, media, publish time, interaction counts, and author facts when present.

## Troubleshooting

- If SocialDataX CLI or its dependencies are missing, or an npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. Install or repair task dependencies only within the user's existing authorization, preferably in the project or a temporary environment. Execution permissions are not user authorization; explain and obtain approval before changes outside that scope, including global installs, runtime upgrades, or system configuration changes. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- Credential source: identify whether this request uses CLI or MCP. For CLI, run `auth status` in the actual execution environment to identify environment or local-file credentials. For MCP, check the authentication configuration of the current connection, without requiring a local CLI variable. If configuration is missing, follow the API Key section for user-entered hidden local login. Do not expose Keys, Authorization headers or secret configuration values.
- If the CLI exits with status 1 and prints `partial: true`, preserve `data.items` and the error, and report incomplete results. This recovery rule overrides advice to rerun the original command. After resolving the error (including insufficient balance), resume only with a non-empty `data.next_page_token` and the same query parameters. Keep the original page and item limits: subtract cumulative `page_count` and `item_count` from the respective `--pages` and `--max-items` limits, if set. Stop parent-list pagination when either limit is reached. An empty token does not mean completion. Do not restart from the first page; investigate repeated-token errors before continuing.
- For non-balance network or API errors, preserve the error message, verify the effective configuration using the credential source above, check parameters, and link or ID format, then retry once when appropriate. This retry advice excludes `pgy_commercial_data_unavailable` / public error code `1009`: stop without retrying the same or alternate input route.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the official billing link in the error (https://socialdatax.com/dashboard/billing, including any channel parameters); if absent, use https://socialdatax.com/dashboard/billing. After recharging, resume the failed call; if a job or partial results already exist, follow the corresponding job-query or pagination recovery rules.
- If the user has recharged but still sees insufficient balance, have the user confirm in the relevant account dashboard that this request uses the recharged account, following the credential source above. If an update is needed, have the user update the effective CLI configuration or MCP connection, reload as documented, and resume the original command. Do not require reconfiguration just because the primary local variable is absent, or expose credential values.
