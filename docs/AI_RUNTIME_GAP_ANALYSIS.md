# DİJİY AI Runtime Gap Analysis

Date: 2026-09-25
Status: DECISION BASELINE

## Decision

DİJİY should not continue expanding its own generic multi-agent runtime before validating a managed AI Workforce runtime.

Primary candidate: Relevance AI Workforce.
Secondary candidate: n8n for integration/automation.
Optional candidate: Dify for AI application/workflow surfaces.

The external runtime is an adapter. DİJİY remains the canonical control plane and system of record.

## Why Relevance AI is the primary runtime candidate

Current public product documentation shows:
- multi-agent Workforces with handoffs, branching and parallel execution;
- tool-level and connection-level approval controls;
- execution limits and human approval;
- built-in evals, production monitoring and cost visibility;
- MCP support for Codex/Claude Code/Cursor;
- API deployment/triggering;
- large app-integration coverage.

This overlaps substantially with the generic runtime functionality currently being implemented in DİJİY.

## Keep in DİJİY

DİJİY must continue to own:
- identity, users, organizations and workspaces;
- canonical task contracts;
- canonical business/domain data;
- tenant isolation and permissions;
- DİJİY R0-R5 policy and risk model;
- canonical evidence/provenance/confidence;
- approval authority and human decision records;
- audit/event contracts;
- provider selection and routing policy;
- resource/cost policy;
- kill-switch authority;
- canonical execution state and reconciliation;
- provider adapter interfaces;
- evaluation contracts and release gates;
- portability and migration paths.

## Candidate runtime responsibilities

A Workforce provider may own:
- agent process execution;
- agent-to-agent handoffs;
- generic tool execution orchestration;
- generic queues and scheduling;
- model invocation plumbing;
- generic retries;
- runtime traces;
- workforce UI;
- provider-side agent evaluations.

DİJİY must still receive normalized execution events and must remain authoritative for permissions and consequential side effects.

## n8n role

n8n is best treated as an integration/automation runtime, not as DİJİY's canonical control plane. Its strengths are broad integrations, self-hosting, deterministic workflow nodes, code steps, MCP and human-in-the-loop controls.

Potential pattern:
ARAS policy -> n8n workflow adapter -> external system -> normalized result -> DİJİY.

## Dify role

Dify is a strong optional runtime for AI application/workflow surfaces, knowledge retrieval, human review, API exposure and MCP. It should not replace DİJİY identity, canonical data or governance.

## Migration strategy

Do not delete the existing AI Control Plane yet.

Phase 1: introduce provider-neutral WorkforceProvider and AutomationProvider contracts.
Phase 2: build a Relevance AI proof-of-concept for one low-risk R1/R2 workload.
Phase 3: compare reliability, latency, cost, observability, approval behavior, portability and data-boundary behavior.
Phase 4: route selected workloads through the external runtime.
Phase 5: retire duplicate generic runtime code only after parity evidence exists.

## Non-negotiables

- No provider API key in client bundles.
- No external runtime becomes canonical.
- R4/R5 actions remain subject to DİJİY policy and human approval.
- External runtime output is untrusted until normalized and verified.
- Provider outage must not corrupt canonical DİJİY state.
- Every external execution needs task/execution correlation and idempotency.
- Provider replacement must not require domain/business-logic rewrites.
