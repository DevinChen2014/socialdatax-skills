---
name: "xhs-trend-insights-v2"
description: "当用户需要做小红书趋势洞察、小红书趋势分析、热点观察、内容方向判断、趋势线索归纳或营销灵感整理时使用。面向内容运营、品牌调研和创作者。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "xhs-trend-insights-v2"
metadata: {"openclaw":{"requires":{"env":["SOCIALDATAX_API_KEY"],"bins":["node","npm"]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"📈","homepage":"https://socialdatax.com/?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书趋势洞察

## 适用场景

当用户需要做小红书趋势洞察、小红书趋势分析、热点观察、内容方向判断、趋势线索归纳或营销灵感整理时使用。面向内容运营、品牌调研和创作者。

## 快速开始

- 先给出当前 skill 支持的输入：关键词或选题方向、要观察的平台热榜。
- 如果你只想先看样本，先取 1 页；要继续扩大，再按参数说明使用分页或 `--max-items`。
- 你通常会得到：榜单排名和热度信号、相关标题、作者或账号、链接或内容 ID，以及可继续追问的角度。

## API Key 获取

获取或管理 API Key：访问 <https://socialdatax.com/?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## 直接调用命令

优先使用 direct CLI；能运行 shell 命令的 Agent 不需要额外配置 MCP server：

```bash
npx -y socialdatax-skills@latest xhs hot-search \
  --pretty --source-client socialdatax-skills --source-platform modelscope \
  --source-skill xhs-trend-insights-v2

npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-trend-insights-v2
```

## 参数说明

热榜：
- 说明：XHS `hot-search`：无必填参数。

搜索：
- 必填：`--keyword <text>`：内容研究主题；使用用户真实意图，去掉多余空格，并保持关键词聚焦。
- 可选：`--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`：可选排序参数；不传就使用默认排序。
- 可选：`--note-type <all|image|video>`：可选内容类型筛选；默认是 `all`。
- 可选：`--publish-time-range <all|day|week|half_year>`：可选发布时间筛选；默认是 `all`。
- 可选：`--pages <n>`：从当前起点继续获取并合并 N 页搜索结果；如果返回了 `next_page_token`，可继续续页。
- 可选：`--max-items <n>`：收集到 N 条搜索结果后停止。
- 可选：`--since-days <1-365>`：只保留最近 N 天内公开 `publish_time` 落在范围内的搜索结果；搜索范围仍受 `--pages` 限制。

通用：
- 可选：`--pretty`：只影响输出格式，不改变实际请求结果。
- 可选：`--page-token <next_page_token>`：这是不透明的分页 token；第一页不要传。继续同一条搜索链路时，只能原样传回完整返回的 `next_page_token`，不能截断、改写、脱敏、重建，或用省略号替换中间内容。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill xhs-trend-insights-v2`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

如果用户要看当前小红书 / XHS / RedNote 热榜，使用 `xhs hot-search`；这个命令不需要 `--keyword`。

## 输出建议

优先输出可直接复盘的结果：榜单信号、相关样本和主要角度，并标出下一步可继续追问的问题。

输出热榜时，先把它当作当前排名和热度信号来整理；如果同时用了关键词搜索，要把热榜和搜索结果分开写。
先把可见证据和你的判断分开写；当用户需要可追溯结论时，重点整理话题模式、内容角度、受众反馈、创作者定位和可引用样本。
对于 XHS 搜索结果里的 `note_url`，无论是在最终回答、展示、引用、存储、输出还是转发时，都要保留完整原始 URL，包括其中的 `xsec_token` 查询参数；不要改写、截断、脱敏、重建，也不要只根据 `note_id` 去拼链接。
对于 XHS `note_id`，要完整复制 24 位小写十六进制 ID；不要只传或只展示前缀。
当用户要看最近话题时，优先使用 CLI 的 `--since-days 7`，或者按用户指定的天数窗口执行；不要把当前返回页范围说成全平台完整覆盖。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `xhs_get_search_hot_list`
- `xhs_search_notes`

如果当前 Agent 已可直接调用 MCP 工具，调用 `xhs_get_search_hot_list` 时不要传关键词参数。
在 XHS 搜索场景中，调用 `xhs_search_notes` 时传 `keyword`，可选传 `page_token`、`sort_type`、`note_type` 和 `publish_time_range`。

调用 `xhs_search_notes` 时不要传 `page`；第一页也不要传 `page_token`。
只有在 `next_page_token` 非空时才继续翻页；并且在同一个关键词、排序、内容类型、发布时间范围和调用链路下，把完整返回的 `next_page_token` 原样作为 `page_token` 传回。

## 安全边界

这是只读 skill。运行时使用用户环境变量中的 `SOCIALDATAX_API_KEY`；生成的 Skill 文件不包含 API Key。不会读取本地浏览器数据，也不会执行登录、发帖、点赞、评论或账号修改。

## 示例结果

- 示例展示格式，不代表固定字段：热榜=排名/话题/热度信号、内容样本=标题/作者/链接或 ID；判断=相关原因和下一步。

## 异常处理

- 网络或 API 异常：保留错误信息，检查 `SOCIALDATAX_API_KEY`、参数和链接格式后原样重试一次。
- 分页中断：保留已取得的结果；重试仍失败：说明当前调用不可用，给出可替代输入方式。

## 常见问题

- 没结果：放宽关键词、减少限定，或换成更贴近用户表达的词。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置，再重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：把最相关的 1-3 条结果发回来，继续缩小范围。
