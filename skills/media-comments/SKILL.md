---
name: media-comments
description: Fetch and analyze XHS comments/replies and Douyin comments/replies. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, and Douyin / 抖音.
metadata:
  openclaw:
    requires:
      env:
        - SOCIALDATAX_API_KEY
      bins:
        - node
        - npm
    primaryEnv: SOCIALDATAX_API_KEY
    emoji: "💬"
    homepage: https://socialdatax.com/?from=npm
    install:
      - kind: node
        package: "socialdatax-skills"
        bins: []
---

# Media Comments

Use this skill when the user wants comment mining, audience feedback, sentiment themes, objections, pain points, FAQ extraction, or discussion summaries for supported social media content.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_comments_by_*` and `xhs_get_note_sub_comments_by_comment_id` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_comments_by_*` and `douyin_get_video_comment_replies_by_comment_id` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. To get or manage an API Key, open <https://socialdatax.com/?from=npm> and follow the website API Key access flow. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs comments --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin comments --url "<douyin_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty
```

- XHS `--note-id <note_id>`: preferred when the note ID is already known and should anchor the comment thread.
- Douyin `--aweme-id <aweme_id>`: preferred when the video ID is already known and should anchor the comment thread.
- `--url <url_or_share_text>`: use for a content page URL, short link, or share text for first-level comments; for Douyin, do not pass `video.play_url`.
- `--comment-id <comment_id>`: required for XHS and Douyin reply commands; use the first-level comment ID under the same content item.
- `--page-token <next_page_token>`: opaque pagination token; pass back exactly the token returned by the previous page and do not reuse it across content items or comments.
- `--pretty`: output formatting only.

For XHS `comments`, use either `--note-id` or `--url`, not both. For Douyin `comments`, use either `--aweme-id` or `--url`, not both. For reply commands, use the content ID together with `--comment-id`.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

If MCP tools are already available in the current agent, use one of these tools:

- `xhs_get_note_comments_by_note_id`: use when the note ID is known.
- `xhs_get_note_comments_by_note_url`: use for note URLs, short links, or share text.
- `xhs_get_note_sub_comments_by_comment_id`: use when the note ID and first-level comment ID are known.
- `douyin_get_video_comments_by_aweme_id`: use when the aweme_id is known.
- `douyin_get_video_comments_by_url`: use for Douyin content page URLs, short links, or share text; do not pass playback URLs such as `video.play_url`.
- `douyin_get_video_comment_replies_by_comment_id`: use when the aweme_id and first-level comment ID are known.

Comment pagination uses `page_token`. Pass back exactly the returned `next_page_token`; tokens are bound to the current content item and should not be reused across objects. For Douyin comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request. XHS reply pagination also uses `page_token` and is bound to the current comment.

## Output Guidance

Group comments by observed themes before inferring sentiment or demand. Mention whether the result is one page or multiple pages. Empty comments can be a valid successful result.
