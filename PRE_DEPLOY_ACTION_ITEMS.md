# Pre-Deploy Action Items
**Date**: February 8, 2026  
**Priority**: MEDIUM (Non-Blocking)

---

## Issue Found: Contact Page OG Image Mismatch

### Problem:
Contact page metadata references `og-contact.jpg` but actual file is `og-image.jpg`

### Details:
- **Expected**: `/images/og-contact.jpg` (in contact/page.tsx)
- **Actual**: `/images/og-image.jpg` (found in public/images/)
- **Impact**: Contact page OG image will not display on social media shares
- **Severity**: MEDIUM (affects social media appearance only)

---

## Solution Options

### Option 1: Rename Image File (Recommended)
**Action**: Copy/rename `og-image.jpg` to `og-contact.jpg`
```bash
cd /Users/todddunning/Desktop/Z-Beam/z-beam
cp public/images/og-image.jpg public/images/og-contact.jpg
```

**Pros**:
- No code changes needed
- Keeps metadata consistent with expectations
- Quick fix

**Cons**:
- Duplicate image file (minimal space impact)

---

### Option 2: Update Contact Page Metadata (Alternative)
**Action**: Change contact/page.tsx to reference `og-image.jpg`

**File**: `app/contact/page.tsx`  
**Line**: ~31

**Change**:
```typescript
// Before:
url: `${SITE_CONFIG.url}/images/og-contact.jpg`,

// After:
url: `${SITE_CONFIG.url}/images/og-image.jpg`,
```

**Pros**:
- No duplicate files
- Uses existing image

**Cons**:
- Requires code change
- Less specific naming (og-image.jpg is generic)

---

### Option 3: Create Proper Contact OG Image (Best Practice)
**Action**: Design contact-specific OG image with contact form preview

**Details**:
- Size: 1200×630 pixels
- Format: WebP or JPG
- Content: Contact form visual, Z-Beam branding, "Get a Free Quote" text
- Save as: `public/images/og-contact.jpg`

**Pros**:
- Most professional solution
- Contact-specific visual for social shares
- Better brand consistency

**Cons**:
- Requires design work
- Time investment

---

## Recommended Action

**Choose Option 1** (Quick Fix):

```bash
cd /Users/todddunning/Desktop/Z-Beam/z-beam
cp public/images/og-image.jpg public/images/og-contact.jpg
git add public/images/og-contact.jpg
git commit -m "Add contact page OG image"
```

**Timeline**: 1 minute  
**Impact**: Immediate resolution

---

## Verification Steps

After implementing solution:

1. **Test Social Media Preview**:
   - Use Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Use Twitter Card Validator: https://cards-dev.twitter.com/validator
   - URL: https://www.z-beam.com/contact

2. **Verify Image Loads**:
   - Open: https://www.z-beam.com/images/og-contact.jpg
   - Should display 1200×630 image

3. **Check Metadata**:
   ```bash
   curl -I https://www.z-beam.com/contact | grep -i "x-powered-by\|content-type"
   ```

4. **Lighthouse Audit**:
   - Run audit on contact page
   - Verify social media meta tags section

---

## Optional: datasets.yaml Cleanup

### Action: Remove Orphaned YAML File

**Command**:
```bash
cd /Users/todddunning/Desktop/Z-Beam/z-beam
rm static-pages/datasets.yaml
git add static-pages/datasets.yaml
git commit -m "Remove orphaned datasets.yaml (no route exists)"
```

**Justification**:
- File exists but no `/datasets` route implemented
- Materials page serves as database/dataset page
- No functionality impact

**Priority**: LOW  
**Timeline**: 30 seconds

---

## Deployment Status

### Current Status: ✅ READY FOR DEPLOYMENT

**Blocking Issues**: NONE

**Non-Blocking Issues**:
1. Contact page OG image mismatch (MEDIUM priority)
2. Orphaned datasets.yaml file (LOW priority)

**Recommendation**: Deploy now, fix contact OG image post-deploy

---

## Post-Deploy Verification Checklist

After deployment to production:

- [ ] Test contact page OG image on Facebook/Twitter
- [ ] Run Google Rich Results Test on all pages
- [ ] Verify Core Web Vitals in production
- [ ] Check sitemap accessibility
- [ ] Monitor Google Search Console for schema warnings
- [ ] Run Lighthouse audit on production URLs

---

*Document created: February 8, 2026*  
*Related: PRE_DEPLOY_VALIDATION_REPORT.md, STATIC_PAGE_SEO_AUDIT.md*
