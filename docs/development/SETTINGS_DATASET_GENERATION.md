# Settings Dataset Generation

## Overview

The settings dataset generation system converts YAML frontmatter into downloadable dataset files (JSON, CSV, TXT) for all 132 materials. These files are consumed by users who need machine parameter configurations for laser cleaning operations.

## Critical Requirements

### All Parameters Must Be Included

**RULE: Every generated settings file MUST include ALL 9 machine parameters:**

1. `powerRange` - Laser power (W)
2. `wavelength` - Laser wavelength (nm)
3. `spotSize` - Beam spot diameter (μm)
4. `repetitionRate` - Pulse frequency (kHz)
5. `energyDensity` - Fluence/energy per area (J/cm²)
6. `pulseWidth` - Pulse duration (ns)
7. `scanSpeed` - Scanning velocity (mm/s)
8. `passCount` - Number of cleaning passes
9. `overlapRatio` - Beam overlap percentage (%)

**Rationale:** Users depend on complete parameter sets for safe and effective laser cleaning. Missing parameters can lead to:
- Equipment damage from incorrect settings
- Material damage from improper configuration
- Safety hazards from incomplete specifications
- User frustration and support requests

### Parameter Order

Parameters are always output in the standard order listed above to ensure consistency across all materials and predictable user experience.

## Source Data Structure

### Location
- Source files: `frontmatter/settings/*.yaml` (132 files)
- Output directory: `public/datasets/settings/`

### YAML Structure
```yaml
machineSettings:
  powerRange:
    unit: W
    value: 100
    min: 1.0
    max: 120
    description: "Optimal average power for material oxide layer removal"
  wavelength:
    unit: nm
    value: 1064
    min: 355
    max: 10640
    description: "Near-IR wavelength optimized for material absorption"
  # ... all 9 parameters required
```

**NOTE:** Parameters are stored directly under `machineSettings`, NOT under a nested `essential_parameters` key.

**Description Merging:** The generation script reads from two sources:
- `frontmatter/settings/*.yaml` - Structure and values
- `frontmatter/materials/*-laser-cleaning.yaml` - Parameter descriptions

This ensures generated files include both accurate values AND user-friendly descriptions.

## Generation Process

### Command
```bash
npm run generate:datasets
```

This runs both:
1. `tsx scripts/generate-datasets.ts` - Material datasets
2. `node scripts/generate-settings-datasets.js` - Settings datasets

### Script Logic

The script (`scripts/generate-settings-datasets.js`):
1. Reads all YAML files from `frontmatter/settings/`
2. Extracts `machineSettings` object (9 parameters)
3. Generates 3 file formats per material:
   - **JSON** - Structured data with metadata
   - **CSV** - Tabular format (Parameter, Value, Unit, Min, Max, Description)
   - **TXT** - Human-readable format with descriptions

### Output Files

For each material (e.g., aluminum):
- `aluminum-settings.json` - Complete structured data
- `aluminum-settings.csv` - Spreadsheet-compatible format
- `aluminum-settings.txt` - Plain text with descriptions

## File Format Specifications

### TXT Format Structure
```
ALUMINUM LASER CLEANING SETTINGS
============================================================

Category: metal > non-ferrous
Title: Aluminum Laser Cleaning Settings
Description: Detailed machine settings...

MACHINE SETTINGS - ALL PARAMETERS
------------------------------------------------------------

The following parameters must ALL be configured for optimal laser cleaning.
These values are scientifically derived from material properties and research.

POWER RANGE:
  Value: 100 W
  Range: 1.0-120 W
  Description: Optimal average power for Aluminum oxide layer removal

WAVELENGTH:
  Value: 1064 nm
  Range: 355-10640 nm
  Description: Near-IR wavelength optimized for Aluminum absorption
  
[... continues for all 9 parameters ...]

Generated: 2025-11-16T20:30:00.000Z
License: CC BY 4.0
```

### CSV Format Structure
```csv
"Parameter","Value","Unit","Min","Max","Description"
"powerRange","100","W","1.0","120","Optimal average power for Aluminum oxide layer removal"
"wavelength","1064","nm","355","10640","Near-IR wavelength optimized for Aluminum absorption"
[... all 9 parameters ...]
```

### JSON Format Structure
```json
{
  "metadata": {
    "name": "Aluminum",
    "category": "metal",
    "subcategory": "non-ferrous",
    "title": "Aluminum Laser Cleaning Settings",
    "description": "Detailed machine settings...",
    "datePublished": "2025-11-12T21:10:30-08:00",
    "dateModified": "2025-11-12T21:10:30-08:00",
    "author": { ... }
  },
  "machineSettings": {
    "powerRange": {
      "unit": "W",
      "value": 100,
      "min": 1.0,
      "max": 120,
      "description": "Optimal average power for Aluminum oxide layer removal"
    }
    // ... all 9 parameters
  }
}
```

## Quality Checks

### Pre-Generation Validation

Before running generation:
1. Verify all 132 YAML files exist in `frontmatter/settings/`
2. Confirm each YAML has complete `machineSettings` with all 9 parameters
3. Check parameter values are within valid ranges

### Post-Generation Validation

After running generation:
1. Verify 396 files generated (132 materials × 3 formats)
2. Check TXT files are NOT empty in "MACHINE SETTINGS" section
3. Confirm all 9 parameters appear in each TXT file
4. Validate CSV files have 10 rows (header + 9 parameters)
5. Verify JSON files have complete `machineSettings` object

### Automated Test Coverage

Tests must verify:
- All 9 parameters present in output
- Parameter order is consistent
- No missing descriptions
- Value ranges are valid (min < value < max)
- Units are present and correct
- No empty sections in TXT files

## Integration Points

### Build Process
- Runs automatically during: `npm run build`
- Can be run manually: `npm run generate:datasets`
- Output files committed to repository (public assets)

### Material Pages
Material pages at `/materials/[category]/[subcategory]/[slug]` display machine settings and offer downloads:
- Settings displayed in "Machine Settings" section (2nd section after intro)
- Download button links to `/datasets/settings/[material]-settings.txt`
- JSON/CSV available for programmatic access

### API Endpoints
Settings data accessible via:
- Static file serving: `/datasets/settings/*.{json,csv,txt}`
- No API route needed (static assets served by Next.js)

## Troubleshooting

### Empty TXT Files
**Symptom:** TXT files have "MACHINE SETTINGS" section but no parameters listed

**Cause:** Script looking for wrong path (e.g., `essential_parameters` instead of direct access)

**Fix:** Ensure script reads `dataset.machineSettings` directly, not nested paths

### Missing Parameters
**Symptom:** Only some parameters appear in output files

**Cause:** YAML file missing parameters or script filtering incorrectly

**Fix:** 
1. Verify source YAML has all 9 parameters
2. Check script loops through all parameters without filtering
3. Ensure paramOrder array includes all 9 parameters

### Incorrect Values
**Symptom:** Parameter values don't match source YAML

**Cause:** Data transformation error or caching

**Fix:**
1. Clear output directory: `rm -rf public/datasets/settings/*`
2. Regenerate: `npm run generate:datasets`
3. Compare output to source YAML

## Maintenance

### Adding New Parameters
If new parameters are added to machine settings:
1. Update this documentation with new parameter
2. Add to `paramOrder` array in script
3. Update tests to verify new parameter
4. Regenerate all datasets
5. Update material page components if needed

### Modifying Existing Parameters
To change parameter structure:
1. Update all 132 YAML files in `frontmatter/settings/`
2. Modify generation script logic
3. Update documentation
4. Run tests to verify
5. Regenerate datasets
6. Commit all changes together

## References

- Script: `scripts/generate-settings-datasets.js`
- Source data: `frontmatter/settings/*.yaml`
- Output: `public/datasets/settings/`
- Material pages: `app/materials/[category]/[subcategory]/[slug]/page.tsx`
- Tests: `tests/dataset-generation.test.js` (to be created)
