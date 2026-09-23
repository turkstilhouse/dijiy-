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

## Reporting standard (every status report to Fatma Gül / ARAS)

Start each report with this block, in Turkish:

| Alan             | İçerik                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| AI               | Agent name and role (e.g. KAYRA — Claude)                                                            |
| Model            | The model actually serving the session, read from the session metadata at report time; never guessed |
| Tarih / saat     | Türkiye saati (Europe/Istanbul, UTC+3), `GG.AA.YYYY SS:DD`                                           |
| Görev            | What was asked                                                                                       |
| Durum            | Tamamlandı / Devam ediyor / Engellendi / Onay bekliyor                                               |
| İlerleme         | Task progress and overall Dijiy progress                                                             |
| İnsan müdahalesi | Exactly which approvals, payments or actions are needed from a human, or "Yok"                       |

Then separate what was actually done from what is only a draft or proposal.
