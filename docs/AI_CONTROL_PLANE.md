# DİJİY AI Control Plane — ARAS

Status: DESIGN BASELINE
Date: 2026-09-25

## Purpose

ARAS is the DİJİY AI Control Plane. It coordinates intelligence, agents, tools, data, budgets, verification, security and execution without making any external AI provider the source of truth.

## Core rule

AI providers, agent frameworks, memory engines, browser systems, creative engines and observability vendors are replaceable adapters.

DİJİY owns:
- task contracts
- agent identities
- capability registry
- policy decisions
- resource budgets
- evidence/provenance
- approval state
- canonical data
- audit records
- evaluation contracts
- execution state

## Execution lifecycle

REQUESTED → CLASSIFIED → PLANNED → RESEARCHING → GENERATING → VERIFYING → POLICY_CHECK → APPROVAL_REQUIRED/APPROVED → EXECUTING → OBSERVING → EVALUATING → COMPLETED/FAILED

No external side effect may bypass POLICY_CHECK.

## ARAS modules

1. Task Router — classifies intent, risk and required capabilities.
2. Intelligence Router — selects model/provider by capability, quality, cost and latency.
3. Agent Router — selects the minimum capable specialist set.
4. Resource Governor — limits tokens, cost, time, tool calls, retries, parallelism and compute.
5. Context Manager — retrieves only task-relevant context and prevents uncontrolled context growth.
6. Evidence Engine — records claims, sources, provenance, freshness and verification state.
7. Verifier/Critic — challenges outputs before consequential execution.
8. Confidence Engine — computes DİJİY confidence from evidence and validation, not model self-confidence.
9. Risk Engine — classifies action risk and blast radius.
10. Policy Engine — evaluates identity, permissions, scope and action policy.
11. Approval Engine — requests human approval only where risk requires it.
12. Capability Registry — declares what every agent/tool/provider can and cannot do.
13. MCP Gateway — controls agent-to-tool/data access.
14. A2A Gateway — controls agent-to-agent communication and trust boundaries.
15. Sandbox Manager — isolates code and untrusted execution.
16. Memory Trust Layer — separates candidate memories from verified institutional knowledge.
17. Eval Engine — runs capability, regression, security, cost and reliability evaluations.
18. Observability — emits OpenTelemetry-compatible traces, metrics and logs.
19. Audit — append-only record of decisions, tool calls, approvals and side effects.
20. Kill Switch — terminates active execution and revokes temporary execution authority.

## Autonomy model

R0 read-only: automatic.
R1 analysis/research: automatic within policy.
R2 draft/create: automatic where reversible.
R3 modify existing state: policy-controlled.
R4 publish/send/deploy: explicit approval.
R5 delete/payment/credential/security-policy changes: mandatory human approval plus technical gate.

## Intelligence model

Generator → Evidence → Critic → Verifier → Governor → Action.

Self-check is never treated as sufficient proof for high-impact actions.

## Deterministic-first rule

If a task can be solved reliably by deterministic code, database constraints, policy logic or a tested calculation service, use that mechanism instead of an LLM.

AI is used where interpretation, synthesis, planning, generation or adaptive tool selection adds value.

## Failure policy

Every long-running task must support:
- timeout
- bounded retry
- idempotency key
- checkpoint
- resume
- circuit breaker
- failure classification
- human escalation
- kill switch

## Provider portability

Internal interfaces must isolate:
AIProvider, AgentRuntime, WorkforceProvider, AutomationProvider, MemoryProvider, SearchProvider, BrowserProvider, CreativeProvider, StorageProvider, ObservabilityProvider.

External AI Workforce and automation runtimes are adapters. Relevance AI and n8n are current candidates; neither becomes canonical.

A provider replacement must not require changes to canonical business logic.
