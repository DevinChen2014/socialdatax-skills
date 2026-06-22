# Skills Package Submission Checklist

Use this checklist before syncing this listing to the public `socialdatax-skills` repository or publishing the unified npm skill installer package. Do not submit this package as a unified MCP registry entry unless a real aggregate MCP endpoint exists.

## Public Repository

- Repository name: `socialdatax-skills`
- Project URL: `https://socialdatax.52choujiang.com`
- Public repository: <https://github.com/DevinChen2014/socialdatax-skills>
- Repository description: `SocialDataX skills for media search, content details, comments/replies, creator profiles, creator content lists, search hot lists, and video speech-to-text transcripts. Current tools support Xiaohongshu / XHS / RedNote, Douyin, Kuaishou / Kwai, Weibo, and WeChat Channels through hosted platform MCP services.`
- Current repository topics: `agentskills`, `skills`, `social-media`, `social-insights`, `xiaohongshu`, `xhs`, `rednote`, `douyin`, `kuaishou`, `kwai`, `weibo`, `wechat`
- Optional expansion topics: `marketing-research`, `comment-analysis`, `media-search`, `speech-to-text`, `transcript`, `xiaohongshu-data`, `xhs-data`, `rednote-data`, `douyin-data`, `kuaishou-data`, `kwai-data`, `weibo-data`, `wechat-channels`
- Root README title: `SocialDataX Skills | 社媒数据助手 Skills`
- Product name: `SocialDataX` / `社媒数据助手`
- Website: `https://socialdatax.52choujiang.com`
- XHS hosted MCP endpoint: `https://mcp.52choujiang.com/xhs/mcp`
- Douyin hosted MCP endpoint: `https://mcp.52choujiang.com/douyin/mcp`
- Kuaishou hosted MCP endpoint: `https://mcp.52choujiang.com/kuaishou/mcp`
- Weibo hosted MCP endpoint: `https://mcp.52choujiang.com/weibo/mcp`
- WeChat Channels hosted MCP endpoint: `https://mcp.52choujiang.com/wechat/mcp`
- Hosted auth: `Authorization: Bearer <SOCIALDATAX_API_KEY>`
- XHS current platform MCP registry name: `com.52choujiang/xhs-insights`
- XHS future platform MCP registry name: `com.socialdatax/xhs-insights`
- Douyin current platform MCP registry name: `com.52choujiang/douyin-insights`
- Douyin future platform MCP registry name: `com.socialdatax/douyin-insights`
- Kuaishou current platform MCP registry name: `com.52choujiang/kuaishou-insights`
- Kuaishou future platform MCP registry name: `com.socialdatax/kuaishou-insights`
- Weibo current platform MCP registry name: `com.52choujiang/weibo-insights`
- Weibo future platform MCP registry name: `com.socialdatax/weibo-insights`
- WeChat Channels current platform MCP registry name: `com.52choujiang/wechat-channels-insights`
- WeChat Channels future platform MCP registry name: `com.socialdatax/wechat-channels-insights`
- Unified MCP registry name: none
- Direct CLI startup: `npx -y socialdatax-skills@latest xhs search --keyword "露营桌" --pretty`
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
  - Direct XHS search: `npx -y socialdatax-skills@latest xhs search --keyword "露营桌" --pretty`
  - Direct XHS search hot list: `npx -y socialdatax-skills@latest xhs hot-search --pretty`
  - Direct Douyin hot search: `npx -y socialdatax-skills@latest douyin hot-search --pretty`
  - Direct Douyin search: `npx -y socialdatax-skills@latest douyin search --keyword "露营桌" --pretty`
  - Direct Douyin replies: `npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty`
  - Direct Douyin creator series: `npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty`
  - Direct Kuaishou hot search: `npx -y socialdatax-skills@latest kuaishou hot-search --pretty`
  - Direct Kuaishou search: `npx -y socialdatax-skills@latest kuaishou search --keyword "露营桌" --pretty`
  - Direct Kuaishou replies: `npx -y socialdatax-skills@latest kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty`
  - Direct Weibo hot search: `npx -y socialdatax-skills@latest weibo hot-search --pretty`
  - Direct Weibo search: `npx -y socialdatax-skills@latest weibo search --keyword "露营桌" --pretty`
  - Direct Weibo detail: `npx -y socialdatax-skills@latest weibo detail --post-id "<post_id>" --pretty`
  - Direct WeChat Channels hot search: `npx -y socialdatax-skills@latest wechat hot-search --pretty`
  - Direct WeChat Channels search: `npx -y socialdatax-skills@latest wechat search --keyword "露营桌" --pretty`
  - Direct WeChat Channels detail: `npx -y socialdatax-skills@latest wechat detail --encrypted-object-id "<encrypted_object_id>" --pretty`
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
- MCP.Directory title: `SocialDataX 小红书 Xiaohongshu XHS RedNote 抖音 Douyin 快手 Kuaishou 微博 Weibo 视频号 WeChat Channels Content Research`
- MCP.Directory description: `Research 小红书 / Xiaohongshu / XHS / RedNote, 抖音 / Douyin, 快手 / Kuaishou / Kwai, 微博 / Weibo, and 视频号 / WeChat Channels content with SocialDataX: keyword discovery, details, comments, replies, creator profiles, creator content lists, transcripts, and trend insights through agent commands.`
- MCP.Directory category suggestion: `Research`
- Smithery skill namespace/slug suggestion: `DevinChen2014/socialdatax-content-research-assistant`
- Smithery `gitUrl`: `https://github.com/DevinChen2014/socialdatax-skills`
- Do not submit `socialdatax-skills` as a unified MCP server; submit only the Agent Skill directory or GitHub-backed skill metadata where a platform explicitly supports skills.

## NPM Checks

- `npm view socialdatax-skills version` does not point to another publisher before first publish.
- `npm pack --dry-run --json` includes `cli.mjs`, `README.md`, and `skills/**`.
- `npm pack --dry-run --json` does not include `server-card.json`; platform listings own MCP registry server cards.
- The package does not include `node_modules`, private backend code, real API keys, production configuration, or internal samples.
- From the private source repository, `node scripts/publish_socialdatax_skills.mjs --dry-run` succeeds with an npm granular access token that has publish permission and two-factor bypass enabled.
- From the private source repository, `node scripts/publish_socialdatax_skills.mjs` publishes `socialdatax-skills` first, then the legacy `social-media-insights-skills` wrapper, with a temporary npm config outside the repository that is removed after publishing.
- `node cli.mjs list` lists each available capability skill.
- `node cli.mjs doctor` prints package source, runtime, endpoint, and account-action safety summary.
- `node cli.mjs doctor --json` prints parseable JSON and does not include real API keys.
- `node cli.mjs` prints help instead of silently running a local MCP server.
- `node cli.mjs --help` documents direct `xhs`, `douyin`, `kuaishou`, `weibo`, and `wechat` commands, multi-skill install, OpenClaw, Hermes Agent, Codex, Claude Code, and shared AgentSkills commands.
- `node cli.mjs xhs search --keyword "露营桌" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs xhs hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs xhs detail --note-id a --url b` fails with the one-input validation error.
- `node cli.mjs douyin hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs douyin search --keyword "露营桌" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs douyin detail --aweme-id a --url b` fails with the one-input validation error.
- `node cli.mjs douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs douyin user-series --sec-user-id "<sec_user_id>" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs kuaishou hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs kuaishou search --keyword "露营桌" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs kuaishou detail --photo-id a --url b` fails with the one-input validation error.
- `node cli.mjs kuaishou replies --photo-id "<photo_id>" --comment-id "<comment_id>" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs weibo hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs weibo search --keyword "露营桌" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs weibo detail --post-id a --post-url b` fails with the one-input validation error.
- `node cli.mjs wechat hot-search --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs wechat search --keyword "露营桌" --pretty` fails clearly without `SOCIALDATAX_API_KEY`.
- `node cli.mjs wechat detail --encrypted-object-id a --url b` fails with the one-input validation error.
- With a valid key, `node cli.mjs xhs search --keyword "露营桌" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs xhs hot-search --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs douyin search --keyword "露营桌" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs kuaishou search --keyword "露营桌" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs weibo search --keyword "露营桌" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- With a valid key, `node cli.mjs wechat search --keyword "露营桌" --pretty` returns a JSON envelope with `platform`, `tool`, `arguments`, and `data`.
- `node cli.mjs xhs search --keyword "露营桌"` prints a clear Node.js version error on runtimes older than 20.18.1.
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

## Platform MCP Checks

- XHS platform listing remains in `public-listings/xhs-insights`.
- XHS platform server card remains `com.52choujiang/xhs-insights`; `com.socialdatax/xhs-insights` is kept only as a future namespace draft while the public endpoint remains on `mcp.52choujiang.com`.
- Douyin current platform listing remains in `public-listings/douyin-insights`.
- Douyin server metadata is publicly listed as `com.52choujiang/douyin-insights`; future `com.socialdatax/douyin-insights` metadata remains a draft until the endpoint namespace changes.
- Kuaishou current platform listing remains in `public-listings/kuaishou-insights`.
- Kuaishou server metadata is publicly listed as `com.52choujiang/kuaishou-insights`; future `com.socialdatax/kuaishou-insights` metadata remains a draft until the endpoint namespace changes.
- Weibo current platform listing remains in `public-listings/weibo-insights`.
- Weibo server metadata is publicly listed as `com.52choujiang/weibo-insights`; future `com.socialdatax/weibo-insights` metadata remains a draft until the endpoint namespace changes.
- WeChat Channels current platform listing remains in `public-listings/wechat-channels-insights`.
- WeChat Channels server metadata is publicly listed as `com.52choujiang/wechat-channels-insights`; future `com.socialdatax/wechat-channels-insights` metadata remains a draft until the endpoint namespace changes.
- No `public-listings/socialdatax-skills/server-card.json` is published.
- Hosted streamable HTTP clients can connect directly to `https://mcp.52choujiang.com/xhs/mcp`, `https://mcp.52choujiang.com/douyin/mcp`, `https://mcp.52choujiang.com/kuaishou/mcp`, `https://mcp.52choujiang.com/weibo/mcp`, and `https://mcp.52choujiang.com/wechat/mcp` with `Authorization: Bearer <SOCIALDATAX_API_KEY>`.
- With a valid key, hosted MCP `initialize` succeeds.
- With a valid key, XHS hosted MCP `tools/list` returns the current 14 public XHS tools.
- With a valid key, Douyin hosted MCP `tools/list` returns the current 16 public Douyin tools.
- With a valid key, Kuaishou hosted MCP `tools/list` returns the current 14 public Kuaishou tools.
- With a valid key, Weibo hosted MCP `tools/list` returns the current 16 public Weibo tools.
- With a valid key, WeChat Channels hosted MCP `tools/list` returns the current 13 public WeChat Channels tools.

## Directory Submission Order

1. Publish or update the primary npm package `socialdatax-skills`.
2. Publish or update the legacy wrapper package `social-media-insights-skills`.
3. Verify OpenClaw, Hermes Agent, Codex, Claude Code, and shared AgentSkills installs.
4. Submit or refresh the XHS platform MCP listing from `public-listings/xhs-insights`.
5. Submit or refresh the Douyin platform MCP listing from `public-listings/douyin-insights`.
6. Submit or refresh the Kuaishou platform MCP listing from `public-listings/kuaishou-insights`.
7. Submit or refresh the Weibo platform MCP listing from `public-listings/weibo-insights`.
8. Submit or refresh the WeChat Channels platform MCP listing from `public-listings/wechat-channels-insights`.
9. Add future platform listings only after their MCP endpoints and tools are public.

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
- `kuaishou hot search mcp`
- `Kwai`
- `kwai mcp`
- `kwai data mcp`
- `快手`
- `快手 mcp`
- `快手 数据 MCP`
- `快手 热榜 MCP`
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

Do not add future-platform search keywords to package metadata or directory tags until those tools are publicly exposed.
