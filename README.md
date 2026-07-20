# SocialDataX Skills | 社媒数据助手 Skills

This public package provides the unified skill installer and direct CLI helper for SocialDataX services.

The current public tools support 小红书 / Xiaohongshu / XHS / RedNote, 抖音 / Douyin, 快手 / Kuaishou / Kwai, 微博 / Weibo, 视频号 / WeChat Channels, and 微信公众号 / WeChat Official Account article content research and analysis workflows, plus XHS / Douyin / Kuaishou / Weibo local media download, Bilibili / 哔哩哔哩 / B站 local video download, and 敏感词检测 / 违禁词检查 text checks. The public skill layer is intentionally named by capability so supported services can evolve without changing the installation model.

- direct `npx` JSON commands for agents that can run shell commands
- AgentSkills-compatible installers split by capability for OpenClaw, Hermes Agent, Codex, Claude Code, and general agent skill directories
- links to platform-specific MCP docs when a client should use MCP directly

The business implementation is privately hosted. This repository exposes only the public package, skill, and connection surface for social media content intelligence workflows. It is not a unified MCP server and does not include a registry server card; platform MCPs are published separately.

## High-Intent Skill Catalog

See [CATALOG.md](./CATALOG.md) for curated high-intent Agent Skill entries across SkillHub, ClawHub, ModelScope, and direct CLI usage. The catalog focuses on proven workflows such as XHS content research, comment analysis, hot topic planning, viral note research, Douyin transcript extraction, and sensitive term checks.

## Search Aliases

Common search phrases for this skill package:

- `SocialDataX Skills`
- `social media skills`
- `AgentSkills social media`
- `OpenClaw social media skills`
- `Hermes Agent social media skills`
- `media search skill`
- `media comments skill`
- `media transcript skill`
- `speech-to-text transcript skill`
- `口播转文字 skill`
- `creator profile skill`
- `Xiaohongshu skills`
- `XHS skills`
- `RedNote skills`
- `XHS media download`
- `小红书图片下载`
- `小红书视频下载`
- `Douyin skills`
- `抖音 skills`
- `Kuaishou skills`
- `Kwai skills`
- `快手 skills`
- `Bilibili skills`
- `B站视频下载`
- `哔哩哔哩视频下载`
- `Weibo skills`
- `微博 skills`
- `WeChat Channels skills`
- `视频号 skills`
- `WeChat Official Account skills`
- `微信公众号 skills`
- `mp.weixin.qq.com article detail`
- `SocialDataX content research`
- `content research assistant`
- `敏感词检测`
- `违禁词检测`
- `文案发布前检查`
- `sensitive check skill`
- `content safety skill`
- `text safety check`

## Platform MCPs

- XHS hosted MCP endpoint: `https://mcp.socialdatax.com/xhs/mcp`
- Douyin hosted MCP endpoint: `https://mcp.socialdatax.com/douyin/mcp`
- Kuaishou hosted MCP endpoint: `https://mcp.socialdatax.com/kuaishou/mcp`
- Bilibili hosted MCP endpoint: `https://mcp.socialdatax.com/bilibili/mcp`
- Weibo hosted MCP endpoint: `https://mcp.socialdatax.com/weibo/mcp`
- WeChat / 微信 hosted MCP endpoint: `https://mcp.socialdatax.com/wechat/mcp`
- Sensitive Words Check hosted MCP endpoint: `https://mcp.socialdatax.com/sensitive-check/mcp`
- Hosted transport: `streamable-http`
- Authentication: `Authorization: Bearer <SOCIALDATAX_API_KEY>`
- Website: <https://socialdatax.com>
- XHS current platform MCP registry name: `com.52choujiang/xhs-insights`
- XHS future platform MCP registry name: `com.socialdatax/xhs-insights`
- Douyin current platform MCP registry name: `com.52choujiang/douyin-insights`
- Douyin future platform MCP registry name: `com.socialdatax/douyin-insights`
- Kuaishou current platform MCP registry name: `com.52choujiang/kuaishou-insights`
- Kuaishou future platform MCP registry name: `com.socialdatax/kuaishou-insights`
- Bilibili current platform MCP registry name: `com.52choujiang/bilibili-insights`
- Bilibili future platform MCP registry name: `com.socialdatax/bilibili-insights`
- Weibo current platform MCP registry name: `com.52choujiang/weibo-insights`
- Weibo future platform MCP registry name: `com.socialdatax/weibo-insights`
- WeChat / 微信 current platform MCP registry name: `com.52choujiang/wechat-channels-insights`
- WeChat / 微信 future platform MCP registry name: `com.socialdatax/wechat-channels-insights`
- Sensitive Words Check MCP server name: `sensitive-check`
- Sensitive Words Check future MCP registry name: `com.socialdatax/sensitive-check`
- Unified MCP registry name: none; this package installs skills and calls explicit platform services.
- Current public capability version: `0.2.31`

## Direct CLI

For most skill users, no MCP client configuration is required. Install the skills, set `SOCIALDATAX_API_KEY`, and let the agent run the direct `npx` commands.

Examples:

```bash
npx -y socialdatax-skills@latest xhs search --keyword "露营" --pretty
npx -y socialdatax-skills@latest xhs search --keyword "露营" --since-days 7 --pages 2 --pretty
npx -y socialdatax-skills@latest xhs hot-search --pretty
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --sort-type time_descending --pretty
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --all --include-replies --pretty
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --since-days 30 --pretty
npx -y socialdatax-skills@latest xhs transcript --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs transcript --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs transcript --job-id "<job_id>" --pretty
npx -y socialdatax-skills@latest xhs download-media --url "<xhs_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest douyin hot-search --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营" --pretty
npx -y socialdatax-skills@latest douyin detail --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --all --include-replies --pretty
npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest douyin user-info --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-series --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin transcript --url "<douyin_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin transcript --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin transcript --job-id "<job_id>" --pretty
npx -y socialdatax-skills@latest douyin download-media --url "<douyin_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest kuaishou hot-search --pretty
npx -y socialdatax-skills@latest kuaishou search --keyword "露营" --pretty
npx -y socialdatax-skills@latest kuaishou user-search --keyword "露营" --pretty
npx -y socialdatax-skills@latest kuaishou detail --photo-id "<photo_id>" --pretty
npx -y socialdatax-skills@latest kuaishou detail --url "<kuaishou_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest kuaishou comments --photo-id "<photo_id>" --pretty
npx -y socialdatax-skills@latest kuaishou comments --photo-id "<photo_id>" --all --include-replies --pretty
npx -y socialdatax-skills@latest kuaishou comments --url "<kuaishou_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest kuaishou user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest kuaishou user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest kuaishou user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest kuaishou user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest kuaishou transcript --url "<kuaishou_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest kuaishou transcript --photo-id "<photo_id>" --pretty
npx -y socialdatax-skills@latest kuaishou transcript --job-id "<job_id>" --pretty
npx -y socialdatax-skills@latest kuaishou download-media --url "<kuaishou_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest weibo hot-search --pretty
npx -y socialdatax-skills@latest weibo search --keyword "露营" --pretty
npx -y socialdatax-skills@latest weibo detail --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo detail --post-url "<weibo_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest weibo comments --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo comments --post-id "<post_id>" --all --include-replies --pretty
npx -y socialdatax-skills@latest weibo comments --post-url "<weibo_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest weibo replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest weibo likers --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo reposts --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest weibo user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest weibo user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest weibo user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest weibo transcript --post-url "<weibo_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest weibo transcript --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo transcript --job-id "<job_id>" --pretty
npx -y socialdatax-skills@latest weibo download-media --url "<weibo_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest wechat hot-search --pretty
npx -y socialdatax-skills@latest wechat search --keyword "露营" --pretty
npx -y socialdatax-skills@latest wechat detail --encrypted-object-id "<encrypted_object_id>" --pretty
npx -y socialdatax-skills@latest wechat detail --url "<wechat_video_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat decrypt-media --media-url "<video.video_url>" --output video.mp4
npx -y socialdatax-skills@latest wechat article --url "<mp_article_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --pretty
npx -y socialdatax-skills@latest wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --all --include-replies --pretty
npx -y socialdatax-skills@latest wechat comments --url "<wechat_video_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat replies --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest wechat user-info --user-id "<finder_user_id>" --pretty
npx -y socialdatax-skills@latest wechat user-posts --user-id "<finder_user_id>" --pretty
npx -y socialdatax-skills@latest wechat user-posts --url "<wechat_video_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat transcript --url "<wechat_video_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat transcript --encrypted-object-id "<encrypted_object_id>" --pretty
npx -y socialdatax-skills@latest wechat transcript --job-id "<job_id>" --pretty
npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty
```

Most direct CLI commands print a JSON envelope with `platform`, `tool`, `arguments`, and `data`. `sensitive-check` prints `platform`, `tool`, and `data` only; it does not echo the original text in CLI output. `wechat decrypt-media` is a local save command: pass the `video.video_url` returned by WeChat detail and an `--output` file path. It saves the media locally, decrypts when needed, and does not require `SOCIALDATAX_API_KEY`. `xhs/douyin/kuaishou/weibo download-media` is also local: pass one media URL returned by detail and either `--output <file>` or `--output-dir <directory>`. It writes through a `.part` file, resumes partial downloads when the server supports range requests, skips an already existing output file, and infers common image/video/audio extensions in `--output-dir` mode.

For transcript commands, the direct CLI tries to deliver the final result in one run: submit may wait up to 210 seconds, and if `data.is_terminal` is not `true`, the CLI automatically continues matching get-job requests for up to 1200 seconds by default, with each get-job request waiting up to 240 seconds. Use positive `--max-wait-seconds <seconds>` to tune that follow-up window. Do not submit a duplicate transcript job just to poll status.

`bilibili download` calls SocialDataX once to fetch short-lived download links, then downloads video and audio tracks on the local machine and merges them with local `ffmpeg`. Set `SOCIALDATAX_API_KEY`, install `ffmpeg`, and pass either `--output <file>` or `--output-dir <directory>`. The download-links request consumes 10 credits; the local track download and merge do not consume additional SocialDataX credits. Use `--ffmpeg-path <path>` when `ffmpeg` is not on `PATH`, and `--keep-tracks` to retain the separate track files after merge.

For XHS outputs with a returned `note_url` field, when `note_url` is non-null, preserve it exactly as the full URL, including `xsec_token` query parameters, such as in final answers or display. Do not modify, truncate, redact, normalize, rebuild, or replace it with a link assembled from `note_id`. If `note_url` is null, do not synthesize a public link from `note_id`.

For list-style commands, use `--pages <n>` to fetch N pages from the current starting point and `--max-items <n>` to cap the merged `data.items` output. Search commands support `--pages` but not `--all`, because search has no stable complete-result boundary.

For search and creator content-list commands, use `--since-days <1-365>` to keep only items whose public `publish_time` is within the last N days. Search remains bounded by `--pages` and does not promise complete platform coverage; creator content lists continue until the publish-time boundary when `--pages` is omitted.

For comments, replies, creator content lists, and Douyin creator series, use `--all` to continue until the returned `next_page_token` is empty. `--all` has no default item or page cap; add `--max-items <n>` or use `--pages <n>` when you want a bounded run.

For first-level comments, add `--include-replies` to fetch the second-level replies under each returned first-level comment. Multi-page output keeps `data.items` as the merged first-level list; each item gets `replies`, `replies_page_count`, and `replies_next_page_token`.

For commands that accept `--page-token`, continue only with the complete returned `next_page_token` from the same pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.

Search pagination uses `--page-token` when continuing with a returned `next_page_token`. Omit `--page-token` on the first search request and pass the complete returned `next_page_token` only when continuing the same search chain.

Transcript commands submit a bounded video speech-to-text job or check an existing job. Pass exactly one entrypoint for each call: URL/share text, platform content ID, or `--job-id`. Direct CLI transcript commands wait and poll the same job by default; completed get-job responses return transcript plus content context, not summary.

Generated Agent Skill examples include `--source-client socialdatax-skills --source-platform <marketplace> --source-skill <skill-slug>` so SocialDataX can attribute authenticated direct data CLI usage to the current marketplace Skill. Keep those values unchanged when running commands from a Skill; omit them for ad hoc CLI use. Authenticated direct data CLI commands also accept `SOCIALDATAX_SOURCE_CLIENT`, `SOCIALDATAX_SOURCE_PLATFORM`, and `SOCIALDATAX_SOURCE_SKILL` as environment-variable fallbacks.

XHS, Douyin, Kuaishou, Weibo, and WeChat Channels search use `--keyword` and optional `--page-token`.
Kuaishou work search uses `kuaishou search --keyword` and optional `--page-token`; Kuaishou creator search uses `kuaishou user-search --keyword` and optional `--page-token`. Kuaishou search does not accept Douyin semantic filters, and `kuaishou user-search` does not support `--since-days`.
Weibo and WeChat Channels search use `--keyword` and optional `--page-token`.

XHS comments accept optional `--sort-type` values: `default`,
`time_descending`, and `like_count_descending`; omit it for the platform
default comment order.

Douyin search filters use semantic values: `--sort-type` supports `general`,
`time_descending`, and `like_count_descending`; `--publish-time-range` supports
`all`, `day`, `week`, and `half_year`; `--duration-range` supports `all`,
`under_1_minute`, `one_to_five_minutes`, and `over_5_minutes`; `--content-type`
supports `all`, `video`, and `image`.

WeChat Channels search filters use semantic values: `--sort-type` supports
`all`, `time_descending`, and `collect_count_descending`;
`collect_count_descending` means hottest first / most collected first.
`--duration-range` supports `all`,
`under_5_min`, `between_5_and_20_min`, and `over_20_min`.

### Runtime Requirements

- Recommended: Node.js 22 LTS or newer.
- Minimum: Node.js 20.18.1.
- Node.js 18 and older are not supported.
- Local Bilibili download merge requires `ffmpeg` on `PATH` or `--ffmpeg-path <path>`.

### Environment

- `SOCIALDATAX_API_KEY`
  Required for direct CLI data calls and hosted MCP calls. Local inspection commands such as `list`, `doctor`, and `install --dry-run` do not require a key.

## Security & Privacy

You can inspect the package safety summary before installing:

```bash
npx -y socialdatax-skills@latest doctor
npx -y socialdatax-skills@latest doctor --json
```

The public package declares no npm lifecycle scripts such as `preinstall`, `install`, or `postinstall`. The installer copies AgentSkills files only, does not save API keys, and does not change MCP server configuration. Authenticated data calls require `SOCIALDATAX_API_KEY` at runtime, do not read local browser data, and do not perform account actions.

## Platform Names

This project is not affiliated with, endorsed by, or sponsored by Xiaohongshu, RedNote, Douyin, Kuaishou, Kwai, Bilibili, Weibo, WeChat, WeChat Channels, or their affiliates. Platform names are used only to describe supported data sources.

### Local Source Run

```bash
npm install
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs xhs search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs douyin search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs kuaishou search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs weibo search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs wechat search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs sensitive-check text --text "<content>" --platform xhs --pretty
```

### Docker Run

```bash
docker build -t socialdatax-skills .
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills xhs search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills douyin search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills kuaishou search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills weibo search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills wechat search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills sensitive-check text --text "<content>" --platform xhs --pretty
```

If Docker Hub is slow from your network, keep the default image unchanged for normal use and override only during local builds:

```bash
docker build --build-arg NODE_IMAGE=mirror.gcr.io/library/node:22-alpine -t socialdatax-skills .
```

## Skill Installer

The npm package also ships separate skills for each major capability. Different clients can install one skill, several skills, or all skills into their expected directory:

```bash
npx -y socialdatax-skills@latest list
npx -y socialdatax-skills@latest doctor
npx -y socialdatax-skills@latest install --target openclaw
npx -y socialdatax-skills@latest install --target openclaw --dry-run
npx -y socialdatax-skills@latest install socialdatax-content-research-assistant --target openclaw
npx -y socialdatax-skills@latest install media-search --target openclaw
npx -y socialdatax-skills@latest install media-search --target openclaw --dry-run
npx -y socialdatax-skills@latest install media-user-info --target openclaw
npx -y socialdatax-skills@latest install media-comments media-detail --target openclaw
npx -y socialdatax-skills@latest install media-transcript --target openclaw
npx -y socialdatax-skills@latest install media-search --target openclaw --scope workspace
npx -y socialdatax-skills@latest install media-search --target hermes
npx -y socialdatax-skills@latest install media-search --target hermes --scope shared
npx -y socialdatax-skills@latest install media-search --target agents
npx -y socialdatax-skills@latest install media-search --target codex
npx -y socialdatax-skills@latest install media-search --target codex --scope workspace
npx -y socialdatax-skills@latest install media-search --target claude-code
npx -y socialdatax-skills@latest install media-search --target claude-code --scope workspace
npx -y socialdatax-skills@latest xhs search --keyword "露营" --pretty
npx -y socialdatax-skills@latest xhs hot-search --pretty
npx -y socialdatax-skills@latest xhs transcript --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin hot-search --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营" --pretty
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin transcript --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin download-media --url "<douyin_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest kuaishou hot-search --pretty
npx -y socialdatax-skills@latest kuaishou search --keyword "露营" --pretty
npx -y socialdatax-skills@latest kuaishou transcript --photo-id "<photo_id>" --pretty
npx -y socialdatax-skills@latest kuaishou download-media --url "<kuaishou_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest weibo hot-search --pretty
npx -y socialdatax-skills@latest weibo search --keyword "露营" --pretty
npx -y socialdatax-skills@latest weibo transcript --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo download-media --url "<weibo_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest wechat hot-search --pretty
npx -y socialdatax-skills@latest wechat search --keyword "露营" --pretty
npx -y socialdatax-skills@latest wechat article --url "<mp_article_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat transcript --encrypted-object-id "<encrypted_object_id>" --pretty
npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty
```

Available skills:

- `socialdatax-content-research-assistant`: combine SocialDataX search, detail, comment, creator profile, and creator content workflows for cross-platform content research across XHS, Douyin, Kuaishou, Weibo, WeChat Channels, and WeChat Official Account articles.
- `media-search`: search social media content by keyword; supports XHS notes, Douyin works, Kuaishou works, Weibo posts, and WeChat Channels videos.
- `media-detail`: read structured content details and metrics; supports XHS notes, Douyin works, Kuaishou works, Weibo posts, WeChat Channels videos, and WeChat Official Account articles.
- `media-comments`: fetch and analyze XHS comments/replies, Douyin comments/replies, Kuaishou comments/replies, Weibo comments/replies, and WeChat Channels comments/replies.
- `media-transcript`: submit and check video 口播转文字 / speech-to-text transcript jobs through direct CLI commands or hosted MCP tools; supports XHS, Douyin, Kuaishou, Weibo, and WeChat Channels.
- `media-user-info`: retrieve creator profile information; supports XHS, Douyin, Kuaishou, Weibo, and WeChat Channels creators.
- `media-user-posts`: retrieve creator content lists; supports XHS notes, Douyin works, Kuaishou works, Weibo posts, WeChat Channels videos, and Douyin creator short-drama series.
- `sensitive-check`: run 敏感词检测 / 违禁词检查 text checks; supports `generic`, `xhs`, `douyin`, and `kuaishou` platform contexts.

Default install locations:

- OpenClaw: `~/.openclaw/workspace/skills/<skill-name>` or `OPENCLAW_SKILLS_DIR/<skill-name>`
- OpenClaw workspace scope: `./skills/<skill-name>`
- Hermes Agent: `~/.hermes/skills/<skill-name>`
- Hermes shared scope: `~/.agents/skills/<skill-name>`
- Shared AgentSkills directory: `~/.agents/skills/<skill-name>`
- Codex: `~/.codex/skills/<skill-name>`
- Codex workspace scope: `./.codex/skills/<skill-name>`
- Claude Code: `~/.claude/skills/<skill-name>`
- Claude Code workspace scope: `./.claude/skills/<skill-name>`

If no skill name is provided, all skills are installed. If a destination already exists, re-run with `--force` to replace an existing directory for the same skill. Use `--path <directory>` to install one skill to a custom directory, or multiple skills under a custom parent directory. The `shared` scope is only meaningful for `--target hermes`; use `--target agents` for the shared AgentSkills directory directly.

## Workflow Scope

The current direct CLI and platform MCP services are designed for social media content intelligence workflows. Some commands read public content directly; some submit bounded analysis jobs such as video speech-to-text transcript. They do not provide account login, posting, editing, liking, commenting, or other account actions.

Current XHS workflows include:

- Fetch the current Xiaohongshu / XHS / RedNote search hot list.
- Search related Xiaohongshu notes by keyword, with optional sort, note type, and publish-time filters.
- Resolve a shared note link, short link, or share text into structured note details.
- Read note details when the caller already has a note ID.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment.
- Read creator profile data from a profile link, short link, share text, or user ID.
- Fetch paginated creator note lists from a user ID, profile link, short link, or share text for content style and account research.
- Submit and check video note 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 210 秒，未完成时继续查询同一个 job_id 直到终态.
- Save returned `image_items[].image_url`, `image_items[].live_photo.video_url`, or `video.video_url` media links locally with `xhs download-media`.

Current Kuaishou workflows include:

- Fetch the current Kuaishou / 快手 hot-search list.
- Search related Kuaishou works by keyword.
- Search Kuaishou creator or account candidates by keyword before profile lookup.
- Resolve a Kuaishou work page link, short link, share text, or photo_id into structured work details.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment.
- Continue Kuaishou list pagination only when `next_page_token` is non-empty; an empty string means there are no more results to request.
- Read creator profile data from a non-empty user_id, profile link, short link, or share text. Live/fw-user profile shares are supported for profile data; successful results return a reusable non-empty user_id.
- Fetch paginated creator work lists from a non-empty user_id, or from a profile link, short link, or share text that resolves directly to a non-empty user_id. For live/fw-user profile shares, call creator profile first and use the returned non-empty user_id.
- Submit and check video work 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 210 秒，未完成时继续查询同一个 job_id 直到终态.
- Save returned `images[].url`, `video.play_url`, or `cover_image_url` media links locally with `kuaishou download-media`.

Current Bilibili workflows include:

- Resolve a Bilibili video page link or share text into short-lived DASH download links.
- Download the selected video and audio tracks locally.
- Merge the local tracks with `ffmpeg -c copy`.

Current Douyin workflows include:

- Fetch the current Douyin main hot search list.
- Search related Douyin works by keyword.
- Resolve a Douyin content page link, short link, share text, or aweme_id into structured work details.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment; pass both `aweme_id` and `comment_id`, and use `page_token` to continue pagination.
- Continue Douyin comment and reply pagination only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- Read creator profile data from a profile link, short link, share text, or sec_user_id.
- Fetch paginated creator work lists from a sec_user_id, profile link, short link, or share text.
- Fetch paginated creator short-drama series lists from a sec_user_id, profile link, short link, or share text.
- Submit and check video work 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 210 秒，未完成时继续查询同一个 job_id 直到终态.
- Save returned `images[].url`, `images[].live_photo.play_url`, `video.play_url`, `music.play_url`, or `cover_image_url` media links locally with `douyin download-media`.

Current Weibo workflows include:

- Fetch the current Weibo / 微博 hot-search list.
- Search related Weibo posts by keyword.
- Resolve a Weibo post URL, short link, share text, or post_id into structured post details.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment.
- Continue Weibo list pagination only when `next_page_token` is non-empty; an empty string means there are no more results to request.
- Read creator profile data from a profile link, short link, share text, or user_id.
- Fetch paginated creator post lists from a user_id, profile link, short link, or share text.
- Submit and check Weibo video 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 210 秒，未完成时继续查询同一个 job_id 直到终态.
- Save returned `image_urls[]` or `video.video_url` media links locally with `weibo download-media`.

Current WeChat / 微信 workflows include:

- Fetch the current WeChat Channels / 视频号 hot-search list.
- Search related WeChat Channels videos by keyword with optional sort and duration filters.
- Resolve a WeChat Channels video link, share text, or encrypted_object_id into structured video details.
- Save the `video.video_url` returned by WeChat Channels video detail locally and decrypt when needed.
- Resolve a WeChat Official Account / 微信公众号 article link or share text into article detail and body text.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment; pass `object_id`, `object_nonce_id`, and `comment_id`.
- Continue WeChat Channels list pagination only when `next_page_token` is non-empty; an empty string means there are no more results to request.
- Read creator profile data from a finder user_id.
- Fetch paginated creator video lists from a finder user_id or a video link/share text.
- Submit and check WeChat Channels / 视频号 video 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 210 秒，未完成时继续查询同一个 job_id 直到终态.

Current Sensitive Words Check workflows include:

- Check draft text for 敏感词检测 / 违禁词检查 / sensitive-content risks before publishing.
- Choose a platform context with `--platform generic`, `--platform xhs`, `--platform douyin`, or `--platform kuaishou`.
- Return structured fields such as `violation`, `risk_level`, `types`, `highlights`, `summary`, `platform`, and `suggestions` when available.
- Text checks are read-only. The service records submitted text and structured detection results for history, billing, and troubleshooting. Image sensitive detection is reserved for a future separate tool.

## XHS Tools

| Tool | Public purpose |
| --- | --- |
| `xhs_get_search_hot_list` | Fetch the current Xiaohongshu / 小红书 search hot list with each item's title and heat value. |
| `xhs_search_notes` | Search Xiaohongshu / 小红书 notes by keyword with optional sort, note type, and publish-time filters. |
| `xhs_get_note_detail_by_note_url` | Resolve a shared XHS link, short link, or share text into structured note details. |
| `xhs_get_note_detail_by_note_id` | Fetch structured note details when the caller already has a note ID. |
| `xhs_get_note_comments_by_note_id` | Fetch paginated first-level comments when the caller already has a note ID; accepts optional comment `sort_type`. |
| `xhs_get_note_comments_by_note_url` | Fetch paginated first-level comments directly from a shared note URL, short link, or share text; accepts optional comment `sort_type`. |
| `xhs_get_note_sub_comments_by_comment_id` | Fetch paginated replies under a first-level comment by note ID and comment ID. |
| `xhs_get_user_info_by_user_id` | Fetch creator profile data when the caller already has a user ID. |
| `xhs_get_user_info_by_profile_url` | Resolve a profile link, short link, or share text into creator profile data. |
| `xhs_get_user_posted_notes_by_user_id` | Fetch a paginated list of notes published by a creator when the caller already has a user ID. |
| `xhs_get_user_posted_notes_by_profile_url` | Fetch a paginated list of notes published by a creator from a profile link, short link, or share text. |
| `xhs_submit_video_speech_text_by_note_url` | Submit an XHS video note speech-to-text transcript job from a note link, short link, or share text; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `xhs_submit_video_speech_text_by_note_id` | Submit an XHS video note speech-to-text transcript job when the caller already has a note ID; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `xhs_get_video_speech_text_job` | Check an XHS speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request. Continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## Douyin Tools

| Tool | Public purpose |
| --- | --- |
| `douyin_get_hot_search_list` | Fetch the current Douyin main hot search list. |
| `douyin_search_videos` | Search Douyin works by keyword with optional `page_token` continuation and filters; do not pass `page`. |
| `douyin_get_video_detail_by_aweme_id` | Fetch structured Douyin work details when the caller already has an aweme_id. |
| `douyin_get_video_detail_by_url` | Resolve a Douyin content page link, short link, or share text into structured Douyin work details. |
| `douyin_get_video_comments_by_aweme_id` | Fetch paginated first-level comments when the caller already has an aweme_id. |
| `douyin_get_video_comments_by_url` | Fetch paginated first-level comments directly from a Douyin content page URL, short link, or share text. |
| `douyin_get_video_comment_replies_by_comment_id` | Fetch paginated replies under a first-level Douyin comment; pass both aweme_id and comment_id, and use page_token to continue pagination. |
| `douyin_get_user_info_by_sec_user_id` | Fetch creator profile data when the caller already has a sec_user_id. |
| `douyin_get_user_info_by_profile_url` | Resolve a profile link, short link, or share text into creator profile data. |
| `douyin_get_user_posted_videos_by_sec_user_id` | Fetch a paginated list of works published by a creator when the caller already has a sec_user_id. |
| `douyin_get_user_posted_videos_by_profile_url` | Fetch a paginated list of works published by a creator from a profile link, short link, or share text. |
| `douyin_get_user_series_by_sec_user_id` | Fetch a paginated list of short-drama series by a creator when the caller already has a sec_user_id. |
| `douyin_get_user_series_by_profile_url` | Fetch a paginated list of short-drama series by a creator from a profile link, short link, or share text. |
| `douyin_submit_video_speech_text_by_video_url` | Submit a Douyin video speech-to-text transcript job from a content page link, short link, or share text; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `douyin_submit_video_speech_text_by_aweme_id` | Submit a Douyin video speech-to-text transcript job when the caller already has an aweme_id; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `douyin_get_video_speech_text_job` | Check a Douyin speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request. Continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## Kuaishou Tools

| Tool | Public purpose |
| --- | --- |
| `kuaishou_get_hot_search_list` | Fetch the current Kuaishou / 快手 hot-search list. |
| `kuaishou_search_videos` | Search Kuaishou works by natural-language keyword with optional `page_token` continuation; do not pass `page`. |
| `kuaishou_search_users` | Search Kuaishou creators by keyword with optional `page_token` continuation; do not pass `page`. |
| `kuaishou_get_video_detail_by_photo_id` | Fetch structured work details when the caller already has a photo_id. |
| `kuaishou_get_video_detail_by_url` | Resolve a Kuaishou work page link, short link, or share text into structured work details. |
| `kuaishou_get_video_comments_by_photo_id` | Fetch paginated first-level comments when the caller already has a photo_id. |
| `kuaishou_get_video_comments_by_url` | Fetch paginated first-level comments directly from a Kuaishou work page link, short link, or share text. |
| `kuaishou_get_video_comment_replies_by_comment_id` | Fetch paginated replies under a first-level comment by photo_id and comment_id. |
| `kuaishou_get_user_info_by_user_id` | Fetch creator profile data when the caller already has a non-empty user_id. |
| `kuaishou_get_user_info_by_profile_url` | Resolve a Kuaishou profile link, including live/fw-user profile shares, short link, or share text into creator profile data; successful results return a reusable non-empty user_id. |
| `kuaishou_get_user_posted_videos_by_user_id` | Fetch a paginated list of works published by a creator when the caller already has a non-empty user_id. |
| `kuaishou_get_user_posted_videos_by_profile_url` | Fetch a paginated list of works published by a creator from a profile link, short link, or share text that resolves directly to a non-empty user_id; for live/fw-user profile shares, call creator profile first and use the returned non-empty user_id. |
| `kuaishou_submit_video_speech_text_by_video_url` | Submit a Kuaishou video speech-to-text transcript job from a work page link, short link, or share text; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `kuaishou_submit_video_speech_text_by_photo_id` | Submit a Kuaishou video speech-to-text transcript job when the caller already has a photo_id; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `kuaishou_get_video_speech_text_job` | Check a Kuaishou speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request. Continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## Bilibili Tools

| Tool | Public purpose |
| --- | --- |
| `bilibili_get_video_download_links` | Fetch short-lived DASH video/audio download links and merge guidance for a Bilibili video URL or share text. |

## Weibo Tools

| Tool | Public purpose |
| --- | --- |
| `weibo_get_hot_search_list` | Fetch the current Weibo / 微博 hot-search list. |
| `weibo_search_posts` | Search Weibo posts by keyword with optional `page_token` continuation; do not pass `page`. |
| `weibo_get_post_detail_by_post_id` | Fetch structured Weibo post details when the caller already has a post_id. |
| `weibo_get_post_detail_by_post_url` | Resolve a Weibo post URL, short link, or share text into structured post details. |
| `weibo_get_post_comments_by_post_id` | Fetch paginated first-level comments when the caller already has a post_id. |
| `weibo_get_post_comments_by_post_url` | Fetch paginated first-level comments directly from a Weibo post URL, short link, or share text. |
| `weibo_get_post_comment_replies_by_comment_id` | Fetch paginated replies under a first-level comment by post_id and comment_id. |
| `weibo_get_user_info_by_user_id` | Fetch creator profile data when the caller already has a user_id. |
| `weibo_get_user_info_by_profile_url` | Resolve a Weibo profile link, short link, or share text into creator profile data. |
| `weibo_get_user_posts_by_user_id` | Fetch a paginated list of posts published by a creator when the caller already has a user_id. |
| `weibo_get_user_posts_by_profile_url` | Fetch a paginated list of posts published by a creator from a profile link, short link, or share text. |
| `weibo_submit_video_speech_text_by_post_url` | Submit a Weibo video speech-to-text transcript job from a post URL, short link, or share text; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `weibo_submit_video_speech_text_by_post_id` | Submit a Weibo video speech-to-text transcript job when the caller already has a post_id; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `weibo_get_video_speech_text_job` | Check a Weibo speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request. Continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## WeChat Tools

| Tool | Public purpose |
| --- | --- |
| `wechat_get_hot_search_list` | Fetch the current WeChat Channels / 视频号 hot-search list. |
| `wechat_search_videos` | Search WeChat Channels / 视频号 videos by keyword with optional `page_token` continuation and filters; do not pass `page`. |
| `wechat_get_video_detail_by_encrypted_object_id` | Fetch structured WeChat Channels video details when encrypted_object_id is already known. |
| `wechat_get_video_detail_by_url` | Resolve a WeChat Channels / 视频号 video link or share text into structured video details. |
| `wechat_get_mp_article_detail_by_url` | Fetch WeChat Official Account / 微信公众号 article detail and body text from an article link or share text. |
| `wechat_get_video_comments_by_object_id` | Fetch paginated first-level comments when object_id and object_nonce_id are known. |
| `wechat_get_video_comments_by_url` | Fetch paginated first-level comments directly from a WeChat Channels / 视频号 video link or share text. |
| `wechat_get_video_comment_replies_by_comment_id` | Fetch paginated replies under a first-level comment by object_id, object_nonce_id, and comment_id. |
| `wechat_get_user_info_by_user_id` | Fetch creator profile data when the finder user_id is already known. |
| `wechat_get_user_posted_videos_by_user_id` | Fetch a paginated list of videos published by a creator when the finder user_id is already known. |
| `wechat_get_user_posted_videos_by_url` | Fetch a paginated list of videos published by a creator from a video link or share text. |
| `wechat_submit_video_speech_text_by_video_url` | Submit a WeChat Channels / 视频号 video speech-to-text transcript job from a video link or share text; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `wechat_submit_video_speech_text_by_encrypted_object_id` | Submit a WeChat Channels / 视频号 video speech-to-text transcript job when encrypted_object_id is already known; submit waits up to 210 seconds. If unfinished, continue checking the same job_id with get-job wait_seconds up to 240 until is_terminal is true. |
| `wechat_get_video_speech_text_job` | Check a WeChat Channels / 视频号 speech-to-text transcript job by job_id without creating a new task; optional wait_seconds 0-240 can long-poll the same job in one request. Continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## Sensitive Words Check Tools

| Tool | Public purpose |
| --- | --- |
| `check_sensitive_text` | Check text for 敏感词检测 / 违禁词检查 / sensitive-content risks with `generic`, `xhs`, `douyin`, or `kuaishou` context. |

## Quick Start

For agents that can execute shell commands, use the direct CLI. This is the recommended default for installed skills:

```bash
export SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>"
npx -y socialdatax-skills@latest xhs search --keyword "露营" --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营" --pretty
npx -y socialdatax-skills@latest kuaishou search --keyword "露营" --pretty
npx -y socialdatax-skills@latest bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest weibo search --keyword "露营" --pretty
npx -y socialdatax-skills@latest wechat search --keyword "露营" --pretty
npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty
```

MCP client configuration belongs to platform or capability MCP listings. For XHS, use the `xhs-insights` docs; for Douyin, use the `douyin-insights` listing; for Kuaishou, use the `kuaishou-insights` listing; for Bilibili, use the `bilibili-insights` listing; for Weibo, use the `weibo-insights` listing; for WeChat / 微信, use the `wechat-channels-insights` listing; for 敏感词检测 / 违禁词检查, use the `sensitive-check` server.

Aily is treated as an OpenClaw / AgentSkills ecosystem channel for this package. Use the OpenClaw skill install flow for now; a dedicated `--target aily` will be added only after its official skill import or package format is confirmed.

## API Key

Request or manage API access from the product website:

<https://socialdatax.com/ai?from=npm>

Use the key as a Bearer token in the `Authorization` request header. Do not commit real API keys to code, docs, issues, or screenshots.

## Directory Metadata

Public metadata files in this repository:

- [skills](skills): AgentSkills-compatible skills split by capability and currently backed by XHS, Douyin, Kuaishou, Weibo, WeChat Channels, and Sensitive Words Check tools.

## License

The files in this public repository are released under the MIT License. The license covers the public CLI wrapper, documentation, and skill files in this repository only. It does not cover the managed service implementation, hosted infrastructure, or any private backend code outside this repository.
