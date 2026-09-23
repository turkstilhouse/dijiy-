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

Dijiy için **yeni ve ayrı** bir Vercel projesi oluşturulacak (`lumina` değil):

- Framework: Next.js · Root: `/` · Install: `pnpm install` · Build: `pnpm build`
- Git: `turkstilhouse/dijiy-`, production branch `main`, PR'lar preview.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `NEXT_PUBLIC_SITE_URL`, `DIJIY_ORGANIZATION_ID`, `DIJIY_PROJECT_ID`.
- Deploy sonrası doğrulama: `GET /api/health` → `supabase.status = "ok"`.

## 7. Faz 0 denetim notları (ARAS için)

CORE salt-okunur incelendi (23.09.2026); hiçbir değişiklik yapılmadı.

- 13 migration mevcut; tüm `public.*` tablolarında RLS açık.
- `private.ai_comms_threads` / `private.ai_comms_messages` tablolarında RLS kapalı.
  `private` şeması API'ye açık değil ve `anon`/`authenticated` rollerinin yetkisi
  yok, dolayısıyla şu an dışarıdan erişilemez. Yine de savunma derinliği için RLS
  açılması önerilir (karar ARAS/kurucuda).
- Bazı `org_access` politikaları `workspace_members.status = 'active'` koşulunu
  kontrol etmiyor (ör. `integrations`, `artifacts`, `workflow_runs`); yeni
  politikalar `status = 'active'` kontrol ediyor. Tutarlılık için gözden geçirilmeli.
- `workspace_members` boş: kullanıcı üyeliği tanımlanana kadar kimliği doğrulanmış
  kullanıcılar da iş verisi göremez. Auth akışı Faz 1'in ilk işi.

## 8. Yol haritası

- **Faz 0 (bu PR):** Next.js temeli, Supabase istemcileri, env/secret yapısı,
  health endpoint, test + CI, dokümantasyon.
- **Faz 1:** Auth (e-posta/OAuth), `workspace_members` onboarding, korumalı rotalar,
  Dijiy Vercel projesi ve ilk preview deploy.
- **Faz 2:** Tasarım sistemi + "Kumaştan Sisteme" immersive ana sayfa
  (Scroll Cinema → Interactive World → Real Data → Real Module).
- **Faz 3:** Alan modülleri (kumaş, katalog, üretim, sipariş) CORE tablolarına bağlı.
- **Sonra:** Shopify e-ticaret modülü.
