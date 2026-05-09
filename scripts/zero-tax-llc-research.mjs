// Zero-Tax LLC Myth - SERP & Keyword Research
// Run: node scripts/zero-tax-llc-research.mjs

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

  console.log('🔍 Zero-Tax LLC Myth - SERP & Keyword Research\n');
  console.log('='.repeat(60));

  // Core keywords for this topic
  const serpQueries = [
    'non-us resident llc zero tax',
    'us llc foreign owner no tax',
    'disregarded entity non-resident tax',
    'form 5472 penalty missed deadline',
    'irs effectively connected income eci',
    'non-resident llc tax exemption requirements',
    'us llc tax for non-us citizens',
    'revenue act 1928 section 103 tax exemption',
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
        const organic = items.filter(i => i.type === 'organic').slice(0, 6);

        console.log('\nTop Organic Results:');
        organic.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.title || 'N/A'}`);
          console.log(`     Domain: ${item.domain}`);
          console.log(`     URL: ${item.url}`);
        });

        // AI Overview present?
        const aiOverview = items.find(i => i.type === 'ai_overview');
        if (aiOverview) {
          console.log('  🤖 AI Overview PRESENT');
          if (aiOverview.snippet) {
            console.log(`     Snippet: ${aiOverview.snippet.substring(0, 200)}...`);
          }
        } else {
          console.log('  ⚠️  AI Overview ABSENT - Opportunity');
        }

        // Related searches
        const related = items.find(i => i.type === 'related_searches');
        if (related?.items) {
          console.log('  📌 Related: ' + related.items.slice(0, 5).join(', '));
        }

        // FAQ / PAA
        const faqs = items.filter(i => i.faq && i.faq.length > 0);
        if (faqs.length > 0) {
          console.log('  ❓ PAA questions:');
          faqs.slice(0, 1).forEach(faq => {
            faq.faq.slice(0, 3).forEach((q, idx) => {
              console.log(`     ${idx + 1}. ${q.question}`);
            });
          });
        }
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n\n✅ Zero-Tax LLC Research Complete!');
}

main().catch(console.error);