# Z-Beam Laser Cleaning Project

## 🚀 Project Roadmap & Architecture

This README is the single source of truth for building, maintaining, and extending the Z-Beam project. It integrates all critical principles, workflows, and enforcement mechanisms from previous documentation.

---

## 1. Core Mandate & Principles

- **MODIFY BEFORE CREATE**: Always extend existing components; new components are strictly prohibited unless all extension options are exhausted and justified.
- **Smallest codebase wins**: Fewer files, less complexity, and maximum reuse.
- **Zero component duplication**: Each UI pattern must exist exactly once.
- **Strict anti-bloat**: Every change must reduce code size or improve clarity.

---

## 2. Directory & File Structure

```
/
├── app/                    # Next.js application
│   ├── components/         # Shared React components
│   ├── materials/          # Material pages
│   ├── css/                # Global styles
│   ├── utils/              # Utility functions
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── public/                 # Static assets
│   └── images/             # Image assets
├── content/                # All MDX/MD files (read-only)
│   ├── application/        # Application articles
│   ├── author/             # Author profiles
│   ├── material/           # Material articles
│   ├── region/             # Region content
│   └── thesaurus/          # Terminology
├── docs/                   # Documentation (archived)
├── package.json            # NPM scripts & dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── REQUIREMENTS.md         # Architecture principles
├── PROJECT_GUIDE.md        # Workflow & enforcement
└── README.md               # This file
```

---

## 3. Content Architecture & System

### Content Organization
- `/content/` - Root for all content, organized by category
  - `/application/` - Application-focused articles
  - `/author/` - Author profile pages
  - `/material/` - Material-specific laser cleaning articles
  - `/region/` - Region-specific content
  - `/thesaurus/` - Terminology and definitions
- `/app/[slug]/` - Unified dynamic route for all content types
- `/app/authors/[slug]/` - Dedicated author profile pages
- `/app/articles/` - Index page listing all articles
- `/app/authors/` - Index page listing all authors
- `/app/applications/` - Index page listing application articles
- `/app/regions/` - Index page listing region articles
- `/app/thesaurus/` - Index page listing thesaurus entries

### Content Categories
Each MDX/MD file in `/content/` must include an `articleType` field in its frontmatter:
```yaml
---
title: "Article Title"
articleType: "material"
# Other frontmatter fields...
---
```
Supported types:
- `material` - Material articles
- `author` - Author profiles
- `region` - Region-specific content
- `application` - Application-specific content
- `thesaurus` - Thesaurus/dictionary entries

### Content System Features
- **Unified Content API**: All content accessed via `utils/content.ts`
- **Type-Safe Architecture**: Strong TypeScript typings, clear metadata/content separation
- **Performance Optimized**: Content is cached, efficient filtering by author/tag

### Usage Examples
```typescript
import { getList, getArticleBySlug } from 'app/utils/utils';
const allArticles = getList();
const article = getArticleBySlug('aluminum-laser-cleaning');

import { getArticlesByAuthorId, getArticlesByTag } from 'app/utils/utils';
const authorArticles = getArticlesByAuthorId(1);
const taggedArticles = getArticlesByTag('Aluminum');

import { getAllAuthors, getAuthorBySlug, getAllTags, getTagStats } from 'app/utils/utils';
const authors = getAllAuthors();
const tagStats = getTagStats();
```

### Components
- `List` - Displays a list of articles
- `AuthorArticles` - Shows articles by author
- `TagDirectory` - Shows all tags with counts

### Backwards Compatibility
Legacy imports still work:
```typescript
import { getList } from 'app/utils/utils';
const materials = getList();
const articles = getList();
```

---

## 4. Development Workflow

### Essential Commands

```bash
npm install                # Install dependencies
npm run dev                # Start dev server with health checks
npm run build              # Full build with all checks
npm run start              # Start production server
npm run enforce-components # Check component rules
npm run create:component   # Safely create new component (last resort)
```

- **Health checks** run before dev server starts (port, CSS, dependencies, component system, TypeScript, environment).
- **Pre-commit hooks** and **CI pipeline** enforce compliance with all mandates.
- **Emergency bypass**: Use `npm run dev:direct` to start server regardless of issues.

---

## 5. Utility Functions & Content System

Utilities are organized in `/app/utils/`:
- `utils.ts` - Main entry point
- `formatting.ts` - Text/date formatting
- `validation.ts` - Data validation
- `helpers.ts` - React/UI helpers
- `metadata.ts` - MDX frontmatter parsing
- `mdx.ts` - MDX file reading/processing
- `constants.ts` - App constants

**Content Loader:**
- Loads all `.md` and `.mdx` files from `/content/`
- Categorizes by directory and frontmatter (`articleType`)
- Supports region, author, material, application, thesaurus
- Used by dynamic routes (e.g., `/app/region/[slug]/page.tsx`)

---

## 6. Safety Mechanisms & Self-Audit

- **Automatic exclusions**: Shared components are excluded from enforcement
- **Safe creation tools**: Guided process for new components (only if extension is impossible)
- **Configurable thresholds**: Easily adjust enforcement strictness
- **Self-audit scripts**: Validate documentation for brevity, clarity, and duplication
- **Build-time validation**: All checks run before build completes

---

## 7. Troubleshooting & Emergency Bypass

- **If port 3000 is busy:**
  ```bash
  npm run kill-port
  ```
- **If CSS doesn't load:**
  - Check imports and config
  - Run `npm run ready` for health check
- **If build fails:**
  - Review error messages for enforcement violations
  - Reference `PROJECT_GUIDE.md` for compliance steps
- **Emergency bypass:**
  ```bash
  npm run dev:direct
  ```

---

## 8. Previous Documentation

All legacy documentation is archived in `docs/archived/` for reference only. This README, REQUIREMENTS.md, and PROJECT_GUIDE.md are the only authoritative sources.

---

## 9. Quick Start

```bash
npm install
npm run dev
npm run build
npm run start
```

For detailed workflow and component usage, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).
