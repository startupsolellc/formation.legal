/**
 * llms.txt — AI-friendly site index generated at build time.
 * Provides structured info for LLMs about site content.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, PILLARS } from '../lib/constants';

export const GET: APIRoute = async () => {
  const guides = await getCollection('guides');
  const providers = await getCollection('providers');
  const research = await getCollection('research');
  const playbooks = await getCollection('playbooks');

  const lines: string[] = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    '## About',
    '',
    'Formation.Legal is an independent research platform that helps non-US founders',
    'compare US entity types, formation providers, payment access, banking risk,',
    'address requirements, and annual compliance before they spend money.',
    '',
    'This is NOT legal or tax advice. We provide research-driven decision support.',
    '',
    '## Pillars',
    '',
  ];

  for (const pillar of PILLARS) {
    lines.push(`### ${pillar.label}`);
    lines.push(`- URL: ${SITE.url}${pillar.href}`);
    lines.push(`- ${pillar.description}`);
    lines.push('');
  }

  if (guides.length > 0) {
    lines.push('## Guides', '');
    for (const guide of guides.filter((g) => !g.data.noindex && !g.data.draft)) {
      const pillar = PILLARS.find((p) => p.id === guide.data.pillar);
      lines.push(`- [${guide.data.title}](${SITE.url}${pillar?.href ?? ''}/${guide.id})`);
      if (guide.data.directAnswer) {
        lines.push(`  > ${guide.data.directAnswer}`);
      }
    }
    lines.push('');
  }

  if (providers.length > 0) {
    lines.push('## Provider Reviews', '');
    for (const provider of providers.filter((p) => !p.data.noindex && !p.data.draft)) {
      lines.push(`- [${provider.data.providerName}](${SITE.url}/providers/${provider.id}): ${provider.data.description}`);
    }
    lines.push('');
  }

  if (playbooks.length > 0) {
    lines.push('## Playbooks', '');
    for (const pb of playbooks.filter((p) => !p.data.noindex && !p.data.draft)) {
      lines.push(`- [${pb.data.title}](${SITE.url}/playbooks/${pb.id})`);
    }
    lines.push('');
  }

  if (research.length > 0) {
    lines.push('## Research', '');
    for (const item of research.filter((r) => !r.data.noindex && !r.data.draft)) {
      lines.push(`- [${item.data.title}](${SITE.url}/research/${item.id}): ${item.data.description}`);
    }
    lines.push('');
  }

  lines.push('## Tools', '');
  lines.push(`- [US Business Route Planner](${SITE.url}/tools/route-planner): Find the right US business route for your situation.`);
  lines.push(`- [3-Year LLC Cost Calculator](${SITE.url}/tools/cost-calculator): Compare formation providers by total 3-year cost.`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
