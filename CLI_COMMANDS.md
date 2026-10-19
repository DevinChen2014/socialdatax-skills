# SocialDataX CLI Command Reference

This reference covers the additional direct CLI commands for discovery, products, creator analytics, WeChat Official Accounts, Baidu Tieba, Haokan, account points, API documentation, and six more transcript platforms. See [README](./README.md) for installation and the existing content, comment, creator, download, and transcript commands.

Set `SOCIALDATAX_API_KEY` in the environment for hosted requests. Obtain or manage your key at <https://socialdatax.com>. Run commands with `npx -y socialdatax-skills@latest`; use `<platform> <action> --help` to inspect the installed version. Angle-bracket values are placeholders: replace them with the user’s keyword, returned ID, URL or token.

## Shared options and input rules

- All commands accept `--pretty`, `--source-client`, `--source-platform`, and `--source-skill`. Installed skills supply attribution automatically; preserve it when adapting their examples.
- A command with multiple input variants accepts exactly one variant, for example `--sku-id` or `--url`, or transcript `--url`, content ID, or `--job-id`. Required flags in the tables apply to that variant.
- Only variants listing `--page-token` support `--pages <n>` and `--max-items <n>`. These variants also accept `--all` except `tieba search` and `haokan search`, which requires bounded `--pages` instead. Omit the token for the first page; pass the full returned `next_page_token` unchanged to continue with the same search/filter inputs. An empty token ends pagination. `--all` follows the available token chain and does not guarantee complete platform-wide results.
- Boolean filters take `true` or `false`. Nullable integer filters accept `null` or an integer. Omitted optional flags use the shown service default.
- Transcript commands also accept positive `--max-wait-seconds <seconds>`. They poll the same job; when interrupted or the wait window ends, continue with `transcript --job-id "<job_id>"`. Do not resubmit an unfinished job.

## Choose a command

| Need | Commands |
| --- | --- |
| Find accounts or channels | `user-search`; YouTube `channel-search` |
| Refine a query | `search-suggestions`; Instagram `tag-search` |
| Product research | XHS / Douyin `product-search`, `product-detail`; XHS review commands |
| Creator commercial analytics | XHS `pgy-creator-*` |
| Official Account articles and accounts | WeChat `article-search`, `mp-account-info`, `mp-account-articles`, `article-comments`, `article-replies` |
| Tieba communities and discussions | `tieba` forum, search, detail, comment and user commands below |
| Haokan videos and creators | `haokan` search, hot-search, detail, comment and user commands below |
| Credits and API documentation | `account balance`; `docs search`, `docs operation`, `docs openapi` |
| Video speech-to-text | `transcript` on Bilibili, Zhihu, Instagram, X, TikTok and YouTube, plus the five platforms in README |

## Platform boundaries

XHS `search-images` returns individual images with associated notes. Search video notes with `xhs search --note-type video`; this search command also supports sort and publish-time filters. `topic-notes` accepts a page ID or topic URL. Product reviews require a full SKU ID; reply commands use review IDs returned by the preceding review/reply list.

For XHS Pugongying creator commands, use the 24-character lowercase hexadecimal creator user ID. `--note-scope daily|cooperation` selects daily or cooperation notes on the commands that expose it. These commands provide commercial analytics; the existing `pgy-detail` command reads commercial note details.

Tieba `search-suggestions` returns forum suggestions, not posts or users, and has no pagination. `user-search` is also first-page only. Use an exact `forum_name` returned by discovery for `forum-detail`, `forum-posts`, or `forum-search`; featured-only forum browsing uses default sorting. `detail` and `comments` accept a thread ID or post URL. Replies require both thread and comment IDs. User commands accept either a user ID or profile URL.

Use `docs search --platform-id baidu-tieba` for Tieba API docs; the direct CLI platform command is `tieba`. Documentation search uses `--offset` and `--limit`, not page tokens. Copy a returned operation ID into `docs operation`. `docs openapi` returns the OpenAPI document.

Bilibili transcripts process one part: a URL with `?p=N` selects that part, while a BV ID selects P1. Zhihu `--zvideo-id` is for independent videos; video answers use their answer URL. Instagram supports regular video posts and Reels, excluding photo/carousel posts. X processes the current post’s first available MP4 video. YouTube accepts a video URL or video ID; TikTok accepts a video URL or aweme_id.

## Commands and parameters

### Xiaohongshu / XHS / RedNote (xhs)

#### `xhs user-search`

```sh
npx -y socialdatax-skills@latest xhs user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `xhs search-suggestions`

```sh
npx -y socialdatax-skills@latest xhs search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |

#### `xhs search-images`

```sh
npx -y socialdatax-skills@latest xhs search-images --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `xhs product-search`

```sh
npx -y socialdatax-skills@latest xhs product-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `xhs product-detail`

Input variant: `--sku-id`.

```sh
npx -y socialdatax-skills@latest xhs product-detail --sku-id "<sku_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--sku-id` | yes | string | — |

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest xhs product-detail --url "<url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

#### `xhs product-reviews`

```sh
npx -y socialdatax-skills@latest xhs product-reviews --sku-id "<sku_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--sku-id` | yes | string | — |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | general,time_descending | default: "general" |
| `--has-image` | no | boolean | default: false |

#### `xhs product-review-replies`

```sh
npx -y socialdatax-skills@latest xhs product-review-replies --review-id "<review_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--review-id` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `xhs product-review-reply-replies`

```sh
npx -y socialdatax-skills@latest xhs product-review-reply-replies --review-id "<review_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--review-id` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `xhs pgy-creator-profile`

```sh
npx -y socialdatax-skills@latest xhs pgy-creator-profile --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[0-9a-f]{24}$ |

#### `xhs pgy-creator-notes-performance`

```sh
npx -y socialdatax-skills@latest xhs pgy-creator-notes-performance --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[0-9a-f]{24}$ |
| `--note-scope` | no | daily,cooperation | default: "daily" |

#### `xhs pgy-creator-fans-profile`

```sh
npx -y socialdatax-skills@latest xhs pgy-creator-fans-profile --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[0-9a-f]{24}$ |

#### `xhs pgy-creator-fans-summary`

```sh
npx -y socialdatax-skills@latest xhs pgy-creator-fans-summary --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[0-9a-f]{24}$ |

#### `xhs pgy-creator-metrics-trend`

```sh
npx -y socialdatax-skills@latest xhs pgy-creator-metrics-trend --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[0-9a-f]{24}$ |
| `--note-scope` | no | daily,cooperation | default: "daily" |

#### `xhs pgy-creator-commercial-overview`

```sh
npx -y socialdatax-skills@latest xhs pgy-creator-commercial-overview --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[0-9a-f]{24}$ |
| `--note-scope` | no | daily,cooperation | default: "daily" |

#### `xhs topic-notes`

Input variant: `--page-id`.

```sh
npx -y socialdatax-skills@latest xhs topic-notes --page-id "<page_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--page-id` | yes | string | — |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | hot,time_descending | default: "hot" |

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest xhs topic-notes --url "<topic_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | hot,time_descending | default: "hot" |

#### `xhs resolve-user-id`

```sh
npx -y socialdatax-skills@latest xhs resolve-user-id --encrypted-user-id "<encrypted_user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--encrypted-user-id` | yes | string | — |

### Douyin (douyin)

#### `douyin user-search`

```sh
npx -y socialdatax-skills@latest douyin user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |
| `--page-token` | no | string | default: "" |
| `--follower-count-range` | no | all,under_1k,1k_to_10k,10k_to_100k,100k_to_1m,over_1m | default: "all" |
| `--user-type` | no | all,regular_user,enterprise_verified,individual_verified | default: "all" |

#### `douyin search-suggestions`

```sh
npx -y socialdatax-skills@latest douyin search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |

#### `douyin product-search`

```sh
npx -y socialdatax-skills@latest douyin product-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | general,sales_descending,price_ascending,price_descending | default: "general" |
| `--min-price` | no | integer,null | 单位：元；default: null（不限）; exclusiveMinimum: 0; min <= max |
| `--max-price` | no | integer,null | 单位：元；default: null（不限）; exclusiveMinimum: 0; min <= max |
| `--only-live` | no | boolean | default: false |
| `--dispatch-within-24h` | no | boolean | default: false |
| `--shipping-insurance` | no | boolean | default: false |
| `--seven-day-return` | no | boolean | default: false |
| `--selling-point` | no | all,high_sales,high_rating | default: "all" |
| `--official-store` | no | boolean | default: false |

#### `douyin product-detail`

Input variant: `--product-id`.

```sh
npx -y socialdatax-skills@latest douyin product-detail --product-id "<product_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--product-id` | yes | string | — |

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest douyin product-detail --url "<url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

#### `douyin user-info`

This entry is selected when `--douyin-id` is supplied.

```sh
npx -y socialdatax-skills@latest douyin user-info --douyin-id "<douyin_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--douyin-id` | yes | string | — |

### TikTok (tiktok)

#### `tiktok user-search`

```sh
npx -y socialdatax-skills@latest tiktok user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1; pattern: .*\S.* |
| `--page-token` | no | string | default: "" |

#### `tiktok search-suggestions`

```sh
npx -y socialdatax-skills@latest tiktok search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1; pattern: .*\S.* |

#### `tiktok transcript`

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest tiktok transcript --url "<video_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

Input variant: `--aweme-id`.

```sh
npx -y socialdatax-skills@latest tiktok transcript --aweme-id "<aweme_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--aweme-id` | yes | string | — |

Input variant: `--job-id`.

```sh
npx -y socialdatax-skills@latest tiktok transcript --job-id "<job_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--job-id` | yes | string | — |

### Weibo (weibo)

#### `weibo user-search`

```sh
npx -y socialdatax-skills@latest weibo user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `weibo search-suggestions`

```sh
npx -y socialdatax-skills@latest weibo search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

#### `weibo user-suggestions`

Get a few search-box user suggestions with profile details and live status. No pagination; use `weibo user-search` for paginated account search. Available in CLI `0.2.50` with the deployed Weibo `0.1.5` service:

```sh
npx -y socialdatax-skills@latest weibo user-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

#### `weibo likers`

This entry is selected when `--url` is supplied.

```sh
npx -y socialdatax-skills@latest weibo likers --url "<post_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `weibo reposts`

This entry is selected when `--url` is supplied.

```sh
npx -y socialdatax-skills@latest weibo reposts --url "<post_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |
| `--page-token` | no | string | default: "" |

### Zhihu / 知乎 (zhihu)

#### `zhihu user-search`

```sh
npx -y socialdatax-skills@latest zhihu user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `zhihu search-suggestions`

```sh
npx -y socialdatax-skills@latest zhihu search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |

#### `zhihu transcript`

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest zhihu transcript --url "<video_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

Input variant: `--zvideo-id`.

```sh
npx -y socialdatax-skills@latest zhihu transcript --zvideo-id "<zvideo_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--zvideo-id` | yes | string | — |

Input variant: `--job-id`.

```sh
npx -y socialdatax-skills@latest zhihu transcript --job-id "<job_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--job-id` | yes | string | — |

### Instagram (instagram)

#### `instagram user-search`

```sh
npx -y socialdatax-skills@latest instagram user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1; maxLength: 256 |
| `--page-token` | no | string | default: "" |

#### `instagram tag-search`

```sh
npx -y socialdatax-skills@latest instagram tag-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1; maxLength: 256 |

#### `instagram transcript`

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest instagram transcript --url "<post_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

Input variant: `--post-id`.

```sh
npx -y socialdatax-skills@latest instagram transcript --post-id "<post_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--post-id` | yes | string | — |

Input variant: `--job-id`.

```sh
npx -y socialdatax-skills@latest instagram transcript --job-id "<job_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--job-id` | yes | string | — |

### X / Twitter (x)

#### `x user-replies`

Read replies authored by a creator, including self-replies. To read comments under a specific post, use `x comments` or `x replies` instead.

Choose exactly one identity:

```sh
npx -y socialdatax-skills@latest x user-replies --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest x user-replies --username "<username>" --pretty
npx -y socialdatax-skills@latest x user-replies --profile-url "<profile_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | one identity | string | mutually exclusive with username/profile URL |
| `--username` | one identity | string | mutually exclusive with user ID/profile URL |
| `--profile-url` | one identity | string | mutually exclusive with user ID/username |
| `--page-token` | no | string | use only the token returned by this user-replies chain |

Supports `--pages`, `--all`, and `--max-items`. Keep the user and identity option unchanged when continuing. An empty page with a nonempty `next_page_token` can be continued; do not reuse a `user-posts` token.

#### `x user-search`

```sh
npx -y socialdatax-skills@latest x user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `x search-suggestions`

```sh
npx -y socialdatax-skills@latest x search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

#### `x transcript`

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest x transcript --url "<post_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

Input variant: `--post-id`.

```sh
npx -y socialdatax-skills@latest x transcript --post-id "<post_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--post-id` | yes | string | — |

Input variant: `--job-id`.

```sh
npx -y socialdatax-skills@latest x transcript --job-id "<job_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--job-id` | yes | string | — |

### Bilibili / 哔哩哔哩 / B站 (bilibili)

#### `bilibili user-search`

```sh
npx -y socialdatax-skills@latest bilibili user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `bilibili search-suggestions`

```sh
npx -y socialdatax-skills@latest bilibili search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |

#### `bilibili transcript`

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest bilibili transcript --url "<video_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

Input variant: `--bvid`.

```sh
npx -y socialdatax-skills@latest bilibili transcript --bvid "<bvid>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--bvid` | yes | string | — |

Input variant: `--job-id`.

```sh
npx -y socialdatax-skills@latest bilibili transcript --job-id "<job_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--job-id` | yes | string | — |

### Toutiao (toutiao)

#### `toutiao user-search`

```sh
npx -y socialdatax-skills@latest toutiao user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `toutiao search-suggestions`

```sh
npx -y socialdatax-skills@latest toutiao search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

### Kuaishou / Kwai (kuaishou)

#### `kuaishou search-suggestions`

```sh
npx -y socialdatax-skills@latest kuaishou search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | — |

### YouTube (youtube)

#### `youtube search-suggestions`

```sh
npx -y socialdatax-skills@latest youtube search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

#### `youtube channel-search`

```sh
npx -y socialdatax-skills@latest youtube channel-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `youtube transcript`

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest youtube transcript --url "<video_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |

Input variant: `--video-id`.

```sh
npx -y socialdatax-skills@latest youtube transcript --video-id "<video_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--video-id` | yes | string | — |

Input variant: `--job-id`.

```sh
npx -y socialdatax-skills@latest youtube transcript --job-id "<job_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--job-id` | yes | string | — |

### WeChat Channels (wechat)

#### `wechat user-search`

```sh
npx -y socialdatax-skills@latest wechat user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `wechat article-search`

```sh
npx -y socialdatax-skills@latest wechat article-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1; maxLength: 100 |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | general,time_descending,hot | default: "general" |
| `--publish-time-range` | no | all,day,week,half_year | default: "all" |

#### `wechat mp-account-info`

```sh
npx -y socialdatax-skills@latest wechat mp-account-info --account-id "<account_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--account-id` | yes | string | — |

#### `wechat mp-account-articles`

```sh
npx -y socialdatax-skills@latest wechat mp-account-articles --account-id "<account_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--account-id` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `wechat article-comments`

```sh
npx -y socialdatax-skills@latest wechat article-comments --url "<url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |
| `--page-token` | no | string | default: "" |

#### `wechat article-replies`

```sh
npx -y socialdatax-skills@latest wechat article-replies --url "<url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | — |
| `--comment-id` | no | string | default: "" |
| `--page-token` | no | string | default: "" |

#### `wechat share-link`

```sh
npx -y socialdatax-skills@latest wechat share-link --object-id "<object_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--object-id` | yes | string | — |

### Baidu Tieba (tieba)

#### `tieba forum-posts`

```sh
npx -y socialdatax-skills@latest tieba forum-posts --forum-name "<forum_name>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--forum-name` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | default,newest,latest_reply,hot | default: "default" |
| `--featured-only` | no | boolean | default: false |

#### `tieba forum-detail`

```sh
npx -y socialdatax-skills@latest tieba forum-detail --forum-name "<forum_name>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--forum-name` | yes | string | minLength: 1 |

#### `tieba search-suggestions`

```sh
npx -y socialdatax-skills@latest tieba search-suggestions --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

#### `tieba user-search`

```sh
npx -y socialdatax-skills@latest tieba user-search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |

#### `tieba search-general`

```sh
npx -y socialdatax-skills@latest tieba search-general --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `tieba search`

Use `--pages <n>` for bounded pagination; `--all` is not supported.

```sh
npx -y socialdatax-skills@latest tieba search --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--keyword` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | newest,oldest,relevance | default: "newest" |

#### `tieba forum-search`

```sh
npx -y socialdatax-skills@latest tieba forum-search --forum-name "<forum_name>" --keyword "<keyword>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--forum-name` | yes | string | minLength: 1 |
| `--keyword` | yes | string | minLength: 1 |
| `--sort-type` | no | newest,relevance,relevant | default: "newest" |
| `--page-token` | no | string | default: "" |

#### `tieba replies`

```sh
npx -y socialdatax-skills@latest tieba replies --thread-id "<thread_id>" --comment-id "<comment_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--thread-id` | yes | string | pattern: ^[1-9][0-9]*$ |
| `--comment-id` | yes | string | pattern: ^[1-9][0-9]*$ |
| `--page-token` | no | string | default: "" |

#### `tieba detail`

Input variant: `--thread-id`.

```sh
npx -y socialdatax-skills@latest tieba detail --thread-id "<thread_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--thread-id` | yes | string | pattern: ^[0-9]+$ |

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest tieba detail --url "<url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | pattern: https?:// |

#### `tieba comments`

Input variant: `--thread-id`.

```sh
npx -y socialdatax-skills@latest tieba comments --thread-id "<thread_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--thread-id` | yes | string | pattern: ^[0-9]+$ |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | newest,oldest,hot | default: "hot" |

Input variant: `--url`.

```sh
npx -y socialdatax-skills@latest tieba comments --url "<url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--url` | yes | string | pattern: https?:// |
| `--page-token` | no | string | default: "" |
| `--sort-type` | no | newest,oldest,hot | default: "hot" |

#### `tieba user-info`

Input variant: `--user-id`.

```sh
npx -y socialdatax-skills@latest tieba user-info --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[1-9][0-9]{0,18}$ |

Input variant: `--profile-url`.

```sh
npx -y socialdatax-skills@latest tieba user-info --profile-url "<profile_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--profile-url` | yes | string | minLength: 1 |

#### `tieba user-posts`

Input variant: `--user-id`.

```sh
npx -y socialdatax-skills@latest tieba user-posts --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[1-9][0-9]{0,18}$ |
| `--page-token` | no | string | default: "" |

Input variant: `--profile-url`.

```sh
npx -y socialdatax-skills@latest tieba user-posts --profile-url "<profile_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--profile-url` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

#### `tieba user-forums`

Input variant: `--user-id`.

```sh
npx -y socialdatax-skills@latest tieba user-forums --user-id "<user_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--user-id` | yes | string | pattern: ^[1-9][0-9]{0,18}$ |
| `--page-token` | no | string | default: "" |

Input variant: `--profile-url`.

```sh
npx -y socialdatax-skills@latest tieba user-forums --profile-url "<profile_url>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--profile-url` | yes | string | minLength: 1 |
| `--page-token` | no | string | default: "" |

### Haokan / 好看视频 (haokan)

Video inputs accept exactly one of `--video-id` (digits) or `--url` (video page URL). User inputs accept exactly one of `--user-id` (letters, digits, `_`, or `-`) or `--profile-url`. Pass IDs as strings.

| Command | Required input | Optional pagination | MCP tool(s) |
| --- | --- | --- | --- |
| `haokan search` | `--keyword` | `--page-token`, `--pages`, `--max-items` | `haokan_search_videos` |
| `haokan user-search` | `--keyword` | `--page-token`, `--pages`, `--all`, `--max-items` | `haokan_search_users` |
| `haokan search-suggestions` | `--keyword` | none | `haokan_search_suggestions` |
| `haokan hot-search` | none | none | `haokan_get_hot_search_list` |
| `haokan detail` | video input | none | `haokan_get_video_detail_by_video_id`, `haokan_get_video_detail_by_url` |
| `haokan comments` | video input | `--page-token`, `--pages`, `--all`, `--max-items` | `haokan_get_video_comments_by_video_id`, `haokan_get_video_comments_by_url` |
| `haokan replies` | video input and `--comment-id` | `--page-token`, `--pages`, `--all`, `--max-items` | `haokan_get_comment_replies_by_video_id`, `haokan_get_comment_replies_by_url` |
| `haokan user-info` | user input | none | `haokan_get_user_info_by_user_id`, `haokan_get_user_info_by_url` |
| `haokan user-posts` | user input | `--page-token`, `--pages`, `--all`, `--max-items` | `haokan_get_user_posted_videos_by_user_id`, `haokan_get_user_posted_videos_by_profile_url` |

`hot-search` returns search terms and their popularity, not a video ranking. `search-suggestions` returns suggested queries. Neither supports pagination. `search` requires bounded `--pages` rather than `--all`.

`comments` returns top-level comments; attached replies are previews. To page through replies, use `replies` with the positive numeric `comment_id` returned by `comments`. `--include-replies` is not supported. Keep page tokens unchanged and use them only with the same command and input; an empty page can still carry a continuation token. `user-info --profile-url` maps to the MCP tool's `url` argument.

```bash
npx -y socialdatax-skills@latest haokan search --keyword "露营" --pages 2 --pretty
npx -y socialdatax-skills@latest haokan user-search --keyword "摄影" --pretty
npx -y socialdatax-skills@latest haokan search-suggestions --keyword "旅行" --pretty
npx -y socialdatax-skills@latest haokan hot-search --pretty
npx -y socialdatax-skills@latest haokan detail --url "<video_url>" --pretty
npx -y socialdatax-skills@latest haokan comments --video-id "<video_id>" --pages 2 --pretty
npx -y socialdatax-skills@latest haokan replies --video-id "<video_id>" --comment-id "<comment_id>" --all --pretty
npx -y socialdatax-skills@latest haokan user-info --profile-url "<profile_url>" --pretty
npx -y socialdatax-skills@latest haokan user-posts --user-id "<user_id>" --page-token "<next_page_token>" --pretty
```

### SocialDataX Account (account)

#### `account balance`

```sh
npx -y socialdatax-skills@latest account balance --pretty
```

No command-specific parameters.

### SocialDataX API Docs (docs)

#### `docs search`

```sh
npx -y socialdatax-skills@latest docs search --query "<query>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--query` | no | string | default: "" |
| `--platform-id` | no | ,account,xhs,douyin,tiktok,kuaishou,bilibili,baidu-tieba,weibo,wechat,zhihu,instagram,x,youtube,toutiao,haokan,media_transcript | default: "" |
| `--surface` | no | ,http | default: "" |
| `--limit` | no | integer | default: 20; minimum: 1; maximum: 50 |
| `--offset` | no | integer | default: 0; minimum: 0 |

#### `docs operation`

```sh
npx -y socialdatax-skills@latest docs operation --operation-id "<operation_id>" --pretty
```

| Flag | Required | Type / accepted values | Default / constraints |
| --- | --- | --- | --- |
| `--operation-id` | yes | string | — |

#### `docs openapi`

```sh
npx -y socialdatax-skills@latest docs openapi --pretty
```

No command-specific parameters.
