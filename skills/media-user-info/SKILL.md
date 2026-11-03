---
name: "media-user-info"
description: "Retrieve social media creator profile information from platform-supported user IDs, usernames, channel URLs, profile URLs, short links, or share text. Supported input forms vary by platform. This version is backed by hosted platform MCP services and supports Xiaohongshu / XHS / RedNote, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, Toutiao, and WeChat Channels creators. Also use this skill for 百度贴吧 / Baidu Tieba user search and profiles, platform user/channel search, XHS 蒲公英 / Pugongying creator profile, fans and commercial analytics, XHS encrypted-user-ID resolution, Douyin profile lookup by douyin_id, and WeChat Official Account / 公众号 account profiles. Also supports Haokan / 好看视频."
source_client: "socialdatax-skills"
source_platform: "github"
source_skill: "media-user-info"
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
    emoji: "👤"
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media User Info

Use this skill when the user wants creator profile data, account basics, creator positioning, audience scale, or profile lookup for supported social media platforms. Also use this skill for 百度贴吧 / Baidu Tieba user search and profiles, platform user/channel search, XHS 蒲公英 / Pugongying creator profile, fans and commercial analytics, XHS encrypted-user-ID resolution, Douyin profile lookup by douyin_id, and WeChat Official Account / 公众号 account profiles. Also supports Haokan / 好看视频.

Current platform support:

- Xiaohongshu / XHS / RedNote creators through the `xhs_get_user_info_by_*` tools.
- Douyin / 抖音 creators through the `douyin_get_user_info_by_*` tools.
- Kuaishou / 快手 creators through the `kuaishou_get_user_info_by_*` tools.
- Kuaishou / 快手 creator discovery through `kuaishou_search_users` before profile lookup when only an account keyword or niche is known.
- Bilibili / 哔哩哔哩 / B站 creators through the `bilibili_get_user_info_by_*` tools.
- Zhihu / 知乎 creators through `zhihu_get_user_info_by_profile_url`.
- Instagram creators through the `instagram_get_user_info_by_*` tools.
- X / Twitter creators through the `x_get_user_info_by_*` tools.
- YouTube channels through `youtube_get_channel_info_by_url`.
- TikTok creators through the `tiktok_get_user_info_by_*` tools.
- Weibo / 微博 creators through the `weibo_get_user_info_by_*` tools.
- Toutiao / 今日头条 creators through the `toutiao_get_user_info_by_*` tools.
- WeChat Channels / 视频号 creators through `wechat_get_user_info_by_url` for video or image-post links or share text, or `wechat_get_user_info_by_user_id` when a `v2_...@finder` user_id is already known.
- Also use this skill for 百度贴吧 / Baidu Tieba user search and profiles, platform user/channel search, XHS 蒲公英 / Pugongying creator profile, fans and commercial analytics, XHS encrypted-user-ID resolution, Douyin profile lookup by douyin_id, and WeChat Official Account / 公众号 account profiles.
- Haokan / 好看视频 account discovery and creator profiles by user ID or profile URL.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- Identify the invocation route and actual command execution environment first. Authenticated hosted MCP needs no local CLI variable or Node/npm. For direct CLI calls requiring a Key, run the probe below in the same execution environment; if readable, resume the task without overwriting existing configuration. An unavailable command tool or missing Node.js is an execution-environment issue, not evidence of a missing Key. Direct the user to the official URL above only when they confirm they have no Key.
- Local Agent: prefer the client's documented persistent Secret / env that injects into Agent command processes. In WorkBuddy merge `{"env":{"SOCIALDATAX_API_KEY":"<YOUR_API_KEY>"}}` into `.codebuddy/settings.local.json` in the current trusted workspace, preserving other settings and env entries. This path is WorkBuddy-specific and workspace-scoped. Have the user enter the real Key locally and keep the file out of version control.
- Remote Agent: configure the client's persistent Secret / env on the remote host or service that actually executes commands, reload its execution process as documented, then probe in that same remote session. Local machine environment variables do not automatically transfer to the remote host; a successful local probe does not establish remote access.
- Container or cloud sandbox Agent: prefer the platform's persistent Secret / environment injection into the actual CLI container or sandbox. Recreate or reload it as documented and probe inside it. Host-machine variables are not a substitute for sandbox injection. If the platform cannot persist or inject variables, explain the limitation and use a platform-supported authentication route without bypassing isolation.
- When the probe is false, first check the configuration/Secret host, workspace and scope, workspace trust, correct fields and preserved existing settings, injection into command processes (MCP-server-only env is insufficient), and the documented reload or full restart. Correct these and recheck in the original execution environment. Use that environment's documented user/service environment fallback only after confirming client persistence is unsupported or exhausting these checks; one failed probe or reload alone is not grounds to switch to OS configuration.
- Apply OS fallback on the actual execution host: Windows user environment variables are an option. On macOS the user can read a Key via hidden local terminal input (for example Bash `read -s`) and pass it to `launchctl setenv`; this is login-session-only and needs reloading after login/computer restart. On input failure, empty input or setup failure, report an explicit error and stop with a nonzero exit status; temporary-variable cleanup must preserve the original failure status. Fully quit the relevant client and background processes before reopening; remote services reload according to their runtime, while sandboxes still require platform injection. A separate terminal export, shell startup file alone, or closing a window does not prove inheritance. Keep real keys out of chat, logs, screenshots, command history and Skill files.
- In the same environment that executes the CLI, run `node -e "console.log(JSON.stringify({apiKeyReadable:Boolean(['SOCIALDATAX_API_KEY','SOCIAL_MEDIA_MCP_API_KEY'].map(name=>process.env[name]?.trim()).find(Boolean))}))"` and report only the boolean, never the Key or full environment. Follow CLI lookup order: trimmed primary variable, then legacy compatibility for existing configurations; all new setup still uses `SOCIALDATAX_API_KEY`. If apiKeyReadable is false, stop business requests and diagnose in the order above. True only proves a readable nonempty value; resume the original request to verify authentication, without claiming validity or available credits. Never inject a temporary value into the probe to force success.

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest douyin user-info \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest douyin user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest kuaishou user-search \
  --keyword "<creator_keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest kuaishou user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest kuaishou user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest bilibili user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest bilibili user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest zhihu user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest instagram user-info \
  --username "<username>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest instagram user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest x user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest x user-info \
  --username "<username>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest x user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest youtube channel-info \
  --channel-url "<youtube_channel_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest tiktok user-info \
  --tiktok-id "<tiktok_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest tiktok user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest weibo user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest weibo user-info \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest toutiao user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest toutiao user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest wechat user-info \
  --user-id "<v2_finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest wechat user-info \
  --url "<wechat_work_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest douyin user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest tiktok user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest weibo user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest zhihu user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest instagram user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest x user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest bilibili user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest toutiao user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest youtube channel-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest wechat user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs pgy-creator-profile \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs pgy-creator-fans-profile \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs pgy-creator-fans-summary \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs pgy-creator-metrics-trend \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs pgy-creator-commercial-overview \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest xhs resolve-user-id \
  --encrypted-user-id "<encrypted_user_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-user-info

npx -y socialdatax-skills@latest douyin user-info \
  --douyin-id "<douyin_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest wechat mp-account-info \
  --account-id "<account_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest tieba user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest tieba user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest tieba user-info \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest haokan user-search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest haokan user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info

npx -y socialdatax-skills@latest haokan user-info \
  --profile-url "<profile_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-user-info
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
- Bilibili `--user-id <user_id>`: preferred when the creator user_id is already known.
- Bilibili `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Zhihu `--profile-url <profile_url_or_share_text>`: use for a Zhihu profile URL.
- Instagram `--username <username>` or `--profile-url <profile_url_or_share_text>`: use exactly one creator profile entrypoint.
- X / Twitter `--user-id <user_id>`, `--username <username>`, or `--profile-url <profile_url_or_share_text>`: use exactly one creator profile entrypoint.
- YouTube `--channel-url <youtube_channel_url>`: use for a YouTube channel profile URL.
- TikTok `--tiktok-id <tiktok_id>` or `--profile-url <profile_url_or_share_text>`: use exactly one creator profile entrypoint.
- Weibo `--user-id <user_id>`: preferred when the creator user_id is already known.
- Weibo `--profile-url <profile_url>`: use for a Weibo user profile URL.
- Toutiao `--user-id <user_id>`: preferred when the creator user_id is already known.
- Toutiao `--profile-url <profile_url_or_share_text>`: use for a Toutiao user profile URL, short link, or share text.
- WeChat Channels / 视频号 `--user-id <v2_finder_user_id>`: use when the creator `v2_...@finder` user_id is already known.
- WeChat Channels / 视频号 `--url <wechat_work_url_or_share_text>`: use for a video or image-post link or share text that can resolve the creator profile.
- `--source-client socialdatax-skills --source-platform github --source-skill media-user-info`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use exactly one supported identifier or URL entrypoint for a single command; do not combine them.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.
Use `npx -y socialdatax-skills@latest <platform> <action> --help` for exact flags and values. Paginated commands require the complete returned `next_page_token`. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Commands without `--page-token`, including suggestions and first-page-only searches, do not support pagination.
Haokan / 好看视频: discover accounts with `user-search`; for profile details choose either `--user-id` or `--profile-url`. Profile details are not paginated and do not include the creator video list.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_get_user_info_by_user_id`, `xhs_get_user_info_by_profile_url`, `xhs_search_users`, `xhs_pgy_get_creator_profile`, `xhs_pgy_get_creator_fans_profile`, `xhs_pgy_get_creator_fans_summary`, `xhs_pgy_get_creator_metrics_trend`, `xhs_pgy_get_creator_commercial_overview`, `xhs_get_user_id_by_encrypted_user_id`
- DOUYIN: `douyin_get_user_info_by_sec_user_id`, `douyin_get_user_info_by_profile_url`, `douyin_search_users`, `douyin_get_user_info_by_douyin_id`
- KUAISHOU: `kuaishou_search_users`, `kuaishou_get_user_info_by_user_id`, `kuaishou_get_user_info_by_profile_url`
- BILIBILI: `bilibili_get_user_info_by_user_id`, `bilibili_get_user_info_by_profile_url`, `bilibili_search_users`
- ZHIHU: `zhihu_get_user_info_by_profile_url`, `zhihu_search_users`
- INSTAGRAM: `instagram_get_user_info_by_username`, `instagram_get_user_info_by_profile_url`, `instagram_search_users`
- X: `x_get_user_info_by_user_id`, `x_get_user_info_by_username`, `x_get_user_info_by_profile_url`, `x_search_users`
- YOUTUBE: `youtube_get_channel_info_by_url`, `youtube_search_channels`
- TIKTOK: `tiktok_get_user_info_by_tiktok_id`, `tiktok_get_user_info_by_profile_url`, `tiktok_search_users`
- WEIBO: `weibo_get_user_info_by_user_id`, `weibo_get_user_info_by_profile_url`, `weibo_search_users`
- TOUTIAO: `toutiao_get_user_info_by_user_id`, `toutiao_get_user_info_by_profile_url`, `toutiao_search_users`
- WECHAT: `wechat_get_user_info_by_user_id`, `wechat_get_user_info_by_url`, `wechat_search_finder_user`, `wechat_get_mp_account_info_by_account_id`
- BAIDU: `baidu_tieba_search_users`, `baidu_tieba_get_user_info_by_user_id`, `baidu_tieba_get_user_info_by_profile_url`
- HAOKAN: `haokan_search_users`, `haokan_get_user_info_by_user_id`, `haokan_get_user_info_by_url`

If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_user_info_by_user_id`: preferred when `user_id` is already known from search, detail, comments, or creator note lists.
- `xhs_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_info_by_douyin_id`: use when the user provides the public Douyin account ID / 抖音号, not a nickname, search keyword, sec_user_id, or profile URL.
- `douyin_get_user_info_by_sec_user_id`: preferred when `sec_user_id` is already known from search, detail, comments, or creator work lists.
- `douyin_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
- `kuaishou_search_users`: use when the user only has a creator keyword and needs possible Kuaishou user_id candidates. Pass `keyword`; pass `page_token` only for continuation. Do not pass `page`.
- `kuaishou_get_user_info_by_user_id`: preferred when a non-empty `user_id` is already known from search, detail, comments, or creator work lists.
- `kuaishou_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text, including live/fw-user profile shares; successful results return a reusable non-empty `user_id`.
- `bilibili_get_user_info_by_user_id`: preferred when a Bilibili user_id is already known.
- `bilibili_get_user_info_by_profile_url`: use for Bilibili profile URLs, short links, or profile share text.
- `zhihu_get_user_info_by_profile_url`: use for Zhihu profile URLs.
- `instagram_get_user_info_by_username`: use when the Instagram username is known.
- `instagram_get_user_info_by_profile_url`: use for Instagram profile URLs.
- `x_get_user_info_by_user_id`: use when the X user_id is known.
- `x_get_user_info_by_username`: use when the X username is known.
- `x_get_user_info_by_profile_url`: use for X profile URLs.
- `youtube_get_channel_info_by_url`: use for YouTube channel URLs.
- `tiktok_get_user_info_by_tiktok_id`: use when the TikTok tiktok_id is known.
- `tiktok_get_user_info_by_profile_url`: use for TikTok profile URLs.
- `weibo_get_user_info_by_user_id`: preferred when `user_id` is already known.
- `weibo_get_user_info_by_profile_url`: use for Weibo user profile URLs.
- `toutiao_get_user_info_by_user_id`: preferred when `user_id` is already known.
- `toutiao_get_user_info_by_profile_url`: use for Toutiao user profile URLs, short links, or share text.
- `wechat_get_user_info_by_user_id`: use when the WeChat Channels / 视频号 creator `v2_...@finder` user_id is already known.
- `wechat_get_user_info_by_url`: use for a WeChat Channels / 视频号 video or image-post link or share text to resolve the creator profile.

## Output Guidance

Report profile fields such as name, platform IDs, bio, verification, follower count, following count, received like count, IP location, and gender when available. Separate profile facts from strategic interpretation.
For Kuaishou creator search results, present account candidates separately from confirmed profile facts; use a returned `user_id` for profile lookup when the user chooses a candidate.
For YouTube, report channel profile facts separately from video-list evidence.

## Troubleshooting

- Credential source: identify whether this request uses CLI or MCP. For CLI, check the effective configuration in the actual execution environment using the API Key section (primary variable first, then legacy compatibility). For MCP, check the authentication configuration of the current connection, without requiring a local CLI variable. If configuration is missing, follow the earlier client diagnosis and fallback order. Do not expose Keys, Authorization headers or secret configuration values.

- If an SDK/dependency, npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. Install or repair task dependencies only within the user's existing authorization, preferably in the project or a temporary environment. Execution permissions are not user authorization; explain and obtain approval before changes outside that scope, including global installs, runtime upgrades, or system configuration changes. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- If the CLI exits with status 1 and prints `partial: true`, preserve `data.items` and the error, and report incomplete results. This recovery rule overrides advice to rerun the original command. After resolving the error (including insufficient balance), resume only with a non-empty `data.next_page_token` and the same query parameters. Keep the original page and item limits: subtract cumulative `page_count` and `item_count` from the respective `--pages` and `--max-items` limits, if set. Stop parent-list pagination when either limit is reached. An empty token does not mean completion. Do not restart from the first page; investigate repeated-token errors before continuing.
- For non-balance network or API errors, preserve the error message, check the effective credential source above, parameters, and link or ID format, then retry once when appropriate. This retry advice excludes `pgy_commercial_data_unavailable` / public error code `1009`: stop without retrying the same or alternate input route.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the official billing link in the error (https://socialdatax.com/dashboard/billing, including any channel parameters); if absent, use https://socialdatax.com/dashboard/billing. After recharging, resume the failed call; if a job or partial results already exist, follow the corresponding job-query or pagination recovery rules.
- If the user has recharged but still sees insufficient balance, have the user confirm in the relevant account dashboard that this request uses the recharged account, following the credential source above. If an update is needed, have the user update the effective CLI configuration or MCP connection, reload as documented, and resume the original command. Do not require reconfiguration just because the primary local variable is absent, or expose credential values.
