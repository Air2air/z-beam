# Deploy & Validation Complete Reference

## Quick Command Reference

```bash
# RECOMMENDED: Full lifecycle deployment
npm run deploy:full              # Deploy + post-validation (auto-confirm)
npm run deploy:validated         # Alias for deploy:full
npm run deploy:safe-validated    # Same but with confirmation prompt

# Standard deployment (no post-validation)
npm run deploy                   # Deploy with pre-validation only
npm run deploy:safe              # Deploy with confirmation
npm run deploy:skip              # Emergency deploy (skip all validation)

# Manual post-deploy validation
npm run validate:production                    # Basic validation
npm run validate:production:full               # With HTML report  
npm run postdeploy                             # Alias for validate:production
npm run postdeploy:report                      # Alias for validate:production:full
```

---

## Lifecycle Overview

### Standard Deploy (`npm run deploy`)

```
1. Pre-deployment validation (20+ checks)
2. Build production
3. Deploy to Vercel
4. ✅ DONE (manual post-validation required)
```

### Full Lifecycle Deploy (`npm run deploy:full`)

```
1. Pre-deployment validation (20+ checks)
2. Build production
3. Deploy to Vercel
4. Wait 30s for propagation
5. Post-deployment validation (production URL)
6. Generate HTML report
7. ✅ DONE (fully validated)
```

---

## Git Hooks

### Pre-commit (Automatic)

**Triggers:** `git commit`  
**Purpose:** Update content freshness timestamps  
**Frequency:** Once per 7 days  
**Performance:** < 2s  
**Files Updated:** 5-10 per commit

**Bypass:**
```bash
git commit --no-verify
```

### Pre-push (Automatic)

**Triggers:** `git push`  
**Purpose:** Quick validation before remote push  
**Duration:** 30-90 seconds  
**Checks:** 7 validation steps

**Validations:**
1. ✅ Type checking (`npm run type-check`)
2. ✅ Linting (`npm run lint`)
3. ✅ Unit tests (`npm run test:unit`)
4. ✅ Naming conventions (`npm run validate:naming`)
5. ✅ Metadata sync (`npm run validate:metadata`)
6. ✅ WCAG 2.2 static (`npm run validate:wcag-2.2:static`)
7. ✅ Schema richness (`npm run validate:schema-richness`)

**Bypass:**
```bash
git push --no-verify  # Not recommended
```

---

## Pre-deployment Validation

**Script:** `scripts/deployment/deploy-with-validation.sh`

### 20+ Validation Steps:

**Foundation Checks:**
- Git status & commit info
- File naming conventions
- Metadata synchronization
- TypeScript type checking
- Code quality (ESLint)

**Content & Structure:**
- Sitemap verification
- Content validation
- JSON-LD schema validation (architecture)
- JSON-LD rendering validation
- JSON-LD syntax validation
- JSON-LD URL validation

**Architecture & Routing:**
- Component architecture audit
- Grok validation
- Redirects & routing validation

**Test Suites:**
- Unit tests
- Integration tests
- Component tests
- Sitemap tests
- Deployment tests

**Build & Artifacts:**
- Production build
- Build artifact verification
- Post-build URL validation
- Dataset generation check

**Duration:** 3-7 minutes

---

## Post-deployment Validation

**Script:** `scripts/validation/post-deployment/validate-production.js`

### What It Tests:

**1. Performance**
- ✅ Response time < 3000ms
- ✅ Page load speed
- ✅ HTTP/2 support
- ✅ Compression enabled (gzip/brotli)

**2. SEO**
- ✅ Title tags present & optimized
- ✅ Meta descriptions
- ✅ Canonical URLs correct
- ✅ Open Graph tags
- ✅ Twitter cards
- ✅ Robots meta tags

**3. Accessibility**
- ✅ ARIA landmarks present
- ✅ Image alt text
- ✅ Heading hierarchy (H1-H6)
- ✅ Color contrast (basic check)
- ✅ Keyboard navigation support

**4. Security**
- ✅ HTTPS enabled
- ✅ Security headers (CSP, X-Frame-Options, HSTS, etc.)
- ✅ No mixed content
- ✅ CORS configured correctly

**5. Structured Data (JSON-LD)**
- ✅ Valid JSON syntax
- ✅ Schema.org compliance
- ✅ Required properties present
- ✅ URL consistency
- ✅ Breadcrumb navigation
- ✅ Organization schema
- ✅ Article/Product schemas

**6. UX & Content**
- ✅ Navigation present & functional
- ✅ Footer content complete
- ✅ Contact information available
- ✅ Responsive design indicators
- ✅ No console errors

**Target URL:** `https://www.z-beam.com`  
**Duration:** 10-30 seconds  
**Retries:** Up to 3 attempts with 10s delay

---

## Deploy Lifecycle Scripts

### npm Lifecycle Hook Limitations

⚠️ **IMPORTANT:** npm lifecycle hooks (`predeploy`, `postdeploy`) **DON'T** work with bash scripts!

```json
{
  "deploy": "./scripts/deploy.sh",        // ❌ predeploy won't run
  "predeploy": "npm run validate"         // ❌ Never executes!
  "postdeploy": "npm run validate:prod"   // ❌ Never executes!
}
```

**Why?** npm lifecycle hooks only trigger for actual npm commands, not shell scripts.

### Solution: Manual Wrapper Script

We created `deploy-and-validate.sh` that:
1. Calls `deploy-with-validation.sh` (pre-validation + deploy)
2. Waits for propagation (30s)
3. Runs production validation
4. Generates report

---

## Deployment Strategies

### Strategy 1: Full Lifecycle (RECOMMENDED)

**When:** Standard production deployments  
**Command:** `npm run deploy:full`

**Pros:**
- ✅ Complete validation coverage
- ✅ Automatic post-deployment checks
- ✅ Catches production-only issues
- ✅ Generates validation report

**Cons:**
- ⏱️ Slower (adds ~1 minute)
- 🔄 Requires propagation wait

**Use for:**
- Production releases
- Feature deployments
- Critical updates

### Strategy 2: Standard Deploy

**When:** Quick deployments, low-risk changes  
**Command:** `npm run deploy`

**Pros:**
- ⚡ Faster (no post-validation)
- ✅ Pre-validation still runs

**Cons:**
- ⚠️ No production validation
- ⚠️ Must validate manually

**Use for:**
- Content updates
- Minor fixes
- Development testing

### Strategy 3: Emergency Deploy

**When:** Critical hotfixes, production down  
**Command:** `npm run deploy:skip`

**Pros:**
- 🚀 Fastest (skips all validation)
- 🆘 Emergency use only

**Cons:**
- ❌ No validation
- ⚠️ High risk

**Use for:**
- Emergency hotfixes only
- Production outages
- Rollbacks

---

## Validation Reports

### Console Output (Default)

```bash
npm run validate:production
```

**Shows:**
- ✅ Passed tests
- ❌ Failed tests
- ⚠️ Warnings
- 📊 Summary scores
- 🎯 Overall pass/fail

### JSON Report

```bash
npm run validate:production:json
```

**Output:** `validation-report.json`

**Use for:**
- CI/CD integration
- Monitoring systems
- Historical tracking
- Automated alerts

### HTML Report

```bash
npm run validate:production:full
# or
npm run postdeploy:report
```

**Output:** `production-validation-report.html`

**Features:**
- 📊 Visual charts & graphs
- 🎨 Color-coded results
- 📈 Score breakdowns by category
- 📝 Detailed test results
- 🔗 Clickable links

**Auto-opens in browser** (macOS/Linux)

---

## Custom Validation

### Validate Specific URL

```bash
npm run validate:production -- --url=https://www.z-beam.com/materials/metal/alloy/aluminum-laser-cleaning
```

### Validate Specific Category

```bash
npm run validate:production -- --category=seo
npm run validate:production -- --category=performance
npm run validate:production -- --category=a11y
npm run validate:production -- --category=security
npm run validate:production -- --category=jsonld
```

### Verbose Output

```bash
npm run validate:production -- --verbose
```

---

## Troubleshooting

### Pre-push Validation Fails

```bash
# Run individual checks to identify issue
npm run type-check
npm run lint
npm run test:unit
npm run validate:naming
npm run validate:metadata

# Fix issues and try again
git push
```

### Deployment Fails Validation

```bash
# Review validation output
# Fix critical issues
# Re-run deploy
npm run deploy:full
```

### Post-deployment Validation Fails

```bash
# Wait longer for propagation
npm run deploy:full -- --wait=60

# Skip post-validation if deployment is urgent
npm run deploy

# Validate manually later
npm run validate:production
```

### Production Validation Times Out

```bash
# Check if site is accessible
curl -I https://www.z-beam.com

# Increase timeout (edit script)
# scripts/validation/post-deployment/validate-production.js
# TIMEOUT = 60000  // 60 seconds
```

---

## Environment Variables

```bash
# Override production URL
export PRODUCTION_URL="https://staging.z-beam.com"
npm run deploy:full

# Override propagation wait time
export PROPAGATION_WAIT=60
npm run deploy:full

# Disable post-validation report
npm run deploy:full -- --no-report
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy with full validation
        run: npm run deploy:full
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      
      - name: Upload validation report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: production-validation-report
          path: production-validation-report.html
```

---

## Best Practices

### ✅ DO

- Use `deploy:full` for production deployments
- Review validation reports after deployment
- Fix warnings and failed tests promptly
- Keep git hooks enabled
- Run local validation before pushing
- Monitor production metrics

### ❌ DON'T

- Skip validation for production deploys
- Use `--no-verify` regularly
- Ignore validation warnings
- Deploy without reviewing changes
- Skip post-deployment validation

---

## Performance Metrics

| Phase | Duration | Async |
|-------|----------|-------|
| Pre-commit hook | 1-2s | No |
| Pre-push hook | 30-90s | No |
| Pre-deployment validation | 3-7min | No |
| Build | 2-4min | No |
| Deploy | 1-2min | No |
| Propagation wait | 30s | Yes |
| Post-deployment validation | 10-30s | No |
| Report generation | 5-10s | No |
| **Total (full lifecycle)** | **7-15min** | - |
| **Total (standard)** | **6-13min** | - |

---

## Summary

**Git Hooks:**
- ✅ Pre-commit: Automatic (freshness updates)
- ✅ Pre-push: Automatic (7 validations)

**Deployment:**
- ✅ Pre-deployment: Automatic (20+ validations)
- ✅ Post-deployment: Manual or via `deploy:full`

**Recommended Commands:**
- `npm run deploy:full` - Complete lifecycle (recommended)
- `npm run deploy` - Standard deploy
- `npm run validate:production:full` - Manual validation with report

**Key Files:**
- `.git/hooks/pre-commit` - Freshness updates
- `.git/hooks/pre-push` - Quick validation
- `scripts/deployment/deploy-with-validation.sh` - Pre-deploy validation
- `scripts/deployment/deploy-and-validate.sh` - Full lifecycle
- `scripts/validation/post-deployment/validate-production.js` - Production validation
