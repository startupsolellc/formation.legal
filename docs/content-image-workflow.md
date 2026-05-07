# Content Image Workflow

> Görsellerin site performansı, SEO ve PageSpeed açısından optimize edilmesi için bu standard izlenmelidir.

---

## Genel Bakış

| Konu | Standart |
|------|----------|
| Görsel depolama | `src/assets/images/` |
| Frontmatter hero | `heroImage: "dosya-adi.png"` |
| Inline MDX | `![alt text](/_astro/gorsel.webp)` |
| Format | Astro build'de WebP/AVIF otomatik |
| Lazy loading | Astro otomatik ekler |
| CLS koruması | width/height otomatik |

---

## 1. Görsel Depolama

### Konum
```
src/assets/images/
├── guides/
│   ├── stripe-three-address-layers.png
│   └── ...
├── providers/
│   └── ...
└── general/
    └── ...
```

**Önemli:** Görseller `src/assets/` altında olmalı — `public/` kullanılmaz.

**Neden?** `src/assets/` → Astro build-time optimization (WebP/AVIF, srcset)
`public/` → Direkt serve, dönüştürme yok

---

## 2. Hero Image (Öne Çıkan Görsel)

### Frontmatter Kullanımı

```yaml
---
title: "Guide Başlığı"
heroImage: "stripe-three-address-layers.png"
---
```

### Dosya Konumu
```
src/assets/images/guides/stripe-three-address-layers.png
```

### Astro Layout Entegrasyonu

`GuideLayout.astro` otomatik olarak `heroImage` frontmatter değerini okur ve Astro `<Image />` component ile optimize eder:

```astro
<Image
  src={imageLoader()}  // build-time glob import
  alt=""
  width={1200}
  height={630}
  loading="eager"
  formats={['avif', 'webp']}
/>
```

---

## 3. Inline Görseller (MDX İçinde)

### Standart Markdown Syntax

```mdx
![Alt text describing the image](/_astro/image-name.webp)
```

### Doğru Kullanım Örneği

```mdx
![Three address layers: Registered Agent, Residential, Business Operating](/_astro/stripe-address-diagram.webp)

*Caption: The three address layers Stripe evaluates during verification*
```

### Alt Text Kuralları

| Durum | Kural |
|-------|-------|
| Diagram | "Diagram showing X, Y, Z relationships" |
| Screenshot | "Screenshot of [UI section] on [service]" |
| Infographic | "Infographic: [topic] breakdown by [metric]" |
| Hiçbir zaman | Boş string bırakma (`""`) |

### Caption Kullanımı

MDX'te caption için italik text kullan:

```mdx
![Address verification flow](/_astro/address-flow.webp)

*Görsel 1: Address verification adımları Stripe'da*
```

---

## 4. Görsel Boyutları

### Hero Image

| Özellik | Değer |
|---------|-------|
| Genişlik | 1200px (2x retina için) |
| Yükseklik | 630px (16:10 aspect) |
| Max height | 500px (CSS ile) |
| Format | PNG, JPG (Astro WebP'ye dönüştürür) |

### Inline Görseller

| Kullanım | Genişlik | Not |
|----------|----------|-----|
| Tablo içi | 800px | max-width yeterli |
| Geniş diagram | 1000px | container'a sığacak |
| Thumbnail | 400px | grid içinde |

---

## 5. Astro Image Component Detayları

### Otomatik Yapılanlar

- **Format dönüşümü:** PNG/JPG → WebP/AVIF
- **Responsive srcset:** 400, 800, 1200px breakpoints
- **CLS koruması:** width/height otomatik eklenir
- **Lazy loading:** `loading="lazy"` varsayılan
- **Decoding:** `decoding="async"` varsayılan

### Manual Kullanım (Sayfa İçinde)

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/images/guides/diagram.png';
---

<Image
  src={myImage}
  alt="Diagram showing process flow"
  width={800}
  heights={[400, 800]}
  formats={['avif', 'webp']}
  class="rounded-lg"
/>
```

---

## 6. SEO Gereksinimleri

### Alt Text (Zorunlu)

Her görsel için anlamlı, açıklayıcı alt text yaz:

```mdx
<!-- ❌ Yanlış -->
![](./image.png)

<!-- ✅ Doğru -->
![Stripe address verification three-layer diagram showing RA, residential, and business operating addresses](./image.png)
```

### Görsel Başlık (figcaption)

Makale içinde görsel açıklaması:

```mdx
![Product comparison table](./comparison.png)

**Şekil 1:** Üç ödeme platformunun karşılaştırması — ücret yapısı, limitler ve onay süreleri
```

---

## 7. Workflow (İş Akışı)

### Yeni Görsel Ekleme

1. **Görseli optimize et:**
   - Kaynaktan export: 1200px genişlik, PNG/JPG
   - Photoshop/tasarım aracı: sıkıştır, boyutu küçült
   - Hedef: < 500KB (raw), Astro build'de ~50-100KB WebP

2. **Dosyayı koy:**
   ```
   src/assets/images/guides/[guide-slug]-[description].png
   ```

3. **Frontmatter'da ata:**
   ```yaml
   heroImage: "guide-slug-description.png"
   ```

4. **Build test et:**
   ```bash
   npm run build
   # dist/_astro/ içinde .webp oluştuğunu kontrol et
   ```

5. **Commit & push:**
   ```bash
   git add src/assets/images/...
   git commit -m "docs: add hero image to [guide]"
   git push
   ```

---

## 8. Mevcut Görseller

| Görsel | Konum | Kullanım |
|--------|-------|----------|
| `stripe-three-address-layers.png` | `src/assets/images/guides/` | `us-llc-for-stripe.mdx` hero |

---

## 9. Hata Giderme

### Build'de görsel bulunamıyor hatası

```
Error: Cannot find module '../assets/images/guides/xxx.png'
```

**Çözüm:**
1. Dosya yolu doğru mu kontrol et
2. `heroImage` frontmatter değeri dosya adı ile eşleşiyor mu
3. Git add edilmiş mi kontrol et

### Görsel optimize edilmiyor

Astro `<Image />` sadece `src/assets/` içindekileri işler. `public/` görselleri için:

```astro
<!-- public/ görseller için basit img kullanılır -->
<img src="/images/my-image.png" alt="..." loading="lazy" />
```

---

## 10. Kısayol Kartı

```mdx
---
# Hero image ekle
heroImage: "guide-slug-image-name.png"

# MDX'te inline görsel
![Açıklayıcı alt text](/_astro/generated-webp.webp)

*Caption buraya*
```