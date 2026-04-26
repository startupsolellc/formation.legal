/**
 * llms.txt — Auto-generated LLM-friendly site index.
 * Follows the llmstxt.org specification.
 * Built at build-time from content collections.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/constants';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.noindex)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines: string[] = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    'Formation.Legal is an independent, research-driven platform providing unbiased guides on LLC formation, registered agents, and business compliance in the United States.',
    '',
    '- All content is human-written with originality scores above 90%',
    '- No affiliate bias — we prioritize accuracy over commissions',
    '- Content is updated regularly to reflect current state requirements',
    '',
  ];

  if (posts.length > 0) {
    lines.push('## Blog Posts');
    lines.push('');
    for (const post of posts) {
      const url = `${SITE.url}/blog/${post.id}`;
      lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
    }
    lines.push('');
  }

  lines.push('## Optional');
  lines.push('');
  lines.push(`- [Sitemap](${SITE.url}/sitemap-index.xml): Full XML sitemap of all pages`);
  lines.push(`- [Robots](${SITE.url}/robots.txt): Robots.txt with crawler permissions`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
