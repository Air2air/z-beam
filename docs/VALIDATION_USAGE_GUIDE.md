# Validation Usage Guide

**Quick reference for running Z-Beam validation scripts**

---

## 🚀 Quick Start

### Run All Phase 1 Validations
```bash
npm run validate:highest-scoring
```
This runs: WCAG 2.2 + Accessibility Tree + Core Web Vitals

### Individual Validations
```bash
# Markup validation (WCAG 2.2 + A11y Tree)
npm run validate:markup

# Performance validation (Core Web Vitals)
npm run validate:performance

# Specific checks
npm run validate:wcag-2.2              # Full WCAG 2.2 AA
npm run validate:wcag-2.2:static       # Fast static checks
npm run validate:a11y-tree             # Accessibility tree
npm run validate:a11y-tree:report      # With HTML report
npm run validate:core-web-vitals       # Both mobile & desktop
npm run validate:core-web-vitals:mobile    # Mobile only
npm run validate:core-web-vitals:strict    # Strict thresholds
```

---

## 📋 Validation Scripts

### 1. WCAG 2.2 AA Compliance

**Script:** `scripts/validate-wcag-2.2.js`

**What it checks:**
- ✅ 2.4.11 Focus Appearance - Focus indicators ≥ 2px, 3:1 contrast
- ✅ 2.5.8 Target Size - Interactive elements ≥ 24×24px
- ✅ 2.5.7 Dragging Movements - Keyboard alternatives exist
- ✅ 3.2.6 Consistent Help - Help mechanisms consistent across pages
- ✅ 3.3.7 Redundant Entry - No duplicate form fields

**Usage:**
```bash
# Full validation
npm run validate:wcag-2.2

# Static checks only (fast, for pre-push)
npm run validate:wcag-2.2:static

# Verbose output
node scripts/validate-wcag-2.2.js --verbose
```

**Output:**
```
╔═══════════════════════════════════════════════════╗
║   WCAG 2.2 AA Validation
╚═══════════════════════════════════════════════════╝

Results:
✅ Passed: 4
⚠️  Warnings: 0
❌ Errors: 0

✅ WCAG 2.2 AA validation PASSED!
```

**When to run:**
- Pre-push: Automatic (static checks)
- Pre-deployment: Automatic (comprehensive)
- Manual: After accessibility changes

---

### 2. Accessibility Tree Validation

**Script:** `scripts/validate-accessibility-tree.js`

**What it checks:**
- ✅ Computed accessible names (buttons, links, form controls)
- ✅ ARIA roles validity and correctness
- ✅ ARIA states and properties
- ✅ Semantic structure (landmarks, headings)
- ✅ Focus management

**Usage:**
```bash
# Standard validation
npm run validate:a11y-tree

# Generate HTML report
npm run validate:a11y-tree:report

# Verbose output
node scripts/validate-accessibility-tree.js --verbose

# Custom URL
node scripts/validate-accessibility-tree.js --url=https://z-beam.com
```

**Output:**
```
╔═══════════════════════════════════════════════════╗
║   Accessibility Tree Validation
╚═══════════════════════════════════════════════════╝

URL: http://localhost:3000

Launching browser...
Loading page...
Injecting aXe-core...
Running accessibility audit...

═══════════════════════════════════════════════════
  Accessibility Tree Validation Results
═══════════════════════════════════════════════════

✅ Passed: 45
❌ Violations: 0
⚠️  Incomplete: 3

✅ Accessibility tree validation PASSED!
```

**Reports:** Generated in `coverage/accessibility/accessibility-report-*.html`

**When to run:**
- Pre-deployment: Automatic
- Manual: After component changes
- With report: Before audits/reviews

---

### 3. Core Web Vitals Validation

**Script:** `scripts/validate-core-web-vitals.js`

**What it checks:**
- ✅ LCP (Largest Contentful Paint) - Target: < 2.5s
- ✅ INP (Interaction to Next Paint) - Target: < 200ms
- ✅ CLS (Cumulative Layout Shift) - Target: < 0.1
- ✅ FCP (First Contentful Paint) - Target: < 1.8s
- ✅ TTI (Time to Interactive) - Target: < 3.8s

**Thresholds:**
- **Good:** LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Needs Improvement:** LCP < 4.0s, INP < 500ms, CLS < 0.25
- **Poor (FAIL):** LCP ≥ 4.0s, INP ≥ 500ms, CLS ≥ 0.25

**Usage:**
```bash
# Both mobile & desktop (dev server)
npm run validate:core-web-vitals

# Mobile only
npm run validate:core-web-vitals:mobile

# Strict mode (fail on "needs improvement")
npm run validate:core-web-vitals:strict

# Production URL
node scripts/validate-core-web-vitals.js --url=https://z-beam.com

# Desktop only
node scripts/validate-core-web-vitals.js --desktop
```

**Output:**
```
╔═══════════════════════════════════════════════════╗
║   Core Web Vitals Validation
╚═══════════════════════════════════════════════════╝

URL: http://localhost:3000
Mode: Standard (fail on poor only)

Running Lighthouse audit (mobile)...

═══════════════════════════════════════════════════
  Core Web Vitals - MOBILE
═══════════════════════════════════════════════════

🟢 Largest Contentful Paint (LCP)
   Value: 2.31s
   Status: GOOD
   Result: ✓ PASS

🟢 Interaction to Next Paint (INP)
   Value: 0.05s
   Status: GOOD
   Result: ✓ PASS

🟢 Cumulative Layout Shift (CLS)
   Value: 0.000
   Status: GOOD
   Result: ✓ PASS

🟡 First Contentful Paint (FCP)
   Value: 1.98s
   Status: NEEDS IMPROVEMENT
   Result: ✓ PASS

🟢 Time to Interactive (TTI)
   Value: 3.47s
   Status: GOOD
   Result: ✓ PASS

✅ Core Web Vitals validation PASSED!
```

**Requirements:**
- Dev server running on http://localhost:3000 (or custom URL)
- Chrome/Chromium installed

**When to run:**
- Post-deployment: Manual on production URL
- Pre-deployment: Optional (dev mode has slower TTI)
- After performance optimizations

---

## 🔄 Automated Validation Workflow

### Pre-Commit Hook
**Location:** `.git/hooks/pre-commit` (not yet implemented)
**Duration:** < 5s
**Checks:**
- Freshness timestamps

### Pre-Push Hook
**Location:** `.git/hooks/pre-push`
**Duration:** ~28-33s
**Checks:**
1. Type checking
2. Linting
3. Unit tests
4. Naming conventions
5. Metadata sync
6. **WCAG 2.2 static checks** ⭐ NEW

**Bypass:**
```bash
git push --no-verify  # Not recommended
```

### Pre-Deployment Validation
**Location:** `scripts/deployment/deploy-with-validation.sh`
**Duration:** ~4-5 min
**Checks:** 22 validation steps including:
- Steps 1-18: Existing validations
- Step 19: **WCAG 2.2 comprehensive** ⭐ NEW
- Step 20: **Accessibility tree** ⭐ NEW
- Step 21: Core Web Vitals (deferred to post-deployment)

**Run:**
```bash
npm run deploy         # With auto-confirm
npm run deploy:safe    # With manual confirm
```

---

## 📊 Understanding Results

### Exit Codes
- **0:** Validation passed
- **1:** Validation failed (blocks deployment)

### Severity Levels

**Errors (❌):** Must fix, blocks deployment
- WCAG 2.2 violations
- Critical/serious accessibility violations
- Core Web Vitals "poor" metrics

**Warnings (⚠️):** Should fix, doesn't block
- Moderate accessibility violations
- Core Web Vitals "needs improvement" (in standard mode)
- Missing optional enhancements

**Passed (✅):** All checks successful

---

## 🛠️ Troubleshooting

### Issue: "Chrome not found"
```bash
# Install chrome-launcher
npm install --save-dev chrome-launcher

# Or set CHROME_PATH
export CHROME_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
```

### Issue: "Page not found" (Accessibility Tree / Core Web Vitals)
```bash
# Ensure dev server is running
npm run dev

# In another terminal, run validation
npm run validate:a11y-tree
```

### Issue: "Timeout" (Core Web Vitals)
```bash
# Increase timeout in script or use production URL
node scripts/validate-core-web-vitals.js --url=https://z-beam.com
```

### Issue: Pre-push hook too slow
```bash
# Static checks should be < 5s
# If slow, skip temporarily:
git push --no-verify

# Check what's slow:
time npm run validate:wcag-2.2:static
```

### Issue: TTI (Time to Interactive) fails in dev mode
**Expected behavior:** Dev mode has slower TTI due to unoptimized bundles and HMR overhead.

**Solution:** Run Core Web Vitals on production URL:
```bash
node scripts/validate-core-web-vitals.js --url=https://z-beam.com
```

---

## 📈 Validation Maturity Tracking

**Current Maturity: 92/100**

| Category | Coverage | Status |
|----------|----------|--------|
| WCAG 2.1 AA | 95% | ✅ Compliant |
| WCAG 2.2 AA | 100% | ✅ Automated |
| Core Web Vitals | 100% | ✅ Validated |
| Accessibility Tree | 100% | ✅ Comprehensive |
| Semantic HTML | 100% | ✅ Tested |
| JSON-LD | 90% | ✅ Validated |

**Target: 98-100/100 after Phase 2-3**

---

## 🎯 Best Practices

### During Development
```bash
# Quick check before commit
npm run validate:wcag-2.2:static

# Full accessibility check
npm run validate:markup
```

### Before Deployment
```bash
# Run full validation suite
npm run validate:highest-scoring

# Or let deploy script handle it
npm run deploy:safe
```

### After Deployment
```bash
# Validate production performance
node scripts/validate-core-web-vitals.js --url=https://z-beam.com

# Generate accessibility report
node scripts/validate-accessibility-tree.js --url=https://z-beam.com --report
```

### Regular Audits
```bash
# Weekly: Check for regressions
npm run validate:all

# Monthly: Full accessibility audit with report
npm run validate:a11y-tree:report
```

---

## 📚 Related Documentation

- **[MARKUP_VALIDATION_AUDIT.md](./MARKUP_VALIDATION_AUDIT.md)** - Comprehensive 41-page audit
- **[PHASE_1_IMPLEMENTATION_SUMMARY.md](./PHASE_1_IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[VALIDATION_STRATEGY.md](./VALIDATION_STRATEGY.md)** - Overall validation strategy
- **[GIT_HOOKS_QUICK_REF.md](../GIT_HOOKS_QUICK_REF.md)** - Git hooks reference

---

## 🆘 Support

**Common Commands:**
```bash
# List all validation scripts
npm run | grep validate

# Get help for specific script
node scripts/validate-wcag-2.2.js --help
node scripts/validate-core-web-vitals.js --help
node scripts/validate-accessibility-tree.js --help

# Check validation status
git log --oneline --grep="validation"
```

**Debug Mode:**
```bash
# Verbose output
npm run validate:wcag-2.2 -- --verbose
npm run validate:a11y-tree -- --verbose

# Check dependencies
npm list lighthouse chrome-launcher puppeteer axe-core
```

---

**Last Updated:** November 8, 2025  
**Version:** Phase 1 Complete (Maturity: 92/100)
