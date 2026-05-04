/**
 * SERP Analysis Script for Compliance Keywords
 * Run with: npx tsx scripts/serp-analysis.ts
 */

import { getSerpClient } from '../src/lib/dataforseo.js';

const KEYWORDS = [
  'form 5472 foreign owned llc nonresident',
  'boi reporting 2026 non us founders',
  'form 5472 penalty irs',
  'boi reporting still required 2026',
  'pro forma 1120 nonresident llc',
];

interface OrganicResult {
  title: string;
  url: string;
  domain: string;
  position: number;
}

interface SerpData {
  keyword: string;
  organicResults: OrganicResult[];
  aiOverviewPresent: boolean;
  aiOverviewDomains: string[];
  relatedQuestions: { question: string; position: number }[];
  topDomains: string[];
  governmentDominated: boolean;
  competitionLevel: 'Low' | 'Medium' | 'High';
  opportunity: 'High' | 'Medium' | 'Low';
  aiOverviewSnippet?: string;
}

async function analyzeKeyword(keyword: string): Promise<SerpData> {
  const api = await getSerpClient();

  const task = new (await import('dataforseo-client')).SerpGoogleOrganicLiveAdvancedRequestInfo();
  task.keyword = keyword;
  task.location_code = 2840; // United States
  task.language_code = 'en';
  task.include_alextra_data = ['ai_overview'];
  task.include_ai_overview = true;

  const response = await api.googleOrganicLiveAdvanced([task]);

  if (!response.tasks?.[0]?.result?.[0]) {
    throw new Error(`No results for keyword: ${keyword}`);
  }

  const result = response.tasks[0].result[0] as any;
  const items = result.items || [];

  // Extract organic results
  const organicResults: OrganicResult[] = items
    .filter((item: any) => item.type === 'organic')
    .slice(0, 10)
    .map((item: any, idx: number) => ({
      title: item.title || '',
      url: item.url || '',
      domain: item.domain || '',
      position: idx + 1,
    }));

  // Check for AI Overview
  const aiOverviewItem = items.find((item: any) => item.type === 'ai_overview');
  const aiOverviewPresent = !!aiOverviewItem;

  // Get AI overview domains and snippet from sub-items
  const aiOverviewDomains: string[] = [];
  let aiOverviewSnippet = '';

  if (aiOverviewItem?.items && Array.isArray(aiOverviewItem.items)) {
    aiOverviewItem.items.slice(0, 5).forEach((i: any) => {
      if (i.domain) aiOverviewDomains.push(i.domain);
      if (i.description && !aiOverviewSnippet) aiOverviewSnippet = i.description.substring(0, 200);
    });
  }

  // Check for People Also Ask / Related Questions
  const relatedQuestions: { question: string; position: number }[] = [];
  const paaItems = items.filter((item: any) => item.type === 'people_also_ask');
  paaItems.slice(0, 5).forEach((item: any, idx: number) => {
    if (item.question) {
      relatedQuestions.push({ question: item.question, position: idx + 1 });
    }
  });

  // Analyze top domains
  const topDomains = organicResults.slice(0, 5).map((r) => r.domain);
  const governmentDomains = ['irs.gov', 'ssa.gov', 'state.gov', 'usda.gov', 'ftc.gov', 'sec.gov', 'treasury.gov', 'fincen.gov', 'gov'];
  const governmentDominated = topDomains.filter((d) => governmentDomains.some((gd) => d.includes(gd))).length >= 3;

  // Calculate competition based on government domination and existing content
  let competitionLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  if (governmentDominated && topDomains.filter((d) => !governmentDomains.some((gd) => d.includes(gd))).length <= 1) {
    competitionLevel = 'High';
  } else if (!governmentDominated && topDomains.some((d) => d.includes('wikipedia') || d.includes('forbes') || d.includes('legalzoom') || d.includes('incfile'))) {
    competitionLevel = 'Medium';
  } else {
    competitionLevel = 'Low';
  }

  // Opportunity: AI overview gaps + government domination = opportunity
  let opportunity: 'High' | 'Medium' | 'Low' = 'Medium';
  if (!aiOverviewPresent && governmentDominated) {
    opportunity = 'High';
  } else if (aiOverviewPresent && governmentDominated) {
    opportunity = 'High'; // Can still compete in AI overview
  } else if (!aiOverviewPresent) {
    opportunity = 'Medium';
  } else {
    opportunity = 'Low';
  }

  return {
    keyword,
    organicResults,
    aiOverviewPresent,
    aiOverviewDomains,
    relatedQuestions,
    topDomains,
    governmentDominated,
    competitionLevel,
    opportunity,
    aiOverviewSnippet,
  };
}

async function main() {
  console.log('=== SERP Analysis for Compliance Keywords ===\n');
  console.log('Using DataForSEO API - analyzing 5 compliance keywords...\n');

  const results: SerpData[] = [];

  for (const keyword of KEYWORDS) {
    try {
      console.log(`Analyzing: "${keyword}"...`);
      const data = await analyzeKeyword(keyword);
      results.push(data);
      console.log(`  - Found ${data.organicResults.length} organic results`);
      console.log(`  - AI Overview: ${data.aiOverviewPresent ? 'Yes' : 'No'}`);
      if (data.aiOverviewDomains.length > 0) {
        console.log(`  - AI Overview Sources: ${data.aiOverviewDomains.join(', ')}`);
      }
      console.log(`  - Government Dominated: ${data.governmentDominated}`);
      console.log(`  - Competition: ${data.competitionLevel}, Opportunity: ${data.opportunity}`);
      console.log('');
    } catch (error) {
      console.error(`Error analyzing "${keyword}":`, error);
    }
  }

  // Print formatted summary table
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           SERP ANALYSIS SUMMARY TABLE                                              ║');
  console.log('╠═══════════════════════════════════════════════════════════════════════════════════════════════════════╣');
  console.log('║ Keyword                        │ AI Overview │ Competition │ Opportunity │ Top Domains              ║');
  console.log('╟────────────────────────────────┼─────────────┼─────────────┼─────────────┼─────────────────────────╢');

  for (const r of results) {
    const aiStatus = r.aiOverviewPresent ? 'YES' : 'NO';
    const domains = r.topDomains.slice(0, 2).map(d => d.replace('www.', '')).join(', ');
    const kwa = r.keyword.length > 30 ? r.keyword.substring(0, 28) + '..' : r.keyword.padEnd(30);
    console.log(`║ ${kwa} │ ${aiStatus.padStart(9)} │ ${r.competitionLevel.padEnd(11)} │ ${r.opportunity.padEnd(11)} │ ${domains.substring(0, 24).padEnd(24)} ║`);
  }

  console.log('╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝');

  // Print AI Overview Gap Analysis
  console.log('\n\n=== AI OVERVIEW GAP ANALYSIS ===\n');

  const noAiOverview = results.filter((r) => !r.aiOverviewPresent);
  const withAiOverview = results.filter((r) => r.aiOverviewPresent);

  console.log('HIGH PRIORITY - No AI Overview (Opportunity Gaps):');
  console.log('─────────────────────────────────────────────────');
  noAiOverview.forEach((r) => {
    console.log(`  [${r.opportunity}] "${r.keyword}"`);
    console.log(`       Top domains: ${r.topDomains.slice(0, 3).map(d => d.replace('www.', '')).join(', ')}`);
    if (r.relatedQuestions.length > 0) {
      console.log(`       Related questions: ${r.relatedQuestions.slice(0, 2).map(q => q.question).join(' | ')}`);
    }
    console.log('');
  });

  console.log('\nEXISTING AI OVERVIEW - Can Still Compete:');
  console.log('─────────────────────────────────────────────────');
  withAiOverview.forEach((r) => {
    console.log(`  [${r.opportunity}] "${r.keyword}"`);
    console.log(`       Sources: ${r.aiOverviewDomains.length > 0 ? r.aiOverviewDomains.join(', ') : 'Government (irs.gov, fincen.gov)'}`);
    if (r.aiOverviewSnippet) {
      console.log(`       Snippet: ${r.aiOverviewSnippet.substring(0, 80)}...`);
    }
    console.log('');
  });

  // Detailed organic results
  console.log('\n\n=== DETAILED ORGANIC RESULTS ===\n');

  for (const r of results) {
    console.log(`\n┌─────────────────────────────────────────────────────────────────────────────────────────────┐`);
    console.log(`│ ${r.keyword.padEnd(85)} │`);
    console.log(`├─────────────────────────────────────────────────────────────────────────────────────────────┤`);

    if (r.aiOverviewPresent) {
      console.log(`│ AI OVERVIEW PRESENT                                                               │`);
      console.log(`├─────────────────────────────────────────────────────────────────────────────────────────────┤`);
    }

    r.organicResults.forEach((o, i) => {
      const domainTag = o.domain.includes('irs.gov') || o.domain.includes('fincen.gov') ? '[GOV]' : '    ';
      const title = o.title.length > 70 ? o.title.substring(0, 68) + '..' : o.title;
      console.log(`│ ${domainTag} ${i + 1}. ${title.padEnd(77)} │`);
    });

    if (r.relatedQuestions.length > 0) {
      console.log(`├─────────────────────────────────────────────────────────────────────────────────────────────┤`);
      console.log(`│ RELATED QUESTIONS                                                                  │`);
      r.relatedQuestions.forEach((q, i) => {
        const qText = q.question.length > 80 ? q.question.substring(0, 78) + '..' : q.question;
        console.log(`│   ${i + 1}. ${qText.padEnd(78)} │`);
      });
    }
    console.log(`└─────────────────────────────────────────────────────────────────────────────────────────────┘`);
  }

  console.log('\n=== END OF REPORT ===');
  console.log('\nLegend:');
  console.log('  [GOV] = Government domain (irs.gov, fincen.gov, etc.)');
  console.log('  Opportunity: HIGH = Strong AI Overview gap + low competition');
  console.log('             MEDIUM = Some opportunity, partial gaps');
  console.log('             LOW = Saturated, strong AI Overview present\n');
}

main().catch(console.error);