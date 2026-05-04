/**
 * SERP Analysis Script for Payment Access Keywords
 *
 * Usage: npx tsx src/lib/serp-analysis.ts
 *
 * Requires .env with DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD
 */

import * as dataforseo from 'dataforseo-client';
import type { SerpApi } from 'dataforseo-client';

// Payment Access pillar keywords
const KEYWORDS = [
  'can a non-us founder get stripe with us llc',
  'us llc for paypal non resident requirements',
  'formation does not equal payment approval',
  'payment stack for non-us founders alternatives',
  'stripe non supported country us llc',
];

// Request info constructor
const GoogleOrganicRequestInfo = dataforseo.SerpGoogleOrganicLiveAdvancedRequestInfo;

interface OrganicResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

interface SerpResult {
  keyword: string;
  organicResults: OrganicResult[];
  aiOverviewPresent: boolean;
  relatedQuestions: string[];
  competitionLevel: string;
  topDomains: string[];
}

async function getSerpClient(): Promise<SerpApi> {
  const username = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  const baseUrl = process.env.DATAFORSEO_API_URL || 'https://api.dataforseo.com';

  if (!username || !password) {
    throw new Error('DataForSEO credentials not found. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env file.');
  }

  const token = Buffer.from(`${username}:${password}`).toString('base64');
  const authFetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    return fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Basic ${token}`,
      },
    });
  };

  return new dataforseo.SerpApi(baseUrl, { fetch: authFetch });
}

async function analyzeKeyword(client: SerpApi, keyword: string): Promise<SerpResult> {
  console.log(`\n--- Analyzing: "${keyword}" ---`);

  const task = new GoogleOrganicRequestInfo();
  task.keyword = keyword;
  task.location_code = 2840; // United States
  task.language_code = 'en';

  const response = await client.googleOrganicLiveAdvanced([task]);

  if (!response.tasks?.[0]?.result) {
    throw new Error(`No result for keyword: ${keyword}. Status: ${response.tasks?.[0]?.status_message}`);
  }

  const result = (response.tasks[0].result as any)[0];

  // Extract organic results
  const organicResults: OrganicResult[] = (result.items || [])
    .filter((item: any) => item.type === 'organic')
    .slice(0, 10)
    .map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || '',
      domain: item.domain || '',
    }));

  // Check for AI Overview (aiolite or ai_overview)
  const hasAiOverview = (result.items || []).some(
    (item: any) => item.type === 'aiolite' || item.type === 'ai_overview'
  );

  // Extract related questions from "people also ask" or similar
  const relatedQuestions: string[] = (result.items || [])
    .filter((item: any) => item.type === 'people_also_ask' || item.type === 'related_questions')
    .slice(0, 5)
    .map((item: any) => item.title || item.question || '');

  // Competition level estimate based on result count and keyword difficulty
  const competitionLevel = result.keyword_difficulty !== undefined
    ? result.keyword_difficulty > 70 ? 'High' : result.keyword_difficulty > 40 ? 'Medium' : 'Low'
    : organicResults.length > 5 ? 'Medium' : 'Unknown';

  const topDomains = organicResults.slice(0, 3).map(r => r.domain);

  console.log(`  Found ${organicResults.length} organic results`);
  console.log(`  AI Overview: ${hasAiOverview ? 'YES' : 'No'}`);
  console.log(`  Top 3 domains: ${topDomains.join(', ')}`);

  return {
    keyword,
    organicResults,
    aiOverviewPresent: hasAiOverview,
    relatedQuestions,
    competitionLevel,
    topDomains,
  };
}

async function main() {
  console.log('='.repeat(80));
  console.log('SERP Analysis for Payment Access Keywords');
  console.log('='.repeat(80));

  const client = await getSerpClient();

  const results: SerpResult[] = [];

  for (const keyword of KEYWORDS) {
    try {
      const result = await analyzeKeyword(client, keyword);
      results.push(result);
    } catch (error) {
      console.error(`  ERROR: ${error}`);
      results.push({
        keyword,
        organicResults: [],
        aiOverviewPresent: false,
        relatedQuestions: [],
        competitionLevel: 'Error',
        topDomains: [],
      });
    }
  }

  // Print summary table
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('SUMMARY TABLE');
  console.log('='.repeat(80));

  console.log('\n{Keyword}|{Top 3 Competitors}|{AI Overview Status}|{Competition Level}');
  console.log('-'.repeat(120));

  for (const r of results) {
    const top3 = r.topDomains.length > 0 ? r.topDomains.join(', ') : 'N/A';
    const aiStatus = r.aiOverviewPresent ? 'Present' : 'None';
    console.log(`"${r.keyword}"|${top3}|${aiStatus}|${r.competitionLevel}`);
  }

  // Print detailed results for each keyword
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('DETAILED RESULTS');
  console.log('='.repeat(80));

  for (const r of results) {
    console.log(`\n\n>>> KEYWORD: "${r.keyword}"`);
    console.log('-'.repeat(60));
    console.log(`AI Overview: ${r.aiOverviewPresent ? 'PRESENT' : 'Not present'}`);
    console.log(`Competition Level: ${r.competitionLevel}`);
    console.log(`Related Questions (${r.relatedQuestions.length}):`);

    r.relatedQuestions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q}`);
    });

    console.log(`\nTop 10 Organic Results:`);
    r.organicResults.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.title}`);
      console.log(`     URL: ${result.url}`);
      console.log(`     Snippet: ${result.snippet.substring(0, 150)}...`);
    });
  }

  // Return raw data for programmatic use
  return results;
}

main()
  .then((results) => {
    console.log('\n\n--- RAW JSON OUTPUT ---');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });