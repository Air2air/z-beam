# Z-Beam Laser Cleaning Project

## 🚀 Project Roadmap & Architecture

This README is the single source of truth for building, maintaining, and extending the Z-Beam project. It integrates all critical principles, workflows, and enforcement mechanisms from previous documentation.

**� Smart Deploy System Active** - Combined deployment and monitoring system using `smart-deploy.sh`.

---

## 1. Core Mandate & Principles

- **MODIFY BEFORE CREATE**: Always extend existing components; new components are strictly prohibited unless all extension options are exhausted and justified.
- **Smallest codebase wins**: Fewer files, less complexity, and maximum reuse.
- **Zero component duplication**: Each UI pattern must exist exactly once.
- **Strict anti-bloat**: Every change must reduce code size or improve clarity.
- **Consistent imports**: Always use `@/` path aliases for app/ and types/ imports (enforced by ESLint)
- **Type safety**: Progressive TypeScript strictness with `noImplicitAny` and `strictFunctionTypes` enabled

---

## 2. Directory & File Structure

```
/
├── app/                    # Next.js application
│   ├── components/         # Shared React components
│   ├── config/             # Configuration
│   │   └── env.ts          # Centralized environment variables
│   ├── materials/          # Material pages
│   ├── css/                # Global styles
│   ├── utils/              # Utility functions
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── public/                 # Static assets
│   └── images/             # Image assets (see docs/IMAGE_NAMING_CONVENTIONS.md)
├── frontmatter/            # Material metadata (YAML files)
│   └── materials/          # Material frontmatter (132 files)
├── static-pages/           # Static page metadata (YAML files)
│   ├── services.yaml       # Services page metadata
│   ├── rental.yaml         # Rental page metadata
│   ├── partners.yaml       # Partners page metadata
│   ├── netalux.yaml        # Netalux page metadata
│   ├── contact.yaml        # Contact page metadata
│   └── home.yaml           # Home page metadata
├── scripts/                # Utility scripts
│   ├── deployment/         # Deployment scripts
│   │   ├── smart-deploy.sh # Main deployment script
│   │   └── deploy-prod.sh  # Direct production deploy
│   └── validation/         # Validation scripts
├── docs/                   # Documentation (archived)
├── package.json            # NPM scripts & dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── .eslintrc.json          # ESLint config (enforces @/ imports)
├── REQUIREMENTS.md         # Architecture principles
├── PROJECT_GUIDE.md        # Workflow & enforcement
└── README.md               # This file
```

---

## 3. Content Architecture & System

### Content Organization
- `/frontmatter/` - Material metadata (YAML files)
  - `/materials/` - Material frontmatter (132 YAML files)
- `/static-pages/` - Static page metadata (YAML files)
  - Page-level YAML files (home.yaml, services.yaml, rental.yaml, etc.)
- `/app/materials/[category]/` - Material category pages
- `/app/materials/[category]/[subcategory]/` - Material subcategory pages
- `/app/materials/[category]/[subcategory]/[slug]/` - Individual material pages
- Static pages: `/services`, `/rental`, `/about`, `/contact`, etc.

### Material Frontmatter Structure
Each YAML file in `/frontmatter/materials/` contains structured metadata:
```yaml
---
name: "Aluminum"
slug: "aluminum-laser-cleaning"
category: "metal"
subcategory: "non-ferrous"
title: "Laser Cleaning for Aluminum | Z-Beam"
description: "Professional aluminum laser cleaning services..."
# Images, properties, SEO data, etc.
---
```
Material categories:
- `metal` - Ferrous, non-ferrous, alloy, specialty
- `ceramic` - Oxide, structural, technical
- `composite` - Fiber-reinforced, structural
- `glass` - Standard, specialty, technical
- `polymer` - Thermoplastic, thermoset, elastomer
- `stone` - Natural, engineered, specialty
- `wood` - Hardwood, softwood, engineered
- `rare-earth` - Lanthanides and related materials

### Content System Features
- **Unified Content API**: All content accessed via `utils/content.ts`
- **Type-Safe Architecture**: Strong TypeScript typings, clear metadata/content separation
- **Performance Optimized**: Content is cached, efficient filtering by author/tag

### Usage Examples
```typescript
// ✅ Use @/ path aliases (enforced by ESLint)
import { getArticle } from '@/app/utils/contentAPI';
// Get material by full path
const article = await getArticle('metal', 'non-ferrous', 'aluminum-laser-cleaning');

import { getAllCategories, getSubcategoryInfo } from '@/app/utils/materialCategories';
// Get all categories with counts
const categories = getAllCategories();
// Get subcategory metadata
const subcategoryInfo = getSubcategoryInfo('metal', 'non-ferrous');

import { getAllAuthors, getAuthorBySlug } from '@/app/utils/utils';
const authors = getAllAuthors();

// Environment variables (centralized)
import { ENV, isProduction } from '@/app/config/env';
if (isProduction()) {
  console.log(`Base URL: ${ENV.BASE_URL}`);
}
```

### Components
- `List` - Displays a list of articles
- `AuthorArticles` - Shows articles by author
- `Table` - Enhanced Smart Table component with intelligent frontmatter organization, multiple display modes (content/technical/hybrid), and centralized type system
- `Caption` - Before/after text content for laser cleaning descriptions
- `MetricsCard` - **Individual metric card component** - Displays single metrics with progress bars and smart value positioning
- `MetricsGrid` - **Metrics grid container** - Renders collections of MetricsCard components with title mapping

### Backwards Compatibility
Legacy imports still work:
```typescript
import { getList } from 'app/utils/utils';
const materials = getList();
const articles = getList();
```

---

## 4. Centralized Architecture

### Site Configuration (SITE_CONFIG)
The Z-Beam project uses a **centralized configuration system** for all site-wide settings:

- **Single Source of Truth**: `app/utils/constants.ts` contains `SITE_CONFIG` with all site configuration
- **Complete Coverage**: Company info, contact details, URLs, social media, schema.org settings
- **Easy Rebranding**: Change company name, URLs, or contact info in one place
- **Type Safe**: TypeScript ensures correct usage throughout the application
- **Author Preservation**: Article authors are preserved; SITE_CONFIG.author used only as fallback

**Key SITE_CONFIG Sections:**
- Identity & Branding (name, shortName, author, description)
- Contact Information (email, phone for general/sales/support)
- Address & Business Hours
- Social Media URLs (Twitter, Facebook, LinkedIn, YouTube)
- Media Assets (logos, favicons, YouTube config)
- Email Configuration
- Schema.org structured data contexts
- SEO keywords and metadata

📖 **Full Documentation**: [SITE_CONFIG Guide](docs/guides/SITE_CONFIG_GUIDE.md)

**Usage Example:**
```typescript
import { SITE_CONFIG } from '@/app/utils/constants';

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Contact ${SITE_CONFIG.shortName}`,
    description: `Get in touch with ${SITE_CONFIG.shortName}'s team...`
  };
}

// Use in Schema.org JSON-LD
const schema = {
  '@context': SITE_CONFIG.schema.context,
  '@type': SITE_CONFIG.schema.organizationType,
  name: SITE_CONFIG.shortName,
  url: SITE_CONFIG.url
};
```

---

## 5. Build-Time Requirements & Automation

### Mandatory Build-Time Scripts

All production builds **automatically execute** critical validation and generation scripts via npm lifecycle hooks (`prebuild` → `build` → `postbuild`).

**🚨 CRITICAL**: These scripts CANNOT be bypassed in production builds.

#### Automatic Execution Order

```bash
npm run build  # Production build
```

**Executes**:
1. **prebuild** (automatic):
   - `validate:naming` - Enforce file naming conventions
   - `validate:metadata` - Validate frontmatter structure
   - `verify:sitemap` - Check sitemap configuration
   - `generate:datasets` - Generate static dataset files (JSON/CSV/TXT)

2. **build**: `next build`

3. **postbuild** (automatic):
   - `validate:urls` - Validate JSON-LD URLs

#### Critical Scripts

| Script | Purpose | When | Failure Blocks Build |
|--------|---------|------|---------------------|
| `generate:datasets` | Generate 396 dataset files (132 materials × 3 formats) | prebuild | ✅ Yes |
| `validate:metadata` | Validate frontmatter structure & required fields | prebuild | ✅ Yes |
| `validate:naming` | Enforce naming conventions | prebuild | ✅ Yes |
| `verify:sitemap` | Verify sitemap generation | prebuild | ✅ Yes |
| `validate:urls` | Validate JSON-LD URLs | postbuild | ✅ Yes |

#### Runtime Generation (NOT Build-Time)

**JSON-LD Schemas**: Generated at runtime per request via `SchemaFactory.ts`
- Why: Dynamic content needs current data, better for SEO
- Where: Material pages, category pages, static pages, layouts
- Implementation: `app/utils/schemas/SchemaFactory.ts`

#### Safety Mechanisms

❌ **Prohibited in production builds**:
- `--skip-validation`, `--no-validate`, `--force`
- Error suppression (`|| true`)
- Manual bypass flags

✅ **Enforced by**:
- Test suite: `tests/build/build-time-requirements.test.ts`
- Package.json validation
- CI/CD integration

#### Development Fast Build

```bash
npm run build:fast  # Skips validations (development only)
```

⚠️ **Never use in production or CI/CD!**

📖 **Full Documentation**: [Build-Time Requirements](docs/BUILD_TIME_REQUIREMENTS.md)

---

## 6. Development Workflow

### TypeScript Type System
The Z-Beam project uses a **centralized type system** for consistency and maintainability:

- **Single Source of Truth**: `types/centralized.ts` contains all core type definitions
- **Type Families**: Organized re-exports in `types/families/` for better import organization
- **Zero Duplication**: Eliminated 200+ scattered interface definitions

### Key Type Categories

```typescript
// Core Content Types
import { ArticleMetadata, AuthorInfo, SearchResultItem } from '@/types';

// UI Component Types  
import { BadgeData, ComponentData, UIBadgeProps } from '@/types';

// Specialized Metadata
import { MaterialMetadata, ApplicationMetadata } from '@/types';

// API Types
import { SearchApiResponse, MaterialsApiResponse } from '@/types';
```

### Recent Consolidations
- ✅ **SearchResultItem**: 6 definitions → 1 comprehensive interface
- ✅ **BadgeData**: Unified UI badges + chemical badges
- ✅ **AuthorInfo**: Consolidated AuthorInfo + AuthorMetadata  
- ✅ **PageProps**: Modern Promise-based async params
- ✅ **Specialized Metadata**: All moved to centralized source
- ✅ **Type Deduplication (Oct 2025)**: Removed 8 duplicate type exports
  - BreadcrumbsProps, ButtonProps, GridColumns, GridGap, GridContainer, StandardGridProps, NavItem, SEOCaptionProps
  - All component and config files now import from `@/types`
  - 100% consolidation achieved - `types/centralized.ts` is the single source of truth

📖 **Full Documentation**: [Type System Architecture](docs/TYPE_SYSTEM_ARCHITECTURE.md) | [Type System Audit](TYPE_SYSTEM_AUDIT.md)

---

## 5. Development Workflow

### Essential Commands

```bash
npm install                # Install dependencies
npm run dev                # Start dev server with health checks
npm run dev:safe           # Safe start with automatic cleanup (recommended)
npm run build              # Full build with all checks
npm run start              # Start production server
npm run deploy             # Deploy to production
npm run deploy:monitor     # Deploy and start monitoring
npm run monitor            # Monitor existing deployments
npm run enforce-components # Check component rules
npm run create:component   # Safely create new component (last resort)
```

- **Health checks** run before dev server starts (port, CSS, dependencies, component system, TypeScript, environment).
- **Pre-commit hooks** and **CI pipeline** enforce compliance with all mandates.
- **Emergency bypass**: Use `npm run dev:direct` to start server regardless of issues.

### Process Monitoring & Cleanup

**Prevent runaway/hanging processes that plague Copilot:**

```bash
# Before starting work
npm run dev:health         # Full environment health check
npm run dev:safe           # Safe start with automatic cleanup

# During development
npm run dev:detect         # Scan for runaway processes
npm run dev:watch          # Continuous monitoring (every 30s)

# When things go wrong
npm run dev:stop-all       # Emergency stop - kills ALL dev processes
AUTO_KILL=true npm run dev:cleanup  # Auto-kill stuck processes
```

**Quick Reference:**
- **Sluggish Copilot?** → `npm run dev:detect` then `npm run dev:stop-all`
- **Build won't start?** → `npm run dev:stop-all` then `npm run clean && npm run build`
- **High CPU/Memory?** → `AUTO_KILL=true npm run dev:cleanup`
- **Long session?** → `npm run dev:watch` in background terminal

**See:** `PROCESS_MONITORING_QUICK_REF.md` for detailed usage and `docs/PROCESS_MONITORING.md` for full documentation.

### Code Standards & Enforcement

**Import Path Standards** (Enforced by ESLint):
```typescript
// ✅ Correct - Use @/ path aliases
import { Component } from '@/app/components/Component';
import { Type } from '@/types';
import { ENV } from '@/app/config/env';

// ❌ Wrong - Relative imports will fail ESLint
import { Component } from '../../app/components/Component';
import { Type } from '../../types';
```

**Environment Variables**:
```typescript
// ✅ Correct - Use centralized ENV config
import { ENV, isProduction } from '@/app/config/env';
const baseUrl = ENV.BASE_URL;

// ❌ Wrong - Direct process.env access (not enforced, but discouraged)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
```

**TypeScript Standards**:
- `noImplicitAny: true` - All variables must have explicit types
- `strictFunctionTypes: true` - Strict function type checking
- `strictNullChecks: true` - Null safety checks
- Progressive migration toward full `strict: true`

**ESLint Rules** (Errors, not warnings):
- `@typescript-eslint/no-explicit-any` - Avoid `any` types
- `@typescript-eslint/no-unused-vars` - No unused variables
- `prefer-const` - Use `const` when possible
- `no-restricted-imports` - Enforce `@/` path aliases

---

## 8. Smart Deploy & Monitor System

### Unified Deployment System

Z-Beam uses a combined deployment and monitoring system built around `smart-deploy.sh`.

**Quick Deploy:**
```bash
# Automatic via GitHub Actions
git push origin main

# Manual deployment
./scripts/deployment/smart-deploy.sh deploy

# Manual with monitoring
./scripts/deployment/smart-deploy.sh deploy-monitor
```

### Smart Deploy Commands

**Deployment:**
```bash
./scripts/deployment/smart-deploy.sh deploy          # Deploy to production
./scripts/deployment/smart-deploy.sh deploy-monitor  # Deploy and start monitoring
```

**Monitoring:**
```bash
./scripts/deployment/smart-deploy.sh monitor         # Monitor latest deployment
./scripts/deployment/smart-deploy.sh start           # Start monitoring active deployments
./scripts/deployment/smart-deploy.sh status          # Check monitoring status
./scripts/deployment/smart-deploy.sh logs            # Show live deployment logs
./scripts/deployment/smart-deploy.sh list            # List recent deployments
./scripts/deployment/smart-deploy.sh stop            # Stop monitoring
```

**NPM Scripts:**
```bash
npm run deploy            # Deploy to production (uses scripts/deployment/smart-deploy.sh)
npm run deploy:monitor    # Deploy and start monitoring
npm run monitor           # Monitor existing deployments
```

### Manual Deployment Required

**Auto-deploy is disabled.** Deploy using Vercel CLI:

```bash
# Deploy to production
vercel --prod

# Monitor deployment
npm run monitor
```

**Why Manual?**
- Quality control before production releases
- Prevents duplicate/conflicting deployments  
- Better tracking and intentional releases

### System Features

**Deployment tools:**
- ✅ Manual production deployment via Vercel CLI
- ✅ Real-time monitoring with 5-second updates
- ✅ Colored output for status clarity
- ✅ Auto-stops when deployment completes
- ✅ VS Code task integration
npm run deploy:stats      # Success rate & analytics
npm run deploy:analyze    # Analyze latest error

# Manual
vercel --prod            # Direct deployment (bypasses monitoring)
vercel ls                # List recent deployments
vercel logs --follow     # Stream logs
```

### Error Handling

The system detects and provides fixes for 17 error types:
- Missing modules/dependencies
- TypeScript errors
- File not found
- Build failures
- Memory limits
- Environment variables
- API routes
- And more...

Errors saved to: `.vercel-deployment-error.log`

### Documentation

**Deployment:**
- **[Complete Guide](./docs/deployment/README.md)** - Full deployment system documentation
- **[Testing Guide](./docs/deployment/TESTING.md)** - Test suite (46 tests)
- **[Troubleshooting](./docs/DEPLOYMENT_TROUBLESHOOTING.md)** - Common issues
- **[Fixes Summary](./DEPLOYMENT_FIXES_SUMMARY.md)** - Recent v2.1 fixes
- **[Changelog](./DEPLOYMENT_CHANGELOG.md)** - Version history

**Categorized Material Properties (NEW ⭐):**
- **[Quick Start](./docs/CATEGORIZED_PROPERTIES_README.md)** - Overview and getting started
- **[Frontend Implementation](./docs/CATEGORIZED_PROPERTIES_FRONTEND_IMPLEMENTATION.md)** - Technical details
- **[Migration Guide](./docs/MIGRATION_CATEGORIZED_PROPERTIES.md)** - Flat to categorized migration
- **[Testing Guide](./docs/METRICSCARD_CATEGORIZED_TESTING.md)** - Test suite and strategies
- **[Sample File](./frontmatter/materials/aluminum-test-categorized.yaml)** - Complete example

**System Status**: ✅ Operational (100% success rate since v2.1)

---

## 6. Utility Functions & Content System

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

## 7. Safety Mechanisms & Self-Audit

- **Automatic exclusions**: Shared components are excluded from enforcement
- **Safe creation tools**: Guided process for new components (only if extension is impossible)
- **Configurable thresholds**: Easily adjust enforcement strictness
- **Self-audit scripts**: Validate documentation for brevity, clarity, and duplication
- **Build-time validation**: All checks run before build completes

---

## 10. Component Architecture Status

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

## 9. Previous Documentation

All legacy documentation is archived in `docs/archived/` for reference only. This README, REQUIREMENTS.md, and PROJECT_GUIDE.md are the only authoritative sources.

## 11. Author Integration Status

Z-Beam uses a simplified, centralized author architecture with global rendering and YAML-based content management.

### Key Features
- **Global Author Rendering**: Authors appear consistently in the header section of all pages
- **YAML-Based Content**: Author data stored in structured YAML files
- **Centralized Types**: Single source of truth for TypeScript definitions
- **Clean Separation**: Author logic separated from property components

### Author System Structure
```
content/components/author/          # Author YAML files
├── ikmanda-roswati.yaml           # Author profiles
└── todd-dunning.yaml              # With structured data

types/centralized.ts               # Type definitions
app/components/Layout/Layout.tsx   # Global author rendering
app/components/Author/Author.tsx   # Author display component
app/utils/contentAPI.ts           # YAML processing
```

### Architecture Documentation
- **Architecture Guide**: [`docs/AUTHOR_ARCHITECTURE.md`](./docs/AUTHOR_ARCHITECTURE.md)
- **Technical Implementation**: [`docs/TECHNICAL_IMPLEMENTATION.md`](./docs/TECHNICAL_IMPLEMENTATION.md)
- **Migration Guide**: [`docs/MIGRATION_GUIDE.md`](./docs/MIGRATION_GUIDE.md)

### Verified Working State
- ✅ **Aluminum pages**: Ikmanda Roswati (Indonesia, Ph.D.)
- ✅ **Copper pages**: Todd Dunning (United States, MA)
- ✅ **Clean component separation**: No embedded author logic in property tables

---

## 12. Unified Metrics Component Architecture

Z-Beam implements a specialized MetricsCard system with progress bar visualization and intelligent value positioning for optimal data display.

### Key Features
- **Progress Bar Visualization**: Visual progress bars with percentage completion based on min/max ranges
- **Dynamic Value Positioning**: Smart positioning prevents value overflow at progress bar edges
- **Title Mapping System**: Custom abbreviated property names for better display
- **Nested Data Support**: Handles complex YAML structures with {value, unit, min, max} properties
- **Type-Safe Processing**: Full TypeScript support with comprehensive error handling

### Component Architecture
```typescript
// MetricsGrid renders collections of MetricsCard components
<MetricsGrid 
  data={frontmatter}            // YAML frontmatter data
  title="Material Properties & Specifications"
  maxCards={8}                  // Limit display for performance
/>

// Individual MetricsCard with progress visualization
<MetricsCard 
  title="Surface Quality"
  value={95}
  unit="%"
  min={0}
  max={100}
/>
```

### Data Processing Intelligence
The system processes nested YAML data structures:

1. **Material Properties**
   - Nested objects with value/unit/min/max structure
   - Progress bars calculated from value ranges
   - Title mapping for abbreviated display names

2. **Machine Settings**
   - Technical parameters with units
   - Visual progress indicators
   - Smart value positioning at bar edges

### Title Mapping System
```typescript
const TITLE_MAPPING = {
  'surfaceQuality': 'Surface Quality',
  'contaminationRemoval': 'Contamination',
  'processEfficiency': 'Efficiency',
  // Custom shortened names for better display
};
```

### Layout Integration
```typescript
// MetricsGrid integration in components
<MetricsGrid 
  data={frontmatter}
  title="Material Properties & Specifications"
  maxCards={8}
/>
```

### Component Benefits
- ✅ **Visual Progress Bars**: Clear progress visualization with percentage completion
- ✅ **Smart Positioning**: Dynamic value placement prevents UI overflow
- ✅ **Custom Naming**: Abbreviated titles for better display density
- ✅ **Nested Data Support**: Handles complex YAML structures seamlessly
- ✅ **Performance Optimized**: Efficient rendering with card limits

### Current Architecture
The system uses specialized components for metrics display:
- `MetricsCard` → Individual metric card with progress bar
- `MetricsGrid` → Container component for multiple cards with title mapping

The unified component maintains full backward compatibility while providing enhanced functionality.

## 12. YAML Processing

This project includes a comprehensive YAML processor system located in the `yaml-processor/` directory that automatically detects and fixes YAML issues.

### Quick Fix
```bash
# Run a comprehensive YAML check and fix
npm run yaml

# Validate without making changes
npm run yaml:validate

# Check for specific required fields
npm run yaml:check-required

# Process only material files
npm run yaml:materials

# Fix badge symbol display issues in materials
npm run yaml:fix-badges

# Check a specific file
npm run yaml:check-file path/to/file.md
```

### Features
- ✅ **Simplified Commands**: Just use `npm run yaml` for most needs
- ✅ **Smart File Handling**: Automatically skips very small or blank files
- ✅ **Detects and fixes structural YAML issues**
- ✅ **Handles Next.js specific parsing problems** 
- ✅ **Detailed diagnostics and statistics**
- ✅ **Optimized for performance**
- ✅ **Badge symbol automatic correction**

The processor automatically fixes:
- Duplicate mapping keys
- Bad indentation in nested structures  
- Missing colons in mappings
- Malformed list structures
- Unicode encoding issues
- Empty or incomplete values
- General structural issues
- Truncated content sections

For detailed documentation, see `yaml-processor/README.md`.

---

## 12. AI Assistant Guidelines

**📘 For AI Assistants working on this codebase:**

Read **[docs/AI_QUICK_REFERENCE.md](./docs/AI_QUICK_REFERENCE.md)** first - it contains critical rules for:
- ✅ Type system usage (always use `@/types`)
- ✅ Component patterns and templates
- ✅ Utility function reference
- ✅ Common anti-patterns to avoid

**Additional AI Resources:**
- **[docs/COMPONENT_MAP.md](./docs/COMPONENT_MAP.md)** - Component relationships and dependencies
- **[docs/AI_OPTIMIZATION_RECOMMENDATIONS.md](./docs/AI_OPTIMIZATION_RECOMMENDATIONS.md)** - Full optimization guide

**Key Rule:** Never create local interfaces - always import from `@/types`.

---

## 13. Quick Start

```bash
# Fix any YAML issues first
npm run yaml

# Standard workflow
npm install
npm run dev
npm run build
npm run start
```

---

## 📚 Documentation Structure

### Essential Documentation
- **This README** - Project overview, architecture, and getting started
- **[Deployment Guide](docs/deployment/)** - Complete deployment documentation and operations
- **[Full Documentation Index](docs/README.md)** - Master index of all documentation
- **[AI Guidelines](GROK_INSTRUCTIONS.md)** - Development guidelines for AI assistants
- **[Deployment Changelog](DEPLOYMENT_CHANGELOG.md)** - Version history and changes

### Documentation Organization
- **[Components](docs/components/)** - Component documentation and usage guides
- **[Features](docs/features/)** - Feature-specific documentation
- **[Architecture](docs/architecture/)** - System architecture and design decisions
- **[Systems](docs/systems/)** - Core systems (fonts, semantic HTML, etc.)
- **[Guides](docs/guides/)** - How-to guides and best practices
- **[Testing](docs/testing/)** - Test documentation and strategies
- **[Archives](docs/archived/)** - Historical documentation and completion reports

### Quick Access
- [MetricsCard Documentation](docs/components/MetricsCard/docs/)
- [Accessibility Guides](docs/guides/accessibility/)
- [Deployment Troubleshooting](docs/deployment/troubleshooting/)
- [Categorized Properties](docs/features/categorized-properties/)

---

For detailed workflow and component usage, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).
<!-- Deploy triggered at Fri Sep 19 16:28:49 PDT 2025 -->


# Test auto-deploy webhook

