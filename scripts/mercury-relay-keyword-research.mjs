import { getSerpClient, SerpGoogleOrganicLiveAdvancedRequestInfo } from '../src/lib/dataforseo.ts';
import fs from 'fs';

async function run() {
  const client = await getSerpClient();
  const keywords = [
    "mercury bank non us resident",
    "relay bank non us resident",
    "open mercury account non resident",
    "relay financial llc non resident",
    "mercury vs relay non resident"
  ];

  const tasks = keywords.map(kw => {
    const task = new SerpGoogleOrganicLiveAdvancedRequestInfo();
    task.keyword = kw;
    task.location_code = 2840; // US
    task.language_code = "en";
    return task;
  });

  try {
    const response = await client.googleOrganicLiveAdvanced(tasks);
    
    // Log response to debug
    console.log("Tasks count:", response.tasks?.length);
    
    if(!response.tasks) {
        console.log("No tasks in response", response);
        return;
    }

    const analysis = response.tasks.map(task => {
      if(!task.result || task.result.length === 0) {
        return { keyword: task.data?.keyword, error: "No result array" };
      }
      const data = task.result[0];
      const items = data.items || [];
      const aiOverview = items.find(item => item.type === 'ai_overview');
      const organicItems = items.filter(item => item.type === 'organic');
      
      return {
        keyword: data.keyword,
        aiOverviewPresent: !!aiOverview,
        topCompetitors: organicItems.slice(0, 3).map(i => ({
          domain: i.domain,
          url: i.url,
          title: i.title
        }))
      };
    });

    console.log(JSON.stringify(analysis, null, 2));
    fs.writeFileSync('docs/mercury-relay-serp-analysis.json', JSON.stringify(analysis, null, 2));
    
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
