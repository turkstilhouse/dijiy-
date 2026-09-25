# DİJİY AI Evaluation Contract

Status: DESIGN BASELINE
Date: 2026-09-25

## Purpose

No model, agent, prompt, tool, memory system or provider is promoted because of vendor claims alone.

DİJİY-specific evaluation determines production readiness.

## Evaluation dimensions

Every production-capable agent is evaluated for:
- task success
- factual accuracy
- evidence quality
- citation correctness
- tool selection
- tool arguments
- policy compliance
- security resistance
- memory correctness
- memory freshness
- consistency
- recovery
- latency
- token efficiency
- cost
- regression behavior

## Evaluation levels

L0 unit/deterministic checks.
L1 capability tests.
L2 regression tests.
L3 adversarial/security tests.
L4 long-horizon workflow tests.
L5 production shadow evaluation.
L6 human acceptance for high-impact workflows.

## Golden datasets

Each important agent maintains a versioned evaluation set containing:
- normal cases
- edge cases
- failure cases
- adversarial cases
- long-horizon cases
- tool-use cases
- memory cases

Every confirmed production failure should become a regression case unless intentionally excluded with documented reasoning.

## Unknown and uncertainty

Agents may return:
KNOWN
LIKELY
UNCERTAIN
CONFLICTING
UNKNOWN

The evaluator must not reward confident unsupported answers.

## Change gate

Changes to any of the following trigger relevant evaluations:
- model
- system prompt
- tool definition
- MCP server
- A2A contract
- memory policy
- retrieval logic
- routing rule
- security policy
- agent code
- workflow

## Promotion gate

PROPOSED → EVALUATED → SECURITY_CHECKED → COST_CHECKED → APPROVED → ACTIVE.

Failed evaluation blocks promotion unless an authorized human records an explicit exception.

## Anti-gaming rule

An evaluator must not rely only on the same model or prompt being evaluated. Where practical, verification uses independent tests, deterministic checks, external evidence or a separate evaluator.

## Metrics

Track per agent/provider:
success rate
verified accuracy
unsupported-claim rate
tool error rate
policy violation rate
security attack success rate
average/p95 latency
input/output tokens
cost per successful task
retry rate
human approval rate
human override rate
failure recurrence rate

## Core principle

DİJİY improves through evidence-driven failure reduction, not through unrestricted self-modification.
