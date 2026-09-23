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

Varsayılan olarak bellek içi PGlite kullanılır (`fixtures/platform_stub.sql`
Supabase rollerini ve `auth.uid()`'yi taklit eder). Production ile aynı Supabase
Postgres imajında çalıştırmak için (ücretsiz; CI'daki `rls-supabase` işi de
bunu yapar):

```bash
docker run --rm -d --name dijiy-rls -p 54322:5432 \
  -e POSTGRES_PASSWORD=postgres supabase/postgres:17.6.1.166
RLS_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres \
  pnpm vitest run supabase
docker rm -f dijiy-rls
```

Harici veritabanında test paketi kendi tablolarını silip yeniden kurar. Bu
yüzden `supabase.co` / `supabase.com` adreslerini reddeder; yalnızca atılabilir
bir konteyner kullanın.

Hedef veritabanında (production veya development branch) migration öncesi
salt okunur ön kontrol:

```sql
-- supabase/tests/preflight.sql içeriğini SQL editöründe çalıştırın; 0 satır beklenir.
```

Bir migration taslağı eklerken fixture'ı gerektiği kadar genişletin ve hem
"bugünkü davranış" hem "migration sonrası" testlerini yazın.
