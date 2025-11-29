# Validation Quick Reference (v2.1)

**Last Updated:** November 29, 2025  
**Status:** Production Ready + SEO Consolidation Complete

---

## 🚀 Common Commands

### SEO Validation (Updated Nov 29, 2025)
```bash
# Master SEO Infrastructure Validator (USE THIS!)
npm run validate:seo-infrastructure

# Quick alias (same as above)
npm run validate:seo

# Lighthouse integration
npm run validate:seo:lighthouse

# Schema content intelligence
npm run validate:seo:richness
```

### Content Validation
```bash
# All content structure checks
npm run validate:content

# Individual checks
npm run validate:frontmatter
npm run validate:metadata
npm run validate:naming
npm run validate:breadcrumbs
```

### Performance & Accessibility
```bash
# Core Web Vitals
npm run validate:performance

# WCAG 2.2 Compliance
npm run validate:a11y
```

### Production Testing
```bash
# Comprehensive production validation
npm run validate:production

# Simple production check
npm run validate:production:simple

# Enhanced production suite
npm run validate:production:enhanced
```

### Comprehensive Validation (NEW)
```bash
# Run all validators (content + SEO + a11y + performance)
npm run validate:all
```

### Development Workflow
```bash
# Before pushing code
npm run check                # Fast quality checks (~35s)

# Deploy
npm run deploy              # Full deployment to production
npm run deploy:monitored    # Deployment with detailed monitoring & logs
npm run deploy:preview      # Preview deployment
```

---

## ❌ Deprecated Commands (Do Not Use)

These commands are **deprecated** as of November 29, 2025:

```bash
# ❌ OLD (now shows deprecation warning)
npm run validate:jsonld:syntax
npm run validate:jsonld:rendering

# ✅ NEW (use instead)
npm run validate:seo-infrastructure
```

**Why deprecated?** Functionality absorbed by the comprehensive SEO Infrastructure validator.

---

## 🎯 Validation Workflow

### 📋 When to Run What

| Situation | Command | Time | Required |
|-----------|---------|------|----------|
| Before commit | Automatic (pre-commit hook) | <1s | Optional |
| Before push | Automatic (pre-push hook) | 30s | Yes |
| During development | `npm run validate:seo-infrastructure` | 1min | Recommended |
| Before deployment | Automatic (prebuild) | 2min | Yes |
| After deployment | Automatic (postdeploy) | 3min | Yes |
| Full audit | `npm run validate:all` | 5min | Optional |

### Development Workflow
```bash
# 1. Make changes
# 2. pre-commit hook runs automatically (if 7+ days since last)
# 3. Test locally
npm run validate:seo-infrastructure  # Optional but recommended

# 4. Commit changes
git commit -m "Your changes"

# 5. Push (pre-push hook validates automatically)
git push  # Content + types + lint + SEO (if dev server running)
```

### Deployment Workflow
```bash
# 1. Push to main branch
git push origin main

# 2. prebuild runs automatically
#    - Content validation
#    - Dataset generation

# 3. Build completes

# 4. postbuild runs automatically
#    - URL validation

# 5. Deployment completes

# 6. postdeploy runs automatically
#    - Production validation
```

---

## 🔧 Git Hooks (Updated Nov 29, 2025)

### pre-commit
- **Runs:** Every 7 days minimum
- **Purpose:** Automatic freshness timestamp updates
- **Blocking:** No (silent operation)

### pre-push (Updated)
- **Runs:** Every push attempt
- **Purpose:** Fast quality checks with clear progress
  - Content validation (required)
  - TypeScript type checking (required)
  - ESLint (warning only)
  - SEO Infrastructure (optional if dev server running)
- **Blocking:** Yes (fails push if required checks fail)
- **Bypass:** `git push --no-verify` (not recommended)
- **New:** Shows detailed progress with colored output

### post-push
- **Runs:** After successful push (main branch only)
- **Purpose:** Deployment monitoring
- **Blocking:** No

---

## 🔍 Testing Production vs Development

### Development (localhost)
```bash
# Default: Tests http://localhost:3000
npm run validate:seo-infrastructure

# Requires dev server running
npm run dev
```

### Production (live site)
```bash
# Option 1: Use production validator
npm run validate:production

# Option 2: Set BASE_URL for SEO Infrastructure validator
BASE_URL=https://www.z-beam.com npm run validate:seo-infrastructure
```

---

## 📊 Validation Categories

### Master Validators (Use These)
- ✅ `validate:seo-infrastructure` - All 6 SEO categories (master validator)
- ✅ `validate:seo:lighthouse` - Lighthouse + HTTPS checks
- ✅ `validate:seo:richness` - Content intelligence
- ✅ `validate:production` - Post-deployment comprehensive

### Specialized Validators (Keep)
- ✅ `validate:urls` - URL consistency checks
- ✅ `validate:performance` - Core Web Vitals
- ✅ `validate:a11y` - WCAG 2.2 accessibility
- ✅ `validate:frontmatter` - Content structure
- ✅ `validate:metadata` - Metadata consistency
- ✅ `validate:naming` - Naming conventions

### Deprecated (Archived)
- ❌ `validate:jsonld:syntax` → Use `validate:seo-infrastructure`
- ❌ `validate:jsonld:rendering` → Use `validate:seo-infrastructure`

---

## 💾 Caching

Validations now cache unchanged files:

**First run:** 4 minutes  
**Cached run:** 1 minute

**Clear if needed:**
```bash
npm run cache:clear
```

**Skip cache (always fresh):**
```bash
NO_CACHE=1 npm run validate:content
```

---

## 🐛 Troubleshooting

### Pre-push hook failing?
```bash
# View the specific error messages
git push

# Fix the errors, then push again
# Or bypass (not recommended):
git push --no-verify
```

### SEO validator requires dev server
```bash
# Start dev server first
npm run dev

# Then run validator
npm run validate:seo-infrastructure
```

### Production validation fails
```bash
# Check if site is live
curl -I https://www.z-beam.com

# View detailed output
npm run validate:production:enhanced
```

### Slow validation?
```bash
# Check cache hit rates
npm run cache:stats

# Expected rates after first run:
# - Frontmatter: ~85%
# - Naming: ~90%
# - Images: ~95%
```

---

## 📚 Documentation

- **Consolidation Plan:** `VALIDATION_CONSOLIDATION_PLAN.md` (NEW)
- **SEO Infrastructure:** `docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md`
- **Validation Library:** `scripts/validation/README.md`
- **Implementation Summary:** `VALIDATION_V2_SUMMARY.md`

---

## ✨ Recent Changes (November 29, 2025)

### ✅ What Changed
1. **pre-push hook updated** - Now shows clear categories and detailed progress
2. **npm scripts reorganized** - Grouped by purpose (content, SEO, performance)
3. **validate:seo alias** - Now points to `validate:seo-infrastructure`
4. **Deprecated scripts** - `jsonld:syntax` and `jsonld:rendering` show warnings
5. **New validate:all** - Comprehensive validation suite

### 🎯 Benefits
- Clearer validation workflow
- Better organized scripts
- Reduced redundancy (~10% script count reduction)
- Master SEO Infrastructure validator as primary tool
- Eliminated duplicate JSON-LD validators

---

**Version:** 2.1 | **Performance:** 4.3x faster pre-push, 3.3x faster deploys | **Status:** SEO Consolidation Complete
