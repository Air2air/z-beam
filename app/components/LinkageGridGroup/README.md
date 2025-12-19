# LinkageGridGroup Component

**Location**: `app/components/LinkageGridGroup/LinkageGridGroup.tsx`  
**Purpose**: Groups multiple LinkageGrid components with category heading  
**Created**: December 17, 2025

---

## Overview

LinkageGridGroup is an organizational component that groups multiple LinkageGrid sections under a single category heading. It automatically filters out empty grids and provides optional group-level title and description.

## Architecture

### Component Props

```tsx
interface LinkageGridItem {
  data: any[];
  type: 'materials' | 'contaminants' | 'settings';
  title: string;
  description?: string;
  sortBy?: 'frequency' | 'severity';
}

interface LinkageGridGroupProps {
  title?: string;
  description?: string;
  grids: LinkageGridItem[];
}
```

### Key Features

1. **Automatic Filtering**: Empty grids (no data or data.length === 0) excluded
2. **Category Heading**: Optional group title and description
3. **Flexible Layout**: Renders grids with proper spacing (space-y-16)
4. **Type-Safe**: Full TypeScript support for grid configurations
5. **Conditional Rendering**: Only renders if at least one grid has data

## Usage

### Basic Example

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
      description: 'Contaminants this material supports',
    },
    {
      data: metadata?.related_materials,
      type: 'materials',
      title: 'Related Materials',
      description: 'Materials with similar properties',
    },
    {
      data: metadata?.recommended_settings,
      type: 'settings',
      title: 'Recommended Settings',
    },
  ]}
/>
```

### With Dynamic Metadata

```tsx
import { getEnrichmentMetadata } from '@/app/utils/layoutHelpers';

const grids = [
  {
    data: metadata?.removable_contaminants,
    type: 'contaminants' as const,
    ...getEnrichmentMetadata(
      metadata,
      'contaminant_linkage',
      'Removable Contaminants',
      'Contaminants this material can clean'
    ),
  },
  {
    data: metadata?.related_materials,
    type: 'materials' as const,
    ...getEnrichmentMetadata(
      metadata,
      'material_linkage',
      'Related Materials',
      'Similar materials'
    ),
  },
  {
    data: metadata?.recommended_settings,
    type: 'settings' as const,
    ...getEnrichmentMetadata(
      metadata,
      'settings_linkage',
      'Recommended Settings',
      'Optimal parameters'
    ),
  },
];

<LinkageGridGroup
  title="Related Content"
  grids={grids}
/>
```

### Without Group Heading

```tsx
// No title/description - renders grids without group header
<LinkageGridGroup
  grids={[
    {
      data: metadata?.related_materials,
      type: 'materials',
      title: 'Related Materials',
    },
  ]}
/>
```

## Benefits

### Code Reduction

**Before LinkageGridGroup** (MaterialsLayout example):
```tsx
<LinkageSection
  data={metadata?.removable_contaminants}
  title="Removable Contaminants"
  description="..."
  mapper={contaminantLinkageToGridItem}
  sorter={sortByFrequency}
/>

<LinkageSection
  data={metadata?.related_materials}
  title="Related Materials"
  description="..."
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
/>

<LinkageSection
  data={metadata?.recommended_settings}
  title="Recommended Settings"
  description="..."
  mapper={settingsLinkageToGridItem}
/>
```
**Lines**: 21

**After LinkageGridGroup**:
```tsx
<LinkageGridGroup
  title="Related Content"
  grids={[
    { data: metadata?.removable_contaminants, type: 'contaminants', title: 'Removable Contaminants' },
    { data: metadata?.related_materials, type: 'materials', title: 'Related Materials' },
    { data: metadata?.recommended_settings, type: 'settings', title: 'Recommended Settings' },
  ]}
/>
```
**Lines**: 9 (57% reduction)

### Maintainability

1. **Centralized Configuration**: All related linkages in one place
2. **Automatic Filtering**: No manual checks for empty data
3. **Consistent Spacing**: Standardized layout across all pages
4. **Category Organization**: Related content logically grouped
5. **Easy Reordering**: Change grid array order to reorder sections

## Common Patterns

### Materials Page

```tsx
const grids = [
  {
    data: metadata?.removable_contaminants,
    type: 'contaminants' as const,
    title: 'Removable Contaminants',
    description: 'Contaminants this material can effectively clean',
  },
  {
    data: metadata?.related_materials,
    type: 'materials' as const,
    title: 'Related Materials',
    description: 'Materials with similar laser cleaning properties',
  },
  {
    data: metadata?.recommended_settings,
    type: 'settings' as const,
    title: 'Recommended Settings',
    description: 'Optimal laser parameters for this material',
  },
];

<LinkageGridGroup
  title="Related Content"
  description="Explore materials, contaminants, and settings"
  grids={grids}
/>
```

### Contaminants Page

```tsx
const grids = [
  {
    data: metadata?.compatible_materials,
    type: 'materials' as const,
    title: 'Compatible Materials',
    description: 'Materials that work well with this contaminant',
  },
  {
    data: metadata?.produces_compounds,
    type: 'contaminants' as const,
    title: 'Related Contaminants',
    description: 'Related hazardous compounds',
    sortBy: 'severity' as const,
  },
  {
    data: metadata?.recommended_settings,
    type: 'settings' as const,
    title: 'Recommended Settings',
  },
];

<LinkageGridGroup
  title="Related Content"
  grids={grids}
/>
```

### Settings Page

```tsx
const grids = [
  {
    data: metadata?.effective_against,
    type: 'contaminants' as const,
    title: 'Effective Against',
    description: 'Contaminants these settings remove',
  },
  {
    data: metadata?.compatible_materials,
    type: 'materials' as const,
    title: 'Compatible Materials',
  },
  {
    data: metadata?.related_contaminants,
    type: 'contaminants' as const,
    title: 'Related Contaminants',
  },
  {
    data: metadata?.related_settings,
    type: 'settings' as const,
    title: 'Related Settings',
  },
];

<LinkageGridGroup
  title="Related Content"
  grids={grids}
/>
```

## Automatic Filtering

### Empty Grid Filtering

LinkageGridGroup automatically filters out grids with:
- `undefined` data
- Empty arrays (`data.length === 0`)

**Example**:
```tsx
// Input: 4 grids
const grids = [
  { data: [item1, item2], type: 'materials', title: 'Materials' },      // ✅ Rendered
  { data: [], type: 'contaminants', title: 'Contaminants' },           // ❌ Filtered out
  { data: undefined, type: 'settings', title: 'Settings' },             // ❌ Filtered out
  { data: [item3], type: 'materials', title: 'More Materials' },        // ✅ Rendered
];

// Output: 2 grids rendered (Materials + More Materials)
```

### Zero-Grid Handling

If all grids are filtered out, LinkageGridGroup renders nothing:

```tsx
const grids = [
  { data: [], type: 'materials', title: 'Materials' },
  { data: undefined, type: 'contaminants', title: 'Contaminants' },
];

<LinkageGridGroup grids={grids} />
// Result: Nothing rendered (no DOM output)
```

## Testing

**Test File**: `tests/components/LinkageGridGroup.test.tsx`

**Coverage**:
- ✅ Group title and description rendering
- ✅ All non-empty grids rendering
- ✅ Empty grid filtering
- ✅ Undefined data grid filtering
- ✅ Grid title rendering
- ✅ Grid description rendering (when provided)
- ✅ No group header when title not provided
- ✅ No description paragraph when not provided
- ✅ Zero rendering when all grids empty
- ✅ Grid order maintenance
- ✅ Correct type propagation to each grid

**Test Count**: 11 test cases

## Layout Integration

### Used In

1. **MaterialsLayout**: Groups 3 linkage sections
   - Removable Contaminants
   - Related Materials
   - Recommended Settings

2. **ContaminantsLayout**: Groups 3 linkage sections
   - Compatible Materials
   - Related Contaminants (compounds)
   - Recommended Settings

3. **SettingsLayout**: Groups 4 linkage sections
   - Effective Against (contaminants)
   - Compatible Materials
   - Related Contaminants
   - Related Settings

### Impact

**Total Reduction**:
- MaterialsLayout: 21 lines → 9 lines (57% reduction)
- ContaminantsLayout: 21 lines → 9 lines (57% reduction)
- SettingsLayout: 28 lines → 11 lines (61% reduction)

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | No | - | Group category heading |
| `description` | `string` | No | - | Group description text |
| `grids` | `LinkageGridItem[]` | Yes | - | Array of grid configurations |

### LinkageGridItem Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `any[]` | Yes | - | Array of linkage data items |
| `type` | `'materials' \| 'contaminants' \| 'settings'` | Yes | - | Data type for auto-selection |
| `title` | `string` | Yes | - | Individual grid title |
| `description` | `string` | No | - | Individual grid description |
| `sortBy` | `'frequency' \| 'severity'` | No | `'frequency'` | Sort method override |

## Related Components

- **LinkageGrid** - Individual grid wrapper (rendered by LinkageGridGroup)
- **LinkageSection** - Underlying section component
- **BaseContentLayout** - Uses LinkageGridGroup in sections array

## Migration Guide

### Before (Separate LinkageSection Calls)

```tsx
{metadata?.removable_contaminants && metadata.removable_contaminants.length > 0 && (
  <LinkageSection
    data={metadata.removable_contaminants}
    title="Removable Contaminants"
    mapper={contaminantLinkageToGridItem}
    sorter={sortByFrequency}
  />
)}

{metadata?.related_materials && metadata.related_materials.length > 0 && (
  <LinkageSection
    data={metadata.related_materials}
    title="Related Materials"
    mapper={materialLinkageToGridItem}
    sorter={sortByFrequency}
  />
)}

{metadata?.recommended_settings && metadata.recommended_settings.length > 0 && (
  <LinkageSection
    data={metadata.recommended_settings}
    title="Recommended Settings"
    mapper={settingsLinkageToGridItem}
  />
)}
```

### After (LinkageGridGroup)

```tsx
<LinkageGridGroup
  title="Related Content"
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

## Best Practices

1. **Use const typing**: Add `as const` to type props for type safety
2. **Extract grids array**: Define grids const outside JSX for readability
3. **Leverage getEnrichmentMetadata**: Dynamic titles from frontmatter
4. **Group related content**: Only group truly related linkages
5. **Provide descriptions**: Help users understand each section

## Performance

- **Automatic filtering**: Happens once per render
- **No re-renders**: Static grid configuration (no state)
- **Efficient mapping**: Single pass over grids array
- **Conditional rendering**: Empty grids never enter DOM

---

**Documentation Updated**: December 17, 2025  
**Status**: ✅ Production Ready  
**Test Coverage**: 11/11 passing
