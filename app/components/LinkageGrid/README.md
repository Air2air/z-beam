# LinkageGrid Component

**Location**: `app/components/LinkageGrid/LinkageGrid.tsx`  
**Purpose**: Simplified wrapper for LinkageSection + DataGrid pattern with auto-selection  
**Created**: December 17, 2025

---

## Overview

LinkageGrid is a convenience wrapper that simplifies the LinkageSection + DataGrid pattern by automatically selecting the correct mapper and sorter based on the data type. It reduces boilerplate code for rendering linkage sections.

## Architecture

### Component Props

```tsx
interface LinkageGridProps {
  data: any[];
  type: 'materials' | 'contaminants' | 'settings';
  title: string;
  description?: string;
  sortBy?: 'frequency' | 'severity';
  variant?: 'domain-linkage' | 'compact';
}
```

### Auto-Selection Logic

**Mappers** (automatically selected by type):
- `materials` → `materialLinkageToGridItem`
- `contaminants` → `contaminantLinkageToGridItem`
- `settings` → `settingsLinkageToGridItem`

**Sorters** (automatically selected by sortBy):
- `frequency` → `sortByFrequency` (default for materials/contaminants)
- `severity` → `sortBySeverity`

## Usage

### Basic Example

```tsx
import LinkageGrid from '@/app/components/LinkageGrid/LinkageGrid';

<LinkageGrid
  data={metadata?.related_materials}
  type="materials"
  title="Related Materials"
  description="Materials with similar properties"
/>
```

### With Custom Sort

```tsx
<LinkageGrid
  data={metadata?.removable_contaminants}
  type="contaminants"
  title="Removable Contaminants"
  sortBy="severity"  // Override default (frequency)
/>
```

### With Dynamic Metadata

```tsx
import { getEnrichmentMetadata } from '@/app/utils/layoutHelpers';

<LinkageGrid
  data={metadata?.recommended_settings}
  type="settings"
  {...getEnrichmentMetadata(
    metadata,
    'settings_linkage',
    'Recommended Settings',
    'Settings optimized for this material'
  )}
/>
```

## Benefits

### Code Reduction

**Before LinkageGrid**:
```tsx
<LinkageSection
  data={metadata?.related_materials}
  title="Related Materials"
  description="Materials with similar properties"
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
  variant="domain-linkage"
/>
```
**Lines**: 7

**After LinkageGrid**:
```tsx
<LinkageGrid
  data={metadata?.related_materials}
  type="materials"
  title="Related Materials"
  description="Materials with similar properties"
/>
```
**Lines**: 5 (28% reduction)

### Maintainability

1. **No Mapper/Sorter Selection**: Automatically chosen based on type
2. **Type Safety**: TypeScript ensures correct type usage
3. **Consistent Behavior**: Same mappers/sorters across all usage
4. **Less Boilerplate**: Fewer props to specify
5. **Clearer Intent**: Type prop shows data category clearly

## Common Patterns

### Materials Linkage

```tsx
<LinkageGrid
  data={metadata?.related_materials}
  type="materials"
  title="Related Materials"
  description="Materials with similar laser cleaning properties"
/>
```

### Contaminants Linkage

```tsx
<LinkageGrid
  data={metadata?.removable_contaminants}
  type="contaminants"
  title="Removable Contaminants"
  description="Contaminants this material can effectively remove"
  sortBy="severity"  // Sort by severity instead of frequency
/>
```

### Settings Linkage

```tsx
<LinkageGrid
  data={metadata?.recommended_settings}
  type="settings"
  title="Recommended Settings"
  description="Optimal laser parameters for this material"
/>
```

## Integration with LinkageGridGroup

LinkageGrid works seamlessly with LinkageGridGroup for category-based organization:

```tsx
import LinkageGridGroup from '@/app/components/LinkageGridGroup/LinkageGridGroup';

<LinkageGridGroup
  title="Related Content"
  description="Explore related materials, contaminants, and settings"
  grids={[
    {
      data: metadata?.removable_contaminants,
      type: 'contaminants',
      title: 'Removable Contaminants',
    },
    {
      data: metadata?.related_materials,
      type: 'materials',
      title: 'Related Materials',
    },
    {
      data: metadata?.recommended_settings,
      type: 'settings',
      title: 'Recommended Settings',
    },
  ]}
/>
```

## Data Type Mapping

### Materials

**Input Data Structure**:
```typescript
{
  material: string;
  frequency: 'Very Common' | 'Common' | 'Occasional' | 'Rare';
  description?: string;
}
```

**Mapper**: `materialLinkageToGridItem`  
**Default Sorter**: `sortByFrequency`

### Contaminants

**Input Data Structure**:
```typescript
{
  contaminant: string;
  severity: 'High' | 'Medium' | 'Low';
  frequency?: string;
  description?: string;
}
```

**Mapper**: `contaminantLinkageToGridItem`  
**Default Sorter**: `sortByFrequency`  
**Optional Sorter**: `sortBySeverity`

### Settings

**Input Data Structure**:
```typescript
{
  setting: string;
  value: string;
  description?: string;
}
```

**Mapper**: `settingsLinkageToGridItem`  
**Default Sorter**: None (original order maintained)

## Testing

**Test File**: `tests/components/LinkageGrid.test.tsx`

**Coverage**:
- ✅ LinkageSection rendering with title/description
- ✅ DataGrid rendering with materials data
- ✅ DataGrid rendering with contaminants data
- ✅ DataGrid rendering with settings data
- ✅ Default frequency sort for materials/contaminants
- ✅ Custom sort override via sortBy prop
- ✅ Custom variant support
- ✅ Empty data array handling
- ✅ Undefined data handling
- ✅ Type propagation to LinkageSection
- ✅ Optional description handling

**Test Count**: 12 test cases

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `any[]` | Yes | - | Array of linkage data items |
| `type` | `'materials' \| 'contaminants' \| 'settings'` | Yes | - | Data type for auto-selection |
| `title` | `string` | Yes | - | Section title |
| `description` | `string` | No | - | Section description |
| `sortBy` | `'frequency' \| 'severity'` | No | `'frequency'` | Sort method override |
| `variant` | `'domain-linkage' \| 'compact'` | No | `'domain-linkage'` | Grid display variant |

## Related Components

- **LinkageSection** - Underlying component (wrapped by LinkageGrid)
- **LinkageGridGroup** - Groups multiple LinkageGrid components
- **DataGrid** - Generic grid renderer (used by LinkageSection)

## Migration Guide

### Before (LinkageSection)

```tsx
import LinkageSection from '@/app/components/LinkageSection/LinkageSection';
import { materialLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';

<LinkageSection
  data={metadata?.related_materials}
  title="Related Materials"
  description="Materials with similar properties"
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
  variant="domain-linkage"
/>
```

### After (LinkageGrid)

```tsx
import LinkageGrid from '@/app/components/LinkageGrid/LinkageGrid';

<LinkageGrid
  data={metadata?.related_materials}
  type="materials"
  title="Related Materials"
  description="Materials with similar properties"
/>
```

## Best Practices

1. **Use correct type**: Ensure type prop matches data structure
2. **Leverage auto-selection**: Let component choose mapper/sorter
3. **Override when needed**: Use sortBy for special cases
4. **Combine with getEnrichmentMetadata**: Dynamic titles from frontmatter
5. **Group related linkages**: Use LinkageGridGroup for organization

## Performance

- **No overhead**: Direct passthrough to LinkageSection
- **Auto-selection**: Happens once per render (negligible cost)
- **Same rendering**: Identical output to manual LinkageSection usage

---

**Documentation Updated**: December 17, 2025  
**Status**: ✅ Production Ready  
**Test Coverage**: 12/12 passing
