# PageTitle Component Breaking Change

**Date**: December 26, 2025  
**Component**: `app/components/Title/PageTitle.tsx`  
**Type**: Breaking Change  
**Impact**: All PageTitle component usages

## Summary

The `description` prop in the PageTitle component (TitleProps interface) has been renamed to `page_description` to improve naming clarity and avoid potential conflicts with other description props in the component hierarchy.

## Changes Made

### 1. Type Definition Updated
**File**: `types/centralized.ts`

```diff
export interface TitleProps {
  title: string;
  level?: 'page' | 'section' | 'card';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  id?: string;
- description?: string;
+ page_description?: string;
  rightContent?: ReactNode;
  // ... other props
}
```

### 2. Component Implementation Updated
**File**: `app/components/Title/PageTitle.tsx`

- Parameter renamed from `description` to `page_description`
- All internal references updated (descriptionId, structuredData, aria-describedby, conditional rendering)
- useEffect dependency array updated

### 3. All Component Usages Updated

**Files Modified**:
- `app/components/Layout/Layout.tsx` (2 instances)
- `app/page.tsx` (1 instance)
- `app/components/CollectionPage/CollectionPage.tsx` (1 instance)

### Migration Examples

#### Before:
```tsx
<PageTitle 
  title="Materials"
  description="Comprehensive material database"
/>
```

#### After:
```tsx
<PageTitle 
  title="Materials"
  page_description="Comprehensive material database"
/>
```

## Rationale

1. **Naming Clarity**: The prop name `page_description` is more specific and clearly indicates this is the page-level description field
2. **Avoid Conflicts**: Prevents confusion with other `description` props in parent components (e.g., Layout component)
3. **Consistency**: Aligns with naming patterns used elsewhere in the codebase for page-level properties

## Testing Checklist

- [x] Type definitions updated in centralized.ts
- [x] Component implementation updated
- [x] All usages in Layout.tsx updated
- [x] Homepage usage updated
- [x] CollectionPage usage updated
- [x] Component documentation created
- [x] Error on contaminant pages fixed (description render bug)

## Related Files

- `types/centralized.ts` - TitleProps interface definition
- `app/components/Title/PageTitle.tsx` - Component implementation
- `app/components/Title/README.md` - Component documentation
- `app/components/Layout/Layout.tsx` - Primary usage location
- `app/page.tsx` - Homepage usage
- `app/components/CollectionPage/CollectionPage.tsx` - Collection pages usage

## Search Commands for Verification

```bash
# Verify no old description prop remains in PageTitle usage
grep -r "description=" app/components/Layout/
grep -r "description=" app/page.tsx
grep -r "description=" app/components/CollectionPage/

# Should find page_description instead
grep -r "page_description=" app/
```

## Notes

- Layout component still has its own `description` prop which is separate and unchanged
- This change only affects the PageTitle component's description prop
- No changes needed to Layout component's description prop
