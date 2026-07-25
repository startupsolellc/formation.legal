// Form 5472 Keyword Research Script
// Run: node scripts/form-5472-keyword-research.mjs

const username = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
  throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
}

const baseUrl = 'https://api.dataforseo.com';

function createAuthenticatedFetch(username, password) {
  return (url, init) => {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = { Authorization: `Basic ${token}` };
    const newInit = {
      ...init,
      headers: {
        ...init?.headers,
        ...authHeader,
      },
    };
    return fetch(url, newInit);
  };
}

async function main() {
  const authFetch = createAuthenticatedFetch(username, password);

  console.log('🔍 Form 5472 Keyword Research\n');
  console.log('='.repeat(60));

  // Core keyword cluster for Form 5472
  const coreKeywords = [
    'form 5472',
    'form 5472 llc',
    'form 5472 foreign owned',
    'form 5472 penalty',
    'form 5472 instructions',
    'form 5472 due date',
    'irs form 5472',
    'form 5472 filing requirements',
    'foreign owned llc form 5472',
    'form 5472 25% foreign ownership',
    'form 5472 single member llc',
    'form 5472 nonresident',
    'form 5472 reportable transaction',
    'form 5472 instructions 2026',
    'form 5472 form 1120',
  ];

  // Step 1: Keywords Data API - get search volume and difficulty
  console.log('\n📊 Search Volume & Difficulty Data\n');

  try {
    const kwPayload = [{
      keywords: coreKeywords,
      location_code: 2840,
      language_code: 'en',
    }];

    const kwResponse = await authFetch(`${baseUrl}/v3/keywords_data/google/searches/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kwPayload),
    });

    const kwData = await kwResponse.json();

    if (kwData.tasks?.[0]?.result?.[0]?.keywords) {
      const keywords = kwData.tasks[0].result[0].keywords;

      console.log('Keyword                  | Volume  | Difficulty | CPC      |');
      console.log('-'.repeat(65));

      keywords.forEach(kw => {
        const vol = kw.search_volume ? kw.search_volume.toLocaleString() : 'N/A';
        const diff = kw.difficulty ?? 'N/A';
        const cpc = kw.cpc ? `$${kw.cpc.toFixed(2)}` : 'N/A';
        console.log(`${String(kw.keyword).padEnd(24)} | ${String(vol).padStart(7)} | ${String(diff).padStart(10)} | ${cpc.padStart(8)}`);
      });
    } else {
      console.log('Keywords API response:', JSON.stringify(kwData).substring(0, 500));
    }
  } catch (err) {
    console.log('Keywords API error:', err.message);
  }

  // Step 2: SERP Analysis for main queries
  console.log('\n\n🔍 SERP Analysis - Top Results for Key Queries\n');

  const serpQueries = [
    'form 5472 foreign owned llc',
    'form 5472 penalty irs',
    'form 5472 nonresident alien',
    'irs form 5472 filing requirements',
  ];

  for (const query of serpQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Query: "${query}"`);
    console.log('='.repeat(60));

    const serpPayload = [{
      keyword: query,
      location_code: 2840,
      language_code: 'en',
    }];

    try {
      const serpResponse = await authFetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serpPayload),
      });

      const data = await serpResponse.json();

      if (data.tasks?.[0]?.result?.[0]?.items) {
        const items = data.tasks[0].result[0].items;
        const organic = items.filter(i => i.type === 'organic').slice(0, 8);

        console.log('\nTop Organic Results:');
        organic.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.title || 'N/A'}`);
          console.log(`     Domain: ${item.domain}`);
          console.log(`     URL: ${item.url}`);
          if (item.description) {
            const desc = item.description.length > 150
              ? item.description.substring(0, 150) + '...'
              : item.description;
            console.log(`     Desc: ${desc}`);
          }
          console.log('');
        });

        // AI Overview present?
        const aiOverview = items.find(i => i.type === 'ai_overview');
        if (aiOverview) {
          console.log('  🤖 AI Overview present in SERP');
        }

        // Related searches
        const related = items.find(i => i.type === 'related_searches');
        if (related?.items) {
          console.log('  📌 Related Searches:');
          related.items.slice(0, 6).forEach(rs => {
            console.log(`     - ${rs}`);
          });
        }
      }
    } catch (err) {
      console.log(`SERP error for "${query}":`, err.message);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 1200));
  }

  // Step 3: Questions from "People Also Ask" and FAQs
  console.log('\n\n❓ Questions People Are Asking\n');

  const questionQueries = [
    'form 5472 what is it',
    'form 5472 who must file',
    'form 5472 penalty how much',
    'foreign owned llc taxes',
  ];

  for (const query of questionQueries) {
    const serpPayload = [{
      keyword: query,
      location_code: 2840,
      language_code: 'en',
    }];

    try {
      const serpResponse = await authFetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serpPayload),
      });

      const data = await serpResponse.json();
      const items = data.tasks?.[0]?.result?.[0]?.items || [];
      const faqs = items.filter(i => i.faq && i.faq.length > 0);
      const related = items.find(i => i.type === 'related_searches');

      if (faqs.length > 0) {
        console.log(`\n"${query}" - FAQs:`);
        faqs.slice(0, 2).forEach(faq => {
          faq.faq.forEach((q, idx) => {
            if (idx < 3) console.log(`  Q: ${q.question}`);
          });
        });
      }

      if (related?.items) {
        console.log(`  Related: ${related.items.slice(0, 4).join(', ')}`);
      }
    } catch (err) {
      // skip
    }

    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\n\n✅ Research Complete!');
}

main().catch(console.error);
