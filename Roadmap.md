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

- Bölüm 1–3 (1+2 basamak; bölüm 2–3 asal 2–6)
- Sonraki Bölüm, level config, `primus/levels.ts`
- PRD Sonraki → Canlı taşı

### Sprint 3 — Mnemo Help güncellemesi

- HelpModal: toggle, kalan seçim, emoji notları
- PRD Mnemo Input ile uyum

### Sprint 4 — Primus analytics

- Tur/skor kaydı (Mnemo analytics ile paralel)
- Supabase paused riski notu

### Sprint 5 — Primus ek tur tipleri

- Fibonacci, aritmetik, geometrik diziler
- Tur tipi rotasyonu genişlet

### Sprint 6+ — Yeni kategoriler & meta

- Grid 5×5→7×7, 3 basamak
- Euclid (ayrı sayfa)
- Home kartları: Euclid, Omnemo
- Stoacı öğütler, Katsayı çarkı
- Global leaderboard, mesajlaşma

## Bilinçli ertelenen

- Eski feature branch'lar (emoji, level-select) — merge edilmiş, silinebilir
- Framer Motion
- demo branch (tabloda vardı, aktif değil)

## Referanslar

- Ürün kuralları → [PRD.md](./PRD.md)
- Git akışı → `Mnemo-Notlar/github-merge-sirasi.md` (varsa)
- Agent sprint akışı: Ask → PRD → kısa Agent prompt
