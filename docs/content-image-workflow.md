# Content Image Workflow

> Görsellerin site performansı, SEO ve PageSpeed açısından optimize edilmesi için bu standard izlenmelidir.

---

## Genel Bakış

| Konu | Standart |
|------|----------|
| Hero image (frontmatter) | `heroImage: "dosya-adi.png"` → `src/assets/images/guides/` |
| Inline görsel | `<Image>` component → `src/assets/images/guides/` |
| Format | WebP/AVIF otomatik (build-time) |
| Lazy loading | Astro otomatik |
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

> ⚠️ **ÖNEMLİ:** Inline görseller için iki yaklaşım var. Her ikisini de anla:

### Yaklaşım A: `<Image>` Component (Önerilen — Proper Optimization)

Astro'nun optimize ettiği ve WebP/AVIF'e dönüştürdüğü görseller için:

```mdx
---
import { Image } from 'astro:assets';
import myImage from '../../assets/images/guides/diagram.png';
---

<Image
  src={myImage}
  alt="Diagram showing X, Y, Z relationships"
  width={800}
  formats={['avif', 'webp']}
  class="rounded-lg"
/>
```

Bu yaklaşım:
- ✅ WebP/AVIF otomatik dönüşüm
- ✅ Responsive srcset
- ✅ CLS koruması
- ⚠️ Her görsel için import + component gerekli

### Doğru Kullanım Örneği (Yaklaşım A)

```mdx
---
import { Image } from 'astro:assets';
import decisionTree from '../../assets/images/guides/banking-decision-tree.png';
---

<Image
  src={decisionTree}
  alt="Flowchart showing how non-resident founders choose between Mercury, Relay, and Wise"
  width={1000}
  formats={['avif', 'webp']}
  class="rounded-lg"
/>

*The Banking Decision Tree: How non-resident founders navigate bank selection*
```

### Alt Text Kuralları

| Durum | Kural |
|-------|-------|
| Diagram | "Diagram showing X, Y, Z relationships" |
| Screenshot | "Screenshot of [UI section] on [service]" |
| Infographic | "Infographic: [topic] breakdown by [metric]" |
| Hiçbir zaman | Boş string bırakma (`""`) |

### Caption Kullanımı

MDX'te caption için italik text kullan (Image component'ten sonra):

```mdx
<Image
  src={addressFlow}
  alt="Address verification flow"
  width={800}
  formats={['avif', 'webp']}
/>

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
import myImage from '../../assets/images/guides/diagram.png';
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

**İki tür görsel var — hangisini ekleyeceğini belirle:**

#### A) Hero Image (Frontmatter)
Makalenin üstündeki büyük görsel.

1. **Görseli koy:** `src/assets/images/guides/[guide-slug]-[description].png`
2. **Frontmatter'da ata:**
   ```yaml
   heroImage: "guide-slug-description.png"
   ```
3. **Build test et:** `npm run build`

#### B) Inline Diagram/Infographic (İçerik İçi)

1. **Görseli koy:** `src/assets/images/guides/[name].png`
2. **MDX'te import + component ekle:**
   ```mdx
   ---
   import { Image } from 'astro:assets';
   import myImage from '../assets/images/guides/name.png';
   ---

   <Image
     src={myImage}
     alt="Açıklayıcı alt text"
     width={1000}
     formats={['avif', 'webp']}
     class="rounded-lg"
   />

   *Caption buraya*
   ```
3. **Build test et:** `npm run build`

#### Commit
```bash
git add src/assets/images/guides/...
git commit -m "docs: add inline image to [guide]"
git push
```

---

## 8. Mevcut Görseller

| Görsel | Konum | Kullanım |
|--------|-------|----------|
| `stripe-three-address-layers.png` | `src/assets/images/guides/` | `us-llc-for-stripe.mdx` hero |
| `us-llc-banking-decision-tree-2026.png` | `src/assets/images/guides/` | Inline diagram |

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
# Hero image ekle (frontmatter)
heroImage: "guide-slug-image-name.png"

# MDX'te inline görsel (<Image> component)
import { Image } from 'astro:assets';
import myImage from '../assets/images/guides/image-name.png';

<Image
  src={myImage}
  alt="Açıklayıcı alt text"
  width={1000}
  formats={['avif', 'webp']}
  class="rounded-lg"
/>

*Caption buraya*
```
```