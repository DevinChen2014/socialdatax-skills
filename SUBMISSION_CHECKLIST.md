# Skills Package Submission Checklist

Use this checklist before syncing this listing to the public `socialdatax-skills` repository or publishing the unified npm skill installer package. Do not submit this package as a unified MCP registry entry unless a real aggregate MCP endpoint exists.

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
- WeChat Content / 微信内容 hosted MCP endpoint: `https://mcp.socialdatax.com/wechat/mcp`
- Zhihu / 知乎 hosted MCP endpoint: `https://mcp.socialdatax.com/zhihu/mcp`
- Instagram hosted MCP endpoint: `https://mcp.socialdatax.com/instagram/mcp`
- X / Twitter hosted MCP endpoint: `https://mcp.socialdatax.com/x/mcp`
- YouTube hosted MCP endpoint: `https://mcp.socialdatax.com/youtube/mcp`
- TikTok hosted MCP endpoint: `https://mcp.socialdatax.com/tiktok/mcp`
- Sensitive Words Check hosted MCP endpoint: `https://mcp.socialdatax.com/sensitive-check/mcp`
- Hosted auth: `Authorization: Bearer <SOCIALDATAX_API_KEY>`
- Repo-tracked platform MCP listings: `com.52choujiang/xhs-insights`, `com.52choujiang/douyin-insights`, `com.52choujiang/kuaishou-insights`, `com.52choujiang/bilibili-insights`, `com.52choujiang/weibo-insights`, `com.52choujiang/wechat-channels-insights`, `com.52choujiang/zhihu-insights`, `com.52choujiang/instagram-insights`, `com.52choujiang/x-insights`, `com.52choujiang/youtube-insights`, and `com.52choujiang/tiktok-insights`.
- Repo-tracked future SocialDataX namespace draft files exist for XHS and Douyin: `com.socialdatax/xhs-insights` and `com.socialdatax/douyin-insights`.
- Reserved future SocialDataX namespace names for existing platform listings without draft files yet: `com.socialdatax/kuaishou-insights`, `com.socialdatax/bilibili-insights`, `com.socialdatax/weibo-insights`, `com.socialdatax/wechat-channels-insights`, `com.socialdatax/zhihu-insights`, `com.socialdatax/instagram-insights`, `com.socialdatax/x-insights`, `com.socialdatax/youtube-insights`, and `com.socialdatax/tiktok-insights`.
- Hosted endpoint without a repo-tracked standalone listing: Sensitive Words Check.
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
- MCP.Directory description: `Research Xiaohongshu / XHS / RedNote, Douyin, Kuaishou / Kwai, Bilibili, Weibo, WeChat Channels, Zhihu, Instagram, X / Twitter, YouTube, and TikTok content with SocialDataX: keyword discovery, details, comments, replies, creator profiles, creator content lists, transcripts where supported, and trend insights through agent commands. Also read WeChat Official Account article details from article links.`
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
- No `public-listings/socialdatax-skills/server-card.json` is published.
- Hosted streamable HTTP clients can connect directly to `https://mcp.socialdatax.com/xhs/mcp`, `https://mcp.socialdatax.com/douyin/mcp`, `https://mcp.socialdatax.com/kuaishou/mcp`, `https://mcp.socialdatax.com/bilibili/mcp`, `https://mcp.socialdatax.com/weibo/mcp`, `https://mcp.socialdatax.com/wechat/mcp`, `https://mcp.socialdatax.com/zhihu/mcp`, `https://mcp.socialdatax.com/instagram/mcp`, `https://mcp.socialdatax.com/x/mcp`, `https://mcp.socialdatax.com/youtube/mcp`, `https://mcp.socialdatax.com/tiktok/mcp`, and `https://mcp.socialdatax.com/sensitive-check/mcp` with `Authorization: Bearer <SOCIALDATAX_API_KEY>`.
- With a valid key, hosted MCP `initialize` succeeds.
- With a valid key, XHS hosted MCP `tools/list` returns the current 24 public XHS tools.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_pgy_get_note_detail_by_note_id` and `xhs_pgy_get_note_detail_by_note_url`, excludes the old MCP tool name, and both descriptions state the 20-point successful-call cost and that failures are not charged.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_get_product_reviews`.
- With a valid key, XHS hosted MCP `tools/list` includes `xhs_get_product_review_replies`, whose `review_id` is copied from product review items.
- With a valid key, Douyin hosted MCP `tools/list` returns the current 20 public Douyin tools.
- With a valid key, Douyin hosted MCP `tools/list` includes `socialdatax_get_points_balance`, `douyin_search_products`, and `douyin_search_users`.
- With a valid key, Kuaishou hosted MCP `tools/list` returns the current 16 public Kuaishou tools.
- With a valid key, Kuaishou hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Kuaishou hosted MCP `tools/list` includes `kuaishou_get_hot_search_list`.
- With a valid key, Bilibili hosted MCP `tools/list` returns the current 22 public Bilibili tools.
- With a valid key, Bilibili hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Bilibili hosted MCP `tools/list` includes `bilibili_submit_video_speech_text_by_video_url`, `bilibili_submit_video_speech_text_by_bvid`, and `bilibili_get_video_speech_text_job`.
- With a valid key, Weibo hosted MCP `tools/list` returns the current 19 public Weibo tools.
- With a valid key, Weibo hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Weibo hosted MCP `tools/list` includes `weibo_get_post_liker_list_by_post_url` and `weibo_get_post_repost_list_by_post_url`.
- With a valid key, WeChat Content hosted MCP `tools/list` returns the current 16 public WeChat tools.
- With a valid key, WeChat Content hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, WeChat Content hosted MCP `tools/list` includes `wechat_get_user_info_by_url` and `wechat_get_mp_article_detail_by_url`.
- With a valid key, Zhihu hosted MCP `tools/list` returns the current 11 public Zhihu tools.
- With a valid key, Zhihu hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, Zhihu hosted MCP `tools/list` includes `zhihu_submit_video_speech_text_by_video_url`, `zhihu_submit_video_speech_text_by_zvideo_id`, and `zhihu_get_video_speech_text_job`.
- With a valid key, Instagram hosted MCP `tools/list` returns the current 13 public Instagram tools.
- With a valid key, Instagram hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, X / Twitter hosted MCP `tools/list` returns the current 16 public X / Twitter tools.
- With a valid key, X / Twitter hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, X / Twitter hosted MCP `tools/list` includes `x_submit_video_speech_text_by_post_url`, `x_submit_video_speech_text_by_post_id`, and `x_get_video_speech_text_job`.
- With a valid key, YouTube hosted MCP `tools/list` returns the current 10 public YouTube tools.
- With a valid key, YouTube hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, YouTube hosted MCP `tools/list` includes `youtube_submit_video_speech_text_by_url`, `youtube_submit_video_speech_text_by_video_id`, and `youtube_get_video_speech_text_job`.
- With a valid key, TikTok hosted MCP `tools/list` returns the current 13 public TikTok tools.
- With a valid key, TikTok hosted MCP `tools/list` includes `socialdatax_get_points_balance`.
- With a valid key, TikTok hosted MCP `tools/list` includes `tiktok_submit_video_speech_text_by_url`, `tiktok_submit_video_speech_text_by_aweme_id`, and `tiktok_get_video_speech_text_job`.
- With a valid key, Sensitive Words Check hosted MCP `tools/list` returns the current 2 public tools: `check_sensitive_text` and `socialdatax_get_points_balance`.

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
