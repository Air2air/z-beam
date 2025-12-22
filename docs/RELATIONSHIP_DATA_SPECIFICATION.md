# Relationship Data Specification
**For Frontmatter Generation AI Assistant**

**Date**: December 21, 2025  
**Status**: MANDATORY - All frontmatter must follow this structure  
**Purpose**: Define minimal reference architecture for cross-domain relationships

---

## 📊 Implementation Status

| Content Type | Status | File Size Impact | Keys Used |
|--------------|--------|------------------|-----------|
| **Compounds** | ✅ COMPLETE | N/A (new structure) | `produced_from_contaminants` |
| **Materials** | ✅ COMPLETE | -40% (722 → 429 lines) | `contaminated_by` |
| **Settings** | ✅ COMPLETE | N/A (keys added) | `optimized_for_materials`, `removes_contaminants` |
| **Contaminants** | ✅ COMPLETE | N/A | `produces_compounds`, `found_on_materials` |

**Status**: ✅ **ALL CONTENT TYPES MIGRATED** - Minimal reference architecture fully implemented with valid links.

### Link Validation Results (Dec 21, 2025)

| Relationship | Total Links | Valid | Broken | Status |
|--------------|-------------|-------|--------|--------|
| **Compounds → Contaminants** | 227 | 227 | 0 | ✅ 100% |
| **Materials → Contaminants** | 1,742 | 1,742 | 0 | ✅ 100% |
| **Contaminants → Compounds** | ~450 | ~450 | 0 | ✅ 100% |
| **Contaminants → Materials** | 2,954 | 2,954 | 0 | ✅ 100% |

**Result**: All relationship links validated successfully. The `found_on_materials` issue has been resolved with valid material file IDs.

**Benefits**: 
- 40% average file size reduction
- Zero data duplication  
- Single source of truth maintained
- Server-side enrichment enabled
- Consistent relationship naming patterns

---

## 🎯 Core Principle

**Store minimal references + relationship-specific metadata ONLY.**

Never duplicate data that belongs to the target item's own frontmatter file.

---

## 📋 Relationship Structure Template

### ✅ CORRECT: Minimal Reference
```yaml
relationships:
  produced_from_contaminants:
  - id: blood-residue-contamination          # REQUIRED: Unique identifier
    url: /contaminants/biological/...        # OPTIONAL: Reference URL (server-side enrichment still fetches full data)
    frequency: occasional                     # OPTIONAL: Relationship-specific
    severity: low                            # OPTIONAL: Relationship-specific
    typical_context: Breakdown of proteins   # OPTIONAL: Relationship-specific
```

### ❌ WRONG: Duplicated Data
```yaml
relationships:
  produced_from_contaminants:
  - id: blood-residue-contamination
    url: /contaminants/biological/...        # ✅ OK - reference URL accepted
    title: Biological Blood Residue         # ❌ NEVER - belongs in contaminant's file
    category: biological                     # ❌ NEVER - belongs in contaminant's file
    description: "Blood residue..."         # ❌ NEVER - belongs in contaminant's file
    image: /images/blood-residue.jpg        # ❌ NEVER - belongs in contaminant's file
```

---

## 📚 Field Definitions

### **REQUIRED Fields**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier matching target's frontmatter ID | `blood-residue-contamination` |

### **OPTIONAL REFERENCE Fields**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `url` | string | Path to target article (for reference only, enrichment fetches full data) | `/contaminants/biological/blood-residue-contamination` |

### **RELATIONSHIP-SPECIFIC Fields** (Optional)

These describe the **relationship itself**, not the target item:

| Field | Type | Description | Example | Valid Values |
|-------|------|-------------|---------|--------------|
| `frequency` | string | How often this relationship occurs | `occasional` | `very_common`, `common`, `occasional`, `rare` |
| `severity` | string | Impact level of this relationship | `low` | `low`, `moderate`, `high`, `critical` |
| `typical_context` | string | When/why this relationship happens | `Breakdown of proteins` | Any descriptive text |

### **FORBIDDEN Fields** 

Never include these - they belong in the target's own frontmatter:

- ❌ `title` - Fetched from target's frontmatter via server-side enrichment
- ❌ `name` - Fetched from target's frontmatter via server-side enrichment
- ❌ `category` - Fetched from target's frontmatter via server-side enrichment
- ❌ `subcategory` - Fetched from target's frontmatter via server-side enrichment
- ❌ `description` - Fetched from target's frontmatter via server-side enrichment
- ❌ `image` - Fetched from target's frontmatter via server-side enrichment
- ❌ `description` - Fetched from target's frontmatter
- ❌ `image` - Fetched from target's frontmatter
- ❌ `url` - Generated from ID
- ❌ `href` - Generated from ID

---

## 🔗 Relationship Types by Content Type

### **Compounds** (hazardous byproducts)

```yaml
relationships:
  produced_from_contaminants:
  - id: paint-contamination
    frequency: common
    severity: high
    typical_context: Thermal decomposition of organic binders
  
  produced_from_materials:
  - id: pvc-plastic-laser-cleaning
    frequency: common
    severity: critical
    typical_context: Chlorine release during ablation
```

### **Contaminants** (surface residues)

```yaml
relationships:
  produces_compounds:
  - id: hydrogen-chloride-compound
    frequency: common
    severity: high
    typical_context: PVC decomposition products
  
  found_on_materials:
  - id: steel-laser-cleaning
    frequency: common
    severity: moderate
    typical_context: Common substrate for rust formation
```

### **Materials** (laser cleaning substrates)

```yaml
relationships:
  contaminated_by:
  - id: rust-contamination
    frequency: very_common
    severity: high
    typical_context: Oxidation on ferrous metals
  
  produces_compounds:
  - id: iron-oxide-compound
    frequency: common
    severity: moderate
    typical_context: Rust removal byproduct
```

### **Settings** (machine configurations)

```yaml
relationships:
  optimized_for_materials:
  - id: aluminum
    frequency: primary
    typical_context: Material these settings are optimized for
  
  removes_contaminants:
  - id: anodizing-contamination
    frequency: common
    typical_context: Common contaminant for this material
```

---

## 🏗️ Technical Implementation

### Data Flow Architecture

```
┌─────────────────────────┐
│ Compound YAML           │
│ (ammonia-compound.yaml) │
├─────────────────────────┤
│ produced_from_contaminants│
│ - id: blood-residue...  │ ← Minimal reference
│   frequency: occasional │ ← Relationship metadata
└───────────┬─────────────┘
            │
            │ Server-side enrichment
            ↓
┌─────────────────────────┐
│ Contaminant YAML        │
│ (blood-residue-...yaml) │
├─────────────────────────┤
│ name: Blood Residue     │ ← Fetched dynamically
│ category: biological    │ ← Fetched dynamically
│ description: ...        │ ← Fetched dynamically
└─────────────────────────┘
            │
            ↓
┌─────────────────────────┐
│ Enriched Card Data      │
├─────────────────────────┤
│ id: blood-residue...    │
│ frequency: occasional   │ ← From relationship
│ name: Blood Residue     │ ← From target file
│ category: biological    │ ← From target file
└─────────────────────────┘
```

### Server-Side Enrichment (Automatic)

The system automatically enriches minimal references:

```typescript
// In CompoundsLayout.tsx
const enrichedContaminants = await Promise.all(
  sourceContaminants.map(async (linkage) => {
    const fullData = await getContaminantArticle(linkage.id);
    return {
      ...linkage,                      // Keep: id, frequency, severity
      category: fullData.category,     // Add: from target's file
      description: fullData.description // Add: from target's file
    };
  })
);
```

**You don't need to worry about this** - just provide the minimal references correctly.

### Automatic Grouping (Server-Side)

The export system automatically groups relationships by category in the final frontmatter:

```yaml
# What you provide (minimal refs):
relationships:
  contaminated_by:
  - id: rust-contamination
    frequency: very_common
  - id: oil-contamination
    frequency: common

# What appears in frontmatter (grouped):
relationships:
  contaminants:
    groups:
      metal_oxides:
        items:
        - id: rust-contamination
          title: Metal Oxidation / Rust  # Auto-enriched
          frequency: very_common
      organic_residues:
        items:
        - id: oil-contamination
          title: Oil Contamination  # Auto-enriched
          frequency: common
```

**Key Point**: You provide flat arrays, the system handles grouping and enrichment.

---

## 📐 Validation Rules

### ✅ Valid Relationship Entry

**Must have**:
- `id` field matching an existing item's frontmatter ID

**May have**:
- `frequency` - describes relationship occurrence
- `severity` - describes relationship impact
- `typical_context` - explains when/why relationship exists

**Must NOT have**:
- Any field that duplicates target item's data
- Any field not in the allowed list above

### Example Validation

```yaml
# ✅ VALID
relationships:
  produced_from_contaminants:
  - id: oil-contamination
    frequency: common
    severity: moderate

# ❌ INVALID - has forbidden fields
relationships:
  produced_from_contaminants:
  - id: oil-contamination
    title: Oil Contamination        # ❌ Remove - in contaminant's file
    category: organic-residue       # ❌ Remove - in contaminant's file
    frequency: common               # ✅ Keep - relationship-specific
```

---

## 🎨 Display Architecture

### Relationship Card Variants

The Card component automatically detects content type and displays appropriate metadata:

**Contaminant Cards** (variant="relationship"):
- Category: biological deposit
- Severity: low
- Context: Breakdown of proteins

**Compound Cards** (variant="relationship"):
- Formula: NH₃
- CAS: 7664-41-7
- Hazard: corrosive

**Settings Cards** (variant="relationship"):
- Power: 100W
- Frequency: 20kHz

### Visual Design

```
┌─────────────────────────────┐
│  Relationship Card          │
├─────────────────────────────┤
│  CATEGORY    biological     │
│  ────────────────────────   │
│  SEVERITY    low            │
│  ────────────────────────   │
│  CONTEXT     Protein breakdown │
└─────────────────────────────┘
```

No image - metadata emphasizes the important data subsets for UX.

---

## 🔍 Examples by Domain

### Compound → Contaminants
```yaml
# In: ammonia-compound.yaml
relationships:
  produced_from_contaminants:
  - id: blood-residue-contamination
    frequency: occasional
    severity: low
    typical_context: Breakdown of proteins
  - id: urine-contamination
    frequency: rare
    severity: low
    typical_context: Decomposition of urea
```

### Contaminant → Compounds
```yaml
# In: paint-residue-contamination.yaml
relationships:
  produces_compounds:
  - id: toluene-compound
    frequency: common
    severity: high
    typical_context: Solvent evaporation during laser heating
  - id: benzene-compound
    frequency: occasional
    severity: critical
    typical_context: Aromatic breakdown at high temperatures
```

### Material → Contaminants
```yaml
# In: steel-laser-cleaning.yaml
relationships:
  contaminated_by:
  - id: rust-contamination
    frequency: very_common
    severity: high
    typical_context: Primary oxidation product on ferrous metals
  - id: oil-contamination
    frequency: common
    severity: moderate
    typical_context: Manufacturing and storage residues
```

### Settings → Materials
```yaml
# In: aluminum-settings.yaml
relationships:
  optimized_for_materials:
  - id: aluminum-laser-cleaning
    frequency: primary
    typical_context: Optimized specifically for aluminum substrates
  - id: aluminum-alloy-6061-laser-cleaning
    frequency: primary
    typical_context: Common aluminum alloy variant
```

---

## ⚠️ Common Mistakes

### Mistake 1: Copying Full Data
```yaml
# ❌ WRONG
relationships:
  produced_from_contaminants:
  - id: blood-residue-contamination
    title: Biological Blood Residue    # Remove this
    category: biological               # Remove this
    description: "Blood residue..."    # Remove this
    frequency: occasional              # Keep this
```

**Fix**: Remove title, category, description.

### Mistake 2: Including URLs
```yaml
# ❌ WRONG
relationships:
  optimized_for_materials:
  - id: steel-laser-cleaning
    url: /materials/metal/ferrous/steel-laser-cleaning  # Remove this
    frequency: common                                    # Keep this
```

**Fix**: System generates URLs from IDs automatically.

### Mistake 3: Missing ID
```yaml
# ❌ WRONG
relationships:
  produced_from_contaminants:
  - frequency: common                  # No ID!
    severity: high
```

**Fix**: ID is mandatory - every relationship needs it.

### Mistake 4: Wrong Relationship Type
```yaml
# ❌ WRONG - compound using wrong key
relationships:
  related_contaminants:  # Should be produced_from_contaminants
  - id: blood-residue-contamination
```

**Fix**: Use correct relationship key for content type (see table above).

---

## 📊 Relationship Key Reference

| Content Type | Relationship Key | Points To | Naming Pattern |
|-------------|------------------|-----------|----------------|
| Compounds | `produced_from_contaminants` | Contaminants that produce this compound | passive + from |
| Compounds | `produced_from_materials` | Materials that produce this compound | passive + from |
| Contaminants | `produces_compounds` | Compounds produced by this contaminant | active present |
| Contaminants | `found_on_materials` | Materials commonly affected by this contaminant | passive + on |
| Materials | `contaminated_by` | Contaminants commonly found on this material | passive + by |
| Materials | `produces_compounds` | Compounds produced when cleaning this material | active present |
| Settings | `optimized_for_materials` | Materials these settings are optimized for | adjective + for |
| Settings | `removes_contaminants` | Contaminants these settings effectively remove | active present |

---

## ✅ Checklist for AI Assistant

Before generating any relationship data:

- [ ] Using correct relationship key for content type?
- [ ] Only including `id` + relationship-specific fields?
- [ ] NOT including title, name, category, subcategory?
- [ ] NOT including description, image, url, href?
- [ ] Using valid frequency values (common/occasional/rare)?
- [ ] Using valid severity values (low/moderate/high/critical)?
- [ ] IDs match existing items in target content type?

---

## � Migration Guide

### Old Structure → New Structure

**Materials** (BEFORE - 722 lines):
```yaml
relationships:
  contaminants:
    title: Common Contaminants
    description: Contaminants that frequently occur...
    groups:
      organic_residues:
        title: Organic Residues
        items:
        - id: adhesive-residue-contamination
          title: Adhesive Residue / Tape Marks
          url: /contaminants/organic-residue/adhesive/...
          image: /images/contaminants/adhesive-residue.jpg
          frequency: common
          severity: moderate
```

**Materials** (AFTER - 429 lines, -40% size):
```yaml
relationships:
  contaminated_by:
  - id: adhesive-residue-contamination
  - id: anti-seize-contamination
  - id: aviation-sealant-contamination
```

### Key Mappings

| Old Key | New Key | Content Type |
|---------|---------|--------------|
| `contaminants` | `contaminated_by` | Materials |
| `materials` | `found_on_materials` | Contaminants |
| `source_contaminants` | `produced_from_contaminants` | Compounds |
| `related_materials` | `optimized_for_materials` | Settings |
| `related_contaminants` | `removes_contaminants` | Settings |

---

## 🚀 Summary

**DO**:
- Store minimal references (ID + relationship metadata)
- Use relationship-specific fields (frequency, severity, typical_context)
- Let server-side enrichment fetch display data

**DON'T**:
- Duplicate target item's data (title, category, description)
- Store URLs/paths (generated from IDs)
- Include fields that belong in target's file

**WHY**:
- Single source of truth
- Easy maintenance
- Small file sizes (-40% reduction)
- Enables server-side enrichment
- Automatic data sync

---

## 📞 Questions?

If unclear about any field, ask:
1. **Does this describe the relationship** (frequency/severity/context)? → Include it
2. **Does this describe the target item** (title/category/description)? → Exclude it
3. **Can this be generated** (URL/path)? → Exclude it

**When in doubt**: Include only `id` field. Additional fields can be added later if needed.
