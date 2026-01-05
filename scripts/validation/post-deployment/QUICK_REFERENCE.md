# Post-Deployment Validation - Quick Reference

## 🚀 Usage

### After Every Deployment
```bash
npm run postdeploy
```

This runs the **complete validation suite** covering:
- ✅ Core functionality (site loads, pages accessible)
- ✅ Content integrity (frontmatter, metadata, naming)
- ✅ SEO & schemas (meta tags, JSON-LD, sitemap)
- ✅ Performance (Core Web Vitals)
- ✅ Accessibility (WCAG 2.2)
- ✅ Production environment checks

**Duration**: ~5-10 minutes  
**Exit Code**: 0 if passed, 1 if failed

---

## 📋 Available Validation Commands

### Comprehensive (Recommended)
```bash
npm run postdeploy                          # Complete validation (all checks)
npm run validate:production:complete        # Alias for postdeploy
```

### Quick Checks
```bash
npm run validate:production:simple          # Core checks only (2-3 min)
npm run validate:production:enhanced        # Core + SEO (3-5 min)
npm run validate:production:comprehensive   # Everything (10-15 min)
```

### Category-Specific
```bash
npm run validate:content              # Frontmatter, metadata, naming, breadcrumbs
npm run validate:seo-infrastructure   # Meta tags, schemas, Open Graph
npm run validate:performance          # Core Web Vitals
npm run validate:a11y                 # WCAG 2.2 compliance
npm run validate:urls                 # All URLs accessible
```

### Individual Validations
```bash
npm run validate:frontmatter          # Frontmatter structure only
npm run validate:metadata             # Metadata sync only
npm run validate:naming               # Naming conventions only
npm run validate:breadcrumbs          # Breadcrumbs only
npm run verify:sitemap                # Sitemap only
```

---

## 🎯 What Gets Checked

### 1. Core Functionality
- ✅ Homepage loads (200 status)
- ✅ Material pages load
- ✅ Dataset page accessible
- ✅ Navigation works
- ✅ No JavaScript errors

### 2. Content Validation
- ✅ All 153 materials have complete frontmatter
- ✅ camelCase naming (pageTitle, pageDescription, metaDescription)
- ✅ Metadata sync between YAML and pages
- ✅ Breadcrumbs present and valid
- ✅ No duplicate content

### 3. SEO & Metadata
- ✅ Title tags (50-60 chars)
- ✅ Meta descriptions (155-160 chars)
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Canonical URLs
- ✅ Schema.org JSON-LD (TechArticle, Dataset, etc.)

### 4. Sitemap & URLs
- ✅ `/sitemap.xml` accessible
- ✅ Contains all 153 materials
- ✅ Static routes included
- ✅ Category pages included
- ✅ Valid XML format
- ✅ All URLs return 200

### 5. Performance
- ✅ LCP < 2.5s (Largest Contentful Paint)
- ✅ FID < 100ms (First Input Delay)
- ✅ CLS < 0.1 (Cumulative Layout Shift)
- ✅ TTFB < 600ms
- ✅ FCP < 1.8s

### 6. Accessibility
- ✅ WCAG 2.2 Level AA compliance
- ✅ Color contrast ratios
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ ARIA labels
- ✅ Semantic HTML

### 7. Images
- ✅ Hero images load (153 materials)
- ✅ Micro images load
- ✅ Alt text present
- ✅ Image dimensions specified
- ✅ Lazy loading works

### 8. Security
- ✅ HTTPS enforced
- ✅ HSTS header
- ✅ Security headers present
- ✅ No mixed content
- ✅ No exposed secrets

---

## 🚨 Interpreting Results

### ✅ All Passed (Exit 0)
```
Success Rate: 100%
🎉 ALL VALIDATIONS PASSED!
✅ Production deployment is healthy
```
**Action**: None required. Deployment successful.

### ⚠️ Passed with Warnings (Exit 0)
```
Success Rate: 95-99%
⚠️ VALIDATION PASSED WITH WARNINGS
2 non-critical checks failed
Review failures and consider fixes
```
**Action**: Review warnings. Fix in next deployment if needed.

### ❌ Failed (Exit 1)
```
Success Rate: <95%
❌ VALIDATION FAILED
5 critical checks failed
Consider rollback or hotfix
```
**Action**: 
1. Review failures in output
2. Check Vercel logs: `npm run logs`
3. Consider rollback: `vercel rollback`
4. Or apply hotfix and redeploy

---

## 🔧 Troubleshooting

### Validation Fails Locally
```bash
# Ensure dev server is running
npm run dev

# Run against local server
npm run validate:production:simple -- --url=http://localhost:3000
```

### Validation Fails in Production
```bash
# Check recent deployments
npm run status

# View deployment logs
npm run logs

# Run simplified validation (skip slow checks)
npm run validate:production:simple
```

### Specific Check Fails
```bash
# Debug specific category
npm run validate:frontmatter  # If frontmatter fails
npm run validate:metadata     # If metadata fails
npm run validate:seo          # If SEO fails
```

---

## 📊 Coverage Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| Core Functionality | 5 | 100% |
| Content Validation | 8 | 100% |
| SEO & Metadata | 12 | 100% |
| Performance | 6 | 100% |
| Accessibility | 7 | 100% |
| Security | 5 | 100% |
| **TOTAL** | **43** | **100%** |

---

## 🔄 CI/CD Integration

### Pre-Deployment (Runs automatically before build)
```json
"prebuild": "validate:content && validate:naming && validate:types && test:ci"
```

### Post-Build (Runs after successful build)
```json
"postbuild": "generate:image-sitemap && validate:urls"
```

### Post-Deployment (Run manually after Vercel deploy)
```bash
npm run postdeploy
```

---

## 📖 Documentation

**Detailed Checklist**: `scripts/validation/post-deployment/comprehensive-checklist.md`  
**Validation Scripts**: `scripts/validation/post-deployment/`  
**Deployment Guide**: `docs/02-features/deployment/VALIDATION_GUIDE.md`  
**Pre-Deployment Tests**: `tests/deployment/pre-deployment-validation.test.js`

---

## 🆘 Quick Help

**View this guide**:
```bash
cat scripts/validation/post-deployment/QUICK_REFERENCE.md
```

**List all validation commands**:
```bash
npm run | grep validate
```

**Get validation status**:
```bash
npm run status
```

**View deployment logs**:
```bash
npm run logs
```

---

## ✅ Success Criteria

**Deployment is production-ready when:**
- ✅ `npm run postdeploy` exits with code 0
- ✅ Success rate ≥ 95%
- ✅ No critical errors
- ✅ All 153 material pages accessible
- ✅ Core Web Vitals meet thresholds
- ✅ SEO score > 95%
- ✅ WCAG 2.2 compliance

---

**Last Updated**: January 5, 2026
