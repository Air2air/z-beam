# Domain Linkages Migration - Preparation Summary

**Date**: December 15, 2025  
**Status**: 🟡 Ready for Implementation  
**Estimated Time**: 4 weeks (full implementation)

---

## 📊 Current State Analysis

### Existing Data Structure (Pre-Migration)

**✅ What exists now**:
- 153 materials in `frontmatter/materials/*.yaml`
- 98 contaminants in `frontmatter/contaminants/*.yaml`
- 169 settings in `frontmatter/settings/*.yaml`
- 20 compounds (estimated, needs verification)

**✅ Existing linkages found**:
- `valid_materials` in contaminants (20+ occurrences) - Material names as strings
- `byproducts` in contaminants (20+ occurrences) - Compound names as strings
- `eeat.citations` scattered across domains - Free-text regulatory references

**❌ What's missing**:
- No bidirectional linkages (materials don't know their contaminants)
- No compound reverse links (compounds don't know which contaminants produce them)
- No standardized PPE schema
- No standardized regulatory standards schema
- Duplicated exposure limits in both contaminants and compounds
- Inconsistent field naming (eye_protection vs eye)

---

## 🎯 Migration Goals

### Phase 1: Data Integrity (Week 1) - CRITICAL
**Goal**: Eliminate duplication, create shared schemas

**Tasks**:
1. ✅ Create `data/shared/RegulatoryStandards.yaml`
   - Migrate all OSHA, IEC, ISO, ASTM standards
   - Standardize id, name, url, organization, category
   
2. ✅ Create `data/shared/PPE.yaml`
   - Define all PPE types with standards compliance
   - Include protection_level, description, applicability
   
3. ✅ Remove exposure limit duplication
   - Delete `exposure_limit_*` fields from contaminants
   - Compounds.yaml is single source of truth
   - Contaminants reference via `compound_id`

**Scripts Needed**:
- `scripts/data/create_shared_schemas.py` - Generate shared YAML files
- `scripts/data/deduplicate_exposure_limits.py` - Remove duplicates
- `scripts/validation/validate_referential_integrity.py` - Verify links

---

### Phase 2: Bidirectional Linkage Generation (Week 2)
**Goal**: Create normalized `domain_linkages` structure

**Tasks**:
1. ✅ Generate Compound → Contaminant reverse links
   - Parse all contaminant `byproducts`
   - Create `produced_by_contaminants` in Compounds.yaml
   
2. ✅ Generate Material → Contaminant forward links
   - Parse all contaminant `valid_materials`
   - Create `related_contaminants` in Materials.yaml
   
3. ✅ Normalize to domain_linkages structure
   - Add id, title, url, image to all linkages
   - Add domain-specific metadata (frequency, severity, source)
   - Apply to ALL domain files (materials, contaminants, compounds, settings)

**Scripts Needed**:
- `scripts/data/generate_linkages.py` - Primary generation script
- `scripts/data/validate_bidirectional_consistency.py` - Ensure forward/reverse match

---

### Phase 3: Schema Standardization (Week 3)
**Goal**: Unified schemas across all domains

**Tasks**:
1. ✅ Standardize PPE references
   - Replace `eye_protection: "goggles"` with structured PPE linkages
   - Reference `PPE.yaml` via `ppe_id`
   
2. ✅ Standardize regulatory compliance
   - Replace `eeat.citations` strings with structured references
   - Reference `RegulatoryStandards.yaml` via `standard_id`
   
3. ✅ Unify hazard classification
   - Single `hazard_profile` schema for all compounds
   - Remove duplicate `hazard_class`, `hazard_level`, `toxicity_level` fields

**Scripts Needed**:
- `scripts/data/migrate_ppe_references.py`
- `scripts/data/migrate_regulatory_references.py`
- `scripts/data/unify_hazard_classification.py`

---

### Phase 4: UI Integration (Week 4)
**Goal**: Display linkages with adaptive layouts

**Tasks**:
1. ✅ Create Vue components
   - `<DomainLinkageSection>` - Container for all linkage types
   - `<LinkageGrid>` - Adaptive grid (1-4, 5-12, 13-24, 25+ layouts)
   - `<LinkageFilters>` - Category/subcategory filtering
   
2. ✅ Implement layout decision matrix
   - Auto-select layout based on result count
   - Show category filters at 13+ results
   - Show subcategory tabs at 25+ results in selected category
   
3. ✅ Add to all domain pages
   - Materials pages
   - Contaminants pages
   - Compounds pages
   - Settings pages

---

## 📋 Implementation Checklist

### Week 1: Data Integrity ✅

**Day 1-2: Shared Schema Creation**
- [ ] Create `data/shared/RegulatoryStandards.yaml`
  - Extract all unique standards from 153 materials + 98 contaminants
  - Standardize format: id, name, organization, url, category, applicability
  - Expected count: ~25-30 unique standards
  
- [ ] Create `data/shared/PPE.yaml`
  - Define standard PPE types: eye, respiratory, skin, hearing, full-body
  - Include ANSI/NIOSH standards compliance
  - Expected count: ~15-20 PPE types

**Day 3-4: Deduplication**
- [ ] Run deduplication script on contaminants
  - Remove `exposure_limit_mg_m3` from fumes_generated
  - Replace compound names with `compound_id` references
  - Verify 98 contaminants updated
  
- [ ] Validate no duplicated limits remain
  - Grep for `exposure_limit` in contaminants/*.yaml
  - Should return 0 matches

**Day 5: Validation**
- [ ] Run referential integrity checks
  - All compound_ids exist in Compounds.yaml
  - All standard_ids exist in RegulatoryStandards.yaml
  - All ppe_ids exist in PPE.yaml
  
- [ ] Fix any orphaned references

---

### Week 2: Linkage Generation ✅

**Day 1-2: Reverse Link Generation**
- [ ] Generate Compound → Contaminant links
  - Parse 98 contaminants' byproducts arrays
  - Expected output: ~15-20 compounds with produced_by_contaminants arrays
  - Example: formaldehyde produced by [adhesive-residue, organic-coatings, etc.]

**Day 3-4: Forward Link Generation**
- [ ] Generate Material → Contaminant links
  - Parse 98 contaminants' valid_materials arrays
  - Expected output: 153 materials with related_contaminants arrays
  - Example: aluminum has [aluminum-oxidation, anodizing-defects, salt-deposits]

**Day 5: Validation**
- [ ] Verify bidirectional consistency
  - If material X lists contaminant Y, then contaminant Y must list material X
  - Run consistency checker script
  - Fix any mismatches

---

### Week 3: Schema Migration ✅

**Day 1-2: PPE Migration**
- [ ] Migrate all PPE references to domain_linkages.ppe_requirements
  - Replace simple strings with structured objects
  - Add reason, required, context fields
  - Expected: 98 contaminants updated

**Day 3-4: Regulatory Migration**
- [ ] Migrate all regulatory references to domain_linkages.regulatory_compliance
  - Parse eeat.citations strings
  - Match to RegulatoryStandards.yaml entries
  - Expected: 153 materials + 98 contaminants updated

**Day 5: Final Validation**
- [ ] Run complete validation suite
  - Schema compliance
  - Referential integrity
  - Bidirectional consistency
  - No duplicate data
  - All 4 domains pass validation

---

### Week 4: UI Implementation ✅

**Day 1-2: Component Development**
- [ ] Create base components
  - DomainLinkageSection.vue
  - LinkageGrid.vue
  - LinkageFilters.vue
  - EntityCard.vue (generic card component)

**Day 3-4: Layout Logic**
- [ ] Implement adaptive layout selection
  - Auto-detect result count
  - Apply appropriate grid columns
  - Show/hide filters based on thresholds
  - Add pagination for 51+ results

**Day 5: Integration & Testing**
- [ ] Add linkage sections to domain pages
  - ItemPage.tsx (materials, contaminants, settings)
  - Compound pages
  - Test with various result counts (1, 5, 13, 25, 51)
  - Verify category/subcategory filtering works

---

## 🔧 Scripts to Create

### 1. `scripts/data/create_shared_schemas.py`
**Purpose**: Generate RegulatoryStandards.yaml and PPE.yaml

**Inputs**: All frontmatter/*.yaml files  
**Outputs**: 
- `data/shared/RegulatoryStandards.yaml`
- `data/shared/PPE.yaml`

**Logic**:
```python
def extract_regulatory_standards():
    """Parse eeat.citations from all domains"""
    standards = {}
    
    for domain in ['materials', 'contaminants', 'compounds', 'settings']:
        for file in glob(f'frontmatter/{domain}/*.yaml'):
            # Parse citations
            # Standardize format
            # Deduplicate
    
    return standards

def create_ppe_specifications():
    """Define standard PPE types"""
    ppe_types = {
        'ppe-eye-goggles': {
            'id': 'ppe-eye-goggles',
            'name': 'Safety Goggles',
            'type': 'eye_protection',
            'standards': ['ANSI Z87.1'],
            # ...
        },
        # ... more types
    }
    return ppe_types
```

---

### 2. `scripts/data/generate_linkages.py`
**Purpose**: Create bidirectional linkages for all domains

**Inputs**: 
- Materials.yaml (or frontmatter/materials/*.yaml)
- Contaminants.yaml (or frontmatter/contaminants/*.yaml)
- Compounds.yaml (or frontmatter/compounds/*.yaml)
- Settings.yaml (or frontmatter/settings/*.yaml)

**Outputs**: Updated YAML files with domain_linkages section

**Logic**:
```python
def generate_compound_contaminant_links():
    """Create produced_by_contaminants in compounds"""
    compound_links = {}
    
    for contaminant_file in glob('frontmatter/contaminants/*.yaml'):
        contaminant = yaml.load(contaminant_file)
        byproducts = contaminant.get('byproducts', [])
        
        for bp in byproducts:
            compound_id = normalize_compound_id(bp['compound'])
            if compound_id not in compound_links:
                compound_links[compound_id] = []
            
            compound_links[compound_id].append({
                'id': contaminant['slug'],
                'title': contaminant['name'],
                'url': build_url(contaminant),
                'image': get_image(contaminant),
                'source': 'thermal_decomposition',  # or map from phase
                'concentration_range_mg_m3': bp.get('concentration_mg_m3')
            })
    
    return compound_links

def generate_material_contaminant_links():
    """Create related_contaminants in materials"""
    material_links = {}
    
    for contaminant_file in glob('frontmatter/contaminants/*.yaml'):
        contaminant = yaml.load(contaminant_file)
        valid_materials = contaminant.get('valid_materials', [])
        
        for material_name in valid_materials:
            material_id = normalize_material_id(material_name)
            if material_id not in material_links:
                material_links[material_id] = []
            
            material_links[material_id].append({
                'id': contaminant['slug'],
                'title': contaminant['name'],
                'url': build_url(contaminant),
                'image': get_image(contaminant),
                'frequency': estimate_frequency(contaminant, material_id),
                'severity': estimate_severity(contaminant),
                'typical_context': extract_context(contaminant)
            })
    
    return material_links
```

---

### 3. `scripts/validation/validate_linkages.py`
**Purpose**: Ensure all linkages are valid and bidirectional

**Checks**:
1. Referential integrity (all IDs exist)
2. Bidirectional consistency (forward ↔ reverse)
3. Required fields present (id, title, url, image)
4. No orphaned references
5. No circular dependencies

**Output**:
```
Validating linkages...
✅ Materials: 153 entities, 487 contaminant links (all valid)
✅ Contaminants: 98 entities, 96 compound links (5 orphaned)
⚠️  Orphaned compound references:
   • VOCs (11 refs) - should be 'volatile-organic-compounds'
   • H2O (53 refs) - non-hazardous, OK to omit
✅ Compounds: 20 entities, 45 contaminant links (all valid)
✅ Settings: 169 entities, 203 material links (all valid)

Bidirectional Consistency:
✅ 487/487 material→contaminant links have reverse contaminant→material
✅ 96/96 contaminant→compound links have reverse compound→contaminant

Overall: 95% compliant (5 orphaned compound refs to fix)
```

---

## 🎨 UI Component Structure

### DomainLinkageSection.vue
```vue
<template>
  <section v-if="hasLinkages" class="domain-linkages">
    <h2>{{ sectionTitle }}</h2>
    
    <!-- Adaptive layout based on count -->
    <LinkageGrid
      v-if="linkages.length <= 4"
      :entities="linkages"
      :layout="'horizontal'"
      :columns="2"
    />
    
    <LinkageGrid
      v-else-if="linkages.length <= 12"
      :entities="linkages"
      :layout="'grid'"
      :columns="3"
    />
    
    <template v-else>
      <LinkageFilters
        v-if="linkages.length >= 13"
        :categories="availableCategories"
        :selected="selectedCategory"
        @update="handleCategoryChange"
      />
      
      <SubcategoryTabs
        v-if="showSubcategories"
        :subcategories="availableSubcategories"
        :selected="selectedSubcategory"
        @update="handleSubcategoryChange"
      />
      
      <LinkageGrid
        :entities="filteredLinkages"
        :layout="'grid'"
        :columns="4"
        :paginated="linkages.length >= 51"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  domain: 'materials' | 'contaminants' | 'compounds' | 'settings'
  linkages: DomainLinkage[]
}>()

const hasLinkages = computed(() => props.linkages.length > 0)
const sectionTitle = computed(() => `Related ${capitalize(props.domain)}`)

// Implement filtering logic, category detection, subcategory thresholds
</script>
```

---

## 📊 Migration Metrics

### Success Criteria

**Data Quality**:
- ✅ 100% of linkages have required fields (id, title, url, image)
- ✅ 0 orphaned references (all IDs valid)
- ✅ 100% bidirectional consistency (forward ↔ reverse)
- ✅ 0 duplicated exposure limits
- ✅ 0 duplicated regulatory standards

**Coverage**:
- ✅ 90%+ materials have contaminant links
- ✅ 90%+ contaminants have compound links
- ✅ 90%+ contaminants have material links
- ✅ 50%+ materials have setting links (manual curation)

**UI/UX**:
- ✅ All 4 domain pages display linkage sections
- ✅ Adaptive layouts work for all result counts
- ✅ Category filters functional for 13+ results
- ✅ Subcategory tabs appear for 25+ results
- ✅ <100ms query performance

---

## 🚨 Risk Mitigation

### Risk 1: Data Loss During Migration
**Mitigation**: 
- Run on git branch first
- Create backup of all frontmatter files
- Validate before committing

### Risk 2: Broken Linkages
**Mitigation**:
- Run validation suite after each script
- Fix orphaned references immediately
- Don't proceed to next phase until current phase 100% valid

### Risk 3: UI Performance with Large Result Sets
**Mitigation**:
- Implement pagination for 51+ results
- Use virtual scrolling for very large lists
- Cache category counts
- Debounce filter changes

### Risk 4: Manual Curation Bottleneck
**Mitigation**:
- Automate Tier 1 (critical) linkages first
- Defer Tier 2 (enhanced) linkages to later sprint
- Use frequency/severity heuristics for initial values
- Allow incremental curation over time

---

## 📝 Next Steps

1. **Review this document** with team
2. **Approve data structure** (FORMAL_LINKAGE_SPECIFICATION.md + DOMAIN_LINKAGES_STRUCTURE.md)
3. **Run Week 1 tasks** (shared schemas + deduplication)
4. **Validate Week 1 results** before proceeding to Week 2
5. **Iterate** through remaining weeks

**Estimated Start Date**: December 16, 2025  
**Estimated Completion**: January 13, 2026

---

**Status**: 🟡 Ready for Implementation  
**Blockers**: None - all dependencies resolved  
**Risk Level**: 🟢 Low (incremental approach with validation at each step)
