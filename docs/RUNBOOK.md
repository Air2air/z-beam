# Z-Beam Development Runbook
**Essential procedures for common development tasks**

## Table of Contents
- [Adding New Material](#adding-new-material)
- [Adding New Component Type](#adding-new-component-type)
- [Updating Schema](#updating-schema)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Emergency Procedures](#emergency-procedures)

---

## Adding New Material

### 1. Create YAML Frontmatter File
```bash
# Location: frontmatter/materials/[category]/[subcategory]/[material-name].yaml
cp frontmatter/materials/metal/alloy/aluminum.yaml \
   frontmatter/materials/metal/alloy/new-material.yaml
```

### 2. Update YAML Content
Required fields:
```yaml
id: new-material                    # lowercase-with-dashes
name: New Material                  # Display name
category: Metal                     # Top-level category
subcategory: Alloy                  # Subcategory
content_type: materials             # Always 'materials'
schema_version: 5.0.0               # Current schema version
datePublished: "2025-12-20T00:00:00Z"
dateModified: "2025-12-20T00:00:00Z"

# Author information (required)
author:
  id: 1
  name: "Author Name"
  country: "US"
  email: "author@z-beam.com"

# Breadcrumb navigation (required)
breadcrumb:
  - label: Home
    href: /
  - label: Materials
    href: /materials
  - label: New Material
    href: /materials/metal/alloy/new-material
```

### 3. Validate YAML
```bash
npm run validate:yaml
# or
node scripts/validate-yaml-schemas.js
```

### 4. Generate Images
Required images:
- `public/images/materials/new-material-hero.webp` (1200x630)
- `public/images/materials/new-material-micro.webp` (400x300)

### 5. Run Tests
```bash
npm test -- tests/datasets/generation.test.js
npm test -- tests/integration/yaml-typescript-integration.test.ts
```

### 6. Commit Changes
```bash
git add frontmatter/materials/
git add public/images/materials/
git commit -m "Add new-material frontmatter and images"
```

---

## Adding New Component Type

### 1. Create Prompt Template
```bash
# Location: prompt catalog entry `prompts/components/[component-name].txt`
# (edit in z-beam-generator/prompts/registry/prompt_catalog.yaml)
nano ../z-beam-generator/prompts/registry/prompt_catalog.yaml
```

Template structure:
```
SYSTEM INSTRUCTIONS:
[How to generate this component]

CONTENT REQUIREMENTS:
- Requirement 1
- Requirement 2

FORMAT:
[Expected output format]

STYLE:
[Voice and tone guidelines]
```

### 2. Add to Config
Edit `config.yaml`:
```yaml
component_lengths:
  new_component:
    default: 100              # Default word count
    extraction_strategy: raw  # or 'before_after'
```

### 3. No Code Changes Required!
The system automatically discovers component types from:
- Prompt catalog entries (catalog.byPath keys like prompts/components/[name].txt)
- Config entries (component_lengths.[name])

### 4. Test Component Generation
```bash
# Test generation (if generator exists)
python3 run.py --material "Aluminum" --new-component
```

### 5. Verify Discovery
```bash
# Check component is registered
grep -r "new_component" generation/config/
```

---

## Updating Schema

### 1. Update JSON Schema
Edit `schemas/frontmatter-v5.0.0.json`:
```json
{
  "properties": {
    "new_field": {
      "type": "string",
      "description": "New field description"
    }
  }
}
```

### 2. Update TypeScript Types
Edit `types/centralized.ts`:
```typescript
export interface Material {
  // ... existing fields
  newField?: string;  // Add new field
}
```

### 3. Update Integration Tests
Edit `tests/integration/yaml-typescript-integration.test.ts`:
```typescript
it('should have new_field when present', () => {
  // Test new field validation
});
```

### 4. Validate All Files
```bash
node scripts/validate-yaml-schemas.js
npm test -- tests/integration/yaml-typescript-integration.test.ts
```

### 5. Update Schema Version (if breaking)
If backward incompatible:
```yaml
# Update in all frontmatter files
schema_version: 5.1.0  # Increment version
```

---

## Running Tests

### Quick Test Commands
```bash
# All tests
npm test

# Specific test file
npm test -- path/to/test.test.ts

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Integration tests only
npm test -- tests/integration/

# Unit tests only
npm test -- tests/unit/

# Isolated run (no parallel)
npm test -- --runInBand
```

### Common Test Issues

**Worker crashes:**
```bash
# Run in isolation
npm test -- tests/problematic.test.ts --runInBand
```

**Memory issues:**
```bash
# Already configured in jest.config.js
# workerIdleMemoryLimit: '1GB'
```

**Skipped tests:**
```bash
# Find all skipped tests
grep -r "describe.skip\|it.skip" tests/
```

---

## Deployment

### Pre-Deployment Checklist
- [ ] All tests passing: `npm test`
- [ ] YAML validation passing: `npm run validate:yaml`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] ESLint passing: `npm run lint`
- [ ] Build succeeds: `npm run build`

### Deployment Commands
```bash
# Production deployment (Vercel)
git push origin main

# Preview deployment
git push origin feature-branch

# Manual build test
npm run build
npm run start
```

### Post-Deployment Verification
1. Check https://z-beam.com loads
2. Verify new content appears
3. Check Console for errors
4. Test critical user flows

---

## Emergency Procedures

### Production Down

**1. Check Vercel Status:**
```bash
# Visit https://vercel.com/dashboard
# Check deployment status
```

**2. Rollback to Previous Version:**
```bash
# In Vercel dashboard:
# Deployments → Select working version → Promote to Production
```

**3. Revert Git Commit:**
```bash
git revert HEAD
git push origin main
```

### Schema Validation Failing

**1. Identify Violations:**
```bash
node scripts/validate-yaml-schemas.js
```

**2. Fix or Temporarily Disable:**
```bash
# Edit .husky/pre-commit
# Comment out validation line temporarily
# node scripts/validate-yaml-schemas.js
```

**3. Create Hotfix Branch:**
```bash
git checkout -b hotfix/schema-validation
# Fix violations
git commit -m "Fix schema violations"
git push origin hotfix/schema-validation
```

### Test Suite Failing

**1. Identify Failures:**
```bash
npm test 2>&1 | grep "FAIL"
```

**2. Run Problematic Tests in Isolation:**
```bash
npm test -- tests/failing-test.test.ts --runInBand
```

**3. Skip Tests Temporarily (Emergency Only):**
```bash
# In test file:
describe.skip('Problematic Suite', () => {
  // tests
});
```

**4. Create Issue and Fix:**
```bash
# Document in GitHub issues
# Fix in separate PR
# Re-enable tests
```

### Build Failing

**1. Check Error Message:**
```bash
npm run build 2>&1 | tail -50
```

**2. Common Fixes:**
```bash
# Clear cache
rm -rf .next/
npm run build

# Reinstall dependencies
rm -rf node_modules/
npm install
npm run build

# Check TypeScript errors
npx tsc --noEmit --skipLibCheck
```

### API Rate Limiting

**1. Check Rate Limit Status:**
```bash
# Look for 429 errors in logs
grep "429" .next/server.log
```

**2. Implement Backoff:**
```typescript
// Already implemented in retry logic
// Check app/utils/apiWrapper.ts
```

**3. Increase Limits:**
```bash
# Contact API provider
# Upgrade plan if needed
```

---

## Quick Reference

### File Locations
- **Frontmatter**: `frontmatter/[type]/[category]/[subcategory]/[name].yaml`
- **Images**: `public/images/[type]/[name]-[variant].webp`
- **Components**: `app/components/[ComponentName]/`
- **Tests**: `tests/[category]/[name].test.{ts,tsx}`
- **Config**: `app/config/site.ts`
- **Schema**: `schemas/frontmatter-v5.0.0.json`

### Important Commands
```bash
npm test                           # Run tests
npm run build                      # Build for production
npm run dev                        # Start dev server
npm run lint                       # Run ESLint
npm run validate:yaml              # Validate YAML files
node scripts/validate-yaml-schemas.js  # Direct validation
npx tsc --noEmit                   # Type check only

# Post-Deployment Validation (UPDATED - Dec 29, 2025)
npm run validate:production:simple           # Quick check (10 checks, <1s)
npm run validate:production:full             # Full check (55 checks, ~15s)
npm run validate:production:comprehensive    # Complete (76 checks, includes SEO validation)
```

---

## SEO Validation

### Running SEO Checks

**Comprehensive Validation** (recommended after deployment):
```bash
npm run validate:production:comprehensive
```

**What Gets Validated**:
- ✅ **Core Web Vitals Optimizations** (6 checks)
  - Preconnect hints (Vercel Vitals, GTM)
  - Hero image preload (LCP optimization)
  - Inline critical CSS (FCP optimization)
  - Responsive image sizes (CLS optimization)
  - Priority images for above-fold content
  - Expected impact: -300ms LCP, -200ms FCP, -0.03 CLS

- ✅ **Contextual Internal Linking** (6 checks)
  - Link density across sample pages
  - Average 1.55+ links per page
  - Coverage across materials/contaminants/settings
  - 250+ contextual links across 161 pages

- ✅ **Image Sitemap Quality** (8 checks)
  - 346 images indexed
  - Descriptive captions and titles
  - Icon/author directory exclusions
  - Title format quality
  - Magnification notation

### Interpreting Results

**Excellent (90-100%)**:
```
📊 Score: 94%
🎯 Grade: A
✅ All SEO improvements deployed correctly
```

**Good (80-89%)**:
```
📊 Score: 85%
🎯 Grade: B+
⚠️  Some optimizations missing, review failed tests
```

**Needs Attention (<80%)**:
```
📊 Score: 70%
🎯 Grade: C+
❌ Major issues detected, investigate immediately
```

### Common Issues & Fixes

**❌ Hero Image Preload Missing**:
```bash
# Check layout.tsx has preload link:
grep -n "hero.*preload" app/layout.tsx

# Should find:
# <link rel="preload" as="image" href="/images/hero-laser-cleaning.webp" />
```

**❌ Contextual Linking Below Threshold**:
```bash
# Check frontmatter files have contextual links:
grep -r "\[.*\](/materials/\|/contaminants/\|/settings/)" frontmatter/ | wc -l

# Should show: 250+ matches
```

**❌ Image Sitemap Issues**:
```bash
# Regenerate image sitemap:
npm run generate:image-sitemap

# Verify output:
ls -lh public/image-sitemap.xml  # Should be ~107KB
```

### Manual Verification

**Production URL Tests**:
```bash
# Test Core Web Vitals preload:
curl -s https://www.z-beam.com | grep "rel=\"preload\"" | grep hero

# Test contextual linking:
curl -s https://www.z-beam.com/materials/metal/non-ferrous/aluminum-laser-cleaning \
  | grep -o 'href="/\(materials\|contaminants\|settings\)/' | wc -l

# Test image sitemap:
curl -s https://www.z-beam.com/image-sitemap.xml | grep "<image:title>" | wc -l
```

**Expected Results**:
- Hero preload: 1 match
- Contextual links: 1-3 per page
- Image titles: 346 entries

**Documentation**: Full guide at [seo/docs/SEO_VALIDATION_GUIDE.md](../seo/docs/SEO_VALIDATION_GUIDE.md)

### Environment Variables
```bash
# Required for development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Required for production (set in Vercel)
NEXT_PUBLIC_BASE_URL=https://z-beam.com
```

### Getting Help
- **Documentation**: `docs/` directory
- **Architecture Decisions**: `docs/adr/`
- **AI Instructions**: [AI Assistant Guide](../../../z-beam-generator/docs/08-development/AI_ASSISTANT_GUIDE.md#workflow-orchestration)
- **Issue Tracker**: GitHub Issues

---

## Maintenance Schedule

### Daily
- Monitor Vercel deployments
- Check error logs
- Review failed test notifications

### Weekly
- Review skipped tests
- Check for outdated dependencies: `npm outdated`
- Review TODO comments: `grep -r "TODO" app/`

### Monthly
- Update dependencies: `npm update`
- Review and update documentation
- Archive old decision documents
- Review and update ADRs

---

**Last Updated**: December 20, 2025  
**Maintainer**: @todddunning
