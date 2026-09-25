# DİJİY AI TEAM

ARAS is the central orchestrator. Fatma Gül is the final human decision-maker for irreversible, financial, legal, credential and major product decisions.

## Core
- ARAS — Chief Systems Architect & Strategy
- KAYRA — Chief Software Engineer & Application
- ÜRÜN — Product & Ecosystem
- ENTEGRASYON — DİJİY Connect & Provider
- CODEX RUNTIME — External controlled coding/runtime provider for KAYRA; replaceable and never canonical

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

Agents are capability-based. ARAS routes work through canonical DİJİY contracts. External tools and runtimes, including Codex, are replaceable providers and never the source of truth.

## CODEX RUNTIME INTEGRATION

Codex is registered as an external execution provider for KAYRA, not as a canonical DİJİY agent. Lifecycle:
DİJİY task → ARAS policy/risk gate → KAYRA coding workflow → Codex runtime → tests/scans → independent review → PR → human merge.

Controls: R0–R5 policy, resource budgets, kill switch, audit, verification, no direct production authority, no secrets in prompts/source, and runtime state normalized into DİJİY only through provider contracts.

Current connector status: GitHub repository access is available. No runnable remote Codex environment is currently registered through Codex Tasks, so the role is integrated architecturally but is not falsely reported as executable.

## SYNCHRONIZATION
ARAS owns orchestration and policy coordination. GÜVENLİK owns trust boundaries. ENTEGRASYON owns provider/MCP/A2A/Codex connectivity. VERİ owns canonical normalization and provenance. RAPOR owns audit/evaluation reporting. KAYRA owns controlled coding. ARAŞTIRMA tracks provider changes. All agents use shared R0–R5, resource, kill-switch and evaluation gates.
