# Section Description Save Pattern - Backend Implementation Guide

**Date**: January 9, 2026  
**Purpose**: Document correct YAML path for saving AI-generated section descriptions  
**Scope**: All relationship sections across materials, contaminants, compounds, settings

---

## 🎯 Critical Path

**Save AI-generated section descriptions to**:
```
relationships.{group}.{section}._section.sectionDescription
```

**DO NOT save to**:
```
relationships.{group}.{section}.description  ❌ WRONG - sibling to _section
```

---

## 📋 Current Structure (Aluminum Example)

### ❌ INCORRECT (What Backend Currently Does)
```yaml
relationships:
  interactions:
    contaminatedBy:
      presentation: card
      items:
        - id: adhesive-residue-contamination
          name: Adhesive Residue
          # ... 49 items
      _section:
        sectionTitle: Common Contaminants
        sectionDescription: Types of contamination typically found on this material...  # ← Default still here
        icon: droplet
        order: 1
        variant: default
      description: '### Common Contaminants on Aluminum Surfaces...'  # ← AI content as SIBLING (WRONG)
```

### ✅ CORRECT (What Backend Should Do)
```yaml
relationships:
  interactions:
    contaminatedBy:
      presentation: card
      items:
        - id: adhesive-residue-contamination
          name: Adhesive Residue
          # ... 49 items
      _section:
        sectionTitle: Common Contaminants
        sectionDescription: '### Common Contaminants on Aluminum Surfaces

          1. **Oils and Greases**: From handling or machining...
          
          2. **Dust and Particulates**: Airborne particles...
          
          (Word count: 128)'  # ← AI content as SIMPLE STRING (CORRECT)
        icon: droplet
        order: 1
        variant: default
```

### ❌ CURRENT INCORRECT FORMAT (What Backend Is Actually Doing)
```yaml
relationships:
  interactions:
    contaminatedBy:
      _section:
        sectionTitle: Common Contaminants
        sectionDescription:
          before: "Laser cleaning targets aluminum surfaces..."  # ← OBJECT with before/after (WRONG)
          after: "Laser cleaning targets aluminum surfaces..."
        icon: droplet
        order: 1
```

---

## � CRITICAL: Backend Must Save as Simple String

**Current Problem**: Backend is saving `sectionDescription` as object with `before`/`after` properties  
**Required Fix**: Save as simple string containing AI-generated content

```python
# ❌ CURRENT (WRONG):
current['_section']['sectionDescription'] = {
    'before': ai_content,
    'after': ai_content
}

# ✅ REQUIRED (CORRECT):
current['_section']['sectionDescription'] = ai_content  # Simple string
```

---

## �🔧 Backend Save Implementation

### Python Example (Materials.yaml → Frontmatter Export)
```python
# CORRECT PATH AND FORMAT
section_path = "relationships.interactions.contaminatedBy._section.sectionDescription"

# Save AI-generated content as SIMPLE STRING
material_data['relationships']['interactions']['contaminatedBy']['_section']['sectionDescription'] = ai_generated_content

# ❌ DO NOT save as object with before/after properties:
# material_data['relationships']['interactions']['contaminatedBy']['_section']['sectionDescription'] = {
#     'before': ai_content,
#     'after': ai_content
# }  # ← WRONG FORMAT

# ❌ DO NOT save as sibling:
# material_data['relationships']['interactions']['contaminatedBy']['description'] = ai_generated_content  ❌ WRONG
```

### YAML Write Pattern
```python
def save_section_description(material_data: dict, section_path: str, ai_content: str):
    """
    Save AI-generated content to _section.sectionDescription
    
    Args:
        material_data: Material frontmatter dictionary
        section_path: e.g. "relationships.interactions.contaminatedBy"
        ai_content: AI-generated description (942+ chars, markdown formatted)
    """
    # Navigate to section
    parts = section_path.split('.')
    current = material_data
    for part in parts:
        current = current[part]
    
    # Save to _section.sectionDescription (REPLACES default)
    if '_section' not in current:
        current['_section'] = {}
    
    current['_section']['sectionDescription'] = ai_content
    
    # DO NOT create sibling 'description' field
    # if 'description' in current:
    #     del current['description']  # Clean up if exists
```

---

## 🏗️ Architecture Pattern for All Sections

This pattern applies to **ALL** relationship sections:

### Interactions Group
- `relationships.interactions.contaminatedBy._section.sectionDescription`
- `relationships.interactions.treatedBy._section.sectionDescription`
- `relationships.interactions.compatibleWith._section.sectionDescription`

### Operational Group
- `relationships.operational.industryApplications._section.sectionDescription`
- `relationships.operational.useCases._section.sectionDescription`

### Safety Group
- `relationships.safety.regulatoryStandards._section.sectionDescription`
- `relationships.safety.hazards._section.sectionDescription`

### Technical Group
- `relationships.technical.relatedMaterials._section.sectionDescription`
- `relationships.technical.alternatives._section.sectionDescription`

---

## 🔍 Frontend Display Pattern

**Frontend code** (MaterialsLayout.tsx):
```typescript
description: relationships?.interactions?.contaminatedBy?._section?.sectionDescription || 
             `Typical contaminants found on ${materialName} that require laser cleaning`,
```

**How it works**:
1. First checks `_section.sectionDescription` for AI-generated content
2. Falls back to template string if no AI content exists
3. Displays in CardGrid component above relationship cards

---

## ✅ Validation Steps

### 1. Check YAML Structure After Save
```bash
# Correct: AI content under _section
grep -A 20 "contaminatedBy:" aluminum-laser-cleaning.yaml | grep -A 5 "_section:"
# Should show sectionDescription with AI content (942+ chars)

# Incorrect: AI content as sibling
grep -A 20 "contaminatedBy:" aluminum-laser-cleaning.yaml | grep "^      description:"
# Should return NOTHING (no sibling description field)
```

### 2. Verify Frontend Display
```bash
# Start dev server
npm run dev

# Navigate to: http://localhost:3000/materials/metal/non-ferrous/aluminum-laser-cleaning
# Check "Common Contaminants" section
# Should display AI-generated content with:
# - Markdown heading (### Common Contaminants on Aluminum Surfaces)
# - Numbered list (1. **Oils and Greases**, 2. **Dust and Particulates**, etc.)
# - Technical detail specific to aluminum
```

### 3. Check Data Preservation
```bash
# Ensure 49 contaminant items still exist
awk '/contaminatedBy:/,/operational:/' aluminum-laser-cleaning.yaml | grep -c "^ *- id:"
# Should return: 49
```

---

## 📊 Expected Output

### Frontend Display
```
Common Contaminants
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Common Contaminants on Aluminum Surfaces

1. **Oils and Greases**: From handling or machining, these organic residues 
   accumulate via direct contact. They are problematic as they prevent uniform 
   anodizing or painting...

2. **Dust and Particulates**: Airborne particles settle during storage or use 
   in dusty environments. They embed into the surface...

3. **Chloride Salts**: From sweat, seawater, or industrial exposure, they 
   deposit via evaporation of moisture...

4. **Moisture/Oxides**: Condenses during humid storage; forms hydrated oxides...

(Word count: 128)

[Card Grid with 49 contaminant items below]
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Creating Sibling Description Field
```yaml
contaminatedBy:
  items: [...]
  _section: {...}
  description: '...'  # ← WRONG - frontend won't find this
```

### ❌ Mistake 2: Overwriting Entire _section Object
```python
# WRONG - loses sectionTitle, icon, order, variant
current['_section'] = {'sectionDescription': ai_content}
```

### ❌ Mistake 3: Not Replacing Default
```yaml
_section:
  sectionDescription: Types of contamination typically found...  # ← Old default still here
```

### ✅ Correct: Update Only sectionDescription
```python
# RIGHT - preserves all other _section fields
current['_section']['sectionDescription'] = ai_content
```

---

## 📝 Summary Checklist

Backend implementation must:
- ✅ Save to `_section.sectionDescription` (nested under _section)
- ✅ Replace default text with AI-generated content
- ✅ Preserve all other `_section` fields (sectionTitle, icon, order, variant)
- ✅ Preserve all `items` array (49 contaminant references)
- ✅ NOT create sibling `description` field
- ✅ Use markdown formatting (###, numbered lists, **bold**)
- ✅ Include word count at end: `(Word count: 128)`

---

## 🔗 Related Documentation

- **Frontend Pattern**: `/app/components/MaterialsLayout/MaterialsLayout.tsx` (line 117)
- **Component Display**: `/app/components/CardGrid/CardGrid.tsx`
- **Section Metadata**: `/app/components/IndustryApplicationsPanel/IndustryApplicationsPanel.tsx`
- **YAML Schema**: `frontmatter/materials/aluminum-laser-cleaning.yaml` (lines 730-766)

---

**Questions?** Check actual implementation in `aluminum-laser-cleaning.yaml` (lines 730-766) to see correct structure.
