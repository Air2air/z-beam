# 🔍 Finding Vercel Production Settings - Updated Guide

**Issue**: The "Production Branch" dropdown isn't in Git settings page  
**Solution**: Check these alternative locations

---

## Where to Find Production Branch Settings

### Option 1: General Settings (Most Common)

1. Go to: **https://vercel.com/air2airs-projects/z-beam/settings**
   - **NOT** `/settings/git` - just `/settings`

2. Look for section called:
   - **"General"** or
   - **"Deployment"** or
   - **"Build & Development Settings"**

3. Find one of these:
   - **"Production Branch"**
   - **"Git Branch"**
   - **"Default Branch"**

4. Should show a dropdown or text input with: `main`

---

### Option 2: Git Integration (Different Section)

The git settings page might have different sections:

1. Go to: **https://vercel.com/air2airs-projects/z-beam/settings/git**

2. Look for these sections (scroll through entire page):

   **Section A: "Git Repository"**
   ```
   Repository: Air2air/z-beam
   Branch: main  ← This might be the production branch setting
   ```

   **Section B: "Ignored Build Step"**
   - This controls which commits trigger builds
   - Your current setting should be visible here

   **Section C: "Deploy Hooks"**
   - Shows if any deploy hooks are configured

   **Section D: "Connected Git Repository"**
   - Shows integration status
   - May have branch configuration

---

### Option 3: Domains Settings

Sometimes production branch is linked to domain configuration:

1. Go to: **https://vercel.com/air2airs-projects/z-beam/settings/domains**

2. Look for your production domain: `z-beam.vercel.app`

3. Click on it or look for:
   - **"Git Branch"** setting
   - Should show: `main`

---

### Option 4: Environment Variables Page

The environment might show which branch is production:

1. Go to: **https://vercel.com/air2airs-projects/z-beam/settings/environment-variables**

2. Look for any variables scoped to:
   - **Production** environment
   - Linked to **main** branch

---

## Alternative Approach: Vercel Project Settings

Since UI varies, here's what to look for:

### Key Settings to Find & Verify:

1. **What branch triggers production deployments?**
   - Should be: `main`
   - Location: Usually in General or Git settings

2. **Are preview deployments enabled?**
   - Should be: NO / Disabled
   - Location: Git settings or Deployment settings

3. **Which environments are configured?**
   - Should have: Production (linked to main)
   - Location: Settings → Environments or Build settings

---

## What the Settings Page Might Look Like

### Modern Vercel UI (2024-2025)

You might see sections like:

```
Settings
├── General
│   └── Project Name, Framework, etc.
├── Git
│   ├── Connected Repository: Air2air/z-beam
│   ├── Deployment Protection
│   └── Ignored Build Step
├── Domains
│   └── z-beam.vercel.app (Production)
├── Environment Variables
└── Build & Development Settings
    └── Production Branch: main  ← Might be here!
```

---

## Try This: Screenshot the Settings Page

Since the UI might look different:

1. Go to: https://vercel.com/air2airs-projects/z-beam/settings/git
2. Take a screenshot of the entire page (scroll to capture all sections)
3. Look for ANY mention of:
   - "Branch"
   - "Production"
   - "Preview"
   - "Deployment"

---

## Check Project Configuration via CLI

We can check what Vercel sees:

```bash
# Link to project (if not already)
vercel link --yes

# Pull project configuration
vercel pull --yes --environment=production

# Check .vercel/project.json
cat .vercel/project.json
```

This shows what Vercel has configured for your project.

---

## Alternative: Configure via Vercel CLI

If you can't find the UI setting, configure via CLI:

### Step 1: Create vercel project config

Run this:

```bash
```bash
cd /Users/todddunning/Desktop/Z-Beam/z-beam
cat vercel.json
```

### Step 2: Verify it worked

```bash
# Check deployment
vercel ls --prod | head -3
```

Should show a new production deployment.

---

## The Real Issue: Vercel's Deploy Decision

Vercel decides whether to create Production or Preview based on:

### Priority Order:
1. **Vercel Dashboard Settings** (if configured)
2. **Git branch name** (main = usually production)
3. **Deployment context** (push vs PR)
4. **Project configuration** in Vercel

### Why It's Creating Previews:

Your vercel.json says:
```json
"git": {
  "deploymentEnabled": {
    "main": true  ← Only main can deploy
  }
}
```

But Vercel is still classifying `main` deploys as "Preview" instead of "Production".

**This suggests**: Vercel doesn't recognize `main` as your production branch.

---

## Solution: Set Production Branch via CLI

Since UI setting is unclear, let's use CLI:

### Option A: Use vercel.json

Add this to your `vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "github": {
    "enabled": true,
    "silent": false,
    "autoJobCancelation": true
  }
}
```

**But wait** - you already have this! So the issue is definitely in dashboard.

### Option B: Force via Vercel API

Create a script to set it via API:

```bash
# Get your Vercel token
vercel whoami

# Would need API call to set production branch
# (This is complex - dashboard is easier)
```

---

## What I Need From You

To help you better, please:

1. **Go to this URL**:
   ```
   https://vercel.com/air2airs-projects/z-beam/settings
   ```
   (Without `/git` at the end)

2. **Tell me what sections you see**:
   - General?
   - Git?
   - Domains?
   - Functions?
   - Environment Variables?

3. **In each section, look for**:
   - Any mention of "branch"
   - Any mention of "production"
   - Any setting related to deployments

4. **Specifically check "General" section** for:
   - Project settings
   - Framework detection
   - Root directory
   - **Production Branch** (might be here!)

---

## Temporary Workaround

While we figure out the UI:

### Deploy to Production Directly

```bash
# This bypasses git integration
vercel --prod --yes
```

This forces a production deployment and should work immediately.

### Check Result

```bash
vercel ls --prod | head -3
```

Should show new production deployment.

---

## Let's Try Something

Run this script to gather information:

```bash
# Check current Vercel configuration
echo "=== Vercel Project Info ==="
vercel project ls 2>&1 | grep z-beam

echo -e "\n=== Recent Deployments ==="
vercel ls 2>&1 | head -15

echo -e "\n=== Vercel Whoami ==="
vercel whoami

echo -e "\n=== Local Vercel Config ==="
cat .vercel/project.json

echo -e "\n=== vercel.json Git Config ==="
grep -A 10 '"git"' vercel.json
```

Run this and share the output - it will help me understand the configuration.

---

## Next Steps

1. **Check main settings page** (not /git):
   ```
   https://vercel.com/air2airs-projects/z-beam/settings
   ```

2. **Look in "General" section** for production branch

3. **Or run**: `vercel --prod --yes` to test if code works

4. **Share**: What sections you see in settings page

---

**Created**: October 11, 2025  
**Issue**: Production Branch setting location unclear in Vercel UI  
**Status**: Investigating alternative locations
