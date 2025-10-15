# Name Normalization End-to-End Analysis

## Overview
This document traces how names flow through the entire Z-Beam system from YAML source files to final display and URLs.

---

## 1. Data Entry Layer (YAML Frontmatter)

### Source Files
- **Location**: `/content/components/frontmatter/*.yaml`
- **Field**: `name: "Alabaster"`
- **Convention**: Proper case (e.g., "Silicon Carbide", "Aluminum Oxide")

**Example (alabaster-laser-cleaning.yaml)**:
```yaml
name: Alabaster
category: Stone
subcategory: mineral
title: Alabaster Laser Cleaning
```

---

## 2. Filename Convention

### Slug Format
- **Pattern**: `{material-name}-laser-cleaning.yaml`
- **Example**: `alabaster-laser-cleaning.yaml`
- **Convention**: kebab-case (lowercase with hyphens)

### Normalization Function
**Location**: `app/utils/formatting.ts`
```typescript
export function normalizeSlug(str: string): string {
  if (!str) return '';
  return slugify(str); // Converts to lowercase, replaces spaces with hyphens
}

export function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
```

**Transformation Examples**:
- `"Alabaster"` → `"alabaster"`
- `"Silicon Carbide"` → `"silicon-carbide"`
- `"Stainless Steel"` → `"stainless-steel"`

---

## 3. URL Generation

### Dynamic Routes
**Location**: `app/[slug]/page.tsx`
- **Route Pattern**: `/alabaster-laser-cleaning`
- **Param Access**: `params.slug` (already in kebab-case)

### API Routes
**Location**: `app/api/materials/[material]/route.ts`
```typescript
const cleanMaterialName = materialName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

const matchingFiles = allFiles.filter(file => 
  file.toLowerCase().includes(cleanMaterialName.toLowerCase())
);
```

**Key Point**: The system performs flexible matching, allowing variations like:
- `/api/materials/alabaster` matches `alabaster-laser-cleaning.yaml`
- `/api/materials/silicon-carbide` matches `silicon-carbide-laser-cleaning.yaml`

---

## 4. Display Name Generation

### Reverse Normalization (Slug → Display)
**Location**: `app/utils/formatting.ts`
```typescript
export function slugToDisplayName(slug: string): string {
  if (!slug) return '';
  
  // Handle multi-word materials
  const multiWordMaterials = [
    {pattern: ['silicon', 'carbide'], name: 'Silicon Carbide'},
    {pattern: ['silicon', 'nitride'], name: 'Silicon Nitride'},
    {pattern: ['aluminum', 'oxide'], name: 'Aluminum Oxide'},
    {pattern: ['stainless', 'steel'], name: 'Stainless Steel'},
  ];
  
  // Check for known patterns
  const slugParts = slug.split('-');
  for (const material of multiWordMaterials) {
    if (material.pattern.every((part, i) => slugParts[i] === part)) {
      return material.name;
    }
  }
  
  // Extract material before "laser" or "cleaning"
  const laserIndex = slugParts.indexOf('laser');
  if (laserIndex > 0) {
    return slugParts
      .slice(0, laserIndex)
      .map(part => capitalizeFirst(part))
      .join(' ');
  }
  
  // Default: capitalize all parts
  return capitalizeWords(slug.replace(/-/g, ' '));
}
```

**Transformation Examples**:
- `"alabaster-laser-cleaning"` → `"Alabaster"`
- `"silicon-carbide-laser-cleaning"` → `"Silicon Carbide"`
- `"stainless-steel-processing"` → `"Stainless Steel"`

### Helper: capitalizeWords
```typescript
export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

---

## 5. Search & Filter Systems

### Display Name Retrieval
**Location**: `app/utils/searchUtils.ts`
```typescript
export function getDisplayName(item: {
  name?: string;
  frontmatter?: { name?: string; title?: string };
  title?: string;
  slug?: string;
}): string {
  // Priority order:
  if (item.name) return item.name;
  if (item.frontmatter?.name) return item.frontmatter.name;
  if (item.frontmatter?.title) return item.frontmatter.title;
  if (item.title) return item.title;
  
  // Fallback: Convert slug to display name
  if (item.slug) {
    return capitalizeWords(item.slug.replace(/-/g, ' '));
  }
  
  return "Unnamed Item";
}
```

### String Normalization for Matching
```typescript
export function normalizeString(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().trim();
}
```

---

## 6. Component Display Layer

### MetricsGrid Title Mapping
**Location**: `app/components/MetricsCard/MetricsGrid.tsx`
```typescript
const TITLE_MAPPING: Record<string, string> = {
  'fluenceThreshold': 'Fluence',
  'thermalConductivity': 'Therm. Cond.',
  'thermalExpansion': 'Therm. Exp.',
  'meltingPoint': 'Melting Point', // ← TO BE REPLACED
  'powerRange': 'Power Range',
  // ... more mappings
};

// Default fallback: convert camelCase to readable
const title = TITLE_MAPPING[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
```

**Note**: This is where `meltingPoint` gets its display label.

### SEOOptimizedCaption
**Location**: `app/components/Caption/SEOOptimizedCaption.tsx`
- Uses `getThermalPropertyLabel()` to determine label
- Currently reads from `frontmatter.chemicalProperties.meltingPoint`
- **Needs update** to read from `materialProperties.thermalDestructionPoint`

---

## 7. Name Consistency Validation

### Debug Component
**Location**: `app/components/Debug/FrontmatterNameChecker.tsx`
- Validates that names follow kebab-case convention
- Suggests corrections for invalid names

### Test Coverage
**Location**: `tests/utils/formatting.test.js`
```javascript
describe('slugToDisplayName', () => {
  test('should convert simple slugs to display names', () => {
    expect(slugToDisplayName('aluminum')).toBe('Aluminum');
    expect(slugToDisplayName('titanium-alloy')).toBe('Titanium Alloy');
  });

  test('should handle multi-word materials', () => {
    expect(slugToDisplayName('silicon-carbide')).toBe('Silicon Carbide');
    expect(slugToDisplayName('aluminum-oxide')).toBe('Aluminum Oxide');
  });

  test('should extract material names before process words', () => {
    expect(slugToDisplayName('aluminum-laser-cleaning')).toBe('Aluminum');
    expect(slugToDisplayName('silicon-carbide-laser-processing')).toBe('Silicon Carbide');
  });
});
```

---

## 8. End-to-End Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. YAML Frontmatter                                         │
│    name: "Alabaster"                                        │
│    filename: alabaster-laser-cleaning.yaml                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. File System (Slug Format)                                │
│    /content/components/frontmatter/alabaster-laser-cleaning │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. URL/Route                                                │
│    URL: /alabaster-laser-cleaning                           │
│    params.slug: "alabaster-laser-cleaning"                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Component Display                                        │
│    slugToDisplayName("alabaster-laser-cleaning")            │
│    → "Alabaster"                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Page Title / Metadata                                   │
│    <h1>Alabaster Laser Cleaning</h1>                        │
│    <title>Alabaster Laser Cleaning | Z-Beam</title>        │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Special Cases & Edge Handling

### Multi-Word Materials
**Challenge**: Slugs like `silicon-carbide-laser-cleaning` could be ambiguous.

**Solution**: Pattern matching with known multi-word materials:
```typescript
const multiWordMaterials = [
  {pattern: ['silicon', 'carbide'], name: 'Silicon Carbide'},
  {pattern: ['silicon', 'nitride'], name: 'Silicon Nitride'},
  // ... more patterns
];
```

### Process Word Filtering
**Challenge**: Slugs contain process words like "laser", "cleaning", "processing".

**Solution**: Extract only the material portion before these keywords:
```typescript
const laserIndex = slugParts.indexOf('laser');
if (laserIndex > 0) {
  return slugParts
    .slice(0, laserIndex)
    .map(part => capitalizeFirst(part))
    .join(' ');
}
```

### Parentheses Handling
**Challenge**: Some materials have acronyms in parentheses.

**Solution**: Strip parentheses for clean URLs:
```typescript
export function stripParenthesesFromSlug(slug: string): string {
  if (!slug) return slug;
  return slug.replace(/[()]/g, '');
}
```

**Example**: `"material-(acronym)-process"` → `"material-acronym-process"`

---

## 10. Key Utilities Summary

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `slugify()` | `"Silicon Carbide"` | `"silicon-carbide"` | Convert name to slug |
| `slugToDisplayName()` | `"silicon-carbide-laser-cleaning"` | `"Silicon Carbide"` | Extract display name from URL |
| `normalizeSlug()` | `"Silicon Carbide!"` | `"silicon-carbide"` | Clean any string to valid slug |
| `capitalizeWords()` | `"silicon carbide"` | `"Silicon Carbide"` | Title case formatting |
| `getDisplayName()` | `{slug, name, title}` | Best available name | Smart name extraction |
| `stripParenthesesFromSlug()` | `"test-(acr)-name"` | `"test-acr-name"` | Clean parentheses |

---

## 11. Critical Observations

### ✅ **Strengths**
1. **Consistent Slug Generation**: `slugify()` is the single source of truth
2. **Multi-Word Material Support**: Pattern matching handles complex names correctly
3. **Process Word Filtering**: Smart extraction of material names from full slugs
4. **Fallback Chain**: Multiple strategies for getting display names
5. **Test Coverage**: Comprehensive tests for edge cases

### ⚠️ **Potential Issues**
1. **No Central Material Registry**: Multi-word patterns are hardcoded in `slugToDisplayName()`
2. **Case Sensitivity**: Some functions are case-sensitive, others normalize
3. **Inconsistent Access Patterns**: Different components use different approaches
4. **Missing Validation**: No runtime validation of slug uniqueness

### 🔄 **Recommendations**
1. **Create Material Registry**: Centralize material name patterns and mappings
2. **Standardize Access**: Use `getDisplayName()` consistently across all components
3. **Add Validation Layer**: Runtime checks for slug format and uniqueness
4. **Document Conventions**: Clear guidelines for YAML authors

---

## 12. Impact on Thermal Property Changes

### Current State
- MetricsGrid uses `TITLE_MAPPING['meltingPoint']` → `'Melting Point'`
- SEOOptimizedCaption uses `getThermalPropertyLabel()` for dynamic labels

### Required Changes
1. **TypeScript Interface** (`types/centralized.ts`):
   - Add `thermalDestructionPoint?: number | PropertyWithUnits`
   - Add `thermalDestructionType?: string`
   
2. **MetricsGrid** (`app/components/MetricsCard/MetricsGrid.tsx`):
   - Update `TITLE_MAPPING` to use `thermalDestructionType` from frontmatter
   - Read from `materialProperties.thermalDestructionPoint` instead of `meltingPoint`

3. **SEOOptimizedCaption** (`app/components/Caption/SEOOptimizedCaption.tsx`):
   - Read from `materialProperties.thermalDestructionPoint`
   - Use `thermalDestructionType` for label (fallback to `getThermalPropertyLabel()`)

4. **YAML Migration**:
   - All 100+ material files need `thermalDestructionPoint` and `thermalDestructionType` fields
   - Maintain backward compatibility during transition

---

## Conclusion

The name normalization system is **well-designed and consistent**, with clear transformation pipelines from YAML → slugs → URLs → display names. The primary utility functions (`slugify`, `slugToDisplayName`, `getDisplayName`) provide robust normalization with good edge case handling.

The thermal property rearchitecture can leverage this existing infrastructure by following the same patterns: centralized type definitions, utility functions for access, and consistent component usage.

**Next Step**: Implement the thermal property changes using the same architectural patterns as the name normalization system.
