# SEO Tests Directory 🔥 **MANDATORY TESTING**

**All tests in this directory are MANDATORY for production deployment.**

---

## 🎯 Comprehensive Test Suite

### Master Test (MANDATORY before every deployment)

```bash
npm run test:seo:comprehensive
```

**Tests**: `/tests/seo/comprehensive-seo-infrastructure.test.ts`  
**Coverage**: 327+ pages (materials, contaminants, compounds, settings, static)  
**Validates**: 11 SEO categories across all pages

**What It Tests**:
- ✅ JSON-LD schema presence and structure
- ✅ Schema.org type correctness
- ✅ Required properties completeness
- ✅ Metadata tags (title, description, keywords)
- ✅ Open Graph data (type, title, description, images with dimensions)
- ✅ Twitter Card data (card type, images, creator/site tags)
- ✅ Image SEO (alt text, dimensions, ImageObject schema)
- ✅ Rich Results eligibility (Google compliance)
- ✅ Breadcrumb navigation schema
- ✅ Canonical URLs
- ✅ Schema validation (zero critical errors)

**Generates Quality Report**:
```
📊 QUALITY REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pages Tested: 327
Overall Quality Score: 87.3%
Grade: A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📁 Test Files Overview

### Core Infrastructure Tests

| Test File | Purpose | Coverage |
|-----------|---------|----------|
| `comprehensive-seo-infrastructure.test.ts` | **MASTER SUITE** - All pages, all categories | 327+ pages |
| `schema-validator.test.ts` | Schema.org validation | Schema types |
| `schema-generators.test.ts` | Schema generation logic | All generators |
| `schema-factory.test.ts` | Schema factory patterns | Factory methods |

### Schema Type Tests

| Test File | Schema Type | Pages Tested |
|-----------|-------------|--------------|
| `collection-schemas.test.ts` | CollectionPage | Category pages |
| `person-schemas.test.ts` | Person (authors) | Author schemas |
| `safety-data-schema.test.ts` | Safety properties | Material safety |
| `safety-schema-generation.test.ts` | Safety generation | Safety data |

### Metadata & SEO Tests

| Test File | Purpose | Validation |
|-----------|---------|------------|
| `seo-metadata.test.ts` | Metadata completeness | Titles, descriptions |
| `seo-formatter.test.ts` | Metadata formatting | Format rules |
| `image-seo.test.ts` | Image SEO | Alt text, dimensions |
| `hreflang-expansion.test.ts` | Internationalization | Language tags |

### Integration Tests

| Test File | Purpose | Coverage |
|-----------|---------|----------|
| `e2e-pipeline.test.ts` | End-to-end SEO | Full pipeline |
| `enhanced-seo-integration.test.ts` | SEO integration | Component integration |
| `contaminant-seo.test.ts` | Contaminant pages | Contaminant SEO |
| `contaminant-seo-integration.test.ts` | Contaminant integration | Integration |

### Feed & Validation Tests

| Test File | Purpose | Coverage |
|-----------|---------|----------|
| `feed-generation.test.ts` | RSS/Atom feeds | Feed generation |
| `feed-validation.test.ts` | Feed validation | Feed structure |
| `postdeploy-validation.test.js` | Post-deployment | Production validation |

---

## 🚀 Running Tests

### Quick Commands

```bash
# MANDATORY - Run before every deployment
npm run test:seo:comprehensive

# Run all SEO tests with coverage
npm run test:seo:all

# Run specific test categories
npm run test:seo:article       # Article schemas
npm run test:seo:metadata      # Metadata validation
npm run test:seo:rich-results  # Rich Results

# Pre-deployment validation (comprehensive)
npm run validate:seo:comprehensive
```

### Development Workflow

```bash
# 1. During development - test as you code
npm run test:seo:comprehensive

# 2. Before committing - validate changes
npm run test:seo:all

# 3. Before pull request - full validation
npm run validate:seo:comprehensive

# 4. In CI/CD - automatic enforcement
# GitHub Actions runs automatically on PR
```

---

## 📊 Quality Requirements

### Minimum Thresholds

**Overall Quality Score**: ≥60% (Target: 90%+)

**Individual Metrics**:
- Schema Presence: ≥90% of pages
- Title Coverage: 100% of pages
- Description Coverage: 100% of pages
- Keywords Coverage: ≥80% of pages
- Open Graph Coverage: ≥60% of pages
- Twitter Card Coverage: ≥60% of pages
- Image Alt Text: ≥80% of images
- Rich Results Eligible: 100% of article pages

**Test Coverage**:
- SEO tests: 90% statements/functions/lines, 85% branches
- Metadata utilities: 85% statements/functions/lines, 80% branches
- Schema utilities: 85% statements/functions/lines, 80% branches

---

## 🚫 Deployment Blocking

**Production builds are AUTOMATICALLY BLOCKED if:**

- ❌ Any MANDATORY test fails
- ❌ Overall quality score <60%
- ❌ Schema validation shows critical errors
- ❌ Missing required meta tags (title, description)
- ❌ Open Graph validation fails
- ❌ Twitter Card validation fails
- ❌ Image alt text missing
- ❌ Test coverage <90% for SEO test files

**Enforcement Points**:
1. **Prebuild Hook** - `package.json` prebuild includes `test:seo:comprehensive`
2. **GitHub Actions** - CI/CD workflow blocks PR merge if tests fail
3. **Pre-commit** - Local validation before commit

---

## 📖 Documentation

### Policy & Requirements

- **[SEO Testing Policy](../../docs/policies/SEO_TESTING_POLICY.md)** - MANDATORY compliance
- **[Testing Requirements](../../docs/testing/SEO_TESTING_REQUIREMENTS.md)** - Complete specs
- **[Testing Guide](../../docs/testing/SEO_TESTING_GUIDE.md)** - Implementation guide

### External Resources

- **Schema.org**: https://schema.org/
- **Google Rich Results**: https://developers.google.com/search/docs/advanced/structured-data
- **Open Graph Protocol**: https://ogp.me/
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards
- **Google Validator**: https://validator.schema.org/

---

## 🐛 Debugging Failed Tests

### Common Issues

**1. Missing Schema**
```
Error: Schema not found in frontmatter
Fix: Add "@graph" property with appropriate schema types
```

**2. Invalid Open Graph**
```
Error: og:image missing dimensions
Fix: Add og:image:width and og:image:height properties
```

**3. Missing Alt Text**
```
Error: Image missing alt text
Fix: Add alt attribute to all <img> tags
```

**4. Low Quality Score**
```
Warning: Quality score 55% (threshold: 60%)
Fix: Improve metadata completeness, add missing properties
```

### Debug Commands

```bash
# Run with verbose output
npm run test:seo:comprehensive -- --verbose

# Run specific test file
jest tests/seo/comprehensive-seo-infrastructure.test.ts

# Run tests matching pattern
jest tests/seo --testNamePattern="JSON-LD Schema"

# Run with coverage
npm run test:seo:all
```

---

## ✅ Pre-Deployment Checklist

Before creating a pull request:

- [ ] All SEO tests pass locally
- [ ] Quality score ≥60% (visible in test output)
- [ ] No new schema validation errors
- [ ] All new images have alt text
- [ ] Open Graph data complete for new pages
- [ ] Twitter Card data complete for new pages
- [ ] Coverage thresholds met (90%+ for SEO tests)

Before deploying to production:

- [ ] GitHub Actions SEO tests pass
- [ ] Quality report reviewed
- [ ] No critical errors in test output
- [ ] All reviewers approved PR
- [ ] Pre-deployment validation complete

---

## 📈 Monitoring

### Continuous Tracking

**Weekly Reports** (auto-generated):
- SEO test pass rate (last 7 days)
- Quality score trend
- New pages added with SEO compliance
- Deployment blocks by SEO issues
- Top 5 failing test categories

**Monthly Reviews** (first Wednesday):
- Comprehensive SEO audit
- Schema.org spec updates
- Test coverage analysis
- Quality improvement initiatives
- Team training needs

**Quarterly Audits** (end of quarter):
- Full SEO infrastructure assessment
- Competitor analysis
- Google algorithm update impacts
- Policy updates and refinements
- Tooling improvements

---

## 🎓 Training Resources

**Required for All Developers**:
1. Read SEO Testing Policy (30 min)
2. Read Testing Requirements (45 min)
3. Run comprehensive test locally (15 min)
4. Review test output and understand metrics (30 min)

**Additional Resources**:
- Schema.org documentation
- Google Search Central documentation
- Open Graph protocol specification
- Rich Results test tool tutorials
- SEO testing best practices

---

## 🔥 Remember

**This is not optional. This is not a suggestion. This is MANDATORY.**

All production deployments MUST pass comprehensive SEO tests.  
No exceptions without formal waiver approval.

**Grade**: A+ or production is blocked.

---

**Last Updated**: February 14, 2026  
**Policy Version**: 1.0  
**Test Suite Version**: 1.0
