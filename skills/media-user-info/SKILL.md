---
name: media-user-info
description: Retrieve social media creator profile information from platform user IDs, profile URLs, short links, or share text. This version is backed by hosted platform MCP services and supports Xiaohongshu, 小红书, XHS, RedNote, and Douyin / 抖音 creators.
metadata:
  openclaw:
    requires:
      env:
        - SOCIALDATAX_API_KEY
      bins:
        - node
        - npm
    primaryEnv: SOCIALDATAX_API_KEY
    emoji: "👤"
    homepage: https://socialdatax.com/?from=npm
    install:
      - kind: node
        package: "socialdatax-skills"
        bins: []
---

# Media User Info

Use this skill when the user wants creator profile data, account basics, creator positioning, audience scale, or profile lookup for supported social media platforms.

Current platform support:

- Xiaohongshu / XHS / RedNote creators through the `xhs_get_user_info_by_*` tools.
- Douyin / 抖音 creators through the `douyin_get_user_info_by_*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. To get or manage an API Key, open <https://socialdatax.com/?from=npm> and follow the website API Key access flow. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-info --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-info --profile-url "<profile_url_or_share_text>" --pretty
```

- XHS `--user-id <user_id>`: preferred when the creator ID is already known from another result.
- XHS `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- Douyin `--sec-user-id <sec_user_id>`: preferred when the creator sec_user_id is already known.
- Douyin `--profile-url <profile_url_or_share_text>`: use for a profile URL, short link, or profile share text.
- `--pretty`: output formatting only.

Use either the ID option or the profile URL option for a single command, not both.

The command prints JSON with `platform`, `tool`, `arguments`, and `data`.

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

If MCP tools are already available in the current agent, use one of these tools:

- `xhs_get_user_info_by_user_id`: preferred when `user_id` is already known from search, detail, comments, or creator note lists.
- `xhs_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.
- `douyin_get_user_info_by_sec_user_id`: preferred when `sec_user_id` is already known from search, detail, comments, or creator work lists.
- `douyin_get_user_info_by_profile_url`: use for profile URLs, short links, or profile share text.

## Output Guidance

Report profile fields such as name, platform IDs, bio, verification, follower count, following count, received like count, IP location, and gender when available. Separate profile facts from strategic interpretation.
