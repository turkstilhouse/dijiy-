# Knowledge Research Pipeline — Tasarım

Durum: **Tasarım / ARAS incelemesi için.** Migration yok, production değişikliği
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
  • status: draft → verified | rejected | superseded ─────────┘
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

| Alan                                     | Tür           | Not                                                                              |
| ---------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| `id`, `organization_id`                  | uuid          | `organization_id` NULL = global bulgu (yalnızca `service_role` yazar, F5 kuralı) |
| `project_id`, `task_id`                  | uuid          | Hangi görev için üretildi                                                        |
| `question`                               | text ≤ 300    | Araştırılan soru                                                                 |
| `claim`                                  | text ≤ 500    | **Tek cümlelik iddia**, ajanın okuyacağı kısım                                   |
| `summary`                                | text ≤ 1.500  | İsteğe bağlı kısa açıklama                                                       |
| `evidence`                               | jsonb         | `[{source_id, document_id, quote ≤ 300, url, accessed_at}]`, en az 1, en fazla 5 |
| `confidence`                             | text          | `low`, `medium`, `high`                                                          |
| `status`                                 | text          | `draft`, `verified`, `rejected`, `superseded`                                    |
| `domain`                                 | text          | `culture`, `fabric`, `market`, `supplier`, `regulation`, `technical`…            |
| `tags`                                   | text[]        | Filtre                                                                           |
| `produced_by`                            | text          | Ajan anahtarı (`perplexity`, `deepseek`, `kayra`…)                               |
| `produced_model`                         | text          | Üretimde kullanılan model (denetim için)                                         |
| `verified_by_agent` / `verified_by_user` | text / uuid   | Kim doğruladı                                                                    |
| `verified_at`, `valid_until`             | timestamptz   | Bayatlama; süresi dolan bulgu yeniden doğrulanır                                 |
| `superseded_by`                          | uuid          | Yeni bulguya işaret eder                                                         |
| `content_hash`                           | text          | `(question, claim)` normalize hash; tekrar engeli                                |
| `token_estimate`                         | int           | Retrieval bütçesi için                                                           |
| `embedding`                              | `vector(384)` | Mevcut `knowledge_chunks` ile aynı boyut ve model                                |
| `created_at`, `updated_at`               | timestamptz   |                                                                                  |

## 4. Retrieval: kısa bağlam

`public.retrieve_findings(query_embedding vector(384), p_org uuid, p_domain text,
p_token_budget int default 1500, p_k int default 8)`

- Yalnızca `status = 'verified'` ve `valid_until` geçmemiş bulgular.
- Benzerlik ve `confidence` ile sıralar; `token_estimate` toplamı bütçeyi
  aşınca durur.
- Döner: `id, claim, confidence, domain, source_urls[], verified_at`. **Alıntı,
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
| Doğrulama        | `verified` durumuna geçiş: owner, admin, manager veya yetkili doğrulayıcı ajan (ARŞİV). `culture` alanında insan onayı zorunlu                                                                      |
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

## 8. ARAS kararı gereken konular

1. **Embedding modeli:** Mevcut `vector(384)` hangi modelle üretiliyor?
   Bulgular aynı modeli kullanmalı. Karar yoksa önerim, sunucuda çalışan açık
   bir 384 boyutlu model.
2. **Ingestion nerede çalışsın:** Vercel (Next.js route handler) mı, Supabase
   Edge Function mı? Öneri: Vercel. Tek dil ve mevcut testler; Edge Function
   ek dağıtım yüzeyi getirir.
3. **Otomatik doğrulama eşiği:** Kültür dışı alanlarda `high` güvenli ve
   ≥ 2 bağımsız `primary` veya `official` kaynaklı bulgu otomatik `verified`
   olabilir mi, yoksa her bulgu insan onayı mı ister?
4. **Saklama süresi:** Varsayılan `valid_until` (öneri: pazar/tedarik 90 gün,
   kültür/tarih süresiz, düzenleme 180 gün).

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
  status text not null default 'draft'
    check (status in ('draft', 'verified', 'rejected', 'superseded')),
  domain text not null,
  tags text[] not null default '{}',
  produced_by text not null,
  produced_model text,
  verified_by_agent text,
  verified_by_user uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  valid_until timestamptz,
  superseded_by uuid references public.knowledge_findings(id),
  content_hash text not null,
  token_estimate int not null check (token_estimate between 1 and 400),
  embedding extensions.vector(384),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, content_hash)
);

create index knowledge_findings_embedding_idx on public.knowledge_findings
  using hnsw (embedding extensions.vector_cosine_ops)
  where status = 'verified';
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
yalnızca `status`/`verified_*`/`valid_until`/`superseded_by` alanlarının
değişmesine izin veren trigger (UPDATE politikası tek başına sütunları
kısıtlamaz); `culture` alanında insan onayı zorunluluğu.
