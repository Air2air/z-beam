# Dataset Generation

## Overview

Z-Beam maintains comprehensive **unified datasets** for all materials that combine both material properties and machine settings in multiple formats (JSON, CSV, TXT) for data portability, research integration, and third-party applications.

**Key Feature:** Each material has **one consolidated dataset** that includes both material properties AND machine settings, accessible from both Materials and Settings pages.

## Architecture

### Unified Dataset Approach

- **One dataset per material** (e.g., `oak-laser-cleaning.json`)
- **Includes both:**
  - Material properties (thermal, optical, mechanical)
  - Machine settings (power, wavelength, spot size, etc.)
- **Available from:**
  - Materials pages: `/materials/wood/hardwood/oak-laser-cleaning`
  - Settings pages: `/settings/wood/hardwood/oak`
- **Schema.org Dataset** with comprehensive `variableMeasured` arrays

### Dataset Consolidation

```yaml
# Before: Separate datasets
materials/oak-laser-cleaning.json  # Material properties only
settings/oak-settings.json         # Machine settings only

# After: Unified dataset
datasets/materials/oak-laser-cleaning.json  # Both properties + settings
```

Both pages reference the same unified dataset URL.

## Quick Start

**Regenerate all datasets:**
```bash
npm run regenerate:datasets
```

This command regenerates both materials and settings datasets from the current frontmatter YAML files.

## When to Regenerate Datasets

Datasets should be regenerated whenever frontmatter data changes:

- ✅ **After updating breadcrumbs** (navigation structure changes)
- ✅ **After adding/editing material properties** (parameters, properties, etc.)
- ✅ **After modifying machine settings** (laser parameters, ranges, etc.)
- ✅ **After updating metadata** (titles, descriptions, authors)
- ✅ **Before production deployment** (automatic via prebuild)
- ✅ **After bulk frontmatter updates** (batch processing scripts)

**Note:** Unified datasets automatically combine data from both `/frontmatter/materials/` and `/frontmatter/settings/` directories.

## Available Commands

### Unified Commands

| Command | Description |
|---------|-------------|
| `npm run regenerate:datasets` | Regenerate all datasets (materials + settings) |
| `npm run generate:datasets` | Alias for regenerate:datasets |

### Individual Generators

| Command | Description |
|---------|-------------|
| `npm run generate:datasets:materials` | Regenerate only materials datasets (132 materials) |
| `npm run generate:datasets:settings` | Regenerate only settings datasets (132 settings) |

## Output Locations

### Unified Datasets
- **Directory:** `public/datasets/materials/`
- **Formats:** JSON, CSV, TXT
- **Content:** Material properties + machine settings (consolidated)
- **Count:** 132 materials × 3 formats = 396 files
- **Index:** `public/datasets/materials/index.json`
- **Example:** `oak-laser-cleaning.json` (includes both properties and settings)

### Total Dataset Files
- **396 unified files** + 1 index = **397 dataset files**

## Schema Generation

### Schema.org Dataset, HowTo, and FAQPage

Settings pages automatically generate **three key schemas** by merging data from both material and settings files:

1. **Dataset Schema** - Comprehensive data with material properties + machine settings
2. **HowTo Schema** - Step-by-step instructions from machine settings
3. **FAQPage Schema** - Frequently asked questions from material FAQ data

### Data Loading Pattern

```typescript
// In /app/settings/[category]/[subcategory]/[slug]/page.tsx

// Load settings file (has machineSettings)
const settings = await getSettingsArticle(`${material}-settings`);

// Load material file (has materialProperties, faq, etc.)
const materialArticle = await getArticleBySlug(`${material}-laser-cleaning`);

// Merge for complete schema generation
settings.materialProperties = materialArticle.materialProperties;
settings.faq = materialArticle.faq;
settings.outcomeMetrics = materialArticle.outcomeMetrics;
settings.applications = materialArticle.applications;
settings.environmentalImpact = materialArticle.environmentalImpact;
```

### Dataset Schema Structure

Each unified dataset includes:

```json
{
  "@type": "Dataset",
  "@id": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning#dataset",
  "name": "Oak Laser Cleaning Dataset",
  "description": "Comprehensive laser cleaning dataset for Oak. Includes validated machine parameters and material properties for optimal cleaning results.",
  "variableMeasured": [
    // Machine Settings (from settings file)
    {
      "@type": "PropertyValue",
      "propertyID": "powerRange",
      "name": "Power Range",
      "value": 100,
      "unitText": "W",
      "description": "Laser power output"
    },
    // Material Properties (from materials file)
    {
      "@type": "PropertyValue",
      "propertyID": "density",
      "name": "density",
      "value": 0.75,
      "unitText": "g/cm³"
    }
  ],
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning.json"
    }
  ],
  "url": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning"
}
```

### Machine Settings Included

All datasets include these machine parameters (when available):
- Power Range (W)
- Wavelength (nm)
- Spot Size (μm)
- Repetition Rate (kHz)
- Energy Density / Fluence Threshold (J/cm²)
- Pulse Width (ns)
- Scan Speed (mm/s)
- Pass Count (passes)
- Overlap Ratio (%)
- Dwell Time (μs)

### Material Properties Included

All datasets include comprehensive material properties:
- Thermal properties (density, melting point, thermal conductivity)
- Optical properties (reflectivity, absorption coefficient)
- Mechanical properties (hardness, tensile strength)
- Laser interaction data

## Data Loading

### Materials Pages
```typescript
// /app/materials/[category]/[subcategory]/[slug]/page.tsx
// Automatically loads machine settings from settings file
const settings = await getSettingsArticle(`${material}-settings`);
if (settings?.machineSettings) {
  article.metadata.machineSettings = settings.machineSettings;
}
```

### Settings Pages
```typescript
// /app/settings/[category]/[subcategory]/[slug]/page.tsx
// Automatically loads ALL material data for complete schemas
const materialArticle = await getArticleBySlug(`${material}-laser-cleaning`);

// For Dataset schema
settings.materialProperties = materialArticle.materialProperties;

// For FAQPage schema
settings.faq = materialArticle.faq;
settings.outcomeMetrics = materialArticle.outcomeMetrics;
settings.applications = materialArticle.applications;
settings.environmentalImpact = materialArticle.environmentalImpact;
```

Both pages generate the same unified Dataset schema, plus HowTo and FAQPage schemas.

### Schema Generation Summary

| Schema | Generated On | Data Source |
|--------|-------------|-------------|
| **Dataset** | Both pages | machineSettings + materialProperties |
| **HowTo** | Both pages | machineSettings (generates steps) |
| **FAQPage** | Both pages | faq, environmentalImpact (merged from material) |

### JSON Format
- **Purpose:** Schema.org structured data, API consumption
- **Features:** Full metadata, license info, E-E-A-T attribution
- **Size:** ~10-50 KB per file
- **Example:** `aluminum-laser-cleaning.json`

### CSV Format
- **Purpose:** Spreadsheet import, data analysis
- **Features:** Flattened structure, metadata header
- **Size:** ~2-10 KB per file
- **Example:** `aluminum-laser-cleaning.csv`

### TXT Format
- **Purpose:** Human-readable documentation
- **Features:** Formatted text, citations, usage terms
- **Size:** ~5-20 KB per file
- **Example:** `aluminum-laser-cleaning.txt`

## Dataset Formats

### Materials Generator
- **File:** `scripts/generate-datasets.ts`
- **Language:** TypeScript
- **Source:** `frontmatter/materials/*.yaml`
- **Features:**
  - Schema.org Dataset structured data
  - Material properties extraction
  - Laser parameter mapping
  - Variable measurement tracking
  - E-E-A-T attribution

### Settings Generator
- **File:** `scripts/generate-settings-datasets.js`
- **Language:** JavaScript (Node.js)
- **Source:** `frontmatter/settings/*.yaml`
- **Features:**
  - Machine settings parameters
  - Essential parameter ranges
  - Research citations
  - Safety considerations
  - Optimal operating conditions

**Data Completeness:** Min/Max ranges and parameter descriptions are populated by the external Python generator system (Z-Beam content generation pipeline). The JavaScript generator reads these values from the YAML frontmatter files that are pre-populated by the Python system.

## Download Component

Both Materials and Settings pages use the same **MaterialDatasetCardWrapper** component:

```tsx
<MaterialDatasetCardWrapper
  material={{
    name: "Oak",
    slug: "oak",
    category: "wood",
    subcategory: "hardwood",
    machineSettings: { /* loaded dynamically */ },
    materialProperties: { /* loaded dynamically */ }
  }}
  showFullDataset={true}
/>
```

This ensures consistent dataset presentation across all pages.

## Generator Scripts

Datasets are automatically regenerated during the build process:

```json
"prebuild": "... && npm run generate:datasets"
```

This ensures production deployments always have current datasets matching the latest frontmatter data.

## Manual Regeneration

For development or after bulk frontmatter updates:

```bash
# Regenerate all datasets
npm run regenerate:datasets

# Check output
ls public/datasets/materials/ | wc -l  # Should show ~397 files
ls public/datasets/settings/ | wc -l   # Should show ~397 files
```

## Performance

- **Materials generation:** ~3-5 seconds (132 materials)
- **Settings generation:** ~2-3 seconds (132 settings)
- **Total time:** ~5-8 seconds (both generators)

## Data Quality

All datasets include:
- ✅ CC BY 4.0 license information
- ✅ Publisher attribution (Z-Beam)
- ✅ Contact information
- ✅ Verification methods
- ✅ Update timestamps
- ✅ Citation formats
- ✅ Usage terms

## Troubleshooting

### Missing Name Field Warning
```
⚠️  Skipping granite-density-research.yaml: Missing name field
```
**Solution:** Ensure all frontmatter files have a `name` field.

### Empty Dataset Output
**Check:** Verify YAML files are valid with `npm run validate:frontmatter`

### Outdated Datasets
**Symptom:** Datasets don't reflect recent frontmatter changes
**Solution:** Run `npm run regenerate:datasets` manually

## Integration

### Build Pipeline
```bash
npm run prebuild    # Includes dataset generation
npm run build       # Uses current datasets
```

### Deployment
```bash
npm run deploy      # Validates + generates datasets + deploys
```

### Development
```bash
# After updating frontmatter
npm run regenerate:datasets

# Verify changes
git diff public/datasets/
```

## Best Practices

1. **After Bulk Updates:** Always regenerate datasets after running batch processing scripts (like `update-breadcrumbs.js`)

2. **Before Commits:** Consider regenerating if you've modified multiple frontmatter files

3. **Validation First:** Run `npm run validate:frontmatter` before generating datasets

4. **Version Control:** Commit dataset changes alongside frontmatter changes

5. **Production Safety:** Datasets are automatically regenerated during deployment

## License

All generated datasets are distributed under **CC BY 4.0** license:
- Attribution required
- Commercial use allowed
- Modifications allowed
- Distribution allowed

## Support

For dataset generation issues:
- Check `npm run validate:frontmatter` first
- Review script output for error messages
- Verify YAML structure in affected files
- Contact: hello@z-beam.com

---

**Last Updated:** 2024
**Version:** 1.0.0
