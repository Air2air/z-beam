# Dataset Loading Architecture

**Last Updated:** January 7, 2026  
**Status:** Documented with known issues

---

## Overview

Runtime system for loading pre-generated dataset JSON files during Next.js page rendering and API requests.

---

## Architecture

### Dual Loading System

#### 1. Server-Side Loading (Build/SSG)

**File:** `app/utils/schemas/datasetLoader.ts`

```typescript
export function loadGeneratedDataset(
  slug: string, 
  type: 'materials' | 'contaminants'
): any | null {
  const filename = type === 'materials' 
    ? `${slug}-material-dataset.json`  // Adds suffix HERE
    : `${slug.replace('-contamination', '')}-contaminant-dataset.json`;
  
  const datasetPath = path.join(
    process.cwd(), 
    'public', 
    'datasets', 
    type, 
    filename
  );
  
  // Returns parsed JSON or null if file not found
}
```

**Usage:** During Next.js static generation, server components

#### 2. Client-Side Loading (Runtime)

**File:** `app/utils/schemas/datasetLoaderClient.ts`

```typescript
export async function loadGeneratedDataset(
  slug: string,
  type: 'materials' | 'contaminants'
): Promise<any | null> {
  const filename = type === 'materials'
    ? `${slug}-material-dataset.json`  // Adds suffix HERE
    : `${slug.replace('-contamination', '')}-contaminant-dataset.json`;
  
  const response = await fetch(`/datasets/${type}/${filename}`);
  return response.ok ? await response.json() : null;
}
```

**Usage:** Dynamic content loading, client components

---

## The Duplicate Suffix Bug

### Problem Description

**SchemaFactory.ts** (line 2013-2029):

```typescript
// Line 2013: Create datasetName WITH suffix
const baseSlug = materialSlug.replace(/-laser-cleaning$/, '')...;
const datasetSuffix = isContaminant ? '-contaminant-dataset' : '-material-dataset';
const datasetName = `${baseSlug}${datasetSuffix}`;
// datasetName = "aluminum-material-dataset"

// Line 2029: Pass to loader
const generatedDataset = loadGeneratedDataset(datasetName, datasetFolder);
//                                             ^^^^^^^^^^
//                                     Already has suffix!
```

**datasetLoader.ts** (line 26):

```typescript
const filename = type === 'materials' 
  ? `${slug}-material-dataset.json`  // Adds suffix AGAIN
  //   ^^^^^
  //   This is datasetName which already has "-material-dataset"
```

**Result:**
- Expected path: `aluminum-material-dataset.json`
- Actual path: `aluminum-material-dataset-material-dataset.json`
- File not found → returns null → dataset enhancement disabled

### Why It "Works"

The system has been failing silently:
1. Wrong path → file not found → null returned
2. Null dataset → uses fallback/default data
3. Pages render with basic schema (no enhancement)
4. No error thrown → deployment succeeds

### The Fix (Attempted but Reverted)

**Change:**
```typescript
// SchemaFactory.ts line 2029
- const generatedDataset = loadGeneratedDataset(datasetName, datasetFolder);
+ const generatedDataset = loadGeneratedDataset(baseSlug, datasetFolder);
```

**Why Reverted:**
- Fix worked correctly (files loaded)
- But exposed malformed data in JSON files
- PropertyValue objects have string citations
- Causes `TypeError: e.map is not a function`
- 164 pages fail to build

**Status:** Bug remains to prevent worse error

---

## Data Extraction

### extractEnhancedFields()

**File:** `app/utils/schemas/datasetLoader.ts`

```typescript
export function extractEnhancedFields(dataset: any): EnhancedFields | null {
  if (!dataset) return null;
  
  return {
    variableMeasured: dataset.variableMeasured || [],
    citation: dataset.citation || [],
    author: dataset.author || dataset.creator,
    keywords: dataset.keywords || [],
    distribution: dataset.distribution || []
  };
}
```

**Purpose:** Extracts Schema.org fields from loaded dataset for schema enhancement

---

## Integration Points

### 1. Material Pages

**File:** `app/utils/schemas/SchemaFactory.ts`

```typescript
function generateDatasetSchema(data: any, context: SchemaContext) {
  // Load generated dataset for enhancement
  const generatedDataset = loadGeneratedDataset(datasetName, datasetFolder);
  const enhancedFields = extractEnhancedFields(generatedDataset);
  
  // Use enhanced variableMeasured (20+ items) if available
  // Falls back to dynamic generation (5-10 items) if null
  return {
    '@type': 'Dataset',
    variableMeasured: enhancedFields?.variableMeasured || dynamicMeasurements
  };
}
```

### 2. Settings Pages

**Same logic** - loads dataset from materials folder using canonical URL

### 3. API Routes

**File:** `app/api/dataset/materials/[slug]/route.ts`

Uses direct frontmatter reading, not pre-generated files

---

## Path Resolution

### Slug Normalization (Repeated Pattern)

**Found in 15+ files:**

```typescript
const baseSlug = slug
  .replace(/-laser-cleaning$/, '')
  .replace(/-settings$/, '')
  .replace(/-contamination$/, '')
  .replace(/-contaminant-dataset$/, '')
  .replace(/-material-dataset$/, '');
```

**Issues:**
- Duplicated logic everywhere
- Single fix requires 15+ file changes
- Easy to miss one and introduce bugs

**Solution:** See consolidation recommendations

### File Path Construction

**Server-side:**
```typescript
path.join(process.cwd(), 'public', 'datasets', type, filename)
```

**Client-side:**
```typescript
`/datasets/${type}/${filename}`
```

**Public URL:**
```typescript
`${baseUrl}/datasets/${type}/${filename}`
```

---

## Error Handling

### Current Behavior

**File not found:**
- Returns `null`
- No error logged
- Silent fallback to dynamic generation
- User/developer unaware of issue

**Malformed JSON:**
- Throws during JSON.parse
- Crashes page generation
- Build fails

### Recommended Behavior

**File not found:**
```typescript
if (!fs.existsSync(datasetPath)) {
  console.warn(`📊 Dataset file not found: ${filename}`);
  return null;
}
```

**Malformed JSON:**
```typescript
try {
  return JSON.parse(content);
} catch (error) {
  console.error(`📊 Invalid JSON in ${filename}:`, error);
  return null;
}
```

**Validation errors:**
```typescript
const validation = validateDatasetStructure(data);
if (!validation.valid) {
  console.error(`📊 Invalid dataset structure in ${filename}:`, validation.errors);
  return null;
}
```

---

## Performance Considerations

### Caching

**Current:** No caching - files loaded on every page build

**Recommended:**
```typescript
const datasetCache = new Map<string, any>();

export function loadGeneratedDataset(slug: string, type: string) {
  const cacheKey = `${type}:${slug}`;
  if (datasetCache.has(cacheKey)) {
    return datasetCache.get(cacheKey);
  }
  
  const data = loadFromFile(slug, type);
  datasetCache.set(cacheKey, data);
  return data;
}
```

### Build-Time Loading

**All 604 pages** load datasets during static generation:
- 604 file reads
- 604 JSON.parse operations
- ~10-50KB per file = 6-30MB total

**With caching:** ~132 unique files × 1 read = ~1.3-6.5MB

---

## Testing Strategy

### Unit Tests

```typescript
describe('loadGeneratedDataset', () => {
  it('should load existing dataset', () => {
    const dataset = loadGeneratedDataset('aluminum', 'materials');
    expect(dataset).toBeDefined();
    expect(dataset['@type']).toBe('Dataset');
  });
  
  it('should return null for missing dataset', () => {
    const dataset = loadGeneratedDataset('nonexistent', 'materials');
    expect(dataset).toBeNull();
  });
  
  it('should handle malformed JSON gracefully', () => {
    // Mock file with invalid JSON
    const dataset = loadGeneratedDataset('malformed', 'materials');
    expect(dataset).toBeNull();
  });
});
```

### Integration Tests

```typescript
describe('Dataset loading in SchemaFactory', () => {
  it('should enhance schema with loaded dataset', () => {
    const schema = generateDatasetSchema(materialData, context);
    expect(schema.variableMeasured.length).toBeGreaterThan(15);
  });
  
  it('should fallback to dynamic generation if dataset missing', () => {
    const schema = generateDatasetSchema(materialData, context);
    expect(schema.variableMeasured.length).toBeGreaterThan(0);
  });
});
```

---

## Required Actions

### Critical

1. **Fix duplicate suffix bug** (after JSON files fixed)
2. **Add validation before loading**
3. **Improve error logging**

### High Priority

1. **Add caching**
2. **Consolidate slug normalization** (15+ copies)
3. **Add unit tests**

### Medium Priority

1. **Document all slug transformations**
2. **Add performance metrics**
3. **Create troubleshooting guide**

---

## Related Documentation

- [Dataset Generation](./DATASET_GENERATION.md) - How files are created
- [Data Validation](./DATA_VALIDATION.md) - Quality checks
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues
- [Consolidation Guide](./CONSOLIDATION.md) - Normalization opportunities

---

## References

- Node.js fs module: https://nodejs.org/api/fs.html
- Next.js data fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- JSON.parse: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
