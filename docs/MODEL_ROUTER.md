# DİJİY Model Router & Creative Runtime

Status: ROUTING FOUNDATION ACTIVE
Date: 2026-09-25

## Purpose

The Model Router keeps provider choice inside DİJİY instead of hard-coding vendor SDKs into business logic.

Flow:

Fatma Gül -> ARAS -> task classification -> operation/risk policy -> Model Router -> provider/tool adapter -> execution -> validation -> audit -> ARAS

The router selects by capability, modality, complexity, privacy requirement, provider verification, tool health and declared policy. It must not select a provider merely because a model is registered.

## Production routing rules

### Seedance 2.5
Operations:
- creative.media.generate_video
- creative.media.edit_video

Use for:
- short-form fashion campaign video
- reference-controlled motion
- video extension/editing
- audio-video creative generation where the connected API supports it

Guard:
- provider/integration must be verified and healthy before production execution
- generation can be automatic when policy permits
- external publishing remains a separate approval-gated operation
- no credentials in client code or repository

### Gemma 4 + Ollama
Operation:
- ai.local.infer

Use:
- local/private inference
- structured extraction
- agent sub-tasks
- offline or privacy-sensitive preprocessing

Routing:
- low complexity -> Gemma 4 12B
- high complexity -> Gemma 4 26B A4B
- Gemma 4 31B remains available for a future high-quality local route

Guard:
- runtime must pass local health check
- local endpoint must not be exposed publicly without an explicit security design
- no sensitive payload leaves the local runtime unless a separate policy allows it

### Lyria 3.5
Operation:
- creative.audio.generate_music

Use:
- music, lyrics, vocals and creative audio for media workflows

Current official surface:
- Google Flow Music

Guard:
- DİJİY records Lyria 3.5 as a verified model, but does not invent a backend API endpoint
- automated execution requires a verified API/connector surface
- publishing/distribution remains separately controlled

### Agent Reach
Operation:
- research.web.discover

Use:
- public-web research
- channel/source discovery
- research health checks

Guard:
- doctor health check before execution
- prefer official APIs and OAuth
- cookie scraping is prohibited by the DİJİY connector policy
- account-security and rate-limit risks must be surfaced
- source provenance is stored with research output

## Experimental providers

DeepSeek V4 Plus and the Meituan talking-video candidate remain disabled until an official model/API surface is verified.

They may be researched and documented, but the router must not select them for production execution while disabled.

## Fallback policy

1. Prefer the requested capability and verified provider.
2. If unavailable, select another verified provider with the same capability.
3. If no safe provider exists, stop at WAITING_TOOL or APPROVAL_REQUIRED rather than silently substituting an incompatible provider.
4. Never fall back from a verified provider to an unverified provider automatically.
5. External publishing, financial actions, credential changes and other approval-gated actions never inherit automatic approval from a generation step.

## Observability

Every provider/tool execution should be traceable through:
- ai_tasks
- orchestration_runs
- execution_steps
- provider_invocations
- tool_invocations
- ai_audit_events

Record provider/model/tool identity, request and response metadata, timing, error state, cost where available, and verification state. Secrets and raw credentials are excluded.

## Implementation boundary

The current GitHub repository is the architecture/control-plane repository; it does not yet contain a runtime application package. The database routing registry is therefore the executable routing source of truth until the DİJİY application runtime is introduced.

## Next build gate

Implement a small modular runtime adapter layer:
- model-router
- provider-adapters
- tool-adapters
- policy-gate
- execution/audit writer

Keep these as modules in one application until scale requires service separation.
