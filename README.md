# Formation.Legal

> Independent, research-driven legal formation guides — built with Astro 6, deployed on Cloudflare Pages.

**AI Agents:** Projenin mimarisi, kuralları ve iş akışları için → [AGENTS.md](./AGENTS.md)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Deep Dive](#architecture-deep-dive)
  - [Astro Config](#astro-config)
  - [Content Collections](#content-collections)
  - [Tailwind CSS v4](#tailwind-css-v4)
  - [JSON-LD & Trust Layer](#json-ld--trust-layer)
  - [AI-Friendly Endpoints](#ai-friendly-endpoints)
- [Content Authoring Guide](#content-authoring-guide)
  - [Adding a Blog Post](#adding-a-blog-post)
  - [Adding a Static Page](#adding-a-static-page)
  - [Adding a New Collection](#adding-a-new-content-collection)
- [Component Reference](#component-reference)
- [Styling Guide](#styling-guide)
- [Deploy to Cloudflare Pages](#deploy-to-cloudflare-pages)
- [Common Tasks](#common-tasks)

---

## Overview

Formation.Legal is a fully static content platform optimized for three engines:

| Engine | Strategy |
|--------|----------|
| **SEO** (Google) | JSON-LD, sitemap, semantic HTML, canonical URLs, meta descriptions |
| **AEO** (Answer Engines) | Trust Layer metadata, structured content, FAQ markup ready |
| **GEO** (Generative AI) | `/llms.txt`, AI crawler permissions, clean markdown-parseable HTML |

The site produces **zero client-side JavaScript** — every page is pre-rendered HTML + CSS at build time.

---

## Tech Stack

| Layer | Technology | Version | Config Location |
|-------|-----------|---------|-----------------|
| Framework | [Astro](https://astro.build/) | 6.1.x | `astro.config.mjs` |
| Language | TypeScript | strict | `tsconfig.json` |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | v4.2.x | `src/styles/global.css` |
| Tailwind Plugin | `@tailwindcss/vite` | 4.x | `astro.config.mjs` → `vite.plugins` |
| Typography | `@tailwindcss/typography` | 0.5.x | `global.css` → `@plugin` |
| Content | Astro Content Collections | Built-in | `src/content.config.ts` |
| Content Format | MDX | `@astrojs/mdx` 5.x | `astro.config.mjs` → `integrations` |
| Sitemap | `@astrojs/sitemap` | 3.x | `astro.config.mjs` → `integrations` |
| Fonts | Google Fonts | Inter, Merriweather | `BaseLayout.astro` → `<link>` |
| Deploy | Cloudflare Pages | Static | No adapter needed |

### Important: What's NOT in the Stack

| Omission | Reason |
|----------|--------|
| `@astrojs/cloudflare` | Not needed for static output — adapter is only for SSR |
| `@astrojs/tailwind` | **Deprecated** for Tailwind v4 — use `@tailwindcss/vite` instead |
| `tailwind.config.js` | Tailwind v4 uses CSS-first config (`@theme` directive) |
| Keystatic CMS | Incompatible with Astro 6 (`@keystatic/astro` peer dep: `astro 2-5 only`) |
| React / Vue / Svelte | Not needed — pure Astro components (zero JS on client) |
| Any database | Content lives as MDX files in git |

---

## Prerequisites

- **Node.js 22.12.0+** (enforced in `.nvmrc` and `package.json engines`)
- npm 10+
- Git

```bash
# Check your Node version
node -v  # Must be >= 22.12.0

# If using nvm
nvm use   # Reads .nvmrc automatically
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
formation.legal/
│
├── astro.config.mjs           # Astro configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies & scripts
├── .nvmrc                     # Node.js version (22)
├── AGENTS.md                  # 🤖 Agent/developer onboarding guide
├── README.md                  # 📖 This file
├── CHANGELOG.md               # 📋 Change history
│
├── public/                    # Static assets (copied as-is to dist/)
│   ├── favicon.svg
│   └── favicon.ico
│
├── src/
│   ├── content.config.ts      # ⭐ Content collection definitions + Zod schemas
│   │
│   ├── content/               # 📝 Content source files
│   │   └── posts/             # Blog posts collection
│   │       └── {slug}/        # Each post = folder + index.mdx
│   │           └── index.mdx
│   │
│   ├── layouts/               # 📐 Page layouts
│   │   └── BaseLayout.astro   # Root layout (all pages extend this)
│   │
│   ├── components/            # 🧩 Reusable UI components
│   │   ├── Header.astro       # Site header + navigation
│   │   ├── Footer.astro       # Site footer
│   │   ├── PostCard.astro     # Blog post preview card
│   │   ├── Prose.astro        # Tailwind Typography wrapper
│   │   └── seo/               # SEO-specific components
│   │       ├── JsonLd.astro   # JSON-LD <script> renderer
│   │       └── TrustBadge.astro  # Trust layer visual badge
│   │
│   ├── pages/                 # 🌐 File-based routing
│   │   ├── index.astro        # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro    # Blog listing page
│   │   │   └── [slug].astro   # Dynamic blog post pages
│   │   ├── llms.txt.ts        # AI-friendly content index
│   │   └── robots.txt.ts      # Crawler permissions
│   │
│   ├── lib/                   # 📚 Shared utilities & constants
│   │   ├── constants.ts       # SITE, ORGANIZATION, NAV_ITEMS, etc.
│   │   └── schema.ts          # JSON-LD builder functions
│   │
│   └── styles/                # 🎨 Global styles
│       └── global.css         # Tailwind v4 config + design tokens
│
├── dist/                      # 📦 Build output (git-ignored)
└── docs/                      # 📂 Project documentation
```

---

## Architecture Deep Dive

### Astro Config

**File:** `astro.config.mjs`

```javascript
export default defineConfig({
  site: 'https://formation.legal',  // Used for canonical URLs, sitemap, OG tags
  output: 'static',                 // ⚠️ MUST stay static
  integrations: [mdx(), sitemap()], // MDX content + auto XML sitemap
  vite: {
    plugins: [tailwindcss()],       // Tailwind v4 as Vite plugin
  },
});
```

**Key points:**
- `site` → Used by `Astro.url`, sitemap generation, and JSON-LD builders
- `output: 'static'` → All pages pre-rendered at build time, NO SSR
- Tailwind is a **Vite plugin**, not an Astro integration

---

### Content Collections

**File:** `src/content.config.ts`

Content Collections are Astro's type-safe content management system. We define collections with Zod schemas, and Astro validates frontmatter at build time.

**Current collections:**

| Collection | Path | Format | Description |
|-----------|------|--------|-------------|
| `posts` | `src/content/posts/` | MDX | Blog articles |

**Post schema fields:**

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `title` | `string` | required | Page title + H1 |
| `description` | `string` | required | Meta description + OG description |
| `pubDate` | `Date` | required | Publication date |
| `updatedDate` | `Date?` | — | Last modification date |
| `author` | `string` | `"Formation.Legal Editorial"` | Author attribution |
| `originalityScore` | `number (0-100)` | `95` | Trust Layer: content originality |
| `humanGenerated` | `boolean` | `true` | Trust Layer: human authorship |
| `aiAssisted` | `boolean` | `false` | Trust Layer: AI tool usage |
| `canonicalUrl` | `string?` | — | Override canonical URL |
| `noindex` | `boolean` | `false` | Exclude from search + sitemap |
| `category` | `string` | `"General"` | Content category |
| `tags` | `string[]` | `[]` | Content tags |

**Astro 6 Content API:**

```typescript
// Query all posts
import { getCollection } from 'astro:content';
const posts = await getCollection('posts');

// Render a post
import { render } from 'astro:content';
const { Content } = await render(post);

// Access data
post.id       // → slug (e.g. "what-is-llc-formation")
post.data     // → typed frontmatter object
```

> ⚠️ **Astro 6 Breaking Change:** `post.slug` is gone. Use `post.id` instead.
> `post.render()` is gone. Use `render(post)` from `astro:content`.

---

### Tailwind CSS v4

**File:** `src/styles/global.css`

Tailwind v4 uses a **CSS-first configuration** paradigm. There is NO `tailwind.config.js` file.

**How it works:**
```css
/* 1. Import Tailwind */
@import "tailwindcss";

/* 2. Load plugins via @plugin */
@plugin "@tailwindcss/typography";

/* 3. Define design tokens via @theme */
@theme {
  --color-primary-500: oklch(0.50 0.14 240);
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

**Color system:** OKLCH color space for perceptual uniformity.

| Token Group | Hue | Purpose |
|-------------|-----|---------|
| `--color-primary-*` | 240 (navy) | Brand, headings, body text |
| `--color-accent-*` | 250 (blue) | Links, CTAs, active states |
| `--color-surface*` | 240 (warm white) | Backgrounds |
| `--color-border` | 240 (light gray) | Borders, dividers |
| `--color-muted` | 240 (mid gray) | Secondary text |
| `--color-trust` | 155 (green) | Trust signals |

**Using colors in templates:**
```html
<!-- Use CSS custom properties (works everywhere) -->
<div class="text-[var(--color-primary-900)]">

<!-- Or use Tailwind's generated utilities -->
<div class="text-primary-900">
```

---

### JSON-LD & Trust Layer

**Files:** `src/lib/schema.ts`, `src/components/seo/JsonLd.astro`, `src/components/seo/TrustBadge.astro`

Every page gets structured data automatically via `BaseLayout.astro`:

```
BaseLayout renders:
├── Organization schema (always)
├── WebSite schema (always)
└── Page-specific schemas (via `schemas` prop)
    ├── Article (blog posts)
    └── BreadcrumbList (blog listing + posts)
```

**Available builder functions in `src/lib/schema.ts`:**

| Function | Schema Type | Used On |
|----------|-------------|---------|
| `buildOrganizationSchema()` | Organization | All pages (auto) |
| `buildWebSiteSchema()` | WebSite | All pages (auto) |
| `buildArticleSchema(input)` | Article | Blog posts |
| `buildBreadcrumbSchema(items)` | BreadcrumbList | Blog listing + posts |

**Trust Layer** adds non-standard extensions to Article schema:
- `x-originality-score` — Content originality percentage
- `x-human-generated` — Whether human authored
- `x-ai-assisted` — Whether AI tools were used

These are also rendered as `<meta>` tags by `TrustBadge.astro`.

---

### AI-Friendly Endpoints

| Endpoint | File | Spec | Description |
|----------|------|------|-------------|
| `/llms.txt` | `src/pages/llms.txt.ts` | [llmstxt.org](https://llmstxt.org) | Curated site index for LLMs |
| `/robots.txt` | `src/pages/robots.txt.ts` | Standard | Crawler permissions |
| `/sitemap-index.xml` | Auto-generated | Sitemap Protocol | All page URLs |

**Allowed AI crawlers (in robots.txt):**
GPTBot, ChatGPT-User, Google-Extended, Anthropic-AI, ClaudeBot, PerplexityBot

Both `llms.txt` and `robots.txt` are TypeScript files that generate plain text at build time.
They automatically include all posts from the content collections.

---

## Content Authoring Guide

### Adding a Blog Post

1. **Create the content file:**
   ```
   src/content/posts/your-post-slug/index.mdx
   ```

2. **Add frontmatter:**
   ```mdx
   ---
   title: "Your Post Title"
   description: "Brief description for SEO (max ~155 chars)"
   pubDate: 2025-06-15
   author: "Formation.Legal Editorial"
   originalityScore: 95
   humanGenerated: true
   aiAssisted: false
   category: "LLC Formation"
   tags: ["LLC", "guide", "formation"]
   ---

   ## First Heading

   Your content here. Standard markdown works, plus JSX components.
   ```

3. **Build & verify:**
   ```bash
   npm run build
   # Check the new page exists:
   ls dist/blog/your-post-slug/index.html
   ```

The new post will automatically appear in:
- Blog listing page (`/blog`)
- Homepage "Latest Guides" section
- Sitemap (`/sitemap-index.xml`)
- LLM index (`/llms.txt`)

### Adding a Static Page

Create a new `.astro` file in `src/pages/`:

```astro
---
// src/pages/about.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import { buildBreadcrumbSchema } from '../lib/schema';

const breadcrumb = buildBreadcrumbSchema([
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
]);
---

<BaseLayout
  title="About Formation.Legal"
  description="Learn about our mission and editorial standards."
  schemas={[breadcrumb]}
>
  <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
    <h1 class="text-3xl font-bold text-[var(--color-primary-950)]">
      About Us
    </h1>
    <div class="prose prose-lg mt-8">
      <p>Content here...</p>
    </div>
  </section>
</BaseLayout>
```

Don't forget to add navigation:
```typescript
// src/lib/constants.ts
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },  // ← add this
] as const;
```

### Adding a New Content Collection

1. **Define the collection** in `src/content.config.ts`:
   ```typescript
   const guides = defineCollection({
     loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
     schema: z.object({
       title: z.string(),
       description: z.string(),
       // ... your fields
     }),
   });

   export const collections = { posts, guides };
   ```

2. **Create content directory:** `src/content/guides/`

3. **Create list page:** `src/pages/guides/index.astro`

4. **Create detail page:** `src/pages/guides/[slug].astro` with `getStaticPaths()`

5. **Update llms.txt** if appropriate (`src/pages/llms.txt.ts`)

---

## Component Reference

### BaseLayout

Root layout — **every page must use this**.

```astro
<BaseLayout
  title="Page Title"              {/* Required */}
  description="Meta description"   {/* Optional, defaults to SITE.description */}
  canonicalUrl="https://..."       {/* Optional, defaults to current URL */}
  ogImage="https://..."            {/* Optional OG image */}
  noindex={false}                  {/* Optional, set true for drafts */}
  schemas={[schema1, schema2]}     {/* Optional, page-specific JSON-LD */}
>
  <slot name="head">              {/* Optional: extra <head> content */}
  <slot>                           {/* Main page content */}
</BaseLayout>
```

### PostCard

Blog preview card for listing pages.

```astro
<PostCard
  title="Post Title"
  description="Brief description"
  pubDate={new Date('2025-01-01')}
  slug="post-slug"
  author="Author Name"
  humanGenerated={true}
  aiAssisted={false}
  category="LLC Formation"
/>
```

### TrustBadge

Renders trust metadata (visual badge + `<meta>` tags).

```astro
<TrustBadge
  originalityScore={95}
  humanGenerated={true}
  aiAssisted={false}
/>
```

### JsonLd

Renders JSON-LD `<script>` tags. Accepts single object or array.

```astro
<JsonLd schema={mySchemaObject} />
<JsonLd schema={[schema1, schema2]} />
```

### Prose

Wraps rendered markdown with Tailwind Typography styles.

```astro
<Prose>
  <Content />
</Prose>
```

---

## Styling Guide

### Adding a New Color

Edit `src/styles/global.css` → `@theme` block:
```css
@theme {
  --color-warning: oklch(0.80 0.18 80);
}
```
Then use: `text-[var(--color-warning)]` or `text-warning`

### Layout Spacing Convention

All content sections follow this pattern:
```html
<section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
  <!-- content -->
</section>
```
- `max-w-5xl` = 64rem content width
- `px-4 sm:px-6` = responsive horizontal padding
- `py-12` = vertical section spacing

---

## Deploy to Cloudflare Pages

### Option 1: Dashboard (Recommended for Auto-Deploy)

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create**
2. Select **Pages** → **Connect to Git**
3. Choose `startupsolellc/formation.legal` repository
4. Build settings:
   | Setting | Value |
   |---------|-------|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
5. Environment variables:
   | Variable | Value |
   |----------|-------|
   | `NODE_VERSION` | `22` |
6. Click **Save and Deploy**

Every push to `main` will trigger auto-deploy.

### Option 2: Wrangler CLI (Manual Deploy)

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Build & deploy
npm run build
npx wrangler pages deploy dist --project-name=formation-legal
```

---

## Common Tasks

| Task | Command / Location |
|------|--------------------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Preview prod build | `npm run preview` |
| Add a blog post | Create `src/content/posts/{slug}/index.mdx` |
| Add a static page | Create `src/pages/{name}.astro` |
| Change site metadata | Edit `src/lib/constants.ts` |
| Change colors/fonts | Edit `src/styles/global.css` → `@theme` |
| Add nav item | Edit `src/lib/constants.ts` → `NAV_ITEMS` |
| Add JSON-LD schema | Add function to `src/lib/schema.ts` |
| Deploy | `npm run build && npx wrangler pages deploy dist` |
| Verify JSON-LD | `grep "application/ld+json" dist/path/index.html` |

---

## License

All rights reserved © Formation.Legal
