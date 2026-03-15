# Metadata Synchronization Strategy

## Problem Statement

In a constantly changing data environment, ensuring that page metadata, JSON-LD schemas, and OpenGraph tags accurately reflect the current state of frontmatter YAML files is critical for:

- **SEO**: Search engines must see current, accurate data
- **E-E-A-T**: Trust signals depend on data accuracy
- **User Experience**: Stale metadata confuses users
- **Cache Issues**: Build-time generation can serve outdated metadata

## Solution Architecture

### 1. **Build-Time Validation** ✅

Run metadata validation before every deployment:

```bash
npm run validate:metadata
```

**What it checks:**
- All required fields present in YAML
- Image paths exist
- Author data complete
- JSON-LD matches source frontmatter
- No parse errors

**Integration:**
```json
{
  "scripts": {
    "validate:metadata": "node scripts/validate-metadata-sync.js",
    "pre-deploy": "npm run validate:metadata && npm run build",
    "build": "next build"
  }
}
```

### 2. **Runtime Synchronization Utilities**

Use `generateSyncedMetadata()` for all metadata generation:

```typescript
import { generateSyncedMetadata } from '@/app/utils/metadata-sync';

export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  
  const { metadata, jsonLd, version } = generateSyncedMetadata(
    article.metadata,
    params.slug,
    {
      validateSync: true,  // Validate in development
      bustCache: true,     // Add version hash
      trackVersion: true   // Track generation time
    }
  );
  
  return createMetadata(metadata);
}
```

**Benefits:**
- Cache-busting through version hashes
- Automatic validation in development
- Consistent metadata generation

### 3. **Version Tracking & Cache Busting**

Each metadata generation includes a hash based on critical fields:

```typescript
{
  _sync: {
    version: "abc123",  // Changes when data changes
    generated: "2025-10-23T10:30:00Z",
    validated: true
  }
}
```

This ensures:
- CDN cache invalidation when data changes
- Easy identification of metadata staleness
- Audit trail for data changes

### 4. **Freshness Validation**

Compare file modification times with metadata generation timestamps:

```typescript
const isFresh = await validateMetadataFreshness(
  metadata,
  '/path/to/frontmatter.yaml'
);

if (!isFresh) {
  // Trigger regeneration
  console.warn('Stale metadata detected - regeneration needed');
}
```

### 5. **Client-Side Validation** (Development Only)

In development mode, validate rendered HTML matches expected metadata:

```typescript
'use client';
import { useMetadataValidation } from '@/app/utils/metadata-sync';

export function ArticlePage({ metadata }) {
  useMetadataValidation(metadata); // Warns if mismatches found
  
  return <article>...</article>;
}
```

## Implementation Checklist

### Phase 1: Validation Infrastructure ✅
- [x] Create validation script
- [x] Add metadata-sync utilities
- [ ] Add to package.json scripts
- [ ] Test with existing files

### Phase 2: Integration
- [ ] Update `generateMetadata` in all pages
- [ ] Add validation to CI/CD pipeline
- [ ] Configure pre-commit hooks
- [ ] Document for team

### Phase 3: Monitoring
- [ ] Add metadata version to HTML comments
- [ ] Create dashboard for stale metadata
- [ ] Set up alerts for validation failures
- [ ] Track sync issues in production

## Usage Examples

### Example 1: Article Page with Full Validation

```typescript
// app/[slug]/page.tsx
import { generateSyncedMetadata, validateMetadataFreshness } from '@/app/utils/metadata-sync';
import { createMetadata } from '@/app/utils/metadata';
import { getArticle } from '@/app/utils/contentAPI';
import path from 'path';

export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return { title: 'Not Found' };
  }

  // Validate freshness
  const yamlPath = path.join(
    process.cwd(),
    'frontmatter/materials',
    `${params.slug}.yaml`
  );
  
  const isFresh = await validateMetadataFreshness(
    article.metadata,
    yamlPath
  );

  // Generate synced metadata
  const { metadata, jsonLd, version } = generateSyncedMetadata(
    article.metadata,
    params.slug,
    { validateSync: process.env.NODE_ENV === 'development' }
  );

  // Add metadata version to response (useful for debugging)
  const pageMetadata = createMetadata(metadata);
  
  return {
    ...pageMetadata,
    other: {
      ...pageMetadata.other,
      'data-version': version,
      'data-fresh': isFresh
    }
  };
}
```

### Example 2: Pre-Deployment Validation

```bash
#!/bin/bash
# scripts/deploy-prod.sh

echo "🔍 Validating metadata sync..."
npm run validate:metadata

if [ $? -ne 0 ]; then
  echo "❌ Metadata validation failed - deployment blocked"
  exit 1
fi

echo "✅ Metadata validation passed"
echo "🚀 Proceeding with deployment..."
vercel --prod
```

### Example 3: GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Validate Metadata Sync
        run: npm run validate:metadata
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Best Practices

### ✅ DO:
1. **Always validate before deployment**
2. **Use `generateSyncedMetadata()` for consistency**
3. **Track version hashes for cache busting**
4. **Monitor metadata freshness in production**
5. **Run validation in CI/CD pipeline**

### ❌ DON'T:
1. **Skip validation on "minor" changes**
2. **Manually create JSON-LD (use utilities)**
3. **Ignore warnings in validation reports**
4. **Deploy with stale metadata**
5. **Cache metadata without version keys**

## Troubleshooting

### Issue: Validation Script Fails

**Solution:**
```bash
# Check for YAML syntax errors
npm run validate:metadata -- --verbose

# Test individual file
node scripts/validate-metadata-sync.js --file alumina-laser-cleaning.yaml
```

### Issue: JSON-LD Doesn't Match Frontmatter

**Cause:** JSON-LD generation logic not using all frontmatter fields

**Solution:**
1. Check `app/components/JsonLD/JsonLD.tsx` and `app/utils/schemas/SchemaFactory.ts`
2. Ensure all critical fields are included
3. Update `CRITICAL_SYNC_FIELDS` in validation script

### Issue: Metadata Appears Stale in Production

**Cause:** CDN caching or build-time staleness

**Solution:**
1. Check metadata version hash in HTML
2. Trigger manual cache clear on CDN
3. Verify source YAML file has recent modification time
4. Re-run build with fresh data

## Monitoring & Alerts

### Recommended Monitoring

```typescript
// app/utils/monitoring.ts
export function logMetadataSync(metadata: any, slug: string) {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    analytics.track('metadata_generated', {
      slug,
      version: metadata._sync?.version,
      timestamp: metadata._sync?.generated,
      validated: metadata._sync?.validated
    });
  }
}
```

### Alert Conditions

Set up alerts for:
- Validation failures in CI/CD
- Metadata staleness > 7 days
- Missing critical fields
- JSON-LD parse errors
- Image 404s

## Performance Considerations

### Build Time Impact

Validation adds ~5-10 seconds to build time:
- YAML parsing: ~2-3s
- JSON-LD generation: ~2-3s
- File system checks: ~1-2s
- Sync validation: ~2-3s

**Optimization:**
- Cache validation results per commit hash
- Parallelize file validation
- Skip unchanged files (git diff)

### Runtime Impact

`generateSyncedMetadata()` adds minimal overhead:
- Hash generation: ~1-2ms per page
- Validation (dev only): ~5-10ms per page
- Production: negligible impact

## Migration Guide

### Step 1: Install Validation Script

```bash
# Already created at scripts/validate-metadata-sync.js
npm run validate:metadata
```

### Step 2: Update Package.json

```json
{
  "scripts": {
    "validate:metadata": "node scripts/validate-metadata-sync.js",
    "prebuild": "npm run validate:metadata",
    "predeploy": "npm run validate:metadata"
  }
}
```

### Step 3: Update Page Metadata Generation

Replace manual metadata generation with:

```typescript
// Before
export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  return createMetadata(article.metadata);
}

// After
export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  const { metadata } = generateSyncedMetadata(
    article.metadata,
    params.slug
  );
  return createMetadata(metadata);
}
```

### Step 4: Add to CI/CD

Update deployment scripts to include validation.

## Related Documentation

- [JSON-LD Implementation](./JSONLD_EEAT_IMPLEMENTATION.md)
- [Metadata E-E-A-T Optimization](./METADATA_EEAT_OPTIMIZATION.md)
- [Content API](../reference/CONTENT_API.md)

---

**Last Updated:** October 23, 2025  
**Status:** Active Implementation  
**Owner:** Development Team
