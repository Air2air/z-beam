# Validation Strategy

**Date:** November 8, 2025  
**Purpose:** Tiered validation approach to catch issues early without disrupting developer workflow

---

## Philosophy

**Fast feedback at the right time** - validation should be:
- ✅ **Proportional** to the action's impact
- ✅ **Fast enough** to not disrupt flow
- ✅ **Comprehensive** before critical operations

---

## Validation Tiers

### Tier 1: Pre-Commit Hook (< 5 seconds)
**When:** Every `git commit`  
**Goal:** Maintain content freshness without blocking

```bash
✓ Update freshness timestamps (content/frontmatter/*.yaml)
✓ Incremental updates (5-10 files per commit)
✓ Runs only if 7+ days since last run
✓ Skips if frontmatter files are being committed
```

**Location:** `.git/hooks/pre-commit`

**Why minimal?**
- Commits are frequent (10-50 per day)
- Developers need fast feedback loops
- WIP commits should be allowed
- Heavy validation here = developers bypass with `--no-verify`

---

### Tier 2: Pre-Push Hook (< 30 seconds) 🆕
**When:** Every `git push`  
**Goal:** Catch breaking changes before they reach remote

```bash
✓ TypeScript type checking (npm run type-check)
✓ ESLint validation (npm run lint)
✓ Critical unit tests (npm run test:unit)
✓ File naming conventions (npm run validate:naming)
✓ Metadata sync (npm run validate:metadata)
```

**Location:** `.git/hooks/pre-push`

**Why these checks?**
- Fast enough to run frequently (< 30s)
- Catches 80% of common errors
- Prevents broken code in remote repository
- Runs less frequently than commits (1-5 times per day)

**Bypass if needed:**
```bash
git push --no-verify  # Emergency only
```

---

### Tier 3: Pre-Deployment (2-3 minutes)
**When:** Before production deployment  
**Goal:** Comprehensive validation before users see changes

```bash
# All Tier 2 checks, plus:
✓ Full test suite (unit, integration, component)
✓ Production build validation
✓ JSON-LD schema validation
✓ Sitemap structure checks
✓ Content integrity validation
✓ Component audits
✓ Build artifact checks
✓ URL validation
✓ Dataset generation
```

**Location:** `scripts/deployment/deploy-with-validation.sh`

**Run with:**
```bash
./scripts/deployment/deploy-with-validation.sh
```

**Skip validations (emergency):**
```bash
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

---

### Tier 4: CI/CD (Future - 5-10 minutes)
**When:** Automatic on every push to main  
**Goal:** Ultimate safety net with deep analysis

```bash
# All Tier 3 checks, plus:
□ Visual regression tests (Percy/Chromatic)
□ Performance benchmarks (Lighthouse CI)
□ Security scans (npm audit, Snyk)
□ Dependency updates check
□ Bundle size analysis
□ Accessibility audits (Pa11y)
□ Cross-browser testing
```

**Status:** 🔄 Planned for future implementation

---

## Validation Matrix

| Check | Pre-Commit | Pre-Push | Pre-Deploy | CI/CD |
|-------|------------|----------|------------|-------|
| **Freshness timestamps** | ✅ | - | - | - |
| **Type checking** | - | ✅ | ✅ | ✅ |
| **Linting** | - | ✅ | ✅ | ✅ |
| **Unit tests** | - | ✅ | ✅ | ✅ |
| **Naming conventions** | - | ✅ | ✅ | ✅ |
| **Metadata sync** | - | ✅ | ✅ | ✅ |
| **Integration tests** | - | - | ✅ | ✅ |
| **Component tests** | - | - | ✅ | ✅ |
| **Production build** | - | - | ✅ | ✅ |
| **JSON-LD validation** | - | - | ✅ | ✅ |
| **Full test suite** | - | - | ✅ | ✅ |
| **Visual regression** | - | - | - | 🔄 |
| **Performance tests** | - | - | - | 🔄 |
| **Security scans** | - | - | - | 🔄 |

---

## Time Estimates

| Tier | Duration | Frequency | Daily Impact |
|------|----------|-----------|--------------|
| Pre-Commit | < 5s | 30x/day | 2.5 min |
| Pre-Push | < 30s | 5x/day | 2.5 min |
| Pre-Deploy | 2-3 min | 1-2x/day | 5 min |
| CI/CD | 5-10 min | Per push | Auto |
| **Total** | - | - | **~10 min/day** |

Compare to: Running all checks on every commit = **90 min/day** ❌

---

## Best Practices

### For Developers

1. **Commit often** - Pre-commit is instant
2. **Push when stable** - Pre-push catches issues early
3. **Deploy confidently** - Pre-deployment ensures quality

### For Emergency Situations

```bash
# Skip pre-push (use sparingly)
git push --no-verify

# Skip pre-deployment (documented reason required)
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

### For New Team Members

The hooks are **automatically active** after cloning:
```bash
git clone <repo>
cd z-beam
# Hooks are already in .git/hooks/ ✅
```

---

## Hook Management

### Check hook status
```bash
ls -la .git/hooks/
```

### Temporarily disable all hooks
```bash
git config core.hooksPath /dev/null  # Disable
git config --unset core.hooksPath     # Re-enable
```

### Update hooks
Hooks are in `.git/hooks/` and can be edited directly. Common updates:
- **pre-commit**: Adjust freshness update frequency
- **pre-push**: Add/remove validation steps
- **pre-deployment**: Modify validation script

---

## Validation Script Details

### Pre-Push Hook
**File:** `.git/hooks/pre-push`

**Checks:**
1. Type checking - Catches TypeScript errors
2. Linting - Enforces code style
3. Unit tests - Validates core logic
4. Naming conventions - Ensures file structure
5. Metadata sync - Checks content integrity

**Output:**
```
🔍 Running pre-push validation...

▶ Type checking
  ✓ Passed
▶ Linting
  ✓ Passed
▶ Unit tests
  ✓ Passed
▶ Naming conventions
  ✓ Passed
▶ Metadata sync
  ✓ Passed

✅ All pre-push validations passed!
ℹ️  Full validation will run before deployment
```

### Pre-Deployment Script
**File:** `scripts/deployment/deploy-with-validation.sh`

**Sections:**
1. Git status check
2. Content validation (naming, metadata)
3. Code quality (type-check, lint)
4. Sitemap structure
5. Content integrity
6. JSON-LD validation
7. Component audits
8. Redirects validation
9. Unit tests
10. Integration tests
11. Component tests
12. Component enhancements
13. Sitemap tests
14. Deployment tests
15. Production build
16. Build artifacts
17. Post-build validation
18. Dataset generation

---

## Troubleshooting

### Pre-push hook fails
```bash
# See detailed error output
git push 2>&1 | tee push-error.log

# Fix issues, then retry
git push
```

### Pre-deployment fails
```bash
# Check specific validation
npm run type-check
npm run test:unit

# Deploy with skip (document reason)
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

### Hook not running
```bash
# Check if executable
ls -la .git/hooks/pre-push

# Make executable
chmod +x .git/hooks/pre-push
```

---

## Migration from Old Approach

### Before (Single-Tier)
- ❌ All checks at deployment (2-3 min wait)
- ❌ Issues discovered late
- ❌ Broken code in repository

### After (Four-Tier)
- ✅ Fast commits (< 5s)
- ✅ Early error detection (pre-push)
- ✅ Confident deployments (comprehensive validation)
- ✅ Clean repository (broken code caught early)

---

## Related Documentation

- **Pre-Commit Hook:** `.git/hooks/pre-commit`
- **Pre-Push Hook:** `.git/hooks/pre-push`
- **Deployment Script:** `scripts/deployment/deploy-with-validation.sh`
- **Test Scripts:** `package.json` (scripts section)
- **Git Integration:** `DEPLOYMENT.md`

---

## Summary

**Tiered validation = Fast development + High quality**

- Tier 1 (Pre-Commit): Content maintenance, instant
- Tier 2 (Pre-Push): Code quality, 30 seconds
- Tier 3 (Pre-Deploy): Full validation, 2-3 minutes
- Tier 4 (CI/CD): Deep analysis, automatic

Each tier catches issues at the right time without disrupting workflow. ✨
