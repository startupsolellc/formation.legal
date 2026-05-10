// Using global fetch
const username = process.env.DATAFORSEO_LOGIN || "hey@thequill.pub";
const password = process.env.DATAFORSEO_PASSWORD || "3c7c7c2e4a763c55";
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
  console.log("Searching for low-competition LLC formation keywords...");

  const seedKeywords = [
    "how to use northwest registered agent",
    "bizee llc formation guide",
    "step by step llc formation non resident",
    "form llc online for foreigners",
    "northwest registered agent non resident",
    "llc formation process for non us citizens",
    "registered agent vs stripe atlas"
  ];

  const payload = [{
    keywords: seedKeywords,
    location_code: 2840,
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
       
       console.log("\nTop Keyword Ideas (Filtering for lower competition):");
       
       items
         .filter(item => {
             const comp = item.keyword_info?.competition_level;
             return comp === "LOW" || comp === "MEDIUM";
         })
         .sort((a,b) => (b.keyword_info?.search_volume || 0) - (a.keyword_info?.search_volume || 0))
         .slice(0, 20)
         .forEach(item => {
            const info = item.keyword_info;
            console.log("- Keyword: " + item.keyword);
            console.log("  Volume: " + info?.search_volume + ", Competition: " + info?.competition_level + " (" + info?.competition + "), CPC: " + info?.cpc);
         });

    } else {
        console.log("No data returned or error");
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
