# 🎯 Making Git Pushes Deploy to Production Automatically

**Current Status**: ✅ Production deployments work via CLI (`vercel --prod`)  
**Goal**: Make `git push origin main` deploy to production automatically

---

## The Missing Setting

You need to configure which branch triggers **production** deployments in Vercel's dashboard.

### Modern Vercel UI (2024-2025)

The setting location has changed in recent Vercel versions. Here's where to look:

---

## Step 1: Check Project Settings

Go to your project settings:
```
https://vercel.com/air2airs-projects/z-beam/settings
```

### Look for These Sections (in order of likelihood)

#### Option A: "Git" Section (Most Common)

1. Click on **"Git"** in the left sidebar
2. Look for one of these:
   - **"Production Branch"**
   - **"Branch Configuration"**
   - **"Deployment Branches"**
3. Set it to: `main`

#### Option B: "General" Section

1. Stay on the main settings page (or click "General")
2. Scroll down to find:
   - **"Production Branch"**
   - **"Root Directory"** (may be near this)
3. Set production branch to: `main`

#### Option C: "Deployments" Section

Some projects have a separate "Deployments" section:
1. Look for **"Deployments"** in the left sidebar
2. Find **"Production Branch"** setting
3. Set it to: `main`

---

## Step 2: What You Should See

Once you find the setting, it should look like:

```
Production Branch: [dropdown menu]
├── main          ← Select this
├── master
├── production
└── [other branches]
```

Or:

```
Branch Configuration
├── Production Branch: main
├── Preview Branches: [all other branches]
└── Ignored Branches: [none]
```

---

## Step 3: Additional Settings to Check

While you're in the settings, also check:

### A. Ignored Build Step

Look for **"Ignored Build Step"** setting:
- Should be: Empty or default
- Or: Use your `ignoreCommand` from `vercel.json`
- Make sure it's not blocking main branch

### B. Root Directory

Check **"Root Directory"** setting:
- Should be: `.` (root) or empty
- Not a subdirectory

### C. Build & Development Settings

Look for **"Build & Development Settings"**:
- Build Command: Can be empty (uses `vercel.json`)
- Output Directory: Usually `.next` (for Next.js)
- Install Command: Can be empty (uses `npm install`)

---

## Step 4: Alternative - Via Vercel CLI

If you can't find the setting in the dashboard, you can configure it via CLI:

```bash
# Configure production branch via CLI
vercel project --prod-branch main
```

Or check current settings:

```bash
# Show current project configuration
vercel project ls
```

---

## Step 5: Test After Configuring

Once you've set the production branch, test it:

### Quick Test

```bash
# Create an empty test commit
git commit --allow-empty -m "Test: Production deployment via git push"

# Push to main
git push origin main

# Wait 15 seconds
sleep 15

# Check recent deployments
vercel ls | head -5
```

### Expected Result ✅

```
Age     Deployment                              Status       Environment
1m      https://z-beam-xxx.vercel.app          ● Ready      Production
```

**Not this** ❌:
```
Age     Deployment                              Status       Environment
1m      https://z-beam-xxx.vercel.app          Canceled     Preview
```

---

## If You Still Can't Find It

### Modern Vercel UI Variations

The UI varies by:
- Account type (hobby vs pro)
- When the project was created
- Vercel feature flags

### What to Look For

Take a screenshot of your settings page and look for ANY of these terms:
- Production Branch
- Default Branch
- Branch Configuration
- Deployment Branch
- Main Branch
- Git Branch
- Branch Settings

### Check All Settings Pages

Visit each of these URLs and tell me what sections you see:

1. **Main Settings**:
   ```
   https://vercel.com/air2airs-projects/z-beam/settings
   ```

2. **Git Settings** (if separate):
   ```
   https://vercel.com/air2airs-projects/z-beam/settings/git
   ```

3. **Domains** (sometimes production branch is here):
   ```
   https://vercel.com/air2airs-projects/z-beam/settings/domains
   ```

4. **Environment Variables** (may show branch config):
   ```
   https://vercel.com/air2airs-projects/z-beam/settings/environment-variables
   ```

---

## Workaround: Use CLI Permanently

If you can't find the dashboard setting, the CLI workaround is solid:

### Option 1: Create an Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Quick production deploy
alias deploy-prod='vercel --prod --yes'
```

Then just run:
```bash
deploy-prod
```

### Option 2: Use the Script

```bash
./scripts/deployment/deploy-production-direct.sh
```

### Option 3: Create a Git Hook

Automatically deploy after pushing:

```bash
# Create post-push hook
cat > .git/hooks/post-push << 'EOF'
#!/bin/bash
if [ "$1" = "origin" ] && [ "$2" = "refs/heads/main" ]; then
  echo "🚀 Deploying to production..."
  vercel --prod --yes
fi
EOF

chmod +x .git/hooks/post-push
```

---

## What to Report Back

Please check your dashboard and tell me:

1. **What sections do you see** in the left sidebar at:
   ```
   https://vercel.com/air2airs-projects/z-beam/settings
   ```

2. **In the Git section** (if it exists), what options are shown?

3. **Do you see "Production Branch"** anywhere? If yes, where?

4. **Screenshot request** (if easier): Take a screenshot of the settings page showing the left sidebar

---

## Expected Timeline

- Finding setting: 2-5 minutes
- Configuring: 30 seconds
- Testing: 2 minutes
- **Total: ~5-10 minutes**

---

## Quick Actions

### Right Now: Check Dashboard

```
1. Open: https://vercel.com/air2airs-projects/z-beam/settings
2. Look in left sidebar for: Git, Deployments, or General
3. Find: "Production Branch" setting
4. Set to: main
5. Save
```

### Then: Test It

```bash
git commit --allow-empty -m "Test production deployment"
git push origin main
sleep 15
vercel ls | head -3
```

---

**Let me know what you see in the settings, and I'll guide you to the exact location!**

---

**Created**: October 11, 2025  
**Status**: Production deployments work via CLI, configuring git integration  
**Next Step**: Find production branch setting in dashboard
