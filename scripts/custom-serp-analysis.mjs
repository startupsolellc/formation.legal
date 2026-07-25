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

  const queries = [
    "northwest registered agent non resident llc step by step",
    "bizee vs stripe atlas non resident",
    "form foreign owned us llc without itin online",
    "how to set up wyoming llc for non us citizen online"
  ];

  console.log("Analyzing SERP Intent for Low-Competition Angles...\n");

  for (const query of queries) {
      console.log("\n===========================================");
      console.log("Query: " + query);
      console.log("===========================================");
      
      const payload = [{
        keyword: query,
        location_code: 2840,
        language_code: "en"
      }];

      try {
        const response = await authFetch(baseUrl + "/v3/serp/google/organic/live/advanced", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.tasks && data.tasks[0]?.result?.[0]?.items) {
            const items = data.tasks[0].result[0].items;
            const organic = items.filter(i => i.type === "organic").slice(0, 5);
            
            const aiOverview = items.find(i => i.type === "ai_overview");
            console.log("AI Overview: " + (aiOverview ? "YES" : "NO"));
            
            console.log("\nTop 5 Results:");
            organic.forEach((item, idx) => {
                console.log(" " + (idx + 1) + ". Domain: " + item.domain);
                console.log("    Title: " + item.title);
            });
            
            const related = items.find(i => i.type === "related_searches");
            if (related && related.items) {
                console.log("\nRelated Searches:");
                related.items.slice(0, 3).forEach(r => console.log(" - " + r));
            }
        }
      } catch (e) {
          console.error(e);
      }
      
      await new Promise(r => setTimeout(r, 1000));
  }
}

main();
