# Em-Dash (—) Optimizasyon Planı ve Subagent Görevlendirmesi

## Hedef
`src/content/research` dizinindeki tüm içeriklerde (sözlük maddeleri ve ana makaleler) bulunan em-dash (`—`) ve en-dash (`–`) simgelerini, metnin bağlamına ve gramer yapısına zarar vermeden, SEO Content Writer yeteneği kurallarına uygun şekilde optimize etmek.

## Neden Titiz Bir Çalışma Gerekiyor?
Em-dash işaretini doğrudan kaldırmak veya tek bir simgeyle (örneğin sadece virgülle) değiştirmek anlatım bozukluklarına, markdown tablo yapılarının kırılmasına ve liste okunabilirliğinin düşmesine neden olabilir. Bu yüzden her işaret, bulunduğu cümleye göre değerlendirilmelidir.

## Değişim Kuralları (SEO Content Writer Constraint)
Her bir subagent (copywriter rolünde) aşağıdaki kuralları harfiyen uygulayacaktır:
1. **Liste Başlangıçları:** Em-dash bir listeyi açıklamak için kullanılıyorsa, iki nokta (`:`) ile değiştirilecek.
   - *Örnek:* `US Business Bank Accounts — All US banks require...` ➡️ `US Business Bank Accounts: All US banks require...`
2. **Ek Açıklama / Yan Cümleler (Aside):** Em-dash bir ara söz veya ek açıklama belirtiyorsa, yeni bir cümleye bölünecek (`.`) veya uygunsa parantez içine alınacak.
   - *Örnek:* `A US LLC — which is a disregarded entity — does not...` ➡️ `A US LLC is a disregarded entity. It does not...`
3. **Vurgu (Emphasis):** Em-dash sadece vurgu için kullanılmışsa, virgül (`,`) veya noktalı virgül (`;`) ile değiştirilecek.
   - *Örnek:* `The penalty is severe — $25,000 per year.` ➡️ `The penalty is severe, totaling $25,000 per year.`
4. **Markdown Koruması:** Frontmatter (`---`), tablo formatları (`|---|`) ve kod bloklarındaki tireler KESİNLİKLE değiştirilmeyecek.

## İş Bölümü ve Subagent Atamaları (TODO)

Bu süreç, iş yükünü bölmek ve bağlamı (context) kaybetmemek için 4 ayrı "generalist" subagent görevlendirmesiyle (batch process) paralel olarak yürütülecektir.

### 🔲 Kısım 1: Compliance & Tax Agent
- **Hedef Dosyalar:** `ein/index.mdx`, `itin/index.mdx`, `form-5472/index.mdx`
- **Görev:** Vergi kimlik numaraları ve form içeriklerindeki yasal tanımları bozmadan em-dash temizliği.

### 🔲 Kısım 2: Banking & Verification Agent
- **Hedef Dosyalar:** `mercury/index.mdx`, `kyc/index.mdx`, `fincen/index.mdx`
- **Görev:** Bankacılık, KYC ve FinCEN gibi kurumsal süreçleri anlatan metinlerdeki sembol optimizasyonu.

### 🔲 Kısım 3: Platforms & Payments Agent
- **Hedef Dosyalar:** `paypal/index.mdx`, `stripe/index.mdx`
- **Görev:** Ödeme sistemlerinin gereksinimlerini listeleyen kısımlardaki em-dash'lerin iki nokta (`:`) veya virgüle çevrilmesi.

### 🔲 Kısım 4: LLC Structuring & Core Research Agent
- **Hedef Dosyalar:** `llc/index.mdx`, `registered-agent/index.mdx`, `what-is-llc-formation/index.mdx`, `the-zero-tax-llc-illusion.mdx`
- **Görev:** En uzun ve kavramsal makalelerdeki hikaye anlatımını (storytelling) bozmadan, noktalama ve gramer optimizasyonu.

## Çalışma Akışı (Workflow)
1. Her bir subagent, kendisine atanan dosyaları satır satır okur (`grep_search` ve `read_file` kullanarak).
2. Dosya içerisindeki em-dash (`—`) geçen cümlelerin anlamsal haritasını çıkarır.
3. Yalnızca metin gövdesindeki (body) cümleleri hedefler (Frontmatter'ı atlar).
4. `replace` tool'u veya dosya yeniden yazımı ile dikkatlice günceller.
5. Değiştirilen dosyalar için "Okunabilirlik ve Markdown Bütünlüğü" kontrolü yapar.