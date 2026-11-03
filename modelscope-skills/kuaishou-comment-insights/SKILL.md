---
name: "kuaishou-comment-insights"
description: "当用户需要做快手评论分析、快手评论洞察、快手用户反馈分析、快手需求挖掘、痛点总结、购买顾虑整理、FAQ 提炼、口碑分析、评论回复观察或内容讨论复盘时使用。基于用户提供的快手作品链接或内容 ID 下的评论结果，面向内容运营、产品调研、品牌调研和创作者。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "kuaishou-comment-insights"
metadata: {"openclaw":{"requires":{"env":[],"bins":[]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"💬","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 快手评论分析与需求挖掘

## 适用场景

当用户需要做快手评论分析、快手评论洞察、快手用户反馈分析、快手需求挖掘、痛点总结、购买顾虑整理、FAQ 提炼、口碑分析、评论回复观察或内容讨论复盘时使用。基于用户提供的快手作品链接或内容 ID 下的评论结果，面向内容运营、产品调研、品牌调研和创作者。

## 快速开始

- 先给出当前 skill 支持的输入：作品链接或内容 ID。
- 如果结果有分页，先取第一页；要继续扩大，再按返回的下一页标记继续。
- 你通常会得到：评论文本、回复线索和用户反馈主题。

## API Key 获取

获取或管理 API Key：访问 <https://socialdatax.com/ai?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- 先确认调用方式和命令实际运行位置：已认证的 hosted MCP 不要求本地 CLI 变量或 Node/npm；需要 Key 的直接 CLI 则在同一执行环境用下方命令检查。已能读取就继续原任务，不覆盖已有配置。不能运行命令或缺少 Node.js 属于执行环境问题，不能当成 Key 缺失；仅在确认用户没有 Key 时，才引导从上述官网获取。
- 本地 Agent：优先用客户端官方支持的持久化 Secret / env，并确认它注入 Agent 命令进程。WorkBuddy 可在当前可信工作空间的 `.codebuddy/settings.local.json` 中合并 `{"env":{"SOCIALDATAX_API_KEY":"<YOUR_API_KEY>"}}`，保留其他设置和 env；此路径只适用于 WorkBuddy，作用域只限该工作空间。真实 Key 由用户本地填写，文件不提交版本库。
- 远程 Agent：在实际运行命令的远程主机或服务配置客户端持久化 Secret / env，按该客户端的官方方式重新加载执行进程，并在同一远程会话检查；本机系统变量不会自动传到远程。不要因本机检查成功就认定远程也可用。
- 容器或云端沙箱 Agent：优先用平台支持的持久化 Secret / 环境变量注入功能，让它进入执行 CLI 的容器或沙箱；配置后按平台说明重建或重新加载，再在其中检查。不要改宿主机变量来代替沙箱注入；若平台无法持久保存或注入，说明限制并引导用户使用平台支持的鉴权方式，不绕过隔离。
- 检查为 false 时，先逐项排查：配置文件或 Secret 是否位于正确主机、工作空间和作用域，工作空间是否可信，字段是否正确且保留了已有设置，变量是否注入命令进程（仅 MCP server 的 env 不算），以及是否按官方说明重新加载或完全重启。修正后在原执行环境复查；只有明确不支持客户端持久化，或完成上述排查仍不可用，才用该环境官方支持的用户级/服务级环境变量兜底。不能仅因一次检查或重新加载失败就跳到系统配置。
- 系统兜底按实际执行主机处理：Windows 可用用户环境变量；macOS 可由用户在本机终端隐藏输入（如 Bash `read -s`）后传给 `launchctl setenv`，仅对当前登录会话有效，重登或重启电脑后需重新加载。输入失败、空输入或设置失败时明确报错并停止，返回非零退出码；清理临时变量不能覆盖原错误状态。配置后完全退出对应客户端及后台进程再打开；远程服务按其运行方式重载，沙箱仍通过平台注入。单独终端临时 `export`、只写 shell 启动文件或只关窗口都不能证明 Agent 已继承。真实 Key 不出现在聊天、日志、截图、命令历史或 Skill 文件里。
- 在实际执行 CLI 的同一环境运行 `node -e "console.log(JSON.stringify({apiKeyReadable:Boolean(['SOCIALDATAX_API_KEY','SOCIAL_MEDIA_MCP_API_KEY'].map(name=>process.env[name]?.trim()).find(Boolean))}))"`，只报告布尔结果，不打印 Key 或全部环境变量。检查遵循 CLI 的顺序：先读取去除首尾空白后的主变量，再兼容既有旧变量；新增配置仍统一用 `SOCIALDATAX_API_KEY`。`apiKeyReadable: false` 时停止业务调用并按上面的顺序排查；`true` 只证明存在可读取的非空值，继续原业务请求验证鉴权，不代表 Key 有效或余额充足。不要在检查命令里临时注入变量制造成功。

## 直接调用命令

优先使用 direct CLI；能运行 shell 命令的 Agent 不需要额外配置 MCP server：

```bash
npx -y socialdatax-skills@latest kuaishou comments \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill kuaishou-comment-insights

npx -y socialdatax-skills@latest kuaishou comments \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill kuaishou-comment-insights

npx -y socialdatax-skills@latest kuaishou replies \
  --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill kuaishou-comment-insights
```

## 参数说明

评论 / 回复：
- 说明：使用 CLI 示例里的 URL 入口传内容页链接、短链或分享文本来获取一级评论。
- 可选：`--page-token <next_page_token>`：这是不透明的分页 token；在同一条内容或评论链路下，必须把完整返回的 `next_page_token` 原样传回，不能截断、改写、脱敏、重建，或用省略号替换中间内容。
- 可选：`--pages <n>`：获取并合并 N 页一级评论或回复。
- 可选：`--all`：持续获取一级评论或回复，直到 `next_page_token` 为空；默认没有条数或页数上限。
- 可选：`--max-items <n>`：收集到 N 条一级评论或回复后停止。
- 说明：Kuaishou `--photo-id <photo_id>`：当快手作品 `photo_id` 已知且要作为评论链路目标时优先使用。

通用：
- 可选：`--pretty`：只影响输出格式，不改变实际请求结果。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill kuaishou-comment-insights`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

一级评论命令一次只使用 CLI 示例里的一个入口；不要在同一条命令里混用多个内容定位参数。回复命令使用 CLI 示例中对应平台需要的回复定位参数。

命令返回 JSON，包含 `platform`、`tool`、`arguments` 和 `data`。多页结果会把一级评论合并到 `data.items`，并补充 `page_count`、`item_count` 和下一页标记；在支持 `--include-replies` 的平台上，每条一级评论还会带上 `replies`、`replies_page_count` 和 `replies_next_page_token`。

## 输出建议

优先输出可直接用于复盘和决策的结果：评论主题、用户反馈、痛点、需求和可行动建议。

默认按这个结构输出：评论主题、用户痛点、购买顾虑、未满足需求、FAQ、高频原话、可行动建议。
先说明输入范围：结论基于用户提供的目标内容下已返回的评论和回复，不代表全平台完整覆盖。
把评论原文证据和你的判断分开写；引用高频原话时只使用返回中可见的评论文本，不编造不存在的反馈。
如果使用了多页结果或继续拉取回复，说明评论和回复的覆盖范围；如果只取第一页，也要明确这是局部样本。
面向内容运营、产品调研或品牌调研时，把评论反馈转成可执行的问题清单、选题角度、产品改进线索或客服 FAQ。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `kuaishou_get_video_comments_by_photo_id`
- `kuaishou_get_video_comments_by_url`
- `kuaishou_get_video_comment_replies_by_comment_id`

如果当前 Agent 已可直接调用 MCP 工具，可按入口选择以下工具：

- `kuaishou_get_video_comments_by_photo_id`：当 `photo_id` 已经明确时使用。
- `kuaishou_get_video_comments_by_url`：用于快手作品页 URL、短链或分享文本。
- `kuaishou_get_video_comment_replies_by_comment_id`：当 `photo_id` 和一级评论 ID 都已明确时使用。
- 快手评论和回复只有在 `next_page_token` 非空时才继续翻页；空字符串表示没有可用续页令牌，不据此保证评论或回复已全部取完。

## 安全边界

这是只读 skill。运行时使用用户环境变量中的 `SOCIALDATAX_API_KEY`；生成的 Skill 文件不包含 API Key。不会读取本地浏览器数据，也不会执行登录、发帖、点赞、评论或账号修改。

## 示例结果

- 示例展示格式，不代表固定字段：评论=内容/用户/时间/回复线索；判断=主题/痛点/需求/建议。

## 异常处理

- 凭证来源排查：先确认本次调用使用 CLI 还是 MCP。CLI 在实际执行环境中按「API Key 获取」的检查规则排查生效配置（主变量优先，兼容既有旧变量）；MCP 检查当前连接实际使用的鉴权配置，不要求另设本地 CLI 变量。配置缺失时沿用前面的客户端排查与兜底顺序；不要输出 Key、Authorization header 或秘密配置值。

- 如果出现 SDK/依赖缺失、npm 网络、Node.js/npm/npx 不可用或执行权限错误：这是本地运行环境、依赖安装、网络或 AI 平台授权问题，不是 SocialDataX API Key 或业务数据返回错误。仅在用户已授权的范围内安装或修复本任务所需依赖，优先使用项目目录或临时环境。环境执行权限不等于用户授权；超出授权范围时，先说明具体改动并征得同意，包括全局安装、运行时升级或系统配置变更。需要网络或执行授权时提醒用户同意或完成授权；处理后继续原命令；不要改用公开网页搜索替代 SocialDataX 数据。
- CLI 退出码为 1 且输出 `partial: true` 时，保留 `data.items` 和错误，明确结果不完整。此时按以下续页规则恢复，不适用原命令重跑建议；错误解决后（包括充值后），仅用非空的 `data.next_page_token` 和原查询条件继续。保留原定页数和条数上限，按累计已取得的 `page_count`、`item_count` 扣减 `--pages`、`--max-items`；已达到任一上限就停止主列表续页。空令牌不代表取完，不要从第一页自动重跑；因重复令牌中断时，先排查原因。
- 使用 `--include-replies` 时，`replies_partial` 表示该评论回复不完整，`replies_pending` 表示尚未展开。先用该平台回复命令、对应评论标识及可用的 `replies_next_page_token` 补齐；尚未展开或首个回复请求失败时，修正错误后从该评论的首批回复开始，重复令牌错误则先排查。仅在主评论仍有剩余额度时，才用外层 `data.next_page_token` 继续；补齐已取得评论的回复不增加主评论页数；两类令牌不能混用，不把回复预览当成完整回复。
- 非余额不足的网络或 API 异常：保留错误信息，按上述实际凭证来源核对配置，并检查参数和链接格式后原样重试一次。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；展示错误中的官方充值链接（https://socialdatax.com/dashboard/billing，可带渠道参数）；若没有该链接，使用 https://socialdatax.com/dashboard/billing。充值后继续刚才失败的调用；已有任务或部分结果时，按对应任务查询、分页续查规则恢复。
- 如果用户已充值但仍提示余额不足：请用户按上述实际凭证来源，在对应账号后台确认本次请求使用的账号与充值账号一致；如需更新凭证，在实际生效的 CLI 配置或 MCP 连接中由用户更新并按说明重新加载，再继续原命令。不要仅因本地新变量缺失就要求重新配置，也不要展示凭证明文。

## 常见问题

- 没结果：确认链接或 ID 完整；必要时先用内容研究类 skill 找到目标内容。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先按上述实际凭证来源核对 CLI 或 MCP 的生效配置；如果是 `insufficient_balance` 或“积分不足”，按上述官方充值链接说明完成充值后，按上述恢复规则继续，不要反复重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续做需求挖掘：增加评论页数，必要时继续拉取回复，再结合业务场景整理成问题清单、FAQ 和行动建议。
