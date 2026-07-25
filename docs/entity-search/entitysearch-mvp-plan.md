# EntitySearch.us - MVP Mimari ve SEO Planı (Statik MDX Stratejisi)

**Tarih:** 2026-05-11
**Proje:** entitysearch.us
**Hedef:** 50 eyalet için yüksek kaliteli, ekran görüntülü ve manuel hazırlanmış Business Entity Search rehberleri ile SEO otoritesi kurmak.
**Tech Stack:** Astro, TailwindCSS, MDX, Cloudflare Pages (Free)

---

## 1. Strateji Değişikliği: Neden Statik MDX?

Programmatic SEO (pSEO) yerine **Manuel Statik MDX (Astro Content Collections)** stratejisine geçilmiştir. 

**Nedeni:**
- **Google Spam (Helpful Content) Koruması:** Sadece veritabanından çekilen ve şablonla üretilen sayfalar yerine, her eyalet için %100 özgün, insan tarafından yazılmış, rehber niteliğinde içerikler (ekran görüntüleri, spesifik uyarılar) oluşturmak.
- **Yüksek Kalite Sinyali:** "Texas'ta isim araması yaparken X butonuna tıklayın" gibi o eyalete özel, manuel test edilmiş yönlendirmeler ekleyerek ziyaretçiye gerçek bir "Guide" sunmak.
- **Güvenilirlik:** Piyasada zaten var olan otomatik "directory" sitelerinden (secretaryofstate.com gibi) ayrışıp, kaliteli içerik üreten "Otorite Hub"ı olmak.

---

## 2. URL ve Routing Mimarisi (Exact Match URLs)

URL yapısı en yüksek hacimli arama niyetine (Search Intent) göre tasarlanmıştır.

*   **Ana Sayfa:** `https://entitysearch.us/` (Tüm eyaletlerin listesi ve interaktif harita)
*   **Eyalet Sayfaları (Direct Path):** `https://entitysearch.us/[state]/`
    *   *Örnek:* `https://entitysearch.us/texas/` (Texas Business Entity Search)
    *   *Örnek:* `https://entitysearch.us/new-mexico/` (New Mexico Entity Search)
*   **Destekleyici Araçlar/Sayfalar:** `/check-business-name/`, `/llc-lookup/`

---

## 3. Klasör Yapısı (Astro Workspace)

```text
entitysearch.us/
├── public/                 # Favicon, genel statik varlıklar
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── states/     # Eyalet rehberleri için manuel çekilmiş ekran görüntüleri (örn: texas-search-step1.png)
│   ├── components/
│   │   ├── StateSearchWidget.astro  # Eyalete özel affiliate CTA'sı (Check Name Availability)
│   │   ├── OfficialLinkBox.astro    # Devletin resmi sayfasına giden vurgulu kutu
│   │   └── ScreenshotStep.astro     # MDX içinde adımları göstermek için component
│   ├── content/
│   │   └── states/         # 50 Eyaletin her biri için MDX dosyaları
│   │       ├── texas.mdx
│   │       ├── florida.mdx
│   │       ├── new-mexico.mdx
│   │       └── config.ts   # Astro Content Collections (Zod) şeması
│   ├── layouts/
│   │   └── StateLayout.astro # 50 sayfanın tümü için kullanılacak UNIFIED LAYOUT
│   ├── pages/
│   │   ├── index.astro
│   │   └── [state].astro   # content/states içindeki MDX'leri StateLayout ile render eden dinamik rota
│   └── styles/
│       └── global.css
├── astro.config.mjs
└── tailwind.config.cjs
```

---

## 4. MDX İçerik Yapısı (Örnek: `src/content/states/texas.mdx`)

Her eyalet dosyası, standart bir frontmatter ve özgün bir gövdeden oluşacaktır. Layout standart olacak, içerik özgün olacaktır.

**ÖNEMLİ KURAL:** `seoTitle` alanında kesinlikle "Guide", "2026", "Step-by-step" gibi blog kelimeleri kullanılmayacaktır. Title bir devlet veritabanı gibi görünmelidir (Exact Match). Spam cezalarından (Doorway Pages) kaçınmak için ise `seoDescription` metni, o eyalete özgü gerçek hukuki verilerle (Kurum Adı, Kurulum Ücreti) zenginleştirilecektir.

```mdx
---
stateName: "Texas"
stateAbbr: "TX"
officialName: "TX Comptroller"
officialUrl: "https://mycpa.cpa.state.tx.us/coa/"
seoTitle: "Texas Secretary of State | Business Entity Search"
seoDescription: "Lookup an existing business entity or check LLC name availability in Texas. Access official public records directly from the TX Comptroller. Current formation fee is $300."
llcFee: 300
---

import { Image } from 'astro:assets';
import step1Img from '../../assets/images/states/texas-step-1.png';
import OfficialLinkBox from '../../components/OfficialLinkBox.astro';
import StateSearchWidget from '../../components/StateSearchWidget.astro';

Texas Secretary of State veritabanında isim aramak veya şirket kayıtlarını incelemek ücretsizdir. Ancak sistemin arayüzü biraz karmaşık olabilir. İşte adım adım rehberiniz:

## Official Database Link

<OfficialLinkBox 
  title="Texas Taxable Entity Search" 
  url={frontmatter.officialUrl} 
  agency={frontmatter.officialName} 
/>

## How to Search for a Texas LLC

Texas'ta isim uygunluğunu kontrol etmek için Comptroller veritabanını kullanmalısınız.

### Step 1: Search Sayfasına Girin
Resmi bağlantıya tıkladığınızda karşınıza aşağıdaki gibi bir ekran çıkacaktır. Arama kutusuna sadece şirket ismini yazın, sonuna "LLC" eklemeyin.

<Image src={step1Img} alt="Texas entity search input screen screenshot" />

### Step 2: Sonuçları İnceleyin
Eğer aradığınız isim sonuçlarda çıkıyorsa (ve durumu ACTIVE ise), bu ismi **kullanamazsınız**. Eğer "No results found" hatası alırsanız, tebrikler! İsim büyük ihtimalle müsaittir.

---

## Ready to Register Your Texas LLC?

İsminizin müsait olduğundan emin oldunuz mu? Texas'ta LLC kurulum ücreti **${frontmatter.llcFee}**'dır. Hemen işlemlere başlamak için isim uygunluğunuzu onaylayıp affiliate servislerimizi kullanabilirsiniz.

<StateSearchWidget state="Texas" />
```

---

## 5. Dinamik Routing Kurulumu (`src/pages/[state].astro`)

MDX dosyaları `src/pages/[state].astro` tarafından alınıp `StateLayout` içine oturtulacaktır.

```astro
---
import { getCollection } from 'astro:content';
import StateLayout from '../layouts/StateLayout.astro';

export async function getStaticPaths() {
  const stateEntries = await getCollection('states');
  return stateEntries.map(entry => ({
    params: { state: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<StateLayout frontmatter={entry.data}>
  <Content />
</StateLayout>
```

---

## 6. Geliştirme Adımları (Next Steps)

1.  **Proje Kurulumu:** IDE'de `npm create astro@latest entitysearch.us` ile minimal Astro projesi başlatılacak.
2.  **Tailwind & MDX:** `npx astro add tailwind` ve `npx astro add mdx` kurulumları yapılacak.
3.  **Layout Geliştirme:** `formation.legal`'deki gibi temiz, kurumsal ve güven veren bir UI'a sahip `StateLayout.astro` hazırlanacak.
4.  **İçerik Üretimi (Batch):** 50 eyalet için `.mdx` taslakları oluşturulacak. Her birine gidip manuel ekran görüntüleri (`.png`) alınıp optimize edilerek (Astro Image componenti ile) eklenecek.
5.  **Affiliate Entegrasyonu:** `StateSearchWidget` componenti geliştirilerek kullanıcılar Bizee/Northwest/ZenBusiness gibi formation provider'larına yönlendirilecek.
6.  **Deploy:** Cloudflare Pages'a GitHub üzerinden bağlanarak ücretsiz ve global hızlı bir altyapı kurulacak.
