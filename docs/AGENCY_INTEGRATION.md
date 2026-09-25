# DİJİY × The Agency Integration

## Purpose

DİJİY integrates with **The Agency / Agency Agents** as an external specialist-agent provider.

DİJİY does **not** copy, vendor, fork, or mirror the Agency roster into the DİJİY core.

The Agency remains the external catalog and installation/runtime layer. DİJİY owns orchestration, identity, permissions, canonical data, audit, policy, and provider abstraction.

## Runtime path

ARAS → DİJİY capability routing → The Agency specialist selection → Codex / supported agent runtime → task execution → result → DİJİY validation + audit → ARAS

The current Agency desktop application installs Agency personas into supported tools such as Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot, Qwen Code, OpenCode and Osaurus. It is an installer/control surface, not itself an agent runtime.

## No-copy rule

The integration must remain zero-vendor:
- no agent persona files copied into DİJİY source;
- no duplicated Agency catalog maintained by DİJİY;
- no dependency on a fixed list of 230+ agents;
- agent discovery must tolerate roster growth and change;
- DİJİY stores only provider metadata, capability mappings, execution references and audit records.

## Codex path

When the Agency desktop app has installed its Codex integration on the execution environment, Codex can use the installed custom agents.

DİJİY project instructions therefore tell KAYRA/ARAS to prefer available Agency specialists for tasks requiring specialist execution, while retaining DİJİY policy and approval gates.

## MCP path

The upstream Agency repository currently has an open PR for an official MCP server that provides dynamic division/agent discovery and task routing without copying hundreds of agent files. That PR is not merged into the upstream main branch yet.

DİJİY must treat that MCP server as an optional provider surface until it is released and its endpoint/package is stable.

## Security

The Agency provider is untrusted external execution infrastructure.
- DİJİY secrets never enter agent persona files.
- Provider credentials remain outside Git.
- Sensitive or irreversible actions require DİJİY approval.
- Agent output is untrusted until validated.
- Every provider invocation receives an idempotency key.
- Provider failures are retryable only within policy.
- Audit records retain provider, agent, run, step and result references.
- The Agency provider cannot become the DİJİY source of truth.

## Verification states

catalog_registered → provider metadata known
runtime_configured → supported runtime is configured to use Agency
runtime_connected → a live execution path has completed a health check
healthy → live invocation + result round-trip verified

The current DİJİY registration remains runtime_connected=false until a real Codex/Agency runtime round-trip is performed.