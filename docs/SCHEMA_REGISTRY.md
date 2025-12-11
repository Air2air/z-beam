# Schema Registry System

**Status**: ✅ Implemented (December 11, 2025)

## Overview

The Schema Registry provides a **centralized, single-source-of-truth** for all JSON-LD schemas across the Z-Beam website. This eliminates duplication, makes schemas easy to find and maintain, and ensures consistency.

## Problem Solved

**Before**: Schemas were defined in 3 different places:
- ❌ Inline in page components (services/page.tsx had ~100 lines of duplicated schema code)
- ❌ Helper function in site.ts (generateOrganizationSchema)
- ❌ SchemaFactory class (complex, used only for materials/settings)

**Result**: Hard to find, update, or maintain schemas. Changes required editing multiple files.

**After**: All schemas in one place:
- ✅ Single import: `import { SchemaRegistry } from '@/app/utils/schemas/registry'`
- ✅ Simple API: `SchemaRegistry.getPageSchemas('services', data)`
- ✅ Individual generators available: `SchemaRegistry.business()`, `SchemaRegistry.service()`

## Usage

### Quick Start - Page Schemas

Most pages can use the pre-configured page bundles:

```typescript
import { SchemaRegistry } from '@/app/utils/schemas/registry';

// In your page component:
const schemas = SchemaRegistry.getPageSchemas('services', { 
  pricing: SITE_CONFIG.pricing.professionalCleaning 
});

return (
  <>
    <JsonLD data={schemas} />
    {/* Your page content */}
  </>
);
```

### Available Page Types

The registry includes pre-configured schema bundles for:

| Page Type | Schemas Included | Usage |
|-----------|------------------|-------|
| `home` | Business, Website, WebPage | Homepage |
| `services` | Service, Breadcrumb, WebPage | Services page |
| `about` | Business, WebPage (AboutPage), Breadcrumb | About page |
| `contact` | Business, WebPage (ContactPage), Breadcrumb | Contact page |
| `consultation` | Service (consultation), Breadcrumb, WebPage | Schedule page |
| `materials` | WebPage (CollectionPage), Breadcrumb | Materials listing |
| `safety` | WebPage, Breadcrumb | Safety page |

### Individual Schema Generators

For custom use cases, access individual generators:

```typescript
import { SchemaRegistry } from '@/app/utils/schemas/registry';

// Business/Organization schema (site-wide)
const orgSchema = SchemaRegistry.business();

// Website schema (root layout)
const websiteSchema = SchemaRegistry.website();

// Service schema with custom pricing
const serviceSchema = SchemaRegistry.service({
  serviceName: 'Custom Service',
  description: 'Service description',
  pricing: customPricingData
});

// Breadcrumb navigation
const breadcrumbs = SchemaRegistry.breadcrumb('materials/metals/aluminum');

// WebPage schema
const pageSchema = SchemaRegistry.webpage({
  slug: 'custom-page',
  title: 'Custom Page Title',
  description: 'Page description',
  pageType: 'WebPage' // or 'AboutPage', 'ContactPage', 'CollectionPage'
});

// FAQ schema
const faqSchema = SchemaRegistry.faq([
  { question: 'Question 1?', answer: 'Answer 1' },
  { question: 'Question 2?', answer: 'Answer 2' }
]);
```

## Architecture

### Schema Output Format

All schemas are returned in **JSON-LD @graph format**:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", "name": "...", ... },
    { "@type": "BreadcrumbList", ... },
    { "@type": "WebPage", ... }
  ]
}
```

This format allows multiple related schemas to be included in a single `<script type="application/ld+json">` tag, which is Google's recommended approach.

### Schema @id References

Schemas use `@id` to establish relationships:

```javascript
// Organization defines its @id
{
  "@type": "Organization",
  "@id": "https://www.z-beam.com#organization",
  "name": "Z-Beam"
}

// Service references it
{
  "@type": "Service",
  "provider": {
    "@type": "Organization",
    "@id": "https://www.z-beam.com#organization"
  }
}
```

This creates a **knowledge graph** that helps search engines understand entity relationships.

## Migration Guide

### Updating Existing Pages

**Before** (inline schema):
```typescript
// 100+ lines of inline schema definition
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  'name': pricing.label,
  'description': '...',
  // ... many more lines
};
```

**After** (using registry):
```typescript
import { SchemaRegistry } from '@/app/utils/schemas/registry';

const serviceSchema = SchemaRegistry.getPageSchemas('services', { 
  pricing,
  description: 'Custom description if needed'
});
```

### Pages Already Updated

- ✅ `/app/layout.tsx` - Uses `SchemaRegistry.business()` and `SchemaRegistry.website()`
- ✅ `/app/services/page.tsx` - Uses `SchemaRegistry.getPageSchemas('services')`
- ✅ `/app/consultation/page.tsx` - Uses `SchemaRegistry.getPageSchemas('consultation')`

### Pages To Migrate

- [ ] `/app/about/page.tsx`
- [ ] `/app/contact/page.tsx`
- [ ] `/app/materials/page.tsx`
- [ ] `/app/safety/page.tsx`
- [ ] `/app/schedule/page.tsx`
- [ ] `/app/page.tsx` (homepage)

## Adding New Page Types

To add a new page type to the registry:

```typescript
// In app/utils/schemas/registry.ts

export const SchemaRegistry = {
  getPageSchemas(pageType: string, data?: any): SchemaOrgGraph {
    const generators: Record<string, () => SchemaOrgBase[]> = {
      
      // Add your new page type here:
      'your-page': () => [
        generateYourCustomSchema(data),
        generateBreadcrumbSchema('your-page'),
        generateWebPageSchema({
          slug: 'your-page',
          title: 'Your Page Title',
          description: 'Your page description'
        })
      ],
      
      // ... existing page types
    };
    
    // Rest of implementation
  }
};
```

## Benefits

### For Developers

- **Single source of truth** - One place to find/update all schemas
- **Consistent structure** - All schemas follow same patterns
- **Type safety** - TypeScript interfaces for all schema data
- **Reduced duplication** - No more copy-paste between pages
- **Easy discoverability** - Clear API, easy to understand

### For SEO

- **Consistent markup** - All schemas follow best practices
- **Proper @id references** - Establishes entity relationships
- **@graph format** - Google's recommended approach
- **Comprehensive coverage** - All important pages have proper schemas

### For Maintenance

- **Change once, apply everywhere** - Update schema in one place
- **Clear patterns** - Easy to understand what schema each page needs
- **Validation ready** - Centralized schemas can be validated in one place
- **Future extensibility** - Easy to add new schema types or page bundles

## Testing

After updating a page, verify the schema:

1. **View source** on the page
2. Look for `<script type="application/ld+json">`
3. Copy the JSON and validate at:
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)

4. Check SEO validation:
```bash
npm run validate:seo-infrastructure
```

## Related Files

- **Registry**: `app/utils/schemas/registry.ts` - Main schema registry
- **Types**: `app/utils/schemas/generators/types.ts` - TypeScript interfaces
- **Business Config**: `app/config/site.ts` - Site configuration used by schemas
- **Component**: `app/components/JsonLD/JsonLD.tsx` - Renders JSON-LD scripts

## Future Enhancements

Potential improvements:

1. **Schema validation** - Automatically validate schemas against Schema.org specs
2. **Performance caching** - Cache generated schemas for static pages
3. **Schema testing** - Unit tests for each schema generator
4. **Rich result monitoring** - Track which schemas appear in search results
5. **Dynamic schema selection** - Automatically detect which schemas to include based on page content

## Questions?

For implementation questions or issues:
1. Check this documentation
2. Review examples in updated pages (layout.tsx, services/page.tsx)
3. Inspect the registry source code: `app/utils/schemas/registry.ts`
4. Test schemas with Google's Rich Results Test

---

**Last Updated**: December 11, 2025  
**Status**: Production Ready ✅
