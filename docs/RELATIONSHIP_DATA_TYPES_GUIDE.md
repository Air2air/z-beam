# Relationship Data Types Guide

**For Backend Frontmatter Generation**  
**Date:** December 24, 2025  
**Purpose:** Define the difference between linkage and descriptive relationship data

---

## Critical Issue: Not All Relationships Display as Cards

The frontend displays relationship data in **different ways** depending on the data structure. Understanding this distinction prevents "undefined URL" errors and improves UX.

---

## Two Types of Relationship Data

### 1. 🔗 LINKAGE DATA (Cross-References)
**What it is:** References to other entities (materials, contaminants, compounds)  
**How it displays:** CardGrid with clickable cards  
**Requirements:** Must have `id` field that can be enriched with article data (URL, title, image)

**Example:**
```yaml
relationships:
  technical:
    contaminated_by:
      presentation: card
      items:
        - id: rust-oxidation-contamination      # ✅ ID present
          frequency: very_common                 # Optional metadata
          severity: high
      _section:
        title: "Common Contaminants"
        description: "Contaminants frequently found"
        icon: "droplet"
        order: 1
        variant: "default"
```

**Frontend behavior:**
1. Reads `id: rust-oxidation-contamination`
2. Fetches full article data via `getContaminantArticle(id)`
3. Enriches item with: `url`, `title`, `description`, `image`
4. Displays as clickable card in CardGrid

### 2. 📊 DESCRIPTIVE DATA (Technical Details)
**What it is:** Technical specifications, safety data, configuration details  
**How it displays:** DescriptiveDataPanel component wrapped in ContentSection  
**Requirements:** Contains multiple data fields (no enrichment needed)

**Example:**
```yaml
relationships:
  safety:
    exposure_limits:
      presentation: card
      items:
        - limit_type: "OSHA PEL"              # ✅ Technical data
          value: 5
          unit: "ppm"
          duration: "8-hour TWA"
          source: "29 CFR 1910.1000"
      _section:
        title: "Exposure Limits"
        description: "Workplace exposure thresholds"
        icon: "shield-check"
        order: 3
        variant: "warning"
```

**Frontend behavior:**
1. Reads all fields as-is (no enrichment)
2. Passes items to DescriptiveDataPanel component
3. Wrapped in ContentSection with _section metadata
4. Displays as definition list (key-value pairs)
5. NO URLs or clickable cards

---

## How to Identify Each Type

### ✅ LINKAGE DATA Indicators
- Has `id` field (reference to another entity)
- Few fields (typically 1-3: id, frequency, severity, etc.)
- Field name suggests cross-reference:
  - `contaminated_by`
  - `produces_compounds`
  - `affects_materials`
  - `produced_from_contaminants`
  - `works_on_materials`
  - `removes_contaminants`

### ✅ DESCRIPTIVE DATA Indicators
- NO `id` field (or id is just an identifier, not a reference)
- Many fields (5+ technical/safety properties)
- Field name suggests technical details:
  - `exposure_limits`
  - `physical_properties`
  - `ppe_requirements`
  - `detection_monitoring`
  - `emergency_response`
  - `visual_characteristics`
  - `laser_properties`

---

## Complete Classification

### LINKAGE DATA (11 fields - CardGrid compatible)

#### Materials
- ✅ `technical.contaminated_by` - References contaminants
- ✅ `technical.industry_applications` - Industry references
- ✅ `safety.regulatory_standards` - Standards references

#### Contaminants
- ✅ `technical.affects_materials` - References materials
- ✅ `technical.produces_compounds` - References compounds
- ✅ `safety.regulatory_standards` - Standards references

#### Compounds
- ⚠️ `technical.produced_from_contaminants` - References contaminants *(enriched)*
- ⚠️ `technical.produced_from_materials` - References materials *(enriched)*
- ❌ `operational.health_effects` - References health data *(NO enrichment path - removed from CardGrid)*
- ❌ `safety.chemical_properties` - References chemical data *(NO enrichment path - removed from CardGrid)*

#### Settings
- ✅ `technical.works_on_materials` - References materials
- ✅ `technical.removes_contaminants` - References contaminants
- ✅ `safety.regulatory_standards` - Standards references

### DESCRIPTIVE DATA (14 fields - Need specialized components)

#### Compounds (Most descriptive fields)
- ❌ `safety.exposure_limits` - Technical limits data
- ❌ `safety.ppe_requirements` - Equipment specifications
- ❌ `safety.storage_requirements` - Storage conditions
- ❌ `safety.detection_monitoring` - Detection specifications
- ❌ `safety.emergency_response` - Response procedures
- ❌ `safety.environmental_impact` - Environmental data
- ❌ `safety.regulatory_classification` - Classification codes
- ❌ `physical_properties` - Physical specifications
- ❌ `reactivity` - Chemical reactivity data
- ❌ `synonyms_identifiers` - Alternative names

#### Contaminants
- ❌ `visual_characteristics` - Appearance descriptions
- ❌ `laser_properties` - Technical laser parameters

#### Settings
- ❌ `technical.common_challenges` - Technical challenges data

### HYBRID DATA (1 field - Groups with nested URLs)

#### Contaminants
- ⚠️ `materials` - Has `groups` structure with nested URLs inside
  ```yaml
  materials:
    items:
      - title: "Affected Materials"
        groups:
          glass:
            items:
              - id: aluminosilicate-glass-laser-cleaning
                url: /materials/glass/specialty/aluminosilicate-glass-laser-cleaning
  ```

---

## Rules for Backend Generation

### Rule 1: Linkage Data Structure
```yaml
# ✅ CORRECT - Minimal reference with ID
relationships:
  technical:
    contaminated_by:
      presentation: card
      items:
        - id: rust-oxidation-contamination
          frequency: very_common
          severity: high
      _section: { ... }

# ❌ WRONG - Missing ID
relationships:
  technical:
    contaminated_by:
      items:
        - name: "Rust"              # ❌ No ID field
          color: "orange"
```

### Rule 2: Descriptive Data Structure
```yaml
# ✅ CORRECT - Complete technical data
relationships:
  safety:
    exposure_limits:
      presentation: card
      items:
        - limit_type: "OSHA PEL"
          value: 5
          unit: "ppm"
          duration: "8-hour TWA"
          source: "29 CFR 1910.1000"
      _section: { ... }

# ❌ WRONG - Only ID reference
relationships:
  safety:
    exposure_limits:
      items:
        - id: osha-pel-limits     # ❌ Should be complete data
```

### Rule 3: Never Mix Types
```yaml
# ❌ WRONG - Mixing linkage and descriptive data
relationships:
  technical:
    contaminated_by:
      items:
        - id: rust-oxidation-contamination    # Linkage structure
          value: 5                              # ❌ Don't add descriptive fields
          unit: "ppm"                           # ❌ Belongs in separate section
```

---

## Common Backend Mistakes

### ❌ Mistake 1: Using ID for Descriptive Data
```yaml
# WRONG
relationships:
  safety:
    exposure_limits:
      items:
        - id: osha-pel-5ppm       # ❌ Should be structured data
```

**Why it's wrong:** Frontend expects exposure_limits to contain actual limit values, not references.

**Correct approach:**
```yaml
# CORRECT
relationships:
  safety:
    exposure_limits:
      items:
        - limit_type: "OSHA PEL"
          value: 5
          unit: "ppm"
```

### ❌ Mistake 2: Adding URLs to Linkage Data
```yaml
# WRONG
relationships:
  technical:
    contaminated_by:
      items:
        - id: rust-oxidation-contamination
          url: /contaminants/oxidation/rust    # ❌ Don't hardcode URLs
```

**Why it's wrong:** Frontend dynamically generates URLs from `full_path` in the target entity's frontmatter.

**Correct approach:**
```yaml
# CORRECT - Just the ID
relationships:
  technical:
    contaminated_by:
      items:
        - id: rust-oxidation-contamination    # ✅ Frontend enriches this
```

### ❌ Mistake 3: Reference Type Without Enrichment Path
```yaml
# PROBLEMATIC
relationships:
  operational:
    health_effects:
      items:
        - type: health_effects
          id: carbon-monoxide-toxicology    # ❌ No enrichment function exists
```

**Why it's problematic:** Frontend has `getContaminantArticle()`, `getCompoundArticle()`, `getMaterialArticle()`, but NO `getHealthEffectsArticle()`.

**Solutions:**
1. **Remove from CardGrid** (current solution)
2. **Make it descriptive data** (provide full toxicology data inline)
3. **Add enrichment path** (frontend creates `getHealthEffectsArticle()`)

---

## Validation Checklist

Before generating relationship data, verify:

- [ ] **For linkage data:**
  - [ ] Has `id` field
  - [ ] Target entity exists in frontmatter
  - [ ] Target entity has `full_path` defined
  - [ ] Field name suggests cross-reference (contains: "by", "from", "on", "produces", "affects")

- [ ] **For descriptive data:**
  - [ ] Contains complete technical specifications
  - [ ] NO `id` field (or id is just an identifier)
  - [ ] All required data fields present
  - [ ] Field name suggests technical details (contains: "properties", "requirements", "limits", "characteristics")

- [ ] **For all relationship data:**
  - [ ] Has `_section` metadata with all 5 required fields
  - [ ] `presentation: card` is set
  - [ ] Items array is not null
  - [ ] Items are properly structured (not null/empty objects)

---

## Frontend Display Mapping

| Relationship Field | Type | Frontend Component | Enrichment Required |
|-------------------|------|-------------------|-------------------|
| `contaminated_by` | Linkage | CardGrid | ✅ Yes - getContaminantArticle() |
| `produces_compounds` | Linkage | CardGrid | ✅ Yes - getCompoundArticle() |
| `affects_materials` | Linkage | CardGrid | ✅ Yes - getMaterialArticle() |
| `produced_from_contaminants` | LinDescriptiveDataPanel | ❌ No - display as-is |
| `ppe_requirements` | Descriptive | DescriptiveDataPanel | ❌ No - display as-is |
| `physical_properties` | Descriptive | DescriptiveDataPanel | ❌ No - display as-is |
| `visual_characteristics` | Descriptive | DescriptiveDataPanel | ❌ No - display as-is |
| `laser_properties` | Descriptive | DescriptiveDataPanel | ❌ No - display as-is |
| `detection_monitoring` | Descriptive | DescriptiveDataPanel | ❌ No - display as-is |
| `emergency_response` | Descriptive | DescriptiveDataPanel | ❌ No - display as-is |
| `storage_requirements` | Descriptive | DescriptiveDataaPanel | ❌ No - display as-is |
| `visual_characteristics` | Descriptive | InfoCard | ❌ No - display as-is |
| `laser_properties` | Descriptive | TechnicalPanel | ❌ No - display as-is |
| `health_effects` | Reference (no enrichment) | *NOT DISPLAYED* | ⚠️ No enrichment path |

---

## Questions for Backend Team

1. **Should `health_effects` be converted to descriptive data?**
   - Currently: `{ type: "health_effects", id: "carbon-monoxide-toxicology" }`
   - Option A: Remove field entirely
   - Option B: Make descriptive: `{ symptoms: [...], severity: "high", ... }`
   - Option C: Create health_effects entity type and add frontend enrichment

2. **Should `chemical_properties` be linkage or descriptive?**
   - Currently: `{ type: "chemical_properties", id: "..." }`
   - Recommendation: Make descriptive (no enrichment needed)

3. **Are there other reference types without enrichment paths?**
   - Check all fields with `type` + `id` structure
   - Verify frontend has enrichment function for each type

---

## Required Backend Actions

### ✅ Action 1: Remove 14 null health_effects fields (Simple cleanup)

**Files affected:** 14 compound files  
**Current state:**
```yaml
operational:
  health_effects: null    # ❌ Remove this entirely
```

**Action:** Delete the null `operational.health_effects` fields from these 14 compound files.

**Priority:** HIGH - Simple cleanup, prevents null errors

---

### ⚠️ Action 2: Decide on health_effects structure (Needs architectural decision)

**Current state:**
```yaml
operational:
  health_effects:
    items:
      - type: health_effects
        id: carbon-monoxide-toxicology    # ❌ No enrichment path exists
```

**Problem:** Frontend has no `getHealthEffectsArticle()` function, so these create undefined URLs.

**Options:**

**Option A: Remove entirely** (simplest)
- Remove health_effects from compound frontmatter
- Already removed from CardGrid display
- Users see data in RelationshipsDump only

**Option B: Convert to descriptive data**
```yaml
operational:
  health_effects:
    presentation: card
    items:
      - symptoms: ["headache", "dizziness", "nausea"]
        severity: high
        exposure_route: inhalation
        onset_time: "immediate"
        treatment: "Remove to fresh air"
    _section:
      title: "Health Effects"
      description: "Physiological impacts of exposure"
      icon: "heart-pulse"
      order: 4
      variant: "danger"
```
- Display in specialized SafetyDataPanel component
- No URLs needed

**Option C: Create health_effects entity type**
- Create new `frontmatter/health-effects/` directory
- Generate frontmatter files for each health effect
- Add frontend `getHealthEffectsArticle()` enrichment function
- Keep current structure with `id` references
- Most complex but enables CardGrid display

**Recommendation:** Option B (descriptive data) - provides richer information without entity complexity

**Priority:** MEDIUM - Requires architectural decision

---

### ⚠️ Action 3: Decide on chemical_properties structure (Same issue as health_effects)

**Current state:**
```yaml
safety:
  chemical_properties:
    items:
      - type: chemical_properties
        id: some-chemical-property-id    # ❌ Unclear if enrichment exists
```

**Problem:** Same as health_effects - has `{type, id}` structure but unclear enrichment path.

**Options:** Same as Action 2 (remove, make descriptive, or create entity type)

**Recommendation:** Make descriptive data with actual chemical property values:
```yaml
safety:
  chemical_properties:
    items:
      - property: "Flammability"
        value: "Non-flammable"
        test_method: "ASTM D92"
      - property: "pH"
        value: "7.0"
        conditions: "at 25°C"
```

**PFrontend Implementation

### Using DescriptiveDataPanel Component

**Import:**
```typescript
import { DescriptiveDataPanel } from '@/app/components/DescriptiveDataPanel';
```

**Usage in Layout Components:**
```typescript
// Extract descriptive data section
const exposureLimitsSection = relationships?.safety?.exposure_limits;

// Render with ContentSection wrapper (automatic if _section provided)
{exposureLimitsSection?.items && (
  <DescriptiveDataPanel
    items={exposureLimitsSection.items}
    sectionMetadata={exposureLimitsSection._section}
  />
)}
```

**Component Features:**
- ✅ Automatically wraps in ContentSection when _section metadata provided
- ✅ Displays as responsive grid of definition lists (key-value pairs)
- ✅ Handles arrays, strings, numbers, booleans
- ✅ Skips internal fields (starting with _) and null values
- ✅ Formats field names (snake_case → Title Case)
- ✅ Hover effects and dark mode support

**Example Output:**
```
┌─────────────────────────────────────────────────┐
│ Exposure Limits                                 │
│ Workplace exposure thresholds                   │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Limit Type: OSHA PEL                        │ │
│ │ Value: 5                                    │ │
│ │ Unit: ppm                                   │ │
│ │ Duration: 8-hour TWA                        │ │
│ │ Source: 29 CFR 1910.1000                    │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Presentation Type in Frontmatter

**For descriptive data, set:**
```yaml
relationships:
  safety:
    exposure_limits:
      presentation: descriptive    # ← NEW: Use "descriptive" instead of "card"
      items:
        - limit_type: "OSHA PEL"
          value: 5
          unit: "ppm"
      _section: { ... }
```

**Presentation types:**
- `card` → CardGrid (for linkage data with id references)
- `descriptive` → DescriptiveDataPanel (for technical specifications)
- `table` → Future: Tabular display
- `list` → Future: Simple list display

---

## riority:** MEDIUM - Requires architectural decision

---

## Summary

**Key Takeaway:** Relationship data serves two distinct purposes:
1. **Cross-references** between entities (linkage) → CardGrid display
2. **Technical specifications** (descriptive) → Specialized components

**Backend must generate the correct structure for each purpose to prevent "undefined URL" errors.**

**Rule of Thumb:**
- If it references another entity → Use `id` field (linkage)
- If it contains technical specs → Use data fields (descriptive)
- Never mix both in the same item
