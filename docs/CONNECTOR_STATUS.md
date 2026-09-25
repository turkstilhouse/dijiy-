# DİJİY CONNECTOR STATUS

Checked: 2026-09-24

## Verified / usable
- Supabase CORE — connected and verified
- GitHub — connected through the current development connector; repository writes are usable
- Figma — connected and verified
- Canva — connected and verified
- Runway — connected and verified

## Available but not fully connected to DİJİY
- Meta / Instagram — connector design exists; Meta app/token setup remains
- Shopify — adapter target registered; account connection remains
- Google Drive — available in core registry, ChatGPT connector is currently unavailable
- Gmail — available in core registry, ChatGPT connector is currently unavailable
- BigQuery — registered, account connection remains
- Vercel — discovered; current visible project "lumina" is explicitly excluded from DİJİY and must not be touched
- Lovable — available for optional acceleration; not a core dependency
- Perplexity — optional research provider

## Paused
- Replit — intentionally paused/decommissioned as a core development dependency

## Next connector priorities
1. Meta / Instagram official API
2. Vercel — create/link a dedicated DİJİY project only after explicit project identification
3. Shopify
4. Analytics/Search Console
5. TikTok / LinkedIn
6. Payments and logistics
7. ERP / CRM / accounting

Rule: DİJİY owns identity, permissions, canonical data, orchestration and connector contracts. Providers are replaceable adapters.

## AI Creative / Local Runtime Additions — 2026-09-25

Registered in the DİJİY AI registry:

- ByteDance Seed / Seedance 2.5 — video generation, reference-controlled creation and editing. Official model catalog verified.
- Google Gemma 4 — local/open multimodal agent runtime; 12B, 26B A4B and 31B registered. Official Google documentation verified.
- Ollama — local model runtime registered as the execution layer for local/open models.
- Google Lyria 3.5 — music generation registered. Officially available in Google Flow Music; automated backend API routing remains subject to API-surface verification.
- Agent Reach — internet research/channel capability registered. Runtime health must be checked with its own doctor command before production use.
- DeepSeek V4 Plus — recorded as an unverified candidate only; disabled for production routing until an official model/API source is verified.
- Meituan talking-video tool shown in the supplied reference — recorded as an unverified candidate only; no production routing until the exact official model/project and API are identified.

## Routing Rule

ARAS may route only verified and connected providers into production execution. Unverified candidates remain research/experimental entries. Credentials and provider secrets must never be committed to GitHub.

