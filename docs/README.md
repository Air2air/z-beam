# Z-Beam Documentation

> **For AI Assistants**: Start with `01-core/` to understand the system, then navigate to specific sections as needed.

## 📚 Documentation Structure

### 🎯 [01-core/](./01-core/) - Core System Documentation
**Read this first for system understanding**

Essential architecture, conventions, and foundational concepts:
- **Dataset Architecture** - Dataset generation and quality validation (`app/datasets/`)
- **Dataset Quality Policy** - 3-tier quality validation system
- **Dataset SEO Policy** - SEO metadata integration
- **Frontmatter Architecture** - Content structure and organization
- **Category System** - Three-category material classification
- **Type System** - Centralized TypeScript types (`/types/centralized.ts`)
- **Naming Conventions** - File and content naming rules
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

#### SEO Infrastructure
- Metadata optimization (titles, descriptions)
- JSON-LD structured data (Schema.org)
- Sitemaps and Open Graph
- SEO Infrastructure strategy

#### Deployment
- Deployment workflows
- Auto-deploy configuration
- Validation processes

### 📖 [03-guides/](./03-guides/) - How-to Guides
Practical guides for development and operations:
- **Getting Started** - Quick onboarding
- **Accessibility Guide** - WCAG compliance
- **Booking Integration** - Booking system setup
- **Business Configuration** - Settings and configuration
- **Build Process** - Build and compilation
- **Deployment Workflow** - Deployment procedures
- **Freshness Timestamps** - Content freshness system

### 📋 [04-reference/](./04-reference/) - Technical Reference
Detailed technical documentation and API references:
- **Breadcrumb Standard** - Breadcrumb implementation specs
- **Build Requirements** - Build time requirements
- **Deployment Reference** - Deployment quick reference
- **Datasets** - Dataset documentation
- **Testing** - E2E testing and validation
- **Scripts** - Script documentation

### 📝 [05-changelog/](./05-changelog/) - History & Migrations
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

**Last Updated**: November 16, 2025  
**Documentation Version**: 3.0 (Reorganized & Cleaned)  
**Cleanup**: Removed 760KB archives, 44KB completed docs, deprecated scripts
