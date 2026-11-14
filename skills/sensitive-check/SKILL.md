---
name: "sensitive-check"
description: "Check draft text for 敏感词检测, 违禁词检查, content safety, copy compliance, and safer rewrite suggestions before publishing. Supports generic, xhs, douyin, and kuaishou contexts through SocialDataX."
source_client: "socialdatax-skills"
source_platform: "github"
source_skill: "sensitive-check"
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
    emoji: "🛡️"
    homepage: "https://socialdatax.com/ai?from=github"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 敏感词检测与违禁词检查

Use this skill when the user wants 敏感词检测, 违禁词检查, 敏感检测, 文案合规, 发布前检查, 能不能发, sensitive words, prohibited words, content safety review, or platform-aware review for text drafts before publishing.

Current context support:

- Text sensitive-content detection through `check_sensitive_text` for `generic`, `xhs`, `douyin`, and `kuaishou` contexts.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/ai?from=github>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/ai?from=github>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。
- Before a CLI call requiring an API Key, run `npx -y socialdatax-skills@latest auth status` in the actual execution environment. It makes no paid request and reports only `apiKeyReadable` and source `environment` / `file` / `null`, never the Key. Reuse working configuration; handle command, permission and malformed-file errors as reported instead of treating every failure as a missing Key. Authenticated hosted MCP keeps its current connection authentication and needs no separate local CLI setup.
- If missing, have the user obtain a Key from the official URL above and run `npx -y socialdatax-skills@latest auth login` in their own local terminal, entering it at the hidden prompt. The CLI saves it under that terminal user's home at `.config/socialdatax/credentials.json`, with mode 600 on Unix or a private current-user ACL on Windows; saving fails if permissions cannot be restricted. Never put the Key in AI chat, model-captured input, logs, screenshots, command history, Skill files or version control. The Agent must not read or display credential-file content.
- Each CLI invocation reads the private user file without depending on a client loading shell configuration or changing client/system settings. A nonempty `SOCIALDATAX_API_KEY` has priority, then the existing legacy variable, then the file. Saving a file does not replace an effective environment credential. For authentication failures, check the actual source/account and have the user correct it locally while preserving other configuration.
- After local entry, rerun `auth status` in the same environment as the business command. If false, stop business calls and check the OS user, home directory and file access. True only means readable credentials; authentication and results are determined by the original business response, without an extra paid call solely to check configuration.
- Remote/container CLI runs use the remote/container user's configuration; a local file does not transfer automatically. Use interactive login there only with an interactive terminal and persistent home; otherwise use the deployment platform's supported Secret/environment injection. Explain persistence or sandbox limits without copying Keys into chat, project files or temporary command arguments, or bypassing isolation.
- When persistence acceptance is requested, fully quit the client and background execution processes, reopen, recheck, then resume the original request. Normal use reuses verified configuration without repeated restarts or entry.

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest sensitive-check text \
  --text "<content>" --platform xhs --pretty --source-client socialdatax-skills \
  --source-platform github --source-skill sensitive-check
```

Required arguments:

- `sensitive-check text --text <content>`: required text to check. Use the user's draft text for analysis, but do not store it in the skill.

Optional arguments:

- `--platform <generic|xhs|douyin|kuaishou>`: platform context; default is `generic`.
- `--pretty`: output formatting only.
- `--source-client socialdatax-skills --source-platform github --source-skill sensitive-check`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

适用于敏感词检测、违禁词检查、文案发布前检查、content safety review、文案合规审核、能不能发判断和 safer rewrite suggestions for draft text.
The command prints JSON with `platform`, `tool`, and `data`; it does not echo the original text back in CLI arguments. The service returns `violation`, `risk_level`, `types`, `highlights`, `summary`, `platform`, and `suggestions` when available.
Service note: SocialDataX service records the submitted text and structured detection result for history, billing, and troubleshooting; business calls do not save API keys or local text copies; only explicit `auth login` saves a private local credential.
This v1 skill checks text only. Image sensitive detection is intentionally out of scope until a separate image tool is published.

## Safety Boundary

This skill is read-only. CLI calls use existing environment credentials or the user’s explicitly saved private local credential file. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `check_sensitive_text`

If MCP tools are already available in the current agent, call `check_sensitive_text` with `text` and optional `platform`: `generic`, `xhs`, `douyin`, or `kuaishou`.

## Output Guidance

Report whether there is a violation, the risk level, detected types, brief highlights, and concrete rewrite suggestions.
Do not echo the full original text back unless the user explicitly asks; prefer short highlights and safer rewrite guidance.

## Troubleshooting

- Credential source: identify whether this request uses CLI or MCP. For CLI, run `auth status` in the actual execution environment to identify environment or local-file credentials. For MCP, check the authentication configuration of the current connection, without requiring a local CLI variable. If configuration is missing, follow the API Key section for user-entered hidden local login. Do not expose Keys, Authorization headers or secret configuration values.

- If an SDK/dependency, npm network, Node.js/npm/npx availability, permission, or missing runtime error appears, treat it as a local runtime, dependency installation, network, or agent authorization issue, not a SocialDataX API key or business data error. Install or repair task dependencies only within the user's existing authorization, preferably in the project or a temporary environment. Execution permissions are not user authorization; explain and obtain approval before changes outside that scope, including global installs, runtime upgrades, or system configuration changes. When network or execution authorization is needed, ask the user to approve or finish authorization, then continue the same command; do not use public web search as a substitute for SocialDataX data.
- For non-balance network or API errors, preserve the error message, check the effective credential source above, parameters, and link or ID format, then retry once when appropriate.
- If the response returns `insufficient_balance` or says the balance/credits are insufficient, do not retry repeatedly. Show the official billing link in the error (https://socialdatax.com/dashboard/billing, including any channel parameters); if absent, use https://socialdatax.com/dashboard/billing. After recharging, resume the failed call; if a job or partial results already exist, follow the corresponding job-query or pagination recovery rules.
- If the user has recharged but still sees insufficient balance, have the user confirm in the relevant account dashboard that this request uses the recharged account, following the credential source above. If an update is needed, have the user update the effective CLI configuration or MCP connection, reload as documented, and resume the original command. Do not require reconfiguration just because the primary local variable is absent, or expose credential values.
