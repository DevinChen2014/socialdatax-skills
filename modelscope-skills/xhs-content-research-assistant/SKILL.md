---
name: "xhs-content-research-assistant"
description: "面向内容运营、品牌调研和创作者的小红书内容研究助手。适用于内容研究、选题策划、竞品观察、趋势判断、评论洞察和创作者资料整理，来自 SocialDataX 社媒数据助手。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "xhs-content-research-assistant"
metadata: {"openclaw":{"requires":{"env":["SOCIALDATAX_API_KEY"],"bins":["node","npm"]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"🔥","homepage":"https://socialdatax.com/?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书内容研究助手

Use this skill when the user wants content research, topic planning, competitor observation, trend review, comment insight, creator profile review, or research material organization for RedNote / XHS / Xiaohongshu（小红书）.

## 快速开始

- 先给出当前 skill 支持的输入：关键词或选题方向、要观察的平台热榜、内容链接或内容 ID、一级评论 ID、账号主页、账号分享文本或平台账号 ID。
- 如果你只想先看样本，先取 1 页；要继续扩大，再按参数说明使用分页或 `--max-items`。
- 你通常会得到：榜单排名和热度信号、相关标题、作者或账号、链接或内容 ID、单条内容正文、作者、发布时间和互动指标、评论文本、回复线索和用户反馈主题、账号资料、认证、粉丝或互动信号、近期内容列表、发布时间和互动信号，以及可继续追问的角度。

## 示例结果

- 示例展示格式，不代表固定字段：热榜=排名/话题/热度信号、内容样本=标题/作者/链接或 ID、详情=正文/作者/发布时间/互动指标、评论=内容/用户/时间/回复线索、账号=昵称/ID/简介/粉丝信号、账号内容=标题/发布时间/互动信号；判断=相关原因和下一步。

## 异常处理

- 网络或 API 异常：保留错误信息，检查 `SOCIALDATAX_API_KEY`、参数和链接格式后原样重试一次。
- 分页中断：保留已取得的结果；重试仍失败：说明当前调用不可用，给出可替代输入方式。

## 常见问题

- 没结果：放宽关键词、减少限定，或换成更贴近用户表达的词。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置，再重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：把最相关的 1-3 条结果发回来，继续缩小范围。

Current platform support:

- Xiaohongshu / XHS / RedNote search hot list through `xhs_get_search_hot_list`.
- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_detail_by_*` tools.
- Xiaohongshu / XHS / RedNote notes through the `xhs_get_note_comments_by_*` and `xhs_get_note_sub_comments_by_comment_id` tools.
- Xiaohongshu / XHS / RedNote creators through the `xhs_get_user_info_by_*` tools.
- Xiaohongshu / XHS / RedNote creator notes through the `xhs_get_user_posted_notes_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/?from=modelscope>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs hot-search --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
```

Additional direct CLI entrypoints:

```bash
npx -y socialdatax-skills@latest xhs detail --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs comments --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs user-info --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs user-posts --profile-url "<profile_url_or_share_text>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty --source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant
```

Required arguments:

- XHS `hot-search`: no required arguments.
- `--keyword <text>`: content research topic; use the user's actual intent, trim whitespace, and keep it focused.

Optional arguments:

- `--pretty`: output formatting only.
- `--page-token <next_page_token>`: opaque pagination token; omit it on the first search request. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`: optional sort value; omit it for default sorting.
- `--note-type <all|image|video>`: optional content format filter; default is `all`.
- `--publish-time-range <all|day|week|half_year>`: optional publish-time filter; default is `all`.
- `--pages <n>`: fetch and merge N search pages from the current starting point.
- `--max-items <n>`: stop after collecting N search results.
- `--since-days <1-365>`: keep only search results whose public `publish_time` is within the last N days; search remains bounded by `--pages`.
- `--pretty`: output formatting only; it does not change the research topic or results.
- XHS `--note-id <note_id>`: use the complete 24-character lowercase hexadecimal `note_id` returned from search, comments, creator note lists, or a previous detail result; do not pass only a prefix.
- XHS `--url <note_url_or_share_text>`: use for a note link, short link, or share text.
- XHS `--note-id <note_id>`: use the complete 24-character lowercase hexadecimal `note_id` returned from search, detail, comments, or creator note lists; do not pass only a prefix.
- `--url <url_or_share_text>`: use for a content page URL, short link, or share text for first-level comments.
- `--comment-id <comment_id>`: required for reply commands; use the first-level comment ID under the same content item.
- `--page-token <next_page_token>`: opaque pagination token; pass the complete returned `next_page_token` back unchanged for the same content item or comment chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages of first-level comments or replies.
- `--all`: continue first-level comments or replies until `next_page_token` is empty; there is no default item or page cap.
- `--max-items <n>`: stop after collecting N primary comments or replies.
- `--include-replies`: for first-level `comments` commands only, also fetch all second-level replies under each returned first-level comment.
- XHS `--user-id <user_id>`: preferred when the creator ID is already known from another result.
- XHS `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- XHS `--user-id <user_id>`: preferred when the creator ID is already known.
- `--page-token <next_page_token>`: opaque pagination token; pass the complete returned `next_page_token` back unchanged for the same creator content-list or series chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--pages <n>`: fetch and merge N pages of creator content or creator series.
- `--all`: continue until `next_page_token` is empty; there is no default item or page cap.
- `--max-items <n>`: stop after collecting N creator content or series items.
- `--since-days <1-365>`: keep only creator content whose public `publish_time` is within the last N days. When `--pages` is omitted, the CLI continues creator content lists until the publish-time boundary is reached.
- `--source-client socialdatax-skills --source-platform modelscope --source-skill xhs-content-research-assistant`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use `xhs hot-search` for the current Xiaohongshu / XHS / RedNote search hot list. Do not ask the user for `--keyword` for this command.
Use either the ID option or the URL option for detail commands, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.
Use either the content ID option or the URL option for first-level comments, not both. For reply commands, use the content ID together with `--comment-id`.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged primary comments in `data.items` and adds `page_count`, `item_count`, and the next-page marker. With `--include-replies`, each first-level comment includes `replies`, `replies_page_count`, and `replies_next_page_token`.
Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.
Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`. Multi-page output keeps merged creator content or series items in `data.items` and adds `page_count`, `item_count`, and `next_page_token`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_get_search_hot_list`
- `xhs_search_notes`
- `xhs_get_note_detail_by_note_id`
- `xhs_get_note_comments_by_note_id`
- `xhs_get_user_info_by_user_id`
- `xhs_get_user_posted_notes_by_user_id`
- `xhs_get_note_detail_by_note_url`
- `xhs_get_note_comments_by_note_url`
- `xhs_get_user_info_by_profile_url`
- `xhs_get_user_posted_notes_by_profile_url`
- `xhs_get_note_sub_comments_by_comment_id`

If MCP tools are already available in the current agent, call `xhs_get_search_hot_list` without keyword arguments.
For XHS, call `xhs_search_notes` with `keyword`, optional `page_token`, `sort_type`, `note_type`, and `publish_time_range`.

Do not pass `page` to `xhs_search_notes`; omit `page_token` on the first request.
Continue pagination only when `next_page_token` is not empty, and pass the complete returned `next_page_token` back unchanged as `page_token` for the same keyword, sort, note type, publish-time range, and caller chain.
If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_note_detail_by_note_id`: use when the complete 24-character lowercase hexadecimal `note_id` is already known; do not pass only a prefix.
- `xhs_get_note_detail_by_note_url`: use for note URLs, short links, or share text.
If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_note_comments_by_note_id`: use when the complete 24-character lowercase hexadecimal `note_id` is known; do not pass only a prefix.
- `xhs_get_note_comments_by_note_url`: use for note URLs, short links, or share text.
- `xhs_get_note_sub_comments_by_comment_id`: use when the complete 24-character lowercase hexadecimal `note_id` and first-level comment ID are known; do not pass only a note ID prefix.

Comment pagination uses opaque `page_token` values. Pass the complete returned `next_page_token` back unchanged for the same content item or comment chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Prefer CLI `--pages`, `--all`, and `--include-replies` when the user asks for multiple pages or a full first-level plus second-level comment tree.
XHS reply pagination also uses `page_token` and is bound to the current comment.
If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_user_info_by_user_id`: preferred when `user_id` is already known from search, detail, comments, or creator note lists.
- `xhs_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
If MCP tools are already available in the current agent, use one of these tools:
- `xhs_get_user_posted_notes_by_user_id`: preferred when `user_id` is already known.
- `xhs_get_user_posted_notes_by_profile_url`: use for profile URLs, short links, or profile share text.

Creator content-list and series pagination use opaque `page_token` values. Pass the complete returned `next_page_token` back unchanged for the same user and command family. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses. Prefer CLI `--pages`, `--all`, and `--max-items` when the user asks for multiple pages or all available creator content.
`--since-days` uses CLI-side filtering only and is not an MCP tool argument; for MCP-only calls, continue pages as needed and filter returned `publish_time` values in your analysis.

## 输出建议

优先输出可直接复盘的结果：榜单信号、相关样本和主要角度、单条内容事实、评论主题和反馈线索、创作者资料、创作者内容证据，并标出下一步可继续追问的问题。

Summarize hot-search items as observed ranking signals. Keep the current hot-search list separate from keyword search results when both are used.
Summarize visible evidence separately from interpretation. Focus on topic patterns, content angles, audience reactions, creator positioning, and useful examples when the user needs traceability.
For XHS search results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
When the user asks for recent topic research, prefer CLI `--since-days 7` or another user-specified day window; do not claim complete platform coverage beyond the fetched pages.
Return factual fields such as title or description, content, author, publish time, interaction counts, images, and media summary when available.
For XHS detail results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`; if `note_url` is null, show the `note_id` or say that no directly openable full link is available.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
Detail access is read-only and does not provide account actions.
Group comments by observed themes before inferring sentiment or demand. Mention whether the result is one page or multiple pages. Empty comments can be a valid successful result.
Report profile fields such as name, platform IDs, bio, verification, follower count, following count, received like count, IP location, and gender when available. Separate profile facts from strategic interpretation.
Summarize content-list evidence by title or description, summary, publish time, interaction counts, media links, and content type when present.
For XHS creator note-list results, copy each returned `note_id` as the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
Use returned content IDs to chain into detail or comment analysis when needed.
