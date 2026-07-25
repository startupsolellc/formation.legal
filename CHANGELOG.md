# Changelog

All notable changes to this project will be documented in this file.

**🤖 DEVELOPER AGENT INSTRUCTIONS:**
- Always add new entries to the top of the list (below this header).
- Use the format: `## [YYYY-MM-DD] - Session/Feature Title`
- Group changes by: `### Added`, `### Changed`, `### Fixed`, `### Security`.
- Be detailed but concise. Mention key files and architectural decisions.
- **This file must be updated at the end of every development session.**

---

## [2026-07-25] - Bing Discovery Repair, IndexNow Setup & Credential Cleanup

### Fixed
- **Bing Child Sitemap Discovery Failure**: `sitemap-index.xml` was submitted to Bing on 2026-05-22; Bing read the index once, counted its single `<sitemap>` entry, and never fetched the child. `GetFeeds.UrlCount` sat at **1** for 64 days while the site served 42 URLs, and `LastCrawled` stayed frozen at the submission timestamp. Measured through the Bing Webmaster API, not inferred. Submitting `sitemap-0.xml` directly as a child feed moved `UrlCount` to **42** with `LastCrawled: 2026-07-25 14:06`.
- **robots.txt Sitemap Exposure** (`src/pages/robots.txt.ts`): the child sitemap is now listed alongside the index, so crawlers that do not descend into a sitemap index still get a direct path to all URLs.

### Added
- **IndexNow Key** (`public/4e3d092ea5871686fc071df6facb1efa.txt`): project-specific 32-char key served from the site root, exactly 32 bytes with no trailing newline. Keys are per-host — a key on one domain cannot authorize submissions for another, so this one must never be copied to a sibling project.
- **IndexNow Submission Script** (`scripts/indexnow-submit.mjs`): pulls URLs from the live sitemap (or accepts explicit paths) and posts them to `api.indexnow.org`. It refuses to submit unless the live key file returns 200, `text/plain`, and a body byte-identical to the key — a mismatched key silently turns every submission into a 403. First run submitted 42 URLs, `HTTP 202`.
- **Ops Documentation** (`docs/bing-indexnow-ops.md`): recorded measurements, the deploy-then-submit ordering rule, and a pass-condition table so every submission step has a verifiable end state (a counter that moves, a date that fills) instead of a checklist tick. Portfolio-wide diagnosis lives in the knowledge-base wiki and is linked, not duplicated.

### Security
- **Removed Hardcoded DataForSEO Credentials** (22 files under `scripts/` and `docs/`): every research script carried the live API password as a fallback default (`process.env.DATAFORSEO_PASSWORD || '<literal>'`), and two scripts inlined it straight into the Basic-auth header. Scripts now read the credentials from the environment only and throw on startup when they are missing.
- **⚠️ Rotation Required**: this repository is public and the credential is present in committed history across many past commits. Stripping the working tree does not unpublish it — the DataForSEO password must be rotated at the provider.

### Changed
- **Bing URL Submission**: 42 URLs submitted manually through Bing WMT; monthly quota dropped 700 → 658, confirming the submission actually registered.
- **Untracked `docs/.DS_Store`**: removed from version control (already covered by `.gitignore`).

---

## [2026-05-11] - Tools Hub Expansion & Dataset Footer Link

### Added
- **Annual Report Fees Card to Tools Hub**: Added a new "LLC Annual Fees by State" card to `TOOL_ITEMS` (`src/lib/constants.ts`) linking to `/costs/annual-report-fees-by-state`, visible on `/tools`.
- **Footer Dataset Link**: Added "US LLC Fees Dataset" external link to the Footer "Tools & Data" column, pointing to `https://github.com/startupsolellc/us-llc-fees-dataset` with `target="_blank"`.

### Changed
- **Tools Index Icon**: Added grid/sheet SVG icon for the new Annual Report Fees tool in `toolIcons` record (`src/pages/tools/index.astro`).

---

## [2026-05-11] - Public Dataset Integration & Cost Calculator MVP

### Added
- **State Fees Public Dataset Connection**: Implemented automated fetching (`src/lib/state-fees.ts`) of the new open-source 50-state JSON dataset.
- **Type Definitions**: Added TypeScript interfaces for the dataset in `src/types/state-fees.ts`.
- **Annual Report Fees Index**: Created a new page (`src/pages/costs/annual-report-fees-by-state.astro`) to display a 2026 State Fee Matrix using the dynamic public data, styled with `Institutional Clarity` guidelines and inline SVGs.
- **Footer Navigation**: Added a "Tools & Data" column to `src/components/Footer.astro` containing links to the Route Planner and State Fee Index.
- **Agent Context Files**: Generated `docs/us-llc-fees-GEMINI.md` and `docs/us-llc-fees-AGENTS.md` to establish strict boundaries and roles for the public repository's AI agent.

### Changed
- **Cost Calculator MVP**: Refactored `src/components/tools/CostCalculator.tsx` to accept dynamic dataset props and introduced a "Formation State" dropdown. The tool now automatically updates "State filing fee" and "Compliance estimate" based on the selected state's official data.
- **Cost Calculator Page**: Updated `src/pages/tools/cost-calculator.astro` to fetch the public dataset at build time and pass it to the React component.

### Fixed
- **JSON Parsing Resilience**: Added regex logic in `src/lib/state-fees.ts` to automatically strip trailing commas from the fetched JSON, preventing build failures from manual data entry errors.
- **Material Symbols Issue**: Replaced broken text-based icons (`fact_check`, `info`, `warning`, etc.) with inline SVGs across the new State Fee Index to ensure perfect rendering without external font dependencies.

## [2026-05-10] - Guides Pillar & Stripe Atlas Alternative Walkthrough

### Added
- **New `guides` Pillar**: Created a dedicated `guides` pillar for step-by-step, visual tutorials.
- **`src/pages/guides/index.astro`**: A stylish hub for all guides using the existing brutalist and glassmorphism design language.
- **`src/pages/guides/[slug].astro`**: Dynamic routing for the guides pillar utilizing `GuideLayout.astro`.
- **Stripe Atlas Alternative Guide**: Added a comprehensive DIY LLC formation visual guide (`src/content/guides/stripe-atlas-alternative-non-resident.mdx`). Targets non-US residents looking to save $500 by using a registered agent directly.
- **Images**: Integrated 9 optimized `.png` screenshots for the Northwest Registered Agent LLC formation process.
- **Internal Links**: Added new entries to `src/lib/link-dictionary.ts` pointing to the new guides hub and the Stripe Atlas alternative guide to power the auto-linking system.

### Changed
- **Content Schema (`src/content.config.ts`)**: Updated the `pillarEnum` to officially support the `guides` category.
- **Navigation (`src/lib/constants.ts` & `src/components/Header.astro`)**: Added the "Guides" pillar to the `NAV_ITEMS` and `PILLARS` lists, making it accessible from the main site header.

### Architecture Decisions
- Guides use the exact same Zod schema and `GuideLayout.astro` as existing pillar content, keeping the EEAT, GEO, and Trust Layer elements fully intact.
- Conducted deep SERP analysis using DataForSEO scripts (e.g., `scripts/concept1-keyword-research.mjs`) to find low-competition, high-intent angles (Stripe Atlas alternatives, No-ITIN LLC formation) before writing the content.

---

## [2026-05-09] - Foreign-Owned LLC Tax & Section 482 Guide

### Added
- High-authority guide on Foreign-Owned LLC tax compliance.
- Covers Form 5472, Pro-forma 1120, Section 482 related party transactions, and the 5,000 penalty.
- GEO-optimized with directAnswer, verdict matrices, AI Misses, and decisionTree.
- Verified against 2026 IRS instructions and DataForSEO SERP analysis.

### Architecture Decisions
- Placed under the Compliance pillar to align with the Route Engine strategy.



## [2026-05-09] - Mercury/Relay Banking Guide

### Added
- Mercury/Relay Banking Guide — Content gap filled for non-US founders seeking payout accounts.
- Added src/content/guides/mercury-relay-banking-non-us-founders.mdx.
- Covers: Mercury vs Relay core differences, prohibited countries, required documents.
- GEO-optimized with directAnswer, verdict matrices, AI Misses, and providerFit schema.
- DataForSEO validation and search volume confirmation.
- Addresses the highest priority gap in the content strategy.

### Architecture Decisions
- Adhered strictly to the docs/content-workflow-standards.md 5-step process.
- Implemented GEO frontmatter components without importing them explicitly inside MDX.



## [2026-05-04] - Dark Mode Contrast Optimization & Semantic Token Refactor

### Changed
- **Mass Refactor of Hardcoded Colors**: Automated a sweep across `CostCalculator.tsx`, `RoutePlanner.tsx`, `ProviderCostSnapshot.astro`, and other components to replace non-adaptive utility classes (e.g., `bg-white`, `text-[#0c0a09]`, `bg-gray-50`) with semantic theme variables (`bg-[var(--color-surface-container)]`, `text-[var(--color-text-primary)]`, `bg-[var(--color-surface-dim)]`) for full dark mode compatibility.

### Fixed
- **DirectAnswer Contrast Bug**: Refactored the `DirectAnswer.astro` gradient background from static light colors to `from-[var(--color-surface-dim)] to-[var(--color-surface-container)]`, ensuring text remains readable in dark mode.
- **PillarLayout Hub Contrast Bug**: Updated the "Main question" alert box background in `PillarLayout.astro` from `--color-primary-50` to `--color-surface-dim`.
- **ToolNav Active State Contrast Bug**: Adjusted `ToolNav.astro` active tab background to `--color-surface-dim` instead of a static light blue, fixing contrast issues for tool navigation elements in dark mode.

## [2026-05-04] - 2026 UI Redesign & Premium Dark Mode

### Added
- **Theme Switcher (`ThemeToggle.astro`)**: Created and integrated a client-side dark/light mode toggle with Sun/Moon icons into both desktop and mobile headers.
- **Premium Dark Mode (`#1E2029`)**: Implemented a "Crisp Authority" design language featuring a default light mode with an optional slate-navy dark mode.
- **FOIT Protection (`BaseLayout.astro`)**: Added an inline JavaScript theme initializer to prevent the Flash of Incorrect Theme during page load.

### Changed
- **Tailwind v4 Theme Tokens (`global.css`)**: 
  - Refactored all color tokens to support dynamic light and dark mode mappings via CSS variables.
  - Implemented `.glass-header` and `.brutal-card` improvements for hover-glow effects and elevated aesthetics.
- **Component Alignments**:
  - `Header.astro`: Converted arbitrary var() class names to native Tailwind v4 tokens (e.g., `text-primary`, `bg-action/10`).
  - `Footer.astro`: Changed the background to a premium solid dark slate (`#0f111a`) which acts as a great anchor in both light and dark modes.
  - `Prose.astro`: Added `dark:prose-invert` ensuring all MDX content adapts perfectly to dark mode via the typography plugin.
- **Homepage (`index.astro`)**: Refactored the core layout into a Bento Grid 2.0 structure for decision pillars, with a story-driven abstract hero section.

### Architecture Decisions
- Handled dark mode exclusively with native CSS variables defined under `:root` and `.dark` inside the Tailwind v4 `@theme` block. This is the most performant way to support dark mode on a purely static Astro site without JavaScript hydration delays.
- Removed hardcoded values and replaced them with robust semantic tokens (`bg-surface-dim`, `text-action`).

---

## [2026-05-04] - Internal Link Dictionary Validation & Cleanup

### Fixed
- **Link Dictionary Audit (`src/lib/link-dictionary.ts`)**:
  - Removed AI-generated hallucinated keywords (e.g., "bizee", "inc authority", "nigeria", "pakistan") that do not exist in the current content base by commenting them out.
  - Fixed broken `target` URLs that were incorrectly pointing to non-existent `/guides/` paths.
  - Updated link targets to match the correct pillar-based routing architecture (`/payment-access/`, `/compliance/`, `/address-banking/`).
  - Validated all remaining active keywords against the actual content in `src/content/**/*.mdx`.

### Architecture Decisions
- The `link-dictionary.ts` file now strictly reflects the existing `pillarEnum` structure defined in `src/content.config.ts`.
- Instead of deleting potential future keywords, they are commented out (`//`) to serve as a to-do list for future content expansion.

---

## [2026-05-04] - Typography & Readability Upgrade

### Changed
- **Global Typography Scale**: Systematically bumped up all text sizes across the project to meet WCAG readability standards and improve the mobile experience.
  - Replaced all non-standard `text-[10px]` with `text-xs` (12px) for eyebrows, dates, and micro-labels.
  - Upgraded secondary UI text and meta labels from `text-xs` to `text-sm` (14px).
  - Upgraded main UI paragraphs, card descriptions, and component text from `text-sm` to `text-base` (16px) for standard web readability.
- **Components Updated**: `index.astro`, `PostCard.astro`, Guide components (`AiMissBox.astro`, `DecisionTree.astro`, etc.), Trust Layer components (`AuthorBio.astro`, `Disclaimer.astro`, etc.).

### Architecture Decisions
- Minimum readable text size is now 12px (`text-xs`), eliminating inaccessible 10px fonts.
- Main UI content now uses 16px (`text-base`) to match standard mobile-first accessibility.

---

## [2026-05-04] - Auto-Linking System (Central Static Dictionary)

### Added
- **Automatic Internal Linking System** — Rehype plugin-based auto-linking for all MDX content:
  - **`src/lib/rehype/index.ts`** — Plugin entry point, factory function for Astro's `markdown.rehypePlugins`
  - **`src/lib/rehype/auto-links.ts`** — Core HAST transform logic with word boundary detection, compound keyword handling (longest-match-first), Set-based deduplication
  - **`src/lib/rehype/types.ts`** — TypeScript interfaces: `LinkEntry`, `LinkMatch`, `AutoLinkOptions`, `DedupState`
  - **`src/lib/link-dictionary.ts`** — ★ **Central Static Dictionary** (editöryal kontrol noktası):
    - 27 initial link entries covering: Stripe, PayPal, LLC, registered agent, EIN, BOI, compliance, providers, pillars
    - Compound keywords prioritized (e.g., "stripe connect account" before "stripe")
    - `priority` field for conflict resolution (higher = preferred)
    - `maxOccurrences` per keyword per article
    - `excludePillars` / `excludePages` for fine-grained control

### Changed
- **`astro.config.mjs`** — Added `markdown.rehypePlugins` configuration with `autoLinkPlugin`:
  - Dictionary injected via `LINK_DICTIONARY` import
  - Debug mode enabled in DEV (`import.meta.env.DEV`)
  - Max 10 links per article default

### Architecture Decisions
- **No MDX editing required** — New links added to `link-dictionary.ts` only; all content auto-linked at build time
- **Spam prevention** — Set-based dedup ensures each keyword links only once per article
- **Word boundary detection** — Unicode-aware regex (`/[\p{L}]/u`) prevents partial matches ("strip" won't match "stripe")
- **Compound keyword priority** — Longer phrases matched first via sorted keyword length in regex pattern
- **Fail-safe design** — `failQuietly: true` by default; empty dictionary skips processing without errors
- **Build-time processing** — Rehype plugin runs during Astro's content compilation phase, zero runtime overhead

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/link-dictionary.ts` | **Editöryal kontrol noktası** — Link eklemek/silmek için tek dosya |
| `src/lib/rehype/index.ts` | Astro'ya register edilir (`markdown.rehypePlugins`) |
| `src/lib/rehype/auto-links.ts` | Core transform — HAST tree traversal, text→link conversion |
| `src/lib/rehype/types.ts` | TypeScript types — bağımlılık azaltıcı |

### Usage
```typescript
// Yeni link eklemek için src/lib/link-dictionary.ts:
{
  keyword: "stripe connect",
  target: "/payment-access/stripe-connect",
  priority: 100,
  maxOccurrences: 2,
}
// MDX dosyaları DEĞİŞMEZ — build-time'da otomatik linklenir
```

---

## [2026-05-04] - Content Workflow Standards + SEO Meta Audit

### Added
- **`docs/content-workflow-standards.md`** — Zorunlu içerik üretim standardı:
  - 5-adımlı workflow: Konsept → DataForSEO → Araştırma → Yazım → QC
  - DataForSEO SERP analizi zorunlu (AI Overview durumu, rekabet, fırsat)
  - SEO meta kuralları: `seoTitle` ≤60 char, `seoDescription` ≤160 char
  - GEO template zorunlu alanları: directAnswer, verdict, aiMiss, decisionTree, providerFit
  - Trust Layer: originalityScore, humanGenerated, aiAssisted
  - Quick reference checklist
  - "Yapılmaması gerekenler" listesi
- **`docs/seo-meta-audit-report.md`** — Tam sayfa envanteri + DataForSEO SERP analizi raporu
- **`docs/gsc-analysis-report.md`** — GSC analizi raporu (user created)

### Changed
- **`AGENTS.md`** — İçerik üretim standartları bölümü eklendi (content-workflow-standards.md referansı)

### Architecture Decisions
- Content workflow standardizasyonu: Her yeni içerik için DataForSEO araştırması zorunlu
- SEO meta ayrımı: H1 title'dan bağımsız `seoTitle` ile SERP-optimized başlık
- Route Engine konseptine uygun: LLM-citation-optimized directAnswer formatı

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
