# SocialDataX ModelScope Skills Publishing Record

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
