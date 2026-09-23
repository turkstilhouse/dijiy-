## Özet

<!-- Ne değişti ve neden? -->

## Mimari uyum (ARAS kontrolü)

- [ ] Supabase CORE canonical kalıyor; uygulama yalnızca RLS altında veri okuyor/yazıyor
- [ ] Yeni tablo/şema değişikliği yok **veya** `supabase/migrations/` içinde öneri olarak eklendi (production'a uygulanmadı)
- [ ] Secret/API anahtarı değeri eklenmedi
- [ ] lumina / Replit / eski TURKSTILHOUSE koduna dokunulmadı

## Test

- [ ] `pnpm check` geçiyor
- [ ] `pnpm build` geçiyor
