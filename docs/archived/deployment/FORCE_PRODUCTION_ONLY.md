# Force Production-Only Deployments - Complete Guide

**Date**: October 11, 2025  
**Status**: ✅ Configuration Updated

---

## What Was Changed

### 1. Updated `vercel.json`

**Changed**: Simplified `buildCommand` to always build without environment checks

**Before**:
```json
"buildCommand": "if [ \"$VERCEL_ENV\" != \"production\" ]; then echo 'Skipping preview build' && exit 1; fi && next build"
```

**After**:
```json
"buildCommand": "next build"
```

**Why**: The previous command was canceling builds that Vercel initially marked as "Preview". By simplifying it, we rely on Vercel's dashboard settings to control deployment types.

### 2. Configuration Still Active

These settings remain in place to restrict deployments:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true          // Only main branch triggers deployments
    }
  },
  "ignoreCommand": "..."    // Only main branch proceeds
}
```

---

## 🚨 CRITICAL: Vercel Dashboard Configuration Required

Your `vercel.json` file is configured correctly, but **Vercel Dashboard settings override these**. You **MUST** configure the dashboard to ensure production-only deployments.

### Step-by-Step Instructions

#### 1. Access Git Settings

Go to: **https://vercel.com/air2airs-projects/z-beam/settings/git**

#### 2. Configure Production Branch

Look for: **"Production Branch"** or **"Git Integration"**

✅ **Set to**: `main`

This tells Vercel that `main` is your production branch.

#### 3. Disable Preview Deployments

Look for one of these sections:
- **"Preview Deployments"**
- **"Automatic Deployments"**  
- **"Deploy Previews"**

✅ **Set to**: 
- "Disabled" or
- "Ignored" or
- "Production Only"

✅ **Or check**: 
- ☑ "Ignore Pull Requests"
- ☑ "Skip preview deployments"

❌ **Ensure NOT**:
- "Automatic"
- "All branches"
- "Enabled"

#### 4. Check Branch Deployment Settings

Look for: **"Branch Deployments"** or **"Deploy from Branches"**

✅ **Ensure**:
- Only `main` is listed
- `main` is marked as "Production"
- All other branches are removed or disabled

#### 5. Verify No Deploy Hooks for Previews

Go to: **https://vercel.com/air2airs-projects/z-beam/settings/deploy-hooks**

✅ **Check**: No hooks configured for preview deployments

#### 6. Save Settings

Click **"Save"** or **"Update"** button

---

## How to Use the Configuration Script

Run the interactive configuration script:

```bash
./scripts/deployment/force-production.sh
```

This script will:
1. ✅ Verify `vercel.json` configuration
2. ⚠️ Remind you to update dashboard settings
3. ✅ Guide you through testing

---

## Testing: Verify It Works

### Test 1: Push to Main (Should Be Production)

```bash
# Make a commit
git commit --allow-empty -m "Test: Force production deployment"

# Push to main
git push origin main

# Wait 30 seconds
sleep 30

# Check deployment
vercel ls | head -5
```

**Expected Result**:
```
Age     Deployment                              Status      Environment
1m      https://z-beam-xxx.vercel.app          ● Ready     Production
```

✅ **Success**: Environment shows "Production"  
❌ **Issue**: Environment shows "Preview" or "Canceled"

### Test 2: Create Pull Request (Should Do Nothing)

```bash
# Create test branch
git checkout -b test-no-preview-2
echo "# Test" > test.txt
git add test.txt
git commit -m "Test: Should not deploy"
git push origin test-no-preview-2

# Create PR on GitHub
# Wait 1 minute, then check

vercel ls | head -10
```

**Expected Result**:
- No new deployments appear at all
- OR deployment shows as "Canceled" immediately

✅ **Success**: No deployment or canceled immediately  
❌ **Issue**: New preview deployment created

---

## Why Preview Deployments Were Happening

Your recent push created a "Canceled Preview" deployment. Here's why:

### The Problem

1. **Push to main** → GitHub notifies Vercel
2. **Vercel's initial decision** → May classify as "Preview" based on internal logic
3. **Your buildCommand tried to cancel** → `if [ "$VERCEL_ENV" != "production" ]; then exit 1`
4. **Result** → Build canceled, but still shows as "Preview" deployment

### The Solution

1. **Remove environment check** from buildCommand → Always build
2. **Configure dashboard** to classify all main branch pushes as Production
3. **Dashboard setting wins** → Forces production environment

---

## Current Configuration Summary

| Setting | Location | Value | Purpose |
|---------|----------|-------|---------|
| **Git Integration** | vercel.json | `main: true` | Only main triggers builds |
| **Ignore Command** | vercel.json | Check branch = main | Skip non-main branches |
| **Build Command** | vercel.json | `next build` | Always build (no env check) |
| **Production Branch** | Dashboard | `main` | ⚠️ Must set in dashboard |
| **Preview Deployments** | Dashboard | Disabled | ⚠️ Must disable in dashboard |

---

## Troubleshooting

### Issue: Still seeing "Preview" deployments from main

**Cause**: Dashboard settings not configured

**Solution**:
1. Go to Vercel dashboard settings
2. Set Production Branch to `main`
3. Disable preview deployments
4. Save settings
5. Test again

### Issue: Deployments are "Canceled"

**Cause**: Conflicting settings between vercel.json and dashboard

**Solution**:
1. Ensure `buildCommand` is just `next build` (no env checks)
2. Configure dashboard to mark main as production
3. May need to disconnect/reconnect GitHub integration

### Issue: No deployments happening at all

**Cause**: Too restrictive settings

**Solution**:
1. Check `ignoreCommand` isn't too aggressive
2. Verify GitHub integration is connected
3. Check Vercel build logs for errors

---

## Quick Reference

### View Current Settings
```bash
# Check vercel.json
cat vercel.json | grep -A 10 "git\|buildCommand\|ignoreCommand"

# Check recent deployments
vercel ls | head -10

# Check production deployments only
vercel ls --prod
```

### Force a Production Deploy
```bash
# Using the deployment tool
npm run deploy:prod

# Or direct push
git push origin main
```

### Clean Up Old Previews
```bash
# Remove old preview deployments
./scripts/deployment/cleanup-previews.sh old 3 --yes
```

---

## Final Checklist

Complete these steps to ensure production-only:

- [x] ✅ `vercel.json` updated with simple `buildCommand`
- [ ] ⚠️ Dashboard: Set Production Branch to `main`
- [ ] ⚠️ Dashboard: Disable preview deployments
- [ ] ⚠️ Dashboard: Remove other branch deployments
- [ ] ✅ Test: Push to main creates production deployment
- [ ] ✅ Test: PRs don't create deployments

---

## Important Notes

### Dashboard Settings Override vercel.json

Vercel's behavior:
1. First checks dashboard settings (takes priority)
2. Then applies vercel.json settings
3. Dashboard wins if there's a conflict

**Therefore**: Dashboard configuration is MANDATORY for production-only deployments.

### Why This Approach Works

1. **`vercel.json`** restricts which branches can trigger builds
2. **Dashboard** controls what type of deployment (production vs preview)
3. **Together** they ensure only main → production

---

## Success Criteria

After completing all steps, you should see:

✅ Pushes to `main` → Production deployments only  
✅ Pull requests → No deployments created  
✅ Other branches → Ignored completely  
✅ `vercel ls` shows only Production deployments (recent)

---

## Need Help?

If you're still seeing preview deployments:

1. **Screenshot dashboard settings**: Git settings page
2. **Run verification**: `./scripts/deployment/verify-prod-only.sh`
3. **Check deployment logs**: https://vercel.com/air2airs-projects/z-beam
4. **Contact Vercel support**: Explain you want production-only deployments

---

**Last Updated**: October 11, 2025  
**Next Action**: Configure Vercel Dashboard (see instructions above)
