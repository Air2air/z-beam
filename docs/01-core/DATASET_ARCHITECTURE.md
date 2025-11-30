# Dataset Architecture

**Status**: ✅ Production Ready  
**Last Updated**: November 29, 2025  
**Module**: `app/datasets/`

## 📋 Overview

The dataset system generates structured data exports in multiple formats (JSON, CSV, TXT) for materials and laser settings, with built-in quality validation and SEO integration.

## 🏗️ Architecture

```
app/datasets/
├── core/
│   ├── types.ts          # TypeScript interfaces
│   ├── validation.ts     # 3-tier quality validation
│   ├── metrics.ts        # Quality metrics calculation
│   └── sync.ts           # Proactive frontmatter sync
├── quality/
│   └── reporting.ts      # Quality reports and analysis
├── index.ts              # Public API
└── README.md             # Module documentation
```

## 📊 Data Structure

### Materials Schema
```typescript
{
  name: string;
  slug: string;
  category: string;
  material_characteristics: {
    density?: { value: number; unit: string };
    hardness?: { value: number; unit: string };
    tensileStrength?: { value: number; unit: string };
    youngsModulus?: { value: number; unit: string };
    thermalConductivity?: { value: number; unit: string };
    meltingPoint?: { value: number; unit: string };
    thermalExpansion?: { value: number; unit: string };
    absorptivity?: { value: number; unit: string };
    reflectivity?: { value: number; unit: string };
    emissivity?: { value: number; unit: string };
  };
  machineSettings: {
    laserPower?: { min: number; max: number };
    pulseWidth?: { min: number; max: number };
    frequency?: { min: number; max: number };
    scanSpeed?: { min: number; max: number };
    passCount?: { min: number; max: number };
    overlapRatio?: { min: number; max: number };
  };
  faqs?: Array<{ question: string; answer: string }>;
}
```

**Key Points**:
- All properties under `material_characteristics` (unified structure)
- Machine settings use `min/max` ranges (not separate by laser type)
- 10 core properties tracked for Tier 2 completeness

### Settings Schema
```typescript
{
  name: string;
  slug: string;
  category: string;
  machineSettings: {
    laserPower: { min: number; max: number; unit: string };
    pulseWidth: { min: number; max: number; unit: string };
    frequency: { min: number; max: number; unit: string };
    scanSpeed: { min: number; max: number; unit: string };
    passCount: { min: number; max: number };
    overlapRatio: { min: number; max: number };
  };
}
```

## ✅ Quality Validation

### 3-Tier System

**Tier 1: Essential Parameters** (99% target)
- Required for dataset generation
- Machine settings: laserPower, frequency, scanSpeed
- Blocks generation if missing

**Tier 2: Important Properties** (67% current)
- 10 key material characteristics tracked
- Properties: density, hardness, tensileStrength, youngsModulus, thermalConductivity, meltingPoint, thermalExpansion, absorptivity, reflectivity, emissivity
- Warning-level validation

**Tier 3: Enhanced Content** (optional)
- FAQs, author attribution, additional metadata
- Informational only

### Validation Functions

```typescript
import { validateTier1, validateComplete } from '@/app/datasets';

// Validate essential parameters
const tier1Result = validateTier1(material);
if (!tier1Result.valid) {
  console.error(tier1Result.message);
}

// Calculate Tier 2 completeness
const completeResult = validateComplete(material);
console.log(`Tier 2: ${completeResult.tier2Completeness}%`);
```

## 📁 File Formats

### JSON Format
```json
{
  "name": "Aluminum",
  "slug": "aluminum",
  "material_characteristics": {
    "density": { "value": 2700, "unit": "kg/m³" }
  }
}
```

### CSV Format
```csv
# Material: Aluminum (aluminum)
# Category: Non-Ferrous Metals
# Comments: Lines ≤80 characters

property,value,unit
density,2700,kg/m³
```

### TXT Format
```txt
================================================================================
MATERIAL: Aluminum
================================================================================
Category: Non-Ferrous Metals

Density: 2700 kg/m³
```

## 🔄 Generation Workflow

```bash
# Generate all datasets
npm run datasets:generate

# Quality report
npm run datasets:quality

# Test suite
npm run test:datasets
```

## 🎯 Quality Metrics

**Current Status** (as of Nov 29, 2025):
- Total Materials: 159
- Tier 1 Complete: 158/159 (99%)
- Tier 2 Average: 67%
- Generated Files: 957 (materials + settings × 3 formats)
- Test Coverage: 15/15 quality policy tests passing

**Quality Gates**:
- ✅ Tier 1 validation before generation
- ✅ Schema compliance checks
- ✅ Format consistency validation
- ✅ SEO metadata integration

## 🔌 Integration Points

### Frontmatter Sync
- Proactive detection of frontmatter changes
- Auto-triggers dataset regeneration
- Maintains data consistency

### SEO System
- Injects structured data into JSON-LD
- Provides material properties for rich snippets
- Enhances search engine understanding

### Type System
- Full TypeScript coverage
- Runtime validation with Zod schemas
- Type-safe API exports

## 📖 API Reference

### Core Functions
```typescript
import { 
  validateTier1,          // Tier 1 validation
  validateComplete,       // All tiers + completeness %
  calculateMetrics,       // Quality metrics
  syncFrontmatter        // Frontmatter detection
} from '@/app/datasets';
```

### Types
```typescript
import type {
  MaterialData,
  SettingsData,
  ValidationResult,
  QualityMetrics
} from '@/app/datasets/core/types';
```

## 🧪 Testing

```bash
# Run quality policy tests
npm test tests/datasets/quality-policy.test.js

# Run integration tests
npm test tests/datasets/integration.test.js

# Run all dataset tests
npm run test:datasets
```

## 📚 Related Documentation

- **Quality Policy**: `docs/01-core/DATASET_QUALITY_POLICY.md`
- **SEO Integration**: `docs/01-core/DATASET_SEO_POLICY.md`
- **Module README**: `app/datasets/README.md`
- **Reference**: `docs/04-reference/datasets.md`
- **Implementation History**: `docs/archive/2025-11/` (archived)

## 🚀 Future Enhancements

- **Phase 2**: Generation script refactoring (planned)
- **Enhanced Metrics**: More granular completeness tracking
- **Validation UI**: Dashboard for quality monitoring
- **Auto-Research**: AI-powered property discovery

## 📝 Notes

**Schema Change (Nov 29, 2025)**:
- Updated from separate thermal/optical/mechanical/chemical categories
- Now uses unified `material_characteristics` structure
- All 159 materials follow this pattern
- Validation and tests updated to match

**Backward Compatibility**:
- `validateDatasetCompleteness` aliased to `validateComplete`
- Old import paths still work
- No breaking changes to API
