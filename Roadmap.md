# Mnemo — Roadmap

> Kurallar ve oyun mantığı → [PRD.md](./PRD.md). Bu dosya yalnızca öncelik, sıra ve durum.

## Durum (snapshot — güncellenince burası değişir)

- **Production (main):** Mnemo 32 bölüm, emoji mod, level-select, auth, mobile fix
- **Aktif branch:** `feature/mnemo-selection` — Primus + Home/routing + Mnemo toggle; henüz dev/main'de değil
- **Deploy:** main → mnemo-kohl.vercel.app; preview → branch başına Vercel URL

## Tamamlandı ✅

- Mnemo: core, emoji (`feature/emoji`), level-select, kalan seçim + toggle (normal + emoji)
- Platform: Landing/auth, React Router, `vercel.json` SPA rewrite
- Primus (`feature/mnemo-selection`): çekirdek, asal+kare/küp karma mod, toggle, kalan seçim, tur bitişi, Sonraki Tur akışı, Help + Onboarding
- `.cursorrules` güncellendi
- Repo cleanup: eski txt/png kaldırıldı

## Şimdi / Sırada 🔜

1. `feature/mnemo-selection` → dev (PR, preview test)
2. dev stabil → main (production)
3. PRD Sonraki maddelerinde implementasyonu bitmiş olanları Canlı'ya taşı (Help/onboarding satırı vb.)

## Sprint planı

### Sprint 1 — Merge & stabilizasyon

- PR merge dev
- Preview: Home, Mnemo, Primus, auth, `/primus` refresh
- dev → main (hazır olunca)

### Sprint 2 — Primus seviyeleri

- `utils/primus/levels.ts` — 19 bölüm config (grid, N, basamak, soru modu, süre)
- Tur tipleri: `kare` + `kup` ekle; bölüm soru modları `fixed*` / `random3` / `random2`
- `usePrimus` level state, Sonraki Bölüm, `PrimusLevelSelect`
- Alıştırma / DEBUG HUD girişi (eski 4×4 karma + son-5 tip garantisi; `primus_practice_save`)
- PRD Canlı / Sonraki senkron
- Referans tablo: `Mnemo-Notlar/primus-seviyeler.csv`

### Sprint 3 — Mnemo Help güncellemesi

- HelpModal: toggle, kalan seçim, emoji notları
- PRD Mnemo Input ile uyum

### Sprint 4 — Primus analytics

- Tur/skor kaydı (Mnemo analytics ile paralel)
- Supabase paused riski notu

### Sprint 5 — Primus ek tur tipleri

- Fibonacci, aritmetik, geometrik diziler
- Tur tipi rotasyonu genişlet (grid / 3 basamak artık Sprint 2 seviyelerinde)

### Sprint 6+ — Yeni kategoriler & meta

- Euclid (ayrı sayfa)
- Home kartları: Euclid, Omnemo
- Stoacı öğütler, Katsayı çarkı
- Global leaderboard, mesajlaşma
- (Grid 5×5→7×7 ve 3 basamak: Sprint 2 Primus config’te)

## Bilinçli ertelenen

- Eski feature branch'lar (emoji, level-select) — merge edilmiş, silinebilir
- Framer Motion
- demo branch (tabloda vardı, aktif değil)

## Referanslar

- Ürün kuralları → [PRD.md](./PRD.md)
- Primus seviye tablosu → `Mnemo-Notlar/primus-seviyeler.csv`
- Git akışı → `Mnemo-Notlar/github-merge-sirasi.md` (varsa)
- Agent sprint akışı: Ask → PRD → kısa Agent prompt
