# Breadcrumb Navigation Standard

## Purpose
Establish consistent breadcrumb navigation across all pages using explicit YAML frontmatter configuration rather than URL-based inference.

## Principles

1. **Explicit over Implicit**: Always define breadcrumbs explicitly in frontmatter
2. **Hierarchical Accuracy**: Reflect actual information architecture, not URL structure
3. **User-Centric**: Show logical navigation path users expect
4. **SEO Optimized**: Generate proper BreadcrumbList schema.org markup
5. **Consistent Format**: Same structure across all content types

## Standard Structure

### YAML Format
```yaml
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Parent Category"
    href: "/parent"
  - label: "Current Page"
    href: "/parent/current"
```

### Rules
- **Always include Home**: First item must always be Home (`/`)
- **Include current page**: Last item is the current page (for schema.org compliance)
- **Ordered hierarchy**: Items must be in parent → child order
- **No duplicates**: Each level should be unique (unless there's a valid reason)
- **Relative URLs**: Use root-relative paths (`/services`, not `https://z-beam.com/services`)

## Content Type Standards

### 1. Static Pages (Top-Level)

**Pattern**: `Home → Page Name`

**Examples**:

```yaml
# /services
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Services"
    href: "/services"
```

```yaml
# /contact
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Contact"
    href: "/contact"
```

```yaml
# /about
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "About"
    href: "/about"
```

**Applies to**: `/services`, `/rental`, `/contact`, `/about`, `/partners`, `/datasets`, `/search`

### 2. Static Pages (Nested/Legal)

**Pattern**: `Home → Category → Page Name`

**Examples**:

```yaml
# /privacy-policy
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Legal"
    href: "/legal"
  - label: "Privacy Policy"
    href: "/privacy-policy"
```

**Note**: Use logical grouping (Legal, Company Info, etc.) even if no index page exists

### 3. Material Category Pages

**Pattern**: `Home → Materials → Category Name`

**Examples**:

```yaml
# /materials/metals
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Materials"
    href: "/materials"
  - label: "Metals"
    href: "/materials/metals"
```

```yaml
# /materials/composites
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Materials"
    href: "/materials"
  - label: "Composites"
    href: "/materials/composites"
```

**Auto-generated**: These use `category` field from frontmatter

### 4. Material Subcategory Pages

**Pattern**: `Home → Materials → Category → Subcategory`

**Examples**:

```yaml
# /materials/metals/ferrous
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Materials"
    href: "/materials"
  - label: "Metals"
    href: "/materials/metals"
  - label: "Ferrous Metals"
    href: "/materials/metals/ferrous"
```

**Auto-generated**: These use `category` and `subcategory` fields

### 5. Individual Material Pages

**Pattern**: `Home → Materials → Category → Subcategory → Material Name`

**Examples**:

```yaml
# Explicit breadcrumb (recommended)
name: "Aluminum 6061"
category: "Metals"
subcategory: "Non-Ferrous"
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Materials"
    href: "/materials"
  - label: "Metals"
    href: "/materials/metals"
  - label: "Non-Ferrous"
    href: "/materials/metals/non-ferrous"
  - label: "Aluminum 6061"
    href: "/materials/metals/non-ferrous/aluminum-6061"
```

```yaml
# Auto-generated alternative (if breadcrumb not specified)
name: "Stainless Steel 316"
category: "Metals"
subcategory: "Stainless Steel"
# Breadcrumb will be generated from category/subcategory/name
```

**Auto-generated fallback**: If `breadcrumb` not specified, uses `category`/`subcategory`/`name`

### 6. Article/Blog Posts (Future)

**Pattern**: `Home → Articles → Category → Article Title`

```yaml
# /articles/techniques/laser-vs-abrasive-blasting
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Articles"
    href: "/articles"
  - label: "Techniques"
    href: "/articles/techniques"
  - label: "Laser vs Abrasive Blasting"
    href: "/articles/techniques/laser-vs-abrasive-blasting"
```

## Implementation Priority

### Priority 1: Auto-generation (Already Implemented)
- ✅ Material pages using `category`/`subcategory`/`name`
- ✅ URL-based fallback for pages without metadata

### Priority 2: Explicit Static Pages (In Progress)
- ✅ `/services` - Completed
- ✅ `/contact` - Completed  
- ⏳ `/rental` - Update needed
- ⏳ `/about` - Update needed
- ⏳ `/partners` - Update needed
- ⏳ `/datasets` - Update needed
- ⏳ `/netalux` - Update needed

### Priority 3: Material Frontmatter (Explicit Breadcrumbs)
- All materials will have explicit breadcrumbs via migration script
- Override auto-generation with explicit YAML arrays

## Migration Guide

### Step 1: Audit Current Pages

Run this to find pages without explicit breadcrumbs:
```bash
grep -L "breadcrumb:" static-pages/*.yaml
```

### Step 2: Add Breadcrumbs to Static Pages

For each static page without breadcrumbs:

1. Determine logical hierarchy
2. Add breadcrumb array after metadata fields
3. Follow standard pattern for page type
4. Test on dev server

### Step 3: Verify Rendering

Check each page:
- Visual breadcrumb component displays correctly
- JSON-LD BreadcrumbList schema is valid
- Google Rich Results test passes
- Links work correctly

### Step 4: Validate Schema

Use Google Rich Results Test:
```
https://search.google.com/test/rich-results
```

## TypeScript Type Definition

```typescript
// types/index.ts
export interface BreadcrumbItem {
  label: string;  // Display text (e.g., "Services")
  href: string;   // URL path (e.g., "/services")
}

// In ArticleMetadata interface
export interface ArticleMetadata {
  // ... existing fields
  breadcrumb?: BreadcrumbItem[];  // Optional explicit breadcrumbs
}
```

## Utility Function

Current implementation in `app/utils/breadcrumbs.ts`:

```typescript
export function generateBreadcrumbs(
  frontmatter: Partial<ArticleMetadata> | null,
  pathname: string
): BreadcrumbItem[] {
  // Priority 1: Explicit breadcrumb array
  if (frontmatter?.breadcrumb) {
    return frontmatter.breadcrumb;
  }
  
  // Priority 2: Auto-generate from category/subcategory/name
  if (frontmatter?.category) {
    return generateFromCategoryHierarchy(frontmatter);
  }
  
  // Priority 3: Parse from URL (fallback)
  return generateBreadcrumbsFromUrl(pathname);
}
```

## Common Mistakes to Avoid

### ❌ Wrong: URL-based thinking
```yaml
# Don't mirror URL structure if it doesn't reflect info architecture
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "company"  # lowercase, technical
    href: "/company"
  - label: "contact"  # not user-friendly
    href: "/contact"
```

### ✅ Right: User-centric hierarchy
```yaml
# Reflect logical navigation users expect
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Contact"
    href: "/contact"
```

### ❌ Wrong: Missing current page
```yaml
# Don't omit the current page
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Services"
    href: "/services"
  # Missing: Current page should be here
```

### ✅ Right: Include current page
```yaml
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Services"
    href: "/services"
  - label: "Industrial Cleaning"  # Current page
    href: "/services/industrial"
```

### ❌ Wrong: Inconsistent capitalization
```yaml
breadcrumb:
  - label: "home"        # inconsistent
    href: "/"
  - label: "Services"    # capitalized
    href: "/services"
```

### ✅ Right: Title case for all labels
```yaml
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Services"
    href: "/services"
```

## Testing Checklist

When adding/updating breadcrumbs:

- [ ] Visual breadcrumb navigation displays correctly
- [ ] All links are clickable and go to correct pages
- [ ] Breadcrumbs match user's mental model of site hierarchy
- [ ] JSON-LD BreadcrumbList schema validates
- [ ] Google Rich Results test passes
- [ ] Mobile responsive display works
- [ ] Keyboard navigation (Tab key) works
- [ ] Screen reader announces breadcrumbs correctly

## Tools & Commands

### Check current breadcrumbs in dev:
```bash
curl -s http://localhost:3000/services | grep -A 10 "BreadcrumbList"
```

### Validate with Google:
```bash
# Copy page URL and test at:
# https://search.google.com/test/rich-results
```

### Find pages needing updates:
```bash
# Static pages without breadcrumbs
grep -L "breadcrumb:" static-pages/*.yaml

# Material pages with explicit breadcrumbs (rare, review these)
grep -l "breadcrumb:" frontmatter/materials/*.yaml
```

## Schema.org Output

The breadcrumb YAML generates this JSON-LD:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.z-beam.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://www.z-beam.com/services"
    }
  ]
}
```

## Benefits

1. **SEO**: Explicit breadcrumbs improve schema.org markup reliability
2. **UX**: Users see logical navigation paths
3. **Maintainability**: Clear documentation of site structure
4. **Consistency**: Same pattern everywhere
5. **Flexibility**: Can override auto-generation when needed
6. **Validation**: Easy to test and verify

## Future Enhancements

1. **Breadcrumb Templates**: Pre-defined templates for common patterns
2. **Validation Script**: Automated checking of breadcrumb consistency
3. **Visual Editor**: Admin UI for managing breadcrumbs
4. **Analytics Integration**: Track breadcrumb navigation patterns
5. **Localization**: Multi-language breadcrumb support

## Related Documentation

- `app/utils/breadcrumbs.ts` - Implementation
- `app/components/Navigation/breadcrumbs.tsx` - UI component
- `types/index.ts` - TypeScript types
- `docs/FRONTMATTER_CURRENT_STRUCTURE.md` - Overall frontmatter guide

## Questions?

- Check existing static pages for examples
- Review `generateBreadcrumbs()` function logic
- Test on dev server before deploying
- Ask for review if unsure about hierarchy

---

**Status**: Active Standard (November 2025)  
**Last Updated**: November 6, 2025  
**Owner**: Content Architecture Team
