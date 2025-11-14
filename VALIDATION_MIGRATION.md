# Validation v2.0 - Migration Checklist

## ✅ For All Developers

### 1. Update Git (Done Automatically)
- [x] Pre-push hook updated to use parallel execution
- [x] Cache directory added to `.gitignore`

### 2. Learn New Commands
Replace old commands with new ones:

```bash
# OLD → NEW
validate:all          → check
validate:fast         → check
deploy:prod           → deploy
test:comprehensive    → test:all
```

**Action:** Update any local scripts or aliases

### 3. Understand Cache
```bash
# Check cache effectiveness
npm run cache:stats

# Clear if needed (rare)
npm run cache:clear

# Skip cache temporarily
NO_CACHE=1 npm run validate:content
```

**First run will be slower (populating cache), subsequent runs much faster**

## ✅ For CI/CD Maintainers

### 1. Update GitHub Actions / GitLab CI

**Old:**
```yaml
- run: npm run validate:all
- run: npm run test:comprehensive
- run: npm run deploy:prod
```

**New:**
```yaml
- run: npm run check
- run: npm run test:all
- run: npm run deploy
```

### 2. Environment Variables

Ensure CI sets:
```yaml
env:
  CI: true                    # Disables caching, adjusts timeouts
  BASE_URL: ${{ secrets.STAGING_URL }}  # For validation
```

### 3. Update Deployment Scripts

**Old:**
```bash
npm run validate:all && npm run build && vercel --prod
```

**New:**
```bash
npm run deploy  # Handles everything
```

## ✅ For Script Maintainers

### 1. Update Custom Validation Scripts

**Old pattern:**
```javascript
const { exec } = require('child_process');
exec('npm run validate:naming', (error) => {
  if (error) process.exit(1);
});
```

**New pattern:**
```javascript
const { ValidationResult } = require('./scripts/validation/lib/exitCodes');
const { ValidationCache } = require('./scripts/validation/lib/cache');
const { requiresServer } = require('./scripts/validation/lib/environment');

const result = new ValidationResult('My Validation');
const cache = new ValidationCache('my-validation');

// Your validation logic with caching
result.exit();
```

### 2. Use Central Configuration

**Old:**
```javascript
const MAX_WARNINGS = 150;  // Hardcoded
```

**New:**
```javascript
const config = require('./scripts/validation/config');
const { maxFrontmatterWarnings } = config.content;
```

### 3. Add Environment Detection

**Old:**
```javascript
// No environment awareness
await validateWithLocalhost();
```

**New:**
```javascript
const { requiresServer } = require('./lib/environment');
await requiresServer('My validation');  // Skips in CI
await validateWithLocalhost();
```

## ✅ Testing Checklist

### Local Testing

```bash
# 1. Test quick checks
npm run check
# ✓ Should complete in ~35 seconds
# ✓ Should show parallel execution

# 2. Test content validation
npm run validate:content
# ✓ First run: ~4 minutes
# ✓ Second run: ~1 minute (cached)

# 3. Check cache stats
npm run cache:stats
# ✓ Should show hit rates after second run

# 4. Test pre-push
git commit -m "test"
git push
# ✓ Should run checks automatically
# ✓ Should complete in ~35 seconds

# 5. Test cache clearing
npm run cache:clear
npm run validate:content
# ✓ Should be slower (no cache hits)
```

### CI Testing

```bash
# 1. Test in CI mode
CI=1 npm run check
# ✓ Should disable caching
# ✓ Should skip localhost-dependent checks

# 2. Test deployment
npm run deploy:preview
# ✓ Should complete in ~3 minutes
# ✓ Should run all validations

# 3. Test production validation
BASE_URL=https://your-site.com npm run validate:production
# ✓ Should validate live site
# ✓ Should check all critical pages
```

## ✅ Documentation Updates

### Update Project README

Add section:
```markdown
## Validation

Quick quality checks before pushing:
\`\`\`bash
npm run check
\`\`\`

Full validation:
\`\`\`bash
npm run validate:content
\`\`\`

See [VALIDATION_QUICK_REF.md](./VALIDATION_QUICK_REF.md) for details.
```

### Update Contributing Guide

Replace validation section with:
```markdown
## Before Pushing

Run quick checks:
\`\`\`bash
npm run check
\`\`\`

This runs in parallel (~35s):
- Type checking
- Linting
- Unit tests
- Naming conventions
- Metadata sync
```

## ✅ Common Issues & Fixes

### Issue: Cache showing 0% hit rate
**Fix:**
```bash
# Check if cache directory exists
ls -la .validation-cache/

# If missing, run validation once
npm run validate:content

# Then check again
npm run cache:stats
```

### Issue: Pre-push very slow
**Fix:**
```bash
# Check if using new parallel execution
cat .git/hooks/pre-push

# Should contain:
# node scripts/validation/lib/run-checks.js

# If old hook, re-run:
chmod +x scripts/validation/lib/run-checks.js
```

### Issue: CI failing with "localhost not available"
**Fix:**
```bash
# Check if environment detection is working
# Scripts should auto-skip localhost checks in CI

# Verify CI env var is set
echo $CI  # Should be "true" in CI

# If not, set in CI config:
env:
  CI: true
```

### Issue: Scripts not finding new lib files
**Fix:**
```bash
# Ensure all new files are executable
chmod +x scripts/validation/lib/*.js
chmod +x scripts/deployment/deploy.sh

# Pull latest changes
git pull origin main
```

## ✅ Rollback Plan (Emergency)

If major issues occur:

### 1. Restore Old Scripts
```bash
git checkout HEAD~1 package.json
git checkout HEAD~1 .git/hooks/pre-push
npm install
```

### 2. Use Legacy Commands
```bash
# Old commands still work via aliases
npm run validate:all  # Alias to 'check'
npm run deploy:prod   # Alias to 'deploy'
```

### 3. Skip Validation Temporarily
```bash
# For pushes
git push --no-verify

# For builds
npm run build  # Skip prebuild
```

## 📊 Success Metrics

Track these to measure success:

- [ ] Pre-push time reduced from 2.5min to ~35s
- [ ] Deploy time reduced from 10min to ~3min
- [ ] Cache hit rate >80% after first run
- [ ] Zero CI failures due to localhost checks
- [ ] Developer satisfaction increased

## 🎓 Training Resources

1. **Quick Reference**: `VALIDATION_QUICK_REF.md`
2. **Full Documentation**: `scripts/validation/README.md`
3. **Implementation Details**: `VALIDATION_V2_SUMMARY.md`
4. **This Checklist**: `VALIDATION_MIGRATION.md`

## 📅 Migration Schedule

### Phase 1: Soft Launch (Week 1)
- [x] Core infrastructure deployed
- [x] Documentation created
- [ ] Team notified of changes
- [ ] Training session scheduled

### Phase 2: Parallel Running (Week 2)
- [ ] Both old and new commands work
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Adjust thresholds if needed

### Phase 3: Full Cutover (Week 3)
- [ ] Remove old command aliases
- [ ] Update all documentation
- [ ] Archive old scripts
- [ ] Declare v2.0 stable

## ✅ Sign-Off

### Developer Checklist
- [ ] Read quick reference guide
- [ ] Tested `npm run check` locally
- [ ] Tested `npm run cache:stats`
- [ ] Updated personal aliases/scripts
- [ ] Understand new command names

### CI/CD Checklist
- [ ] Updated GitHub Actions config
- [ ] Updated GitLab CI config
- [ ] Set CI=true environment variable
- [ ] Tested in staging environment
- [ ] Production deploy successful

### Script Maintainer Checklist
- [ ] Updated custom validation scripts
- [ ] Using ValidationResult class
- [ ] Using ValidationCache class
- [ ] Using central config
- [ ] Added environment detection

---

**Status:** Ready for Migration | **Risk Level:** Low | **Rollback Time:** <5 minutes

**Contact:** Team lead for questions or issues
