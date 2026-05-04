import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* ------------------------------------------------------------------ */
/*  Shared sub-schemas                                                 */
/* ------------------------------------------------------------------ */

const sourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string().optional(),
  accessDate: z.string().optional(),
  note: z.string().optional(),
  primary: z.boolean().default(false),
});

const verdictSchema = z.object({
  scenario: z.string(),
  verdict: z.string(),
  risk: z.enum(['low', 'medium', 'high', 'blocked', 'needs-review']),
  note: z.string().optional(),
});

const decisionStepSchema = z.object({
  question: z.string(),
  yes: z.string().optional(),
  no: z.string().optional(),
  note: z.string().optional(),
});

const providerFitSchema = z.object({
  founderProfile: z.string(),
  betterFit: z.string(),
  why: z.string(),
  caveat: z.string().optional(),
});

const changeLogSchema = z.object({
  date: z.string(),
  change: z.string(),
});

const pricingSchema = z.object({
  year1: z.number(),
  year2: z.number(),
  year3: z.number(),
  renewal: z.number().optional(),
  notes: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/*  Trust Layer — shared across all content types                      */
/* ------------------------------------------------------------------ */

const trustFields = {
  originalityScore: z.number().min(0).max(100).default(95),
  humanGenerated: z.boolean().default(true),
  aiAssisted: z.boolean().default(false),
};

/* ------------------------------------------------------------------ */
/*  Pillar enum                                                        */
/* ------------------------------------------------------------------ */

const pillarEnum = z.enum([
  'payment-access',
  'address-banking',
  'compliance',
  'providers',
  'playbooks',
]);

/* ------------------------------------------------------------------ */
/*  Guides — pillar-based decision pages (GEO template)                */
/* ------------------------------------------------------------------ */

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    pillar: pillarEnum,

    /* GEO template fields */
    directAnswer: z.string().max(500).optional(),
    verdict: z.array(verdictSchema).optional(),
    aiMiss: z.array(z.string()).optional(),
    decisionTree: z.array(decisionStepSchema).optional(),
    providerFit: z.array(providerFitSchema).optional(),
    toolCta: z.object({
      primaryLabel: z.string().optional(),
      primaryHref: z.string().optional(),
      secondaryLabel: z.string().optional(),
      secondaryHref: z.string().optional(),
    }).optional(),

    /* Dates & authorship */
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lastReviewed: z.coerce.date().optional().nullable(),
    reviewer: z.string().optional(),
    author: z.string().default('Formation.Legal Editorial'),

    /* Evidence */
    sources: z.array(sourceSchema).optional(),
    methodology: z.string().optional(),
    updateLog: z.array(changeLogSchema).optional(),

    /* Flags */
    affiliateDisclosure: z.boolean().default(false),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    category: z.string().default('General'),
    tags: z.array(z.string()).default([]),
    ...trustFields,
  }),
});

/* ------------------------------------------------------------------ */
/*  Providers — formation service reviews                              */
/* ------------------------------------------------------------------ */

const providers = defineCollection({
  loader: glob({ base: './src/content/providers', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    providerName: z.string(),
    pricing: pricingSchema,
    bestFor: z.array(z.string()),
    notFor: z.array(z.string()),
    affiliateUrl: z.string().url().optional(),
    tested: z.boolean().default(false),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lastReviewed: z.coerce.date().optional(),
    reviewer: z.string().optional(),
    author: z.string().default('Formation.Legal Editorial'),
    sources: z.array(sourceSchema).optional(),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    ...trustFields,
  }),
});

/* ------------------------------------------------------------------ */
/*  Playbooks — country + use-case route guides                        */
/* ------------------------------------------------------------------ */

const playbooks = defineCollection({
  loader: glob({ base: './src/content/playbooks', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    country: z.string().optional(),
    useCase: z.string().optional(),
    directAnswer: z.string().max(500).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Formation.Legal Editorial'),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    ...trustFields,
  }),
});

/* ------------------------------------------------------------------ */
/*  Research — evidence layer (reports, datasets, source logs)         */
/* ------------------------------------------------------------------ */

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Formation.Legal Editorial'),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
    category: z.string().default('Research'),
    tags: z.array(z.string()).default([]),
    ...trustFields,
  }),
});

export const collections = { guides, providers, playbooks, research };
