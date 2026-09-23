# VS Code Agent Katmanı — Mimari Değerlendirme

Durum: **Değerlendirme / öneri.** Bu belge dışında hiçbir kurulum veya depo
değişikliği yapılmadı (`.vscode/`, `.claude/agents/`, hook veya MCP
yapılandırması eklenmedi).
Hazırlayan: KAYRA (Claude) · İnceleme: ARAS · Karar: Fatma Gül

> Kaynak notu: Fatma Gül'ün paylaştığı içerik bu oturuma iletilmedi. Bilgiler
> resmi `code.visualstudio.com` belgelerinin arama özetlerinden derlendi (bu
> geliştirme ortamı siteye doğrudan erişemiyor). Sürüme bağlı ayrıntılar
> kurulumdan önce VS Code içinde yeniden doğrulanmalıdır. Kaynaklar en sonda.

## 1. Konumlandırma

VS Code, Dijiy'de **yeni bir backend veya veri merkezi değildir.** GitHub'daki
kodun üzerinde KAYRA (Claude), Codex ve gerektiğinde başka agent'ların kontrollü
çalıştığı **geliştirme ve multi-agent çalışma katmanıdır.**

```
                    ┌──────────────────────── Kaynak doğruluk ─────────────────────────┐
                    │  GitHub turkstilhouse/dijiy-   (kod, PR, CI, inceleme kaydı)      │
                    │  Supabase TURKSTILHOUSE-CORE   (veri, RLS, onaylar, audit)        │
                    └───────────────▲───────────────────────────────▲──────────────────┘
                                    │ branch + PR                    │ MCP (kısıtlı)
┌───────────────────────────────────┴───────────────────────────────┴──────────────────┐
│  VS Code — geliştirme ve agent katmanı                                                │
│                                                                                       │
│  Agent Sessions / Agents window                                                       │
│   ├─ Claude harness  (Claude Agent SDK)  → KAYRA: uygulama, test, migration taslağı   │
│   ├─ Codex harness   (OpenAI)            → ikinci görüş, paralel görev, çapraz review │
│   ├─ Local / Copilot harness             → küçük düzenlemeler                          │
│   └─ Cloud target                        → izole görev → PR döndürür                   │
│                                                                                       │
│  Ortak kurallar: AGENTS.md · CLAUDE.md · .claude/agents · hooks · MCP izin seviyeleri │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                           Vercel (ayrı dijiy projesi) — yalnızca çalışma ortamı
```

Temel ilke: **VS Code'daki izinler geliştirme zamanı kontrolüdür.** İş kararları
için insan onayı Supabase'deki `human_approval_requests` tablosunda kalır
(kendi talebini onaylama yasak, yüksek riskli türleri yalnızca owner onaylar).

## 2. Özellik karşılaştırması

| VS Code özelliği                  | Ne sağlar                                                                                                                                                                           | Dijiy'de bugün                                                       | Öneri                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Claude agent (harness)**        | Claude Agent SDK'yı VS Code içinde çalıştırır; slash komutları, hook'lar, subagent'lar korunur. İzin modları: _Edit automatically_, _Request approval_, _Plan_                      | KAYRA bulut oturumunda (Claude Code) çalışıyor                       | KAYRA'nın yerel/IDE çalışma ortamı. Varsayılan mod **Request approval**; migration ve mimari işlerde **Plan**                        |
| **OpenAI Codex agent**            | Codex'i VS Code içinde yerel veya bulutta çalıştırır. Yerel Codex için OpenAI Codex eklentisi ve Copilot Pro+ gerekir                                                               | Yok                                                                  | İkinci görüş, bağımsız test yazımı, çapraz kod incelemesi. KAYRA'nın yerine değil, yanında                                           |
| **Agent Sessions görünümü**       | Yerel ve bulut agent'larını tek yerden izler; durum takibi ve oturumlar arasında geçiş sağlar                                                                                       | Oturumlar dağınık (bulut + sohbet)                                   | Tüm agent işlerinin tek görünümü. Her oturum = bir dal = bir PR                                                                      |
| **Paralel agent çalışması**       | Arka plan agent'ları her oturum için ayrı Git worktree açar; çakışma olmadan paralel çalışır                                                                                        | Tek dal üzerinde sıralı çalışma                                      | Görev başına worktree/dal (`claude/*`, `codex/*`). **Worktree güvenlik sınırı değildir** (VS Code belgesi)                           |
| **Handoff**                       | Oturumu tüm geçmişiyle birlikte başka harness'a, ortama veya role devreder                                                                                                          | Yok                                                                  | Ör. KAYRA uygular → Codex bağımsız inceler → ARAS rolüne devredilir                                                                  |
| **Cloud target**                  | İyi tanımlı görevi uzakta çalıştırır ve PR döndürür                                                                                                                                 | Claude Code bulut oturumu benzer iş görüyor                          | Uzun ve izole görevler için. Sonuç her zaman PR, asla doğrudan `main`                                                                |
| **MCP araçları**                  | Agent'lara Supabase, GitHub, Vercel gibi araçları bağlar. Onay oturum, çalışma alanı veya kullanıcı düzeyinde verilir. Yerel stdio sunucuları `sandboxEnabled` ile izole edilebilir | Supabase, GitHub, Vercel MCP bu oturumda bağlı                       | Bölüm 4'teki izin matrisi. Production'a yazma yetkisi **hiçbir agent'a** verilmez                                                    |
| **Workspace instructions**        | `AGENTS.md`, `CLAUDE.md` ve `copilot-instructions.md` her istekte yüklenir; `*.instructions.md` dosya bazlıdır. Depo kökü keşfi desteklenir                                         | `CLAUDE.md` (Dijiy kuralları) + `AGENTS.md` (yalnızca Next.js bloğu) | **Açık var:** Dijiy kuralları yalnızca `CLAUDE.md` içinde, Codex ise `AGENTS.md` okuyor. Kurallar `AGENTS.md`'ye taşınmalı (bölüm 5) |
| **`.claude/agents`**              | `.md` agent tanımları; VS Code hem kendi `.agent.md` biçimini hem Claude biçimini destekler                                                                                         | Yok                                                                  | KAYRA, ARAS-reviewer ve RLS-tester rolleri (bölüm 5)                                                                                 |
| **Hooks**                         | `PreToolUse`/`PostToolUse`, `SessionStart`/`Stop` vb. 8 olay. Araç çağrısı `deny` ile engellenebilir. VS Code `.claude/settings.json` dosyasını okur; tüm harness'larda çalışır     | Yok                                                                  | Prompt'tan bağımsız sert kurallar: production migration, `main`'e push, lumina, secret yazımı engellenir                             |
| **Approval / permission sistemi** | _Manual_ (ayarlara göre), _Assisted_ (LLM hakemi), _Allow all_, _Autopilot_; terminal komut kuralları (regex); terminal sandbox'ı dosya ve ağ erişimini kısıtlar                    | Claude Code izin modları + insan onayı                               | Varsayılan **Manual**. _Allow all_ ve _Autopilot_ yalnızca production kimlik bilgisi olmayan sandbox'lı worktree'de                  |
| **GitHub branch/PR modeli**       | Bulut ve arka plan agent'ları dal ve PR üzerinden çalışır                                                                                                                           | `CONTRIBUTING.md`: `main` korumalı, PR + CI + ARAS kontrol listesi   | Aynen korunur. VS Code bu modeli değiştirmez, yalnızca uygular                                                                       |

## 3. Roller ve akış

| Rol                              | Harness / araç                                   | Yetki                                                                           |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| **KAYRA** (uygulama)             | Claude harness · `.claude/agents/kayra.md`       | Kendi dalında kod ve test yazar; migration **taslağı** yazar; PR açar           |
| **Codex** (paralel/ikinci görüş) | Codex harness                                    | Ayrı dalda görev yapar veya PR'ı inceler; KAYRA ile aynı kurallar (`AGENTS.md`) |
| **ARAS** (mimari/güvenlik)       | Claude veya Codex, **salt okunur** agent profili | Diff, RLS testleri ve ön kontrol çıktısını inceler; yazma aracı yok             |
| **Fatma Gül** (karar)            | İnsan                                            | Birleştirme, production migration, maliyetli işlemler, kimlik bilgisi           |

```
Görev → [KAYRA oturumu: worktree claude/x] → PR → CI (lint, typecheck, 52 test, build)
                     └→ handoff → [Codex: bağımsız inceleme / ek testler]
      → [ARAS salt okunur inceleme] → Fatma Gül onayı → merge
      → (şema varsa) Supabase development branch → ön kontrol → production (onaylı)
```

## 4. MCP izin matrisi (öneri)

| MCP sunucusu                      | Agent'a açık                                                      | Kapalı / insan onayı                                                 | Not                                                         |
| --------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| **GitHub**                        | Dal oluşturma, commit/push (`claude/*`, `codex/*`), PR açma/yorum | `main`'e push, merge, ayar değişikliği                               | Branch protection sunucu tarafında zorunlu                  |
| **Supabase — production**         | **Salt okunur**: katalog sorguları, advisor, tip üretimi          | `apply_migration`, DDL/DML, branch oluşturma (ücretli), secret okuma | MCP sunucusunu `read_only` ve tek `project_ref` ile sınırla |
| **Supabase — development branch** | Taslak migration uygulama, test                                   | Branch'i production'a merge etme                                     | Branch ayrı `project_ref`; production anahtarı yok          |
| **Vercel**                        | Yalnızca `dijiy` projesi: deploy durumu, loglar                   | `lumina` üzerinde her işlem, env değişikliği, domain/ödeme           | Takım yerine proje kapsamlı token                           |

Ek kurallar:

- MCP yapılandırmasına (`.vscode/mcp.json`) **token yazılmaz**; VS Code girdi
  değişkenleri veya işletim sistemi anahtar zinciri kullanılır.
- MCP araç çıktıları (veritabanı satırları, PR yorumları) **güvenilmeyen veri**dir.
  Talimat olarak izlenmez. Prompt injection riski nedeniyle yazma araçları
  oturum düzeyinde onaylanır, kalıcı onay verilmez.
- Yerel stdio MCP sunucuları `sandboxEnabled: true` ile çalıştırılır (macOS/Linux).

## 5. Depoya eklenecekler (öneri; bu PR'da yapılmadı)

1. **`AGENTS.md` = tek kural kaynağı.** Dijiy kuralları `CLAUDE.md`'den
   `AGENTS.md`'ye taşınır. `CLAUDE.md` yalnızca `@AGENTS.md` içerir. Böylece
   Claude, Codex ve Copilot aynı kuralları okur.
2. **`.claude/agents/`**
   - `kayra.md`: uygulama rolü; tüm araçlar; migration yalnızca taslak.
   - `aras-reviewer.md`: salt okunur araçlar; çıktı olarak inceleme raporu.
   - `rls-tester.md`: `supabase/tests` kapsamında test yazımı.
3. **`.claude/settings.json` hook'ları** (VS Code ve Claude Code'da ortak):
   `PreToolUse` → `deny` kuralları:
   - `apply_migration` / `execute_sql` DDL'i production `project_ref`'ine karşı
   - `git push` hedefi `main`
   - `lumina` içeren Vercel çağrıları
   - `.env*` dışında `sb_secret_` / `sb_publishable_` desenleri içeren dosya yazımı
4. **`.vscode/extensions.json`**: önerilen eklentiler (ESLint, Prettier,
   Tailwind, Vitest). `.vscode/settings.json` yalnızca biçimlendirme ayarlarını içerir.
5. **`.vscode/mcp.json`**: bölüm 4'teki sunucular, token'sız.

## 6. Riskler

| Risk                                                    | Önlem                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Paralel agent'ların aynı dosyada çakışması              | Görev başına worktree/dal; PR'lar küçük tutulur                                              |
| Worktree'nin güvenlik sınırı sanılması                  | Sandbox ve MCP izinleri ayrıca uygulanır                                                     |
| _Allow all_ veya _Autopilot_ ile production'a erişim    | Production kimlik bilgisi yalnızca salt okunur MCP'de; hook'lar prompt'tan bağımsız engeller |
| _Assisted_ (LLM hakemi) modunun tek güvence sanılması   | Sert kurallar hook'larda; hakem yalnızca ek katman                                           |
| Farklı harness'ların farklı kural görmesi               | `AGENTS.md` tek kaynak                                                                       |
| Codex için ek abonelik maliyeti                         | Yerel Codex, Copilot Pro+ ister; ihtiyaç doğunca karar verilir                               |
| Secret sızıntısı (MCP yapılandırması, terminal geçmişi) | Girdi değişkenleri, `.gitignore`, CI'da secret taraması                                      |

## 7. Benimseme planı

1. **Şimdi:** Bu değerlendirme (tamam). Faz 0 PR'ı ve RLS taslakları önceliklidir.
2. **Sonraki PR (ARAS onayı ile):** `AGENTS.md` birleştirmesi, `.claude/agents/`,
   hook'lar, `.vscode/` önerileri. Kod davranışı değişmez.
3. **Kurucu makinesinde kurulum:** VS Code + Claude harness + (isteğe bağlı) Codex.
   MCP sunucuları bölüm 4'e göre kısıtlı eklenir.
4. **Deneme:** Tek görevde KAYRA uygular, Codex bağımsız inceler, ARAS salt
   okunur değerlendirir. Sonuç PR'da.

## 8. Karar gerektiren konular (ARAS / Fatma Gül)

- Codex kullanımı ve abonelik (Copilot Pro+ ya da OpenAI planı) gerekli mi?
- ARAS incelemesi hangi harness ile yapılacak (Claude, Codex veya ikisi)?
- Supabase MCP'nin production'a salt okunur bağlanması kabul edilebilir mi,
  yoksa yalnızca development branch'e mi bağlanmalı?

## Kaynaklar (resmi Microsoft / VS Code belgeleri)

- [Build with agents in VS Code](https://code.visualstudio.com/docs/agents/overview)
- [Choose and use an agent harness](https://code.visualstudio.com/docs/agents/run/agent-harnesses)
- [Understand agent harnesses](https://code.visualstudio.com/docs/agents/concepts/agent-harnesses)
- [Using third-party agents in VS Code](https://code.visualstudio.com/learn/agents/4-using-third-party-agents-in-vs-code)
- [Manage agent sessions in VS Code](https://code.visualstudio.com/docs/agents/run/sessions/manage-sessions)
- [Understand agent sessions and handoff](https://code.visualstudio.com/docs/agents/concepts/sessions)
- [Use the Agents window (Preview)](https://code.visualstudio.com/docs/agents/run/agents-window)
- [Your Home for Multi-Agent Development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [Introducing the Agent Host](https://code.visualstudio.com/blogs/2026/08/26/agent-host-architecture)
- [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
- [Manage approvals and permissions](https://code.visualstudio.com/docs/agents/run/approvals)
- [Sandbox agent terminal commands](https://code.visualstudio.com/docs/agents/run/agent-sandboxing)
- [Understand trust and safety for AI agents](https://code.visualstudio.com/docs/agents/concepts/trust-and-safety)
- [Use custom instructions in VS Code](https://code.visualstudio.com/docs/agent-customization/custom-instructions)
- [Custom agents in VS Code](https://code.visualstudio.com/docs/agent-customization/custom-agents)
- [Agent hooks in Visual Studio Code (Preview)](https://code.visualstudio.com/docs/agent-customization/hooks)
- [Hooks reference](https://code.visualstudio.com/docs/agents/reference/hooks-reference)
- [Manage AI settings in enterprise environments](https://code.visualstudio.com/docs/enterprise/ai-settings)
