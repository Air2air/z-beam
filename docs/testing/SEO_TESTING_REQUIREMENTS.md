# SEO Testing Requirements
## Comprehensive JSON-LD, Structured Data & SEO Infrastructure Testing

**Status**: 🔥 **MANDATORY TESTING REQUIREMENT** (February 14, 2026)  
**Enforcement**: All tests must pass before production deployment  
**Coverage Target**: 100% of article pages and static pages

---

## 🎯 Testing Mandate

**EVERY article page and static page MUST have comprehensive testing for:**

1. ✅ **JSON-LD Structured Data** - Schema.org markup validation
2. ✅ **SEO Metadata** - Complete Open Graph, Twitter Cards, meta tags
3. ✅ **Schema Validation** - Type correctness and required properties
4. ✅ **URL Canonicalization** - Proper canonical URLs and hreflang
5. ✅ **Image SEO** - Alt text, structured image data, proper dimensions
6. ✅ **Rich Results Eligibility** - Google Rich Results compliance
7. ✅ **Performance** - Core Web Vitals and loading optimization
8. ✅ **Accessibility** - WCAG 2.2 AA compliance

---

## 📋 Test Requirements by Page Type

### A. Article Pages (Materials, Contaminants, Compounds, Settings, etc.)

**Required Tests** (Per Article Type):

#### 1. JSON-LD Schema Tests
```typescript
describe('[Material] JSON-LD Schema Tests', () => {
  // MANDATORY: Test all schema types present
  test('should include all required schema types', () => {
    // Article, Product, HowTo, FAQPage, BreadcrumbList
  });

  // MANDATORY: Test schema structure validity
  test('should have valid Schema.org context', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@graph']).toBeInstanceOf(Array);
  });

  // MANDATORY: Test required properties
  test('should include all required Article properties', () => {
    // headline, author, datePublished, dateModified, publisher, image
  });

  // MANDATORY: Test author schema
  test('should include complete Author/Person schema', () => {
    // @type: Person, name, jobTitle, affiliation, expertise
  });

  // MANDATORY: Test image object schema
  test('should include ImageObject schema', () => {
    // @type: ImageObject, url, width, height, caption, contentUrl
  });
});
```

#### 2. Product Schema Tests (For Materials/Equipment)
```typescript
describe('[Material] Product Schema Tests', () => {
  // MANDATORY: Product type and properties
  test('should include Product schema with required properties', () => {
    // name, description, category, brand, aggregateRating, offers
  });

  // MANDATORY: Offers schema
  test('should include Offers schema with pricing', () => {
    // @type: Offer, priceCurrency, price, availability, seller
  });

  // MANDATORY: AggregateRating schema
  test('should include AggregateRating schema', () => {
    // @type: AggregateRating, ratingValue, reviewCount, bestRating
  });
});
```

#### 3. HowTo Schema Tests (For Settings Pages)
```typescript
describe('[Settings] HowTo Schema Tests', () => {
  // MANDATORY: HowTo type and structure
  test('should include HowTo schema with steps', () => {
    // name, description, step (array of HowToStep)
  });

  // MANDATORY: Step validation
  test('should have properly structured HowToSteps', () => {
    // Each step: @type, name, text, position, image
  });

  // MANDATORY: Tool/Supply validation
  test('should include required tools/supplies', () => {
    // tool, supply arrays with HowToTool/HowToSupply items
  });
});
```

#### 4. FAQ Schema Tests
```typescript
describe('[Page] FAQ Schema Tests', () => {
  // MANDATORY: FAQPage schema
  test('should include FAQPage schema', () => {
    // @type: FAQPage, mainEntity (array of Question)
  });

  // MANDATORY: Question structure
  test('should have valid Question/Answer pairs', () => {
    // Question: @type, name, acceptedAnswer
    // Answer: @type, text
  });

  // MANDATORY: Minimum questions
  test('should include at least 3 FAQ items', () => {
    expect(faqItems.length).toBeGreaterThanOrEqual(3);
  });
});
```

#### 5. Breadcrumb Schema Tests
```typescript
describe('[Page] Breadcrumb Schema Tests', () => {
  // MANDATORY: BreadcrumbList schema
  test('should include BreadcrumbList schema', () => {
    // @type: BreadcrumbList, itemListElement
  });

  // MANDATORY: Breadcrumb structure
  test('should have valid breadcrumb hierarchy', () => {
    // Each item: @type: ListItem, position, name, item (URL)
  });

  // MANDATORY: No broken URLs
  test('should have valid breadcrumb URLs', () => {
    breadcrumbs.forEach(crumb => {
      expect(crumb.item).toMatch(/^https?:\/\//);
    });
  });
});
```

### B. Static Pages (Home, About, Partners, etc.)

**Required Tests** (Per Static Page):

#### 1. Organization Schema Tests
```typescript
describe('[Static Page] Organization Schema Tests', () => {
  // MANDATORY: Organization schema
  test('should include Organization schema', () => {
    // @type: Organization/LocalBusiness
    // name, url, logo, contactPoint, address, sameAs
  });

  // MANDATORY: Contact information
  test('should include complete ContactPoint', () => {
    // @type: ContactPoint, telephone, email, contactType, areaServed
  });

  // MANDATORY: Address schema
  test('should include PostalAddress schema', () => {
    // @type: PostalAddress, streetAddress, addressLocality, 
    // addressRegion, postalCode, addressCountry
  });
});
```

#### 2. WebPage/WebSite Schema Tests
```typescript
describe('[Static Page] WebPage Schema Tests', () => {
  // MANDATORY: WebPage schema
  test('should include WebPage schema', () => {
    // @type: WebPage, name, description, url, isPartOf (WebSite)
  });

  // MANDATORY: WebSite schema (for homepage)
  test('should include WebSite schema on homepage', () => {
    // @type: WebSite, name, url, potentialAction (SearchAction)
  });

  // MANDATORY: SearchAction schema
  test('should include SearchAction schema', () => {
    // @type: SearchAction, target, query-input
  });
});
```

### C. SEO Metadata Tests (All Pages)

**Required Tests** (Universal):

#### 1. Meta Tags Validation
```typescript
describe('[Page] Meta Tags Tests', () => {
  // MANDATORY: Title tag
  test('should have unique page title', () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.title.length).toBeGreaterThan(10);
    expect(metadata.title.length).toBeLessThan(60);
  });

  // MANDATORY: Description tag
  test('should have compelling meta description', () => {
    expect(metadata.description).toBeDefined();
    expect(metadata.description.length).toBeGreaterThan(50);
    expect(metadata.description.length).toBeLessThan(160);
  });

  // MANDATORY: Keywords
  test('should include relevant keywords', () => {
    expect(metadata.keywords).toBeDefined();
    expect(metadata.keywords.length).toBeGreaterThan(0);
  });

  // MANDATORY: Canonical URL
  test('should have canonical URL', () => {
    expect(metadata.alternates?.canonical).toBeDefined();
    expect(metadata.alternates.canonical).toMatch(/^https?:\/\//);
  });

  // MANDATORY: Robots meta
  test('should have robots directives', () => {
    expect(metadata.robots).toBeDefined();
    expect(metadata.robots.index).toBe(true);
    expect(metadata.robots.follow).toBe(true);
  });
});
```

#### 2. Open Graph Tests
```typescript
describe('[Page] Open Graph Tests', () => {
  // MANDATORY: OG type
  test('should have Open Graph type', () => {
    expect(metadata.openGraph.type).toBeDefined();
    expect(['website', 'article']).toContain(metadata.openGraph.type);
  });

  // MANDATORY: OG title
  test('should have Open Graph title', () => {
    expect(metadata.openGraph.title).toBeDefined();
    expect(metadata.openGraph.title.length).toBeGreaterThan(10);
  });

  // MANDATORY: OG description
  test('should have Open Graph description', () => {
    expect(metadata.openGraph.description).toBeDefined();
  });

  // MANDATORY: OG images
  test('should have Open Graph images', () => {
    expect(metadata.openGraph.images).toBeInstanceOf(Array);
    expect(metadata.openGraph.images.length).toBeGreaterThan(0);
    
    const image = metadata.openGraph.images[0];
    expect(image.url).toBeDefined();
    expect(image.width).toBeGreaterThanOrEqual(1200);
    expect(image.height).toBeGreaterThanOrEqual(630);
    expect(image.alt).toBeDefined();
  });

  // MANDATORY: OG URL
  test('should have canonical Open Graph URL', () => {
    expect(metadata.openGraph.url).toBeDefined();
    expect(metadata.openGraph.url).toMatch(/^https?:\/\//);
  });
});
```

#### 3. Twitter Card Tests
```typescript
describe('[Page] Twitter Card Tests', () => {
  // MANDATORY: Card type
  test('should have Twitter Card type', () => {
    expect(metadata.twitter.card).toBe('summary_large_image');
  });

  // MANDATORY: Twitter title
  test('should have Twitter title', () => {
    expect(metadata.twitter.title).toBeDefined();
  });

  // MANDATORY: Twitter description
  test('should have Twitter description', () => {
    expect(metadata.twitter.description).toBeDefined();
  });

  // MANDATORY: Twitter images
  test('should have Twitter images', () => {
    expect(metadata.twitter.images).toBeInstanceOf(Array);
    expect(metadata.twitter.images.length).toBeGreaterThan(0);
  });

  // MANDATORY: Twitter creator
  test('should have Twitter creator/site', () => {
    expect(metadata.twitter.creator || metadata.twitter.site).toBeDefined();
  });
});
```

### D. Image SEO Tests (All Pages with Images)

**Required Tests**:

```typescript
describe('[Page] Image SEO Tests', () => {
  // MANDATORY: Alt text presence
  test('all images should have alt text', () => {
    images.forEach(img => {
      expect(img.alt).toBeDefined();
      expect(img.alt.length).toBeGreaterThan(5);
    });
  });

  // MANDATORY: Image dimensions
  test('images should have proper dimensions', () => {
    images.forEach(img => {
      expect(img.width).toBeDefined();
      expect(img.height).toBeDefined();
      expect(img.width).toBeGreaterThan(0);
      expect(img.height).toBeGreaterThan(0);
    });
  });

  // MANDATORY: ImageObject schema
  test('should include ImageObject schema for hero images', () => {
    const imageSchema = schemas.find(s => s['@type'] === 'ImageObject');
    expect(imageSchema).toBeDefined();
    expect(imageSchema.url).toBeDefined();
    expect(imageSchema.width).toBeDefined();
    expect(imageSchema.height).toBeDefined();
    expect(imageSchema.caption).toBeDefined();
  });

  // MANDATORY: Optimized formats
  test('images should use modern formats', () => {
    images.forEach(img => {
      const ext = img.src.split('.').pop();
      expect(['webp', 'avif', 'jpg', 'png']).toContain(ext);
    });
  });
});
```

### E. Rich Results Tests (All Eligible Pages)

**Required Tests**:

```typescript
describe('[Page] Rich Results Eligibility Tests', () => {
  // MANDATORY: Rich Results compatibility
  test('should be eligible for Google Rich Results', () => {
    // Test presence of required schemas for rich results
    const eligibleTypes = ['Article', 'Product', 'HowTo', 'FAQPage', 'Recipe'];
    const hasEligibleSchema = schemas.some(s => 
      eligibleTypes.includes(s['@type'])
    );
    expect(hasEligibleSchema).toBe(true);
  });

  // MANDATORY: Required properties for rich results
  test('should include all required properties for rich results', () => {
    // Check schema-specific requirements
    if (schema['@type'] === 'Article') {
      expect(schema.headline).toBeDefined();
      expect(schema.image).toBeDefined();
      expect(schema.datePublished).toBeDefined();
      expect(schema.author).toBeDefined();
    }
  });

  // MANDATORY: No blocking errors
  test('should have no structured data errors', () => {
    // Validate against schema.org spec
    const errors = validateSchema(schema);
    expect(errors).toHaveLength(0);
  });
});
```

---

## 🛠️ Test Implementation Guide

### 1. Test File Structure

```
tests/
├── seo/
│   ├── article-schema.test.ts          # Article page schema tests
│   ├── product-schema.test.ts          # Product schema tests
│   ├── howto-schema.test.ts            # HowTo schema tests
│   ├── faq-schema.test.ts              # FAQ schema tests
│   ├── breadcrumb-schema.test.ts       # Breadcrumb tests
│   ├── organization-schema.test.ts     # Organization schema tests
│   ├── static-page-schema.test.ts      # Static page tests
│   ├── metadata-validation.test.ts     # Meta tags validation
│   ├── opengraph-validation.test.ts    # Open Graph tests
│   ├── twitter-card-validation.test.ts # Twitter Card tests
│   ├── image-seo.test.ts               # Image SEO tests
│   ├── rich-results.test.ts            # Rich results eligibility
│   └── e2e-seo-pipeline.test.ts        # End-to-end SEO tests
```

### 2. Test Runner Configuration

**Update `package.json` scripts**:

```json
{
  "scripts": {
    "test:seo": "jest tests/seo --coverage",
    "test:seo:article": "jest tests/seo/article-schema.test.ts",
    "test:seo:product": "jest tests/seo/product-schema.test.ts",
    "test:seo:metadata": "jest tests/seo/*-validation.test.ts",
    "test:seo:rich-results": "jest tests/seo/rich-results.test.ts",
    "test:seo:all": "jest tests/seo --coverage --verbose",
    "validate:seo:comprehensive": "npm run test:seo:all && npm run validate:seo-infrastructure",
    "prebuild": "npm run test:seo:all && npm run validate:content",
    "pretest:ci": "npm run test:seo:all"
  }
}
```

### 3. CI/CD Integration

**GitHub Actions Workflow** (`.github/workflows/seo-tests.yml`):

```yaml
name: SEO Infrastructure Tests

on:
  pull_request:
    branches: [main, production]
  push:
    branches: [main]

jobs:
  seo-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: npm ci
      - name: Run SEO Tests
        run: npm run test:seo:all
      - name: Validate SEO Infrastructure
        run: npm run validate:seo-infrastructure
      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

### 4. Pre-Commit Hooks

**Husky configuration** (`.husky/pre-commit`):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run SEO tests for staged files
npm run test:seo -- --findRelatedTests $(git diff --cached --name-only)

# Validate JSON-LD syntax
npm run validate:seo-infrastructure
```

---

## 📊 Coverage Requirements

### Minimum Coverage Thresholds

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "tests/seo/**/*.ts": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

### Required Test Coverage

- ✅ **100% of article pages** - All material, contaminant, compound, settings pages
- ✅ **100% of static pages** - Home, About, Partners, Services, etc.
- ✅ **100% of schema types** - Article, Product, HowTo, FAQ, Organization, etc.
- ✅ **100% of metadata generators** - All metadata generation functions
- ✅ **100% of JSON-LD components** - All structured data components

---

## 🔍 Validation Tools Integration

### Schema.org Validator
```typescript
import { SchemaValidator } from '@/lib/schema/validator';

test('should pass Schema.org validation', async () => {
  const validator = new SchemaValidator();
  const result = await validator.validate(schema);
  
  expect(result.isValid).toBe(true);
  expect(result.errors).toHaveLength(0);
  expect(result.warnings).toHaveLength(0);
});
```

### Google Rich Results Test
```typescript
import { RichResultsTester } from '@/lib/seo/rich-results';

test('should be eligible for rich results', async () => {
  const tester = new RichResultsTester();
  const result = await tester.test(url);
  
  expect(result.eligible).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

### Lighthouse SEO Audit
```typescript
import { runLighthouseAudit } from '@/lib/seo/lighthouse';

test('should achieve Lighthouse SEO score >= 95', async () => {
  const audit = await runLighthouseAudit(url);
  
  expect(audit.categories.seo.score).toBeGreaterThanOrEqual(0.95);
});
```

---

## 📈 Quality Gates

### Deployment Blockers

**Cannot deploy to production if**:

1. ❌ Any SEO test fails
2. ❌ Schema validation errors exist
3. ❌ Coverage below 90% for SEO tests
4. ❌ Missing required schema types
5. ❌ Invalid JSON-LD syntax
6. ❌ Missing or invalid meta tags
7. ❌ Open Graph validation fails
8. ❌ Twitter Card validation fails
9. ❌ Image alt text missing
10. ❌ Rich Results eligibility fails

### Warning Thresholds

**Warnings (allowed but logged)**:

- ⚠️ Schema warnings (non-critical)
- ⚠️ Optional properties missing
- ⚠️ Image optimization suggestions
- ⚠️ Performance recommendations

---

## 🚀 Implementation Checklist

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create test files for all schema types
- [ ] Implement schema validators
- [ ] Add metadata validation tests
- [ ] Configure Jest for SEO tests
- [ ] Set up coverage thresholds

### Phase 2: Comprehensive Coverage (Week 2)
- [ ] Add tests for all article pages
- [ ] Add tests for all static pages
- [ ] Implement Rich Results tests
- [ ] Add image SEO tests
- [ ] Configure CI/CD pipeline

### Phase 3: Integration & Validation (Week 3)
- [ ] Integrate with pre-commit hooks
- [ ] Add Lighthouse audits
- [ ] Configure deployment gates
- [ ] Document test requirements
- [ ] Train team on SEO testing

### Phase 4: Monitoring & Maintenance (Ongoing)
- [ ] Monitor test pass rates
- [ ] Track schema validation errors
- [ ] Update tests for new schema types
- [ ] Regular schema.org spec updates
- [ ] Quarterly SEO audit

---

## 📚 Resources

### Documentation
- [Schema.org Documentation](https://schema.org/docs/documents.html)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

### Testing Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Internal Documentation
- `/docs/testing/SEO_TESTING_GUIDE.md` - Detailed testing guide
- `/docs/seo/SCHEMA_GUIDELINES.md` - Schema implementation guidelines
- `/docs/seo/RICH_RESULTS_GUIDE.md` - Rich results optimization guide

---

## 🎯 Success Metrics

### Target Metrics

- ✅ **Test Coverage**: 90%+ for all SEO tests
- ✅ **Schema Validation**: 100% pass rate
- ✅ **Rich Results Eligibility**: 100% of eligible pages
- ✅ **Lighthouse SEO Score**: 95+ for all pages
- ✅ **Zero Critical Errors**: No blocking SEO errors
- ✅ **Deployment Success**: 100% pass rate before production

### Monitoring Dashboard

```typescript
// Example metrics collection
const seoMetrics = {
  totalTests: 450,
  passed: 445,
  failed: 5,
  coverage: 92.5,
  schemaValidation: 100,
  richResultsEligibility: 98.7,
  lighthouseScore: 96,
  deploymentBlockers: 0
};
```

---

**Status**: 🔥 **ENFORCED** - All tests must pass for production deployment  
**Last Updated**: February 14, 2026  
**Next Review**: March 15, 2026
