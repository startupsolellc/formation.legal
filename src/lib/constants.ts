/**
 * Site-wide constants and metadata.
 * Single source of truth for all site configuration.
 */

export const SITE = {
  title: 'Formation.Legal',
  description:
    'The decision engine for non-US founders who want a US company that actually works for payments, banking, and compliance.',
  url: 'https://formation.legal',
  language: 'en',
  locale: 'en_US',
} as const;

export const ORGANIZATION = {
  name: 'Formation.Legal',
  url: 'https://formation.legal',
  logo: 'https://formation.legal/favicon.svg',
  description:
    'Independent research platform helping non-US founders compare US entity types, formation providers, payment access, banking risk, and annual compliance.',
  foundingDate: '2024',
  sameAs: [] as string[],
} as const;

export const DEFAULT_AUTHOR = {
  name: 'Formation.Legal Editorial',
  url: 'https://formation.legal/editorial-policy',
} as const;

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

export const NAV_ITEMS = [
  { label: 'Route Planner', href: '/tools/route-planner' },
  { label: 'Payment Access', href: '/payment-access' },
  { label: 'Address & Banking', href: '/address-banking' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'Providers', href: '/providers' },
  { label: 'Research', href: '/research' },
] as const;

/* ------------------------------------------------------------------ */
/*  Pillars                                                            */
/* ------------------------------------------------------------------ */

export type PillarId =
  | 'payment-access'
  | 'address-banking'
  | 'compliance'
  | 'providers'
  | 'playbooks';

export interface Pillar {
  id: PillarId;
  label: string;
  shortLabel: string;
  description: string;
  mainQuestion: string;
  href: string;
}

export const PILLARS: Pillar[] = [
  {
    id: 'payment-access',
    label: 'Payment Access Reality',
    shortLabel: 'Payment Access',
    description:
      'Does a US company actually unlock Stripe, PayPal, and global payments for your situation?',
    mainQuestion:
      'Will a US LLC help me accept payments through Stripe, PayPal, or other processors?',
    href: '/payment-access',
  },
  {
    id: 'address-banking',
    label: 'Address, Banking & KYC Reality',
    shortLabel: 'Address & Banking',
    description:
      'Which address works where — and can you actually open a US bank account?',
    mainQuestion:
      'What address do I need for state filing, IRS, bank, Stripe, PayPal, and Amazon?',
    href: '/address-banking',
  },
  {
    id: 'compliance',
    label: 'Compliance Survival',
    shortLabel: 'Compliance',
    description:
      'What happens after formation — Form 5472, BOI, EIN, annual filings, and penalties.',
    mainQuestion: 'What are my ongoing compliance obligations as a non-US LLC owner?',
    href: '/compliance',
  },
  {
    id: 'providers',
    label: 'Provider Decision Lab',
    shortLabel: 'Providers',
    description:
      'Route-based provider comparisons — not which pays the highest commission, but which fits your route.',
    mainQuestion:
      'Which LLC formation provider fits my specific country, business model, and budget?',
    href: '/providers',
  },
  {
    id: 'playbooks',
    label: 'Founder Route Playbooks',
    shortLabel: 'Playbooks',
    description:
      'Country + business model + payment goal playbooks for non-US founders.',
    mainQuestion:
      'What is the complete route for a founder in my country with my business model?',
    href: '/playbooks',
  },
] as const;

export const POSTS_PER_PAGE = 12;
