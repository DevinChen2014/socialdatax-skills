---
name: "media-transcript"
description: "Use when submitting or checking video speech-to-text transcript / 口播转文字 jobs for XHS, Douyin, Kuaishou, Weibo, WeChat Channels, Bilibili, Zhihu, Instagram, X / Twitter, TikTok, or YouTube through direct CLI commands or hosted platform MCP tools."
source_client: "socialdatax-skills"
source_platform: "github"
source_skill: "media-transcript"
metadata:
  openclaw:
    requires:
      env: []
      bins: []
    primaryEnv: "SOCIALDATAX_API_KEY"
    install:
      - kind: "node"
        package: "socialdatax-skills"
        bins: []
    emoji: "🎙️"
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Transcript

Use this skill when the user wants video speech-to-text, 口播转文字, transcript extraction, spoken-word extraction, or to check an existing transcript job for supported social media content. TikTok video speech-to-text transcript jobs are available through direct CLI commands or hosted TikTok MCP tools; use a video URL or numeric `aweme_id`, or query an existing valid `job_id` directly. X / Twitter transcript jobs are available through direct CLI commands or hosted X MCP tools; use a post URL or numeric `post_id`, or query an existing valid `job_id` directly. YouTube transcript jobs are available through direct CLI commands or hosted YouTube MCP tools; use a video URL or 11-character `video_id`, or query an existing valid `job_id` directly. Zhihu / 知乎 independent-video and video-answer transcript jobs are available through direct CLI commands or hosted Zhihu MCP tools; use a `/zvideo/{zvideo_id}` or `/question/{question_id}/answer/{answer_id}` URL, use numeric `zvideo_id` only for independent videos, or query an existing valid `job_id` directly.

Current platform support:

- Xiaohongshu / XHS / RedNote video note speech-to-text transcript jobs through the `xhs_*video_speech_text*` tools.
- Douyin / 抖音 video work speech-to-text transcript jobs through the `douyin_*video_speech_text*` tools.
- Kuaishou / 快手 video work speech-to-text transcript jobs through the `kuaishou_*video_speech_text*` tools.
- Weibo / 微博 video post speech-to-text transcript jobs through the `weibo_*video_speech_text*` tools.
- WeChat Channels / 视频号 video speech-to-text transcript jobs through the `wechat_*video_speech_text*` tools.
- TikTok video speech-to-text transcript jobs through direct CLI commands or hosted TikTok MCP tools; use the video URL or numeric aweme_id entrypoint, or query an existing valid job_id directly.
- Bilibili / 哔哩哔哩 / B站 single-part video speech-to-text transcript jobs through direct CLI commands or hosted `bilibili_*video_speech_text*` MCP tools; URLs with `?p=N` select one part, b23 short links follow their resolved target part, and plain Bilibili URLs and BV IDs default to P1.
- Instagram regular video posts and Reels speech-to-text transcript jobs through direct CLI commands or hosted Instagram MCP tools; photo and carousel posts are not supported.
- X / Twitter video post speech-to-text transcript jobs through direct CLI commands or hosted X MCP tools; use a post URL or numeric post_id, and only the current post's first video with an available MP4 variant is processed.
- Zhihu / 知乎 independent-video and video-answer speech-to-text transcript jobs through direct CLI commands or hosted Zhihu MCP tools; use a `/zvideo/{zvideo_id}` or `/question/{question_id}/answer/{answer_id}` URL, and use numeric zvideo_id only for independent videos. Plain answers without video are not processable.
- YouTube video speech-to-text transcript jobs through direct CLI commands or hosted YouTube MCP tools; use a video URL or 11-character video_id, or query an existing valid job_id directly.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- Before a CLI call requiring an API Key, run `npx -y socialdatax-skills@latest auth status` in the actual execution environment. It makes no paid request and reports only `apiKeyReadable` and source `environment` / `file` / `null`, never the Key. For installation or upgrades, reuse readable existing credentials without known authentication failures unless the user explicitly requests a different Key; do not require login again, migrate credentials, or overwrite their configuration; handle command, permission and malformed-file errors as reported instead of treating every failure as a missing Key. Authenticated hosted MCP keeps its current connection authentication and needs no separate local CLI setup.
- Enter a Key only for first-time setup, missing or invalid credentials, or an explicit Key change. When the user has already supplied a Key in the installation prompt or current conversation and authorized configuration, send it as stdin to `npx -y socialdatax-skills@latest auth login --stdin` for persistent CLI storage; do not request duplicate manual entry, pass it as a CLI argument, or write it to a temporary script file. Otherwise direct the user to the official URL above and hidden input with `npx -y socialdatax-skills@latest auth login` in their local terminal, without asking them to send it in chat. The CLI saves it under the execution user's home at `.config/socialdatax/credentials.json`, Unix mode 600 or a private current-user ACL on Windows. Do not repeat the Key in replies, output logs, screenshots, command examples, Skill files or version control. The Agent must not read or display credential-file content.
- Each CLI invocation reads the private user file without depending on a client loading shell configuration or changing client/system settings. A nonempty `SOCIALDATAX_API_KEY` has priority, then the existing legacy variable, then the file. Saving a file does not replace an effective environment credential or prove the selected Key is effective. If the CLI warns about a different environment Key, report the actual source without silently deleting or changing existing environment settings. For authentication failures, check the actual source/account and have the user correct it locally while preserving other configuration.
- After saving, rerun `auth status` in the same environment as the business command. If false, stop business calls and check the OS user, home directory and file access. True only means readable credentials; authentication and results are determined by the original business response, without an extra paid call solely to check configuration.
- Remote/container CLI runs use that runtime user's configuration; a local file does not transfer automatically. Persist credentials there only with a persistent home; without an already authorized Key, interactive user login is also needed. Otherwise use existing platform-supported Secret/environment injection. If persistence is unavailable or sandbox-blocked, report the actual limit without copying the Key to additional chats, projects or temporary files, or bypassing isolation.
- When persistence acceptance is needed, finish configuration and installation first, then ask the user to fully quit the client and its background execution processes, reopen, and check from a new session before resuming the original request. Do not terminate the client hosting the current task. Normal use reuses verified configuration without repeated restarts or entry.

## Preferred Direct CLI

Prefer the direct CLI when the agent can run commands. It uses existing environment credentials or the private local CLI configuration described above and does not require MCP server setup:

```bash
npx -y socialdatax-skills@latest xhs transcript \
  --url "<note_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest xhs transcript \
  --note-id "<note_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest xhs transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest douyin transcript \
  --url "<douyin_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-transcript

npx -y socialdatax-skills@latest douyin transcript \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest douyin transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest kuaishou transcript \
  --url "<kuaishou_content_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-transcript

npx -y socialdatax-skills@latest kuaishou transcript \
  --photo-id "<photo_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest kuaishou transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest weibo transcript \
  --post-url "<weibo_post_url_or_share_text>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-transcript

npx -y socialdatax-skills@latest weibo transcript \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest weibo transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest wechat transcript \
  --url "<wechat_video_url_or_share_text>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest wechat transcript \
  --encrypted-object-id "<encrypted_object_id>" --pretty \
  --source-client socialdatax-skills --source-platform github \
  --source-skill media-transcript

npx -y socialdatax-skills@latest wechat transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest bilibili transcript \
  --url "<video_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest bilibili transcript \
  --bvid "<bvid>" --pretty --source-client socialdatax-skills --source-platform github \
  --source-skill media-transcript

npx -y socialdatax-skills@latest bilibili transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest zhihu transcript \
  --url "<video_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest zhihu transcript \
  --zvideo-id "<zvideo_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest zhihu transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest instagram transcript \
  --url "<post_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest instagram transcript \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest instagram transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest x transcript \
  --url "<post_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest x transcript \
  --post-id "<post_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest x transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest tiktok transcript \
  --url "<video_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest tiktok transcript \
  --aweme-id "<aweme_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest tiktok transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest youtube transcript \
  --url "<video_url>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest youtube transcript \
  --video-id "<video_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript

npx -y socialdatax-skills@latest youtube transcript \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-transcript
```

### Export SRT subtitles (direct CLI)
- When the user requests a subtitle file, use CLI 0.2.64 or later and append `--srt-output ./video.srt` to the matching platform transcript command above, keeping its source-attribution arguments. This works with the URL, content-ID, and job-query entrypoints already listed in this Skill; it does not extend platform coverage.
- Confirm the destination first: its parent directory must exist and be writable, and the target file must not exist. The CLI never overwrites a file. A successful job with valid timed segments writes UTF-8 SRT while retaining the original JSON on stdout; confirm the actual file and saved-file message before reporting completion.
- If the job is unfinished, use the matching platform `transcript --job-id <job_id>` example with the same `--srt-output ./video.srt`; do not resubmit the video.
- If path validation fails and no job_id exists yet, no transcript job has been submitted; correct the path and rerun the original command. If a job_id already exists, a path or file-write error does not mean transcription failed: retain any returned JSON, resolve the local saving problem, and retry with the same job_id.
- If the returned timing is missing or invalid, retain the JSON and explain that SRT cannot be generated. Stop repeated queries; do not invent timestamps or resubmit the video.
- `--srt-output` saves locally through the direct CLI; it is not a hosted MCP tool argument. For a job already submitted through MCP, query the same platform and job_id through the CLI to export. If the CLI cannot run, explain that no local SRT file has been generated; do not submit another job.

Required arguments:

- Use a submit-by-URL command when the user provides a content link, short link, or share text.
- Use a submit-by-ID command only with a known platform content ID: XHS note_id, Douyin/TikTok aweme_id, Kuaishou photo_id, Weibo/Instagram/X post_id, WeChat encrypted_object_id, Bilibili bvid, Zhihu zvideo_id, or YouTube video_id.
- Use the matching `transcript --job-id <job_id>` command when continuing or checking an existing transcript job.
- For one transcript command, pass exactly one entrypoint: URL/share text, platform content ID, or `job_id`.

Optional arguments:

- Direct CLI transcript commands automatically wait and poll the same job by default; use positive `--max-wait-seconds <seconds>` to tune the CLI-side follow-up window after the first response.
- `--source-client socialdatax-skills --source-platform github --source-skill media-transcript`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

Use the direct CLI first when the agent can run shell commands. These video speech-to-text transcript / 口播转文字 workflows submit a bounded analysis job or check an existing job.
Direct CLI transcript commands try to deliver the final result in one run: submit waits server-side up to 240 seconds, then the CLI keeps querying the same `job_id`; each get-job call also waits up to 240 seconds for that job. Do not start a second submit job just to poll status.
If the direct CLI returns a non-terminal job because the command was interrupted or reached `--max-wait-seconds`, keep the returned `job_id` and continue with the matching `transcript --job-id <job_id>` command.
平台边界：XHS、抖音、快手、微博、视频号、Bilibili、Zhihu、Instagram、X / Twitter、TikTok、YouTube 均有 direct CLI transcript 入口。每次只传 URL、内容 ID 或 job_id 其中一项；继续查询同一个 job_id，不要重新提交。

## Safety Boundary

This skill can submit bounded video speech-to-text analysis jobs through the direct CLI or hosted MCP tools. When the user requests SRT export, the direct CLI writes subtitles to a user-selected new local file without overwriting existing files. CLI calls use existing environment credentials or the user's explicitly saved private local credential file. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- XHS: `xhs_submit_video_speech_text_by_note_url`, `xhs_submit_video_speech_text_by_note_id`, `xhs_get_video_speech_text_job`
- DOUYIN: `douyin_submit_video_speech_text_by_video_url`, `douyin_submit_video_speech_text_by_aweme_id`, `douyin_get_video_speech_text_job`
- KUAISHOU: `kuaishou_submit_video_speech_text_by_video_url`, `kuaishou_submit_video_speech_text_by_photo_id`, `kuaishou_get_video_speech_text_job`
- WEIBO: `weibo_submit_video_speech_text_by_post_url`, `weibo_submit_video_speech_text_by_post_id`, `weibo_get_video_speech_text_job`
- WECHAT: `wechat_submit_video_speech_text_by_video_url`, `wechat_submit_video_speech_text_by_encrypted_object_id`, `wechat_get_video_speech_text_job`
- BILIBILI: `bilibili_submit_video_speech_text_by_video_url`, `bilibili_submit_video_speech_text_by_bvid`, `bilibili_get_video_speech_text_job`
- ZHIHU: `zhihu_submit_video_speech_text_by_video_url`, `zhihu_submit_video_speech_text_by_zvideo_id`, `zhihu_get_video_speech_text_job`
- INSTAGRAM: `instagram_submit_video_speech_text_by_post_url`, `instagram_submit_video_speech_text_by_post_id`, `instagram_get_video_speech_text_job`
- X: `x_submit_video_speech_text_by_post_url`, `x_submit_video_speech_text_by_post_id`, `x_get_video_speech_text_job`
- TIKTOK: `tiktok_submit_video_speech_text_by_url`, `tiktok_submit_video_speech_text_by_aweme_id`, `tiktok_get_video_speech_text_job`
- YOUTUBE: `youtube_submit_video_speech_text_by_url`, `youtube_submit_video_speech_text_by_video_id`, `youtube_get_video_speech_text_job`

If MCP tools are already available in the current agent, choose the platform-specific submit tool by entrypoint:
- XHS: `xhs_submit_video_speech_text_by_note_url`, `xhs_submit_video_speech_text_by_note_id`, `xhs_get_video_speech_text_job`.
- Douyin: `douyin_submit_video_speech_text_by_video_url`, `douyin_submit_video_speech_text_by_aweme_id`, `douyin_get_video_speech_text_job`.
- Kuaishou: `kuaishou_submit_video_speech_text_by_video_url`, `kuaishou_submit_video_speech_text_by_photo_id`, `kuaishou_get_video_speech_text_job`.
- Weibo: `weibo_submit_video_speech_text_by_post_url`, `weibo_submit_video_speech_text_by_post_id`, `weibo_get_video_speech_text_job`.
- WeChat Channels / 视频号: `wechat_submit_video_speech_text_by_video_url`, `wechat_submit_video_speech_text_by_encrypted_object_id`, `wechat_get_video_speech_text_job`.
- Bilibili / 哔哩哔哩 / B站: `bilibili_submit_video_speech_text_by_video_url`, `bilibili_submit_video_speech_text_by_bvid`, `bilibili_get_video_speech_text_job`.
- Instagram: `instagram_submit_video_speech_text_by_post_url`, `instagram_submit_video_speech_text_by_post_id`, `instagram_get_video_speech_text_job`.
- X / Twitter: `x_submit_video_speech_text_by_post_url`, `x_submit_video_speech_text_by_post_id`, `x_get_video_speech_text_job`.
- Zhihu / 知乎: `zhihu_submit_video_speech_text_by_video_url`, `zhihu_submit_video_speech_text_by_zvideo_id`, `zhihu_get_video_speech_text_job`.
- TikTok: `tiktok_submit_video_speech_text_by_url`, `tiktok_submit_video_speech_text_by_aweme_id`, `tiktok_get_video_speech_text_job`.
- YouTube: `youtube_submit_video_speech_text_by_url`, `youtube_submit_video_speech_text_by_video_id`, `youtube_get_video_speech_text_job`.
If the user already provides a valid platform-specific `job_id`, call the matching get-job tool directly; do not submit a duplicate job just to obtain another `job_id`.
For `wechat_get_video_speech_text_job`, pass only a `job_id`; do not pass `encrypted_object_id`, `object_id`, or a content link.
For Bilibili, use the URL tool with `?p=N` to select one part; b23 short links follow their resolved target part, while plain Bilibili URLs and the BV-ID tool process P1. Pass only a `job_id` to `bilibili_get_video_speech_text_job`.
For Instagram, use the URL tool for a regular video post or Reels link and the post-ID tool for a numeric `post_id`; photo and carousel posts are unsupported. Pass only a `job_id` to `instagram_get_video_speech_text_job`.
For X / Twitter, use the URL tool for a video post link and the post-ID tool for a numeric `post_id`; only the current post's first video with an available MP4 variant is processed, not quoted or reposted post media. Pass only a `job_id` to `x_get_video_speech_text_job`.
For Zhihu, use the URL tool for an independent `/zvideo/{zvideo_id}` page or a video-answer `/question/{question_id}/answer/{answer_id}` page. The numeric `zvideo_id` tool remains independent-video only; do not pass an answer ID or temporary `video.play_url`. Plain answers without video return no processable media. Pass only a `job_id` to `zhihu_get_video_speech_text_job`.
For YouTube, use the URL tool for a video, youtu.be, or Shorts link and the video-ID tool for an 11-character `video_id`. Pass only a `job_id` to `youtube_get_video_speech_text_job`.
Do not start a duplicate transcript job only to poll status. If an MCP response is non-terminal, you must call `data.next_action.tool_name` with `data.next_action.arguments` exactly as returned; those arguments include the same `job_id`. The next response may still be non-terminal. Continue until `is_terminal` is `true`.

## Output Guidance

Return the transcript text and content context when available; include content IDs, titles or descriptions, author facts, and duration when the response provides them.
This v1 surface does not return summary.
When a job is still running, continue querying the same `job_id` until a terminal result is available; only surface `job_id`, status, and next action if the tool cannot continue, the command/session is interrupted, the bounded wait window is reached, or the user asks to stop.
If the result says no processable video resource is available or the job failed, report that as the observed job result instead of retrying with another platform.

## Troubleshooting

- If SocialDataX CLI or its dependencies are missing, or an npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. Install or repair task dependencies only within the user's existing authorization, preferably in the project or a temporary environment. Execution permissions are not user authorization; explain and obtain approval before changes outside that scope, including global installs, runtime upgrades, or system configuration changes. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- Credential source: identify whether this request uses CLI or MCP. For CLI, run `auth status` in the actual execution environment to identify environment or local-file credentials. For MCP, check the authentication configuration of the current connection, without requiring a local CLI variable. If configuration is missing, follow the API Key section for user-entered hidden local login. Do not expose Keys, Authorization headers or secret configuration values.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not submit another job or keep polling. Show the official billing link in the error (https://socialdatax.com/dashboard/billing, including any channel parameters); if absent, use https://socialdatax.com/dashboard/billing. After recharging, resume the failed call; if a job or partial results already exist, follow the corresponding job-query or pagination recovery rules.
- If the user has recharged but still sees insufficient balance, have the user confirm in the relevant account dashboard that this request uses the recharged account, following the credential source above. If an update is needed, have the user update the effective CLI configuration or MCP connection, reload as documented, and resume the original command. Do not require reconfiguration just because the primary local variable is absent, or expose credential values.
- If a transcript `job_id` already exists, only check that same job; do not submit the video again.
