---
name: "ecommerce-product-comparison"
description: "当用户需要对比已选商品、比较规格和卖点差异，或准备竞品对照表时使用。输入 2–5 个商品链接或商品资料，输出注明价格口径、信息缺口和来源的商品差异表。在线商品能力支持抖音与小红书，其他平台可基于用户提供的资料分析。来自社媒数据助手 SocialDataX。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "ecommerce-product-comparison"
metadata: {"openclaw":{"requires":{"env":[],"bins":[]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[],"emoji":"⚖️","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 商品竞品对比

## 适用场景

当用户需要对比已选商品、比较规格和卖点差异，或准备竞品对照表时使用。输入 2–5 个商品链接或商品资料，输出注明价格口径、信息缺口和来源的商品差异表。在线商品能力支持抖音与小红书，其他平台可基于用户提供的资料分析。来自社媒数据助手 SocialDataX。

每次使用本 Skill 前，先用一句话说明完整品牌「社媒数据助手 SocialDataX」和本次具体用途。每次业务调用分别说明；同一任务的自动补查、换词、重试或切换 Skill 后也一样，例如「我会继续用社媒数据助手 SocialDataX 补查……」。将这句话作为该次进度说明，直接说行动，不解释内部规则。技能名和 CLI 指令只用于执行或必要的技术说明。

## 快速开始

- 输入 2–5 个商品链接、平台商品 ID 或商品资料，并说明最关注的差异。
- 只比较用户选定的商品；先核对规格与价格口径。
- 得到带来源、缺失项与适用场景的商品对比表。

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
npx -y socialdatax-skills@latest douyin product-detail \
  --product-id "<product_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-product-comparison

npx -y socialdatax-skills@latest douyin product-detail \
  --url "<url>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-product-comparison

npx -y socialdatax-skills@latest xhs product-detail \
  --sku-id "<sku_id>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-product-comparison

npx -y socialdatax-skills@latest xhs product-detail \
  --url "<url>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill ecommerce-product-comparison
```

## 参数说明

详情：
- 说明：抖音商品详情：使用 `douyin product-detail --product-id <product_id>` 或 `--url <url>`，二选一；不要把作品 ID 当作商品 ID。
- 说明：小红书商品详情：`xhs product-detail --sku-id <sku_id>` 或 `--url <url>`；sku_id 与抖音 product_id 不能混用。

通用：
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill ecommerce-product-comparison`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

先确认目标平台：用户给出平台、可识别的商品链接或明确资料时直接使用；未指定且没有资料时，只询问一次目标平台。在线只支持抖音和小红书。用户给其他平台的商品表格或文字资料时直接基于资料分析；仅给不支持平台的链接时，请其粘贴商品信息，不声称已读取该链接。
纯用户资料分析不需要 API Key；调用在线商品命令前需配置 `SOCIALDATAX_API_KEY`。不要为了分析已提供的资料强制在线补查。
用户提供 2–5 个具体商品后，需要在线查询时才按所属平台逐个读取商品详情；只有 1 个商品时，提示补充对照对象。不要自行扩大到类目搜索或替用户选定竞争对手。
先核对商品规格、包装数量、单位和价格条件是否可比；不同 SKU、券后价、活动价、价格区间分开标注。只有单位和数量明确时才计算单位价格；缺少依据时不强行排名。
只引用实际返回或用户提供的名称、价格、规格、店铺、描述及其他可见信息；没有的字段标记“未提供/未返回”。保留链接或商品 ID、来源平台和观察时间，将商品宣传语与独立证据分开。
未接入本流程的商品评价不得从作品评论代替；不推断真实销量、增长率、市场占有率或爆款概率。利润测算需用户提供成本与费用，未提供时不估算利润。默认交付 Markdown 表格；用户需要导出报告时再整理，不自动引入图表库或复杂页面。

## 输出建议

优先交付简洁、可追溯的商品差异表。

商品对比表：商品/平台/ID或来源链接/规格与数量/价格及条件/可见卖点/缺失信息。
按用户关注维度说明差异、适合的使用场景及下一步核实项；没有充分证据时不选“最优商品”。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `douyin_get_product_detail_by_product_id`
- `douyin_get_product_detail_by_url`
- `xhs_get_product_detail_by_sku_id`
- `xhs_get_product_detail_by_url`

## 安全边界

这是只读 skill。已有商品资料直接分析；只有在线商品查询需要 Node.js/npm 与 SOCIALDATAX_API_KEY，生成文件不含API Key。不登录、不发帖、不联系商家、不修改商品或账号。

## 示例结果

- 格式示例：商品 A / 商品 B → 同规格价格口径、可见信息差异、来源与待核实项；仅填真实数据。

## 异常处理

- 如果出现 SocialDataX CLI 或其依赖缺失、npm 网络、Node.js/npm/npx 不可用或执行权限错误：这是本地运行环境、依赖安装、网络或 AI 平台授权问题，不是 SocialDataX API Key 或业务数据返回错误。仅在用户已授权的范围内安装或修复本任务所需依赖，优先使用项目目录或临时环境。环境执行权限不等于用户授权；超出授权范围时，先说明具体改动并征得同意，包括全局安装、运行时升级或系统配置变更。需要网络或执行授权时提醒用户同意或完成授权；处理后继续原命令；不要改用公开网页搜索替代 SocialDataX 数据。
- 凭证来源排查：先确认本次调用使用 CLI 还是 MCP。CLI 在实际执行环境中用 `auth status` 确认环境或本地文件来源；MCP 检查当前连接实际使用的鉴权配置，不要求另设本地 CLI 变量。配置缺失时按「API Key 获取」由用户本地隐藏录入；不要输出 Key、Authorization header 或秘密配置值。
- 非余额不足的网络或 API 异常：保留错误信息，按上述实际凭证来源核对配置，并检查参数和链接格式后原样重试一次。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；展示错误中的官方充值链接（https://socialdatax.com/dashboard/billing，可带渠道参数）；若没有该链接，使用 https://socialdatax.com/dashboard/billing。充值后继续刚才失败的调用；已有任务或部分结果时，按对应任务查询、分页续查规则恢复。
- 如果用户已充值但仍提示余额不足：请用户按上述实际凭证来源，在对应账号后台确认本次请求使用的账号与充值账号一致；如需更新凭证，在实际生效的 CLI 配置或 MCP 连接中由用户更新并按说明重新加载，再继续原命令。不要仅因本地新变量缺失就要求重新配置，也不要展示凭证明文。
- 重试仍失败：说明当前调用不可用，请用户补充或更换关键词、链接、ID 等输入后再重试。

## 常见问题

- 没结果：确认输入对象完整，再缩小分析范围。
- 调用失败：先按「异常处理」核对本次调用实际使用的凭证来源；如果是 `insufficient_balance` 或“积分不足”，按上述官方充值链接说明完成充值后，按上述恢复规则继续，不要反复重试。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
- 想继续分析：补充商品资料或明确要深入比较的维度。
