# Katkı ve GitHub Düzeni

## Dallar

| Dal                            | Amaç                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `main`                         | Her zaman deploy edilebilir. Doğrudan push yok; yalnızca PR ile. Vercel production. |
| `feat/<konu>`                  | Yeni özellik                                                                        |
| `fix/<konu>`                   | Hata düzeltme                                                                       |
| `chore/<konu>` / `docs/<konu>` | Altyapı / dokümantasyon                                                             |
| `claude/<konu>`                | KAYRA/Claude tarafından açılan çalışma dalları                                      |

Önerilen `main` koruması (GitHub → Settings → Branches): PR zorunlu, `CI / check`
geçmeli, force-push kapalı.

## Commit mesajları

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): e-posta ile giriş
fix(health): zaman aşımı durumunu raporla
chore(ci): pnpm önbelleği
docs(architecture): migration politikası
```

## PR süreci

1. Dal aç → değişiklik → `pnpm check && pnpm build`.
2. PR şablonundaki ARAS kontrol listesini doldur.
3. CI yeşil + inceleme → `main`'e squash merge.

## Asla

- Secret/anahtar değerini commit etmek.
- Production Supabase'e bu depodan migration uygulamak.
- `lumina` Vercel projesini veya Replit'i değiştirmek.
