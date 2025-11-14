# Git Hooks & Deploy Lifecycle Evaluation

## Executive Summary

**Status:** ✅ Git hooks operational, ⚠️ postdeploy needs manual trigger

### Key Findings:

1. **Pre-commit Hook:** ✅ Active - Freshness timestamp updates
2. **Pre-push Hook:** ✅ Active - 7-step validation suite
3. **Predeploy/Postdeploy:** ❌ npm lifecycle hooks DON'T work with custom scripts
4. **Production Validation:** ⚠️ Must be run manually after deployment

---

## 1. Pre-commit Hook Analysis

**File:** `.git/hooks/pre-commit`  
**Status:** ✅ ACTIVE  
**Purpose:** Automatic content freshness timestamp updates

### What It Does:

- Updates `dateModified` timestamps in frontmatter files
- Runs on small batches (5-10 files per commit)
- Minimal frequency (7+ days between runs)
- Smart conflict avoidance (skips if frontmatter files being committed)

### Execution Flow:

```bash
git commit
  → Check: Last run > 7 days ago?
  → Check: No frontmatter files in staging?
  → Update: 5-10 oldest content files
  → Stage: Updated files
  → Continue: Normal commit
```

### Performance:

- **Frequency:** Once per week (minimum 7 days)
- **Batch Size:** 5-10 files
- **Impact:** Low (silently runs in background)
- **Time:** < 2 seconds

### Configuration:

```bash
MIN_DAYS_BETWEEN_RUNS=7
BATCH_SIZE=$((5 + RANDOM % 6))
FRESHNESS_SCRIPT="scripts/update-freshness-timestamps.js"
```

### Pros:

✅ Automated content freshness maintenance  
✅ Minimal performance impact  
✅ Conflict avoidance built-in  
✅ Gradual, incremental updates

### Cons:

⚠️ Only updates timestamps, doesn't validate content  
⚠️ Could be bypassed with `git commit --no-verify`

### Recommendations:

1. **Add lightweight validation** (optional):
   ```bash
   # Quick syntax check on staged files only
   git diff --cached --name-only | grep "\.yaml$" | xargs validate-yaml
   ```

2. **Track metrics** in `.freshness-updates.json`:
   - Total files updated
   - Average update frequency
   - Last validation timestamp

---

## 2. Pre-push Hook Analysis

**File:** `.git/hooks/pre-push`  
**Status:** ✅ ACTIVE  
**Purpose:** Quick validation before pushing to remote

### What It Runs:

```bash
1. Type checking       → npm run type-check
2. Linting            → npm run lint
3. Unit tests         → npm run test:unit
4. Naming conventions → npm run validate:naming
5. Metadata sync      → npm run validate:metadata
6. WCAG 2.2 static    → npm run validate:wcag-2.2:static
7. Schema richness    → npm run validate:schema-richness
```

### Execution Flow:

```bash
git push
  → Run 7 validation steps in sequence
  → Track failures
  → Exit 1 if any fail (blocks push)
  → Exit 0 if all pass (allows push)
```

### Performance:

- **Total Time:** ~30-90 seconds
- **Parallel:** No (sequential execution)
- **Critical:** Yes (blocks push on failure)

### Validation Coverage:

| Check | Purpose | Time | Critical |
|-------|---------|------|----------|
| Type checking | TypeScript errors | ~5-10s | Yes |
| Linting | Code quality | ~5-10s | Yes |
| Unit tests | Core functionality | ~10-15s | Yes |
| Naming conventions | File/slug standards | ~5-10s | Yes |
| Metadata sync | Frontmatter completeness | ~3-5s | Yes |
| WCAG 2.2 static | Accessibility (static) | ~2-3s | Yes |
| Schema richness | JSON-LD quality | ~5-10s | Yes |

### Bypass Option:

```bash
git push --no-verify  # Skip pre-push hook (not recommended)
```

### Pros:

✅ Catches issues before remote push  
✅ Fast validation subset  
✅ Prevents broken code in remote  
✅ Clear error messages

### Cons:

⚠️ Sequential execution (could parallelize)  
⚠️ No caching (runs full checks every time)  
⚠️ Can be bypassed with `--no-verify`

### Recommendations:

1. **Add parallel execution**:
   ```bash
   # Run independent checks in parallel
   (npm run type-check &)
   (npm run lint &)
   (npm run test:unit &)
   wait
   ```

2. **Add result caching**:
   - Cache validation results per commit hash
   - Skip if already validated

3. **Add progress indicator**:
   - Show which step is running
   - Estimated time remaining

---

## 3. Deploy Lifecycle Hooks

### ❌ CRITICAL FINDING: npm lifecycle hooks DON'T work with custom scripts

**The Problem:**

npm lifecycle hooks (`predeploy`, `postdeploy`) **ONLY** work with actual npm commands:

```json
{
  "scripts": {
    "deploy": "vercel --prod",              // ✅ npm predeploy would run
    "deploy": "./scripts/deploy.sh",         // ❌ npm predeploy does NOT run
    "predeploy": "npm run validate:all",     // Never runs!
    "postdeploy": "npm run validate:production" // Never runs!
  }
}
```

### Why It Doesn't Work:

1. **Bash scripts aren't npm commands** - They're executed by the shell, not npm
2. **Lifecycle hooks are npm-specific** - Only trigger for actual npm script execution
3. **Current deploy command:** `./scripts/deployment/deploy-with-validation.sh -y`
   - This is a bash script call
   - npm doesn't intercept it
   - predeploy/postdeploy never run

### Current Workaround:

The `deploy-with-validation.sh` script **manually** runs validations:
- Runs prebuild checks
- Runs build
- Deploys to Vercel
- **BUT** doesn't run postdeploy validation

### Verification:

```bash
# Test if lifecycle hooks work
npm run deploy  # Runs bash script directly
# Result: predeploy does NOT run

# If deploy was a real npm command:
npm run deploy  # Would call 'vercel --prod'
# Result: predeploy WOULD run before deploy
```

---

## 4. Postdeploy Production Validation

### Current State: ⚠️ MANUAL EXECUTION REQUIRED

**Scripts Available:**

1. **Basic validation:**
   ```bash
   npm run validate:production
   # → Runs: validate-production.js
   # → Tests: https://www.z-beam.com
   ```

2. **Enhanced validation with report:**
   ```bash
   npm run validate:production:full
   # → Runs: validate-production-enhanced.js
   # → Generates: HTML report
   ```

3. **Custom URL:**
   ```bash
   npm run validate:production -- --url=https://www.z-beam.com/materials/metal/alloy/aluminum-laser-cleaning
   ```

### What It Tests:

**validate-production.js** checks:

1. **Performance:**
   - Response time < 3000ms
   - Page load speed
   - HTTP/2 support
   - Compression enabled

2. **SEO:**
   - Title tags present
   - Meta descriptions
   - Canonical URLs
   - Open Graph tags
   - Twitter cards

3. **Accessibility (a11y):**
   - ARIA landmarks
   - Image alt text
   - Heading hierarchy
   - Color contrast (basic)

4. **Security:**
   - HTTPS enabled
   - Security headers (CSP, X-Frame-Options, etc.)
   - No mixed content
   - HSTS enabled

5. **Structured Data (JSON-LD):**
   - Valid JSON syntax
   - Schema.org compliance
   - Required properties present
   - URL consistency

6. **UX:**
   - Navigation present
   - Footer content
   - Contact information
   - Responsive design signals

### Output Formats:

```bash
# Console output (default)
npm run validate:production

# JSON report
npm run validate:production:json

# HTML report
npm run validate:production:report
```

### Current Problem:

**Postdeploy validation runs LOCALLY, not on PRODUCTION URL!**

The `postbuild` script validates the **build output** (`.next` directory), not the live site.

---

## Solutions & Recommendations

### Solution 1: Manual Postdeploy Script (RECOMMENDED)

Create a wrapper that handles the full deploy lifecycle:

**File:** `scripts/deployment/deploy-and-validate.sh`

```bash
#!/bin/bash

echo "🚀 Starting deployment with post-validation..."

# 1. Run pre-deploy validations
./scripts/deployment/deploy-with-validation.sh "$@"
DEPLOY_EXIT=$?

if [ $DEPLOY_EXIT -ne 0 ]; then
    echo "❌ Deployment failed"
    exit $DEPLOY_EXIT
fi

# 2. Wait for deployment to propagate
echo "⏳ Waiting 30 seconds for deployment to propagate..."
sleep 30

# 3. Run production validation
echo "🔍 Validating production deployment..."
npm run validate:production -- --url=https://www.z-beam.com

VALIDATE_EXIT=$?

if [ $VALIDATE_EXIT -ne 0 ]; then
    echo "⚠️  Production validation found issues"
    echo "    Review at: https://www.z-beam.com"
    exit 1
fi

echo "✅ Deployment and validation complete!"
exit 0
```

**Usage:**
```bash
npm run deploy:full  # New script that runs deploy-and-validate.sh
```

### Solution 2: Vercel Deploy Hook

Use Vercel's deployment hooks to trigger validation:

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "deploymentHooks": [
    {
      "name": "post-deployment-validation",
      "url": "https://your-ci-server.com/webhook/validate",
      "events": ["deployment-ready"]
    }
  ]
}
```

### Solution 3: GitHub Actions Post-Deploy (BEST)

**File:** `.github/workflows/post-deploy-validation.yml`

```yaml
name: Post-Deployment Validation

on:
  deployment_status:

jobs:
  validate:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Wait for deployment propagation
        run: sleep 30
      
      - name: Validate production
        run: npm run validate:production -- --url=${{ github.event.deployment_status.target_url }}
      
      - name: Generate report
        if: always()
        run: npm run validate:production:full
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: production-validation-report
          path: production-validation-report.html
```

### Solution 4: Npm Script Wrapper (QUICK FIX)

**package.json:**
```json
{
  "scripts": {
    "deploy:full": "npm run deploy && sleep 30 && npm run validate:production",
    "deploy:with-report": "npm run deploy && sleep 30 && npm run validate:production:full"
  }
}
```

**Usage:**
```bash
npm run deploy:full  # Deploy + validate
```

---

## Recommended Implementation Plan

### Phase 1: Immediate (Today)

1. **Add deploy wrapper script:**
   ```bash
   scripts/deployment/deploy-and-validate.sh
   ```

2. **Update package.json:**
   ```json
   "deploy:validated": "bash scripts/deployment/deploy-and-validate.sh -y"
   ```

3. **Document usage:**
   ```bash
   npm run deploy:validated  # Deploy with post-validation
   ```

### Phase 2: Short-term (This Week)

1. **Improve pre-push hook:**
   - Add parallel execution
   - Add progress indicators
   - Add result caching

2. **Create production validation dashboard:**
   - Real-time monitoring
   - Historical trends
   - Alert system

### Phase 3: Long-term (This Month)

1. **Implement GitHub Actions workflow:**
   - Automated post-deploy validation
   - Slack/email notifications
   - Rollback on critical failures

2. **Add monitoring integration:**
   - Lighthouse CI
   - Web Vitals tracking
   - Uptime monitoring

---

## Command Reference

### Current Commands:

```bash
# Git hooks (automatic)
git commit              # Triggers pre-commit (freshness updates)
git push                # Triggers pre-push (7 validations)

# Deploy (manual)
npm run deploy          # Deploy without validation
npm run deploy:safe     # Deploy with confirmation
npm run deploy:skip     # Deploy skipping pre-validations

# Post-deploy validation (manual)
npm run validate:production              # Basic validation
npm run validate:production:full         # With HTML report
npm run validate:production -- --url=... # Custom URL
```

### Recommended New Commands:

```bash
# Deploy with full lifecycle
npm run deploy:validated     # Deploy + wait + validate production
npm run deploy:full          # Alias for deploy:validated
npm run deploy:safe-validated # With confirmation prompt

# Enhanced validation
npm run validate:production:live     # Live site validation
npm run validate:production:monitor  # Continuous monitoring
```

---

## Conclusion

**Current State:**
- ✅ Pre-commit: Working well (freshness updates)
- ✅ Pre-push: Working well (7-step validation)
- ❌ Predeploy: Not triggered (npm lifecycle limitation)
- ❌ Postdeploy: Not automatic (requires manual trigger)

**Action Required:**
1. Create deploy wrapper script for full lifecycle
2. Add post-deploy validation to deployment workflow
3. Document new deployment process

**Priority:** HIGH - Production validation should be automatic
