# Breadcrumb Standardization System

## Overview

This document describes the frontmatter-driven breadcrumb system that provides consistent navigation across all page types (material pages, static pages, and category pages).

**Key Principle: The last breadcrumb item is ALWAYS the pageTitle.**

## Frontmatter Schema

### Material Pages

For material pages (e.g., `aluminum-laser-cleaning.yaml`), breadcrumbs can be configured in three ways:

#### 1. Explicit Breadcrumb Array (Highest Priority)
```yaml
pageTitle: "Aluminum Laser Cleaning"
breadcrumb:
  - label: Home
    href: /
  - label: Materials
    href: /materials
  - label: Metals
    href: /materials/metal
  - label: "Aluminum Laser Cleaning"  # ALWAYS the pageTitle
    href: /materials/metal/aluminum-laser-cleaning
```

#### 2. Auto-Generate from Category/Subcategory (Medium Priority)
```yaml
category: metal
subcategory: non-ferrous
pageTitle: "Aluminum Laser Cleaning"
# Auto-generates: Home > Materials > Metal > Non-Ferrous > Aluminum Laser Cleaning
```

#### 3. URL Fallback (Lowest Priority)
If no `breadcrumb` field or `category` exists, breadcrumbs are generated from the URL path, with pageTitle as the final item.

### Static Pages

For static pages (e.g., `services.yaml`), use explicit breadcrumb array:

```yaml
pageTitle: "Our Services"
breadcrumb:
  - label: Home
    href: /
  - label: "Our Services"  # ALWAYS the pageTitle
    href: /services
```

### Category Pages

For category pages (e.g., `/materials/metal`), breadcrumbs are auto-generated from the URL:

```yaml
breadcrumb:
  - label: Home
    href: /
  - label: Materials
    href: /materials
  - label: Metal
    href: /materials/metal
```

## Implementation Details

### Utility Function: `generateBreadcrumbs()`

Located in `app/utils/breadcrumbs.ts`, this function:

1. **Checks for explicit breadcrumb array** in frontmatter
   - If found, returns it directly
   
2. **Checks for category/subcategory** in frontmatter
   - Generates breadcrumb path: Home > Materials > Category > Subcategory > Material Name
   
3. **Falls back to URL parsing**
   - Uses existing logic from original Breadcrumbs component
   - Inserts "Articles" for material pages

### Component Changes

#### `app/components/Navigation/breadcrumbs.tsx`
- Now accepts optional `breadcrumbData` prop
- Uses frontmatter-provided data when available
- Falls back to URL parsing for compatibility

#### `app/components/Layout/Layout.tsx`
- Extracts `breadcrumb` field from metadata
- Passes it to Breadcrumbs component

#### `app/components/StaticPage/StaticPage.tsx`
- Passes breadcrumb data from YAML config to Layout

## Migration Guide

### For Material Pages

Add breadcrumb configuration to YAML frontmatter:

```yaml
# Option 1: Use category/subcategory (recommended for materials)
category: metal
subcategory: non-ferrous
name: Aluminum

# Option 2: Use explicit array (for custom paths)
breadcrumb:
  - label: Home
    href: /
  - label: Custom Path
    href: /custom
  - label: Aluminum
    href: /aluminum-laser-cleaning
```

### For Static Pages

Add breadcrumb array to YAML config:

```yaml
# static-pages/services.yaml
title: Services
breadcrumb:
  - label: Home
    href: /
  - label: Services
    href: /services
```

## Schema.org Integration

The breadcrumb system automatically generates BreadcrumbList structured data:

```typescript
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://z-beam.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Materials",
      "item": "https://z-beam.com/materials"
    }
    // ...
  ]
}
```

## Benefits

1. **Consistency**: All pages use the same breadcrumb system
2. **Flexibility**: Support for explicit arrays, auto-generation, and URL fallback
3. **Maintainability**: Centralized breadcrumb logic in frontmatter
4. **SEO**: Proper structured data for search engines
5. **Accessibility**: ARIA labels and keyboard navigation

## Examples

### Material Page Example
**URL**: `/aluminum-laser-cleaning`
**Frontmatter**:
```yaml
category: metal
subcategory: non-ferrous
name: Aluminum
```
**Result**: Home > Materials > Metal > Non-Ferrous > Aluminum

### Static Page Example
**URL**: `/services`
**Frontmatter**:
```yaml
breadcrumb:
  - label: Home
    href: /
  - label: Services
    href: /services
```
**Result**: Home > Services

### Fallback Example
**URL**: `/some-page`
**Frontmatter**: (no breadcrumb field)
**Result**: Home > Some Page
