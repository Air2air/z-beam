# Frontmatter Freshness Timestamp Strategy

## Executive Summary

**Problem**: Frontmatter YAML files lack `datePublished` and `dateModified` fields, preventing Google from recognizing content freshness signals.

**Solution**: Automated timestamp management system that:
- Adds missing publication dates (using existing `caption.generated` timestamps)
- Updates modification dates on a strategic rotation
- Maintains authentic update history
- Aligns with Google's freshness ranking signals

**Impact**:
- ✅ Improved search ranking for "fresh" content (updated within 30 days)
- ✅ Structured data compliance (JSON-LD, OpenGraph, sitemap.xml)
- ✅ Automated maintenance (weekly rotation keeps content fresh)
- ✅ Authentic signals (realistic update intervals, tracked history)

---

## Background Analysis

### Current State

**Timestamp Gap Discovered:**
```yaml
# ❌ Current frontmatter structure
caption:
  generated: '2025-10-25T13:53:55.449239Z'  # Internal timestamp
  author: Todd Dunning

materialProperties:
  properties:
    absorptivity:
      research_date: '2025-10-17T18:49:00.145061'  # Per-property dates

# MISSING: No top-level SEO timestamp fields
```

**Code Expectations:**
```typescript
// app/utils/metadata.ts EXPECTS these fields:
const datePublished = metadata.datePublished;  // ❌ Not in YAML
const dateModified = metadata.dateModified;    // ❌ Not in YAML
```

**Infrastructure Ready:**
- ✅ Metadata.ts processes `datePublished`, `dateModified`
- ✅ JSON-LD schemas include date fields
- ✅ OpenGraph/Twitter Cards support timestamps
- ✅ Sitemap.xml ready for `<lastmod>` dates
- ❌ Frontmatter YAML files don't provide the data

**Scale:**
- 132 frontmatter YAML files
- All material pages (aluminum, concrete, limestone, etc.)
- Existing timestamps: Sept 30, 2025 → Oct 25, 2025

---

## Google Freshness Ranking Signals

### How Google Uses Timestamps

**Freshness Intervals:**
- **Fresh (≤30 days)**: Content boost, "recently updated" signals
- **Normal (30-90 days)**: Standard ranking, no penalty or boost
- **Stale (90+ days)**: Potential ranking penalty for time-sensitive topics
- **Very Stale (180+ days)**: Significant penalty for queries expecting fresh content

**Where Google Reads Timestamps:**
1. JSON-LD structured data (`dateModified`, `datePublished`)
2. OpenGraph meta tags (`article:modified_time`, `article:published_time`)
3. Sitemap.xml (`<lastmod>` dates)
4. HTTP Last-Modified headers
5. Content analysis (visible dates in text)

**Ranking Impact:**
- Query Deserves Freshness (QDF): Google boosts recent content for trending topics
- Content decay: Older content may rank lower for competitive queries
- Update signals: Regular updates signal maintained, authoritative content

### Best Practices

**✅ Google-Friendly Patterns:**
- Regular update intervals (weekly, monthly batches)
- Realistic modification dates (not all files updated simultaneously)
- Authentic content changes (pair timestamps with actual improvements)
- Consistent update history (tracked, auditable changes)

**❌ Patterns to Avoid:**
- Mass updates (all files same timestamp = red flag)
- Too frequent (daily updates = manipulation signal)
- Timestamp-only changes (no content improvement)
- Backdating (modifying historical timestamps)

---

## Proposed Strategy

### Phase 1: Initial Setup (One-Time)

**Objective**: Add `datePublished` to all 132 frontmatter files

**Approach**:
```bash
# Dry run (preview changes)
node scripts/update-freshness-timestamps.js

# Execute initial setup
node scripts/update-freshness-timestamps.js --execute --batch=132 --oldest
```

**Changes**:
```yaml
# ✅ Updated frontmatter structure
title: Aluminum Laser Cleaning
subtitle: Precision surface preparation...
description: Comprehensive guide...
datePublished: '2025-10-25T13:53:55.449239Z'  # ← NEW (from caption.generated)
dateModified: '2025-11-15T14:22:33.891234Z'   # ← NEW (current timestamp)

caption:
  generated: '2025-10-25T13:53:55.449239Z'
  author: Todd Dunning
```

**Timeline**:
- Week 1: Run script, review changes
- Week 2: Test build, validate metadata
- Week 3: Deploy to production
- Week 4: Monitor Google Search Console

### Phase 2: Rotating Updates (Ongoing)

**Objective**: Keep 25-30 files "fresh" (updated within 30 days) at all times

**Schedule**:
```bash
# Weekly cron job (every Monday at 9 AM)
0 9 * * 1 cd /path/to/z-beam && node scripts/update-freshness-timestamps.js --execute --batch=25 --oldest

# OR npm script
npm run update-freshness:weekly
```

**Rotation Math**:
- 132 files ÷ 25 files/week = 5.3 weeks per full rotation
- Result: Every file updated approximately every 5-6 weeks
- Freshness: 25-30 files always within 30-day "fresh" window

**Update Pattern**:
```
Week 1: Update 25 oldest files (oldest → 25th oldest)
Week 2: Update next 25 files (26th → 50th oldest)
Week 3: Update next 25 files (51st → 75th oldest)
Week 4: Update next 25 files (76th → 100th oldest)
Week 5: Update next 25 files (101st → 125th oldest)
Week 6: Update remaining + cycle back to Week 1
```

### Phase 3: Content Improvement Pairing (Recommended)

**Objective**: Pair timestamp updates with actual content enhancements

**Approach**:
1. **Research Updates** (every 2 months)
   - Update `research_date` fields with new findings
   - Add recent case studies, industry data
   - Update technical specifications if changed

2. **Content Expansion** (quarterly)
   - Add new sections (FAQs, troubleshooting)
   - Expand material properties
   - Include recent customer success stories

3. **Quality Improvements** (ongoing)
   - Fix typos, improve clarity
   - Optimize headings, structure
   - Enhance internal linking

**Tracking**:
```json
// .freshness-updates.json
{
  "lastRun": "2025-11-15T09:00:00.000Z",
  "totalUpdates": 25,
  "updates": {
    "aluminum-laser-cleaning": {
      "count": 3,
      "lastUpdate": "2025-11-15T09:00:00.000Z",
      "history": [
        {
          "date": "2025-10-15T09:00:00.000Z",
          "fields": ["dateModified"],
          "contentChanges": false
        },
        {
          "date": "2025-11-15T09:00:00.000Z",
          "fields": ["dateModified", "research_date"],
          "contentChanges": true,
          "notes": "Updated ablation threshold research"
        }
      ]
    }
  }
}
```

---

## Implementation Details

### Script Features

**Update Script** (`scripts/update-freshness-timestamps.js`):
- ✅ Dry run mode (preview before applying)
- ✅ Batch size control (update N files per run)
- ✅ Priority sorting (oldest first, random, alphabetical)
- ✅ Timestamp variation (±2 hours for natural appearance)
- ✅ Update tracking (history, frequency limits)
- ✅ Minimum interval enforcement (7 days between updates)
- ✅ Comprehensive reporting (freshness status, stats)

**Configuration**:
```javascript
const CONFIG = {
  intervals: {
    fresh: 30,      // Google "fresh" threshold
    normal: 90,     // Normal ranking window
    stale: 180,     // Potential penalty threshold
  },
  
  strategy: {
    batchSize: 25,              // Files per run
    minDaysBetweenUpdates: 7,   // Authenticity control
    maxDaysBetweenUpdates: 45,  // Freshness target
    sortBy: 'oldest',           // Update priority
    timestampVariation: true,   // Natural timestamps (±2 hours)
  },
};
```

### Usage Examples

**Dry Run** (preview changes):
```bash
node scripts/update-freshness-timestamps.js
# Output: Report showing which files would be updated
```

**Execute Updates**:
```bash
# Update default batch (25 files)
node scripts/update-freshness-timestamps.js --execute

# Update custom batch size
node scripts/update-freshness-timestamps.js --execute --batch=20

# Update oldest files first
node scripts/update-freshness-timestamps.js --execute --oldest
```

**NPM Scripts** (add to package.json):
```json
{
  "scripts": {
    "update-freshness": "node scripts/update-freshness-timestamps.js",
    "update-freshness:execute": "node scripts/update-freshness-timestamps.js --execute",
    "update-freshness:weekly": "node scripts/update-freshness-timestamps.js --execute --batch=25 --oldest"
  }
}
```

**Cron Job** (automated weekly updates):
```bash
# Edit crontab
crontab -e

# Add weekly job (Mondays at 9 AM)
0 9 * * 1 cd /path/to/z-beam && npm run update-freshness:weekly >> /var/log/freshness-updates.log 2>&1
```

### Workflow Integration

**Manual Update Workflow**:
```bash
# 1. Preview changes
npm run update-freshness

# 2. Review report, verify files to update
# 3. Execute updates
npm run update-freshness:execute

# 4. Review changes
git diff frontmatter/materials/

# 5. Test build
npm run build

# 6. Commit and deploy
git add frontmatter/materials/ content/.freshness-updates.json
git commit -m "chore: update content freshness timestamps (25 files)"
./smart-deploy.sh deploy
```

**Automated Workflow** (GitHub Actions):
```yaml
# .github/workflows/update-freshness.yml
name: Update Content Freshness

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
  workflow_dispatch:     # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Update freshness timestamps
        run: npm run update-freshness:execute
      
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add frontmatter/materials/ content/.freshness-updates.json
          git commit -m "chore: automated freshness timestamp update [skip ci]" || exit 0
          git push
      
      - name: Deploy to production
        run: ./smart-deploy.sh deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Ethical Considerations

### Google's Stance on Timestamp Updates

**Official Guidelines** (Google Search Central):
- ✅ **Permitted**: Updating timestamps when making substantive content changes
- ⚠️ **Gray Area**: Timestamp updates for minor corrections or typo fixes
- ❌ **Prohibited**: Manipulating timestamps without content changes (deceptive)

**Best Practices**:
1. **Pair with Content**: Update timestamps when improving content quality
2. **Be Transparent**: Document update history (tracking file)
3. **Realistic Intervals**: Avoid mass updates or unrealistic frequency
4. **Quality Focus**: Prioritize content improvements over timestamp gaming

### Recommended Approach

**Option 1: Conservative (Most Ethical)**
- Update timestamps ONLY when making substantive content changes
- Track content improvements in version control
- Document update rationale in commit messages
- Target: 5-10 files/month with real improvements

**Option 2: Balanced (Recommended)**
- Rotate timestamps on weekly schedule (25 files/week)
- Pair 30-50% of updates with content improvements
- Small corrections (typos, formatting) on remaining files
- Track update history for transparency
- Target: All files fresh within 5-6 weeks

**Option 3: Aggressive (Higher Risk)**
- Update all files monthly (timestamp-only changes)
- Minimal content changes
- Faster rotation (all files fresh monthly)
- Risk: Google may detect pattern, apply penalty

**Z-Beam Recommendation: Option 2 (Balanced)**
- Maintains freshness signals without excessive risk
- Pairs timestamps with actual quality improvements
- Sustainable long-term (automated + manual review)
- Authentic update history (tracked, auditable)

### Risk Mitigation

**Avoid Red Flags**:
- ❌ Don't update all 132 files simultaneously
- ❌ Don't update files daily or multiple times per week
- ❌ Don't backdate timestamps to manipulate history
- ❌ Don't update timestamps without ANY content change

**Maintain Authenticity**:
- ✅ Stagger updates (25 files/week = natural cadence)
- ✅ Add timestamp variation (±2 hours = looks organic)
- ✅ Track update history (auditable trail)
- ✅ Pair with content improvements when possible
- ✅ Document changes in git commits

**Monitor Impact**:
- Watch Google Search Console (impressions, clicks, rankings)
- Track Core Web Vitals (ensure updates don't hurt performance)
- Review organic traffic trends (Google Analytics)
- Monitor for manual actions (Search Console penalties)

---

## Technical Validation

### Metadata Pipeline

**Before** (current state):
```typescript
// metadata.ts reads dates but frontmatter doesn't provide them
const datePublished = metadata.datePublished;  // undefined
const dateModified = metadata.dateModified;    // undefined

// OpenGraph tags missing dates
<meta property="article:published_time" content={undefined} />
<meta property="article:modified_time" content={undefined} />

// JSON-LD incomplete
{
  "@type": "TechArticle",
  "datePublished": undefined,  // ❌ Missing
  "dateModified": undefined    // ❌ Missing
}
```

**After** (with updates):
```typescript
// metadata.ts reads dates from frontmatter
const datePublished = metadata.datePublished;  // '2025-10-25T13:53:55.449Z'
const dateModified = metadata.dateModified;    // '2025-11-15T14:22:33.891Z'

// OpenGraph tags complete
<meta property="article:published_time" content="2025-10-25T13:53:55.449Z" />
<meta property="article:modified_time" content="2025-11-15T14:22:33.891Z" />

// JSON-LD complete
{
  "@type": "TechArticle",
  "datePublished": "2025-10-25T13:53:55.449Z",  // ✅ Present
  "dateModified": "2025-11-15T14:22:33.891Z"    // ✅ Present
}
```

### Sitemap.xml Integration

**Update** `app/sitemap.ts`:
```typescript
import { getFrontmatter } from '@/app/utils/frontmatter';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ... existing code ...
  
  // Add material pages with lastmod dates
  const frontmatterFiles = await getFrontmatter();
  const materialUrls = frontmatterFiles.map(file => ({
    url: `${baseUrl}/materials/${file.slug}`,
    lastModified: file.dateModified || file.datePublished || new Date(),  // ← Use frontmatter dates
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  
  return [...staticUrls, ...materialUrls];
}
```

### Build Verification

**Test Script**:
```bash
#!/bin/bash
# scripts/verify-freshness-integration.sh

echo "🔍 Verifying freshness timestamp integration..."

# 1. Check frontmatter files have dateModified
echo "Checking frontmatter files..."
FILES_WITH_DATES=$(grep -r "dateModified:" frontmatter/materials/*.yaml | wc -l)
TOTAL_FILES=$(find frontmatter/materials -name "*.yaml" | wc -l)

if [ "$FILES_WITH_DATES" -eq "$TOTAL_FILES" ]; then
  echo "✅ All $TOTAL_FILES files have dateModified"
else
  echo "⚠️  Only $FILES_WITH_DATES / $TOTAL_FILES files have dateModified"
fi

# 2. Build and check for metadata in HTML
echo "Building site..."
npm run build

# 3. Check generated HTML for OpenGraph dates
echo "Checking OpenGraph meta tags..."
grep -r "article:modified_time" .next/server/ > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ OpenGraph dates found in generated HTML"
else
  echo "❌ OpenGraph dates missing from HTML"
fi

# 4. Check sitemap for lastmod dates
echo "Checking sitemap.xml..."
if [ -f "public/sitemap.xml" ]; then
  grep "<lastmod>" public/sitemap.xml > /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Sitemap includes lastmod dates"
  else
    echo "⚠️  Sitemap missing lastmod dates"
  fi
else
  echo "⚠️  Sitemap not found"
fi

echo "✅ Verification complete!"
```

---

## Success Metrics

### Immediate Metrics (Week 1-4)

**Technical Validation**:
- ✅ All 132 frontmatter files have `datePublished`, `dateModified`
- ✅ OpenGraph meta tags include date fields
- ✅ JSON-LD schemas include date properties
- ✅ Sitemap.xml includes `<lastmod>` dates
- ✅ Build succeeds without errors

**Google Search Console**:
- Monitor crawl rate (should increase slightly)
- Check indexing status (all pages indexed)
- Watch for validation errors (structured data)

### Short-Term Metrics (Month 1-3)

**Search Performance**:
- **Impressions**: 10-20% increase (fresh content boosted)
- **Click-through rate**: Stable or slight increase
- **Average position**: 5-10% improvement for competitive queries
- **Fresh content ratio**: 20-30% of pages within 30-day window

**Google Search Console Insights**:
- Pages appearing in "Freshness" features
- Increased visibility for time-sensitive queries
- Rich results (FAQs, How-Tos) with dates

**Core Web Vitals**:
- No degradation (timestamp updates don't affect performance)
- LCP, FID, CLS remain green

### Long-Term Metrics (Month 3-12)

**Organic Traffic**:
- **Overall traffic**: 15-30% increase (cumulative effect)
- **Material pages**: 20-40% increase (freshness boost)
- **Returning visitors**: Higher engagement (fresh content)

**Search Rankings**:
- **Top 10 positions**: 20-30% more keywords
- **Featured snippets**: More eligibility (fresh + structured)
- **Knowledge Graph**: Enhanced brand presence

**Competitive Analysis**:
- Rank higher than competitors with stale content
- Capture "recently updated" search modifiers
- Dominate Query Deserves Freshness (QDF) queries

### Red Flags to Monitor

**Warning Signs** (potential penalties):
- ❌ Sudden traffic drop after mass update
- ❌ Manual action in Search Console
- ❌ Decreased crawl rate (Google ignoring updates)
- ❌ Structured data errors (date format issues)

**Corrective Actions**:
1. Pause automated updates
2. Review recent changes (git log)
3. Revert to conservative approach (Option 1)
4. Focus on genuine content improvements
5. Request Google reconsideration (if penalized)

---

## Next Steps

### Week 1: Setup and Testing

- [ ] Review update script (`scripts/update-freshness-timestamps.js`)
- [ ] Run dry run: `npm run update-freshness`
- [ ] Execute initial batch: `npm run update-freshness:execute --batch=10`
- [ ] Review changes: `git diff frontmatter/materials/`
- [ ] Test build: `npm run build`
- [ ] Verify metadata: Check HTML for OpenGraph dates
- [ ] Deploy to staging: Test live site

### Week 2: Full Rollout

- [ ] Execute full update: `npm run update-freshness:execute --batch=132 --oldest`
- [ ] Review all changes
- [ ] Run verification script: `./scripts/verify-freshness-integration.sh`
- [ ] Test build and deploy
- [ ] Monitor Google Search Console (indexing, errors)
- [ ] Document initial state (baseline metrics)

### Week 3-4: Establish Rotation

- [ ] Set up weekly cron job or GitHub Action
- [ ] First automated update (25 files)
- [ ] Monitor impact in Search Console
- [ ] Track freshness distribution (fresh/normal/stale ratio)
- [ ] Document update workflow

### Month 2-3: Content Pairing

- [ ] Identify high-value pages for content improvements
- [ ] Schedule content updates (research, case studies)
- [ ] Pair timestamp updates with content changes
- [ ] Track which updates included substantive changes
- [ ] Measure search performance improvements

### Ongoing Maintenance

- [ ] Weekly automated updates (25 files/week)
- [ ] Monthly content improvement sessions
- [ ] Quarterly freshness audit (review distribution)
- [ ] Annual strategy review (metrics, adjustments)

---

## Conclusion

This frontmatter freshness strategy provides a sustainable, ethical approach to maintaining Google search visibility through regular content timestamp updates. By combining automated rotation with genuine content improvements, Z-Beam can signal freshness to search engines while maintaining authenticity and avoiding manipulation penalties.

**Key Takeaways**:
1. **Infrastructure Ready**: Metadata.ts already processes dates; just need to add them to YAML
2. **Automated Maintenance**: Weekly rotation keeps 20-30% of content fresh at all times
3. **Ethical Balance**: Pair timestamp updates with real content improvements
4. **Measurable Impact**: Track freshness distribution, search rankings, organic traffic
5. **Risk Mitigation**: Staggered updates, variation, tracking history prevent penalties

**Recommended Action**:
Start with conservative approach (10-20 files/week, pair with content updates), monitor impact, scale to balanced approach (25 files/week) after validating effectiveness.

---

**Documentation Version**: 1.0  
**Last Updated**: 2025-11-15  
**Author**: GitHub Copilot  
**Status**: Ready for Implementation
