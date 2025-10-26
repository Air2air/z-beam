# SchemaFactory Implementation Guide

## Overview

The SchemaFactory is a unified JSON-LD schema generation system that replaces manual schema creation with automatic, data-driven schema detection and generation.

## Architecture

### Core Components

1. **SchemaFactory Class** - Main factory with registry-based generation
2. **Schema Generators** - 20+ specialized functions for different Schema.org types
3. **Condition Helpers** - Automatic detection of data structures
4. **Priority System** - Ensures correct schema ordering in @graph

### File Location

```
/app/utils/schemas/SchemaFactory.ts (1,057 lines)
```

## Supported Schema Types

### Core Schemas
- **WebPage** - Base page schema (priority: 100, always included)
- **BreadcrumbList** - Navigation breadcrumbs (priority: 95)
- **Organization** - Business/company information (priority: 90)

### Content Schemas
- **Article** - Blog posts, articles (priority: 80)
- **Product** - Equipment, products for sale (priority: 75)
- **Service** - Services offered (priority: 70)
- **Course** - Educational courses (priority: 65)

### Supporting Schemas
- **LocalBusiness** - Physical business locations (priority: 85)
- **HowTo** - Step-by-step guides (priority: 60)
- **FAQ** - Frequently asked questions (priority: 55)
  - Auto-detects FAQ data from explicit `faq` field
  - Also detects FAQ-generating frontmatter (outcomeMetrics, applications, environmentalImpact)
  - Material pages automatically generate FAQPage schema
- **Event** - Events, webinars (priority: 50)
- **AggregateRating** - Product/service ratings (priority: 45)

### Media Schemas
- **VideoObject** - Video content with enhanced metadata (priority: 40)
  - Automatically included for all material pages
  - Default YouTube video: eGgMJdjRUJk
  - Includes embed URL, thumbnail, publisher info, duration
- **ImageObject** - Images with detailed metadata (priority: 35)
- **ContactPoint** - Contact information (priority: 30)

### E-E-A-T Enhancement Schemas
- **Person** - Authors with credentials, sameAs links, professional profiles (priority: 85)
- **Dataset** - Data collections for technical content (priority: 25)
- **Certification** - Industry certifications (priority: 20)

### Collection Schemas
- **ItemList** - Lists of items/products (priority: 75)
- **CollectionPage** - Pages containing collections (priority: 70)

## Usage

### Basic Usage in StaticPage

```typescript
import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';

// Create schema data object
const schemaData = {
  ...pageConfig,
  contentCards: contentCardsToRender,
  slug,
  // Optional: include specific equipment data
  ...(pageConfig.needle100_150 && { needle100_150: pageConfig.needle100_150 }),
  ...(pageConfig.needle200_300 && { needle200_300: pageConfig.needle200_300 }),
  ...(pageConfig.jangoSpecs && { jangoSpecs: pageConfig.jangoSpecs })
};

// Generate JSON-LD
const factory = new SchemaFactory(schemaData, slug);
const jsonLd = factory.generate();
```

### Automatic Detection

SchemaFactory automatically detects schema types based on data structure:

```typescript
// Has product data? → Generates Product schema
if (hasProductData(data)) {
  register('Product', generateProductSchema);
}

// Has service data? → Generates Service schema
if (hasServiceData(data)) {
  register('Service', generateServiceSchema);
}

// Has multiple products/organizations? → Generates ItemList + CollectionPage
if (hasMultipleProducts(data) || hasOrganizations(data)) {
  register('ItemList', generateItemListSchema);
  register('CollectionPage', generateCollectionPageSchema);
}
```

### Condition Helpers

#### hasProductData(data)
Detects equipment/product data:
- `needle100_150`, `needle200_300`, `jangoSpecs`
- Product arrays with `name`, `price`, `category`

#### hasServiceData(data)
Detects service offerings:
- `services` array
- Service properties: `name`, `description`, `serviceType`

#### hasMultipleProducts(data)
Checks for multiple products:
- Multiple equipment specs
- Product array length > 1

#### hasOrganizations(data)
Detects organization data:
- ContentCards with `details` array containing "Location:", "Region:", "Website:"

## Priority System

Schemas are ordered by priority (highest first):

1. **100** - WebPage (base page, always first)
2. **95** - BreadcrumbList (navigation context)
3. **90** - Organization (primary entity)
4. **85** - LocalBusiness, Person (key entities)
5. **80** - Article (main content)
6. **75** - Product, ItemList (products)
7. **70** - Service, CollectionPage (services, collections)
8. **65** - Course (educational content)
9. **60** - HowTo (instructional)
10. **55** - FAQ (support)
11. **50** - Event (time-based)
12. **45** - AggregateRating (ratings)
13. **40** - VideoObject (media)
14. **35** - ImageObject (images)
15. **30** - ContactPoint (contact)
16. **25** - Dataset (data)
17. **20** - Certification (credentials)

## E-E-A-T Enhancements

### Enhanced Person Schema

```typescript
{
  "@type": "Person",
  "name": author.name,
  "description": author.bio,
  "image": author.image,
  "url": author.url,
  // NEW: Professional profiles
  "sameAs": [
    "https://linkedin.com/in/profile",
    "https://github.com/username",
    "https://orcid.org/0000-0000-0000-0000"
  ],
  // NEW: Credentials
  "knowsAbout": ["Laser Cleaning", "Industrial Automation"],
  "alumniOf": {
    "@type": "Organization",
    "name": "University Name"
  },
  "memberOf": {
    "@type": "Organization",
    "name": "Professional Association"
  }
}
```

### Data Sources

Person data can come from:
1. Article frontmatter (`author` field)
2. Site config (`SITE_CONFIG.author`)
3. Merged author data with credentials

## Migration from Manual Generation

### Before (Manual - 200+ lines)

```typescript
const baseGraph = [
  {
    '@type': 'WebPage',
    '@id': `${siteUrl}/${slug}/#webpage`,
    url: `${siteUrl}/${slug}`,
    name: pageConfig.title || fallbackTitle,
    description: pageConfig.description || fallbackDescription,
    // ... 20 more lines
  }
];

// Manual equipment detection
if (pageConfig.needle100_150) {
  baseGraph.push({
    '@type': 'Product',
    '@id': `${siteUrl}/${slug}/#needle100-150`,
    name: pageConfig.needle100_150.name,
    description: pageConfig.needle100_150.description,
    // ... 30 more lines
  });
}

// Manual organization detection
const organizations: any[] = [];
contentCardsToRender?.forEach((card: ContentCard) => {
  if (card.details) {
    const location = extractDetail('Location:', card.details);
    const region = extractDetail('Region:', card.details);
    // ... 50 more lines of parsing
  }
});

// ... 150+ more lines
```

### After (SchemaFactory - 3 lines)

```typescript
const schemaData = { ...pageConfig, contentCards };
const factory = new SchemaFactory(schemaData, slug);
return factory.generate();
```

## Benefits

### Code Reduction
- **StaticPage.tsx**: 200+ lines → 10 lines (95% reduction)
- **Maintainability**: Single factory vs scattered manual code
- **Consistency**: All pages use same generation logic

### Feature Additions
- 8 new schema types (Service, LocalBusiness, Course, Event, etc.)
- Enhanced E-E-A-T signals (Person sameAs, credentials)
- Automatic detection (no manual if/else chains)
- Priority ordering (correct @graph structure)

### Extensibility
- Plugin architecture (register new generators)
- Conditional generation (only create needed schemas)
- Caching support (performance optimization)
- Error handling (graceful fallbacks)

## Testing

### Enforcement Tests

Tests verify SchemaFactory integration:

```typescript
it('StaticPage should use SchemaFactory', () => {
  const content = readFileSync('StaticPage.tsx', 'utf-8');
  expect(content).toContain('SchemaFactory');
  expect(content).toContain('factory.generate()');
});

it('StaticPage should pass data to SchemaFactory', () => {
  const content = readFileSync('StaticPage.tsx', 'utf-8');
  expect(content).toContain('schemaData');
  expect(content).toContain('new SchemaFactory');
});
```

### Test Results

```
✅ 28 tests passing
✅ No hardcoded JSON-LD violations
✅ SchemaFactory pattern validated
```

## Implementation Status

### ✅ Completed
1. SchemaFactory.ts created (1,057 lines, 20+ generators)
2. StaticPage.tsx integrated (200+ lines removed)
3. TypeScript compilation clean
4. All enforcement tests passing
5. 8 new schema types added
6. E-E-A-T enhancements implemented

### ⏳ In Progress
1. MaterialJsonLD integration (JsonLD.tsx)
2. Documentation updates
3. Validation layer

### 📋 Next Steps
1. Complete MaterialJsonLD migration
2. Add JSON Schema validation
3. Create schema validation tests
4. Document all new schema types
5. Add usage examples for each type

## Examples

### Product Page

```yaml
# content/pages/netalux.yaml
title: "Netalux Laser Equipment"
needle100_150:
  name: "Needle® 100/150"
  description: "Compact precision system"
  category: "Laser Cleaning Equipment"
  price: "Contact for pricing"
```

**Generated Schemas:**
1. WebPage (base page)
2. BreadcrumbList (navigation)
3. Organization (Z-Beam)
4. Product (Needle 100/150)
5. ImageObject (product images)

### Partners Page

```yaml
# content/pages/partners.yaml
title: "Our Partners"
contentCards:
  - heading: "Laserverse - Canada"
    details:
      - "Location: Canada"
      - "Region: North America"
      - "Website: laserverse.ca"
```

**Generated Schemas:**
1. WebPage (base page)
2. BreadcrumbList (navigation)
3. Organization (Z-Beam)
4. ItemList (partner list)
5. CollectionPage (partners collection)
6. Organization (Laserverse)

### Service Page

```yaml
# content/pages/services.yaml
title: "Our Services"
services:
  - name: "Laser Cleaning Training"
    description: "Professional training programs"
    serviceType: "Training"
    provider:
      name: "Z-Beam"
      url: "https://z-beam.com"
```

**Generated Schemas:**
1. WebPage (base page)
2. BreadcrumbList (navigation)
3. Organization (Z-Beam)
4. Service (Training)
5. ItemList (service list)

## Best Practices

### Data Structure Design

1. **Use consistent field names** - Factory looks for specific keys
2. **Include rich metadata** - More data = better schemas
3. **Organize logically** - Group related data together

### Schema Selection

1. **Let factory auto-detect** - Don't force schema types
2. **Trust priority system** - Schemas ordered correctly
3. **Add conditions for edge cases** - Custom detection when needed

### Performance

1. **Cache schema output** - Factory supports caching
2. **Lazy generation** - Only create when needed
3. **Minimize data size** - Pass only necessary fields

## Troubleshooting

### Schema Not Generated

**Problem**: Expected schema type not in output

**Solutions**:
1. Check condition function (hasProductData, hasServiceData, etc.)
2. Verify data structure matches expected format
3. Add console.log to see what factory receives
4. Check priority (lower priority may be excluded)

### Wrong Schema Type

**Problem**: Factory generates unexpected schema

**Solutions**:
1. Check data field names (factory detects by structure)
2. Add explicit type field if needed
3. Adjust condition functions
4. Review priority ordering

### Missing Fields

**Problem**: Generated schema missing expected fields

**Solutions**:
1. Verify frontmatter includes all data
2. Check generator function implementation
3. Ensure data passed to factory
4. Review helper functions (getMainImage, etc.)

## API Reference

### SchemaFactory Class

```typescript
class SchemaFactory {
  constructor(data: any, slug: string)
  
  register(
    type: string, 
    generator: Function,
    options?: {
      priority?: number,
      required?: boolean,
      condition?: (data: any) => boolean
    }
  ): void
  
  generate(): object
  clearCache(): void
}
```

### Condition Helpers

```typescript
hasProductData(data: any): boolean
hasServiceData(data: any): boolean  
hasMultipleProducts(data: any): boolean
hasOrganizations(data: any): boolean
```

### Utility Functions

```typescript
getMainImage(data: any): string | null
generatePersonObject(author: any): object
generateContactPointObject(contact: any): object
formatLabel(text: string): string
```

## See Also

- [JSON_LD_ARCHITECTURE.md](./JSON_LD_ARCHITECTURE.md) - Overall JSON-LD architecture
- [COMPLETE_JSONLD_COMPLIANCE_REPORT.md](../../COMPLETE_JSONLD_COMPLIANCE_REPORT.md) - Compliance status
- [SchemaFactory.ts](../../app/utils/schemas/SchemaFactory.ts) - Source code
- [jsonld-enforcement.test.ts](../../tests/architecture/jsonld-enforcement.test.ts) - Tests

## Changelog

### 2024-12 - Initial Implementation
- Created SchemaFactory with 20+ schema generators
- Integrated into StaticPage (200+ line reduction)
- Added 8 new schema types
- Enhanced E-E-A-T signals (Person sameAs, credentials)
- Implemented priority system and automatic detection
- All enforcement tests passing (28/28)
