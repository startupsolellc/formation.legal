// Address/Banking Guide SERP Analysis
// Run: node scripts/address-banking-serp-analysis.mjs

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

async function analyzeKeyword(authFetch, keyword) {
  const serpPayload = [{
    keyword: keyword,
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

    // Organic results
    const organic = items.filter(i => i.type === 'organic').slice(0, 10);

    // AI Overview check
    const aiOverview = items.find(i => i.type === 'ai_overview');

    // Related searches
    const relatedSearches = items.find(i => i.type === 'related_searches');

    // FAQ items
    const faqs = items.filter(i => i.faq && i.faq.length > 0);

    // Competition level assessment based on result diversity and domain authority signals
    const domains = organic.map(i => i.domain);
    const uniqueDomains = new Set(domains);
    const hasWikiHow = domains.some(d => d.includes('wikihow'));
    const hasGov = domains.some(d => d.includes('.gov'));
    const hasBigSite = domains.some(d =>
      d.includes('legalzoom') ||
      d.includes('incfile') ||
      d.includes('hellobloom') ||
      d.includes('stripe') ||
      d.includes('nwdb')
    );

    let competitionLevel = 'Medium';
    if (hasWikiHow || hasGov) competitionLevel = 'Low';
    else if (hasBigSite && uniqueDomains.size < 5) competitionLevel = 'High';
    else if (uniqueDomains.size < 3) competitionLevel = 'High';

    // Top 3 competitors
    const topCompetitors = organic.slice(0, 3).map((item, idx) => ({
      rank: idx + 1,
      title: item.title || 'N/A',
      domain: item.domain,
      url: item.url
    }));

    return {
      keyword,
      organicResults: organic.length,
      topCompetitors,
      aiOverviewPresent: !!aiOverview,
      aiOverviewSnippet: aiOverview?.description || null,
      relatedQuestions: relatedSearches?.items?.slice(0, 5) || [],
      faqs: faqs.flatMap(f => f.faq?.map(q => q.question) || []).slice(0, 3),
      competitionLevel,
      domainsAnalyzed: uniqueDomains.size
    };
  } catch (err) {
    return {
      keyword,
      error: err.message
    };
  }
}

async function main() {
  const authFetch = createAuthenticatedFetch(username, password);

  console.log('\n📊 Address/Banking Guide - SERP Analysis\n');
  console.log('='.repeat(80));

  const keywords = [
    'can i use registered agent address for stripe',
    'registered agent address vs business address',
    'us bank account non resident llc requirements',
    'registered agent address ein irs',
    'non us founder stripe address requirements'
  ];

  const results = [];

  for (const keyword of keywords) {
    console.log(`\n🔍 Analyzing: "${keyword}"...`);
    const result = await analyzeKeyword(authFetch, keyword);
    results.push(result);

    // Respect rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  // Output Summary Table
  console.log('\n\n');
  console.log('═'.repeat(80));
  console.log('📋 SERP ANALYSIS SUMMARY TABLE');
  console.log('═'.repeat(80));

  for (const r of results) {
    if (r.error) {
      console.log(`\n❌ ${r.keyword}: Error - ${r.error}`);
      continue;
    }

    const top3Str = r.topCompetitors
      .map(c => `${c.rank}. ${c.domain}`)
      .join(' | ');

    const aiStatus = r.aiOverviewPresent ? 'YES' : 'NO';

    // Opportunity assessment
    let opportunity = 'MODERATE';
    if (r.aiOverviewPresent && r.competitionLevel === 'Low') {
      opportunity = 'HIGH - AI Overview + Low Competition';
    } else if (!r.aiOverviewPresent && r.competitionLevel !== 'High') {
      opportunity = 'HIGH - No AI Overview';
    } else if (r.competitionLevel === 'High') {
      opportunity = 'MEDIUM - High competition';
    }

    console.log(`\n Keyword: ${r.keyword}`);
    console.log(` Top 3 Competitors: ${top3Str}`);
    console.log(` AI Overview Status: ${aiStatus}`);
    console.log(` Opportunity: ${opportunity}`);
    console.log(` Competition Level: ${r.competitionLevel}`);
    console.log('-'.repeat(80));
  }

  // Detailed Results
  console.log('\n\n');
  console.log('═'.repeat(80));
  console.log('📄 DETAILED RESULTS BY KEYWORD');
  console.log('═'.repeat(80));

  for (const r of results) {
    if (r.error) continue;

    console.log(`\n\n${'═'.repeat(80)}`);
    console.log(`KEYWORD: "${r.keyword}"`);
    console.log(`${'═'.repeat(80)}`);

    console.log(`\n🤖 AI Overview: ${r.aiOverviewPresent ? 'Present' : 'Not Present'}`);
    if (r.aiOverviewSnippet) {
      const snippet = r.aiOverviewSnippet.length > 200
        ? r.aiOverviewSnippet.substring(0, 200) + '...'
        : r.aiOverviewSnippet;
      console.log(`   Snippet: ${snippet}`);
    }

    console.log('\n📌 Top 10 Organic Results:');
    r.topCompetitors.forEach((c, idx) => {
      console.log(`   ${idx + 1}. ${c.title}`);
      console.log(`      URL: ${c.url}`);
    });

    if (r.relatedQuestions.length > 0) {
      console.log('\n❓ Related Questions:');
      r.relatedQuestions.forEach(q => console.log(`   - ${q}`));
    }

    if (r.faqs.length > 0) {
      console.log('\n💡 FAQ Results:');
      r.faqs.forEach(q => console.log(`   - ${q}`));
    }

    console.log(`\n📊 Competition: ${r.competitionLevel} (${r.domainsAnalyzed} unique domains)`);
  }

  console.log('\n\n✅ Address/Banking SERP Analysis Complete!\n');
}

main().catch(console.error);