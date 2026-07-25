import https from 'node:https';

const username = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
  throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
}

const auth = Buffer.from(`${username}:${password}`).toString('base64');

const keywords = [
  'stripe for non-us llc 2026',
  'paypal business account non resident llc',
  'form 5472 llc non-resident penalty',
  'ein for foreign llc how to apply',
  'delaware llc vs wyoming llc non-resident banking'
];

function postData(keyword) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify([{
      keyword,
      location_code: 2840,
      language_code: 'en'
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
          resolve({ keyword, data: json });
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

async function runAll() {
  console.log('Starting SERP analysis for backlink content...\n');

  const results = await Promise.all(keywords.map(k => postData(k)));

  console.log('\n========== SERP ANALYZER RESULTS ==========\n');

  for (const { keyword, data } of results) {
    const result = data.tasks?.[0]?.result?.[0];
    const items = result?.items || [];
    const aiOverview = items.find(i => i.type === 'ai_overview');
    const organics = items.filter(i => i.type === 'organic').slice(0, 5);

    console.log(`\n=== ${keyword.toUpperCase()} ===`);
    console.log('AI Overview:', aiOverview ? 'VAR ✓' : 'YOK ✗ (FIRSAT!)');
    console.log('Top 5 domains:', organics.map(o => o.domain).join(', '));
  }

  console.log('\n===========================================');
}

runAll().catch(console.error);