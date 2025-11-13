# Z-Beam Documentation

**Complete documentation for the Z-Beam laser cleaning application.**

Last Updated: November 12, 2025 | [Changelog](CHANGELOG.md) | [Security](SECURITY.md) | [Analytics](ANALYTICS.md)

---

## 🚀 Quick Start

**New to Z-Beam?** Start here:
- **[Quick Start Guide](./quick-start/README.md)** - Get up and running in 5 minutes
- **[Development Setup](./development/)** - Set up your development environment  
- **[Deployment Guide](./deployment/)** - Deploy to production
- **[Analytics](./ANALYTICS.md)** - Google Analytics 4 event tracking

---

## 📚 Main Documentation Sections

### 🧩 [Components](./components/)
Reusable UI components:
- **[MetricsCard](./components/MetricsCard/docs/)** - Vertical metrics display ([Redesign Details](./components/MetricsCard/docs/METRICSCARD_VERTICAL_REDESIGN.md))
- **[Caption](./components/Caption/)** - Image captions with SEO
- **[All Components →](./components/)**

### ✨ [Features](./features/)
Major application features:
- **[Categorized Properties](./features/categorized-properties/)** - Material property organization
- **[Thermal Properties](./features/thermal-properties/)** - Thermal data handling

### 🏗️ [Architecture](./architecture/)  
System design and patterns:
- **[Static Pages](./architecture/static-pages/)** - Page architecture
- **[JSON-LD Schemas](./architecture/jsonld/)** - Structured data
- **[Frontmatter](./architecture/frontmatter/)** - Content metadata
- **[URLs](./architecture/urls/)** - URL structure and routing
- **[Type System](./architecture/)** - TypeScript types

### 🎨 [Systems](./systems/)
Core utilities:
- **[Font System](./systems/fonts/)** - Typography  
- **[Semantic HTML](./systems/semantic/)** - Markup patterns
- **[Performance](./systems/performance/)** - Core Web Vitals optimization
- **[SEO](./systems/seo/)** - Rich results and web standards
- **[Monitoring](./systems/monitoring/)** - Process monitoring
- **[Tag System](./tag-system/)** - Content tagging

### 📖 [Guides](./guides/)
How-to documentation:
- **[Accessibility](./guides/accessibility/)** - WCAG 2.1 AA compliance
- **[Booking Integration](./guides/)** - Calendar booking setup
- **[Development](./development/)** - Developer workflows
- **[Deployment](./deployment/)** - Deployment procedures

### 🧪 [Testing](./testing/)
Test documentation:
- **[Testing Overview](./testing/)** - Test strategies
- **[Test Coverage](./testing/)** - Coverage reports

---

## 🔍 Quick Links

### Component Documentation
- [MetricsCard Vertical Redesign](./components/MetricsCard/docs/METRICSCARD_VERTICAL_REDESIGN.md) ⭐ NEW
- [MetricsCard Quick Reference](./components/MetricsCard/docs/METRICSCARD_VERTICAL_QUICK_REFERENCE.md)
- [Caption Quick Start](./components/Caption/CAPTION_QUICK_START.md)

### System Guides  
- [Accessibility Guide](./guides/accessibility/README.md)
- [Font System](./systems/fonts/)
- [Naming Conventions](./NAMING_QUICK_REFERENCE.md)

### Recent Updates
- **Nov 12, 2025**: Documentation cleanup (74 → 4 root files, 95% reduction)
- **Nov 12, 2025**: Analytics docs updated with booking events
- **Nov 12, 2025**: Test suite: 1,867 passing (91.9% pass rate)
- **Oct 15, 2025**: MetricsCard vertical redesign complete

---

## 📊 Documentation Stats

- **Total Documents**: 283 markdown files
- **Root Files**: 4 (95% reduction from 74)
- **Archived**: 40+ historical documents in organized structure
- **Component Docs**: 16 documented components
- **Feature Docs**: Categorized properties, thermal properties, breadcrumbs
- **System Docs**: Fonts, semantic, performance, SEO, monitoring
- **Guides**: Accessibility, booking, development, deployment

---

## 🗂️ Directory Structure

```
docs/
├── README.md                           # This file
├── CHANGELOG.md                        # Documentation changelog
├── SECURITY.md                         # Security guidelines
├── ANALYTICS.md                        # Google Analytics setup
│
├── components/                         # Component documentation
│   ├── MetricsCard/docs/              # MetricsCard system
│   ├── Caption/                        # Caption component
│   └── ...
│
├── features/                           # Feature documentation
│   ├── categorized-properties/        # Property system
│   ├── thermal-properties/            # Thermal data
│   └── ...
│
├── architecture/                       # Architecture docs
│   ├── static-pages/                  # Page architecture
│   ├── jsonld/                        # JSON-LD schemas
│   ├── frontmatter/                   # Frontmatter structure
│   ├── urls/                          # URL architecture
│   └── ...
│
├── systems/                            # System documentation
│   ├── fonts/                         # Font system
│   ├── semantic/                      # Semantic HTML
│   ├── performance/                   # Core Web Vitals
│   ├── seo/                           # SEO & rich results
│   ├── monitoring/                    # Process monitoring
│   └── ...
│
├── guides/                             # How-to guides
│   ├── accessibility/                 # Accessibility guide
│   └── ...
│
├── testing/                            # Testing docs
├── development/                        # Developer guides
├── deployment/                         # Deployment guides
├── quick-start/                        # Getting started
├── reference/                          # API references
├── tag-system/                         # Tag documentation
│
├── implementations/                    # Implementation guides
├── pages/                              # Page-specific docs
│
└── archived/                           # Historical documents
    ├── phase-reports/                 # Project phases
    ├── summaries/                     # Completion summaries
    ├── evaluations/                   # Analyses & audits
    └── 2025-proposals/                # Archived proposals
```

---

## 💡 Finding Documentation

### By Task
- **Getting Started**: [quick-start/](./quick-start/)
- **Developing**: [development/](./development/)
- **Building Components**: [components/](./components/)  
- **Testing**: [testing/](./testing/)
- **Deploying**: [deployment/](./deployment/)
- **Accessibility**: [guides/accessibility/](./guides/accessibility/)

### By Component
- **MetricsCard**: [components/MetricsCard/docs/](./components/MetricsCard/docs/)
- **Caption**: [components/Caption/](./components/Caption/)
- **All Components**: [components/](./components/)

### By System
- **Fonts**: [systems/fonts/](./systems/fonts/)
- **Semantic HTML**: [systems/semantic/](./systems/semantic/)
- **Tags**: [tag-system/](./tag-system/)

---

## 🤝 Contributing

### Adding Documentation
1. Create docs in appropriate directory
2. Follow naming conventions (README.md for main, specific names for details)
3. Link from this index
4. Update CHANGELOG.md

### Updating Documentation  
1. Edit current docs (not archived versions)
2. Update "Last Updated" dates
3. Add significant changes to CHANGELOG.md

### Archiving Documentation
1. Move completed projects to archived/
2. Add links to current docs
3. Update this index

---

## 📧 Need Help?

- **Can't find docs?** Check [archived/](./archived/)
- **Quick references?** Browse [reference/](./reference/)
- **Component info?** See [components/](./components/)
- **System details?** Check [systems/](./systems/) or [architecture/](./architecture/)
- **Analytics setup?** Read [ANALYTICS.md](./ANALYTICS.md)
- **Security?** See [SECURITY.md](./SECURITY.md)

---

**Version**: 2.1 (Post-cleanup)  
**Status**: ✅ Organized & Maintained  
**Last Major Cleanup**: November 12, 2025  
**Root Files**: 4 (ANALYTICS, CHANGELOG, README, SECURITY)
