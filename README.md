# Dijiy — Dijital İpek Yolu

Kumaştan sisteme: Anadolu tekstil, tasarım, üretim ve pazar yeri platformu.
Bu depo Dijiy'nin **ana uygulama kod deposudur**.

| Katman                    | Teknoloji                                                     | Not                           |
| ------------------------- | ------------------------------------------------------------- | ----------------------------- |
| Uygulama (frontend + BFF) | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 | `src/`                        |
| Backend / veritabanı      | Supabase **TURKSTILHOUSE-CORE** (Postgres 17, Auth, Storage)  | Canonical kayıt sistemi       |
| Çalışma ortamı            | Vercel — **ayrı Dijiy projesi** (henüz oluşturulmadı)         | `lumina` projesine dokunulmaz |
| Test                      | Vitest + Testing Library                                      | `pnpm test`                   |

Mimari ayrıntılar: [ARCHITECTURE.md](./ARCHITECTURE.md) · Katkı kuralları: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Hızlı başlangıç

Gereksinimler: Node.js ≥ 22, pnpm 10.

```bash
pnpm install
cp .env.example .env.local   # anahtarları .env.local'e yazın; asla commit etmeyin
pnpm verify:supabase         # Supabase bağlantısını doğrular
pnpm dev                     # http://localhost:3000
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` değerini Supabase Dashboard →
TURKSTILHOUSE-CORE → Project Settings → API Keys bölümünden alın
(`sb_publishable_...`).

## Komutlar

| Komut                           | Açıklama                                                          |
| ------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                      | Geliştirme sunucusu                                               |
| `pnpm build` / `pnpm start`     | Production derlemesi / çalıştırma                                 |
| `pnpm check`                    | lint + typecheck + test                                           |
| `pnpm test` / `pnpm test:watch` | Birim testleri                                                    |
| `pnpm format`                   | Prettier                                                          |
| `pnpm verify:supabase`          | Auth ve REST uç noktalarına publishable key ile erişimi test eder |

## Sağlık kontrolü

`GET /api/health` → uygulama ve Supabase (Auth + PostgREST) durumunu döner.
Hiçbir satır okumaz, hiçbir anahtar döndürmez. Supabase erişilemezse `503`.

## Ortam değişkenleri

Tüm liste ve açıklamalar `.env.example` içinde. Özet:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — tarayıcıya
  açık; güvenlik RLS ile sağlanır.
- `SUPABASE_SECRET_KEY` — **yalnızca sunucu**, RLS'i atlar; varsayılan olarak boş.
- `DIJIY_ORGANIZATION_ID`, `DIJIY_PROJECT_ID` — CORE içindeki Dijiy kiracı kimlikleri.

Gerçek değerler yalnızca `.env.local` (yerel) ve Vercel Environment Variables
(deploy) içinde tutulur.

## Veritabanı tipleri

`src/lib/supabase/database.types.ts` CORE şemasından üretilir. Şema değişince
yeniden üretin:

```bash
pnpm dlx supabase gen types typescript --project-id iqmmjhsrbtzkubgfjyra > src/lib/supabase/database.types.ts
```

## Güvenlik kuralları

- Production veritabanına bu depodan **migration uygulanmaz**. Öneriler
  `supabase/migrations/` altına eklenir ve ARAS + kurucu onayından geçer.
- Secret/API anahtarı değerleri GitHub'a yazılmaz.
- `lumina` (Vercel) ve Replit ortamlarına dokunulmaz; eski TURKSTILHOUSE/Replit
  kodu taşınmaz.
