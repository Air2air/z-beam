# Consolidated Dataset Structure - 3-Tier System

**Document**: Streamlined dataset architecture optimized for user experience  
**Created**: December 20, 2025  
**Status**: PROPOSED - Consolidates original 6-tier proposal into 3 practical tiers

---

## Executive Summary

**Original Proposal**: 6 tiers (~600 datasets)  
**Consolidated Proposal**: 3 tiers (~626 datasets)  
**User Query Satisfaction**: ~95% (up from current ~30%)

### Why 3 Tiers?

After analyzing user journeys and data relationships, the 6 original tiers naturally consolidate into 3 practical groups based on **granularity** and **user intent**:

1. **Individual** - "Tell me about this specific thing" (atomic reference data)
2. **Aggregated** - "Show me comparisons/collections/relationships" (derived analysis data)
3. **Discovery** - "What data exists?" (navigation/metadata)

---

## Tier 1: Individual Datasets (491 files)

**Purpose**: Atomic reference data - comprehensive details on single entities  
**User Intent**: "I need complete information about [specific material/contaminant/compound]"

### 1.1 Materials (459 files)
- **153 materials × 3 formats** = 459 files
- Formats: JSON (web apps), CSV (spreadsheets), XML (enterprise systems)
- Content: Material properties, valid contaminants, settings, safety considerations
- Examples: `aluminum.json`, `steel-1045.csv`, `titanium-6al-4v.xml`
- **Status**: ⚠️ BLOCKED - requires materialProperties migration (Phase 1)

### 1.2 Contaminants (294 files)
- **98 contaminants × 3 formats** = 294 files
- Content: Safety data, PPE requirements, visual characteristics, affected materials
- Examples: `rust.json`, `paint-residue.csv`, `oil-contamination.xml`
- **Status**: ✅ FULLY OPERATIONAL

### 1.3 Compounds (102 files)
- **34 compounds × 3 formats** = 102 files
- Content: CAS numbers, exposure limits (OSHA/NIOSH/ACGIH), health effects, molecular data
- Examples: `benzene.json`, `chromium-vi-oxide.csv`, `lead-oxide.xml`
- **Status**: ❌ NOT GENERATING - no generation script exists

**Tier 1 Total**: 855 files (current: 294, needed: 561)

---

## Tier 2: Aggregated Datasets (146 files)

**Purpose**: Derived analysis data - comparisons, collections, relationships  
**User Intent**: "Show me options/comparisons/relationships for my specific need"

### 2.1 Category Comparisons (50 files)

**By Material Category** (10 categories × 3 formats = 30 files)
- `all-metals.json` - 42 metals with thermal/optical/mechanical properties
- `all-woods.csv` - 21 woods comparison (density, moisture content, grain patterns)
- `all-stones.json` - 20 stones (hardness, porosity, composition)
- `all-ceramics.csv`, `all-composites.json`, `all-glass.csv`, etc.
- **User value**: "Show me all metals side-by-side" instead of downloading 42 files

**By Contaminant Category** (7 categories × 3 formats = 21 files)
- `all-organic-residues.json` - 31 oils, greases, polymers
- `all-inorganic-coatings.csv` - 19 paints, platings, anodization
- `all-chemical-residues.json` - 12 acids, salts, flux
- `all-thermal-damage.csv`, `all-oxidation.json`, etc.
- **User value**: "Show me all oil contamination options" without browsing 31 files

**Missing Files**: None - all categories covered

### 2.2 Property-Specific Comparisons (20 files)

**Thermal Properties**
- `thermal-properties-all.csv` - All materials: melting point, conductivity, expansion
- `thermal-properties-metals.json` - Metal subset with detailed thermal data
- `thermal-properties-high-temp.csv` - Materials safe above 1000°C

**Optical Properties**
- `optical-properties-all.json` - All materials: absorptivity across wavelengths
- `optical-properties-1064nm.csv` - Laser absorption at Nd:YAG wavelength
- `optical-properties-fiber.json` - Optimized for fiber laser (1070nm)

**Safety Properties**
- `high-hazard-materials.json` - Toxic fume generation materials
- `beryllium-containing-materials.csv` - Beryllium hazard flag materials
- `ventilation-critical-materials.json` - Requires Class IV ventilation

**Mechanical Properties**
- `hardness-comparison-all.csv` - All materials sorted by hardness
- `density-comparison-all.json` - All materials sorted by density

**User value**: "Show me which metals have high thermal conductivity" without manual research

### 2.3 Relationship Datasets (30 files)

**Material ↔ Contaminant Relationships**
- `aluminum-contaminants.json` - All contaminants that affect aluminum (10+ items)
- `steel-contaminants.csv` - Steel-specific contamination (rust, scale, mill scale, oil)
- `copper-contaminants.json` - Copper oxidation, patina, tarnish
- **15 popular materials** × 2 formats = 30 files

**User value**: "What can contaminate aluminum?" without browsing website cross-references

**Why not Contaminant → Material?**
- Materials already include `valid_materials` field in individual datasets
- Inverse relationship available via `paint-residue.json → valid_materials: [...]`
- Avoids duplication (98 contaminants × 3 formats = 294 files already showing this)

### 2.4 Application Collections (30 files)

**Industry-Specific Collections**
- `aerospace-materials.json` - Aerospace-grade materials (12 materials)
- `automotive-restoration.csv` - Automotive body/frame materials
- `medical-device-compatible.json` - Medical device materials (titanium, stainless, etc.)
- `marine-applications.csv` - Saltwater-resistant materials
- `semiconductor-processing.json` - Cleanroom-compatible materials

**Process-Specific Collections**
- `coating-removal-materials.json` - Materials needing coating removal (45+ materials)
- `rust-removal-materials.csv` - Ferrous materials with oxidation
- `paint-removal-materials.json` - Materials with paint contamination
- `restoration-materials.csv` - Historical restoration applications

**Safety-Specific Collections**
- `ppe-matrix.json` - Material-contaminant PPE requirements matrix
- `exposure-limits-all.csv` - All compounds with OSHA/NIOSH/ACGIH limits
- `ventilation-requirements.json` - Class I-IV ventilation mapping
- `toxic-fume-risk.csv` - High-risk materials/contaminants

**User value**: "What materials work for aerospace applications?" instead of filtering 153 materials manually

### 2.5 Statistical Datasets (16 files)

**Material Statistics**
- `material-statistics.json` - Category distribution, property ranges, coverage stats
- `material-popularity.csv` - Most-viewed materials (from analytics)
- `material-settings-stats.json` - Common power/speed ranges by category

**Contaminant Statistics**
- `contaminant-statistics.json` - Category distribution, safety risk levels
- `contaminant-occurrence.csv` - Most common contaminants by material type
- `ppe-frequency.json` - Most common PPE requirements

**Compound Statistics**
- `exposure-limits-summary.csv` - Min/max/avg OSHA PEL across all compounds
- `health-effects-distribution.json` - Common health effect keywords
- `compound-sources.csv` - Most common contaminant sources

**Cross-Entity Statistics**
- `material-contaminant-matrix.json` - Full relationship matrix (153 × 98)
- `settings-ranges-summary.csv` - Power/speed ranges by material category
- `wavelength-compatibility.json` - Material absorptivity by laser wavelength

**User value**: "What are the most common laser cleaning applications?" from real data

**Tier 2 Total**: 146 files (current: 0, needed: 146)

---

## Tier 3: Discovery Datasets (5 files)

**Purpose**: Navigation and metadata - help users find what they need  
**User Intent**: "What datasets exist? How do I navigate this?"

### 3.1 Master Catalog (1 file)
- `catalog.json` - Complete dataset inventory with metadata
  ```json
  {
    "version": "1.0.0",
    "last_updated": "2025-12-20T19:45:00Z",
    "dataset_count": 1006,
    "tiers": {
      "individual": {
        "count": 855,
        "categories": ["materials", "contaminants", "compounds"]
      },
      "aggregated": {
        "count": 146,
        "categories": ["comparisons", "relationships", "collections", "statistics"]
      },
      "discovery": {
        "count": 5,
        "categories": ["catalog", "indexes", "changelog"]
      }
    },
    "datasets": [
      {
        "id": "aluminum",
        "tier": "individual",
        "category": "materials",
        "formats": ["json", "csv", "xml"],
        "size_bytes": 45678,
        "last_updated": "2025-12-15T10:30:00Z"
      },
      // ... 1005 more entries
    ]
  }
  ```

### 3.2 Format Indexes (2 files)
- `index-by-category.json` - Datasets grouped by material/contaminant category
- `index-by-format.json` - Datasets grouped by format (JSON, CSV, XML)

### 3.3 Changelog (1 file)
- `changelog.json` - Dataset update history with version tracking
  ```json
  {
    "changes": [
      {
        "date": "2025-12-20",
        "version": "1.1.0",
        "type": "addition",
        "description": "Added 459 material datasets (Phase 1 completion)",
        "affected_datasets": ["aluminum.json", "steel-1045.json", ...]
      },
      {
        "date": "2025-12-18",
        "version": "1.0.0",
        "type": "initial",
        "description": "Initial dataset system launch (294 contaminant datasets)"
      }
    ]
  }
  ```

### 3.4 Statistics Summary (1 file)
- `statistics.json` - High-level metrics for landing page/dashboard
  ```json
  {
    "total_datasets": 1006,
    "total_materials": 153,
    "total_contaminants": 98,
    "total_compounds": 34,
    "coverage": {
      "materials_with_properties": 153,
      "contaminants_with_safety_data": 98,
      "compounds_with_exposure_limits": 34
    },
    "downloads_last_30_days": 12450,
    "most_downloaded": ["aluminum.json", "rust.csv", "all-metals.json"]
  }
  ```

**Tier 3 Total**: 5 files (current: 0, needed: 5)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1) - 5-8 hours
**Goal**: Enable Tier 1 material datasets

1. **materialProperties Migration** (5 hours)
   - Expand PROPERTY_DATABASE from 5 to 153 materials
   - Run migration script: `npm run migrate:properties -- --commit`
   - Validate: `npm run generate:datasets` produces 459 material files
   - Deploy and test Google Rich Results

**Output**: 294 → 753 datasets (159% increase)

### Phase 2: Aggregation (Week 2) - 8-10 hours
**Goal**: Enable Tier 2 category comparisons and property comparisons

1. **Category Aggregations** (4 hours)
   - Create `scripts/generate-aggregated-datasets.ts`
   - Generate 10 material category files (all-metals.json, etc.)
   - Generate 7 contaminant category files (all-organic-residues.json, etc.)
   - Output: 50 new files

2. **Property Comparisons** (4 hours)
   - Add property comparison generator
   - Generate thermal, optical, mechanical, safety comparisons
   - Output: 20 new files

**Output**: 753 → 823 datasets (70 new comparison files)

### Phase 3: Relationships & Applications (Week 3) - 6-8 hours
**Goal**: Enable Tier 2 relationship and application collections

1. **Relationship Datasets** (3 hours)
   - Extract material → contaminant relationships
   - Generate 15 popular materials (aluminum, steel, copper, etc.)
   - Output: 30 new files

2. **Application Collections** (3 hours)
   - Create curated industry/process/safety collections
   - Manual curation for aerospace, automotive, medical, etc.
   - Output: 30 new files

**Output**: 823 → 883 datasets (60 new collection files)

### Phase 4: Compounds & Statistics (Week 4) - 6-8 hours
**Goal**: Complete Tier 1 compounds and Tier 2 statistics

1. **Compound Dataset Generation** (4 hours)
   - Add compound generation to `generate-datasets.ts`
   - Model after contaminant structure
   - Generate 34 compounds × 3 formats = 102 files
   - Output: 102 new files

2. **Statistical Datasets** (2 hours)
   - Generate material/contaminant/compound statistics
   - Create cross-entity relationship matrix
   - Output: 16 new files

**Output**: 883 → 1001 datasets (118 new files)

### Phase 5: Discovery & Finalization (Week 4) - 2-3 hours
**Goal**: Enable Tier 3 discovery

1. **Discovery Datasets** (2 hours)
   - Generate catalog.json with full inventory
   - Create format indexes and changelog
   - Generate statistics.json for dashboard
   - Output: 5 new files

**Output**: 1001 → 1006 datasets (COMPLETE)

---

## Comparison: Original 6-Tier vs Consolidated 3-Tier

| Metric | Original 6-Tier | Consolidated 3-Tier | Change |
|--------|----------------|---------------------|--------|
| **Tiers** | 6 | 3 | -50% complexity |
| **Total Datasets** | ~600 | 1006 | +68% completeness |
| **User Query Satisfaction** | ~95% | ~95% | Same value |
| **Implementation Complexity** | Medium | Low | Easier to maintain |
| **User Navigation** | 6 categories | 3 categories | Clearer mental model |

### Original 6-Tier Structure
1. Individual datasets (855)
2. Category aggregations (50)
3. Relationship datasets (30)
4. Application collections (30)
5. Safety & compliance (25)
6. Discovery & metadata (5)

### Consolidated 3-Tier Structure
1. **Individual** (855) - Same as original Tier 1
2. **Aggregated** (146) - Consolidates original Tiers 2-5
   - Category comparisons (50)
   - Property comparisons (20)
   - Relationships (30)
   - Applications (30)
   - Statistics (16)
3. **Discovery** (5) - Same as original Tier 6

**Key Improvement**: Original Tiers 2-5 were all "derived datasets" - consolidating them into one logical tier (Tier 2: Aggregated) simplifies mental model while maintaining full functionality.

---

## User Journey Examples

### Journey 1: Research Engineer - "Compare metals for aerospace"
1. **Discovery**: `catalog.json` → "146 aggregated datasets available"
2. **Selection**: `aerospace-materials.json` → 12 aerospace-grade materials
3. **Comparison**: `all-metals.json` → Compare thermal/optical properties
4. **Deep Dive**: `titanium-6al-4v.json` → Full material details

**Datasets Used**: 4 files (Tier 3 → Tier 2 → Tier 2 → Tier 1)

### Journey 2: Compliance Officer - "PPE requirements for operation"
1. **Collection**: `ppe-matrix.json` → Material-contaminant PPE requirements
2. **Safety Data**: `high-hazard-materials.json` → Identify high-risk materials
3. **Deep Dive**: `beryllium-copper.json` + `beryllium-oxide-contamination.json`

**Datasets Used**: 4 files (Tier 2 → Tier 2 → Tier 1 + Tier 1)

### Journey 3: Production Manager - "Settings for steel rust removal"
1. **Material**: `steel-1045.json` → Material properties and valid contaminants
2. **Contaminant**: `rust.json` → Rust removal characteristics
3. **Relationship**: `steel-contaminants.csv` → All steel contamination options
4. **Settings**: Use embedded settings from material file

**Datasets Used**: 3 files (Tier 1 → Tier 1 → Tier 2)

### Journey 4: Data Scientist - "Analyze all laser cleaning data"
1. **Statistics**: `statistics.json` → High-level overview (153 materials, 98 contaminants, 34 compounds)
2. **Matrix**: `material-contaminant-matrix.json` → Full relationship matrix (153 × 98)
3. **Download All**: Use catalog.json to enumerate 1006 datasets for bulk download

**Datasets Used**: 1008 files (Tier 3 → Tier 2 → bulk Tier 1)

---

## Benefits of 3-Tier Structure

### 1. Simpler Mental Model
- **Before**: "Is safety a separate tier or part of collections?"
- **After**: "Tier 1 = atomic, Tier 2 = derived, Tier 3 = navigation"

### 2. Easier Maintenance
- **Before**: 6 generation scripts with overlapping logic
- **After**: 3 generation scripts with clear boundaries

### 3. Better User Navigation
- **Before**: Users unsure which tier to browse
- **After**: Clear progression: Discover → Select → Deep Dive

### 4. Same Functionality, Less Complexity
- All 6 original tiers preserved functionally
- Logical grouping reduces cognitive load
- No features lost in consolidation

---

## Next Steps

1. **Review & Approve**: Validate 3-tier structure meets all requirements
2. **Phase 1 Start**: Begin materialProperties migration (Week 1)
3. **Parallel Work**: Can start Tier 2 aggregation scripts while Phase 1 runs
4. **Staged Rollout**: Deploy incrementally (753 → 823 → 883 → 1001 → 1006)

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| **Total Datasets** | 294 | 1006 | 4 weeks |
| **User Query Satisfaction** | ~30% | ~95% | 4 weeks |
| **Dataset Types** | 1 (contaminants) | 3 (materials, contaminants, compounds) | 1 week |
| **Aggregated Datasets** | 0 | 146 | 3 weeks |
| **SEO Impact** | Limited | Rich Results on 1006 datasets | 4 weeks |
| **User Downloads** | ~500/month | ~3000/month estimated | 8 weeks |

---

**Document Status**: READY FOR APPROVAL  
**Estimated Total Effort**: 27-37 hours (4 weeks at 8 hours/week)  
**Expected ROI**: 242% increase in datasets, 217% increase in user satisfaction
