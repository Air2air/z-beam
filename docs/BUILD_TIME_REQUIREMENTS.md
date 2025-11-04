# Build-Time Requirements and Automation

## Overview

This document defines the **mandatory** build-time scripts that MUST execute automatically before every production build. These scripts ensure data integrity, SEO optimization, and system reliability.

## 🚨 Critical Requirements

### Automatic Execution

All critical scripts run **automatically** via npm lifecycle hooks:

```
prebuild → build → postbuild
```

**NEVER** bypass these scripts in production builds.

---

## Build-Time Scripts

### 1. Dataset Generation (`generate:datasets`)

**Purpose**: Generate static dataset files (JSON, CSV, TXT) for all materials.

**When**: Runs in `prebuild` (before Next.js build)

**Script**: `scripts/generate-datasets.ts`

**What it does**:
- Reads all material YAML files from `frontmatter/materials/`
- Generates 3 formats per material (JSON, CSV, TXT)
- Creates enhanced Schema.org Dataset JSON-LD
- Includes E-E-A-T metadata, distribution info, data quality indicators
- Outputs to `public/datasets/materials/`

**Configuration**: Uses `SITE_CONFIG.datasets` from `app/config/site.ts`

**Example Output**:
```
public/datasets/materials/
  ├── aluminum-laser-cleaning.json  (396 files total)
  ├── aluminum-laser-cleaning.csv   (132 materials × 3 formats)
  ├── aluminum-laser-cleaning.txt
  └── ...
```

**Testing**: See `tests/build/build-time-requirements.test.ts`

**Manual Run** (development only):
```bash
npm run generate:datasets
```

---

### 2. Metadata Validation (`validate:metadata`)

**Purpose**: Ensure all content metadata is synchronized and valid.

**When**: Runs in `prebuild` AND `vercel-build`

**Script**: `scripts/validate-metadata-sync.js`

**What it does**:
- Validates frontmatter structure
- Checks required fields (title, description, category, etc.)
- Verifies metadata consistency across files
- Validates date formats and freshness timestamps
- Ensures SEO metadata is complete

**Exits with error** if validation fails, preventing build.

**Manual Run**:
```bash
npm run validate:metadata
npm run validate:metadata:verbose  # With detailed output
```

---

### 3. Naming Validation (`validate:naming`)

**Purpose**: Enforce consistent file and directory naming conventions.

**When**: Runs in `prebuild`

**Script**: `scripts/validate-naming-e2e.js`

**What it does**:
- Validates file naming patterns
- Checks directory structure
- Ensures kebab-case compliance
- Validates image file names
- Checks for naming conflicts

**Exits with error** if naming violations found.

**Manual Run**:
```bash
npm run validate:naming
```

---

### 4. Sitemap Verification (`verify:sitemap`)

**Purpose**: Verify sitemap generation and URL structure.

**When**: Runs in `prebuild`

**Script**: `scripts/sitemap/verify-sitemap.sh`

**What it does**:
- Validates `app/sitemap.ts` exports correctly
- Checks for required routes
- Verifies URL format compliance
- Ensures all content pages are included

**Note**: Sitemap itself is generated at runtime by Next.js (`app/sitemap.ts`)

**Manual Run**:
```bash
npm run verify:sitemap
```

---

### 5. URL Validation (`validate:urls`)

**Purpose**: Validate all JSON-LD URLs after build.

**When**: Runs in `postbuild` (after Next.js build)

**Script**: `scripts/validate-jsonld-urls.js`

**What it does**:
- Scans built pages for JSON-LD
- Validates URL structure
- Checks for broken links
- Ensures canonical URLs are correct
- Verifies Schema.org compliance

**Exits with error** if URL issues found.

**Manual Run**:
```bash
npm run validate:urls
```

---

## Runtime Generation (NOT Build-Time)

### JSON-LD Schema

**Important**: JSON-LD is generated **at runtime** per request, NOT at build time.

**Why**: 
- Dynamic content needs current data
- Server-side rendering provides fresh schema
- Better for SEO (always current)
- Reduces build time

**Implementation**: `app/utils/schemas/SchemaFactory.ts`

**Usage**:
```typescript
import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';

const factory = new SchemaFactory(pageData);
const jsonLd = factory.generate();
```

**Pages using runtime JSON-LD**:
- Material pages (`app/materials/[category]/[subcategory]/[slug]/page.tsx`)
- Category pages (`app/materials/[category]/page.tsx`)
- Static pages (`app/components/StaticPage/StaticPage.tsx`)
- Layout (`app/components/Layout/Layout.tsx`)

---

## Build Script Hierarchy

### Production Build (Enforced)

```bash
npm run build
```

**Execution Order**:
1. `prebuild` runs automatically:
   - `validate:naming`
   - `validate:metadata`
   - `verify:sitemap`
   - `generate:datasets`
2. `next build` runs
3. `postbuild` runs automatically:
   - `validate:urls`

**Failure**: Any script failure stops the build.

---

### Development Fast Build

```bash
npm run build:fast
```

**Execution**: Runs `next build` only, skipping validations.

**Use Case**: Local development when you know validation will pass.

**Warning**: ⚠️ Never use in production or CI/CD!

---

### Vercel Build (Production)

```bash
npm run vercel-build
```

**Execution**: 
1. `validate:metadata` (explicit)
2. `next build` (triggers `prebuild` and `postbuild`)

**Use Case**: Vercel deployments automatically use this script.

---

## Configuration Files

### Package.json Scripts

```json
{
  "scripts": {
    "prebuild": "npm run validate:naming && npm run validate:metadata && npm run verify:sitemap && npm run generate:datasets",
    "build": "next build && npm run postbuild",
    "postbuild": "npm run validate:urls",
    "build:fast": "next build",
    "generate:datasets": "tsx scripts/generate-datasets.ts",
    "validate:metadata": "node scripts/validate-metadata-sync.js",
    "validate:naming": "node scripts/validate-naming-e2e.js",
    "verify:sitemap": "bash scripts/sitemap/verify-sitemap.sh",
    "validate:urls": "node scripts/validate-jsonld-urls.js",
    "vercel-build": "npm run validate:metadata && next build"
  }
}
```

### Dataset Configuration

**File**: `app/config/site.ts`

**Section**: `SITE_CONFIG.datasets`

```typescript
datasets: {
  version: '1.0',
  license: { type: 'CC-BY-4.0', ... },
  publisher: { name: 'Z-Beam Research Lab', ... },
  catalog: { name: 'Z-Beam Material Properties Database', ... },
  quality: { verificationMethod: '...', ... },
  attribution: { required: true, ... },
  metadata: { language: 'en-US', ... },
  usageInfo: { allowedUses: [...], ... }
}
```

---

## Safety Mechanisms

### 1. No Manual Bypass Flags

❌ **Prohibited**:
- `--skip-validation`
- `--no-validate`
- `--skip-prebuild`
- `--force`
- `--ignore-errors`

✅ **Enforced**: Tests verify these flags don't exist in build scripts.

### 2. Test Coverage

**Test File**: `tests/build/build-time-requirements.test.ts`

**What it tests**:
- All critical scripts are defined
- `prebuild` includes all required scripts
- No bypass flags in production builds
- Dataset files are generated correctly
- Script execution order is correct
- CI/CD uses production build

**Run tests**:
```bash
npm run test tests/build/build-time-requirements.test.ts
```

### 3. Error Handling

All validation scripts:
- Exit with non-zero code on failure
- Stop the build immediately
- Provide clear error messages
- No error suppression (`|| true` is forbidden)

---

## Adding New Build-Time Requirements

### Step 1: Create the Script

```bash
# Example: scripts/validate-new-requirement.js
#!/usr/bin/env node

// Your validation logic
if (validationFails) {
  console.error('❌ Validation failed: reason');
  process.exit(1); // MUST exit with error
}

console.log('✅ Validation passed');
process.exit(0);
```

### Step 2: Add to package.json

```json
{
  "scripts": {
    "validate:new": "node scripts/validate-new-requirement.js",
    "prebuild": "... && npm run validate:new"
  }
}
```

### Step 3: Add Tests

Update `tests/build/build-time-requirements.test.ts`:

```typescript
it('should define validate:new script', () => {
  expect(packageJson.scripts['validate:new']).toBeDefined();
});

it('should include validate:new in prebuild', () => {
  expect(packageJson.scripts.prebuild).toContain('validate:new');
});
```

### Step 4: Document

Add to this file under "Build-Time Scripts".

---

## Troubleshooting

### Build Fails with Validation Error

1. **Read the error message** - validation scripts provide clear output
2. **Fix the issue** - don't bypass validation
3. **Test locally**: Run the failing validation script manually
4. **Verify fix**: Run `npm run build` to test full build

### Dataset Generation Fails

```bash
# Check YAML files for syntax errors
npm run generate:datasets

# Common issues:
# - Invalid YAML syntax
# - Missing required fields
# - Incorrect file naming
```

### Metadata Validation Fails

```bash
# Run with verbose output
npm run validate:metadata:verbose

# Check:
# - Frontmatter structure
# - Required fields present
# - Date formats correct
```

### Need to Skip Validation (Emergency)

**Production**: ❌ Never skip validation in production

**Development**: Use `build:fast` but understand risks:
```bash
npm run build:fast  # Skips validations
```

**After Emergency**: Fix underlying issue and restore validation.

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build  # Uses prebuild/postbuild automatically
      - run: npm test
```

### Vercel

Vercel automatically runs `vercel-build` script which includes validation.

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run vercel-build"
}
```

---

## Best Practices

### ✅ Do

- Always use `npm run build` for production
- Add new requirements to `prebuild` or `postbuild`
- Write tests for new validation scripts
- Document all build-time requirements
- Exit with error codes on validation failure
- Provide clear error messages

### ❌ Don't

- Add bypass flags to production builds
- Skip validations in CI/CD
- Use `|| true` to suppress errors
- Generate JSON-LD at build time (use runtime)
- Modify `build:fast` to be production-safe
- Ignore validation errors

---

## Maintenance

### Regular Updates

- Review build requirements quarterly
- Update dataset configuration as needed
- Add tests for new validation rules
- Keep documentation current
- Monitor build times

### Performance

- Dataset generation: ~5-10 seconds (132 materials)
- Validation scripts: ~2-5 seconds each
- Total prebuild time: ~15-30 seconds

**Optimization**: If build time becomes excessive, parallelize independent validations.

---

## Related Documentation

- [Dataset Schema Documentation](./DATASET_SCHEMA.md)
- [Validation Guide](./VALIDATION_GUIDE.md)
- [Deployment Documentation](./DEPLOYMENT.md)
- [Code Standards](./CODE_STANDARDS.md)
- [Site Configuration Guide](./guides/SITE_CONFIG_GUIDE.md)

---

## Support

Questions or issues with build-time requirements?

1. Check this documentation
2. Run tests: `npm test tests/build/`
3. Review error messages
4. Check related documentation
5. Contact team if needed

---

**Last Updated**: November 4, 2025  
**Version**: 1.0  
**Maintained By**: Z-Beam Development Team

---

## README Integration

This documentation has been integrated into the main README.md file under section 5.

**Note**: README.md has duplicate section numbers (multiple section 6s) that should be renumbered in a future cleanup.

