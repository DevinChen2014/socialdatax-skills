---
name: socialdatax-content-research-assistant
description: Use when doing cross-platform content research, topic planning, competitor research, trend insight, comment insight, or creator research across Xiaohongshu, 小红书, XHS, RedNote, Douyin, and 抖音.
metadata:
  openclaw:
    requires:
      env:
        - SOCIALDATAX_API_KEY
      bins:
        - node
        - npm
    primaryEnv: SOCIALDATAX_API_KEY
    emoji: "🔎"
    homepage: https://socialdatax.com
    install:
      - kind: node
        package: "socialdatax-skills"
        bins: []
---

# SocialDataX Content Research Assistant

Use this skill to combine SocialDataX read-only research commands for Xiaohongshu / 小红书 / XHS / RedNote and Douyin / 抖音.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. To get or manage an API Key, open <https://socialdatax.com> and follow the website API Key access flow.
获取或管理 API Key：访问 <https://socialdatax.com>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`。

## Research Workflow

1. Start broad with keyword search or Douyin hot search.
2. Pick representative content IDs or URLs from the results.
3. Read details for factual context and metrics.
4. Read comments when the task needs audience language, objections, FAQs, sentiment themes, or demand signals.
5. Read creator profiles and creator content lists when the task needs account positioning, benchmarking, or content style analysis.
6. Report observed evidence separately from interpretation, and mention when results cover only one page.

## Direct CLI

Prefer direct CLI commands when the agent can run shell commands:

```bash
npx -y socialdatax-skills@latest xhs search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest xhs detail --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs comments --note-id "<note_id>" --pretty
npx -y socialdatax-skills@latest xhs user-info --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --user-id "<user_id>" --pretty
npx -y socialdatax-skills@latest douyin hot-search --pretty
npx -y socialdatax-skills@latest douyin search --keyword "<keyword>" --pretty
npx -y socialdatax-skills@latest douyin detail --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin comments --aweme-id "<aweme_id>" --pretty
npx -y socialdatax-skills@latest douyin user-info --sec-user-id "<sec_user_id>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --sec-user-id "<sec_user_id>" --pretty
```

Use URL or share-text entrypoints when the user provides links instead of IDs:

```bash
npx -y socialdatax-skills@latest xhs detail --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs comments --url "<note_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest xhs user-posts --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin detail --url "<douyin_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin comments --url "<douyin_content_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-info --profile-url "<profile_url_or_share_text>" --pretty
npx -y socialdatax-skills@latest douyin user-posts --profile-url "<profile_url_or_share_text>" --pretty
```

For reply analysis:

```bash
npx -y socialdatax-skills@latest xhs sub-comments --note-id "<note_id>" --comment-id "<comment_id>" --pretty
npx -y socialdatax-skills@latest douyin replies --aweme-id "<aweme_id>" --comment-id "<comment_id>" --pretty
```

## Safety Boundary

This skill is read-only. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. It wraps the public `socialdatax-skills` CLI and does not contain the hosted service implementation.
