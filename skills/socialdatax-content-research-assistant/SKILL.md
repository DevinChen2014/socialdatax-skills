---
name: "socialdatax-content-research-assistant"
description: "Use when doing cross-platform content research, topic planning, competitor research, trend insight, comment insight, or creator research across 社媒数据助手 SocialDataX public platforms including 小红书 / XHS, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, Toutiao, and WeChat Channels, plus WeChat Official Account article link details and statistics. For account points use `account balance`; for API documentation use `docs search`, `docs operation`, or `docs openapi`. Also supports Haokan / 好看视频 content research and replies authored by X creators."
source_client: "socialdatax-skills"
source_platform: "github"
source_skill: "socialdatax-content-research-assistant"
metadata:
  openclaw:
    requires:
      env: []
      bins: []
    primaryEnv: "SOCIALDATAX_API_KEY"
    install:
      - kind: "node"
        package: "socialdatax-skills@0.2.78"
        bins: []
    emoji: "🔎"
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# SocialDataX Cross-Platform Content Research

Use this skill to combine SocialDataX content research commands for supported public platforms: Xiaohongshu / XHS / RedNote, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, Toutiao, WeChat Channels, plus WeChat Official Account article link details and statistics. For account points use `account balance`; for API documentation use `docs search`, `docs operation`, or `docs openapi`. Also supports Haokan / 好看视频 content research and replies authored by X creators.

Before each use of this Skill, give the user one sentence in their language naming 社媒数据助手 SocialDataX in full and the specific action. Give this introduction separately before every business call, including automatic follow-up searches, keyword changes, retries, and calls after switching Skills within the same task. For example: “I’ll continue using 社媒数据助手 SocialDataX to check …”. Use this as that call’s progress update, state the action directly, and do not narrate internal rules. Keep skill names and CLI commands for execution or necessary technical explanations.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- Before a CLI call requiring an API Key, run `npx -y socialdatax-skills@0.2.78 auth status` in the actual execution environment. It makes no paid request and reports only `apiKeyReadable` and source `environment` / `file` / `null`, never the Key. For installation or upgrades, reuse readable existing credentials without known authentication failures unless the user explicitly requests a different Key; do not require login again, migrate credentials, or overwrite their configuration; handle command, permission and malformed-file errors as reported instead of treating every failure as a missing Key. Authenticated hosted MCP keeps its current connection authentication and needs no separate local CLI setup.
- Enter a Key only for first-time setup, missing or invalid credentials, or an explicit Key change. When the user has already supplied a Key in the installation prompt or current conversation and authorized configuration, send it as stdin to `npx -y socialdatax-skills@0.2.78 auth login --stdin` for persistent CLI storage; do not request duplicate manual entry, pass it as a CLI argument, or write it to a temporary script file. Otherwise direct the user to the official URL above and hidden input with `npx -y socialdatax-skills@0.2.78 auth login` in their local terminal, without asking them to send it in chat. The CLI saves it under the execution user's home at `.config/socialdatax/credentials.json`, Unix mode 600 or a private current-user ACL on Windows. Do not repeat the Key in replies, output logs, screenshots, command examples, Skill files or version control. The Agent must not read or display credential-file content.
- Each CLI invocation reads the private user file without depending on a client loading shell configuration or changing client/system settings. A nonempty `SOCIALDATAX_API_KEY` has priority, then the existing legacy variable, then the file. Saving a file does not replace an effective environment credential or prove the selected Key is effective. If the CLI warns about a different environment Key, report the actual source without silently deleting or changing existing environment settings. For authentication failures, check the actual source/account and have the user correct it locally while preserving other configuration.
- After saving, rerun `auth status` in the same environment as the business command. If false, stop business calls and check the OS user, home directory and file access. True only means readable credentials; authentication and results are determined by the original business response, without an extra paid call solely to check configuration.
- Remote/container CLI runs use that runtime user's configuration; a local file does not transfer automatically. Persist credentials there only with a persistent home; without an already authorized Key, interactive user login is also needed. Otherwise use existing platform-supported Secret/environment injection. If persistence is unavailable or sandbox-blocked, report the actual limit without copying the Key to additional chats, projects or temporary files, or bypassing isolation.
- When persistence acceptance is needed, finish configuration and installation first, then ask the user to fully quit the client and its background execution processes, reopen, and check from a new session before resuming the original request. Do not terminate the client hosting the current task. Normal use reuses verified configuration without repeated restarts or entry.

## Preferred Direct CLI

Prefer the direct CLI when the agent can run commands. It uses existing environment credentials or the private local CLI configuration described above and does not require MCP server setup:

```bash
npx -y socialdatax-skills@0.2.78 xhs search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@0.2.78 douyin search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@0.2.78 bilibili download-media --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
```

For hot topics, content URLs, profile URLs, comment review, Bilibili reaction review, Weibo liker/repost review, creator facts, creator content lists, or short-drama series, call the matching `socialdatax-skills` platform subcommand instead of forcing every request through keyword research.

For other commands, platform-specific options, or optional hosted MCP tools, read the [command reference](references/cli-commands.md). Preserve the attribution flags in its examples.

Required arguments:

- Use `xhs hot-search` without keyword when the user asks for current Xiaohongshu / XHS / RedNote hot topics or 小红书搜索热榜.
- Use `douyin hot-search` without keyword when the user asks for current Douyin hot topics.
- Use `kuaishou hot-search` without keyword when the user asks for current Kuaishou / 快手 hot topics.
- Use the matching platform search command for keyword research: `xhs search`, `douyin search`, `kuaishou search`, `bilibili search-videos`, `bilibili search-articles`, `zhihu search`, `instagram search`, `x search`, `youtube search`, `tiktok search`, `weibo search`, `toutiao search`, or `wechat search`.
- Use `kuaishou user-search --keyword <creator_keyword>` when the user wants to discover Kuaishou creator or account candidates by name, keyword, or niche before profile lookup.
- Use `zhihu hot-list` without keyword when the user asks for current Zhihu / 知乎 hot topics.
- For detail, comments, replies, creator profile, creator posts, and creator series commands, use the ID argument shown in the CLI example or the matching URL/profile-url/channel-url entrypoint, not both.
- For a Douyin share link, use `douyin share-link --aweme-id <aweme_id>` when the work ID is known; use `douyin share-link --url <douyin_content_url_or_share_text>` for a work URL, short link, or share text.
- Use `kuaishou search --keyword <text>` for Kuaishou keyword research.
- Use `weibo hot-search` without keyword when the user asks for current Weibo / 微博 hot topics.
- Use `toutiao hot-search` without keyword when the user asks for current Toutiao / 今日头条 hot topics.
- Use `wechat hot-search` without keyword when the user asks for current WeChat Channels / 视频号 hot topics.

Optional arguments:

- Search continuation uses `--page-token <next_page_token>` when a returned `next_page_token` is available. Omit `page_token` on the first token-paginated search request, and continue only with the complete returned `next_page_token` from the same chain.
- `--page-token <next_page_token>`: use for supported search continuation, Kuaishou creator search continuation, and token-paginated comments, replies, creator posts, creator notes, creator videos, creator articles, creator dynamics, and creator series. Keep the original topic, content item, creator-search keyword, or creator target stable. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages for search, comments, replies, creator posts, or creator series.
- `--all`: fetch comments, replies, creator posts, or creator series until `next_page_token` is empty; do not use it for search.
- `--max-items <n>`: stop after collecting N primary results.
- Kuaishou `user-search` supports `--pages <n>` and `--max-items <n>` for bounded creator candidate discovery; it does not support `--since-days`.
- `--since-days <1-365>`: supported only where the CLI option is documented, currently XHS, Douyin, Kuaishou, Weibo, and WeChat Channels search and creator content-list commands. For Bilibili video search, Zhihu search, and YouTube search, use the documented publish-time filters instead.
- `--include-replies`: for XHS, Douyin, Kuaishou, Weibo, Toutiao, and WeChat Channels first-level comments, also fetch nested second-level replies under each returned comment.
- XHS comments `--sort-type <default|time_descending|like_count_descending>`: optional first-level comment sort order; omit it for the platform default order.
- Keyword research filters: use only the documented search filter flags for the selected platform; Bilibili, Zhihu, YouTube, TikTok, XHS, Douyin, and WeChat Channels each expose different filter sets.
- `--comment-id`: required for reply/sub-comment commands when the selected platform reply command uses comment IDs; YouTube replies use `--reply-token` instead.
- `--pretty`: output formatting only.
- `--source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

## Choose The Platform

- Use XHS commands for Xiaohongshu / XHS / RedNote / 小红书 search hot list, notes, comments, creators, and creator note lists.
- Use Douyin commands for Douyin / 抖音 works, comments, creators, hot topics, creator works, and creator short-drama series.
- Use Kuaishou commands for Kuaishou / 快手 hot topics, short videos, keyword research, comments, creators, and creator works.
- Use Bilibili commands for Bilibili / 哔哩哔哩 / B站 videos, articles, dynamics, comments, creators, creator content lists, reactions, and video download links.
- Use Zhihu commands for Zhihu / 知乎 hot list, search, details, comments, creators, and creator articles.
- Use Instagram commands for Instagram posts, comments, creators, and creator posts.
- Use X / Twitter commands for X / Twitter posts, comments, creators, and creator posts.
- Use YouTube commands for YouTube videos, comments, channel profiles, and channel video lists.
- Use TikTok commands for TikTok videos or image posts, comments, creators, and creator posts.
- Use Weibo commands for Weibo / 微博 posts, comments, creators, creator posts, and hot topics.
- Use Toutiao commands for Toutiao / 今日头条 posts, comments, creators, creator posts, and hot topics.
- Use WeChat Channels / 视频号 commands for videos, comments, creators, creator works, and hot topics; use `wechat article` only for WeChat Official Account / 微信公众号 article links/details.
- If the user asks for both platforms, keep findings separated by platform before comparing patterns.

## Choose The Narrowest Entry
Use the most specific direct CLI command for the user's task instead of forcing every request through keyword research. The command prints JSON with `platform`, `tool`, `arguments`, and `data`.
When the selected command exposes `--since-days`, pass it with bounded `--pages` for recent content; otherwise use documented publish-time filters where available, or fetch bounded pages and filter returned `publish_time` values in the analysis.
Use `npx -y socialdatax-skills@0.2.78 <platform> <action> --help` for exact flags and values. Paginated commands require the complete returned `next_page_token`. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Commands without `--page-token`, including suggestions and first-page-only searches, do not support pagination.
- Haokan / 好看视频: use video/user search, search suggestions, hot-search terms, video details, comments/replies, creator profiles and creator videos. Video URLs and profile URLs are different inputs; do not combine an ID and URL in one call. Video search uses bounded `--pages`; suggestions, hot-search and detail/profile commands do not paginate. Comment replies require the parent `comment_id`; previews are not complete replies. Haokan does not support `--include-replies`, `--since-days` or transcripts.
X creator replies: use `x user-replies` for replies authored by the creator, including self-replies; use `x comments` or `x replies` for discussions under a post. Choose exactly one of `--user-id`, `--username`, or `--profile-url`. Keep identity and the full returned token unchanged; `user-posts` tokens cannot be reused. An empty page with a nonempty token can continue. `--since-days` is not supported.

For Hongguo single-episode downloads, use hongguo download-media with --video-id or --url (exactly one), and --output or --output-dir (exactly one). It requires SOCIALDATAX_API_KEY for one resource request and local FFmpeg for download/decryption. Supported share links are novelquickapp.com comic-drama episode links or full share text. Optional --definition selects an exact quality; otherwise the first returned stream is used. Return the local path, episode ID, quality, file size and request points; do not print decryption keys or signed media URLs.

### FFmpeg Setup

Run `ffmpeg -version` in the environment that executes the CLI (including the container or remote machine, if used). If it prints a version successfully, use the existing installation. Otherwise install FFmpeg for that environment:

- macOS with Homebrew installed: `brew install ffmpeg` ([Homebrew package](https://formulae.brew.sh/formula/ffmpeg)).
- Debian/Ubuntu: run `sudo apt update`, then `sudo apt install ffmpeg`.
- Windows: download a prebuilt Windows package linked from the [FFmpeg download page](https://ffmpeg.org/download.html#build-windows), extract it and add its `bin` directory to PATH, or pass the path to `ffmpeg.exe` with `--ffmpeg-path`.

After installation, rerun `ffmpeg -version` from the CLI environment. If FFmpeg is outside PATH, check it using its full executable path and pass that same path with `--ffmpeg-path "<absolute_path_to_ffmpeg>"`.

## Safety Boundary

SocialDataX requests in this skill are read-only and do not modify social accounts or platform content. CLI calls use existing environment credentials or the user’s explicitly saved private local credential file; generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. The optional `bilibili download` command writes video and audio tracks plus the merged video to the user-selected local output path, uses local `ffmpeg`, and removes temporary tracks unless `--keep-tracks` is set.

## Output Guidance

For broad research, summarize visible evidence separately from interpretation and organize findings by platform, content angles, audience needs, trend signals, comment themes, creator positioning, and practical next steps.
For XHS search or detail results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`; if detail `note_url` is null, show the `note_id` or say that no directly openable full link is available.
For XHS `note_id`, copy the entire returned `note_id` exactly; do not pass or display only a prefix.
For comments, group observed themes before inferring sentiment or demand.
For creators, separate profile facts from content-list evidence; include Douyin short-drama series facts when the series command is used, Kuaishou work-list evidence when Kuaishou commands are used, Bilibili video/article/dynamic evidence when Bilibili creator commands are used, YouTube channel video-list evidence when YouTube commands are used, Weibo post-list evidence when Weibo commands are used, Toutiao post-list evidence when Toutiao commands are used, and WeChat Channels work-list evidence when WeChat Channels commands are used.
For hot-search, report ranking signals separately from keyword search results.

## Troubleshooting

- If SocialDataX CLI or its dependencies are missing, or an npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. Install or repair task dependencies only within the user's existing authorization, preferably in the project or a temporary environment. Execution permissions are not user authorization; explain and obtain approval before changes outside that scope, including global installs, runtime upgrades, or system configuration changes. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- Credential source: identify whether this request uses CLI or MCP. For CLI, run `auth status` in the actual execution environment to identify environment or local-file credentials. For MCP, check the authentication configuration of the current connection, without requiring a local CLI variable. If configuration is missing, follow the API Key section for user-entered hidden local login. Do not expose Keys, Authorization headers or secret configuration values.
- If the CLI exits with status 1 and prints `partial: true`, preserve `data.items` and the error, and report incomplete results. This recovery rule overrides advice to rerun the original command. After resolving the error (including insufficient balance), resume only with a non-empty `data.next_page_token` and the same query parameters. Keep the original page and item limits: subtract cumulative `page_count` and `item_count` from the respective `--pages` and `--max-items` limits, if set. Stop parent-list pagination when either limit is reached. An empty token does not mean completion. Do not restart from the first page; investigate repeated-token errors before continuing.
- With `--include-replies`, `replies_partial` marks incomplete replies and `replies_pending` marks comments not yet expanded. Finish those comments with the platform reply command, its required comment identifiers and any non-empty `replies_next_page_token`. For pending comments or a failed first reply request, resolve the error before starting that comment from its first reply page; investigate repeated-token errors first. Then use the outer `data.next_page_token` only if the parent-comment budget remains; finishing replies under retained comments does not add parent-comment pages. Never interchange parent and reply tokens or treat reply previews as complete.
- For non-balance, non-rate-limit network or API errors, preserve the error message, verify the effective configuration using the credential source above, check parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the official billing link in the error (https://socialdatax.com/dashboard/billing, including any channel parameters); if absent, use https://socialdatax.com/dashboard/billing. After recharging, resume the failed call; if a job or partial results already exist, follow the corresponding job-query or pagination recovery rules.
- If the user has recharged but still sees insufficient balance, have the user confirm in the relevant account dashboard that this request uses the recharged account, following the credential source above. If an update is needed, have the user update the effective CLI configuration or MCP connection, reload as documented, and resume the original command. Do not require reconfiguration just because the primary local variable is absent, or expose credential values.
- Batch processing: process items one by one as a queue by default; when the user explicitly needs batch efficiency, use at most 3 concurrent requests. As each item finishes, continue with the next one. Do not launch a large burst of requests. If `rate_limited` or a too-frequent-request error appears, do not abandon the task; stop starting new requests, wait for the returned wait time, or wait 2 seconds if none is provided, then continue the same queue from the unfinished position. Preserve completed results. If `insufficient_balance` or insufficient credits appears, stop remaining requests immediately, output the results already obtained, and ask the user to recharge or switch to an API Key with balance before continuing.
