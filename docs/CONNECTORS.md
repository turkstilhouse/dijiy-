# DİJİY Connect — Connector Registry

DİJİY Connect is the platform-owned integration layer.

## Lifecycle
DISCOVERED → CONFIGURED → AUTHORIZING → CONNECTED → HEALTHY → DEGRADED → REAUTH_REQUIRED → DISCONNECTED

## Common connector contract
- provider identity
- capabilities
- authentication method
- required scopes
- connect/disconnect
- health check
- sync
- webhook handling
- rate limits
- normalization mapping
- audit events

## Roadmap
Priority A: Meta/Instagram, YouTube, Google Analytics, Search Console, Shopify.
Priority B: TikTok, LinkedIn, payment, logistics and email.
Priority C: ERP, CRM, accounting, marketplaces and institutional systems.

## Rule
A connector is replaceable. The rest of DİJİY depends on the DİJİY connector contract and canonical data model, not provider-specific API shapes.

Temporary aggregators may accelerate development but cannot become the source of truth for identity, authorization or canonical data.
