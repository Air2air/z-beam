# Z-Beam Laser Cleaning Project

## 🚀 Project Roadmap & Architecture

This README is the single source of truth for building, maintaining, and extending the Z-Beam project. It integrates all critical principles, workflows, and enforcement mechanisms from previous documentation.

**🔍 Automatic Deployment Monitoring Active** - All deployments are now automatically tracked and monitored for status changes.

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
│   └── images/             # Image assets (see docs/IMAGE_NAMING_CONVENTIONS.md)
├── content/                # All MDX/MD files (read-only)
│   ├── application/        # Application articles
│   ├── author/             # Author profiles
│   ├── material/           # Material articles
│   ├── region/             # Region content
│   ├── thesaurus/          # Terminology
│   └── components/         # Component-specific YAML files
│       ├── caption/        # Before/after text content
│       └── author/         # Author profile data
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

// Page metadata
export const metadata = {
  title: `Contact ${SITE_CONFIG.shortName}`,
  description: `Get in touch with ${SITE_CONFIG.shortName}'s team...`
};

// Schema.org structured data
const schema = {
  '@context': SITE_CONFIG.schema.context,
  '@type': SITE_CONFIG.schema.organizationType,
  name: SITE_CONFIG.shortName,
  url: SITE_CONFIG.url
};
```

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

📖 **Full Documentation**: [Type System Architecture](docs/TYPE_SYSTEM_ARCHITECTURE.md)

---

## 5. Development Workflow

### Essential Commands

```bash
npm install                # Install dependencies
npm run dev                # Start dev server with health checks
npm run build              # Full build with all checks
npm run start              # Start production server
npm run predeploy          # Validate before deployment
npm run deploy             # Deploy to production
npm run deploy:preview     # Deploy to preview environment
npm run enforce-components # Check component rules
npm run create:component   # Safely create new component (last resort)
```

- **Health checks** run before dev server starts (port, CSS, dependencies, component system, TypeScript, environment).
- **Pre-commit hooks** and **CI pipeline** enforce compliance with all mandates.
- **Emergency bypass**: Use `npm run dev:direct` to start server regardless of issues.

---

---

## 8. Deployment System (v2.1)

### Production-Only Deployment

Z-Beam uses automatic production deployment from the `main` branch with real-time monitoring.

**Quick Deploy:**
```bash
git push origin main   # Automatic production deployment + monitoring
```

That's it! The system automatically:
- ✅ Triggers Vercel build
- ✅ Monitors deployment status
- ✅ Sends desktop notification
- ✅ Logs deployment history
- ✅ Analyzes errors if failure occurs

### System Health Check

Before deploying, verify your environment:
```bash
npm run deploy:health   # Validates Node, Git, Vercel CLI, hooks
```

### Build Configuration

- **Compiler**: Next.js SWC (Babel removed for performance)
- **TypeScript**: In devDependencies (v5.9.3)
- **Package Install**: `npm ci --include=dev` (815+ packages)
- **Build Command**: `next build`
- **Region**: iad1 (Washington D.C.)

### Automatic Monitoring

Deployment monitoring activates automatically via git hook:

```
📍 URL: z-beam-xyz.vercel.app
🔨 Status: BUILDING → ✅ READY
⏱️  Duration: 65 seconds
🔔 Desktop notification sent
```

### Deployment Tools

```bash
# Monitoring
npm run deploy:health     # System health check
npm run deploy:history    # View deployment history
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
- **[Sample File](./content/components/frontmatter/aluminum-test-categorized.yaml)** - Complete example

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
