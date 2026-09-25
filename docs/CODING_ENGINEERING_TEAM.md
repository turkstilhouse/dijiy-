# DİJİJY CODING ENGINEERING TEAM — 2026-09-25

Amaç: DİJİJY'nin kod üretimini tek bir canonical mühendislik hattında toplamak; güçlü coding agents'ları uzmanlıklarına göre eşleştirmek; aynı işi iki kez yaptırmamak ve her değişikliği test/review/güvenlik kapılarından geçirmek.

## Yönetim

- KAYRA — Baş Yazılım Mühendisi & Engineering Director
- ARAS — üst seviye görev, scope, routing ve canonical implementation orkestrasyonu
- Fatma Gül — irreversible, financial, legal, credential, security-policy ve major product kararlarında final human approval

## Coding Agent Team

### 1. CLAUDE CODE — Primary Engineering Agent
Görev:
- canonical repository üzerinde feature geliştirme
- multi-file refactor
- terminal/CLI çalışmaları
- test yazma ve çalıştırma
- debugging
- repo-level implementation
- CLAUDE.md/Skills ile proje kurallarını uygulama

Ana sahip: KAYRA

Claude Code mevcut DİJİJY programında ana yazılım geliştirme yüzeyidir.

### 2. CODEX — Independent Engineering / Review Agent
Görev:
- bağımsız ikinci mühendis gözü
- zor debugging
- architecture/code review
- refactor doğrulama
- test/hardening
- ayrıştırılmış mühendislik görevleri
- gerekirse ayrı worktree/cloud execution

Ana sahip: KAYRA
Kontrol ilişkisi: Claude Code'un ürettiği işin bağımsız doğrulamasında kullanılabilir.

Codex doğrudan production authority değildir; repository policy, tests, security gates ve human approval kuralları aynen geçerlidir.

### 3. CURSOR — IDE Specialist / Optional Surface
Görev:
- hızlı interactive editing
- IDE içi pair-programming
- component-level iteration
- insan geliştiriciyle birlikte lokal düzenleme

Durum: optional. DİJİJY canonical engineering pipeline'ını değiştirmez ve ayrı bir canonical implementation oluşturamaz.

### 4. GEMINI CLI — Specialist / Technology-Watch Candidate
Görev:
- alternatif model/CLI değerlendirmesi
- Google ekosistemi uyumluluğu
- benchmark/PoC
- gerektiğinde specialist fallback

Durum: Technology Watch / evaluation lane. Production routing ancak resmi kaynak, exact version, health, license, adapter ve MİHENK kontrollerinden sonra açılabilir.

## Model-selection policy

Tek bir benchmark bütün coding görevlerini temsil etmez. Kamuya açık 2026 değerlendirmeleri Claude Code, Codex ve Cursor'un farklı yüzeylerde güçlü olduğunu; Terminal-Bench, SWE-bench ve gerçek repo işlerinin aynı şeyi ölçmediğini gösteriyor. Bu nedenle DİJİJY "tek kazanan" modeli değil, görev bazlı routing kullanır.

Öncelik:
1. Canonical repo + task fit
2. doğrulanmış capability
3. güvenlik ve privacy
4. testability
5. kalite
6. latency
7. cost

## Engineering workflow

ARAS
→ duplicate/canonical preflight
→ KAYRA
→ uygun coding agent
→ implementation
→ tests
→ CODE REVIEW
→ SECURITY
→ MİHENK
→ PR
→ human approval when required
→ merge
→ audit

## Duplicate-work lock

- Aynı task için birden fazla coding agent aynı anda canonical implementation yazamaz.
- İkinci agent aynı scope'a ihtiyaç duyarsa reviewer/validator olarak çalışır veya açıkça bölünmüş bir subtask alır.
- Açık PR aynı scope'u kapsıyorsa yeni PR/parallel implementation başlatılmaz.
- Prototype, canonical implementation değildir.
- Her handoff task_id, canonical_scope, repository_path, branch, open_pr, owner_agent ve do_not_duplicate bilgilerini taşır.

## Agent assignment examples

- Next.js/React feature → Claude Code primary; Codex review.
- Supabase/RLS migration → Claude Code implementation; Codex/security validation.
- Difficult bug → Claude Code + Codex independent diagnosis.
- Large refactor → Claude Code; Codex regression review.
- UI interactive editing → Cursor optional; final code remains canonical repo implementation.
- New coding agent discovery → Technology Watch; önce benchmark/PoC, sonra capability registry.

## Production boundary

Coding agents code yazabilir; production yetkisi ayrı bir konudur. Secrets GitHub'a yazılmaz. Auth/RLS/security policy, external publishing, credentials, financial or irreversible actions mevcut approval gates'e tabidir.
