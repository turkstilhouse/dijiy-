# supabase/

Canonical backend: Supabase projesi **TURKSTILHOUSE-CORE** (`iqmmjhsrbtzkubgfjyra`, eu-west-1).

`migrations/` yalnızca **önerilen** şema değişikliklerini içerir. Bu klasördeki
dosyalar production veritabanına bu depodan otomatik uygulanmaz. Süreç için
`ARCHITECTURE.md` → "Migration politikası" bölümüne bakın.

## Testler

`tests/fixtures/core_baseline.sql`, production'daki RLS politikalarının birebir
kopyasını içeren minimal bir şemadır. `tests/rls.test.ts` bunu bellek içi
Postgres'e (PGlite) kurar, migration'ları uygular ve rol × tablo davranışını
doğrular. Production'a hiçbir bağlantı kurmaz.

```bash
pnpm vitest run supabase
```

Hedef veritabanında (production veya development branch) migration öncesi
salt okunur ön kontrol:

```sql
-- supabase/tests/preflight.sql içeriğini SQL editöründe çalıştırın; 0 satır beklenir.
```

Bir migration taslağı eklerken fixture'ı gerektiği kadar genişletin ve hem
"bugünkü davranış" hem "migration sonrası" testlerini yazın.
