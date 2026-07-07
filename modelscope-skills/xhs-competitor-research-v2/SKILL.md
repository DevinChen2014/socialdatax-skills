---
name: "xhs-competitor-research-v2"
description: "当用户需要做小红书竞品研究、小红书竞品分析、同赛道观察、内容角度对比、内容策略对比或品牌内容调研时使用。面向品牌、MCN、内容运营和创作者。"
source_skill: "skillhub/xhs-competitor-research-v2"
metadata: {"openclaw":{"requires":{"env":["SOCIALDATAX_API_KEY"],"bins":["node","npm"]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"📊","homepage":"https://socialdatax.com/?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书竞品研究 v2

Use this skill when the user wants 小红书竞品研究, competitor analysis, same-niche observation, content-angle comparison, content strategy comparison, or brand content research.

## 快速开始

- 先给出当前 skill 支持的输入：关键词或选题方向。
- 如果你只想先看样本，先取 1 页；要继续扩大，再按参数说明使用分页或 `--max-items`。
- 你通常会得到：相关标题、作者或账号、链接或内容 ID，以及可继续追问的角度。

## 示例结果

- 示例展示格式，不代表固定字段：内容样本=标题/作者/链接或 ID；判断=相关原因和下一步。

## 异常处理

- 网络或 API 异常：保留错误信息，检查 `SOCIALDATAX_API_KEY`、参数和链接格式后原样重试一次。
- 分页中断：保留已取得的结果；重试仍失败：说明当前调用不可用，给出可替代输入方式。

## 常见问题

- 没结果：放宽关键词、减少限定，或换成更贴近用户表达的词。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置，再重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：把最相关的 1-3 条结果发回来，继续缩小范围。

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/?from=modelscope>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pages 3 --pretty
```

Required arguments:

- `--keyword <text>`: content research topic; use the user's actual intent, trim whitespace, and keep it focused.

Optional arguments:

- `--page-token <next_page_token>`: opaque pagination token; omit it on the first search request. Continue only with the complete returned `next_page_token` from the same search pagination chain. Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses.
- `--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`: optional sort value; omit it for default sorting.
- `--note-type <all|image|video>`: optional content format filter; default is `all`.
- `--publish-time-range <all|day|week|half_year>`: optional publish-time filter; default is `all`.
- `--pages <n>`: fetch and merge N search pages from the current starting point.
- `--max-items <n>`: stop after collecting N search results.
- `--since-days <1-365>`: keep only search results whose public `publish_time` is within the last N days; search remains bounded by `--pages`.
- `--pretty`: output formatting only; it does not change the research topic or results.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_search_notes`

For XHS, call `xhs_search_notes` with `keyword`, optional `page_token`, `sort_type`, `note_type`, and `publish_time_range`.

Do not pass `page` to `xhs_search_notes`; omit `page_token` on the first request.
Continue pagination only when `next_page_token` is not empty, and pass the complete returned `next_page_token` back unchanged as `page_token` for the same keyword, sort, note type, publish-time range, and caller chain.

## 输出建议

优先输出可直接复盘的结果：相关样本和主要角度，并标出下一步可继续追问的问题。

Summarize visible evidence separately from interpretation. Focus on topic patterns, content angles, audience reactions, creator positioning, and useful examples when the user needs traceability.
For XHS search results, in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding, preserve it exactly as the full URL, including `xsec_token` query parameters. Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`.
For XHS `note_id`, copy the complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix.
When the user asks for recent topic research, prefer CLI `--since-days 7` or another user-specified day window; do not claim complete platform coverage beyond the fetched pages.
