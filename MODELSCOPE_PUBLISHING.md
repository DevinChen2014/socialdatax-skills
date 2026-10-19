# SocialDataX ModelScope Skills Publishing Record

## 2026-10-19 分页恢复说明发布验收（0.2.54）

- 用户批准同步已合并的分页恢复说明。仅更新已有且非 retained 的条目；已提交 49 项，公开下载逐字节匹配 49 项。标题、市场身份、来源和运行命令保持不变。
- npm 主包与兼容包均为 0.2.54；433 项主包测试、7 项兼容包测试通过。公共 GitHub 运行源码提交 `b136eeb`，GitHub 专用 skills/catalog 保留渠道归因。无付费业务调用。
- 使用官方 upload + settings PATCH 更新 `socialhelper` 已有条目，保留 display_name、description、source_url、category、license。上传限流后暂停并降频；公开 archive 解压后核对唯一 SKILL.md。

| Slug | SKILL.md SHA-256 | Downloads | 文件验收 |
| --- | --- | --- | --- |
| bilibili-comment-insights | `8902af7a663d608f8bc15bd82b581fdd30024d88c828ad7c317c825dd7c72376` | 15 | 匹配 |
| bilibili-content-research | `ca4ef3235c6dbb364696e7428cf4af3c0f24a2db5beb5d447e08812fc2e53634` | 27 | 匹配 |
| douyin-account-analysis-report | `394ee97b3f94637148e7b312e70305bc6291cd788581192eb3c85a8c71cb0a3d` | 33 | 匹配 |
| douyin-comment-insights | `bef9d2e31f1ae4e673a6adae9f6c6e9a8d8fe8a359df4c5f3703305b42525208` | 33 | 匹配 |
| douyin-competitor-research | `3f10834840b19a49e1432339aabc81824d1441e205259eb10d088cfca541fd04` | 27 | 匹配 |
| douyin-content-research | `5135a130b620027607bda1e1270889f4006b41288fd269618dd5eefb71a2c8c5` | 26 | 匹配 |
| douyin-product-research | `c23846984907f51f23893999618b44757cf4ba751406eb22b7abe557bb55e135` | 1 | 匹配 |
| douyin-topic-analysis | `cd18990ebeae0fc3f47b766ba0771c845cb06448353a85926ceda82ad80c9742` | 33 | 匹配 |
| douyin-trend-insights | `c3ca9571d07aff673c7d9625ce4268ba9f6a51a064ac18e7d638d62256fb1d04` | 31 | 匹配 |
| ecommerce-detail-copywriter | `f84707c4ed67372ff009046566e5ff7cfd9cf624c795d98029445a6e9f4e9ded` | 1 | 匹配 |
| ecommerce-main-image-copywriter | `230ad9922db0c1e9077a16f11b56aee37c844c9ea40188b38af0b4d2e705656d` | 1 | 匹配 |
| ecommerce-product-research | `0886c6429bb78f0bc32e8c1565652cab1d918edb5ea7cf2dec2f37f81192e99f` | 4 | 匹配 |
| ecommerce-video-script | `91a743c5fefd4fd08abec155940f065c9af469d42c9915e1c3fad50832909a0e` | 1 | 匹配 |
| haokan-topic-analysis | `4d584437a670ca7776f92899842662508e077111477b7c42349e8688eb3acd9b` | 1 | 匹配 |
| instagram-comment-insights | `ce08e37ed1175314a034e60c60b9bdb39fb921f288d1798d602c1e362d806091` | 22 | 匹配 |
| instagram-content-research | `d290ac2a58d7983a2432a42d1ba741fc77d050f56753791709f6c7b6be867960` | 26 | 匹配 |
| kuaishou-comment-insights | `0800f3f748ff437e06d96398c60879e0c0ef554303bd7b0db0dfdc3da8f77736` | 23 | 匹配 |
| kuaishou-competitor-research | `562cadad8efcb4e051140a1b2e05da4cb300e1badd5d8150cb633c2a1f029b23` | 26 | 匹配 |
| kuaishou-content-research | `6ad8126c8c016595583841c270a6bba96777409f56c089f6c3c432c689a35470` | 26 | 匹配 |
| kuaishou-topic-analysis | `52e05ff5069eda952ddca41248e163019f50b48d874a561ca5fec08a05ab5c14` | 24 | 匹配 |
| kuaishou-trend-insights | `5e7df0f5f3a1ad6415f46718c4a9968cd33ee5b00e9e48ee8c9bc5d5a5ff2c91` | 22 | 匹配 |
| socialdatax-content-research-assistant | `a7a4e11a58b61103a0e6cb7f9ef08e249a0967b32867c48f45f62f73fb1e892e` | 310 | 匹配 |
| tieba-demand-insights | `9f183f826dee7f19836fc5ef8dcdefb8d93567ff81c94dcf38346116a278e691` | 1 | 匹配 |
| tiktok-comment-insights | `e3690e1df31199f0c2a957588df1f6f29705feef100528d8361d7ce01ed06ac6` | 26 | 匹配 |
| tiktok-content-research | `2843e48302876c1646db9428baaa8420f39b54569f5e2eb802640c073401b768` | 24 | 匹配 |
| toutiao-content-research | `c11a06271e14dc5f769da1dc35bedc78acfd7a2489fcf9e7efeae933b3871822` | 1 | 匹配 |
| wechat-channels-account-analysis | `508c136cefc43c9904e9ab2fe048c0dce7bbd214f89f48f26f86f668160e0e37` | 32 | 匹配 |
| wechat-channels-viral-video-breakdown | `51480c31365a5089e687bde722a2d914d7ad7df3823cbc1f49edf38ef5f1b95e` | 50 | 匹配 |
| weibo-comment-insights | `ba49243ffe2c830c0ab176ba4c42ad9333ad390f1b9133258e79f49e11669a86` | 13 | 匹配 |
| weibo-competitor-research | `84bb6cfcee142180d31f52ba061cb5f1c6b6a9d9194d37fb047ca839312c8ec5` | 21 | 匹配 |
| weibo-content-research | `aae28443bb1a05ed21118cd491b9f8e3747875cba8df65e48cb13ab0e29b4d0a` | 23 | 匹配 |
| weibo-topic-analysis | `dd56f266ee279e49e6b7b0cfbfa226153cbee5e6887e8a24bb148b04699c05e2` | 20 | 匹配 |
| weibo-trend-insights | `2ed9cc0188f7f33910913f13062800850eb5d14acae9d3bd2f1c0bd60c36d613` | 21 | 匹配 |
| x-twitter-comment-insights | `a7bada0dd5c6f53adddb54b8ad7089b589a29854e24abe62e34d4c08d4c1c0f3` | 21 | 匹配 |
| x-twitter-content-research | `3db7d990662e69c80a17679929e3f160356c0dd472030b1f81ffc8c44946e1bc` | 23 | 匹配 |
| xhs-comment-insights | `8b33e63d13cbdea6996a0f5070119e962e434e1f27321d2421088bededb69531` | 44 | 匹配 |
| xhs-competitor-research-v2 | `50aa2d6a625d36c8b481cfa318ce5c697a6acff117bf9e160e4aec2a7ddf1769` | 44 | 匹配 |
| xhs-content-research-assistant | `cc254a6d570dbd1d99b8495c31dab0529c9dd5006a7d5a3b4063ef6bd1372953` | 48 | 匹配 |
| xhs-content-research | `9474a0ba1e5066c5820d83420dec21d49626af7635f4ef4f23da3c91aa3619b1` | 52 | 匹配 |
| xhs-creator-content-research | `51c8435edfa62dbcf38b6ca6e7e36241641ca046935cb0d211d09dba12f1e16d` | 29 | 匹配 |
| xhs-hot-topic-selection | `87190ab272d67b3c1c62c5d3790e51e12b09e4d79592c80f26cc18a51e04ca3f` | 42 | 匹配 |
| xhs-topic-analysis-v2 | `578d1a47a0c8e010ff81e68e9200cce982107cd76e2e74b92b9433c5a0373ef3` | 44 | 匹配 |
| xhs-trend-insights-v2 | `b4071865df26ebea290878c1150111feceebe610af931d369819a75964aee569` | 43 | 匹配 |
| xhs-viral-copy-breakdown | `b22b90d60c62d6a7755c5ca405ca005001caa5df0d9681c0ec48c988c339ca66` | 46 | 匹配 |
| xhs-viral-note-research | `4af00bba861ce7d94d48d82fd62b9715afa0f03d5c0aa619d7739ef9f0809b35` | 37 | 匹配 |
| youtube-comment-insights | `781d6c3203d94472ea97d055b7728005a87ca417b6665cf4f1f3f7c6a2b1d1be` | 23 | 匹配 |
| youtube-content-research | `adcf8eb55303bd35ec458646b5b5e603d8adf0201ac4b3fb52838d0bf4c87464` | 22 | 匹配 |
| zhihu-comment-insights | `de3f92995fca206082aebfbac3cd90689111442145ecdd5185732271800d498e` | 15 | 匹配 |
| zhihu-content-research | `8111b6aa3463896d9351e43022b79a0efe4156afac687e395f65a0207a747221` | 25 | 匹配 |

下载计数包含发布验收读取，不能视为自然增长。

## 2026-10-19 选品快速开始条件补齐

- 官方 upload/settings PATCH 更新 socialhelper/ecommerce-product-research，HTTP 200、success=true。保留名称、描述、分类、来源和许可；公共 GitHub 来源提交 `e843b64`。
- 公开 archive 中 SKILL.md 与本地逐字节一致，SHA256 `1bcbfa80af58c8041fe6a7dc9191fd6946e523586ba5e5e8e59f32d2d521806f`。仅补齐资料/在线条件；商品对比内容无新增变化，不重复发布。

## 2026-10-19 通用选品与对比在线步骤条件澄清

- 官方upload/settings PATCH更新socialhelper下两项技能，响应success=true，公开详情可读。公共GitHub来源提交`08ca2b0`。
- 仅两段增加“需要在线查询时”的前提，已有资料直接分析；标题、描述、命令及可选依赖元数据保持不变。132项生成器测试、903项上架检查通过，无后端或npm发布。远端两份SKILL.md与本地逐字节一致。

| Slug | SKILL.md SHA256 |
| --- | --- |
| ecommerce-product-research | `c1f95a46f2f5b060ac8e3fd1487b2bb9fff279366c118f601a9c6d8259b30969` |
| ecommerce-product-comparison | `c6bce9b07b16ebcf4b68f52a1e370ddbd6920f3434c21d674dcbe51613ca0278` |

## 2026-10-19 通用选品与对比可选依赖修复

- 官方upload/settings PATCH更新socialhelper/ecommerce-product-research与socialhelper/ecommerce-product-comparison，保留原名称、描述、分类、来源和许可；两次响应success=true。公开详情可读，两份archive中的SKILL.md与本地逐字节一致。商品对比首次读取超时，单项重试成功。
- 公共GitHub来源提交`7ab6582`。仅复用apiOptional，资料分析不强制Key/Node/npm，在线查询仍需配置；没有新增接口或npm发布。132项生成器测试、903项上架检查通过。

| Slug | SKILL.md SHA256 |
| --- | --- |
| ecommerce-product-research | `906f71d454f1a23056f3e759f3297cc0470ffbade9c1bb5b852024372e2a53df` |
| ecommerce-product-comparison | `56da68bd6e53648d140dce504835d43cf4992e26d083e6b8ad7f40bf00be488e` |

## 2026-10-19 直播带货话术发布

- 官方upload/create API已创建socialhelper/ecommerce-live-sales-script，private=false，初始下载0；公开archive的SKILL.md与本地逐字节一致，SHA256 `b9cc9ee92115b40bce3882f0e5f4a7eea311380840416227d2570299398d7ba9`。公共GitHub来源提交b116336。
- 支持资料直接写作及按需商品详情，交付整场流程、逐品口播、互动与转场；不生成图片配音，不自动开播，不编造优惠或库存。132项生成器测试、903项上架检查与30分钟3商品场景复核通过。无新增runtime或npm版本，未调用真实商品接口。

## 2026-10-19 商品客服问答发布

- 通过官方upload/create API创建 `socialhelper/ecommerce-customer-service`，private=false，公共GitHub来源提交 `25d7c91`。公开详情可读，初始下载0；公开archive中的SKILL.md与本地逐字节一致，SHA256 `c66e5316f74ea30f9d5f1c3bf1406bad26fb541b25e242a54010b0290079024d`。
- 支持已有资料直接起草，或按需读取抖音/小红书商品详情；不查询订单物流、不自动发送或办理售后。沿用CLI 0.2.52和apiOptional元数据，没有新增runtime。
- 131项生成器测试、899项上架检查通过，场景复核覆盖缺失参数、配送承诺、处理进度和拒绝虚报发送。未调用生产接口，不将说明检查称为在线业务验收。

## 2026-10-19 电商文案三入口发布

- 用户批准接口增强版商品详情页文案、商品主图卖点文案、带货短视频脚本，支持链接读取和用户资料直接写作；仅用户要求时参考少量同类商品。沿用 CLI 0.2.52。
- 三项通过官方 upload/create API 创建，owner=socialhelper，private=false；公开详情与 archive 均可读，远端 SKILL.md 与本地逐字节一致，初始下载均为 0。公共 GitHub 来源提交 `19cdcb4`。
- 场景复核通过；131 项生成器测试、894 项上架检查通过。新三项 apiOptional 元数据不强制 Key/Node/npm，在线调用仍按正文配置依赖与来源归因。

| Slug | SKILL.md SHA256 |
| --- | --- |
| ecommerce-detail-copywriter | `dab95a21e4994a7137358ef8f7c9123b27f70c0ceab693da997ede46d11cb1ff` |
| ecommerce-main-image-copywriter | `94eacf4248723e3c8e921d8208825c282016206cd92078bc8726090de5fdfeaf` |
| ecommerce-video-script | `478e02085e5b8e1512fa8038c30bc9045412521cc9a13433e52ec4a787fde406` |

## 2026-10-19 电商四入口发布验收

- 四项使用现有 CLI 0.2.52 商品能力，公开来源 GitHub 提交 `401246f`。通过官方 upload + create API 发布，owner=socialhelper，private=false。第三项上传曾限流，等待后成功；没有重复创建。四项公开详情可读，下载 archive 中 SKILL.md 与本地逐字节一致，初始下载均为 0。
- 本地生成器测试 130 项通过，public-listing-check 882 PASS、0 WARN、0 FAIL。只新增选品/比较 × 通用/抖音四个入口，需求基线见 SkillHub 同日记录。

| Slug | SKILL.md SHA256 |
| --- | --- |
| ecommerce-product-research | `fccb1a381923d7a15aa00f402bd68f96e98135c6ef3022b8078307120b4158ff` |
| ecommerce-product-comparison | `458d8a1af4ad8d00138f6211977f0d2a807986a9b94645edd6fa526621f93be9` |
| douyin-product-research | `324b90dda48f1fa79ff604da85669eb9b4bcf224835595b92dce38772208006b` |
| douyin-product-comparison | `62d8901406cb3d5bf8af9d5694e211286c8f462f8e074a266ecd6c28509af134` |

## 2026-10-19 新平台独立需求入口

- 用户要求新增平台上架，并参考现有高下载需求。新增好看视频选题分析、贴吧用户需求洞察、今日头条内容研究，每个平台一个入口；需求证据和发布前基线见 SkillHub `PUBLISHING.md` 当日记录。
- 复用 CLI 0.2.52，无新增运行时能力或 npm 版本。完整包测试 425 项、最终生成器测试 129 项、public-listing-check 866 项通过。
- 使用官方文件 upload + POST `/openapi/v1/skills` 创建，必需名称字段为 `skill_name`（`name` 会返回 InputParameterError，未创建条目）。owner=socialhelper，category=marketing-seo，license=MIT License，private=false。三个公开详情可读，公开 archive 的 SKILL.md 与本地逐字节一致，初始下载数均为 0。
- 公共 GitHub 来源文件已提交推送：`489e441`，路径 `modelscope-skills/<slug>`。

| Slug | SKILL.md SHA256 |
| --- | --- |
| haokan-topic-analysis | `0f9ab3435cd7d6384535fe6423397b48cb856a796bf74401221bdaf119f6d441` |
| tieba-demand-insights | `c57ab43ea30604f3f950d73aa8bcf510f088baef7fbb5a4ab7461c4fc7e78d81` |
| toutiao-content-research | `08f43f1c6f60cb77427f3c4a60268b2b0dbcc8419023b7e81251fd4f75ac8358` |


## 2026-10-19 aggregate CLI documentation refresh

- Refreshed only `socialhelper/socialdatax-content-research-assistant` through the documented upload and settings API; preserved display name, source URL, category, and license.
- Updated the description and archive with Haokan and X creator-replies guidance. Downloaded the public archive after publishing: `SKILL.md` is 58,802 bytes, SHA256 `96574103368eb860de08cff20704f937f46c3130d94fc7b426df02ae03045865`, exactly matching local generated output.
- Preserved the 2026-10-12 release record from the public GitHub repository when synchronizing this source record.

## 2026-10-12 CLI 0.2.48 capability refresh

Updated only the two affected existing `socialhelper` entries through the documented
upload and settings API. Both public ZIP archives were downloaded again; their
`SKILL.md` SHA256 values match the generated source. Existing display names,
source links, categories, and licenses were preserved.

- `bilibili-comment-insights`: `ebe9faea7614014b76db7a517a5b9bf736569db3ebb65734a56750c348852566`.
- `socialdatax-content-research-assistant`: `b430f51287cf07af4f2577016a620ea4037aff09907355a5f93aab14aa4fce6b`.

This file records ModelScope Skills Center publishing and verification status for generated SocialDataX skill listings.

## Publishing Method

Target site: `https://modelscope.cn`

Owner: `socialhelper`

Official Skills Center flow:

1. Zip exactly one root-level `SKILL.md`.
2. Upload the zip with `POST /openapi/v1/files/upload`, form fields `file=@<zip>` and `type=skill`.
3. Create a new skill with `POST /openapi/v1/skills`, or refresh an existing skill with `PATCH /openapi/v1/skills/{owner}/{skill_name}/settings`.

Use `Authorization: Bearer $MODELSCOPE_API_KEY`. The local `~/.modelscope/credentials/session` file is not sufficient unless it is a valid ModelScope OpenAPI access token.

Example refresh shape:

```bash
curl -X POST "$MODELSCOPE_ENDPOINT/openapi/v1/files/upload" \
  -H "Authorization: Bearer $MODELSCOPE_API_KEY" \
  -F "file=@skill.zip" -F "type=skill"

curl -X PATCH "$MODELSCOPE_ENDPOINT/openapi/v1/skills/socialhelper/<slug>/settings" \
  -H "Authorization: Bearer $MODELSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"<中文展示名>","description":"<描述>","skill_file":"<upload.data.id>","source_url":"https://github.com/DevinChen2014/socialdatax-skills/tree/main/modelscope-skills/<slug>","category":"marketing-seo","license":"MIT License"}'
```

## 2026-09-18 aggregate skill refresh

Only `socialhelper/socialdatax-content-research-assistant` differed from the
current generated ModelScope output for this release. It was refreshed through
the authenticated upload plus settings PATCH flow while preserving its display
name, source URL, category, and license. The public archive now has a
49,839-byte `SKILL.md` with SHA256
`2b8c09311c95eaa511129f841cdc735f96ee122bc97ce294f11ec65575578b0d`,
matching `modelscope-skills/socialdatax-content-research-assistant/SKILL.md`.
All other ModelScope entries were outside this release's generated-file diff and
were not republished.

## 2026-08-25 focused content refresh

Goal: update only ModelScope Skills whose public archive no longer matched the current generated `SKILL.md`; do not recreate or refresh already-matching entries.

Result:

- Five existing `socialhelper/*` entries were refreshed through the authenticated file upload plus settings PATCH flow: `douyin-account-analysis-report`, `socialdatax-content-research-assistant`, `socialdatax-short-video-copy-extract`, `wechat-channels-account-analysis`, and `wechat-channels-viral-video-breakdown`.
- Public archive verification after refresh matched the repo-tracked files for all five entries:

| Slug | Remote/local `SKILL.md` SHA256 |
| --- | --- |
| `douyin-account-analysis-report` | `fa6cff3340f6cf810d9b235d4db761020e4faaf7cb945f4f3e7f01826eade66f` |
| `socialdatax-content-research-assistant` | `4f72595aaa6c48c4834b8c494e5db61988ba17b9de1ded31e568b269c9f3396b` |
| `socialdatax-short-video-copy-extract` | `6be99ac54723a5ef3c7d3011bfe75c6a7de8e35e57de12a9d334c5dbc9c9666a` |
| `wechat-channels-account-analysis` | `1f2a1bafbe1e4b11bdb8513a2704a22ff35fe2ecd9b407b602dc975db7a01899` |
| `wechat-channels-viral-video-breakdown` | `7dd46d67c22bc924d22282503d3a36934b727c836e17629948ad14ba00fb8649` |

- The remaining ModelScope entries were left untouched because their public archive already matched local output.

## 2026-08-13 full ModelScope expansion

Goal: publish the ability-backed “other platform” SocialDataX skills to ModelScope after the SkillHub/ClawHub growth experiments, while keeping SkillHub-only wording restrictions isolated to SkillHub.

Decision:

- ModelScope entries can use direct Chinese platform names such as `小红书`, `抖音`, `快手`, `微博`, `视频号`, and `公众号`; the SkillHub active-title restriction for `小红书` / `小红薯` does not apply here.
- Keep ModelScope focused on SocialDataX-supported, ability-backed workflows. Do not mirror the prompt-only SkillHub `viral-hook-title-generator` entry in this batch.
- Do not mirror prompt-only SkillHub experiments or old failed SkillHub-only samples by default. This batch is ability-backed and ModelScope-specific; it may reuse a SkillHub source slug for content consistency even when the SkillHub entry is later retained-only under SkillHub-specific publishing policy. The local source now contains 46 ModelScope entries: the earlier focused XHS/Douyin group plus the cross-platform ability-backed expansion.

Publish result on 2026-08-13 CST:

- Authenticated ModelScope OpenAPI user: `socialhelper`.
- Generated local output: 46 `modelscope-skills/<slug>/SKILL.md` files and 46 `agents/openai.yaml` metadata files.
- Publish operations: 46/46 succeeded through `POST /openapi/v1/files/upload` plus `POST /openapi/v1/skills` for new entries or `PATCH /openapi/v1/skills/socialhelper/<slug>/settings` for existing entries.
- API action split: 34 batch creates and 12 refreshes. `xhs-creator-profile-insights` was first created as the one-skill create-payload probe, then refreshed in the batch; `socialdatax-content-research-assistant` already existed remotely and was refreshed.
- The two TikTok uploads needed retry attempts during the batch, then both completed successfully. No publish operation failed.
- Public archive verification downloaded `https://www.modelscope.cn/skills/socialhelper/<slug>/archive/zip/master` for every slug; 46/46 remote `SKILL.md` SHA256 values matched the local generated files.

New or newly synchronized ModelScope expansion slugs:

- `xhs-creator-profile-insights`
- `xhs-creator-content-research`
- `socialdatax-content-research-assistant`
- `socialdatax-short-video-copy-extract`
- `socialdatax-sensitive-check`
- `douyin-content-research`
- `douyin-topic-analysis`
- `douyin-trend-insights`
- `douyin-competitor-research`
- `douyin-comment-insights`
- `douyin-account-analysis-report`
- `kuaishou-content-research`
- `kuaishou-topic-analysis`
- `kuaishou-trend-insights`
- `kuaishou-competitor-research`
- `kuaishou-comment-insights`
- `weibo-content-research`
- `weibo-topic-analysis`
- `weibo-trend-insights`
- `weibo-competitor-research`
- `weibo-comment-insights`
- `wechat-channels-viral-video-breakdown`
- `wechat-channels-account-analysis`
- `wechat-mp-article-extract`
- `bilibili-content-research`
- `bilibili-comment-insights`
- `zhihu-content-research`
- `zhihu-comment-insights`
- `instagram-content-research`
- `instagram-comment-insights`
- `x-twitter-content-research`
- `x-twitter-comment-insights`
- `youtube-content-research`
- `youtube-comment-insights`
- `tiktok-content-research`
- `tiktok-comment-insights`

## 2026-08-13 Skills Center verification

Goal: answer whether the “other platform” ModelScope Skills entries still need to be published after the SkillHub and ClawHub growth work.

Conclusion:

- All 10 generated ModelScope skill entries already exist under `socialhelper/*`.
- Public title and description fields match the current local frontmatter descriptions.
- Installed remote `SKILL.md` files were older than the current generated local files for all 10 entries, so the useful action was a focused refresh, not first-time publishing.
- The local `~/.modelscope/credentials/session` token returned `401 InvalidAuthentication`, but `MODELSCOPE_API_KEY` from interactive zsh authenticated as `socialhelper`.
- All 10 existing ModelScope skill entries were refreshed through `POST /openapi/v1/files/upload` plus `PATCH /openapi/v1/skills/socialhelper/<slug>/settings`.
- ModelScope returned `429 Too Many Requests` during the first batch; the remaining entries were completed with a slower retry cadence.
- Post-refresh verification installed all 10 public skills into a temporary HOME and confirmed each remote `SKILL.md` SHA256 matches the current local generated file.
- Do not mirror the prompt-only SkillHub title-generator entry to ModelScope by default. ModelScope should stay focused on ability-backed SocialDataX workflows unless there is an explicit experiment approval.

Remote public metrics snapshot:

| Slug | Display name | Downloads | Views | Last modified |
| --- | --- | ---: | ---: | --- |
| `douyin-video-copy-extract` | `抖音文案提取` | 19 | 60 | `2026-07-17T11:35:33Z` |
| `xhs-comment-insights` | `小红书评论分析与需求挖掘` | 11 | 36 | `2026-07-17T11:35:38Z` |
| `xhs-competitor-research-v2` | `小红书竞品研究` | 21 | 59 | `2026-07-07T02:48:47Z` |
| `xhs-content-research` | `小红书内容研究` | 21 | 96 | `2026-07-07T02:42:41Z` |
| `xhs-content-research-assistant` | `小红书内容研究助手` | 22 | 65 | `2026-07-07T02:49:22Z` |
| `xhs-hot-topic-selection` | `小红书热榜选题分析` | 10 | 29 | `2026-07-17T11:37:42Z` |
| `xhs-topic-analysis-v2` | `小红书选题分析` | 22 | 54 | `2026-07-07T02:47:58Z` |
| `xhs-trend-insights-v2` | `小红书趋势洞察` | 22 | 63 | `2026-07-07T02:46:45Z` |
| `xhs-viral-copy-breakdown` | `小红书爆款文案拆解` | 10 | 34 | `2026-07-17T11:39:11Z` |
| `xhs-viral-note-research` | `小红书爆款笔记研究` | 9 | 26 | `2026-07-17T11:39:41Z` |

Post-refresh remote file parity snapshot:

| Slug | Remote `SKILL.md` SHA256 | Local `SKILL.md` SHA256 | Match |
| --- | --- | --- | --- |
| `douyin-video-copy-extract` | `b1d964a4051e2db2d3df8151efd6e6d43045cae29b375bbdf052c872d1f3ba23` | `b1d964a4051e2db2d3df8151efd6e6d43045cae29b375bbdf052c872d1f3ba23` | yes |
| `xhs-comment-insights` | `5637a12895ef094df25beb8b75bad984a322ef4fa5186b70ab4ac03bb44e52b1` | `5637a12895ef094df25beb8b75bad984a322ef4fa5186b70ab4ac03bb44e52b1` | yes |
| `xhs-competitor-research-v2` | `3993d125aff3614d220ba841afb9471643c1f7f70af2ed80b45698f2d39ae604` | `3993d125aff3614d220ba841afb9471643c1f7f70af2ed80b45698f2d39ae604` | yes |
| `xhs-content-research` | `92f1bc8d4b715141250daeb55082ed5e52bfb9ec53ed28451a31a462844460e7` | `92f1bc8d4b715141250daeb55082ed5e52bfb9ec53ed28451a31a462844460e7` | yes |
| `xhs-content-research-assistant` | `8a24c9b3d07e73486b2c5e7b993d12d953a9b4afd3897fe7f3fb1ed3b1caaf4c` | `8a24c9b3d07e73486b2c5e7b993d12d953a9b4afd3897fe7f3fb1ed3b1caaf4c` | yes |
| `xhs-hot-topic-selection` | `b5f4c51af55291663efae4fb2456e63ccf20ac6ebdeda45907ce35fe71d3cf18` | `b5f4c51af55291663efae4fb2456e63ccf20ac6ebdeda45907ce35fe71d3cf18` | yes |
| `xhs-topic-analysis-v2` | `b5fc7c69f44d57a50fa4f0bd22497e369ebafe2d80b16f463b06fec670ace9fc` | `b5fc7c69f44d57a50fa4f0bd22497e369ebafe2d80b16f463b06fec670ace9fc` | yes |
| `xhs-trend-insights-v2` | `80cf409212e6665d1e0bd06cec04f15500a71b67dde37ff7f77ec459d189fe18` | `80cf409212e6665d1e0bd06cec04f15500a71b67dde37ff7f77ec459d189fe18` | yes |
| `xhs-viral-copy-breakdown` | `b48dbd74b0f29268dcd53b2b98297cd647a712a72534187826717858f63c7ec7` | `b48dbd74b0f29268dcd53b2b98297cd647a712a72534187826717858f63c7ec7` | yes |
| `xhs-viral-note-research` | `397bcbfa7b9a3ba72b1d4dd082727ce8a42a8316772fa95eaddc49a2ea5bac78` | `397bcbfa7b9a3ba72b1d4dd082727ce8a42a8316772fa95eaddc49a2ea5bac78` | yes |
