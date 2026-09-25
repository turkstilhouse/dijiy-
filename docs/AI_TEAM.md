# DİJİY AI TEAM

ARAS is the central orchestrator. Fatma Gül is the final human decision-maker for irreversible, financial, legal, credential and major product decisions.

## Core
- ARAS — Chief Systems Architect & Strategy
- KAYRA — Chief Software Engineer & Application
- ÜRÜN — Product & Ecosystem
- ENTEGRASYON — DİJİY Connect & Provider

## Data / Intelligence
- VERİ — Data & Measurement
- ARAŞTIRMA — Research & Market Intelligence
- ARŞİV — Turkish Culture Archive & Knowledge
- RAPOR — Reporting & Audit

## Commerce / Operations
- PAZAR — Marketplace
- MÜŞTERİ — CRM & Customer
- KUMAŞ — Fabric & Supply
- MALİYET — Costing & Pricing
- ÜRETİM — Production Coordination
- ERMES — Marketing & Advertising OS

## Creative / Spatial
- TASARIM — Design
- UZAY — 3D / Spatial / Digital Worlds
- DÜNYA — Global Culture, Language & Localization

## Trust
- GÜVENLİK — Security, Risk & QA

Agents are capability-based. ARAS routes work to agents and providers through canonical DİJİY contracts. External tools are replaceable providers, not the source of truth.


## TEAM SYNCHRONIZATION — 2026-09-25

The team is synchronized around the current DİJİY AI Control Plane baseline and the latest agent ecosystem.

- ARAS owns orchestration, task contracts, routing, policy coordination, evidence, verification and execution-state coordination.
- GÜVENLİK treats external models, agents, MCP servers, A2A endpoints, browser sessions and retrieved memory as trust-boundary crossings.
- ENTEGRASYON owns provider adapters and MCP/A2A connectivity; external providers remain replaceable.
- VERİ owns canonical normalization, provenance, confidence and measurement.
- RAPOR records execution, evidence, policy decisions, approvals, failures, cost and evaluation results.
- KAYRA follows the controlled coding path: understand → plan → minimal change → test/scan → review → PR.
- ARAŞTIRMA tracks provider capability changes and converts material changes into evaluations before routing changes.
- All agents use the shared R0–R5 risk model, resource budgets, kill-switch contract and evaluation gates.

### Current ecosystem intelligence
- OpenAI has released GPT-6 Sol/Luna and a public-beta Agents API with managed orchestration, durable sessions, tools/MCP and hosted or external sandboxes. DİJİY consumes these through adapters, not as a canonical runtime.
- GPT-6 Astra targets complex end-to-end reasoning, coding, computer use, research and document work. These capabilities remain behind DİJİY policy and evaluation gates.
- Anthropic has released Claude Opus 5.5 for long-running agentic coding and knowledge work, with lower stated operating cost than Opus 5. It should be benchmarked as a replaceable provider.
- Google Agentic Resource Discovery (ARD) defines a federated pattern for publishing, discovering and cryptographically verifying agents, skills and tools. DİJİY Capability Registry remains canonical while compatibility with federated discovery can be added.

### Synchronization rule
No agent may independently redefine canonical data, permissions, risk class, approval state, provider trust, evaluation status or production authority. New capabilities enter through registry → policy → resource → evidence → evaluation → approval.


## LATEST TEAM UPDATE — 2026-09-25

- GPT-6 Sol/Luna are now current provider candidates. Route by measured task quality, latency and cost; do not hard-code a model.
- GPT-6 Astra adds async tool calling, mid-turn steering and dynamic reasoning effort. ARAS/Execution Engine should treat pending tool work and steering as first-class execution events.
- OpenAI Agents API is public beta with durable sessions, context compaction/recovery, tools/MCP and hosted or external sandboxes. ENTEGRASYON/KAYRA should expose this only through the existing AgentRuntime adapter.
- MCP 2026-07-28 is a stateless protocol core with Tasks, authorization hardening, extensions and MCP Apps. ENTEGRASYON should design DİJİY Connect for stateless horizontal scaling and explicit task state owned by DİJİY.
- A2UI is a declarative agent-driven UI format. UZAY/ÜRÜN should evaluate it as a possible dynamic-interface transport; untrusted agents must never send executable UI code.
- OpenAI has added organization/project API-key governance and key-expiration controls. GÜVENLİK should map these to DİJİY credential lifecycle, rotation and least-privilege controls.
- GPT-6 supports long-context workloads and prompt caching. VERİ/ARAS should measure cache hit rate, context size, latency and cost as execution telemetry.
- OpenAI's current model guidance positions Astra for hardest work, Sol for demanding reasoning/agentic work and Luna for efficient repeatable work. This is provider guidance, not DİJİY routing policy; routing remains evaluation-based.

### Immediate architecture implications
1. Add async tool/pending-work states to the execution contract before adopting Astra-style async tools.
2. Keep provider runtime state outside canonical DİJİY task state; persist only normalized execution state and provenance.
3. Add MCP statelessness and authorization tests to ENTEGRASYON/GÜVENLİK evals.
4. Add dynamic-UI security tests for A2UI-style declarative messages.
5. Add model cost/cache/latency dimensions to RAPOR/VERİ evaluation telemetry.
6. Do not switch production routing solely because a new model/provider is released.
