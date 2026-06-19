---
name: "media-search"
description: "Search social media content by keyword for social research, competitor research, topic discovery, content planning, market observation, and trend scanning. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, Douyin / 抖音, Kuaishou / 快手 / Kwai, Weibo / 微博, and WeChat Channels / 视频号."
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
    emoji: "🔍"
    homepage: "https://socialdatax.52choujiang.com/?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Search

Use this skill when the user wants to discover social media content from a keyword, brand, product, campaign, creator niche, or research topic.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through `xhs_search_notes`.
- Douyin / 抖音 works, including video and image/text posts, through `douyin_search_videos`.
- Kuaishou / 快手 works and short videos through `kuaishou_search_videos`.
- Weibo / 微博 posts through `weibo_search_posts`.
- WeChat Channels / 视频号 videos through `wechat_search_videos`.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.52choujiang.com/?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.52choujiang.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pages 3 --pretty
npx -y socialdatax-skills@latest douyin search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest douyin search --keyword "<keyword>" --pages 3 --pretty
npx -y socialdatax-skills@latest kuaishou search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest kuaishou search --keyword "<keyword>" --pages 3 --pretty
npx -y socialdatax-skills@latest weibo search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest weibo search --keyword "<keyword>" --pages 3 --pretty
npx -y socialdatax-skills@latest wechat search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest wechat search --keyword "<keyword>" --pages 3 --pretty
```

Required arguments:

- XHS `search --keyword <text>`: required when using `xhs search`; use the user's actual intent, trim whitespace, and keep it focused.
- Douyin `search --keyword <text>`: required only when using `douyin search`; use the user's actual intent, trim whitespace, and keep it focused.
- Kuaishou `search --keyword <text>`: required only when using `kuaishou search`; use the user's actual intent, trim whitespace, and keep it focused.
- Weibo `search --keyword <text>`: required only when using `weibo search`; use the user's actual intent, trim whitespace, and keep it focused.
- WeChat Channels / 视频号 `search --keyword <text>`: required only when using `wechat search`; use the user's actual intent, trim whitespace, and keep it focused.

Optional arguments:

- XHS `--page <number>`: 1-based page number; use `1` for the first page and only increase it when continuing pagination.
- XHS `--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`: optional sort value; omit it for default sorting.
- XHS `--note-type <all|image|video>`: optional note type filter; default is `all`.
- XHS `--publish-time-range <all|day|week|half_year>`: optional publish-time filter; default is `all`.
- Douyin `--page-token <next_page_token>`: opaque pagination token; omit it on the first search request. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- Douyin `--sort-type <general|time_descending|like_count_descending>`: optional sort value; omit it for the default sort.
- Douyin `--publish-time-range <all|day|week|half_year>`: optional publish-time filter; omit it for no publish-time filter.
- Douyin `--duration-range <all|under_1_minute|one_to_five_minutes|over_5_minutes>`: optional duration filter; omit it for no duration filter.
- Douyin `--content-type <all|video|image>`: optional content type filter; omit it for all content types.
- XHS `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page`.
- Douyin `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page_token`.
- Kuaishou `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page_token`.
- `--max-items <n>`: stop after collecting N search results.
- `--pretty`: output formatting only.
- Kuaishou `--page-token <next_page_token>`: opaque pagination token; omit it on the first search request. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- Weibo `--page-token <next_page_token>`: opaque pagination token; omit it on the first search request. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- WeChat Channels / 视频号 `--page-token <next_page_token>`: opaque pagination token; omit it on the first search request. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- WeChat Channels / 视频号 `--sort-type <all|latest|popular>`: optional sort value; omit it for the default sort.
- WeChat Channels / 视频号 `--duration-range <all|under_5_min|between_5_and_20_min|over_20_min>`: optional duration filter; omit it for no duration filter.
- Weibo `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page_token`.
- WeChat Channels / 视频号 `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page_token`.

XHS sort values:
- `general`: default sorting.
- `time_descending`: newest first.
- `like_count_descending`: most liked first.
- `comment_count_descending`: most commented first.
- `collect_count_descending`: most collected first.

XHS note type filter values:
- `all`: no note type filter.
- `image`: image/text notes.
- `video`: video notes.

XHS publish-time filter values:
- `all`: no publish-time filter.
- `day`: published within one day.
- `week`: published within one week.
- `half_year`: published within half a year.

Douyin sort values:
- `general`: default sorting.
- `time_descending`: newest first.
- `like_count_descending`: most liked first.

Douyin publish-time filter values:
- `all`: no publish-time filter.
- `day`: published within one day.
- `week`: published within one week.
- `half_year`: published within half a year.

Douyin duration filter values:
- `all`: no duration filter.
- `under_1_minute`: under 1 minute.
- `one_to_five_minutes`: 1-5 minutes.
- `over_5_minutes`: over 5 minutes.

Douyin content type filter values:
- `all`: all content types.
- `video`: video works.
- `image`: image/text posts.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Search supports `--pages` and `--max-items`, but not `--all`, because search has no stable complete-result boundary. Multi-page output keeps merged results in `data.items` and adds `page_count`, `item_count`, and the next-page marker.
Kuaishou search pagination:
- Continue only when `next_page_token` is not empty.
- Pass the complete returned `next_page_token` back unchanged as `page_token` for the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.

WeChat Channels / 视频号 sort values:
- `all`: default sorting.
- `latest`: newest first.
- `popular`: most popular first.

WeChat Channels / 视频号 duration filter values:
- `all`: no duration filter.
- `under_5_min`: under 5 minutes.
- `between_5_and_20_min`: 5-20 minutes.
- `over_20_min`: over 20 minutes.

Weibo and WeChat Channels search pagination:
- Continue only when `next_page_token` is not empty.
- Pass the complete returned `next_page_token` back unchanged as `page_token` for the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_search_notes`
- `douyin_search_videos`
- `kuaishou_search_videos`
- `weibo_search_posts`
- `wechat_search_videos`

If MCP tools are already available in the current agent, call `xhs_search_notes` with:
- `keyword`: required search phrase or topic; use the user's actual intent and trim whitespace.
- `page`: optional 1-based page number; use `1` for the first page.
- `sort_type`: optional, one of `general`, `time_descending`, `like_count_descending`, `comment_count_descending`, `collect_count_descending`; omit it for default sorting.
- `note_type`: optional search filter, one of `all`, `image`, `video`; default is `all`.
- `publish_time_range`: optional search filter, one of `all`, `day`, `week`, `half_year`; default is `all`.

Use the same meanings as the CLI XHS sort and filter values above.

For Douyin, call `douyin_search_videos` with:
- `keyword`: required search phrase or topic.
- `page_token`: optional opaque pagination token. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
Do not pass `page` to `douyin_search_videos`; omit `page_token` on the first request.
- `sort_type`: optional, one of `general`, `time_descending`, `like_count_descending`; omit it for the default sort.
- `publish_time_range`: optional publish-time filter, one of `all`, `day`, `week`, `half_year`; omit it for no publish-time filter.
- `duration_range`: optional duration filter, one of `all`, `under_1_minute`, `one_to_five_minutes`, `over_5_minutes`; omit it for no duration filter.
- `content_type`: optional content type filter, one of `all`, `video`, `image`; omit it for all content types.

Continue XHS pagination only when `next_page` is not `null`, and keep the same `keyword`, `sort_type`, `note_type`, and `publish_time_range` while changing only `page`.
Continue Douyin pagination only when `next_page_token` is not empty. Pass the complete returned `next_page_token` back unchanged as `page_token` for the same keyword and filter chain.
Do not stop only because one page has empty `items`.
For Kuaishou, call `kuaishou_search_videos` with:
- `keyword`: required search phrase or topic.
- `page_token`: optional opaque pagination token. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
Do not pass `page` to `kuaishou_search_videos`; omit `page_token` on the first request.
Continue Kuaishou pagination only when `next_page_token` is not empty. Pass the complete returned `next_page_token` back unchanged as `page_token` for the same keyword chain.
For Weibo, call `weibo_search_posts` with:
- `keyword`: required search phrase or topic.
- `page_token`: optional opaque pagination token. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
Do not pass `page` to `weibo_search_posts`; omit `page_token` on the first request.
Continue Weibo pagination only when `next_page_token` is not empty. Pass the complete returned `next_page_token` back unchanged as `page_token` for the same keyword chain.
For WeChat Channels / 视频号, call `wechat_search_videos` with:
- `keyword`: required search phrase or topic.
- `page_token`: optional opaque pagination token. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
Do not pass `page` to `wechat_search_videos`; omit `page_token` on the first request.
- `sort_type`: optional, one of `all`, `latest`, `popular`; omit it for the default sort.
- `duration_range`: optional duration filter, one of `all`, `under_5_min`, `between_5_and_20_min`, `over_20_min`; omit it for no duration filter.
Continue WeChat Channels pagination only when `next_page_token` is not empty. Pass the complete returned `next_page_token` back unchanged as `page_token` for the same keyword and filter chain.

## Output Guidance

Summarize visible evidence separately from interpretation. Include useful content IDs, URLs, titles or descriptions, authors, counts, and publish time when the user needs traceability.
For XHS search results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
For Douyin search results, include `content_type` when the user needs traceability.
For Douyin image/text search results, use returned `images` and treat `video.media_type="audio"` as an audio player resource rather than a video post.
For Kuaishou search results, include `photo_id`, `share_url`, author facts, and visible interaction counts when the user needs traceability.
For Weibo search results, include `post_id`, `post_url`, author facts, interaction counts, and publish time when the user needs traceability.
For WeChat Channels / 视频号 search results, include `encrypted_object_id`, author facts, interaction counts, publish time, and duration when the user needs traceability.
