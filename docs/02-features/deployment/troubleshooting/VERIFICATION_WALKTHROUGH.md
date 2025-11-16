# ✅ Vercel Dashboard Updated - Verification & Testing Guide

**Status**: Dashboard configured - Now let's verify and test!

---

## Step 1: Verify Dashboard Settings (2 minutes)

Let's confirm your dashboard settings are correct.

### Check Production Branch Setting

1. Go to: **https://vercel.com/air2airs-projects/z-beam/settings/git**

2. Look for **"Git"** section, find:
   ```
   Production Branch: [dropdown menu]
   ```

3. **Verify it shows**: `main`

✅ **Good**: Shows `main`  
❌ **Issue**: Shows something else or "Not set"

---

### Check Preview Deployment Settings

In the same Git settings page, scroll down to find one of these:

**Option A: "Preview Deployments"**
```
□ Enable preview deployments for pull requests
```
- Should be: ❌ **UNCHECKED**

**Option B: "Ignored Build Step"** or **"Deploy Branches"**
```
Deploy from branches:
☑ Only production branch (main)
□ All branches
```
- Should be: ✅ **Only production branch checked**

**Option C: "Branch Deployments"**
```
Branch: main          Type: Production
Branch: feature/*     Type: [should not exist]
```
- Should show: ✅ **Only `main` as Production**

---

### Verify Settings Saved

Look for confirmation message like:
```
✓ Settings saved
```

If you don't see this, click **"Save"** button at bottom of page.

---

## Step 2: Clean Test - Create New Deployment (5 minutes)

Now let's test with a fresh deployment to see if it works!

### 2A: Create a Test Commit

Open terminal and run:

```bash
# Navigate to your project
cd /Users/todddunning/Desktop/Z-Beam/z-beam

# Create an empty test commit
git commit --allow-empty -m "Test: Verify production-only deployment after dashboard config"

# Push to main
git push origin main
```

**What to expect**:
- Push completes successfully
- GitHub shows the commit
- Vercel should receive the webhook

---

### 2B: Monitor the Deployment (Wait 30 seconds)

After pushing, wait 30 seconds, then run:

```bash
# Check recent deployments
vercel ls | head -8
```

**What you want to see** ✅:
```
Age     Deployment                              Status       Environment     Duration
30s     https://z-beam-xxx.vercel.app          Building     Production      -
```
OR
```
Age     Deployment                              Status       Environment     Duration
2m      https://z-beam-xxx.vercel.app          ● Ready      Production      1m
```

**What you DON'T want to see** ❌:
```
Age     Deployment                              Status       Environment     Duration
30s     https://z-beam-xxx.vercel.app          Canceled     Preview         4s
```

---

### 2C: Interpret the Results

#### ✅ SUCCESS: Environment Shows "Production"

**Good signs**:
- Environment column shows **"Production"** ✅
- Status shows "Building" or "● Ready" ✅
- Duration is more than a few seconds ✅

**Next step**: Skip to Step 3 (Success Actions)

---

#### ❌ STILL SHOWING "Preview"

**Bad signs**:
- Environment column shows **"Preview"** ❌
- Status shows "Canceled" ❌
- Duration is 3-4 seconds ❌

**If this happens**, go to Step 4 (Troubleshooting)

---

## Step 3: Success Actions ✅

If your test deployment shows "Production", great! Here's what to do:

### 3A: Verify Production URL

```bash
# Check production deployments only
vercel ls --prod | head -3
```

Should show your new deployment at the top.

---

### 3B: Clean Up Old Preview Deployments

Since you now have production working, clean up old previews:

```bash
# Remove old preview deployments (keep 0, delete all)
./scripts/deployment/cleanup-previews.sh all --yes
```

This will remove all those canceled preview deployments from earlier tests.

---

### 3C: Future Deployments

From now on, just:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main

# Deployment happens automatically to production!
```

Or use the deployment tool:

```bash
npm run deploy:prod
```

---

## Step 4: Troubleshooting (If Still Showing Preview) 🔧

If the test deployment still shows "Preview" after dashboard configuration:

### 4A: Double-Check Dashboard Settings

Go back to: https://vercel.com/air2airs-projects/z-beam/settings/git

**Specific things to check**:

1. **Production Branch dropdown**
   - Click on it to see options
   - Ensure `main` is selected
   - Click "Save" again

2. **Look for "Deployment Protection"** section
   - May be under "Security" or "Git" tab
   - Check if there's a setting like:
     ```
     Preview Deployments: [Enabled/Disabled]
     ```
   - Should be: **Disabled**

3. **Check "Environments"** section
   - Go to: https://vercel.com/air2airs-projects/z-beam/settings/environments
   - Verify `main` branch is assigned to **Production** environment

---

### 4B: Try Disconnect/Reconnect GitHub

Sometimes settings don't take effect until GitHub is reconnected:

1. Go to: https://vercel.com/air2airs-projects/z-beam/settings/git
2. Find **"Disconnect"** button (usually at bottom)
3. Click "Disconnect" (don't worry, this is safe)
4. Click **"Connect Git Repository"** again
5. Select your repository: `Air2air/z-beam`
6. Confirm connection
7. Verify settings are still correct
8. Try another test push

---

### 4C: Force Production Deploy via CLI

Bypass dashboard settings temporarily:

```bash
# This forces a production deployment directly
vercel --prod

# Wait for it to complete, then check
vercel ls --prod | head -3
```

If this works, it confirms the code is fine but dashboard settings aren't being applied to git pushes.

---

### 4D: Check Build Logs

View what Vercel sees:

1. Go to: https://vercel.com/air2airs-projects/z-beam
2. Click on the most recent deployment
3. Click "View Function Logs" or "Deployment Details"
4. Look for environment variables, should see:
   ```
   VERCEL_ENV=production
   ```

If it shows `VERCEL_ENV=preview`, dashboard settings aren't working.

---

### 4E: Contact Vercel Support

If none of the above works:

1. Take screenshots of:
   - Git settings page showing Production Branch = main
   - Recent deployment showing "Preview" instead of "Production"
   - Your vercel.json file

2. Contact Vercel support: https://vercel.com/support

3. Explain:
   > "I've configured my Production Branch to 'main' in dashboard settings, 
   > but git pushes to main are still creating Preview deployments instead 
   > of Production deployments. My vercel.json restricts deployments to main 
   > branch only. Please help ensure main branch pushes create Production 
   > deployments."

---

## Step 5: Advanced Verification 🔍

### Check Vercel Project Settings via CLI

```bash
# Inspect project configuration
vercel project ls

# Should show:
# z-beam    https://z-beam.vercel.app    [time]    22.x
```

---

### Verify Environment Variables

```bash
# Check what environment Vercel is using
vercel env ls
```

This shows configured environment variables per environment (production/preview/development).

---

### Manual Production Deployment Test

As a final test, deploy directly without git:

```bash
# Deploy current directory to production
vercel --prod --yes

# This should work and create a production deployment
```

If this works but git pushes don't, the issue is specifically with git integration settings.

---

## Expected Timeline

After proper dashboard configuration:

- **t=0s**: Push to main
- **t=10s**: Vercel receives webhook, starts deployment
- **t=15s**: Deployment shows as "Building" with Environment: "Production"
- **t=90s**: Build completes
- **t=100s**: Deployment shows as "● Ready" with Environment: "Production"

---

## Quick Status Check Command

Run this anytime to check recent deployments:

```bash
vercel ls | head -10 | grep -E "(Age|Production|Preview)"
```

**Good output**:
```
Age     ...     Production
Age     ...     Production
```

**Bad output**:
```
Age     ...     Preview
Age     ...     Canceled
```

---

## Summary Checklist

Use this to track your progress:

- [ ] Step 1: Verified dashboard settings (Production Branch = main)
- [ ] Step 1: Verified preview deployments disabled
- [ ] Step 1: Clicked "Save" on settings page
- [ ] Step 2A: Created test commit and pushed to main
- [ ] Step 2B: Waited 30 seconds and checked deployment
- [ ] Step 2C: Verified deployment shows "Production" not "Preview"
- [ ] Step 3: Cleaned up old preview deployments (if successful)
- [ ] ✅ DONE: Production-only deployments working!

OR if issues:

- [ ] Step 4: Tried troubleshooting steps
- [ ] Step 4: Contacted Vercel support (if needed)

---

## Need More Help?

### Run Diagnostic Script

```bash
# Check configuration
./scripts/deployment/verify-prod-only.sh

# Interactive configuration guide
./scripts/deployment/force-production.sh
```

### Check Documentation

- **DASHBOARD_CONFIG_REQUIRED.md** - Critical dashboard settings
- **FORCE_PRODUCTION_ONLY.md** - Complete configuration guide
- **PRODUCTION_DEPLOYMENT_SETUP.md** - Detailed setup instructions

---

## Success Confirmation

You'll know it's working when:

1. ✅ Push to main creates deployment with Environment: **"Production"**
2. ✅ Deployment completes successfully (not canceled)
3. ✅ `vercel ls --prod` shows your latest deployment
4. ✅ No more "Preview" deployments appearing

---

**Ready to test?** Start with **Step 2A** above! 🚀

---

**Created**: October 11, 2025  
**Last Updated**: After dashboard configuration completed
