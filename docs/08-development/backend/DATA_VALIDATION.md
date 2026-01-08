# Data Validation

**Last Updated:** January 7, 2026  
**Status:** Identified gaps in validation pipeline

---

## Overview

Quality assurance system for dataset files and Schema.org structured data.

---

## Current Validation (Frontmatter)

### Existing Validators

#### 1. Naming Validation
**Script:** `scripts/validation/content/validate-naming-e2e.js`  
**Checks:**
- Slug format consistency
- File naming conventions
- URL path structure

#### 2. Metadata Validation
**Script:** `scripts/validation/content/validate-metadata-sync.js`  
**Checks:**
- Required frontmatter fields
- Metadata completeness
- Cross-reference integrity

#### 3. Property Validation
**Script:** Type checking in dataset generation  
**Checks:**
- Property value types
- Unit consistency
- Range validation (min/max)

#### 4. FAQ Validation
**Test:** `tests/components/Layout-faq-structure.test.tsx`  
**Checks:**
- FAQ structure compliance
- Question/answer pairs
- Schema.org FAQPage format

#### 5. Micro Content Validation
**Test:** `tests/components/MicroContentValidation.test.ts`  
**Checks:**
- Micro content length limits
- Format requirements
- Content quality

---

## Missing Validation (Dataset JSON)

### Critical Gaps

#### 1. No PropertyValue Structure Validation

**Current:** Generated JSON files not validated  
**Impact:** Malformed data ships to production

**Example Issue:**
```json
{
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "citation": "String value"  // ❌ Should be array or omitted
    }
  ]
}
```

**Needed:**
```typescript
function validatePropertyValue(prop: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!prop['@type']) errors.push('Missing @type');
  if (prop['@type'] !== 'PropertyValue') errors.push('Invalid @type');
  if (!prop.name) errors.push('Missing name');
  if (prop.value === undefined) errors.push('Missing value');
  
  // Citation validation
  if (prop.citation !== undefined) {
    if (typeof prop.citation === 'string') {
      errors.push('Citation must be array or omitted, not string');
    }
    if (Array.isArray(prop.citation)) {
      prop.citation.forEach((cite: any, i: number) => {
        if (!cite['@type']) errors.push(`Citation ${i} missing @type`);
        if (cite['@type'] !== 'CreativeWork') errors.push(`Citation ${i} invalid @type`);
      });
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

#### 2. No Schema.org Compliance Check

**Needed:** Validate against Schema.org specifications
- Dataset structure
- PropertyValue format
- CreativeWork citations
- DataDownload distribution

#### 3. No Pre-commit Validation

**Current:** Files committed without validation  
**Needed:** Git hook to validate before commit

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Validating dataset JSON files..."
npm run validate:datasets

if [ $? -ne 0 ]; then
  echo "❌ Dataset validation failed. Commit aborted."
  exit 1
fi
```

---

## Validation Requirements

### Dataset JSON Files

#### Structure Validation

```typescript
interface DatasetValidation {
  // Required fields
  '@type': 'Dataset';
  name: string;
  description: string;
  
  // Optional but validated if present
  variableMeasured?: PropertyValue[];
  citation?: CreativeWork[];
  distribution?: DataDownload[];
  author?: Person | Organization;
  creator?: Person | Organization;
  
  // Dates
  datePublished?: string;  // ISO 8601
  dateModified?: string;   // ISO 8601
}

interface PropertyValue {
  '@type': 'PropertyValue';
  name: string;
  value: string | number;
  propertyID?: string;
  unitText?: string;
  minValue?: number;
  maxValue?: number;
  // citation?: NEVER string, only array or omitted
}
```

#### Validation Rules

1. **PropertyValue.citation**
   - ❌ String: `"Author et al..."`
   - ✅ Omitted: No field at all
   - ✅ Array: `[{"@type": "CreativeWork", "name": "..."}]`

2. **Required Fields**
   - `@type` must be "Dataset"
   - `name` must be non-empty string
   - `description` must be non-empty string

3. **Array Fields**
   - `variableMeasured` must be array of PropertyValue objects
   - `citation` must be array of CreativeWork objects
   - `distribution` must be array of DataDownload objects

4. **Date Fields**
   - Must be ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`

---

## Validation Implementation

### File: `app/utils/validation/validateDatasetJSON.ts`

```typescript
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export function validateDatasetJSON(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Type check
  if (data['@type'] !== 'Dataset') {
    errors.push({
      path: '@type',
      message: `Expected "Dataset", got "${data['@type']}"`,
      severity: 'error'
    });
  }
  
  // Required fields
  if (!data.name) {
    errors.push({
      path: 'name',
      message: 'Missing required field',
      severity: 'error'
    });
  }
  
  // Validate variableMeasured
  if (data.variableMeasured) {
    if (!Array.isArray(data.variableMeasured)) {
      errors.push({
        path: 'variableMeasured',
        message: 'Must be an array',
        severity: 'error'
      });
    } else {
      data.variableMeasured.forEach((prop: any, i: number) => {
        const propErrors = validatePropertyValue(prop);
        propErrors.forEach(err => {
          errors.push({
            path: `variableMeasured[${i}].${err.field}`,
            message: err.message,
            severity: 'error'
          });
        });
      });
    }
  }
  
  // Validate citations
  if (data.citation) {
    if (!Array.isArray(data.citation)) {
      errors.push({
        path: 'citation',
        message: 'Must be an array',
        severity: 'error'
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validatePropertyValue(prop: any): Array<{field: string, message: string}> {
  const errors: Array<{field: string, message: string}> = [];
  
  if (prop['@type'] !== 'PropertyValue') {
    errors.push({field: '@type', message: 'Must be "PropertyValue"'});
  }
  
  if (!prop.name) {
    errors.push({field: 'name', message: 'Required field missing'});
  }
  
  if (prop.value === undefined) {
    errors.push({field: 'value', message: 'Required field missing'});
  }
  
  // CRITICAL: Check for string citation (common error)
  if (typeof prop.citation === 'string') {
    errors.push({
      field: 'citation',
      message: 'Citation must be array of CreativeWork objects or omitted, not string'
    });
  }
  
  return errors;
}
```

### Script: `scripts/validation/validate-datasets.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { validateDatasetJSON } from '@/app/utils/validation/validateDatasetJSON';

const DATASETS_DIR = path.join(process.cwd(), 'public', 'datasets', 'materials');

function validateAllDatasets(): void {
  const files = fs.readdirSync(DATASETS_DIR)
    .filter(f => f.endsWith('.json'));
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  console.log(`Validating ${files.length} dataset JSON files...\n`);
  
  for (const file of files) {
    const filepath = path.join(DATASETS_DIR, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    
    try {
      const data = JSON.parse(content);
      const result = validateDatasetJSON(data);
      
      if (!result.valid) {
        console.error(`❌ ${file}:`);
        result.errors.forEach(err => {
          console.error(`   ${err.path}: ${err.message}`);
          totalErrors++;
        });
      }
      
      if (result.warnings.length > 0) {
        console.warn(`⚠️  ${file}:`);
        result.warnings.forEach(warn => {
          console.warn(`   ${warn.path}: ${warn.message}`);
          totalWarnings++;
        });
      }
    } catch (error) {
      console.error(`❌ ${file}: Invalid JSON - ${error.message}`);
      totalErrors++;
    }
  }
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Total: ${files.length} files`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);
  
  if (totalErrors > 0) {
    process.exit(1);
  }
}

validateAllDatasets();
```

### Add to package.json

```json
{
  "scripts": {
    "validate:datasets": "tsx scripts/validation/validate-datasets.ts",
    "prebuild": "npm run validate:datasets && node app/utils/generateStaticData.js && npm run test:all"
  }
}
```

---

## Validation Workflow

### Development

```bash
# Validate before commit
npm run validate:datasets

# Fix issues
# ... edit files ...

# Validate again
npm run validate:datasets
```

### Pre-commit Hook

```bash
# Install husky
npm install --save-dev husky

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run validate:datasets"
```

### CI/CD Pipeline

```yaml
# .github/workflows/validate.yml
name: Validate Datasets

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run validate:datasets
```

---

## Quality Metrics

### Coverage

- **Frontmatter validation:** ✅ 100% (132 materials)
- **Dataset JSON validation:** ❌ 0% (396 files)
- **Schema.org compliance:** ⚠️ Partial (runtime only)

### Known Issues

- **164 files** with string citations in PropertyValue objects
- **0 files** validated before commit
- **No schema.org spec validation**

### Target State

- **100% pre-commit validation**
- **Zero files** with structural errors
- **Full schema.org compliance**
- **Automated quality reports**

---

## Validation Tools

### JSON Schema Validation

```typescript
import Ajv from 'ajv';
import datasetSchema from '@/schemas/dataset-schema.json';

const ajv = new Ajv();
const validate = ajv.compile(datasetSchema);

export function validateWithSchema(data: any): boolean {
  const valid = validate(data);
  if (!valid) {
    console.error('Validation errors:', validate.errors);
  }
  return valid;
}
```

### Schema.org Validator

Use Google's Structured Data Testing Tool:
- https://validator.schema.org/
- https://search.google.com/test/rich-results

---

## Required Actions

### Immediate (Critical)

1. **Create validateDatasetJSON.ts**
2. **Create validation script**
3. **Run validation on all 396 files**
4. **Fix 164 files with string citations**

### Short-term (High Priority)

1. **Add to prebuild process**
2. **Create pre-commit hook**
3. **Add CI/CD validation**
4. **Document validation rules**

### Long-term (Quality of Life)

1. **JSON Schema definitions**
2. **Automated fixing tools**
3. **Quality dashboards**
4. **Performance tracking**

---

## Related Documentation

- [Dataset Generation](./DATASET_GENERATION.md) - File creation process
- [Dataset Loading](./DATASET_LOADING.md) - Runtime loading
- [Troubleshooting](./TROUBLESHOOTING.md) - Common validation errors

---

## References

- Schema.org Dataset: https://schema.org/Dataset
- Schema.org PropertyValue: https://schema.org/PropertyValue
- JSON Schema: https://json-schema.org/
- Structured Data Testing Tool: https://validator.schema.org/
