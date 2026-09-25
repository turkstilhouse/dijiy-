# DİJİY AI APPLICATION OPERATING PROGRAM — 2026-09-25

Amaç: Yeni uygulamaları bağımsız ve dağınık araçlar olarak kullanmak yerine ARAS merkezli capability zincirine bağlamak; her aracı en güçlü olduğu görevde kullanmak; aynı işi birden fazla araçla gereksiz yere tekrar etmemek.

## 1. Capability haritası

### Araştırma / istihbarat
- Agent Reach → ARAŞTIRMA + VERİ: web/source discovery, kanal araştırması, provenance.
- LMArena / Chatbot Arena → ARAŞTIRMA + RAPOR: model karşılaştırma ve deneysel değerlendirme; üretim inference sağlayıcısı değil.
- Perplexity → ARAŞTIRMA: opsiyonel araştırma sağlayıcısı; yalnızca doğrulanmış connector ile.

### Yazılım / AI geliştirme
- Claude Code → KAYRA: ana yazılım geliştirme, repo, terminal, test ve uygulama iş akışları.
- Claude Cowork + scheduled workflows → ARAS + KAYRA + ÜRÜN: uzun süren/planlı iş akışları.
- Claude Agent Skills / CLAUDE.md → KAYRA: tekrar kullanılabilir proje davranışı ve görev becerileri.
- claude-mem → KAYRA: yalnızca geliştirici hafızası; DİJİY Memory Core değildir ve üretim için doğrulama gerekir.
- Context7 → KAYRA: güncel kütüphane/API dokümantasyonu.
- Codex remote tasks → KAYRA: ayrıştırılmış mühendislik işleri; remote environment erişimi doğrulanmadan production authority verilmez.

### Model yönlendirme / local AI
- Model Router → ENTEGRASYON + GÜVENLİK: capability, modality, complexity, privacy, health ve policy ile provider seçimi.
- OmniRoute → ENTEGRASYON: local multi-provider gateway adayı; exact repository pinlenmeden production adapter açılmaz.
- Ollama + Gemma 4 → KAYRA + VERİ + ARŞİV + ARAŞTIRMA: local/private inference, extraction, preprocessing.
- Pinokio → ENTEGRASYON + KAYRA: local AI application lifecycle/launcher.
- Headroom → KAYRA + VERİ: uzun context/tool output/RAG sıkıştırma ve maliyet kontrolü.

### Görsel / tasarım
- Lovart → TASARIM: konsept, art direction, visual exploration.
- Figma → TASARIM + ÜRÜN + KAYRA: design system, UI/UX, prototyping, handoff.
- Canva → ERMES + TASARIM: hızlı sosyal içerik, template ve campaign variants.
- Stable Diffusion WebUI Forge → TASARIM: local image experimentation.
- FluxGym → TASARIM + ÜRETİM: FLUX LoRA/model training; dataset/license/quality gates zorunlu.
- LivePortrait → TASARIM + ERMES: portrait/avatar motion; license gate zorunlu.
- Remotion + Motion for React → TASARIM + KAYRA + ERMES: programmatic motion graphics, campaign templates and reusable React animation.
- Seedance 2.5 → TASARIM + ERMES + ÜRETİM: reference-controlled fashion video, editing and motion.
- CogStudio/CogVideo → TASARIM + ERMES: experimental video generation/editing; production only after adapter/health verification.
- Runway → TASARIM + ERMES: connected creative production surface; use only capabilities available under the connected plan.
- Higgsfield → TASARIM + ERMES: image/video/marketing production, batch variants, brand/marketing workflows.

### Ses / konuşma
- Lyria 3.5 → TASARIM + ERMES: music/creative audio; automated backend only after verified API.
- Whisper-WebUI → ERMES + ARAŞTIRMA: transcription/media extraction.
- Applio → ERMES: voice conversion experiments; consent/licensing gate.
- Moshi → ERMES + ARAŞTIRMA: voice/dialogue R&D; production disabled until health/API verification.

### 3D / spatial / digital world
- UZAY + Higgsfield Scene Builder → UZAY: 3D/spatial scene creation, asset search and digital-world prototypes.

### Pazarlama / ölçüm / commerce
- ERMES → PAZAR + MÜŞTERİ + ERMES + VERİ: Data, Media, Creative, Measurement operating layer.
- PostHog → VERİ + RAPOR: product analytics, experiments, funnels and measurement.
- monday.com → ÜRÜN + ÜRETİM + PAZAR + MÜŞTERİ: operational planning, workflows, work items and team execution.
- Shopify → PAZAR + ÜRÜN: optional commerce adapter; DİJİY remains canonical source.
- Vercel → KAYRA + ENTEGRASYON: deployment/runtime only for a dedicated DİJİY project; existing lumina is excluded.
- Supabase CORE → ENTEGRASYON + KAYRA + GÜVENLİK: canonical data, auth/security/runtime state and audit.

## 2. Production lanes

Lane A — DİJİY Core:
Supabase → Model Router → ARAS → Agents → Audit/MİHENK.

Lane B — Product/UI:
Ürün brief → Figma → KAYRA/Claude Code → Vercel dedicated DİJİY project → PostHog.

Lane C — Fashion Creative:
ARŞİV/ARAŞTIRMA → TASARIM/Lovart/Figma → image generation → Seedance/Higgsfield/Runway → Remotion/Motion → ERMES → measurement.

Lane D — Local/private AI:
Pinokio → Ollama/Gemma/Forge/Whisper/FluxGym/approved local app → health check → adapter → Model Router → audit.

Lane E — Marketing:
ERMES → creative variants → channel-specific assets → Meta/Instagram/other verified connectors → PostHog/measurement → RAPOR → ARAS.

## 3. Tool-selection rules

1. ARAS chooses capability first, application second.
2. One primary tool per stage; secondary tool is fallback or specialist, not parallel duplication.
3. Prefer verified connected tools over unverified candidates.
4. Local/private data is processed locally when practical.
5. Experimental/community applications never become production routes automatically.
6. Secrets stay outside GitHub.
7. External publishing, financial actions, credential changes and irreversible actions require the existing approval gates.
8. Every production execution writes an auditable execution/provider/tool record.
9. Cost and latency are measured so routing can improve from actual outcomes.
10. The canonical DİJİY data model remains the source of truth; no external application becomes the system of record.

## 4. 30-day implementation program

Phase 1 — Foundation:
- Complete application registry and capability metadata.
- Pin exact repositories/versions for community/local tools.
- Define health checks and license/usage metadata.
- Connect each approved capability to an existing agent.

Phase 2 — Creative production:
- Build one fashion campaign workflow using Lovart/Figma → image → Seedance or Higgsfield/Runway → Remotion/Motion → ERMES.
- Measure generation time, cost, revision count and asset quality.
- Keep Canva as rapid-variant lane, not the canonical design source.

Phase 3 — Local AI:
- Validate Pinokio + Ollama + Gemma 4.
- Add Whisper-WebUI and Forge as controlled local tools.
- Add FluxGym only after dataset/license/quality checks.
- Keep Moshi, Applio, LivePortrait and CogStudio behind explicit experimental/production gates.

Phase 4 — Product surface:
- Figma design system → KAYRA implementation → dedicated DİJİY Vercel project.
- Supabase integration.
- PostHog measurement.
- Do not touch excluded lumina.

Phase 5 — Marketing intelligence:
- ERMES campaign pipeline.
- ARAŞTIRMA/Agent Reach source discovery.
- Creative variants.
- Measurement feedback into ARAS routing.

## 5. Team operating cadence

Daily:
- ARAS reviews failed/blocked/expensive tool executions and assigns corrections.
- KAYRA reviews runtime/integration failures.
- VERİ/RAPOR reviews cost, latency and outcome telemetry.

Weekly:
- TASARIM + ERMES review creative quality and winning workflow patterns.
- ARAŞTIRMA + VERİ review new models/tools and evidence.
- GÜVENLİK reviews permissions, secrets, health and production gates.
- ENTEGRASYON removes stale adapters and verifies connectors.
- ARAS updates routing priorities from measured evidence.

Monthly:
- Capability registry review.
- License/security review for local/community tools.
- Provider portability test.
- Cost/performance benchmark.
- Retire tools that duplicate a capability without measurable benefit.

## 6. Current connection truth

Verified connected in the current environment: Supabase CORE, GitHub, Figma, Canva, Runway. Higgsfield, monday.com and other available integrations are accessible through their current connectors but must still be mapped to DİJİY production adapters before they are treated as canonical production routes.

Vercel currently exposes only the existing "lumina" project; it is excluded from DİJİY. A dedicated DİJİY Vercel project has not yet been created.

Replit apps are visible, but Replit remains paused as a DİJİY core dependency.

Cataloged does not mean connected, and connected does not mean production-approved. ARAS must enforce the distinction.

## 7. Duplicate Work Prevention & Canonical Implementation Protocol

Amaç: Aynı sayfanın, modülün, connector'ın, workflow'un veya altyapı katmanının farklı ajanlar tarafından ikinci kez kurulmasını engellemek.

### Mandatory preflight

Her yeni geliştirme görevi başlamadan önce ARAS/KAYRA şu sırayı uygular:

1. DISCOVER — mevcut repo, açık PR'lar, branch'ler, dosyalar, routes, deployed projects ve ilgili Core kayıtları kontrol edilir.
2. MATCH — istenen capability'nin mevcut bir implementation'ı, PR'ı, prototype'ı veya planı aranır.
3. CANONICALIZE — aynı iş için birden fazla aday varsa tek canonical implementation belirlenir.
4. REUSE — mevcut implementation geliştirilir; ikinci bir paralel implementation oluşturulmaz.
5. HANDOFF — iş başka bir ajana aktarılıyorsa mevcut dosya/PR/task kimliği aktarılır.
6. LOCK — aktif görev kaydına implementation scope ve owner yazılır.
7. BUILD — yalnızca preflight temizse yeni kod/modül oluşturulur.

### Canonical implementation rules

- Aynı kullanıcı ihtiyacı için iki ayrı homepage, web shell, Core service, connector veya workflow oluşturulamaz.
- Prototype ile production implementation aynı anda tutulacaksa açıkça prototype ve canonical olarak etiketlenir.
- Bir PR mevcut implementation'ı zaten sağlıyorsa yeni implementation açılmaz; mevcut PR değerlendirilir veya güncellenir.
- Açık PR'lar yeni geliştirme başlamadan önce kontrol edilir.
- lumina, Replit veya başka excluded/paused yüzeyler DİJİJY canonical implementation'ı olarak kullanılamaz.
- DİJİJY Core canonical source of truth olmaya devam eder.
- Provider ve dış uygulamalar canonical implementation değil, adapter/capability olarak değerlendirilir.

### Agent handoff contract

Her görev aktarımında en az şu alanlar korunur:

- task_id
- goal
- canonical_scope
- current_implementation
- repository_path
- branch
- open_pr
- owner_agent
- status
- next_action
- do_not_duplicate

Bir ajan mevcut implementation bulursa yeniden kurmak yerine mevcut kaydı devam ettirir.

### Duplicate detection gate

Build öncesi şu soruların tamamı cevaplanır:

- Bu iş daha önce yapılmış mı?
- Aynı route/module/component başka yerde var mı?
- Açık PR bunu zaten yapıyor mu?
- Başka bir agent aynı scope üzerinde çalışıyor mu?
- Core'da aynı capability kaydı var mı?
- Mevcut implementation genişletilebilir mi?

Herhangi bir cevap evet ise yeni implementation otomatik başlatılmaz; ARAS scope'u birleştirir.

### Current incident prevention

25.09.2026 tarihinde oluşturulan ilk apps/web yüzeyi ile daha önce mevcut olan PR #1 uygulama temeli aynı ürün yüzeyini iki kez kurmaması gereken örnek olarak kaydedilmiştir. Bundan sonra PR #1'deki mevcut uygulama temeli canonical kabul edilir; yeni web yüzeyleri onun üzerine geliştirilir.

### Definition of done

Bir görev ancak şu koşullarda tamamlanmış sayılır:

- canonical implementation belirlenmiş,
- duplicate implementation oluşmamış,
- açık PR/branch durumu kontrol edilmiş,
- ilgili agent handoff kaydı güncellenmiş,
- Core/canonical data sınırları korunmuş,
- test/validation sonucu kaydedilmiş.