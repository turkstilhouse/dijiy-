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
