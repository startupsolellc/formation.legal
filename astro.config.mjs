// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import { autoLinkPlugin } from './src/lib/rehype/index.mjs';
import { LINK_DICTIONARY } from './src/lib/link-dictionary.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://formation.legal',
  output: 'static',
  build: {
    format: 'file'
  },
  integrations: [
    preact(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/draft'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    rehypePlugins: [
      [autoLinkPlugin, {
        dictionary: LINK_DICTIONARY,
        debug: false,
        maxLinksPerArticle: 10,
      }],
    ],
  },
  image: {
    domains: ['images.pexels.com', 'images.unsplash.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});