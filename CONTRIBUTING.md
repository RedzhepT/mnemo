# Mnemo'ya Katkı Rehberi

Mnemo'ya katkı sağlamayı düşündüğün için teşekkürler! Bu doküman, projeye nasıl katkıda bulunacağını adım adım anlatıyor.

## 1. Proje Hakkında

Mnemo, React + TypeScript + Vite + Tailwind + Supabase + Vercel üzerinde çalışan, çok modlu bir hafıza/odak antrenman oyunudur. Şu anda **Mnemo** (32 bölümlük ana mod) ve **Primus** (sayı temelli bulmaca modu) olmak üzere iki oyun modu geliştiriliyor.

Projenin vizyonu, kapsamı ve yol haritası için:
- `PRD.md` — Ürün gereksinimleri dokümanı
- `ROADMAP.md` — Sprint bazlı geliştirme planı
- `.cursorrules` — AI destekli geliştirme kuralları

Bu dosyaları okumadan büyük bir katkıya başlamadan önce göz atmanı öneririz.

## 2. Lokal Kurulum

```bash
# Repoyu klonla
git clone https://github.com/RedzhepT/mnemo.git
cd mnemo

# Bağımlılıkları kur
npm install

# Ortam değişkenlerini ayarla
# .env.example dosyasını .env olarak kopyala ve Supabase bilgilerini gir
cp .env.example .env

# Geliştirme sunucusunu başlat
npm run dev
```

Proje `http://localhost:5173` üzerinde açılacaktır (Vite varsayılan portu).

## 3. Branch Akışı

Bu projede şu branch yapısını kullanıyoruz:

- `main` — Production, canlı yayında olan kod
- `dev` — Geliştirme dalı, `main`'e merge edilmeden önce özellikler burada birleşir
- `feature/*` — Her yeni özellik veya milestone için ayrı bir branch

**Adımlar:**

1. `dev` branch'inden yeni bir feature branch'i aç:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/milestone-adi
   ```

2. Değişikliklerini yap, küçük ve anlamlı commit'ler at:
   ```bash
   git add .
   git commit -m "Primus: Fibonacci tur tipi eklendi"
   ```

3. Branch'ini GitHub'a gönder:
   ```bash
   git push origin feature/milestone-adi
   ```

4. GitHub üzerinden `dev` branch'ine bir **Pull Request (PR)** aç. PR açıklamasına:
   - Hangi milestone'a karşılık geldiğini
   - Ne değiştirdiğini
   - Nasıl test edildiğini yaz

5. Review bekle. Onaylandıktan sonra `dev`'e merge edilir. `dev` → `main` merge'leri proje sahibi tarafından yönetilir.

## 4. Milestone Sistemi

Katkılar, önceden tanımlanmış **milestone**'lar (görevler) üzerinden yürütülür. Her milestone'un:
- Bir zorluk seviyesi (kolay / orta / zor)
- Önerilen deneyim seviyesi
- Sabit bir ödeme miktarı

vardır. Güncel milestone listesi ve ödeme miktarları için proje sahibiyle veya Discord `#görevler` kanalıyla iletişime geç.

**Not:** Milestone ödemeleri sembolik başlangıç ödemeleridir. Proje gelir getirmeye başlarsa, katkı oranına göre bir gelir paylaşımı (revenue share) ve equity modeli devreye girecektir. Detaylar için proje sahibiyle görüş.

## 5. Kod Standartları

- TypeScript strict mode kurallarına uy
- Mevcut dosya/klasör yapısını takip et (`hooks/`, `components/`, `lib/` ayrımına dikkat et)
- Yeni bir oyun modu veya büyük bir bileşen eklerken, mevcut modüllerin (`useGame`, `usePrimus`) yapısını referans al
- Mümkünse küçük, test edilebilir PR'lar aç — büyük ve karışık PR'lardan kaçın

## 6. AI Destekli Geliştirme Notu

Bu proje büyük ölçüde Cursor Agent kullanılarak geliştiriliyor. Eğer sen de AI destekli araçlar kullanıyorsan:
- Ürettiğin kodu commit etmeden önce mutlaka çalıştırıp test et
- `.cursorrules` dosyasındaki proje kurallarına uygun kod üretildiğinden emin ol
- AI'nin önerdiği büyük mimari değişiklikleri (yeni kütüphane, yapısal refactor) PR açmadan önce proje sahibiyle konuş

## 7. Soru ve Destek

Takıldığın bir yer olursa:
- Discord sunucumuzdaki ilgili kanala yaz (`#teknik-tartışma`, `#bug-raporlari`)
- GitHub Issues üzerinden soru açabilirsin

Katkın için şimdiden teşekkürler — birlikte iyi bir şey inşa ediyoruz.
