---
name: media-search
description: Search social media content by keyword for social research, competitor research, topic discovery, content planning, market observation, and trend scanning. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, and Douyin / 抖音.
metadata:
  openclaw:
    requires:
      env:
        - SOCIALDATAX_API_KEY
      bins:
        - node
        - npm
    primaryEnv: SOCIALDATAX_API_KEY
    emoji: "🔍"
    homepage: https://socialdatax.com
    install:
      - kind: node
        package: "socialdatax-skills"
        bins: []
---

# Media Search

Use this skill when the user wants to discover social media content from a keyword, brand, product, campaign, creator niche, or research topic.

Current platform support:

- Xiaohongshu / XHS / RedNote notes through `xhs_search_notes`.
- Douyin / 抖音 works, including video and image/text posts, through `douyin_search_videos`.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. To get or manage an API Key, open <https://socialdatax.com> and follow the website API Key access flow. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest douyin search --keyword "<keyword>" --pretty
```

Required arguments:

- `--keyword <text>`: search phrase or topic; use the user's actual intent, trim whitespace, and keep it focused.

Optional arguments:

- XHS `--page <number>`: 1-based page number; use `1` for the first page and only increase it when continuing pagination.
- XHS `--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`: optional sort value; omit it for default sorting.
- XHS `--note-type <all|image|video>`: optional note type filter; default is `all`.
- XHS `--publish-time-range <all|day|week|half_year>`: optional publish-time filter; default is `all`.
- Douyin `--page-token <next_page_token>`: opaque pagination token returned by the previous page.
- Douyin `--sort-type <general|time_descending|like_count_descending>`: optional sort value; omit it for the default sort.
- Douyin `--publish-time-range <all|day|week|half_year>`: optional publish-time filter; omit it for no publish-time filter.
- Douyin `--duration-range <all|under_1_minute|one_to_five_minutes|over_5_minutes>`: optional duration filter; omit it for no duration filter.
- Douyin `--content-type <all|video|image>`: optional content type filter; omit it for all content types.
- `--pretty`: output formatting only; it does not change the query or the returned notes.

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

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

If MCP tools are already available in the current agent, call `xhs_search_notes` with:

- `keyword`: required search phrase or topic; use the user's actual intent and trim whitespace.
- `page`: optional 1-based page number; use `1` for the first page.
- `sort_type`: optional, one of `general`, `time_descending`, `like_count_descending`, `comment_count_descending`, `collect_count_descending`; omit it for default sorting.
- `note_type`: optional search filter, one of `all`, `image`, `video`; default is `all`.
- `publish_time_range`: optional search filter, one of `all`, `day`, `week`, `half_year`; default is `all`.

Use the same meanings as the CLI XHS sort and filter values above.

For Douyin, call `douyin_search_videos` with:

- `keyword`: required search phrase or topic.
- `page_token`: optional opaque pagination token from the previous page.
- `sort_type`: optional, one of `general`, `time_descending`, `like_count_descending`; omit it for the default sort.
- `publish_time_range`: optional publish-time filter, one of `all`, `day`, `week`, `half_year`; omit it for no publish-time filter.
- `duration_range`: optional duration filter, one of `all`, `under_1_minute`, `one_to_five_minutes`, `over_5_minutes`; omit it for no duration filter.
- `content_type`: optional content type filter, one of `all`, `video`, `image`; omit it for all content types.

Continue XHS pagination only when `next_page` is not `null`, and keep the same `keyword`, `sort_type`, `note_type`, and `publish_time_range` while changing only `page`. Continue Douyin pagination only when `next_page_token` is not empty. Do not stop only because one page has empty `items`.

## Output Guidance

Summarize visible evidence separately from interpretation. Include useful content IDs, URLs, titles or descriptions, authors, counts, publish time, and Douyin `content_type` when the user needs traceability. For Douyin image/text search results, use returned `images` and treat `video.media_type="audio"` as an audio player resource rather than a video post.
