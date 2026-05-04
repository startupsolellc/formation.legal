# Changelog

All notable changes to this project will be documented in this file.

**🤖 DEVELOPER AGENT INSTRUCTIONS:**
- Always add new entries to the top of the list (below this header).
- Use the format: `## [YYYY-MM-DD] - Session/Feature Title`
- Group changes by: `### Added`, `### Changed`, `### Fixed`, `### Security`.
- Be detailed but concise. Mention key files and architectural decisions.
- **This file must be updated at the end of every development session.**

---

## [2026-05-04] - SEO Meta Optimization for 13 Pages

### Added
- **seoTitle/seoDescription schema fields** in `src/content.config.ts` for all content collections (guides, providers, playbooks, research):
  - `seoTitle`: max 60 chars, optimized for SERP display
  - `seoDescription`: max 160 chars, keyword-targeted meta descriptions
- **SEO override logic** in `GuideLayout.astro` and `PillarLayout.astro`: `seoTitle ?? title` fallback ensures SERP-optimized title tags while keeping original H1 tags unchanged
- **SERP analysis scripts**: `scripts/serp-analysis.mjs`, `scripts/address-banking-serp-analysis.mjs`, `src/lib/serp-analysis.ts`
- **Audit reports**: `docs/seo-meta-audit-report.md`, `docs/gsc-analysis-report.md`

### Changed
- **7 Guide frontmatters** updated with SERP-optimized seoTitle/seoDescription:
  - `us-llc-for-stripe`: "Non-US Founder Stripe With US LLC? Real Route (2026)"
  - `us-llc-for-paypal`: "US LLC for PayPal: Non-Resident Requirements (2026)"
  - `formation-does-not-equal-payment-approval`: "Why LLC Formation Doesn't Equal Payment Access"
  - `payment-stack-for-non-us-founders`: "Payment Stack for Non-US Founders: Alternatives Guide"
  - `registered-agent-address-vs-business-address`: "RA Address for Stripe, Banks, or EIN? (2026 Guide)"
  - `form-5472-foreign-owned-llc`: "Form 5472 for Foreign-Owned LLCs: Filing Guide"
  - `boi-reporting-us-llc-2026`: "BOI Reporting 2026: Who Must Still File?"
- **4 Hub pages** updated with seoTitle/seoDescription props:
  - Payment Access, Address & Banking, Compliance, Providers
- **2 Tool pages** updated with SERP-optimized title/description:
  - Route Planner: "US Business Route Planner for Non-US Founders"
  - Cost Calculator: "3-Year LLC Cost Calculator for Non-Residents"
- **3 dynamic route files** (`[slug].astro`) updated to pass seoTitle/seoDescription from frontmatter

### Architecture Decisions
- SEO title is separate from H1 title — allows SERP-aggressive keyword targeting without breaking on-page content hierarchy
- All seoTitles ≤ 60 chars, seoDescriptions ≤ 160 chars to avoid truncation in search results
- Based on DataForSEO SERP analysis identifying AI Overview gaps and low-competition keyword opportunities

---

## [2026-05-03] - Payment Access Pillar — 3 Draft Guides Live

### Changed
- **payment-stack-for-non-us-founders.mdx**: Full rewrite, draft → live. Added full body content (~292 lines): multiple processor rationale, Stripe as primary, PayPal as backup, Merchant of Record services (Paddle/Lemon Squeezy), stack building steps, common mistakes. Added PayPal IP access note. Completed toolCta hrefs.
- **us-llc-for-paypal.mdx**: Full rewrite, draft → live. Added ~307 lines: PayPal vs Stripe comparison table, IP address trigger problem, rolling reserve warning (30-90 day holds), account linking trap, address requirements (RA works, not virtual office). Updated verdict scenarios with IP-based risk assessment. Expanded aiMiss list.
- **us-llc-for-stripe.mdx**: Full rewrite, draft → live. Added ~286 lines: May 2025 RA address rejection policy section with blockquote, home country address acceptance, three address layers refresher, payout account compatibility table, common failure points. Updated directAnswer with May 2025 policy clarification.

### Architecture Decisions
- All 3 guides: `draft: false`, `noindex: false`, `lastReviewed: 2026-05-03`, `updatedDate: 2026-05-03`
- Consistent real-world corrections applied across all guides: Stripe May 2025 policy, PayPal IP trigger, home country address acceptance for Stripe/banks
- Build verified: all 3 guides pass Zod schema validation

## [2026-05-03] - Route Planner & Cost Calculator UI Alignment

### Changed
- **RoutePlanner.tsx**: Migrated from `#0052ff` blue to `#4f46e5` indigo palette, `#e2e8f0` → stone borders, `#ededfb` → `#eef2ff` panel headers, `rounded-[4px]` → `rounded-[6px]`, risk badges now pill-shaped with dot indicators, selected buttons get `shadow-sm`, CTA buttons with hover transitions
- **CostCalculator.tsx**: Same color migration, zebra-striped table rows, `rounded-full` package badges, `border-l-2 border-[#c7d2fe]` for notes details, consistent `transition-all` on interactive elements
- **route-planner.astro**: Added breadcrumb nav, breadcrumb JSON-LD schema, mono "INTERACTIVE TOOL" label, warning icon in disclaimer box
- **cost-calculator.astro**: Added warning icon to Important disclaimer box
- **ToolNav.astro**: Added inline SVG icons per tool, better descriptions, `rounded-[6px]`, active state with `shadow-sm` and `bg-primary-50`, "All tools →" arrow

### Architecture Decisions
- Zero functional changes — all modifications are purely visual
- Hardcoded hex values in Preact TSX (CSS variables don't resolve reliably in Preact islands)
- Same Indigo/Stone/Amber palette as rest of the site

## [2026-05-03] - Comprehensive UI/UX Overhaul — "Refined Authority" Design System

### Changed
- **Design Token System** (`src/styles/global.css`):
  - Replaced generic blue (#0052ff) with Deep Indigo primary scale (#eef2ff → #1e1b4b)
  - Added Amber/Gold accent scale for trust signals and highlights
  - Added Warm Stone surface palette (warm off-whites instead of cold grays)
  - Fixed 11+ broken CSS variable references (`--color-muted`, `--color-primary-*`, `--color-accent-*`, `--color-surface-alt`, `--color-trust`)
  - Added `.btn-primary` / `.btn-secondary` button system with hover glow effects
  - Added `.hero-gradient` for radial gradient hero backgrounds
  - Added `.glass-header` for glassmorphism header styling
  - Added `.section-divider` gradient line separator
  - Added scroll-reveal animation system (`@keyframes fadeUp`, `.reveal`, `.reveal-stagger`)
  - Enhanced `.brutal-card` with `translateY(-2px)` hover, shadow elevation, and border-color transition
  - Added `.data-mono` badge styling for inline code/data values
  - Added prose link styling with underline offset and hover transitions

- **Header** (`src/components/Header.astro`):
  - Glassmorphism effect with `backdrop-filter: blur(12px)` and translucent background
  - Scroll-aware: darkens background and adds shadow on scroll via IntersectionObserver
  - Added minimal brand icon (layered diamond SVG)
  - Active link highlighting with indigo background pill
  - Improved mobile menu with rounded items and transitions

- **Footer** (`src/components/Footer.astro`):
  - Dark premium background (`--color-inverse-surface`)
  - Organized link groups: Trust (Editorial Policy, Affiliate Disclosure, etc.) and Technical (llms.txt, robots.txt, Sitemap)
  - Gradient top divider line
  - Brand icon matching header

- **Homepage** (`src/pages/index.astro`):
  - Gradient hero background with radial mesh effect
  - Trust badge pill ("Independent · Research-Driven · No Affiliate Bias") with shield icon
  - Gradient text on hero subtitle (indigo → purple clip-text)
  - CTA buttons with inline SVG icons (compass, book)
  - Problem Grid: icon-augmented cards with colored left borders (red/amber/indigo)
  - Trust Bar: icon-enhanced signals with gradient background and dividers
  - Pillar Cards: per-pillar accent colors (emerald/blue/amber/violet/cyan), inline SVG icons, "Explore →" arrows
  - Featured Guides: color-coded top borders matching pillar colors, mono dates, read arrows
  - All sections with scroll-reveal animations

- **PostCard** (`src/components/PostCard.astro`):
  - Gradient top accent bar (indigo → purple)
  - Trust label color-coding (green for human, amber for AI)
  - Mono-font metadata display

- **PillarLayout** (`src/layouts/PillarLayout.astro`):
  - Mono section labels ("RESEARCH PILLAR")
  - Colored left-border on main question box
  - btn-primary CTA with compass icon
  - Top-border guide cards with "Read →" arrows
  - Improved empty state with clock icon

- **Guide Components**:
  - `DirectAnswer.astro`: Gradient background (indigo-50 → white), gradient left accent bar, info icon
  - `AiMissBox.astro`: Gradient background (amber-50 → white), warning triangle icon, X-mark bullet icons
  - `VerdictTable.astro`: Zebra striping, clipboard icon header, pill-style risk badges with dot indicators, rounded container
  - `ToolCta.astro`: Gradient background, compass icon, btn-primary/secondary system

- **Provider Components**:
  - `ProviderRouteFitCard.astro`: Check/X icons for fit/not-ideal sections, btn-secondary CTA with arrow
  - `ProviderComparisonTable.astro`: Zebra striping, accent-colored route fit text, btn-secondary CTAs

- **Other Pages**:
  - `tools/index.astro`: Icons per tool, status badges (Live/Coming Soon with green dot), top accent borders
  - `research/index.astro`: Consistent card styling with top borders, category pills, read arrows

- **BaseLayout** (`src/layouts/BaseLayout.astro`):
  - Added lightweight IntersectionObserver script for scroll-reveal animations (~200 bytes inline)

### Architecture Decisions
- Zero new dependencies — all icons are inline SVG, animations are CSS-only
- IntersectionObserver used for scroll-reveal (progressive enhancement, no-JS fallback)
- Color palette designed for "Refined Authority" — Deep Indigo (trust/authority) + Amber (warmth/action)
- Warm Stone neutrals replace cold grays for a more approachable feel
- Per-pillar accent colors create visual identity for each research area

## [2026-05-03] - Registered Agent Guide Corrections (Real-World Experience)

### Changed
- **Registered Agent Address Guide** — Major corrections based on real-world non-US founder testing:
  - EIN: RA addresses ARE accepted by IRS — standard practice, not "technically possible but not recommended"
  - Stripe: Home country physical address + utility bill works (not just US address)
  - PayPal: RA address accepted — utility bill trigger is IP-based, use US IP to avoid
  - Amazon: Only shared RA addresses are rejected — unique virtual office with suite number works
  - Added "Physical/KYC Address" layer to three-address system (home country address + proof)
  - Updated decision tree and quick reference table with accurate platform-specific requirements

### Research Findings
- Most guides are overly pessimistic about RA addresses — reality is more nuanced
- Stripe accepts non-US physical addresses for KYC with utility bill/bank statement proof
- PayPal IP-triggered verification: US IP avoids utility bill request even with RA address
- Amazon rejects shared RA addresses but accepts unique virtual office addresses

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
