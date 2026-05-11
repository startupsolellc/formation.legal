import type { StateFeesDataset } from '../types/state-fees';

const DATASET_URL = 'https://raw.githubusercontent.com/startupsolellc/us-llc-fees-dataset/main/states.json';

/**
 * Fetches the open-source US LLC Fees dataset directly from the public GitHub repository.
 * In Astro, if called inside frontmatter, this happens at build time,
 * ensuring fast performance and static generation.
 */
export async function fetchStateFees(): Promise<StateFeesDataset> {
  try {
    const response = await fetch(DATASET_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch state fees dataset: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    // Strip trailing commas before parsing (common error in manual JSON editing)
    const cleanText = text.replace(/,\s*([\]}])/g, '$1');
    const data = JSON.parse(cleanText);
    return data as StateFeesDataset;
  } catch (error) {
    console.error("Error fetching state fees from public repo:", error);
    // Return an empty fallback so the build doesn't crash completely, 
    // or you could choose to throw depending on your error strategy.
    return {
      schema_version: "error",
      last_updated: "error",
      maintained_by: "error",
      license: "error",
      states: {}
    };
  }
}
