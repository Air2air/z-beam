# Production Validation Guide

## Overview

Z-Beam uses **comprehensive validation** to ensure production quality. After every deployment, an automated validation suite runs 35+ checks across 6 categories.

## Quick Start

```bash
# Run comprehensive validation (default)
npm run validate:production

# Run after deployment (automatic)
npm run postdeploy

# Run simple validation (deprecated)
npm run validate:production:simple

# Run enhanced validation with external APIs
npm run validate:production:enhanced
```

## Validation Categories

### 🚀 Performance (5 checks)
- ✓ Response time (<1000ms)
- ✓ Time to First Byte - TTFB (<600ms)
- ✓ Content compression (gzip/brotli)
- ✓ Cache headers
- ✓ Resource optimization

**Current Score**: 80% (4/5 passing)
**Failed**: Content compression not detected

### 🔒 Security (9 checks)
- ✓ HTTPS enabled
- ✓ SSL certificate valid
- ✓ HSTS headers
- ✓ X-Frame-Options
- ✓ X-Content-Type-Options
- ✓ Content-Security-Policy
- ✓ Referrer-Policy
- ✗ Mixed content detection
- ✓ Security.txt

**Current Score**: 89% (8/9 passing)
**Failed**: Found 2 HTTP resources (mixed content)

### 🔍 SEO (9 checks)
- ✓ Title tag present
- ✓ Meta description present
- ✗ Meta description length (optimal: 150-160 chars)
- ✓ Canonical URL
- ✓ Open Graph tags
- ✓ Twitter Card tags
- ✓ Sitemap accessible
- ✓ Robots.txt present
- ✓ Favicon present

**Current Score**: 89% (8/9 passing)
**Failed**: Meta description 243 chars (too long)

### ♿ Accessibility (3 checks)
- ✓ HTML lang attribute
- ✓ Alt text on images
- ✓ ARIA landmarks

**Current Score**: 100% (3/3 passing)

### 📊 Structured Data (6 checks)
- ✓ JSON-LD present
- ✓ Valid JSON syntax
- ✓ Schema.org types recognized
- ✓ Organization schema
- ✓ WebSite schema
- ✓ BreadcrumbList schema

**Current Score**: 100% (6/6 passing)

### 🎯 Additional (3 checks)
- ✓ No console errors
- ✓ Valid HTML
- ✓ Mobile viewport meta tag

**Current Score**: 100% (3/3 passing)

## Overall Score

**Current Production**: 91/100 (32/35 checks passing)

## Failed Checks - Action Items

### 1. Content Compression (Performance)
**Issue**: No gzip/brotli compression detected
**Impact**: Larger payload sizes, slower load times
**Fix**: Enable compression in Vercel settings or middleware
**Priority**: Medium

### 2. Mixed Content (Security)
**Issue**: 2 HTTP resources on HTTPS page
**Impact**: Browser warnings, security vulnerabilities
**Fix**: Update all resource URLs to HTTPS
**Priority**: High
**Command**: 
```bash
grep -r "http://" app/ --include="*.tsx" --include="*.ts"
```

### 3. Meta Description Length (SEO)
**Issue**: 243 characters (optimal: 150-160)
**Impact**: Truncated in search results
**Fix**: Shorten meta descriptions in frontmatter
**Priority**: Low
**Example**:
```yaml
description: "Concise description under 160 characters for optimal SEO"
```

## Validation Scripts

### Production Validation (`validate-production.js`)
**Lines**: 734
**Checks**: 35+
**Categories**: 6
**Time**: ~5-10 seconds
**Usage**: Default for all deployments

### Simple Validation (`validate-production-simple.js`)
**Lines**: 119
**Checks**: 10
**Categories**: 4
**Time**: ~1-2 seconds
**Status**: ⚠️ Deprecated - Use comprehensive validation

### Enhanced Validation (`validate-production-enhanced.js`)
**Lines**: 553
**Checks**: 35+ plus external APIs
**Categories**: 6 + external
**Time**: ~30-60 seconds (API dependent)
**External APIs**:
- Google PageSpeed Insights
- W3C HTML Validator
- Security Headers API
- SSL Labs

**Usage**:
```bash
# Requires API keys
export PAGESPEED_API_KEY="your-key"
npm run validate:production:enhanced

# Skip external APIs
npm run validate:production:enhanced -- --skip-external
```

## Automated Validation

### Pre-Deployment
Runs before `git push`:
- Metadata sync
- Type checking
- Unit tests
- Naming conventions
- Linting

### Post-Deployment
Runs after deployment completes:
- `npm run postdeploy` → `npm run validate:production`
- Comprehensive validation (35+ checks)
- Results logged to console

### Advanced SEO Hardening (Postdeploy Category 7)

The postdeploy orchestrator now includes an **Advanced SEO Hardening** category for deeper indexing and graph-quality checks:

- Delta sitemap generation
- Crawl-budget / noindex policy audit
- Canonical graph audit
- Entity graph consistency
- Soft-404 / orphan detection
- Bot log intelligence (optional)
- SERP trend monitoring (optional)

Run directly:

```bash
npm run validate:seo:esoteric
```

CI-friendly soft mode:

```bash
npm run validate:seo:esoteric:soft
```

Soft mode uses advisory behavior (`STRICT_MODE=0`) and a reduced crawl scope (`MAX_URLS=120`) to keep execution stable and non-blocking in automated pipelines.

Entity graph mode behavior:

- Default mode is **advisory** (findings are reported but do not fail deploy)
- Strict mode is **blocking**:

```bash
node scripts/seo/advanced/validate-entity-graph-consistency.js --strict
```

Report output:

- `reports/seo/entity-graph-report.json`

## CI/CD Integration

### GitHub Actions
```yaml
- name: Deploy to Production
  run: npm run deploy

- name: Validate Production
  run: npm run validate:production
```

### Vercel
Add to `vercel.json`:
```json
{
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
```

## Custom Validation

### Run Specific Category
```bash
node scripts/validation/post-deployment/validate-production.js --category=seo
node scripts/validation/post-deployment/validate-production.js --category=security
node scripts/validation/post-deployment/validate-production.js --category=performance
```

### Output Formats
```bash
# Console (default)
npm run validate:production

# JSON output
npm run validate:production -- --report=json --output=validation.json

# HTML report
npm run validate:production -- --report=html --output=report.html
```

### Verbose Mode
```bash
npm run validate:production -- --verbose
```

## Best Practices

### ✅ DO
- Run comprehensive validation after every deployment
- Fix failed checks before next deployment
- Monitor validation scores over time
- Add new checks as standards evolve
- Document validation failures in issues

### ❌ DON'T
- Use simple validation for production deployments
- Ignore failed security checks
- Skip validation to save time
- Commit without running pre-push validation
- Deploy with <90% validation score

## Validation Score Guidelines

| Score | Status | Action |
|-------|--------|--------|
| 95-100% | 🟢 Excellent | Deploy confidently |
| 90-94% | 🟡 Good | Deploy, fix minor issues |
| 85-89% | 🟠 Fair | Fix issues before next deploy |
| <85% | 🔴 Poor | Do not deploy until fixed |

**Current Score**: 91/100 (Good ✅)

## Troubleshooting

### Validation Timeout
```bash
# Increase timeout
node scripts/validation/post-deployment/validate-production.js --timeout=60000
```

### Network Errors
```bash
# Check site is accessible
curl -I https://www.z-beam.com

# Check DNS
nslookup www.z-beam.com
```

### False Positives
- Review validation logic in scripts
- Check if issue is environment-specific
- Verify against multiple browsers

## Related Documentation

- `DEPLOYMENT.md` - Full deployment guide
- `docs/testing/` - Testing strategies
- `docs/architecture/` - System architecture
- [AI Assistant Guide](../../../z-beam-generator/docs/08-development/AI_ASSISTANT_GUIDE.md#workflow-orchestration) - AI assistant guidelines

## Updates

**Last Updated**: November 23, 2025
**Version**: 2.0 - Comprehensive validation default
**Next Review**: December 2025
