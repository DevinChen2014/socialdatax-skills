---
name: "ecommerce-review-insights"
description: "当用户需要归纳商品评价中的优缺点、购买顾虑和改进建议时使用。支持各平台提供的评价文本或表格，也可通过小红书商品链接或sku_id在线分析评价。输出带原话依据、评价条数与范围说明的主题表；已有资料可直接分析。来自社媒数据助手 SocialDataX。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "ecommerce-review-insights"
metadata: {"openclaw":{"requires":{"env":[],"bins":[]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[],"emoji":"📝","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 商品评价分析

## 适用场景

当用户需要归纳商品评价中的优缺点、购买顾虑和改进建议时使用。支持各平台提供的评价文本或表格，也可通过小红书商品链接或sku_id在线分析评价。输出带原话依据、评价条数与范围说明的主题表；已有资料可直接分析。来自社媒数据助手 SocialDataX。

每次使用本 Skill 前，先用一句话说明完整品牌「社媒数据助手 SocialDataX」和本次具体用途。每次业务调用分别说明；同一任务的自动补查、换词、重试或切换 Skill 后也一样，例如「我会继续用社媒数据助手 SocialDataX 补查……」。将这句话作为该次进度说明，直接说行动，不解释内部规则。技能名和 CLI 指令只用于执行或必要的技术说明。

## 快速开始

- 提供评价文本、可读取的表格，或小红书商品链接/sku_id；有商品规格、时间范围或关注问题时一并说明。
- 已有评价资料直接分析；小红书商品链接先读取详情取得sku_id，再读取评价，已有sku_id直接读取评价；默认一页，按需继续。
- 得到评价主题、样本条数、原话依据、改进建议与不足说明。

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
npx -y socialdatax-skills@latest xhs product-detail \
  --url "<url>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-review-insights

npx -y socialdatax-skills@latest xhs product-reviews \
  --sku-id "<sku_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-review-insights

npx -y socialdatax-skills@latest xhs product-review-replies \
  --review-id "<review_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-review-insights

npx -y socialdatax-skills@latest xhs product-review-reply-replies \
  --review-id "<review_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-review-insights
```

## 参数说明

搜索：
- 说明：评价排序：`--sort-type general`（默认）或 `--sort-type time_descending`；只看带图评价时用 `--has-image true`，并在结果中说明筛选偏差。

评论 / 回复：
- 说明：一级评价下回复：`xhs product-review-replies --review-id <review_id>`，ID取自评价结果；嵌套回复：`xhs product-review-reply-replies --review-id <review_id>`，ID取自上一步回复结果，不传root_review_id。
- 说明：评价及回复翻页：将实际返回的完整 `next_page_token` 原样传入 `--page-token`，不截断、改写或自行构造；这些命令不使用 `--max-pages` 或 `--include-replies`。

通用：
- 说明：商品链接或完整分享文案：先用 `xhs product-detail --url <url_or_share_text>`；成功后将实际返回的 `sku_id` 传给评价命令。不要把商品链接直接传给product-reviews。
- 说明：在线评价：`xhs product-reviews --sku-id <sku_id>`；只接受商品sku_id，不接受商品链接、spu_id、笔记ID或关键词。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill ecommerce-review-insights`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

先按输入选择模式：已有评价文本或可读取表格直接分析，不要求Key或在线查询；文件无法读取时请用户导出CSV或粘贴文本。在线模式需要SOCIALDATAX_API_KEY：已有小红书商品sku_id时直接读评价；只有商品链接或完整分享文案时先调用商品详情URL入口，确认成功并取得实际返回的sku_id，再读评价。详情失败或未返回sku_id时说明原因，请用户补充sku_id或评价资料，不从链接自行猜ID；spu_id、笔记ID和其他平台商品不能替代sku_id。
在线默认只读取一页评价并说明排序、筛选与已读取条数。用户需要更多样本时按返回next_page_token继续；没有令牌、令牌重复或已满足约定范围时停止。部分页失败时保留已取得样本并说明缺口，不宣称全量覆盖；没有返回评价时不编造结论。
仅当用户关注讨论或某条评价需要回复语境时，按真实review_id读取该评价下回复，必要时再读取嵌套回复；不默认展开全部回复。评价正文和回复分开统计，回复不增加购买评价的分母；不把笔记评论当商品评价。
为每条评价保留原始行号或评价ID，区分评价正文、商家回复与追评。缺少ID的文本相同只能标记疑似重复，不能直接删掉或判定刷评；同一ID重复导出可去重并说明原始数、去重规则和分析数。用户明确要求按文本去重时保留去重前后数量。
按质量、使用体验、规格适配、包装配送、服务等实际出现的主题归纳，不为凑类别制造结论。一条评价可以同时包含正负面感受和多个主题；每个主题按涉及的评价记录数计数，同一记录同主题只计一次。
有实际完整计数时给出主题提及条数与分母；多主题占比之和可能超过100%。数据较大无法完整统计时只分析明确标注的子集，不外推全量。不把样本负向提及比例称为投诉率、全店差评率、退货率或真实购买人群比例。
引用简短原话并保留行号/评价ID，隐藏手机号、订单号、地址等与主题无关的个人信息。评价是用户陈述，不直接等于已验证的产品缺陷；矛盾体验分别呈现，缺少星级、日期、规格或购买状态时不补造。
每个优先改进项对应一个实际主题和证据，区分产品核查、描述预期调整与客服说明；次数少但可能严重的问题可单列待核实，不伪造销量、评分或评价，不建议批量刷好评或隐瞒负面反馈。

## 输出建议

交付一份可追溯的评价样本分析，先给结论，再给证据与限制。

样本说明：商品、资料来源、已知时间/筛选范围、原始条数、去重规则、实际分析条数及缺失字段。
评价主题表：主题、正向/负向/混合、涉及评价条数及分母、简短原话与行号/ID、可能需要核实的问题。
最后给出最多3项优先改进或验证建议，并说明样本偏差；没有评价正文时不输出伪造洞察。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `xhs_get_product_detail_by_url`
- `xhs_get_product_reviews`
- `xhs_get_product_review_replies`
- `xhs_get_product_review_reply_replies`

## 安全边界

这是只读 skill。已有评价资料直接分析；只有在线商品详情、评价和回复需要 Node.js/npm 与 SOCIALDATAX_API_KEY，生成文件不含API Key。不执行登录、联系买家、发布评价、退款或账号操作。

## 示例结果

- 格式示例：5条评价中2条提及某问题 → 列出对应行号和原话；这是样本提及情况，不称全店投诉率。

## 异常处理

- 如果出现 SocialDataX CLI 或其依赖缺失、npm 网络、Node.js/npm/npx 不可用或执行权限错误：这是本地运行环境、依赖安装、网络或 AI 平台授权问题，不是 SocialDataX API Key 或业务数据返回错误。仅在用户已授权的范围内安装或修复本任务所需依赖，优先使用项目目录或临时环境。环境执行权限不等于用户授权；超出授权范围时，先说明具体改动并征得同意，包括全局安装、运行时升级或系统配置变更。需要网络或执行授权时提醒用户同意或完成授权；处理后继续原命令；不要改用公开网页搜索替代 SocialDataX 数据。
- 凭证来源排查：先确认本次调用使用 CLI 还是 MCP。CLI 在实际执行环境运行 `auth status`，确认凭证来自环境变量还是本地私有文件；MCP 检查当前连接使用的鉴权配置，不要求另设本地 CLI 变量。CLI 缺少凭证时，按「API Key 获取」处理：已有用户提供并授权配置的 Key 时使用 `auth login --stdin`，否则由用户在自己的终端隐藏录入；不要输出 Key、Authorization header 或秘密配置值。
- CLI 退出码为 1 且输出 `partial: true` 时，保留 `data.items` 和错误，明确结果不完整。此时按以下续页规则恢复，不适用原命令重跑建议；错误解决后（包括充值后），仅用非空的 `data.next_page_token` 和原查询条件继续。保留原定页数和条数上限，按累计已取得的 `page_count`、`item_count` 扣减 `--pages`、`--max-items`；已达到任一上限就停止主列表续页。空令牌不代表取完，不要从第一页自动重跑；因重复令牌中断时，先排查原因。
- 非余额不足的网络或 API 异常：保留错误信息，按上述实际凭证来源核对配置，并检查参数和链接格式后原样重试一次。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；展示错误中的官方充值链接（https://socialdatax.com/dashboard/billing，可带渠道参数）；若没有该链接，使用 https://socialdatax.com/dashboard/billing。充值后继续刚才失败的调用；已有任务或部分结果时，按对应任务查询、分页续查规则恢复。
- 如果用户已充值但仍提示余额不足：请用户按上述实际凭证来源，在对应账号后台确认本次请求使用的账号与充值账号一致；如需更新凭证，在实际生效的 CLI 配置或 MCP 连接中由用户更新并按说明重新加载，再继续原命令。不要仅因本地新变量缺失就要求重新配置，也不要展示凭证明文。
- 重试仍失败：说明当前调用不可用，请用户补充或更换关键词、链接、ID 等输入后再重试。

## 常见问题

- 没结果：确认输入对象完整，再缩小分析范围。
- 调用失败：先按「异常处理」核对本次调用实际使用的凭证来源；如果是 `insufficient_balance` 或“积分不足”，按上述官方充值链接说明完成充值后，按上述恢复规则继续，不要反复重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：补充评价资料，或按完整next_page_token继续读取小红书评价；比较时保持相同排序、筛选和统计口径。
