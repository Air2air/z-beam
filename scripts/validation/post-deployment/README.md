# Post-Deployment Production Validation

Comprehensive validation suite for testing the live production site after deployment.

## 🚀 Quick Start

```bash
# Basic validation (fast, no external APIs)
npm run validate:production

# Generate HTML report
npm run validate:production:report

# Enhanced validation with external APIs (PageSpeed, W3C, etc.)
npm run validate:production:enhanced

# Full validation with HTML report
npm run validate:production:full

# Run automatically after deployment
npm run postdeploy

# Run the full orchestrated suite explicitly
npm run validate:production:complete
```

`npm run postdeploy` is the fast/basic post-deploy path. Use `npm run validate:production:complete` when you intentionally want the broader multi-stage suite.

## 📋 What Gets Validated

### Basic Validation (`validate-production.js`)

**Performance** (5 tests)
- ⏱️ Response Time (< 1000ms)
- 🏃 TTFB - Time to First Byte (< 600ms)
- 📦 Content Compression (gzip/brotli)
- 💾 Cache Headers (Cache-Control)
- 📄 HTML Size (< 100KB)

**Security** (8 tests)
- 🔒 HTTPS Protocol
- 🛡️ Strict-Transport-Security (HSTS)
- 🚫 X-Content-Type-Options
- 🖼️ X-Frame-Options
- ⚔️ X-XSS-Protection
- 📜 Content-Security-Policy
- 🔗 Referrer-Policy
- 🎯 Permissions-Policy
- 🔐 Mixed Content Detection

**SEO** (9 tests)
- 📝 Title Tag (10-60 characters)
- 📄 Meta Description (120-160 characters)
- 🔗 Canonical URL
- 🤖 Robots Meta Tag
- 🌐 Open Graph Tags
- 🐦 Twitter Card
- 🏷️ H1 Tag (exactly one)
- 🖼️ Image Alt Attributes
- 📱 Viewport Meta Tag

**Accessibility** (5 tests)
- 🌍 HTML Lang Attribute
- 🏛️ Semantic HTML Landmarks (main, nav)
- ⏭️ Skip Links
- 🏷️ Form Label Association
- 🔘 Button Accessible Names

**JSON-LD / Structured Data** (5+ tests)
- 📊 JSON-LD Presence
- ✅ JSON-LD Syntax Validation
- 🌐 WebSite Schema
- 📄 WebPage Schema
- 🏢 Organization Schema
- 🍞 BreadcrumbList Schema

**Additional** (3 tests)
- 🤖 robots.txt
- 🗺️ sitemap.xml
- 🎨 favicon.ico

**Total: ~35 validation tests**

### Enhanced Validation (`validate-production-enhanced.js`)

All basic tests PLUS:

**Google PageSpeed Insights**
- 📱 Mobile Analysis
  - Performance Score
  - Accessibility Score
  - Best Practices Score
  - SEO Score
- 🖥️ Desktop Analysis
  - Performance Score
  - Accessibility Score
  - Best Practices Score
  - SEO Score

**Core Web Vitals** (Both mobile & desktop)
- ⚡ LCP - Largest Contentful Paint (< 2.5s)
- 🖱️ FID - First Input Delay (< 100ms)
- 📐 CLS - Cumulative Layout Shift (< 0.1)
- 🎯 INP - Interaction to Next Paint (< 200ms)
- 🎨 FCP - First Contentful Paint (< 1.8s)
- 📊 Speed Index (< 3.4s)
- ⏱️ TTI - Time to Interactive (< 3.8s)
- 🚫 TBT - Total Blocking Time (< 200ms)

**Mozilla Observatory**
- 🔒 Security Grade (A+ to F)
- 🎯 Security Score (0-100)
- ✅ Tests Passed/Failed

**W3C HTML Validator**
- ✔️ HTML Validation Errors
- ⚠️ HTML Validation Warnings

**SSL/TLS Configuration**
- 🔐 HTTPS Protocol Check

**Total: ~65+ validation tests**

### Comprehensive Validation (`validate-production-comprehensive.js`) 🔥

Includes all core checks plus full-site SEO infrastructure gate checks:

- 🧭 **Full-site indexability & canonical consistency** (sitemap-driven crawl)
  - Every sitemap URL status (2xx/3xx)
  - Canonical presence and canonical self-consistency
  - `noindex` detection on canonical pages
- 🧩 **Full-site metadata consistency**
  - Title + meta description presence on every crawled sitemap URL
  - Canonical and `og:url` parity checks
  - Duplicate title and duplicate description detection
- 🏗️ **Full-site structured data coverage**
  - JSON-LD parse validation for crawled URLs
  - Breadcrumb schema presence checks for deep content routes
  - Page-type schema coverage checks
- 🔗 **Full-site internal link integrity**
  - Extracts internal links from crawled pages
  - Verifies link targets via sitemap membership and live reachability

This closes key production SEO gaps around sample-only checks and route-level consistency.

## 📊 Reports

### Console Output

Default format with colored output:
```bash
npm run validate:production
```

Shows:
- Real-time progress with emojis
- Category-by-category results
- Summary with pass/fail/warning counts
- Overall score (0-100)
- Failed tests breakdown

### JSON Report

Machine-readable format for CI/CD integration:
```bash
npm run validate:production:json
```

Output: `validation-report.json`
```json
{
  "timestamp": "2025-11-13T...",
  "url": "https://www.z-beam.com",
  "categories": {
    "performance": { "tests": [...], "passed": 4, "failed": 1 },
    "security": { "tests": [...], "passed": 8, "failed": 0 }
  },
  "summary": {
    "total": 35,
    "passed": 33,
    "failed": 2,
    "warnings": 0,
    "score": 94
  }
}
```

### HTML Report

Beautiful visual report with charts:
```bash
npm run validate:production:report
# or enhanced version
npm run validate:production:full
```

Output: `validation-report.html` or `production-validation-report.html`

Features:
- 📊 Visual score cards
- 🎨 Color-coded test results
- 📈 Category breakdowns
- 🌐 External API results (enhanced version)
- 📱 Mobile-responsive design
- 🖨️ Print-friendly

## 🔧 Usage Options

### Basic Script

```bash
node scripts/validation/post-deployment/validate-production.js [options]
```

**Options:**
- `--url=<url>` - Target URL (default: https://www.z-beam.com)
- `--report=<format>` - Report format: `json|html|console` (default: console)
- `--output=<file>` - Output file path for report
- `--category=<cat>` - Run specific category: `all|performance|seo|a11y|security|jsonld`
- `--verbose` - Detailed output

**Examples:**
```bash
# Test specific category
node scripts/validation/post-deployment/validate-production.js --category=seo

# Test different URL
node scripts/validation/post-deployment/validate-production.js --url=https://staging.z-beam.com

# Generate JSON report
node scripts/validation/post-deployment/validate-production.js --report=json --output=report.json

# Verbose mode
node scripts/validation/post-deployment/validate-production.js --verbose
```

### Enhanced Script

```bash
node scripts/validation/post-deployment/validate-production-enhanced.js [options]
```

**Options:**
- `--url=<url>` - Target URL
- `--pagespeed-key=<key>` - Google PageSpeed API key (optional, uses `PAGESPEED_API_KEY` env var)
- `--skip-external` - Skip external API calls (faster)
- `--report=<format>` - Report format
- `--output=<file>` - Output file path

**Examples:**
```bash
# With API key for higher rate limits
PAGESPEED_API_KEY=your-key npm run validate:production:enhanced

# Skip external APIs (faster, local checks only)
node scripts/validation/post-deployment/validate-production-enhanced.js --skip-external

# Full validation with HTML report
node scripts/validation/post-deployment/validate-production-enhanced.js \
  --url=https://www.z-beam.com \
  --report=html \
  --output=full-report.html
```

## 🔄 Automation

### Post-Deployment Hook

Automatically run after every deployment:

```json
{
  "scripts": {
    "postdeploy": "npm run validate:production"
  }
}
```

### GitHub Actions

Add to `.github/workflows/validate-production.yml`:

```yaml
name: Production Validation

on:
  deployment_status:

### Comprehensive Script

```bash
node scripts/validation/post-deployment/validate-production-comprehensive.js [options]
```

**Additional options:**
- `--skip-external` - Skip external APIs
- `--skip-performance` - Skip PageSpeed/Core Web Vitals check
- `--skip-accessibility` - Skip accessibility checks
- `--max-urls=<n>` - Limit sitemap crawl size for smoke runs (default: full sitemap)
- `--compare-url=<url>` - Compare production URL behavior against a second deploy URL (preview/staging parity)
- `--require-rich-results` - Fail if required rich-results schema fields are missing
- `--strict-seo` - Treat SEO warnings in strict categories as deployment blockers (`seo-metadata`, `metadata-consistency`, `indexability`, `schema-coverage`, `rich-results`, `internal-links`, `route-health`, `sitemap`, `robots`)

**Examples:**
```bash
# Full production SEO gate (all sitemap URLs)
npm run validate:production:comprehensive

# Fast smoke test for CI triage
node scripts/validation/post-deployment/validate-production-comprehensive.js --skip-external --max-urls=50

# Strict SEO gating (canonical/metadata/schema/indexability/internal-link warnings fail build)
npm run validate:production:strict-seo

# Production vs preview parity (set COMPARE_URL first)
COMPARE_URL=https://<preview-domain> npm run validate:production:parity
```

jobs:
  validate:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Validate Production
        run: npm run validate:production:enhanced
        env:
          PAGESPEED_API_KEY: ${{ secrets.PAGESPEED_API_KEY }}
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: validation-report
          path: production-validation-report.html
```

### Daily Scheduled Validation

Run daily checks with GitHub Actions:

```yaml
name: Daily Production Health Check

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM UTC daily

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run validate:production:full
      - name: Send Report
        # Email or Slack notification with report
```

### Vercel Integration

Add to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "env": {
    "PAGESPEED_API_KEY": "@pagespeed-key"
  }
}
```

Then run validation via Vercel CLI after deployment:

```bash
vercel deploy --prod && npm run validate:production:enhanced
```

## 📈 Scoring

### Overall Score Calculation

```
Score = (Passed Tests / Total Tests) × 100
```

### Category Scores

Each category gets its own score:
```
Category Score = (Passed Category Tests / Total Category Tests) × 100
```

### Grade Interpretation

- 🟢 **90-100**: Excellent - Production ready
- 🟡 **70-89**: Good - Minor issues, acceptable
- 🟠 **50-69**: Fair - Needs attention
- 🔴 **0-49**: Poor - Critical issues, do not deploy

## 🎯 Performance Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| Response Time | < 1s | 1-3s | > 3s |
| TTFB | < 600ms | 600ms-1.8s | > 1.8s |
| LCP | < 2.5s | 2.5-4s | > 4s |
| FID | < 100ms | 100-300ms | > 300ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| INP | < 200ms | 200-500ms | > 500ms |

## 🔍 Troubleshooting

### "Request timeout"
- **Cause:** Site not responding or very slow
- **Fix:** Check if site is up, increase timeout in script

### "PageSpeed API rate limit"
- **Cause:** No API key provided, hitting rate limits
- **Fix:** Get API key from Google Cloud Console, set `PAGESPEED_API_KEY` env var

### "No JSON-LD blocks found"
- **Cause:** JavaScript-rendered content not being captured
- **Fix:** Check if schemas are in initial HTML or loaded dynamically

### "Mixed content detected"
- **Cause:** HTTP resources on HTTPS pages
- **Fix:** Update all resource URLs to HTTPS

### "Security headers missing"
- **Cause:** Vercel or server not configured with security headers
- **Fix:** Update `vercel.json` or server configuration

## 🌟 Best Practices

1. **Run after every deployment** - Catch issues immediately
2. **Set up daily checks** - Monitor production health continuously
3. **Store reports** - Track performance trends over time
4. **Set up alerts** - Notify team when scores drop
5. **Use API keys** - Avoid rate limiting on external services
6. **Review warnings** - Don't ignore non-blocking issues
7. **Track trends** - Monitor score changes over time

## 📚 External Tools

### Recommended Manual Checks

After validation, also check:

1. **SSL Labs** - https://www.ssllabs.com/ssltest/
   - Comprehensive SSL/TLS configuration analysis

2. **Security Headers** - https://securityheaders.com/
   - Detailed security header analysis and grading

3. **Google Rich Results Test** - https://search.google.com/test/rich-results
   - Test rich snippet eligibility

4. **Google Search Console** - https://search.google.com/search-console
   - Index coverage, Core Web Vitals, usability issues

5. **GTmetrix** - https://gtmetrix.com/
   - Performance analysis with historical tracking

6. **WebPageTest** - https://www.webpagetest.org/
   - Detailed performance analysis with filmstrip view

## 🚨 CI/CD Integration

### Fail Build on Errors

```bash
# In CI/CD pipeline
npm run validate:production:enhanced || exit 1
```

### Quality Gates

```javascript
// In CI/CD script
const results = require('./validation-report.json');

if (results.summary.score < 80) {
  console.error('❌ Validation score below threshold');
  process.exit(1);
}

if (results.summary.failed > 5) {
  console.error('❌ Too many failed tests');
  process.exit(1);
}
```

## 📝 Adding Custom Tests

Edit `validate-production.js` to add custom validations:

```javascript
async function validateCustom() {
  console.log('\n🎯 Custom Validations...');
  
  try {
    const response = await fetchUrl(TARGET_URL);
    const html = response.body;
    
    // Your custom test
    const hasCustomElement = html.includes('<div class="my-custom-class">');
    addResult('custom', 'Custom Element Present',
      hasCustomElement,
      hasCustomElement ? 'Custom element found' : 'Custom element missing'
    );
    
  } catch (error) {
    console.error(`  ✗ Custom validation failed: ${error.message}`);
  }
}

// Add to main() execution
async function main() {
  // ... existing validations
  await validateCustom();
  // ...
}
```

## 📊 Comparing Pre vs Post Deployment

```bash
# Before deployment (local build)
npm run validate:highest-scoring > pre-deploy.txt

# After deployment (production)
npm run validate:production > post-deploy.txt

# Compare
diff pre-deploy.txt post-deploy.txt
```

## 🎓 Learning Resources

- [Google PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about)
- [Core Web Vitals](https://web.dev/vitals/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Schema.org](https://schema.org/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [W3C Validator](https://validator.w3.org/)

---

**Next Steps:** See [COVERAGE_ANALYSIS.md](./COVERAGE_ANALYSIS.md) for opportunities to enhance validation coverage.
