# SEO Validation Guide
**Complete guide for validating SEO improvements in production**

---

## 🔥 MANDATORY SEO Testing (February 14, 2026)

**All pages MUST pass comprehensive SEO tests before production deployment.**

**Policy Documents**:
- **[SEO Testing Policy](../../docs/policies/SEO_TESTING_POLICY.md)** - MANDATORY compliance requirements
- **[Testing Requirements](../../docs/testing/SEO_TESTING_REQUIREMENTS.md)** - Complete specifications
- **[Testing Guide](../../docs/testing/SEO_TESTING_GUIDE.md)** - Implementation guide

**Run Comprehensive Tests**:
```bash
npm run test:seo:comprehensive  # Master test suite (327+ pages)
npm run test:seo:all            # All SEO tests with coverage
npm run validate:seo:comprehensive  # Full validation
```

**Quality Requirements**:
- Overall Quality Score: ≥60% (Target: 90%+)
- Schema Presence: ≥90% of pages
- Title/Description: 100% coverage
- Rich Results: 100% of article pages

**This guide covers post-deployment validation. Pre-deployment validation is MANDATORY via the comprehensive test suite.**

---

## Quick Start

### Run Validation
```bash
npm run validate:production:comprehensive
```

**Expected Output**:
```
🔍 COMPREHENSIVE POST-DEPLOYMENT VALIDATION
═══════════════════════════════════════════
📍 Target: https://www.z-beam.com
⏰ Started: [timestamp]

📊 Score:       94%
🎯 Grade:       A
Total Tests:    76
✅ Passed:      73
❌ Failed:      1
⚠️  Warnings:    2
```

---

## What Gets Validated

### 1. Core Web Vitals Optimizations (6 checks)

**Purpose**: Verify Dec 28 performance improvements are deployed

**Checks**:
- ✅ **Preconnect: Vercel Vitals** - Early connection for analytics
- ✅ **Preconnect: Google Tag Manager** - Early connection for GTM
- ✅ **Hero Image Preload** - LCP optimization via resource hints
- ✅ **Inline Critical CSS** - FCP optimization via inline styles
- ✅ **Responsive Image Sizes** - CLS optimization via sizes attribute
- ✅ **Priority Images** - Above-fold images with fetchPriority="high"

**Expected Impact**:
- **LCP**: -300ms (20-24% improvement)
- **FCP**: -200ms (20-25% improvement)
- **CLS**: -0.03 (40-60% improvement)

**How It Works**:
```javascript
// Fetches homepage HTML and searches for:
<link rel="preconnect" href="https://vitals.vercel-insights.com" />
<link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" />
<style dangerouslySetInnerHTML={{__html: 'body{margin:0...'}}>
<img sizes="..." /> // Responsive sizing
<img fetchPriority="high" /> // Priority loading
```

---

### 2. Contextual Internal Linking (6 checks)

**Purpose**: Verify internal linking strategy implemented correctly

**Sample Pages Tested**:
1. `/materials/metal/non-ferrous/aluminum-laser-cleaning`
2. `/materials/wood/hardwood/ash-laser-cleaning`
3. `/contaminants/oxidation/ferrous/rust-oxidation-contamination`
4. `/settings/metal/non-ferrous/aluminum-settings`

**Validation Logic**:
```javascript
// Counts links matching pattern:
href="/materials/..."
href="/contaminants/..."
href="/settings/..."

// Validates:
✅ Links found on each sample page
✅ Average density: 1.55+ links/page
✅ Expected total: 250+ links across 161 pages
✅ Link coverage across all content types
```

**How It Works**:
- Fetches each sample page HTML
- Extracts all internal links with regex
- Counts links per page
- Calculates average density
- Reports pass/fail based on thresholds

---

### 3. Image Sitemap Quality (13 checks)

**Purpose**: Ensure image SEO implementation is complete

**Validation Coverage**:
- ✅ **Sitemap Accessibility** - public/image-sitemap.xml returns 200 OK
- ✅ **Image Count** - 346 images indexed
- ✅ **XML Structure** - Valid sitemap/0.9 and sitemap-image/1.1 xmlns
- ✅ **Image Micro Text** - All images have descriptive micro text
- ✅ **Image Titles** - All images have proper titles
- ✅ **Directory Exclusions** - No icon/author images in sitemap
- ✅ **Title Format** - No "Hero" suffix in titles
- ✅ **Magnification Notation** - "Micro" replaced with "1000x magnification"

**Quality Checks**:
```xml
<!-- Good -->
<image:title>Aluminum Laser Cleaning - 1000x Magnification</image:title>
<image:micro>Professional laser cleaning removing surface contaminants from aluminum at 1000x magnification</image:micro>

<!-- Bad (won't pass) -->
<image:title>Aluminum Hero</image:title>
<image:micro></image:micro>
```

---

## Interpreting Results

### Grade Scale

| Grade | Score | Status | Action Required |
|-------|-------|--------|-----------------|
| **A+** | 98-100% | Excellent | Monitor only |
| **A** | 90-97% | Very Good | Minor optimizations |
| **B+** | 85-89% | Good | Review failed tests |
| **B** | 80-84% | Acceptable | Fix issues soon |
| **C+** | 75-79% | Needs Work | Investigate immediately |
| **C or below** | <75% | Critical | Emergency response |

### Understanding Category Scores

**Infrastructure (6 checks)**: Basic site functionality
- HTTPS, Security headers, HTML structure

**Core Web Vitals (6 checks)**: Performance optimizations
- Preconnect hints, preloads, inline CSS, image optimization

**SEO Metadata (10 checks)**: Meta tags and descriptions
- Title, description, Open Graph, Twitter Cards

**Contextual Linking (6 checks)**: Internal link strategy
- Link density, coverage, distribution

**Structured Data (10 checks)**: Schema.org markup
- Organization, LocalBusiness, WebSite, BreadcrumbList

**Content Schemas (12 checks)**: Page-specific schemas
- Material, contaminant, settings page schemas

**Dataset Files (4 checks)**: Public dataset availability
- JSON dataset files accessible and valid

**Sitemap (13 checks)**: XML sitemaps
- Main sitemap + image sitemap quality

**Robots (3 checks)**: robots.txt configuration
- Proper directives and sitemap references

**Performance (1 check)**: Core Web Vitals API
- PageSpeed Insights integration (requires API key)

**Accessibility (5 checks)**: Basic WCAG compliance
- HTML lang, viewport, alt text, contrast

---

## Troubleshooting Common Issues

### ❌ Hero Image Preload Missing

**Symptom**:
```
❌ Hero Image Preload: ⚠️ Missing
```

**Diagnosis**:
```bash
# Check if preload exists in layout.tsx:
grep -A 2 "preload" app/layout.tsx

# Should show:
# <link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" type="image/webp" />
```

**Fix**:
```tsx
// app/layout.tsx - Add inside <head>:
<link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" type="image/webp" />
```

**Verify**:
```bash
npm run build && npm run validate:production:comprehensive
```

---

### ❌ Contextual Links Below Threshold

**Symptom**:
```
❌ Average Link Density: 0.8 links/page (expected: 1.55+)
```

**Diagnosis**:
```bash
# Count contextual links in frontmatter:
grep -r "\[.*\](/\(materials\|contaminants\|settings\)/" frontmatter/ | wc -l

# Should show: 250+ matches
```

**Fix**:
```bash
# Re-run contextual linking tool:
cd seo/scripts
node add-contextual-links.js
```

**Verify**:
```bash
# Check specific file:
grep "\[.*\](/.*/" frontmatter/materials/metal/non-ferrous/aluminum.yaml

# Should find 1-3 contextual links in page_description
```

---

### ❌ Image Sitemap Missing Titles

**Symptom**:
```
❌ Image Sitemap Titles: 200/346 (expected: 346)
```

**Diagnosis**:
```bash
# Check sitemap:
grep -c "<image:title>" public/image-sitemap.xml

# Should show: 346
```

**Fix**:
```bash
# Regenerate image sitemap:
npm run generate:image-sitemap

# Verify:
ls -lh public/image-sitemap.xml  # Should be ~107KB
grep -c "<image:image>" public/image-sitemap.xml  # Should be 346
```

---

### ⚠️ Performance Check at 50%

**Symptom**:
```
⚠️ performance: 50% (0/1)
⚠️ PageSpeed API key not set
```

**Solution**: The validation script now automatically loads environment variables from `.env` files using `dotenv`. Ensure you have a PageSpeed API key in your `.env` file:

```bash
# .env file (already configured in this project)
PAGESPEED_API_KEY=your-key-here
```

**To Get API Key**:
1. Visit: https://developers.google.com/speed/docs/insights/v5/get-started
2. Enable PageSpeed Insights API in Google Cloud Console
3. Create API key
4. Add to `.env` file in project root

**Note**: Since Dec 29, 2025, the validation script automatically loads `.env` files. No manual export needed.

---

## Manual Verification

### Production URL Tests

**Test Core Web Vitals Preload**:
```bash
curl -s https://www.z-beam.com | grep "rel=\"preload\"" | grep hero
```
**Expected**: `<link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" type="image/webp"/>`

**Test Contextual Linking**:
```bash
curl -s https://www.z-beam.com/materials/metal/non-ferrous/aluminum-laser-cleaning \
  | grep -o 'href="/\(materials\|contaminants\|settings\)/' | wc -l
```
**Expected**: 1-3 links

**Test Image Sitemap**:
```bash
curl -s https://www.z-beam.com/image-sitemap.xml | grep "<image:title>" | wc -l
```
**Expected**: 346

**Test Preconnect Hints**:
```bash
curl -s https://www.z-beam.com | grep "rel=\"preconnect\""
```
**Expected**: Vercel Vitals and Google Tag Manager entries

---

## Integration with CI/CD

### Vercel Deployment Hooks

**Automatic on Deploy**:
```json
// package.json
{
  "scripts": {
    "postdeploy": "npm run validate:production:comprehensive"
  }
}
```

**Vercel runs validation after deployment**:
1. Build completes
2. Deploy to production
3. Run postdeploy script
4. Validation results in deployment logs

### Monitoring Results

**Check Deployment Logs**:
```bash
# Vercel CLI:
vercel logs <deployment-url> --follow

# Look for:
# 📊 COMPREHENSIVE VALIDATION SUMMARY
# 🎯 Grade: A
```

**Set Up Alerts**:
- Grade drops below B: Warning
- Grade drops below C: Alert
- Any critical test fails: Immediate notification

---

## Best Practices

### When to Validate

✅ **Always**:
- After every production deployment
- After updating SEO-related code
- After modifying image sitemap generation
- After updating frontmatter files

✅ **Recommended**:
- Weekly production health checks
- Before major releases
- After dependency updates

⚠️ **Optional**:
- During local development (use staging URL)
- For preview deployments (may have different behavior)

### Interpreting Warnings vs Errors

**⚠️ Warnings**: Non-critical issues
- Meta description slightly over 160 chars
- Missing PageSpeed API key
- Minor optimization opportunities

**❌ Errors**: Fix immediately
- Core Web Vitals optimizations missing
- Image sitemap not accessible
- Contextual links below threshold
- Schema validation failures

---

## Advanced Usage

### Custom Target URL

**Test Staging/Preview**:
```bash
TARGET_URL=https://preview.z-beam.com npm run validate:production:comprehensive
```

### Output to File

**JSON Format**:
```bash
OUTPUT_FILE=validation-results.json \
REPORT_FORMAT=json \
npm run validate:production:comprehensive
```

**Text Format**:
```bash
OUTPUT_FILE=validation-results.txt \
REPORT_FORMAT=text \
npm run validate:production:comprehensive
```

### Selective Validation

**Only SEO Checks**:
```bash
# Edit validate-production-comprehensive.js
# Comment out non-SEO checks in main execution
```

---

## Maintenance

### Update Thresholds

**If requirements change**:
```javascript
// validate-production-comprehensive.js

// Example: Increase link density requirement
addResult('contextual-linking', 'Average Link Density',
  averageDensity >= 2.0,  // Was: 1.55
  `${averageDensity.toFixed(2)} links/page (expected: 2.0+)`
);
```

### Add New Checks

**Template for new validation**:
```javascript
async function checkNewFeature() {
  console.log('\n🆕 X. NEW FEATURE VALIDATION');
  console.log('─'.repeat(60));
  
  try {
    const html = await fetch(TARGET_URL).then(r => r.text());
    const featurePresent = html.includes('new-feature-marker');
    
    addResult('new-feature', 'Feature Detection',
      featurePresent,
      featurePresent ? '✅ Present' : '❌ Missing'
    );
    
    calculateCategoryScore('new-feature');
    console.log(`   Score: ${results.categories['new-feature'].score}%`);
    
  } catch (error) {
    addResult('new-feature', 'Check', false, error.message);
  }
}

// Add to main execution:
await checkNewFeature();
```

---

## Related Documentation

- **Implementation**: [SEO_IMPLEMENTATION_COMPLETE_DEC28.md](../../docs/SEO_IMPLEMENTATION_COMPLETE_DEC28.md)
- **Test Coverage**: [SEO_TEST_COVERAGE_SUMMARY_DEC28_2025.md](./SEO_TEST_COVERAGE_SUMMARY_DEC28_2025.md)
- **Operations**: [RUNBOOK.md](../../docs/RUNBOOK.md) - SEO Validation section
- **Validation Script**: `scripts/validation/post-deployment/validate-production-comprehensive.js`

---

**Last Updated**: December 29, 2025  
**Maintained By**: Z-Beam SEO Team
