/**
 * Site-wide constants and metadata.
 * Single source of truth for all site configuration.
 */

export const SITE = {
  title: 'Formation.Legal',
  description:
    'Your trusted resource for LLC formation guides, legal compliance, and business entity research.',
  url: 'https://formation.legal',
  language: 'en',
  locale: 'en_US',
} as const;

export const ORGANIZATION = {
  name: 'Formation.Legal',
  url: 'https://formation.legal',
  logo: 'https://formation.legal/favicon.svg',
  description:
    'Independent legal formation research platform providing unbiased guides and compliance information.',
  foundingDate: '2024',
  sameAs: [] as string[],
} as const;

export const DEFAULT_AUTHOR = {
  name: 'Formation.Legal Editorial',
  url: 'https://formation.legal/about',
} as const;

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
] as const;

export const POSTS_PER_PAGE = 12;
