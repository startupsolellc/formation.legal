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

  const payload = [{
    keywords: ["open llc for non us citizen", "llc formation for foreigners online", "best registered agent for foreigners", "how to use northwest registered agent non resident", "bizee llc formation steps", "can foreigner open llc online", "stripe atlas non resident alternative", "us business registration for non residents"],
    location_code: 2840,
    language_code: "en",
  }];

  try {
    const response = await authFetch(baseUrl + "/v3/dataforseo_labs/google/keyword_ideas/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if(data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
       const items = data.tasks[0].result[0].items || [];
       console.log("\nHighly Specific Keyword Ideas:");
       items.forEach(item => {
           const kw = item.keyword;
           if ((kw.includes("non us") || kw.includes("foreigner") || kw.includes("non resident")) && (kw.includes("llc") || kw.includes("open") || kw.includes("form") || kw.includes("start"))) {
               console.log("- " + kw + " | Vol: " + item.keyword_info.search_volume + " | Comp: " + item.keyword_info.competition);
           }
       });
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
