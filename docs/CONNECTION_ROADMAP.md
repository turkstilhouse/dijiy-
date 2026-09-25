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
- Figma Design
- Canva Creative
- Runway Media
- monday Operations
- Agent Reach
- Ollama Local Runtime

### P1 — Build + Design

Purpose: connect the tools used to build DİJİY and its interfaces.

Targets:
- ChatGPT
- Claude / Claude Code
- Cursor
- Codex
- GitHub Copilot
- Windsurf
- Kiro
- Qoder
- Figma AI
- UI UX Pro Max
- Motion for React

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

### P3 — Intelligence

Purpose: research, content intelligence, knowledge and audience insight.

Targets:
- VIRΛLE
- Poppy
- vidIQ
- Apify
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

### P5 — Optional / Experimental

These remain cataloged but are not part of the initial connection program until their exact role, security model and integration surface are verified.

Examples include:
- Antigravity
- Hermes
- OpenClaw
- OmniRoute
- Nano Banana variants
- DeepSeek candidates not yet verified
- community/local model tools
- other duplicate or lower-priority tools

## Connection record requirements

Every connected tool should eventually have:
- owner / responsible agent
- provider
- purpose
- capabilities
- connection method
- required scopes
- credential location (reference only; never the secret)
- health-check method
- allowed operations
- risk level
- human-approval requirement
- fallback provider
- audit event mapping
- current connection state

## ARAS rule

ARAS may discover, classify, plan and route only within the verified capability boundary.

A tool becomes production-routable only after:
1. verification,
2. successful authentication or local setup,
3. health check,
4. explicit enablement,
5. operation mapping,
6. audit mapping.

This document is the control-plane ordering for the connection program.
