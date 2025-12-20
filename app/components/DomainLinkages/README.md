# Domain Relationships Component

⚠️ **DEPRECATED** - Use Relationship component instead  
**Migration Date**: December 17, 2025  
**Replaced By**: Relationship<T> with flattened structure (v5.0.0)  
**See**: `MAXIMUM_REUSABILITY_ACHIEVED.md` and `LINKAGE_SECTION_INTEGRATION_COMPLETE.md`

---

## ⚠️ Deprecation Notice

This component is **no longer used in production layouts**. All layouts (ContaminantsLayout, MaterialsLayout, SettingsLayout) have been migrated to use:

- **Relationship<T>**: Universal pattern component (Dec 17, 2025) ⭐ **RECOMMENDED**
  - Consolidates GridSection + DataGrid + conditional rendering
  - 50% code reduction vs. manual pattern
  - See: `app/components/Relationship/README.md`

**Previous Pattern** (still valid, but verbose):
- **GridSection**: Universal section wrapper
- **DataGrid<T>**: Generic grid component  
- **gridMappers.ts**: Pure transformation functions
- **gridSorters.ts**: Pure sorting functions

**Reason**: Frontmatter structure v5.0.0 flattened `domain_linkages` object. Linkage arrays are now top-level fields (`produces_compounds`, `related_materials`, etc.).

**Migration Guide**: See `DOCUMENTATION_AND_TEST_UPDATES_DEC17_2025.md`

---

## Legacy Documentation (Pre-v5.0.0)

Server-side component for displaying bidirectional cross-domain relationships using existing grid infrastructure.

## Overview

The Domain Relationships system displays related entities across materials, contaminants, compounds, settings, and regulatory/PPE requirements. It **reuses existing CardGridSSR components** rather than creating duplicate grid systems.

## Architecture

```
RelationshipsContainer (Wrapper - displays all sections)
├── RelationshipSection (Individual section)
│   ├── linkagesToGridItems() - Transform data
│   └── CardGridSSR (Existing grid component)
│       └── Card[] (Existing card components)
```

## Components

### RelationshipSection

Lightweight wrapper that transforms domain_linkages data to CardGridSSR format.

**Props:**
- `title` - Section heading (e.g., "Compatible Materials")
- `items` - Array of linkage objects from frontmatter
- `domain` - Domain type for badge mapping
- `className` - Optional CSS classes

**Example:**
```tsx
<RelationshipSection 
  title="Compatible Materials"
  items={frontmatter.domain_linkages.related_materials}
  domain="materials"
/>
```

### RelationshipsContainer

Convenience component that renders all non-empty linkage sections from frontmatter.

**Props:**
- `linkages` - Complete domain_linkages object from frontmatter
- `className` - Optional CSS classes

**Example:**
```tsx
<RelationshipsContainer linkages={frontmatter.domain_linkages} />
```

## Usage in Page Components

### Material Pages
```tsx
import { RelationshipsContainer } from '@/app/components/Relationships';

export default async function MaterialPage({ params }: { params: { slug: string } }) {
  const frontmatter = await getMaterialFrontmatter(params.slug);
  
  return (
    <div>
      {/* ... existing content ... */}
      
      <RelationshipsContainer linkages={frontmatter.domain_linkages} />
    </div>
  );
}
```

### Contaminant Pages
```tsx
import { RelationshipsContainer } from '@/app/components/Relationships';

export default async function ContaminantPage({ params }: { params: { slug: string } }) {
  const frontmatter = await getContaminantFrontmatter(params.slug);
  
  return (
    <div>
      {/* ... existing content ... */}
      
      <RelationshipsContainer linkages={frontmatter.domain_linkages} />
    </div>
  );
}
```

### Individual Sections
For more control, render sections individually:

```tsx
import { RelationshipSection } from '@/app/components/Relationships';

<div>
  {frontmatter.domain_linkages?.related_materials && (
    <RelationshipSection
      title="Materials Compatible with This Contaminant"
      items={frontmatter.domain_linkages.related_materials}
      domain="materials"
    />
  )}
  
  {frontmatter.domain_linkages?.related_compounds && (
    <RelationshipSection
      title="Hazardous Compounds Generated"
      items={frontmatter.domain_linkages.related_compounds}
      domain="compounds"
    />
  )}
</div>
```

## Adaptive Layouts

CardGridSSR automatically handles layout based on item count:

| Items | Layout | Filters | Columns |
|-------|--------|---------|---------|
| 1-4 | List | No | 2-3 |
| 5-12 | Simple grid | No | 3 |
| 13-24 | Filtered grid | Yes | 4 |
| 25-50 | Category-grouped | Yes | 4 |
| 51+ | Dense category-grouped | Yes | 5 |

## Badge Mapping

Domain-specific fields are automatically mapped to badges:

**Materials:**
- frequency → "Common", "Rare", etc.
- severity → "Low", "Moderate", "High", "Severe"

**Contaminants:**
- severity → Badge with color-coded variant
- category → Badge description

**Compounds:**
- hazard_level → "Low", "Moderate", "High", "Severe"
- phase → "Solid", "Liquid", "Gas"

**Settings:**
- applicability → "Ideal", "Good", "Suitable", "Limited"
- laser_type → Badge description

**Regulatory:**
- Always shows "Required" badge
- applicability → Badge description

**PPE:**
- required → "Required" (danger) or "Recommended" (warning)
- reason → Badge description

## Data Structure

Frontmatter format:
```yaml
domain_linkages:
  related_materials:
    - id: aluminum
      title: Aluminum
      url: /materials/metal/non-ferrous/aluminum
      image: /images/materials/aluminum.jpg
      frequency: common
      severity: moderate
      typical_context: general
      
  related_contaminants:
    - id: aluminum-oxidation
      title: Aluminum Oxidation
      url: /contaminants/corrosion/oxidation/aluminum-oxidation
      image: /images/contaminants/aluminum-oxidation.jpg
      frequency: common
      severity: moderate
      
  # ... other linkage types
```

## Benefits

✅ **Code Reuse**: Uses existing CardGridSSR (345 lines) - no duplicate grid  
✅ **Consistency**: All grids use identical styling and behavior  
✅ **Maintenance**: Single codebase for all grid displays  
✅ **Performance**: Server-side rendering with existing optimization  
✅ **Accessibility**: Inherits ARIA compliance from existing components  

## Total New Code

- `RelationshipSection.tsx`: ~180 lines
- `relationshipMapper.ts`: ~170 lines
- `domain-linkages.ts`: ~100 lines
- **Total**: ~450 lines vs ~1200 lines for duplicate grid system

## Testing

```tsx
// Test with different item counts
const items1 = linkages.slice(0, 3);   // List layout
const items2 = linkages.slice(0, 10);  // Simple grid
const items3 = linkages.slice(0, 20);  // Filtered grid
const items4 = linkages;               // Category-grouped

<RelationshipSection title="Test" items={items1} domain="materials" />
```

## See Also

- `types/domain-linkages.ts` - Type definitions
- `app/utils/relationshipMapper.ts` - Data transformation
- `app/components/CardGrid/CardGridSSR.tsx` - Underlying grid component
- `docs/DOMAIN_LINKAGES_STRUCTURE.md` - Complete specification
