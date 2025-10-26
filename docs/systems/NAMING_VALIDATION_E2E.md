# End-to-End Naming Validation System

## Overview

Comprehensive validation of naming conventions across all project assets to ensure consistency, SEO optimization, and maintainability.

## What It Validates

### ✅ File Names
- Frontmatter YAML files
- Image files
- Component files
- All content files

**Rules:**
- Lowercase only
- Hyphens for word separation (no underscores)
- Alphanumeric characters only
- Valid file extensions

### ✅ Slugs
- URL slugs in frontmatter
- Route slugs
- Content identifiers

**Rules:**
- Lowercase letters, numbers, and hyphens only
- No leading/trailing hyphens
- No double hyphens
- No special characters

### ✅ Image Paths
- Hero images
- Micro images
- Social images
- Author images

**Expected Patterns:**
- Hero: `*-laser-cleaning-hero.jpg`
- Micro: `*-laser-cleaning-micro.jpg`
- Social: `*-laser-cleaning-micro-social.jpg`
- Author: `/images/author/[name].jpg`

### ✅ Category/Subcategory
- Category: lowercase with optional hyphens (e.g., `metal`, `rare-earth`)
- Subcategory: lowercase with hyphens (e.g., `lanthanide`, `oxide`)

### ✅ Author References
- Author IDs must be lowercase slugs
- Numeric IDs are invalid (use name-based slugs)

### ✅ Cross-References
- No duplicate slugs
- Consistent naming across references

## Usage

### Quick Validation

```bash
npm run validate:naming
```

### Full Validation Suite

```bash
npm run validate:all
```

This runs:
1. Naming validation
2. Metadata sync validation
3. Startup validation
4. Content validation
5. Grok instructions validation
6. Component audit

## Common Issues Found

### 1. Uppercase in Categories

**Issue:** Categories with uppercase letters
```yaml
category: Metal  # ❌ Wrong
```

**Fix:**
```yaml
category: metal  # ✅ Correct
```

### 2. Numeric Author IDs

**Issue:** Using numeric IDs instead of slugs
```yaml
author:
  id: 3  # ❌ Wrong
```

**Fix:**
```yaml
author:
  id: alessandro-moretti  # ✅ Correct
```

### 3. Underscores in Filenames

**Issue:** Files with underscores
```
partner_netalux.png  # ❌ Wrong
```

**Fix:**
```
partner-netalux.png  # ✅ Correct
```

### 4. Name Field Mismatch

**Issue:** Name field doesn't match filename
```yaml
# File: aluminum-laser-cleaning.yaml
name: Aluminum  # ⚠️ Warning - should be aluminum-laser-cleaning
```

**Fix:**
```yaml
# File: aluminum-laser-cleaning.yaml
name: aluminum-laser-cleaning  # ✅ Correct
```

### 5. Legacy Image Patterns

**Issue:** Old image naming patterns
```yaml
images:
  hero:
    url: /images/material/aluminum-cleaning-analysis.jpg  # ❌ Wrong
```

**Fix:**
```yaml
images:
  hero:
    url: /images/material/aluminum-laser-cleaning-hero.jpg  # ✅ Correct
```

## Current Validation Results

From latest run:

```
Files Checked: 474
Slugs Validated: 132
Images Validated: 538
Naming Errors: 332
Errors: 332
Warnings: 132
```

### Main Issues

1. **132 Category Errors** - Categories need lowercase normalization
2. **132 Author ID Errors** - Author IDs should be slugs, not numbers
3. **68 Image Filename Errors** - Images with underscores need renaming

## Fixing Issues

### Automated Fixes (Recommended)

Create normalization scripts:

```bash
# Normalize categories
node scripts/normalize-categories.js

# Convert author IDs to slugs
node scripts/convert-author-ids.js

# Rename image files
node scripts/rename-image-files.js
```

### Manual Fixes

For smaller issues, edit files directly:

1. **Categories**: Convert to lowercase
2. **Author IDs**: Use slug format (e.g., `john-smith`)
3. **Images**: Rename files to use hyphens

## Integration

### Build Pipeline

Already integrated:
```json
{
  "prebuild": "npm run validate:metadata && npm run verify:sitemap",
  "vercel-build": "npm run validate:metadata && next build"
}
```

### CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Validate Naming Conventions
  run: npm run validate:naming
```

### Pre-commit Hook

```bash
#!/bin/bash
npm run validate:naming
if [ $? -ne 0 ]; then
  echo "❌ Naming validation failed"
  exit 1
fi
```

## Rules Reference

### Valid Slug Format
- ✅ `aluminum-laser-cleaning`
- ✅ `silicon-nitride`
- ✅ `rare-earth-123`
- ❌ `Aluminum-Laser-Cleaning` (uppercase)
- ❌ `aluminum_laser_cleaning` (underscore)
- ❌ `aluminum laser cleaning` (spaces)

### Valid Image Filename
- ✅ `aluminum-laser-cleaning-hero.jpg`
- ✅ `partner-netalux.png`
- ✅ `alessandro-moretti.jpg`
- ❌ `Aluminum-Hero.jpg` (uppercase)
- ❌ `partner_netalux.png` (underscore)
- ❌ `image (1).jpg` (parentheses/spaces)

### Valid Category
- ✅ `metal`
- ✅ `ceramic`
- ✅ `composite`
- ✅ `rare-earth`
- ❌ `Metal` (uppercase)
- ❌ `Rare-Earth` (mixed case)

### Valid Author ID
- ✅ `alessandro-moretti`
- ✅ `ikmanda-roswati`
- ✅ `todd-dunning`
- ❌ `1`, `2`, `3` (numeric)
- ❌ `Alessandro Moretti` (spaces/uppercase)

## Benefits

1. **SEO Optimization**
   - Clean, semantic URLs
   - Consistent image naming
   - Better crawlability

2. **Maintainability**
   - Predictable file locations
   - Easy to find/reference files
   - Reduced errors

3. **Code Quality**
   - Enforced standards
   - Automated validation
   - Early error detection

4. **Team Collaboration**
   - Clear conventions
   - Consistent patterns
   - Reduced confusion

## Roadmap

### Phase 1: Detection ✅
- [x] Create validation script
- [x] Integrate into package.json
- [x] Document rules and patterns

### Phase 2: Normalization ✅
- [x] Create category normalization script
- [x] Create author ID conversion script
- [x] Create image renaming script
- [x] Run normalization across codebase

### Phase 3: Enforcement 📋
- [ ] Add pre-commit hooks
- [ ] Add CI/CD checks
- [ ] Block builds on violations
- [ ] Create automated PR reviews

### Phase 4: Monitoring 📊
- [ ] Track naming compliance over time
- [ ] Generate compliance reports
- [ ] Set up alerts for violations
- [ ] Dashboard for team visibility

## Related Documentation

- [Image Naming Conventions](../reference/IMAGE_NAMING_CONVENTIONS.md)
- [Naming Quick Reference](../NAMING_QUICK_REFERENCE.md)
- [Metadata Sync Strategy](./METADATA_SYNC_STRATEGY.md)

---

**Created:** October 23, 2025  
**Status:** Active Implementation  
**Next Review:** After normalization scripts complete
