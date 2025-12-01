# Production URL Policy

**Created**: December 1, 2025  
**Status**: MANDATORY  
**Enforcement**: Pre-build validation + CI/CD checks

---

## Overview

All absolute URLs in the Z-Beam codebase MUST use the production domain (`https://www.z-beam.com`) in generated content, datasets, and production validation. This policy prevents localhost URLs from appearing in:

- Public datasets (JSON, CSV, TXT files)
- Schema.org/JSON-LD structured data
- Sitemaps and canonical URLs
- SEO metadata
- Citation and attribution fields

---

## Production Domain

```
PRODUCTION_URL: https://www.z-beam.com
```

**Source of Truth**: `app/config/site.ts` → `SITE_CONFIG.url`

```typescript
url: process.env.NODE_ENV === 'production' 
  ? 'https://www.z-beam.com' 
  : 'http://localhost:3000',
```

---

## ✅ Required Patterns

### 1. Dataset Generation

All dataset generators MUST use `SITE_CONFIG.url`:

```typescript
import { SITE_CONFIG } from '../app/config/site.js';

const baseUrl = SITE_CONFIG.url;  // ✅ Correct
const materialUrl = `${baseUrl}/materials/${category}/${subcategory}/${slug}`;
```

### 2. Validation Scripts

Validation scripts MUST default to production URL:

```javascript
// ✅ CORRECT: Default to production
const BASE_URL = process.env.BASE_URL || 'https://www.z-beam.com';

// ❌ WRONG: Default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
```

### 3. Schema.org/JSON-LD

All `@id` and URL fields MUST use production domain:

```json
{
  "@id": "https://www.z-beam.com/materials/metal/alloy/aluminum-laser-cleaning#dataset",
  "url": "https://www.z-beam.com/materials/metal/alloy/aluminum-laser-cleaning"
}
```

### 4. Pre-Deploy Validation

Pre-deploy tests SHOULD run against production URL when possible:

```bash
# Pre-deploy: Use production URL
BASE_URL=https://www.z-beam.com npm run validate:seo-infrastructure

# Post-deploy: Verify production
npm run validate:production -- --url=https://www.z-beam.com
```

---

## ❌ Prohibited Patterns

### 1. Localhost in Production Assets

```json
// ❌ NEVER in public datasets
{
  "@id": "http://localhost:3000/materials/...",
  "contentUrl": "http://localhost:3000/datasets/..."
}
```

### 2. Hardcoded localhost Defaults

```javascript
// ❌ WRONG: localhost as default
const DEFAULT_URL = 'http://localhost:3000';
```

### 3. Missing Environment Variable Handling

```javascript
// ❌ WRONG: No fallback to production
const url = process.env.TEST_URL;  // Undefined in CI
```

---

## Environment-Specific Behavior

| Environment | URL Behavior |
|-------------|--------------|
| Development (`npm run dev`) | `http://localhost:3000` for testing |
| Build (`npm run build`) | `https://www.z-beam.com` in generated files |
| CI/CD Pre-deploy | `https://www.z-beam.com` for static validation |
| CI/CD Post-deploy | `https://www.z-beam.com` for live verification |
| Production | `https://www.z-beam.com` everywhere |

---

## Validation Script Defaults

These validation scripts MUST default to production URL:

| Script | Environment Variable | Default |
|--------|---------------------|---------|
| `validate-seo-infrastructure.js` | `BASE_URL` | `https://www.z-beam.com` |
| `validate-modern-seo.js` | `VALIDATION_URL` | `https://www.z-beam.com` |
| `validate-core-web-vitals.js` | `TEST_URL` | `https://www.z-beam.com` |
| `validate-accessibility-tree.js` | `TEST_URL` | `https://www.z-beam.com` |
| `validate-jsonld-comprehensive.js` | `BASE_URL` | `https://www.z-beam.com` |
| `validate-schema-richness.js` | `VALIDATION_URL` | `https://www.z-beam.com` |

---

## Local Development Override

For local testing, explicitly set the URL:

```bash
# Test against local dev server
BASE_URL=http://localhost:3000 npm run validate:seo-infrastructure

# Run local validation suite
npm run validate:dev  # Uses localhost
```

---

## Enforcement

### 1. Pre-Build Check

```bash
# Check for localhost in datasets (should find ZERO)
grep -r "localhost:3000" public/datasets/materials/*.json | wc -l
# Expected: 0
```

### 2. CI/CD Gate

```yaml
# GitHub Actions / Vercel Build
- name: Verify no localhost in production assets
  run: |
    if grep -r "localhost:3000" public/datasets/materials/*.json; then
      echo "ERROR: localhost found in production datasets"
      exit 1
    fi
```

### 3. Test Suite

```typescript
// tests/test-production-urls.ts
describe('Production URL Policy', () => {
  test('no localhost in dataset files', async () => {
    const files = glob.sync('public/datasets/materials/*.json');
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('localhost');
    }
  });
});
```

---

## Regenerating Datasets

If localhost URLs are found in datasets, regenerate:

```bash
# 1. Ensure production environment
NODE_ENV=production

# 2. Regenerate all datasets
npm run generate:datasets

# 3. Verify no localhost
grep -r "localhost" public/datasets/materials/*.json | wc -l
# Should be 0
```

---

## Related Documentation

- `app/config/site.ts` - SITE_CONFIG source of truth
- `scripts/generate-datasets.ts` - Dataset generator
- `scripts/validation/README.md` - Validation scripts documentation
- `DEPLOY_VALIDATION_REFERENCE.md` - Deployment validation guide

---

## Changelog

- **December 1, 2025**: Policy established
