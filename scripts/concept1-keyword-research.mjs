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
  
  console.log("Phase 1: Analyzing Search Volume & Competition for Core Terms\n");

  const seedKeywords = [
    "stripe atlas alternative",
    "stripe atlas alternatives",
    "doola alternative",
    "stripe atlas vs northwest registered agent",
    "stripe atlas vs incfile",
    "stripe atlas vs bizee",
    "is stripe atlas worth it",
    "stripe atlas vs clerky",
    "cheapest way to form llc non resident",
    "doola vs stripe atlas"
  ];

  const payload = [{
    keywords: seedKeywords,
    location_code: 2840,
    language_code: "en"
  }];

  try {
    const response = await authFetch(baseUrl + "/v3/dataforseo_labs/google/search_volume/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.tasks && data.tasks[0]?.result?.[0]?.items) {
       const items = data.tasks[0].result[0].items;
       console.log("Core Keyword Metrics (Sorted by Volume):");
       items
         .sort((a,b) => (b.search_volume || 0) - (a.search_volume || 0))
         .forEach(item => {
           console.log('- "' + item.keyword + '": Volume: ' + (item.search_volume || 0) + ', Comp: ' + item.competition_level + ' (' + item.competition + ')');
       });
    }

    console.log("\n\nPhase 2: Finding Related Intent Keywords");
    
    const ideasPayload = [{
      keywords: ["stripe atlas alternative", "doola alternative", "cheap llc non resident"],
      location_code: 2840,
      language_code: "en",
      filters: [
          ["keyword_info.search_volume", ">", 10]
      ],
      limit: 100
    }];

    const ideasResponse = await authFetch(baseUrl + "/v3/dataforseo_labs/google/keyword_ideas/live", {
      method: "POST",
      body: JSON.stringify(ideasPayload)
    });

    const ideasData = await ideasResponse.json();
    
    if (ideasData.tasks && ideasData.tasks[0]?.result?.[0]?.items) {
       console.log("\nLong-tail Opportunities (Related to Alternatives):");
       const ideas = ideasData.tasks[0].result[0].items;
       ideas.forEach(item => {
           const kw = item.keyword;
           if (kw.includes("atlas") || kw.includes("doola") || kw.includes("vs") || kw.includes("alternative") || kw.includes("cheap")) {
               console.log('- "' + kw + '" | Vol: ' + item.keyword_info.search_volume + ' | Comp: ' + item.keyword_info.competition);
           }
       });
    }

  } catch(e) {
    console.error("Error:", e);
  }
}

main();
