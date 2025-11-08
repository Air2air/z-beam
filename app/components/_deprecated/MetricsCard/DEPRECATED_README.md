# ⚠️ DEPRECATED: MetricsCard Components

## Status: ARCHIVED

These components have been **replaced by PropertyBars** and are no longer used in production.

### Migration Complete

**Date**: November 8, 2025  
**Replacement**: `app/components/PropertyBars/PropertyBars.tsx`

### What Was Replaced

1. **MetricsGrid.tsx** (685 lines)
   - Complex categorized property display
   - Multiple data source support
   - Search and filter functionality
   - **Replaced by**: PropertyBars with same API

2. **MetricsCard.tsx** (306 lines)
   - Individual property card component
   - Progress bar visualization
   - **Replaced by**: Three-bar visualization in PropertyBars

### Why Replaced

- **Space Efficiency**: PropertyBars uses 89% less space (70px vs 640px)
- **Simplicity**: 179 lines vs 991 lines (82% code reduction)
- **Performance**: Faster rendering with simpler DOM structure
- **Maintainability**: Single source of truth for metrics display
- **Developer Experience**: Cleaner API with better TypeScript support

### Migration Guide

**Old (MetricsGrid):**
```tsx
import { MetricsGrid } from '@/app/components/MetricsCard/MetricsGrid';

<MetricsGrid 
  metadata={metadata} 
  dataSource="materialProperties" 
  layout="auto"
  showTitle={false}
  searchable
  defaultExpandedCategories={['thermal', 'mechanical']}
/>
```

**New (PropertyBars):**
```tsx
import { PropertyBars } from '@/app/components/PropertyBars/PropertyBars';

<PropertyBars 
  metadata={metadata} 
  dataSource="materialProperties" 
/>
```

### Usage Before Deprecation

**Last Known Usage:**
- `app/components/Layout/Layout.tsx` - **MIGRATED** (commit af609d8f)
- `app/components/Comparison/ComparisonPage.tsx` - **MIGRATED** (commit 61d677ab)
- `app/components/MetricsCard/MetricsCard.example.tsx` - Examples only

**Production Usage**: ZERO (as of November 8, 2025)

### Files in This Archive

```
_deprecated/MetricsCard/
├── MetricsGrid.tsx          (685 lines - categorized display)
├── MetricsCard.tsx          (306 lines - individual card)
└── DEPRECATED_README.md     (this file)
```

### If You Need to Reference These

These files are kept for:
1. **Historical Reference**: Understanding previous architecture
2. **Feature Comparison**: Comparing old vs new approaches
3. **Rollback Safety**: Emergency fallback if needed (unlikely)
4. **Learning**: Example of component evolution

### Related Documentation

- **New Standard**: `app/components/PropertyBars/README.md`
- **Migration Guide**: `scripts/MIGRATION_GUIDE.md`
- **Architecture**: `docs/METRICS_ARCHITECTURE_NORMALIZED.md`
- **Migration Script**: `scripts/migrate-to-property-bars.js`

### Removal Timeline

**Phase 1** (Current): Archived to `_deprecated/`  
**Phase 2** (After 30 days): Remove if no issues reported  
**Phase 3** (After 60 days): Permanent deletion from repository

### Questions or Issues?

If you encounter issues with PropertyBars or need features from these legacy components:

1. Check PropertyBars documentation first
2. Review migration guide for patterns
3. Open issue on GitHub with specific use case
4. Reference commit hashes: af609d8f (Layout), 61d677ab (ComparisonPage)

---

**DO NOT USE THESE COMPONENTS IN NEW CODE**

Use `PropertyBars` instead. See `app/components/PropertyBars/README.md` for documentation.
