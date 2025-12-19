# Hazardous Fumes URL Addition Guide

**Date**: December 16, 2025  
**Issue**: `fumes_generated` array in contaminant frontmatter lacks URLs for compound linking  
**Impact**: Hazardous Fumes Table cannot link compound names to their detail pages  
**Priority**: MEDIUM - Enhances user experience with navigable compound references

---

## Problem Summary

The `safety_data.fumes_generated` array in contaminant frontmatter contains compound names but no URLs. This prevents the HazardousFumesTable component from creating clickable links to compound detail pages.

### Current Structure (Missing URLs)
```yaml
safety_data:
  fumes_generated:
    - compound: Carbon Monoxide
      concentration_mg_m3: 50-200
      exposure_limit_mg_m3: 29
      hazard_class: toxic
      # ❌ NO URL FIELD
    - compound: Formaldehyde
      concentration_mg_m3: 5-25
      exposure_limit_mg_m3: 0.3
      hazard_class: carcinogenic
      # ❌ NO URL FIELD
```

---

## Required URL Pattern

### Compound URL Structure
**Pattern**: `/compounds/{hazard_class}/{subcategory}/{compound-slug}-compound`

The compound slug must:
1. Be lowercase
2. Use hyphens instead of spaces
3. Always end with `-compound` suffix
4. Match the compound's actual slug in the compounds directory

### URL Construction Examples

| Compound Name | Hazard Class | Subcategory | Correct URL |
|---------------|--------------|-------------|-------------|
| Carbon Monoxide | asphyxiant | simple_asphyxiant | `/compounds/asphyxiant/simple-asphyxiant/carbon-monoxide-compound` |
| Formaldehyde | irritant | aldehyde | `/compounds/irritant/aldehyde/formaldehyde-compound` |
| Benzene | solvent | aromatic_hydrocarbon | `/compounds/solvent/aromatic-hydrocarbon/benzene-compound` |
| Hydrogen Cyanide | toxic | cyanide | `/compounds/toxic/cyanide/hydrogen-cyanide-compound` |
| Acrolein | irritant | aldehyde | `/compounds/irritant/aldehyde/acrolein-compound` |
| Hydrogen Chloride | corrosive | acid | `/compounds/corrosive/acid/hydrogen-chloride-compound` |
| Chromium VI | carcinogenic | heavy_metal | `/compounds/carcinogenic/heavy-metal/chromium-vi-compound` |
| Nitrogen Oxides | irritant | nitrogen_oxide | `/compounds/irritant/nitrogen-oxide/nitrogen-oxides-compound` |
| VOCs | irritant | volatile_organic | `/compounds/irritant/volatile-organic/vocs-compound` |

**Note**: URL subcategories use hyphens in URLs (e.g., `aromatic-hydrocarbon`) even if stored with underscores in frontmatter.

---

## Required Data Structure

### New Structure (With URLs)
```yaml
safety_data:
  fumes_generated:
    - compound: Carbon Monoxide
      compound_id: carbon-monoxide-compound  # NEW - Compound slug
      url: /compounds/asphyxiant/simple-asphyxiant/carbon-monoxide-compound  # NEW
      concentration_mg_m3: 50-200
      exposure_limit_mg_m3: 29
      hazard_class: toxic
    - compound: Formaldehyde
      compound_id: formaldehyde-compound  # NEW - Compound slug
      url: /compounds/irritant/aldehyde/formaldehyde-compound  # NEW
      concentration_mg_m3: 5-25
      exposure_limit_mg_m3: 0.3
      hazard_class: carcinogenic
```

### Field Definitions
- **compound** (string): Human-readable compound name (existing, keep as-is)
- **compound_id** (string): Compound slug identifier (NEW - for reference)
- **url** (string): Full path to compound detail page (NEW - for linking)
- **concentration_mg_m3** (string|number): Concentration range (existing)
- **exposure_limit_mg_m3** (number): Exposure limit threshold (existing)
- **hazard_class** (string): Hazard classification (existing)

---

## Complete Before/After Example

### Contaminant: plastic-residue-contamination.yaml

**BEFORE (Current)**:
```yaml
safety_data:
  fire_explosion_risk: low
  fumes_generated:
    - compound: Carbon Monoxide
      concentration_mg_m3: 50-200
      exposure_limit_mg_m3: 29
      hazard_class: toxic
    - compound: Hydrogen Cyanide
      concentration_mg_m3: 5-30
      exposure_limit_mg_m3: 5
      hazard_class: toxic
    - compound: Benzene
      concentration_mg_m3: 10-50
      exposure_limit_mg_m3: 0.5
      hazard_class: carcinogenic
    - compound: Formaldehyde
      concentration_mg_m3: 5-25
      exposure_limit_mg_m3: 0.3
      hazard_class: carcinogenic
    - compound: Acrolein
      concentration_mg_m3: 2-10
      exposure_limit_mg_m3: 0.1
      hazard_class: irritant
    - compound: Hydrogen Chloride
      concentration_mg_m3: 10-40
      exposure_limit_mg_m3: 2
      hazard_class: corrosive
```

**AFTER (With URLs)**:
```yaml
safety_data:
  fire_explosion_risk: low
  fumes_generated:
    - compound: Carbon Monoxide
      compound_id: carbon-monoxide-compound
      url: /compounds/asphyxiant/simple-asphyxiant/carbon-monoxide-compound
      concentration_mg_m3: 50-200
      exposure_limit_mg_m3: 29
      hazard_class: toxic
    - compound: Hydrogen Cyanide
      compound_id: hydrogen-cyanide-compound
      url: /compounds/toxic/cyanide/hydrogen-cyanide-compound
      concentration_mg_m3: 5-30
      exposure_limit_mg_m3: 5
      hazard_class: toxic
    - compound: Benzene
      compound_id: benzene-compound
      url: /compounds/solvent/aromatic-hydrocarbon/benzene-compound
      concentration_mg_m3: 10-50
      exposure_limit_mg_m3: 0.5
      hazard_class: carcinogenic
    - compound: Formaldehyde
      compound_id: formaldehyde-compound
      url: /compounds/irritant/aldehyde/formaldehyde-compound
      concentration_mg_m3: 5-25
      exposure_limit_mg_m3: 0.3
      hazard_class: carcinogenic
    - compound: Acrolein
      compound_id: acrolein-compound
      url: /compounds/irritant/aldehyde/acrolein-compound
      concentration_mg_m3: 2-10
      exposure_limit_mg_m3: 0.1
      hazard_class: irritant
    - compound: Hydrogen Chloride
      compound_id: hydrogen-chloride-compound
      url: /compounds/corrosive/acid/hydrogen-chloride-compound
      concentration_mg_m3: 10-40
      exposure_limit_mg_m3: 2
      hazard_class: corrosive
```

---

## Implementation Instructions

### For Frontmatter Generator Script

1. **Locate fumes_generated generation code** in contaminant frontmatter generator

2. **Create compound URL lookup function**:
```python
def get_compound_url(compound_name: str) -> tuple[str, str]:
    """
    Get compound slug and URL from compound name.
    Returns: (compound_id, url)
    """
    # Read compounds directory to build lookup
    compound_map = {
        'Carbon Monoxide': ('carbon-monoxide-compound', 
                           '/compounds/asphyxiant/simple-asphyxiant/carbon-monoxide-compound'),
        'Formaldehyde': ('formaldehyde-compound',
                        '/compounds/irritant/aldehyde/formaldehyde-compound'),
        'Benzene': ('benzene-compound',
                   '/compounds/solvent/aromatic-hydrocarbon/benzene-compound'),
        'Hydrogen Cyanide': ('hydrogen-cyanide-compound',
                            '/compounds/toxic/cyanide/hydrogen-cyanide-compound'),
        # ... add all compounds
    }
    return compound_map.get(compound_name, (None, None))
```

3. **Alternative: Dynamic lookup from compound frontmatter**:
```python
def find_compound_by_name(compound_name: str) -> dict:
    """
    Search compound frontmatter files for matching name.
    Returns compound metadata including slug, category, subcategory.
    """
    compounds_dir = 'frontmatter/compounds/'
    for compound_file in os.listdir(compounds_dir):
        with open(f'{compounds_dir}/{compound_file}', 'r') as f:
            data = yaml.safe_load(f)
            if data.get('name') == compound_name:
                return {
                    'id': data['id'],
                    'category': data['category'],
                    'subcategory': data['subcategory'],
                    'url': f"/compounds/{data['category']}/{data['subcategory'].replace('_', '-')}/{data['id']}"
                }
    return None
```

4. **Update fumes_generated output**:
```python
# ✅ NEW IMPLEMENTATION
fumes_generated = []
for fume in safety_data['fumes']:
    compound_id, compound_url = get_compound_url(fume['compound'])
    fumes_generated.append({
        'compound': fume['compound'],
        'compound_id': compound_id,  # NEW
        'url': compound_url,  # NEW
        'concentration_mg_m3': fume['concentration'],
        'exposure_limit_mg_m3': fume['exposure_limit'],
        'hazard_class': fume['hazard_class']
    })
```

5. **Regenerate all contaminant frontmatter files**

---

## Verification Checklist

After regenerating frontmatter:

- [ ] All `fumes_generated` entries have `compound_id` field
- [ ] All `fumes_generated` entries have `url` field
- [ ] URLs follow pattern: `/compounds/{hazard_class}/{subcategory}/{compound-slug}-compound`
- [ ] Compound slugs end with `-compound` suffix
- [ ] URLs match actual compound frontmatter file paths
- [ ] Subcategories in URLs use hyphens (not underscores)

---

## Files Requiring Regeneration

### All contaminants with fumes_generated data:
```
/frontmatter/contaminants/**/*.yaml
```

### Affected contaminants (partial list):
- plastic-residue-contamination.yaml
- adhesive-residue-contamination.yaml
- rubber-residue-contamination.yaml
- paint-residue-contamination.yaml
- oil-grease-contamination.yaml
- And ~15 more contaminant files

---

## Component Update Required

After frontmatter is updated, the HazardousFumesTable component will need to be modified to:

1. Accept the new `url` field in FumeData interface
2. Wrap compound names in `<Link>` components
3. Style links appropriately (underline on hover, color indication)

**Component file**: `/app/components/HazardousFumesTable/HazardousFumesTable.tsx`

---

## Reference: Compound Metadata Sources

To build the compound URL lookup, reference:
1. **Compound frontmatter files**: `/frontmatter/compounds/*.yaml`
2. **Each compound has**:
   - `id`: Slug with `-compound` suffix
   - `name`: Display name
   - `category`: Hazard class (irritant, toxic, carcinogenic, etc.)
   - `subcategory`: Specific classification (aldehyde, cyanide, acid, etc.)

**URL construction**:
```
/compounds/{category}/{subcategory.replace('_', '-')}/{id}
```

---

## Testing After Implementation

1. **Verify data structure**:
   ```bash
   grep -A 8 "fumes_generated:" frontmatter/contaminants/plastic-residue-contamination.yaml
   ```
   Should show `compound_id` and `url` fields

2. **Check URL validity**:
   - Visit each URL in browser
   - Confirm 200 OK response (not 404)

3. **Test component rendering**:
   - Navigate to contaminant page with fumes table
   - Verify compound names are clickable
   - Click link and confirm navigation to compound page

---

## Questions?

Contact development team if:
- Compound URLs result in 404 errors (may indicate missing compound pages)
- Compound name mapping is ambiguous (multiple compounds with similar names)
- New compound types are added (update URL pattern documentation)

**Last Updated**: December 16, 2025
