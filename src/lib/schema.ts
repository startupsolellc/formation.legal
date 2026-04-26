/**
 * JSON-LD structured data builders for SEO/AEO/GEO.
 * Generates schema.org compliant JSON-LD objects.
 */

import { SITE, ORGANIZATION, DEFAULT_AUTHOR } from './constants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ArticleInput {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author?: string;
  slug: string;
  originalityScore?: number;
  humanGenerated?: boolean;
  aiAssisted?: boolean;
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/*  Organization                                                       */
/* ------------------------------------------------------------------ */

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    description: ORGANIZATION.description,
    foundingDate: ORGANIZATION.foundingDate,
    ...(ORGANIZATION.sameAs.length > 0 && { sameAs: ORGANIZATION.sameAs }),
  };
}

/* ------------------------------------------------------------------ */
/*  WebSite (with SearchAction for GEO)                                */
/* ------------------------------------------------------------------ */

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Article (with Trust Layer metadata)                                */
/* ------------------------------------------------------------------ */

export function buildArticleSchema(input: ArticleInput) {
  const url = input.slug.startsWith('http')
    ? input.slug
    : `${SITE.url}/${input.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url,
    datePublished: input.pubDate.toISOString(),
    ...(input.updatedDate && {
      dateModified: input.updatedDate.toISOString(),
    }),
    author: {
      '@type': 'Person',
      name: input.author ?? DEFAULT_AUTHOR.name,
      url: DEFAULT_AUTHOR.url,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION.name,
      url: ORGANIZATION.url,
      logo: {
        '@type': 'ImageObject',
        url: ORGANIZATION.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    isAccessibleForFree: true,
    inLanguage: SITE.language,
    // Trust Layer extensions (non-standard but useful for AI)
    ...(input.originalityScore !== undefined && {
      'x-originality-score': input.originalityScore,
    }),
    ...(input.humanGenerated !== undefined && {
      'x-human-generated': input.humanGenerated,
    }),
    ...(input.aiAssisted !== undefined && {
      'x-ai-assisted': input.aiAssisted,
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  BreadcrumbList                                                     */
/* ------------------------------------------------------------------ */

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.href}`,
    })),
  };
}
