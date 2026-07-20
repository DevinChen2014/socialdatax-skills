---
name: "socialdatax-content-research-assistant"
description: "Use when doing cross-platform content research, topic planning, competitor research, trend insight, comment insight, or creator research across 小红书 / Xiaohongshu / XHS / RedNote, 抖音 / Douyin, 快手 / Kuaishou / Kwai, 微博 / Weibo, 视频号 / WeChat Channels, and 微信公众号 / WeChat Official Account articles."
source_client: "socialdatax-skills"
source_platform: "npm"
source_skill: "socialdatax-content-research-assistant"
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
    emoji: "🔎"
    homepage: "https://socialdatax.com/ai?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# SocialDataX 小红书 Xiaohongshu XHS RedNote 抖音 Douyin 快手 Kuaishou 微博 Weibo 视频号 WeChat Channels Content Research

Use this skill to combine SocialDataX content research commands for 小红书 / Xiaohongshu / XHS / RedNote, 抖音 / Douyin, 快手 / Kuaishou / Kwai, 微博 / Weibo, 视频号 / WeChat Channels, and 微信公众号 / WeChat Official Account articles.

Current platform support:

- Xiaohongshu / XHS / RedNote search hot list through `xhs_get_search_hot_list`.
- Douyin / 抖音 hot-search through `douyin_get_hot_search_list`.
- Kuaishou / 快手 hot-search through `kuaishou_get_hot_search_list`.
- Weibo / 微博 hot-search through `weibo_get_hot_search_list`.
- WeChat Channels / 视频号 hot-search through `wechat_get_hot_search_list`.
- Xiaohongshu / XHS / RedNote notes through `xhs_search_notes`.
- Douyin / 抖音 works, including video and image/text posts, through `douyin_search_videos`.
- Kuaishou / 快手 works and short videos through `kuaishou_search_videos`.
- Weibo / 微博 posts through `weibo_search_posts`.
- WeChat Channels / 视频号 videos through `wechat_search_videos`.
- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_detail_by_*` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_detail_by_*` tools.
- Kuaishou / 快手 works through the `kuaishou_get_video_detail_by_*` tools.
- Weibo / 微博 posts through the `weibo_get_post_detail_by_*` tools.
- WeChat Channels / 视频号 videos through the `wechat_get_video_detail_by_*` tools.
- WeChat Official Account / 微信公众号 articles through `wechat_get_mp_article_detail_by_url`.
- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_comments_by_*` and `xhs_get_note_sub_comments_by_comment_id` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_comments_by_*` and `douyin_get_video_comment_replies_by_comment_id` tools.
- Kuaishou / 快手 works through the `kuaishou_get_video_comments_by_*` and `kuaishou_get_video_comment_replies_by_comment_id` tools.
- Weibo / 微博 posts through the `weibo_get_post_comments_by_*` and `weibo_get_post_comment_replies_by_comment_id` tools.
- WeChat Channels / 视频号 videos through the `wechat_get_video_comments_by_*` and `wechat_get_video_comment_replies_by_comment_id` tools.
- Xiaohongshu / XHS / RedNote creators through the `xhs_get_user_info_by_*` tools.
- Douyin / 抖音 creators through the `douyin_get_user_info_by_*` tools.
- Kuaishou / 快手 creators through the `kuaishou_get_user_info_by_*` tools.
- Kuaishou / 快手 creator discovery through `kuaishou_search_users` before profile lookup when only an account keyword or niche is known.
- Weibo / 微博 creators through the `weibo_get_user_info_by_*` tools.
- WeChat Channels / 视频号 creators through `wechat_get_user_info_by_user_id`.
- Xiaohongshu / XHS / RedNote creator notes through the `xhs_get_user_posted_notes_by_*` tools.
- Douyin / 抖音 creator works, including video and image/text posts, through the `douyin_get_user_posted_videos_by_*` tools.
- Douyin / 抖音 creator short-drama series through the `douyin_get_user_series_by_*` tools.
- Kuaishou / 快手 creator works through the `kuaishou_get_user_posted_videos_by_*` tools.
- Weibo / 微博 creator posts through the `weibo_get_user_posts_by_*` tools.
- WeChat Channels / 视频号 creator videos through the `wechat_get_user_posted_videos_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名；do not infer alternate domains。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs hot-search \
  --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs detail \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin hot-search \
  --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin search \
  --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin detail \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin comments \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin comments \
  --aweme-id "<aweme_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-info \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-posts \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-posts \
  --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou hot-search \
  --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou search \
  --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-search \
  --keyword "<creator_keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou detail \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo hot-search \
  --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo search \
  --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo detail \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo comments \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo comments \
  --post-id "<post_id>" --all --include-replies --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo user-info \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo user-posts \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo user-posts \
  --user-id "<user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat hot-search \
  --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat search \
  --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat detail \
  --encrypted-object-id "<encrypted_object_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat comments \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat comments \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --all \
  --include-replies --pretty --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat user-info \
  --user-id "<finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<finder_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat user-posts \
  --user-id "<finder_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant
```

Additional direct CLI entrypoints:

```bash
npx -y socialdatax-skills@latest xhs detail \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs comments \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin detail \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin comments \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-series \
  --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-series \
  --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin user-series \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest xhs sub-comments \
  --note-id "<note_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest douyin replies \
  --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-search \
  --keyword "<creator_keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou detail \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou comments \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest kuaishou replies \
  --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo detail \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo comments \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo likers \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo reposts \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo user-posts \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest weibo replies \
  --post-id "<post_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat detail \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat article \
  --url "<mp_article_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat comments \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat user-posts \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant

npx -y socialdatax-skills@latest wechat replies \
  --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" \
  --comment-id "<comment_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill socialdatax-content-research-assistant
```

For hot topics, content URLs, profile URLs, comment review, Weibo liker/repost review, creator facts, creator content lists, or short-drama series, call the matching `socialdatax-skills` platform subcommand instead of forcing every request through keyword research.

Required arguments:

- Use `xhs hot-search` without keyword when the user asks for current Xiaohongshu / XHS / RedNote hot topics or 小红书搜索热榜.
- Use `douyin hot-search` without keyword when the user asks for current Douyin hot topics.
- Use `kuaishou hot-search` without keyword when the user asks for current Kuaishou / 快手 hot topics.
- Use `xhs search --keyword <text>`, `douyin search --keyword <text>`, `kuaishou search --keyword <text>`, `weibo search --keyword <text>`, or `wechat search --keyword <text>` for keyword research.
- Use `kuaishou user-search --keyword <creator_keyword>` when the user wants to discover Kuaishou creator or account candidates by name, keyword, or niche before profile lookup.
- For detail, comments, replies, creator profile, creator posts, and creator series commands, use the ID argument shown in the CLI example or the matching URL/profile-url entrypoint, not both.
- Use `kuaishou search --keyword <text>` for Kuaishou keyword research.
- Use `weibo hot-search` without keyword when the user asks for current Weibo / 微博 hot topics.
- Use `wechat hot-search` without keyword when the user asks for current WeChat Channels / 视频号 hot topics.

Optional arguments:

- Search continuation uses `--page-token <next_page_token>` when a returned `next_page_token` is available. Omit `page_token` on the first token-paginated search request, and continue only with the complete returned `next_page_token` from the same chain.
- `--page-token <next_page_token>`: use for XHS/Douyin/Kuaishou/Weibo/WeChat Channels search continuation, Kuaishou creator search continuation, and token-paginated comments, replies, creator posts, creator notes, creator videos, and creator series. Keep the original topic, content item, creator-search keyword, or creator target stable. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages for search, comments, replies, creator posts, or creator series.
- `--all`: fetch comments, replies, creator posts, or creator series until `next_page_token` is empty; do not use it for search.
- `--max-items <n>`: stop after collecting N primary results.
- Kuaishou `user-search` supports `--pages <n>` and `--max-items <n>` for bounded creator candidate discovery; it does not support `--since-days`.
- `--since-days <1-365>`: keep search or creator content-list items whose public `publish_time` is within the last N days. Search stays bounded by `--pages`; creator content lists continue until the publish-time boundary when `--pages` is omitted.
- `--include-replies`: for first-level comments, also fetch nested second-level replies under each returned comment.
- XHS comments `--sort-type <default|time_descending|like_count_descending>`: optional first-level comment sort order; omit it for the platform default order.
- Keyword research filters: use the documented XHS, Douyin, and WeChat Channels search `--sort-type` values; `--note-type`, `--publish-time-range`, `--duration-range`, and `--content-type` apply only where supported. Kuaishou and Weibo search currently use `--keyword` and optional `--page-token`.
- `--comment-id`: required for reply/sub-comment commands together with the content ID.
- `--pretty`: output formatting only.
- `--source-client socialdatax-skills --source-platform npm --source-skill socialdatax-content-research-assistant`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

## Choose The Platform

- Use XHS commands for Xiaohongshu / XHS / RedNote / 小红书 search hot list, notes, comments, creators, and creator note lists.
- Use Douyin commands for Douyin / 抖音 works, comments, creators, hot topics, creator works, and creator short-drama series.
- Use Kuaishou commands for Kuaishou / 快手 hot topics, short videos, keyword research, comments, creators, and creator works.
- Use Weibo commands for Weibo / 微博 posts, comments, creators, creator posts, and hot topics.
- Use WeChat Channels / 视频号 commands for videos, comments, creators, creator videos, hot topics, and WeChat Official Account / 微信公众号 articles.
- If the user asks for both platforms, keep findings separated by platform before comparing patterns.

## Choose The Narrowest Entry

Use the most specific direct CLI command for the user's task instead of forcing every request through keyword research. The command prints JSON with `platform`, `tool`, `arguments`, and `data`.
When the user asks for recent content, pass CLI `--since-days <n>` with bounded `--pages`; keep in mind this filters returned `publish_time` values and does not promise complete platform coverage.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_get_search_hot_list`, `xhs_search_notes`, `xhs_get_note_detail_by_note_id`, `xhs_get_note_comments_by_note_id`, `xhs_get_user_info_by_user_id`, `xhs_get_user_posted_notes_by_user_id`, `xhs_get_note_detail_by_note_url`, `xhs_get_note_comments_by_note_url`, `xhs_get_user_info_by_profile_url`, `xhs_get_user_posted_notes_by_profile_url`, `xhs_get_note_sub_comments_by_comment_id`
- DOUYIN: `douyin_get_hot_search_list`, `douyin_search_videos`, `douyin_get_video_detail_by_aweme_id`, `douyin_get_video_comments_by_aweme_id`, `douyin_get_user_info_by_sec_user_id`, `douyin_get_user_posted_videos_by_sec_user_id`, `douyin_get_video_detail_by_url`, `douyin_get_video_comments_by_url`, `douyin_get_user_info_by_profile_url`, `douyin_get_user_posted_videos_by_profile_url`, `douyin_get_user_series_by_sec_user_id`, `douyin_get_user_series_by_profile_url`, `douyin_get_video_comment_replies_by_comment_id`
- KUAISHOU: `kuaishou_get_hot_search_list`, `kuaishou_search_videos`, `kuaishou_search_users`, `kuaishou_get_video_detail_by_photo_id`, `kuaishou_get_video_comments_by_photo_id`, `kuaishou_get_user_info_by_user_id`, `kuaishou_get_user_posted_videos_by_user_id`, `kuaishou_get_video_detail_by_url`, `kuaishou_get_video_comments_by_url`, `kuaishou_get_user_info_by_profile_url`, `kuaishou_get_user_posted_videos_by_profile_url`, `kuaishou_get_video_comment_replies_by_comment_id`
- WEIBO: `weibo_get_hot_search_list`, `weibo_search_posts`, `weibo_get_post_detail_by_post_id`, `weibo_get_post_comments_by_post_id`, `weibo_get_user_info_by_user_id`, `weibo_get_user_posts_by_user_id`, `weibo_get_post_detail_by_post_url`, `weibo_get_post_comments_by_post_url`, `weibo_get_post_liker_list_by_post_id`, `weibo_get_post_repost_list_by_post_id`, `weibo_get_user_info_by_profile_url`, `weibo_get_user_posts_by_profile_url`, `weibo_get_post_comment_replies_by_comment_id`
- WECHAT: `wechat_get_hot_search_list`, `wechat_search_videos`, `wechat_get_video_detail_by_encrypted_object_id`, `wechat_get_video_comments_by_object_id`, `wechat_get_user_info_by_user_id`, `wechat_get_user_posted_videos_by_user_id`, `wechat_get_video_detail_by_url`, `wechat_get_mp_article_detail_by_url`, `wechat_get_video_comments_by_url`, `wechat_get_user_posted_videos_by_url`, `wechat_get_video_comment_replies_by_comment_id`

Use the automatically listed MCP tools above as the source of truth for tool names. Pick the narrowest tool for the user's platform and task.
For search pagination, omit `page_token` on the first request and pass only the complete returned `next_page_token` when continuing the same chain. Use `page_token` for all new search continuation calls.

## Output Guidance

For broad research, summarize visible evidence separately from interpretation and organize findings by platform, content angles, audience needs, trend signals, comment themes, creator positioning, and practical next steps.
For XHS search or detail results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`; if detail `note_url` is null, show the `note_id` or say that no directly openable full link is available.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
For comments, group observed themes before inferring sentiment or demand.
For creators, separate profile facts from content-list evidence; include Douyin short-drama series facts when the series command is used, Kuaishou work-list evidence when Kuaishou commands are used, Weibo post-list evidence when Weibo commands are used, and 视频号 video-list evidence when WeChat Channels commands are used.
For hot-search, report ranking signals separately from keyword search results.

## Troubleshooting

- For non-balance network or API errors, preserve the error message, check `SOCIALDATAX_API_KEY`, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
