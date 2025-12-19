# Developer Quick Reference - LinkageSection Component

**Last Updated**: December 17, 2025  
**Component**: LinkageSection<T>  
**Purpose**: Universal component for rendering linkage sections

---

## 🚀 Quick Start

### Installation
```typescript
import { LinkageSection } from '@/app/components/LinkageSection';
import { mapMaterialToGridItem } from '@/app/utils/gridMappers';
import { sortByMaterialType } from '@/app/utils/gridSorters';
```

### Basic Usage
```typescript
<LinkageSection
  data={metadata.related_materials}
  title="Related Materials"
  description="Materials commonly used with this item"
  mapper={mapMaterialToGridItem}
  sorter={sortByMaterialType}
  variant="domain-linkage"
/>
```

---

## 📋 Common Patterns

### Pattern 1: Related Materials
```typescript
<LinkageSection
  data={metadata.related_materials}
  title="Related Materials"
  description="Materials commonly associated with this item"
  mapper={mapMaterialToGridItem}
  sorter={sortByMaterialType}
  variant="domain-linkage"
/>
```

### Pattern 2: Related Contaminants
```typescript
<LinkageSection
  data={metadata.related_contaminants}
  title="Related Contaminants"
  description="Contaminants commonly found on this material"
  mapper={mapContaminantToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>
```

### Pattern 3: Related Settings
```typescript
<LinkageSection
  data={metadata.related_settings}
  title="Recommended Settings"
  description="Laser settings optimized for this scenario"
  mapper={mapSettingToGridItem}
  sorter={sortByFrequency}
  variant="domain-linkage"
/>
```

### Pattern 4: Removes Contaminants
```typescript
<LinkageSection
  data={metadata.removes_contaminants}
  title="Removes Contaminants"
  description="Contaminants effectively removed by this process"
  mapper={mapContaminantToGridItem}
  sorter={sortByTitle}
  variant="domain-linkage"
/>
```

---

## 🔧 Available Mappers

### Material Mappers
```typescript
import { mapMaterialToGridItem } from '@/app/utils/gridMappers';
// Maps: RelatedMaterial → GridItemSSR
// Fields: title, url, material_type, micro, industry_applications
```

### Contaminant Mappers
```typescript
import { mapContaminantToGridItem } from '@/app/utils/gridMappers';
// Maps: RelatedContaminant → GridItemSSR
// Fields: title, url, contaminant_category, micro, hazard_level
```

### Setting Mappers
```typescript
import { mapSettingToGridItem } from '@/app/utils/gridMappers';
// Maps: RelatedSetting → GridItemSSR
// Fields: title, url, setting_category, micro, precision_level
```

---

## 🔧 Available Sorters

### General Sorters
```typescript
import { sortByTitle } from '@/app/utils/gridSorters';
// Alphabetical by title

import { sortByFrequency } from '@/app/utils/gridSorters';
// By frequency (high to low)
```

### Material-Specific Sorters
```typescript
import { sortByMaterialType } from '@/app/utils/gridSorters';
// Groups by material_type, then alphabetical

import { sortByIndustry } from '@/app/utils/gridSorters';
// Groups by primary industry
```

### Contaminant-Specific Sorters
```typescript
import { sortBySeverity } from '@/app/utils/gridSorters';
// By hazard_level (high to low)

import { sortByCategory } from '@/app/utils/gridSorters';
// Groups by contaminant_category
```

---

## 📊 Props Reference

### Required Props
```typescript
data: T[] | undefined           // Array of linkage items (or undefined/empty)
title: string                   // Section heading
mapper: (item: T) => GridItemSSR // Transform function
```

### Optional Props
```typescript
description?: string            // Section description (below title)
sorter?: (a: T, b: T) => number // Sort function (optional, defaults to natural order)
columns?: number                // Grid columns (default: 3)
variant?: 'default' | 'domain-linkage' // Grid variant (default: 'default')
```

---

## ✅ Conditional Rendering

The component automatically handles null/empty data:

```typescript
// Returns null if:
// - data is undefined
// - data is empty array

// Example:
<LinkageSection
  data={metadata.related_materials} // Could be undefined
  title="Related Materials"
  mapper={mapMaterialToGridItem}
/>
// If metadata.related_materials is undefined or [], nothing renders
```

**No manual conditional checks needed!**

---

## 🎨 Variants

### Default Variant
```typescript
variant="default"
// Standard card grid styling
```

### Domain Linkage Variant
```typescript
variant="domain-linkage"
// Optimized for cross-domain relationships
// Enhanced hover states and linkage indicators
```

---

## 📏 Columns

### Default (3 columns)
```typescript
<LinkageSection
  data={items}
  title="Items"
  mapper={mapItem}
/>
```

### Custom Columns
```typescript
<LinkageSection
  data={items}
  title="Items"
  mapper={mapItem}
  columns={4} // 4-column grid
/>
```

---

## 🧪 Testing

### Unit Test Example
```typescript
import { render, screen } from '@testing-library/react';
import { LinkageSection } from '@/app/components/LinkageSection';

it('should render section with data', () => {
  const mockData = [{
    title: 'Test Material',
    url: '/materials/test',
    material_type: 'Metal',
    micro: 'Test description'
  }];

  render(
    <LinkageSection
      data={mockData}
      title="Test Section"
      mapper={mapMaterialToGridItem}
    />
  );

  expect(screen.getByText('Test Section')).toBeInTheDocument();
  expect(screen.getByText('Test Material')).toBeInTheDocument();
});
```

### Integration Test Example
```typescript
it('should match layout usage pattern', () => {
  render(
    <LinkageSection
      data={metadata.related_materials}
      title="Related Materials"
      description="Materials commonly used"
      mapper={mapMaterialToGridItem}
      sorter={sortByMaterialType}
      variant="domain-linkage"
    />
  );

  expect(screen.getByText('Related Materials')).toBeInTheDocument();
});
```

---

## 🐛 Troubleshooting

### Issue: Section not rendering
**Problem**: Component returns null even though data exists

**Check**:
```typescript
// 1. Verify data is not undefined
console.log('Data:', metadata.related_materials);

// 2. Verify data is not empty array
console.log('Length:', metadata.related_materials?.length);

// 3. Verify data structure matches mapper expectations
console.log('First item:', metadata.related_materials?.[0]);
```

### Issue: TypeScript errors
**Problem**: Type mismatch between data and mapper

**Solution**:
```typescript
// Ensure data type matches mapper input type
const data: RelatedMaterial[] = metadata.related_materials;

<LinkageSection
  data={data}
  title="Materials"
  mapper={mapMaterialToGridItem} // Expects RelatedMaterial
/>
```

### Issue: Sorting not working
**Problem**: Items appear in wrong order

**Check**:
```typescript
// 1. Verify sorter function is provided
sorter={sortByMaterialType} // Not sortByMaterialType() ❌

// 2. Verify sorter signature matches (a, b) => number
const customSort = (a: Material, b: Material) => {
  return a.title.localeCompare(b.title);
};
```

---

## 📚 Complete Documentation

- **API Reference**: [app/components/LinkageSection/README.md](../app/components/LinkageSection/README.md)
- **Test Coverage**: [LINKAGE_SECTION_TEST_COVERAGE.md](../../LINKAGE_SECTION_TEST_COVERAGE.md)
- **Integration Guide**: [LINKAGE_SECTION_INTEGRATION_COMPLETE.md](../../LINKAGE_SECTION_INTEGRATION_COMPLETE.md)
- **Consolidation Journey**: [MAXIMUM_REUSABILITY_ACHIEVED.md](../../MAXIMUM_REUSABILITY_ACHIEVED.md)

---

## 💡 Best Practices

### DO ✅
- Use LinkageSection for all linkage sections (50% code reduction)
- Provide descriptive titles and descriptions
- Use existing mappers and sorters when possible
- Let component handle conditional rendering (no manual checks)
- Use domain-linkage variant for cross-domain relationships

### DON'T ❌
- Manually write GridSection + DataGrid pattern (use LinkageSection instead)
- Add conditional checks (component handles this)
- Create custom mappers/sorters without checking existing ones first
- Pass sorter function call `sortByTitle()` instead of reference `sortByTitle`
- Mix variant styles within same layout

---

## 🚀 Migration from Manual Pattern

### Before (14 lines per section)
```typescript
{metadata.related_materials && metadata.related_materials.length > 0 && (
  <GridSection
    title="Related Materials"
    description="Materials commonly used"
  >
    <DataGrid
      items={metadata.related_materials}
      mapper={mapMaterialToGridItem}
      sorter={sortByMaterialType}
      columns={3}
      variant="domain-linkage"
    />
  </GridSection>
)}
```

### After (7 lines per section) - 50% reduction
```typescript
<LinkageSection
  data={metadata.related_materials}
  title="Related Materials"
  description="Materials commonly used"
  mapper={mapMaterialToGridItem}
  sorter={sortByMaterialType}
  variant="domain-linkage"
/>
```

---

## 📊 Performance

- **Component Size**: 50 lines
- **Bundle Impact**: Minimal (consolidates existing code)
- **Render Performance**: Identical to manual pattern
- **Type Safety**: Full TypeScript generic support

---

## 🎯 Quick Checklist

Before using LinkageSection:
- [ ] Import LinkageSection component
- [ ] Import appropriate mapper from gridMappers.ts
- [ ] Import appropriate sorter from gridSorters.ts (optional)
- [ ] Verify data field exists in frontmatter schema
- [ ] Provide meaningful title and description
- [ ] Choose appropriate variant (default or domain-linkage)

---

**Last Updated**: December 17, 2025  
**Component Version**: 1.0.0  
**Status**: Production Ready ✅
