---
name: "socialdatax-media-save-organizer"
description: "用户提供社媒内容链接或媒体直链和输出目录时，保存支持平台的图片、视频或音频，并整理来源链接、本地文件路径及成功失败清单。支持小红书、抖音、快手、微博、X / Twitter 和 Bilibili，使用 SocialDataX 现有命令。"
source_client: "socialdatax-skills"
source_platform: "modelscope"
source_skill: "socialdatax-media-save-organizer"
metadata: {"openclaw":{"requires":{"env":[],"bins":[]},"primaryEnv":"SOCIALDATAX_API_KEY","install":[],"emoji":"📄","homepage":"https://socialdatax.com/ai?from=modelscope"}}
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 社媒素材保存整理

## 适用场景

用户提供社媒内容链接或媒体直链和输出目录时，保存支持平台的图片、视频或音频，并整理来源链接、本地文件路径及成功失败清单。支持小红书、抖音、快手、微博、X / Twitter 和 Bilibili，使用 SocialDataX 现有命令。

## 快速开始

提供要保存的内容链接或媒体直链，以及本地输出目录；有多个链接时给出明确名单。
只处理给定的链接。支持小红书、抖音、快手、微博、X 和 Bilibili；不承诺任意站点或未实现的平台。
交付已保存文件和来源清单，逐项说明失败或缺失素材。

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
npx -y socialdatax-skills@latest xhs detail \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill socialdatax-media-save-organizer

npx -y socialdatax-skills@latest douyin detail \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill socialdatax-media-save-organizer

npx -y socialdatax-skills@latest kuaishou detail \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill socialdatax-media-save-organizer

npx -y socialdatax-skills@latest weibo detail \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill socialdatax-media-save-organizer

npx -y socialdatax-skills@latest x detail \
  --post-url "<x_post_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform modelscope --source-skill socialdatax-media-save-organizer

npx -y socialdatax-skills@latest bilibili download-media \
  --url "<bilibili_video_url_or_share_text>" --output-dir "<directory>" --pretty \
  --source-client socialdatax-skills --source-platform modelscope \
  --source-skill socialdatax-media-save-organizer
```

## 参数说明

详情：
- 说明：用户给定的内容链接或媒体直链，以及本地输出目录。内容链接需先调用对应详情命令；媒体直链可直接保存。

通用：
- 说明：本地保存使用 `--output-dir "<directory>"`；不要将内容页面 URL 当成 `download-media --url` 的媒体直链。
- 可选：`--source-client socialdatax-skills --source-platform modelscope --source-skill socialdatax-media-save-organizer`：这是当前 Agent Skill 的来源标记；按本 Skill 示例执行时保持这些值不变。

## 保存流程

先确认输出目录和明确链接名单；已有用户选择时直接沿用。区分内容页面、分享链接与媒体直链。

每个不同素材使用用户输出目录下独立的空子目录，例如 material-001、material-002；将该子目录传给下面命令的 --output-dir，避免不同 URL 的同名文件互相占用路径。沿用已有来源清单续存时，先核对素材与本地路径的对应关系。

仅给定媒体直链时，本地 `download-media` 不需要 API Key；需要在线解析内容详情或 Bilibili 下载链接时，使用用户配置的 SOCIALDATAX_API_KEY。执行 CLI 需要 Node.js/npm，Bilibili 合并需要 ffmpeg；按本次授权范围准备依赖。

将以下本地保存子命令接在 `npx -y socialdatax-skills@latest` 后执行；纯本地 `download-media` 不接受 `--source-client`、`--source-platform`、`--source-skill`，不要追加这些参数。每次只传一个媒体 URL。上面的在线详情和 Bilibili 下载链接请求保留既有归因参数。

小红书：`xhs download-media --url "<media_url>" --output-dir "<directory>" --pretty`；从详情的 `image_items[].image_url`、`image_items[].live_photo.video_url` 或 `video.video_url` 选择用户需要的素材。

抖音：`douyin download-media --url "<media_url>" --output-dir "<directory>" --pretty`；从 `images[].url`、`images[].live_photo.play_url`、`video.play_url`、`music.play_url` 或 `cover_image_url` 选择素材，图文作品的 video 可能是音频，不强行标成视频。

快手：`kuaishou download-media --url "<media_url>" --output-dir "<directory>" --pretty`；使用 `images[].url`、`video.play_url` 或 `cover_image_url`。

微博：`weibo download-media --url "<media_url>" --output-dir "<directory>" --pretty`；使用 `image_urls[]` 或 `video.video_url`。

X / Twitter：`x download-media --url "<media_url>" --output-dir "<directory>" --pretty`；使用 `media_items[].cover_image_url` 或 `media_items[].video_url`。进程需要代理时可用 `--proxy` 或已有代理环境变量。

Bilibili 使用本页 `bilibili download` 视频链接命令；不要把文章或动态链接当作视频下载。其 MCP 工具只提供下载链接，本地文件保存与合并由 CLI 执行。

媒体缺失或下载失败时，保留成功文件并列出失败项和原因；不尝试猜测下载地址，不把命令提交成功当成文件保存成功。

同一素材 URL 重复出现时只保存一次，并保留其各个来源。用户未指定时不额外下载封面、配乐等附属素材。

## 输出建议

交付已保存素材和来源到本地路径的清单，保留失败项，便于继续整理或复盘。

交付清单：平台、内容 ID/标题（可用时）、来源链接、本地路径、素材类型、保存结果、失败原因。
结合命令结果和实际文件确认保存情况；若返回 `skipped_existing`，只有已有来源清单确认是同一素材时才记为已存在，否则另选空子目录保存。不要将跳过当作新下载成功或覆盖原文件；不编造文件名、未返回的媒体或下载结果。
如需把清单保存为文件，只写入用户指定目录；文件清单与口头结果保持一致。
保留接口返回的完整来源链接和素材链接，不改写、不截断、不自行拼接。来源链接为空时，展示返回的内容 ID，或说明当前没有可直接打开的完整链接。
对于 XHS `note_id`，要原样复制返回的完整 `note_id`；不要只传或只展示前缀。

## MCP 工具

与上面 direct CLI 命令对应的 MCP 工具：

- `xhs_get_note_detail_by_note_url`
- `douyin_get_video_detail_by_url`
- `kuaishou_get_video_detail_by_url`
- `weibo_get_post_detail_by_post_url`
- `x_get_post_detail_by_post_url`
- `bilibili_get_video_download_links`

## 安全边界

这是只读 skill，仅在本地执行用户要求的素材保存；使用已有 API Key 读取给定内容详情；本地保存仅写入用户指定目录，保存操作本身不要求 API Key。生成文件不含密钥，不读取浏览器登录数据，不发帖或操作社媒账号。

## 示例结果

示例：来源=<原始内容链接>；本地路径=<命令实际返回路径>；类型=视频；结果=已保存。下载失败时列出实际原因，不编造路径。

## 异常处理

- 凭证来源排查：先确认本次调用使用 CLI 还是 MCP。CLI 在实际执行环境中按「API Key 获取」的检查规则排查生效配置（主变量优先，兼容既有旧变量）；MCP 检查当前连接实际使用的鉴权配置，不要求另设本地 CLI 变量。配置缺失时沿用前面的客户端排查与兜底顺序；不要输出 Key、Authorization header 或秘密配置值。

- 如果出现 SDK/依赖缺失、npm 网络、Node.js/npm/npx 不可用或执行权限错误：这是本地运行环境、依赖安装、网络或 AI 平台授权问题，不是 SocialDataX API Key 或业务数据返回错误。仅在用户已授权的范围内安装或修复本任务所需依赖，优先使用项目目录或临时环境。环境执行权限不等于用户授权；超出授权范围时，先说明具体改动并征得同意，包括全局安装、运行时升级或系统配置变更。需要网络或执行授权时提醒用户同意或完成授权；处理后继续原命令；不要改用公开网页搜索替代 SocialDataX 数据。
- 本地 `download-media` 失败：不需要 API Key；保留错误信息，检查媒体直链、网络或代理、输出目录及写入权限。
- 在线详情或 Bilibili 下载链接调用失败：检查 `SOCIALDATAX_API_KEY`、参数和内容链接；非余额不足的网络或 API 异常可原样重试一次。
- 如果返回 `insufficient_balance` 或“积分不足”：不要重复重试；展示错误中的官方充值链接（https://socialdatax.com/dashboard/billing，可带渠道参数）；若没有该链接，使用 https://socialdatax.com/dashboard/billing。充值后继续刚才失败的调用；已有任务或部分结果时，按对应任务查询、分页续查规则恢复。
- 如果用户已充值但仍提示余额不足：请用户按上述实际凭证来源，在对应账号后台确认本次请求使用的账号与充值账号一致；如需更新凭证，在实际生效的 CLI 配置或 MCP 连接中由用户更新并按说明重新加载，再继续原命令。不要仅因本地新变量缺失就要求重新配置，也不要展示凭证明文。
- 重试仍失败：说明当前调用不可用，请用户补充或更换关键词、链接、ID 等输入后再重试。

## 常见问题

- 没结果：确认链接或 ID 完整；必要时先用内容研究类 skill 找到目标内容。
- 本地 `download-media` 失败：不需要 API Key，检查媒体直链、网络或代理及输出目录权限。在线详情或 Bilibili 下载链接调用才检查 `SOCIALDATAX_API_KEY`；积分不足时按上述官方充值链接说明处理后继续在线调用。
- 担心账号安全：这是只读能力，不登录、不发帖、不点赞、不评论。
如需继续保存，提供明确链接名单及输出目录，沿用已有来源清单。
