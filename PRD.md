# Mnemo — Product Requirements Document

## Oyun Hakkında

Hafıza ve odaklanma becerilerini geliştiren web tabanlı bir oyun. Izgara üzerinde gösterilen kareleri sırasıyla hatırlayıp işaretleme prensibine dayanır.

## Bölüm Yapısı

Her bölüm 10 turdan oluşur (`DEBUG_MODE`'da 4 tur). Son 10 turun ortalaması %90 veya üzerinde olunca bölüm tamamlanır (sliding window sistemi).

**MAX_LEVEL:** 32

### Normal Mod Bölümleri (1–16)

| Bölüm | Grid | Kare Sayısı | Gösterim Hızı |
|-------|------|-------------|---------------|
| 1 | 6×6 | 3 | Yavaş (700ms) |
| 2 | 6×6 | 3 | Orta (600ms) |
| 3 | 6×6 | 3 | Hızlı (500ms) |
| 4 | 6×6 | 3 | Çok Hızlı (400ms) |
| 5 | 7×7 | 4 | Yavaş (700ms) |
| 6 | 7×7 | 4 | Orta (600ms) |
| 7 | 7×7 | 4 | Hızlı (500ms) |
| 8 | 7×7 | 4 | Çok Hızlı (400ms) |
| 9 | 8×8 | 5 | Yavaş (700ms) |
| 10 | 8×8 | 5 | Orta (600ms) |
| 11 | 8×8 | 5 | Hızlı (500ms) |
| 12 | 8×8 | 5 | Çok Hızlı (400ms) |
| 13 | 8×8 | 6 | Yavaş (700ms) |
| 14 | 8×8 | 6 | Orta (600ms) |
| 15 | 8×8 | 6 | Hızlı (500ms) |
| 16 | 8×8 | 6 | Çok Hızlı (400ms) |

### Emoji Mod Bölümleri (17–32)

Aynı örüntü tekrar eder. Her turda minimum 1 kedi (🐱), minimum 1 ayı (🐻) gösterilir. Geri kalanlar random. Input fazında kategoriler sırayla sorulur.

| Bölüm | Grid | Kare Sayısı | Gösterim Hızı |
|-------|------|-------------|---------------|
| 17 | 6×6 | 3 | Yavaş (700ms) |
| 18 | 6×6 | 3 | Orta (600ms) |
| 19 | 6×6 | 3 | Hızlı (500ms) |
| 20 | 6×6 | 3 | Çok Hızlı (400ms) |
| 21 | 7×7 | 4 | Yavaş (700ms) |
| 22 | 7×7 | 4 | Orta (600ms) |
| 23 | 7×7 | 4 | Hızlı (500ms) |
| 24 | 7×7 | 4 | Çok Hızlı (400ms) |
| 25 | 8×8 | 5 | Yavaş (700ms) |
| 26 | 8×8 | 5 | Orta (600ms) |
| 27 | 8×8 | 5 | Hızlı (500ms) |
| 28 | 8×8 | 5 | Çok Hızlı (400ms) |
| 29 | 8×8 | 6 | Yavaş (700ms) |
| 30 | 8×8 | 6 | Orta (600ms) |
| 31 | 8×8 | 6 | Hızlı (500ms) |
| 32 | 8×8 | 6 | Çok Hızlı (400ms) |

## Puanlama

- **Referans süre** = kare sayısı × 1000ms
- Referans süre altında bitirince **hız = 1** (tam puan)
- Referans süre üzerinde: **hız = referansSüre / elapsedMs** (logaritmik ceza)
- **final = (doğruluk × 0.6 + hız × 0.4) × 100**

## Teknik Stack

- React + TypeScript + Vite + Tailwind CSS
- Supabase (ileride: auth, leaderboard, mesajlaşma)
- Vercel (deploy)

## Gelecek Özellikler

- Kullanıcı hesabı ve giriş sistemi
- Global leaderboard
- Kullanıcılar arası mesajlaşma
- Daha fazla emoji kategorisi (ileride 5–10 emoji türü, her turda 2 tanesi random seçilir)
- Mobil optimizasyon
