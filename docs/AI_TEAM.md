# DİJİY AI TEAM

ARAS is the central orchestrator. Fatma Gül is the final human decision-maker for irreversible, financial, legal, credential and major product decisions.

## Core
- ARAS — Baş Sistem Mimarı & Strateji Direktörü
- KAYRA — Baş Yazılım Mühendisi & Uygulama Direktörü
- ÜRÜN — Ürün & Ekosistem Direktörü
- ENTEGRASYON — DİJİY Connect & Provider Direktörü

## Data / Intelligence
- VERİ — Veri & Ölçüm Direktörü
- ARAŞTIRMA — Araştırma & Pazar İstihbaratı Direktörü
- ARŞİV — Türk Kültür Arşivi & Bilgi Direktörü
- RAPOR — Raporlama & Denetim Direktörü

## Commerce / Operations
- PAZAR — Marketplace Direktörü
- MÜŞTERİ — CRM & Müşteri Direktörü
- KUMAŞ — Kumaş & Tedarik Direktörü
- MALİYET — Maliyet & Fiyatlandırma Direktörü
- ÜRETİM — Üretim Koordinasyon Direktörü
- ERMES — Pazarlama & Reklam İşletim Sistemi

## Creative / Spatial
- TASARIM — Tasarım Direktörü
- UZAY — 3D, Spatial & Digital World Direktörü
- DÜNYA — Global Kültür, Dil & Yerelleştirme Direktörü

## Trust
- GÜVENLİK — Güvenlik, Risk & QA Direktörü

## New Capability Assignments — 2026-09-25

Yeni eklenen araç/model yetenekleri yeni bağımsız ajan olarak çoğaltılmaz; mevcut ajanlara capability olarak bağlanır.

### TASARIM + ERMES + ÜRETİM
- Seedance 2.5 — video generation/editing, fashion campaign motion ve reference-controlled creative.
- Lyria 3.5 — müzik ve yaratıcı ses üretimi; otomatik backend routing yalnızca doğrulanmış API/connector bulunduğunda.

### KAYRA + VERİ + ARŞİV + ARAŞTIRMA
- Gemma 4 + Ollama — local/private inference, structured extraction, agent sub-task ve privacy-sensitive preprocessing.
- Local runtime health ve public exposure kontrolleri zorunlu.

### ARAŞTIRMA + VERİ
- Agent Reach — public-web research, source/channel discovery ve research health checks.
- Kaynak provenance ve connector güvenlik kuralları korunur.

### ENTEGRASYON + GÜVENLİK
- Model Router — provider seçimini capability, modality, complexity, privacy, verification, health ve policy üzerinden yapar.
- Provider'lar canonical source değildir; adapter olarak kalır.

### R&D / DISABLED
- DeepSeek V4 Plus — unverified candidate; production routing kapalı.
- Meituan talking-video candidate — exact official model/API doğrulanana kadar production routing kapalı.

## Operating Model
Agents are capability-based. ARAS routes work to agents, models and tools through canonical DİJİY contracts.

Execution flow:
Fatma Gül → ARAS → Task/Plan → Model Router → Domain Agents → Tools/Connectors → Validation/MİHENK → Human Approval when required → Canonical Data → Audit → ARAS.

Cross-cutting control layers:
- MODEL ROUTER — görev için uygun AI/model seçimi
- EVENT ENGINE — olay bazlı otomatik tetikleme
- TASK ENGINE — görev, alt görev, bağımlılık ve durum yönetimi
- MEMORY — doğrulanmış sistem hafızası ve durum
- AUDIT — izlenebilirlik ve işlem kayıtları
- MİHENK — kalite, politika, güvenlik ve onay kapısı

External tools and providers are replaceable adapters, not the source of truth.


## Full Application-to-Agent Binding — 2026-09-25

The application registry is capability-based. The following tools are attached to existing agents rather than created as duplicate agents.

- KAYRA: Claude Code, Claude Cowork, Claude scheduled workflows, Claude Agent Skills/CLAUDE.md, Context7, Codex remote tasks, claude-mem (developer-only), Headroom.
- ENTEGRASYON: Model Router, OmniRoute candidate, Pinokio, Vercel, Supabase, provider/connector lifecycle.
- ARAŞTIRMA: Agent Reach, LMArena/Chatbot Arena, Perplexity (optional), Whisper-WebUI.
- VERİ: PostHog, Agent Reach, Gemma 4/Ollama, Headroom, model/tool evaluation telemetry.
- ARŞİV: Gemma 4/Ollama, Agent Reach and archive extraction workflows.
- TASARIM: Lovart, Figma, Canva, Seedance 2.5, Runway, Higgsfield, Stable Diffusion WebUI Forge, FluxGym, LivePortrait, CogStudio/CogVideo, Remotion, Motion for React.
- ERMES: Higgsfield Marketing Studio, Runway, Seedance 2.5, Canva, Remotion/Motion, Lyria 3.5, Whisper-WebUI, Applio/Moshi experimental, Meta/Instagram when connected.
- ÜRETİM: Seedance 2.5, FluxGym, local creative tools and production workflow controls.
- UZAY: Higgsfield Scene Builder and approved 3D/spatial tools.
- ÜRÜN: Figma, monday.com, Vercel delivery planning, Shopify adapter.
- PAZAR: ERMES, Shopify adapter, monday.com.
- MÜŞTERİ: ERMES, monday.com, PostHog.
- RAPOR: PostHog, model/tool evaluation, audit and cost reporting.
- GÜVENLİK: Model Router, policy gates, local runtime health, secrets and license/production gates.
- DÜNYA: localization workflows through the canonical content layer and approved creative tools.

### Production boundary

Cataloged applications are not automatically connected. Connected applications are not automatically production-approved. Community/local tools require exact repository/version, health, license and adapter verification. External providers remain replaceable adapters; DİJİY remains the source of truth.

### Program

Detailed tool-selection, production lanes, 30-day implementation phases and operating cadence are defined in `docs/AI_APPLICATION_OPERATING_PROGRAM.md`.
