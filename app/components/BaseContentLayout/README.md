# BaseContentLayout Component

**Location**: `app/components/BaseContentLayout/BaseContentLayout.tsx`  
**Purpose**: Unified base layout wrapper for all content pages  
**Created**: December 17, 2025

---

## Overview

BaseContentLayout is a configuration-driven layout component that provides a unified structure for all content types (materials, contaminants, settings). It eliminates layout duplication by accepting a sections array that defines page structure.

## Architecture

### Component Structure

```tsx
interface SectionConfig {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  condition?: boolean;
}

interface BaseContentLayoutProps {
  metadata: ArticleMetadata;
  sections: SectionConfig[];
  children?: React.ReactNode;
  showMicro?: boolean;
}
```

### Key Features

1. **Configuration-Driven**: Sections defined by array, not hardcoded JSX
2. **Conditional Rendering**: Optional `condition` field for each section
3. **Micro Integration**: Optional Micro component controlled by `showMicro` prop
4. **Type-Safe**: Full TypeScript support with ArticleMetadata
5. **Flexible**: Accepts children for additional content

## Usage

### Basic Example

```tsx
import BaseContentLayout from '@/app/components/BaseContentLayout/BaseContentLayout';

export default function MaterialsLayout({ metadata }) {
  const sections = [
    {
      component: LaserMaterialInteraction,
      props: { metadata },
    },
    {
      component: MaterialCharacteristics,
      props: { metadata },
    },
    {
      component: RegulatoryStandards,
      props: { 
        standards: convertCitationsToStandards(metadata) 
      },
      condition: metadata?.citations && metadata.citations.length > 0,
    },
  ];

  return (
    <BaseContentLayout 
      metadata={metadata} 
      sections={sections}
      showMicro={true}
    >
      <MaterialDatasetCardWrapper metadata={metadata} />
    </BaseContentLayout>
  );
}
```

### With Conditional Sections

```tsx
const sections = [
  {
    component: SafetyOverview,
    props: { metadata },
    condition: metadata?.fire_explosion_risk !== undefined,
  },
  {
    component: LinkageGridGroup,
    props: { grids, title: "Related Content" },
    condition: grids.length > 0,
  },
];
```

## Benefits

### Code Reduction

**Before BaseContentLayout** (MaterialsLayout example):
```tsx
export default function MaterialsLayout({ metadata }) {
  return (
    <Layout frontmatter={metadata}>
      {metadata?.micro && <Micro frontmatter={metadata} />}
      
      <LaserMaterialInteraction metadata={metadata} />
      <MaterialCharacteristics metadata={metadata} />
      <RegulatoryStandards metadata={metadata} />
      {/* ... more sections ... */}
    </Layout>
  );
}
```
**Lines**: 165

**After BaseContentLayout**:
```tsx
export default function MaterialsLayout({ metadata }) {
  const sections = [ /* configuration */ ];
  
  return (
    <BaseContentLayout metadata={metadata} sections={sections} showMicro={true}>
      <MaterialDatasetCardWrapper metadata={metadata} />
    </BaseContentLayout>
  );
}
```
**Lines**: 151 (-8.5%)

### Maintainability

1. **Single Pattern**: All layouts use same base structure
2. **Easy Testing**: Sections can be tested individually
3. **Clear Intent**: Configuration array shows page structure at a glance
4. **Flexible Ordering**: Reorder sections by changing array order
5. **Conditional Logic**: Moved from JSX to configuration

## Integration with Other Components

### Works With

- **Layout**: Next.js layout wrapper (automatically included)
- **Micro**: Micro component (optional via `showMicro` prop)
- **LinkageGridGroup**: Category-based linkage grouping
- **SafetyOverview**: Contaminant safety sections
- **Domain Components**: Any React component accepting props

### Example: Full Layout Configuration

```tsx
const sections = [
  // Laser interaction section
  {
    component: LaserMaterialInteraction,
    props: { metadata },
  },
  
  // Material characteristics
  {
    component: MaterialCharacteristics,
    props: { metadata },
  },
  
  // Regulatory standards (conditional)
  {
    component: RegulatoryStandards,
    props: { standards: convertCitationsToStandards(metadata) },
    condition: metadata?.citations?.length > 0,
  },
  
  // FAQ section
  {
    component: MaterialFAQ,
    props: { metadata },
    condition: metadata?.faq?.length > 0,
  },
  
  // Related content grouping
  {
    component: LinkageGridGroup,
    props: {
      title: "Related Content",
      description: "Explore related materials, contaminants, and settings",
      grids: [
        {
          data: metadata?.removable_contaminants,
          type: 'contaminants',
          ...getEnrichmentMetadata(metadata, 'contaminant_linkage', 
            'Removable Contaminants', 'Contaminants this material supports'),
        },
        {
          data: metadata?.related_materials,
          type: 'materials',
          ...getEnrichmentMetadata(metadata, 'material_linkage',
            'Related Materials', 'Similar materials'),
        },
      ],
    },
    condition: hasAnyRelationships(metadata),
  },
];
```

## Testing

**Test File**: `tests/components/BaseContentLayout.test.tsx`

**Coverage**:
- ✅ Layout wrapper rendering
- ✅ Micro component conditional display
- ✅ Section rendering without conditions
- ✅ Section rendering with conditions
- ✅ Children content rendering
- ✅ Metadata propagation to sections
- ✅ Empty sections array handling

**Test Count**: 9 test cases

## Files Modified

**Layouts Using BaseContentLayout**:
1. `app/components/MaterialsLayout/MaterialsLayout.tsx` - 165 → 151 lines (-8.5%)
2. `app/components/ContaminantsLayout/ContaminantsLayout.tsx` - 320 → 125 lines (-61%)
3. `app/components/SettingsLayout/SettingsLayout.tsx` - 652 → 653 lines (+0.2%)

**Total Impact**: -208 lines across all layouts (-18.3%)

## Related Components

- **LinkageGridGroup** - Groups multiple LinkageGrid components
- **LinkageGrid** - Simplified linkage section wrapper
- **SafetyOverview** - Contaminant safety sections
- **layoutHelpers** - Shared utility functions

## Migration Guide

### Before (Old Pattern)

```tsx
export default function MyLayout({ metadata }) {
  return (
    <Layout frontmatter={metadata}>
      {metadata?.micro && <Micro frontmatter={metadata} />}
      
      <Section1 metadata={metadata} />
      
      {metadata?.data && (
        <Section2 metadata={metadata} />
      )}
      
      <Section3 metadata={metadata} />
    </Layout>
  );
}
```

### After (BaseContentLayout)

```tsx
export default function MyLayout({ metadata }) {
  const sections = [
    {
      component: Section1,
      props: { metadata },
    },
    {
      component: Section2,
      props: { metadata },
      condition: metadata?.data !== undefined,
    },
    {
      component: Section3,
      props: { metadata },
    },
  ];

  return (
    <BaseContentLayout 
      metadata={metadata} 
      sections={sections}
      showMicro={true}
    />
  );
}
```

## Best Practices

1. **Define sections const**: Extract sections array for readability
2. **Use getEnrichmentMetadata**: Leverage frontmatter enrichments for titles
3. **Conditional rendering**: Use `condition` field instead of ternary operators
4. **Type safety**: Pass correct props to each section component
5. **Minimal props**: Only pass what each section needs

## Performance

- **No overhead**: Sections render exactly as before
- **Conditional optimization**: Sections with `condition: false` not rendered
- **React keys**: Automatically handled by index (sections are static)

---

**Documentation Updated**: December 17, 2025  
**Status**: ✅ Production Ready  
**Test Coverage**: 9/9 passing
