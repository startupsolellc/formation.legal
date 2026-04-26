import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts collection.
 * Uses glob loader to read MDX files from src/content/posts/.
 * Includes Trust Layer metadata for AEO compliance.
 */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Formation.Legal Editorial'),
    // Trust Layer / AEO metadata
    originalityScore: z.number().min(0).max(100).default(95),
    humanGenerated: z.boolean().default(true),
    aiAssisted: z.boolean().default(false),
    // SEO
    canonicalUrl: z.string().url().optional(),
    noindex: z.boolean().default(false),
    // Content meta
    category: z.string().default('General'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
