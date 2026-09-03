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

Gösterim fazı yoktur; sayılar tur başından itibaren tahtada durur. Sıra önemli değildir. Kullanıcı doğru hücreleri işaretler; tur süre dolunca veya mevcut seçim sayısı hedef sayısına (N) ulaşınca biter.

#### Canlı — iki mod

##### 1) Alıştırma / DEBUG (eski tek seviye — korunur)

- 4×4, N=3, 1+2 basamak (2–9 / 10–99), 8 sn input
- Tur tipi: tur başına rastgele `asal` | `kareKup`
- **Son 5 turda her iki tip en az bir kez (garanti)** — yalnızca bu alıştırma modunda
- Home’da ayrı kart yok
- Yalnızca `DEBUG_MODE` açıkken Primus HUD’daki düğmeyle açılır
- Kayıt: `primus_practice_save` (ana oyun `primus_save` kaydını bozmaz)

##### 2) Ana oyun — Primus 19 bölüm (Canlı hedef)

- Home: tek Primus kartı → 19 bölüm oyunu (Mnemo kartına dokunulmaz)
- `MAX_LEVEL`: 19
- İlerleme: sliding window — ürün 10 tur, `DEBUG_MODE`’da 4 tur; ort. %90+ → bölüm tamam
- “Sonraki Bölüm” + `PrimusLevelSelect` (Mnemo level-select gibi: kilitli / açılan / tıklayınca atlama; debug’da tümünü gör)
- Kayıt anahtarı: `primus_save` (ana oyun)
- Seviyeli oyunda “son N turda tip garantisi” **yok**

#### Tur tipleri (hücre hedefi)

Kod tipi: `asal` | `kare` | `kup` | `kareKup`

**asal**

- Hedefler: asallar (tam N)
- Hedef dışı: yalnızca bileşik
- **Invariant:** tahtada hedef olmayan asal yoktur

**kare**

- Hedefler: tam kareler (tam N); tahtada hedef olmayan kare yok
- Hedef dışı hücrede küp **olabilir** (tıklanınca yanlış)

**kup**

- Hedefler: tam küpler (tam N); tahtada hedef olmayan küp yok
- Hedef dışı hücrede kare **olabilir** (tıklanınca yanlış)
- 1 yasak

**kareKup**

- Hedef: tam kare + tam küp karışık; hem kare hem küp olan sayı (ör. 64) tek hedef
- Hedef dışı: kare/küp olmayan her sayı (asal dahil — tıklanınca yanlış)
- **Invariant:** tahtada hedef olmayan kare/küp yoktur

#### Bölüm soru modu (bölüm boyunca sabit)

Tur tipi ağırlığı / “son N turda tip garantisi” yok. Mod bölüm config’te sabit:

| Mod | Anlam | Her tur |
| --- | --- | --- |
| `fixedAsal` | Asal | her zaman `asal` |
| `fixedKare` | Kare | her zaman `kare` |
| `fixedKup` | Küp | her zaman `kup` |
| `random3` | Asal/Kare/Küp-Random | bağımsız: `asal` \| `kare` \| `kup` |
| `random2` | Asal/Kare&Küp-Random | bağımsız: `asal` \| `kareKup` |

#### 19 bölüm tablosu

| Bölüm | Grid | N | Basamak | Soru tipi | Tek min | Tek max | sn | Faz | Açıklama |
| ----- | ---- | - | ------- | --------- | ------- | ------- | -- | --- | -------- |
| 1 | 3×3 | 2 | Ağırlıklı tek | Asal | 6 | 8 | 14 | Tanışma | İlk tanışma; az hedef, bol süre |
| 2 | 3×3 | 2 | 1+2 karışık | Kare | 6 | 8 | 14 | Tanışma | İlk tanışma; az hedef, bol süre |
| 3 | 3×3 | 2 | 1+2 karışık | Küp | 6 | 8 | 14 | Tanışma | İlk tanışma; az hedef, bol süre |
| 4 | 3×3 | 3 | 1+2 karışık | Asal/Kare/Küp-Random | 5 | 8 | 13 | Tanışma | 3 hedef; küçük tahta |
| 5 | 3×3 | 3 | 1+2 karışık | Asal/Kare/Küp-Random | 4 | 8 | 12 | Tanışma | 3×3 ustalaşma; süre kısalır |
| 6 | 3×3 | 3 | 1+2 karışık | Asal/Kare/Küp-Random | 4 | 8 | 11 | Tanışma | 3×3 ustalaşma; süre kısalır |
| 7 | 4×4 | 3 | 1+2 karışık | Asal/Kare/Küp-Random | 3 | 8 | 13 | Alışma | Bugünkü Canlı'ya yakın; tahta büyür |
| 8 | 4×4 | 3 | 1+2 karışık | Asal/Kare/Küp-Random | 3 | 8 | 12 | Alışma | |
| 9 | 4×4 | 4 | 1+2 karışık | Asal/Kare/Küp-Random | 2 | 8 | 11 | Alışma | Hedef +1 |
| 10 | 5×5 | 4 | 1+2 karışık | Asal/Kare/Küp-Random | 2 | 8 | 12 | Gelişme | Grid 5×5 |
| 11 | 5×5 | 4 | 2 basamak ağırlıklı | Asal/Kare/Küp-Random | 1 | 8 | 11 | Gelişme | İki basamak baskın |
| 12 | 5×5 | 5 | 2 basamak | Asal/Kare&Küp-Random | 0 | 2 | 10 | Gelişme | |
| 13 | 6×6 | 5 | 2 basamak | Asal/Kare&Küp-Random | 0 | 1 | 11 | Ustalaşma | |
| 14 | 6×6 | 5 | 2 basamak | Asal/Kare&Küp-Random | 0 | 0 | 10 | Ustalaşma | Tek basamak yok |
| 15 | 6×6 | 6 | 2+3 basamak karışık | Asal/Kare&Küp-Random | 0 | 0 | 9 | Ustalaşma | |
| 16 | 7×7 | 6 | 2+3 basamak karışık | Asal/Kare&Küp-Random | 0 | 0 | 11 | İleri | Grid max |
| 17 | 7×7 | 6 | 2+3 basamak karışık | Asal/Kare&Küp-Random | 0 | 0 | 10 | İleri | 100–999 arası |
| 18 | 7×7 | 7 | 3 basamak | Asal/Kare&Küp-Random | 0 | 0 | 9 | İleri | |
| 19 | 7×7 | 7 | 3 basamak | Asal/Kare&Küp-Random | 0 | 0 | 8 | İleri | İleri seviye |

Kaynak tablo (Excel): `Mnemo-Notlar/primus-seviyeler.csv`

**Notlar**

- Süre: grid büyüyünce kasıtlı artış (buffer), sonra düşer
- 2+3 karışık: tahtada 10–99 ve 100–999 karışık; 3 basamaklı hedefler dahil
- 0 ve 1 yasak (mevcut)
- Input / briefing / toggle / kalan seçim / puanlama mevcut Canlı kurallarıyla aynı; süre ve N bölüm config’ten gelir
- Help / onboarding metinleri bölüme göre güncellenir (sabit “tur tipi değişir” değil; bölüm soru moduna göre)

#### Ortak kurallar (alıştırma + ana oyun)

**Tahta**

- Tekrarsız; 0 ve 1 yasak
- Grid, N, basamak, tek basamak min/max, süre → bölüm config (alıştırmada sabit 4×4 / N=3 / 8 sn)

**Fazlar**

- İlk tur: `idle` → [Başla] → `briefing` → `input` → `result` (`showing` yok)
- Sonraki turlar: `result` → [Sonraki Tur] → `briefing` → `input` → `result` (`idle`'a düşmez)

**Görev önizleme (briefing)**

- Başla veya Sonraki Tur sonrası, tahta açılmadan önce tam ekran layer
- Süre: 4 sn (`PRIMUS_BRIEFING_MS = 4000`)
- Tahta bu fazda gizli; oyun süresi briefing sırasında işlemez
- İçerik (tur tipine göre):
  - `asal`: "Asal sayıları bul" + kısa örnek (ör. 2, 3, 11)
  - `kare`: "Kareleri bul" + örnek (ör. 2² = 4)
  - `kup`: "Küpleri bul" + örnek (ör. 3³ = 27)
  - `kareKup`: "Kare ve küpleri bul" + örnek (ör. 2² = 4, 3³ = 27)
- Erken geçiş: tıklama veya Space
- Layer bitince → `input`; oyun timer burada başlar
- Input’ta görev cümlesi de görünür (layer + input çift hatırlatma)

**Input**

- Hedef hücreye tıklama = doğru; hedef dışına tıklama = yanlış (tur fail olmaz)
- Aynı hücreye tekrar tıklanınca seçim geri alınır (toggle)
- **Bitir** butonu yok
- Tur sonu: süre dolunca veya (doğru + yanlış) === N
- Erken bitişte `elapsedMs` gerçek geçen süre
- `Kalan seçim: N` yalnızca input’ta (grid üstünde)

**Süre**

- Oyun süresi yalnızca `input` fazında; alıştırma 8 sn, ana oyunda bölüm config’ten
- Briefing: 4 sn; erken geçiş mümkün
- Result’ta “Sonraki Tur” → briefing → input; `levelComplete` iken no-op (veya Sonraki Bölüm)

**Renklendirme**

- Input: seçilen hücreler sarı
- Result: doğru yeşil, yanlış kırmızı, bulunmayan (missed) mavi
- Turuncu (`wrong-order`) yok

**Result**

- Grid üstünde `Hedefler:` — küçükten büyüğe
- Asal: düz liste; kare / küp / kareKup: üslü gösterim

**Result — Hatalar** (yalnızca result; hata yoksa blok yok)

- **Kaçırılanlar** / **Yanlış seçimler** (boş alt başlık gizlenir); sayı küçükten büyüğe
- Asal yanlış: `27 → 3 × 9 = 27` (en küçük asal bölen × diğer çarpan)
- Asal kaçırılan: `11 — asal sayı`
- Kare yanlış: en yakın tam kare (ör. `66 → 8² = 64`)
- Küp yanlış: en yakın tam küp
- kareKup yanlış: en yakın tam kare veya küp (mutlak fark en küçük)
- Kare/küp/kareKup kaçırılan: üslü format (ör. `27 → 3³ = 27`)

**Puanlama**

- `calculateScore(correctCount, totalCount, elapsedMs)` — Mnemo ile aynı
- `correctCount` = doğru hedef; `totalCount` = N + yanlış tıklama
- `(doğruluk × 0.6 + hız × 0.4) × 100`

**Site**

- Akış: Landing (auth) → Home → oyun
- Home kartları: Mnemo, Primus (tek kart → ana 19 bölüm; alıştırma Home’da yok)
- Routing: `/mnemo`, `/primus`
- Mimari: ayrı hook + sayfa; Mnemo `Grid` / `Cell` paylaşılmaz
- Primus HUD’da `?` → Yardım; ilk `/primus` ziyaretinde Onboarding
- DEBUG: HUD düğmesi → Alıştırma (`primus_practice_save`)

**Yardım (HUD `?`)**

- Ayrı: `PrimusHelpModal` — Mnemo Help’e dokunulmaz
- Başlık: Nasıl Oynanır?
- Maddeler bölüm soru moduna göre (sabit “her tur tip değişir” değil): toggle, kalan seçim, süre/hak, %90+ ilerleme, üslü örnekler
- Not: Mnemo Help güncellemesi sonraki sprint

**Onboarding (ilk `/primus`)**

- Çok adımlı: İleri / son adımda Başla
- `primus_onboarding_seen`; `"true"` iken tekrar gösterilmez; silinince (test) yeniden
- Yardım (`?`) onboarding’den bağımsız
- Mnemo onboarding’ine dokunulmaz
- Adımlar bölüm moduna göre (asal / kare / küp / random) anlatır; toggle + kalan seçim; süre / puan / hazır

#### Sonraki

- Planlanan / Canlı hedef (Sprint 2): 19 bölüm, `primus/levels.ts`, level-select, `kare`/`kup` ayrı tipler, alıştırma DEBUG HUD — PRD bu dosyada tanımlı
- Kalan: Fibonacci, aritmetik, geometrik diziler (Sprint 5)
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
