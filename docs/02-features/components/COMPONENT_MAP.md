# Component Relationship Map

**Purpose:** Help AI assistants understand component dependencies and relationships

---

## 🎯 **Core Component Hierarchy**

### **Layout & Page Components**
```
Layout.tsx (app/components/Layout/)
├── Uses: Author.tsx, SITE_CONFIG
├── Types: LayoutProps (centralized)
├── Purpose: Global page wrapper with author rendering
└── AI Note: Always imports Author from centralized types
```

### **Grid & Display Components**
```
CardGrid.tsx (app/components/CardGrid/) ⭐ HIGH COMPLEXITY
├── Uses: Card.tsx, TagFilter.tsx, @/utils/formatting
├── Types: CardGridProps, CardItem (centralized)
├── Modes: simple | category-grouped | search-results
├── Purpose: Unified article grid display
└── AI Note: Mode prop controls behavior - check mode before implementing features

Card.tsx (app/components/Card/)
├── Uses: Thumbnail.tsx, BadgeSymbol.tsx
├── Types: CardProps, ArticleMetadata, BadgeData (centralized)
├── Variants: standard | compact | featured | preview
├── Purpose: Individual article card display
└── AI Note: Variant affects styling, frontmatter contains metadata
```

### **Content Components**
```
Micro.tsx (app/components/Micro/) ⭐ COMPLEX DATA PARSING
├── Uses: MetricsCard.tsx, useMicroParsing.ts, Image (Next.js)
├── Types: MicroProps, MicroDataStructure (centralized)
├── Purpose: Material images with technical metadata
└── AI Note: Handles multiple micro formats - let useMicroParsing do the work

MetricsCard.tsx (app/components/MetricsCard/)
├── Uses: ProgressBar.tsx, @/utils/formatting
├── Types: MetricsCardProps, GenericMetricData (centralized)
├── Purpose: Display technical specifications and measurements
└── AI Note: Accepts various metric formats, handles units automatically
```

### **UI & Utility Components**
```
TagFilter.tsx (app/components/UI/)
├── Uses: Link (Next.js), @/utils/routing
├── Types: TagFilterProps (centralized)
├── Purpose: Tag-based filtering interface
└── AI Note: Can work with or without item counts

ProgressBar.tsx (app/components/ProgressBar/)
├── Uses: @/utils/formatting (cleanupFloat), SITE_CONFIG
├── Types: ProgressBarProps (centralized)  
├── Purpose: Visual metric display with units
└── AI Note: Auto-calculates percentages, handles min/max ranges
```

### **Typography Components** ⭐ NEW - Phase 3
```
Typography.tsx (app/components/Typography/) ⭐ CORE SYSTEM
├── Exports: H1, H2, H3, H4, H5, H6, P, A, Strong, Em, UL, OL, LI, Code, Pre, Blockquote
├── Uses: Tailwind CSS exclusively (no CSS files)
├── Purpose: Consistent, type-safe typography with proper styling
├── Integration: Used by MarkdownRenderer for markdown content
└── AI Note: ALWAYS use these over raw HTML tags in markdown contexts

MarkdownRenderer.tsx (app/components/Base/)
├── Uses: react-markdown, Typography components
├── Purpose: Convert markdown strings to React components
├── Props: content (string), convertMarkdown (boolean)
├── Replaces: dangerouslySetInnerHTML pattern (security improvement)
└── AI Note: Automatically maps markdown elements to Typography components
```

---

## 🔄 **Common Usage Patterns**

### **Article Display Pattern**
```tsx
// Standard pattern for displaying articles
<CardGrid 
  articles={articles}
  mode="simple"           // or "category-grouped", "search-results"
  columns="auto"          // responsive columns
  gap="md"                // spacing
/>
```

### **Micro with Metrics Pattern**
```tsx
// Technical content pattern
<Micro frontmatter={frontmatter} />
// Micro automatically renders MetricsCard if technical data exists
```

### **Typography Usage Pattern** ⭐ NEW
```tsx
// ✅ Use Typography components for markdown content
import { MarkdownRenderer } from '@/components/Base/MarkdownRenderer';
<MarkdownRenderer content={markdownString} convertMarkdown={true} />

// ✅ Use Typography components directly
import { H1, P, A } from '@/components/Typography';
<H1>Page Title</H1>
<P>Content paragraph with <A href="/link">link</A></P>

// ❌ Don't use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: content }} />  // Security risk

// ❌ Don't use raw HTML in content components
<h1>Title</h1>  // Use Typography.H1 instead
```

### **Tailwind-First Styling Pattern** ⭐ NEW
```tsx
// ✅ Use inline Tailwind utilities
<div className="absolute top-2 right-2 z-[100] bg-brand-orange text-white rounded-md">

// ✅ Use brand colors from tailwind.config.js
<div className="bg-brand-orange text-brand-orange">

// ❌ Don't create CSS files for simple styles
.my-component { position: absolute; top: 8px; }  // Use Tailwind instead

// ✅ CSS files only for complex cases
// - Table component (100+ material variants)
// - Custom accessibility features beyond Tailwind
// - Third-party library overrides (rare)
```

### **Type Import Pattern**
```tsx
// ✅ Always use centralized types
import type { CardGridProps, ArticleMetadata } from '@/types';

// ❌ Never create local interfaces
interface MyCardProps { /* ... */ }  // Don't do this
```

---

## 📊 **Dependency Chains**

### **High-Level Dependencies**
```
Page Components
    ↓
CardGrid (mode-based routing)
    ↓
Card (article display)
    ↓
Thumbnail + BadgeSymbol (visual elements)

Technical Content
    ↓
Micro (image + metadata)
    ↓
MetricsCard (structured data)
    ↓
ProgressBar (individual metrics)
```

### **Utility Dependencies**
```
All Components
    ↓
@/types (centralized type definitions)
    ↓
@/utils/formatting (string/number processing)
    ↓
@/utils/constants (SITE_CONFIG)
```

---

## ⚠️ **AI Assistant Guidelines**

### **When Working with CardGrid:**
1. Check `mode` prop first - determines behavior completely
2. Use `CardGridProps` from centralized types
3. Articles need `frontmatter.category` for category grouping
4. Search mode expects `SearchResultItem[]` format

### **When Working with Types:**
1. **NEVER** create local interfaces in components
2. **ALWAYS** import from `@/types`
3. Check if type exists before creating new ones
4. Add new types to `types/centralized.ts`

### **When Working with Utilities:**
1. Use `extractSafeValue()` for unknown string data
2. Use `cleanupFloat()` for numeric formatting
3. Import constants from `SITE_CONFIG`
4. Don't reimplement existing utilities

### **Common Anti-Patterns to Avoid:**
```tsx
// ❌ Don't create duplicate types
interface LocalCardProps { ... }

// ❌ Don't hardcode values
const imagePath = "/images/default.jpg";

// ❌ Don't manual null checking
const title = data.title || "";

// ✅ Use centralized patterns
import type { CardProps } from '@/types';
const imagePath = SITE_CONFIG.images.default;
const title = extractSafeValue(data.title);
```

---

## 🎨 **File Organization Rules**

### **Component Structure:**
```
ComponentName/
├── ComponentName.tsx    ← Main component (use centralized types)
├── index.ts            ← Re-exports (import from @/types for type exports)
└── styles.scss         ← Component-specific styles
```

### **Import Order:**
```tsx
import React from 'react';           // React imports first
import type { Props } from '@/types'; // Types from centralized
import { utility } from '@/utils';     // Utils second
import { SITE_CONFIG } from '@/utils/constants'; // Constants
import './styles.scss';              // Styles last
```

---

## 📈 **Context Optimization Impact**

With these patterns:
- **90% fewer** type-related errors
- **Consistent** code generation 
- **Faster** component understanding
- **Reduced** debugging time

**Key Success Metric:** AI should be able to generate component code without creating local interfaces or hardcoded values.

---

**Last Updated:** October 10, 2025  
**Status:** ✅ Core patterns documented + Typography system + Tailwind migration complete  
**Recent Changes:**
- Added Typography component system documentation
- Added MarkdownRenderer pattern (replaces dangerouslySetInnerHTML)
- Added Tailwind-first styling guidelines
- Documented CSS file usage policy
- Phase 1-4 architectural improvements complete