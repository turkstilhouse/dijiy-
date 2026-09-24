# DİJİY Security Foundation

## Principles
1. Secrets never live in frontend code.
2. OAuth authorization codes are exchanged server-side.
3. Access and refresh tokens are encrypted at rest.
4. Every integration has explicit scopes.
5. Every action is checked against workspace and resource permissions.
6. Sensitive actions require explicit confirmation or approval.
7. Audit events are append-only.
8. Data access is tenant/workspace scoped.
9. External providers are isolated behind adapters.
10. Data retention, export and deletion policies are defined per data class.

## Security domains
- identity and session security
- RBAC/ABAC authorization
- tenant isolation
- secret management
- OAuth state and PKCE
- webhook signature verification
- API rate limiting
- abuse prevention
- encryption in transit and at rest
- audit logging
- security monitoring
- backup and disaster recovery
- dependency and supply-chain security
- data export and deletion

## Boundary
Browser → DİJİY API → authorization/service layer → connector/service → external provider.

The browser must not receive provider secrets.

## Development rule
Do not implement custom cryptography when a maintained, audited standard primitive exists.
