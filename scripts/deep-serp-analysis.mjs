import https from 'node:https';

const username = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
  throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
}

const auth = Buffer.from(`${username}:${password}`).toString('base64');

// Winning keyword - AI Overview YOK!
const keyword = 'ein for foreign llc how to apply';

function postData(keyword, depth = 'advanced') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify([{
      keyword,
      location_code: 2840,
      language_code: 'en',
      depth
    }]);

    const options = {
      hostname: 'api.dataforseo.com',
      path: '/v3/serp/google/organic/live/advanced',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function analyze() {
  console.log('🔥 DEEP SERP ANALYSIS: "EIN for foreign LLC how to apply"\n');
  console.log('=' .repeat(60) + '\n');

  const data = await postData(keyword);
  const result = data.tasks?.[0]?.result?.[0];
  const items = result?.items || [];

  // AI Overview check
  const aiOverview = items.find(i => i.type === 'ai_overview');
  console.log('AI Overview durumu:', aiOverview ? 'VAR ✓' : 'YOK ✗ (Buyuk Firsat!)');

  // Organic results
  const organics = items.filter(i => i.type === 'organic');
  console.log('\n📊 TOP ORGANIC RESULTS:');
  console.log('-'.repeat(50));

  organics.slice(0, 10).forEach((item, i) => {
    console.log(`\n${i + 1}. ${item.domain}`);
    console.log(`   Title: ${item.title}`);
    console.log(`   URL: ${item.url}`);
    if (item.description) {
      const desc = item.description.substring(0, 150);
      console.log(`   Desc: ${desc}...`);
    }
  });

  // Related searches
  const related = items.find(i => i.type === 'related_searches');
  if (related && related.items) {
    console.log('\n\n🔗 RELATED SEARCHES:');
    console.log('-'.repeat(50));
    related.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item}`);
    });
  }

  // People also search
  const pas = items.find(i => i.type === 'people_also_search');
  if (pas && pas.items) {
    console.log('\n\n👥 PEOPLE ALSO SEARCH FOR:');
    console.log('-'.repeat(50));
    pas.items.slice(0, 8).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item}`);
    });
  }

  // FAQ schema check
  const faqResults = organics.filter(o => o.faq && o.faq.length > 0);
  console.log('\n\n❓ FAQ SCHEMA:');
  console.log('-'.repeat(50));
  console.log(`  ${faqResults.length} sayfada FAQ schema var`);

  console.log('\n\n' + '='.repeat(60));
  console.log('STRATEJI ONERISI:');
  console.log('-'.repeat(50));
  console.log(`
  KONTEPT: "EIN Basvurusu Nasil Yapilir - Yabanci Sahipler Icin Adim Adim Rehber"

  HEDEF KEYWORD: "ein for foreign llc how to apply"

  AI CITATION OPTIMIZATION:
  - Direct answer ilk 50 kelimeye koy
  - IRS.gov'a atiffta bulun
  - Form SS-4 detaylarini ekle

  BACKLINK STRATEJISI:
  - formation.legal/payment-access sayfasina link
  - Provider tablosunda Stripe/PayPal'e link

  ICERIK TIPI: Step-by-step guide
  RECABET: Dusuk (IRS.gov disinda kaliteli rakip yok)
  `);
}

analyze().catch(console.error);