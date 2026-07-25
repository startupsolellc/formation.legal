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
  console.log("Running deep dive keyword volume analysis for meta optimization...");

  const seedKeywords = [
    "texas business entity search",
    "texas secretary of state business search",
    "texas entity search",
    "texas business search",
    "texas llc search",
    "texas secretary of state",
    "sos tx business search",
    "florida business entity search",
    "florida secretary of state business search",
    "florida business search",
    "sunbiz search",
    "florida llc search",
    "california business search",
    "california business entity search",
    "california secretary of state business search",
    "delaware business entity search",
    "delaware entity search"
  ];

  const payload = [{
    keywords: seedKeywords,
    location_code: 2840, // US
    language_code: "en",
    include_serp_info: false
  }];

  try {
    const response = await authFetch(baseUrl + "/v3/keywords_data/google_ads/search_volume/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if(data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
       const items = data.tasks[0].result;
       
       console.log("\nExact Search Volumes for Pattern Analysis:");
       
       items
         .sort((a,b) => (b.search_volume || 0) - (a.search_volume || 0))
         .forEach(item => {
            console.log(`- Keyword: "${item.keyword}" -> Volume: ${item.search_volume}`);
         });

    } else {
        console.log("No data returned or error", JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
