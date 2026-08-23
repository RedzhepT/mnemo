# Mnemo — Product Requirements Document

## Oyun Hakkında

Hafıza ve odaklanma becerilerini geliştiren web tabanlı bir oyun. Izgara üzerinde gösterilen kareleri sırasıyla hatırlayıp işaretleme prensibine dayanır.

## Bölüm Yapısı

Her bölüm 10 turdan oluşur (`DEBUG_MODE`'da 4 tur). Son 10 turun ortalaması %90 veya üzerinde olunca bölüm tamamlanır (sliding window sistemi).

**MAX_LEVEL:** 32

### Normal Mod Bölümleri (1–16)

| Bölüm | Grid | Kare Sayısı | Gösterim Hızı     |
| ----- | ---- | ----------- | ----------------- |
| 1     | 6×6  | 3           | Yavaş (700ms)     |
| 2     | 6×6  | 3           | Orta (600ms)      |
| 3     | 6×6  | 3           | Hızlı (500ms)     |
| 4     | 6×6  | 3           | Çok Hızlı (400ms) |
| 5     | 7×7  | 4           | Yavaş (700ms)     |
| 6     | 7×7  | 4           | Orta (600ms)      |
| 7     | 7×7  | 4           | Hızlı (500ms)     |
| 8     | 7×7  | 4           | Çok Hızlı (400ms) |
| 9     | 8×8  | 5           | Yavaş (700ms)     |
| 10    | 8×8  | 5           | Orta (600ms)      |
| 11    | 8×8  | 5           | Hızlı (500ms)     |
| 12    | 8×8  | 5           | Çok Hızlı (400ms) |
| 13    | 8×8  | 6           | Yavaş (700ms)     |
| 14    | 8×8  | 6           | Orta (600ms)      |
| 15    | 8×8  | 6           | Hızlı (500ms)     |
| 16    | 8×8  | 6           | Çok Hızlı (400ms) |

### Emoji Mod Bölümleri (17–32)

Aynı örüntü tekrar eder. Her turda minimum 1 kedi (🐱), minimum 1 ayı (🐻) gösterilir. Geri kalanlar random. Input fazında kategoriler sırayla sorulur.

| Bölüm | Grid | Kare Sayısı | Gösterim Hızı     |
| ----- | ---- | ----------- | ----------------- |
| 17    | 6×6  | 3           | Yavaş (700ms)     |
| 18    | 6×6  | 3           | Orta (600ms)      |
| 19    | 6×6  | 3           | Hızlı (500ms)     |
| 20    | 6×6  | 3           | Çok Hızlı (400ms) |
| 21    | 7×7  | 4           | Yavaş (700ms)     |
| 22    | 7×7  | 4           | Orta (600ms)      |
| 23    | 7×7  | 4           | Hızlı (500ms)     |
| 24    | 7×7  | 4           | Çok Hızlı (400ms) |
| 25    | 8×8  | 5           | Yavaş (700ms)     |
| 26    | 8×8  | 5           | Orta (600ms)      |
| 27    | 8×8  | 5           | Hızlı (500ms)     |
| 28    | 8×8  | 5           | Çok Hızlı (400ms) |
| 29    | 8×8  | 6           | Yavaş (700ms)     |
| 30    | 8×8  | 6           | Orta (600ms)      |
| 31    | 8×8  | 6           | Hızlı (500ms)     |
| 32    | 8×8  | 6           | Çok Hızlı (400ms) |

## Puanlama

- **Referans süre** = kare sayısı × 1000ms
- Referans süre altında bitirince **hız = 1** (tam puan)
- Referans süre üzerinde: **hız = referansSüre / elapsedMs** (logaritmik ceza)
- **final = (doğruluk × 0.6 + hız × 0.4) × 100**

## Mnemo Input

- Input fazında grid üstünde: `Kalan seçim: N` — yalnızca input fazında
- Normal mod: N = `sequence.length` − `playerInput.length`
- Emoji mod: N = aktif kategorideki hedef kare sayısı − o kategoride yapılan tıklama
- Seçili hücreye tekrar tıklanınca seçim geri alınır (toggle); kalan seçim artar
- Her iki mod (bölüm 1–32)

## Teknik Stack

- React + TypeScript + Vite + Tailwind CSS
- Supabase (ileride: auth, leaderboard, mesajlaşma)
- Vercel (deploy)

## Branch Yapısı

**main** — Kararlı sürüm. Vercel buradan deploy eder. Direkt commit yok; yalnızca dev'den merge.

**dev** — Aktif geliştirme. Feature'lar buraya merge edilir, test edilir, stabil olunca main'e gider. Günlük çalışma burada.

**feature/xxx** — Yeni özellik için dev'den açılır; bitince dev'e merge.

**Geçmiş:**

- feature/emoji — 19 emoji, bölümde 2 random kategori, gösterim/input kuralları, yanlış tıklamada tur devam, allPlayerInputs puanlama, satranç deseni. Merge: feature/emoji → dev (App.tsx conflict çözüldü) → main
- feature/level-select — 32 bölüm tablosu, tamamlanınca açılma, X ile kapatma, debug "Bölümleri Gör", tıklanınca atlama. Merge: feature/level-select → dev → main

**Aktif kural:** Geliştirme dev'de; yeni özellikler feature/xxx → dev → (stabil) main.

## Gelecek Özellikler

- Kullanıcı hesabı ve giriş sistemi
- Global leaderboard
- Kullanıcılar arası mesajlaşma
- Daha fazla emoji kategorisi (ileride 5–10 emoji türü, her turda 2 tanesi random seçilir)
- Mobil optimizasyon

## Gelecek Oyun Kategorileri

### Primus (Sayı Kategorisi)

Sayı tanıma ve seçim hızı oyunu. Gösterim fazı yoktur; sayılar tur başından itibaren tahtada durur. Sıra önemli değildir. Kullanıcı doğru hücreleri işaretler; tur süre dolunca veya mevcut seçim sayısı asal sayısına ulaşınca biter.

#### Canlı (bölüm 1)

**Tahta**

- 4×4 grid (16 hücre), tek seviye
- 1 ve 2 basamaklı sayılar karışık; tekrarsız
- Tek basamak = 2–9 (0 ve 1 yasak); 2 basamak = 10–99
- Tek basamaklı hücre: en az 3; üst sınır 3–8 arasında rastgele
- Hedef olmayan hücreler yalnızca bileşik sayılardır
- Asal sayı adedi sabit: 3

**Tur tipi**

- Her tur görevi: asal sayıları bul

**Fazlar**

- `idle` → `input` → `result` (`showing` yok)

**Input**

- Asal hücreye tıklama = doğru seçim
- Bileşik hücreye tıklama = yanlış seçim (tur fail olmaz)
- Aynı hücreye tekrar tıklanınca seçim geri alınır (toggle); doğru veya yanlış listeden çıkar
- Geri alınca `Kalan seçim` artar; tur bitişi o anki (doğru + yanlış) seçim sayısına göre hesaplanır
- **Bitir** butonu yok
- Tur sonu (hangisi önce gelirse): süre dolunca; veya mevcut seçim sayısı (doğru + yanlış) === tahtadaki asal sayısı
- Erken bitişte `elapsedMs` gerçek geçen süre (hız puanı artar)
- Not: Bölüm 1’de asal sayısı 3 → N = 3 seçim; Bölüm 2–3’te asal 2–6 olunca N de o sayıya eşitlenir
- Kalan seçim göstergesi (yalnızca input, grid üstünde): `Kalan seçim: N` — N = tahtadaki asal sayısı − (doğru + yanlış seçim); seçimde azalır, geri alınca artar; idle/result’ta görünmez

**Süre**

- 8 saniye (`PRIMUS_ROUND_TIME_MS = 8000`)
- “Başla” ile tur ve süre başlar

**Renklendirme**

- Input: seçilen hücreler sarı
- Result: doğru asallar yeşil, yanlış tıklanan bileşikler kırmızı, bulunmayan asallar mavi
- Result’ta grid üstünde tüm asallar küçükten büyüğe düz liste (ör. `Asallar: 2, 3, 11`)
- Turuncu (`wrong-order`) kullanılmaz

**Puanlama**

- `calculateScore(correctCount, totalCount, elapsedMs)` — Mnemo ile aynı fonksiyon
- `correctCount` = doğru seçilen asal sayısı
- `totalCount` = tahtadaki asal sayısı + yanlış tıklama sayısı
- Örnek: 3 asal, 2 doğru, 1 yanlış tık → doğruluk = 2 / 4
- Hız ve ağırlıklar Mnemo ile aynı: `(doğruluk × 0.6 + hız × 0.4) × 100`

**İlerleme**

- Sliding window: son 10 tur (DEBUG’da 4) ortalaması %90+ → bölüm tamamlandı
- Tek seviye; “Sonraki Bölüm” yok
- Kayıt anahtarı: `primus_save`

**Site**

- Akış: Landing (auth) → Home → oyun
- Home kartları: Mnemo, Primus
- Routing: `/mnemo`, `/primus`
- Mimari: ayrı hook + sayfa (`usePrimus`, `PrimusGame`, `PrimusGrid` / `PrimusCell`); Mnemo `Grid` / `Cell` paylaşılmaz

#### Sonraki

- Bölüm 2–3: hâlâ 1+2 basamak; asal sayısı rastgele 2–6 (N seçim kuralı da o sayıya eşitlenir)
- Bölüm 4+: yalnızca 2 basamaklı sayılar
- Seviye ilerlemesi ve grid büyümesi (4×4 → 5×5 → 6×6 → 7×7) sonra; süre zorlaştıkça +1 sn
- Tur tipi rotasyonu: asal, Fibonacci, aritmetik dizi, geometrik dizi (tur başına biri)
- Perfect sayılar **iptal**
- İleri seviyelerde 3 basamaklı sayılar
- Euclid / Omnemo kartları Home’da yok (ayrı kategoriler)

### Euclid (Geometri Kategorisi)

Mnemo'nun ızgara yapısından bağımsız ayrı bir ekran. Kullanıcıya bir geometrik şekil (kare, dikdörtgen, üçgen, daire ve bileşimleri) ve bir ölçü verilir. 3 saniye içinde taralı alanı çoktan seçmeli olarak tahmin etmesi beklenir. Seviye ilerledikçe şekiller karmaşıklaşır: önce tekil şekiller, sonra bileşimler ve kesişimler. Hesap hızını ölçer.

### Stoacı Öğütler (Tur Arası)

Tüm kategorilerde tur geçişlerinde rastgele zamanlarda kısa bir öğüt ekranı gösterilir. Stoacı filozoflar (Marcus Aurelius, Epiktetos, Seneca), Konfüçyüs ve genel yaşam bilgeliği öğütleri. İlk etapta İngilizce. Öğüt ekranda birkaç saniye durur, oyuncu "Devam" diyerek geçer.

### Katsayı Çarkı

Her kullanıcının başlangıç katsayısı 1.0. Kullanıcı oyunda toplam 10 dakika geçirdikten sonra ilk çark tetiklenir. Sonraki çarklar geçirilen toplam süreye göre rastgele aralıklarla tetiklenir. Her çark katsayıyı küçük miktarda artırır (örn. +0.05 ile +0.20 arası). Kullanıcı çarkı kendisi çevirir. Katsayı tüm kazanılan puanlara çarpılır.

### Omnemo (Unified Mod)

Tüm kategorileri rastgele sırayla oynatan birleşik mod. Her kategoriden birkaç tur oynandıktan sonra diğerine geçilir. Örnek: 3 tur Mnemo → 3 tur Primus → 3 tur Euclid → tekrar. Katsayı çarkı bu modda da aktif.

### Site Yapısı

**Canlı:** Ana sayfada Mnemo ve Primus kartları. Kullanıcı kart seçerek oyuna girer. Akış: Landing (auth) → Home → seçilen oyun.

**Sonraki:** Euclid ve Omnemo kartları eklenir. Omnemo kartı en sona yerleştirilir.
