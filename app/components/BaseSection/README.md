# BaseSection Component

## Overview

**BaseSection** is the unified base component for all section types in Z-Beam. It consolidates patterns from `SectionContainer`, `GridSection`, `ContentSection`, and relationship wrappers into a single, consistent API.

## Purpose

- **Single source of truth** for section rendering patterns
- **Consistent styling** across all content sections
- **Flexible variants** for different visual themes
- **Built-in accessibility** with proper ARIA labeling
- **Composable design** that works with SectionTitle and other components

## Architecture

BaseSection provides:
- ✅ Title and description rendering with markdown support
- ✅ Icon support (ReactNode or string-based Lucide icons)
- ✅ Action slot for buttons/CTAs
- ✅ Multiple variants (default, dark, card, minimal)
- ✅ Configurable spacing (none, tight, normal, loose)
- ✅ Background color presets
- ✅ Optional padding and border radius
- ✅ Semantic HTML with proper ARIA attributes

## Props

```typescript
interface BaseSectionProps {
  // Content
  title?: string;                    // Section heading (optional, no fallback)
  description?: string;              // Optional description (supports markdown, no fallback)
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
  section?: {                        // Pass _section object from frontmatter
    sectionTitle: string;            // Required if section provided
    sectionDescription: string;      // Required if section provided
    icon?: string;
  };
}
```

## Validation Rules (Jan 19, 2026)

**No Fallbacks Policy**: All fallbacks have been removed from section components to enforce fail-fast architecture.

### Title Validation
- ✅ Empty string `''` for `title` is allowed (section renders without header)
- ❌ Non-empty `title` that is whitespace-only will throw error
- ✅ Undefined/null title is treated as empty section (no error)
- ✅ Non-empty valid string renders normally

### Section Object Validation (from frontmatter)
When passing `section` prop from frontmatter `_section` object:
- ✅ `sectionTitle` is **REQUIRED** (must be present and non-empty)
- ✅ `sectionDescription` is **REQUIRED** (must be present, can be empty string)
- ✅ `icon` is optional
- ❌ Missing either required field will cause runtime error

### When NOT using section object
- ✅ `title` prop is optional (no fallback)
- ✅ `description` prop is optional (no fallback)
- ✅ `icon` prop is optional

### Frontmatter Requirements
```yaml
# ❌ INVALID - Missing sectionDescription
_section:
  sectionTitle: "My Section"

# ❌ INVALID - Empty sectionTitle
_section:
  sectionTitle: ""
  sectionDescription: "Description"

# ✅ VALID - Both fields present
_section:
  sectionTitle: "My Section"
  sectionDescription: "Complete description"
  icon: "Package"

# ✅ VALID - Empty sectionDescription allowed
_section:
  sectionTitle: "My Section"
  sectionDescription: ""
```

## Usage Examples

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
  description="Get machine learning ready data"
  action={<Button href="/downloads">Download CSV</Button>}
>
  <DatasetPreview data={preview} />
</BaseSection>
```

### Card Variant
```tsx
<BaseSection 
  title="Key Highlights"
  variant="card"
  spacing="normal"
>
  <HighlightsList items={highlights} />
</BaseSection>
```

### Minimal (No Styling)
```tsx
<BaseSection 
  title="Raw Content"
  variant="minimal"
  spacing="none"
>
  <CustomContent />
</BaseSection>
```

## Variants

### `default`
- Standard section styling
- Light background with subtle padding
- Best for general content sections

### `dark`
- Dark gradient background (gray-800 to gray-700)
- Rounded corners and padding
- Good for emphasis or contrast sections

### `card`
- Card-like appearance with border
- White background with shadow
- Ideal for contained, distinct content blocks

### `minimal`
- No additional styling
- Pure content rendering
- Use when you need full control over styling

## Spacing Options

- `none` - No bottom margin
- `tight` - `mb-8` (32px)
- `normal` - `mb-12` (48px)
- `loose` - `mb-16` (64px)

## Migration Guide

### From SectionContainer

```tsx
// Before (SectionContainer)
<SectionContainer
  title="Title"
  description="Description"
  variant="dark"
  horizPadding={true}
  radius={true}
>
  {children}
</SectionContainer>

// After (BaseSection)
<BaseSection
  title="Title"
  description="Description"
  variant="dark"
  horizPadding={true}
  radius={true}
  spacing="tight"
>
  {children}
</BaseSection>
```

### From GridSection

```tsx
// Before (GridSection)
<GridSection 
  title="Title"
  description="Description"
  variant="default"
>
  <DataGrid items={items} />
</GridSection>

// After (BaseSection)
<BaseSection
  title="Title"
  description="Description"
  variant="default"
  spacing="loose"
>
  <DataGrid items={items} />
</BaseSection>
```

### From ContentSection

```tsx
// Before (ContentSection with manual title)
<section className="content-section">
  <h2 className="text-3xl font-bold mb-6">Title</h2>
  <div className="space-y-8">
    {items.map(...)}
  </div>
</section>

// After (BaseSection)
<BaseSection
  title="Title"
  variant="minimal"
  spacing="normal"
>
  <div className="space-y-8">
    {items.map(...)}
  </div>
</BaseSection>
```

## Component Relationships

```
BaseSection (base)
├── SectionContainer (legacy wrapper, uses BaseSection)
├── GridSection (uses BaseSection)
├── ContentSection (uses BaseSection)
├── Relationship (uses BaseSection)
└── LinkageSection (compatibility wrapper → Relationship)
```

## Best Practices

1. **Use BaseSection directly** for new components (preferred)
2. **Existing components** can continue using wrappers (backward compatible)
3. **Choose appropriate variant** based on content context
4. **Set spacing explicitly** for predictable layouts
5. **Provide title** for better accessibility and SEO
6. **Use description** to give context before main content

## Accessibility

BaseSection includes:
- ✅ Semantic `<section>` element
- ✅ Auto-generated IDs from title (kebab-case)
- ✅ `aria-labelledby` linking to title
- ✅ Proper heading hierarchy (h2 for sections)
- ✅ Icon marked as `aria-hidden`

## Performance

- **No runtime overhead** - simple wrapper component
- **Conditional rendering** - sections only render when shown
- **Optimized spacing** - CSS-based margins, no JavaScript
- **Minimal bundle size** - lightweight implementation

## Status

- ✅ **Production Ready** (January 15, 2026)
- ✅ Backward compatible with existing section components
- ✅ Type-safe with TypeScript definitions
- ✅ Used by GridSection, ContentSection, SectionContainer, Relationship

---

**Last Updated**: January 15, 2026  
**Component Path**: `app/components/BaseSection/BaseSection.tsx`  
**Type Definitions**: `types/centralized.ts` (BaseSectionProps)
