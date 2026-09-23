@AGENTS.md

# Dijiy — agent rules

Read `ARCHITECTURE.md` before structural changes. Summary of hard rules:

- Supabase project **TURKSTILHOUSE-CORE** (`iqmmjhsrbtzkubgfjyra`) is the canonical
  backend. Dijiy is the row `public.projects` slug `dijiy-dijital-ipek-yolu`.
- **Never apply migrations to the production database.** Put proposed SQL in
  `supabase/migrations/` and flag it for ARAS/founder review.
- **Never commit secrets.** Only `.env.example` (no key values) is tracked.
- Do not touch the Vercel project `lumina`, Replit, or legacy TURKSTILHOUSE code.
- Server-only code imports `server-only`. The admin (secret-key) client is for
  trusted jobs only, never for serving user requests without an authz check.
- Run `pnpm check && pnpm build` before pushing.
- Roles: KAYRA (engineering) implements; ARAS (architecture) reviews for
  consistency with the Supabase canonical model; Fatma Gül has final say on
  irreversible, financial, legal or credential actions.

Token & Context Economy and the report format are in `AGENTS.md` and apply here.
