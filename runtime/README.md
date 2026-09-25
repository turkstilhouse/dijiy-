# DİJİY Runtime Foundation

This directory is the first executable boundary for the Model Router.

Modules:
- model-router.ts — deterministic capability routing
- provider-adapters.ts — provider-specific transport boundary
- execution-engine.ts — route + adapter execution

Current behavior is deliberately fail-closed:
- unconfigured providers return WAITING_FOR_CONNECTION
- Lyria does not invent an API endpoint
- local Ollama execution requires a real local health check
- Agent Reach requires its health check
- no credentials are stored in source

Next implementation step:
1. connect runtime to Supabase registry
2. implement real Ollama localhost transport
3. implement Agent Reach CLI health/execution bridge
4. implement Seedance server-side API adapter after credentials are connected
5. implement Lyria transport only after an official API surface is verified
6. write provider/tool invocation records to Supabase audit tables
