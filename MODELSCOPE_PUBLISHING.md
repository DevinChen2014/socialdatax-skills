# SocialDataX ModelScope Skills Publishing Record

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
