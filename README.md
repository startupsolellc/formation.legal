# Formation.Legal

> Independent, research-driven legal formation guides.

## Overview

Formation.Legal is a static content platform built with **Astro 6.x**, optimized for SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization). The site is deployed to **Cloudflare Pages** as a fully static site with zero client-side JavaScript overhead.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 6.x](https://astro.build/) |
| Language | TypeScript (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Content | Astro Content Collections + MDX |
| SEO | @astrojs/sitemap + custom JSON-LD |
| AI | llms.txt auto-generation |
| Deploy | [Cloudflare Pages](https://pages.cloudflare.com/) |

## Prerequisites

- **Node.js 22.12.0+** (see `.nvmrc`)
- npm 10+

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Authoring

### Adding a New Blog Post

1. Create a new directory in `src/content/posts/`:
   ```
   src/content/posts/your-post-slug/index.mdx
   ```

2. Add frontmatter with required fields:
   ```mdx
   ---
   title: "Your Post Title"
   description: "A brief description of the post."
   pubDate: 2025-01-01
   author: "Your Name"
   originalityScore: 95
   humanGenerated: true
   aiAssisted: false
   category: "LLC Formation"
   tags: ["LLC", "guide"]
   ---

   Your content here...
   ```

3. Run `npm run build` and deploy.

### Trust Layer Fields

Every post includes trust metadata:

| Field | Type | Description |
|-------|------|-------------|
| `originalityScore` | `number (0-100)` | Content originality percentage |
| `humanGenerated` | `boolean` | Whether content is human-written |
| `aiAssisted` | `boolean` | Whether AI tools were used |

## Project Structure

```
├── astro.config.mjs          # Astro + Tailwind + MDX config
├── src/
│   ├── content.config.ts     # Content collection schemas
│   ├── content/posts/        # MDX blog posts
│   ├── layouts/              # Page layouts
│   ├── components/           # Reusable components
│   │   └── seo/              # JSON-LD, TrustBadge
│   ├── pages/                # File-based routing
│   │   ├── blog/             # Blog pages
│   │   ├── llms.txt.ts       # AI-friendly index
│   │   └── robots.txt.ts     # Crawler permissions
│   ├── lib/                  # Utilities & constants
│   └── styles/               # Tailwind CSS global styles
├── public/                   # Static assets
└── dist/                     # Build output (git-ignored)
```

## Deploy to Cloudflare Pages

### Option 1: Dashboard (Recommended)

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create**
2. Select **Pages** → **Connect to Git**
3. Choose your repository
4. Configure build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `22` (set in Environment Variables: `NODE_VERSION=22`)
5. Click **Save and Deploy**

### Option 2: Wrangler CLI

```bash
# Install wrangler globally (if not already)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the site
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=formation-legal
```

### Environment Variables

Set these in Cloudflare Pages dashboard if needed:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_VERSION` | `22` | Required for Astro 6 |

## SEO & AI Features

- **JSON-LD**: Organization, WebSite, Article, BreadcrumbList schemas on every page
- **Trust Layer**: Originality scores, human/AI attribution meta tags
- **llms.txt**: Auto-generated LLM-friendly content index at `/llms.txt`
- **robots.txt**: Explicitly allows AI crawlers (GPTBot, ClaudeBot, etc.)
- **Sitemap**: Auto-generated XML sitemap via @astrojs/sitemap
- **Semantic HTML**: Clean `<article>`, `<header>`, `<nav>`, `<main>`, `<footer>` structure

## License

All rights reserved © Formation.Legal
