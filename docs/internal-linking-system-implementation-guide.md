# Internal Linking Sistemi - Kardeş Proje Uygulama Talimatı

## Genel Bakış

Bu doküman, `formation.legal` projesinde aktif olan **Otomatik İç Linkleme Sistemi**'nin aynısını Cloudflare Workers/Pages üzerinde çalışan kardeş Astro projesine nasıl uygulanacağını anlatır.

Sistem şu bileşenlerden oluşur:
1. **Central Static Dictionary** (`link-dictionary.ts`) - Tüm link kurallarının tanımlandığı kaynak dosya
2. **Rehype Plugin** (`src/lib/rehype/index.mjs`) - Markdown/MDX içeriği işleyip otomatik link ekleyen transformer

---

## Kurulum Adımları

### Adım 1: Gerekli Bağımlılıkları Yükle

```bash
npm install unist-util-visit-parents
```

> **Not:** Bu paket, `unist-util-visit-parents` Astro ve MDX ile uyumlu bir şekilde çalışır. Standard `unist-util-visit` değil, **parents** variant'ı kullanılmalıdır.

### Adım 2: Dizinyapısını Oluştur

Kardeş projenizde şu dizin yapısını oluşturun:

```
src/lib/
├── link-dictionary.ts          # Link kuralları dictionary dosyası
└── rehype/
    └── index.mjs                # Otomatik linkleme plugin'i
```

### Adım 3: Dosyaları Kopyalayın

Aşağıda verilen dosya içeriklerini sırasıyla oluşturun.

---

## Dosya Yapıları ve Kodlar

### 1. `src/lib/rehype/index.mjs` - Plugin Dosyası

Bu dosyayı **aynen** kopyalayın (formation.legal'deki ile birebir aynı):

```javascript
/**
 * Auto-Linking Rehype Plugin
 *
 * Transforms text nodes containing keywords into hyperlinks based on
 * the Central Static Dictionary. Handles deduplication, word boundaries,
 * and exclusion patterns.
 */

import { visitParents, SKIP } from 'unist-util-visit-parents';

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if position is at a word boundary (neither adjacent to letters)
 */
function isWordBoundary(text, start, end) {
  const prevChar = start > 0 ? text[start - 1] : ' ';
  const nextChar = end < text.length ? text[end] : ' ';

  const isLetter = (c) => /[\p{L}]/u.test(c);

  return !isLetter(prevChar) && !isLetter(nextChar);
}

/**
 * Create a RegExp pattern for matching keywords with word boundaries
 * Processes longest keywords first to avoid partial matches
 */
function buildKeywordRegex(entries) {
  // Sort by keyword length descending (longest first)
  const sorted = [...entries].sort((a, b) => b.keyword.length - a.keyword.length);

  const alternatives = sorted.map((entry) => {
    const escaped = escapeRegex(entry.keyword);
    const flexibleSpace = escaped.replace(/\\ +/g, '\\s+');
    return `(?:${flexibleSpace})`;
  });

  const pattern = alternatives.join('|');

  // Bug fix #1: Added 'i' flag for case-insensitive matching
  return new RegExp(`(${pattern})`, 'gui');
}

/**
 * Check if any ancestor has a tag that should be skipped
 * This prevents nested links like <a><strong><a>...</a></strong></a>
 */
function hasExcludedAncestor(parentStack, skipTags) {
  for (const ancestor of parentStack) {
    if (ancestor.tagName) {
      if (skipTags.includes(ancestor.tagName)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Initialize deduplication state for a single article
 */
function createDedupState() {
  return {
    seenKeywords: new Set(),
    seenTargets: new Set(),
    keywordCounts: new Map(),
  };
}

/**
 * Check if a match should be skipped
 */
function shouldSkipMatch(state, match, maxPerArticle) {
  const normalizedKeyword = match.keyword.toLowerCase();
  const maxOcc = match.entry.maxOccurrences ?? maxPerArticle;

  const currentCount = state.keywordCounts.get(normalizedKeyword) || 0;
  if (currentCount >= maxOcc) {
    return { skip: true, reason: 'keywordMaxReached' };
  }

  if (state.seenKeywords.has(normalizedKeyword)) {
    return { skip: true, reason: 'keywordDuplicate' };
  }

  if (state.seenTargets.has(match.target)) {
    return { skip: true, reason: 'targetDuplicate' };
  }

  return { skip: false };
}

/**
 * Record a successful match
 */
function recordMatch(state, match) {
  const normalizedKeyword = match.keyword.toLowerCase();

  state.seenKeywords.add(normalizedKeyword);
  state.seenTargets.add(match.target);

  const currentCount = state.keywordCounts.get(normalizedKeyword) || 0;
  state.keywordCounts.set(normalizedKeyword, currentCount + 1);
}

/**
 * Transform text nodes in a HAST tree
 */
function transformAutoLinks(tree, entries, options) {
  const {
    skipTags = ['a', 'code', 'pre', 'script', 'style', 'head', 'title'],
    maxLinksPerArticle = 10,
    currentSlug = '',
  } = options;

  const keywordRegex = buildKeywordRegex(entries);
  const entryMap = new Map();

  for (const entry of entries) {
    entryMap.set(entry.keyword.toLowerCase(), entry);
  }

  const dedup = createDedupState();
  let totalLinks = 0;
  let skippedDuplicate = 0;

  visitParents(tree, 'text', (node, parents) => {
    if (node.type !== 'text') return;
    if (typeof node.value !== 'string') return;
    if (node.value.trim() === '') return;

    const parent = parents[parents.length - 1];
    if (!parent || !parent.tagName) return;
    const parentElement = parent;

    if (skipTags.includes(parentElement.tagName)) return;

    // Skip text inside heading elements (h1, h2, h3, h4, h5, h6)
    for (const ancestor of parents) {
      if (ancestor.tagName && /^h[1-6]$/.test(ancestor.tagName)) {
        return;
      }
    }

    const text = node.value;

    if (!keywordRegex.test(text)) return;
    keywordRegex.lastIndex = 0;

    const matches = [];
    let match;
    while ((match = keywordRegex.exec(text)) !== null) {
      const matchedKeyword = match[1];
      const entry = entryMap.get(matchedKeyword.toLowerCase());

      if (!entry) continue;

      const start = match.index;
      const end = start + matchedKeyword.length;
      if (!isWordBoundary(text, start, end)) continue;

      matches.push({
        keyword: matchedKeyword,
        entry,
        start,
        end,
      });
    }

    if (matches.length === 0) return;

    matches.sort((a, b) => a.start - b.start);

    const newNodes = [];
    let lastIndex = 0;

    for (const m of matches) {
      if (totalLinks >= maxLinksPerArticle) break;

      // Skip self-links (same page) - e.g., EIN page linking to /research/ein
      const targetPath = m.entry.target.replace(/\/$/, '');
      const selfPath = `/${currentSlug}`;
      if (targetPath === selfPath) continue;

      const linkMatch = {
        keyword: m.keyword,
        startIndex: m.start,
        endIndex: m.end,
        target: m.entry.target,
        entry: m.entry,
      };

      const skipResult = shouldSkipMatch(dedup, linkMatch, maxLinksPerArticle);
      if (skipResult.skip) {
        skippedDuplicate++;
        continue;
      }

      if (m.start > lastIndex) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex, m.start),
        });
      }

      const linkNode = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: m.entry.target,
          className: ['auto-link'],
        },
        children: [{ type: 'text', value: m.keyword }],
      };

      newNodes.push(linkNode);
      recordMatch(dedup, linkMatch);
      totalLinks++;
      lastIndex = m.end;
    }

    if (lastIndex < text.length) {
      newNodes.push({
        type: 'text',
        value: text.slice(lastIndex),
      });
    }

    if (newNodes.length > 0) {
      const currentParent = parents[parents.length - 1];
      const nodeIndex = currentParent.children.indexOf(node);
      currentParent.children.splice(nodeIndex, 1, ...newNodes);
      return [SKIP, nodeIndex + newNodes.length];
    }
  });

  return {
    totalLinks,
    skippedDuplicate,
    skippedExcluded: 0,
  };
}

/**
 * Create the auto-linking rehype plugin
 */
export function autoLinkPlugin(options) {
  const {
    dictionary,
    debug = false,
    failQuietly = true,
    skipTags = ['a', 'code', 'pre', 'script', 'style', 'head', 'title'],
    maxLinksPerArticle = 10,
  } = options;

  if (!dictionary || !Array.isArray(dictionary)) {
    const error = new Error('[auto-link] Invalid dictionary: must be an array');
    if (failQuietly) {
      console.warn(error.message);
      return () => {};
    }
    throw error;
  }

  if (dictionary.length === 0) {
    if (debug) console.log('[auto-link] Dictionary is empty, skipping');
    return () => {};
  }

  if (debug) {
    console.log(`[auto-link] Initializing with ${dictionary.length} entries`);
  }

  return function transformer(tree, file) {
    // Bug fix #3: Use history[0] or path as fallback for file.path
    const filePath = file.history?.[0] ?? file.path ?? file.filename ?? 'unknown';

    try {
      // Extract slug from file path: .../research/ein/index.mdx → research/ein
      // If file is index.mdx, use parent directory (handles nested content)
      // But normalize to remove /src/content/ prefix
      const pathParts = filePath.split('/');
      const filename = pathParts.pop()?.replace(/\.mdx?$/i, '') ?? '';
      let slug;
      if (filename === 'index') {
        // Get parent directory and strip common prefixes like /src/content/
        const parentDir = pathParts[pathParts.length - 1];
        const grandParentDir = pathParts[pathParts.length - 2];
        slug = `${grandParentDir}/${parentDir}`;
      } else {
        slug = filename;
      }

      if (debug) {
        console.log(`[auto-link] Processing: ${slug}`);
      }

      const result = transformAutoLinks(tree, dictionary, {
        debug,
        failQuietly,
        skipTags,
        maxLinksPerArticle,
        currentSlug: slug,
      });

      if (debug && result.totalLinks > 0) {
        console.log(`[auto-link] ${slug}: ${result.totalLinks} links added`);
      }
    } catch (error) {
      if (failQuietly) {
        console.warn(`[auto-link] Error processing ${filePath}:`, error);
      } else {
        throw error;
      }
    }
  };
}
```

---

### 2. `src/lib/link-dictionary.ts` - Dictionary Dosyası Örneği

Aşağıda formation.legal projesinden alınmış örnek bir `link-dictionary.ts` dosyası verilmiştir. Kendi projeniz için içerik kategorilerinize göre kelime listesi oluşturacaksınız.

```typescript
/**
 * ★ Central Static Dictionary - Otomatik İç Linkleme Kaynağı
 *
 * Bu dosya OTOMATİK İÇİN LİNK SÖZLÜĞÜDÜR.
 *
 * Kullanım:
 * 1. Yeni bir link eklemek için: LINK_DICTIONARY array'ine yeni entry ekle
 * 2. Bir keyword'ü kaldırmak için: entry'yi sil veya comment out yap
 * 3. Mevcut linki güncellemek için: target veya keyword'ü değiştir
 *
 * Önemli Kurallar:
 * - Her keyword benzersiz olmalı (duplicate prevention)
 * - Compound keywords önce listelenmeli (longer phrases first)
 * - priority ile çakışmaları çöz
 * - target URL'ler MEVCUT sayfa yollarını göstermeli (404 önleme)
 *
 * @example
 * // Yeni link ekleme
 * { keyword: "llc formation", target: "/research/what-is-llc-formation" }
 */

/**
 * @typedef {Object} LinkEntry
 * @property {string} keyword - The keyword/phrase to match in content
 * @property {string} target - The target URL to link to
 * @property {number} [priority] - Higher priority wins when multiple keywords match same text
 * @property {number} [maxOccurrences] - Max occurrences per article (default: 1)
 * @property {string[]} [excludePillars] - Skip linking in these pillars/sections
 * @property {string[]} [excludePages] - Skip linking on these page slugs
 * @property {string} [className] - Custom class name for the link (default: 'auto-link')
 */

/** @type {LinkEntry[]} */
export const LINK_DICTIONARY = [
  // ============ COMPOUND KEYWORDS (önce listelenmeli - longer first) ============

  // Compound keywords - uzun ifadeler önce tanımlanmalı
  {
    keyword: "stripe connect account",
    target: "/payment-access/us-llc-for-stripe",
    priority: 100,
    maxOccurrences: 2,
  },
  {
    keyword: "registered agent service",
    target: "/address-banking/registered-agent-address-vs-business-address",
    priority: 90,
  },
  {
    keyword: "boi report",
    target: "/compliance/boi-reporting-us-llc-2026",
    priority: 95,
  },
  {
    keyword: "beneficial ownership information",
    target: "/compliance/boi-reporting-us-llc-2026",
    priority: 90,
  },
  {
    keyword: "nonresident alien",
    target: "/compliance/form-5472-foreign-owned-llc",
    priority: 85,
    maxOccurrences: 2,
  },
  {
    keyword: "stripe atlas",
    target: "/payment-access/us-llc-for-stripe",
    priority: 60,
  },
  {
    keyword: "merchant of record",
    target: "/payment-access/payment-stack-for-non-us-founders",
    priority: 75,
  },
  {
    keyword: "pro forma 1120",
    target: "/compliance/form-5472-foreign-owned-llc",
    priority: 80,
  },
  {
    keyword: "registered agent address",
    target: "/address-banking/registered-agent-address-vs-business-address",
    priority: 70,
  },
  {
    keyword: "home country address",
    target: "/payment-access/us-llc-for-stripe",
    priority: 65,
  },
  {
    keyword: "virtual mailbox",
    target: "/address-banking/registered-agent-address-vs-business-address",
    priority: 55,
  },
  {
    keyword: "virtual office",
    target: "/address-banking/registered-agent-address-vs-business-address",
    priority: 50,
  },
  {
    keyword: "state filing fee",
    target: "/providers",
    priority: 45,
  },
  {
    keyword: "annual fee",
    target: "/providers",
    priority: 40,
  },
  {
    keyword: "rolling reserve",
    target: "/payment-access/us-llc-for-paypal",
    priority: 60,
  },
  {
    keyword: "single-member llc",
    target: "/research/what-is-llc-formation",
    priority: 50,
  },

  // ============ STANDARD KEYWORDS ============

  {
    keyword: "stripe",
    target: "/research/stripe",
    priority: 50,
    maxOccurrences: 3,
  },
  {
    keyword: "paypal",
    target: "/research/paypal",
    priority: 50,
    maxOccurrences: 2,
  },
  {
    keyword: "llc",
    target: "/research/llc",
    priority: 40,
    maxOccurrences: 5,
  },
  {
    keyword: "registered agent",
    target: "/research/registered-agent",
    priority: 75,
    maxOccurrences: 3,
  },
  {
    keyword: "ein",
    target: "/research/ein",
    priority: 70,
    maxOccurrences: 3,
  },
  {
    keyword: "itin",
    target: "/research/itin",
    priority: 70,
  },
  {
    keyword: "kyc",
    target: "/research/kyc",
    priority: 70,
    maxOccurrences: 3,
  },
  {
    keyword: "boi",
    target: "/compliance/boi-reporting-us-llc-2026",
    priority: 80,
  },
  {
    keyword: "fincen",
    target: "/research/fincen",
    priority: 80,
  },
  {
    keyword: "corporate transparency act",
    target: "/compliance/boi-reporting-us-llc-2026",
    priority: 75,
  },
  {
    keyword: "formation",
    target: "/research/formation",
    priority: 30,
    excludePillars: ["providers"],
  },
  {
    keyword: "payment access",
    target: "/payment-access",
    priority: 25,
  },
  {
    keyword: "compliance",
    target: "/research/compliance",
    priority: 20,
  },
  {
    keyword: "form 5472",
    target: "/research/form-5472",
    priority: 85,
  },
  {
    keyword: "disregarded entity",
    target: "/compliance/form-5472-foreign-owned-llc",
    priority: 70,
  },
  {
    keyword: "non-us founder",
    target: "/payment-access/us-llc-for-stripe",
    priority: 70,
    maxOccurrences: 2,
  },
  {
    keyword: "non-us founders",
    target: "/payment-access/us-llc-for-stripe",
    priority: 65,
    maxOccurrences: 2,
  },
  {
    keyword: "delaware",
    target: "/research/what-is-llc-formation",
    priority: 50,
    excludePillars: ["providers"],
  },
  {
    keyword: "wyoming",
    target: "/research/what-is-llc-formation",
    priority: 50,
  },
  {
    keyword: "c-corp",
    target: "/research/what-is-llc-formation",
    priority: 45,
  },
  {
    keyword: "paddle",
    target: "/payment-access/payment-stack-for-non-us-founders",
    priority: 60,
  },
  {
    keyword: "lemon squeezy",
    target: "/payment-access/payment-stack-for-non-us-founders",
    priority: 55,
  },

  // ============ BANKING PROVIDERS ============

  {
    keyword: "mercury",
    target: "/research/mercury",
    priority: 55,
    maxOccurrences: 2,
  },
  {
    keyword: "relay",
    target: "/address-banking/mercury-relay-banking-non-us-founders",
    priority: 50,
  },
  {
    keyword: "wise",
    target: "/payment-access/us-llc-for-stripe",
    priority: 45,
  },

  // ============ DOCUMENT/PROOF TERMS ============

  {
    keyword: "utility bill",
    target: "/payment-access/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "bank statement",
    target: "/payment-access/us-llc-for-stripe",
    priority: 45,
  },
  {
    keyword: "proof of address",
    target: "/payment-access/us-llc-for-stripe",
    priority: 50,
  },

  // ============ BUSINESS MODEL TERMS ============

  {
    keyword: "saas",
    target: "/research/what-is-llc-formation",
    priority: 40,
  },
  {
    keyword: "digital product",
    target: "/payment-access/payment-stack-for-non-us-founders",
    priority: 45,
  },
  {
    keyword: "ecommerce",
    target: "/payment-access/us-llc-for-stripe",
    priority: 45,
  },
  {
    keyword: "amazon",
    target: "/payment-access/us-llc-for-stripe",
    priority: 50,
  },
  {
    keyword: "shopify",
    target: "/payment-access/us-llc-for-stripe",
    priority: 45,
  },
];

/**
 * Helper: Get dictionary sorted by priority (descending)
 * Use this when you need to process links in priority order
 */
export function getSortedDictionary() {
  return [...LINK_DICTIONARY].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * Helper: Get all keywords as a RegExp-ready string
 */
export function getKeywordPattern() {
  const sorted = getSortedDictionary();
  const escaped = sorted.map((e) => escapeRegex(e.keyword));
  // Longest keywords first for proper matching
  return escaped.sort((a, b) => b.length - a.length).join('|');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

---

### 3. `astro.config.mjs` - Entegrasyon

Astro config dosyanızda MDX entegrasyonunuz varsa, rehype plugin'ini ekleyin:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { autoLinkPlugin } from './src/lib/rehype/index.mjs';
import { LINK_DICTIONARY } from './src/lib/link-dictionary.ts';

export default defineConfig({
  // ... mevcut config ayarları ...

  integrations: [
    mdx(), // MDX entegrasyonu gerekli
    // ... diğer entegrasyonlar ...
  ],

  markdown: {
    rehypePlugins: [
      [autoLinkPlugin, {
        dictionary: LINK_DICTIONARY,
        debug: false,           // true = konsolda debug logları
        maxLinksPerArticle: 10,  // makale başına max link sayısı
      }],
    ],
  },
});
```

---

## Link Kuralları ve Sınırlamalar

### Otomatik Link Verilmeyen Durumlar

Sistem otomatik olarak şu durumlarda link **YARATMAZ**:

| Durum | Açıklama | Örnek |
|-------|----------|-------|
| **Başlık içinde** | H1, H2, H3, H4, H5, H6 etiketleri içindeki metinler | `# EIN nedir` içinde EIN linklenmez |
| **Aynı sayfa içinde** | Bulunulan sayfaya verilen link | EIN sayfasında "EIN" kelimesi link yapılmaz |
| **Kod blokları** | `<code>`, `<pre>` içindeki metinler | Code block içindeki keyword'ler |
| **Zaten link olan metin** | `<a>` tagı içindeki metinler | Önceden linklenmiş kelimeler |
| **Script/Style** | `<script>`, `<style>` içindeki metinler | JavaScript/CSS içindeki kelimeler |
| **Başlık (title)** | `<head>`, `<title>` içindeki metinler | Head içindeki metinler |
| **Kelime sınırı yok** | Kelimenin başında/sonunda harf var | `stripeAtlas` içinde `stripe` linklenmez |

### Deduplication (Tekrar Önleme) Kuralları

Her makale için sistem şu kuralları uygular:

1. **Her keyword sadece 1 kez** linklenir (case-insensitive)
   - `"Stripe"` ve `"stripe"` aynı sayıldığından sadece ilk occurrence linklenir

2. **Aynı target'a sadece 1 kez link verilir**
   - `"stripe"` → `/research/stripe` ve `"Stripe"` → `/research/stripe` sadece 1 kez eklenir

3. **`maxOccurrences` limiti**
   - Dictionary'de tanımlanan `maxOccurrences` değeri aşılınca eklenmez
   - Default: `1`, yüksek öncelikli kelimelerde `2-5` arası olabilir

4. **Priority sistemi**
   - Aynı kelimeye birden fazla entry varsa, **yüksek priority** kazanır
   - Aynı metin içinde birden fazla keyword eşleşirse, **en uzun keyword** önce işlenir

### Compound Keyword önceliği

Daha uzun ifadeler daha kısa ifadelerden **önce** işlenir:

```javascript
// Doğru sıralama (uzun → kısa)
{ keyword: "stripe connect account", target: "/stripe-connect", priority: 100 }
{ keyword: "stripe connect", target: "/stripe", priority: 80 }
{ keyword: "stripe", target: "/stripe-main", priority: 50 }
// "stripe connect account" → /stripe-connect
// "stripe connect" (account olmadan) → /stripe
// "stripe" (tek başına) → /stripe-main
```

---

## LinkEntry Özellikleri Detaylı

```typescript
interface LinkEntry {
  /** Eşleştirilecek keyword veya phrase */
  keyword: string;

  /** Linklenecek hedef URL (mutlak path) */
  target: string;

  /**
   * Öncelik değeri (0-100)
   * - 90-100: Çok önemli, yüksek öncelikli sayfalar
   * - 70-89:  Orta-yüksek öncelik
   * - 50-69:  Standart öncelik
   * - 30-49:  Düşük öncelik
   * - 0-29:   Minimum öncelik
   */
  priority?: number;

  /**
   * Makale başına max kaç kez linklenebilir
   * @default 1
   */
  maxOccurrences?: number;

  /**
   * Bu pillar'larda linkleme yapma
   * Örnek: ["providers"] → providers pillar'ındaki sayfalarda linklenmez
   */
  excludePillars?: string[];

  /**
   * Bu sayfa slug'larında linkleme yapma
   * Örnek: ["ein", "itin"] → ein veya itin sayfalarında linklenmez
   */
  excludePages?: string[];

  /**
   * Link elementine eklenecek CSS class
   * @default 'auto-link'
   */
  className?: string;
}
```

---

## Kardeş Projeye Uyarlama Adımları

### 1. Mevcut Sayfa Yapısını Analiz Et

Kardeş projenizde hangi sayfalar/ Kategoriler olduğunu belirleyin:

```
/
├── guides/          # Tutorial ve how-to içerikler
├── research/        # Araştırma ve bilgi sayfaları
├── providers/       # Sağlayıcı karşılaştırma sayfaları
├── payment-access/  # Ödeme sistemi rehberleri
├── compliance/      # Uyumluluk ve yasal gereksinimler
└── address-banking/ # Adres ve banka hizmetleri
```

### 2. Dictionary'yi Projeye Göre Düzenle

Kardeş projenizin içerik kategorilerine göre `link-dictionary.ts` dosyasını oluşturun:

```typescript
export const LINK_DICTIONARY = [
  // Kardeş projenizin kategorilerine göre keyword'leri tanımlayın
  // formation.legal'deki örnekleri referans alarak
  // kendi sayfa yollarınızı target olarak kullanın

  // Örnek:
  {
    keyword: "your-keyword",
    target: "/your-page-path",
    priority: 75,
    maxOccurrences: 2,
  },
];
```

### 3. URL'leri Güncelleyin

`link-dictionary.ts` içindeki `target` değerlerini kardeş projenizin gerçek sayfa yollarıyla değiştirin. **Mevcut olmayan sayfalara link vermek 404 hatasına neden olur.**

### 4. Test Edin

Build sonrası oluşan HTML çıktısında otomatik linklerin oluştuğunu kontrol edin:

```bash
npm run build
# dist/ klasöründe oluşan HTML dosyalarını inceleyin
# "auto-link" class'lı <a> tagları olmalı
```

---

## Debug Mode

Debug modunu aktif etmek için `astro.config.mjs` içinde:

```javascript
[autoLinkPlugin, {
  dictionary: LINK_DICTIONARY,
  debug: true,  // Konsolda işlenen dosyaları ve eklenen link sayısını gösterir
  maxLinksPerArticle: 10,
}],
```

Debug çıktısı örneği:
```
[auto-link] Initializing with 45 entries
[auto-link] Processing: research/ein
[auto-link] research/ein: 5 links added
[auto-link] Processing: guides/stripe-atlas-alternative
[auto-link] guides/stripe-atlas-alternative: 8 links added
```

---

## CSS Stil verme (Opsiyonel)

Otomatik eklenen linkler `auto-link` class'ını alır. İsterseniz özel CSS ekleyebilirsiniz:

```css
/* src/styles/global.css veya ilgili theme dosyası */
.auto-link {
  color: #0066cc;
  text-decoration: none;
  border-bottom: 1px dotted currentColor;
  transition: color 0.2s ease;
}

.auto-link:hover {
  color: #004499;
  border-bottom-style: solid;
}
```

---

## Önemli Notlar

1. **Target URL'ler mutlaka mevcut olmalı** - 404 hatası oluşturmayın
2. **Compound keywords her zaman uzun → kısa sırasında** tanımlanmalı
3. **`excludePillars` kullanımı** - Aynı kelimeyi birden fazla pillar'da kullanmak yerine, pillar'a özel entry'ler tanımlayın
4. **Priority değerleri** - Daha spesifik/önemli sayfalar daha yüksek priority almalı
5. **`maxOccurrences` limiti** - Genel kelimelerde (örn: "llc") düşük tutun, spesifik kelimelerde yüksek

---

## Dosyaların Konumu (Kardeş Proje Hedef)

```
kardeş-proje/
├── src/
│   ├── lib/
│   │   ├── link-dictionary.ts    ← OLUŞTURULACAK
│   │   └── rehype/
│   │       └── index.mjs        ← KOPYALANACAK
│   └── ...
├── astro.config.mjs              ← GÜNCELLENECEK
└── package.json                  ← BAĞIMLILIK EKLENCEK
```

---

## Bağımlılık Listesi

```json
{
  "dependencies": {
    "unist-util-visit-parents": "^3.x.x"
  }
}
```

---

## Kaynaklar

- **formation.legal projesi**: Bu sistemin aktif olarak çalıştığı referans proje
- **HAST (Hypertext Abstract Syntax Tree)**: MDX/Markdown'ın AST gösterimi
- **rehype**: Markdown HTML'e dönüştürürken kullanılan plugin sistemi
- **unist-util-visit-parents**: AST traversal için kullanılan yardımcı kütüphane

---

*Bu doküman formation.legal projesinden elde edilen bilgilerle oluşturulmuştur.*