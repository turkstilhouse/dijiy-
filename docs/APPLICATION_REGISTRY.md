# DİJİY Application Registry — 2026-09-25

This registry records applications discovered from the user's supplied references and verified public sources. Catalog presence does not mean an account is connected or that runtime execution is enabled.

## Claude / agentic work

- Claude Code — development/agent runtime; project instructions, skills, terminal and repository workflows.
- Claude Cowork — long-running delegated work and scheduled workflows.
- Claude scheduled tasks — recurring/future execution surface for Cowork workflows.
- Claude Agent Skills / CLAUDE.md — reusable project behavior and skills layer.
- claude-mem — community persistent-memory plugin; unverified for DİJİY production use.

Anthropic documents Cowork as a handoff-oriented workflow surface and scheduled workflows, while Anthropic's public skills repository documents reusable skills for Claude Code and Claude.

## Local AI / routing / context

- Pinokio — local AI application launcher/installer.
- Headroom — local context-compression layer for agent inputs, tool outputs and RAG content.
- OmniRoute — local multi-provider AI gateway/router candidate.
- LMArena / Chatbot Arena — model evaluation and comparison surface; not a production inference provider.

Headroom documents a proxy/library/MCP context-optimization layer. OmniRoute repositories describe local multi-provider gateway/routing capabilities; the exact OmniRoute repository must be pinned before production integration because multiple projects use the name.

## Pinokio creative applications

- Whisper-WebUI — speech-to-text/transcription UI.
- CogStudio — CogVideo-based text-to-video, image-to-video, video-to-video and video extension UI.
- Moshi — local speech/dialogue application candidate.
- Applio — voice-conversion application.
- FluxGym — FLUX LoRA training application.
- CogVideo — text/image-to-video generation stack.
- Stable Diffusion WebUI Forge — local image-generation UI.
- LivePortrait — portrait animation / reenactment application.

CogStudio's public repository documents its Pinokio installation and video-generation/editing workflows. Pinokio's public organization lists repositories including CogStudio, Whisper-WebUI and Stable Diffusion WebUI Forge; LivePortrait also has a Pinokio launcher.

## DİJİY policy

1. Cataloged != connected.
2. Cataloged != approved for production.
3. No credentials are stored in GitHub.
4. Local runtimes require local health checks.
5. Community/unverified applications remain disabled until their exact repository/API is verified.
6. The model router may only execute applications with an approved adapter and passing policy/health checks.
