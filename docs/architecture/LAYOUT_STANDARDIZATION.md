# Layout Width Standardization

**Date:** November 4, 2025  
**Version:** 2.2.0  
**Impact:** All page layouts

---

## Executive Summary

Standardized all page container widths to `max-w-6xl` (96rem / 1536px) for consistent user experience across the entire application. This consolidation addresses layout inconsistencies where different page types (home, search, category, material, datasets) were using varying widths (`max-w-5xl`, `max-w-6xl`, `max-w-7xl`).

---

## Problem Statement

### Before Standardization

Different page types used inconsistent container widths:

| Page Type | Previous Width | Pixels |
|-----------|---------------|---------|
| Material pages | `max-w-5xl` | 1280px |
| Static pages | `max-w-5xl` | 1280px |
| Home page | `max-w-6xl` | 1536px |
| Search results | `max-w-6xl` | 1536px |
| Category listings | `max-w-6xl` | 1536px |
| Dataset hero | `max-w-7xl` | 1792px |

**After Standardization:**

| Page Type | New Width | Pixels |
|-----------|-----------|---------|
| All pages | `max-w-6xl` | 1536px |

### Issues Identified

1. **Visual Discontinuity**: Users noticed width changes when navigating between page types
2. **Content Jump**: Layout shifts when moving from search (wider) to material page (narrower)
3. **Inconsistent Reading Experience**: Different line lengths affect readability
4. **Maintenance Complexity**: Multiple width standards to remember and maintain
5. **Design System Fragmentation**: No single source of truth for content width

---

## Solution: max-w-6xl Standard

### Rationale for max-w-6xl

**Chosen:** `max-w-6xl` (1536px)

**Why max-w-6xl?**

1. **Optimal Content Width**: 
   - Provides generous space for complex layouts and data tables
   - Balances readability with information density
   - Comfortable viewing on modern displays (1920px+)

2. **Consistency Across Pages**:
   - Unified width eliminates layout shifts between page types
   - Single standard simplifies maintenance and development
   - Predictable content area boundaries

3. **Dense Content Display**:
   - Material pages have extensive properties (30+ per material)
   - Tables, metrics grids, comparison charts display optimally
   - FAQs (9 questions) have ample space
   - Multi-column layouts work well

4. **Mobile-First Responsive**:
   - Works well on tablets (768px-1024px)
   - Graceful degradation to mobile breakpoints
   - Padding system (`px-4`) provides consistent margins

5. **Component Balance**:
   - Hero images display at good proportions
   - Card grids (2-4 columns) fit comfortably
   - Navigation and footer scale appropriately

**Rejected Alternatives:**

- **max-w-5xl (1280px)**: Too narrow for multi-column layouts, feels cramped on large screens
- **max-w-7xl (1792px)**: Excessive width creates poor reading experience, hard to scan
- **max-w-4xl (896px)**: Too narrow for data-heavy content and comparison tables

---

## Changes Made

### 1. Container Styles (`app/utils/containerStyles.ts`)

**File:** `app/utils/containerStyles.ts`

#### STANDARD_CONTAINER
```typescript
// Before
export const STANDARD_CONTAINER = 'mx-auto max-w-5xl px-3 sm:px-6';

// After
export const STANDARD_CONTAINER = 'mx-auto max-w-6xl px-4 sm:px-6';
```

#### CONTAINER_STYLES.standard
```typescript
// Before
standard: 'mx-auto max-w-5xl px-3 sm:px-6',

// After
standard: 'mx-auto max-w-6xl px-4 sm:px-6',
```

#### CONTAINER_STYLES.contentOnly
```typescript
// Before
contentOnly: 'mx-auto max-w-5xl px-3 sm:px-6',

// After
contentOnly: 'mx-auto max-w-6xl px-4 sm:px-6',
```

#### CONTAINER_STYLES.section
```typescript
// Before
section: 'mx-auto max-w-5xl px-3 sm:px-4',

// After
section: 'mx-auto max-w-6xl px-4 sm:px-4',
```

#### CONTAINER_STYLES.main
```typescript
// Before
main: 'mx-auto max-w-5xl px-4 sm:px-6',

// After
main: 'mx-auto max-w-6xl px-4 sm:px-6',
```

**Additional Changes:**
- Updated padding: `px-3` → `px-4` for consistency
- All responsive breakpoints maintained
- Margin centering (`mx-auto`) preserved

---

### 2. Hero Component (`app/components/Hero/Hero.tsx`)

**File:** `app/components/Hero/Hero.tsx`  
**Line:** 99

```typescript
// Before
const containerClasses = `mx-auto max-w-5xl px-4 sm:px-6`;

// After
const containerClasses = `mx-auto max-w-6xl px-4 sm:px-6`;
```

**Impact:**
- Hero sections now match content width
- Video player maintains aspect ratio
- Image display proportions consistent with content

---

### 3. Dataset Hero (`app/components/Dataset/DatasetHero.tsx`)

**File:** `app/components/Dataset/DatasetHero.tsx`  
**Line:** 18

```typescript
// Before
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

// After
<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
```

**Impact:**
- Dataset page hero matches site-wide standard
- Bulk download buttons and description properly aligned
- Consistent with other hero implementations

---

## Affected Pages

### Home Page (`app/page.tsx`)
- Uses `CONTAINER_STYLES.standard`
- Now displays at `max-w-6xl`
- Hero, featured materials, and content sections aligned

### Search Results (`app/search/page.tsx`)
- Uses `CONTAINER_STYLES.standard`
- Now displays at `max-w-6xl`
- Search results grid matches site-wide width

### Category Listings (`app/[category]/page.tsx`)
- Uses `CONTAINER_STYLES.standard`
- Now displays at `max-w-6xl`
- Category grids and listings consistent across site

### Material Pages (`app/materials/[...slug]/page.tsx`)
- Updated to `max-w-6xl`
- Matches all other pages
- More space for property tables and data

### Dataset Page (`app/datasets/page.tsx`)
- Uses `CONTAINER_STYLES.standard`
- Hero section updated to `max-w-6xl`
- Card grids and download sections aligned

### Static Pages
- Updated to `max-w-6xl`
- Contact, About, Services pages consistent
- All pages now match site-wide standard

---

## Visual Impact

### Before/After Comparison

**All Pages:**
```
Before: Mixed (1280px - 1792px)
After:  [        max-w-6xl (1536px)         ]
```

**Result:** Consistent width across all pages at 1536px.

---

## Responsive Behavior

All breakpoints maintained:

```css
/* Mobile (< 640px) */
px-4 (16px horizontal padding)

/* Small screens (≥ 640px) */
sm:px-6 (24px horizontal padding)

/* Large screens (≥ 1024px) */
lg:px-8 (32px horizontal padding)

/* Max width applied at all breakpoints */
max-w-6xl (1536px container)
```

**Graceful degradation:**
- Mobile: Full width minus padding
- Tablet: Respects max-w-6xl with appropriate padding
- Desktop: Centered 1536px container
- Ultra-wide: Centered with max-w-6xl constraint

---

## Testing & Validation

### Manual Testing
- ✅ Home page displays at consistent width
- ✅ Search results align with all pages
- ✅ Category listings match site standard
- ✅ Material pages updated to match
- ✅ Dataset page hero and content aligned
- ✅ No horizontal scroll on any page
- ✅ Responsive breakpoints working correctly

### Automated Testing
- ✅ `tests/utils/containerStyles-width.test.ts` created
- ✅ Verifies all `CONTAINER_STYLES` use `max-w-6xl`
- ✅ Checks for absence of deprecated widths (`max-w-5xl`, `max-w-7xl`)
- ✅ Validates consistent padding (`px-4`)
- ✅ Ensures required classes present (`mx-auto`, `max-w-6xl`, `px-4`)

### Build Validation
- ✅ Production build: 193 pages generated
- ✅ Zero errors
- ✅ 132 expected warnings (breadcrumb format - unrelated)
- ✅ All pages render correctly

---

## Component Architecture

### Container Style System

**Centralized in:** `app/utils/containerStyles.ts`

**Exported Constants:**
1. `STANDARD_CONTAINER` - Most common container style
2. `CONTAINER_STYLES.standard` - Alias for STANDARD_CONTAINER
3. `CONTAINER_STYLES.main` - Main content areas
4. `CONTAINER_STYLES.contentOnly` - Content-only layouts
5. `CONTAINER_STYLES.section` - Section containers

**Usage Pattern:**
```typescript
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';

<div className={CONTAINER_STYLES.standard}>
  {/* Content */}
</div>
```

**Benefits:**
- Single source of truth
- Easy to update globally
- Consistent naming
- Type-safe imports

---

## Migration Notes

### For Developers

**When creating new pages:**
```typescript
// ✅ DO: Use containerStyles utility
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';

<div className={CONTAINER_STYLES.standard}>
  <YourContent />
</div>

// ❌ DON'T: Hard-code width classes
<div className="mx-auto max-w-6xl px-4">
  <YourContent />
</div>
```

**When updating existing components:**
1. Import `CONTAINER_STYLES` from `@/app/utils/containerStyles`
2. Replace hard-coded width classes with appropriate style constant
3. Verify responsive behavior at all breakpoints
4. Run test suite to ensure consistency

**If you need a different width:**
- Document the reason (e.g., full-bleed image section)
- Consider if it's truly necessary
- Add test coverage for the exception
- Update this documentation

---

## Performance Impact

**No performance impact:**
- Same number of CSS classes
- No additional JavaScript
- No layout thrashing
- Build time unchanged

**Positive impacts:**
- Reduced cognitive load (fewer width standards)
- Easier maintenance (single source of truth)
- Better caching (consistent class names)

---

## Future Considerations

### Potential Enhancements

1. **Grid System Integration**:
   - Consider adding grid container utilities
   - Define consistent gap/spacing standards

2. **Breakpoint Refinement**:
   - Monitor analytics for common viewport sizes
   - Adjust breakpoints if user patterns change

3. **Component-Specific Widths**:
   - Hero sections might need special treatment
   - Consider full-bleed image sections

4. **Accessibility**:
   - Ensure zoom levels work correctly
   - Test with browser zoom at 200%

---

## Related Documentation

- **Frontmatter Structure**: `docs/FRONTMATTER_CURRENT_STRUCTURE.md`
- **Component Tests**: `tests/utils/containerStyles-width.test.ts`
- **Changelog**: `docs/CHANGELOG.md` - [2.2.0] entry
- **Container Styles**: `app/utils/containerStyles.ts` (source code)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.2.1 | Nov 4, 2025 | Standardization to max-w-6xl (1536px) |
| 2.2.0 | Nov 4, 2025 | Initial attempt at max-w-5xl (reverted) |
| 2.1.0 | Oct 26, 2025 | Mixed widths (5xl, 6xl, 7xl) |

---

**Maintained by:** Z-Beam Development Team  
**Last Review:** November 4, 2025  
**Next Review:** When adding major new page types or layout changes
