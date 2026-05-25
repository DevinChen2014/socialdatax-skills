# SocialDataX Skills | 社媒数据助手 Skills

This public package provides the unified skill installer and direct CLI helper for SocialDataX services.

The current public tools support 小红书 / Xiaohongshu / XHS / RedNote and 抖音 / Douyin read-only research workflows. The public skill layer is intentionally named by media capability so supported platforms can evolve without changing the installation model.

- direct `npx` JSON commands for agents that can run shell commands
- AgentSkills-compatible installers split by capability for OpenClaw, Hermes Agent, Codex, Claude Code, and general agent skill directories
- links to platform-specific MCP docs when a client should use MCP directly

The business implementation is privately hosted. This repository exposes only the public package, skill, and connection surface for read-only social media intelligence workflows. It is not a unified MCP server and does not include a registry server card; platform MCPs are published separately.

## Search Aliases

Common search phrases for this skill package:

- `SocialDataX Skills`
- `social media skills`
- `AgentSkills social media`
- `OpenClaw social media skills`
- `Hermes Agent social media skills`
- `media search skill`
- `media comments skill`
- `creator profile skill`
- `Xiaohongshu skills`
- `XHS skills`
- `RedNote skills`
- `Douyin skills`
- `抖音 skills`
- `SocialDataX content research`
- `content research assistant`

## Platform MCPs

- XHS hosted MCP endpoint: `https://mcp.52choujiang.com/xhs/mcp`
- Douyin hosted MCP endpoint: `https://mcp.52choujiang.com/douyin/mcp`
- Hosted transport: `streamable-http`
- Authentication: `Authorization: Bearer <SOCIALDATAX_API_KEY>`
- Website: <https://socialdatax.com>
- XHS current platform MCP registry name: `com.52choujiang/xhs-insights`
- XHS future platform MCP registry name: `com.socialdatax/xhs-insights`
- Douyin current platform MCP registry name: `com.52choujiang/douyin-insights`
- Douyin future platform MCP registry name: `com.socialdatax/douyin-insights`
- Unified MCP registry name: none; this package installs skills and calls explicit platform services.
- Current public capability version: `0.2.3`

## Direct CLI

For most skill users, no MCP client configuration is required. Install the skills, set `SOCIALDATAX_API_KEY`, and let the agent run the direct `npx` commands.

Examples:

```bash
npx -y socialdatax-skills@latest xhs search --keyword "露营桌" --pretty
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest douyin hot-search --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营桌" --pretty
npx -y socialdatax-skills@latest douyin detail --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest douyin user-info --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-series --profile-url "<profile_url_or_share_text>" --pretty
```

The direct CLI prints a JSON envelope with `platform`, `tool`, `arguments`, and `data`.

Douyin search filters use semantic values: `--sort-type` supports `general`,
`time_descending`, and `like_count_descending`; `--publish-time-range` supports
`all`, `day`, `week`, and `half_year`; `--duration-range` supports `all`,
`under_1_minute`, `one_to_five_minutes`, and `over_5_minutes`; `--content-type`
supports `all`, `video`, and `image`.

### Runtime Requirements

- Recommended: Node.js 22 LTS or newer.
- Minimum: Node.js 20.18.1.
- Node.js 18 and older are not supported.

### Environment

- `SOCIALDATAX_API_KEY`
  Required for direct CLI data calls and hosted MCP calls. Local inspection commands such as `list`, `doctor`, and `install --dry-run` do not require a key.

## Security & Privacy

You can inspect the package safety summary before installing:

```bash
npx -y socialdatax-skills@latest doctor
npx -y socialdatax-skills@latest doctor --json
```

The public package declares no npm lifecycle scripts such as `preinstall`, `install`, or `postinstall`. The installer copies AgentSkills files only, does not save API keys, and does not change MCP server configuration. Data calls are read-only, require `SOCIALDATAX_API_KEY` at runtime, and do not read local browser data.

## Platform Names

This project is not affiliated with, endorsed by, or sponsored by Xiaohongshu, RedNote, Douyin, or their affiliates. Platform names are used only to describe supported data sources.

### Local Source Run

```bash
npm install
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs xhs search --keyword "露营桌" --pretty
SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" node cli.mjs douyin search --keyword "露营桌" --pretty
```

### Docker Run

```bash
docker build -t socialdatax-skills .
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills xhs search --keyword "露营桌" --pretty
docker run --rm -i -e SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>" socialdatax-skills douyin search --keyword "露营桌" --pretty
```

If Docker Hub is slow from your network, keep the default image unchanged for normal use and override only during local builds:

```bash
docker build --build-arg NODE_IMAGE=mirror.gcr.io/library/node:22-alpine -t socialdatax-skills .
```

## Skill Installer

The npm package also ships separate skills for each major capability. Different clients can install one skill, several skills, or all skills into their expected directory:

```bash
npx -y socialdatax-skills@latest list
npx -y socialdatax-skills@latest doctor
npx -y socialdatax-skills@latest install --target openclaw
npx -y socialdatax-skills@latest install --target openclaw --dry-run
npx -y socialdatax-skills@latest install socialdatax-content-research-assistant --target openclaw
npx -y socialdatax-skills@latest install media-search --target openclaw
npx -y socialdatax-skills@latest install media-search --target openclaw --dry-run
npx -y socialdatax-skills@latest install media-user-info --target openclaw
npx -y socialdatax-skills@latest install media-comments media-detail --target openclaw
npx -y socialdatax-skills@latest install media-search --target openclaw --scope workspace
npx -y socialdatax-skills@latest install media-search --target hermes
npx -y socialdatax-skills@latest install media-search --target hermes --scope shared
npx -y socialdatax-skills@latest install media-search --target agents
npx -y socialdatax-skills@latest install media-search --target codex
npx -y socialdatax-skills@latest install media-search --target codex --scope workspace
npx -y socialdatax-skills@latest install media-search --target claude-code
npx -y socialdatax-skills@latest install media-search --target claude-code --scope workspace
npx -y socialdatax-skills@latest xhs search --keyword "露营桌" --pretty
npx -y socialdatax-skills@latest douyin hot-search --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营桌" --pretty
npx -y socialdatax-skills@latest douyin user-series --sec-user-id "<sec_user_id>" --pretty
```

Available skills:

- `socialdatax-content-research-assistant`: combine SocialDataX search, detail, comment, creator profile, and creator content workflows for cross-platform content research across XHS and Douyin.
- `media-search`: search social media content by keyword; supports XHS notes and Douyin works.
- `media-detail`: read structured content details and metrics; supports XHS notes and Douyin works.
- `media-comments`: fetch and analyze XHS comments/replies and Douyin comments/replies.
- `media-user-info`: retrieve creator profile information; supports XHS and Douyin creators.
- `media-user-posts`: retrieve creator content lists; supports XHS notes, Douyin works, and Douyin creator short-drama series.

Default install locations:

- OpenClaw: `~/.openclaw/workspace/skills/<skill-name>` or `OPENCLAW_SKILLS_DIR/<skill-name>`
- OpenClaw workspace scope: `./skills/<skill-name>`
- Hermes Agent: `~/.hermes/skills/<skill-name>`
- Hermes shared scope: `~/.agents/skills/<skill-name>`
- Shared AgentSkills directory: `~/.agents/skills/<skill-name>`
- Codex: `~/.codex/skills/<skill-name>`
- Codex workspace scope: `./.codex/skills/<skill-name>`
- Claude Code: `~/.claude/skills/<skill-name>`
- Claude Code workspace scope: `./.claude/skills/<skill-name>`

If no skill name is provided, all skills are installed. If a destination already exists, re-run with `--force` to replace an existing directory for the same skill. Use `--path <directory>` to install one skill to a custom directory, or multiple skills under a custom parent directory. The `shared` scope is only meaningful for `--target hermes`; use `--target agents` for the shared AgentSkills directory directly.

## Read-Only Scope

The current platform MCP services are designed for read-only social media intelligence workflows. They do not provide account login, posting, editing, liking, commenting, or other account actions.

Current XHS workflows include:

- Search related Xiaohongshu notes by keyword, with optional sort, note type, and publish-time filters.
- Resolve a shared note link, short link, share text, or note ID into structured note details.
- Read note details when the caller already has a note ID.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment.
- Read creator profile data from a profile link, short link, share text, or user ID.
- Fetch paginated creator note lists from a user ID, profile link, short link, or share text for content style and account research.

Current Douyin workflows include:

- Fetch the current Douyin main hot search list.
- Search related Douyin works by keyword.
- Resolve a Douyin content page link, short link, share text, or aweme_id into structured work details.
- Fetch paginated first-level comments for comment analysis.
- Fetch paginated replies under a first-level comment.
- Continue Douyin comment and reply pagination only when `next_page_token` is non-empty; an empty string means there are no more comments or replies to request.
- Read creator profile data from a profile link, short link, share text, or sec_user_id.
- Fetch paginated creator work lists from a sec_user_id, profile link, short link, or share text.
- Fetch paginated creator short-drama series lists from a sec_user_id, profile link, short link, or share text.

## XHS Tools

| Tool | Public purpose |
| --- | --- |
| `xhs_search_notes` | Search Xiaohongshu / 小红书 notes by keyword with optional sort, note type, and publish-time filters. |
| `xhs_get_note_detail_by_note_url` | Resolve a shared XHS link, short link, share text, or note ID into structured note details. |
| `xhs_get_note_detail_by_note_id` | Fetch structured note details when the caller already has a note ID. |
| `xhs_get_note_comments_by_note_id` | Fetch paginated first-level comments when the caller already has a note ID. |
| `xhs_get_note_comments_by_note_url` | Fetch paginated first-level comments directly from a shared note URL, short link, or share text. |
| `xhs_get_note_sub_comments_by_comment_id` | Fetch paginated replies under a first-level comment by note ID and comment ID. |
| `xhs_get_user_info_by_user_id` | Fetch creator profile data when the caller already has a user ID. |
| `xhs_get_user_info_by_profile_url` | Resolve a profile link, short link, or share text into creator profile data. |
| `xhs_get_user_posted_notes_by_user_id` | Fetch a paginated list of notes published by a creator when the caller already has a user ID. |
| `xhs_get_user_posted_notes_by_profile_url` | Fetch a paginated list of notes published by a creator from a profile link, short link, or share text. |

## Douyin Tools

| Tool | Public purpose |
| --- | --- |
| `douyin_get_hot_search_list` | Fetch the current Douyin main hot search list. |
| `douyin_search_videos` | Search Douyin works by keyword with optional paging and filters. |
| `douyin_get_video_detail_by_aweme_id` | Fetch structured Douyin work details when the caller already has an aweme_id. |
| `douyin_get_video_detail_by_url` | Resolve a Douyin content page link, short link, or share text into structured Douyin work details. |
| `douyin_get_video_comments_by_aweme_id` | Fetch paginated first-level comments when the caller already has an aweme_id. |
| `douyin_get_video_comments_by_url` | Fetch paginated first-level comments directly from a Douyin content page URL, short link, or share text. |
| `douyin_get_video_comment_replies_by_comment_id` | Fetch paginated replies under a first-level Douyin comment by aweme_id and comment_id. |
| `douyin_get_user_info_by_sec_user_id` | Fetch creator profile data when the caller already has a sec_user_id. |
| `douyin_get_user_info_by_profile_url` | Resolve a profile link, short link, or share text into creator profile data. |
| `douyin_get_user_posted_videos_by_sec_user_id` | Fetch a paginated list of works published by a creator when the caller already has a sec_user_id. |
| `douyin_get_user_posted_videos_by_profile_url` | Fetch a paginated list of works published by a creator from a profile link, short link, or share text. |
| `douyin_get_user_series_by_sec_user_id` | Fetch a paginated list of short-drama series by a creator when the caller already has a sec_user_id. |
| `douyin_get_user_series_by_profile_url` | Fetch a paginated list of short-drama series by a creator from a profile link, short link, or share text. |

## Quick Start

For agents that can execute shell commands, use the direct CLI. This is the recommended default for installed skills:

```bash
export SOCIALDATAX_API_KEY="<SOCIALDATAX_API_KEY>"
npx -y socialdatax-skills@latest xhs search --keyword "露营桌" --pretty
npx -y socialdatax-skills@latest douyin search --keyword "露营桌" --pretty
```

MCP client configuration belongs to platform MCP listings. For XHS, use the `xhs-insights` docs; for Douyin, use the `douyin-insights` listing.

Aily is treated as an OpenClaw / AgentSkills ecosystem channel for this package. Use the OpenClaw skill install flow for now; a dedicated `--target aily` will be added only after its official skill import or package format is confirmed.

## API Key

Request or manage API access from the product website:

<https://socialdatax.com>

Use the key as a Bearer token in the `Authorization` request header. Do not commit real API keys to code, docs, issues, or screenshots.

## Directory Metadata

Public metadata files in this repository:

- [skills](skills): AgentSkills-compatible skills split by social media capability and currently backed by XHS and Douyin tools.

## License

The files in this public repository are released under the MIT License. The license covers the public CLI wrapper, documentation, and skill files in this repository only. It does not cover the managed service implementation, hosted infrastructure, or any private backend code outside this repository.
