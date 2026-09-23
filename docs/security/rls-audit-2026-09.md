# RLS Denetimi — TURKSTILHOUSE-CORE (23.09.2026)

Kapsam: `public` ve `private` şemalarındaki RLS politikaları.
Yöntem: Production üzerinde **yalnızca salt okunur** katalog sorguları
(`pg_policies`, `pg_proc`, `pg_constraint`, `information_schema`). Hiçbir DDL/DML
çalıştırılmadı.

> Durum: Tüm migration'lar **TASLAK**. Production'a uygulanmadı. Supabase
> development branch'i oluşturulmadı. PR #1 açık, birleştirilmedi.

## Doğrulama

| Katman                                                                                           | Ne kanıtlar                                                                                                                                                                            | Sonuç                                 |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `supabase/tests/rls.test.ts` (PGlite, bellek içi Postgres 18)                                    | Production politikalarının birebir kopyası üzerinde her bulgu **önce yeniden üretilir**, sonra migration'larla **kapandığı** ve meşru erişimin korunduğu gösterilir                    | 42/42 geçti                           |
| `supabase/tests/preflight.sql` (production'da salt okunur)                                       | Migration'ların dokunduğu 39 politikanın ve kullandığı tüm sütunların production'da var olduğunu, yeni nesnelerin çakışmadığını ve ele alınmayan yazma politikası kalmadığını doğrular | **0 sorun** (23.09.2026)              |
| CI işi `rls-supabase` (GitHub Actions, `supabase/postgres:17.6.1.166`, production ile aynı imaj) | Aynı 42 test gerçek Postgres 17'de, Supabase'in kendi `anon`/`authenticated`/`service_role` rolleri ve `auth.uid()` ile çalışır. Ücretsiz; her PR'da tekrarlanır                       | PR #1 CI sonucuna bakın               |
| Supabase development branch                                                                      | Gerçek Supabase ortamında (Postgres 17, gerçek `auth` şeması) uygulama                                                                                                                 | **Bekliyor** (ücretli; aşağıya bakın) |

Testler yalnızca veritabanının gerçekten reddettiği durumları (`42501`
yetki/RLS, `23514` kontrol/trigger) "engellendi" sayar. Diğer hatalar (ör. test
SQL'inde yazım hatası) testi düşürür, yanlış bir "güvenli" sonucu gizleyemez.

## Özet

| #   | Bulgu                                                                   | Etki                                                                                                                                                       | Önem       | Taslak    |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- |
| F0  | `private.ai_comms_*` RLS kapalı                                         | Bugün erişim yok (şema API'ye kapalı, grant yok); savunma derinliği eksik                                                                                  | Düşük      | `…150000` |
| F1  | Legacy `org_access` politikaları `status = 'active'` kontrol etmiyor    | Askıdaki ve davetli üyeler tam okuma/yazma yetkisini korur                                                                                                 | **Yüksek** | `…150100` |
| F2  | Aynı politikalar her üyeye `FOR ALL` veriyor                            | Viewer entegrasyonları ve risk seviyelerini değiştirebilir, **onay talebini onaylayabilir**                                                                | **Yüksek** | `…150100` |
| F3  | `product_fabrics` üzerinde fazladan permissive politika                 | "Yalnızca manager yazar" kuralını etkisiz kılar                                                                                                            | Orta       | `…150100` |
| F4  | Politikalar `public` rolüne bağlı; `auth.uid()` satır başına çağrılıyor | Gereksiz yüzey ve performans kaybı                                                                                                                         | Düşük      | `…150100` |
| F5  | Global satırlar (`organization_id IS NULL`) herkese yazılabilir         | Üyeliği olmayan **herhangi bir kayıtlı kullanıcı** global uzmanları ve bilgi kaynaklarını değiştirebilir. Production'da 10 `experts` satırının 10'u global | **Yüksek** | `…150200` |
| F6  | Kalan tüm iş tablolarında `FOR ALL` her aktif üyeye açık                | Viewer sipariş, müşteri, görev ve **audit kaydı** oluşturabilir, değiştirebilir, silebilir                                                                 | **Yüksek** | `…150300` |

Bugün `auth.users` ve `workspace_members` boş olduğundan bu açıklar **henüz
istismar edilemez**. Auth (Faz 1) açılmadan önce kapatılmaları gerekir.

## ARAS kararları (23.09.2026) → uygulama

| Karar                                                  | Migration                                                                 | Test                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Viewer salt okunur; hiçbir iş verisini değiştiremez    | `…150100`, `…150200`, `…150300`                                           | "viewer is read-only": 24 org tablosu ve 6 alt tabloda insert/update/delete reddedilir, okuma çalışır |
| Kendi talebini onaylama kesinlikle yasak               | `…150100`: `requested_by` sütunu, RLS ve trigger                          | owner/admin kendi talebini onaylayamaz; `service_role` bile `decided_by = requested_by` yazamaz       |
| Onay, yetkili yöneticiye bağlı; owner/admin ayrımı net | `…150100`: `approval_decider_roles()`                                     | Normal türleri owner/admin, yüksek riskli 4 türü **yalnızca owner** onaylar                           |
| Askıdaki ve davetli üyeler iş verisine erişemez        | `…150100`, `…150300` (`is_org_member` / `has_org_role` yalnızca `active`) | 30 tabloda okuma ve yazma reddedilir                                                                  |
| Global experts okunur, normal kullanıcı yazamaz        | `…150200`                                                                 | stranger → owner arası 6 rol, 6 tabloda yazma reddedilir; `service_role` yazabilir                    |

## Yetki matrisi (migration sonrası; yalnızca `status = 'active'` üyeler)

| Grup                     | Tablolar                                                                                                                                                                                         | Okuma                    | Ekleme / güncelleme                                                              | Silme                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------- | ------------------------------ |
| A — Yönetişim            | integrations, integration_surfaces, capabilities, operation_catalog, projects, routing_rules, agent_assignments                                                                                  | tüm üyeler               | owner, admin                                                                     | owner, admin                   |
| B — Operasyonel          | app_builds, artifacts, workflow_templates, workflow_runs, orchestration_runs, customers, suppliers, fabrics, products, orders, production_orders, tasks, decisions, predictions (+ alt tablolar) | tüm üyeler               | owner, admin, manager, member                                                    | owner, admin                   |
| C — Defter (append-only) | tool_performance_log, audit_events, cost_events                                                                                                                                                  | tüm üyeler               | yalnızca ekleme: owner…member                                                    | yok                            |
| D — İnsan onayı          | human_approval_requests                                                                                                                                                                          | tüm üyeler               | talep: owner…member (`pending`, `requested_by = kendisi`) · karar: aşağıya bakın | yok                            |
| E — Global bilgi         | experts, knowledge_* (org_id NULL)                                                                                                                                                               | tüm kayıtlı kullanıcılar | yalnızca `service_role`                                                          | yalnızca `service_role`        |
| Değişmedi                | collections, fabric_stock, product_collections, supplier_fabrics                                                                                                                                 | tüm üyeler               | owner, admin, manager (mevcut)                                                   | owner, admin, manager (mevcut) |

`viewer` hiçbir grupta yazamaz. `service_role` (agent/worker) RLS'i atlar;
onay kuralları trigger ile ona da uygulanır.

### Onay modeli (D)

| Kural                                                                                                                                                                            | Uygulandığı yer                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Talep eden kaydedilir: `requested_by` varsayılanı `auth.uid()`; başkası adına talep açılamaz                                                                                     | Sütun + INSERT politikası                          |
| Talep `pending` olarak açılır; `decided_*` alanları boş olmalı                                                                                                                   | INSERT politikası                                  |
| Kendi talebini onaylama yasak (owner dahil)                                                                                                                                      | UPDATE politikası + trigger (`service_role` dahil) |
| Karar veren yalnızca kendisini `decided_by` olarak yazabilir                                                                                                                     | UPDATE politikası                                  |
| `irreversible_external_actions`, `financial_commitments`, `legal_commitments`, `credential_changes` türlerini **yalnızca owner** onaylar; diğer türleri owner veya admin onaylar | `approval_decider_roles()`                         |
| Karar kesindir; talep alanları değiştirilemez                                                                                                                                    | Trigger                                            |
| Onay veya ret, insan adı (`decided_by`) olmadan kaydedilemez; `expired` durumu için gerekmez                                                                                     | Trigger                                            |
| Onay geçmişi istemci tarafından silinemez                                                                                                                                        | DELETE politikası yok                              |

Yüksek riskli tür adları ARAS `system_contract.human_approval_required_for`
ile birebir aynıdır.

## Açık sorular (ARAS)

1. **Katalog tabloları:** `ai_models`, `ai_providers`, `ai_tools`, `system_settings`
   tüm kayıtlı kullanıcılara açık (`USING true`). Auth invite-only olacağı için
   risk düşük. `system_settings` hassas içerik taşıyorsa üyelikle sınırlanmalı.
2. **`is_org_member` erişimi:** `anon` RPC ile çağırabilir. Yalnızca çağıranın
   kendi üyeliğini döndürdüğü için sızıntı yok; istenirse `anon`'dan geri alınabilir.
3. **Yeni onay türleri:** Yüksek riskli tür listesi fonksiyonda sabit. Yeni tür
   eklemek migration gerektirir (bilinçli tercih). Tablo tabanlı yönetim istenirse
   Faz 1'de ele alınabilir.

## Development branch — maliyet ve seçenekler

TURKSTILHOUSE organizasyonu şu an **Free** planda. Supabase branching yalnızca
**Pro** planda kullanılabilir.

| Kalem                              | Tutar (Supabase resmi belgeleri)                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Pro plan                           | **25 $/ay** (organizasyon başına)                                                                                            |
| Branch compute (Micro, varsayılan) | **0,01344 $/saat** (≈ 0,32 $/gün, 730 saatte ≈ 9,81 $). Compute kredisi ve harcama limiti (Spend Cap) bu kalemi **kapsamaz** |
| Branch disk/egress                 | Plan kotasından düşer; test için ihmal edilebilir                                                                            |
| Production projesi compute         | Pro'da Micro ≈ 10 $/ay; dahil olan 10 $ compute kredisiyle karşılanır                                                        |

Tahmini toplam: **25 $/ay** (Pro) **+ branch açık kaldığı saat × 0,01344 $.**
Tek seferlik test (branch birkaç saat açık, sonra silinir) ≈ **25,05 $**.

Branch oluşturulmadı. Onay sonrası izlenecek adımlar:

1. Pro'ya geçiş (Dashboard → Billing; **kurucu tarafından**).
2. `create_branch` → Supabase production migration geçmişini branch'e otomatik uygular.
3. Branch'te `supabase/tests/preflight.sql` → 0 satır beklenir.
4. Dört taslak sırayla `apply_migration` ile uygulanır → `get_advisors(security)`.
5. Branch'te gerçek Auth kullanıcılarıyla duman testi (viewer, admin, owner).
6. Sonuçlar PR'a eklenir, branch silinir (maliyet durur).
7. Production'a uygulama **ayrı bir kurucu onayı** gerektirir.

Ücretsiz alternatifler:

- **CI'da gerçek Supabase imajı (uygulandı):** `rls-supabase` işi production ile
  aynı Postgres imajında RLS testlerini çalıştırır. Kapsamadığı tek şey,
  production'ın 13 migration'ının tam şemasıdır (fixture minimaldir); bu fark,
  production'da salt okunur çalışan `preflight.sql` ile kapatılır.

- **Supabase CLI ile yerel stack** (Docker, kurucu veya geliştirici makinesinde): 0 $.
  Production migration geçmişinin depoya alınması gerekir. Bu oturumda bu işlem,
  production SQL'inin depoya kopyalanması olduğu için güvenlik denetimi tarafından
  durduruldu. Kurucu onayıyla `supabase db pull` yapılabilir.
- **İkinci Free proje** (Free plan 2 projeye izin verir): 0 $. Aynı geçmiş
  gereksinimi var; production ile birebir değil.

## Geri alma

Migration'lar veri silmez. Değişenler politikalar ve fonksiyonlar; eklenen tek
sütun `human_approval_requests.requested_by` (boş tablo). Eski politika
tanımları `supabase/tests/fixtures/core_baseline.sql` içinde birebir durur.
