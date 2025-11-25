# Validation v2.0 - Quick Reference

## 🚀 Common Commands

```bash
# Before pushing code
npm run check                # Fast quality checks (~35s)

# Before deploying
npm run validate:content     # Full content validation
npm run test:all            # All tests

# Deploy
npm run deploy              # Full deployment to production
npm run deploy:monitored    # Deployment with detailed monitoring & logs
npm run deploy:preview      # Preview deployment

# Post-deploy
npm run validate:production # Validate live site (simple, fast)
npm run validate:production:enhanced  # Full validation with external APIs

# Cache management
npm run cache:stats         # Check cache effectiveness
npm run cache:clear         # Clear all caches

# Log management
npm run logs:view           # View recent terminal logs
npm run logs:clean          # Clean old logs (>7 days)
```

## ⚡ What Changed

### New Commands
- `npm run check` - Replaced `validate:all` and `validate:fast`
- `npm run cache:clear` - Clear validation caches
- `npm run cache:stats` - Show cache hit rates

### Removed Commands
- `validate:all` → Use `check`
- `validate:fast` → Use `check`
- `deploy:prod` → Use `deploy`
- `deploy:skip` → Use `deploy:preview`

## 🎯 Validation Layers

### 1. Pre-Commit (Automatic)
- Runs on `git commit`
- Updates timestamps
- Never blocks

### 2. Pre-Push (Fast, ~35s)
- Runs on `git push`
- Type check, lint, tests, naming, metadata
- **Runs in parallel**
- Skip with: `git push --no-verify`

### 3. CI Build (~3min)
- Runs on Vercel deployment
- Content validation + build + URL validation
- **3.3x faster than before**

### 4. Article Page Generation Filter (Automatic)
- **Incomplete YAML files are automatically excluded from website**
- Required fields: name, title, material_description, category, images, author
- Materials with missing fields will not generate article pages
- Warnings logged during build: `Skipping incomplete YAML: {filename}`
- Fix by completing all required metadata fields

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

## 🐛 Troubleshooting

### Validation Failing?

```bash
# 1. Read the error - includes fix suggestions
#    Example: ❌ Missing field → 💡 npm run fix:frontmatter

# 2. Run with verbose mode
VERBOSE=1 npm run validate:content

# 3. Clear cache and retry
npm run cache:clear
npm run validate:content

# 4. Check if dev server needed
npm run dev &
sleep 10
npm run validate:jsonld
```

### Pre-push Hook Failing?

```bash
# Debug which check fails
npm run check --verbose

# Skip for emergency (use sparingly)
git push --no-verify
```

### Slow Validation?

```bash
# Check cache hit rates
npm run cache:stats

# Expected rates after first run:
# - Frontmatter: ~85%
# - Naming: ~90%
# - Images: ~95%
```

## 📊 Performance

### Before vs After

| Stage | Old | New | Speedup |
|-------|-----|-----|---------|
| Pre-push | 2.5min | 35s | **4.3x** |
| Deploy | 10min | 3min | **3.3x** |

### Time Saved

**Per developer per day:**
- 10 pushes: ~19 minutes saved
- 3 deploys: ~21 minutes saved
- **Total: ~40 minutes saved/day**

## 🔧 Configuration

Edit `scripts/validation/config.js` to adjust thresholds:

```javascript
module.exports = {
  content: {
    maxFrontmatterWarnings: 150,
    maxNamingWarnings: 135
  },
  performance: {
    targetLCP: 2500,  // ms
    targetFID: 100
  }
};
```

## 🌍 Environment Variables

```bash
# Skip cache
NO_CACHE=1 npm run validate:content

# Verbose output
VERBOSE=1 npm run check

# Custom base URL
BASE_URL=https://staging.z-beam.com npm run validate:production

# Force CI mode
CI=1 npm run check
```

## 📁 New Files

```
scripts/validation/
  config.js              # 🆕 Central config
  lib/                   # 🆕 Shared infrastructure
    environment.js       # Environment detection
    exitCodes.js         # Standard exit codes
    cache.js             # Validation caching
    parallel.js          # Parallel execution
    run-checks.js        # Quick checks orchestrator
    run-content-validation.js  # Content orchestrator

scripts/deployment/
  deploy.sh              # 🆕 Simplified (80 lines vs 509)

.validation-cache/       # 🆕 Cache directory (gitignored)
```

## ✅ Best Practices

1. **Run `check` before pushing**
   ```bash
   npm run check && git push
   ```

2. **Clear cache when updating validation logic**
   ```bash
   npm run cache:clear
   ```

3. **Monitor cache effectiveness**
   ```bash
   npm run cache:stats
   ```

4. **Test deployments with preview first**
   ```bash
   npm run deploy:preview
   # Check preview URL
   npm run deploy
   ```

5. **Fix warnings proactively**
   ```bash
   VERBOSE=1 npm run validate:content
   # Address warnings before they become errors
   ```

## 🆘 Support

1. Check error message (includes fix suggestions)
2. Check `scripts/validation/README.md`
3. Check validation config: `scripts/validation/config.js`
4. Clear cache and retry: `npm run cache:clear`
5. Ask team if stuck

## 📚 Full Documentation

- **Complete Guide**: `scripts/validation/README.md`
- **Implementation Summary**: `VALIDATION_V2_SUMMARY.md`
- **Configuration**: `scripts/validation/config.js`

---

**Version:** 2.0 | **Status:** Production Ready | **Performance:** 4.3x faster pre-push, 3.3x faster deploys
