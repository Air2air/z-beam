# BaseSection CSS Normalization Guide

**Date**: January 19, 2026  
**Status**: ✅ NORMALIZED

## Summary

BaseSection provides built-in CSS utilities for consistent spacing and styling. This document ensures all components use these built-in features correctly instead of applying redundant custom classes.

## Core Principles

### 1. Use Built-in Spacing Prop (NOT custom className)

❌ **WRONG** - Redundant spacing:
```tsx
<BaseSection 
  spacing="tight"
  className="mb-8"  // ❌ Redundant - spacing="tight" already provides mb-8
>
```

✅ **CORRECT** - Use only spacing prop:
```tsx
<BaseSection 
  spacing="tight"  // ✅ Provides mb-8 automatically
>
```

### 2. Spacing Values

BaseSection provides three spacing options via the `spacing` prop:

| Spacing | CSS Class | Bottom Margin |
|---------|-----------|---------------|
| `tight` | `mb-8` | 2rem (32px) |
| `normal` (default) | `mb-12` | 3rem (48px) |
| `loose` | `mb-16` | 4rem (64px) |

### 3. Use Built-in horizPadding Prop (NOT manual container classes)

❌ **WRONG** - Manual padding in children:
```tsx
<BaseSection title="Title">
  <div className="container-custom px-4">  {/* ❌ Redundant padding */}
    {children}
  </div>
</BaseSection>
```

✅ **BETTER** - Use horizPadding prop:
```tsx
<BaseSection 
  title="Title"
  horizPadding={true}  // ✅ Provides px-4 md:px-5 automatically
>
  {children}
</BaseSection>
```

**Note**: The `horizPadding` prop applies `px-4 md:px-5` classes to the section wrapper. If children need their own container semantics, the manual approach may still be acceptable, but check if it's truly necessary.

### 4. Variant-based Styling

Use the `variant` prop for visual themes instead of custom classes:

```tsx
// Available variants
<BaseSection variant="default" />     // Standard styling
<BaseSection variant="dark" />        // Dark background with gray-800
<BaseSection variant="card" />        // Card-style with border and shadow
<BaseSection variant="minimal" />     // No additional styling
<BaseSection variant="gradient" />    // Gradient background
```

### 5. Background Colors & Radius

Use built-in props instead of custom classes:

```tsx
<BaseSection 
  bgColor="gray-50"     // Use built-in bgColor prop
  radius={true}         // Use built-in radius prop for rounded-md
  horizPadding={true}   // Use built-in horizPadding prop
/>
```

## Normalized Components

### ✅ Fixed Components

1. **QuickFactsCard** (`app/components/Contamination/QuickFactsCard.tsx`)
   - Removed redundant `className="mb-8"` (Jan 19, 2026)
   - Already using `spacing="tight"` which provides mb-8

### Components Using Standard Patterns

These components correctly use BaseSection's built-in features:

1. **GridSection** - Uses `spacing="loose"` without redundant classes
2. **TechnicalSpecsTable** - Uses `spacing="loose"` correctly
3. **SafetyWarningsGrid** - Uses `spacing="loose"` correctly
4. **IndustriesGrid** - Uses `spacing="loose"` correctly
5. **RelatedMaterials** - No spacing override (uses default)
6. **MaterialCharacteristics** - Uses `spacing="loose"` correctly

### Components with container-custom px-4 Pattern

These components manually add `<div className="container-custom px-4">` in children:

1. `QuickFactsCard.tsx`
2. `TechnicalSpecsTable.tsx`
3. `SafetyWarningsGrid.tsx`
4. `IndustriesGrid.tsx`
5. `SafetyDataPanel.tsx`

**Analysis**: While `container-custom px-4` could potentially be replaced with `horizPadding={true}`, the current pattern provides container semantics and is not causing issues. Consider standardizing in future refactoring if container semantics are not needed.

## Enforcement Checklist

Before adding BaseSection to any component:

- [ ] Use `spacing` prop instead of `className="mb-*"`
- [ ] Consider `horizPadding` prop instead of manual `px-*` classes
- [ ] Use `variant` prop for visual themes
- [ ] Use `bgColor` prop instead of `className="bg-*"`
- [ ] Use `radius` prop instead of `className="rounded-*"`
- [ ] Only add `className` for truly custom styles that can't be achieved with props

## Reference

- **Component Location**: `app/components/BaseSection/BaseSection.tsx`
- **Type Definition**: `@/types` (BaseSectionProps)
- **Config**: `app/config/site.ts` (SECTION_HEADER_CLASSES)
- **Examples**: `app/components/BaseSection/examples.tsx`

## Migration Guide

If you find a component with redundant spacing:

1. **Identify the spacing class**: Look for `className="mb-*"` on BaseSection
2. **Check the spacing prop**: If `spacing` prop is already set, remove className
3. **Set spacing prop if missing**: Choose appropriate spacing value (tight/normal/loose)
4. **Test visually**: Ensure spacing looks correct after removal

Example migration:

```tsx
// Before
<BaseSection spacing="tight" className="mb-8">
  {children}
</BaseSection>

// After  
<BaseSection spacing="tight">
  {children}
</BaseSection>
```

## Best Practices

1. **Default to `spacing="normal"`** - Only specify when you need tighter or looser spacing
2. **Use semantic variants** - Prefer `variant="dark"` over custom background classes
3. **Minimize className usage** - Only for truly unique styles
4. **Check existing examples** - See `BaseSection/examples.tsx` for patterns

## Testing

After any BaseSection CSS changes:

1. Visual regression test all affected pages
2. Check spacing is consistent across sections
3. Verify responsive behavior (mobile/tablet/desktop)
4. Test with different color schemes (light/dark mode if applicable)

---

**Last Updated**: January 19, 2026  
**Maintained By**: Development Team  
**Related Docs**: 
- `docs/02-features/components/SECTION_ARCHITECTURE.md`
- `docs/08-development/MANDATORY_SECTION_REQUIREMENTS.md`
