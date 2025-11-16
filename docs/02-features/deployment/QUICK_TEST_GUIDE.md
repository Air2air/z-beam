# 🚀 Quick Start: Test Production Deployments

**You've configured the Vercel Dashboard - Now let's test it!**

---

## Option 1: Automated Test (Easiest) ⚡

Run this one command:

```bash
./scripts/deployment/test-production.sh
```

**What it does**:
1. ✅ Creates a test commit
2. ✅ Pushes to main
3. ✅ Waits for deployment
4. ✅ Checks if it's Production
5. ✅ Shows clear success/failure message

**Expected result**: Big green "SUCCESS!" message

---

## Option 2: Manual Test 🔧

### Step 1: Deploy manually

```bash
# Auto-deploy is disabled, use manual deployment
vercel --prod
```

### Step 2: Check deployment status

```bash
# Check recent deployments
vercel ls | head -8
```

### Step 3: Look for this

✅ **GOOD** (What you want to see):
```
Age     Deployment                              Status       Environment
1m      https://z-beam-xxx.vercel.app          ● Ready      Production  ✅
```

**Note:** Auto-deploy is disabled. Pushing to main does NOT trigger deployments.

---

## If You See "Production" ✅

**Congratulations!** Your deployment is working!

### Next steps:

1. **Deploy workflow** (auto-deploy disabled):
   ```bash
   # Commit and push your changes
   git push origin main
   
   # Then deploy manually
   vercel --prod
   ```

2. **Monitor deployment**:
   ```bash
   npm run monitor
   ```

3. **Alternative deployment tools**:
   ```bash
   npm run deploy
   ./smart-deploy.sh deploy-monitor
   ```

---

## If You See "Preview" or "Canceled" ❌

The dashboard settings didn't take effect. Try these:

### Quick Fix 1: Disconnect/Reconnect GitHub

1. Go to: https://vercel.com/air2airs-projects/z-beam/settings/git
2. Scroll to bottom, click "Disconnect"
3. Click "Connect Git Repository" again
4. Select `Air2air/z-beam`
5. Verify settings are still correct
6. Run test again

### Quick Fix 2: Force Production Deploy

```bash
# Bypass git integration, deploy directly
vercel --prod
```

If this works, the code is fine but dashboard git settings need adjustment.

### Quick Fix 3: Double-Check Settings

Go to: https://vercel.com/air2airs-projects/z-beam/settings/git

**Must have**:
- Production Branch: `main` ✅
- Preview Deployments: Disabled ✅

Also check: https://vercel.com/air2airs-projects/z-beam/settings/environments
- `main` branch → Production environment ✅

---

## Detailed Troubleshooting

See: **VERIFICATION_WALKTHROUGH.md**

```bash
cat VERIFICATION_WALKTHROUGH.md
```

---

## Quick Commands Reference

```bash
# Run automated test
./scripts/deployment/test-production.sh

# Check recent deployments
vercel ls | head -10

# Check production deployments only
vercel ls --prod

# Force production deployment
vercel --prod

# Clean up previews
./scripts/deployment/cleanup-previews.sh all --yes

# View deployment logs
vercel logs --follow
```

---

## Current Status Check

Run this right now to see recent deployments:

```bash
vercel ls | head -10 | grep -E "(Age|Production|Preview|Canceled)"
```

**Look for**:
- Recent deployments showing "Production" ✅
- OR recent deployments showing "Preview"/"Canceled" ❌

---

## Expected After Successful Config

```bash
$ vercel ls | head -5

Age     Deployment                              Status       Environment     Duration
2m      https://z-beam-xxx.vercel.app          ● Ready      Production      1m
15m     https://z-beam-yyy.vercel.app          ● Ready      Production      1m
1h      https://z-beam-zzz.vercel.app          ● Ready      Production      1m
```

All showing "Production" - no "Preview" in sight! ✅

---

**Ready? Run the test!**

```bash
./scripts/deployment/test-production.sh
```

Or push your verification docs:

```bash
git push origin main && sleep 15 && vercel ls | head -5
```

---

**Last Updated**: October 11, 2025, 10:30 PM
