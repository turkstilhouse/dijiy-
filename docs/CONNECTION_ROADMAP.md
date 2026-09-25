# DİJİY Connection Roadmap

Status: ORGANIZE FIRST — CONNECT SECOND
Updated: 2026-09-25

## Principle

DİJİY will inventory and classify tools before enabling connections. Discovery does not mean production readiness.

Lifecycle:

INVENTORY → VERIFY → AUTH / LOCAL SETUP → HEALTH CHECK → ENABLE FOR ARAS → ROUTING + AUDIT

Production rule:
- Never route to a tool only because it is cataloged.
- Unverified candidates remain disabled.
- Provider credentials and OAuth secrets never enter GitHub.
- Financial, legal, credential, security, irreversible, and external-publishing actions require human approval.
- A local runtime must pass a real health check before execution.
- A provider must have a verified transport/API surface before it becomes an executable backend.

## Connection waves

### P0 — Core / Control Plane

Purpose: establish the DİJİY backbone before creative and automation connections.

Targets:
- Supabase Core
- DİJİY Connect
- DİJİY Orchestrator
- DİJİY Policy Gate
- DİJİY Audit
- DİJİY Data Pool
- GitHub Engineering
- Vercel (excluding lumina)
- Figma Design
- Canva Creative
- Runway Media
- monday Operations
- Agent Reach
- Ollama Local Runtime
- DeerFlow
- Google Workspace
- Meta / Instagram
- Stripe
- iyzico
- PayTR

### P1 — Build + Design

Purpose: connect the tools used to build DİJİY and its interfaces.

Targets:
- ChatGPT
- Claude / Claude Code
- Cursor
- Codex
- GitHub Copilot
- Windsurf / Devin Desktop
- Kiro
- Qoder
- Figma AI
- UI UX Pro Max
- Motion for React
- Vercel AI SDK
- HubSpot
- Resend

### P2 — Media Production

Purpose: establish the creative production pipeline.

Targets:
- Seedance 2.5
- Higgsfield
- Runway
- Google Veo
- Kling
- Pika Labs
- CapCut
- Descript
- Submagic
- OpusClip
- Premiere Pro
- InShot
- Lyria 3.5
- Suno
- ElevenLabs
- HeyGen
- Synthesia
- ComfyUI

### P3 — Intelligence

Purpose: research, content intelligence, knowledge and audience insight.

Targets:
- VIRΛLE
- Poppy
- vidIQ
- Apify
- Firecrawl
- Notion
- Notion AI
- NotebookLM
- Otio AI
- Grammarly
- Wispr Flow

### P4 — Operations

Purpose: connect business workflows and publishing channels after the core is stable.

Targets:
- Make
- n8n
- Zapier
- ManyChat
- Chatbase
- WordPress
- beehiiv
- YouTube
- Superhuman
- Granola
- PostHog Measurement
- Slack

### P5 — Optional / Experimental

These remain cataloged but are not part of the initial connection program until their exact role, security model and integration surface are verified.

Examples include:
- Antigravity
- Hermes
- OpenClaw
- OmniRoute
- OpenCode
- Devin as a separate coding-agent route
- Nano Banana variants
- DeepSeek candidates not yet verified
- community/local model tools
- duplicate tools whose capabilities are already covered elsewhere

## Newly identified gaps

The current research pass found several important categories that were missing from the original inventory:

1. Agent runtime: DeerFlow 2.x is an open-source runtime harness for long-horizon agents, subagents, memory, tools, skills and sandboxed execution. It is cataloged as a candidate core runtime, not yet connected. Official documentation and repository were checked. citeturn1search0turn1search7
2. AI application runtime: Vercel AI SDK provides a provider-agnostic TypeScript layer for AI applications and agents. It is a development dependency rather than a normal OAuth connection. citeturn1search13turn1search20
3. Commerce payments: Stripe is required for international billing/subscriptions; Türkiye-specific payment candidates iyzico and PayTR are cataloged separately so the payment layer does not depend on one provider. Stripe supports subscriptions and billing APIs. citeturn1search4turn1search8
4. Google Workspace: Drive, Gmail and Calendar APIs provide programmatic file, mail and calendar access; OAuth scopes should remain narrow. citeturn2search4turn2search0turn2search11
5. Social channel: Meta / Instagram is a required future publishing and insights surface for DİJİY's social-content workflows; permissions and app-review requirements must be verified during connection.
6. Commerce/CRM: HubSpot is cataloged for customer lifecycle workflows.
7. Transactional email: Resend is cataloged as a dedicated notification/email API, separate from Gmail.
8. Research extraction: Firecrawl is cataloged as a complement to Agent Reach for structured web extraction.
9. Local media: ComfyUI is cataloged for advanced local generative-media workflows.
10. Team operations: Slack is cataloged for internal notifications and human-approval queues.

## Current research conclusion

Do not connect every cataloged application.

The objective is a controlled DİJİY tool layer with:
- one primary capability,
- optional fallback providers,
- explicit health checks,
- narrow scopes,
- human approval for risky actions,
- audit events for execution,
- no secret material in GitHub.

A tool becomes production-routable only after:
1. verification,
2. successful authentication or local setup,
3. health check,
4. explicit enablement,
5. operation mapping,
6. audit mapping.

This document is the control-plane ordering for the connection program.
