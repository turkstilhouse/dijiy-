# Dijiy Mimarisi

Durum: **Faz 0 — temel ve mimari** (`foundation_and_architecture`).
Sahiplik: KAYRA uygular · ARAS mimari uyumu denetler · Fatma Gül nihai karar mercii.

## 1. Sistem görünümü

```
┌──────────────────────────┐        ┌───────────────────────────────────────┐
│  Tarayıcı / mobil web    │        │  Supabase: TURKSTILHOUSE-CORE         │
│  (React Client Comp.)    │──RLS──▶│  (canonical system of record)         │
└────────────┬─────────────┘        │                                       │
             │ HTTPS                │  auth.*        kimlik / oturum        │
┌────────────▼─────────────┐        │  public.*      iş verisi (RLS açık)   │
│  Vercel — Dijiy projesi  │        │  security_core bağlantı kaydı + Vault │
│  Next.js (App Router)    │──RLS──▶│  private.*     API'ye kapalı          │
│  • Server Components     │        │  storage.*     dosyalar               │
│  • Route Handlers (BFF)  │        └───────────────────────────────────────┘
│  • proxy.ts (oturum)     │
│  • admin client (yalnız  │──secret key (RLS bypass, yalnızca güvenilir işler)
│    güvenilir sunucu işi) │
└──────────────────────────┘
```

- **Supabase CORE canonical'dır.** Uygulama kendi kalıcı durumunu tutmaz; tüm iş
  verisi CORE'da yaşar. Dijiy, CORE içinde bir kiracıdır:
  - `public.organizations` → `turkstilhouse`
  - `public.projects` → slug `dijiy-dijital-ipek-yolu`
- **Vercel yalnızca çalışma katmanıdır** ve Dijiy için ayrı bir projede çalışır.
  Mevcut `lumina` projesi bu depoyla ilişkilendirilmez.

## 2. Depo yapısı

```
src/
  app/                 Next.js rotaları (UI + Route Handlers)
    api/health/        Sağlık kontrolü (Supabase Auth + REST probu)
  lib/
    env/               Zod ile doğrulanan ortam değişkenleri
      public.ts        NEXT_PUBLIC_* (tarayıcıya güvenli)
      server.ts        yalnızca sunucu (import "server-only")
    supabase/
      browser.ts       Client Component istemcisi (publishable key, RLS)
      server.ts        Server Component/Action istemcisi (cookie oturumu, RLS)
      proxy.ts         Her istekte oturum yenileme
      admin.ts         Secret key istemcisi — RLS'i ATLAR, yalnızca güvenilir işler
      database.types.ts CORE şemasından üretilmiş tipler
  modules/             Alan (domain) modülleri — iş mantığı burada
    platform/          Altyapı servisleri (health, ileride audit/event)
  proxy.ts             Next.js 16 proxy (eski adıyla middleware)
supabase/migrations/   Yalnızca ÖNERİ migration'ları — production'a uygulanmaz
scripts/               Operasyon betikleri (verify-supabase)
tests/                 Test kurulum dosyaları
```

### Modül kuralları

- Her alan `src/modules/<alan>/` altında yaşar (ileride: `catalog`, `fabrics`,
  `production`, `orders`, `customers`, `agents`). CORE'daki tablolarla birebir
  hizalanır.
- UI (`app/`) modüllere bağımlıdır; modüller `app/`'e bağımlı olamaz.
- Veritabanı erişimi yalnızca `lib/supabase` fabrikaları üzerinden yapılır.
- Modül dışına çıkan her fonksiyonun Zod ile doğrulanmış girdisi vardır.

## 3. Veri erişim modeli

| İstemci                       | Anahtar                           | RLS | Kullanım                                   |
| ----------------------------- | --------------------------------- | --- | ------------------------------------------ |
| `createSupabaseBrowserClient` | publishable                       | ✅  | Etkileşimli UI, realtime                   |
| `createSupabaseServerClient`  | publishable + kullanıcı cookie'si | ✅  | Varsayılan sunucu erişimi                  |
| `createSupabaseAdminClient`   | secret                            | ❌  | Worker, webhook, denetlenmiş sistem işleri |

CORE'daki RLS politikaları `workspace_members` üyeliğine dayanır. Bu nedenle
anonim ziyaretçi hiçbir iş verisini göremez; kimliği doğrulanmış kullanıcı yalnızca
aktif üyesi olduğu organizasyonun verisini görür.

## 4. Secret yönetimi

- Git'te yalnızca `.env.example` (değersiz şablon) tutulur; `.env*` yok sayılır.
- Yerel: `.env.local`. Deploy: Vercel Environment Variables (Development /
  Preview / Production ayrı).
- Harici servis kimlik bilgileri Supabase **Vault**'ta tutulur;
  `security_core.service_connections` yalnızca referans (vault_secret_id) içerir.
- `SUPABASE_SECRET_KEY` sadece ihtiyaç duyan bir özellik geldiğinde, yalnızca
  Production/Preview sunucu ortamına eklenir.

## 5. Migration politikası

1. Şema değişikliği önerisi `supabase/migrations/<timestamp>_<ad>.sql` olarak PR'a eklenir.
2. ARAS, CORE canonical modeliyle uyumu denetler; kurucu onaylar.
3. Uygulama bu depodan otomatik yapılmaz. Onaylı migration önce bir Supabase
   **branch**'inde denenir, sonra kontrollü şekilde production'a alınır.
4. Sonrasında `database.types.ts` yeniden üretilir.

## 6. Deploy (Vercel) — plan

Ayrıntılı kurulum: [`docs/deploy/vercel.md`](./docs/deploy/vercel.md). `vercel.json` depoda hazır.

Dijiy için **yeni ve ayrı** bir Vercel projesi oluşturulacak (`lumina` değil):

- Framework: Next.js · Root: `/` · Install: `pnpm install` · Build: `pnpm build`
- Git: `turkstilhouse/dijiy-`, production branch `main`, PR'lar preview.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `NEXT_PUBLIC_SITE_URL`, `DIJIY_ORGANIZATION_ID`, `DIJIY_PROJECT_ID`.
- Deploy sonrası doğrulama: `GET /api/health` → `supabase.status = "ok"`.

## 7. Güvenlik denetimi ve taslak migration'lar

CORE salt-okunur denetlendi. Bulgular, yetki matrisi ve açık sorular:
[`docs/security/rls-audit-2026-09.md`](./docs/security/rls-audit-2026-09.md).

Taslak migration'lar (`supabase/migrations/`, **production'a uygulanmadı**):

| Dosya                                                  | Konu                                               |
| ------------------------------------------------------ | -------------------------------------------------- |
| `20260923150000_private_ai_comms_enable_rls.sql`       | F0: `private.ai_comms_*` RLS                       |
| `20260923150100_harden_legacy_org_access_policies.sql` | F1–F4: aktif üyelik + rol sınırları                |
| `20260923150200_restrict_global_row_writes.sql`        | F5: global satırlara yalnızca `service_role` yazar |

Her biri `supabase/tests/rls.test.ts` ile yerel Postgres'te (PGlite) test edilir.

## 8. Yol haritası

- **Faz 0 (bu PR):** Next.js temeli, Supabase istemcileri, env/secret yapısı,
  health endpoint, test + CI, dokümantasyon.
- **Faz 1:** RLS taslaklarının onayı → Auth + tenant yetkilendirmesi
  ([plan](./docs/plans/phase-1-auth-tenancy.md)), Dijiy Vercel projesi
  ([kurulum](./docs/deploy/vercel.md)) ve ilk preview deploy.
- **Faz 2:** Tasarım sistemi + "Kumaştan Sisteme" immersive ana sayfa
  (Scroll Cinema → Interactive World → Real Data → Real Module).
- **Faz 3:** Alan modülleri (kumaş, katalog, üretim, sipariş) CORE tablolarına bağlı.
- **Sonra:** Shopify e-ticaret modülü.
