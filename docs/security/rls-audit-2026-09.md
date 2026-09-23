# RLS Denetimi — TURKSTILHOUSE-CORE (23.09.2026)

Kapsam: `public`, `private`, `security_core` şemalarındaki RLS politikaları.
Yöntem: Production üzerinde **yalnızca salt-okunur** katalog sorguları
(`pg_policies`, `pg_proc`, `pg_constraint`, `information_schema`). Hiçbir DDL/DML
çalıştırılmadı.

Doğrulama: Politikalar birebir kopyalanarak yerel bir Postgres'te (PGlite, bellek içi)
yeniden kuruldu. `supabase/tests/rls.test.ts` her bulguyu önce **mevcut davranışta
yeniden üretir**, sonra taslak migration'lar uygulandığında **düzeldiğini** ve
meşru erişimin bozulmadığını kanıtlar (`pnpm test`).

> Durum: Tüm migration'lar **TASLAK**. Production'a uygulanmadı. ARAS incelemesi ve
> kurucu onayı gerekir.

## Özet

| #   | Bulgu                                                                            | Etki                                                                                                                                                           | Önem                          | Taslak           |
| --- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------- |
| F0  | `private.ai_comms_*` RLS kapalı                                                  | Bugün erişim yok (şema API'ye kapalı, grant yok); savunma derinliği eksik                                                                                      | Düşük                         | `20260923150000` |
| F1  | 10 legacy `org_access` politikası `status = 'active'` kontrol etmiyor            | Askıya alınmış / davetli üyeler tam okuma-yazma yetkisini korur                                                                                                | **Yüksek**                    | `20260923150100` |
| F2  | Aynı politikalar her üyeye `FOR ALL` veriyor (viewer dahil)                      | Viewer: entegrasyonları, risk seviyelerini değiştirebilir, **kendi onay talebini onaylayabilir**                                                               | **Yüksek**                    | `20260923150100` |
| F3  | `product_fabrics` üzerinde fazladan permissive `FOR ALL` politikası              | "Yalnızca manager yazar" kuralını sessizce geçersiz kılar                                                                                                      | Orta                          | `20260923150100` |
| F4  | Legacy politikalar `public` rolüne bağlı ve `auth.uid()` satır başına çağrılıyor | Gereksiz yüzey + performans                                                                                                                                    | Düşük                         | `20260923150100` |
| F5  | `organization_id IS NULL` (global) satırlar herkese yazılabilir                  | Üyeliği olmayan **herhangi bir kayıtlı kullanıcı** global uzmanları / bilgi kaynaklarını ekleyip silebilir. Production'daki 10 `experts` satırının 10'u global | **Yüksek** (Auth açıldığında) | `20260923150200` |

Bugün `auth.users` ve `workspace_members` boş olduğu için bu açıklar **henüz
istismar edilemez**. Ancak Faz 1'de Auth açılmadan önce kapatılmaları gerekir.

## Ayrıntılar

### F0 — private.ai_comms_threads / ai_comms_messages

- Sahibi `postgres`, grant yalnızca `postgres` ve `service_role`.
- `anon`/`authenticated` rollerinin `private` şemasında `USAGE` hakkı yok ve şema
  PostgREST'e açık değil.
- Taslak: RLS aç, **politika ekleme** (varsayılan olarak reddet). `service_role`
  BYPASSRLS olduğundan ve tablo sahibi etkilenmediğinden mevcut davranış değişmez.

### F1 / F2 / F4 — legacy `org_access`

Etkilenen tablolar: `integrations`, `integration_surfaces`, `capabilities`,
`operation_catalog`, `app_builds`, `artifacts`, `workflow_templates`,
`workflow_runs`, `tool_performance_log`, `human_approval_requests`.

Mevcut politika:

```sql
USING (organization_id IN (SELECT organization_id FROM workspace_members
                           WHERE user_id = auth.uid()))   -- status yok, rol yok
```

Önerilen yetki matrisi (yalnızca `status = 'active'` üyeler):

| Grup                         | Tablolar                                                            | Okuma      | Ekleme / Güncelleme                                                       | Silme        |
| ---------------------------- | ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- | ------------ |
| A — Yönetişim yapılandırması | integrations, integration_surfaces, capabilities, operation_catalog | tüm üyeler | owner, admin                                                              | owner, admin |
| B — Operasyonel veri         | app_builds, artifacts, workflow_templates, workflow_runs            | tüm üyeler | owner, admin, manager, member                                             | owner, admin |
| C — Log (append-only)        | tool_performance_log                                                | tüm üyeler | ekleme: owner…member; güncelleme yok                                      | yok          |
| D — İnsan onayı              | human_approval_requests                                             | tüm üyeler | ekleme: yalnızca `pending`; karar: owner, admin ve `decided_by = kendisi` | yok          |

Yeni yardımcı fonksiyon: `public.has_org_role(org uuid, roles text[])`
(`SECURITY DEFINER`, `search_path = ''`, `anon`'dan yetki geri alınmış).

### F3 — product_fabrics

Üç politika var. `product_fabrics_via_product` (`FOR ALL`, her üye) permissive
olduğu için diğer ikisiyle OR'lanır ve manager-only yazma kuralını etkisiz kılar.
Taslak bu politikayı kaldırır. Okuma ve manager yazma politikaları aynen kalır.

### F5 — global satırlar

`experts`, `knowledge_sources`, `knowledge_documents` ve alt tabloları
(`expert_capabilities`, `expert_evaluations`, `knowledge_chunks`):

```sql
USING/WITH CHECK ((organization_id IS NULL) OR is_org_member(organization_id))
```

Taslak: global satırlar tüm kayıtlı kullanıcılarca **okunabilir** kalır. Yazma
yalnızca `service_role` (güvenilir sunucu işleri) ile yapılır. Organizasyona ait
satırlarda mevcut davranış korunur.

## ARAS'ın karar vermesi gereken açık sorular

1. **Viewer rolü:** B grubunda viewer salt-okunur yapıldı. F5'te organizasyon satırları
   için rol ayrımı eklenmedi (mevcut davranış korundu). Tüm tablolarda tutarlı bir
   rol matrisi isteniyor mu?
2. **Onay yetkisi:** `human_approval_requests` kararını yalnızca owner/admin verebilir.
   Kurucu direktifi ("Fatma Gül nihai karar merciidir") için belirli onay türlerinde
   yalnızca `owner` mı olmalı?
3. **Katalog tabloları:** `ai_models`, `ai_providers`, `ai_tools`, `system_settings`
   tüm kayıtlı kullanıcılara açık (`USING true`). `system_settings` içeriği hassas
   değilse sorun yok; aksi halde üyelikle sınırlanmalı.
4. **`is_org_member` erişimi:** `anon` tarafından RPC ile çağrılabilir (yalnızca
   çağıranın kendi üyeliğini döner, sızıntı yok). İstenirse `anon`'dan geri alınabilir.

## Uygulama planı (onay sonrası)

1. Supabase **branch** oluştur (maliyet onayı gerekir) → üç migration'ı sırayla uygula.
2. `get_advisors(security)` temiz mi kontrol et. Branch üzerinde uygulama akışlarını dene.
3. Production'a kontrollü uygulama (kurucu onayı), ardından `database.types.ts` yenile.
4. Geri alma: her migration yalnızca politika/fonksiyon değiştirir, veri değiştirmez.
   Eski politikaların tanımları `supabase/tests/fixtures/core_baseline.sql`
   içinde birebir durur.
