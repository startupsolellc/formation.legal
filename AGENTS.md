# AGENTS.md — Formation.Legal Project Intelligence

> **Bu dosya, projeye ilk kez giren AI agent'lar ve geliştiriciler için birincil referanstır.**
> Projenin teknik altyapısını, kurallarını ve iş akışlarını özetler.
> Detaylı teknik bilgi için → [README.md](./README.md)
> Proje içerik konsepti için → [new concept.md] (@docs/new concept.md)

---

## Proje Özeti

Formation.Legal, ABD'de LLC kuruluşu, registered agent seçimi ve iş uyumu konularında
bağımsız, araştırma odaklı rehberler sunan **tamamen statik** bir içerik platformudur.

**Kritik Kısıtlama:** Bu site tamamen statik output üretir (`output: 'static'`).
Hiçbir server-side logic, API route, middleware veya session yönetimi YOKTUR.
Tüm sayfalar build-time'da pre-render edilir ve Cloudflare Pages'e statik dosyalar olarak deploy edilir.

---

## Tech Stack (Değiştirme — Sebebini Belirt)

| Katman | Teknoloji | Versiyon | Notlar |
|--------|-----------|----------|--------|
| Framework | Astro | 6.x | Node 22+ zorunlu |
| Language | TypeScript | strict | `tsconfig.json` → `astro/tsconfigs/strict` |
| Styling | Tailwind CSS | v4 | **CSS-first** config, `@theme` directive |
| Tailwind Enteg. | `@tailwindcss/vite` | 4.x | ⚠️ `@astrojs/tailwind` deprecated, KULLANMA |
| İçerik | Content Collections | Astro native | `glob()` loader, Zod schema |
| İçerik Formatı | MDX | `@astrojs/mdx` | Markdown + JSX components |
| SEO | JSON-LD | Manuel helpers | `src/lib/schema.ts` |
| Sitemap | `@astrojs/sitemap` | Auto XML | Build-time üretilir |
| Deploy | Cloudflare Pages | Static | Adapter YOK, `dist/` doğrudan deploy |

---

## ⚠️ Kritik Kurallar (İhlal Etme)

### 1. Statik Kalmalı
```
output: 'static'  ← Bu ASLA değiştirilmemeli (ihtiyaç olmadıkça)
```
- `@astrojs/cloudflare` adapter EKLEME — statik output için gereksiz
- Server-side API route'ları OLUŞTURMA
- `cookies()`, `headers()`, `Astro.request` gibi server-only API'lar KULLANMA

### 2. Tailwind CSS v4 Paradigma
```css
/* ✅ DOĞRU — CSS-first config */
@theme {
  --color-primary-500: oklch(0.50 0.14 240);
}

/* ❌ YANLIŞ — Eski JS config dosyası */
// tailwind.config.js ← BU DOSYA YOK, OLUŞTURMA
```
- Renkler, fontlar, spacing → `src/styles/global.css` → `@theme` bloğu
- Plugin'ler → `@plugin` directive (örn: `@plugin "@tailwindcss/typography"`)
- `tailwind.config.js` / `tailwind.config.ts` OLUŞTURMA — Tailwind v4 bunu kullanmaz

### 3. Content Collections (Astro 6 API)
```typescript
// ✅ DOĞRU — Astro 6 API
import { getCollection, render } from 'astro:content';
const posts = await getCollection('posts');
const { Content } = await render(post);

// ❌ YANLIŞ — Eski API (Astro 4-5)
// import { getEntries, getEntryBySlug } from 'astro:content'; ← ESKİ
// const { Content } = await post.render(); ← ESKİ
```

### 4. İçerik Slug Davranışı
Astro 6'da content collection item'larının `id`'si slug olarak kullanılır.
`post.slug` → **YOK**. Yerine `post.id` kullan.

### 5. Trust Layer Zorunluluğu
Her yeni içerik sayfasına **mutlaka** Trust Layer metadata eklenmelidir:
- `originalityScore` (0-100)
- `humanGenerated` (boolean)
- `aiAssisted` (boolean)

---

## Dosya Haritası & Sorumluluklar

### Yapılandırma
```
astro.config.mjs          → Astro + Tailwind + MDX + Sitemap config
tsconfig.json              → TypeScript strict mode extends
package.json               → Dependencies & scripts
.nvmrc                     → Node.js version (22)
```

### İçerik Sistemi
```
src/content.config.ts      → Collection tanımları + Zod schema
src/content/posts/         → Blog MDX dosyaları (slug = klasör adı)
  └── {slug}/index.mdx     → Her post bir klasör + index.mdx
```

### Çekirdek Kütüphaneler
```
src/lib/constants.ts       → SITE, ORGANIZATION, DEFAULT_AUTHOR, NAV_ITEMS
src/lib/schema.ts          → JSON-LD builder fonksiyonları
                              buildOrganizationSchema()
                              buildWebSiteSchema()
                              buildArticleSchema(input)
                              buildBreadcrumbSchema(items)
```

### Layout & Bileşenler
```
src/layouts/BaseLayout.astro    → Root layout (tüm sayfalar bunu kullanır)
                                   - <head>: meta, OG, Twitter, JSON-LD, fonts
                                   - <body>: Header → main slot → Footer
                                   - Props: title, description, canonicalUrl, ogImage, noindex, schemas[]

src/components/Header.astro     → Sticky nav, glassmorphism, NAV_ITEMS'dan menü
src/components/Footer.astro     → Copyright, llms.txt/robots.txt/sitemap linkleri
src/components/PostCard.astro   → Blog listesi kart bileşeni
src/components/Prose.astro      → Tailwind Typography sarmalayıcı
src/components/seo/JsonLd.astro → <script type="application/ld+json"> renderer
src/components/seo/TrustBadge.astro → Görsel trust badge + meta tags
```

### Sayfalar
```
src/pages/index.astro           → Homepage (hero + latest posts)
src/pages/blog/index.astro      → Blog listesi
src/pages/blog/[slug].astro     → Tekil post (getStaticPaths ile static gen)
src/pages/llms.txt.ts           → AI-friendly site index (build-time generate)
src/pages/robots.txt.ts         → Crawler izinleri (build-time generate)
```

### Stiller
```
src/styles/global.css           → Tailwind v4 import + @theme tokens + base resets
                                   ⚠️ Renk/font değişiklikleri SADECE burada yapılır
```

---

## Sık Yapılan İşlemler — Nasıl Yapılır

### 📝 Yeni Blog Post Ekleme

1. Klasör oluştur: `src/content/posts/{slug}/index.mdx`
2. Frontmatter ekle (aşağıdaki şablonu kullan):

```mdx
---
title: "Post Başlığı"
description: "Kısa açıklama (SEO meta description olarak kullanılır)"
pubDate: 2025-06-15
author: "Formation.Legal Editorial"
originalityScore: 95
humanGenerated: true
aiAssisted: false
category: "LLC Formation"
tags: ["LLC", "guide"]
---

İçerik buraya yazılır. Markdown + JSX kullanılabilir.
```

3. Build: `npm run build` — otomatik olarak:
   - Blog sayfası oluşturulur
   - Sitemap güncellenir
   - llms.txt güncellenir

### 📄 Yeni Statik Sayfa Ekleme (Blog Dışı)

1. `src/pages/` altına `.astro` dosyası oluştur
2. `BaseLayout` kullan:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Sayfa Başlığı" description="Açıklama">
  <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
    <h1>Başlık</h1>
    <p>İçerik</p>
  </section>
</BaseLayout>
```

### 🎨 Renk/Font Değiştirme

`src/styles/global.css` → `@theme` bloğu düzenle:
```css
@theme {
  --color-primary-500: oklch(0.50 0.14 240);  /* ← burayı değiştir */
  --font-sans: 'Inter', system-ui, sans-serif; /* ← burayı değiştir */
}
```

### 🔗 Navigasyona Link Ekleme

`src/lib/constants.ts` → `NAV_ITEMS` dizisine ekle:
```typescript
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },  // ← yeni link
] as const;
```

### 📊 Yeni JSON-LD Schema Ekleme

1. `src/lib/schema.ts`'e yeni builder fonksiyon ekle
2. İlgili sayfada `schemas` prop'una ekle:

```astro
---
import { buildMyNewSchema } from '../lib/schema';
const mySchema = buildMyNewSchema({ ... });
---
<BaseLayout title="..." schemas={[mySchema]}>
```

### 🆕 Yeni Content Collection Ekleme (ör: "guides", "tools")

1. `src/content.config.ts`'e yeni collection tanımla:
```typescript
const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: z.object({ ... }),
});
export const collections = { posts, guides }; // ← eklendi
```

2. İçerik klasörü oluştur: `src/content/guides/`
3. Sayfa oluştur: `src/pages/guides/[slug].astro`

---

## Build & Deploy

```bash
npm run dev       # Local dev server (hot reload)
npm run build     # Static build → dist/
npm run preview   # Preview production build locally

# Cloudflare Pages deploy
npx wrangler pages deploy dist --project-name=formation-legal
```

### Cloudflare Pages Ayarları
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment:** `NODE_VERSION=22`

---

## JSON-LD Schema Zinciri

Her sayfada otomatik üretilen structured data:

| Sayfa | JSON-LD Schemas |
|-------|----------------|
| Homepage | Organization + WebSite |
| Blog Listing | Organization + WebSite + BreadcrumbList |
| Blog Post | Organization + WebSite + Article (+ Trust Layer) + BreadcrumbList |

`BaseLayout.astro` otomatik olarak `Organization` + `WebSite` ekler.
Sayfa-özel schema'lar `schemas` prop'u ile eklenir.

---

## AI/GEO Altyapısı

| Dosya | Amaç | Güncelleme |
|-------|------|------------|
| `/llms.txt` | LLM'lerin siteyi anlaması için curated index | Otomatik (build-time) |
| `/robots.txt` | AI crawler'lara izin | Otomatik (build-time) |
| `/sitemap-index.xml` | Tüm sayfa URL'leri | Otomatik (@astrojs/sitemap) |
| Trust Layer meta tags | İçerik provenansı | Manuel (frontmatter'da) |
| JSON-LD | Structured data | Otomatik (schema.ts builders) |

---

## Bağımlılık Notu

Bu proje kasıtlı olarak **minimal bağımlılık** ilkesiyle kurulmuştur:
- 6 production dependency
- No React, Vue, Svelte — pure Astro components
- No CMS (Keystatic Astro 6 ile uyumsuz, gelecekte eklenebilir)
- No database — içerikler git'te MDX dosyası olarak yaşar
- No auth — tamamen public static site

**Yeni bağımlılık eklemeden önce iki kez düşün.**

---

## İçerik Üretim Standartları

**Zorunlu workflow:** [`docs/content-workflow-standards.md`](./docs/content-workflow-standards.md)

Her yeni içerik oluşturmada uygulanacak:
1. DataForSEO SERP analizi (keyword araştırması)
2. 2026 güncel araştırma + kaynak doğrulama
3. SEO meta optimizasyonu (`seoTitle` ≤60 char, `seoDescription` ≤160 char)
4. GEO template alanları (directAnswer, verdict, aiMiss, decisionTree, providerFit)
5. Trust Layer (originalityScore, humanGenerated, aiAssisted)
6. Görsel optimizasyonu — [`docs/content-image-workflow.md`](./docs/content-image-workflow.md)
   - **Hero images:** `heroImage` frontmatter + `src/assets/images/guides/`
   - **Inline diagrams:** `public/images/guides/` + markdown syntax (`/images/guides/...`)

---

## External API Entegrasyonları

### DataForSEO — Anahtar Kelime Araştırması

Referans: [`docs/dataforseo-guide.md`](./docs/dataforseo-guide.md)

| Öğe | Değer |
|-----|-------|
| Package | `dataforseo-client` |
| Client modülü | `src/lib/dataforseo.ts` |
| Test script | `scripts/test-dataforseo.mjs` |
| `.env` variable'ları | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `DATAFORSEO_API_URL` |

**⚠️ Kritik gotcha — `keyword` formatı:**

```typescript
// ❌ SERP endpoint'lerinde YANLIŞ — "keyword" tek string olmalı
task.keyword = ["llc formation"];  // ← Array HATASI verir!

// ✅ DOĞRU — "keyword" tek string
task.keyword = "llc formation";     // ← String olmalı
```

```typescript
// ❌ Keywords Data endpoint'lerinde YANLIŞ — "keywords" array olmalı
task.keywords = "llc formation";   // ← String HATASI verir!

// ✅ DOĞRU — "keywords" array olmalı
task.keywords = ["llc formation", "non-resident"];
```

**Kullanım:**
```typescript
import { getSerpClient, SerpGoogleOrganicLiveAdvancedRequestInfo } from '@/lib/dataforseo';

const client = await getSerpClient();
const task = new SerpGoogleOrganicLiveAdvancedRequestInfo();
task.keyword = "llc formation non-resident";
task.location_code = 2840;  // ABD
task.language_code = "en";

const result = await client.googleOrganicLiveAdvanced([task]);
```

**Build-time data fetching:** Bu site statik olduğundan, DataForSEO API çağrıları `npm run build` sırasında yapılır ve sonuçlar `dist/` içinde pre-render edilir.
