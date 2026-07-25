/**
 * DataForSEO SERP Analysis Script
 *
 * Performs comprehensive SERP analysis for:
 * - Navigation/Hub keywords (5)
 * - Question-format keywords for GEO optimization (3)
 *
 * Outputs: organic results, AI Overview status, related questions,
 *          search volume estimates, and competition analysis
 *
 * Run with: node scripts/serp-analysis.mjs
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) {
    const value = valueParts.join('=').trim();
    process.env[key.trim()] = value;
  }
});

const username = process.env.DATAFORSEO_LOGIN;
const password = process.env.DATAFORSEO_PASSWORD;

if (!username || !password) {
  throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env');
}

const baseUrl = process.env.DATAFORSEO_API_URL || 'https://api.dataforseo.com';

function createAuthenticatedFetch(username, password) {
  return (url, init) => {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = { Authorization: `Basic ${token}` };

    const newInit = {
      ...init,
      headers: {
        ...init?.headers,
        ...authHeader,
      },
    };

    return fetch(url, newInit);
  };
}

// Keywords to analyze
const NAVIGATION_KEYWORDS = [
  'non-us founders us llc formation',
  'us business route planner llc',
  'llc cost calculator non resident',
  'best llc service non us founders',
  'us llc for international founders',
];

const QUESTION_KEYWORDS = [
  'what does a us llc actually help non us founders get',
  'will a us llc guarantee payment access',
  'non resident llc payment banking compliance guide',
];

const ALL_KEYWORDS = [...NAVIGATION_KEYWORDS, ...QUESTION_KEYWORDS];

// Location: United States (2840)
const LOCATION_CODE = 2840;
const LANGUAGE_CODE = 'en';

async function fetchSerpData(authFetch, keywords) {
  const url = `${baseUrl}/v3/serp/google/organic/live/advanced`;

  const payload = keywords.map(keyword => ({
    keyword: keyword,
    location_code: LOCATION_CODE,
    language_code: LANGUAGE_CODE,
  }));

  const response = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.json();
}

async function fetchKeywordsData(authFetch, keywords) {
  const url = `${baseUrl}/v3/keywords_data/google/live`;

  const payload = {
    keywords: keywords,
    location_code: LOCATION_CODE,
    language_code: LANGUAGE_CODE,
  };

  const response = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.json();
}

function analyzeSERPResult(result) {
  const items = result.items || [];
  const organicResults = items.filter(i => i.type === 'organic');
  const relatedQuestions = items.filter(i => i.type === 'related_questions' || i.type === 'questions');
  const aiOverview = items.find(i => i.type === 'ai_overview' || i.type === 'ai_overview_panel');

  // Extract top 10 organic results with key metrics
  const topOrganic = organicResults.slice(0, 10).map(item => ({
    rank: item.rank_absolute,
    domain: item.domain,
    title: item.title?.substring(0, 80) || 'No title',
    url: item.url,
    isNiche: item.is_niche || false,
    snippet: item.snippet?.substring(0, 120) || '',
  }));

  // Related questions
  const questions = relatedQuestions
    .flatMap(q => q.items || [])
    .slice(0, 5)
    .map(q => q.question || q.text || '');

  return {
    totalOrganic: organicResults.length,
    topOrganic,
    aiOverviewPresent: !!(aiOverview),
    aiOverviewStatus: aiOverview ? (aiOverview.status || 'present') : 'not_found',
    relatedQuestions: questions.filter(Boolean),
  };
}

function analyzeKeywordsData(data) {
  if (!data.tasks?.[0]?.result?.[0]?.items) {
    return {};
  }

  const items = data.tasks[0].result[0].items;
  const volumeMap = {};

  items.forEach(item => {
    const keyword = item.term;
    volumeMap[keyword] = {
      searchVolume: item.search_volume || 0,
      monthlySearches: item.monthly_searches || [],
      competition: item.competition || 'N/A',
      competitionIndex: item.competition_index || 0,
      cpc: item.cpc || 0,
      searchDifficulty: item.search_difficulty || 0,
    };
  });

  return volumeMap;
}

async function runAnalysis() {
  console.log('='.repeat(80));
  console.log('DATAFORSEO SERP ANALYSIS - formation.legal');
  console.log('='.repeat(80));
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Location: United States (${LOCATION_CODE})`);
  console.log(`Language: English (${LANGUAGE_CODE})`);
  console.log(`\nAnalyzing ${ALL_KEYWORDS.length} keywords...\n`);

  const authFetch = createAuthenticatedFetch(username, password);

  // Part 1: SERP Analysis (organic results, AI overview, related questions)
  console.log('-'.repeat(80));
  console.log('PHASE 1: SERP ORGANIC ANALYSIS');
  console.log('-'.repeat(80));

  const serpResults = {};
  let serpCost = 0;

  // Process in batches of 10 for SERP (API limit consideration)
  for (const keyword of ALL_KEYWORDS) {
    process.stdout.write(`\nSearching: "${keyword}"... `);

    try {
      const data = await fetchSerpData(authFetch, [keyword]);

      if (data.tasks?.[0]?.status_code === 20000 && data.tasks[0]?.result?.[0]) {
        const result = data.tasks[0].result[0];
        serpResults[keyword] = analyzeSERPResult(result);
        serpCost += data.tasks[0].cost || 0;
        console.log(`OK (${serpResults[keyword].totalOrganic} organic results)`);
      } else {
        console.log(`FAILED: ${data.tasks?.[0]?.status_message || 'Unknown error'}`);
        serpResults[keyword] = { error: data.tasks?.[0]?.status_message || 'Unknown error' };
      }
    } catch (error) {
      console.log(`ERROR: ${error.message}`);
      serpResults[keyword] = { error: error.message };
    }
  }

  // Part 2: Keywords Data (search volume, competition)
  console.log('\n' + '-'.repeat(80));
  console.log('PHASE 2: KEYWORDS DATA (Search Volume & Competition)');
  console.log('-'.repeat(80));

  let keywordsData = {};
  let keywordsCost = 0;

  try {
    console.log('\nFetching search volume data for all keywords...');
    const kwdData = await fetchKeywordsData(authFetch, ALL_KEYWORDS);

    if (kwdData.tasks?.[0]?.status_code === 20000) {
      keywordsData = analyzeKeywordsData(kwdData);
      keywordsCost = kwdData.tasks[0].cost || 0;
      console.log(`Retrieved volume data for ${Object.keys(keywordsData).length} keywords`);
    } else {
      console.log(`Keywords API error: ${kwdData.tasks?.[0]?.status_message || 'Unknown'}`);
    }
  } catch (error) {
    console.log(`Keywords API error: ${error.message}`);
  }

  // Generate Report
  console.log('\n' + '='.repeat(80));
  console.log('SERP ANALYSIS REPORT');
  console.log('='.repeat(80));

  // Navigation Keywords Section
  console.log('\n\n## NAVIGATION/HUB KEYWORDS');
  console.log('='.repeat(60));

  for (const keyword of NAVIGATION_KEYWORDS) {
    const serp = serpResults[keyword] || {};
    const vol = keywordsData[keyword] || {};

    console.log(`\n### "${keyword}"`);
    console.log('-'.repeat(60));
    console.log(`Search Volume: ${vol.searchVolume || 'N/A'}`);
    console.log(`Competition Index: ${vol.competitionIndex || 'N/A'} (${vol.competition || 'N/A'})`);
    console.log(`CPC: $${vol.cpc || 'N/A'}`);
    console.log(`\nAI Overview: ${serp.aiOverviewPresent ? 'YES - Present' : 'NO - Not Present'}`);

    console.log(`\nTop 10 Organic Results:`);
    if (serp.topOrganic?.length) {
      serp.topOrganic.forEach((item, i) => {
        console.log(`  ${item.rank}. ${item.domain} ${item.isNiche ? '[NICHE]' : ''}`);
        console.log(`     Title: ${item.title}`);
        console.log(`     Snippet: ${item.snippet}...`);
      });
    } else {
      console.log('  No organic results found');
    }

    if (serp.relatedQuestions?.length) {
      console.log(`\nRelated Questions:`);
      serp.relatedQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q}`);
      });
    }
  }

  // Question Keywords Section
  console.log('\n\n## QUESTION-FORMAT KEYWORDS (GEO Optimization)');
  console.log('='.repeat(60));

  for (const keyword of QUESTION_KEYWORDS) {
    const serp = serpResults[keyword] || {};
    const vol = keywordsData[keyword] || {};

    console.log(`\n### "${keyword}"`);
    console.log('-'.repeat(60));
    console.log(`Search Volume: ${vol.searchVolume || 'N/A'}`);
    console.log(`Competition Index: ${vol.competitionIndex || 'N/A'} (${vol.competition || 'N/A'})`);
    console.log(`CPC: $${vol.cpc || 'N/A'}`);
    console.log(`\nAI Overview: ${serp.aiOverviewPresent ? 'YES - Present' : 'NO - Not Present'}`);

    console.log(`\nTop 10 Organic Results:`);
    if (serp.topOrganic?.length) {
      serp.topOrganic.forEach((item, i) => {
        console.log(`  ${item.rank}. ${item.domain} ${item.isNiche ? '[NICHE]' : ''}`);
        console.log(`     Title: ${item.title}`);
        console.log(`     Snippet: ${item.snippet}...`);
      });
    } else {
      console.log('  No organic results found');
    }

    if (serp.relatedQuestions?.length) {
      console.log(`\nRelated Questions:`);
      serp.relatedQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q}`);
      });
    }
  }

  // AI Overview Analysis
  console.log('\n\n## AI OVERVIEW STATUS SUMMARY');
  console.log('='.repeat(60));
  console.log('\nKeywords with AI Overviews:');
  for (const keyword of ALL_KEYWORDS) {
    const serp = serpResults[keyword] || {};
    if (serp.aiOverviewPresent) {
      console.log(`  [WITH AI OVERVIEW] "${keyword}"`);
    } else {
      console.log(`  [NO AI OVERVIEW] "${keyword}"`);
    }
  }

  // Competition Summary
  console.log('\n\n## COMPETITION ANALYSIS');
  console.log('='.repeat(60));
  console.log('\nKeyword Difficulty & Volume:');
  for (const keyword of ALL_KEYWORDS) {
    const vol = keywordsData[keyword] || {};
    const difficulty = vol.searchDifficulty || 'N/A';
    const difficultyLabel = difficulty === 'N/A' ? 'N/A' :
      difficulty < 30 ? 'Easy' :
      difficulty < 60 ? 'Medium' :
      difficulty < 80 ? 'Hard' : 'Very Hard';

    console.log(`  "${keyword}"`);
    console.log(`    Volume: ${vol.searchVolume || 'N/A'}, Difficulty: ${difficulty} (${difficultyLabel}), CPC: $${vol.cpc || 'N/A'}`);
  }

  // Cost Summary
  console.log('\n\n## API USAGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`SERP API Cost: $${serpCost?.toFixed(4) || '0.00'}`);
  console.log(`Keywords API Cost: $${keywordsCost?.toFixed(4) || '0.00'}`);
  console.log(`Total Cost: $${((serpCost || 0) + (keywordsCost || 0)).toFixed(4)}`);

  // Save results to JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    location: { code: LOCATION_CODE, name: 'United States' },
    language: LANGUAGE_CODE,
    keywords: {
      navigation: NAVIGATION_KEYWORDS,
      questions: QUESTION_KEYWORDS,
    },
    serpResults,
    keywordsData,
    costSummary: {
      serp: serpCost,
      keywords: keywordsCost,
      total: (serpCost || 0) + (keywordsCost || 0),
    },
  };

  const outputPath = path.join(process.cwd(), 'serp-analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
  console.log(`\n\nFull results saved to: ${outputPath}`);

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(80));
}

runAnalysis().catch(console.error);