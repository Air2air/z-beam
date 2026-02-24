# Comparison Page YAML Sections Migration
## Date: February 14, 2026

## Overview
Migrated comparison table to YAML sections-based configuration, consolidating with the removal of surface-cleaning page.

## Changes Made

### 1. Added Sections to page.yaml
**File**: `/app/comparison/page.yaml`

Added sections array with comparison-type section:
```yaml
sections:
  - id: comparison-table
    type: comparison
    _section:
      title: Compare Cleaning Methods
      description: Research-based comparison of laser cleaning vs traditional surface preparation methods. Data sourced from California service providers (2024-2026).
      variant: default
```

### 2. Fixed Dynamic Import Handling
**File**: `/app/utils/pages/createStaticPage.tsx`

**Issue**: JSON files imported with dynamic `import()` return a module object with `default` property, but code was treating it as raw data.

**Fix**: Added `data.default` extraction:
```typescript
const data = await config.comparisonData();
// Handle both array format and { methods: [] } format, and module.default format
const rawData = data.default || data;
comparisonMethods = Array.isArray(rawData) ? rawData : rawData.methods;
```

### 3. Removed Duplicate Comparison Table
**File**: `/app/utils/pages/createStaticPage.tsx`

Removed hardcoded comparison table block that appeared before sections loop:
```typescript
// REMOVED:
{config?.hasComparison && comparisonMethods && (
  <BaseSection
    title="Compare Cleaning Methods"
    description="See how laser cleaning stacks up against traditional methods"
    variant="default"
  >
    <ComparisonTable
      methods={comparisonMethods}
      highlightMethod={config.comparisonHighlight}
    />
  </BaseSection>
)}
```

Now only renders from YAML sections configuration.

### 4. Updated Tests
**File**: `/tests/utils/staticPageLoader.test.ts`

Added `'comparison'` to the list of tested static page directories:
```typescript
const pageDirectories = [
  'contact', 'rental', 'partners', 'equipment', 
  'operations', 'schedule', 'services', 'safety', 
  'about', 'netalux', 'comparison'  // ← Added
];
```

### 5. Updated Documentation
**File**: `/SURFACE_CLEANING_COMPARISON_PAGE_FEB11_2026.md`

- Added update note explaining consolidation
- Documented removal of standalone `/surface-cleaning-comparison` page
- Updated to reflect new YAML-based implementation at `/comparison`

## Technical Architecture

### Data Flow
1. **PAGE_CONFIGS** defines comparison page with:
   - `hasComparison: true`
   - `comparisonData: () => import('@/data/comparison-methods.json')`
   - `comparisonHighlight: 'Laser Cleaning'`

2. **renderContentCardsPage** function:
   - Loads comparison data dynamically
   - Extracts from `data.default` (module format)
   - Iterates through YAML sections
   - When `section.type === 'comparison'`, renders ComparisonTable

3. **ComparisonTable component**:
   - Receives methods array and highlightMethod
   - Renders interactive table with expand/collapse
   - Uses section title/description from YAML

### Benefits of YAML Approach
✅ **Content Management**: Non-developers can edit comparison section metadata  
✅ **Consistency**: Uses same section-based rendering as other pages  
✅ **Flexibility**: Easy to add more sections or reorder content  
✅ **Maintainability**: Single pattern for all static pages  
✅ **SEO Control**: Section titles/descriptions in YAML for content optimization

## Related Changes
- Part of surface-cleaning page removal (Feb 14, 2026)
- Consolidated duplicate comparison functionality
- Aligned with YAML-based content architecture

## Verification
- [x] Comparison table displays correctly at `/comparison`
- [x] Data loads from `comparison-methods.json`
- [x] No duplicate tables
- [x] Section title/description from YAML renders correctly
- [x] Laser Cleaning method is highlighted
- [x] Tests updated to include comparison page
- [x] Documentation updated

## Files Modified
1. `/app/comparison/page.yaml` - Added sections configuration
2. `/app/utils/pages/createStaticPage.tsx` - Fixed data loading, removed duplicate
3. `/tests/utils/staticPageLoader.test.ts` - Added comparison to test list
4. `/SURFACE_CLEANING_COMPARISON_PAGE_FEB11_2026.md` - Updated with consolidation notes
