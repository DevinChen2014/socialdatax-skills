---
name: "media-comments"
description: "Fetch and analyze comments/replies for supported SocialDataX public platforms. This version is backed by hosted platform MCP services and supports Xiaohongshu / XHS / RedNote, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, and WeChat Channels."
source_client: "socialdatax-skills"
source_platform: "github"
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
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Comments

Use this skill when the user wants comment mining, audience feedback, sentiment themes, objections, pain points, FAQ extraction, or discussion summaries for supported social media content.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_comments_by_*` and `xhs_get_note_sub_comments_by_comment_id` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_comments_by_*` and `douyin_get_video_comment_replies_by_comment_id` tools.
- Kuaishou / 快手 works through the `kuaishou_get_video_comments_by_*` and `kuaishou_get_video_comment_replies_by_comment_id` tools.
- Bilibili / 哔哩哔哩 / B站 comments through the `bilibili_get_content_comments_by_*` and `bilibili_get_content_comment_replies_by_comment_id` tools.
- Zhihu / 知乎 comments through `zhihu_get_content_comments_by_url` and `zhihu_get_comment_replies_by_url`.
- Instagram comments through `instagram_get_post_comments_by_post_url` and `instagram_get_post_comment_replies_by_comment_id`.
- X / Twitter comments through the `x_get_post_comments_by_*` and `x_get_post_comment_replies_by_comment_id` tools.
- YouTube comments through `youtube_get_video_comments_by_url` and `youtube_get_video_comment_replies`.
- TikTok comments through the `tiktok_get_post_comments_by_*` and `tiktok_get_post_comment_replies` tools.
- Weibo / 微博 posts through the `weibo_get_post_comments_by_*` and `weibo_get_post_comment_replies_by_comment_id` tools.
- WeChat Channels / 视频号 videos through the `wechat_get_video_comments_by_*` and `wechat_get_video_comment_replies_by_comment_id` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest xhs comments \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest xhs sub-comments \
  --note-id "<note_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest douyin comments \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest douyin comments \
  --aweme-id "<aweme_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest douyin comments \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest douyin replies \
  --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou comments \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest kuaishou replies \
  --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest bilibili comments \
  --content-id "<content_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest bilibili comments \
  --url "<bilibili_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest bilibili replies \
  --comment-object-id "<comment_object_id>" \
  --comment-object-type "<comment_object_type>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest zhihu comments \
  --content-url "<zhihu_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest zhihu replies \
  --content-url "<zhihu_content_url_or_share_text>" --comment-id "<comment_id>" \
  --pretty --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest instagram comments \
  --post-url "<instagram_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest instagram replies \
  --post-id "<post_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest x comments \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest x comments \
  --post-url "<x_post_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest x replies \
  --post-id "<post_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest youtube comments \
  --url "<youtube_video_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest youtube replies \
  --reply-token "<reply_token>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest tiktok comments \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest tiktok comments \
  --url "<tiktok_post_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest tiktok replies \
  --post-id "<post_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest weibo comments \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest weibo comments \
  --post-id "<post_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest weibo comments \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest weibo replies \
  --post-id "<post_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest wechat comments \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-comments

npx -y socialdatax-skills@latest wechat comments \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --all \
  --include-replies --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest wechat comments \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments

npx -y socialdatax-skills@latest wechat replies \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" \
  --comment-id "<comment_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-comments
```

Optional arguments:

- XHS `--note-id <note_id>`: use the entire `note_id` returned from search, detail, comments, or creator note lists; do not pass only a prefix.
- XHS comments `--sort-type <default|time_descending|like_count_descending>`: optional first-level comment sort order; omit it for the platform default order.
- Douyin `--aweme-id <aweme_id>`: preferred when the video ID is already known and should anchor the comment thread.
- Use the URL entrypoint shown in the CLI example for a content page URL, short link, or share text for first-level comments.
- Douyin URL safety: do not pass `video.play_url`; use a Douyin content page URL, short link, or share text instead.
- `--comment-id <comment_id>`: required only for reply commands whose CLI example uses comment IDs; YouTube replies require the returned `--reply-token <reply_token>` instead.
- `--page-token <next_page_token>`: opaque pagination token; pass the complete returned `next_page_token` back unchanged for the same content item or comment chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages of first-level comments or replies.
- `--all`: continue first-level comments or replies until `next_page_token` is empty; there is no default item or page cap.
- `--max-items <n>`: stop after collecting N primary comments or replies.
- XHS, Douyin, Kuaishou, Weibo, and WeChat Channels / 视频号 `comments --include-replies`: for supported first-level comments commands, also fetch all second-level replies under each returned first-level comment.
- `--pretty`: output formatting only.
- Kuaishou `--photo-id <photo_id>`: preferred when the Kuaishou work photo_id is already known and should anchor the comment thread.
- Bilibili `--content-id <content_id>`: preferred for first-level comments when the Bilibili content ID is already known.
- Bilibili `--url <bilibili_content_url_or_share_text>`: use for a Bilibili video, article, dynamic, short link, or share text for first-level comments.
- Bilibili comments `--sort-type <hot|time_descending>`: optional first-level comment sort order; omit it for default sorting.
- Bilibili replies `--comment-object-id <comment_object_id>`, `--comment-object-type <comment_object_type>`, and `--comment-id <comment_id>`: use the reply identifiers returned from Bilibili first-level comments.
- Zhihu `--content-url <zhihu_content_url_or_share_text>`: use for Zhihu first-level comments and replies; replies also require `--comment-id <comment_id>`.
- Zhihu comments `--sort-type <default|time_descending>`: optional first-level comment sort order; omit it for default sorting.
- Instagram `--post-url <instagram_post_url_or_share_text>`: use for first-level comments; replies require `--post-id <post_id>` and `--comment-id <comment_id>`.
- X / Twitter `--post-id <post_id>` or `--post-url <x_post_url_or_share_text>`: use for first-level comments; replies require `--post-id <post_id>` and `--comment-id <comment_id>`.
- YouTube `--url <youtube_video_url>`: use for first-level comments; replies require the returned `--reply-token <reply_token>`.
- YouTube comments `--sort-type <hot|time_descending>`: optional first-level comment sort order; omit it for default sorting.
- TikTok `--post-id <post_id>` or `--url <tiktok_post_url_or_share_text>`: use for first-level comments; replies require `--post-id <post_id>` and `--comment-id <comment_id>`.
- Weibo `--post-id <post_id>`: preferred when the Weibo post ID is already known and should anchor the comment thread.
- Weibo `--post-url <weibo_post_url_or_share_text>`: use for a Weibo post URL, short link, or share text for first-level comments.
- WeChat Channels / 视频号 `--object-id <object_id>` and `--object-nonce-id <object_nonce_id>`: use together when both values are already known and should anchor the comment thread.
- WeChat Channels / 视频号 `--url <wechat_video_url_or_share_text>`: use for a WeChat Channels video link or share text for first-level comments.
- `--source-client socialdatax-skills --source-platform github --source-skill media-comments`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use one first-level comment entrypoint shown in the CLI example at a time; do not mix multiple content identifiers in one command. For reply commands, use the platform-specific reply identifiers shown in the CLI example.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged primary comments in `data.items` and adds `page_count`, `item_count`, and the next-page marker. On platforms that support `--include-replies`, each first-level comment includes `replies`, `replies_page_count`, and `replies_next_page_token`.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_get_note_comments_by_note_id`, `xhs_get_note_comments_by_note_url`, `xhs_get_note_sub_comments_by_comment_id`
- DOUYIN: `douyin_get_video_comments_by_aweme_id`, `douyin_get_video_comments_by_url`, `douyin_get_video_comment_replies_by_comment_id`
- KUAISHOU: `kuaishou_get_video_comments_by_photo_id`, `kuaishou_get_video_comments_by_url`, `kuaishou_get_video_comment_replies_by_comment_id`
- BILIBILI: `bilibili_get_content_comments_by_id`, `bilibili_get_content_comments_by_url`, `bilibili_get_content_comment_replies_by_comment_id`
- ZHIHU: `zhihu_get_content_comments_by_url`, `zhihu_get_comment_replies_by_url`
- INSTAGRAM: `instagram_get_post_comments_by_post_url`, `instagram_get_post_comment_replies_by_comment_id`
- X: `x_get_post_comments_by_post_id`, `x_get_post_comments_by_post_url`, `x_get_post_comment_replies_by_comment_id`
- YOUTUBE: `youtube_get_video_comments_by_url`, `youtube_get_video_comment_replies`
- TIKTOK: `tiktok_get_post_comments_by_post_id`, `tiktok_get_post_comments_by_url`, `tiktok_get_post_comment_replies`
- WEIBO: `weibo_get_post_comments_by_post_id`, `weibo_get_post_comments_by_post_url`, `weibo_get_post_comment_replies_by_comment_id`
- WECHAT: `wechat_get_video_comments_by_object_id`, `wechat_get_video_comments_by_url`, `wechat_get_video_comment_replies_by_comment_id`

If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_note_comments_by_note_id`: use when the full `note_id` is known; do not pass only a prefix; optional `sort_type` accepts `default`, `time_descending`, or `like_count_descending`.
- `xhs_get_note_comments_by_note_url`: use for note URLs, short links, or share text; optional `sort_type` accepts `default`, `time_descending`, or `like_count_descending`.
- `xhs_get_note_sub_comments_by_comment_id`: use when the full `note_id` and first-level comment ID are known; do not pass only a note ID prefix.
- `douyin_get_video_comments_by_aweme_id`: use when the aweme_id is known.
- `douyin_get_video_comments_by_url`: use for Douyin content page URLs, short links, or share text; do not pass playback URLs such as `video.play_url`.
- `douyin_get_video_comment_replies_by_comment_id`: use when both aweme_id and first-level comment ID are known; use page_token to continue pagination.

- Comment pagination uses opaque `page_token` values. Pass the complete returned `next_page_token` back unchanged for the same content item or comment chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Prefer CLI `--pages` and `--all` for multiple comment pages; use `--include-replies` only on XHS, Douyin, Kuaishou, Weibo, and WeChat Channels / 视频号 when the user asks for a full first-level plus second-level comment tree.
- For Douyin comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- XHS reply pagination also uses `page_token` and is bound to the current comment.
- `kuaishou_get_video_comments_by_photo_id`: use when the photo_id is known.
- `kuaishou_get_video_comments_by_url`: use for Kuaishou work page URLs, short links, or share text.
- `kuaishou_get_video_comment_replies_by_comment_id`: use when the photo_id and first-level comment ID are known.
- For Kuaishou comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- `bilibili_get_content_comments_by_id`: use when the Bilibili content_id is known; optional `sort_type` accepts `hot` or `time_descending`.
- `bilibili_get_content_comments_by_url`: use for Bilibili video, article, dynamic, short link, or share text; optional `sort_type` accepts `hot` or `time_descending`.
- `bilibili_get_content_comment_replies_by_comment_id`: use when comment_object_id, comment_object_type, and first-level comment ID are known.
- `zhihu_get_content_comments_by_url`: use for Zhihu answer, article, or video URLs; optional `sort_type` accepts `default` or `time_descending`.
- `zhihu_get_comment_replies_by_url`: use when the Zhihu content URL and first-level comment ID are known.
- `instagram_get_post_comments_by_post_url`: use for Instagram post URLs.
- `instagram_get_post_comment_replies_by_comment_id`: use when the Instagram post_id and first-level comment ID are known.
- `x_get_post_comments_by_post_id`: use when the X post_id is known.
- `x_get_post_comments_by_post_url`: use for X post URLs.
- `x_get_post_comment_replies_by_comment_id`: use when the X post_id and first-level comment ID are known.
- `youtube_get_video_comments_by_url`: use for YouTube video URLs; optional `sort_type` accepts `hot` or `time_descending`.
- `youtube_get_video_comment_replies`: use the reply_token returned by YouTube first-level comments.
- `tiktok_get_post_comments_by_post_id`: use when the TikTok post_id is known.
- `tiktok_get_post_comments_by_url`: use for TikTok post URLs or share text.
- `tiktok_get_post_comment_replies`: use when the TikTok post_id and first-level comment ID are known.
- `weibo_get_post_comments_by_post_id`: use when the post_id is known.
- `weibo_get_post_comments_by_post_url`: use for Weibo post URLs, short links, or share text.
- `weibo_get_post_comment_replies_by_comment_id`: use when the post_id and first-level comment ID are known.
- For Weibo comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- `wechat_get_video_comments_by_object_id`: use when both object_id and object_nonce_id are known.
- `wechat_get_video_comments_by_url`: use for WeChat Channels / 视频号 video links or share text.
- `wechat_get_video_comment_replies_by_comment_id`: use when object_id, object_nonce_id, and first-level comment ID are known.
- For WeChat Channels / 视频号 comments and replies, continue only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.

## Output Guidance

Group comments by observed themes before inferring sentiment or demand. Mention whether the result is one page or multiple pages. Empty comments can be a valid successful result.
For Douyin comment media, use `image_urls` for attached pictures. When `sticker` is present, `sticker.static_url` is a static preview when non-empty, and `sticker.animated_url` is the animated resource when non-empty.
For Bilibili comments, preserve returned comment_object_id and comment_object_type values so reply commands can use the same comment thread.
For YouTube comments, preserve returned reply_token values so reply commands can continue the correct thread.
For Zhihu, Instagram, X / Twitter, and TikTok comments, preserve returned post or content IDs and first-level comment IDs for reply commands.
For Weibo and WeChat Channels / 视频号 comments, preserve returned content IDs from first-level comments so reply commands can use the same content item and comment chain.

## Troubleshooting

- If an SDK/dependency, npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. If the current environment has permission, install or restore automatically. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- For non-balance network or API errors, preserve the error message, check `SOCIALDATAX_API_KEY`, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
