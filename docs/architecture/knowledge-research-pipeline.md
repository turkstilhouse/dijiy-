# Knowledge Research Pipeline — Tasarım

Durum: **Tasarım. K0 kararları kayıtlı (bölüm 8); K1 başlamadı.** Migration yok, production değişikliği
yok. Ekteki SQL yalnızca öneridir; `supabase/migrations/` altına onaydan sonra
taşınır.
Hazırlayan: KAYRA · İnceleme: ARAS · Karar: Fatma Gül
İlgili kural: `AGENTS.md` → Token & Context Economy

## 1. Amaç

Araştırma bir kez yapılır, **kısa ve doğrulanmış bulgu** olarak saklanır,
tekrar tekrar okunur. Ham kaynak (sayfalar, PDF'ler, uzun model çıktıları)
hiçbir zaman ARAS/KAYRA context'ine taşınmaz.

Hedef: bir görevin araştırma bağlamı **≤ 1.500 token** (bugün 10–15 bin).

## 2. Akış

```
 Görev (tasks)                         ARAS / KAYRA
     │ research_request                     ▲  retrieve_findings(soru, bütçe)
     ▼                                      │  → en fazla k bulgu, yalnızca iddia + kaynak referansı
 Araştırma ajanı                            │
 (Perplexity / DeepSeek / …)                │
     │ 1. kaynak tarama                     │
     │ 2. kaynak kaydı ──────────► knowledge_sources (URL, yayıncı, authority_level)
     │ 3. alıntı ≤ 300 karakter ─► knowledge_documents (özet + hash, tam metin yok)
     │ 4. yapılandırılmış bulgu ─► knowledge_findings  (YENİ, status = draft)
     ▼                                      │
 Doğrulama                                  │
  • otomatik: şema, kaynak sayısı, tekrar (content_hash), çelişki kontrolü
  • kültürel iddia → ARŞİV ajanı + insan (direktif: kaynak doğrulanmadan kesinleşmez)
  • yaşam döngüsü: draft → verified → active → superseded → archived ──┘
```

Yazma yolu tektir: **sunucu tarafı ingestion uç noktası** (Next.js route
handler veya Supabase Edge Function, `service_role`). Ajanlar veritabanına
doğrudan yazmaz; uç nokta Zod şemasıyla doğrular, boyut sınırlarını uygular ve
`audit_events`'e yazar.

## 3. Veri modeli

Mevcut tablolar korunur:

| Tablo                 | Bugün                                                               | Pipeline'daki rolü                                                          |
| --------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `knowledge_sources`   | 3 satır; `authority_level` (primary…unknown), `verification_status` | Kaynak kaydı (URL, yayıncı, güvenilirlik)                                   |
| `knowledge_documents` | 7 satır; `content`, `content_hash`, `verified*`                     | Kaynağın kısa özeti ve alıntıları. **Tam metin saklanmaz** (telif ve boyut) |
| `knowledge_chunks`    | 0 satır; `vector(384)` + HNSW (cosine)                              | Doküman düzeyinde anlamsal arama (gerektiğinde)                             |

**Yeni:** `knowledge_findings`. Ajanların okuduğu tek birim.

| Alan                                     | Tür           | Not                                                                                   |
| ---------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `id`, `organization_id`                  | uuid          | `organization_id` NULL = global bulgu (yalnızca `service_role` yazar, F5 kuralı)      |
| `project_id`, `task_id`                  | uuid          | Hangi görev için üretildi                                                             |
| `question`                               | text ≤ 300    | Araştırılan soru                                                                      |
| `claim`                                  | text ≤ 500    | **Tek cümlelik iddia**, ajanın okuyacağı kısım                                        |
| `summary`                                | text ≤ 1.500  | İsteğe bağlı kısa açıklama                                                            |
| `evidence`                               | jsonb         | `[{source_id, document_id, quote ≤ 300, url, accessed_at}]`, en az 1, en fazla 5      |
| `confidence`                             | text          | `low`, `medium`, `high`                                                               |
| `finding_type`                           | text          | `source_fact`, `verified_finding`, `ai_inference` (bkz. K0 kararı 3)                  |
| `status`                                 | text          | `draft` → `verified` → `active` → `superseded` → `archived` (bkz. K0 kararı 4)        |
| `domain`                                 | text          | `culture`, `fabric`, `market`, `supplier`, `regulation`, `technical`…                 |
| `tags`                                   | text[]        | Filtre                                                                                |
| `produced_by`                            | text          | Ajan anahtarı (`perplexity`, `deepseek`, `kayra`…)                                    |
| `produced_model`                         | text          | Üretimde kullanılan model (denetim için)                                              |
| `verified_by_agent` / `verified_by_user` | text / uuid   | Kim doğruladı                                                                         |
| `verified_at`, `review_due_at`           | timestamptz   | Yeniden doğrulama tarihi. Süresi gelince bulgu **silinmez**, yeniden incelemeye düşer |
| `superseded_by`                          | uuid          | Yeni bulguya işaret eder                                                              |
| `content_hash`                           | text          | `(question, claim)` normalize hash; tekrar engeli                                     |
| `token_estimate`                         | int           | Retrieval bütçesi için                                                                |
| `embedding`                              | `vector(384)` | Mevcut `knowledge_chunks` ile aynı boyut ve model                                     |
| `created_at`, `updated_at`               | timestamptz   |                                                                                       |

## 4. Retrieval: kısa bağlam

`public.retrieve_findings(query_embedding vector(384), p_org uuid, p_domain text,
p_token_budget int default 1500, p_k int default 8)`

- Yalnızca `status = 'active'` bulgular. Her satır `finding_type` ile döner;
  `ai_inference` her zaman etiketli gösterilir ve kaynak gerçeği gibi sunulmaz.
- Benzerlik ve `confidence` ile sıralar; `token_estimate` toplamı bütçeyi
  aşınca durur.
- Döner: `id, finding_type, claim, confidence, domain, source_urls[], verified_at`. **Alıntı,
  özet ve doküman dönmez.** Ajan gerekirse tek bir bulgunun `evidence`'ını ayrıca ister.
- `SECURITY INVOKER`: çağıranın RLS'i geçerli; kiracılar birbirinin bulgusunu göremez.

Uygulama tarafı: `src/modules/knowledge/retrieve.ts` → sorgu metnini embed eder
(384 boyutlu model, sunucuda) ve RPC'yi çağırır. ARAS/KAYRA'ya giden çıktı
biçimi:

```
[K1] (high, culture, doğrulandı 2026-09-20) Iznik çinisinde … — kaynak: tiem.gov.tr
[K2] …
```

## 5. Güvenlik

| Konu             | Kural                                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yazma            | Yalnızca ingestion uç noktası (`service_role`). İstemci rolleri `draft` dahil yazamaz                                                                                                               |
| Doğrulama        | `verified` ve `active` geçişleri Karar 3'teki politikaya göre. `culture` alanında insan onayı zorunlu                                                                                               |
| Okuma            | Org bulguları: aktif üyeler (`is_org_member`). Global bulgular: tüm kayıtlı kullanıcılar                                                                                                            |
| Viewer           | Salt okunur (ARAS kararı)                                                                                                                                                                           |
| Prompt injection | Kaynak metni **veri**dir. `claim` ve `summary` talimat içeremez; ingestion, talimat kalıplarını ve HTML/Markdown bağlantılarını reddeder. Retrieval yalnızca alanları döndürür, ham metni döndürmez |
| Secret'lar       | Perplexity/DeepSeek API anahtarları Vercel env veya Supabase Vault'ta. Depoda ve JSON alanlarında tutulmaz (direktif: Güvenlik)                                                                     |
| Telif            | Tam metin saklanmaz; alıntı ≤ 300 karakter + URL                                                                                                                                                    |

## 6. Token ekonomisi ölçümü

- Her retrieval: `tool_performance_log`'a `tokens_returned`, `findings_count`,
  `budget` yazılır.
- Her araştırma: `cost_events`'e sağlayıcı maliyeti yazılır.
- Hedef metrik: görev başına araştırma bağlamı ≤ 1.500 token; aynı soru ikinci
  kez araştırılmaz (`content_hash` isabet oranı).

## 7. Aşamalar

| Aşama         | İçerik                                                                                           | Production etkisi |
| ------------- | ------------------------------------------------------------------------------------------------ | ----------------- |
| K0 (bu belge) | Tasarım, ARAS incelemesi                                                                         | Yok               |
| K1            | `knowledge_findings` + `retrieve_findings` taslak migration'ı, PGlite ve `rls-supabase` testleri | Yok (taslak)      |
| K2            | Ingestion uç noktası + Zod şeması + birim testleri; sahte (mock) araştırma ajanıyla uçtan uca    | Yok               |
| K3            | Perplexity/DeepSeek bağlantısı (anahtarlar kurucu onayıyla)                                      | Onay gerekir      |
| K4            | Production'a migration (ayrı kurucu onayı)                                                       | Onay gerekir      |

## 8. K0 kararları (ARAS, 23.09.2026)

K1 (taslak migration ve testler) ancak bu bölümdeki kayıt tamamlandıktan sonra
başlar. `UNKNOWN` ve `DECISION REQUIRED` işaretli maddeler K1'i bloklamaz;
ancak ilgili alanlar K1'de sabit bir değere bağlanmaz.

### Karar 1: Embedding modeli → **UNKNOWN / not documented**

Mevcut `knowledge_chunks.embedding` sütunu `vector(384)` tipinde, HNSW (cosine)
indeksli. Model adı hiçbir kayıtta yok. 26.09.2026'da production'da salt okunur
olarak şu kaynaklar kontrol edildi:

| Kaynak                                                | Sonuç           |
| ----------------------------------------------------- | --------------- |
| `knowledge_chunks.embedding_model`                    | Tabloda 0 satır |
| `embedding` sütun yorumu                              | Yok             |
| `system_settings` (embed içeren anahtar veya değer)   | Yok             |
| `ai_models` (embed içeren kayıt)                      | Yok             |
| `knowledge_documents.metadata` (model/embed anahtarı) | Yok             |

Sonuç: Model **tahmin edilmez**. 384 boyut yalnızca bir kısıttır, model kimliği değildir.

- K1: `embedding` sütunu `vector(384)` kalır; `embedding_model text` sütunu
  zorunlu tutulur. Her vektör, onu üreten modelle birlikte kaydedilir.
- Retrieval yalnızca sorgu vektörüyle aynı `embedding_model` değerine sahip
  satırları karşılaştırır. Farklı modellerin vektörleri asla karıştırılmaz.
- **DECISION REQUIRED:** Kullanılacak embedding modeli ve boyutu. K2'den
  (ingestion) önce seçilmeli.

### Karar 2: Ingestion çalışma ortamı → **Öneri: Vercel (karar değil)**

Production değişikliği yok. Seçenekler karşılaştırmalı olarak kayıtta tutulur:

| Kriter                | Vercel (Next.js route handler / cron)                                                                                         | Supabase Edge Function                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Güvenlik sınırı       | Uygulamayla aynı kod tabanı. `service_role` anahtarı uygulamayla aynı projede durur; ayrı bir ortamda tutmak ayrıca kurulmalı | Veritabanına yakın ve ayrı dağıtım. `service_role` Supabase içinde kalır, uygulama projesine girmez |
| Secret yönetimi       | Vercel env (Production/Preview ayrımı, "Sensitive"). Perplexity/DeepSeek anahtarları burada                                   | Supabase Edge secrets / Vault. Anahtarlar veritabanı tarafında toplanır                             |
| Timeout               | Plana ve yapılandırmaya bağlı. **DOĞRULANACAK**                                                                               | Plana bağlı çalışma süresi sınırı var. **DOĞRULANACAK**                                             |
| Uzun araştırma işleri | Her iki durumda da senkron istek yerine iş kuyruğu gerekir (`tasks` / `workflow_runs` + parça parça işleme)                   | Aynı                                                                                                |
| Maliyet               | Plan ve kullanıma bağlı. Ticari kullanım için Hobby plan kısıtı **DOĞRULANACAK**                                              | Free planda çağrı kotası var, üstü ücretli. **DOĞRULANACAK**                                        |
| Bakım                 | Tek dil (TypeScript/Node), mevcut Vitest ve CI yeniden kullanılır                                                             | Deno çalışma ortamı, ayrı dağıtım hattı ve test düzeni                                              |
| Test edilebilirlik    | Mevcut test altyapısıyla yerelde test edilir                                                                                  | Supabase CLI ile yerel çalıştırma gerekir                                                           |

- Öneri: Vercel. Tek kod tabanı ve mevcut test/CI yeniden kullanılır.
  `service_role` anahtarı yalnızca ingestion sunucu kodunda kullanılır
  (`server-only`).
- Edge Function, secret'ların uygulama projesine hiç girmemesi istenirse
  güçlü alternatif olarak açık kalır.
- **DECISION REQUIRED:** Nihai seçim K2'den önce. "DOĞRULANACAK" satırları,
  güncel resmi Vercel ve Supabase belgelerinden doğrulanmadan karar verilmez.

### Karar 3: Doğrulama politikası → **Tür + kaynak güvenilirliği + çapraz doğrulama**

Tek bir yüzde veya puan eşiği yok. Her bulgunun türü açıkça ayrılır:

| Tür                | Tanım                                                      | Kanıt şartı                                                                                                                              | `verified` için                                          | `active` için                                                                                  |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `source_fact`      | Bir kaynakta açıkça yazan bilgi; model yorumu yok          | ≥ 1 alıntı. Alıntı kaynakta birebir bulunmalı (otomatik kontrol). Kaynak `authority_level` ∈ {primary, official, academic, professional} | Otomatik alıntı kontrolü + doğrulayıcı ajan (ARŞİV/ARAS) | Doğrulayıcı onayı. `culture`, `regulation` alanlarında insan onayı                             |
| `verified_finding` | Birden çok kaynaktan sentezlenmiş iddia                    | ≥ 2 **bağımsız** kaynak (farklı yayıncı), en az biri primary/official/academic. Çelişen bir `active` bulgu yok                           | Doğrulayıcı ajan + çapraz kontrol kaydı                  | İnsan onayı (owner/admin/manager); `culture` alanında zorunlu                                  |
| `ai_inference`     | Modelin çıkarımı veya tahmini; doğrudan kaynak desteği yok | Dayandığı bulgulara referans (varsa)                                                                                                     | **Otomatik doğrulanmaz**                                 | Yalnızca açık insan onayıyla, her zaman "AI çıkarımı" etiketiyle. Kaynak gerçeği yerine geçmez |

Ek kurallar:

- `authority_level = 'secondary' | 'community' | 'unknown'` kaynaklar tek
  başına `source_fact` veya `verified_finding` desteklemez; ancak ek kanıt
  olarak listelenebilir.
- Bir `active` bulguyla çelişen yeni bulgu otomatik `active` olamaz; ikisi
  birlikte incelemeye düşer.
- Tür, doğrulama sırasında **düşürülebilir**, yükseltilemez. Örneğin yeterli
  kaynağı olmayan `verified_finding`, `ai_inference`'a çevrilir.
- Kültür DNA direktifi: `culture` alanında hiçbir bulgu insan onayı olmadan
  `active` olmaz.
- **DECISION REQUIRED:** Hangi `domain` değerlerinde insan onayı zorunlu?
  Öneri: `culture`, `regulation`, `financial`.

### Karar 4: Saklama ve yaşam döngüsü → **Fiziksel silme yok**

```
draft ──► verified ──► active ──► superseded ──► archived
  │           │
  └──► rejected (terminal; kayıt korunur)
```

| Durum        | Anlamı                                          | Retrieval |
| ------------ | ----------------------------------------------- | --------- |
| `draft`      | Ajan üretti, doğrulanmadı                       | Hayır     |
| `verified`   | Politika kontrollerinden geçti, yayına alınmadı | Hayır     |
| `active`     | Kullanımda                                      | **Evet**  |
| `superseded` | Yeni bir bulgu yerini aldı (`superseded_by`)    | Hayır     |
| `archived`   | Kullanımdan kaldırıldı, kayıt korunuyor         | Hayır     |

- Otomatik fiziksel silme (`DELETE`) **yok**. İstemci rollerine silme politikası
  verilmez.
- `review_due_at` geldiğinde bulgu silinmez veya kendiliğinden arşivlenmez;
  yeniden inceleme kuyruğuna düşer.
- Fiziksel silme ayrı, yüksek riskli bir işlemdir. Yalnızca kurucu onaylı
  `human_approval_requests` ile yapılır (owner-only onay türü olarak).
- **DECISION REQUIRED:** `rejected` durumu ARAS'ın listesinde yok. Doğrulamadan
  geçemeyen bulgular için terminal durum olarak öneriliyor; alternatifi,
  doğrudan `archived` kullanmak.
- **DECISION REQUIRED:** Varsayılan `review_due_at` süreleri alan bazında.

## Ek A — Önerilen SQL (taslak, uygulanmadı)

```sql
create table public.knowledge_findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  question text not null check (char_length(question) <= 300),
  claim text not null check (char_length(claim) <= 500),
  summary text check (char_length(summary) <= 1500),
  evidence jsonb not null
    check (jsonb_typeof(evidence) = 'array'
           and jsonb_array_length(evidence) between 1 and 5),
  confidence text not null check (confidence in ('low', 'medium', 'high')),
  finding_type text not null
    check (finding_type in ('source_fact', 'verified_finding', 'ai_inference')),
  status text not null default 'draft'
    check (status in ('draft', 'verified', 'active', 'superseded', 'archived', 'rejected')),
  domain text not null,
  tags text[] not null default '{}',
  produced_by text not null,
  produced_model text,
  verified_by_agent text,
  verified_by_user uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  review_due_at timestamptz,
  superseded_by uuid references public.knowledge_findings(id),
  content_hash text not null,
  token_estimate int not null check (token_estimate between 1 and 400),
  embedding extensions.vector(384),
  embedding_model text,
  check ((embedding is null) = (embedding_model is null)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, content_hash)
);

create index knowledge_findings_embedding_idx on public.knowledge_findings
  using hnsw (embedding extensions.vector_cosine_ops)
  where status = 'active';
create index knowledge_findings_org_domain_idx on public.knowledge_findings
  (organization_id, domain, status);

alter table public.knowledge_findings enable row level security;

create policy knowledge_findings_read on public.knowledge_findings
  for select to authenticated
  using (organization_id is null or (select public.is_org_member(organization_id)));

-- Verification only; findings are created by the ingestion endpoint (service_role).
create policy knowledge_findings_verify on public.knowledge_findings
  for update to authenticated
  using (organization_id is not null
         and (select public.has_org_role(organization_id, array['owner','admin','manager'])))
  with check (organization_id is not null
              and (select public.has_org_role(organization_id, array['owner','admin','manager'])));
```

K1'de testleriyle birlikte yazılacaklar: `retrieve_findings()`; güncellemede
yalnızca `status`/`finding_type` (düşürme)/`verified_*`/`review_due_at`/`superseded_by` alanlarının
değişmesine izin veren trigger (UPDATE politikası tek başına sütunları
kısıtlamaz); `culture` alanında insan onayı zorunluluğu.
