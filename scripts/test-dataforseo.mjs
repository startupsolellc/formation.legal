// Simple test script for DataForSEO connection
// Run with: node scripts/test-dataforseo.mjs

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

async function testConnection() {
  console.log('🔍 Testing DataForSEO connection...\n');
  console.log(`📧 Username: ${username}`);
  console.log(`🔗 Base URL: ${baseUrl}\n`);

  try {
    const authFetch = createAuthenticatedFetch(username, password);

    // Test with SERP organic live advanced endpoint
    const testUrl = `${baseUrl}/v3/serp/google/organic/live/advanced`;

    // IMPORTANT: keyword is a SINGLE STRING, not an array!
    const payload = [{
      keyword: 'llc formation non-resident',
      location_code: 2840, // United States
      language_code: 'en',
    }];

    console.log('📤 Sending test request to:', testUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await authFetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('\n📥 Response Status:', response.status);
    console.log('📥 Response:', JSON.stringify(data, null, 2));

    if (data.status_code === 20000 && data.tasks && data.tasks[0].result) {
      const result = data.tasks[0].result[0];
      const organicResults = result.items.filter(i => i.type === 'organic');
      const topDomains = organicResults.slice(0, 5).map(i => i.domain);

      console.log('\n✅ DataForSEO connection SUCCESSFUL!');
      console.log(`📊 Found ${organicResults.length} organic results`);
      console.log(`🏆 Top 5 domains:`, topDomains.join(', '));
      console.log(`💰 Cost: $${data.tasks[0].cost}`);

      return { success: true, data, organicResults: organicResults.length, topDomains };
    } else if (data.tasks?.[0]?.status_message) {
      console.log('\n❌ API Error:', data.tasks[0].status_message);
      return { success: false, error: data.tasks[0].status_message };
    }

    console.log('\n❌ DataForSEO connection FAILED');
    return { success: false, status: response.status, error: data };
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    return { success: false, error: error.message };
  }
}

testConnection().then(result => {
  console.log('\n--- Test Complete ---');
  process.exit(result.success ? 0 : 1);
});