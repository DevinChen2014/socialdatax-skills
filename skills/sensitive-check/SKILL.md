---
name: "sensitive-check"
description: "Check draft text for 敏感词检测, 违禁词检查, content safety, copy compliance, and safer rewrite suggestions before publishing. Supports generic, xhs, douyin, and kuaishou contexts through SocialDataX."
source_client: "socialdatax-skills"
source_platform: "npm"
source_skill: "sensitive-check"
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
    emoji: "🛡️"
    homepage: "https://socialdatax.com/?from=npm"
---
<!-- AUTO-GENERATED from socialdatax-skill-source. Do not edit directly; run `node scripts/generate_socialdatax_skills.mjs`. -->

# 敏感词检测与违禁词检查

Use this skill when the user wants 敏感词检测, 违禁词检查, 敏感检测, 文案合规, 发布前检查, 能不能发, sensitive words, prohibited words, content safety review, or platform-aware review for text drafts before publishing.

Current platform support:

- Text sensitive-content detection through `check_sensitive_text` for `generic`, `xhs`, `douyin`, and `kuaishou` contexts.

## API Key

Use `SOCIALDATAX_API_KEY` for SocialDataX requests. The only official website for requesting or managing API access is <https://socialdatax.com/?from=npm>. If a user asks where to get a key, provide only this URL; do not infer alternate domains.
获取或管理 API Key：访问 <https://socialdatax.com/?from=npm>，按官网的 API Key 申请/管理入口操作。环境变量名固定使用 `SOCIALDATAX_API_KEY`；不要引导用户使用其他域名。

## Preferred Direct CLI

Prefer the direct CLI when the agent can run shell commands. It does not require MCP server configuration:

```bash
npx -y socialdatax-skills@latest sensitive-check text \
  --text "<content>" --platform xhs --pretty --source-client socialdatax-skills \
  --source-platform npm --source-skill sensitive-check
```

Required arguments:

- `sensitive-check text --text <content>`: required text to check. Use the user's draft text for analysis, but do not store it in the skill.

Optional arguments:

- `--platform <generic|xhs|douyin|kuaishou>`: platform context; default is `generic`.
- `--pretty`: output formatting only.
- `--source-client socialdatax-skills --source-platform npm --source-skill sensitive-check`: usage attribution for this Agent Skill; keep these values unchanged when running examples from this Skill.

适用于敏感词检测、违禁词检查、文案发布前检查、content safety review、文案合规审核、能不能发判断和 safer rewrite suggestions for draft text.
The command prints JSON with `platform`, `tool`, and `data`; it does not echo the original text back in CLI arguments. The service returns `violation`, `risk_level`, `types`, `highlights`, `summary`, `platform`, and `suggestions` when available.
Service note: SocialDataX service records the submitted text and structured detection result for history, billing, and troubleshooting; the local CLI does not write API keys to local files or write local text copies.
This v1 skill checks text only. Image sensitive detection is intentionally out of scope until a separate image tool is published.

## Safety Boundary

This skill is read-only. It uses `SOCIALDATAX_API_KEY` from the user's environment at runtime. Generated Skill files do not contain API keys. It does not read local browser data or perform login, posting, liking, commenting, or account changes. Prefer the direct CLI; hosted MCP tools are optional when the current agent already supports authenticated streamable HTTP MCP.

## MCP Tools

MCP tools matching the direct CLI commands above:

- `check_sensitive_text`

If MCP tools are already available in the current agent, call `check_sensitive_text` with `text` and optional `platform`: `generic`, `xhs`, `douyin`, or `kuaishou`.

## Output Guidance

Report whether there is a violation, the risk level, detected types, brief highlights, and concrete rewrite suggestions.
Do not echo the full original text back unless the user explicitly asks; prefer short highlights and safer rewrite guidance.
