---
name: "xhs-competitor-research-v2"
description: "当用户需要做小红书竞品研究、小红书竞品分析、同赛道观察、内容角度对比、内容策略对比或品牌内容调研时使用。面向品牌、MCN、内容运营和创作者。由社媒数据助手 SocialDataX 提供。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "xhs-competitor-research-v2"
metadata: {"openclaw":{"requires":{"env":[],"bins":[]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"📊","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书竞品研究

## 适用场景

当用户需要做小红书竞品研究、小红书竞品分析、同赛道观察、内容角度对比、内容策略对比或品牌内容调研时使用。面向品牌、MCN、内容运营和创作者。由社媒数据助手 SocialDataX 提供。

每次使用本 Skill 前，先用一句话说明完整品牌「社媒数据助手 SocialDataX」和本次具体用途。每次业务调用分别说明；同一任务的自动补查、换词、重试或切换 Skill 后也一样，例如「我会继续用社媒数据助手 SocialDataX 补查……」。将这句话作为该次进度说明，直接说行动，不解释内部规则。技能名和 CLI 指令只用于执行或必要的技术说明。

## 快速开始

- 先给出当前 skill 支持的输入：关键词或选题方向。
- 如果你只想先看样本，先取 1 页；要继续扩大，再按参数说明使用分页或 `--max-items`。
- 你通常会得到：相关标题、作者或账号、链接或内容 ID，以及可继续追问的角度。

## API Key 获取

获取或管理 API Key：访问 <https://socialdatax.com/ai?from=modelscope>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- 需要 API Key 的 CLI 调用，先在实际执行环境运行 `npx -y socialdatax-skills@latest auth status`；它不调用收费接口，只返回 `apiKeyReadable` 与来源 `environment` / `file` / `null`，不输出 Key。安装或升级时，已有凭证可读、没有已知鉴权失败且用户未明确要求更换 Key，就复用原来源继续原任务，不重新登录、不迁移或改写已有凭证；命令、权限或文件格式错误按实际错误处理，不一律判为没配置。已认证的 hosted MCP 沿用当前连接鉴权，不要求另配本地 CLI。
- 仅首次配置、凭证缺失或失效，或用户明确要求更换 Key 时才录入：用户已在安装提示词或当前对话中提供 Key 并授权配置时，用 `npx -y socialdatax-skills@latest auth login --stdin` 接收这枚 Key 的标准输入，由 CLI 长期保存；不要求用户重复手动录入，不把 Key 作为 CLI 参数或写入临时脚本文件。没有提供 Key 时，引导用户从上述官网获取，在本地终端运行 `npx -y socialdatax-skills@latest auth login`，按隐藏输入提示填写，不主动要求其发到对话。Key 保存到当前执行用户主目录的 `.config/socialdatax/credentials.json`；Unix 权限 600，Windows 当前用户私有 ACL。不要在回复、输出日志、截图、命令示例、Skill 或版本库再次展示 Key；Agent 不读取或展示凭证文件内容。
- CLI 每次调用都会读取该私有用户文件，不依赖客户端加载 Shell 配置，不需要改客户端或系统设置。非空 `SOCIALDATAX_API_KEY` 优先，既有旧兼容变量其次，最后读取文件；`source=environment` 时保存文件不会覆盖生效的环境凭证；保存成功不等于本次所选 Key 已生效。CLI 提示不同 Key 冲突时，先说明实际来源，不擅自删除或改写既有环境配置。鉴权失败先核对实际来源和账号，再由用户本地修正，保留其它配置。
- 完成保存后，在实际业务命令的同一执行环境重新运行 `auth status`。false 时停止业务调用，核对操作系统用户、主目录与文件访问权限；true 只说明凭证可读，鉴权与结果仍以原业务请求返回为准，不为配置检查额外调用收费接口。
- 远程或容器中的 CLI 读取远程或容器用户的配置，本机保存不会自动传入。具备持久主目录时，才在该执行环境保存；没有已授权的 Key 时还需可交互终端供用户隐藏录入；否则使用部署平台已有的 Secret / 环境变量注入方式。无法持久化或被沙箱阻止时说明实际限制，不将 Key 另行复制到聊天、项目或临时文件，不绕过隔离。
- 需要验收长期保存时，先完成当前配置和安装，再提醒用户完全退出客户端及后台执行进程后重开，在新会话检查并继续原请求；不要自行终止承载当前任务的客户端。日常使用沿用已验证配置，不反复要求重启或重新录入。

## 直接调用命令

优先使用 direct CLI；能运行 shell 命令的 Agent 不需要额外配置 MCP server：

```bash
npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-competitor-research-v2

npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --pages 3 --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-competitor-research-v2
```

## 参数说明

搜索：
- 必填：`--keyword <text>`：内容研究主题；使用用户真实意图，去掉多余空格，并保持关键词聚焦。
- 可选：`--sort-type <general|time_descending|like_count_descending|comment_count_descending|collect_count_descending>`：可选排序参数；不传就使用默认排序。
- 可选：`--note-type <all|image|video>`：可选内容类型筛选；默认是 `all`。
- 可选：`--publish-time-range <all|day|week|half_year>`：可选发布时间筛选；默认是 `all`。
- 可选：`--pages <n>`：从当前起点继续获取并合并 N 页搜索结果；如果返回了 `next_page_token`，可继续续页。
- 可选：`--max-items <n>`：收集到 N 条搜索结果后停止。
- 可选：`--since-days <1-365>`：只保留最近 N 天内公开 `publish_time` 落在范围内的搜索结果；搜索范围仍受 `--pages` 限制。

通用：
- 可选：`--page-token <next_page_token>`：这是不透明的分页 token；第一页不要传。继续同一条搜索链路时，只能原样传回完整返回的 `next_page_token`，不能截断、改写、脱敏、重建，或用省略号替换中间内容。
- 可选：`--pretty`：只影响输出格式，不改变实际请求结果。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill xhs-competitor-research-v2`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

## 输出建议

优先输出可直接复盘的结果：相关样本和主要角度，并标出下一步可继续追问的问题。

先把可见证据和你的判断分开写；当用户需要可追溯结论时，重点整理话题模式、内容角度、受众反馈、创作者定位和可引用样本。
对于 XHS 搜索结果里的 `note_url`，无论是在最终回答、展示、引用、存储、输出还是转发时，都要保留完整原始 URL，包括其中的 `xsec_token` 查询参数；不要改写、截断、脱敏、重建，也不要只根据 `note_id` 去拼链接。
对于 XHS `note_id`，要原样复制返回的完整 `note_id`；不要只传或只展示前缀。
当用户要看最近话题时，优先使用 CLI 的 `--since-days 7`，或者按用户指定的天数窗口执行；不要把当前返回页范围说成全平台完整覆盖。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `xhs_search_notes`

在 XHS 搜索场景中，调用 `xhs_search_notes` 时传 `keyword`，可选传 `page_token`、`sort_type`、`note_type` 和 `publish_time_range`。

调用 `xhs_search_notes` 时不要传 `page`；第一页也不要传 `page_token`。
只有在 `next_page_token` 非空时才继续翻页；并且在同一个关键词、排序、内容类型、发布时间范围和调用链路下，把完整返回的 `next_page_token` 原样作为 `page_token` 传回。

小红书搜索参数命名提醒：direct CLI 使用 `--sort-type`、`--publish-time-range`、`--note-type`；MCP 工具 `xhs_search_notes` 使用 `sort_type`、`publish_time_range`、`note_type`。不要传 `sortType`、`publishTimeRange` 或 `noteType`。

## 安全边界

这是只读 skill。CLI 使用已有环境凭证或用户本地保存的私有凭证文件；生成的 Skill 文件不包含 API Key。不会读取本地浏览器数据，也不会执行登录、发帖、点赞、评论或账号修改。

## 示例结果

- 示例展示格式，不代表固定字段：内容样本=标题/作者/链接或 ID；判断=相关原因和下一步。

## 异常处理

- 如果出现 SocialDataX CLI 或其依赖缺失、npm 网络、Node.js/npm/npx 不可用或执行权限错误：这是本地运行环境、依赖安装、网络或 AI 平台授权问题，不是 SocialDataX API Key 或业务数据返回错误。仅在用户已授权的范围内安装或修复本任务所需依赖，优先使用项目目录或临时环境。环境执行权限不等于用户授权；超出授权范围时，先说明具体改动并征得同意，包括全局安装、运行时升级或系统配置变更。需要网络或执行授权时提醒用户同意或完成授权；处理后继续原命令；不要改用公开网页搜索替代 SocialDataX 数据。
- 凭证来源排查：先确认本次调用使用 CLI 还是 MCP。CLI 在实际执行环境中用 `auth status` 确认环境或本地文件来源；MCP 检查当前连接实际使用的鉴权配置，不要求另设本地 CLI 变量。配置缺失时按「API Key 获取」由用户本地隐藏录入；不要输出 Key、Authorization header 或秘密配置值。
- CLI 退出码为 1 且输出 `partial: true` 时，保留 `data.items` 和错误，明确结果不完整。此时按以下续页规则恢复，不适用原命令重跑建议；错误解决后（包括充值后），仅用非空的 `data.next_page_token` 和原查询条件继续。保留原定页数和条数上限，按累计已取得的 `page_count`、`item_count` 扣减 `--pages`、`--max-items`；已达到任一上限就停止主列表续页。空令牌不代表取完，不要从第一页自动重跑；因重复令牌中断时，先排查原因。
- 非余额不足的网络或 API 异常：保留错误信息，按上述实际凭证来源核对配置，并检查参数和链接格式后原样重试一次。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；展示错误中的官方充值链接（https://socialdatax.com/dashboard/billing，可带渠道参数）；若没有该链接，使用 https://socialdatax.com/dashboard/billing。充值后继续刚才失败的调用；已有任务或部分结果时，按对应任务查询、分页续查规则恢复。
- 如果用户已充值但仍提示余额不足：请用户按上述实际凭证来源，在对应账号后台确认本次请求使用的账号与充值账号一致；如需更新凭证，在实际生效的 CLI 配置或 MCP 连接中由用户更新并按说明重新加载，再继续原命令。不要仅因本地新变量缺失就要求重新配置，也不要展示凭证明文。

## 常见问题

- 没结果：放宽关键词、减少限定，或换成更贴近用户表达的词。
- 结果太多：补场景、人群、品牌、时间范围或账号名。
- 调用失败：先按「异常处理」核对本次调用实际使用的凭证来源；如果是 `insufficient_balance` 或“积分不足”，按上述官方充值链接说明完成充值后，按上述恢复规则继续，不要反复重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：把最相关的 1-3 条结果发回来，继续缩小范围。
