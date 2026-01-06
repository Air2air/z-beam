# Proposal: Enhanced Tabular Data Presentation in Collapsible Sections

**Date:** January 5, 2026  
**Status:** Proposal  
**Affected Components:** Collapsible.tsx, Industry Applications, Expert Q&A, Regulatory Standards

---

## Current State Analysis

### Sections Using Collapsible Presentation

Currently, 3 main section types use `presentation: collapsible`:

1. **`industry_applications`** (operational section)
2. **`expert_answers`** (operational section)  
3. **regulatory_standards`** (safety section)

### Current Implementation Issues

**Collapsible.tsx** renders tabular data using:
- Generic `<table>` elements with key-value pairs
- Nested properties rendered as nested tables
- Limited responsive design (only `overflow-x-auto`)
- No column width optimization
- No mobile-first design patterns

**Example Current Rendering:**
```tsx
// Lines 261-288 in Collapsible.tsx
<table className="w-full text-base">
  <tbody>
    {entries.map(([key, value], idx) => (
      <tr key={key}>
        <td className="px-3 py-2 font-semibold text-gray-300 w-1/3">
          {formatKey(key)}
        </td>
        <td className="px-3 py-2 text-gray-300">
          {/* Value rendering */}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Problems:**
1. ❌ Fixed 1/3 width for labels breaks on mobile
2. ❌ Nested tables inside collapsibles create poor UX
3. ❌ No consideration for data density
4. ❌ Limited semantic structure for screen readers
5. ❌ No visual hierarchy for complex data

---

## Proposed Solutions

### Option 1: Responsive Definition List Pattern (Recommended)

Replace table structure with semantic `<dl>` (definition list) that adapts based on viewport and data complexity.

**Benefits:**
- ✅ Better semantics (dt/dd vs td/td)
- ✅ CSS Grid for responsive layouts
- ✅ Easier to style for different data types
- ✅ Better screen reader support
- ✅ Natural stacking on mobile

**Implementation:**

```tsx
interface DataTableProps {
  data: Record<string, any>;
  variant?: 'compact' | 'detailed' | 'regulatory';
  className?: string;
}

function ResponsiveDataList({ data, variant = 'detailed' }: DataTableProps) {
  const entries = Object.entries(data).filter(([key, value]) => 
    !key.startsWith('_') && value !== null && value !== undefined
  );

  if (entries.length === 0) return null;

  // Variant-specific grid layouts
  const gridClasses = {
    compact: 'grid grid-cols-1 md:grid-cols-[minmax(120px,200px)_1fr] gap-x-4 gap-y-2',
    detailed: 'grid grid-cols-1 md:grid-cols-[minmax(180px,240px)_1fr] gap-x-6 gap-y-4',
    regulatory: 'grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_1fr] gap-x-8 gap-y-6'
  };

  return (
    <dl className={`${gridClasses[variant]} w-full`}>
      {entries.map(([key, value], idx) => (
        <React.Fragment key={key}>
          {/* Term (Label) */}
          <dt className="font-semibold text-gray-300 md:text-right md:pr-4 
                         self-start pt-1 text-sm md:text-base">
            {formatKey(key)}
          </dt>
          
          {/* Definition (Value) */}
          <dd className="text-gray-300 pl-4 md:pl-0 border-l-2 md:border-l-0 
                         border-gray-700 md:border-0 pb-3 md:pb-0">
            {renderValue(value, variant)}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
```

**Mobile Layout:**
```
┌─────────────────────┐
│ Label               │
│ ├─ Value content    │
│ ├─ More content     │
│                     │
│ Another Label       │
│ ├─ Another value    │
└─────────────────────┘
```

**Desktop Layout:**
```
┌────────────┬────────────────────────┐
│    Label   │  Value content         │
│            │  spanning available    │
│            │  width                 │
├────────────┼────────────────────────┤
│ Another    │  Another value         │
└────────────┴────────────────────────┘
```

---

### Option 2: Card-Based Layout for Complex Objects

For sections with rich metadata (like Regulatory Standards), use card layouts instead of tables.

**Current Regulatory Standards:** Already uses card layout in `RegulatoryStandards.tsx` (good!)

**Recommendation:** Extend this pattern to other complex data:

```tsx
function DataCard({ item, variant }: { item: any, variant: string }) {
  return (
    <div className="card-background rounded-lg p-4 hover:shadow-lg transition-all">
      {/* Icon/Visual */}
      {item.image && (
        <div className="w-12 h-12 mb-3">
          <Image src={item.image} alt="" width={48} height={48} />
        </div>
      )}
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-200 mb-2">
        {item.title || item.name}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-400 mb-3">
        {item.description || item.content}
      </p>
      
      {/* Metadata badges */}
      {item.metadata && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(item.metadata).map(([key, value]) => (
            <Badge key={key} variant="secondary" size="sm">
              {String(value)}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Actions */}
      {item.url && (
        <Link href={item.url} className="text-orange-500 text-sm mt-3 inline-flex items-center">
          Learn More →
        </Link>
      )}
    </div>
  );
}
```

**Use for:**
- ✅ Industry Applications (already has name/description structure)
- ✅ Expert Q&A (better than plain text in collapsible)
- ✅ Regulatory Standards (already implemented!)

---

### Option 3: Hybrid Approach with Smart Detection

Automatically choose the best presentation based on data structure:

```tsx
function SmartDataRenderer({ data }: { data: any }) {
  // Detect data type and choose optimal presentation
  
  // Case 1: Array of objects with name/description → Card Grid
  if (Array.isArray(data) && data[0]?.name && data[0]?.description) {
    return <CardGrid items={data} />;
  }
  
  // Case 2: Array of objects with 3+ properties → Data Table
  if (Array.isArray(data) && typeof data[0] === 'object' && 
      Object.keys(data[0]).length >= 3) {
    return <DataTable items={data} />;
  }
  
  // Case 3: Simple key-value pairs → Definition List
  if (typeof data === 'object' && !Array.isArray(data)) {
    const complexity = calculateComplexity(data);
    const variant = complexity > 10 ? 'detailed' : 'compact';
    return <ResponsiveDataList data={data} variant={variant} />;
  }
  
  // Case 4: Simple value → Plain text
  return <span>{String(data)}</span>;
}

function calculateComplexity(data: Record<string, any>): number {
  let score = 0;
  Object.values(data).forEach(value => {
    if (typeof value === 'object') score += 5;
    if (Array.isArray(value)) score += 3;
    if (typeof value === 'string' && value.length > 100) score += 2;
    score += 1;
  });
  return score;
}
```

---

## Implementation Plan

### Phase 1: Replace Table with Definition List (Immediate)
**File:** `app/components/Collapsible/Collapsible.tsx`

1. Replace `NestedProperties` table with `ResponsiveDataList`
2. Add variant prop to support compact/detailed/regulatory modes
3. Update CSS classes for mobile-first responsive design

**Estimated Effort:** 2-3 hours  
**Testing:** Visual regression testing on 10+ materials

### Phase 2: Smart Data Detection (Week 1)
**Files:** 
- `app/components/Collapsible/Collapsible.tsx`
- New: `app/components/DataRenderer/SmartDataRenderer.tsx`

1. Create `SmartDataRenderer` component
2. Implement data structure detection
3. Add complexity calculation
4. Integrate with Collapsible

**Estimated Effort:** 4-6 hours  
**Testing:** Unit tests for detection logic, E2E tests for rendering

### Phase 3: Enhanced Card Layouts (Week 2)
**Files:**
- New: `app/components/DataCard/DataCard.tsx`
- Update: `app/components/IndustryApplicationsPanel/IndustryApplicationsPanel.tsx`

1. Create reusable `DataCard` component
2. Migrate Industry Applications to card layout
3. Enhance Expert Q&A presentation
4. Standardize metadata display

**Estimated Effort:** 6-8 hours  
**Testing:** Visual testing across all materials, contaminants, compounds

---

## Accessibility Improvements

### Current Issues
- ❌ Tables within collapsibles create complex navigation for screen readers
- ❌ No ARIA labels for collapsible table data
- ❌ Nested tables are difficult to navigate

### Proposed Fixes

```tsx
<details 
  className="group rounded-md border"
  aria-labelledby={`section-${sectionId}`}
>
  <summary 
    id={`section-${sectionId}`}
    className="cursor-pointer"
    aria-expanded="false"
  >
    <h3>{sectionTitle}</h3>
  </summary>
  
  <div role="region" aria-labelledby={`section-${sectionId}`}>
    <dl className="responsive-data-list">
      <dt id={`term-${termId}`}>{label}</dt>
      <dd aria-labelledby={`term-${termId}`}>{value}</dd>
    </dl>
  </div>
</details>
```

**Benefits:**
- ✅ Proper ARIA roles for collapsible regions
- ✅ Semantic HTML (dl/dt/dd) for better screen reader navigation
- ✅ ID-based label associations
- ✅ Clear expanded/collapsed states

---

## Performance Considerations

### Current Issues
- Nested tables cause layout thrashing
- No virtualization for large datasets
- Full DOM rendering even when collapsed

### Proposed Optimizations

1. **Lazy rendering for collapsed sections:**
```tsx
const [isOpen, setIsOpen] = useState(false);

<details onToggle={(e) => setIsOpen(e.target.open)}>
  <summary>...</summary>
  {isOpen && <DataRenderer data={data} />}
</details>
```

2. **Memoization for complex data:**
```tsx
const MemoizedDataList = React.memo(ResponsiveDataList, (prev, next) => {
  return JSON.stringify(prev.data) === JSON.stringify(next.data);
});
```

3. **Virtual scrolling for large lists (100+ items):**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedDataList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // estimated row height
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div key={virtualRow.index} style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`
          }}>
            <DataCard item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Visual Design Examples

### Before (Current Table)
```
┌─────────────────────────────────────────────┐
│ ▶ Aerospace                                 │
├─────────────────────────────────────────────┤
│ Name          │ Aerospace                   │
│ Content       │ Aircraft components and     │
│               │ aerospace systems           │
│ Category      │ Industrial Applications     │
│ Commonality   │ common                      │
└─────────────────────────────────────────────┘
```

### After Option 1 (Definition List)
```
┌─────────────────────────────────────────────┐
│ ▶ Aerospace                                 │
├─────────────────────────────────────────────┤
│                          Aircraft components│
│                        and aerospace systems│
│                                             │
│            Category  Industrial Applications│
│         Commonality  Common                 │
└─────────────────────────────────────────────┘
```

### After Option 2 (Card Layout - Recommended for Expert Q&A)
```
┌─────────────────────────────────────────────┐
│ What makes aluminum suitable for industrial│
│ laser cleaning?                             │
│                                             │
│ Lightweight with low density. Aluminum      │
│ weighs around 2.7 grams per cubic           │
│ centimeter...                               │
│                                             │
│ [High] [Accepted Answer]                    │
│                                             │
│ — Alessandro Moretti, Ph.D.                 │
└─────────────────────────────────────────────┘
```

---

## Backward Compatibility

All proposals maintain backward compatibility with existing YAML structures:

```yaml
# Current structure - still works
industry_applications:
  presentation: collapsible
  items:
    - id: aerospace
      title: Aerospace
      content: Aircraft components
      metadata:
        category: Industrial Applications

# Enhanced structure - automatically detected
industry_applications:
  presentation: cards  # NEW: explicit presentation mode
  layout: grid-2col    # NEW: layout control
  items:
    - id: aerospace
      title: Aerospace
      content: Aircraft components
      icon: plane        # NEW: optional icon
      metadata:
        category: Industrial Applications
```

---

## Recommended Approach

**PHASE 1 (Immediate):** Implement Option 1 (Definition List) for all existing collapsible sections
- Lowest risk
- Immediate UX improvement
- Better semantics and accessibility
- Mobile-first responsive design

**PHASE 2 (Week 1):** Add Option 3 (Smart Detection) for automatic layout optimization
- Detect data structure
- Choose optimal presentation
- Maintain backward compatibility

**PHASE 3 (Week 2):** Enhance specific sections with Option 2 (Card Layouts)
- Expert Q&A → Rich cards with author info
- Industry Applications → Grid of application cards
- Regulatory Standards → Keep current implementation (already optimal)

---

## Testing Strategy

### Visual Regression Tests
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, 414x896)

### Accessibility Tests
- [ ] Screen reader navigation (VoiceOver, NVDA)
- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Color contrast (WCAG AA minimum)
- [ ] Focus indicators

### Performance Tests
- [ ] Collapsible toggle response time (<100ms)
- [ ] Page load impact (minimal)
- [ ] Memory usage with 100+ items
- [ ] Virtual scrolling for large datasets

### Data Structure Tests
- [ ] Simple key-value pairs
- [ ] Nested objects (3+ levels)
- [ ] Arrays of objects
- [ ] Mixed data types
- [ ] Large text content (500+ words)

---

## Migration Path

### Step 1: Create new components (no breaking changes)
```bash
app/components/DataRenderer/
  ├── ResponsiveDataList.tsx
  ├── SmartDataRenderer.tsx
  ├── DataCard.tsx
  └── index.ts
```

### Step 2: Add feature flag in Collapsible.tsx
```tsx
interface CollapsibleProps {
  useEnhancedLayout?: boolean;  // Feature flag
  // ... existing props
}
```

### Step 3: Gradual rollout
1. Week 1: Test on 10 materials with `useEnhancedLayout={true}`
2. Week 2: Expand to all materials
3. Week 3: Enable for contaminants
4. Week 4: Enable for compounds
5. Week 5: Remove feature flag, make default

### Step 4: Update documentation
- [ ] Update FRONTMATTER_FRONTEND_GUIDE_JAN3_2026.md
- [ ] Add examples to component documentation
- [ ] Update TypeScript interfaces
- [ ] Add JSDoc comments with examples

---

## Success Metrics

### User Experience
- ✅ 50% reduction in horizontal scrolling on mobile
- ✅ Improved readability scores (surveys)
- ✅ Faster information scanning (eye-tracking)

### Accessibility
- ✅ Zero WCAG violations
- ✅ 100% keyboard navigable
- ✅ Improved screen reader feedback

### Performance
- ✅ <100ms collapsible toggle time
- ✅ <5% increase in bundle size
- ✅ No layout shift (CLS = 0)

### Developer Experience
- ✅ Easier to add new data types
- ✅ Clear documentation and examples
- ✅ Type-safe interfaces

---

## Questions for Stakeholders

1. **Priority:** Which sections need improvement first?
   - [ ] Industry Applications
   - [ ] Expert Q&A
   - [ ] Regulatory Standards
   - [ ] All equally

2. **Timeline:** When should this be implemented?
   - [ ] Immediate (this week)
   - [ ] Next sprint (1-2 weeks)
   - [ ] Backlog (future)

3. **Scope:** Should we implement all 3 phases or just Phase 1?
   - [ ] Phase 1 only (definition lists)
   - [ ] Phases 1 + 2 (smart detection)
   - [ ] All 3 phases (full enhancement)

4. **Testing:** What level of testing is required?
   - [ ] Manual testing only
   - [ ] Automated visual regression
   - [ ] Full accessibility audit

---

## Related Documentation

- [Collapsible Component](../app/components/Collapsible/Collapsible.tsx)
- [Frontend Guide](./FRONTMATTER_FRONTEND_GUIDE_JAN3_2026.md)
- [Naming Conventions](./NAMING_STANDARDS_VERIFICATION_JAN4_2026.md)
- [Type System](../types/centralized.ts)

---

## Appendix: Code Snippets

### Full ResponsiveDataList Implementation
```tsx
// app/components/DataRenderer/ResponsiveDataList.tsx

import React from 'react';

export interface ResponsiveDataListProps {
  data: Record<string, any>;
  variant?: 'compact' | 'detailed' | 'regulatory';
  className?: string;
}

export function ResponsiveDataList({ 
  data, 
  variant = 'detailed',
  className = '' 
}: ResponsiveDataListProps) {
  const entries = Object.entries(data).filter(([key, value]) => 
    !key.startsWith('_') && value !== null && value !== undefined
  );

  if (entries.length === 0) return null;

  const gridClasses = {
    compact: 'grid grid-cols-1 md:grid-cols-[minmax(120px,200px)_1fr] gap-x-4 gap-y-2',
    detailed: 'grid grid-cols-1 md:grid-cols-[minmax(180px,240px)_1fr] gap-x-6 gap-y-4',
    regulatory: 'grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_1fr] gap-x-8 gap-y-6'
  };

  return (
    <dl className={`${gridClasses[variant]} ${className}`}>
      {entries.map(([key, value], idx) => {
        const termId = `term-${key}-${idx}`;
        
        return (
          <React.Fragment key={key}>
            <dt 
              id={termId}
              className="font-semibold text-gray-300 md:text-right md:pr-4 
                         self-start pt-1 text-sm md:text-base"
            >
              {formatKey(key)}
            </dt>
            
            <dd 
              aria-labelledby={termId}
              className="text-gray-300 pl-4 md:pl-0 border-l-2 md:border-l-0 
                         border-gray-700 md:border-0 pb-3 md:pb-0"
            >
              {renderValue(value, variant)}
            </dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function renderValue(value: any, variant: string): React.ReactNode {
  // Arrays
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => (
          <li key={i}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  
  // Nested objects
  if (typeof value === 'object' && value !== null) {
    return <ResponsiveDataList data={value} variant="compact" />;
  }
  
  // Simple values
  return <span>{String(value)}</span>;
}
```

---

**End of Proposal**
