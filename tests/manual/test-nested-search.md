# Nested Field Search Testing Guide

## Overview
This guide demonstrates how to test that the search functionality properly searches nested fields in `machineSettings` and `materialProperties`.

**Date**: October 16, 2025  
**Feature**: Dynamic deep search through nested frontmatter structures

---

## How It Works

The search uses a **recursive `deepSearch()` function** that:
1. Traverses objects at any depth
2. Searches arrays element-by-element
3. Matches primitives (strings, numbers, booleans)
4. Handles nested properties like `materialProperties.laser_material_interaction.properties.thermalConductivity.value`

---

## Test Cases

### 1. machineSettings Nested Search

#### Test: Search for Power Value
**Search Query**: `100`

**Expected Results**: Materials with `machineSettings.powerRange.value: 100`

**Example Frontmatter** (steel-laser-cleaning.yaml):
```yaml
machineSettings:
  powerRange:
    value: 100
    unit: W
    confidence: 92
    description: Optimal average power for Steel oxide removal
```

**What Gets Searched**:
- ✅ `powerRange.value` → "100"
- ✅ `powerRange.unit` → "W"
- ✅ `powerRange.confidence` → "92"
- ✅ `powerRange.description` → "Optimal average power..."

---

#### Test: Search for Wavelength
**Search Query**: `1064`

**Expected Results**: Materials with `machineSettings.wavelength.value: 1064`

**Example Frontmatter**:
```yaml
machineSettings:
  wavelength:
    value: 1064
    unit: nm
    description: Near-IR wavelength
```

**What Gets Searched**:
- ✅ `wavelength.value` → "1064"
- ✅ `wavelength.unit` → "nm"
- ✅ `wavelength.description` → "Near-IR wavelength..."

---

#### Test: Search for Laser Type
**Search Query**: `fiber laser`

**Expected Results**: Materials with `machineSettings.laserType.value: "Fiber Laser"`

**Example Frontmatter**:
```yaml
machineSettings:
  laserType:
    value: Fiber Laser
    unit: N/A
    confidence: 90
```

**What Gets Searched**:
- ✅ `laserType.value` → "Fiber Laser"

---

#### Test: Search for Parameter Description
**Search Query**: `optimal average power`

**Expected Results**: Materials mentioning this phrase in any machineSettings description

**Example Frontmatter**:
```yaml
machineSettings:
  powerRange:
    description: Optimal average power for Steel oxide removal
```

**What Gets Searched**:
- ✅ Any `description` field in machineSettings

---

### 2. materialProperties Nested Search

#### Test: Search for Density
**Search Query**: `density`

**Expected Results**: Materials with density properties

**Example Frontmatter** (steel-laser-cleaning.yaml):
```yaml
materialProperties:
  material_characteristics:
    properties:
      density:
        value: 7.85
        unit: g/cm³
        description: Typical density for steel
```

**What Gets Searched** (nested 4 levels deep):
- ✅ `materialProperties` → object
- ✅ `material_characteristics` → object
- ✅ `properties` → object
- ✅ `density` → "density" (key matches!)
- ✅ `density.value` → "7.85"
- ✅ `density.unit` → "g/cm³"
- ✅ `density.description` → "Typical density for steel"

---

#### Test: Search for Thermal Conductivity Value
**Search Query**: `50`

**Expected Results**: Materials with thermalConductivity value of 50

**Example Frontmatter**:
```yaml
materialProperties:
  laser_material_interaction:
    properties:
      thermalConductivity:
        value: 50
        unit: W/m·K
        confidence: 88
```

**What Gets Searched** (nested 4 levels deep):
- ✅ `thermalConductivity.value` → "50"
- ✅ `thermalConductivity.unit` → "W/m·K"
- ✅ `thermalConductivity.confidence` → "88"

---

#### Test: Search for Material Characteristic
**Search Query**: `hardness`

**Expected Results**: Materials with hardness properties

**Example Frontmatter**:
```yaml
materialProperties:
  material_characteristics:
    properties:
      hardness:
        value: 150
        unit: HB
        description: Brinell hardness for steel
```

**What Gets Searched**:
- ✅ `hardness` → "hardness" (key matches!)
- ✅ `hardness.value` → "150"
- ✅ `hardness.unit` → "HB"
- ✅ `hardness.description` → "Brinell hardness..."

---

#### Test: Search for Laser Absorption
**Search Query**: `absorption`

**Expected Results**: Materials with laserAbsorption properties

**Example Frontmatter**:
```yaml
materialProperties:
  laser_material_interaction:
    properties:
      laserAbsorption:
        value: 35.0
        unit: '%'
        description: Laser absorption at 1064 nm
```

**What Gets Searched**:
- ✅ `laserAbsorption` → "absorption" (partial match in key!)
- ✅ `laserAbsorption.value` → "35.0"
- ✅ `laserAbsorption.description` → Contains "absorption"

---

#### Test: Search for Unit
**Search Query**: `g/cm³`

**Expected Results**: Materials using this density unit

**Example Frontmatter**:
```yaml
materialProperties:
  material_characteristics:
    properties:
      density:
        unit: g/cm³
```

**What Gets Searched**:
- ✅ Any `unit` field with "g/cm³"

---

### 3. Deep Nested Property Search

#### Test: Search for Category Label
**Search Query**: `laser-material interaction`

**Expected Results**: All materials (since most have this category)

**Example Frontmatter**:
```yaml
materialProperties:
  laser_material_interaction:
    label: Laser-Material Interaction
    description: Optical and thermal properties...
```

**What Gets Searched**:
- ✅ `laser_material_interaction.label` → "Laser-Material Interaction"
- ✅ `laser_material_interaction.description` → Full description text

---

#### Test: Search for Property Description Text
**Search Query**: `thermal conductivity at room temperature`

**Expected Results**: Materials with this specific description

**Example Frontmatter**:
```yaml
materialProperties:
  laser_material_interaction:
    properties:
      thermalConductivity:
        description: Thermal conductivity at room temperature
```

**What Gets Searched**:
- ✅ Any `description` field in nested properties

---

## Manual Testing Steps

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Navigate to Search Page
Open browser: `http://localhost:3000/search`

### Step 3: Test machineSettings Searches

| Search Term | Expected Results | Verifies |
|-------------|-----------------|----------|
| `100` | Materials with 100W power | Nested value search |
| `1064` | Materials with 1064nm wavelength | Nested value search |
| `fiber laser` | Materials using fiber lasers | Nested string search |
| `kHz` | Materials with kHz repetition rate | Nested unit search |
| `optimal power` | Materials with this in descriptions | Nested description search |

### Step 4: Test materialProperties Searches

| Search Term | Expected Results | Verifies |
|-------------|-----------------|----------|
| `density` | Materials with density property | Property key search |
| `7.85` | Materials with density ~7.85 | Nested numeric value |
| `g/cm³` | Materials using this unit | Nested unit search |
| `hardness` | Materials with hardness property | Property key search |
| `thermal conductivity` | Materials with this property | Multi-word property search |
| `50 W/m·K` | Materials with this conductivity | Value + unit search |
| `laser absorption` | Materials with absorption property | Property description search |

### Step 5: Test Deep Nested Searches

| Search Term | Expected Results | Verifies |
|-------------|-----------------|----------|
| `material characteristics` | All materials (common category) | Category label search |
| `laser-material interaction` | All materials (common category) | Category label search |
| `at room temperature` | Materials mentioning this | Deep description search |
| `typical density` | Materials with this description | Deep nested text search |

---

## Verification Checklist

When testing, verify:

- [ ] **Value Search**: Numeric values like "100", "1064", "7.85" return correct materials
- [ ] **Unit Search**: Units like "W", "nm", "g/cm³" return materials using those units
- [ ] **Property Key Search**: Property names like "density", "hardness" find materials
- [ ] **Description Search**: Partial phrases in descriptions are found
- [ ] **Multi-level Nesting**: Properties 3-5 levels deep are searchable
- [ ] **Array Elements**: Arrays within nested structures are searched
- [ ] **Case Insensitive**: "DENSITY" and "density" both work
- [ ] **Partial Matches**: "conduct" finds "conductivity"

---

## Expected Behavior

### ✅ Should Find Materials When Searching For:
1. **Property names** (density, hardness, thermalConductivity)
2. **Numeric values** (100, 7.85, 1064)
3. **Units** (W, nm, g/cm³, kHz)
4. **Descriptions** (any text in description fields)
5. **Labels** (category labels, property labels)
6. **Confidence values** (88, 92, 95)
7. **Any text** at any nesting level

### ❌ Should NOT Match:
1. Image URLs (skipKeys: 'image', 'imageUrl', 'imageAlt')
2. Internal IDs (skipKeys: 'id', 'slug', 'filepath')
3. Navigation URLs (skipKeys: 'url', 'href', 'path')

---

## Debugging

If searches don't work:

1. **Check Console**: Open browser DevTools → Console
2. **Verify Data**: Search page should show debug output for loaded articles
3. **Test Simple First**: Start with "steel" (should definitely work)
4. **Check Nested**: Search "density" (very common, should find many)
5. **Verify deepSearch**: Add console.log in deepSearch function if needed

---

## Code Reference

**Search Implementation**: `app/search/search-client.tsx`

**Key Function**:
```typescript
const deepSearch = (obj: any, searchTerm: string, maxDepth = 10, currentDepth = 0) => {
  // Recursively searches:
  // - Primitives (string, number, boolean)
  // - Arrays (each element)
  // - Objects (each property)
  // - Up to 10 levels deep
}
```

**Applied To**:
```typescript
const deepSearchFields = [
  'machineSettings',      // ← All machine parameters
  'materialProperties',   // ← All material properties
  'description',          // ← Universal description field (materials & settings)
  'applications',
  'environmentalImpact',
  'outcomeMetrics',
  'micro',
  'regulatoryStandards',
  'processing',
  'keywords',
  'meta_tags',
];
```

---

## Success Criteria

The search is working correctly if:

✅ Searching "100" finds materials with 100W power  
✅ Searching "density" finds materials with density property  
✅ Searching "thermal conductivity" finds materials with that property  
✅ Searching "g/cm³" finds materials using that unit  
✅ Searching "fiber laser" finds materials using fiber lasers  
✅ Searching "1064" finds materials with 1064nm wavelength  
✅ Searching property descriptions returns matching materials  
✅ All searches are case-insensitive  
✅ Partial matches work (e.g., "conduct" finds "conductivity")  

---

## Performance Notes

- **Depth Limit**: 10 levels (prevents infinite loops)
- **Early Exit**: Returns immediately on first match
- **Skip Logic**: Excludes URLs, IDs, images from search
- **Priority Search**: Checks high-priority fields first

---

## Related Documentation
- [Dynamic Search Implementation](../../docs/systems/DYNAMIC_SEARCH_IMPLEMENTATION.md)
- [Search Client Source](../../app/search/search-client.tsx)

---

## Summary

The nested field search is **fully implemented and working**:

- ✅ **machineSettings**: ALL parameters searchable at any depth
- ✅ **materialProperties**: ALL categories and properties searchable
- ✅ **Recursive traversal**: Handles 10 levels of nesting
- ✅ **Comprehensive coverage**: Values, units, descriptions, labels
- ✅ **Safe & robust**: Null handling, skip logic, depth limits

**Test it yourself**: Visit `/search` and try searching for "100", "density", "1064", "fiber laser", etc.!
