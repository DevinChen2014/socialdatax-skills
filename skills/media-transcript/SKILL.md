---
name: "media-transcript"
description: "Submit and check video speech-to-text transcript / 口播转文字 jobs for XHS, Douyin, Kuaishou, Weibo, and WeChat Channels through hosted platform MCP tools."
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
    homepage: "https://socialdatax.52choujiang.com/?from=npm"
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

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.52choujiang.com/?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.52choujiang.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

Required arguments:

- Use a submit-by-URL tool when the user provides a content link, short link, or share text.
- Use a submit-by-ID tool only when the platform content ID is already known: XHS `note_id`, Douyin `aweme_id`, Kuaishou `photo_id`, Weibo `post_id`, or WeChat Channels / 视频号 `encrypted_object_id`.
- Use the matching get-job tool with `job_id` when continuing or checking an existing transcript job.

These video speech-to-text transcript / 口播转文字 workflows are MCP-only and not available through the direct CLI.
Submit tools may wait briefly after creating the job. If the transcript is not ready, return the `job_id` and next action instead of starting a second job.

## Safety Boundary

This skill can submit bounded analysis jobs through hosted MCP tools. It does not read local browser data, does not save API keys, and does not perform login, posting, liking, commenting, or account changes. Use hosted MCP tools only when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

If MCP tools are already available in the current agent, choose the platform-specific submit tool by entrypoint:
- XHS: `xhs_submit_video_speech_text_by_note_url`, `xhs_submit_video_speech_text_by_note_id`, `xhs_get_video_speech_text_job`.
- Douyin: `douyin_submit_video_speech_text_by_video_url`, `douyin_submit_video_speech_text_by_aweme_id`, `douyin_get_video_speech_text_job`.
- Kuaishou: `kuaishou_submit_video_speech_text_by_video_url`, `kuaishou_submit_video_speech_text_by_photo_id`, `kuaishou_get_video_speech_text_job`.
- Weibo: `weibo_submit_video_speech_text_by_post_url`, `weibo_submit_video_speech_text_by_post_id`, `weibo_get_video_speech_text_job`.
- WeChat Channels / 视频号: `wechat_submit_video_speech_text_by_video_url`, `wechat_submit_video_speech_text_by_encrypted_object_id`, `wechat_get_video_speech_text_job`.
Do not start a duplicate transcript job only to poll status. Use the platform get-job tool with the returned `job_id`.

MCP-only tools not available through the direct CLI:

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

## Output Guidance

Return the transcript text when available. When a job is still running, include the `job_id`, status, and next action so the user or agent can check later.
If the result says no processable video resource is available or the job failed, report that as the observed job result instead of retrying with another platform.
