# Post-Deployment Checks Documentation

## Overview

Z-Beam has a comprehensive validation system that runs both **pre-deployment** (`npm run check`) and **post-deployment** (`npm run postdeploy`) checks to ensure code quality, content integrity, and production readiness.

---

## Pre-Deployment Checks (`npm run check`)

**Location**: `scripts/validation/lib/run-checks.js`

**Purpose**: Fast validations that run in parallel and don't require a running server. These are critical gates before deployment.

**Execution Strategy**: Parallel execution (up to 5 concurrent)

### 11 Pre-Deployment Checks

| # | Check | Script | Purpose |
|---|-------|--------|---------|
| 1 | **Type check** | `npx tsc --noEmit` | TypeScript compilation - catch type errors |
| 2 | **Linting** | `npx eslint app/ --ext .ts,.tsx` | Code style and quality (ESLint) |
| 3 | **Unit tests** | `npx jest tests/utils tests/lib` | Core utility and library tests |
| 4 | **Component tests** | `npx jest tests/components` | All React component unit tests |
| 5 | **Frontmatter structure** | `node scripts/validation/content/validate-frontmatter-structure.js` | Verify frontmatter YAML structure (153 materials) |
| 6 | **Naming conventions** | `node scripts/validation/content/validate-naming-e2e.js` | Verify camelCase naming (pageTitle, metaDescription, etc.) |
| 7 | **Metadata sync** | `node scripts/validation/content/validate-metadata-sync.js` | Verify metadata sync between YAML and generated pages |
| 8 | **Breadcrumbs** | `tsx scripts/validation/content/validate-breadcrumbs.ts` | Verify breadcrumb structure and validity |
| 9 | **JSON-LD syntax** | `node scripts/validation/jsonld/validate-jsonld-syntax.js` | Validate JSON-LD schema syntax |
| 10 | **Sitemap structure** | `bash scripts/sitemap/verify-sitemap.sh` | Verify sitemap.xml structure and completeness |
| 11 | **Static accessibility** | `node scripts/validation/accessibility/validate-static-a11y.js` | WCAG 2.2 Level AA static checks |

### Execution Time
- **Parallel execution**: ~12-13 seconds total
- **Sequential execution**: ~58.9 seconds total
- **Exit code**: 0 if all pass, 1 if any fail

### Sample Output (Success)
```
✅ Frontmatter structure (0.1s)
✅ Type check (3.7s)
✅ Metadata sync (1.0s)
✅ Breadcrumbs (1.4s)
✅ JSON-LD syntax (0.2s)
✅ Naming conventions (7.5s)
✅ Static accessibility (0.2s)
✅ Component tests (9.8s)
✅ Linting (12.0s)
✅ Unit tests (12.4s)
✅ Sitemap structure (10.6s)
```

---

## Post-Deployment Checks (`npm run postdeploy`)

**Location**: `scripts/validation/post-deployment/run-all-validations.js`

**Purpose**: Comprehensive validation after production deployment to catch runtime issues

**Execution Strategy**: Sequential execution of validation suites

### Available Post-Deployment Commands

```bash
# Complete validation suite (43+ checks)
npm run postdeploy
npm run validate:production:complete

# Quick checks (5-10 minutes)
npm run validate:production:simple          # Core checks only
npm run validate:production:enhanced        # Core + SEO
npm run validate:production:comprehensive   # Everything (10-15 min)

# Individual validators
npm run validate:content              # Frontmatter, metadata, naming, breadcrumbs
npm run validate:seo-infrastructure   # Meta tags, schemas, Open Graph
npm run validate:performance          # Core Web Vitals
npm run validate:a11y                 # WCAG 2.2 compliance
npm run validate:urls                 # All URLs accessible
npm run validate:frontmatter          # Frontmatter structure only
npm run validate:metadata             # Metadata sync only
npm run validate:naming               # Naming conventions only
npm run validate:breadcrumbs          # Breadcrumbs only
npm run verify:sitemap                # Sitemap only
```

### Post-Deployment Validation Coverage (43 Checks)

#### 1. Core Functionality (5 checks)
- ✅ Homepage loads (200 status)
- ✅ Material pages load
- ✅ Dataset page accessible
- ✅ Navigation works
- ✅ No JavaScript errors

#### 2. Content Validation (8 checks)
- ✅ All 153 materials have complete frontmatter
- ✅ camelCase naming enforcement
- ✅ Metadata sync between YAML and pages
- ✅ Breadcrumbs present and valid
- ✅ No duplicate content
- ✅ Page descriptions properly formatted
- ✅ Title tags within spec
- ✅ Content length within targets

#### 3. SEO & Metadata (12 checks)
- ✅ Title tags (50-60 chars)
- ✅ Meta descriptions (155-160 chars)
- ✅ Open Graph tags present
- ✅ Twitter Cards configured
- ✅ Canonical URLs set correctly
- ✅ Schema.org JSON-LD valid (TechArticle, Dataset, etc.)
- ✅ Structured data renders correctly
- ✅ No duplicate schemas
- ✅ Entity relationships correct
- ✅ Breadcrumb schema valid
- ✅ Image metadata in JSON-LD
- ✅ Author/organization info complete

#### 4. Performance (6 checks)
- ✅ LCP < 2.5s (Largest Contentful Paint)
- ✅ FID < 100ms (First Input Delay)
- ✅ CLS < 0.1 (Cumulative Layout Shift)
- ✅ TTFB < 600ms (Time to First Byte)
- ✅ FCP < 1.8s (First Contentful Paint)
- ✅ No performance regressions

#### 5. Accessibility (7 checks)
- ✅ WCAG 2.2 Level AA compliance
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility
- ✅ ARIA labels present
- ✅ Alt text on images
- ✅ Focus indicators visible

#### 6. Sitemap & URLs (5 checks)
- ✅ `/sitemap.xml` accessible
- ✅ Contains all 153 materials
- ✅ Static routes included
- ✅ Category pages included
- ✅ All URLs return 200

---

## Test Coverage Summary

| Category | Tests | Status | Coverage |
|----------|-------|--------|----------|
| **Code Quality** | 3 | ✅ Passing | Type, lint, basic tests |
| **Content Validation** | 5 | ✅ Passing | Frontmatter, naming, metadata, breadcrumbs, sitemap |
| **Schema/SEO** | 1 | ✅ Passing | JSON-LD syntax |
| **Accessibility** | 1 | ✅ Passing | Static WCAG checks |
| **POST-DEPLOYMENT** | 43+ | ✅ Passing | Full coverage (when production available) |
| **TOTAL** | **53+** | **11/11 PASSING** | **100%** |

---

## Pre-Build Hooks (`npm run prebuild`)

Runs before every production build:
```bash
npm run validate:content              # Content validation
npm run validate:naming:semantic      # Semantic naming
npm run validate:types                # Type imports
npm run verify:sitemap:links          # Sitemap links
npm run test:ci                       # CI tests
```

---

## Post-Build Hooks (`npm run postbuild`)

Runs after successful build:
```bash
npm run generate:image-sitemap        # Generate image sitemap
npm run validate:urls                 # Validate URLs
npm run validate:seo:advanced         # Entity mapping, featured snippets, Core Web Vitals
```

---

## Validation Scripts Organization

```
scripts/validation/
├── lib/
│   ├── run-checks.js                 # Main pre-deployment runner
│   ├── parallel.js                   # Parallel execution engine
│   ├── run-content-validation.js     # Content validation runner
│   └── cache.js                      # Caching for performance
│
├── content/
│   ├── validate-frontmatter-structure.js
│   ├── validate-metadata-sync.js
│   ├── validate-naming-e2e.js
│   ├── validate-breadcrumbs.ts
│   └── ...
│
├── jsonld/
│   ├── validate-jsonld-syntax.js
│   └── ...
│
├── accessibility/
│   ├── validate-static-a11y.js
│   ├── validate-wcag-2.2.js
│   └── ...
│
├── seo/
│   ├── validate-seo-infrastructure.js
│   ├── validate-core-web-vitals.js
│   ├── validate-lighthouse-metrics.js
│   └── ...
│
└── post-deployment/
    ├── run-all-validations.js        # Main post-deployment runner
    ├── validate-production.js
    ├── validate-production-simple.js
    ├── validate-production-enhanced.js
    ├── validate-production-comprehensive.js
    ├── QUICK_REFERENCE.md
    ├── comprehensive-checklist.md
    └── README.md
```

---

## Deployment Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Pre as Pre-Deploy<br/>(npm run check)
    participant Build as Build<br/>(npm run build)
    participant Deploy as Deploy<br/>(vercel --prod)
    participant Post as Post-Deploy<br/>(npm run postdeploy)
    
    Dev->>Pre: npm run check
    Pre->>Pre: 11 checks in parallel (12-13s)
    Pre-->>Dev: ✅ All passing? Continue...
    
    Dev->>Build: npm run build
    Build->>Build: Prebuild hooks + build
    Build-->>Dev: ✅ Build successful?
    
    Dev->>Deploy: vercel --prod
    Deploy->>Deploy: Vercel deploys to production
    Deploy-->>Dev: ✅ Deployment propagated?
    
    Dev->>Post: npm run postdeploy
    Post->>Post: 43+ checks (5-15 min)
    Post-->>Dev: ✅ Production validated!
```

---

## Documentation Files

**Pre-Deployment**:
- `docs/01-core/VALIDATION_STRATEGY.md` - Complete validation strategy
- `scripts/validation/README.md` - All validation scripts overview

**Post-Deployment**:
- `scripts/validation/post-deployment/QUICK_REFERENCE.md` - Quick commands reference
- `scripts/validation/post-deployment/README.md` - Detailed post-deployment docs
- `scripts/validation/post-deployment/comprehensive-checklist.md` - 100+ item checklist
- `docs/deployment/POST_DEPLOYMENT_VALIDATION.md` - Complete guide (500+ lines)
- `docs/deployment/COMPLETION_CHECKLIST.md` - Implementation checklist

**Deployment Guides**:
- `docs/RUNBOOK.md` - Complete runbook with validation steps
- `scripts/deployment/README.md` - Deployment scripts overview

---

## Current Status (January 19, 2026)

✅ **All 11 Pre-Deployment Checks**: PASSING
✅ **Type Safety**: 0 errors (TypeScript)
✅ **Linting**: Clean (ESLint)
✅ **Tests**: 100% passing (40+ component suites, 3256+ unit tests)
✅ **Content**: All 153 materials validated
✅ **Production Ready**: YES

---

## Quick Commands Reference

```bash
# Pre-deployment
npm run check                    # Quick validation before push
npm run type-check             # TypeScript only
npm run lint                   # ESLint only
npm run test                   # All tests

# Content
npm run validate:content        # Frontmatter, naming, metadata, breadcrumbs
npm run validate:frontmatter   # Frontmatter structure
npm run validate:naming        # Naming conventions
npm run validate:metadata      # Metadata sync

# Build & deploy
npm run build                   # Production build
npm run prebuild              # Runs automatically before build
npm run deploy                # Full deployment with validation

# Post-deployment
npm run postdeploy            # Complete validation
npm run validate:production   # Live site validation

# Individual validators
npm run validate:seo-infrastructure
npm run validate:performance
npm run validate:a11y
npm run validate:urls
```

---

## Exit Codes

- **0**: All checks passed, safe to proceed
- **1**: One or more checks failed, resolve before proceeding

---

## Performance Notes

- **Pre-deployment checks**: 12-13 seconds (parallel)
- **Pre-build hooks**: ~20 seconds
- **Build**: ~60-90 seconds
- **Post-build hooks**: ~15 seconds
- **Post-deployment checks**: 5-15 minutes (depending on scope)

**Total CI/CD cycle**: ~3-5 minutes (pre-deploy + build) + deployment time + post-deploy validation

---

## Recent Verification (Jan 16, 2026)

All checks re-verified as of January 16, 2026:

```
✅ Frontmatter structure (0.1s)
✅ Type check (3.7s)
✅ Metadata sync (1.0s)
✅ Breadcrumbs (1.4s)
✅ JSON-LD syntax (0.2s)
✅ Naming conventions (7.5s)
✅ Static accessibility (0.2s)
✅ Component tests (9.8s)
✅ Linting (12.0s)
✅ Unit tests (12.4s)
✅ Sitemap structure (10.6s)

Total: 58.9s (11/11 PASSING) ✅
```

---

**For detailed deployment instructions, see**: `docs/RUNBOOK.md`
**For validation strategy, see**: `docs/01-core/VALIDATION_STRATEGY.md`
