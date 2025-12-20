# Z-Beam Documentation

> **For AI Assistants**: Start with `01-core/` to understand the system, then navigate to specific sections as needed.

---

## 🆕 Latest Update: SEO Safety Data Enhancement (December 20, 2025)

**Status**: ✅ Implementation Complete | Ready for Production Deployment

Comprehensive safety data now exposed through Schema.org structured data:

### Quick Links
- **[Implementation Guide](./02-features/seo/SAFETY_DATA_IMPLEMENTATION.md)** - Complete technical documentation
- **[Deployment Checklist](./deployment/SEO_SAFETY_DATA_DEPLOYMENT.md)** - Step-by-step deployment guide
- **[Gap Analysis](./reference/SEO_INFRASTRUCTURE_GAP_ANALYSIS.md)** - Original analysis (17,500 words)
- **[Executive Summary](./reference/SEO_SAFETY_DATA_EXECUTIVE_SUMMARY.md)** - Business impact brief
- **[Tests](../tests/seo/safety-schema-generation.test.ts)** - 19 automated tests (all passing ✅)

### Key Changes
- ✅ Product schemas include fire/toxic/visibility risks (+6 safety fields)
- ✅ ChemicalSubstance schema for compound pages
- ✅ Google Shopping safety custom labels (custom_label_3, custom_label_4)
- ✅ Meta descriptions enhanced with safety context

### Business Impact
- +60% safety field exposure (0/10 → 6/10)
- +50% rich snippet eligibility (60% → 90%+)
- +15-25% expected CTR improvement
- Safety-based shopping campaigns enabled

---

## 📚 Documentation Structure

### 🎯 [01-core/](./01-core/) - Core System Documentation
**Read this first for system understanding**

Essential architecture, conventions, and foundational concepts:
- **Dataset Architecture** - Dataset generation and quality validation (`app/datasets/`)
- **Dataset Quality Policy** - 3-tier quality validation system
- **Dataset SEO Policy** - SEO metadata integration
- **Frontmatter Architecture** - Content structure and organization
  - **Service Offering Frontmatter Spec** - Service page structure
  - **Frontmatter Examples** - YAML templates and samples
- **Category System** - Three-category material classification
- **Type System** - Centralized TypeScript types (`/types/centralized.ts`)
- **Naming Conventions** - File and content naming rules
- **Image Naming Conventions** - Image file naming standards
- **Code Standards** - Development standards and patterns
- **Breadcrumb System** - Navigation and structured data
- **SEO Infrastructure** - Meta layer overview (metadata, Schema.org, sitemaps, Open Graph)
- **Section Icons** - UI icon patterns
- **CSS Architecture** - Styling organization

### 🔧 [08-development/](./08-development/) - Development Policies
Development standards and policy documentation:
- **Production URL Policy** - Absolute URL requirements for datasets, validation, and SEO

### 🚀 [02-features/](./02-features/) - Feature Documentation
Implementation details for specific features:

#### Components
- Component optimization and patterns
- Component API documentation
- Component compatibility matrix

#### Content
- Machine settings authority
- Partners page features
- Search implementation
- Content strategy
- **Component Summary Generation** - AI-powered component descriptions

#### SEO Infrastructure
- Metadata optimization (titles, descriptions)
- JSON-LD structured data (Schema.org)
- Sitemaps and Open Graph
- SEO Infrastructure strategy
- **[Safety Data Implementation](./02-features/seo/SAFETY_DATA_IMPLEMENTATION.md)** - 🆕 Safety schema enhancement (Dec 2025)
- **[Google Shopping Specification](./02-features/seo/GOOGLE_SHOPPING_SPEC.md)** - 🆕 Safety custom labels (Dec 2025)
- **Google Ads Setup** - Campaign configuration guide

#### Deployment
- Deployment workflows
- Auto-deploy configuration
- Validation processes
- **Validation Guide** - Pre-deployment validation checklist

### 📖 [03-guides/](./03-guides/) - How-to Guides
Practical guides for development and operations:
- **Frontend Integration Guide** - Component integration patterns
- **Getting Started** - Quick onboarding
- **Accessibility Guide** - WCAG compliance
- **Booking Integration** - Booking system setup
- **Business Configuration** - Settings and configuration
- **Build Process** - Build and compilation
- **Deployment Workflow** - Deployment procedures
- **Freshness Timestamps** - Content freshness system

### 📋 [04-reference/](./04-reference/) - Technical Reference
Detailed technical documentation and API references:

#### [api/](./04-reference/api/)
- **Type & JSON-LD Quick Reference** - TypeScript and Schema.org reference

#### [scripts/](./04-reference/scripts/)
- **Git Hooks Quick Reference** - Pre-commit and pre-push hooks
- **Process Monitoring Quick Reference** - Dev server monitoring

#### [build-deploy/](./04-reference/build-deploy/)
- **Build Time Requirements** - Build performance standards
- **Deployment Quick Reference** - Deployment procedures
- **Breadcrumb Standard** - Breadcrumb implementation specs

#### Root Level
- **Datasets** - Dataset documentation
- **Implementation Standards** - Code standards and patterns

### 📊 [specs/](./specs/) - Schema & API Specifications
Schema definitions and API contracts:
- **Safety Risk & Severity Schema** - Standardized safety data vocabulary (`SAFETY_RISK_SEVERITY_SCHEMA.md`)
  - Risk/severity levels (critical, high, moderate, medium, low, none)
  - Safety data field definitions (PPE, ventilation, particulates)
  - Dual format support (simple strings + nested objects)
  - Frontend component compliance verification

### �📝 [05-changelog/](./05-changelog/) - History & Migrations
Release history and migration guides:
- **CHANGELOG.md** - Release notes and changes
- **migrations/** - Historical analysis and migration guides

---

## 🤖 Quick Navigation for AI Assistants

### Understanding the System
1. Start: `01-core/DATASET_ARCHITECTURE.md` (dataset system)
2. Then: `01-core/frontmatter-architecture.md`
3. Next: `01-core/category-system.md`
4. Reference: `01-core/naming-conventions.md`

### Implementing Features
1. Check: `02-features/components/` for component patterns
2. Review: `02-features/seo/` for SEO requirements
3. Follow: `03-guides/` for implementation steps

### Deploying Changes
1. Read: `02-features/deployment/DEPLOYMENT.md`
2. Validate: `04-reference/DEPLOYMENT_QUICK_REFERENCE.md`
3. Execute: `03-guides/DEPLOYMENT_WORKFLOW.md`

### Finding Specific Info
- **Types**: See `types/centralized.ts` (project root)
- **Components**: `02-features/components/COMPONENT_MAP.md`
- **Standards**: `01-core/code-standards.md`
- **Testing**: `04-reference/E2E_CLEANUP_COMPLETE.md`

---

## 📊 Documentation Statistics

- **Total Documents**: ~150 (consolidated from 290+)
- **Core Docs**: 8 essential architecture documents
- **Features**: 30+ feature-specific guides
- **Guides**: 15+ how-to guides
- **Reference**: 20+ technical references
- **Components**: 81 React components documented

---

## 📌 Key Files

| Document | Location | Purpose |
|----------|----------|---------|
| System Architecture | `01-core/frontmatter-architecture.md` | Core content model |
| Component Map | `02-features/components/COMPONENT_MAP.md` | All components |
| Getting Started | `03-guides/getting-started.md` | Quick start guide |
| Deployment Guide | `02-features/deployment/DEPLOYMENT.md` | Deploy process |
| Code Standards | `01-core/code-standards.md` | Coding conventions |
| Type System | `types/centralized.ts` | All TypeScript types |

---

## 🏗️ Project Root Documentation

Key files in the project root:
- `GROK_INSTRUCTIONS.md` - Instructions for Grok AI assistant
- `METRICS_QUICK_REFERENCE.md` - Metrics visualization guide
- `PREBUILD_QUICK_REFERENCE.md` - Pre-build validation reference
- `README.md` - Project README

---

**Last Updated**: December 20, 2025  
**Documentation Version**: 4.0 (Phase 1 Consolidation Complete)  
**Recent Changes**:
- ✅ Eliminated 4 redundant root directories (seo/, deployment/, google-ads/, reference/)
- ✅ Reorganized specs/ directory (now 1 schema only)
- ✅ Organized 04-reference/ with proper subdirectories (api/, scripts/, build-deploy/)
- ✅ Archived 13 historical analysis files to archive/2025-11/
- ✅ Reduced 04-reference/ root from 23 → 4 files
- 📊 Total: 266 markdown files, 26 archived files

**Previous Cleanup**: Removed 760KB archives, 44KB completed docs, deprecated scripts

