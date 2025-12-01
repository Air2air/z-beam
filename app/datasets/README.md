# Dataset Module

Centralized dataset management for Z-Beam laser cleaning platform.

## 📁 Structure

```
app/datasets/
├── core/              # Core business logic
│   ├── validation.ts  # Tier 1/2/3 validation
│   ├── metrics.ts     # Quality metrics calculation
│   ├── sync.ts        # Frontmatter change detection
│   └── types.ts       # Shared TypeScript types
├── quality/           # Quality control & reporting
│   └── reporting.ts   # Report formatting
└── index.ts           # Public API
```

## 🚀 Quick Start

### Basic Usage

```typescript
import {
  validateDatasetForSchema,
  getDatasetQualityMetrics,
  getDatasetSyncStatus
} from '@/app/datasets';

// Validate a dataset
const validation = validateDatasetForSchema({
  machineSettings: { /* ... */ },
  materialProperties: { /* ... */ }
});

if (validation.valid) {
  console.log('✅ Dataset is complete');
} else {
  console.log('❌ Missing:', validation.missing);
}

// Get quality metrics
const materials = [...]; // Load all materials
const metrics = getDatasetQualityMetrics(materials);
console.log(`Completion rate: ${metrics.completionRate}%`);

// Check sync status
const syncStatus = getDatasetSyncStatus();
if (!syncStatus.inSync) {
  console.log('Datasets need regeneration');
}
```

## 📊 Quality Policy

### Tier 1: REQUIRED (Machine Settings)
**ALL 8 parameters must have min/max values:**
- `powerRange`
- `wavelength`
- `spotSize`
- `repetitionRate`
- `pulseWidth`
- `scanSpeed`
- `passCount`
- `overlapRatio`

**Policy**: Dataset schema is **not generated** if Tier 1 is incomplete.

### Tier 2: IMPORTANT (Material Properties)
**Target: 80%+ completeness**
- Thermal properties (meltingPoint, thermalConductivity, heatCapacity)
- Optical properties (absorptivity, reflectivity, emissivity)
- Mechanical properties (density, hardness, tensileStrength)
- Chemical properties (composition, oxidationResistance)

**Policy**: Warning issued if below 80%, but dataset still generated.

### Tier 3: OPTIONAL
- Safety considerations
- Regulatory standards
- Vendor recommendations
- Environmental impact

**Policy**: No requirements, purely informational.

## 🔄 Frontmatter Sync

The module **automatically detects** changes in frontmatter files and tracks which datasets need regeneration.

### Check Sync Status

```bash
npm run datasets:check
```

**Output:**
```
⚠️  Dataset synchronization needed
📊 Status:
   • Last sync: 11/29/2025, 3:49:18 PM
   • Pending changes: 319
   • Affected datasets: 160
```

### Watch for Changes (Development)

```bash
npm run datasets:watch
```

Monitors `frontmatter/materials/` and `frontmatter/settings/` for changes and auto-regenerates datasets.

### How It Works

1. **First run**: Creates `.dataset-sync-cache.json` with file hashes
2. **Detection**: Compares current file hashes with cache
3. **Change types**: Added, modified, deleted files
4. **Affected datasets**: Maps changes to material slugs
5. **Regeneration**: Only regenerates affected datasets

## 📈 Quality Reports

### Console Report

```bash
npm run datasets:quality
```

**Output:**
```
┌─────────────────────────────────────────────────┐
│        DATASET QUALITY REPORT                   │
├─────────────────────────────────────────────────┤
│ Total Materials: 159                            │
│ Complete Datasets: 158 (99%)                    │
│ Incomplete Datasets: 1 (1%)                     │
│                                                 │
│ Missing Parameters:                             │
│   • pulseWidth: 1 materials                     │
│   • passCount: 1 materials                      │
│   • overlapRatio: 1 materials                   │
│                                                 │
│ Tier 2 Average Completeness: 0% ⚠️              │
└─────────────────────────────────────────────────┘
```

### JSON Report

```bash
npm run datasets:quality:json
```

Outputs JSON for CI/CD integration:
```json
{
  "summary": {
    "total": 159,
    "complete": 158,
    "incomplete": 1,
    "completionRate": 99
  },
  "tier2": {
    "avgCompleteness": 0,
    "passesThreshold": false
  },
  "missingParameters": {
    "pulseWidth": 1,
    "passCount": 1,
    "overlapRatio": 1
  }
}
```

### HTML Dashboard

```bash
npm run datasets:quality:html
```

Generates interactive HTML dashboard at `public/dataset-quality.html`.

## 🔧 API Reference

### Validation

```typescript
// Validate Tier 1 only
validateTier1(machineSettings): ValidationResult

// Validate Tier 2 only
validateTier2(materialProperties): ValidationResult

// Validate all tiers
validateComplete(slug, machineSettings, materialProperties): ValidationResult

// Convenience: validate for schema
validateDatasetForSchema(data): ValidationResult

// Check if dataset is complete
hasCompleteDataset(material): boolean
```

### Metrics

```typescript
// Get quality metrics for all materials
getDatasetQualityMetrics(materials): DatasetQualityMetrics

// Calculate aggregate statistics
calculateAggregateStats(materials): AggregateStats

// Compare metrics over time
compareMetrics(current, previous): ComparisonResult
```

### Sync Management

```typescript
// Detect frontmatter changes
detectFrontmatterChanges(): FrontmatterChange[]

// Get sync status
getDatasetSyncStatus(): DatasetSyncStatus

// Update cache after regeneration
updateSyncCache(): void

// Check if regeneration needed
needsRegeneration(): boolean

// Get list of affected datasets
getDatasetsToRegenerate(): string[]

// Watch for changes (dev mode)
watchFrontmatterChanges(callback): void
```

### Reporting

```typescript
// Format reports
formatQualityReport(metrics): string
formatQualityJSON(metrics): string
generateQualityDashboard(metrics): string
createQualitySummary(metrics): string
```

## 🔄 Migration from Old Structure

### Old Imports (Still Work - Backward Compatible)

```typescript
// ✅ Still works
import { validateDatasetForSchema } from '@/app/utils/datasetValidation';
import { calculateAggregateStats } from '@/app/utils/datasetAggregator';
```

### New Imports (Recommended)

```typescript
// ✅ Recommended
import { validateDatasetForSchema, calculateAggregateStats } from '@/app/datasets';
```

The old files are now simple wrappers that re-export from the new location.

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run datasets:check` | Check sync status |
| `npm run datasets:watch` | Watch for changes (auto-regenerate) |
| `npm run datasets:quality` | Generate console quality report |
| `npm run datasets:quality:json` | Generate JSON quality report |
| `npm run datasets:quality:html` | Generate HTML dashboard |
| `npm run generate:datasets` | Regenerate all datasets |

## 🎯 Benefits

### For Developers

- ✅ **Single source of truth** - All validation logic in one place
- ✅ **Clear API** - Simple, well-documented functions
- ✅ **Type safety** - Full TypeScript support
- ✅ **Auto-detection** - Know when datasets are out of sync
- ✅ **Fast iteration** - Watch mode for development

### For CI/CD

- ✅ **Automated checks** - Detect sync issues in PRs
- ✅ **Quality gates** - Block deploys if quality drops
- ✅ **JSON reports** - Easy to parse and track over time
- ✅ **Exit codes** - Fails CI if completion < 90%

### For Maintainability

- ✅ **Modular** - Each module has single responsibility
- ✅ **Testable** - Pure functions, easy to test
- ✅ **Scalable** - Easy to add new features
- ✅ **Self-documenting** - Clear structure and naming

## 📚 Documentation

- **Policy**: `docs/01-core/DATASET_QUALITY_POLICY.md`
- **Architecture**: `docs/02-architecture/dataset-architecture.md`
- **Implementation**: `docs/03-implementation/dataset-generation.md`

## 🐛 Troubleshooting

### "Datasets out of sync" error

**Cause**: Frontmatter files changed since last generation.

**Fix**:
```bash
npm run generate:datasets
```

### Quality report shows 0% Tier 2 completeness

**Cause**: Material properties not loaded or missing in frontmatter.

**Fix**: Check that `materialProperties` exists in frontmatter files.

### Watch mode not detecting changes

**Cause**: File system watch may not work on some systems.

**Fix**: Use manual check instead:
```bash
npm run datasets:check
```

## 🚀 Future Enhancements

- [ ] Incremental regeneration (only changed datasets)
- [ ] Parallel generation for faster builds
- [ ] Git hook integration for pre-commit checks
- [ ] Real-time dashboard with WebSocket updates
- [ ] Historical quality tracking and trends

---

## 🔄 Refactoring Plan (December 2025)

### Current Architecture Issues

**Duplication across scripts:**
| File | Lines | Purpose |
|------|-------|---------|
| `scripts/generate-datasets.ts` | 712 | Materials: JSON/CSV/TXT |
| `scripts/generate-settings-datasets.js` | 255 | Settings: JSON/CSV/TXT |

**Problems:**
1. Two separate scripts (TS + JS) generating similar formats
2. Format generation logic (JSON, CSV, TXT) duplicated 
3. YAML loading/parsing repeated in both files
4. No shared format renderer infrastructure
5. Empty `app/datasets/generation/formats/` directory (planned but never implemented)

### Proposed Consolidated Architecture

```
app/datasets/
├── core/                    # ✅ DONE - Keep as-is
│   ├── validation.ts
│   ├── metrics.ts
│   ├── sync.ts
│   └── types.ts
├── generation/              # 🔄 NEW - Consolidate generators
│   ├── generator.ts         # Unified generator class
│   ├── formats/             
│   │   ├── json.ts          # JSON formatter
│   │   ├── csv.ts           # CSV formatter
│   │   └── txt.ts           # TXT formatter
│   └── loaders/
│       ├── material.ts      # Load material YAML
│       └── settings.ts      # Load settings YAML
├── quality/                 # ✅ DONE - Keep as-is
│   └── reporting.ts
└── index.ts                 # Update exports

scripts/
├── generate-datasets.ts     # 🔄 REFACTOR - Thin wrapper calling app/datasets/generation
└── generate-settings-datasets.js  # 🗑️ DELETE - Merge into generate-datasets.ts
```

### Refactoring Steps

**Phase 1: Format Extractors** (2 hours)
- [ ] Create `app/datasets/generation/formats/json.ts` with `generateJSON(material, slug)`
- [ ] Create `app/datasets/generation/formats/csv.ts` with `generateCSV(material, slug)`
- [ ] Create `app/datasets/generation/formats/txt.ts` with `generateTXT(material, slug)`
- [ ] Export all from `app/datasets/generation/formats/index.ts`

**Phase 2: Unified Generator** (2 hours)
- [ ] Create `app/datasets/generation/generator.ts`
- [ ] Implement `DatasetGenerator` class with:
  - `generateMaterial(slug, options)` - Generate material datasets
  - `generateSettings(slug, options)` - Generate settings datasets
  - `generateAll(options)` - Batch generation
- [ ] Use format extractors from Phase 1

**Phase 3: Script Consolidation** (1 hour)
- [ ] Update `scripts/generate-datasets.ts` to use new generator
- [ ] Delete `scripts/generate-settings-datasets.js`
- [ ] Update `package.json` scripts

**Phase 4: Tests** (1 hour)
- [ ] Add unit tests for format generators
- [ ] Add integration test for full generation pipeline
- [ ] Verify outputs match current behavior

### Estimated Effort
- **Total**: 6 hours
- **Risk**: Low (build-time only, no runtime impact)
- **Priority**: Low (current system works correctly)

### Benefits After Refactoring
- Single source of truth for format generation
- Easier to add new formats (e.g., XML, Parquet)
- Reduced code duplication (~400 lines)
- Consistent TypeScript across all generators
- Better testability
