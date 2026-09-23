# Vercel — Dijiy deployment kurulumu

Durum: **Hazırlandı, oluşturulmadı.** Proje oluşturma açık onay bekliyor.

> `lumina` (prj_mM9nFNAL45AzQitdPsale2aUlV88) bu depoyla **ilişkilendirilmez,
> değiştirilmez**. Dijiy için yeni ve ayrı bir proje açılır.

## Proje ayarları

| Ayar              | Değer                                                          |
| ----------------- | -------------------------------------------------------------- |
| Takım             | `gulvaarli-9007's projects` (team_mVbeskTZPYqG1ddiSTRhtcX8)    |
| Proje adı         | `dijiy`                                                        |
| Git deposu        | `turkstilhouse/dijiy-`                                         |
| Production branch | `main`                                                         |
| Framework         | Next.js (depodaki `vercel.json` ile sabitlenmiş)               |
| Install / Build   | `pnpm install --frozen-lockfile` / `pnpm build`                |
| Node.js           | 22.x                                                           |
| Fonksiyon bölgesi | `dub1` (Dublin). Supabase `eu-west-1` (İrlanda) ile aynı bölge |

## Ortam değişkenleri

| Değişken                               | Production | Preview | Development | Not                                                                                     |
| -------------------------------------- | ---------- | ------- | ----------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | ✓          | ✓       | ✓           | `https://iqmmjhsrbtzkubgfjyra.supabase.co`                                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✓          | ✓       | ✓           | `sb_publishable_…` (Dashboard'dan)                                                      |
| `NEXT_PUBLIC_SITE_URL`                 | ✓          | —       | —           | Alan adı belli olunca                                                                   |
| `DIJIY_ORGANIZATION_ID`                | ✓          | ✓       | ✓           | `8ba24251-4013-461d-aa40-c3fd9b948266`                                                  |
| `DIJIY_PROJECT_ID`                     | ✓          | ✓       | ✓           | `7d124015-b3c7-4502-90dd-3bff6c3560f0`                                                  |
| `SUPABASE_SECRET_KEY`                  | —          | —       | —           | **Eklenmez.** Faz 1'de ihtiyaç olursa yalnızca Production'a, "Sensitive" olarak eklenir |

Değerler Vercel'e Dashboard veya Vercel entegrasyonu üzerinden girilir. GitHub'a yazılmaz.

## Oluşturma adımları (onay sonrası)

1. Vercel → Add New → Project → `turkstilhouse/dijiy-` içe aktar (proje adı `dijiy`).
2. Yukarıdaki ortam değişkenlerini ekle.
3. İlk deploy (`main` veya PR preview).
4. Doğrulama: `GET https://<deploy>/api/health` → `{"supabase":{"status":"ok"}}`, HTTP 200.
5. Deployment Protection: Preview'lar için Vercel Authentication açık.
6. Supabase Auth → URL Configuration: Dijiy production ve preview URL'lerini ekle
   (Faz 1'de, Auth açılırken).
