---
name: "xhs-creator-collaboration-evaluation"
description: "用户提供品牌或产品、目标受众、候选小红书达人和预算时，使用蒲公英报价、粉丝画像和内容表现比较合作适配度，交付候选对照表与待确认事项。SocialDataX 支持命令查询；不预测实际成交或投放回报。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "xhs-creator-collaboration-evaluation"
metadata: {"openclaw":{"requires":{"env":[],"bins":[]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[{"kind":"node","package":"socialdatax-skills","bins":[]}],"emoji":"👤","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 小红书达人合作评估

## 适用场景

用户提供品牌或产品、目标受众、候选小红书达人和预算时，使用蒲公英报价、粉丝画像和内容表现比较合作适配度，交付候选对照表与待确认事项。SocialDataX 支持命令查询；不预测实际成交或投放回报。

## 快速开始

提供品牌或产品、目标受众、预算及候选小红书达人 ID 或主页。
只评估给定候选；按需要选择报价、粉丝画像与内容表现端点，成功调用每次 20 积分。
交付候选达人合作对照表，标明费用、样本范围、依据和待确认事项。

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
npx -y socialdatax-skills@latest xhs pgy-creator-profile \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation

npx -y socialdatax-skills@latest xhs pgy-creator-fans-profile \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation

npx -y socialdatax-skills@latest xhs pgy-creator-notes-performance \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation
```

更多 direct CLI 入口：

```bash
npx -y socialdatax-skills@latest xhs user-info \
  --profile-url "<profile_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill xhs-creator-collaboration-evaluation

npx -y socialdatax-skills@latest xhs pgy-creator-fans-summary \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation

npx -y socialdatax-skills@latest xhs pgy-creator-commercial-overview \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation

npx -y socialdatax-skills@latest xhs pgy-creator-metrics-trend \
  --user-id "<user_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation
```

## 参数说明

创作者 / 账号：
- 说明：候选达人的完整 `--user-id`；只有主页时先用 `xhs user-info --profile-url` 取得返回的用户 ID，不猜测 ID。

通用：
- 说明：部分表现、概览和趋势命令支持 `--note-scope daily|cooperation`；需要合作笔记对照时显式选择 `cooperation`，比较时保持相同范围。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill xhs-creator-collaboration-evaluation`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

## 合作评估流程

确认品牌/产品、目标受众、预算和候选名单；仅缺会影响评估的信息时询问。默认评估用户给定的候选，不自动扩充名单。

每个蒲公英端点每次成功查询收费 20 积分，失败不收费。先说明所选端点及预计成功调用积分；商业查询与费用已经确认时不重复询问。默认按需用报价资料、粉丝画像和内容表现，不把六个端点自动全部调用。

三名候选各查询上述三个商业端点，全部成功时共 9 次、180 积分；需要普通主页解析时另按该命令费用计算。仅做预算初筛时先查询报价资料。

只有提供完整用户 ID 才调用 `pgy-creator-*`；这些命令不接受主页 URL。只有主页时使用已列出的普通资料入口取得 ID。

内容表现与趋势采用服务固定窗口，不能指定任意起止日期。使用返回的数据日期和范围；增长指标没有明确周期时不自行补写周期。

画像分布未必完整，报价为 0 不等于免费；中位数不能相加，缺失日期不补 0。估算成本不等于实际成交成本，不能据此计算真实 ROI 或承诺销量。

遇到 `pgy_commercial_data_unavailable` 或公开错误码 `1009`，保留已取得结果，记录该候选商业数据不可用，不用其他输入重试或将普通资料当作商业结果。

## 输出建议

先列候选对照表，再解释预算与受众适配依据，区分接口事实和评估意见。

交付候选对照表：达人 ID/主页、报价及形式、目标受众匹配证据、内容表现、数据范围、预算适配判断、缺失数据。
将接口返回事实与合作建议分开；结论用优先沟通、需补资料或预算不匹配，并写明理由，不生成无依据的精确评分。
保留已取得的完整笔记链接和证据；仅对实际返回的数据作比较，报价以实际沟通确认为准。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `xhs_pgy_get_creator_profile`
- `xhs_pgy_get_creator_fans_profile`
- `xhs_pgy_get_creator_notes_performance`
- `xhs_get_user_info_by_profile_url`
- `xhs_pgy_get_creator_fans_summary`
- `xhs_pgy_get_creator_commercial_overview`
- `xhs_pgy_get_creator_metrics_trend`

## 安全边界

这是只读 skill，用于达人商业数据评估。仅进行已确认范围内的达人资料和商业数据查询，使用用户配置的 SOCIALDATAX_API_KEY；不联系达人、不发私信、不下单或签约，生成文件不含 API Key。

## 示例结果

示例：候选=<用户给定达人>；报价=<返回报价或缺失>；受众证据=<返回画像>；判断=<优先沟通或需补资料>；预算适配=<附依据>。

## 异常处理

- 凭证来源排查：先确认本次调用使用 CLI 还是 MCP。CLI 在实际执行环境中按「API Key 获取」的检查规则排查生效配置（主变量优先，兼容既有旧变量）；MCP 检查当前连接实际使用的鉴权配置，不要求另设本地 CLI 变量。配置缺失时沿用前面的客户端排查与兜底顺序；不要输出 Key、Authorization header 或秘密配置值。

- 如果出现 SDK/依赖缺失、npm 网络、Node.js/npm/npx 不可用或执行权限错误：这是本地运行环境、依赖安装、网络或 AI 平台授权问题，不是 SocialDataX API Key 或业务数据返回错误。仅在用户已授权的范围内安装或修复本任务所需依赖，优先使用项目目录或临时环境。环境执行权限不等于用户授权；超出授权范围时，先说明具体改动并征得同意，包括全局安装、运行时升级或系统配置变更。需要网络或执行授权时提醒用户同意或完成授权；处理后继续原命令；不要改用公开网页搜索替代 SocialDataX 数据。
- 非余额不足的网络或 API 异常：保留错误信息，按上述实际凭证来源核对配置，并检查参数和链接格式后原样重试一次。 `pgy_commercial_data_unavailable` / 公开错误码 `1009` 表示商业数据不可用，应停止；不适用本节的重试和更换输入建议。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；展示错误中的官方充值链接（https://socialdatax.com/dashboard/billing，可带渠道参数）；若没有该链接，使用 https://socialdatax.com/dashboard/billing。充值后继续刚才失败的调用；已有任务或部分结果时，按对应任务查询、分页续查规则恢复。
- 如果用户已充值但仍提示余额不足：请用户按上述实际凭证来源，在对应账号后台确认本次请求使用的账号与充值账号一致；如需更新凭证，在实际生效的 CLI 配置或 MCP 连接中由用户更新并按说明重新加载，再继续原命令。不要仅因本地新变量缺失就要求重新配置，也不要展示凭证明文。
- 重试仍失败：说明当前调用不可用，请用户补充或更换关键词、链接、ID 等输入后再重试。

## 常见问题

- 没结果：确认账号主页、分享文本或平台账号 ID 完整。
- 调用失败：先按上述实际凭证来源核对 CLI 或 MCP 的生效配置；如果是 `insufficient_balance` 或“积分不足”，按上述官方充值链接说明完成充值后，按上述恢复规则继续，不要反复重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：把最相关的 1-3 条结果发回来，继续缩小范围。
