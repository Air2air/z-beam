# Sitemap Management for Vercel Deployment

**Last Updated:** October 20, 2025  
**Hosting:** Vercel  
**Status:** ✅ Fully Automated

---

## How It Works on Vercel

### Automatic Sitemap Generation

When you push to `main`:

1. **Git Push** → Vercel detects changes
2. **Vercel Build** → Runs `npm run build`
3. **Pre-build Hook** → Runs `npm run verify:sitemap` (validates sitemap)
4. **Build Process** → Next.js generates sitemap dynamically from `app/sitemap.ts`
5. **Deploy** → Sitemap available at `https://z-beam.com/sitemap.xml`

**No GitHub Actions needed!** Vercel handles everything.

---

## Verification System

### Pre-build Validation

Every Vercel deployment automatically runs:

```bash
npm run prebuild → npm run verify:sitemap
```

**What it checks:**
- ✅ Sitemap file exists
- ✅ Dynamic article generation is implemented
- ✅ All static routes present
- ✅ All material categories included
- ✅ Counts article files (~120+)
- ✅ Runs automated tests

**If validation fails:**
- ❌ Build stops
- ❌ Deployment cancelled
- 📧 You get notified of the error

### Local Testing

Before pushing, test locally:

```bash
# Verify sitemap
npm run verify:sitemap

# Run tests
npm run test:sitemap

# View sitemap locally
npm run dev
# Visit: http://localhost:3000/sitemap.xml
```

---

## Monitoring Sitemap After Deployment

### 1. Check Live Sitemap

**Production URL:**
```
https://z-beam.com/sitemap.xml
```

**Expected result:**
- ~135+ URLs
- All article pages included
- Proper XML format
- Current modification dates

### 2. Google Search Console

**Submit sitemap:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to: **Sitemaps** → **Add a new sitemap**
4. Enter: `sitemap.xml`
5. Click **Submit**

**Monitor status:**
- Check **Coverage** report
- Review **Discovered** vs **Indexed** counts
- Fix any errors or warnings

### 3. Vercel Deployment Logs

**View build logs:**
```bash
vercel logs --follow
```

Or in Vercel dashboard:
- Go to project → Deployments
- Click on latest deployment
- View **Build Logs**
- Search for "sitemap" to see verification output

---

## Package.json Scripts

### Available Commands

```json
{
  "dev": "next dev",                    // Local development
  "prebuild": "npm run verify:sitemap", // Auto-runs before build
  "build": "next build",                // Production build
  "test:sitemap": "jest tests/sitemap", // Run sitemap tests
  "verify:sitemap": "verify script",    // Manual verification
  "setup:hooks": "install git hooks"    // Optional local hooks
}
```

### Script Flow

```
Push to main
    ↓
Vercel detects push
    ↓
npm run build (on Vercel)
    ↓
prebuild hook runs automatically
    ↓
verify:sitemap validates everything
    ↓
✅ Pass: Build continues
❌ Fail: Build stops, deployment cancelled
```

---

## Adding New Content

### New Article (Automatic)

**No action needed!** Just add the file:

```bash
# Create new article
content/components/frontmatter/titanium-laser-cleaning.yaml

# Commit and push
git add .
git commit -m "Add titanium article"
git push origin main

# Vercel automatically:
# 1. Validates sitemap
# 2. Includes /titanium in sitemap
# 3. Deploys with updated sitemap
```

### New Static Page (Manual Update)

Update `app/sitemap.ts`:

```typescript
{
  url: `${baseUrl}/new-page`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}
```

---

## Troubleshooting

### Build Fails with "Sitemap verification failed"

**Check Vercel logs:**
```bash
vercel logs
```

**Common issues:**
1. Frontmatter directory missing
2. Sitemap.ts has syntax error
3. Required routes missing

**Solution:**
```bash
# Test locally first
npm run verify:sitemap

# Fix any errors
# Push again
git push origin main
```

### Sitemap Missing Articles

**Verify article count:**
```bash
# Count files
ls -1 content/components/frontmatter/*.yaml | wc -l

# Should match sitemap entry count
```

**Check naming convention:**
- Files must end with `-laser-cleaning.yaml`
- No spaces in filenames
- All lowercase

### Sitemap Not Updating

**Force new deployment:**
```bash
# Make a trivial change
git commit --allow-empty -m "Rebuild sitemap"
git push origin main
```

**Or trigger manual deploy:**
```bash
vercel --prod
```

---

## Vercel Configuration

### Build Settings

**In Vercel Dashboard:**
- Build Command: `npm run build` ✅ (includes prebuild hook)
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**
- No special variables needed for sitemap
- `NODE_ENV=production` is set automatically

### Ignored Build Step

**DO NOT** add sitemap to `.vercelignore`:
```
# ❌ Don't do this:
# app/sitemap.ts

# ✅ Sitemap must be included in build
```

---

## Performance

### Build Time Impact

- **Sitemap verification:** ~1-2 seconds
- **Sitemap generation:** < 1 second
- **Total impact:** Negligible (~2-3 seconds per deployment)

### File Size

- **~135+ URLs** in sitemap
- **Compressed size:** ~10-15KB
- **Uncompressed:** ~30-40KB
- **No performance impact** on visitors

---

## Best Practices for Vercel

### ✅ DO:

1. **Keep prebuild hook** for automatic validation
2. **Test locally** before pushing to main
3. **Monitor Search Console** for indexing status
4. **Review Vercel logs** after deployments
5. **Use conventional commits** for clarity

### ❌ DON'T:

1. **Don't use GitHub Actions** (redundant with Vercel)
2. **Don't manually edit sitemap.xml** (auto-generated)
3. **Don't skip verification** (catches issues early)
4. **Don't ignore build failures** (fix before retrying)

---

## Comparison: GitHub Actions vs Vercel Build

| Feature | GitHub Actions | Vercel Build | Winner |
|---------|----------------|--------------|--------|
| **Automatic trigger** | ✅ On push | ✅ On push | Tie |
| **Build environment** | GitHub runners | Vercel edge | ⭐ Vercel |
| **Caching** | Manual setup | Automatic | ⭐ Vercel |
| **Error handling** | Custom | Built-in | ⭐ Vercel |
| **Deployment** | Separate step | Integrated | ⭐ Vercel |
| **Simplicity** | Multiple files | One hook | ⭐ Vercel |
| **Cost** | Free tier limits | Included | ⭐ Vercel |

**Verdict:** Use Vercel's build system (prebuild hook) ✅

---

## Migration from GitHub Actions

If you previously had GitHub Actions:

```bash
# Remove workflow file
rm -rf .github/workflows/sitemap-verification.yml

# Verify prebuild hook exists
grep "prebuild" package.json
# Should show: "prebuild": "npm run verify:sitemap"

# That's it! Vercel handles everything now
```

---

## Emergency Procedures

### Disable Sitemap Verification Temporarily

**If verification is blocking deployment:**

```json
// package.json
{
  "scripts": {
    "prebuild": "echo 'Sitemap verification skipped'",
    // ... rest
  }
}
```

**⚠️ Remember to re-enable after fixing the issue!**

### Force Deploy Without Verification

```bash
# Temporarily remove prebuild hook
npm run build

# Or use Vercel CLI with specific commit
vercel --prod --force
```

---

## Monitoring Dashboard

### What to Monitor

**Weekly:**
- [ ] Check sitemap.xml is accessible
- [ ] Verify article count matches files
- [ ] Review Search Console coverage

**Monthly:**
- [ ] Check indexing status in Search Console
- [ ] Review any crawl errors
- [ ] Validate no 404s in sitemap URLs

**After Content Updates:**
- [ ] Verify new articles appear in sitemap
- [ ] Check modification dates are current
- [ ] Test article URLs work correctly

---

## Quick Reference

### Essential URLs

```
Production sitemap:  https://z-beam.com/sitemap.xml
Local sitemap:       http://localhost:3000/sitemap.xml
Search Console:      https://search.google.com/search-console
Vercel Dashboard:    https://vercel.com/dashboard
```

### Essential Commands

```bash
# Local verification
npm run verify:sitemap

# Run tests
npm run test:sitemap

# View build logs
vercel logs

# Force rebuild
git commit --allow-empty -m "Rebuild" && git push

# Deploy manually
vercel --prod
```

---

## Summary

**✅ Optimal Setup for Vercel:**

1. **Dynamic sitemap generation** in `app/sitemap.ts`
2. **Pre-build validation** via `prebuild` npm script
3. **Automated tests** in `tests/sitemap/`
4. **No GitHub Actions needed** (Vercel does it all)
5. **Zero manual updates** required

**Result:**
- Sitemap updates automatically with every deployment
- Build fails if sitemap is invalid
- ~135+ pages always included
- Search engines stay up-to-date

---

**Maintained by:** Development Team  
**Review Frequency:** When Vercel settings change or new content types added
