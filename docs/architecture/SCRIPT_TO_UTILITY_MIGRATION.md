# Script-to-Utility Migration Strategy

## Overview

Convert external Node.js scripts into TypeScript utilities that run automatically as part of the application's data loading pipeline. This follows the pattern established with `regulatoryStandardsNormalizer.ts`.

## Benefits

### 1. **Automatic Execution**
- No manual script runs needed
- Data normalized at load time
- Always consistent across all environments

### 2. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- Better IDE integration

### 3. **Maintainability**
- Centralized in `/app/utils/`
- Single source of truth
- Version controlled with app code

### 4. **Performance**
- Cached with React's `cache()` function
- No separate process overhead
- Runs only when needed

## Migration Pattern

### Phase 1: Identify Script Type

Scripts fall into three categories:

#### A. **Data Normalizers** (Migrate to Utils)
Transform data on-the-fly during load time.

**Examples:**
- `fix-unknown-regulatory-standards.js` → `regulatoryStandardsNormalizer.ts` ✅
- `normalize-categories.js` → `categoryNormalizer.ts`
- `fix-frontmatter-unicode.js` → `unicodeNormalizer.ts`
- `fix-category-names.js` → Merge into `categoryNormalizer.ts`

**Pattern:**
```typescript
// app/utils/[domain]Normalizer.ts
export interface InputType {
  // Define data structure
}

export function normalize[Domain](data: InputType): OutputType {
  // Pure function transformation
  return normalizedData;
}
```

**Integration Point:**
```typescript
// app/utils/contentAPI.ts
import { normalizeDomain } from './domainNormalizer';

const loadFrontmatterDataInline = cache(async (slug: string) => {
  const data = yaml.load(fileContent) as any;
  
  // Apply normalizations
  if (data.someField) {
    data.someField = normalizeDomain(data.someField);
  }
  
  return data;
});
```

#### B. **Batch Updaters** (Keep as Scripts)
One-time data fixes that permanently modify files.

**Examples:**
- `rename-image-files.js`
- `convert-author-ids.js`
- `update-freshness-timestamps.js`

**Keep because:**
- Run once during migration
- Modify source files permanently
- Not needed at runtime

#### C. **Development Tools** (Keep as Scripts)
Build-time or development utilities.

**Examples:**
- `validate-metadata-sync.js`
- `validate-naming-e2e.js`
- `componentAudit.ts`
- All `/scripts/audit/` scripts

**Keep because:**
- Part of CI/CD pipeline
- Development validation
- Not part of user-facing runtime

### Phase 2: Create Utility Module

**File Structure:**
```
app/utils/
├── normalizers/
│   ├── categoryNormalizer.ts
│   ├── unicodeNormalizer.ts
│   ├── regulatoryStandardsNormalizer.ts
│   └── index.ts (re-exports)
└── contentAPI.ts (integration point)
```

**Template:**
```typescript
/**
 * @module [domain]Normalizer
 * @purpose [What it normalizes and why]
 * @dependencies [List dependencies]
 * @usage Import normalize[Domain] and apply to frontmatter.[field]
 */

export interface [Domain]Data {
  // Type definition
}

// Mapping/config constants
const NORMALIZATION_MAP = {
  // mappings
};

/**
 * Normalize [domain] data
 * @param data - Raw data from frontmatter
 * @returns Normalized data
 */
export function normalize[Domain](
  data: [Domain]Data | undefined
): [Domain]Data {
  if (!data) return defaultValue;
  
  // Normalization logic
  return normalized;
}

// Export helper functions if needed
export function identify[Thing](input: string): Result | null {
  // Helper logic
}
```

### Phase 3: Integration

**Add to contentAPI.ts:**
```typescript
import { 
  normalizeDomain1,
  normalizeDomain2,
  normalizeRegulatoryStandards 
} from './normalizers';

const loadFrontmatterDataInline = cache(async (slug: string) => {
  const yaml = await import('js-yaml');
  const data = yaml.load(fileContent) as any;
  
  // Apply all normalizations
  if (data.category) {
    data.category = normalizeCategory(data.category);
  }
  
  if (data.subcategory) {
    data.subcategory = normalizeSubcategory(data.subcategory);
  }
  
  if (data.description) {
    data.description = normalizeUnicode(data.description);
  }
  
  if (data.regulatoryStandards) {
    data.regulatoryStandards = normalizeRegulatoryStandards(
      data.regulatoryStandards
    );
  }
  
  return data;
});
```

### Phase 4: Deprecate Script

1. **Keep script temporarily** for batch updates
2. **Add deprecation notice:**
```javascript
#!/usr/bin/env node
/**
 * @deprecated This functionality is now handled automatically
 *             by app/utils/normalizers/categoryNormalizer.ts
 * 
 * This script remains for one-time batch updates only.
 * For new materials, normalization happens at load time.
 */
```

3. **Move to `/scripts/deprecated/`** after transition period
4. **Document in migration log**

## Priority Migration Candidates

### High Priority (Immediate Value)

#### 1. **Category/Subcategory Normalization**
```typescript
// app/utils/normalizers/categoryNormalizer.ts

const CATEGORY_MAP: Record<string, string> = {
  'Metal': 'metal',
  'Ceramic': 'ceramic',
  'Composite': 'composite',
  'Polymer': 'polymer',
  'Wood': 'wood',
  'Stone': 'stone',
  'Glass': 'glass',
  'Rare-Earth': 'rareearth',
  'Natural': 'natural'
};

export function normalizeCategory(category: string | undefined): string {
  if (!category) return '';
  
  // Check mapping first
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  
  // Fallback: lowercase and remove hyphens
  return category.toLowerCase().replace(/-/g, '');
}

export function normalizeSubcategory(
  subcategory: string | undefined
): string {
  if (!subcategory) return '';
  return subcategory.toLowerCase().replace(/\s+/g, '-');
}
```

**Scripts to Replace:**
- `normalize-categories.js` (195 lines)
- `fix-category-names.js` (177 lines)

**Integration:**
```typescript
// In contentAPI.ts loadFrontmatterDataInline
if (data.category) {
  data.category = normalizeCategory(data.category);
}
if (data.subcategory) {
  data.subcategory = normalizeSubcategory(data.subcategory);
}
```

#### 2. **Unicode Character Normalization**
```typescript
// app/utils/normalizers/unicodeNormalizer.ts

const UNICODE_MAP: Record<string, string> = {
  '\\xB3': '³',  // superscript 3
  '\\xB2': '²',  // superscript 2
  '\\xB9': '¹',  // superscript 1
  '\\xB0': '°',  // degree symbol
  '\\xB5': 'µ',  // micro
  '\\u03BC': 'μ', // mu
  '\\u03A9': 'Ω', // Omega
  // ... full map
};

export function normalizeUnicode(text: string | undefined): string {
  if (!text) return '';
  
  let normalized = text;
  
  for (const [escape, char] of Object.entries(UNICODE_MAP)) {
    normalized = normalized.split(escape).join(char);
  }
  
  return normalized;
}

export function normalizeAllTextFields(data: any): any {
  // Recursively normalize all string fields
  if (typeof data === 'string') {
    return normalizeUnicode(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(normalizeAllTextFields);
  }
  
  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = normalizeAllTextFields(value);
    }
    return result;
  }
  
  return data;
}
```

**Scripts to Replace:**
- `fix-frontmatter-unicode.js` (105 lines)

**Integration:**
```typescript
// In contentAPI.ts loadFrontmatterDataInline
const data = yaml.load(fileContent) as any;

// Apply unicode normalization to all text
const normalized = normalizeAllTextFields(data);
```

### Medium Priority (Nice to Have)

#### 3. **Image Path Normalization**
Already partially exists via `stripParenthesesFromImageUrl`, but could be expanded:

```typescript
// app/utils/normalizers/imagePathNormalizer.ts

export function normalizeImagePath(imagePath: string | undefined): string {
  if (!imagePath) return '';
  
  let normalized = imagePath;
  
  // Strip parentheses
  normalized = normalized.replace(/[()]/g, '');
  
  // Ensure leading slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // Normalize extensions
  normalized = normalized.replace(/\.jpeg$/i, '.jpg');
  
  return normalized;
}

export function normalizeAllImages(data: any): any {
  if (data.images) {
    for (const [key, value] of Object.entries(data.images)) {
      if (value && typeof value === 'object' && 'url' in value) {
        value.url = normalizeImagePath(value.url);
      }
    }
  }
  return data;
}
```

### Low Priority (Keep as Scripts)

These should remain as standalone scripts:

1. **Validation Scripts** (CI/CD integration)
   - `validate-metadata-sync.js`
   - `validate-naming-e2e.js`
   - `validate-jsonld-syntax.js`

2. **Audit Tools** (development utilities)
   - `componentAudit.ts`
   - `scripts/audit/*.sh`

3. **One-time Migrations** (historical)
   - `convert-author-ids.js`
   - `rename-image-files.js`
   - `update-freshness-timestamps.js`

4. **Build Tools** (build process)
   - `buildValidation.ts`
   - `sitemap/*`

## Implementation Checklist

### For Each Migration:

- [ ] Create utility module in `/app/utils/normalizers/`
- [ ] Define TypeScript interfaces
- [ ] Implement pure normalization function(s)
- [ ] Add unit tests (if appropriate)
- [ ] Integrate into `contentAPI.ts`
- [ ] Test with dev server
- [ ] Verify no TypeScript errors
- [ ] Run original script to update existing files
- [ ] Add deprecation notice to script
- [ ] Document in this file
- [ ] Update relevant component documentation

## Testing Strategy

### Unit Tests (Optional but Recommended)
```typescript
// __tests__/utils/categoryNormalizer.test.ts

import { normalizeCategory } from '@/app/utils/normalizers/categoryNormalizer';

describe('categoryNormalizer', () => {
  it('normalizes capitalized categories', () => {
    expect(normalizeCategory('Metal')).toBe('metal');
    expect(normalizeCategory('Ceramic')).toBe('ceramic');
  });
  
  it('handles hyphenated categories', () => {
    expect(normalizeCategory('Rare-Earth')).toBe('rareearth');
  });
  
  it('returns empty string for undefined', () => {
    expect(normalizeCategory(undefined)).toBe('');
  });
});
```

### Integration Testing
```bash
# Start dev server
npm run dev

# Verify normalization works
# 1. Check a material page
# 2. Inspect data in React DevTools
# 3. Verify normalized values appear correctly
```

## Rollback Plan

If issues arise:

1. **Immediate:** Comment out normalization in `contentAPI.ts`
2. **Revert:** Use git to restore previous version
3. **Fallback:** Keep original scripts functional
4. **Debug:** Fix utility and re-deploy

## Success Metrics

- ✅ **Code Reduction:** Remove ~500+ lines of script code
- ✅ **Type Safety:** All normalizers fully typed
- ✅ **Automatic:** Zero manual script runs needed
- ✅ **Performance:** No measurable impact on load time
- ✅ **Reliability:** 100% consistent normalization

## Migration Timeline

### Week 1: Foundation
- ✅ Complete regulatory standards normalizer
- [ ] Create `/app/utils/normalizers/` structure
- [ ] Implement category normalizer
- [ ] Test and deploy

### Week 2: Expansion
- [ ] Implement unicode normalizer
- [ ] Add image path enhancements
- [ ] Integrate all normalizers
- [ ] Update documentation

### Week 3: Cleanup
- [ ] Run batch scripts to update existing files
- [ ] Deprecate migrated scripts
- [ ] Move to `/scripts/deprecated/`
- [ ] Final testing and validation

## Conclusion

This strategy transforms reactive, manual scripts into proactive, automatic utilities. The result is:

- **Less work:** No manual script execution
- **More reliable:** Always normalized, no human error
- **Better DX:** Type-safe, IDE-friendly code
- **Simpler:** One place for all normalizations

The pattern is proven with `regulatoryStandardsNormalizer.ts` and scales to all data normalization needs.
