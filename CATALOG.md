# SocialDataX Agent Skills Catalog

SocialDataX (社媒数据助手) provides Agent Skills for read-only social media research workflows. These Skills help agents use the `socialdatax-skills` CLI and SocialDataX MCP services for content research, comment analysis, topic planning, video transcript extraction, and copy safety review.

Official website and API Key access: <https://socialdatax.com/?from=github>

## Quick Start

Set your API Key in the environment:

```bash
export SOCIALDATAX_API_KEY="<your_api_key>"
```

Run a direct CLI command:

```bash
npx -y socialdatax-skills@latest xhs search \
  --keyword "露营" --sort-type like_count_descending --pages 2 --max-items 20 --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-content-research
```

The CLI does not log in to user accounts, post content, like, comment, or change account settings.

## High-Intent Skills

| Skill | Use When | Primary Capability | Marketplace Slugs |
| --- | --- | --- | --- |
| 小红书内容研究 | Research popular XHS / Xiaohongshu / RedNote note samples, content angles, keywords, competitor content, and trend material. | XHS note search | SkillHub / ClawHub / ModelScope: `xhs-content-research` |
| 小红书评论分析与需求挖掘 | Analyze comments from a provided XHS note URL or complete `note_id` for user feedback, pain points, purchase objections, FAQ, and demand signals. | XHS comments and replies | SkillHub / ClawHub / ModelScope: `xhs-comment-insights` |
| 小红书热榜选题分析 | Turn current XHS hot-list signals and related popular note samples into actionable topic ideas. | XHS hot search plus note search | SkillHub / ClawHub / ModelScope: `xhs-hot-topic-selection` |
| 小红书爆款笔记研究 | Study high-engagement XHS note samples from a keyword, niche, product, or scenario. | XHS note search | SkillHub / ModelScope: `xhs-viral-note-research` |
| 小红书爆款文案拆解 | Break down XHS viral copy structure, title hooks, opening style, selling points, emotional wording, CTA, and reusable copy framework. | XHS search and note detail | SkillHub / ModelScope: `xhs-viral-copy-breakdown` |
| 抖音文案提取 | Extract Douyin video context, original description, spoken transcript, copy-ready version, and task status from a URL, share text, `aweme_id`, or transcript `job_id`. | Douyin transcript job | SkillHub / ClawHub / ModelScope: `douyin-video-copy-extract` |
| 敏感词检测与违禁词检查 | Check copy before publishing for sensitive terms, platform risk hints, and safer rewrite suggestions. | Copy safety review | SkillHub / ClawHub: `socialdatax-sensitive-check` |

## Direct CLI Examples

### XHS Content Research

```bash
npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --sort-type like_count_descending --pages 2 --max-items 20 --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-content-research
```

### XHS Viral Note Research

```bash
npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --sort-type like_count_descending --pages 2 --max-items 20 --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-viral-note-research
```

### XHS Viral Copy Breakdown

Find candidate notes:

```bash
npx -y socialdatax-skills@latest xhs search \
  --keyword "<keyword>" --sort-type like_count_descending --pages 2 --max-items 20 --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-viral-copy-breakdown
```

Read one selected note for copy breakdown:

```bash
npx -y socialdatax-skills@latest xhs detail \
  --url "<xhs_note_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-viral-copy-breakdown
```

### XHS Comment Analysis

```bash
npx -y socialdatax-skills@latest xhs comments \
  --url "<xhs_note_url_or_share_text>" --pages 2 --max-items 20 --include-replies --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-comment-insights
```

### XHS Hot Topic Planning

```bash
npx -y socialdatax-skills@latest xhs hot-search \
  --pretty --source-client socialdatax-skills --source-platform github \
  --source-skill xhs-hot-topic-selection
```

Then search notes for one selected hot topic:

```bash
npx -y socialdatax-skills@latest xhs search \
  --keyword "<hot_topic_keyword>" --sort-type like_count_descending --pages 2 --max-items 20 --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill xhs-hot-topic-selection
```

### Douyin Copy Extraction

```bash
npx -y socialdatax-skills@latest douyin transcript \
  --url "<douyin_video_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill douyin-video-copy-extract
```

If the transcript job is still pending, keep the returned `job_id` and query it again:

```bash
npx -y socialdatax-skills@latest douyin transcript \
  --job-id "<job_id>" --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill douyin-video-copy-extract
```

### Sensitive Term Check

```bash
npx -y socialdatax-skills@latest sensitive-check text \
  --text "<copy_to_check>" --platform xhs --pretty \
  --source-client socialdatax-skills --source-platform github --source-skill socialdatax-sensitive-check
```

## Output Principles

- Keep returned XHS `note_url` values complete, including query parameters such as `xsec_token`.
- Keep returned IDs complete. Do not shorten `note_id`, `aweme_id`, comment IDs, page tokens, or job IDs.
- Treat search results as the returned page range, not full-platform coverage.
- Separate observed evidence from recommendations.
- Do not claim guaranteed traffic, guaranteed virality, account diagnosis, publishing, or account operation.

## Install From Marketplaces

Use the marketplace that matches your agent runtime:

- ClawHub: search the Chinese skill title or slug shown above.
- SkillHub: search the Chinese skill title or slug shown above.
- ModelScope: search the Chinese skill title or slug shown above.
- npm/direct CLI: use `npx -y socialdatax-skills@latest ...`.

## Safety Boundary

These Skills use the user's configured `SOCIALDATAX_API_KEY` at runtime. Generated Skill files and this catalog do not contain API Keys.

The Skills do not read local browser data, save API Keys to local files, perform login, post, like, comment, follow, send messages, or change account settings. Transcript commands submit bounded speech-to-text analysis jobs to SocialDataX and then check the returned job status.
