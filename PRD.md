# Mnemo — Product Requirements Document

## Oyun Hakkında

Hafıza ve odaklanma becerilerini geliştiren web tabanlı bir oyun. Izgara üzerinde gösterilen kareleri sırasıyla hatırlayıp işaretleme prensibine dayanır.

## Bölüm Yapısı

Her bölüm 10 turdan oluşur (`DEBUG_MODE`'da 4 tur). Son 10 turun ortalaması %90 veya üzerinde olunca bölüm tamamlanır (sliding window sistemi).

### Normal Mod Bölümleri (1–12)

| Bölüm | Grid | Kare Sayısı | Gösterim Hızı |
|-------|------|-------------|---------------|
| 1 | 6×6 | 3 | Yavaş (600ms) |
| 2 | 6×6 | 3 | Orta (500ms) |
| 3 | 6×6 | 3 | Hızlı (400ms) |
| 4 | 7×7 | 3 | Hızlı (400ms) |
| 5 | 7×7 | 4 | Yavaş (600ms) |
| 6 | 7×7 | 4 | Orta (500ms) |
| 7 | 7×7 | 4 | Hızlı (400ms) |
| 8 | 8×8 | 4 | Hızlı (400ms) |
| 9 | 8×8 | 5 | Yavaş (600ms) |
| 10 | 8×8 | 5 | Orta (500ms) |
| 11 | 8×8 | 5 | Hızlı (400ms) |
| 12 | 8×8 | 6 | Hızlı (400ms) |

### Emoji Mod Bölümleri (13–24)

Aynı örüntü tekrar eder. Her turda minimum 1 kedi (🐱), minimum 1 ayı (🐻) gösterilir. Geri kalanlar random. Input fazında kategoriler sırayla sorulur.

| Bölüm | Grid | Kare Sayısı | Gösterim Hızı |
|-------|------|-------------|---------------|
| 13 | 6×6 | 3 | Yavaş (600ms) |
| 14 | 6×6 | 3 | Orta (500ms) |
| 15 | 6×6 | 3 | Hızlı (400ms) |
| 16 | 7×7 | 3 | Hızlı (400ms) |
| 17 | 7×7 | 4 | Yavaş (600ms) |
| 18 | 7×7 | 4 | Orta (500ms) |
| 19 | 7×7 | 4 | Hızlı (400ms) |
| 20 | 8×8 | 4 | Hızlı (400ms) |
| 21 | 8×8 | 5 | Yavaş (600ms) |
| 22 | 8×8 | 5 | Orta (500ms) |
| 23 | 8×8 | 5 | Hızlı (400ms) |
| 24 | 8×8 | 6 | Hızlı (400ms) |

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
