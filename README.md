# SocialDataX Skills | 社媒数据助手 Skills

This public package provides the unified skill installer and direct CLI helper for SocialDataX services.

The current public tools support 小红书 / Xiaohongshu / XHS / RedNote, 抖音 / Douyin, 快手 / Kuaishou / Kwai, Bilibili / 哔哩哔哩 / B站, 微博 / Weibo, 视频号 / WeChat Channels, 知乎 / Zhihu, Instagram, X / Twitter, YouTube, and TikTok content research and analysis workflows, plus WeChat Official Account / 微信公众号 article details, XHS / Douyin / Kuaishou / Weibo / X / Twitter local media download, WeChat Channels local media decrypt/save, Bilibili local video download, and 敏感词检测 / 违禁词检查 text checks. The public skill layer is intentionally named by capability so supported services can evolve without changing the installation model.

- direct `npx` JSON commands for agents that can run shell commands
- AgentSkills-compatible installers split by capability for OpenClaw, Hermes Agent, Codex, Claude Code, and general agent skill directories
- links to platform or capability MCP docs when a client should use MCP directly

The business implementation is privately hosted. This repository exposes only the public package, skill, and connection surface for social media content intelligence workflows. It is not a unified MCP server and does not include a registry server card; standalone MCP listings are published separately when their repo-tracked materials exist.

## High-Intent Skill Catalog

See [CATALOG.md](./CATALOG.md) for curated high-intent Agent Skill entries across SkillHub, ClawHub, ModelScope, and direct CLI usage. The catalog focuses on proven workflows such as XHS content research, XHS comment analysis, XHS hot topic planning, Douyin transcript extraction, and sensitive term checks.

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
- `Bilibili content research`
- `B站视频下载`
- `哔哩哔哩视频下载`
- `Weibo skills`
- `微博 skills`
- `WeChat Channels skills`
- `视频号 skills`
- `WeChat Official Account skills`
- `微信公众号 skills`
- `mp.weixin.qq.com article detail`
- `Zhihu skills`
- `知乎 skills`
- `Instagram skills`
- `X skills`
- `Twitter skills`
- `YouTube skills`
- `TikTok skills`
- `SocialDataX content research`
- `content research assistant`
- `敏感词检测`
- `违禁词检测`
- `文案发布前检查`
- `sensitive check skill`
- `content safety skill`
- `text safety check`

## Hosted MCP Entries

- XHS hosted MCP endpoint: `https://mcp.socialdatax.com/xhs/mcp`
- Douyin hosted MCP endpoint: `https://mcp.socialdatax.com/douyin/mcp`
- Kuaishou hosted MCP endpoint: `https://mcp.socialdatax.com/kuaishou/mcp`
- Bilibili hosted MCP endpoint: `https://mcp.socialdatax.com/bilibili/mcp`
- Weibo hosted MCP endpoint: `https://mcp.socialdatax.com/weibo/mcp`
- WeChat Content / 微信内容 hosted MCP endpoint: `https://mcp.socialdatax.com/wechat/mcp`
- Zhihu / 知乎 hosted MCP endpoint: `https://mcp.socialdatax.com/zhihu/mcp`
- Instagram hosted MCP endpoint: `https://mcp.socialdatax.com/instagram/mcp`
- X / Twitter hosted MCP endpoint: `https://mcp.socialdatax.com/x/mcp`
- YouTube hosted MCP endpoint: `https://mcp.socialdatax.com/youtube/mcp`
- TikTok hosted MCP endpoint: `https://mcp.socialdatax.com/tiktok/mcp`
- Sensitive Words Check hosted MCP endpoint: `https://mcp.socialdatax.com/sensitive-check/mcp`
- Hosted transport: `streamable-http`
- Authentication: `Authorization: Bearer <SOCIALDATAX_API_KEY>`
- Website: <https://socialdatax.com>
- Repo-tracked platform MCP listings: `com.52choujiang/xhs-insights`, `com.52choujiang/douyin-insights`, `com.52choujiang/kuaishou-insights`, `com.52choujiang/weibo-insights`, `com.52choujiang/wechat-channels-insights`, and `com.52choujiang/instagram-insights`.
- Repo-tracked future SocialDataX namespace draft files exist for XHS and Douyin: `com.socialdatax/xhs-insights` and `com.socialdatax/douyin-insights`.
- Reserved future SocialDataX namespace names for existing platform listings without draft files yet: `com.socialdatax/kuaishou-insights`, `com.socialdatax/weibo-insights`, `com.socialdatax/wechat-channels-insights`, and `com.socialdatax/instagram-insights`.
- Hosted endpoints without repo-tracked standalone listing materials yet: Bilibili, Zhihu, X / Twitter, YouTube, TikTok, and Sensitive Words Check.
- Unified MCP registry name: none; this package installs skills and calls explicit hosted MCP entries.
- Current public capability version: `0.2.38`

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
npx -y socialdatax-skills@latest bilibili search-videos --keyword "露营" --pretty
npx -y socialdatax-skills@latest bilibili search-articles --keyword "露营" --pretty
npx -y socialdatax-skills@latest bilibili detail --content-id "<content_id>" --pretty
npx -y socialdatax-skills@latest bilibili detail --url "<bilibili_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest bilibili comments --content-id "<content_id>" --pretty
npx -y socialdatax-skills@latest bilibili comments --url "<bilibili_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest bilibili replies --comment-object-id "<comment_object_id>" --comment-object-type 1 --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest bilibili reactions --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest bilibili reactions --url "<bilibili_opus_or_dynamic_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest bilibili user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest bilibili user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest bilibili user-videos --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest bilibili user-videos --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest bilibili user-articles --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest bilibili user-articles --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest bilibili user-dynamics --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest bilibili user-dynamics --profile-url "<profile_url_or_share_text>" --pretty
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
npx -y socialdatax-skills@latest wechat user-info --user-id "<v2_finder_user_id>" --pretty
npx -y socialdatax-skills@latest wechat user-posts --user-id "<v2_finder_user_id>" --pretty
npx -y socialdatax-skills@latest wechat user-posts --url "<wechat_video_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat transcript --url "<wechat_video_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat transcript --encrypted-object-id "<encrypted_object_id>" --pretty
npx -y socialdatax-skills@latest wechat transcript --job-id "<job_id>" --pretty
npx -y socialdatax-skills@latest zhihu hot-list --pretty
npx -y socialdatax-skills@latest zhihu search --keyword "露营" --pretty
npx -y socialdatax-skills@latest zhihu detail --content-url "<zhihu_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest zhihu comments --content-url "<zhihu_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest zhihu replies --content-url "<zhihu_content_url_or_share_text>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest zhihu user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest zhihu user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest instagram search --keyword "camping" --pretty
npx -y socialdatax-skills@latest instagram detail --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest instagram detail --post-url "<instagram_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest instagram comments --post-url "<instagram_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest instagram replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest instagram user-info --username "<username>" --pretty
npx -y socialdatax-skills@latest instagram user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest instagram user-posts --username "<username>" --pretty
npx -y socialdatax-skills@latest instagram user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest x search --keyword "camping" --pretty
npx -y socialdatax-skills@latest x detail --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest x detail --post-url "<x_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest x comments --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest x comments --post-url "<x_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest x replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest x user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest x user-info --username "<username>" --pretty
npx -y socialdatax-skills@latest x user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest x user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest x user-posts --username "<username>" --pretty
npx -y socialdatax-skills@latest x user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest x download-media --url "<x_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest youtube search --keyword "camping" --pretty
npx -y socialdatax-skills@latest youtube detail --url "<youtube_video_url>" --pretty
npx -y socialdatax-skills@latest youtube comments --url "<youtube_video_url>" --pretty
npx -y socialdatax-skills@latest youtube replies --reply-token "<reply_token>" --pretty
npx -y socialdatax-skills@latest youtube channel-info --channel-url "<youtube_channel_url>" --pretty
npx -y socialdatax-skills@latest youtube user-posts --channel-url "<youtube_channel_url>" --pretty
npx -y socialdatax-skills@latest tiktok search --keyword "camping" --pretty
npx -y socialdatax-skills@latest tiktok detail --url "<tiktok_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest tiktok comments --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest tiktok comments --url "<tiktok_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest tiktok replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest tiktok user-info --tiktok-id "<tiktok_id>" --pretty
npx -y socialdatax-skills@latest tiktok user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest tiktok user-posts --tiktok-id "<tiktok_id>" --pretty
npx -y socialdatax-skills@latest tiktok user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty
```

Most direct CLI commands print a JSON envelope with `platform`, `tool`, `arguments`, and `data`. `sensitive-check` prints `platform`, `tool`, and `data` only; it does not echo the original text in CLI output. `wechat decrypt-media` is a local save command: pass the `video.video_url` returned by WeChat detail and an `--output` file path. It saves the media locally, decrypts when needed, and does not require `SOCIALDATAX_API_KEY`. `xhs/douyin/kuaishou/weibo download-media` is also local: pass one media URL returned by detail and either `--output <file>` or `--output-dir <directory>`. `x download-media` accepts one X media URL returned by search or detail. These local commands write through a `.part` file, resume partial downloads when the server supports range requests, skip an already existing output file, and infer common image/video/audio extensions in `--output-dir` mode. X / Twitter media URLs are served from overseas CDN domains such as `pbs.twimg.com` and `video.twimg.com`; if the local download times out, make the CLI process use a proxy with `--proxy "http://127.0.0.1:7890"` or `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY`, then retry.

For transcript commands, the direct CLI tries to deliver the final result in one run: submit may wait up to 240 seconds, and if `data.is_terminal` is not `true`, the CLI automatically continues matching get-job requests for up to 1200 seconds by default, with each get-job request waiting up to 240 seconds. Use positive `--max-wait-seconds <seconds>` to tune that follow-up window. Do not submit a duplicate transcript job just to poll status.

`bilibili download` calls SocialDataX once to fetch short-lived download links, then downloads video and audio tracks on the local machine and merges them with local `ffmpeg`. Set `SOCIALDATAX_API_KEY`, install `ffmpeg`, and pass either `--output <file>` or `--output-dir <directory>`. The download-links request consumes 10 credits; the local track download and merge do not consume additional SocialDataX credits. Use `--ffmpeg-path <path>` when `ffmpeg` is not on `PATH`, and `--keep-tracks` to retain the separate track files after merge.

For XHS outputs with a returned `note_url` field, when `note_url` is non-null, preserve it exactly as the full URL, including `xsec_token` query parameters, such as in final answers or display. Do not modify, truncate, redact, normalize, rebuild, or replace it with a link assembled from `note_id`. If `note_url` is null, do not synthesize a public link from `note_id`.

For list-style commands, use `--pages <n>` to fetch N pages from the current starting point and `--max-items <n>` to cap the merged `data.items` output. Search commands support `--pages` but not `--all`, because search has no stable complete-result boundary.

Use `--since-days <1-365>` only on XHS, Douyin, Kuaishou, Weibo, and WeChat Channels search and creator content-list commands. For Bilibili video search, Zhihu search, and YouTube search, use the documented publish-time filters instead; Instagram, X / Twitter, TikTok, and Bilibili article search do not expose a recent-window CLI option.

For comments, replies, creator content lists, and Douyin creator series, use `--all` to continue until the returned `next_page_token` is empty. `--all` has no default item or page cap; add `--max-items <n>` or use `--pages <n>` when you want a bounded run.

For XHS, Douyin, Kuaishou, Weibo, and WeChat Channels first-level comments, add `--include-replies` to fetch the second-level replies under each returned first-level comment. Multi-page output keeps `data.items` as the merged first-level list; each item gets `replies`, `replies_page_count`, and `replies_next_page_token`.

For commands that accept `--page-token`, continue only with the complete returned `next_page_token` from the same pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.

Search pagination uses `--page-token` when continuing with a returned `next_page_token`. Omit `--page-token` on the first search request and pass the complete returned `next_page_token` only when continuing the same search chain.

Transcript commands submit a bounded video speech-to-text job or check an existing job. Pass exactly one entrypoint for each call: URL/share text, platform content ID, or `--job-id`. Direct CLI transcript commands wait and poll the same job by default; completed get-job responses return transcript plus content context, not summary.

Generated Agent Skill examples include `--source-client socialdatax-skills --source-platform <marketplace> --source-skill <skill-slug>` so SocialDataX can attribute authenticated direct data CLI usage to the current marketplace Skill. Keep those values unchanged when running commands from a Skill; omit them for ad hoc CLI use. Authenticated direct data CLI commands also accept `SOCIALDATAX_SOURCE_CLIENT`, `SOCIALDATAX_SOURCE_PLATFORM`, and `SOCIALDATAX_SOURCE_SKILL` as environment-variable fallbacks.

Search commands for XHS, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, and WeChat Channels use `--keyword` and optional `--page-token`.
Kuaishou work search uses `kuaishou search --keyword` and optional `--page-token`; Kuaishou creator search uses `kuaishou user-search --keyword` and optional `--page-token`. Kuaishou search does not accept Douyin semantic filters, and `kuaishou user-search` does not support `--since-days`.
Bilibili video search uses `bilibili search-videos --keyword`; Bilibili article search uses `bilibili search-articles --keyword`.
YouTube reply pagination starts from the returned first-level comment `reply_token`; use `youtube replies --reply-token "<reply_token>"`, not `--comment-id`.

XHS comments accept optional `--sort-type` values: `default`,
`time_descending`, and `like_count_descending`; omit it for the platform
default comment order.
Bilibili and YouTube comments accept optional `--sort-type` values: `hot` and
`time_descending`; Zhihu comments accept `default` and `time_descending`.
Omit comment sort values for the platform default order.

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

Bilibili search filters use semantic values. Video `--sort-type` supports
`general`, `view_count_descending`, `time_descending`,
`danmaku_count_descending`, and `collect_count_descending`; article
`--sort-type` supports `general`, `time_descending`,
`view_count_descending`, `like_count_descending`, and
`comment_count_descending`.
Bilibili creator videos accept optional `--sort-type` values:
`time_descending`, `view_count_descending`, and `collect_count_descending`;
omit it for the default creator video-list order.

Zhihu search filters use `--content-type` values `all`, `answer`, `article`,
and `video`; `--publish-time-range` supports `all`, `day`, `week`, `month`,
`three_months`, `half_year`, and `year`. X search `--sort-type` supports `hot`
and `time_descending`.
YouTube search supports `--video-type all|video|movie`,
`--publish-time-range all|last_hour|today|this_week|this_month|this_year`, and
`--duration-range all|under_4_min|between_4_and_20_min|over_20_min`. TikTok
search supports `--content-type all|video|image`.

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

The public package declares no npm lifecycle scripts such as `preinstall`, `install`, or `postinstall`. The installer copies Skill files only, does not save API keys, and does not change MCP server configuration. Authenticated data calls require `SOCIALDATAX_API_KEY` at runtime, do not read local browser data, and do not perform account actions.

## Platform Names

This project is not affiliated with, endorsed by, or sponsored by Xiaohongshu, RedNote, Douyin, Kuaishou, Kwai, Bilibili, Weibo, WeChat, WeChat Channels, Zhihu, Instagram, X / Twitter, YouTube, TikTok, or their affiliates. Platform names are used only to describe supported data sources.

### Local Source Run

```bash
npm install
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs xhs search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs douyin search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs kuaishou search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs bilibili search-videos --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs weibo search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs wechat search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs zhihu search --keyword "露营" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs instagram search --keyword "camping" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs x search --keyword "camping" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs youtube search --keyword "camping" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs tiktok search --keyword "camping" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs sensitive-check text --text "<content>" --platform xhs --pretty
```

### Docker Run

```bash
docker build -t socialdatax-skills .
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills xhs search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills douyin search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills kuaishou search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills bilibili search-videos --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills weibo search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills wechat search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills zhihu search --keyword "露营" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills instagram search --keyword "camping" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills x search --keyword "camping" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills youtube search --keyword "camping" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills tiktok search --keyword "camping" --pretty
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
npx -y socialdatax-skills@latest install --path ~/.workbuddy/skills/
npx -y socialdatax-skills@latest install media-search --path ~/.workbuddy/skills/media-search
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
npx -y socialdatax-skills@latest bilibili search-videos --keyword "露营" --pretty
npx -y socialdatax-skills@latest bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest weibo hot-search --pretty
npx -y socialdatax-skills@latest weibo search --keyword "露营" --pretty
npx -y socialdatax-skills@latest weibo transcript --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo download-media --url "<weibo_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest wechat hot-search --pretty
npx -y socialdatax-skills@latest wechat search --keyword "露营" --pretty
npx -y socialdatax-skills@latest wechat article --url "<mp_article_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat transcript --encrypted-object-id "<encrypted_object_id>" --pretty
npx -y socialdatax-skills@latest zhihu search --keyword "露营" --pretty
npx -y socialdatax-skills@latest instagram search --keyword "camping" --pretty
npx -y socialdatax-skills@latest x search --keyword "camping" --pretty
npx -y socialdatax-skills@latest x download-media --url "<x_media_url>" --output-dir ./downloads --pretty
npx -y socialdatax-skills@latest youtube search --keyword "camping" --pretty
npx -y socialdatax-skills@latest tiktok search --keyword "camping" --pretty
npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty
```

Use `--path` for clients that expect a direct Skills directory. When installing all skills, `--path` is the parent directory; when installing one skill, `--path` is that skill's destination directory.

Available skills:

- `socialdatax-content-research-assistant`: combine SocialDataX search, detail, comment, creator profile, and creator content workflows for cross-platform content research across XHS, Douyin, Kuaishou, Bilibili, Weibo, WeChat Channels, Zhihu, Instagram, X / Twitter, YouTube, and TikTok; also reads WeChat Official Account article link details.
- `media-search`: search social media content by keyword; supports XHS notes, Douyin works, Kuaishou works, Bilibili videos/articles, Weibo posts, WeChat Channels videos, Zhihu content, Instagram posts, X / Twitter posts, YouTube videos, and TikTok posts.
- `media-detail`: read WeChat Official Account article details and body text from article links. Read structured content details and metrics for XHS notes, Douyin works, Kuaishou works, Bilibili content, Weibo posts, WeChat Channels videos, Zhihu content, Instagram posts, X / Twitter posts, YouTube videos, and TikTok posts.
- `media-comments`: fetch and analyze comments/replies for XHS, Douyin, Kuaishou, Bilibili, Weibo, WeChat Channels, Zhihu, Instagram, X / Twitter, YouTube, and TikTok.
- `media-transcript`: submit and check video 口播转文字 / speech-to-text transcript jobs through direct CLI commands or hosted MCP tools; supports XHS, Douyin, Kuaishou, Weibo, and WeChat Channels.
- `media-user-info`: retrieve creator profile information; supports XHS, Douyin, Kuaishou, Bilibili, Weibo, WeChat Channels, Zhihu, Instagram, X / Twitter, YouTube channels, and TikTok creators.
- `media-user-posts`: retrieve creator content lists; supports XHS notes, Douyin works, Kuaishou works, Bilibili videos/articles/dynamics, Weibo posts, WeChat Channels videos, Zhihu creator articles, Instagram posts, X / Twitter posts, YouTube channel videos/Shorts, TikTok posts, and Douyin creator short-drama series.
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
- WorkBuddy: use `--path` with the Skills directory supported by your current WorkBuddy client, for example `npx -y socialdatax-skills@latest install --path ~/.workbuddy/skills/`

If no skill name is provided, all skills are installed. If a destination already exists, re-run with `--force` to replace an existing directory for the same skill. Use `--path <directory>` to install one skill to a custom directory, or multiple skills under a custom parent directory. The `shared` scope is only meaningful for `--target hermes`; use `--target agents` for the shared AgentSkills directory directly.

## Workflow Scope

The current direct CLI and hosted MCP services are designed for social media content intelligence workflows. Some commands read public content directly; some submit bounded analysis jobs such as video speech-to-text transcript. They do not provide account login, posting, editing, liking, commenting, or other account actions.

Current XHS workflows include:

- Fetch the current Xiaohongshu / XHS / RedNote search hot list.
- Search related Xiaohongshu notes by keyword, with optional sort, note type, and publish-time filters.
- Resolve a shared note link, short link, or share text into structured note details.
- Read note details when the caller already has a note ID.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment.
- Read creator profile data from a profile link, short link, share text, or user ID.
- Fetch paginated creator note lists from a user ID, profile link, short link, or share text for content style and account research.
- Submit and check video note 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 240 秒，未完成时继续查询同一个 job_id 直到终态.
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
- Submit and check video work 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 240 秒，未完成时继续查询同一个 job_id 直到终态.
- Save returned `images[].url`, `video.play_url`, or `cover_image_url` media links locally with `kuaishou download-media`.

Current Bilibili workflows include:

- Search Bilibili videos by keyword with optional sort, publish-time, and duration filters.
- Search Bilibili articles by keyword with optional sort and category filters.
- Resolve a Bilibili video, article, dynamic, short link, or share text into structured content details.
- Fetch paginated first-level comments for videos, articles, and dynamics.
- Fetch paginated replies under a first-level comment by comment object and comment_id.
- Fetch paginated likes and reposts for Bilibili opus/dynamic content by post_id or opus/dynamic URL/share text. If starting from a `/read/cv...` article URL, call `bilibili detail` first and use the returned `post.post_id` or `post.share_url`.
- Read creator profile data from a user_id, profile link, short link, or share text.
- Fetch paginated creator videos, articles, and dynamics.
- Resolve a Bilibili video page link or share text into short-lived DASH download links.
- Download the selected video and audio tracks locally and merge them with `ffmpeg -c copy`.

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
- Submit and check video work 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 240 秒，未完成时继续查询同一个 job_id 直到终态.
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
- Submit and check Weibo video 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 240 秒，未完成时继续查询同一个 job_id 直到终态.
- Save returned `image_urls[]` or `video.video_url` media links locally with `weibo download-media`.

Current WeChat Content / 微信内容 workflows include:

- Fetch the current WeChat Channels / 视频号 hot-search list.
- Search related WeChat Channels videos by keyword with optional sort and duration filters.
- Resolve a WeChat Channels video link, share text, or encrypted_object_id into structured video details.
- Save the `video.video_url` returned by WeChat Channels video detail locally and decrypt when needed.
- Resolve a WeChat Official Account / 微信公众号 article link or share text into article detail and body text.
- Fetch paginated WeChat Channels / 视频号 first-level comments for comment analysis.
- Fetch paginated WeChat Channels / 视频号 replies under a first-level comment; pass `object_id`, `object_nonce_id`, and `comment_id`.
- Continue WeChat Channels list pagination only when `next_page_token` is non-empty; an empty string means there are no more results to request.
- Read WeChat Channels / 视频号 creator profile data from a `v2_...@finder` user_id; hosted MCP can also resolve creator profile data from a video link or share text.
- Fetch paginated creator video lists from a `v2_...@finder` user_id or a video link/share text.
- Submit and check WeChat Channels / 视频号 video 口播转文字 / speech-to-text transcript jobs; submit tools 提交后最多等待 240 秒，未完成时继续查询同一个 job_id 直到终态.

Current Zhihu / 知乎 workflows include:

- Fetch the current Zhihu hot list.
- Search Zhihu public answers, articles, and videos by keyword with optional content-type, sort, publish-time, and page-token filters.
- Resolve a Zhihu answer, article, or video URL into structured content details.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment by content URL and comment_id.
- Read creator profile data from a profile URL.
- Fetch paginated creator article lists from a profile URL.

Current Instagram workflows include:

- Search Instagram public posts by keyword.
- Read structured post details by post_id or post URL/share text.
- Fetch paginated first-level comments from a post URL.
- Fetch paginated replies under a first-level comment by post_id and comment_id.
- Read creator profile data by username or profile URL/share text.
- Fetch paginated public posts by creator username or profile URL/share text.

Current X / Twitter workflows include:

- Search X public posts by keyword with hot or time-descending sorting.
- Read structured post details by post_id or post URL/share text.
- Fetch paginated first-level comments by post_id or post URL/share text.
- Fetch paginated replies under a first-level comment by post_id and comment_id.
- Read creator profile data by user_id, username, or profile URL/share text.
- Fetch paginated public posts by creator user_id, username, or profile URL/share text.
- Save returned `media_items[].cover_image_url` or `media_items[].video_url` media links locally with `x download-media`. Search results may already include these URLs; use detail as a fallback when search media fields are absent. If X CDN downloads time out, make the CLI process use a proxy with `--proxy "http://127.0.0.1:7890"` or `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY`, then retry.

Current YouTube workflows include:

- Search YouTube public videos by keyword with optional sort, video-type, publish-time, duration, and page-token filters.
- Read structured video details from a video URL.
- Fetch paginated first-level comments from a video URL.
- Fetch paginated replies using the returned first-level comment `reply_token`.
- Read YouTube channel profile data from a channel URL.
- Fetch paginated channel videos or Shorts from a channel URL.
  Use `--video-type video|short` on `youtube user-posts` when you need only regular videos or Shorts.

Current TikTok workflows include:

- Search TikTok public video and image posts by keyword with optional content-type and page-token filters.
- Read structured post details from a post URL/share text.
- Fetch paginated first-level comments by post_id or post URL/share text.
- Fetch paginated replies under a first-level comment by post_id and comment_id.
- Read creator profile data by tiktok_id or profile URL/share text.
- Fetch paginated creator posts by tiktok_id or profile URL/share text.

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
| `xhs_submit_video_speech_text_by_note_url` | Submit an XHS video note speech-to-text transcript job from a note link, short link, or share text; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `xhs_submit_video_speech_text_by_note_id` | Submit an XHS video note speech-to-text transcript job when the caller already has a note ID; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `xhs_get_video_speech_text_job` | Check an XHS speech-to-text transcript job by job_id without creating a new task. Each call waits up to 240 seconds for the same job. If unfinished, continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

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
| `douyin_submit_video_speech_text_by_video_url` | Submit a Douyin video speech-to-text transcript job from a content page link, short link, or share text; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `douyin_submit_video_speech_text_by_aweme_id` | Submit a Douyin video speech-to-text transcript job when the caller already has an aweme_id; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `douyin_get_video_speech_text_job` | Check a Douyin speech-to-text transcript job by job_id without creating a new task. Each call waits up to 240 seconds for the same job. If unfinished, continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

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
| `kuaishou_submit_video_speech_text_by_video_url` | Submit a Kuaishou video speech-to-text transcript job from a work page link, short link, or share text; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `kuaishou_submit_video_speech_text_by_photo_id` | Submit a Kuaishou video speech-to-text transcript job when the caller already has a photo_id; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `kuaishou_get_video_speech_text_job` | Check a Kuaishou speech-to-text transcript job by job_id without creating a new task. Each call waits up to 240 seconds for the same job. If unfinished, continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## Bilibili Tools

| Tool | Public purpose |
| --- | --- |
| `bilibili_search_videos` | Search Bilibili videos by keyword with optional `page_token` continuation, sorting, publish-time, and duration filters. |
| `bilibili_search_articles` | Search Bilibili articles by keyword with optional `page_token` continuation, sorting, and category filters. |
| `bilibili_get_content_detail_by_id` | Fetch structured Bilibili video, article, or dynamic details by content_id. |
| `bilibili_get_content_detail_by_url` | Resolve a Bilibili video, article, dynamic, short link, or share text into structured content details. |
| `bilibili_get_video_download_links` | Fetch DASH video/audio download links and merge guidance for a Bilibili video URL. |
| `bilibili_get_content_comments_by_id` | Fetch paginated first-level comments for a Bilibili video, article, or dynamic by content_id. |
| `bilibili_get_content_comments_by_url` | Fetch paginated first-level comments from a Bilibili video, article, dynamic, short link, or share text. |
| `bilibili_get_content_comment_replies_by_comment_id` | Fetch paginated replies under a first-level Bilibili comment by comment object and comment_id. |
| `bilibili_get_content_likes_and_reposts_by_post_id` | Fetch paginated likes and reposts for a Bilibili article or dynamic by post_id. |
| `bilibili_get_content_likes_and_reposts_by_url` | Fetch paginated likes and reposts from a Bilibili article or dynamic URL, short link, or share text. |
| `bilibili_get_user_info_by_user_id` | Fetch Bilibili creator profile data by user_id. |
| `bilibili_get_user_info_by_profile_url` | Resolve a Bilibili profile link, short link, or share text into creator profile data. |
| `bilibili_get_user_posted_videos_by_user_id` | Fetch a paginated list of videos published by a Bilibili creator by user_id. |
| `bilibili_get_user_posted_videos_by_profile_url` | Fetch creator videos from a Bilibili profile link, short link, or share text. |
| `bilibili_get_user_posted_articles_by_user_id` | Fetch a paginated list of articles published by a Bilibili creator by user_id. |
| `bilibili_get_user_posted_articles_by_profile_url` | Fetch creator articles from a Bilibili profile link, short link, or share text. |
| `bilibili_get_user_posted_dynamics_by_user_id` | Fetch a paginated list of dynamics published by a Bilibili creator by user_id. |
| `bilibili_get_user_posted_dynamics_by_profile_url` | Fetch creator dynamics from a Bilibili profile link, short link, or share text. |

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
| `weibo_get_post_liker_list_by_post_id` | Fetch paginated users who liked a Weibo post by post_id. |
| `weibo_get_post_liker_list_by_post_url` | Fetch paginated users who liked a Weibo post from a post page link, short link, or share text. |
| `weibo_get_post_repost_list_by_post_id` | Fetch paginated reposts for a Weibo post by post_id. |
| `weibo_get_post_repost_list_by_post_url` | Fetch paginated reposts for a Weibo post from a post page link, short link, or share text. |
| `weibo_get_user_info_by_user_id` | Fetch creator profile data when the caller already has a user_id. |
| `weibo_get_user_info_by_profile_url` | Resolve a Weibo profile link, short link, or share text into creator profile data. |
| `weibo_get_user_posts_by_user_id` | Fetch a paginated list of posts published by a creator when the caller already has a user_id. |
| `weibo_get_user_posts_by_profile_url` | Fetch a paginated list of posts published by a creator from a profile link, short link, or share text. |
| `weibo_submit_video_speech_text_by_post_url` | Submit a Weibo video speech-to-text transcript job from a post URL, short link, or share text; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `weibo_submit_video_speech_text_by_post_id` | Submit a Weibo video speech-to-text transcript job when the caller already has a post_id; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `weibo_get_video_speech_text_job` | Check a Weibo speech-to-text transcript job by job_id without creating a new task. Each call waits up to 240 seconds for the same job. If unfinished, continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

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
| `wechat_get_user_info_by_user_id` | Fetch creator profile data when the `v2_...@finder` user_id is already known. |
| `wechat_get_user_info_by_url` | Resolve a WeChat Channels / 视频号 video link or share text into creator profile data. |
| `wechat_get_user_posted_videos_by_user_id` | Fetch a paginated list of videos published by a creator when the `v2_...@finder` user_id is already known. |
| `wechat_get_user_posted_videos_by_url` | Fetch a paginated list of videos published by a creator from a video link or share text. |
| `wechat_submit_video_speech_text_by_video_url` | Submit a WeChat Channels / 视频号 video speech-to-text transcript job from a video link or share text; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `wechat_submit_video_speech_text_by_encrypted_object_id` | Submit a WeChat Channels / 视频号 video speech-to-text transcript job when encrypted_object_id is already known; submit waits up to 240 seconds. If unfinished, continue checking the same job_id until is_terminal is true. |
| `wechat_get_video_speech_text_job` | Check a WeChat Channels / 视频号 speech-to-text transcript job by job_id without creating a new task. Each call waits up to 240 seconds for the same job. If unfinished, continue querying the same job_id until is_terminal is true. Returns transcript plus content context, not summary. |

## Zhihu Tools

| Tool | Public purpose |
| --- | --- |
| `zhihu_get_hot_list` | Fetch the current Zhihu hot list. |
| `zhihu_search_content` | Search Zhihu public content by keyword with optional content type, sort, publish-time, and `page_token` filters. |
| `zhihu_get_content_detail_by_url` | Fetch structured Zhihu answer, article, or video details from a content URL. |
| `zhihu_get_content_comments_by_url` | Fetch paginated first-level comments from a Zhihu answer, article, or video URL. |
| `zhihu_get_comment_replies_by_url` | Fetch paginated replies under a first-level Zhihu comment by content URL and comment_id. |
| `zhihu_get_user_info_by_profile_url` | Fetch Zhihu creator profile data from a profile URL. |
| `zhihu_get_user_posted_articles_by_profile_url` | Fetch a paginated list of articles published by a Zhihu creator from a profile URL. |

## Instagram Tools

| Tool | Public purpose |
| --- | --- |
| `instagram_search_posts` | Search Instagram public posts by keyword with optional `page_token` continuation. |
| `instagram_get_post_detail_by_post_id` | Fetch structured Instagram post details by post_id. |
| `instagram_get_post_detail_by_post_url` | Fetch structured Instagram post details from a post URL. |
| `instagram_get_post_comments_by_post_url` | Fetch paginated first-level comments from an Instagram post URL. |
| `instagram_get_post_comment_replies_by_comment_id` | Fetch paginated replies under a first-level Instagram comment by post_id and comment_id. |
| `instagram_get_user_info_by_username` | Fetch Instagram creator profile data by username. |
| `instagram_get_user_info_by_profile_url` | Fetch Instagram creator profile data from a profile URL. |
| `instagram_get_user_posts_by_username` | Fetch a paginated list of public posts by an Instagram creator username. |
| `instagram_get_user_posts_by_profile_url` | Fetch a paginated list of public posts by an Instagram creator profile URL. |

## X Tools

| Tool | Public purpose |
| --- | --- |
| `x_search_posts` | Search X public posts by keyword with hot or time-descending sorting and optional `page_token` continuation. |
| `x_get_post_detail_by_post_id` | Fetch structured X post details by post_id. |
| `x_get_post_detail_by_post_url` | Fetch structured X post details from a post URL. |
| `x_get_post_comments_by_post_id` | Fetch paginated first-level comments by X post_id. |
| `x_get_post_comments_by_post_url` | Fetch paginated first-level comments from an X post URL. |
| `x_get_post_comment_replies_by_comment_id` | Fetch paginated replies under a first-level X comment by post_id and comment_id. |
| `x_get_user_info_by_user_id` | Fetch X creator profile data by user_id. |
| `x_get_user_info_by_username` | Fetch X creator profile data by username. |
| `x_get_user_info_by_profile_url` | Fetch X creator profile data from a profile URL. |
| `x_get_user_posts_by_user_id` | Fetch a paginated list of public posts by an X creator user_id. |
| `x_get_user_posts_by_username` | Fetch a paginated list of public posts by an X creator username. |
| `x_get_user_posts_by_profile_url` | Fetch a paginated list of public posts by an X creator profile URL. |

## YouTube Tools

| Tool | Public purpose |
| --- | --- |
| `youtube_search_videos` | Search YouTube public videos by keyword with optional sort, video type, publish-time, duration, and `page_token` filters. |
| `youtube_get_video_detail_by_url` | Fetch structured YouTube video details from a video URL. |
| `youtube_get_channel_info_by_url` | Fetch YouTube channel profile data from a channel URL. |
| `youtube_get_user_posted_videos_by_channel_url` | Fetch a paginated list of videos or Shorts published by a YouTube channel URL. |
| `youtube_get_video_comments_by_url` | Fetch paginated first-level comments from a YouTube video URL. |
| `youtube_get_video_comment_replies` | Fetch paginated YouTube comment replies by the first-level comment reply_token. |

## TikTok Tools

| Tool | Public purpose |
| --- | --- |
| `tiktok_search_posts` | Search TikTok public posts by keyword with optional content type and `page_token` continuation. |
| `tiktok_get_post_detail_by_url` | Fetch structured TikTok video or image post details from a post URL. |
| `tiktok_get_post_comments_by_post_id` | Fetch paginated first-level comments by TikTok post_id. |
| `tiktok_get_post_comments_by_url` | Fetch paginated first-level comments from a TikTok post URL. |
| `tiktok_get_post_comment_replies` | Fetch paginated replies under a first-level TikTok comment by post_id and comment_id. |
| `tiktok_get_user_info_by_tiktok_id` | Fetch TikTok creator profile data by tiktok_id. |
| `tiktok_get_user_info_by_profile_url` | Fetch TikTok creator profile data from a profile URL. |
| `tiktok_get_user_posts_by_tiktok_id` | Fetch a paginated list of posts by a TikTok creator tiktok_id. |
| `tiktok_get_user_posts_by_profile_url` | Fetch a paginated list of posts by a TikTok creator profile URL. |

## Sensitive Words Check Tools

| Tool | Public purpose |
| --- | --- |
| `check_sensitive_text` | Check text for 敏感词检测 / 违禁词检查 / sensitive-content risks with `generic`, `xhs`, `douyin`, or `kuaishou` context. |

## Quick Start

For agents that can execute shell commands, use the direct CLI. This is the recommended default for installed skills:

For installed AI clients, persist `SOCIALDATAX_API_KEY` in the client Secret or user environment. The `export` below is only for a one-off shell run.

```bash
export SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>"
npx -y socialdatax-skills@latest xhs search --keyword "露营" --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营" --pretty
npx -y socialdatax-skills@latest kuaishou search --keyword "露营" --pretty
npx -y socialdatax-skills@latest bilibili search-videos --keyword "露营" --pretty
npx -y socialdatax-skills@latest weibo search --keyword "露营" --pretty
npx -y socialdatax-skills@latest wechat search --keyword "露营" --pretty
npx -y socialdatax-skills@latest zhihu search --keyword "露营" --pretty
npx -y socialdatax-skills@latest instagram search --keyword "camping" --pretty
npx -y socialdatax-skills@latest x search --keyword "camping" --pretty
npx -y socialdatax-skills@latest youtube search --keyword "camping" --pretty
npx -y socialdatax-skills@latest tiktok search --keyword "camping" --pretty
npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty
```

MCP client configuration belongs to repo-tracked platform MCP listings when those materials exist. Current repo-tracked standalone listings cover XHS, Douyin, Kuaishou, Weibo, WeChat Content / 微信内容 under the historical `wechat-channels-insights` Registry name, and Instagram. WeChat Official Account article details are included in the WeChat endpoint and skills package, not a separate standalone listing. For Bilibili, Zhihu, X / Twitter, YouTube, TikTok, and 敏感词检测 / 违禁词检查, use the hosted endpoints above or `mcp-remote` until standalone listing and registry materials are created.

Aily is treated as an OpenClaw / AgentSkills ecosystem channel for this package. Use the OpenClaw skill install flow for now; a dedicated `--target aily` will be added only after its official skill import or package format is confirmed.

## API Key

Request or manage API access from the product website:

<https://socialdatax.com/ai?from=npm>

Use the key as a Bearer token in the `Authorization` request header. Do not commit real API keys to code, docs, issues, or screenshots.

## Directory Metadata

Public metadata files in this repository:

- [skills](skills): AgentSkills-compatible skills split by capability and currently backed by XHS, Douyin, Kuaishou, Bilibili, Weibo, WeChat Content, Zhihu, Instagram, X / Twitter, YouTube, TikTok, and Sensitive Words Check tools.

## License

The files in this public repository are released under the MIT License. The license covers the public CLI wrapper, documentation, and skill files in this repository only. It does not cover the managed service implementation, hosted infrastructure, or any private backend code outside this repository.
