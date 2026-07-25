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

  const seedKeywords = [
    "llc formation non resident",
    "open us llc foreigner",
    "stripe atlas alternative",
    "start a company in us non resident",
    "how to form an llc for non us citizen",
    "us llc foreign owner"
  ];

  const payload = [{
    keywords: seedKeywords,
    location_code: 2840,
    language_code: "en",
    filters: [
        ["keyword_info.search_volume", ">", 10],
        "and",
        ["keyword_info.competition", "<", 0.8]
    ],
    limit: 100
  }];

  try {
    const response = await authFetch(baseUrl + "/v3/dataforseo_labs/google/keyword_ideas/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if(data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
       const items = data.tasks[0].result[0].items || [];
       console.log("\nBroad Idea Search (Volume > 10, Comp < 0.8):");
       items.forEach(item => {
           const kw = item.keyword;
           if (kw.includes("llc") || kw.includes("company") || kw.includes("us") || kw.includes("stripe")) {
               console.log("- " + kw + " | Vol: " + item.keyword_info.search_volume + " | Comp: " + item.keyword_info.competition);
           }
       });
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
