# Changelog

All notable changes to this project will be documented in this file.

**🤖 DEVELOPER AGENT INSTRUCTIONS:**
- Always add new entries to the top of the list (below this header).
- Use the format: `## [YYYY-MM-DD] - Session/Feature Title`
- Group changes by: `### Added`, `### Changed`, `### Fixed`, `### Security`.
- Be detailed but concise. Mention key files and architectural decisions.
- **This file must be updated at the end of every development session.**

---

## [2026-05-03] - Registered Agent Address Guide (Address & Banking Pillar)

### Added
- **Registered Agent Address Guide** — First guide for the Address & Banking pillar:
  - `src/content/guides/registered-agent-address-vs-business-address.mdx`
  - Public route: `/address-banking/registered-agent-address-vs-business-address/`
  - Covers: Three address layers (RA, Residential/KYC, Operating), what RA addresses can/cannot be used for, Stripe May 2025 policy change, bank account addresses, EIN addresses
  - Includes 5-scenario verdict table, decision tree, Stripe-specific section, quick reference table
  - GEO-optimized targeting "can i use registered agent address for stripe" queries (AI Overview absent — opportunity)
- **Keyword Research Script** for Registered Agent:
  - `scripts/registered-agent-keyword-research.mjs` — SERP analysis for 5 main queries

### Research Findings
- Stripe explicitly rejected RA addresses as of May 28, 2025 — many existing guides are outdated
- "can i use registered agent address for stripe" has NO AI Overview — high LLM citation opportunity
- Three address layers concept is unique — most guides only explain what RA is, not the three-layer system
- AI Misses identified: virtual mailbox ≠ registered agent, RA is public record, non-US founder specific scenarios

## [2026-05-03] - BOI Reporting Guide (Compliance Pillar)

### Added
- **BOI Reporting Guide** — Second guide for the Compliance pillar:
  - `src/content/guides/boi-reporting-us-llc-2026.mdx`
  - Public route: `/compliance/boi-reporting-us-llc-2026/`
  - Covers March 2025 rule change, who must file vs exempt, foreign entity requirements, FinCEN e-filing, penalties, and non-US founder scenarios
  - Includes 4-scenario decision matrix, compliance checklist, and fraud warning (Form 4022 scam)
  - GEO-optimized targeting "is boi reporting still required 2026" and related uncertainty queries
- **Keyword Research Script** for BOI:
  - `scripts/boi-keyword-research.mjs` — SERP analysis for 5 main queries and question research
  - Identifies AI Overview opportunities and low-competition keywords

### Research Findings
- March 26, 2025 FinCEN rule removed ALL US entities from BOI reporting requirements — major change most guides miss
- "Is BOI reporting still required 2026" is high-volume uncertainty query — current content is outdated
- Foreign entities still qualify as reporting companies — non-US founders with foreign entities need to file
- AI Overviews present for all main BOI queries — opportunity for authoritative LLM citation
- Scam alerts: fake "Form 4022" and "US Business Regulations Dept." correspondence reported

## [2026-05-03] - Content Research, SEO Infrastructure & Form 5472 Guide

### Added
- **Form 5472 Compliance Guide** — First guide for the Compliance pillar:
  - `src/content/guides/form-5472-foreign-owned-llc.mdx`
  - Public route: `/compliance/form-5472-foreign-owned-llc/`
  - Complete guide covering: who must file, reportable transactions, $25,000 penalty structure, NRA-specific rules, pro forma 1120 process, EIN/ITIN requirements, filing deadlines
  - Includes verdict table, decision tree, provider fit matrix, AI-miss list, FAQ section, and filing checklist
  - GEO-optimized with direct answer, citations, and structured data (JSON-LD Article schema)
- **DataForSEO Integration** for keyword research:
  - `src/lib/dataforseo.ts` — API client module with authenticated fetch
  - `scripts/test-dataforseo.mjs` — Connection test script
  - `scripts/form-5472-keyword-research.mjs` — Keyword research for Form 5472 topic
  - SERP analysis for `form 5472 foreign owned llc`, `form 5472 penalty irs`, `form 5472 nonresident alien`, `irs form 5472 filing requirements`
  - Keywords Data API setup (searches/live endpoint)
- **SEO Content Writer & Keyword Research Skills**:
  - Installed `aaron-he-zhu/seo-geo-claude-skills@seo-content-writer` (4.6K installs)
  - Installed `aaron-he-zhu/seo-geo-claude-skills@keyword-research` (4.1K installs)
  - Skills for content brief generation, keyword clustering, and SEO-optimized article writing
- **docs/dataforseo-guide.md** — Internal documentation for DataForSEO API usage including:
  - Environment setup, authentication, location codes
  - Code examples for SERP API and Keywords Data API
  - Common error handling and debugging

### Changed
- Fixed `verdict.3.risk: "none"` → `"low"` in Form 5472 guide (schema enum only accepts "low|medium|high|blocked|needs-review")
- Updated `AGENTS.md` with DataForSEO setup instructions

### Research Findings
- Form 5472 query SERPs show AI Overviews present for all main keywords — opportunity for LLM citation
- Low competition keywords identified: `form 5472 nonresident alien`, `form 5472 foreign owned llc template`, `form 5472 instructions 2026`
- Top competing domains: irs.gov, greenbacktaxservices.com, taxesforexpats.com — gap exists for non-US founder-focused guide

## [2026-05-03] - Provider Decision Lab MVP

### Added
- Rebuilt `/providers/` as a route-based Provider Decision Lab MVP instead of a coming-soon page.
- Added provider comparison components:
  - `src/components/providers/ProviderComparisonTable.astro`
  - `src/components/providers/ProviderCostSnapshot.astro`
  - `src/components/providers/ProviderMethodologyBox.astro`
  - `src/components/providers/ProviderRouteFitCard.astro`
- Added route-fit matrix, provider cards, internal CTAs, affiliate disclosure, source list, and legal/tax disclaimer to the provider hub.

### Changed
- Reused existing Cost Calculator data for the provider cost snapshot without adding Product, Review, AggregateRating, score, or rating schema.
- Clarified that the provider cost snapshot is a 3-year operating cost model, not a provider checkout price.
- Softened provider support language and marked live checkout/support testing as pending.
- Replaced ambiguous null pricing cells in the provider snapshot with "Needs verification."
- Updated providers page SEO metadata: title "LLC Formation Services for Non-Residents: Route Fit & Costs" and improved description.

## [2026-05-03] - LLC Cost Calculator Tool

### Added
- Added CostCalculator Preact island component:
  - `src/components/tools/CostCalculator.tsx`
  - `src/types/cost-calculator.ts`
- Added state filing fee, annual compliance, and tax prep assumption inputs with real-time 3-year cost calculation per provider.
- Added EIN handling toggle (IRS free EIN vs. provider-assisted) with cost differential display.
- Integrated provider cost data from `src/data/provider-costs.ts` with `calculateProviderCost()` and `DEFAULT_COST_ASSUMPTIONS`.
- Added reset functionality and formatted currency display with null-safety ("Verify" for missing data).
- Added CostCalculator to ToolNav with descriptive cards in `src/components/tools/ToolNav.astro`.
- Added `src/pages/tools/cost-calculator.astro` as the tool page.
- Connected cost calculator to Route Planner via `route-planner.astro` link and homepage CTA.

### Changed
- Updated `src/lib/constants.ts` with expanded TOOL_ITEMS including cost-calculator entry.
- Updated `src/pages/tools/index.astro` to show cost-calculator in the tools hub grid.

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
- **Example content**: `src/content/research/what-is-llc-formation/index.mdx`
- **Cloudflare Pages** deployment configuration documented in `README.md`
- `.nvmrc` set to Node 22 (Astro 6 requirement)

### Architecture Decisions
- **No `@astrojs/cloudflare` adapter** — Static output doesn't require an adapter
- **No Keystatic CMS** — Incompatible with Astro 6; using native Content Collections + MDX instead
- **No FastAPI backend** — Astro's built-in data fetching handles external APIs at build-time
- **Pillar-based content architecture** — Uses `/payment-access`, `/address-banking`, `/compliance`, `/research`, `/providers`, `/playbooks` routes instead of traditional blog structure
- **Canonical URLs handled at page level** — `canonicalUrl` passed as prop to BaseLayout rather than as content collection field
- **Tailwind v4 via Vite plugin** — `@astrojs/tailwind` is deprecated for v4
- **CSS-first Tailwind config** — Using `@theme` directive instead of JS config file
