# JSON-LD Architecture

## Core Principle: Always Dynamic from Frontmatter

**All JSON-LD structured data MUST be generated dynamically from YAML frontmatter data.**

This architecture ensures:
- ✅ Single source of truth (frontmatter → JSON-LD)
- ✅ Consistency across pages
- ✅ Automatic updates when content changes
- ✅ No duplication or drift
- ✅ Easier maintenance and validation

## 🚀 SchemaFactory System (Recommended)

**All new pages should use the SchemaFactory** for unified, automatic schema generation.

The SchemaFactory provides:
- **20+ schema types** - Automatic detection and generation
- **Priority ordering** - Correct @graph structure
- **E-E-A-T enhancement** - Person credentials, sameAs links
- **Plugin architecture** - Easy to extend
- **95% code reduction** - 3 lines vs 200+ manual code

See [SCHEMAFACTORY_IMPLEMENTATION.md](./SCHEMAFACTORY_IMPLEMENTATION.md) for complete documentation.

### Quick Example

```typescript
import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';

const schemaData = { ...pageConfig, contentCards };
const factory = new SchemaFactory(schemaData, slug);
return factory.generate(); // Returns complete JSON-LD with @graph
```

**Supported Schema Types**: WebPage, BreadcrumbList, Organization, Article, Product, Service, LocalBusiness, Course, HowTo, FAQ, Event, AggregateRating, VideoObject, ImageObject, ContactPoint, Person, Dataset, Certification, ItemList, CollectionPage

**Output Format**: All JSON-LD output uses clean, unescaped forward slashes (e.g., `https://example.com` not `https:\/\/example.com`) for optimal readability and standards compliance.

---

## ✅ Correct Patterns

### Pattern 1: StaticPage Component (Recommended)

**Use StaticPage for all static pages** - it automatically generates JSON-LD from frontmatter.

```typescript
// ✅ CORRECT: app/partners/page.tsx
export default async function PartnersPage() {
  return (
    <StaticPage 
      slug="partners" 
      fallbackTitle="Partners"
      fallbackDescription={metadata.description}
    />
  );
}
```

**Frontmatter drives everything:**

```yaml
# static-pages/partners.yaml
title: "Z-Beam Partners"
description: "Trusted partners providing laser cleaning equipment..."
keywords:
  - "laser cleaning partners"
  - "authorized distributors"

contentCards:
  - heading: "Laserverse - Canada"
    text: "Laserverse is North America's premier provider..."
    details:
      - "Location: Canada"
      - "Region: North America"
      - "Specialization: Equipment Distribution & Training"
      - "Website: laserverse.ca"
```

**StaticPage automatically generates:**
- `WebPage` schema with title, description, keywords
- `Organization` schemas for each contentCard with `details` array
- `CollectionPage` type when organizations are present
- Parent `Organization` linking all partners
- Image metadata from contentCards

---

### Pattern 2: Equipment Pages

**StaticPage detects equipment data structures and generates Product schemas:**

```yaml
# static-pages/netalux.yaml
needle100_150:
  name: "Needle® 100/150"
  description: "Compact precision laser cleaning system"
  category: "Laser Cleaning Equipment"
  materialProperties:
    laserPower: "100W or 150W"
    cleaningWidth: "10mm–30mm"
  machineSettings:
    weight: "18kg"
    dimensions: "710mm × 430mm × 480mm"

needle200_300:
  name: "Needle® 200/300"
  description: "High-power precision laser cleaning system"
  # ... similar structure

jangoSpecs:
  name: "Jango® Industrial System"
  # ... specs
```

**Automatically generates:**
- 3 `Product` schemas (one for each equipment)
- `ItemList` containing all products
- `Brand` information (Netalux)
- `Offer` with availability

---

### Pattern 3: Schema Utility Functions (for specialized content)

**For complex schemas not handled by StaticPage:**

```typescript
// ✅ CORRECT: app/utils/schemas/product-schema.ts
import { SITE_CONFIG } from '@/app/config';

export function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    // ... generated from data, not hardcoded
  };
}

// Use in component:
const schema = generateProductSchema(pageData.product);
<JsonLD data={schema} />
```

---

## ❌ Incorrect Patterns (NEVER DO THIS)

### Anti-Pattern 1: Hardcoded JSON-LD in Page Components

```typescript
// ❌ WRONG: Hardcoded JSON-LD
export default async function PartnersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Laserverse',  // ❌ Hardcoded!
    'url': 'https://laserverse.ca'  // ❌ Hardcoded!
  };
  
  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <StaticPage slug="partners" />
    </>
  );
}
```

**Problems:**
- 🚫 Hardcoded data (not from frontmatter)
- 🚫 Duplicate JSON-LD (both script tag AND StaticPage)
- 🚫 Difficult to maintain
- 🚫 Easy to drift out of sync

---

### Anti-Pattern 2: Manual JSON-LD Creation Functions

```typescript
// ❌ WRONG: Legacy pattern with manual creation
import { createPartnersJsonLd } from '../utils/partners-jsonld';

export default async function PartnersPage() {
  const { components } = await loadPageData('partners');
  const partners = components.contentCards?.content || [];
  const jsonLd = createPartnersJsonLd(partners);  // ❌ Manual!
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StaticPage slug="partners" />  {/* Also generates JSON-LD - DUPLICATE! */}
    </>
  );
}
```

**Problems:**
- 🚫 Requires loading data twice (once for JSON-LD, once for StaticPage)
- 🚫 Creates duplicate JSON-LD output
- 🚫 More code to maintain
- 🚫 Violates single source of truth

---

## How StaticPage Dynamic JSON-LD Works

### Detection Logic

```typescript
// StaticPage.tsx - generateJsonLd()

// 1. Creates base WebPage schema from pageConfig
const baseGraph = [{
  '@type': 'WebPage',
  'name': pageConfig.title,
  'description': pageConfig.description,
  'keywords': pageConfig.keywords?.join(', ')
}];

// 2. Auto-detects equipment products
if (pageConfig.needle100_150) {
  equipmentProducts.push({
    '@type': 'Product',
    'name': pageConfig.needle100_150.name || 'Needle® 100/150',
    // ... dynamically extracted
  });
}

// 3. Auto-detects organizations (contentCards with details array)
contentCardsToRender.forEach((card) => {
  if (Array.isArray(card.details)) {
    partnerOrganizations.push({
      '@type': 'Organization',
      'name': card.heading,  // From frontmatter
      'description': card.text,  // From frontmatter
      // ... dynamically extracted from details array
    });
  }
});

// 4. Returns @graph structure
return {
  '@context': 'https://schema.org',
  '@graph': baseGraph
};
```

### Extensibility

**To add new schema types:**

1. Add detection logic to `generateJsonLd()` in `StaticPage.tsx`
2. Check for specific frontmatter fields (e.g., `pageConfig.courseData`)
3. Generate appropriate schema from data
4. Push to `baseGraph`

**Example - Adding Course schema:**

```typescript
// In generateJsonLd()
if (pageConfig.courseData) {
  baseGraph.push({
    '@type': 'Course',
    'name': pageConfig.courseData.title,
    'description': pageConfig.courseData.description,
    'provider': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name
    }
  });
}
```

---

## Migration Guide: From Hardcoded to Dynamic

### Step 1: Identify Hardcoded JSON-LD

Run enforcement test:
```bash
npm test -- tests/architecture/jsonld-enforcement.test.ts
```

Look for violations:
- `<script type="application/ld+json">` in page components
- `createPartnersJsonLd`, `createServicesJsonLd`, etc. function calls
- `dangerouslySetInnerHTML` with `JSON.stringify`

### Step 2: Move Data to Frontmatter

**Before (hardcoded in page.tsx):**
```typescript
const jsonLd = {
  '@type': 'Organization',
  'name': 'Laserverse',
  'url': 'https://laserverse.ca'
};
```

**After (in frontmatter YAML):**
```yaml
contentCards:
  - heading: "Laserverse - Canada"
    details:
      - "Website: laserverse.ca"
```

### Step 3: Remove Hardcoded JSON-LD

**Before:**
```typescript
export default async function PartnersPage() {
  const { components } = await loadPageData('partners');
  const partners = components.contentCards?.content || [];
  const jsonLd = createPartnersJsonLd(partners);
  
  return (
    <>
      <script type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StaticPage slug="partners" />
    </>
  );
}
```

**After:**
```typescript
export default async function PartnersPage() {
  return (
    <StaticPage 
      slug="partners" 
      fallbackTitle="Partners"
      fallbackDescription={metadata.description}
    />
  );
}
```

### Step 4: Verify JSON-LD Output

1. **Run dev server:** `npm run dev`
2. **Open page in browser:** http://localhost:3000/partners
3. **View page source** (right-click → View Page Source)
4. **Search for** `<script type="application/ld+json">`
5. **Verify schema:**
   - Contains correct `@type` (WebPage, Organization, CollectionPage, etc.)
   - Contains data from frontmatter
   - NO duplicate `<script type="application/ld+json">` tags

### Step 5: Validate with Schema.org

Use Google's Rich Results Test:
https://search.google.com/test/rich-results

Or Schema.org validator:
https://validator.schema.org/

---

## Enforcement

### Automated Testing

**Test runs on every commit** via `tests/architecture/jsonld-enforcement.test.ts`:

```typescript
// Scans all app/**/page.tsx files for violations
describe('No Hardcoded JSON-LD', () => {
  it('page.tsx should not contain hardcoded JSON-LD', () => {
    // Fails if:
    // - <script type="application/ld+json"> found
    // - dangerouslySetInnerHTML with JSON.stringify found
    // - Imports from *-jsonld.ts utility files
    // - Calls create*JsonLd() functions
  });
});
```

**Run manually:**
```bash
npm test -- tests/architecture/jsonld-enforcement.test.ts
```

### ESLint Rule (Optional)

Add to `.eslintrc.json`:
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Literal[value='application/ld+json']",
        "message": "Hardcoded JSON-LD is not allowed. Use StaticPage or schema utilities."
      }
    ]
  }
}
```

---

## Frontmatter → JSON-LD Mapping Reference

### WebPage Schema

**Frontmatter:**
```yaml
title: "Page Title"
description: "Page description"
keywords: ["keyword1", "keyword2"]
```

**Generated JSON-LD:**
```json
{
  "@type": "WebPage",
  "name": "Page Title",
  "description": "Page description",
  "keywords": "keyword1, keyword2"
}
```

---

### Organization Schema (from contentCards)

**Frontmatter:**
```yaml
contentCards:
  - heading: "Organization Name"
    text: "Organization description"
    image:
      url: "/images/logo.png"
      alt: "Logo"
    details:
      - "Location: City, State"
      - "Region: North America"
      - "Specialization: Services"
      - "Website: example.com"
```

**Generated JSON-LD:**
```json
{
  "@type": "Organization",
  "@id": "https://z-beam.com/page#organization-1",
  "name": "Organization Name",
  "description": "Organization description",
  "url": "https://example.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://z-beam.com/images/logo.png",
    "micro": "Logo"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "City, State",
    "addressRegion": "North America"
  },
  "areaServed": {
    "@type": "Place",
    "name": "North America"
  },
  "knowsAbout": "Services"
}
```

---

### Product Schema (from equipment data)

**Frontmatter:**
```yaml
needle100_150:
  name: "Needle® 100/150"
  description: "Compact precision laser cleaning system"
  category: "Laser Cleaning Equipment"
```

**Generated JSON-LD:**
```json
{
  "@type": "Product",
  "name": "Needle® 100/150",
  "description": "Compact precision laser cleaning system",
  "category": "Laser Cleaning Equipment",
  "brand": {
    "@type": "Brand",
    "name": "Netalux"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock"
  }
}
```

---

## Benefits of Dynamic JSON-LD

### 1. Single Source of Truth
- Content editors update YAML only
- JSON-LD automatically reflects changes
- No risk of data drift

### 2. Consistency
- Same generation logic across all pages
- Uniform schema structure
- Easier to validate

### 3. Maintainability
- Less code to maintain
- Changes to schema logic update all pages
- Clear separation of data and presentation

### 4. Testability
- Automated tests detect violations
- Easy to validate schema correctness
- CI/CD can enforce architecture rules

### 5. SEO Reliability
- Guaranteed accurate structured data
- No missing or duplicate schemas
- Better search engine understanding

---

## Troubleshooting

### Issue: Duplicate JSON-LD in page source

**Symptom:** Two `<script type="application/ld+json">` tags in HTML

**Cause:** Page component has hardcoded JSON-LD AND uses StaticPage

**Solution:** Remove hardcoded `<script>` tag, rely on StaticPage only

---

### Issue: Missing Organization schemas

**Symptom:** Partners page doesn't generate Organization schemas

**Cause:** contentCards missing `details` array

**Solution:** Add `details` array to frontmatter:
```yaml
contentCards:
  - heading: "Partner Name"
    text: "Description"
    details:  # ← Add this
      - "Location: City"
      - "Region: Area"
```

---

### Issue: Product schemas not generated

**Symptom:** Equipment page doesn't have Product schemas

**Cause:** Wrong field names in frontmatter

**Solution:** Use exact field names StaticPage expects:
- `needle100_150` (not `needleSpecs100`)
- `needle200_300` (not `needleSpecs200`)
- `jangoSpecs` (not `jangoEquipment`)

---

## Related Documentation

- [COMPLETE_JSONLD_COMPLIANCE_REPORT.md](../COMPLETE_JSONLD_COMPLIANCE_REPORT.md) - Schema.org validation results
- [NETALUX_PAGE_PATTERN.md](../pages/NETALUX_PAGE_PATTERN.md) - Equipment page implementation
- [StaticPage Component](../../app/components/StaticPage/StaticPage.tsx) - Source code
- [JSON-LD Enforcement Tests](../../tests/architecture/jsonld-enforcement.test.ts) - Test suite

---

## Summary

**✅ DO:**
- Use StaticPage component for static pages
- Define data in YAML frontmatter
- Let StaticPage generate JSON-LD dynamically
- Add new schema types to generateJsonLd() function
- Run enforcement tests before committing

**❌ DON'T:**
- Hardcode JSON-LD in page components
- Use `<script type="application/ld+json">` directly
- Create manual JSON-LD generation functions
- Duplicate data between frontmatter and code
- Skip running tests

---

**Questions or issues?** See related docs or check StaticPage implementation.
