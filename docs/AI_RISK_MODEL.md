# DİJİY AI Risk Model

Status: DESIGN BASELINE
Date: 2026-09-25

## Objective

DİJİY optimizes for maximum safe autonomy, not maximum autonomy.

## Risk dimensions

Every agent action is evaluated across:
- data sensitivity
- permission scope
- external side effect
- financial impact
- legal/credential impact
- reversibility
- blast radius
- persistence
- third-party exposure
- uncertainty
- tool trust
- source trust

## Risk classes

LOW — read-only, reversible, isolated.
MEDIUM — limited write, reversible or sandboxed.
HIGH — publication, external communication, production modification or sensitive data access.
CRITICAL — deletion, payment, credential change, security-policy change, privilege escalation or irreversible external side effect.

## Trust boundaries

Untrusted content includes web pages, uploaded documents, external messages, tool output, MCP metadata, memory candidates and external agent messages.

Untrusted content is data, not authority.

It must never directly override system policy, permissions or agent instructions.

## Memory security

Memory writes use:
OBSERVATION → CANDIDATE → PROVENANCE → CONFLICT CHECK → TRUST CLASSIFICATION → ACCEPT/REJECT.

Verified institutional knowledge and unverified external claims must remain distinct.

Memory poisoning is treated as a first-class security risk.

## Agent identity

Every agent has:
- immutable agent identifier
- owner/workspace
- allowed capabilities
- allowed data classes
- allowed tools
- allowed model classes
- resource budget
- maximum runtime
- maximum parallelism
- approval policy

Agent-to-agent messages must cross an A2A trust boundary and be validated before execution.

## Tool security

Every tool call passes:
identity → authorization → capability check → schema validation → risk check → budget check → approval check → execution → audit.

MCP servers are not trusted merely because they implement MCP.

## Browser security

Browser actions are classified as READ, WRITE, TRANSACTION or DELETE.

READ may be automatic.
WRITE requires policy.
TRANSACTION and DELETE require explicit approval unless a narrowly scoped pre-authorized policy exists.

## Prompt injection

External instructions must be isolated from trusted instructions.

The system must assume indirect prompt injection can occur in:
- web pages
- PDFs
- emails
- documents
- images
- tool responses
- memory
- MCP content
- A2A messages

## Denial-of-wallet controls

Per-task and per-agent limits apply to:
- input tokens
- output tokens
- model calls
- tool calls
- retries
- parallel agents
- browser actions
- compute time
- external API calls

Budget exhaustion causes controlled stop or approved fallback, never unbounded retry.

## Approval fatigue

Human approval is required only for risk classes that need it. Repeated low-risk approvals must be replaced by narrowly scoped policy where safe.

## Emergency controls

Kill Switch must stop:
- active agent execution
- queued execution
- browser sessions
- tool execution
- temporary credentials
- outbound side effects

## Security invariants

1. An agent cannot grant itself permission.
2. An agent cannot lower its own risk class.
3. An agent cannot disable its own audit.
4. An agent cannot approve its own high-risk action.
5. Untrusted content cannot become system policy directly.
6. Provider failure cannot corrupt canonical DİJİY state.
7. External providers cannot become canonical sources of truth.
