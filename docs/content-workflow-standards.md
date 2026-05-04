# Content Workflow Standards — Formation.Legal

> **Amac:** Her yeni içerik oluşturmada uygulanacak zorunlu standartlar.
> **Kapsam:** Tüm guide'lar, playbook'lar, research içerikleri ve yeni sayfalar.
> **Referans:** [AGENTS.md](../AGENTS.md) — Proje teknik altyapısı

---

## 🔄 İçerik Üretim Workflow'u

Her yeni içerik için aşağıdaki sıra **kesinlikle** takip edilmelidir:

```
┌─────────────────────────────────────────────────────────────┐
│  ADIM 0: Konsept Tanımlama                                     │
│  → Hangi pillar/hub'a ait?                                    │
│  → Kullanıcı gerçek problemi ne?                              │
│  → Route Engine konseptine nasıl bağlanıyor?                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ADIM 1: DataForSEO ile Anahtar Kelime Araştırması             │
│  → docs/dataforseo-guide.md'i oku                            │
│  → SERP analizi yap (AI Overview durumu, rekabet, fırsat)    │
│  → Keywords Data API ile volume/tahmin                       │
│  → Output: Keyword brief + content brief                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ADIM 2: 2026 Güncel Araştırma + Kaynak Doğrulama             │
│  → Official sources: IRS, FinCEN, Stripe, PayPal dokümanları │
│  → Rakip analizi (neyi kaçırdılar?)                          │
│  → Real-world test/gözlem (varsa)                            │
│  → Output: Araştırma notları + kaynak listesi                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ADIM 3: İçerik Yazımı (Paralel)                              │
│  → seo-content-writer skill kullan                          │
│  → keyword-research skill kullan                              │
│  → GEO-optimized snippet/hedefleme                          │
│  → Output: Optimized meta + içerik                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ADIM 4: Kalite Kontrol                                      │
│  → Schema validation (Zod)                                   │
│  → Build test (`npm run build`)                             │
│  → SEO meta uzunluk kontrolü (title ≤60, desc ≤160)          │
│  → Trust Layer eksiksizlik kontrolü                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ADIM 1: DataForSEO Anahtar Kelime Araştırması

### Zorunlu Kontroller

Her içerik oluşturmadan **önce** şu araştırmalar yapılmalı:

#### 1.1 SERP Analizi (Zorunlu)

```bash
# Her yeni konu için en az 5 keyword araştır
node scripts/test-dataforseo.mjs  # Önce bağlantı test et

# Sonra SERP analizi için:
node scripts/serp-analysis.mjs
```

**Analiz edilecekler:**
- AI Overview var mı? (yok = büyük fırsat)
- Hangi domain'ler dominate ediyor? (gov siteler zor yenilir)
- Rekabet seviyesi (low/medium/high)
- Related questions (içerik fırsatları)

#### 1.2 AI Overview Durumu Özeti

| AI Overview | Anlam | Aksiyon |
|-------------|-------|---------|
| **Var** | Google AI özet gösteriyor | İçerik citation-optimized olmalı |
| **Yok** | AI Summary yok = FIRSAT | Hemen hedefle, ilk ol |
| **Dominated by gov** | irs.gov/fincen.gov | Erişilebilir dil + pratik örnekler |

#### 1.3 Output: Keyword Brief Şablonu

```markdown
## Keyword Brief: [Konu Başlığı]

### Hedef Anahtar Kelimeler
| Keyword | Volume | Difficulty | AI Overview | Intent |
|---------|--------|------------|-------------|--------|
| "primary keyword" | XXX | Low/Med/High | Var/Yok | Info/Nav/Comm/Trans |

### İçerik Fırsatları
- AI Overview'suz keyword'ler → Hemen hedefle
- Low competition + high intent →优先
- Rakip eksiklikleri → Farklılaşma noktası

### Serp Analizi Sonuçları
- Top 3 rakip: [domain'ler]
- Dominant içerik tipi: [guide/comparison/list]
- Bozuk/aldatıcı içerik varsa: [fırsat açıklaması]
```

---

## ADIM 2: 2026 Güncel Araştırma

### Zorunlu Kaynak Türleri

| Kaynak Tipi | Örnek | Güvenilirlik |
|-------------|-------|--------------|
| **Official/Government** | IRS.gov, FinCEN.gov, Stripe Docs | ⭐⭐⭐ En yüksek |
| **Platform Official** | PayPal Business, Mercury Support | ⭐⭐⭐ En yüksek |
| **Test/Research** | Gerçek kullanıcı testleri, deneyim | ⭐⭐ İyi |
| **Third-party** | Reddit, forumlar, bloglar | ⭐ Dikkatla doğrula |

### Araştırma Checklist

```markdown
## Araştırma Notları: [Konu]

### 1. Resmi Kaynak Kontrolü
- [ ] IRS/Fincen/Stripe/PayPal dokümanı kontrol edildi
- [ ] Son güncelleme tarihi: 2026
- [ ] Kullanılan official kaynak linkleri listelendi

### 2. Rakip İçerik Analizi
- [ ] Top 5 rakip incelendi
- [ ] Eksik/yanlış bilgi tespit edildi
- [ ] Farklılaşma noktası belirlendi

### 3. Real-World Validation
- [ ] Mümkünse gerçek test/deneyim eklendi
- [ ] Kullanıcı problemi/tartışması araştırıldı

### 4. Kaynak Listesi
| Kaynak | URL | Son Erişim | Güvenilirlik |
|--------|-----|------------|--------------|
| IRS Form 5472 Instructions | irs.gov/... | 2026-05-04 | ⭐⭐⭐ |
```

---

## ADIM 3: İçerik Yazım Standartları

### 3.1 SEO Meta Zorunlu Alanları

Her guide/content frontmatter'ında:

```yaml
---
title: "H1 Başlık - Kullanıcı Sorunu"        # Sayfa içinde görünür başlık
description: "Kısa açıklama (icerik özeti)"   # İçerik altındaki özet
seoTitle: "Kısa SERP Basligi (≤60 char)"      # SEO için optimize edilmiş
seoDescription: "Meta description (≤160 char)" # CTR için optimize edilmiş
pillar: payment-access                        # Pillar tanımı
pubDate: 2026-05-04
updatedDate: 2026-05-04
lastReviewed: 2026-05-04
author: "Formation.Legal Editorial"
reviewer: "Formation.Legal Editorial"
originalityScore: 95                          # 0-100, gerçek değer
humanGenerated: true
aiAssisted: false
draft: false
noindex: false
tags: ["keyword1", "keyword2", "keyword3"]
---
```

### 3.2 GEO Template Zorunlu Alanları

Her guide için:

```yaml
directAnswer: "LLM'in alıntılayacağı direct answer (max 500 char)"
verdict:
  - scenario: "Senaryo tanımı"
    verdict: "Verdict"
    risk: "low|medium|high|blocked|needs-review"
    note: "Açıklama"
aiMiss:
  - "AI'ların genelde kaçırdığı nokta 1"
  - "AI'ların genelde kaçırdığı nokta 2"
decisionTree:
  - question: "Soru?"
    yes: "Evet ise..."
    no: "Hayır ise..."
providerFit:
  - founderProfile: "Founder tipi"
    betterFit: "Uygun provider"
    why: "Neden"
    caveat: "Dikkat"
toolCta:
  primaryLabel: "Route Planner"
  primaryHref: "/tools/route-planner"
sources:
  - title: "Kaynak Adı"
    url: "https://..."
    publisher: "Publisher"
    accessDate: "2026-05-04"
    primary: true
updateLog:
  - date: "2026-05-04"
    change: "Değişiklik açıklaması"
```

### 3.3 LLM-Citation-Optimized Yazım Kuralları

#### Direct Answer Formatı (Zorunlu)
```markdown
<!-- Direct Answer: İlk 40-70 kelime LLM citation için optimize -->
A US LLC does not guarantee [RESULT]. [PLATFORM] evaluates [FACTOR1], [FACTOR2], and [FACTOR3]. Key requirement: [SPECIFIC_RULE]. As of [DATE], [POLICY_CHANGE_IF_ANY].
```

#### Verdict Table Formatı
```markdown
| Senaryo | Verdict | Risk | Not |
|---------|---------|------|-----|
| [Durum] | [Sonuç] | [Risk] | [Açıklama] |
```

#### AI Miss List Formatı
```markdown
## What AI Answers Miss

Most AI summaries stop at "[GENERIC_ADVICE]." The missing steps are:

1. **[MISSED_POINT_1]**
   Why it matters: [EXPLANATION]

2. **[MISSED_POINT_2]**
   Why it matters: [EXPLANATION]
```

---

## ADIM 4: Kalite Kontrol

### Zod Schema Validation (Otomatik)

```bash
# Build sırasında otomatik kontrol
npm run build

# Manuel kontrol için:
npx astro check
```

### SEO Meta Uzunluk Kontrolü

| Alan | Maksimum | Truncation riski |
|------|----------|------------------|
| `seoTitle` | 60 karakter | Google'da ... ile kesilir |
| `seoDescription` | 160 karakter | Google'da ... ile kesilir |
| `directAnswer` | 500 karakter | AI Overview truncation |

### Trust Layer Eksiksizlik

Her içerik mutlaka şunları içermeli:
- [ ] `originalityScore` (gerçek değer, 0-100)
- [ ] `humanGenerated` (boolean)
- [ ] `aiAssisted` (boolean)
- [ ] `author` (string)
- [ ] `lastReviewed` (date)

---

## 📋 Quick Reference: Yeni İçerik Oluşturma

```
1. Konsept tanımla
   → Route Engine'e nasıl bağlanıyor?

2. DataForSEO SERP analizi yap
   → 5+ keyword araştır
   → AI Overview durumunu kontrol et
   → Fırsat ve risk analizi yap

3. Araştırma yap (2026 güncel)
   → Official kaynakları kontrol et
   → Rakip eksikliklerini tespit et
   → Real-world validation ekle

4. İçerik yaz (seo-content-writer skill + keyword-research skill)
   → SEO meta: seoTitle (≤60), seoDescription (≤160)
   → GEO template: directAnswer, verdict, aiMiss, decisionTree
   → Trust Layer: originalityScore, humanGenerated, author

5. Kalite kontrol
   → Build test
   → Schema validation
   → Meta uzunluk kontrolü
```

---

## ⚠️ Yapılmaması Gerekenler

| Yasak | Neden | Yerine |
|-------|-------|--------|
| DataForSEO'suz içerik yazmak | Keyword fırsatları kaçırılır | SERP analizi yap |
| 2025'den eski kaynak kullanmak | Bilgi güncelliğini yitirir | 2026 official kaynak bul |
| `seoTitle`/`seoDescription` eklemeden yayınlamak | SERP performansı düşer | Meta optimizasyonu yap |
| Trust Layer eksik bırakmak | EEAT güveni azalır | Tüm alanları doldur |
| `draft: true` bırakıp yayınlamak | İçerik index'e girmez | `draft: false` yap |

---

## 📁 İlgili Dosyalar

| Dosya | Referans |
|-------|----------|
| `docs/dataforseo-guide.md` | DataForSEO API kullanımı |
| `docs/seo-meta-audit-report.md` | SERP analizi örneği |
| `src/content.config.ts` | Content schema tanımları |
| `AGENTS.md` | Teknik standartlar |

---

*Son güncelleme: 2026-05-04*
*Bu standart tüm agent'lar tarafından uygulanmalıdır.*