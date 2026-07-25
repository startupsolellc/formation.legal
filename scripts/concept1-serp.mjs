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
    "is stripe atlas worth it",
    "stripe atlas vs clerky",
    "stripe atlas alternatives",
    "doola alternatives"
  ];

  console.log("Analyzing SERP for Alternative Intent...\n");

  for (const query of queries) {
      console.log("\n--- Query: " + query + " ---");
      
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
            const organic = items.filter(i => i.type === "organic").slice(0, 4);
            
            organic.forEach((item, idx) => {
                console.log(" " + (idx + 1) + ". " + item.domain + " | " + item.title);
            });
            
            const related = items.find(i => i.type === "related_searches");
            if (related && related.items) {
                console.log("\n Related: " + related.items.slice(0, 3).join(", "));
            }
        }
      } catch (e) {
          console.error(e);
      }
      await new Promise(r => setTimeout(r, 1000));
  }
}

main();
