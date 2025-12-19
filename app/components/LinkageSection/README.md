# LinkageSection Component

**Purpose**: Universal component for rendering linkage sections with consistent pattern  
**Created**: December 17, 2025  
**Pattern**: Consolidates repetitive GridSection + DataGrid + conditional rendering

---

## Overview

The `LinkageSection` component encapsulates the common pattern used across all layout components for rendering domain linkage sections. It consolidates:

1. **Conditional rendering** - Only renders if data exists
2. **GridSection wrapper** - Consistent title and description display
3. **DataGrid configuration** - Mapper, sorter, columns, variant

## Why This Component?

### Problem
Across ContaminantsLayout, MaterialsLayout, and SettingsLayout, we had 10+ instances of this pattern:

```tsx
{metadata?.produces_compounds && metadata.produces_compounds.length > 0 && (
  <GridSection
    title="Hazardous Compounds"
    description="Compounds produced during laser cleaning"
  >
    <DataGrid
      data={metadata.produces_compounds}
      mapper={compoundToGridItem}
      sorter={sortBySeverity}
      columns={3}
      variant="domain-linkage"
    />
  </GridSection>
)}
```

### Solution
Now consolidated to:

```tsx
<LinkageSection
  data={metadata.produces_compounds}
  title="Hazardous Compounds"
  description="Compounds produced during laser cleaning"
  mapper={compoundToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>
```

**Benefits**:
- ✅ 10 lines → 6 lines per section
- ✅ DRY principle - pattern defined once
- ✅ Consistent conditional rendering logic
- ✅ TypeScript generic support for type safety
- ✅ Still explicit and readable
- ✅ Easy to customize per section

---

## API

### Props

```typescript
interface LinkageSectionProps<T> {
  data: T[] | undefined;          // Data array from metadata
  title: string;                  // Section title (required)
  description?: string;           // Section description (optional)
  mapper: (item: T) => GridItemSSR; // Transformation function (required)
  sorter?: (a: T, b: T) => number;  // Sorting function (optional)
  columns?: number;               // Number of columns (default: 3)
  variant?: 'default' | 'domain-linkage'; // Grid variant (default: 'default')
}
```

### Type Safety

Uses TypeScript generics to maintain type safety:

```typescript
// Infers type from data array
<LinkageSection<CompoundLinkage>
  data={metadata.produces_compounds}
  mapper={compoundToGridItem}  // (item: CompoundLinkage) => GridItemSSR
/>
```

---

## Usage Examples

### Contaminants Layout

```tsx
import { LinkageSection } from '@/app/components/LinkageSection/LinkageSection';
import {
  compoundToGridItem,
  materialLinkageToGridItem,
  contaminantLinkageToGridItem,
  settingsLinkageToGridItem
} from '@/app/utils/gridMappers';
import { sortBySeverity, sortByFrequency } from '@/app/utils/gridSorters';

// Hazardous Compounds
<LinkageSection
  data={metadata.produces_compounds}
  title="Hazardous Compounds"
  description="Compounds produced during laser cleaning of this contaminant"
  mapper={compoundToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>

// Compatible Materials
<LinkageSection
  data={metadata.related_materials}
  title="Compatible Materials"
  description="Materials frequently contaminated by this substance"
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
/>

// Related Contaminants
<LinkageSection
  data={metadata.related_contaminants}
  title="Related Contaminants"
  description="Contaminants that often appear together with this substance"
  mapper={contaminantLinkageToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>

// Recommended Settings
<LinkageSection
  data={metadata.related_settings}
  title="Recommended Settings"
  description="Machine settings optimized for removing this contaminant"
  mapper={settingsLinkageToGridItem}
  sorter={sortByFrequency}
/>
```

### Materials Layout

```tsx
// Removable Contaminants
<LinkageSection
  data={metadata.removes_contaminants}
  title="Removable Contaminants"
  description="Contaminants that can be effectively removed from this material"
  mapper={contaminantLinkageToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>

// Related Materials
<LinkageSection
  data={metadata.related_materials}
  title="Related Materials"
  description="Materials with similar properties or applications"
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
/>

// Recommended Settings
<LinkageSection
  data={metadata.related_settings}
  title="Recommended Settings"
  description="Machine settings optimized for this material"
  mapper={settingsLinkageToGridItem}
  sorter={sortByFrequency}
/>
```

### Settings Layout

```tsx
// Effective Against
<LinkageSection
  data={metadata.effective_against}
  title="Effective Against"
  description="Contaminants these settings are optimized to remove"
  mapper={contaminantLinkageToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>

// Compatible Materials
<LinkageSection
  data={metadata.related_materials}
  title="Compatible Materials"
  description="Materials that work well with these settings"
  mapper={materialLinkageToGridItem}
  sorter={sortByFrequency}
/>

// Related Contaminants
<LinkageSection
  data={metadata.related_contaminants}
  title="Related Contaminants"
  description="Other contaminants these settings can address"
  mapper={contaminantLinkageToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>

// Related Settings
<LinkageSection
  data={metadata.related_settings}
  title="Related Settings"
  description="Alternative settings configurations"
  mapper={settingsLinkageToGridItem}
  sorter={sortByFrequency}
/>
```

---

## Architecture

### Component Hierarchy

```
LinkageSection (Smart wrapper)
└── Conditional Rendering (data && data.length > 0)
    └── GridSection (Section wrapper)
        └── DataGrid (Generic grid)
            └── Card[] (Grid items)
```

### Composition Pattern

LinkageSection follows the **Higher-Order Component (HOC)** pattern:
- **Input**: Raw linkage data array
- **Process**: Conditional check, transformation, sorting
- **Output**: Rendered grid or null

### Design Principles

1. **Single Responsibility**: Handles one pattern (linkage section rendering)
2. **Generic**: Works with any data type via TypeScript generics
3. **Composable**: Uses existing GridSection and DataGrid components
4. **Declarative**: Hides conditional logic, exposes simple API
5. **Type-Safe**: Full TypeScript support with generic constraints

---

## Comparison

### Before (Explicit Pattern)

```tsx
{metadata?.produces_compounds && metadata.produces_compounds.length > 0 && (
  <GridSection
    title="Hazardous Compounds"
    description="Compounds produced during laser cleaning"
  >
    <DataGrid
      data={metadata.produces_compounds}
      mapper={compoundToGridItem}
      sorter={sortBySeverity}
      columns={3}
      variant="domain-linkage"
    />
  </GridSection>
)}
```

**Lines**: 14  
**Repeated**: 10+ times across layouts  
**Duplicated Logic**: Conditional rendering, columns, structure

### After (LinkageSection)

```tsx
<LinkageSection
  data={metadata.produces_compounds}
  title="Hazardous Compounds"
  description="Compounds produced during laser cleaning"
  mapper={compoundToGridItem}
  sorter={sortBySeverity}
  variant="domain-linkage"
/>
```

**Lines**: 7  
**Repeated**: Component logic (once)  
**Duplicated Logic**: None - all extracted to component

### Impact

- **50% fewer lines** in layout components
- **100% DRY** - conditional logic defined once
- **Consistent behavior** across all sections
- **Easier maintenance** - change once, applies everywhere

---

## Testing

### Unit Tests

```typescript
describe('LinkageSection', () => {
  const mockData = [
    { id: 'item-1', title: 'Item One', url: '/item-1' }
  ];

  it('renders section when data exists', () => {
    const { getByText } = render(
      <LinkageSection
        data={mockData}
        title="Test Section"
        mapper={mockMapper}
      />
    );
    
    expect(getByText('Test Section')).toBeInTheDocument();
  });

  it('returns null when data is empty', () => {
    const { container } = render(
      <LinkageSection
        data={[]}
        title="Test Section"
        mapper={mockMapper}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('returns null when data is undefined', () => {
    const { container } = render(
      <LinkageSection
        data={undefined}
        title="Test Section"
        mapper={mockMapper}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
```

---

## Related Components

- **GridSection**: Section wrapper with title/description
- **DataGrid**: Generic grid renderer
- **gridMappers**: Transformation functions
- **gridSorters**: Sorting functions

---

## Migration

Layouts updated to use LinkageSection:
- ✅ ContaminantsLayout (4 sections)
- ✅ MaterialsLayout (3 sections)
- ✅ SettingsLayout (4 sections)

**Total consolidation**: 11 repetitive patterns → 1 reusable component
