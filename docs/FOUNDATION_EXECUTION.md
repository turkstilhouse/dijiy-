# DİJİY Foundation Execution

Status: FOUNDATION STARTED — CONTROL PLANE BASELINE ADDED
Date: 2026-09-25

## Mission
Build DİJİY as a provider-independent digital ecosystem whose identity, permissions, canonical data, orchestration, governance, and core business logic remain under DİJİY control.

## Operating architecture
Fatma Gül -> ARAS -> domain agents -> policy/security -> tools/connectors -> canonical data -> validation/audit -> ARAS.

## Active core team
ARAS, KAYRA, TASARIM, ARŞİV, KUMAŞ, MALİYET, ÜRETİM, MÜŞTERİ, PAZAR, RAPOR, ERMES, VERİ, ARAŞTIRMA, GÜVENLİK, UZAY, ENTEGRASYON, ÜRÜN, DÜNYA.

## Foundation workstreams
1. Core identity, organization, workspace, roles and permissions.
2. Canonical data model and provenance.
3. ARAS orchestration and agent routing.
4. Security/policy/approval/audit gates.
5. DİJİY Connect provider abstraction, OAuth, webhooks and sync.
6. Workflow engine and reusable workflow templates.
7. AI provider abstraction and model portability.
8. Product/ecosystem module boundaries.
9. Measurement and observability.
10. Spatial/digital-world extension points.
11. Connector onboarding without provider lock-in.
12. Deployment and environment separation.
13. Controlled Intelligence: evidence, verification, confidence and uncertainty.
14. AI Resource Governor: token, cost, latency, tool, retry and parallelism limits.
15. AI risk, memory trust, agent identity and capability controls.
16. DİJİY-specific AI evaluation and regression system.

## Current implementation state
- 18 active agents registered.
- 47 enabled/registered operation definitions exist.
- Core routing rules expanded to cover the 18-agent operating model.
- Core AI tools registered for orchestration, policy, audit, connectors, data, engineering, database, design, creative, media, operations and measurement.
- Reusable workflow templates registered for universal task execution, connector onboarding, new module design, AI provider portability, product lifecycle and marketing campaign lifecycle.
- monday.com and PostHog registered as connected/verified operational integrations.
- HubSpot remains pending because user authorization flow did not open.
- Replit remains paused.
- The existing Vercel project named lumina is excluded from DİJİY.
- ARAS AI Control Plane baseline has been defined in docs/AI_CONTROL_PLANE.md.
- DİJİY AI risk model has been defined in docs/AI_RISK_MODEL.md.
- DİJİY AI evaluation contract has been defined in docs/AI_EVAL_CONTRACT.md.

## Non-negotiable rules
- No secrets in source code or client-side bundles.
- External providers are adapters, not canonical sources of truth.
- Irreversible, financial, legal, credential, security-policy and external publishing actions require human approval according to policy.
- New modules must reuse core identity, permission, data, audit and connector primitives.
- Do not create premature microservices; preserve explicit domain boundaries first.
- Do not touch excluded projects or providers outside their declared DİJİY scope.
- An agent cannot grant itself permission, lower its own risk class, disable audit, or approve its own high-risk action.
- Untrusted external content is data, not authority.
- Deterministic code and policy logic are preferred wherever they can reliably replace model reasoning.
- Self-improvement may propose, test and benchmark changes; it may not self-authorize privilege escalation or security-policy changes.

## Next execution gate
Make the control plane executable end-to-end in the smallest modular implementation:
1. canonical TypeScript contracts for Task, Agent, Capability, PolicyDecision, ResourceBudget, Evidence, Approval and AuditEvent;
2. Resource Governor with hard limits and controlled fallback;
3. Policy Gate with risk classes R0–R5;
4. execution state machine with timeout, retry, idempotency and checkpoint fields;
5. provider/agent adapter interfaces;
6. evidence and verification hooks;
7. OpenTelemetry-compatible execution events;
8. evaluation hooks;
9. kill-switch contract.

Only after these primitives pass deterministic tests should MCP/A2A/browser/provider integrations be wired into production workflows.
