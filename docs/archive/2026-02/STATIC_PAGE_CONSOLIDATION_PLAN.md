# Static Page Architecture Consolidation Plan
**Date**: February 11, 2026  
**Status**: Ready for Implementation

## 🎯 Executive Summary

Consolidate 4 different static page patterns into a single, unified architecture that:
- Eliminates ~400 lines of duplicate code
- Provides consistent metadata, schema, and layout handling
- Maintains flexibility for different page types
- Uses YAML configuration for all static content

## 📊 Current State Analysis

### Pattern 1: YAML-Based Factory (✅ COMPLETE)
**Pages**: rental, about, contact, operations, partners, equipment, safety  
**Implementation**: `app/utils/pages/createStaticPage.tsx`  
**Lines per page**: ~7 lines  
**Status**: ✅ Already consolidated

### Pattern 2: Dynamic Pages with loadStaticPageContent
**Pages**: schedule, services, netalux  
**Lines per page**: 80-122 lines  
**Pattern**:
- Uses `loadStaticPageContent()` utility
- Custom Layout + ContentSection rendering
- Manual JsonLD schema generation
- Mixed hardcoded + YAML content

**Example** (services/page.tsx - 122 lines):
```tsx
const pageConfig = loadStaticPageContent('services');
// + hardcoded SERVICES array
// + manual schema generation
// + custom rendering logic
```

### Pattern 3: Collection Page (Custom Implementation)
**Pages**: settings  
**Lines**: 179 lines  
**Pattern**:
- Loads YAML frontmatter directly
- Generates card grids
- Manual schema generation
- Could use CollectionPage component

### Pattern 4: Collection Pages (✅ COMPLETE)
**Pages**: materials, contaminants, compounds  
**Implementation**: Uses `CollectionPage` component  
**Lines per page**: ~50 lines  
**Status**: ✅ Already consolidated

## 🎨 Proposed Unified Architecture

### Core Principle
**Single factory pattern with configuration-based rendering for ALL static pages.**

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Page Type Router (NEW)                         │
│ - Detects page type from YAML config                    │
│ - Routes to appropriate renderer                        │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ YAML Pages      │ │ Dynamic      │ │ Collection Pages │
│ (Factory)       │ │ Pages        │ │ (Component)      │
│                 │ │ (Enhanced)   │ │                  │
│ - rental        │ │ - schedule   │ │ - materials      │
│ - about         │ │ - services   │ │ - contaminants   │
│ - contact       │ │ - netalux    │ │ - compounds      │
│ - operations    │ │              │ │ - settings       │
│ - surface-...   │ │              │ │                  │
│ - partners      │ │              │ │                  │
│ - equipment     │ │              │ │                  │
│ - safety        │ │              │ │                  │
└─────────────────┘ └──────────────┘ └──────────────────┘
         │                 │                   │
         └─────────────────┴───────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌─────────────────────────┐  ┌───────────────────────────┐
│ Shared Metadata Utils   │  │ Shared Schema Generators  │
│ - generateMetadata()    │  │ - generatePageSchema()    │
│ - extractHeroImage()    │  │ - BreadcrumbSchema        │
└─────────────────────────┘  └───────────────────────────┘
```

## 🔧 Implementation Plan

### Phase 1: Enhance YAML Config System (30 min)
**Add page type detection to page.yaml:**

```yaml
# page.yaml
pageType: "content-cards"  # or "dynamic-content", "collection"
pageTitle: "..."
pageDescription: "..."
contentCards: [...]

# NEW: Optional dynamic features
dynamicFeatures:
  - type: "schedule-widget"
    position: "bottom"
  - type: "clickable-cards"
    items: [...]
```

### Phase 2: Create Enhanced createStaticPage (1 hour)
**File**: `app/utils/pages/createStaticPage.tsx`

**Enhancements**:
```typescript
interface EnhancedPageConfig extends PageConfig {
  pageType?: 'content-cards' | 'dynamic-content' | 'collection';
  dynamicFeatures?: DynamicFeature[];
  clickableCards?: ClickableCardConfig[];
  customComponents?: ComponentConfig[];
}

export function createStaticPage(pageName: string) {
  const config = loadPageYAML(pageName);
  
  // Route to appropriate renderer based on pageType
  switch (config.pageType) {
    case 'content-cards':
      return createContentCardsPage(config);
    case 'dynamic-content':
      return createDynamicContentPage(config);
    case 'collection':
      return createCollectionPage(config);
    default:
      return createContentCardsPage(config); // fallback
  }
}
```

### Phase 3: Convert Dynamic Pages (1 hour)

#### Schedule Page
**Before** (97 lines) → **After** (7 lines):
```tsx
// app/schedule/page.tsx
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: Page } = createStaticPage('schedule');
export { generateMetadata };
export default Page;
```

**YAML Config** (`app/schedule/page.yaml`):
```yaml
pageType: dynamic-content
pageTitle: "Schedule a Service - Z-Beam Laser Cleaning"
pageDescription: "Schedule laser cleaning services..."
slug: schedule
noIndex: true

contentCards:
  - heading: "..."
    text: "..."

dynamicFeatures:
  - type: schedule-widget
    position: bottom
  
  - type: header-cta
    text: "Contact us"
    href: "/contact"
    style: primary
```

#### Services Page
**Before** (122 lines) → **After** (7 lines):
```yaml
pageType: dynamic-content
clickableCards:
  - href: /rental
    heading: Equipment Rental
    text: "..."
    image: { url: "/images/...", alt: "..." }
```

#### Netalux Page
**Before** (80 lines) → **After** (7 lines):
```yaml
pageType: dynamic-content
contentCards:
  - heading: "Needle® Precision System"
    order: 1
  - heading: "Jango® Industrial System"
    order: 2
```

### Phase 4: Convert Settings to CollectionPage (30 min)

**Before** (179 lines) → **After** (50 lines):
```tsx
// app/settings/page.tsx
import { CollectionPage } from '@/app/components/CollectionPage';
import { generateCollectionMetadata } from '@/app/utils/metadata';

export const generateMetadata = () => generateCollectionMetadata('settings');

export default function SettingsPage() {
  return <CollectionPage domain="settings" />;
}
```

## 📈 Expected Results

### Code Reduction
| Page Type | Before | After | Savings |
|-----------|--------|-------|---------|
| Schedule | 97 lines | 7 lines | 90 lines (93%) |
| Services | 122 lines | 7 lines | 115 lines (94%) |
| Netalux | 80 lines | 7 lines | 73 lines (91%) |
| Settings | 179 lines | 50 lines | 129 lines (72%) |
| **Total** | **478 lines** | **71 lines** | **407 lines (85%)** |

### Benefits
✅ **Consistency**: All static pages use same architecture  
✅ **Maintainability**: Changes in one place affect all pages  
✅ **Type Safety**: Centralized TypeScript interfaces  
✅ **SEO**: Consistent metadata and schema generation  
✅ **Performance**: Optimized image handling and ISR  
✅ **Developer Experience**: Simple 7-line pattern for new pages

## 🧪 Testing Strategy

### 1. Visual Regression
- [ ] Compare before/after screenshots of all pages
- [ ] Verify layout, spacing, typography unchanged
- [ ] Check responsive behavior on mobile/tablet/desktop

### 2. Functional Testing
- [ ] Schedule widget renders and works
- [ ] Clickable cards link correctly
- [ ] Content sections display properly
- [ ] Images load with correct dimensions

### 3. SEO Validation
- [ ] Metadata matches previous implementation
- [ ] JSON-LD schemas validate
- [ ] Breadcrumbs render correctly
- [ ] OpenGraph/Twitter cards work

### 4. Performance
- [ ] Build time comparison
- [ ] Bundle size analysis
- [ ] Core Web Vitals (LCP, CLS, FID)

## 🚀 Rollout Plan

### Week 1: Foundation
- [x] Static pages already consolidated (completed)
- [ ] Enhance createStaticPage for dynamic features
- [ ] Create YAML schemas for validation

### Week 2: Migration
- [ ] Convert schedule page + test
- [ ] Convert services page + test
- [ ] Convert netalux page + test
- [ ] Convert settings page + test

### Week 3: Validation
- [ ] Complete test suite
- [ ] Visual regression testing
- [ ] SEO audit
- [ ] Deploy to staging

### Week 4: Production
- [ ] Monitor metrics
- [ ] Fix any issues
- [ ] Document architecture
- [ ] Update developer guides

## 📋 Migration Checklist

For each page migration:
- [ ] Create/update page.yaml with all content
- [ ] Convert page.tsx to factory pattern (7 lines)
- [ ] Test locally with `npm run dev`
- [ ] Verify metadata with SEO tools
- [ ] Check JSON-LD with structured data testing tool
- [ ] Test responsive layout
- [ ] Commit with clear migration message

## 🎓 Developer Guide

### Creating a New Static Page

1. **Create YAML config**: `app/my-page/page.yaml`
```yaml
pageType: content-cards
pageTitle: "My Page Title"
pageDescription: "..."
contentCards:
  - heading: "Section 1"
    text: "..."
```

2. **Create page component**: `app/my-page/page.tsx`
```tsx
import { createStaticPage } from '@/app/utils/pages/createStaticPage';
const { generateMetadata, default: Page } = createStaticPage('my-page');
export { generateMetadata };
export default Page;
```

3. **Done!** 7 lines total.

### Page Types

**content-cards**: Standard sections with heading/text/image  
**dynamic-content**: Sections + custom components (widgets, CTAs)  
**collection**: Grid of items (uses CollectionPage component)

## 📊 Success Metrics

- [ ] **407 lines** of code removed (85% reduction)
- [ ] **12 static pages** using unified architecture
- [ ] **Zero** visual regressions
- [ ] **100%** SEO parity maintained
- [ ] **<2 seconds** average build time per page

## 🎯 Next Steps

1. ✅ Get approval for consolidation plan
2. ⏳ Implement enhanced createStaticPage
3. ⏳ Migrate dynamic pages (schedule, services, netalux)
4. ⏳ Convert settings to CollectionPage
5. ⏳ Complete testing and validation
6. ⏳ Deploy to production

---

**Ready to implement?** This consolidation will significantly improve maintainability while maintaining all existing functionality.
