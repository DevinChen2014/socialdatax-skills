---
name: "xhs-comment-insights"
description: "当用户需要做小红书评论分析、小红书评论洞察、小红书用户反馈分析、小红书需求挖掘、痛点总结、购买顾虑整理、FAQ 提炼、口碑分析、评论回复观察或内容讨论复盘时使用。基于用户提供的小红书笔记链接或 note_id 下的评论结果，面向内容运营、产品调研、品牌调研和创作者。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "xhs-comment-insights"
metadata: {"openclaw":{"requires":{"env":["SOCIALDATAX_API_KEY"],"bins":["node","npm"]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"💬","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书评论分析与需求挖掘

## 适用场景

当用户需要做小红书评论分析、小红书评论洞察、小红书用户反馈分析、小红书需求挖掘、痛点总结、购买顾虑整理、FAQ 提炼、口碑分析、评论回复观察或内容讨论复盘时使用。基于用户提供的小红书笔记链接或 note_id 下的评论结果，面向内容运营、产品调研、品牌调研和创作者。

## 快速开始

- 先给出当前 skill 支持的输入：内容链接、内容 ID 或一级评论 ID。
- 如果结果有分页，先取第一页；要继续扩大，再按返回的下一页标记继续。
- 你通常会得到：评论文本、回复线索和用户反馈主题。

## API Key 获取

获取或管理 API Key：访问 <https://socialdatax.com/ai?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名；do not infer alternate domains。

## 直接调用命令

优先使用 direct CLI；能运行 shell 命令的 Agent 不需要额外配置 MCP server：

```bash
npx -y socialdatax-skills@latest xhs comments \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-comment-insights

npx -y socialdatax-skills@latest xhs comments \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-comment-insights

npx -y socialdatax-skills@latest xhs sub-comments \
  --note-id "<note_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill xhs-comment-insights
```

## 参数说明

详情 / 评论：
- 说明：XHS `--note-id <note_id>`：使用搜索、详情、评论或创作者笔记列表返回的完整 24 位小写十六进制 `note_id`；不要只传前缀。
- 说明：XHS 评论 `--sort-type <default|time_descending|like_count_descending>`：可选一级评论排序；不传就使用平台默认排序。
- 可选：`--url <url_or_share_text>`：用于一级评论入口的内容页 URL、短链或分享文本。
- 条件必填：`--comment-id <comment_id>`：回复命令必填；使用同一内容下的一级评论 ID。
- 可选：`--page-token <next_page_token>`：这是不透明的分页 token；在同一条内容或评论链路下，必须把完整返回的 `next_page_token` 原样传回，不能截断、改写、脱敏、重建，或用省略号替换中间内容。
- 可选：`--pages <n>`：获取并合并 N 页一级评论或回复。
- 可选：`--all`：持续获取一级评论或回复，直到 `next_page_token` 为空；默认没有条数或页数上限。
- 可选：`--max-items <n>`：收集到 N 条一级评论或回复后停止。
- 可选：`--include-replies`：仅用于一级 `comments` 命令；同时获取每条一级评论下的二级回复。

通用：
- 可选：`--pretty`：只影响输出格式，不改变实际请求结果。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill xhs-comment-insights`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

一级评论命令使用内容 ID 或 URL 其中一种入口即可，不要同时传；回复命令需要内容 ID 和 `--comment-id` 一起使用。

命令返回 JSON，包含 `platform`、`tool`、`arguments` 和 `data`。多页结果会把一级评论合并到 `data.items`，并补充 `page_count`、`item_count` 和下一页标记；如果使用 `--include-replies`，每条一级评论还会带上 `replies`、`replies_page_count` 和 `replies_next_page_token`。

## 输出建议

优先输出可直接用于复盘和决策的结果：评论主题、用户反馈、痛点、需求和可行动建议。

默认按这个结构输出：评论主题、用户痛点、购买顾虑、未满足需求、FAQ、高频原话、可行动建议。
先说明输入范围：结论基于用户提供的小红书笔记链接或完整 `note_id` 下已返回的评论和回复，不代表全平台完整覆盖。
把评论原文证据和你的判断分开写；引用高频原话时只使用返回中可见的评论文本，不编造不存在的反馈。
如果使用了多页结果或 `--include-replies`，说明评论和回复的覆盖范围；如果只取第一页，也要明确这是局部样本。
面向内容运营、产品调研或品牌调研时，把评论反馈转成可执行的问题清单、选题角度、产品改进线索或客服 FAQ。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `xhs_get_note_comments_by_note_id`
- `xhs_get_note_comments_by_note_url`
- `xhs_get_note_sub_comments_by_comment_id`

如果当前 Agent 已可直接调用 MCP 工具，可按入口选择以下工具：
- `xhs_get_note_comments_by_note_id`：当你已经拿到完整的 24 位小写十六进制 `note_id` 时使用；不要只传前缀；可选 `sort_type` 支持 `default`、`time_descending` 或 `like_count_descending`。
- `xhs_get_note_comments_by_note_url`：用于笔记链接、短链或分享文本；可选 `sort_type` 支持 `default`、`time_descending` 或 `like_count_descending`。
- `xhs_get_note_sub_comments_by_comment_id`：当你已经拿到完整的 24 位小写十六进制 `note_id` 和一级评论 ID 时使用；不要只传笔记 ID 前缀。

评论翻页使用不透明的 `page_token`。同一条内容或评论链路下，必须把完整返回的 `next_page_token` 原样传回，不能改写、截断、脱敏、重建，或用省略号替换中间部分。用户需要多页评论或完整的一二级评论树时，优先使用 CLI 的 `--pages`、`--all` 和 `--include-replies`。
XHS 回复翻页同样使用 `page_token`，并且只适用于当前这条评论链路。

## 安全边界

这是只读 skill。运行时使用用户环境变量中的 `SOCIALDATAX_API_KEY`；生成的 Skill 文件不包含 API Key。不会读取本地浏览器数据，也不会执行登录、发帖、点赞、评论或账号修改。

## 示例结果

- 示例展示格式，不代表固定字段：评论=内容/用户/时间/回复线索；判断=主题/痛点/需求/建议。

## 异常处理

- 非余额不足的网络或 API 异常：保留错误信息，检查 `SOCIALDATAX_API_KEY`、参数和链接格式后原样重试一次。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；把错误里的充值链接原样展示给用户，并提醒用户充值后继续执行刚才同一条命令。
- 如果用户已经充值但仍提示余额不足：确认当前环境变量 `SOCIALDATAX_API_KEY` 是否来自刚充值的同一个账号；必要时重新复制官网后台的 API Key。
- 分页中断：保留已取得的结果；重试仍失败：说明当前调用不可用，给出可替代输入方式。

## 常见问题

- 没结果：确认链接或 ID 完整；必要时先用内容研究类 skill 找到目标内容。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置；如果是 `insufficient_balance` 或“积分不足”，按错误里的充值链接充值后继续原命令，不要反复重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续做需求挖掘：增加页数、开启 `--include-replies`，或给出业务场景后整理成问题清单、FAQ 和行动建议。
