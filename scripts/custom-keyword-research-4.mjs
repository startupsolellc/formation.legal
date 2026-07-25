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
    keyword: "llc non resident",
    location_code: 2840,
    language_code: "en",
    filters: [
      ["keyword_info.search_volume", ">", 10]
    ],
    order_by: ["keyword_info.search_volume,desc"],
    limit: 100
  }];

  try {
    const response = await authFetch(baseUrl + "/v3/dataforseo_labs/google/related_keywords/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if(data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
       const items = data.tasks[0].result[0].items || [];
       console.log("\nRelated Keywords for 'llc non resident':");
       items.forEach(item => {
           const kw = item.keyword_data.keyword;
           const info = item.keyword_data.keyword_info;
           console.log("- " + kw + " | Vol: " + info.search_volume + " | Comp: " + info.competition);
       });
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
