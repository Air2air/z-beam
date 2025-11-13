# Section Icons Pattern

## Overview
Centralized icon configuration for `SectionContainer` components provides consistent visual hierarchy and semantic meaning across the application.

## Location
`/app/config/sectionIcons.tsx`

## Benefits
- ✅ **Consistency**: All section icons use same size (24px) and colors
- ✅ **Maintainability**: Change icon mappings in one place
- ✅ **Type Safety**: TypeScript ensures only valid section types are used
- ✅ **Flexibility**: Easy to add new section types or customize per-instance
- ✅ **Performance**: Icons imported once, reused everywhere
- ✅ **Accessibility**: Consistent visual language for screen readers

## Standard Section Types

| Section Type | Icon | Usage |
|--------------|------|-------|
| `related-materials` | LayersIcon | Related content sections |
| `material-properties` | PackageIcon | Material property displays |
| `machine-settings` | SettingsIcon | Machine parameter sections |
| `dataset` | DatabaseIcon | Data download/export sections |
| `safety` | ShieldIcon | Safety warnings/precautions |
| `faq` | InfoIcon | FAQ sections |
| `comparison` | BarChartIcon | Comparison tables/charts |
| `effectiveness` | TrendingUpIcon | Effectiveness/performance data |
| `regulatory` | FileTextIcon | Standards/compliance sections |
| `research` | ZapIcon | Research/technical content |
| `technical` | CodeIcon | Technical specifications |
| `overview` | InfoIcon | General information sections |

## Usage Patterns

### Basic Usage (Recommended)
```tsx
import { getSectionIcon } from '@/app/config/sectionIcons';
import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';

<SectionContainer 
  title="Machine Settings"
  icon={getSectionIcon('machine-settings')}
  bgColor="transparent"
>
  {/* content */}
</SectionContainer>
```

### Custom Icon (When Needed)
```tsx
import { getCustomSectionIcon } from '@/app/config/sectionIcons';
import { CalendarIcon } from '@/app/components/Buttons/ButtonIcons';

<SectionContainer 
  title="Scheduling"
  icon={getCustomSectionIcon(CalendarIcon)}
>
  {/* content */}
</SectionContainer>
```

### No Icon (Minimal Sections)
```tsx
<SectionContainer 
  title="Additional Notes"
  // No icon prop - header shows title only
>
  {/* content */}
</SectionContainer>
```

## Implementation Examples

### RelatedMaterials Component
```tsx
// app/components/RelatedMaterials/RelatedMaterials.tsx
import { getSectionIcon } from '@/app/config/sectionIcons';

export async function RelatedMaterials({ category, subcategory }: Props) {
  return (
    <SectionContainer 
      title={`Related ${category} › ${subcategory} Materials`}
      icon={getSectionIcon('related-materials')}
      bgColor="transparent"
      radius={false}
    >
      <CardGridSSR slugs={relatedSlugs} />
    </SectionContainer>
  );
}
```

### MaterialFAQ Component
```tsx
// app/components/FAQ/MaterialFAQ.tsx
import { getSectionIcon } from '@/app/config/sectionIcons';

export function MaterialFAQ({ materialName, faq }: Props) {
  return (
    <SectionContainer 
      title={`${materialName} Laser Cleaning FAQs`}
      icon={getSectionIcon('faq')}
      bgColor="transparent"
      radius={false}
    >
      {/* FAQ items */}
    </SectionContainer>
  );
}
```

### PropertyBars with Dynamic Sections
```tsx
// app/components/PropertyBars/PropertyBars.tsx
import { getSectionIcon } from '@/app/config/sectionIcons';

{propertyGroups.map(group => (
  <SectionContainer 
    key={group.id}
    title={group.label}
    icon={getSectionIcon('material-properties')}
    bgColor="transparent"
  >
    {/* property bars */}
  </SectionContainer>
))}
```

## Icon Styling Standards

All section icons use consistent styling:
```tsx
const SECTION_ICON_CLASS = "w-6 h-6 text-blue-600 dark:text-blue-400";
```

- **Size**: `w-6 h-6` (24px) - matches h2 section heading scale
- **Color**: Blue (`text-blue-600` / `dark:text-blue-400`)
- **Position**: Left of title with 12px gap (handled by SectionContainer)

## Adding New Section Types

1. **Add to Type Definition**:
```tsx
export type SectionType = 
  | 'related-materials'
  | 'your-new-type' // Add here
  | 'existing-types';
```

2. **Add to Icon Mapping**:
```tsx
const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  'your-new-type': <YourIcon className={SECTION_ICON_CLASS} />,
  // ... other mappings
};
```

3. **Import Icon if Needed**:
```tsx
import {
  LayersIcon,
  YourIcon, // Add import
  // ... other icons
} from '@/app/components/Buttons/ButtonIcons';
```

## Migration Guide

### Before (Direct Icon Import)
```tsx
import { LayersIcon } from '../Buttons/ButtonIcons';

<SectionContainer 
  title="Related Materials"
  icon={<LayersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
>
```

### After (Centralized Config)
```tsx
import { getSectionIcon } from '@/app/config/sectionIcons';

<SectionContainer 
  title="Related Materials"
  icon={getSectionIcon('related-materials')}
>
```

## Best Practices

### DO ✅
- Use `getSectionIcon()` for standard section types
- Keep icon colors consistent (blue theme)
- Add new section types to centralized config
- Use semantic section type names
- Document new section types in this file

### DON'T ❌
- Hard-code icon classes in components
- Use different icon sizes for sections
- Import icons directly for standard sections
- Create duplicate icon configurations
- Use custom colors without good reason

## Testing

```tsx
// Verify icon appears correctly
const { container } = render(
  <SectionContainer 
    title="Test Section"
    icon={getSectionIcon('related-materials')}
  >
    Content
  </SectionContainer>
);

// Check for icon SVG element
expect(container.querySelector('svg')).toBeInTheDocument();
expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6');
```

## Accessibility

Icons enhance visual hierarchy but don't replace semantic HTML:
- Section titles remain in `<h2>` tags
- Icons are decorative (aria-hidden handled by component)
- Screen readers announce section titles clearly
- Color contrast meets WCAG AA standards

## Performance

- Icons are tree-shaken by Next.js
- Only used icons are included in bundles
- Components memoize icon elements
- No runtime icon generation overhead

## Related Components
- `SectionContainer` - Uses icons via `icon` prop
- `ButtonIcons` - Source of all Feather icons
- All section-rendering components benefit from this pattern

## Future Enhancements

Potential improvements:
- [ ] Icon animation on section expand/collapse
- [ ] Theme-based icon color variants
- [ ] Section type auto-detection from title
- [ ] Custom icon size overrides per section
- [ ] Icon position variants (left, right, top)
