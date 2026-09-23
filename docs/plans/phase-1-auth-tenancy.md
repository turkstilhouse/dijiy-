# Faz 1 — Auth, Üyelik ve Kiracı Yetkilendirmesi (Teknik Plan)

Durum: **Plan / taslak.** Kod ve veritabanı değişikliği içermez.
Önkoşul: `docs/security/rls-audit-2026-09.md` içindeki F1, F2, F3 ve F5
migration'larının onaylanıp uygulanması. Auth, bunlar kapanmadan açılmaz.

## 1. Hedefler

- Kullanıcılar Dijiy'ye güvenli giriş yapar. Oturum, Supabase Auth ve cookie'ler
  üzerinden `proxy.ts` ile yenilenir (altyapısı Faz 0'da hazır).
- Her istek, bir **aktif organizasyon** bağlamında ve `workspace_members` rolüyle
  yetkilendirilir.
- İlk yönetici (owner) kullanıcı insan onayıyla, izlenebilir şekilde oluşturulur.
- AI ajanları (ARAS, KAYRA, …) kullanıcı değildir. Sunucu tarafında `service_role`
  ile çalışır ve her işlem `audit_events`'e yazılır.

## 2. Mevcut model (CORE)

```
auth.users ──< workspace_members >── organizations ──< projects (Dijiy)
                role: owner | admin | manager | member | viewer
                status: active | invited | suspended
```

Yetki kaynağı tek: `workspace_members`. RLS yardımcıları `is_org_member(org)`
(yalnızca aktif) ve önerilen `has_org_role(org, roles[])`.

## 3. Kimlik doğrulama

| Konu                 | Karar (öneri)                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Yöntemler            | E-posta + Magic Link (varsayılan), Google OAuth (opsiyonel). Şifre yok.                                      |
| Kayıt                | **Kapalı (invite-only).** Supabase Auth → "Allow new users to sign up" = kapalı. Kullanıcılar davetle gelir. |
| MFA                  | owner/admin için TOTP zorunlu (AAL2). Hassas rotalarda `aal2` kontrolü.                                      |
| Oturum               | `@supabase/ssr` cookie oturumu. `proxy.ts` her istekte `getUser()` ile yeniler.                              |
| Yönlendirme URL'leri | Yalnızca Dijiy alan adı ve Vercel preview desenleri. `lumina` alan adı eklenmez.                             |
| E-posta              | Supabase varsayılan SMTP yalnızca geliştirmede. Production için özel SMTP (ayrı karar).                      |

Kayıt kapalı olduğundan F5 benzeri "herhangi bir kayıtlı kullanıcı" riskleri de
ikinci bir katmanla azalır. Yine de RLS düzeltmeleri önkoşuldur.

## 4. Organizasyon bağlamı

- Kullanıcının aktif üyelikleri: `workspace_members where user_id = auth.uid() and status = 'active'`.
- Aktif organizasyon seçimi `dijiy-org` cookie'sinde tutulur. Sunucu her istekte
  üyeliği **yeniden doğrular**; cookie yetki kaynağı değildir.
- Tek üyelikli kullanıcıda otomatik seçilir. Dijiy için başlangıçta tek org var:
  `turkstilhouse`.
- İleride JWT'ye `org_id` / `org_role` claim'i eklemek için Custom Access Token Hook
  değerlendirilebilir (performans). Faz 1'de gerekmez.

## 5. Uygulama katmanı (Next.js)

| Parça               | Konum                            | Açıklama                                                 |
| ------------------- | -------------------------------- | -------------------------------------------------------- |
| Giriş sayfası       | `src/app/(auth)/giris/page.tsx`  | Magic link formu (Server Action)                         |
| Callback            | `src/app/auth/callback/route.ts` | `exchangeCodeForSession` → yönlendirme                   |
| Çıkış               | Server Action                    | `signOut` + cookie temizliği                             |
| Oturum yardımcıları | `src/modules/auth/session.ts`    | `requireUser()`, `requireMembership(orgId, roles?)`      |
| Korumalı alan       | `src/app/(app)/layout.tsx`       | `requireUser()`, üyelik yoksa "erişim bekleniyor" ekranı |
| Yönetim             | `src/app/(app)/yonetim/uyeler`   | Davet, rol değiştirme, askıya alma (owner/admin)         |

Kurallar:

- Yetki kontrolü **hem** RLS'te **hem** sunucu katmanında yapılır. UI gizleme güvenlik sayılmaz.
- Rol değiştirme, askıya alma ve davet işlemleri Server Action'da `service_role`
  ile yapılır. Önce `has_org_role(org, ['owner','admin'])` doğrulanır. Her işlem
  `audit_events`'e yazılır.
- Owner rolü yalnızca başka bir owner tarafından verilebilir. Son owner düşürülemez
  (DB trigger ile korunur; migration taslağı Faz 1'de hazırlanır).

## 6. İlk yönetici (bootstrap)

Otomatik kod yolu yok; tek seferlik ve insan onaylı bir işlem:

1. Kurucu (Fatma Gül), Supabase Dashboard → Auth → **Invite user** ile kendi
   e-postasını davet eder.
2. Davet kabul edilince `auth.users` satırı oluşur.
3. ARAS onaylı tek seferlik SQL (Dashboard SQL editöründe kurucu tarafından çalıştırılır):
   ```sql
   insert into public.workspace_members (organization_id, user_id, role, status)
   select o.id, u.id, 'owner', 'active'
   from public.organizations o, auth.users u
   where o.slug = 'turkstilhouse' and u.email = '<kurucu e-postası>';
   update public.organizations set owner_user_id = (select id from auth.users where email = '<kurucu e-postası>')
   where slug = 'turkstilhouse';
   ```
4. MFA kaydı zorunlu hale gelir. Sonraki tüm üyeler uygulama içinden davet edilir.

Claude/KAYRA bu adımı **çalıştırmaz**. Kimlik bilgisi etkileyen işlem, kurucu onayı gerektirir.

## 7. Veritabanı değişiklikleri (Faz 1 taslakları — henüz yazılmadı)

- `workspace_members`: `invited_by uuid`, `invited_at`, `updated_at` sütunları.
  Kendi üyeliğini güncelleyememe ve son owner koruması trigger'ı.
- `workspace_members` için yazma politikaları: yok. Yazma yalnızca Server Action →
  `service_role` ile yapılır.
- `audit_events` için auth olayları (login, invite, role_change, suspend).

Hepsi `supabase/migrations/` altında taslak olarak eklenir ve PGlite testleriyle
doğrulanır. Production'a uygulanmaz.

## 8. Test

- Birim: `requireMembership` rol matrisi, callback yönlendirme güvenliği (open redirect yok).
- RLS (PGlite): her rol × tablo grubu matrisi (mevcut `rls.test.ts` genişletilir).
- E2E (Playwright, Faz 1 sonu): giriş → korumalı sayfa → çıkış, preview deploy üzerinde.

## 9. Sıra

1. RLS taslakları onay → Supabase branch'te dene → production (kurucu onayı).
2. Auth ayarları: kayıt kapalı, redirect URL'leri, MFA (Dashboard; kurucu/ARAS).
3. Kod: giriş, callback, oturum yardımcıları, korumalı layout.
4. İlk owner bootstrap (bölüm 6).
5. Üye yönetimi UI ve audit kayıtları.
6. Vercel preview üzerinde E2E doğrulama.
