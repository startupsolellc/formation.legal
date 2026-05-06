// Content Gap Keyword Research
// Run: node scripts/content-gap-research.mjs

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

  console.log('🔍 Content Gap Analysis - Non-US Founders Payment & Compliance\n');
  console.log('='.repeat(60));

  // Research questions based on Formation.Legal's core decision engine thesis
  const researchQueries = [
    // Banking & Mercury (not covered in existing content)
    'how to open mercury bank account non-us founder llc',
    'mercury bank account non-us founder requirements',
    'relay bank account non-us founder llc',
    'us bank account non-us founder without ssn',
    'mercury registered agent address bank account',

    // EIN & Tax Compliance (partial coverage: BOI, Form 5472)
    'non-us founder ein application llc',
    'how to get ein without ssn foreign llc',
    'irs form 5472 penalty how much',
    'irs boi reporting deadline non-us founder',
    'fincen boi report foreign owned llc',

    // Address & KYC (partial coverage)
    'virtual mailbox vs registered agent for llc',
    'can i use my home address for llc bank account',
    'us llc address requirements for bank account',

    // Formation vs Operational Reality
    'formation llc vs actual bank account access',
    'us llc formed but bank account denied',
    'why banks reject non-us founder llc applications',

    // Stripe Specific (detailed coverage exists)
    'stripe non-us founder address verification',
    'stripe atlas vs direct llc formation',

    // PayPal Specific (detailed coverage exists)
    'paypal non-us founder business account requirements',

    // General Decision Questions
    'non-us founder best us bank account option',
    'us entity for non-resident payment processing',
    'best us business entity for non-us founder',
    'foreign llc us bank account access',
    'non-us founder stripe paypal alternative',
  ];

  console.log('\n🔍 SERP Analysis - Content Gap Research\n');

  const serpQueries = [
    'how to open mercury bank account non-us founder llc',
    'relay bank account non-us founder llc requirements',
    'us bank account non-us founder without ssn ein',
    'non-us founder ein application llc process',
    'irs form 5472 penalty foreign owned llc',
    'fincen boi report deadline non-us founder',
    'virtual mailbox vs registered agent llc bank',
    'why banks reject non-us founder llc',
    'non-us founder best us bank account option 2026',
    'stripe atlas vs direct llc formation non-us',
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
        const organic = items.filter(i => i.type === 'organic').slice(0, 5);

        console.log('\nTop Organic Results:');
        organic.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.title || 'N/A'}`);
          console.log(`     Domain: ${item.domain}`);
        });

        // AI Overview present?
        const aiOverview = items.find(i => i.type === 'ai_overview');
        if (aiOverview) {
          console.log('  🤖 AI Overview PRESENT - High opportunity for GEO');
        }

        // Related searches
        const related = items.find(i => i.type === 'related_searches');
        if (related?.items) {
          console.log('  📌 Related: ' + related.items.slice(0, 4).join(', '));
        }

        // People Also Ask
        const faqs = items.filter(i => i.faq && i.faq.length > 0);
        if (faqs.length > 0) {
          console.log('  ❓ PAA questions:');
          faqs.slice(0, 1).forEach(faq => {
            faq.faq.slice(0, 2).forEach((q, idx) => {
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

  console.log('\n\n✅ Content Gap Research Complete!');
  console.log('\n📋 EXISTING CONTENT ANALYSIS:');
  console.log('  ✅ us-llc-for-stripe.mdx - Detailed');
  console.log('  ✅ us-llc-for-paypal.mdx - Detailed');
  console.log('  ✅ payment-stack-for-non-us-founders.mdx - Detailed');
  console.log('  ✅ formation-does-not-equal-payment-approval.mdx - Detailed');
  console.log('  ⚠️  registered-agent-address-vs-business-address.mdx - Partial');
  console.log('  ⚠️  form-5472-foreign-owned-llc.mdx - Partial');
  console.log('  ⚠️  boi-reporting-us-llc-2026.mdx - Partial');
  console.log('\n🚨 IDENTIFIED CONTENT GAPS:');
  console.log('  🚨 Mercury/Relay banking for non-US founders');
  console.log('  🚨 EIN application process for foreign LLCs');
  console.log('  🚨 Form 5472 penalty amounts and deadlines');
  console.log('  🚨 Virtual mailbox vs registered agent for banking');
  console.log('  🚨 Why banks reject non-US founder LLCs');
  console.log('  🚨 Stripe Atlas vs self-formation comparison');
}

main().catch(console.error);