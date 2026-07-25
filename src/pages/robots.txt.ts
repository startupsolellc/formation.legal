/**
 * robots.txt — Auto-generated at build time.
 * Permits all crawlers including AI bots.
 */

import type { APIRoute } from 'astro';
import { SITE } from '../lib/constants';

export const GET: APIRoute = () => {
  const body = [
    '# Formation.Legal robots.txt',
    '# https://formation.legal',
    '',
    '# Allow all standard crawlers',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    '',
    '# AI Crawlers — explicitly allowed',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: Anthropic-AI',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    '# Sitemaps',
    // The child sitemap is listed alongside the index on purpose: Bing reads a
    // sitemap index once and does not always fetch the children inside it.
    // See docs/bing-indexnow-ops.md.
    `Sitemap: ${SITE.url}/sitemap-index.xml`,
    `Sitemap: ${SITE.url}/sitemap-0.xml`,
    '',
    '# LLM-friendly index',
    `# See also: ${SITE.url}/llms.txt`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
