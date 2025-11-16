# Frontmatter Naming Convention Rules
**Status:** Official  
**Last Updated:** October 25, 2025  
**Applies to:** All YAML frontmatter files in `frontmatter/materials/`

---

## Overview

Z-Beam uses a **hybrid naming convention** for frontmatter fields:
- **snake_case** for generator metadata
- **camelCase** for material properties

This provides clear semantic distinction while maintaining compatibility with TypeScript components and JSON-LD Schema.org standards.

---

## Field Naming Rules

### 1. Top-Level Metadata Fields (snake_case)

**Use snake_case for:**
- Generator metadata (timestamps, tracking, quality metrics)
- Non-scientific data fields
- Administrative information

**Examples:**
```yaml
generated_date: '2025-10-24T23:51:36.346146'
data_completeness: 100%
category_info:
  properties_count: 42
  category_ranges: { ... }
```

**Standard metadata fields:**
- `generated_date` - ISO timestamp when file was generated
- `data_completeness` - Percentage (0-100%) of property coverage
- `category_info` - Container for category-level metadata
  - `properties_count` - Number of properties in this material
  - `category_ranges` - Min/max ranges across category

**Rationale:**
- Follows Python generator conventions
- Matches traditional YAML/config file standards
- Clear visual separation from scientific properties

---

### 2. Material Properties (camelCase)

**Use camelCase for:**
- All scientific/technical properties
- Material characteristics
- Physical measurements
- Chemical properties

**Examples:**
```yaml
properties:
  thermalConductivity:
    value: 237.0
    unit: "W/(m·K)"
    confidence: 95
  electricalResistivity:
    value: 2.65e-08
    unit: "Ω·m"
    confidence: 98
  meltingPoint:
    value: 933.0
    unit: K
    confidence: 99
  laserAbsorption:
    value: 0.08
    unit: dimensionless
    confidence: 82
```

**Standard property names (42 total):**
- `ablationThreshold`
- `absorptionCoefficient`
- `absorptivity`
- `boilingPoint`
- `compressiveStrength`
- `corrosionResistance`
- `density`
- `electricalConductivity`
- `electricalResistivity`
- `flexuralStrength`
- `fractureToughness`
- `hardness`
- `laserAbsorption`
- `laserReflectivity`
- `meltingPoint`
- `refractiveIndex`
- `thermalConductivity`
- `thermalDiffusivity`
- `thermalExpansion`
- `vaporPressure`
- `youngModulus`
- ... (see full list in YAML files)

**Rationale:**
- Matches TypeScript/JavaScript component conventions
- Aligns with JSON-LD Schema.org naming standards
- Consistent with scientific documentation
- Enables direct property access: `frontmatter.thermalConductivity`

---

### 3. Property Metadata (snake_case)

**Use snake_case for:**
- Property-level metadata fields (nested under each property)
- Research tracking information
- Data quality indicators

**Examples:**
```yaml
properties:
  thermalConductivity:      # ← camelCase property name
    value: 237.0
    unit: "W/(m·K)"
    confidence: 95
    source: ai_research     # ← snake_case metadata
    research_date: '2025-10-23T11:10:56.454122'  # ← snake_case
    last_updated: '2025-10-17T00:00:00.000000'   # ← snake_case
```

**Standard metadata fields:**
- `value` - Numeric value
- `unit` - Measurement unit (string)
- `confidence` - Data quality score (0-100)
- `source` - Data source identifier
- `description` - Human-readable explanation
- `research_date` - When data was researched (optional)
- `last_updated` - Last modification timestamp (optional)
- `adjustment_note` - Reason for adjustments (optional)

---

### 4. Category Ranges (Mixed Convention)

**Pattern:** camelCase keys with snake_case metadata

```yaml
category_info:
  category_ranges:          # ← snake_case container
    thermalConductivity:    # ← camelCase property name (matches properties)
      min: 50.0
      max: 429.0
      unit: "W/(m·K)"
      source: cross_material_analysis
      confidence: 90
      last_updated: '2025-10-17'  # ← snake_case metadata
```

**Rationale:** Property names match the `properties` section for consistency

---

### 5. Single-Word Fields (No Convention Needed)

**Use lowercase, no separators for:**
- Author information
- Simple identifiers
- Single-word descriptors

**Examples:**
```yaml
author:
  name: Todd Dunning
  title: MA
  expertise: Optical Materials
  country: United States
  id: 4
  sex: m
  image: /images/author/todd-dunning.jpg

caption:
  description: Brief description
  beforeText: Analysis before treatment
  afterText: Analysis after treatment
```

---

## Validation Rules

### File Names
- **Format:** kebab-case
- **Pattern:** `[material-name]-laser-cleaning.yaml`
- **Example:** `aluminum-laser-cleaning.yaml`
- **Regex:** `/^[a-z0-9]+(-[a-z0-9]+)*\.yaml$/`

### Category Slugs
- **Format:** lowercase with optional hyphens
- **Examples:** `metal`, `ceramic`, `wood`, `stone`, `plastic`, `rare-earth`
- **Regex:** `/^[a-z-]+$/`
- **Note:** Hyphens allowed for multi-word categories (e.g., `rare-earth`)

### Property Names
- **Format:** camelCase
- **Pattern:** Start lowercase, capitalize subsequent words
- **Regex:** `/^[a-z][a-zA-Z0-9]*$/`
- **Examples:** ✅ `thermalConductivity` ❌ `thermal_conductivity`

### Metadata Field Names
- **Format:** snake_case
- **Pattern:** Lowercase with underscores
- **Regex:** `/^[a-z]+(_[a-z]+)*$/`
- **Examples:** ✅ `generated_date` ❌ `generatedDate`

---

## Quick Reference

| Field Type | Convention | Example | Usage |
|-----------|-----------|---------|-------|
| **Generator metadata** | snake_case | `generated_date` | Top-level YAML |
| **Material properties** | camelCase | `thermalConductivity` | `properties.*` |
| **Property metadata** | snake_case | `research_date` | Nested under properties |
| **Category ranges** | camelCase keys | `thermalConductivity` | `category_info.category_ranges.*` |
| **File names** | kebab-case | `aluminum-laser-cleaning.yaml` | File system |
| **Category slugs** | lowercase-hyphen | `metal`, `rare-earth` | Optional hyphens |
| **Author fields** | lowercase | `name`, `title` | Single words |

---

## Best Practices

### ✅ DO:
```yaml
# Good: Clear semantic separation
generated_date: '2025-10-24T23:51:36.346146'  # snake_case metadata
data_completeness: 100%                       # snake_case metadata

properties:
  thermalConductivity:                        # camelCase property
    value: 237.0
    unit: "W/(m·K)"
    confidence: 95
    research_date: '2025-10-23'               # snake_case metadata
```

### ❌ DON'T:
```yaml
# Bad: Inconsistent naming
generatedDate: '2025-10-24...'               # ❌ Should be snake_case
dataCompleteness: 100%                       # ❌ Should be snake_case

properties:
  thermal_conductivity:                      # ❌ Should be camelCase
    value: 237.0
```

### ✅ DO: Use prefixes for related properties
```yaml
properties:
  thermalConductivity: { ... }
  thermalDiffusivity: { ... }
  thermalExpansion: { ... }
  electricalConductivity: { ... }
  electricalResistivity: { ... }
```

### ❌ DON'T: Mix conventions within same level
```yaml
properties:
  thermal_conductivity: { ... }    # ❌ snake_case
  electricalConductivity: { ... }  # ✅ camelCase
  # Pick ONE convention per level
```

---

## TypeScript Type Definitions

Properties are strongly typed in `types/centralized.ts`:

```typescript
export interface MaterialProperty {
  value: number | string;
  unit: string;
  confidence: number;
  source?: string;
  description?: string;
  research_date?: string;  // snake_case metadata
  last_updated?: string;   // snake_case metadata
}

export interface MaterialProperties {
  thermalConductivity?: MaterialProperty;  // camelCase property
  electricalResistivity?: MaterialProperty;
  meltingPoint?: MaterialProperty;
  // ... 39 more camelCase properties
}
```

---

## Migration Notes

### Historical Context
- **Before Oct 2025:** Mixed naming, no clear rules
- **Oct 2025:** Standardized hybrid approach, documented here
- **Current:** 478 files follow this convention (95% consistency)

### If You Need to Change Conventions
⚠️ **NOT RECOMMENDED** - Current system works well

If absolutely necessary:
1. Update 478 YAML files
2. Update TypeScript type definitions
3. Update 20+ component accessors
4. Update JSON-LD generation
5. Update validation scripts
6. Update all documentation

**Estimated effort:** 8-12 hours  
**Risk:** HIGH (breaking changes)  
**Benefit:** Marginal (current system functional)

---

## Validation Scripts

### Check Naming Compliance
```bash
npm run validate:naming
```

### Validate Metadata Structure
```bash
npm run validate:metadata
```

### E2E Validation (includes naming)
```bash
npm run build  # Runs prebuild validation
```

---

## Related Documentation

- **Type Definitions:** `types/centralized.ts`
- **Validation Script:** `scripts/validate-naming-e2e.js`
- **Component Usage:** `docs/architecture/frontmatter/COMPONENT_COMPATIBILITY.md`
- **Architecture:** `docs/architecture/frontmatter/STRUCTURE_ANALYSIS.md`
- **Naming Evaluation:** `docs/NAMING_NORMALIZATION_EVALUATION.md`

---

## Support

**Questions?** Check:
1. This document first
2. Component compatibility docs
3. Existing YAML files as examples
4. TypeScript type definitions

**Found an issue?** Validate before assuming error:
```bash
npm run validate:naming -- --file frontmatter/materials/yourfile.yaml
```

---

**Status:** ✅ Official naming convention  
**Enforcement:** Automated via prebuild validation  
**Compliance:** 95% across 478 files (4 metadata fields use snake_case)
