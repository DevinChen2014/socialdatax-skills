---
name: "media-comments"
description: "Fetch and analyze XHS comments/replies, Douyin comments/replies, Kuaishou comments/replies, Weibo comments/replies, and WeChat Channels / 视频号 comments/replies. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, Douyin / 抖音, Kuaishou / 快手 / Kwai, Weibo / 微博, and WeChat Channels / 视频号."
source_client: "socialdatax-skills"
source_platform: "npm"
source_skill: "media-comments"
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
    emoji: "💬"
    homepage: "https://socialdatax.com/ai?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Comments

Use this skill when the user wants comment mining, audience feedback, sentiment themes, objections, pain points, FAQ extraction, or discussion summaries for supported social media content.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_comments_by_*` and `xhs_get_note_sub_comments_by_comment_id` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_comments_by_*` and `douyin_get_video_comment_replies_by_comment_id` tools.
- Kuaishou / 快手 works through the `kuaishou_get_video_comments_by_*` and `kuaishou_get_video_comment_replies_by_comment_id` tools.
- Weibo / 微博 posts through the `weibo_get_post_comments_by_*` and `weibo_get_post_comment_replies_by_comment_id` tools.
- WeChat Channels / 视频号 videos through the `wechat_get_video_comments_by_*` and `wechat_get_video_comment_replies_by_comment_id` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名；do not infer alternate domains。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments

npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest xhs comments \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments

npx -y socialdatax-skills@latest xhs sub-comments \
  --note-id "<note_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest douyin comments \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments

npx -y socialdatax-skills@latest douyin comments \
  --aweme-id "<aweme_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest douyin comments \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest douyin replies \
  --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou comments \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou replies \
  --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest weibo comments \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments

npx -y socialdatax-skills@latest weibo comments \
  --post-id "<post_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest weibo comments \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest weibo replies \
  --post-id "<post_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest wechat comments \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest wechat comments \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --all \
  --include-replies --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill media-comments

npx -y socialdatax-skills@latest wechat comments \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments

npx -y socialdatax-skills@latest wechat replies \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" \
  --comment-id "<comment_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-comments
```

Optional arguments:

- XHS `--note-id <note_id>`: use the complete 24-character lowercase hexadecimal `note_id` returned from search, detail, comments, or creator note lists; do not pass only a prefix.
- XHS comments `--sort-type <default|time_descending|like_count_descending>`: optional first-level comment sort order; omit it for the platform default order.
- Douyin `--aweme-id <aweme_id>`: preferred when the video ID is already known and should anchor the comment thread.
- `--url <url_or_share_text>`: use for a content page URL, short link, or share text for first-level comments.
- Douyin URL safety: do not pass `video.play_url`; use a Douyin content page URL, short link, or share text instead.
- `--comment-id <comment_id>`: required for reply commands; use the first-level comment ID under the same content item.
- `--page-token <next_page_token>`: opaque pagination token; pass the complete returned `next_page_token` back unchanged for the same content item or comment chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages of first-level comments or replies.
- `--all`: continue first-level comments or replies until `next_page_token` is empty; there is no default item or page cap.
- `--max-items <n>`: stop after collecting N primary comments or replies.
- `--include-replies`: for first-level `comments` commands only, also fetch all second-level replies under each returned first-level comment.
- `--pretty`: output formatting only.
- Kuaishou `--photo-id <photo_id>`: preferred when the Kuaishou work photo_id is already known and should anchor the comment thread.
- Weibo `--post-id <post_id>`: preferred when the Weibo post ID is already known and should anchor the comment thread.
- Weibo `--post-url <weibo_post_url_or_share_text>`: use for a Weibo post URL, short link, or share text for first-level comments.
- WeChat Channels / 视频号 `--object-id <object_id>` and `--object-nonce-id <object_nonce_id>`: use together when both values are already known and should anchor the comment thread.
- WeChat Channels / 视频号 `--url <wechat_video_url_or_share_text>`: use for a WeChat Channels video link or share text for first-level comments.
- `--source-client socialdatax-skills --source-platform npm --source-skill media-comments`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use either the content ID option or the URL option for first-level comments, not both. For reply commands, use the content ID together with `--comment-id`.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged primary comments in `data.items` and adds `page_count`, `item_count`, and the next-page marker. With `--include-replies`, each first-level comment includes `replies`, `replies_page_count`, and `replies_next_page_token`.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_get_note_comments_by_note_id`
- `xhs_get_note_comments_by_note_url`
- `xhs_get_note_sub_comments_by_comment_id`
- `douyin_get_video_comments_by_aweme_id`
- `douyin_get_video_comments_by_url`
- `douyin_get_video_comment_replies_by_comment_id`
- `kuaishou_get_video_comments_by_photo_id`
- `kuaishou_get_video_comments_by_url`
- `kuaishou_get_video_comment_replies_by_comment_id`
- `weibo_get_post_comments_by_post_id`
- `weibo_get_post_comments_by_post_url`
- `weibo_get_post_comment_replies_by_comment_id`
- `wechat_get_video_comments_by_object_id`
- `wechat_get_video_comments_by_url`
- `wechat_get_video_comment_replies_by_comment_id`

If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_note_comments_by_note_id`: use when the complete 24-character lowercase hexadecimal `note_id` is known; do not pass only a prefix; optional `sort_type` accepts `default`, `time_descending`, or `like_count_descending`.
- `xhs_get_note_comments_by_note_url`: use for note URLs, short links, or share text; optional `sort_type` accepts `default`, `time_descending`, or `like_count_descending`.
- `xhs_get_note_sub_comments_by_comment_id`: use when the complete 24-character lowercase hexadecimal `note_id` and first-level comment ID are known; do not pass only a note ID prefix.
- `douyin_get_video_comments_by_aweme_id`: use when the aweme_id is known.
- `douyin_get_video_comments_by_url`: use for Douyin content page URLs, short links, or share text; do not pass playback URLs such as `video.play_url`.
- `douyin_get_video_comment_replies_by_comment_id`: use when both aweme_id and first-level comment ID are known; use page_token to continue pagination.

Comment pagination uses opaque `page_token` values. Pass the complete returned `next_page_token` back unchanged for the same content item or comment chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Prefer CLI `--pages`, `--all`, and `--include-replies` when the user asks for multiple pages or a full first-level plus second-level comment tree.
For Douyin comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
XHS reply pagination also uses `page_token` and is bound to the current comment.
- `kuaishou_get_video_comments_by_photo_id`: use when the photo_id is known.
- `kuaishou_get_video_comments_by_url`: use for Kuaishou work page URLs, short links, or share text.
- `kuaishou_get_video_comment_replies_by_comment_id`: use when the photo_id and first-level comment ID are known.
For Kuaishou comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- `weibo_get_post_comments_by_post_id`: use when the post_id is known.
- `weibo_get_post_comments_by_post_url`: use for Weibo post URLs, short links, or share text.
- `weibo_get_post_comment_replies_by_comment_id`: use when the post_id and first-level comment ID are known.
For Weibo comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- `wechat_get_video_comments_by_object_id`: use when both object_id and object_nonce_id are known.
- `wechat_get_video_comments_by_url`: use for WeChat Channels / 视频号 video links or share text.
- `wechat_get_video_comment_replies_by_comment_id`: use when object_id, object_nonce_id, and first-level comment ID are known.
For WeChat Channels / 视频号 comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.

## Output Guidance

Group comments by observed themes before inferring sentiment or demand. Mention whether the result is one page or multiple pages. Empty comments can be a valid successful result.
For Douyin comment media, use `image_urls` for attached pictures. When `sticker` is present, `sticker.static_url` is a static preview when non-empty, and `sticker.animated_url` is the animated resource when non-empty.
For Weibo and WeChat Channels / 视频号 comments, preserve returned content IDs from first-level comments so reply commands can use the same content item and comment chain.

## Troubleshooting

- For non-balance network or API errors, preserve the error message, check `SOCIALDATAX_API_KEY`, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
