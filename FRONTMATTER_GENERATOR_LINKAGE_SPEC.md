# Frontmatter Generator: Linkage Structure Specification

**Date**: December 18, 2025  
**Purpose**: Define the exact structure required for cross-reference links in frontmatter files  
**Scope**: All materials, contaminants, and settings frontmatter files

---

## Critical Requirements

### 1. Field Name
**REQUIRED**: Use `relationships` (NOT `domain_linkages`)

```yaml
relationships:  # ← Correct field name
  related_materials: []
  related_contaminants: []
```

### 2. Link Entry Structure
Each link entry MUST include these fields in this exact order:

```yaml
- id: full-id-from-target-file-with-suffix
  title: Display Title from Target
  url: /content-type/id-from-target-file
  image: /images/content-type/id-from-target-file.jpg
  frequency: common|uncommon|rare
  severity: high|moderate|low
  typical_context: general|specific-context
```

---

## Field-by-Field Specifications

### `id` Field
**Source**: The `id` field from the target frontmatter file  
**Format**: Must match target file's ID exactly, including suffix

**Examples**:
- Material ID: `aluminum-laser-cleaning` (NOT `Aluminum`)
- Contaminant ID: `adhesive-residue-tape-marks-contamination` (NOT `adhesive-residue`)
- Settings ID: `aluminum-bronze-settings` (NOT `aluminum-bronze`)

**How to Get**: Read target file's `id:` field

### `title` Field
**Source**: The `name` field from the target frontmatter file (or `title` if name not present)  
**Format**: Human-readable display name

**Examples**:
- `"Aluminum"`
- `"Adhesive Residue / Tape Marks"`
- `"Automotive Road Grime"`

**How to Get**: Read target file's `name:` field

### `url` Field
**Source**: Constructed from content type and ID  
**Format**: `/content-type/id` (NO category paths, NO spaces)

**Examples**:
```yaml
# Materials
url: /materials/aluminum-laser-cleaning
url: /materials/steel-laser-cleaning

# Contaminants
url: /contaminants/adhesive-residue-tape-marks-contamination
url: /contaminants/road-grime-contamination

# Settings
url: /settings/aluminum-bronze-settings
```

**Construction Logic**:
```
url = f"/{content_type}/{id}"

Where:
- content_type = "materials" | "contaminants" | "settings"
- id = exact id from target file (with suffix)
```

### `image` Field
**Source**: Constructed from content type and ID  
**Format**: `/images/content-type/id.jpg` (NO category paths, NO spaces)

**Examples**:
```yaml
# Materials
image: /images/materials/aluminum-laser-cleaning.jpg
image: /images/materials/steel-laser-cleaning.jpg

# Contaminants
image: /images/contaminants/adhesive-residue-tape-marks-contamination.jpg
image: /images/contaminants/road-grime-contamination.jpg

# Settings
image: /images/settings/aluminum-bronze-settings.jpg
```

**Construction Logic**:
```
image = f"/images/{content_type}/{id}.jpg"
```

---

## Complete Examples

### Example 1: Material Linking to Contaminants

**Source File**: `steel-laser-cleaning.yaml`

```yaml
relationships:
  related_contaminants:
  - id: adhesive-residue-tape-marks-contamination
    title: Adhesive Residue / Tape Marks
    url: /contaminants/adhesive-residue-tape-marks-contamination
    image: /images/contaminants/adhesive-residue-tape-marks-contamination.jpg
    frequency: common
    severity: moderate
    typical_context: general
  
  - id: road-grime-contamination
    title: Automotive Road Grime
    url: /contaminants/road-grime-contamination
    image: /images/contaminants/road-grime-contamination.jpg
    frequency: common
    severity: low
    typical_context: general
```

### Example 2: Contaminant Linking to Materials

**Source File**: `adhesive-residue-tape-marks-contaminant.yaml`

```yaml
relationships:
  related_materials:
  - id: aluminum-laser-cleaning
    title: Aluminum
    url: /materials/aluminum-laser-cleaning
    image: /images/materials/aluminum-laser-cleaning.jpg
    frequency: common
    severity: moderate
    typical_context: general
  
  - id: steel-laser-cleaning
    title: Steel
    url: /materials/steel-laser-cleaning
    image: /images/materials/steel-laser-cleaning.jpg
    frequency: common
    severity: moderate
    typical_context: general
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Using abbreviated IDs
```yaml
- id: adhesive-residue          # Missing full ID with suffix
```

### ✅ CORRECT: Using full IDs
```yaml
- id: adhesive-residue-tape-marks-contamination
```

---

### ❌ WRONG: URLs with category paths and spaces
```yaml
url: /materials/metal/non-ferrous/Aluminum
url: /contaminants/organic-residue/adhesive/adhesive-residue
```

### ✅ CORRECT: URLs using IDs
```yaml
url: /materials/aluminum-laser-cleaning
url: /contaminants/adhesive-residue-tape-marks-contamination
```

---

### ❌ WRONG: Using title case in IDs
```yaml
- id: Aluminum
  title: Aluminum
```

### ✅ CORRECT: Using exact ID from target file
```yaml
- id: aluminum-laser-cleaning
  title: Aluminum
```

---

## Implementation Checklist

When generating frontmatter relationships, the generator MUST:

- [ ] Use `relationships` as the field name (not `domain_linkages`)
- [ ] For each linked item, lookup the target frontmatter file
- [ ] Extract the exact `id` from target file (with suffix)
- [ ] Extract the `name` field from target file for title
- [ ] Construct URL as: `/{content_type}/{id}`
- [ ] Construct image path as: `/images/{content_type}/{id}.jpg`
- [ ] Include all required fields: id, title, url, image
- [ ] Include metadata fields: frequency, severity, typical_context
- [ ] Ensure NO spaces in URLs or image paths
- [ ] Ensure NO category hierarchies in URLs or image paths

---

## Validation Rules

Each generated link entry must pass these validations:

1. **Field Presence**: All required fields present (id, title, url, image)
2. **ID Format**: ID ends with correct suffix (`-laser-cleaning`, `-contamination`, `-settings`)
3. **URL Format**: URL follows pattern `/{content_type}/{id}` with no spaces
4. **Image Format**: Image follows pattern `/images/{content_type}/{id}.jpg`
5. **Consistency**: ID in URL matches id field
6. **Consistency**: ID in image path matches id field

---

## Target File Locations

To lookup target file information:

```
Materials:     frontmatter/materials/{material-name}-laser-cleaning.yaml
Contaminants:  frontmatter/contaminants/{contaminant-slug}-contaminant.yaml
Settings:      frontmatter/settings/{material-name}-settings.yaml
```

**Note**: Contaminant files use `-contaminant.yaml` suffix in filename but `-contamination` suffix in the ID field.

---

## Generator Implementation Notes

### Step 1: Identify Relationships
Determine which materials/contaminants should be linked based on:
- Material properties and common contaminants
- Contaminant composition and compatible materials
- Settings tied to specific materials

### Step 2: Lookup Target Files
For each relationship:
```python
target_file = f"frontmatter/{content_type}/{id}-{suffix}.yaml"
target_data = yaml.load(target_file)
```

### Step 3: Extract Required Data
```python
link = {
    'id': target_data['id'],              # Full ID with suffix
    'title': target_data.get('name', target_data.get('title')),
    'url': f"/{content_type}/{target_data['id']}",
    'image': f"/images/{content_type}/{target_data['id']}.jpg",
    'frequency': 'common',  # Based on analysis
    'severity': 'moderate',  # Based on analysis
    'typical_context': 'general'  # Based on analysis
}
```

### Step 4: Validate
```python
assert ' ' not in link['url'], "URL contains spaces"
assert ' ' not in link['image'], "Image path contains spaces"
assert link['url'] == f"/{content_type}/{link['id']}", "URL doesn't match ID"
```

---

## Current Status

**654 frontmatter files need regeneration**:
- 305 materials files
- 196 contaminants files
- 153 settings files

**Primary Issue**: Links using incorrect ID/URL formats

**Action Required**: Regenerate all frontmatter files with corrected link structure
