// Using global fetch
const username = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
  throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
}

const baseUrl = "https://api.dataforseo.com";

function createAuthenticatedFetch(username, password) {
  return (url, init) => {
    const token = Buffer.from(username + ":" + password).toString("base64");
    return fetch(url, {
      ...init,
      headers: { ...init?.headers, Authorization: "Basic " + token, "Content-Type": "application/json" },
    });
  };
}

async function main() {
  const authFetch = createAuthenticatedFetch(username, password);
  console.log("Searching for specific business name / lookup keywords...");

  const seedKeywords = [
    "llc lookup",
    "business name search",
    "entity lookup",
    "check business name",
    "business search",
    "company lookup",
    "business name availability"
  ];

  const payload = [{
    keywords: seedKeywords,
    location_code: 2840, // US
    language_code: "en",
    include_serp_info: false
  }];

  try {
    const response = await authFetch(baseUrl + "/v3/dataforseo_labs/google/keyword_ideas/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if(data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
       const items = data.tasks[0].result[0].items || [];
       
       console.log("\nTop Keyword Ideas (Filtered & Sorted by Volume):");
       
       items
         .filter(item => {
            const kw = item.keyword.toLowerCase();
            return !kw.includes("mayor") && !kw.includes("defense") && !kw.includes("state"); // filter out state-specific for a moment to find general terms
         })
         .sort((a,b) => (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0))
         .slice(0, 30)
         .forEach(item => {
            const info = item.keyword_info;
            console.log(`- Keyword: "${item.keyword}"`);
            console.log(`  Volume: ${info?.search_volume}, CPC: ${info?.cpc}`);
         });

    } else {
        console.log("No data returned or error", JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
