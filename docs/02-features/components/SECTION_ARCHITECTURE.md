# Section Component Architecture

**Last Updated**: January 15, 2026  
**Status**: ✅ Consolidated and Centralized

## Overview

Z-Beam uses a unified **BaseSection** component as the foundation for all content sections. This architecture consolidates patterns from multiple legacy section components into a single, consistent API.

## Component Hierarchy

```
BaseSection (foundation)
├── SectionContainer (legacy wrapper, backward compatible)
├── ContentSection (specialized for content cards, uses BaseSection)
├── Relationship (specialized for relationship grids, uses BaseSection)
└── LinkageSection (compatibility wrapper → Relationship)
```

## BaseSection Component

### Location
- **Component**: `app/components/BaseSection/BaseSection.tsx`
- **Types**: `types/centralized.ts` (BaseSectionProps)
- **Documentation**: `app/components/BaseSection/README.md`
- **Examples**: `app/components/BaseSection/examples.tsx`

### Key Features
- ✅ Unified API for all section types
- ✅ Multiple variants (default, dark, card, minimal)
- ✅ Configurable spacing (none, tight, normal, loose)
- ✅ Icon support (ReactNode or Lucide string names)
- ✅ Action slot for buttons/CTAs
- ✅ Markdown-enabled descriptions
- ✅ Proper accessibility (ARIA labels, semantic HTML)
- ✅ Background color presets
- ✅ Optional padding and border radius

### Props Interface

```typescript
interface BaseSectionProps {
  // Content
  title?: string;                    // Section heading
  description?: string;              // Optional description (supports markdown)
  icon?: ReactNode | string;         // Icon element or Lucide name
  action?: ReactNode;                // Action button/CTA on right side
  children: ReactNode;               // Section content
  
  // Styling
  variant?: 'default' | 'dark' | 'card' | 'minimal';
  alignment?: 'left' | 'center' | 'right';
  spacing?: 'none' | 'tight' | 'normal' | 'loose';
  bgColor?: 'transparent' | 'default' | 'body' | 'gray-50' | 'gray-100' | 'gradient-dark';
  horizPadding?: boolean;            // Apply horizontal padding
  radius?: boolean;                  // Apply border radius
  
  // Advanced
  className?: string;                // Additional CSS classes
  id?: string;                       // Custom section ID (auto-generated from title)
}
```

## Usage Guide

### Basic Section
```tsx
import { BaseSection } from '@/app/components/BaseSection';

<BaseSection title="Related Materials">
  <DataGrid items={materials} />
</BaseSection>
```

### Section with Description
```tsx
<BaseSection 
  title="Machine Settings"
  description="Optimal laser parameters for this material"
>
  <SettingsTable data={settings} />
</BaseSection>
```

### Dark Variant with Icon
```tsx
import { AlertTriangle } from 'lucide-react';

<BaseSection 
  title="Safety Information"
  icon={<AlertTriangle className="w-5 h-5" />}
  variant="dark"
>
  <SafetyWarnings warnings={warnings} />
</BaseSection>
```

### With Action Button
```tsx
<BaseSection 
  title="Download Dataset"
  action={<Button href="/downloads">Download CSV</Button>}
>
  <DatasetPreview data={preview} />
</BaseSection>
```

## Variants

### `default`
Standard section styling with light background and subtle padding. Best for general content sections.

### `dark`
Dark gradient background (gray-800 to gray-700) with rounded corners. Good for emphasis or contrast sections.

### `card`
Card-like appearance with border, white background, and shadow. Ideal for contained, distinct content blocks.

### `minimal`
No additional styling - pure content rendering. Use when you need full control over styling.

## Spacing Options

- `none` - No bottom margin
- `tight` - `mb-8` (32px) - Used by SectionContainer
- `normal` - `mb-12` (48px) - Used by ContentSection
- `loose` - `mb-16` (64px) - Used by Relationship/DataGrid sections

## Legacy Components

### SectionContainer
**Status**: Maintained for backward compatibility (uses BaseSection internally)
**Recommendation**: Use BaseSection directly for new development

```tsx
// Still works, but BaseSection preferred
<SectionContainer title="Title" variant="dark">
  {children}
</SectionContainer>

// Equivalent BaseSection usage
<BaseSection title="Title" variant="dark" spacing="tight">
  {children}
</BaseSection>
```

### GridSection
**Status**: Removed (February 15, 2026)
**Replacement**: Use `Relationship` for relationship grids or `BaseSection` directly.

### ContentSection
**Status**: Active, uses BaseSection internally
**Use Case**: Specialized wrapper for content card collections

```tsx
<ContentSection title="Our Process" items={workflowItems} />
```

### LinkageSection
**Status**: Compatibility wrapper around `Relationship`
**Use Case**: Legacy imports only; prefer `Relationship` for new code

```tsx
<LinkageSection
  data={metadata.produces_compounds}
  title="Hazardous Compounds"
  mapper={compoundToGridItem}
/>

### Relationship
**Status**: Active, canonical relationship section component
**Use Case**: Relationship sections with conditional rendering + `DataGrid`

```tsx
<Relationship
  data={metadata.produces_compounds}
  title="Hazardous Compounds"
  mapper={compoundToGridItem}
/>
```
```

## Migration Path

### For New Development
Always use BaseSection directly:
```tsx
import { BaseSection } from '@/app/components/BaseSection';
```

### For Existing Code
No changes required - all legacy components continue to work and now use BaseSection internally.

### Optional Gradual Migration
Existing SectionContainer usage can be migrated to BaseSection by:
1. Replacing import: `import { BaseSection } from '@/app/components/BaseSection';`
2. Adding explicit `spacing` prop (SectionContainer defaults to "tight")
3. No other changes needed - props are compatible

## Best Practices

1. **Use BaseSection directly** for new components (recommended)
2. **Choose appropriate variant** based on content context
3. **Set spacing explicitly** for predictable layouts
4. **Provide title** for better accessibility and SEO
5. **Use description** to give context before main content
6. **Leverage action slot** for primary CTAs

## Accessibility

BaseSection includes:
- ✅ Semantic `<section>` element
- ✅ Auto-generated IDs from title (kebab-case)
- ✅ `aria-labelledby` linking to title
- ✅ Proper heading hierarchy (h2 for sections via SectionTitle)
- ✅ Icon marked as `aria-hidden`

## Related Documentation

- **Component README**: `app/components/BaseSection/README.md`
- **Usage Examples**: `app/components/BaseSection/examples.tsx`
- **CSS Normalization Guide**: `docs/02-features/components/BASESECTION_CSS_NORMALIZATION.md` ⭐ **NEW**
- **Changelog**: `docs/05-changelog/SECTION_CONSOLIDATION_JAN15_2026.md`
- **Type Definitions**: `types/centralized.ts` (BaseSectionProps)

## Status

- ✅ **Production Ready** (January 15, 2026)
- ✅ Backward compatible with all existing section components
- ✅ Type-safe with comprehensive TypeScript definitions
- ✅ Used by Relationship, ContentSection, SectionContainer
- ✅ Relationship and LinkageSection now share a single implementation path
- ✅ Zero breaking changes to existing code

---

**Component Path**: `app/components/BaseSection/`  
**Type Definitions**: `types/centralized.ts`  
**Documentation Updated**: January 15, 2026
