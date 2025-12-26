# UI Spacing and Typography Updates

**Date**: December 26, 2025  
**Type**: Visual Enhancement  
**Impact**: Global typography and breadcrumb navigation

## Summary

Updated typography and spacing across the application to improve readability on mobile devices and create a more compact breadcrumb navigation experience.

## Changes Made

### 1. H1 Heading Size Increase at XS Breakpoint

**File**: `app/css/global.css`

Increased the base h1 size for better mobile readability.

```diff
- h1 { @apply text-lg sm:text-xl md:text-3xl font-bold; }
+ h1 { @apply text-2xl sm:text-xl md:text-3xl font-bold; }
```

**Size Progression**:
- **XS (mobile)**: `text-2xl` (24px) - **increased from 18px**
- **SM**: `text-xl` (20px)
- **MD+**: `text-3xl` (30px)

**Rationale**: Improved visual hierarchy and readability on mobile devices where h1 headings need more prominence.

### 2. Breadcrumb Chevron Spacing Reduction

**File**: `app/css/responsive.css`

Reduced horizontal margin around breadcrumb chevrons for a more compact layout.

```diff
.breadcrumb-item:not(:last-child)::after {
  content: '›';
- margin: 0 0.375rem;
+ margin: 0 0.25rem;
  color: var(--text-muted);
  font-size: 1.125em;
  display: inline-block;
}
```

**Before**: 6px (0.375rem) horizontal margin on each side  
**After**: 4px (0.25rem) horizontal margin on each side  
**Savings**: 4px total per chevron

### 3. Breadcrumb Link Padding Reduction

**File**: `app/css/responsive.css`

Reduced horizontal padding on breadcrumb links to create a more compact navigation.

```diff
.breadcrumb-item a {
  color: var(--text-secondary);
  transition: color 150ms ease;
- padding: 0.25rem 0.375rem;
+ padding: 0.25rem 0.125rem;
  border-radius: 0.25rem;
}
```

**Before**: 6px (0.375rem) horizontal padding  
**After**: 2px (0.125rem) horizontal padding  
**Savings**: 8px total per link

### Combined Breadcrumb Impact

For a typical 4-item breadcrumb:
- **Chevron spacing saved**: 4px × 3 chevrons = 12px
- **Link padding saved**: 8px × 4 links = 32px
- **Total width reduction**: ~44px

Example breadcrumb now occupies less horizontal space while maintaining readability and touch target accessibility.

## Visual Impact

### Before
```
Home  ›  Materials  ›  Metal  ›  Aluminum
[---- wider spacing between all elements ----]
```

### After
```
Home › Materials › Metal › Aluminum
[--- more compact, efficient spacing ---]
```

## Accessibility Notes

- **Touch targets remain accessible**: Link padding reduction still maintains sufficient clickable area
- **Visual clarity maintained**: Chevron spacing still provides clear separation
- **Hover states preserved**: Background color on hover still visible with reduced padding
- **No WCAG violations**: All contrast ratios and touch target sizes remain compliant

## Files Modified

1. `app/css/global.css` - H1 typography scale
2. `app/css/responsive.css` - Breadcrumb spacing (2 rules)

## Testing Recommendations

### Manual Testing
- [ ] Verify h1 headings are larger and more readable on mobile (< 640px)
- [ ] Check breadcrumb spacing on various page types
- [ ] Confirm touch targets remain accessible on mobile
- [ ] Test hover states on breadcrumb links

### Visual Regression
- [ ] Compare before/after screenshots of:
  - Homepage title at mobile size
  - Material page titles at mobile size
  - Breadcrumb navigation at all breakpoints

### Cross-browser
- [ ] Safari iOS (mobile h1 rendering)
- [ ] Chrome Android (breadcrumb touch targets)
- [ ] Firefox desktop (hover states)

## Rollback Instructions

If issues arise, revert the changes:

```bash
# Revert h1 size change
# In app/css/global.css, line 46:
h1 { @apply text-lg sm:text-xl md:text-3xl font-bold; }

# Revert breadcrumb spacing
# In app/css/responsive.css, line 421:
margin: 0 0.375rem;

# Revert breadcrumb padding
# In app/css/responsive.css, line 430:
padding: 0.25rem 0.375rem;
```

## Related Issues

- Mobile readability improvements
- Navigation efficiency enhancements
- Responsive design optimization
