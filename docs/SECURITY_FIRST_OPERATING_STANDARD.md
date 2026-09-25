# DİJİY Security-First Operating Standard

## Default posture

DİJİY is private-by-default. Source code, secrets, credentials, tokens, internal architecture, customer data, supplier data, AI prompts, execution traces and non-public artifacts must not be exposed through public repositories, public storage, client bundles, logs or unauthenticated endpoints.

## Trust boundaries

- Browser/mobile clients are untrusted.
- External providers are untrusted boundaries.
- Connectors are isolated adapters.
- Supabase service-role credentials never enter client code.
- Provider credentials live in managed secrets storage.
- Canonical DİJİY data remains authoritative and provider-independent.

## Runtime controls

Every background execution is authenticated, scoped to an organization, idempotent and auditable. Failed authorization is fail-closed. Execution steps carry an explicit risk level. Tool and provider invocations must be traceable to an orchestration run and execution step.

## Side-effect controls

Automatic execution is allowed only for operations classified safe by policy. Irreversible external actions, financial/legal commitments, credential changes, sensitive permission changes and publication/budget actions require human approval.

## Repository protection

DİJİY repositories should be Private. Pull requests should be used for structural changes where practical. Secrets must never be committed. Security-sensitive configuration belongs in managed secret storage.

## External service protection

Connected services should use least-privilege scopes, OAuth state/PKCE where applicable, webhook signature validation, token rotation/revocation, rate limiting and provider isolation. External services are replaceable adapters rather than canonical sources of truth.

## Data protection

RLS remains enabled for tenant-scoped data. Internal execution tables are denied to anon/authenticated clients unless an explicit least-privilege policy is later required. Audit and provenance records must not contain raw credentials or unnecessary sensitive payloads.

## Operational principle

Security is a gate, not a later review step. A feature is not considered production-ready until authorization, secret handling, auditability, failure isolation, data scope and rollback behavior have been verified.
