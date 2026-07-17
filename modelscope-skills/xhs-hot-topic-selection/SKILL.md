---
name: "xhs-hot-topic-selection"
description: "用于小红书热榜选题、小红书热点选题、小红书热榜分析、小红书热点分析和趋势选题参考。先看当前小红书热榜，再结合相关热门笔记样本，把热榜信号整理成可执行选题。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "xhs-hot-topic-selection"
metadata: {"openclaw":{"requires":{"env":["SOCIALDATAX_API_KEY"],"bins":["node","npm"]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"🧭","homepage":"https://socialdatax.com/?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书热榜选题分析

## 适用场景

用于小红书热榜选题、小红书热点选题、小红书热榜分析、小红书热点分析和趋势选题参考。先看当前小红书热榜，再结合相关热门笔记样本，把热榜信号整理成可执行选题。

## 快速开始

- 先给出当前 skill 支持的输入：关键词或选题方向、要观察的平台热榜。
- 推荐流程：先看当前热榜，再选 1-3 个热点词做关键词搜索；如果用户已经给了关键词，可直接搜索相关热门样本。
- 你通常会得到：热榜信号、相关热门笔记样本、选题候选、标题钩子、内容角度和下一步建议。

## API Key 获取

获取或管理 API Key：访问 <https://socialdatax.com/?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## 直接调用命令

优先使用 direct CLI；能运行 shell 命令的 Agent 不需要额外配置 MCP server：

```bash
npx -y socialdatax-skills@latest xhs hot-search \
  --pretty --source-client socialdatax-skills --source-platform modelscope \
  --source-skill xhs-hot-topic-selection

npx -y socialdatax-skills@latest xhs search \
  --keyword "<hot_topic_or_keyword>" --sort-type like_count_descending --pages 2 \
  --max-items 20 --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-hot-topic-selection
```

## 参数说明

热榜：
- 说明：用户要看当前小红书热榜、热搜、热点或热词时，先用 `xhs hot-search`；这个命令不需要 `--keyword`。

搜索：
- 必填：`--keyword <text>`：当用户给出话题词、赛道、产品方向，或选择一个方向要继续看样本时必填；使用用户真实意图，去掉多余空格，并保持关键词聚焦。
- 可选：`--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`：可选排序参数；本 skill 的样本流程默认偏向 `like_count_descending`，除非用户指定其它排序。
- 可选：`--note-type <all|image|video>`：可选笔记类型筛选；默认是 `all`。
- 可选：`--publish-time-range <all|day|week|half_year>`：可选发布时间筛选；默认是 `all`。
- 可选：`--pages <n>`：从当前起点继续获取并合并 N 页搜索结果；如果返回了 `next_page_token`，可继续续页。
- 可选：`--max-items <n>`：收集到 N 条结果后停止。
- 可选：`--since-days <1-365>`：只保留最近 N 天内公开 `publish_time` 落在范围内的结果；范围仍受 `--pages` 限制，不承诺全平台完整覆盖。

通用：
- 可选：`--page-token <next_page_token>`：这是不透明的分页 token；第一页不要传。继续同一条搜索链路时，只能原样传回完整返回的 `next_page_token`，不能截断、改写、脱敏、重建，或用省略号替换中间内容。
- 可选：`--pretty`：只影响输出格式，不改变实际请求结果。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill xhs-hot-topic-selection`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

如果用户要看当前小红书 / XHS / RedNote 热榜，使用 `xhs hot-search`；这个命令不需要 `--keyword`。

## 输出建议

优先输出可直接用于内容排期和选题会的热榜选题分析。

输出时使用固定结构的热榜选题分析，并按以下顺序组织；字段缺失时说明缺失，不补造。

1. 热榜信号：列出当前热榜中和用户目标相关的热点词、排名、热度信号和为什么值得观察。
2. 选题候选池：把热点词转成 3-7 个可执行选题方向，标注适合人群、使用场景和切入理由。
3. 热门笔记样本：对选中的热点词使用搜索结果补样本，保留标题、作者、互动指标、发布时间、完整原始 URL 和完整 `note_id`。
4. 标题钩子和内容角度：拆解样本里的利益点、情绪点、场景词、问题意识和可复用表达。
5. 不建议追的热点：说明哪些热榜词和用户目标弱相关、过泛、风险高或缺少样本支撑。
6. 下一步建议：建议继续搜索哪些关键词、是否扩大页数、是否加最近 N 天筛选，或是否进入爆款笔记研究 / 文案拆解。

如果用户只问热榜，先输出热榜信号和可选方向；如果用户要做选题，继续用关键词搜索补充热门笔记样本。
对于 XHS 搜索结果里的 `note_url`，无论是在最终回答、展示、引用、存储、输出还是转发时，都要保留完整原始 URL，包括其中的 `xsec_token` 查询参数；不要改写、截断、脱敏、重建，也不要只根据 `note_id` 去拼链接。
对于 XHS `note_id`，要完整复制 24 位小写十六进制 ID；不要只传或只展示前缀。
只基于当前热榜和当前返回页范围内的公开结果做判断；不承诺全平台完整覆盖，也不把当前热榜或样本说成唯一结论。
不承诺自动生成完整发布稿、设计封面、账号诊断、执行发布或确定性流量结果。

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

- 示例展示格式：热榜=排名/话题/热度信号；样本=标题/作者/互动指标/完整链接/完整 note_id；选题=候选方向/适合人群/内容角度/标题钩子/不建议追的原因；字段缺失时明确标注，不补造。

## 异常处理

- 网络或 API 异常：保留错误信息，检查 `SOCIALDATAX_API_KEY`、参数和链接格式后原样重试一次。
- 分页中断：保留已取得的结果；重试仍失败：说明当前调用不可用，给出可替代输入方式。

## 常见问题

- 没结果：放宽关键词、减少限定，或换成更贴近用户表达的词。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置，再重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：把最相关的 1-3 条结果发回来，继续缩小范围。
