# CRITICAL: Preview Deployments Still Enabled

## Problem
Despite `vercel.json` configuration, GitHub pushes are creating **Preview deployments** instead of **Production deployments**.

## Root Cause
The `vercel.json` file **cannot** force production-only deployments. This must be configured in the **Vercel Dashboard** under Project Settings.

## Current Status
- ❌ All GitHub pushes → Preview deployments
- ❌ Builds failing at ~31-34 seconds
- ❌ Not reaching production

## Required Fix (Must be done in Vercel Dashboard)

### Steps to Configure Production-Only Deployments:

1. **Go to Vercel Dashboard**
   - https://vercel.com/air2airs-projects/z-beam/settings/git

2. **Git Settings → Production Branch**
   - Set Production Branch: `main`
   - **UNCHECK**: "Automatic Preview Deployments"
   - Or set to: "Only deploy Production Branch"

3. **Alternative: Configure via Git Settings**
   - Settings → Git
   - Under "Deploy Hooks"
   - Configure: Main branch → Production only

## Why This Matters

**Current behavior:**
```bash
git push origin main
↓
GitHub webhook → Vercel
↓
Creates PREVIEW deployment ❌
↓
Fails (because it's not using production settings)
```

**Expected behavior:**
```bash
git push origin main
↓
GitHub webhook → Vercel
↓
Creates PRODUCTION deployment ✅
↓
Succeeds with production configuration
```

## Temporary Workaround

Until dashboard is configured, use CLI for production deployments:

```bash
# Don't rely on git push
# Use direct CLI deployment:
vercel --prod

# Or with monitoring:
npm run deploy
```

## Verification

After configuring dashboard, verify with:

```bash
git push origin main
# Wait 10 seconds, then:
vercel ls | head -5
# Should show: "● Building    Production" or "● Ready    Production"
# NOT: "● Error    Preview"
```

## Files That DON'T Control This

- ❌ `vercel.json` - Has git settings but can't force production
- ❌ `.vercel/project.json` - Only has project ID
- ❌ CLI commands - Can't configure GitHub integration behavior

## Files That DO Control This

- ✅ **Vercel Dashboard** - Project Settings → Git
- ✅ **GitHub webhook settings** - Configured via dashboard

## Action Required

**Someone with dashboard access must:**
1. Log into https://vercel.com/air2airs-projects/z-beam
2. Go to Settings → Git
3. Configure Production Branch = main
4. Disable automatic preview deployments
5. Save settings

Then test with:
```bash
git commit --allow-empty -m "test: Verify production deployment"
git push origin main
```

## Current Deployment Pattern (WRONG)

```
Age     Status      Environment
47s     ● Error     Preview        ← WRONG
5m      ● Error     Preview        ← WRONG
24m     ● Error     Preview        ← WRONG
```

## Expected Deployment Pattern (CORRECT)

```
Age     Status      Environment
1m      ● Ready     Production     ← CORRECT
5m      ● Ready     Production     ← CORRECT
10m     ● Ready     Production     ← CORRECT
```

---

**Status**: ⚠️ **BLOCKING** - All deployments failing due to Preview/Production misconfiguration

**Priority**: 🔴 **CRITICAL** - Must be fixed before system is functional

**Owner**: Dashboard admin with project settings access
