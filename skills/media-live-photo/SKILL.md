---
name: "media-live-photo"
description: "Use when the user wants to turn one JPEG or PNG into an Apple Live Photo and Android Motion Photo, or check a pending 实况图生成 task. Provided by 社媒数据助手 SocialDataX."
source_client: "socialdatax-skills"
source_platform: "github"
source_skill: "media-live-photo"
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
    emoji: "📷"
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# Media Live Photo

Use this skill to create Apple and Android 实况图 from a single local JPEG/PNG, a directly accessible image URL, or an uploaded image_id. Use a returned job_id to check an existing generation.

Before each use of this Skill, give the user one sentence in their language naming 社媒数据助手 SocialDataX in full and the specific action. Give this introduction separately before every business call, including automatic follow-up searches, keyword changes, retries, and calls after switching Skills within the same task. For example: “I’ll continue using 社媒数据助手 SocialDataX to check …”. Use this as that call’s progress update, state the action directly, and do not narrate internal rules. Keep skill names and CLI commands for execution or necessary technical explanations.

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

Use the direct CLI for a local image or when the hosted MCP tools are unavailable. It submits the image to the SocialDataX HTTP API and polls the same task for up to 60 seconds.

```bash
npx -y socialdatax-skills@latest live-photo generate \
  --file "<path_to_jpeg_or_png>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-live-photo

npx -y socialdatax-skills@latest live-photo generate \
  --image-id "<image_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-live-photo

npx -y socialdatax-skills@latest live-photo get \
  --job-id "<job_id>" --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill media-live-photo
```

Optional arguments:

- `--source-client socialdatax-skills --source-platform github --source-skill media-live-photo`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

When the user already has a job_id, query that job. Generate a new task only when they want a new output. A successful generation costs 1 point and yields both formats.
For a public HTTP(S) image URL, replace the local --file option with --url. For an image uploaded with the same account, use --image-id. Choose one source per generation.
Use the default subtle push unless the user selects a motion or asks you to choose one. Use pan for a wide composition and diagonal for a stylized reveal. Add --effect push|pan|diagonal and --strength low|medium when you need to set them.

## Safety Boundary

Submit one image at a time, using only the image the user asks to convert. Use the existing job_id for follow-up calls. Deliver the files or download links and let the user choose where to publish them.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `media_submit_live_photo_by_image_url`
- `media_submit_live_photo_by_image_id`
- `media_get_live_photo_job`

If the hosted MCP connection at https://mcp.socialdatax.com/live-photos/mcp is available, submit a public image with `media_submit_live_photo_by_image_url` or an uploaded image with `media_submit_live_photo_by_image_id`.
When a tool returns a pending job, use `media_get_live_photo_job` with the same job_id. For a local file, use the CLI example.

## Output Guidance

On success, give the user the Apple JPG/MOV ZIP and Android Motion Photo JPG links from result.outputs and the MP4 preview link from result.preview. Preserve the original file bytes. Phone and app import support varies.
The CLI prints a newly submitted pending job_id to stderr. If the wait ends, a query fails, or the command is interrupted, use the get command with that job_id to continue. Query the job again to refresh an expired download link within the retention period. Explain any terminal failure before asking the user to generate again.

## Troubleshooting

- If SocialDataX CLI or its dependencies are missing, or an npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. Install or repair task dependencies only within the user's existing authorization, preferably in the project or a temporary environment. Execution permissions are not user authorization; explain and obtain approval before changes outside that scope, including global installs, runtime upgrades, or system configuration changes. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- Credential source: identify whether this request uses CLI or MCP. For CLI, run `auth status` in the actual execution environment to identify environment or local-file credentials. For MCP, check the authentication configuration of the current connection, without requiring a local CLI variable. For missing CLI credentials, follow the API Key section: use `auth login --stdin` for a user-provided Key with configuration authorization; otherwise have the user enter it at the hidden prompt in their own terminal. Do not expose Keys, Authorization headers or secret configuration values.
- If a query fails, continue using the printed job_id. If the submit response was lost before a job_id was returned, explain that the task may have been created and get the user's approval before submitting again.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the official billing link in the error (https://socialdatax.com/dashboard/billing, including any channel parameters); if absent, use https://socialdatax.com/dashboard/billing. After recharging, resume the failed call; if a job or partial results already exist, follow the corresponding job-query or pagination recovery rules.
- If the user has recharged but still sees insufficient balance, have the user confirm in the relevant account dashboard that this request uses the recharged account, following the credential source above. If an update is needed, have the user update the effective CLI configuration or MCP connection, reload as documented, and resume the original command. Do not require reconfiguration just because the primary local variable is absent, or expose credential values.
