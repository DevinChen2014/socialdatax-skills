---
name: "xhs-content-research-assistant"
description: "面向内容运营、品牌调研和创作者的小红书内容研究助手。适用于内容研究、选题策划、竞品观察、趋势判断、评论洞察和创作者资料整理，来自 SocialDataX 社媒数据助手。"
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
npx -y socialdatax-skills@latest xhs hot-search --pretty
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty
```

Additional direct CLI entrypoints:

```bash
npx -y socialdatax-skills@latest xhs detail --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs comments --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty
```

Required arguments:

- Use `xhs hot-search` without keyword when the user asks for current Xiaohongshu / XHS / RedNote hot topics or 小红书搜索热榜.
- Use `xhs search --keyword <text>` for keyword research.
- For detail, comments, replies, creator profile, and creator note-list commands, use the ID argument shown in the CLI example or the matching URL/profile-url entrypoint, not both.

Optional arguments:

- For XHS search continuation, use `--page-token <next_page_token>` when a returned `next_page_token` is available. For XHS comments, replies, and creator note lists, use `--page-token <next_page_token>` only with the complete returned token from the same note, comment, or creator chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--sort-type`, `--note-type`, and `--publish-time-range`: apply only to keyword research commands when the user asks for filtering.
- `--comment-id`: required for sub-comment commands together with the note ID.
- `--pretty`: output formatting only.

Use the most specific XHS direct CLI command for the user's task. The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

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

Use the automatically listed MCP tools above as the source of truth for tool names. Pick the narrowest XHS tool for the user's task.
For `xhs_search_notes`, use `page_token` when continuing with a complete returned `next_page_token`. Use `page_token` for XHS comments, replies, and creator note lists when continuing with a complete returned `next_page_token`.

## 输出建议

优先输出可直接复盘的结果：榜单信号、相关样本和主要角度、单条内容事实、评论主题和反馈线索、创作者资料、创作者内容证据，并标出下一步可继续追问的问题。

For content research, summarize visible evidence separately from interpretation and organize findings by topic pattern, content angle, audience reaction, creator positioning, and useful examples.
For XHS search or detail results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`; if detail `note_url` is null, show the `note_id` or say that no directly openable full link is available.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
For comments, group observed themes before inferring sentiment or demand.
For creators, separate profile facts from creator note-list evidence.
