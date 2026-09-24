# DİJİY Execution Loop v2

## Purpose

Move the DİJİY runtime from orchestration record creation toward a controlled, provider-independent execution loop.

## Canonical flow

1. Task enters the DİJİY task/workflow layer.
2. ARAS determines objective, scope, complexity, required agents, tools, and risk.
3. Policy Gate evaluates permissions, data scope, tool scope, budget, and action risk.
4. Routing selects an agent and provider adapter without coupling business logic to a model vendor.
5. Agent execution produces a structured result with provenance, tool calls, costs, and status.
6. Tool calls pass through the integration/tool boundary.
7. External side effects require the configured risk gate; irreversible, financial, legal, credential, or publication actions require human approval.
8. Results are normalized into the canonical DİJİY data model.
9. Audit events record the execution path and material decisions.
10. ARAS receives the result and either continues, requests another agent, waits for approval, or completes the task.
11. Failures are retried according to policy; provider failure must not corrupt canonical state.
12. Final outputs are persisted with source/provenance and linked artifacts.

## Required contracts

- TaskContract
- AgentAssignmentContract
- ToolInvocationContract
- ProviderInvocationContract
- PolicyDecisionContract
- ApprovalRequestContract
- ExecutionResultContract
- AuditEventContract
- DataProvenanceContract

## Runtime states

queued -> planning -> policy_check -> routed -> running -> tool_execution -> result_validation -> completed

Alternative states:

waiting_approval
retry_scheduled
degraded
failed
cancelled

## Provider independence

No domain workflow may depend directly on OpenAI, Anthropic, Google, or another model provider. Provider adapters implement a common invocation contract. The selected provider/model is runtime configuration.

## Failure isolation

A provider outage, connector outage, malformed model response, rate limit, or tool failure must remain isolated to the affected execution. Canonical records remain authoritative and idempotent.

## Human control

Human approval is mandatory before irreversible external actions, financial/legal commitments, credential changes, sensitive permission changes, and publication/budget actions when configured by policy.

## Next implementation sequence

1. Define canonical execution contracts.
2. Add idempotency and execution correlation IDs.
3. Wire policy gate into the worker path.
4. Add provider-adapter invocation boundary.
5. Add structured tool invocation and result validation.
6. Persist audit/provenance for every material execution.
7. Add approval pause/resume semantics.
8. Add retry/dead-letter handling.
9. Add end-to-end execution tests.
10. Promote only after security and failure-path verification.
