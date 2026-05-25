---
name: media-detail
description: Read structured social media content details and metrics from content IDs, URLs, short links, or share text. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, and Douyin / 抖音.
metadata:
  openclaw:
    requires:
      env:
        - SOCIALDATAX_API_KEY
      bins:
        - node
        - npm
    primaryEnv: SOCIALDATAX_API_KEY
    emoji: "📄"
    homepage: https://socialdatax.com
    install:
      - kind: node
        package: "socialdatax-skills"
        bins: []
---

# Media Detail

Use this skill when the user provides a content link, short link, share text, or content ID and wants structured details or interaction metrics.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_detail_by_*` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_detail_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. To get or manage an API Key, open <https://socialdatax.com> and follow the website API Key access flow. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs detail --url "<note_url_or_share_text_or_note_id>" --pretty
npx -y socialdatax-skills@latest douyin detail --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin detail --url "<douyin_content_url_or_share_text>" --pretty
```

- XHS `--note-id <note_id>`: preferred when the note ID is already known from search, comments, or a previous detail result.
- XHS `--url <note_url_or_share_text_or_note_id>`: use for a note link, short link, share text, or note ID when you want the alternate entrypoint for one note.
- Douyin `--aweme-id <aweme_id>`: preferred when the Douyin work ID is already known.
- Douyin `--url <douyin_content_url_or_share_text>`: use for a Douyin content page URL, short link, or share text; do not pass `video.play_url`.
- `--pretty`: output formatting only.

Use either the ID option or the URL option for detail commands, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

If MCP tools are already available in the current agent, use one of these tools:

- `xhs_get_note_detail_by_note_id`: use when a note ID is already known.
- `xhs_get_note_detail_by_note_url`: use for note URLs, short links, share text, or note IDs.
- `douyin_get_video_detail_by_aweme_id`: use when an aweme_id is already known.
- `douyin_get_video_detail_by_url`: use for Douyin content page URLs, short links, or share text; do not pass playback URLs such as `video.play_url`.

## Output Guidance

Return factual fields such as title or description, content, author, publish time, interaction counts, `content_type`, images, and media summary when available. For Douyin detail, use `images` for image/text posts; `video` is the platform player resource and may be audio for image/text posts; `music` is the bound music or original-sound asset. Detail access is read-only and does not provide account actions.
