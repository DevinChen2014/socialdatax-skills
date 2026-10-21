# Skills Package Submission Checklist

Use this checklist before syncing this listing to the public `socialdatax-skills` repository or publishing the unified npm skill installer package. Do not submit this package as a unified MCP registry entry unless a real aggregate MCP endpoint exists.

- npm latest: `socialdatax-skills@0.2.57`, published and verified on `2026-10-21`.
- Legacy npm wrapper: `social-media-insights-skills@0.2.57`, published and verified on `2026-10-21`; its registry dependency and installed `doctor --json` both resolve to `socialdatax-skills@0.2.57`.

## 2026-10-21 XHS share information CLI release

- Released both packages at `0.2.57`. Added `xhs share-info --share-text` for a note share short link or complete share text. Updated `xhs resolve-user-id` guidance: user information and posts accept the existing ID or profile URL directly, without a separate conversion call.
- Commands: `node scripts/publish_socialdatax_skills.mjs`, then `SOCIALDATAX_NPM_VIEW_ATTEMPTS=12 SOCIALDATAX_NPM_VIEW_RETRY_MS=30000 node scripts/publish_social_media_insights_skills.mjs` after the primary registry propagation exceeded the paired wait. All checks enabled: 439 primary tests and 7 wrapper tests passed; `make public-listing-check ENV=local` passed 912 checks with no warnings or failures. CLI contracts match 110 registered tools.
- At `2026-10-21T04:16:29Z`, both public npm latest tags resolved to `0.2.57`. A fresh registry installation matched all 29 primary-package files byte for byte, and the primary tarball integrity matched the local release pack. Both installed CLIs passed doctor, share-info help, resolver guidance, empty-input validation and missing-key checks; the wrapper pins the exact primary dependency. CLI SHA-256: `dd45aaf28b47995021c8e7f42ff8fb16f84453b65424bfc37f9e2ebbb5dd1f3d`.
- Hosted XHS tool metadata matched both CLI contracts before publication. No paid business calls were made.

- GitHub CLI source synchronized to `0.2.57`; standalone public-package smoke passed 1/1 and pack dry-run contained 33 files. Doctor, command help, empty-input and missing-key checks passed. The ten GitHub-attributed skills, catalog, ModelScope source files and standalone test-runner layout were preserved.

## 2026-10-20 dependency repair authorization guidance release

- Released both packages at `0.2.56`. Existing skills now distinguish execution permissions from user authorization, limit repairs to task dependencies, prefer project-local or temporary environments, and require consent for changes outside existing authorization. CLI behavior, command syntax, attribution, and dependency version strategy are unchanged apart from release version metadata.
- Commands: `node scripts/publish_socialdatax_skills.mjs`, then `node scripts/publish_social_media_insights_skills.mjs` after primary registry propagation exceeded the paired wait. All checks enabled: 437 primary tests and 7 wrapper tests passed; public-listing checks passed 912 with no warnings or failures. The initial release preflight caught one stale README-version assertion; it was corrected before publication.
- At `2026-10-20T08:17:41.499Z`, a fresh registry installation matched all 29 primary-package files byte for byte. Both doctor reports resolve to `0.2.56`, and the wrapper pins the exact primary registry dependency. CLI SHA-256: `ab90e508f5e9e7ddf408f494fa6aa89252325dddcd50cf67d1a0c230adfb90c6`.
- Public GitHub source: `d673480`; its standalone package smoke passed 1/1, and the public GitHub-attributed media-search file matched the generated source. Marketplace synchronization is tracked separately in each channel's publishing record. No paid business calls were made.

## 2026-10-20 pinned-date pagination release

- Released both packages at `0.2.55`. Old pinned creator posts remain excluded by the date filter but no longer stop `--since-days` pagination. Ordinary old posts retain the existing cutoff behavior.
- Command: `node scripts/publish_socialdatax_skills.mjs`, then `node scripts/publish_social_media_insights_skills.mjs` after the primary registry propagation exceeded the paired wait. All checks enabled: 437 primary tests, 7 wrapper tests, 909 listing checks; fresh installation matches all 29 primary files, and 4 installed-CLI pinned-date regressions pass.
- Both doctor reports and the wrapper's exact registry dependency resolve to `0.2.55`. CLI SHA-256: `0a7a23021b4377b8c9c6bf6c5e60faf63fa870f5555251c66ea48f366bc0ca25`.
- Public GitHub runtime source: `e36ad5f`; standalone public-package test passed. Refreshed the existing creator-research entry on SkillHub, ClawHub, and ModelScope; all public files match generated source. No paid business calls.

## 2026-10-19 pagination recovery guidance release

- Published both npm packages at `0.2.54`. Skills and README preserve retained partial results, original page/item limits, and separate parent-comment and reply continuation tokens. Runtime changes are limited to the version and the `doctor` inventory entry for the already-public `xhs_get_share_info` tool; no new CLI action or pagination behavior.
- Full release preflight exposed two missed checks: the comment documentation test still expected the old empty-token wording, and `doctor` omitted `xhs_get_share_info` from the server-card inventory. Updated the stale assertion and remaining README sentence, and restored the missing inventory entry. All 433 primary-package tests and 7 wrapper tests then passed.
- Commands: `node scripts/publish_socialdatax_skills.mjs`, followed by `node scripts/publish_social_media_insights_skills.mjs` after primary registry propagation. No checks skipped. Fresh registry installation confirmed all 29 primary-package files match the local release byte for byte; primary and wrapper `doctor --json` report `0.2.54`, and the wrapper pins the exact dependency.
- Public GitHub source: `b136eeb`; GitHub skills and catalog retain GitHub source attribution. Standalone public-package test passed. No paid business calls were made.

## 2026-10-19 pagination partial-result release

- Published both npm packages at `0.2.53`. Later-page and nested-reply failures retain completed results with `partial: true`, while keeping exit status 1 and existing stderr errors. First-request failures and successful response shapes remain unchanged. Repeated continuation tokens are cleared.
- Commands: `node scripts/publish_socialdatax_skills.mjs`, then `node scripts/publish_social_media_insights_skills.mjs` after the primary version propagated beyond the paired script wait. Preflight passed 433 primary-package tests and 7 wrapper tests; no checks skipped.
- Fresh registry install of both versions succeeded. All 29 installed primary-package files match local release files byte for byte. Both direct and legacy-wrapper `doctor --json` report 0.2.53; wrapper lock resolves the exact registry dependency. CLI SHA256: `df57ff7833dc16163b396cf889ba8cb3c643608de8db386708b887dbf1cf9e04`.
- Public GitHub source commit: `e843b64`. No paid business calls were made for this release.

## 2026-10-19 skill documentation release

- Published both npm packages at `0.2.52`. Updated existing skills with Haokan and X creator-replies routing; runtime changes are limited to the version constant.
- Fixed the obsolete test that prohibited every hot-search mention in media-search; Haokan hot-search is now explicitly covered while existing platform restrictions remain.
- Publish dry-run passed 424 primary-package tests and 7 wrapper tests. The primary registry integrity matches the local release pack. A fresh install of both packages succeeded; all six affected installed skills match local files byte for byte, and wrapper doctor reports `0.2.52`.
- Commands: `node scripts/publish_socialdatax_skills.mjs --dry-run`, then `node scripts/publish_socialdatax_skills.mjs --skip-checks`. The primary publication succeeded but registry propagation exceeded the paired script wait; after verifying the primary version, completed the wrapper with `node scripts/publish_social_media_insights_skills.mjs --skip-checks`.
- No paid business calls were repeated for this documentation release.

## Public Repository

- Repository name: `socialdatax-skills`
- Project URL: `https://socialdatax.com`
- Public repository: <https://github.com/DevinChen2014/socialdatax-skills>
- Repository description: `SocialDataX skills for social content research, comments, creator profiles, transcripts, local media download, and sensitive text checks across supported hosted MCP services.`
- Current repository topics: `agentskills`, `skills`, `social-media`, `social-insights`, `xiaohongshu`, `xhs`, `rednote`, `douyin`, `kuaishou`, `kwai`, `bilibili`, `weibo`, `wechat`, `wechat-official-account`, `mp-weixin`, `zhihu`, `instagram`, `twitter`, `youtube`, `tiktok`
- Optional expansion topics: `marketing-research`, `comment-analysis`, `media-search`, `speech-to-text`, `transcript`, `xiaohongshu-data`, `xhs-data`, `rednote-data`, `douyin-data`, `kuaishou-data`, `kwai-data`, `bilibili-data`, `weibo-data`, `wechat-channels`, `sensitive-words`
- Root README title: `SocialDataX Skills | 社媒数据助手 Skills`
- Product name: `SocialDataX` / `社媒数据助手`
- Website: `https://socialdatax.com`
- XHS hosted MCP endpoint: `https://mcp.socialdatax.com/xhs/mcp`
- Douyin hosted MCP endpoint: `https://mcp.socialdatax.com/douyin/mcp`
- Kuaishou hosted MCP endpoint: `https://mcp.socialdatax.com/kuaishou/mcp`
- Bilibili hosted MCP endpoint: `https://mcp.socialdatax.com/bilibili/mcp`
- Weibo hosted MCP endpoint: `https://mcp.socialdatax.com/weibo/mcp`
- Toutiao / 今日头条 hosted MCP endpoint: `https://mcp.socialdatax.com/toutiao/mcp`
- WeChat Content / 微信内容 hosted MCP endpoint: `https://mcp.socialdatax.com/wechat/mcp`
- Zhihu / 知乎 hosted MCP endpoint: `https://mcp.socialdatax.com/zhihu/mcp`
- Instagram hosted MCP endpoint: `https://mcp.socialdatax.com/instagram/mcp`
- X / Twitter hosted MCP endpoint: `https://mcp.socialdatax.com/x/mcp`
- YouTube hosted MCP endpoint: `https://mcp.socialdatax.com/youtube/mcp`
- TikTok hosted MCP endpoint: `https://mcp.socialdatax.com/tiktok/mcp`
- Haokan hosted MCP endpoint: `https://mcp.socialdatax.com/haokan/mcp`
- Sensitive Words Check hosted MCP endpoint: `https://mcp.socialdatax.com/sensitive-check/mcp`
- Hosted auth: `Authorization: Bearer <SOCIALDATAX_API_KEY>`
- Repo-tracked platform MCP listings: `com.52choujiang/xhs-insights`, `com.52choujiang/douyin-insights`, `com.52choujiang/kuaishou-insights`, `com.52choujiang/bilibili-insights`, `com.52choujiang/weibo-insights`, `com.52choujiang/wechat-channels-insights`, `com.52choujiang/zhihu-insights`, `com.52choujiang/instagram-insights`, `com.52choujiang/x-insights`, `com.52choujiang/youtube-insights`, `com.52choujiang/tiktok-insights`, and `com.socialdatax/haokan`.
- Repo-tracked future SocialDataX namespace draft files exist for XHS and Douyin: `com.socialdatax/xhs-insights` and `com.socialdatax/douyin-insights`.
- Reserved future SocialDataX namespace names for existing platform listings without draft files yet: `com.socialdatax/kuaishou-insights`, `com.socialdatax/bilibili-insights`, `com.socialdatax/weibo-insights`, `com.socialdatax/wechat-channels-insights`, `com.socialdatax/zhihu-insights`, `com.socialdatax/instagram-insights`, `com.socialdatax/x-insights`, `com.socialdatax/youtube-insights`, and `com.socialdatax/tiktok-insights`.
- Hosted endpoints without a repo-tracked standalone listing: Toutiao / 今日头条 and Sensitive Words Check.
- Unified MCP registry name: none
- Direct CLI startup: `npx -y socialdatax-skills@latest xhs search --keyword "露营" --pretty`
- Runtime env: `SOCIALDATAX_API_KEY=<SOCIALDATAX_API_KEY>`
- Node.js runtime: recommend Node.js 22 LTS or newer; minimum Node.js 20.18.1; Node.js 18 and older are not supported.
- Shared skill install:
  - List: `npx -y socialdatax-skills@latest list`
  - Safety summary: `npx -y socialdatax-skills@latest doctor`
  - Safety summary JSON: `npx -y socialdatax-skills@latest doctor --json`
  - OpenClaw dry run: `npx -y socialdatax-skills@latest install --target openclaw --dry-run`
  - All OpenClaw skills: `npx -y socialdatax-skills@latest install --target openclaw`
  - OpenClaw aggregate research skill: `npx -y socialdatax-skills@latest install socialdatax-content-research-assistant --target openclaw`
  - OpenClaw search skill: `npx -y socialdatax-skills@latest install media-search --target openclaw`
  - OpenClaw transcript skill: `npx -y socialdatax-skills@latest install media-transcript --target openclaw`
  - Hermes Agent user-info skill: `npx -y socialdatax-skills@latest install media-user-info --target hermes`
  - Codex comments skill: `npx -y socialdatax-skills@latest install media-comments --target codex`
  - Claude Code detail skill: `npx -y socialdatax-skills@latest install media-detail --target claude-code`
  - Shared AgentSkills creator posts skill: `npx -y socialdatax-skills@latest install media-user-posts --target agents`
  - Direct XHS search: `npx -y socialdatax-skills@latest xhs search --keyword "露营" --pretty`
  - Direct XHS search hot list: `npx -y socialdatax-skills@latest xhs hot-search --pretty`
  - Direct Douyin hot search: `npx -y socialdatax-skills@latest douyin hot-search --pretty`
  - Direct Douyin search: `npx -y socialdatax-skills@latest douyin search --keyword "露营" --pretty`
  - Direct Douyin replies: `npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty`
  - Direct Douyin creator series: `npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty`
  - Direct Kuaishou search: `npx -y socialdatax-skills@latest kuaishou search --keyword "露营" --pretty`
  - Direct Kuaishou replies: `npx -y socialdatax-skills@latest kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty`
  - Direct Bilibili video search: `npx -y socialdatax-skills@latest bilibili search-videos --keyword "露营" --pretty`
  - Direct Bilibili article search: `npx -y socialdatax-skills@latest bilibili search-articles --keyword "露营" --pretty`
  - Direct Weibo hot search: `npx -y socialdatax-skills@latest weibo hot-search --pretty`
  - Direct Weibo search: `npx -y socialdatax-skills@latest weibo search --keyword "露营" --pretty`
  - Direct Weibo detail: `npx -y socialdatax-skills@latest weibo detail --post-id "<post_id>" --pretty`
  - Direct WeChat Channels hot search: `npx -y socialdatax-skills@latest wechat hot-search --pretty`
  - Direct WeChat Channels search: `npx -y socialdatax-skills@latest wechat search --keyword "露营" --pretty`
  - Direct WeChat Channels detail: `npx -y socialdatax-skills@latest wechat detail --encrypted-object-id "<encrypted_object_id>" --pretty`
  - Direct WeChat Official Account article detail: `npx -y socialdatax-skills@latest wechat article --url "<mp_article_url_or_share_text>" --pretty`
  - Direct WeChat Official Account article statistics: `npx -y socialdatax-skills@latest wechat article-stats --url "<mp_article_url_or_share_text>" --pretty`
  - Direct Zhihu search: `npx -y socialdatax-skills@latest zhihu search --keyword "露营" --pretty`
  - Direct Instagram search: `npx -y socialdatax-skills@latest instagram search --keyword "camping" --pretty`
  - Direct X / Twitter search: `npx -y socialdatax-skills@latest x search --keyword "camping" --pretty`
  - Direct YouTube search: `npx -y socialdatax-skills@latest youtube search --keyword "camping" --pretty`
  - Direct YouTube replies: `npx -y socialdatax-skills@latest youtube replies --reply-token "<reply_token>" --pretty`
  - Direct TikTok search: `npx -y socialdatax-skills@latest tiktok search --keyword "camping" --pretty`
  - Direct sensitive text check: `npx -y socialdatax-skills@latest sensitive-check text --text "<content>" --platform xhs --pretty`
- OpenClaw default skill directory: `~/.openclaw/workspace/skills`, overridable with `OPENCLAW_SKILLS_DIR`
- License: MIT for the public CLI wrapper, documentation, and skill files only

## Safety Checks

- No real API keys are present.
- No private backend implementation is included.
- No production configuration is included.
- No internal samples are included.
- No account data or credentials are included.
- No generated build output is included.
- The installer does not store API keys and does not write MCP client configuration.
- `doctor` and `install --dry-run` do not require an API key and do not call the hosted endpoint.
- Public text uses neutral product wording.
- Public CLI only calls hosted platform services and does not expose internal business code.
- Platform names are used descriptively only; README includes a non-affiliation disclaimer.
- MCP client configuration is documented in the platform MCP listing, not generated by this skills package.

## Required Files

- `README.md`
- `CATALOG.md`
- `LICENSE`
- `package.json`
- `package-lock.json`
- `cli.mjs`
- `Dockerfile`
- `skills/socialdatax-content-research-assistant/SKILL.md`
- `skills/media-search/SKILL.md`
- `skills/media-detail/SKILL.md`
- `skills/media-comments/SKILL.md`
- `skills/media-transcript/SKILL.md`
- `skills/media-user-info/SKILL.md`
- `skills/media-user-posts/SKILL.md`
- `skills/*/agents/openai.yaml`
- `assets/logo.png`

## Agent Skill Directory Checks

- MCP.Directory skill source URL: `https://github.com/DevinChen2014/socialdatax-skills/tree/main/skills/socialdatax-content-research-assistant`
- MCP.Directory title: `SocialDataX 小红书 XHS 抖音 Douyin 快手 Kuaishou Bilibili 微博 Weibo 微信内容 WeChat Content Zhihu Instagram X / Twitter YouTube TikTok Content Research`
- MCP.Directory description: `Research Xiaohongshu / XHS / RedNote, Douyin, Kuaishou / Kwai, Bilibili, Weibo, WeChat Channels, Zhihu, Instagram, X / Twitter, YouTube, and TikTok content with SocialDataX: keyword discovery, details, comments, replies, creator profiles, creator content lists, transcripts where supported, and trend insights through agent commands. Also read WeChat Official Account article details and statistics from article links.`
- MCP.Directory category suggestion: `Research`
- Smithery skill namespace/slug suggestion: `DevinChen2014/socialdatax-content-research-assistant`
- Smithery `gitUrl`: `https://github.com/DevinChen2014/socialdatax-skills`
- Do not submit `socialdatax-skills` as a unified MCP server; submit only the Agent Skill directory or GitHub-backed skill metadata where a platform explicitly supports skills.

## NPM Checks

- `npm view socialdatax-skills version` does not point to another publisher before first publish.
- `npm pack --dry-run --json` includes `cli.mjs`, `README.md`, `CATALOG.md`, and `skills/**`.
- `npm pack --dry-run --json` does not include `server-card.json`; platform listings own MCP registry server cards.
- The package does not include `node_modules`, private backend code, real API keys, production configuration, or internal samples.
- From the private source repository, `node scripts/publish_socialdatax_skills.mjs --dry-run` succeeds with an npm granular access token that has publish permission and two-factor bypass enabled.
- `--dry-run` skips the legacy wrapper's registry dependency check and lock refresh. Candidate lock integrity must match the current local primary package; after the primary package is published, the real publish script refreshes the wrapper lock from npm. Review and retain that lock update after publishing.
- From the private source repository, `node scripts/publish_socialdatax_skills.mjs` publishes `socialdatax-skills` first, then the legacy `social-media-insights-skills` wrapper, with a temporary npm config outside the repository that is removed after publishing.
- `node cli.mjs list` lists each available capability skill.
- `node cli.mjs doctor` prints package source, runtime, endpoint, and account-action safety summary.
- `node cli.mjs doctor --json` prints parseable JSON and does not include real API keys.
- `node cli.mjs` prints help instead of silently running a local MCP server.
- `node cli.mjs --help` documents direct `xhs`, `douyin`, `kuaishou`, `bilibili`, `weibo`, `wechat`, `zhihu`, `instagram`, `x`, `youtube`, `tiktok`, and `sensitive-check` commands, multi-skill install, OpenClaw, Hermes Agent, Codex, Claude Code, and shared AgentSkills commands.
- `node cli.mjs xhs search --keyword "露营" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs xhs hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs xhs detail --note-id a --url b` fails with the one-input validation error.
- `node cli.mjs douyin hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs douyin search --keyword "露营" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs douyin detail --aweme-id a --url b` fails with the one-input validation error.
- `node cli.mjs douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs douyin user-series --sec-user-id "<sec_user_id>" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs kuaishou search --keyword "露营" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs kuaishou detail --photo-id a --url b` fails with the one-input validation error.
- `node cli.mjs kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs weibo hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs weibo search --keyword "露营" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs weibo detail --post-id a --post-url b` fails with the one-input validation error.
- `node cli.mjs wechat hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs wechat search --keyword "露营" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs wechat detail --encrypted-object-id a --url b` fails with the one-input validation error.
- With a valid key, `node cli.mjs xhs search --keyword "露营" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs xhs hot-search --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs douyin search --keyword "露营" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs kuaishou search --keyword "露营" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs weibo search --keyword "露营" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs wechat search --keyword "露营" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- `node cli.mjs xhs search --keyword "露营"` prints a clear Node.js version error on runtimes older than 20.18.1.
- `node cli.mjs install media-search --target openclaw --path <temp-dir>` installs a valid `SKILL.md` skill.
- `node cli.mjs install media-search --target openclaw --path <temp-dir> --dry-run` previews the destination and does not create the directory.
- `node cli.mjs install --target openclaw --path <temp-parent-dir> --dry-run` previews all bundled skills and does not create the parent directory.
- `node cli.mjs install --target openclaw --path <temp-parent-dir>` installs all bundled skills.
- `node cli.mjs --platform xhs` fails with a migration message that points users to platform MCP listings and `mcp-remote` fallback.
- `node cli.mjs print-config --platform xhs` fails with the same migration message.
- Aily is treated as an OpenClaw / AgentSkills ecosystem channel for now; do not document a dedicated `--target aily` until its official import or package format is confirmed.

## Docker Checks

- `Dockerfile` builds successfully.
- `docker run <image> list` lists the bundled skills.
- `docker run -v <host-temp-dir>:/out <image> install media-search --target openclaw --path /out/media-search --force` installs one skill into a mounted output directory.

## Hosted MCP Checks

- XHS platform listing remains in `public-listings/xhs-insights`.
- XHS platform server card remains `com.52choujiang/xhs-insights`; `com.socialdatax/xhs-insights` is kept only as a future namespace draft while the public endpoint remains on `mcp.socialdatax.com`.
- Douyin current platform listing remains in `public-listings/douyin-insights`.
- Douyin server metadata is publicly listed as `com.52choujiang/douyin-insights`; future `com.socialdatax/douyin-insights` metadata remains a draft until the endpoint namespace changes.
- Kuaishou current platform listing remains in `public-listings/kuaishou-insights`.
- Kuaishou server metadata is publicly listed as `com.52choujiang/kuaishou-insights`; `com.socialdatax/kuaishou-insights` is only a reserved future namespace name until a repo-tracked draft file is created.
- Weibo current platform listing remains in `public-listings/weibo-insights`.
- Weibo server metadata is publicly listed as `com.52choujiang/weibo-insights`; `com.socialdatax/weibo-insights` is only a reserved future namespace name until a repo-tracked draft file is created.
- WeChat Content current platform listing remains in `public-listings/wechat-channels-insights`.
- WeChat Content server metadata is publicly listed as `com.52choujiang/wechat-channels-insights`; `com.socialdatax/wechat-channels-insights` is only a reserved future namespace name until a repo-tracked draft file is created.
- Instagram current platform listing remains in `public-listings/instagram-insights`.
- Instagram server metadata is publicly listed as `com.52choujiang/instagram-insights`; `com.socialdatax/instagram-insights` is only a reserved future namespace name until a repo-tracked draft file is created.
- Bilibili, Zhihu, X / Twitter, YouTube, and TikTok have repo-tracked standalone listing directories and published `com.52choujiang/*` Registry entries; their `com.socialdatax/*` names remain reserved future namespaces without draft files.
- Sensitive Words Check is supported by the skills package and hosted MCP endpoint, but is not published as a standalone platform Registry listing.
- Toutiao / 今日头条 is supported by the skills package and hosted MCP endpoint, but has no repo-tracked standalone platform Registry listing.
- No `public-listings/socialdatax-skills/server-card.json` is published.
- Hosted streamable HTTP clients can connect directly to `https://mcp.socialdatax.com/xhs/mcp`, `https://mcp.socialdatax.com/douyin/mcp`, `https://mcp.socialdatax.com/kuaishou/mcp`, `https://mcp.socialdatax.com/bilibili/mcp`, `https://mcp.socialdatax.com/weibo/mcp`, `https://mcp.socialdatax.com/toutiao/mcp`, `https://mcp.socialdatax.com/wechat/mcp`, `https://mcp.socialdatax.com/zhihu/mcp`, `https://mcp.socialdatax.com/instagram/mcp`, `https://mcp.socialdatax.com/x/mcp`, `https://mcp.socialdatax.com/youtube/mcp`, `https://mcp.socialdatax.com/tiktok/mcp`, and `https://mcp.socialdatax.com/sensitive-check/mcp` with `Authorization: Bearer <SOCIALDATAX_API_KEY>`.
- With a valid key, hosted MCP `initialize` succeeds.
- After deployment, verify XHS hosted MCP `tools/list` returns the current 36 public XHS tools with a valid key, including `xhs_get_share_info`, `xhs_get_product_detail_by_url`, `xhs_get_product_review_reply_replies`, `xhs_get_user_id_by_encrypted_user_id`, `xhs_pgy_get_creator_profile`, `xhs_pgy_get_creator_notes_performance`, and `xhs_pgy_get_creator_fans_profile`; compare exact tool names and schemas, not only counts.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_pgy_get_note_detail_by_note_id` and `xhs_pgy_get_note_detail_by_note_url`, excludes the old MCP tool name, and both descriptions state the 20-point successful-call cost and that failures are not charged.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_get_product_reviews`.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_get_product_review_replies`, whose `review_id` is copied from product review items.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_get_product_review_reply_replies`, whose `review_id` is copied from product review reply items.
- Douyin hosted MCP `tools/list` must match the public tool allowlist in `public-listings/douyin-insights/server-card.json`. Use that platform listing’s `Recorded release status` section for dated channel observations.
- With a valid key, Douyin hosted MCP `tools/list` includes `socialdatax_get_points_balance`, `douyin_search_products`, `douyin_get_product_detail_by_product_id`, `douyin_get_product_detail_by_url`, `douyin_search_users`, and `douyin_search_suggestions`.
- With a valid key, Kuaishou hosted MCP `tools/list` matches the public tool allowlist in `public-listings/kuaishou-insights/server-card.json`.
- With a valid key, Kuaishou hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Kuaishou hosted MCP `tools/list` includes `kuaishou_get_hot_search_list`.
- Verify Bilibili hosted MCP `tools/list` returns the current 24 public Bilibili tools.
- With a valid key, Bilibili hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Bilibili hosted MCP `tools/list` includes `bilibili_submit_video_speech_text_by_video_url`, `bilibili_submit_video_speech_text_by_bvid`, and `bilibili_get_video_speech_text_job`.
- Weibo hosted MCP `tools/list` must match the public tool allowlist in `public-listings/weibo-insights/server-card.json`. Use that platform listing’s `Recorded release status` section for dated channel observations.
- With a valid key, Weibo hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Weibo hosted MCP `tools/list` includes `weibo_get_post_liker_list_by_post_url` and `weibo_get_post_repost_list_by_post_url`.
- After deploying candidate `0.1.1`, verify Toutiao hosted MCP `tools/list` returns the current 13 public Toutiao tools.
- With a valid key, Toutiao hosted MCP `tools/list` includes `socialdatax_get_points_balance`, `toutiao_search_posts`, and `toutiao_search_suggestions`.
- After deploying candidate `0.1.1`, verify Baidu Tieba hosted MCP `tools/list` returns 12 public tools including the points balance tool.
- Verify `baidu_tieba_search_suggestions` accepts only `keyword`, returns separate `items` and `forums` arrays, and does not expose user search or pagination.
- WeChat Content local server card contains 24 public WeChat tools; after deployment, verify hosted `tools/list` matches this list and includes `wechat_search_finder_user`.
- With a valid key, WeChat Content hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, WeChat Content hosted MCP `tools/list` includes `wechat_get_user_info_by_url`, `wechat_get_video_share_url_by_object_id`, `wechat_get_mp_article_detail_by_url`, `wechat_get_mp_article_stats_by_url`, `wechat_get_mp_article_comments_by_url`, and `wechat_get_mp_article_comment_replies_by_url`.
- Zhihu hosted MCP `tools/list` must match the public tool allowlist in `public-listings/zhihu-insights/server-card.json`. Use that platform listing’s `Recorded release status` section for dated channel observations.
- With a valid key, Zhihu hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Zhihu hosted MCP `tools/list` includes `zhihu_submit_video_speech_text_by_video_url`, `zhihu_submit_video_speech_text_by_zvideo_id`, and `zhihu_get_video_speech_text_job`.
- Historical verification on 2026-10-08: Instagram hosted MCP `0.1.6` returned 14 public tools and user-search calls passed; superseded by the `0.1.7` release below.
- Instagram hosted MCP `0.1.7` returns 15 public tools, including first-page tag search; deployment and Registry publication were verified on 2026-10-11.
- With a valid key, Instagram hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- On 2026-10-16, the public hosted [Haokan server card](https://mcp.socialdatax.com/.well-known/mcp/haokan-server-card.json) listed 15 tools: 14 business read tools and account balance. The local CLI exposes all 14 business tools through nine `haokan` commands. Parameter contracts and mocked pagination are tested locally; the authenticated CLI smoke check below also passed.
- On 2026-10-16, the public hosted [X server card](https://mcp.socialdatax.com/.well-known/mcp/x-server-card.json) listed 21 tools, including all three user-replies entries. This check did not exercise authenticated tools/list or business calls. The local CLI now includes `x user-replies`; this CLI update, the `docs search --platform-id haokan` fix, and the Haokan commands were published in npm `socialdatax-skills@0.2.51` on 2026-10-16. The registry tarball integrity and contents match the release source; installed-package help checks passed for all three command groups.
- Historical verification on 2026-10-08: X / Twitter hosted MCP `0.1.3` returned 18 public tools; hosted deployment, authenticated `tools/list`, user search, and Registry publication were verified on 2026-10-08.
- With a valid key, X / Twitter hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, X / Twitter hosted MCP `tools/list` includes `x_submit_video_speech_text_by_post_url`, `x_submit_video_speech_text_by_post_id`, and `x_get_video_speech_text_job`.
- YouTube hosted MCP `tools/list` must match the public tool allowlist in `public-listings/youtube-insights/server-card.json`. Use that platform listing’s `Recorded release status` section for dated channel observations.
- With a valid key, YouTube hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, YouTube hosted MCP `tools/list` includes `youtube_submit_video_speech_text_by_url`, `youtube_submit_video_speech_text_by_video_id`, and `youtube_get_video_speech_text_job`.
- TikTok hosted MCP `0.1.7` returns 15 public tools, including `tiktok_search_users` and `tiktok_search_suggestions`; hosted deployment and Registry publication were verified on 2026-10-08.
- With a valid key, TikTok hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, TikTok hosted MCP `tools/list` includes `tiktok_submit_video_speech_text_by_url`, `tiktok_submit_video_speech_text_by_aweme_id`, and `tiktok_get_video_speech_text_job`.
- With a valid key, Sensitive Words Check hosted MCP `tools/list` returns the current 2 public tools: `check_sensitive_text` and `socialdatax_get_points_balance`.

### CLI 0.2.51 authenticated smoke check (2026-10-16)

Using the published npm package, each command completed one request without following continuation tokens:

- `haokan search --keyword "摄影" --max-items 2 --source-platform npm`: returned two videos and a continuation token; reported cost: 10 points.
- `x user-replies --username OpenAI --max-items 2 --source-platform npm`: returned two replies with `post_id` and `reply_to_post_id`, plus a continuation token; reported cost: 10 points.
- `docs search --query "视频" --platform-id haokan --limit 2 --source-platform npm`: returned two Haokan API operations.

All commands used `npm exec --yes --package=socialdatax-skills@0.2.51 -- socialdatax-skills`. API keys and raw responses are not stored in the repository. These checks verify one page per command, not live multi-page completeness.

## Directory Submission Order

1. Publish or update the primary npm package `socialdatax-skills`.
2. Publish or update the legacy wrapper package `social-media-insights-skills`.
3. Verify OpenClaw, Hermes Agent, Codex, Claude Code, and shared AgentSkills installs.
4. Submit or refresh the XHS platform MCP listing from `public-listings/xhs-insights`.
5. Submit or refresh the Douyin platform MCP listing from `public-listings/douyin-insights`.
6. Submit or refresh the Kuaishou platform MCP listing from `public-listings/kuaishou-insights`.
7. Submit or refresh the Weibo platform MCP listing from `public-listings/weibo-insights`.
8. Submit or refresh the current WeChat Content platform MCP listing from `public-listings/wechat-channels-insights`.
9. Submit or refresh the Instagram platform MCP listing from `public-listings/instagram-insights`.
10. Submit or refresh the Bilibili, Zhihu, X / Twitter, YouTube, and TikTok platform MCP listings from their repo-tracked `public-listings/*-insights` directories.
11. Keep Sensitive Words Check hosted-only unless a separate platform Registry listing is explicitly approved.
12. Keep Toutiao / 今日头条 hosted-only unless a separate platform Registry listing is explicitly approved.

## Search Keywords To Verify After Approval

- `Xiaohongshu`
- `xiaohongshu mcp`
- `xiaohongshu data mcp`
- `xiaohongshu note search mcp`
- `xiaohongshu search hot list mcp`
- `XHS`
- `xhs mcp`
- `xhs data mcp`
- `xhs note search mcp`
- `xhs hot search mcp`
- `RedNote`
- `rednote mcp`
- `rednote data mcp`
- `小红书`
- `小红书 mcp`
- `小红书 数据 MCP`
- `小红书 搜索热榜 MCP`
- `social insights`
- `Douyin`
- `douyin mcp`
- `douyin data mcp`
- `douyin video search mcp`
- `douyin hot search mcp`
- `douyin creator series mcp`
- `抖音`
- `抖音 mcp`
- `抖音 数据 MCP`
- `抖音 热榜 MCP`
- `抖音 达人短剧 MCP`
- `Kuaishou`
- `kuaishou mcp`
- `kuaishou data mcp`
- `kuaishou video search mcp`
- `Kwai`
- `kwai mcp`
- `kwai data mcp`
- `快手`
- `快手 mcp`
- `快手 数据 MCP`
- `Weibo`
- `weibo mcp`
- `weibo data mcp`
- `weibo post search mcp`
- `weibo hot search mcp`
- `weibo transcript mcp`
- `微博`
- `微博 mcp`
- `微博 数据 MCP`
- `微博 热搜 MCP`
- `微博 口播转文字 MCP`
- `Toutiao`
- `toutiao mcp`
- `toutiao data mcp`
- `toutiao post search mcp`
- `今日头条`
- `今日头条 mcp`
- `今日头条 数据 MCP`
- `WeChat Channels`
- `wechat channels mcp`
- `wechat channels data mcp`
- `wechat channels video search mcp`
- `wechat channels transcript mcp`
- `视频号`
- `视频号 mcp`
- `视频号 数据 MCP`
- `视频号 搜索 MCP`
- `视频号 口播转文字 MCP`
- `WeChat Official Account`
- `official account article skill`
- `mp.weixin.qq.com article detail`
- `微信公众号文章`
- `公众号文章详情`
- `Bilibili`
- `bilibili mcp`
- `bilibili data mcp`
- `bilibili video search mcp`
- `bilibili article search mcp`
- `B站`
- `B站 mcp`
- `B站 数据 MCP`
- `知乎`
- `zhihu mcp`
- `zhihu data mcp`
- `Instagram`
- `instagram mcp`
- `instagram data mcp`
- `X Twitter`
- `twitter mcp`
- `twitter data mcp`
- `YouTube`
- `youtube mcp`
- `youtube data mcp`
- `TikTok`
- `tiktok mcp`
- `tiktok data mcp`
- `sensitive words skill`
- `敏感词检测 skill`
- `违禁词检查 skill`

Sensitive Words Check remains hosted-only; verify its package and skill keywords after approval, but do not submit it as a standalone platform MCP Registry listing without explicit approval.

Toutiao / 今日头条 remains hosted-only; verify its package and skill keywords after approval, but do not submit it as a standalone platform MCP Registry listing without explicit approval.
