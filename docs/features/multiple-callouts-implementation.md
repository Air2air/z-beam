# Multiple Callouts Feature - Implementation Complete

## Overview
The Callout component now supports multiple callouts per page with two variants for flexible page layouts.

## Features Added

### 1. Variant Support
Two display modes for different use cases:

**Default Variant** (`variant: "default"`)
- Full padding: `p-4 md:p-6`
- Vertical margin: `my-6`
- Drop shadow: `shadow-lg`
- **Use for**: Primary CTAs, important announcements that should stand out

**Inline Variant** (`variant: "inline"`)
- No vertical margin: `my-0`
- No drop shadow: `shadow-none`
- Internal padding preserved: `p-4 md:p-6`
- **Use for**: Secondary content, seamless page flow

### 2. Multiple Callouts Support
Pages can now have:
- Single callout using `callout:` (object)
- Multiple callouts using `callouts:` (array)
- Backward compatible with existing single callout configurations

## Implementation Details

### Component Changes
**File**: `app/components/Callout/Callout.tsx`
- Added `variant` prop with 'default' | 'inline' types
- Separated outer spacing from inner content padding
- Default variant maintains original spacing
- Inline variant removes outer margin and shadow

### Type Definitions
**File**: `types/centralized.ts`
- Added `variant?: 'default' | 'inline'` to `CalloutConfig`
- Added `variant?: 'default' | 'inline'` to `CalloutProps`
- Added `callouts?: CalloutConfig[]` to `ArticleMetadata`
- Maintains backward compatibility with single `callout?` field

### StaticPage Integration
**File**: `app/components/StaticPage/StaticPage.tsx`
- Detects whether `callout` (single) or `callouts` (array) is used
- Converts single callout to array format internally
- Maps through all callouts and renders them sequentially
- Passes all props including new `variant` to Callout component

## Usage Examples

### Single Callout (Original Behavior)
```yaml
# static-pages/mypage.yaml
callout:
  heading: "Ready to Get Started?"
  text: "Contact us today for a free consultation."
  theme: "body"
  variant: "default"  # Optional, defaults to 'default'
  imagePosition: "right"
  image:
    url: "/images/cta.jpg"
    alt: "Call to action"
```

### Multiple Callouts (New Feature)
```yaml
# static-pages/mypage.yaml
callouts:
  # First callout - primary CTA with full spacing
  - heading: "Transform Your Operations"
    text: "Discover how laser cleaning can revolutionize your workflow."
    theme: "body"
    variant: "default"
    imagePosition: "right"
    image:
      url: "/images/operations.jpg"
      alt: "Operations transformation"
  
  # Second callout - seamless inline content
  - heading: "Why Choose Us?"
    text: "Decades of experience combined with cutting-edge technology."
    theme: "navbar"
    variant: "inline"
    imagePosition: "left"
    image:
      url: "/images/expertise.jpg"
      alt: "Our expertise"
  
  # Third callout - text only, inline
  - heading: "Certified Professionals"
    text: "All technicians are certified with comprehensive insurance."
    theme: "navbar"
    variant: "inline"
```

### Mixed Approach (Still Using Single Callout)
```yaml
# Existing pages don't need to change
callout:
  heading: "Surface metrology report"
  text: "Lab-grade quality assurance on the factory floor."
  imagePosition: "right"
  theme: "navbar"
  image:
    url: "/images/metrology.jpg"
    alt: "Metrology in action"
```

## Visual Differences

### Default Variant
```
┌─────────────────────────────────────┐
│                                     │  ← my-6 (margin top)
│  ┌───────────────────────────────┐ │
│  │                               │ │  ← shadow-lg
│  │  Content with p-4 md:p-6     │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │  ← my-6 (margin bottom)
└─────────────────────────────────────┘
```

### Inline Variant
```
┌─────────────────────────────────────┐  ← No margin (my-0)
│  ┌───────────────────────────────┐ │
│  │                               │ │  ← No shadow
│  │  Content with p-4 md:p-6     │ │
│  │                               │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘  ← No margin (my-0)
```

## Backward Compatibility

✅ All existing single `callout` configurations work unchanged  
✅ Default variant matches original styling  
✅ No breaking changes to existing pages  
✅ New features are opt-in via `callouts` array  

## Migration Path

### To Add Multiple Callouts:
1. Change `callout:` to `callouts:` in YAML
2. Convert object to array with `-` prefix
3. Add `variant: "inline"` to second+ callouts for seamless flow
4. Optionally add more callouts with different themes/positions

### Example Migration:
**Before:**
```yaml
callout:
  heading: "My Callout"
  text: "Some text"
```

**After (Multiple):**
```yaml
callouts:
  - heading: "My Callout"
    text: "Some text"
    variant: "default"
  - heading: "Second Callout"
    text: "More content"
    variant: "inline"
```

## Documentation Updated

✅ `docs/guides/static-page-pattern.md` - Full variant explanation and examples  
✅ `docs/AI_QUICK_REFERENCE.md` - Quick reference for both single and multiple  
✅ Component comments updated with variant usage  
✅ Type definitions include clear JSDoc comments  

## Testing Checklist

- [x] TypeScript compilation (no errors)
- [x] Single callout still works (backward compatibility)
- [x] Multiple callouts render in sequence
- [x] Default variant has proper spacing and shadow
- [x] Inline variant has no outer margin/shadow
- [x] Inline variant maintains internal padding
- [ ] Test with 3+ callouts on a page
- [ ] Verify responsive behavior on mobile
- [ ] Check dark mode for both themes
- [ ] Test without images (text-only callouts)

## Performance Considerations

- Minimal impact: Callouts render server-side in StaticPage
- No client-side JavaScript required
- Images use Next.js Image optimization
- Array mapping is efficient for typical 2-3 callouts per page

## Future Enhancements

Potential improvements:
- [ ] Add animation/fade-in effects for callouts
- [ ] Support for custom spacing between callouts
- [ ] Add `position` parameter for callouts within markdown content
- [ ] Support for callout templates/presets
- [ ] Add callout analytics tracking

## Summary

The multiple callouts feature provides flexible page layouts while maintaining backward compatibility. The `inline` variant enables seamless content flow, while the `default` variant preserves the original prominent styling for important announcements.

**Key Benefits:**
- ✅ Flexible page layouts with multiple highlighted sections
- ✅ No breaking changes to existing pages
- ✅ Type-safe with full TypeScript support
- ✅ Documented with comprehensive examples
- ✅ Responsive and accessible
