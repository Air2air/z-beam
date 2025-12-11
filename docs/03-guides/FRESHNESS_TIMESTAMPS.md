# Frontmatter Timestamp Quick Start Guide

## Overview

Automated system to maintain Google freshness signals by rotating `dateModified` timestamps across 132 material pages.

**Goal**: Keep 20-30% of content "fresh" (updated within 30 days) at all times

---

## Quick Commands

```bash
# Preview what would be updated (dry run)
npm run update-freshness

# Execute updates (default: 25 files, oldest first)
npm run update-freshness:execute

# Weekly rotation (recommended)
npm run update-freshness:weekly

# Verify integration
npm run verify:freshness

# Custom batch size
npm run update-freshness -- --execute --batch=20
```

---

## First-Time Setup

### 1. Initial Update (Add Missing Dates)

```bash
# Preview all 132 files
npm run update-freshness -- --batch=132

# Execute (adds datePublished + dateModified to all files)
npm run update-freshness -- --execute --batch=132 --oldest

# Review changes
git diff frontmatter/materials/

# Build and test
npm run build

# Commit
git add frontmatter/materials/ content/.freshness-updates.json
git commit -m "feat: add freshness timestamps to all frontmatter files"

# Deploy
./smart-deploy.sh deploy
```

**Expected Changes:**
```yaml
# Before
title: Aluminum Laser Cleaning
material_description: Precision surface preparation...

# After
title: Aluminum Laser Cleaning
material_description: Precision surface preparation...
datePublished: '2025-10-25T13:53:55.449239Z'  # ← NEW (from micro.generated)
dateModified: '2025-11-15T14:22:33.891234Z'   # ← NEW (current time)
```

### 2. Verify Integration

```bash
# Run verification script
npm run verify:freshness
```

**Expected Output:**
```
✅ All 132 files have datePublished
✅ All 132 files have dateModified
✅ Tracking file is valid JSON
✅ All dates use ISO 8601 format
✅ Build succeeded
✅ OpenGraph dates found in HTML
✅ JSON-LD dates found in HTML
```

### 3. Schedule Weekly Updates

**Option A: Cron Job (Server)**
```bash
# Edit crontab
crontab -e

# Add weekly update (Mondays at 9 AM)
0 9 * * 1 cd /path/to/z-beam && npm run update-freshness:weekly >> /var/log/freshness.log 2>&1
```

**Option B: GitHub Actions (Recommended)**

Already configured in `.github/workflows/update-freshness.yml`

Manual trigger:
1. Go to GitHub Actions tab
2. Select "Update Content Freshness"
3. Click "Run workflow"
4. Configure batch size (default: 25)
5. Set dry_run=false to execute

Automatic runs every Monday at 9 AM UTC.

---

## Weekly Workflow

### Automated (GitHub Actions)

**No manual action required!**

Every Monday:
1. GitHub Action runs automatically
2. Updates 25 oldest files
3. Commits changes: `chore: update content freshness timestamps (25 files) [skip ci]`
4. Pushes to main branch
5. Triggers Vercel deployment
6. Deployment completes automatically

### Manual

```bash
# 1. Preview changes
npm run update-freshness

# 2. Execute updates
npm run update-freshness:weekly

# 3. Review changes
git diff frontmatter/materials/

# 4. Build and test
npm run build

# 5. Commit and deploy
git add frontmatter/materials/ content/.freshness-updates.json
git commit -m "chore: update content freshness timestamps (weekly rotation)"
./smart-deploy.sh deploy
```

---

## Monitoring Impact

### Google Search Console

**Key Metrics to Watch:**

1. **Impressions** (Search Results → Performance)
   - Expect: 10-20% increase over 3 months
   - Filter by page: `/materials/*`

2. **Average Position** (Search Results → Performance)
   - Expect: 5-10% improvement for competitive queries
   - Watch for pages moving into top 10

3. **Indexing Status** (Pages → Indexing)
   - Ensure all pages remain indexed
   - Watch for "Last crawled" dates updating

4. **Structured Data** (Enhancements → Structured Data)
   - Check for `Article` or `TechArticle` validation
   - Ensure `dateModified` and `datePublished` present

**Warning Signs:**
- ❌ Sudden drop in impressions after mass update
- ❌ Manual action in Search Console
- ❌ Decreased crawl rate
- ❌ Structured data errors

### Analytics (Google Analytics / Vercel)

**Metrics to Track:**

1. **Organic Traffic**
   - Source: Acquisition → All Traffic → Source/Medium
   - Filter: `google / organic`
   - Expect: 15-30% increase over 6 months

2. **Page Views** (Material Pages)
   - Filter: `/materials/*`
   - Compare: Month-over-month growth

3. **Engagement**
   - Time on page (should remain stable or increase)
   - Bounce rate (should remain stable)

### Tracking File

```bash
# View update history
cat content/.freshness-updates.json
```

**Example Output:**
```json
{
  "lastRun": "2025-11-15T09:00:00.000Z",
  "totalUpdates": 75,
  "updates": {
    "aluminum-laser-cleaning": {
      "count": 3,
      "lastUpdate": "2025-11-15T09:00:00.000Z",
      "history": [
        {
          "date": "2025-10-15T09:00:00.000Z",
          "fields": ["dateModified"]
        },
        {
          "date": "2025-11-01T09:00:00.000Z",
          "fields": ["dateModified"]
        },
        {
          "date": "2025-11-15T09:00:00.000Z",
          "fields": ["dateModified"]
        }
      ]
    }
  }
}
```

---

## Troubleshooting

### Script Errors

**"Cannot find module 'js-yaml'"**
```bash
npm install
```

**"Permission denied"**
```bash
chmod +x scripts/update-freshness-timestamps.js
```

**"Invalid date format"**
- Check frontmatter YAML syntax
- Ensure ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.SSSZ`

### Build Errors

**"Build failed after timestamp update"**
```bash
# Revert changes
git reset --hard HEAD~1

# Re-run with smaller batch
npm run update-freshness -- --execute --batch=10

# Test build incrementally
npm run build
```

### No Files Updated

**"No files need updating at this time"**

This is normal if:
- All files updated within last 7 days (minDaysBetweenUpdates)
- All files already fresh (within 30-day window)

Wait 7+ days before next update.

### Verification Failed

**Run detailed checks:**
```bash
# Check frontmatter files
find frontmatter/materials -name "*.yaml" -exec grep -l "dateModified" {} \; | wc -l

# Check tracking file
cat content/.freshness-updates.json

# Check build output
npm run build
grep -r "article:modified_time" .next/server/
```

---

## Best Practices

### ✅ Do

- **Run weekly** (25 files per week = all files updated every 5-6 weeks)
- **Pair with content improvements** when possible
- **Monitor Google Search Console** for impact
- **Track update history** in git commits
- **Use dry run** before mass updates
- **Test builds** after updates

### ❌ Don't

- **Update all files simultaneously** (looks unnatural)
- **Update too frequently** (daily = manipulation signal)
- **Backdate timestamps** (violates Google guidelines)
- **Update without content changes** (excessive timestamp-only updates)
- **Ignore warning signs** (traffic drops, manual actions)

### 🎯 Recommended Cadence

**Weekly Rotation:**
- ✅ Update 25 files per week
- ✅ Full rotation every 5-6 weeks
- ✅ 20-30% of content always fresh

**Monthly Content Improvements:**
- ✅ Research updates (2-3 files)
- ✅ New sections (1-2 files)
- ✅ Quality improvements (5-10 files)

**Quarterly Audits:**
- ✅ Review freshness distribution
- ✅ Analyze Search Console metrics
- ✅ Adjust strategy if needed

---

## Configuration

Edit `scripts/update-freshness-timestamps.js`:

```javascript
const CONFIG = {
  intervals: {
    fresh: 30,      // Google "fresh" threshold (days)
    normal: 90,     // Normal ranking window
    stale: 180,     // Potential penalty threshold
  },
  
  strategy: {
    batchSize: 25,              // Files per run
    minDaysBetweenUpdates: 7,   // Minimum days between updates
    maxDaysBetweenUpdates: 45,  // Maximum days for freshness
    sortBy: 'oldest',           // 'oldest' | 'random' | 'alphabetical'
    timestampVariation: true,   // Add ±2 hours for natural look
  },
};
```

**Adjust for your needs:**
- Increase `batchSize` for faster rotation
- Decrease `minDaysBetweenUpdates` for more frequent updates (risky)
- Change `sortBy` to 'random' for unpredictable pattern

---

## Support

**Documentation:**
- Full strategy: `docs/FRONTMATTER_FRESHNESS_STRATEGY.md`
- This guide: `docs/quick-start/FRESHNESS_TIMESTAMPS.md`

**Scripts:**
- Update script: `scripts/update-freshness-timestamps.js`
- Verification: `scripts/verify-freshness-integration.sh`
- GitHub Actions: `.github/workflows/update-freshness.yml`

**Monitoring:**
- Tracking file: `content/.freshness-updates.json`
- Git history: `git log frontmatter/materials/`
- Google Search Console: https://search.google.com/search-console

**Issues?**
1. Check troubleshooting section above
2. Review full strategy document
3. Inspect tracking file for update history
4. Verify build output in `.next/`

---

## Summary

**One-Time Setup:**
```bash
npm run update-freshness -- --execute --batch=132 --oldest
npm run verify:freshness
git add content/ && git commit -m "feat: add freshness timestamps"
./smart-deploy.sh deploy
```

**Weekly Maintenance:**
```bash
npm run update-freshness:weekly  # Or let GitHub Actions handle it
```

**Monitoring:**
- Google Search Console (weekly)
- Organic traffic (monthly)
- Freshness distribution (quarterly)

🎯 **Goal**: Maintain 20-30% fresh content, sustainable SEO boost, authentic update patterns.
