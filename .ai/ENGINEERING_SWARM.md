# DİJİY Engineering Swarm

## Purpose
Claude/KAYRA is not a single point of failure. Engineering work must be portable across coding agents.

## Control plane
ARAS assigns work. GitHub is the shared source of truth. Supabase CORE is the runtime data/security source.

## Agents
- KAYRA — Claude Code: primary architecture/refactor agent.
- CODEX — OpenAI Codex: fallback/parallel implementation and review agent.
- CURSOR — Cursor Cloud Agent: long-running implementation/test/PR agent.
- GEMINI — Gemini CLI: independent review, debugging and context-heavy analysis.

## Handoff contract
Every agent must:
1. Read CLAUDE.md and .ai/* before changing code.
2. Work on a dedicated branch.
3. Never commit secrets.
4. Never apply production migrations unless explicitly approved.
5. Run the repository checks defined by the project.
6. Record changed files, tests, blockers and next action in HANDOFF.md.
7. Open/update a PR rather than silently merging.

## Priority
1. Security and data integrity.
2. Runtime correctness.
3. Tests and observability.
4. Feature implementation.
5. Refactoring.

## Fallback
If an agent reaches a quota, provider outage, authentication failure or context limit, the task is handed to the next available agent using the same GitHub branch/PR and HANDOFF.md. No work is discarded.
