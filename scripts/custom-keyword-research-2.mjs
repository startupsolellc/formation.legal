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
  console.log("Searching for targeted LLC formation keywords...");

  // Since 'keyword_ideas' brings broad related terms, let's try 'search_volume' for specific long-tail queries
  const targetedKeywords = [
    "northwest registered agent step by step",
    "how to form an llc with northwest registered agent",
    "bizee vs northwest registered agent non resident",
    "how to use a registered agent for llc formation",
    "us llc formation guide for foreigners",
    "form a us llc online non resident",
    "llc formation process screenshots",
    "llc registration form instructions",
    "how to fill out articles of organization non resident",
    "northwest registered agent non us citizen",
    "bizee llc formation non resident",
    "stripe atlas alternative non resident",
    "doola alternative non resident",
    "how to set up an llc anonymously online"
  ];

  const payload = targetedKeywords.map(kw => ({
    keyword: kw,
    location_code: 2840,
    language_code: "en"
  }));

  try {
    const response = await authFetch(baseUrl + "/v3/dataforseo_labs/google/search_volume/live", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if(data.tasks && data.tasks.length > 0) {
       console.log("\nSpecific Keyword Metrics:");
       data.tasks.forEach((task, idx) => {
          if (task.result && task.result[0] && task.result[0].items && task.result[0].items.length > 0) {
              const info = task.result[0].items[0];
              console.log(`- Keyword: "${targetedKeywords[idx]}"`);
              console.log(`  Volume: ${info.search_volume}, Competition: ${info.competition_level} (${info.competition})`);
          } else {
              console.log(`- Keyword: "${targetedKeywords[idx]}" (No data)`);
          }
       });
    } else {
        console.log("No data returned or error");
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

main();
