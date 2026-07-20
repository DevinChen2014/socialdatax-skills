---
name: "media-transcript"
description: "Submit and check video speech-to-text transcript / 口播转文字 jobs for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels through direct CLI commands or hosted platform MCP tools."
source_client: "socialdatax-skills"
source_platform: "npm"
source_skill: "media-transcript"
metadata:
  openclaw:
    requires:
      env:
        - "SOCIALDATAX_API_KEY"
      bins:
        - "node"
        - "npm"
    primaryEnv: "SOCIALDATAX_API_KEY"
    install:
      - kind: "node"
        package: "socialdatax-skills"
        bins: []
    emoji: "🎙️"
    homepage: "https://socialdatax.com/ai?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Transcript

Use this skill when the user wants video speech-to-text, 口播转文字, transcript extraction, spoken-word extraction, or to check an existing transcript job for supported social media content.

Current platform support:

- Xiaohongshu / XHS / RedNote video note speech-to-text transcript jobs through the `xhs_*video_speech_text*` tools.
- Douyin / 抖音 video work speech-to-text transcript jobs through the `douyin_*video_speech_text*` tools.
- Kuaishou / 快手 video work speech-to-text transcript jobs through the `kuaishou_*video_speech_text*` tools.
- Weibo / 微博 video post speech-to-text transcript jobs through the `weibo_*video_speech_text*` tools.
- WeChat Channels / 视频号 video speech-to-text transcript jobs through the `wechat_*video_speech_text*` tools.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名；do not infer alternate domains。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest xhs transcript \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest xhs transcript \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest xhs transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest douyin transcript \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-transcript

npx -y socialdatax-skills@latest douyin transcript \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest douyin transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest kuaishou transcript \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-transcript

npx -y socialdatax-skills@latest kuaishou transcript \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest kuaishou transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest weibo transcript \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-transcript

npx -y socialdatax-skills@latest weibo transcript \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest weibo transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest wechat transcript \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript

npx -y socialdatax-skills@latest wechat transcript \
  --encrypted-object-id "<encrypted_object_id>" --pretty \
  --source-client socialdatax-skills --source-platform npm \
  --source-skill media-transcript

npx -y socialdatax-skills@latest wechat transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill media-transcript
```

Required arguments:

- Use a submit-by-URL command when the user provides a content link, short link, or share text.
- Use a submit-by-ID command only when the platform content ID is already known: XHS `note_id`, Douyin `aweme_id`, Kuaishou `photo_id`, Weibo `post_id`, or WeChat Channels / 视频号 `encrypted_object_id`.
- Use the matching `transcript --job-id <job_id>` command when continuing or checking an existing transcript job.
- For one transcript command, pass exactly one entrypoint: URL/share text, platform content ID, or `job_id`.

Optional arguments:

- Direct CLI transcript commands automatically wait and poll the same job by default; use positive `--max-wait-seconds <seconds>` to tune the CLI-side follow-up window after the first response.
- `--source-client socialdatax-skills --source-platform npm --source-skill media-transcript`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use the direct CLI first when the agent can run shell commands. These video speech-to-text transcript / 口播转文字 workflows submit a bounded analysis job or check an existing job.
Direct CLI transcript commands try to deliver the final result in one run: submit waits server-side up to 210 seconds, then the CLI keeps querying the same `job_id` with get-job long polling of up to 240 seconds per request for a bounded follow-up window. Do not start a second submit job just to poll status.
If the direct CLI returns a non-terminal job because the command was interrupted or reached `--max-wait-seconds`, keep the returned `job_id` and continue with the matching `transcript --job-id <job_id>` command.

## Safety Boundary

This skill can submit bounded video speech-to-text analysis jobs through the direct CLI or hosted MCP tools. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `xhs_submit_video_speech_text_by_note_url`
- `xhs_submit_video_speech_text_by_note_id`
- `xhs_get_video_speech_text_job`
- `douyin_submit_video_speech_text_by_video_url`
- `douyin_submit_video_speech_text_by_aweme_id`
- `douyin_get_video_speech_text_job`
- `kuaishou_submit_video_speech_text_by_video_url`
- `kuaishou_submit_video_speech_text_by_photo_id`
- `kuaishou_get_video_speech_text_job`
- `weibo_submit_video_speech_text_by_post_url`
- `weibo_submit_video_speech_text_by_post_id`
- `weibo_get_video_speech_text_job`
- `wechat_submit_video_speech_text_by_video_url`
- `wechat_submit_video_speech_text_by_encrypted_object_id`
- `wechat_get_video_speech_text_job`

If MCP tools are already available in the current agent, choose the platform-specific submit tool by entrypoint:
- XHS: `xhs_submit_video_speech_text_by_note_url`, `xhs_submit_video_speech_text_by_note_id`, `xhs_get_video_speech_text_job`.
- Douyin: `douyin_submit_video_speech_text_by_video_url`, `douyin_submit_video_speech_text_by_aweme_id`, `douyin_get_video_speech_text_job`.
- Kuaishou: `kuaishou_submit_video_speech_text_by_video_url`, `kuaishou_submit_video_speech_text_by_photo_id`, `kuaishou_get_video_speech_text_job`.
- Weibo: `weibo_submit_video_speech_text_by_post_url`, `weibo_submit_video_speech_text_by_post_id`, `weibo_get_video_speech_text_job`.
- WeChat Channels / 视频号: `wechat_submit_video_speech_text_by_video_url`, `wechat_submit_video_speech_text_by_encrypted_object_id`, `wechat_get_video_speech_text_job`.
Do not start a duplicate transcript job only to poll status. If an MCP response is non-terminal, call `data.next_action.tool_name` with `data.next_action.arguments` exactly as returned; those arguments include the same `job_id` and a bounded `wait_seconds` value. Continue until `is_terminal` is `true`.

## Output Guidance

Return the transcript text and content context when available; include content IDs, titles or descriptions, author facts, and duration when the response provides them.
This v1 surface does not return summary.
When a job is still running, continue querying the same `job_id` until a terminal result is available; only surface `job_id`, status, and next action if the tool cannot continue, the command/session is interrupted, the bounded wait window is reached, or the user asks to stop.
If the result says no processable video resource is available or the job failed, report that as the observed job result instead of retrying with another platform.

## Troubleshooting

- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not submit another job or keep polling. Show the recharge URL from the error exactly as returned, then continue the same command after the user recharges.
- If the user has recharged but still sees insufficient balance, confirm `SOCIALDATAX_API_KEY` belongs to the same account that was recharged; if needed, copy a fresh API Key from the official dashboard.
- If a transcript `job_id` already exists, only check that same job; do not submit the video again.
