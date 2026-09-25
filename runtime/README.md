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


## Runtime connections

The runtime now has real local bridges for Ollama and Agent Reach.

- Ollama uses `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`) and the local `/api/tags` and `/api/generate` endpoints.
- Agent Reach uses the installed `agent-reach` executable, first running `doctor --json`, then using its JSON `get` command.
- Supabase audit writes use server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Secrets must stay outside GitHub and outside browser/client bundles.
- The execution engine records start, finish, waiting, and failure states without storing model input payloads.

Agent Reach is a capability layer rather than a single universal web API; installed channels and their health are determined by its doctor output. citeturn0search0
