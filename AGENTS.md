<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dijiy — Token & Context Economy (all agents)

Applies to every agent: KAYRA (Claude), ARAS, Codex, Perplexity, DeepSeek and
any future agent.

1. **1 task = 1 short context + only the files it needs + the result.**
   Do not load whole directories, full logs or raw tool output "just in case".
2. **Intermediate steps stay in the agent's own context.** Report to humans
   only at the end of a task, or when blocked or needing approval. No
   "now I am doing X / now checking Y" narration.
3. **No raw hand-offs between agents.** Research agents (Perplexity,
   DeepSeek, …) turn sources into a structured finding (claim, evidence,
   source URL, date, confidence), store it in Supabase `knowledge_*`, and
   the next agent reads only the finding it needs.
4. **Large outputs are summarised at the source.** Logs, CI output and query
   results are filtered (grep, `limit`, targeted columns) before an agent
   reads them.
5. **Verify once, report once.** Re-check only when something changed.

## Report format (Turkish, end of task)

```
<AJAN> / <sağlayıcı> (<çalışan model, oturum bilgisinden>) — GG.AA.YYYY SS:DD TR
Görev: …
Durum: TAMAMLANDI | DEVAM EDİYOR | ENGELLENDİ | ONAY BEKLİYOR
Sonuç: … (yalnızca doğrulanmış sonuçlar)
Taslak/öneri: … (varsa; uygulanmamış olanlar)
Eksik: …
Sonraki adım: …
İnsan müdahalesi: Yok | <tam olarak ne gerekiyor, maliyetiyle>
```
