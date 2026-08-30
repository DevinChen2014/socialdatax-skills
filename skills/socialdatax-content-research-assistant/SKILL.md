---
name: "socialdatax-content-research-assistant"
description: "Use when doing cross-platform content research, topic planning, competitor research, trend insight, comment insight, or creator research across SocialDataX public platforms including 小红书 / XHS, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, and WeChat Channels, plus WeChat Official Account article link details."
source_client: "socialdatax-skills"
source_platform: "github"
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
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# SocialDataX Cross-Platform Content Research

Use this skill to combine SocialDataX content research commands for supported public platforms: Xiaohongshu / XHS / RedNote, Douyin, Kuaishou, Bilibili, Zhihu, Instagram, X / Twitter, YouTube, TikTok, Weibo, WeChat Channels, plus WeChat Official Account article link details.

Current platform support:

- Xiaohongshu / XHS / RedNote search hot list through `xhs_get_search_hot_list`.
- Douyin / 抖音 hot-search through `douyin_get_hot_search_list`.
- Kuaishou / 快手 hot-search through `kuaishou_get_hot_search_list`.
- Zhihu / 知乎 hot list through `zhihu_get_hot_list`.
- Weibo / 微博 hot-search through `weibo_get_hot_search_list`.
- WeChat Channels / 视频号 hot-search through `wechat_get_hot_search_list`.
- Xiaohongshu / XHS / RedNote notes through `xhs_search_notes`.
- Douyin / 抖音 works, including video and image/text posts, through `douyin_search_videos`.
- Kuaishou / 快手 works and short videos through `kuaishou_search_videos`.
- Bilibili / 哔哩哔哩 / B站 videos and articles through `bilibili_search_videos` and `bilibili_search_articles`.
- Zhihu / 知乎 answers, articles, and videos through `zhihu_search_content`.
- Instagram posts through `instagram_search_posts`.
- X / Twitter posts through `x_search_posts`.
- YouTube videos through `youtube_search_videos`.
- TikTok videos and image posts through `tiktok_search_posts`.
- Weibo / 微博 posts through `weibo_search_posts`.
- WeChat Channels / 视频号 videos through `wechat_search_videos`.
- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_detail_by_*` tools.
- Douyin / 抖音 works, including video and image/text posts, through the `douyin_get_video_detail_by_*` tools.
- Kuaishou / 快手 works through the `kuaishou_get_video_detail_by_*` tools.
- Bilibili / 哔哩哔哩 / B站 videos, articles, and dynamics through the `bilibili_get_content_detail_by_*` tools.
- Zhihu / 知乎 answers, articles, and videos through `zhihu_get_content_detail_by_url`.
- Instagram posts through the `instagram_get_post_detail_by_*` tools.
- X / Twitter posts through the `x_get_post_detail_by_*` tools.
- YouTube videos through `youtube_get_video_detail_by_url`.
- TikTok videos and image posts through `tiktok_get_post_detail_by_url`.
- Weibo / 微博 posts through the `weibo_get_post_detail_by_*` tools.
- WeChat Channels / 视频号 video and image-post details through the `wechat_get_video_detail_by_*` tools.
- WeChat Official Account / 微信公众号 articles through `wechat_get_mp_article_detail_by_url`.
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
- WeChat Channels / 视频号 creators through `wechat_get_user_info_by_url` for video or image-post links or share text, or `wechat_get_user_info_by_user_id` when a `v2_...@finder` user_id is already known.
- Xiaohongshu / XHS / RedNote creator notes through the `xhs_get_user_posted_notes_by_*` tools.
- Douyin / 抖音 creator works, including video and image/text posts, through the `douyin_get_user_posted_videos_by_*` tools.
- Douyin / 抖音 creator short-drama series through the `douyin_get_user_series_by_*` tools.
- Kuaishou / 快手 creator works through the `kuaishou_get_user_posted_videos_by_*` tools.
- Bilibili / 哔哩哔哩 / B站 creator videos, articles, and dynamics through the `bilibili_get_user_posted_*` tools.
- Zhihu / 知乎 creator articles through `zhihu_get_user_posted_articles_by_profile_url`.
- Instagram creator posts through the `instagram_get_user_posts_by_*` tools.
- X / Twitter creator posts through the `x_get_user_posts_by_*` tools.
- YouTube channel videos and Shorts through `youtube_get_user_posted_videos_by_channel_url`.
- TikTok creator posts through the `tiktok_get_user_posts_by_*` tools.
- Weibo / 微博 creator posts through the `weibo_get_user_posts_by_*` tools.
- WeChat Channels / 视频号 creator videos and image posts through the `wechat_get_user_posted_videos_by_*` tools; the user_id entrypoint requires a `v2_...@finder` user_id.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs hot-search --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --all --include-replies --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin hot-search --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin detail --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --all --include-replies --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-info --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-posts --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-posts --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou hot-search --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-search --keyword "<creator_keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou detail --photo-id "<photo_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou comments --photo-id "<photo_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou comments --photo-id "<photo_id>" --all --include-replies --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-info --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-posts --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-posts --user-id "<user_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili search-videos --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili search-articles --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili detail --content-id "<content_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili comments --content-id "<content_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-info --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-videos --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-articles --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-dynamics --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu hot-list --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu detail --content-url "<zhihu_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu comments --content-url "<zhihu_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu user-posts --profile-url "<profile_url_or_share_text>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram detail --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram comments --post-url "<instagram_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram user-info --username "<username>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram user-posts --username "<username>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram user-posts --username "<username>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x detail --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x comments --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-info --username "<username>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-posts --username "<username>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-posts --username "<username>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube detail --url "<youtube_video_url>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube comments --url "<youtube_video_url>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube channel-info --channel-url "<youtube_channel_url>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube user-posts --channel-url "<youtube_channel_url>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube user-posts --channel-url "<youtube_channel_url>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok detail --url "<tiktok_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok comments --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok user-info --tiktok-id "<tiktok_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok user-posts --tiktok-id "<tiktok_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok user-posts --tiktok-id "<tiktok_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo hot-search --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo detail --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo comments --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo comments --post-id "<post_id>" --all --include-replies --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo user-info --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo user-posts --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo user-posts --user-id "<user_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat hot-search --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat search --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat detail --encrypted-object-id "<encrypted_object_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat comments --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --all --include-replies --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat user-info --user-id "<v2_finder_user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat user-posts --user-id "<v2_finder_user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat user-posts --user-id "<v2_finder_user_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
```

Additional direct CLI entrypoints:

```bash
npx -y socialdatax-skills@latest xhs detail --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs comments --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin detail --url "<douyin_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin comments --url "<douyin_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --all --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin user-series --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-search --keyword "<creator_keyword>" --pages 3 --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou detail --url "<kuaishou_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou comments --url "<kuaishou_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili detail --url "<bilibili_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili comments --url "<bilibili_content_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili replies --comment-object-id "<comment_object_id>" --comment-object-type "<comment_object_type>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili reactions --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili reactions --url "<bilibili_opus_or_dynamic_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-videos --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-articles --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili user-dynamics --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest bilibili download --url "<bilibili_video_url_or_share_text>" --output-dir ./downloads --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest zhihu replies --content-url "<zhihu_content_url_or_share_text>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram detail --post-url "<instagram_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest instagram user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x detail --post-url "<x_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x comments --post-url "<x_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-info --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-posts --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest x user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest youtube replies --reply-token "<reply_token>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok comments --url "<tiktok_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest tiktok user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo detail --post-url "<weibo_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo comments --post-url "<weibo_post_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo likers --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo reposts --post-id "<post_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo user-info --profile-url "<profile_url>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo user-posts --profile-url "<profile_url>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest weibo replies --post-id "<post_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat detail --url "<wechat_work_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat article --url "<mp_article_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat comments --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat user-posts --url "<wechat_work_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
npx -y socialdatax-skills@latest wechat replies --object-id "<object_id>" --object-nonce-id "<object_nonce_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform github --source-skill socialdatax-content-research-assistant
```

For hot topics, content URLs, profile URLs, comment review, Bilibili reaction review, Weibo liker/repost review, creator facts, creator content lists, or short-drama series, call the matching `socialdatax-skills` platform subcommand instead of forcing every request through keyword research.

Required arguments:

- Use `xhs hot-search` without keyword when the user asks for current Xiaohongshu / XHS / RedNote hot topics or 小红书搜索热榜.
- Use `douyin hot-search` without keyword when the user asks for current Douyin hot topics.
- Use `kuaishou hot-search` without keyword when the user asks for current Kuaishou / 快手 hot topics.
- Use the matching platform search command for keyword research: `xhs search`, `douyin search`, `kuaishou search`, `bilibili search-videos`, `bilibili search-articles`, `zhihu search`, `instagram search`, `x search`, `youtube search`, `tiktok search`, `weibo search`, or `wechat search`.
- Use `kuaishou user-search --keyword <creator_keyword>` when the user wants to discover Kuaishou creator or account candidates by name, keyword, or niche before profile lookup.
- Use `zhihu hot-list` without keyword when the user asks for current Zhihu / 知乎 hot topics.
- For detail, comments, replies, creator profile, creator posts, and creator series commands, use the ID argument shown in the CLI example or the matching URL/profile-url/channel-url entrypoint, not both.
- Use `kuaishou search --keyword <text>` for Kuaishou keyword research.
- Use `weibo hot-search` without keyword when the user asks for current Weibo / 微博 hot topics.
- Use `wechat hot-search` without keyword when the user asks for current WeChat Channels / 视频号 hot topics.

Optional arguments:

- Search continuation uses `--page-token <next_page_token>` when a returned `next_page_token` is available. Omit `page_token` on the first token-paginated search request, and continue only with the complete returned `next_page_token` from the same chain.
- `--page-token <next_page_token>`: use for supported search continuation, Kuaishou creator search continuation, and token-paginated comments, replies, creator posts, creator notes, creator videos, creator articles, creator dynamics, and creator series. Keep the original topic, content item, creator-search keyword, or creator target stable. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages for search, comments, replies, creator posts, or creator series.
- `--all`: fetch comments, replies, creator posts, or creator series until `next_page_token` is empty; do not use it for search.
- `--max-items <n>`: stop after collecting N primary results.
- Kuaishou `user-search` supports `--pages <n>` and `--max-items <n>` for bounded creator candidate discovery; it does not support `--since-days`.
- `--since-days <1-365>`: supported only where the CLI option is documented, currently XHS, Douyin, Kuaishou, Weibo, and WeChat Channels search and creator content-list commands. For Bilibili video search, Zhihu search, and YouTube search, use the documented publish-time filters instead.
- `--include-replies`: for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels first-level comments, also fetch nested second-level replies under each returned comment.
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
- Use WeChat Channels / 视频号 commands for videos, comments, creators, creator works, and hot topics; use `wechat article` only for WeChat Official Account / 微信公众号 article links/details.
- If the user asks for both platforms, keep findings separated by platform before comparing patterns.

## Choose The Narrowest Entry
Use the most specific direct CLI command for the user's task instead of forcing every request through keyword research. The command prints JSON with `platform`, `tool`, `arguments`, and `data`.
When the selected command exposes `--since-days`, pass it with bounded `--pages` for recent content; otherwise use documented publish-time filters where available, or fetch bounded pages and filter returned `publish_time` values in the analysis.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_get_search_hot_list`, `xhs_search_notes`, `xhs_get_note_detail_by_note_id`, `xhs_get_note_comments_by_note_id`, `xhs_get_user_info_by_user_id`, `xhs_get_user_posted_notes_by_user_id`, `xhs_get_note_detail_by_note_url`, `xhs_get_note_comments_by_note_url`, `xhs_get_user_info_by_profile_url`, `xhs_get_user_posted_notes_by_profile_url`, `xhs_get_note_sub_comments_by_comment_id`
- DOUYIN: `douyin_get_hot_search_list`, `douyin_search_videos`, `douyin_get_video_detail_by_aweme_id`, `douyin_get_video_comments_by_aweme_id`, `douyin_get_user_info_by_sec_user_id`, `douyin_get_user_posted_videos_by_sec_user_id`, `douyin_get_video_detail_by_url`, `douyin_get_video_comments_by_url`, `douyin_get_user_info_by_profile_url`, `douyin_get_user_posted_videos_by_profile_url`, `douyin_get_user_series_by_sec_user_id`, `douyin_get_user_series_by_profile_url`, `douyin_get_video_comment_replies_by_comment_id`
- KUAISHOU: `kuaishou_get_hot_search_list`, `kuaishou_search_videos`, `kuaishou_search_users`, `kuaishou_get_video_detail_by_photo_id`, `kuaishou_get_video_comments_by_photo_id`, `kuaishou_get_user_info_by_user_id`, `kuaishou_get_user_posted_videos_by_user_id`, `kuaishou_get_video_detail_by_url`, `kuaishou_get_video_comments_by_url`, `kuaishou_get_user_info_by_profile_url`, `kuaishou_get_user_posted_videos_by_profile_url`, `kuaishou_get_video_comment_replies_by_comment_id`
- BILIBILI: `bilibili_search_videos`, `bilibili_search_articles`, `bilibili_get_content_detail_by_id`, `bilibili_get_content_comments_by_id`, `bilibili_get_user_info_by_user_id`, `bilibili_get_user_posted_videos_by_user_id`, `bilibili_get_user_posted_articles_by_user_id`, `bilibili_get_user_posted_dynamics_by_user_id`, `bilibili_get_content_detail_by_url`, `bilibili_get_content_comments_by_url`, `bilibili_get_content_comment_replies_by_comment_id`, `bilibili_get_content_likes_and_reposts_by_post_id`, `bilibili_get_content_likes_and_reposts_by_url`, `bilibili_get_user_info_by_profile_url`, `bilibili_get_user_posted_videos_by_profile_url`, `bilibili_get_user_posted_articles_by_profile_url`, `bilibili_get_user_posted_dynamics_by_profile_url`, `bilibili_get_video_download_links`
- ZHIHU: `zhihu_get_hot_list`, `zhihu_search_content`, `zhihu_get_content_detail_by_url`, `zhihu_get_content_comments_by_url`, `zhihu_get_user_info_by_profile_url`, `zhihu_get_user_posted_articles_by_profile_url`, `zhihu_get_comment_replies_by_url`
- INSTAGRAM: `instagram_search_posts`, `instagram_get_post_detail_by_post_id`, `instagram_get_post_comments_by_post_url`, `instagram_get_user_info_by_username`, `instagram_get_user_posts_by_username`, `instagram_get_post_detail_by_post_url`, `instagram_get_post_comment_replies_by_comment_id`, `instagram_get_user_info_by_profile_url`, `instagram_get_user_posts_by_profile_url`
- X: `x_search_posts`, `x_get_post_detail_by_post_id`, `x_get_post_comments_by_post_id`, `x_get_user_info_by_username`, `x_get_user_posts_by_username`, `x_get_post_detail_by_post_url`, `x_get_post_comments_by_post_url`, `x_get_post_comment_replies_by_comment_id`, `x_get_user_info_by_user_id`, `x_get_user_info_by_profile_url`, `x_get_user_posts_by_user_id`, `x_get_user_posts_by_profile_url`
- YOUTUBE: `youtube_search_videos`, `youtube_get_video_detail_by_url`, `youtube_get_video_comments_by_url`, `youtube_get_channel_info_by_url`, `youtube_get_user_posted_videos_by_channel_url`, `youtube_get_video_comment_replies`
- TIKTOK: `tiktok_search_posts`, `tiktok_get_post_detail_by_url`, `tiktok_get_post_comments_by_post_id`, `tiktok_get_user_info_by_tiktok_id`, `tiktok_get_user_posts_by_tiktok_id`, `tiktok_get_post_comments_by_url`, `tiktok_get_post_comment_replies`, `tiktok_get_user_info_by_profile_url`, `tiktok_get_user_posts_by_profile_url`
- WEIBO: `weibo_get_hot_search_list`, `weibo_search_posts`, `weibo_get_post_detail_by_post_id`, `weibo_get_post_comments_by_post_id`, `weibo_get_user_info_by_user_id`, `weibo_get_user_posts_by_user_id`, `weibo_get_post_detail_by_post_url`, `weibo_get_post_comments_by_post_url`, `weibo_get_post_liker_list_by_post_id`, `weibo_get_post_repost_list_by_post_id`, `weibo_get_user_info_by_profile_url`, `weibo_get_user_posts_by_profile_url`, `weibo_get_post_comment_replies_by_comment_id`
- WECHAT: `wechat_get_hot_search_list`, `wechat_search_videos`, `wechat_get_video_detail_by_encrypted_object_id`, `wechat_get_video_comments_by_object_id`, `wechat_get_user_info_by_user_id`, `wechat_get_user_posted_videos_by_user_id`, `wechat_get_video_detail_by_url`, `wechat_get_mp_article_detail_by_url`, `wechat_get_video_comments_by_url`, `wechat_get_user_posted_videos_by_url`, `wechat_get_video_comment_replies_by_comment_id`

MCP-only tools not available through the direct CLI: `douyin_search_users`, `douyin_get_user_info_by_douyin_id`, `weibo_get_post_liker_list_by_post_url`, `weibo_get_post_repost_list_by_post_url`, `wechat_get_user_info_by_url`

Use the automatically listed MCP tools above as the source of truth for tool names. Pick the narrowest tool for the user's platform and task. For search pagination, omit `page_token` on the first request and pass only the complete returned `next_page_token` when continuing the same chain.

XHS search parameter naming reminder: direct CLI uses `--sort-type`, `--publish-time-range`, and `--note-type`; the `xhs_search_notes` MCP tool uses `sort_type`, `publish_time_range`, and `note_type`. Do not pass `sortType`, `publishTimeRange`, or `noteType`.

## Output Guidance

For broad research, summarize visible evidence separately from interpretation and organize findings by platform, content angles, audience needs, trend signals, comment themes, creator positioning, and practical next steps.
For XHS search or detail results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`; if detail `note_url` is null, show the `note_id` or say that no directly openable full link is available.
For XHS `note_id`, copy the entire returned `note_id` exactly; do not pass or display only a prefix.
For comments, group observed themes before inferring sentiment or demand.
For creators, separate profile facts from content-list evidence; include Douyin short-drama series facts when the series command is used, Kuaishou work-list evidence when Kuaishou commands are used, Bilibili video/article/dynamic evidence when Bilibili creator commands are used, YouTube channel video-list evidence when YouTube commands are used, Weibo post-list evidence when Weibo commands are used, and WeChat Channels work-list evidence when WeChat Channels commands are used.
For hot-search, report ranking signals separately from keyword search results.

## Troubleshooting

- If an SDK/dependency, npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. If the current environment has permission, install or restore automatically. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- For non-balance, non-rate-limit network or API errors, preserve the error message, check `SOCIALDATAX_API_KEY`, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
- Batch processing: process items one by one as a queue by default; when the user explicitly needs batch efficiency, use at most 3 concurrent requests. As each item finishes, continue with the next one. Do not launch a large burst of requests. If `rate_limited` or a too-frequent-request error appears, do not abandon the task; stop starting new requests, wait for the returned wait time, or wait 2 seconds if none is provided, then continue the same queue from the unfinished position. Preserve completed results. If `insufficient_balance` or insufficient credits appears, stop remaining requests immediately, output the results already obtained, and ask the user to recharge or switch to an API Key with balance before continuing.
