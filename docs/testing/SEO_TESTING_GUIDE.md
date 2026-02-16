# SEO Testing Implementation Guide
## How to Test JSON-LD, Structured Data & SEO Infrastructure

**For**: Developers and QA Engineers  
**Status**: 🔥 **MANDATORY** (February 14, 2026)  
**Goal**: Ensure 100% SEO compliance before production deployment

---

## 🎯 Quick Start

### Run All SEO Tests
```bash
# Run comprehensive SEO infrastructure tests
npm run test:seo:comprehensive

# Run all SEO tests with coverage
npm run test:seo:all

# Run specific test categories
npm run test:seo:article      # Article schema tests
npm run test:seo:metadata     # Metadata validation tests
npm run test:seo:rich-results # Rich results eligibility

# Run validation alongside tests
npm run validate:seo:comprehensive
```

### Check Single Page
```bash
# Test specific file
jest tests/seo/comprehensive-seo-infrastructure.test.ts

# With verbose output
jest tests/seo/comprehensive-seo-infrastructure.test.ts --verbose
```

---

## 📋 What Gets Tested

### 1. JSON-LD Schema Tests

**Article Schema** (Materials, Contaminants, Compounds):
- ✅ Article type and required properties
- ✅ Author/Person schema with complete data
- ✅ Publisher/Organization schema
- ✅ Image objects with dimensions
- ✅ Date published/modified
- ✅ Headline and description

**Product Schema** (Materials, Equipment):
- ✅ Product name and description
- ✅ Category and brand information
- ✅ AggregateRating schema
- ✅ Offers schema with pricing
- ✅ Availability status

**HowTo Schema** (Settings, Tutorials):
- ✅ HowTo structure with steps
- ✅ Step ordering and completeness
- ✅ Required tools/supplies
- ✅ Image guidance per step

**FAQ Schema** (All pages with FAQs):
- ✅ FAQPage type
- ✅ Question/Answer pairs
- ✅ Minimum 3 questions requirement
- ✅ Proper Answer structure

**Breadcrumb Schema** (All pages):
- ✅ BreadcrumbList structure
- ✅ ListItem hierarchy
- ✅ Position numbering
- ✅ Valid URLs

### 2. SEO Metadata Tests

**Meta Tags**:
- ✅ Page title (10-60 characters)
- ✅ Meta description (50-160 characters)
- ✅ Keywords/tags presence
- ✅ Canonical URLs
- ✅ Robots directives

**Open Graph**:
- ✅ OG type (website/article)
- ✅ OG title and description
- ✅ OG images (1200x630+)
- ✅ OG URL (canonical)
- ✅ Site name

**Twitter Cards**:
- ✅ Card type (summary_large_image)
- ✅ Twitter title/description
- ✅ Twitter images
- ✅ Creator/site tags

### 3. Image SEO Tests

- ✅ Alt text presence and quality
- ✅ Image dimensions specified
- ✅ ImageObject schema
- ✅ Modern formats (WebP, AVIF)
- ✅ Proper file naming

### 4. Rich Results Tests

- ✅ Eligibility for Google Rich Results
- ✅ Required properties for rich snippets
- ✅ Schema.org validation
- ✅ No critical errors

---

## 🧪 Writing New SEO Tests

### Test Template

```typescript
// tests/seo/my-new-seo-test.test.ts

describe('My SEO Feature Tests', () => {
  test('MANDATORY: should include required schema', () => {
    // Arrange
    const pageData = loadPageData('test-page');
    
    // Act
    const schema = extractSchema(pageData);
    
    // Assert
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBeDefined();
  });
  
  test('MANDATORY: should have valid metadata', () => {
    const metadata = extractMetadata(pageData);
    
    expect(metadata.title).toBeDefined();
    expect(metadata.title.length).toBeGreaterThan(10);
    expect(metadata.title.length).toBeLessThan(60);
  });
});
```

### Testing Checklist

Before submitting new SEO tests:

- [ ] Test name starts with "MANDATORY:" for required checks
- [ ] Test checks a specific, single requirement
- [ ] Test provides clear error messages
- [ ] Test uses frontmatter YAML files as data source
- [ ] Test handles edge cases (missing data, malformed data)
- [ ] Test documents what it's checking in a comment
- [ ] Test is idempotent (can run multiple times)
- [ ] Test runs in <5 seconds

---

## 📊 Understanding Test Results

### Success Example
```
✅ PASS tests/seo/comprehensive-seo-infrastructure.test.ts
  
📊 Testing 456 pages for SEO infrastructure

Article Pages - JSON-LD Schema Requirements
  ✓ MANDATORY: All article pages must have JSON-LD schema (123ms)
  ✓ MANDATORY: Article schema must include required properties (234ms)
  ✓ MANDATORY: Product schema must include aggregateRating (156ms)
  
SEO INFRASTRUCTURE QUALITY REPORT
======================================================================
Total Pages Tested: 456
Schema Presence: 98.7%
Title Coverage: 100.0%
Description Coverage: 100.0%
Keywords Coverage: 92.3%
Open Graph Coverage: 87.5%
Twitter Card Coverage: 85.2%
Image Alt Text Coverage: 94.6%
Breadcrumb Coverage: 89.8%
======================================================================
OVERALL QUALITY SCORE: 93.5%
======================================================================

🎯 GRADE: A+
```

### Failure Example
```
❌ FAIL tests/seo/comprehensive-seo-infrastructure.test.ts

Article Pages - JSON-LD Schema Requirements
  ✕ MANDATORY: Article schema must include required properties (345ms)
    
    ❌ Invalid Article schema in 12 files:
      - aluminum-laser-cleaning.yaml: missing datePublished
      - steel-laser-cleaning.yaml: missing author
      - copper-laser-cleaning.yaml: missing headline
      ...
    
    Expected: 0
    Received: 12
```

### Warning Example
```
⚠️  WARN tests/seo/comprehensive-seo-infrastructure.test.ts

HowTo Schema Tests
  ✓ MANDATORY: HowTo schema must include steps (189ms)
    
    ⚠️  Pages with <3 FAQs: 8
    
    Note: Pages with insufficient FAQs can still pass,
          but quality may be impacted.
```

---

## 🔧 Debugging Failed Tests

### Common Issues & Solutions

#### Issue: "Missing JSON-LD schema"
```bash
# Check frontmatter file
cat frontmatter/materials/aluminum-laser-cleaning.yaml | grep -A 10 "schema:"

# Expected format:
schema:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "..."
  author: { ... }
```

**Solution**: Add schema to frontmatter YAML file.

#### Issue: "Invalid description length"
```bash
# Check current length
cat frontmatter/materials/material.yaml | grep "pageDescription:"

# Should be 50-160 characters
```

**Solution**: Regenerate description with proper length constraints.

#### Issue: "Missing Open Graph images"
```bash
# Check for OG image data
grep -A 5 "openGraph:" frontmatter/materials/material.yaml

# Should include:
openGraph:
  images:
    - url: "/images/..."
      width: 1200
      height: 630
```

**Solution**: Add image data to frontmatter.

#### Issue: "Missing alt text"
```bash
# Check image sections
grep -B 2 -A 2 "url:" frontmatter/materials/material.yaml

# Should include:
image:
  url: "/images/..."
  alt: "Descriptive alt text"
```

**Solution**: Add alt text to all images.

---

## 🚀 Pre-Deployment Checklist

Before deploying to production:

### 1. Run Full Test Suite
```bash
# Must pass with 90%+ quality score
npm run test:seo:all
```

### 2. Run Validation
```bash
# Must pass all checks
npm run validate:seo:comprehensive
```

### 3. Check Coverage
```bash
# Must achieve >90% coverage
npm run test:seo:all -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

### 4. Manual Spot Checks

Pick 5 random pages and verify:
- [ ] View source shows valid JSON-LD
- [ ] Meta tags present in `<head>`
- [ ] Open Graph debugger validates: https://developers.facebook.com/tools/debug/
- [ ] Twitter Card validator validates: https://cards-dev.twitter.com/validator
- [ ] Google Rich Results Test passes: https://search.google.com/test/rich-results

### 5. Performance Check
```bash
# Ensure tests run in <5 minutes
time npm run test:seo:all
```

---

## 📈 Monitoring & Maintenance

### Weekly Checks
- Review test pass rates
- Check for new schema types
- Update tests for new pages
- Monitor quality score trends

### Monthly Reviews
- Audit schema.org spec updates
- Review Google Search Console errors
- Update test coverage requirements
- Analyze rich results performance

### Quarterly Updates
- Full SEO infrastructure audit
- Update documentation
- Train team on new requirements
- Review and update test fixtures

---

## 🎓 Learning Resources

### Internal Documentation
- [SEO Testing Requirements](/docs/testing/SEO_TESTING_REQUIREMENTS.md)
- [Schema Guidelines](/docs/seo/SCHEMA_GUIDELINES.md)
- [Rich Results Guide](/docs/seo/RICH_RESULTS_GUIDE.md)

### External Resources
- [Schema.org Documentation](https://schema.org/docs/documents.html)
- [Google Search Central](https://developers.google.com/search/docs)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

### Testing Tools
- [Schema Markup Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

---

## 🆘 Getting Help

### When Tests Fail

1. **Read the error message carefully** - It tells you exactly what's missing
2. **Check the specific file** - Navigate to the file mentioned in the error
3. **Compare with working example** - Look at a passing page's frontmatter
4. **Run single test** - Isolate the failing test for debugging
5. **Ask for help** - Post in #seo-testing with error output

### Support Channels

- **Slack**: #seo-testing
- **Email**: seo-team@example.com
- **Documentation**: `/docs/testing/`
- **Office Hours**: Tuesdays 2-3pm PST

---

## ✅ Success Metrics

Your SEO tests are working well when:

- ✅ **100% pass rate** on all MANDATORY tests
- ✅ **90%+ quality score** in comprehensive report
- ✅ **<5 minutes** total test execution time
- ✅ **90%+ coverage** on SEO test files
- ✅ **Zero deployment blocks** from SEO issues
- ✅ **Rich results eligible** for 100% of article pages

---

**Last Updated**: February 14, 2026  
**Maintained By**: SEO Infrastructure Team  
**Questions?**: Open an issue or contact #seo-testing
