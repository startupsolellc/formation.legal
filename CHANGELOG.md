# Changelog

All notable changes to this project will be documented in this file.

**🤖 DEVELOPER AGENT INSTRUCTIONS:**
- Always add new entries to the top of the list (below this header).
- Use the format: `## [YYYY-MM-DD] - Session/Feature Title`
- Group changes by: `### Added`, `### Changed`, `### Fixed`, `### Security`.
- Be detailed but concise. Mention key files and architectural decisions.
- **This file must be updated at the end of every development session.**

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
