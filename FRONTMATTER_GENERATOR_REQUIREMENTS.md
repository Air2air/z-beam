# Frontmatter Generator Requirements

**Version**: 1.0  
**Date**: December 17, 2025  
**Purpose**: Critical requirements for frontmatter file generation to ensure filename and link consistency

---

## 🚨 Critical Issues Fixed

This document specifies the requirements to fix two critical structural issues:

1. ✅ **Filename Suffixes** - FIXED: All files now use proper type suffixes
2. ❌ **Domain Linkage URLs** - NEEDS FIX: URLs must use actual slugs from target files

---

## File Naming Requirements

### Filename Patterns (ENFORCED)

**Materials**:
```
Pattern: {material-name}-laser-cleaning.yaml
Example: aluminum-laser-cleaning.yaml
Count: 153 files
```

**Contaminants**:
```
Pattern: {contaminant-name}-contaminant.yaml
Example: aluminum-oxidation-contaminant.yaml
Count: 98 files
```

**Compounds**:
```
Pattern: {compound-name}-compound.yaml
Example: formaldehyde-compound.yaml
Count: 20 files
```

**Settings**:
```
Pattern: {material-name}-settings.yaml
Example: aluminum-settings.yaml
Count: 153 files
```

### Filename Rules
- ✅ MUST use kebab-case (lowercase with hyphens)
- ✅ MUST include type suffix
- ❌ NO underscores
- ❌ NO uppercase letters
- ❌ NO parentheses
- ❌ NO spaces

---

## ID Field Requirements

The `id` field in each file MUST follow these patterns:

### Materials
```yaml
# Filename: aluminum-laser-cleaning.yaml
id: aluminum-laser-cleaning  # MUST match filename exactly
```

### Contaminants
```yaml
# Filename: aluminum-oxidation-contaminant.yaml
id: aluminum-oxidation-contamination  # Note: -contamination not -contaminant
```

### Compounds
```yaml
# Filename: formaldehyde-compound.yaml
id: formaldehyde-compound  # MUST match filename exactly
```

### Settings
```yaml
# Filename: aluminum-settings.yaml
id: Aluminum  # Title Case material name (exception to kebab-case)
```

---

## Slug Field Requirements

The `slug` field MUST match the **base filename** (without type suffix):

### Examples

```yaml
# File: aluminum-laser-cleaning.yaml
slug: aluminum  # Remove -laser-cleaning suffix

# File: aluminum-oxidation-contaminant.yaml
slug: aluminum-oxidation  # Remove -contaminant suffix

# File: formaldehyde-compound.yaml
slug: formaldehyde  # Remove -compound suffix

# File: aluminum-settings.yaml
slug: aluminum  # Remove -settings suffix
```

### Slug Rules
- ✅ MUST be kebab-case
- ✅ MUST match base filename
- ✅ MUST be unique within content type
- ❌ NO abbreviations
- ❌ NO custom variations

---

## 🚨 CRITICAL: Domain Linkages URL Requirements

### The Problem

Currently, URLs in `domain_linkages` use **abbreviated IDs** that don't match actual file slugs:

```yaml
# ❌ CURRENT (WRONG):
domain_linkages:
  related_contaminants:
  - id: adhesive-residue  # ← Abbreviated
    url: /contaminants/.../adhesive-residue  # ← Wrong slug

# Actual file: adhesive-residue-tape-marks-contaminant.yaml
# Actual slug: adhesive-residue-tape-marks  # ← URLs should use THIS
```

### The Solution

URLs MUST use the **actual slug** from the referenced file:

```yaml
# ✅ CORRECT:
domain_linkages:
  related_contaminants:
  - id: adhesive-residue-tape-marks-contamination  # Full ID from target file
    slug: adhesive-residue-tape-marks  # Actual slug from target file
    title: Adhesive Residue / Tape Marks
    url: /contaminants/organic-residue/adhesive/adhesive-residue-tape-marks  # ← Matches slug!
    image: /images/contaminants/organic-residue/adhesive/adhesive-residue-tape-marks.jpg
```

### Link Generation Algorithm

**REQUIRED PROCESS** when generating any link reference:

```python
def generate_link_entry(target_filename, content_type):
    """
    Generate a domain_linkages entry.
    
    CRITICAL: Must load target file to get actual slug.
    """
    # Step 1: Load the target file
    file_path = f"frontmatter/{content_type}/{target_filename}"
    target_data = load_yaml(file_path)
    
    # Step 2: Extract fields from target file
    id_field = target_data['id']         # e.g., "aluminum-oxidation-contamination"
    slug_field = target_data['slug']     # e.g., "aluminum-oxidation" ← USE THIS
    name_field = target_data['name']     # e.g., "Aluminum Oxidation"
    category = target_data['category']   # e.g., "oxidation"
    subcategory = target_data.get('subcategory', '')  # e.g., "non-ferrous"
    
    # Step 3: Build URL using ACTUAL SLUG (not abbreviated ID)
    if content_type == 'contaminants':
        url = f'/contaminants/{category}/{subcategory}/{slug_field}'
    elif content_type == 'materials':
        url = f'/materials/{slug_field}'
    elif content_type == 'compounds':
        url = f'/compounds/{slug_field}'
    elif content_type == 'settings':
        url = f'/settings/{slug_field}'
    
    # Step 4: Build image path using ACTUAL SLUG
    if content_type == 'contaminants':
        image = f'/images/contaminants/{category}/{subcategory}/{slug_field}.jpg'
    elif content_type == 'materials':
        image = f'/images/materials/{slug_field}-hero.jpg'
    elif content_type == 'compounds':
        image = f'/images/compounds/{slug_field}.jpg'
    
    # Step 5: Return link entry with actual slug
    return {
        'id': id_field,
        'slug': slug_field,  # ← REQUIRED: Include explicit slug
        'title': name_field,
        'url': url,          # ← Built from actual slug
        'image': image,      # ← Built from actual slug
        # ... metadata fields
    }
```

### Complete Link Structure

All domain linkage entries MUST include these fields:

```yaml
related_contaminants:
- id: {id-from-target-file}              # ID field from referenced file
  slug: {slug-from-target-file}          # ← NEW REQUIRED FIELD
  title: {name-from-target-file}         # Name field from referenced file
  url: /{content-type}/{path}/{slug}     # URL built from actual slug
  image: /images/{content-type}/{path}/{slug}.{ext}  # Image path from actual slug
  frequency: common|occasional|rare      # Metadata (contaminants only)
  severity: minor|moderate|severe        # Metadata (contaminants only)
  typical_context: general|specific      # Metadata (contaminants only)

related_materials:
- id: {id-from-target-file}
  slug: {slug-from-target-file}          # ← NEW REQUIRED FIELD
  title: {name-from-target-file}
  url: /materials/{slug}                 # URL built from actual slug
  image: /images/materials/{slug}-hero.jpg
  relevance: primary|secondary           # Metadata

related_compounds:
- id: {id-from-target-file}
  slug: {slug-from-target-file}          # ← NEW REQUIRED FIELD
  title: {name-from-target-file}
  url: /compounds/{slug}                 # URL built from actual slug
  image: /images/compounds/{slug}.jpg
  exposure_risk: high|medium|low         # Metadata

related_settings:
- id: {id-from-target-file}
  slug: {slug-from-target-file}          # ← NEW REQUIRED FIELD
  title: {name-from-target-file}
  url: /settings/{slug}                  # URL built from actual slug
  image: /images/settings/{slug}.jpg
```

---

## Validation Requirements

### Pre-Generation Validation

Before generating any frontmatter file:

1. ✅ Verify target filename follows naming pattern
2. ✅ Verify slug field matches base filename
3. ✅ Verify ID field follows type-specific pattern
4. ✅ Verify all referenced files exist
5. ✅ Verify all link URLs use actual slugs from target files

### Post-Generation Validation

After generating frontmatter files:

```bash
# Test 1: Filename suffixes
ls frontmatter/materials/*.yaml | grep -v -- "-laser-cleaning.yaml" && echo "❌ FAIL" || echo "✅ PASS"

# Test 2: Slug consistency
for file in frontmatter/materials/*-laser-cleaning.yaml; do
  base=$(basename "$file" -laser-cleaning.yaml)
  slug=$(grep "^slug:" "$file" | cut -d' ' -f2)
  [ "$slug" = "$base" ] || echo "❌ Mismatch: $file"
done

# Test 3: Link URLs match slugs
# This requires parsing YAML and verifying each URL ends with the correct slug
python3 scripts/validate_domain_linkages.py
```

---

## Examples

### Example 1: Material File

```yaml
# File: aluminum-laser-cleaning.yaml

# Identity
id: aluminum-laser-cleaning      # ✅ Matches filename
slug: aluminum                   # ✅ Base filename without suffix
name: Aluminum
category: metal
subcategory: non-ferrous

# Domain Linkages
domain_linkages:
  related_contaminants:
  - id: aluminum-oxidation-contamination           # From target file
    slug: aluminum-oxidation                       # From target file
    title: Aluminum Oxidation                      # From target file
    url: /contaminants/oxidation/non-ferrous/aluminum-oxidation  # Uses actual slug
    image: /images/contaminants/oxidation/non-ferrous/aluminum-oxidation.jpg
    frequency: common
    severity: moderate
```

### Example 2: Contaminant File

```yaml
# File: aluminum-oxidation-contaminant.yaml

# Identity
id: aluminum-oxidation-contamination  # ✅ Ends with -contamination
slug: aluminum-oxidation              # ✅ Base filename without suffix
name: Aluminum Oxidation
category: oxidation
subcategory: non-ferrous

# Domain Linkages
domain_linkages:
  related_materials:
  - id: aluminum-laser-cleaning        # From target file
    slug: aluminum                     # From target file
    title: Aluminum                    # From target file
    url: /materials/aluminum           # Uses actual slug
    image: /images/materials/aluminum-hero.jpg
    relevance: primary
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Abbreviated IDs in URLs
```yaml
# Target file: adhesive-residue-tape-marks-contaminant.yaml
# Target slug: adhesive-residue-tape-marks

# WRONG:
url: /contaminants/.../adhesive-residue  # ❌ Abbreviated

# CORRECT:
url: /contaminants/.../adhesive-residue-tape-marks  # ✅ Full slug
```

### ❌ Mistake 2: Not Loading Target File
```python
# WRONG: Assuming/guessing the slug
url = f"/contaminants/.../{abbreviated_id}"

# CORRECT: Loading actual slug from file
target_data = load_yaml(target_file)
url = f"/contaminants/.../target_data['slug']}"
```

### ❌ Mistake 3: Missing Slug Field in Links
```yaml
# WRONG: No slug field
- id: aluminum-oxidation-contamination
  url: /contaminants/.../aluminum-oxidation

# CORRECT: Include explicit slug
- id: aluminum-oxidation-contamination
  slug: aluminum-oxidation  # ← Required for validation
  url: /contaminants/.../aluminum-oxidation
```

### ❌ Mistake 4: Filename/Slug Mismatch
```yaml
# Filename: aluminum-oxidation-contaminant.yaml
slug: aluminum-oxide  # ❌ WRONG - doesn't match base filename

# CORRECT:
slug: aluminum-oxidation  # ✅ Matches base filename
```

---

## Implementation Checklist

When implementing the frontmatter generator:

### Phase 1: File Structure
- [ ] Generate filenames with correct type suffixes
- [ ] Set `id` field according to type-specific patterns
- [ ] Set `slug` field to match base filename
- [ ] Verify filename/slug consistency

### Phase 2: Link Generation
- [ ] Create function to load target file and extract slug
- [ ] Build URLs using actual slug from target file
- [ ] Include explicit `slug` field in all link entries
- [ ] Build image paths using actual slug

### Phase 3: Validation
- [ ] Validate filename patterns
- [ ] Validate id/slug consistency
- [ ] Validate all link URLs match target slugs
- [ ] Test cross-references resolve correctly

### Phase 4: Testing
- [ ] Generate sample files
- [ ] Run validation scripts
- [ ] Verify links in dev server
- [ ] Check 404 errors are eliminated

---

## Reference Mapping

### Current State (Files Renamed ✅)
- Materials: 153 files with `-laser-cleaning.yaml` suffix
- Contaminants: 98 files with `-contaminant.yaml` suffix
- Compounds: 20 files with `-compound.yaml` suffix
- Settings: 153 files with `-settings.yaml` suffix

### Required State (Links Need Regeneration ❌)
- All `domain_linkages` URLs must use actual slugs from target files
- All link entries must include explicit `slug` field
- All image paths must use actual slugs from target files

---

## Summary

**CRITICAL REQUIREMENTS**:

1. **Filename**: `{name}-{type}.yaml` with correct type suffix
2. **ID Field**: Follow type-specific pattern (see ID Field Requirements)
3. **Slug Field**: Match base filename (without type suffix)
4. **Link URLs**: MUST use actual slug from target file (not abbreviated)
5. **Link Slug Field**: MUST include explicit slug in all link entries
6. **Link Generation**: MUST load target file to get actual slug value

**NEVER**:
- ❌ Use abbreviated IDs in URLs
- ❌ Guess or assume slug values
- ❌ Build URLs without loading target file
- ❌ Omit slug field from link entries

**ALWAYS**:
- ✅ Load target file to get actual slug
- ✅ Use exact slug value in URLs
- ✅ Include explicit slug field in links
- ✅ Validate URLs match actual slugs
