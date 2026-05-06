// Northwest Business Formation Keyword Research
// Run: node scripts/northwest-keyword-research.mjs

const username = process.env.DATAFORSEO_LOGIN || 'hey@thequill.pub';
const password = process.env.DATAFORSEO_PASSWORD || '3c7c7c2e4a763c55';
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

  console.log('🔍 Northwest Business Formation - Keyword Research\n');
  console.log('='.repeat(60));

  // Core keyword clusters for Northwest formation
  const coreKeywords = [
    // Washington State LLC
    'washington state llc formation',
    'how to form an llc in washington state',
    'washington llc requirements',
    'washington state llc cost',
    'washington llc registration',
    'washington state llc fees',
    // Northwest business formation
    'northwest llc formation',
    'how to start a business in northwest',
    'northwest state business registration',
    'washington state corporation formation',
    // Entity types
    'washington state s corp',
    'washington c corp formation',
    'washington state nonprofit formation',
    'washington llc vs corporation',
    // Registered Agent
    'washington registered agent',
    'washington state registered agent requirements',
    // Filing process
    'washington articles of incorporation',
    'washington state llc operating agreement',
    'washington llc certificate of formation',
    'washington secretary of state filing',
    // Tax and EIN
    'washington llc ein',
    'washington state business license',
    'washington b&O tax llc',
    // Specific use cases
    'amazon seller llc washington',
    'tech startup llc washington',
    'e-commerce llc washington state',
    // Compliance
    'washington llc annual report',
    'washington llc compliance requirements',
    'washington series llc',
    // Northwest regions
    'seattle llc formation',
    'portland llc formation',
    'washington vs oregon llc',
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

      console.log('Keyword                        | Volume  | Difficulty | CPC      |');
      console.log('-'.repeat(75));

      // Sort by volume
      keywords.sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0));

      keywords.forEach(kw => {
        const vol = kw.search_volume ? kw.search_volume.toLocaleString() : 'N/A';
        const diff = kw.difficulty ?? 'N/A';
        const cpc = kw.cpc ? `$${kw.cpc.toFixed(2)}` : 'N/A';
        console.log(`${String(kw.keyword).padEnd(30)} | ${String(vol).padStart(7)} | ${String(diff).padStart(10)} | ${cpc.padStart(8)}`);
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
    'how to form an llc in washington state',
    'washington state llc formation steps',
    'washington registered agent requirements',
    'washington llc operating agreement',
    'washington state business license requirements',
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

  // Step 3: Questions from "People Also Ask"
  console.log('\n\n❓ Questions People Are Asking\n');

  const questionQueries = [
    'how to start an llc in washington state',
    'what is a registered agent in washington',
    'how much does an llc cost in washington state',
    'washington llc annual report due date',
    'do i need a business license in washington state',
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

  console.log('\n\n✅ Northwest Research Complete!');
}

main().catch(console.error);