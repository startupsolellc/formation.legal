# Changelog

All notable changes to this project will be documented in this file.

**🤖 DEVELOPER AGENT INSTRUCTIONS:**
- Always add new entries to the top of the list (below this header).
- Use the format: `## [YYYY-MM-DD] - Session/Feature Title`
- Group changes by: `### Added`, `### Changed`, `### Fixed`, `### Security`.
- Be detailed but concise. Mention key files and architectural decisions.
- **This file must be updated at the end of every development session.**

---

## [2026-05-02] - Payment Access Public Guide & Address Rules Alignment

### Added
- Published the first editorial-ready Payment Access guide:
  - `src/content/guides/formation-does-not-equal-payment-approval.mdx`
  - Public route: `/payment-access/formation-does-not-equal-payment-approval/`
  - Set `draft: false` and `noindex: false`
  - Added reviewed official source references for Stripe, PayPal, Mercury, IRS, and FinCEN
  - Added public-facing update log copy and reviewer metadata
- Added/expanded GEO guide fields for the public guide:
  - Direct answer
  - Verdict table
  - AI-miss list
  - Decision tree
  - Provider fit matrix
  - Source summary
  - Route Planner CTA
  - Update log

### Changed
- Reframed address guidance across Route Planner and Payment Access content around three separate address layers:
  - Registered agent/state contact address
  - Founder/operator residential proof for KYC
  - Business legal/principal/operating address for banks, processors, and marketplaces
- Updated Route Planner copy and rule text in:
  - `src/components/tools/RoutePlanner.tsx`
  - `src/data/route-rules.ts`
  - `src/pages/tools/route-planner.astro`
- Softened over-broad payment, banking, and address claims in draft guides:
  - `src/content/guides/us-llc-for-stripe.mdx`
  - `src/content/guides/us-llc-for-paypal.mdx`
  - `src/content/guides/payment-stack-for-non-us-founders.mdx`
- Updated homepage and editorial policy copy to avoid unsupported approval-rate or physical-presence claims:
  - `src/pages/index.astro`
  - `src/pages/editorial-policy.astro`
- Clarified registered agent address scope in the research article:
  - `src/content/research/what-is-llc-formation/index.mdx`

### Fixed
- Removed internal production-facing copy from the public guide update log:
  - Replaced “Converted from skeleton draft...” with a reader-facing initial publication note
- Removed/avoided misleading implications that:
  - A U.S. physical office is always required for payment approval
  - Registered agent addresses are categorically never accepted
  - Virtual/mailbox-style addresses always trigger rejection

---

## [2026-04-27] - Route Engine MVP & Cloudflare Deployment Readiness

### Added
- Added Cloudflare Workers static assets config:
  - `wrangler.jsonc`
  - Uses static `dist/` output without adding an Astro Cloudflare adapter
- Added Route Planner MVP as a Preact island:
  - `src/components/tools/RoutePlanner.tsx`
  - `src/data/route-rules.ts`
  - `src/data/provider-fit.ts`
  - `src/types/route-planner.ts`
  - `src/pages/tools/route-planner.astro`
- Added route-based QA polish for the planner:
  - Scenario-based verdicts and risk panels
  - Missing steps and first 90-day checklist
  - Provider fit options without fake ratings or affiliate links
  - Analytics placeholders only, with no external analytics integration

### Changed
- Normalized page title branding in `BaseLayout.astro` to avoid duplicated `Formation.Legal` suffixes.
- Connected Route Planner entry points from the homepage, tools hub, and pillar hubs.
- Refined Route Planner copy to stay trust-first and avoid approval guarantees.

### Fixed
- Fixed Cloudflare deploy failure caused by `npx wrangler deploy` auto-configuring Astro as a Worker app and rejecting `formation.legal` as a Worker name.
- Kept the project static-only (`output: "static"`) and avoided server-side adapter/session/KV behavior.

---

## [2026-04-26] - Project Documentation & Agent Onboarding

### Added
- **`AGENTS.md`** — Project intelligence file for AI agents and new developers
  - Critical rules (static-only, Tailwind v4 paradigm, Astro 6 API changes)
  - File map with responsibilities for every source file
  - Step-by-step recipes for: adding posts, pages, collections, colors, nav items, schemas
  - Build & deploy quick reference
  - Dependency philosophy (minimal, no unnecessary frameworks)
- **`README.md`** — Comprehensive rewrite with full technical documentation
  - Architecture deep dive (Astro config, Content Collections, Tailwind v4, JSON-LD, AI endpoints)
  - Content authoring guide with complete examples
  - Component reference (BaseLayout, PostCard, TrustBadge, JsonLd, Prose)
  - Styling guide with color system and layout conventions
  - Cloudflare Pages deployment instructions (Dashboard + Wrangler CLI)
  - Common tasks quick-reference table

### Architecture Decisions
- `AGENTS.md` is the primary entry point for AI agents — compact, rule-focused
- `README.md` is the comprehensive technical reference — detailed, example-rich
- Both files are self-contained to survive context loss between sessions

---

## [2026-04-26] - Astro 6 Static Content Platform — Initial Setup

### Added
- **Astro 6.1.9** project scaffolding with TypeScript strict mode
- **Tailwind CSS v4** integration via `@tailwindcss/vite` plugin with CSS-first theme configuration
  - Professional legal-industry color palette (navy primary, blue accent, warm neutrals)
  - `@tailwindcss/typography` for prose content styling
  - Custom design tokens in `src/styles/global.css` using `@theme` directive
- **Content Collections** (`src/content.config.ts`) with Zod schema for blog posts
  - Trust Layer fields: `originalityScore`, `humanGenerated`, `aiAssisted`
  - SEO fields: `canonicalUrl`, `noindex`, `category`, `tags`
- **MDX support** via `@astrojs/mdx` integration
- **JSON-LD structured data** system:
  - `src/lib/schema.ts`: Organization, WebSite, Article, BreadcrumbList builders
  - `src/components/seo/JsonLd.astro`: Generic multi-schema renderer
  - Trust Layer extensions (`x-originality-score`, `x-human-generated`, `x-ai-assisted`)
- **Trust Badge component** (`src/components/seo/TrustBadge.astro`)
  - Visual originality score badge with machine-readable meta tags
- **Page architecture**:
  - `src/pages/index.astro`: Homepage with hero, trust signals bar, latest posts grid
  - `src/pages/blog/index.astro`: Blog listing with breadcrumbs and post count
  - `src/pages/blog/[slug].astro`: Single post with `getStaticPaths()`, Article JSON-LD, Trust Badge
- **AI-friendly endpoints**:
  - `src/pages/llms.txt.ts`: Auto-generated llms.txt following llmstxt.org spec
  - `src/pages/robots.txt.ts`: Explicitly allows GPTBot, ClaudeBot, PerplexityBot, etc.
- **@astrojs/sitemap** integration for automatic XML sitemap generation
- **Layout & component system**:
  - `src/layouts/BaseLayout.astro`: Root layout with SEO meta, OG/Twitter cards, JSON-LD
  - `src/components/Header.astro`: Sticky nav with glassmorphism
  - `src/components/Footer.astro`: Footer with AI-friendly links
  - `src/components/PostCard.astro`: Blog preview card with trust label
  - `src/components/Prose.astro`: Tailwind Typography wrapper
- **Example content**: `src/content/posts/what-is-llc-formation/index.mdx`
- **Cloudflare Pages** deployment configuration documented in `README.md`
- `.nvmrc` set to Node 22 (Astro 6 requirement)

### Architecture Decisions
- **No `@astrojs/cloudflare` adapter** — Static output doesn't require an adapter
- **No Keystatic CMS** — Incompatible with Astro 6; using native Content Collections + MDX instead
- **No FastAPI backend** — Astro's built-in data fetching handles external APIs at build-time
- **Tailwind v4 via Vite plugin** — `@astrojs/tailwind` is deprecated for v4
- **CSS-first Tailwind config** — Using `@theme` directive instead of JS config file
