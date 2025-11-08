# Git Hooks Quick Reference

Fast lookup for git hooks behavior in this project.

---

## Pre-Commit Hook (< 5 seconds)

**What it does:**
- Updates content freshness timestamps
- Runs automatically on every `git commit`

**Files affected:**
- `content/frontmatter/*.yaml` (5-10 files per commit)
- `content/.freshness-updates.json` (tracking)

**Frequency:** Only runs if 7+ days since last run

**Skip:**
```bash
git commit --no-verify -m "message"
```

---

## Pre-Push Hook (< 30 seconds) 🆕

**What it does:**
- Type checking (TypeScript)
- Linting (ESLint)
- Unit tests
- File naming conventions
- Metadata sync

**When:** Every `git push`

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
```

**Skip (emergency only):**
```bash
git push --no-verify
```

---

## Pre-Deployment Validation (2-3 minutes)

**What it does:**
- All pre-push checks +
- Full test suite
- Production build
- JSON-LD validation
- Component audits
- And 15+ more checks

**When:** Before production deployment

**Run:**
```bash
./scripts/deployment/deploy-with-validation.sh
```

**Skip (document reason):**
```bash
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

---

## Quick Commands

### Check if hooks are active
```bash
ls -la .git/hooks/pre-commit
ls -la .git/hooks/pre-push
```

### Temporarily disable all hooks
```bash
git config core.hooksPath /dev/null  # Disable
git config --unset core.hooksPath     # Re-enable
```

### Test pre-push hook manually
```bash
.git/hooks/pre-push
```

### View hook contents
```bash
cat .git/hooks/pre-commit
cat .git/hooks/pre-push
```

---

## Troubleshooting

### "Permission denied" error
```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

### Hook not running
```bash
# Check git config
git config core.hooksPath

# Should be empty or point to .git/hooks
```

### Pre-push fails on specific check
```bash
# Run individual checks
npm run type-check
npm run lint
npm run test:unit
npm run validate:naming
npm run validate:metadata
```

---

## Philosophy

**Validation tiers = Fast development + High quality**

- **Tier 1 (Pre-Commit):** Instant, content maintenance
- **Tier 2 (Pre-Push):** 30 seconds, code quality
- **Tier 3 (Pre-Deploy):** 2-3 minutes, comprehensive
- **Tier 4 (CI/CD):** Automatic, deep analysis

Each tier catches issues at the right time without disrupting workflow.

---

## See Also

- **Full Documentation:** `docs/VALIDATION_STRATEGY.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Test Scripts:** `package.json`
