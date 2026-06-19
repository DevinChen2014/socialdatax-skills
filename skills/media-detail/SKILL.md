---
name: "media-detail"
description: "Read structured social media content details and metrics from content IDs, URLs, short links, or share text. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, Douyin / 抖音, Kuaishou / 快手 / Kwai, Weibo / 微博, and WeChat Channels / 视频号."
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
    emoji: "📄"
    homepage: "https://socialdatax.52choujiang.com/?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Detail

Use this skill when the user provides a content link, short link, share text, or content ID and wants structured details or interaction metrics.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_detail_by_*` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_detail_by_*` tools.
- Kuaishou / 快手 works through the `kuaishou_get_video_detail_by_*` tools.
- Weibo / 微博 posts through the `weibo_get_post_detail_by_*` tools.
- WeChat Channels / 视频号 videos through the `wechat_get_video_detail_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.52choujiang.com/?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.52choujiang.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs detail --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin detail --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin detail --url "<douyin_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest kuaishou detail --photo-id "<photo_id>" --pretty
npx -y socialdatax-skills@latest kuaishou detail --url "<kuaishou_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest weibo detail --post-id "<post_id>" --pretty
npx -y socialdatax-skills@latest weibo detail --post-url "<weibo_post_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest wechat detail --encrypted-object-id "<encrypted_object_id>" --pretty
npx -y socialdatax-skills@latest wechat detail --url "<wechat_video_url_or_share_text>" --pretty
```

Optional arguments:

- XHS `--note-id <note_id>`: use the complete 24-character lowercase hexadecimal `note_id` returned from search, comments, creator note lists, or a previous detail result; do not pass only a prefix.
- XHS `--url <note_url_or_share_text>`: use for a note link, short link, or share text.
- Douyin `--aweme-id <aweme_id>`: preferred when the Douyin work ID is already known.
- Douyin `--url <douyin_content_url_or_share_text>`: use for a Douyin content page URL, short link, or share text; do not pass `video.play_url`.
- `--pretty`: output formatting only.
- Kuaishou `--photo-id <photo_id>`: preferred when the Kuaishou work photo_id is already known.
- Kuaishou `--url <kuaishou_content_url_or_share_text>`: use for a Kuaishou work page URL, short link, or share text.
- Weibo `--post-id <post_id>`: preferred when the Weibo post ID is already known.
- Weibo `--post-url <weibo_post_url_or_share_text>`: use for a Weibo post URL, short link, or share text.
- WeChat Channels / 视频号 `--encrypted-object-id <encrypted_object_id>`: use when the encrypted_object_id from search is already known.
- WeChat Channels / 视频号 `--url <wechat_video_url_or_share_text>`: use for a WeChat Channels video link or share text.

Use either the ID option or the URL option for detail commands, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_get_note_detail_by_note_id`
- `xhs_get_note_detail_by_note_url`
- `douyin_get_video_detail_by_aweme_id`
- `douyin_get_video_detail_by_url`
- `kuaishou_get_video_detail_by_photo_id`
- `kuaishou_get_video_detail_by_url`
- `weibo_get_post_detail_by_post_id`
- `weibo_get_post_detail_by_post_url`
- `wechat_get_video_detail_by_encrypted_object_id`
- `wechat_get_video_detail_by_url`

If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_note_detail_by_note_id`: use when the complete 24-character lowercase hexadecimal `note_id` is already known; do not pass only a prefix.
- `xhs_get_note_detail_by_note_url`: use for note URLs, short links, or share text.
- `douyin_get_video_detail_by_aweme_id`: use when an aweme_id is already known.
- `douyin_get_video_detail_by_url`: use for Douyin content page URLs, short links, or share text; do not pass playback URLs such as `video.play_url`.
- `kuaishou_get_video_detail_by_photo_id`: use when a photo_id is already known.
- `kuaishou_get_video_detail_by_url`: use for Kuaishou work page URLs, short links, or share text.
- `weibo_get_post_detail_by_post_id`: use when a post_id is already known.
- `weibo_get_post_detail_by_post_url`: use for Weibo post URLs, short links, or share text.
- `wechat_get_video_detail_by_encrypted_object_id`: use when encrypted_object_id from search is already known.
- `wechat_get_video_detail_by_url`: use for WeChat Channels / 视频号 video links or share text.

## Output Guidance

Return factual fields such as title or description, content, author, publish time, interaction counts, images, and media summary when available.
For XHS detail results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`; if `note_url` is null, show the `note_id` or say that no directly openable full link is available.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
For Douyin detail, include `content_type` when available.
For Douyin detail, use `images` for image/text posts; `video` is the platform player resource and may be audio for image/text posts; `music` is the bound music or original-sound asset.
Detail access is read-only and does not provide account actions.
For Weibo detail, include `post_id`, content, author, media, interaction counts, publish time, and post URL when available.
For WeChat Channels / 视频号 detail, preserve `object_id` and `object_nonce_id` because comments and replies need both values.
