# Dataset Generation

## Overview

Z-Beam maintains comprehensive datasets for all materials and settings in multiple formats (JSON, CSV, TXT) for data portability, research integration, and third-party applications.

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

### Materials Datasets
- **Directory:** `public/datasets/materials/`
- **Formats:** JSON, CSV, TXT
- **Count:** 132 materials × 3 formats = 396 files
- **Index:** `public/datasets/materials/index.json`

### Settings Datasets
- **Directory:** `public/datasets/settings/`
- **Formats:** JSON, CSV, TXT
- **Count:** 132 settings × 3 formats = 396 files

### Total Dataset Files
- **792 individual files** + 1 index = **793 dataset files**

## Dataset Formats

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

## Generator Scripts

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

## Automatic Regeneration

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
