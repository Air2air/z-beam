# Prebuild Validation Quick Reference

## Overview

The prebuild pipeline validates content, configuration, and architecture before building the Next.js application. All validations must pass for a successful deployment.

## Prebuild Chain

```bash
validate:deps → validate:frontmatter → validate:naming → validate:metadata → 
verify:sitemap → validate:jsonld → validate:breadcrumbs → generate:datasets
```

**Total execution time:** ~30-60 seconds

---

## Commands

### Run Complete Prebuild

```bash
npm run prebuild
```

### Run Individual Validations

```bash
# Check dependencies
npm run validate:deps

# Validate frontmatter structure (sample)
npm run validate:frontmatter

# Validate frontmatter structure (all files)
npm run validate:frontmatter:full

# Validate naming conventions
npm run validate:naming

# Validate metadata sync
npm run validate:metadata

# Verify sitemap configuration
npm run verify:sitemap

# Validate JSON-LD architecture
npm run validate:jsonld

# Validate breadcrumbs
npm run validate:breadcrumbs

# Generate datasets
npm run generate:datasets
```

### Build Commands

```bash
# Full build with all validations
npm run build

# Fast build (skip prebuild validations)
npm run build:fast

# Postbuild validation only
npm run postbuild  # or npm run validate:urls
```

---

## Validation Details

### 1. validate:deps ✅

**Purpose:** Ensure all required npm packages are installed  
**Script:** `scripts/validation/validate-dependencies.js`  
**Exit Code:** 1 if any dependencies missing  
**Fix:** Follow installation instructions in output

### 2. validate:frontmatter

**Purpose:** Validate YAML frontmatter matches TypeScript types  
**Script:** `scripts/validation/content/validate-frontmatter-structure.js`  
**Flags:**
- Default: Checks first 10 files (fast)
- `--full`: Checks all files (recommended for CI/CD)

**Checks:**
- Forbidden properties (applications, environmentalImpact, beforeText, afterText)
- Caption structure (before/after format)
- Property type mismatches

**Fix:** Update YAML files to match expected structure

### 3. validate:naming

**Purpose:** Enforce consistent naming conventions  
**Script:** `scripts/validation/content/validate-naming-e2e.js`  
**Dependencies:** js-yaml, glob

**Checks:**
- Slug format (lowercase, hyphens only)
- File names (no underscores, no uppercase)
- Image paths and naming patterns
- Author ID format
- Category/subcategory consistency
- Legacy pattern detection

**Fix:** Rename files or update slugs to follow conventions

### 4. validate:metadata

**Purpose:** Validate frontmatter completeness  
**Script:** `scripts/validation/content/validate-metadata-sync.js`  
**Dependencies:** js-yaml, glob

**Checks:**
- Required fields (name, title, category, images, author)
- Image file existence
- Author data completeness
- Generation timestamps

**Fix:** Add missing fields or correct image paths

### 5. verify:sitemap

**Purpose:** Verify sitemap generation configuration  
**Script:** `scripts/sitemap/verify-sitemap.sh`  
**Type:** Bash script

**Checks:**
- sitemap.ts file exists
- Dynamic article generation enabled
- Static routes present
- Material categories configured
- Article file count validation

**Fix:** Update sitemap.ts or add missing routes

### 6. validate:jsonld

**Purpose:** Enforce JSON-LD architecture rules  
**Script:** `tests/architecture/jsonld-enforcement.test.ts`  
**Type:** Jest test suite

**Checks:**
- No hardcoded JSON-LD in page components
- Proper use of StaticPage component
- No legacy JSON-LD utility imports
- Dynamic schema generation only

**Fix:** Refactor pages to use StaticPage or schema utilities

### 7. validate:breadcrumbs

**Purpose:** Validate explicit breadcrumb arrays  
**Script:** `scripts/validation/content/validate-breadcrumbs.ts`  
**Dependencies:** tsx, js-yaml

**Checks:**
- Breadcrumb field presence
- Minimum 2 items (Home + current)
- Home breadcrumb format
- href format (no trailing slash except Home)

**Fix:** Run `npm run migrate:breadcrumbs` or add manually

### 8. generate:datasets

**Purpose:** Generate JSON/CSV/TXT dataset files  
**Scripts:**
- `scripts/generate-datasets.ts` (materials)
- `scripts/generate-settings-datasets.js` (settings)

**Output:**
- `public/datasets/materials/`
- `public/datasets/settings/`

**Fix:** Check console output for specific file errors

---

## Postbuild Validation

### validate:urls

**Purpose:** Validate JSON-LD URLs in built pages  
**Script:** `scripts/validation/jsonld/validate-jsonld-urls.js`  
**Timing:** Runs after `next build` completes

**Checks:**
- JSON-LD URLs match hierarchical structure
- No old flat URL patterns
- Material pages use correct path format

**Fix:** Update URL generation in schema utilities

---

## Dependencies

| Package | Version | Type | Used By |
|---------|---------|------|---------|
| js-yaml | ^4.1.0 | prod | validate-naming, validate-metadata, validate-breadcrumbs |
| glob | ^11.0.3 | prod | validate-naming, validate-metadata |
| tsx | ^4.20.6 | dev | validate-breadcrumbs, generate-datasets |
| jest | ^30.0.5 | dev | validate:jsonld |
| jsdom | (indirect) | dev | validate:urls |

---

## Troubleshooting

### Missing Dependencies

```bash
npm run validate:deps
# Follow installation instructions
```

### Validation Failures

1. **Read the error output carefully** - scripts provide specific file names and issues
2. **Run individual validation** to isolate the problem
3. **Check recent changes** to frontmatter or configuration files
4. **Use verbose flags** where available (e.g., `--verbose`, `--full`)

### Build Failures

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Skip Validations (Not Recommended)

```bash
# Skip prebuild, run build only
npm run build:fast

# Skip deployment validations
npm run deploy:skip
```

---

## CI/CD Integration

### Recommended Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci --legacy-peer-deps --include=dev"
}
```

**.vercelignore:**
Ensure these are NOT ignored:
- `scripts/validation/`
- `scripts/generate-datasets.ts`
- `scripts/generate-settings-datasets.js`
- `scripts/sitemap/`

### Environment-Specific Settings

**Production:**
```bash
# Use full validation
npm run validate:frontmatter:full
```

**Development:**
```bash
# Use sample validation for speed
npm run validate:frontmatter
```

---

## Performance Tips

1. **Use sample validation locally** - `validate:frontmatter` checks 10 files
2. **Use full validation in CI/CD** - `validate:frontmatter:full` checks all files
3. **Run individual validations** during development instead of full prebuild
4. **Cache node_modules** in CI/CD to speed up installations
5. **Parallelize independent validations** (future enhancement)

---

## Exit Codes

- **0:** Success - validation passed
- **1:** Failure - validation found errors
- **2:** Critical failure - script execution error

All validations exit with code 1 on failure to halt the build process.

---

## Common Fixes

### Image Path Errors

```yaml
# ❌ Wrong
images:
  hero: images/material-hero.jpg

# ✅ Correct
images:
  hero: /images/materials/aluminum-laser-cleaning-hero.jpg
```

### Caption Structure

```yaml
# ❌ Wrong
caption:
  beforeText: "Before cleaning"
  afterText: "After cleaning"

# ✅ Correct
caption:
  before: "Before cleaning"
  after: "After cleaning"
```

### Slug Format

```yaml
# ❌ Wrong
name: Aluminum_Alloy
name: AluminumAlloy
name: aluminum-alloy-

# ✅ Correct
name: aluminum-alloy
```

### Breadcrumb Format

```yaml
# ❌ Wrong
breadcrumb:
  - Home
  - Materials

# ✅ Correct
breadcrumb:
  - label: Home
    href: /
  - label: Materials
    href: /materials/metal/alloy/aluminum-laser-cleaning
```

---

## Updates & Maintenance

**Last Updated:** November 14, 2025  
**Version:** 2.0  
**Changes:**
- Added validate:deps for dependency checking
- Added --full flag to validate:frontmatter
- Improved error handling and exit codes
- Added jsdom indirect dependency detection

---

## Support

For issues or questions:
1. Check this reference guide
2. Review error messages carefully
3. Check `docs/` directory for detailed documentation
4. Review script source code for implementation details
