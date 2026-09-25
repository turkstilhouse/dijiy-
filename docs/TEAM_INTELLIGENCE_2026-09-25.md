# DİJİY TEAM INTELLIGENCE — 2026-09-25

## Current updates

OpenAI's September API updates include GPT-6 Sol/Luna, GPT-6 Astra, the public-beta Agents API, async tool calling, mid-turn steering, API-key governance and expiration controls, and prompt caching. MCP's 2026-07-28 specification introduces a stateless protocol core, Tasks, authorization hardening and MCP Apps. Google A2UI provides a declarative, native-first format for agent-generated interfaces.

## DİJİY decisions

- Models and runtimes are adapters, never canonical.
- ARAS owns routing and execution policy.
- Async tool work must have explicit DİJİY execution state and resource accounting.
- MCP state and provider session state must not become the canonical task state.
- MCP discovery is not trust; identity, provenance, authorization and policy checks remain mandatory.
- Agent-generated UI must be declarative and restricted to a trusted component catalog.
- Model routing is evaluation-based, using task quality, evidence, cost, latency, cache behavior and reliability.
- Credential lifecycle must include expiration, rotation, least privilege and audit.

## Priority work

P1: async execution-state contract.
P1: MCP stateless/authorization evaluation suite.
P1: credential lifecycle controls.
P1: model cost/cache/latency telemetry.
P2: A2UI-compatible dynamic interface evaluation.
P2: federated capability discovery compatibility.

## Sources

OpenAI API Changelog: https://developers.openai.com/api/docs/changelog
OpenAI model guidance: https://developers.openai.com/api/docs/guides/latest-model
MCP 2026-07-28: https://blog.modelcontextprotocol.io/posts/2026-07-28/
Google A2UI: https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/
