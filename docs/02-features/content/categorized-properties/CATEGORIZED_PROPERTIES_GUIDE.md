# Categorized Material Properties - Complete Guide

**Last Updated:** December 2024  
**Status:** ✅ Production Ready  
**Test Coverage:** 22/22 tests passing

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Category System](#category-system)
4. [Component Architecture](#component-architecture)
5. [YAML Configuration](#yaml-configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Migration Guide](#migration-guide)

---

## Overview

The categorized properties system organizes material properties into scientific categories with visual color coding. Categories are always visible (non-collapsible) with simple h3 headers, providing immediate access to all property information.

### Key Features

- **9 Scientific Categories**: Thermal, Mechanical, Optical/Laser, Surface, Electrical, Chemical, Environmental, Compositional, Physical/Structural
- **Color-Coded Cards**: Each category has a distinct color with 25% opacity
- **Always-Visible**: All categories displayed without accordion/collapse functionality
- **Dual Naming Support**: Supports both new category IDs and legacy naming conventions
- **Flexible Layout**: Responsive grid adapts from 2 to 4 columns based on viewport (max 4)
- **Type-Safe**: Full TypeScript support with comprehensive interfaces

### What Changed (December 2024)

**Removed:**
- ❌ Accordion collapse/expand functionality
- ❌ Emoji icons in category headers
- ❌ Category descriptions in UI
- ❌ Property count display
- ❌ Percentage display in headers

**Simplified:**
- ✅ CategoryHeader now simple `<div>` with `<h3>` (was button)
- ✅ All categories always visible
- ✅ Clean, minimal header design
- ✅ Restored color coding for legacy category names

---

## Quick Start

### 1. Add to Your Layout

```tsx
import MetricsGrid from '@/app/components/MetricsCard/MetricsGrid';

<MetricsGrid
  metadata={metadata}
  dataSource="materialProperties"
  showTitle={true}
  title="Material Properties"
/>
```

### 2. Configure Your YAML

```yaml
---
materialProperties:
  material_properties:
    label: Material Properties
    percentage: 40
    description: 'Intrinsic physical properties'
    properties:
      density:
        value: 2.7
        unit: 'g/cm³'
        confidence: 95
        description: 'Material density'
        min: 2.2
        max: 3.0
  structural_response:
    label: Structural Response Properties
    percentage: 35
    description: 'Mechanical and structural characteristics'
    properties:
      tensileStrength:
        value: 690
        unit: 'MPa'
        confidence: 95
        description: 'Ultimate tensile strength'
  energy_coupling:
    label: Energy Coupling Properties
    percentage: 25
    description: 'Laser interaction characteristics'
    properties:
      laserAbsorption:
        value: 32.7
        unit: '%'
        confidence: 92
        description: 'Laser absorption rate'
---
```

### 3. View Results

Properties automatically display in color-coded categories, sorted by percentage (highest first).

---

## Category System

### Category Configuration

All categories are defined in `CATEGORY_CONFIG` within `MetricsGrid.tsx`:

```typescript
const CATEGORY_CONFIG = {
  // NEW NAMING (Primary)
  thermal: {
    color: '#FF6B6B',
    label: 'Thermal Properties'
  },
  mechanical: {
    color: '#4ECDC4',
    label: 'Mechanical Properties'
  },
  optical_laser: {
    color: '#FFE66D',
    label: 'Optical & Laser Properties'
  },
  // ... (6 more new categories)
  
  // LEGACY NAMING (Backward Compatibility)
  thermal_response: {
    color: '#FF6B6B',
    label: 'Thermal Response'
  },
  mechanical_response: {
    color: '#4ECDC4',
    label: 'Mechanical Response'
  },
  // ... (2 more legacy categories)
};
```

### Complete Category Reference

The system uses **3 standardized categories** for all materials:

| Category ID | Color | Label | Purpose |
|------------|-------|-------|----------|
| `material_properties` | `#A8DADC` | Material Properties | Intrinsic physical properties (density, porosity, chemical stability) |
| `structural_response` | `#4ECDC4` | Structural Response | Mechanical properties (hardness, tensile strength, Young's modulus) |
| `energy_coupling` | `#FFE66D` | Energy Coupling | Laser interaction properties (absorption, reflectivity, ablation threshold) |

### Color System

Colors are applied with 25% opacity to property cards:

```typescript
// Example: #FF6B6B becomes #FF6B6B40 (hex color + "40" for 25% opacity)
const backgroundColor = `${categoryColor}40`;
```

**Important:** Colors must include the `#` symbol. The opacity is added programmatically.

---

## Component Architecture

### File Structure

```
app/components/MetricsCard/
├── MetricsGrid.tsx           # Main component (categorized + flat)
├── MetricsCard.tsx           # Individual property card
├── GridTitle.tsx             # Section title component
└── SectionTitle.tsx          # Category header component
```

### MetricsGrid Component

**Props Interface:**

```typescript
interface MetricsGridProps {
  metadata: ArticleMetadata;
  dataSource: 'materialProperties' | 'machineSettings';
  title?: string;
  description?: string;
  titleFormat?: 'default' | 'comparison';
  layout?: 'grid' | 'list' | 'auto';
  showTitle?: boolean;
  className?: string;
  baseHref?: string;
  searchable?: boolean;
  categoryFilter?: string[];  // Filter to specific categories
}
```

**Key Features:**

- **Dual Mode**: Supports both categorized (materialProperties) and flat (machineSettings) rendering
- **Automatic Sorting**: Categories sorted by percentage (descending)
- **Category Filtering**: Optionally display only specific categories
- **Responsive Grid**: 2-4 columns depending on viewport width (max 4)
- **Type-Safe**: Full TypeScript interfaces for all data structures

### Data Flow

```
YAML File → ArticleMetadata → MetricsGrid → Category Headers + MetricsCards
```

1. **YAML Processing**: Properties parsed into `PropertyCategory` objects
2. **Category Extraction**: `getCategoriesWithCards` extracts and sorts categories
3. **Rendering**: Categories rendered with headers, properties as MetricsCards
4. **Coloring**: Category color applied to each property card

---

## YAML Configuration

### PropertyCategory Structure

```typescript
interface PropertyCategory {
  label: string;           // Human-readable category name (displayed in UI)
  percentage: number;      // Contribution to overall properties (0-100)
  description: string;     // Category description (not displayed in UI)
  properties: {
    [key: string]: PropertyValue | PropertyWithUnits;
  };
}
```

### PropertyValue Structure

```typescript
interface PropertyValue {
  value: string | number;
  unit?: string;
  confidence?: number;
  description?: string;
  min?: number;
  max?: number;
  source?: string;
}
```

### Example: Complete Material YAML

```yaml
---
title: 'Aluminum 6061'
slug: 'aluminum-6061'
materialProperties:
  thermal_response:
    label: Thermal Response Properties
    percentage: 35
    description: 'Heat-related material characteristics'
    properties:
      thermalConductivity:
        value: 167
        unit: 'W/m·K'
        confidence: 95
        description: 'Excellent thermal conductor'
        min: 160
        max: 175
      thermalExpansion:
        value: 23.6
        unit: 'μm/m·°C'
        confidence: 92
        description: 'Linear thermal expansion coefficient'
      meltingPoint:
        value: 582
        unit: '°C'
        confidence: 98
  
  mechanical_response:
    label: Mechanical Response Properties
    percentage: 30
    description: 'Strength and structural characteristics'
    properties:
      tensileStrength:
        value: 310
        unit: 'MPa'
        confidence: 96
      yieldStrength:
        value: 276
        unit: 'MPa'
        confidence: 94
      elongation:
        value: 12
        unit: '%'
        confidence: 90
  
  laser_interaction:
    label: Laser Interaction Properties
    percentage: 20
    description: 'Laser processing and optical behavior'
    properties:
      absorptivity:
        value: 0.15
        unit: ''
        confidence: 85
        description: 'Laser absorption at 1064nm'
      reflectivity:
        value: 0.85
        unit: ''
        confidence: 87
  
  material_characteristics:
    label: Material Characteristics
    percentage: 15
    description: 'General physical properties'
    properties:
      density:
        value: 2.7
        unit: 'g/cm³'
        confidence: 99
      hardness:
        value: 95
        unit: 'HB'
        confidence: 93
---
```

### Category ID Options

You can use **either** naming convention:

**New Names (Recommended):**
- `thermal`
- `mechanical`
- `optical_laser`
- `surface`
- `electrical`
- `chemical`
- `environmental`
- `compositional`
- `physical_structural`

**Legacy Names (Supported):**
- `thermal_response`
- `mechanical_response`
- `laser_interaction`
- `material_characteristics`

Both will work and display correctly with proper colors.

---

## Testing

### Test Suite Overview

**Location:** `tests/components/MetricsGrid.categorized.test.tsx`

**Coverage:**
- ✅ 22 tests passing
- ✅ PropertyValue interface validation
- ✅ PropertyCategory structure validation
- ✅ Category rendering (headers as h3)
- ✅ Category display (always visible)
- ✅ Category filtering
- ✅ Category sorting (by percentage)
- ✅ Machine settings (flat structure)
- ✅ Accessibility (ARIA roles, semantic HTML)
- ✅ Props validation
- ✅ Category configuration
- ✅ Property title mapping

### Running Tests

```bash
# Run categorized properties tests
npm test -- tests/components/MetricsGrid.categorized.test.tsx

# Run all MetricsGrid tests
npm test -- tests/components/MetricsGrid

# Run with coverage
npm test -- --coverage tests/components/MetricsGrid.categorized.test.tsx
```

### Key Test Patterns

**Category Display Test:**
```typescript
test('should display all categories without collapse', () => {
  render(
    <MetricsGrid
      metadata={mockMetadata}
      dataSource="materialProperties"
    />
  );

  // Categories are headings, not buttons
  expect(screen.getByRole('heading', { level: 3, name: 'Thermal Properties' }))
    .toBeInTheDocument();
});
```

**Accessibility Test:**
```typescript
test('should have proper ARIA roles', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
  
  // Section has region role
  const section = screen.getByRole('region');
  expect(section).toBeInTheDocument();
  
  // Grids have list role
  const grids = screen.getAllByRole('list');
  expect(grids.length).toBeGreaterThan(0);
});
```

### Test Data Example

```typescript
const mockMetadata: ArticleMetadata = {
  title: 'Test Material',
  slug: 'test-material',
  materialProperties: {
    thermal_response: {
      percentage: 29.1,
      properties: {
        thermalConductivity: {
          value: 237,
          unit: 'W/m·K',
          confidence: 92,
          description: 'Test description'
        }
      }
    } as PropertyCategory
  }
};
```

---

## Troubleshooting

### Colors Not Showing

**Problem:** Property cards are gray instead of colored.

**Solution:** 
1. Check that category IDs in YAML match `CATEGORY_CONFIG` keys
2. Verify colors include `#` symbol: `#FF6B6B` not `FF6B6B`
3. Try using legacy category names (`thermal_response` instead of `thermal`)

```typescript
// CORRECT
thermal_response: {
  color: '#FF6B6B',
  label: 'Thermal Response'
}

// WRONG
thermal_response: {
  color: 'FF6B6B',  // Missing #
  label: 'Thermal Response'
}
```

### Categories Not Appearing

**Problem:** No categories display even with valid YAML.

**Causes & Solutions:**

1. **Missing percentage field**
   ```yaml
   # WRONG
   thermal:
     properties: { ... }
   
   # CORRECT
   thermal:
     percentage: 30
     properties: { ... }
   ```

2. **Invalid dataSource**
   ```tsx
   {/* WRONG */}
   <MetricsGrid metadata={metadata} dataSource="properties" />
   
   {/* CORRECT */}
   <MetricsGrid metadata={metadata} dataSource="materialProperties" />
   ```

3. **Empty properties object**
   ```yaml
   # Categories with no properties won't render
   thermal:
     percentage: 30
     properties: {}  # Empty - won't display
   ```

### Test Failures

**JSX Compilation Errors:**

If you see `Cannot use JSX unless the '--jsx' flag is provided`, this is usually a false positive from the TypeScript linter. Tests will still run successfully.

**Verify:**
```bash
npm test -- tests/components/MetricsGrid.categorized.test.tsx
```

If tests pass, the errors are benign.

**PropertyWithUnits Type Errors:**

Ensure test data uses correct structure:

```typescript
// CORRECT
machineSettings: {
  powerRange: {
    value: 100,
    unit: 'W',
    confidence: 92
  }
}

// WRONG (value not wrapped in object)
machineSettings: {
  powerRange: 100  // Missing structure
}
```

### Layout Integration Issues

**Problem:** MetricsGrid not appearing in Layout.

**Solution:**

1. Check import path:
   ```tsx
   import MetricsGrid from '@/app/components/MetricsCard/MetricsGrid';
   ```

2. Verify metadata structure:
   ```tsx
   const metadata = await getMetadata(slug);
   // Must have materialProperties object
   ```

3. Ensure dataSource is correct:
   ```tsx
   <MetricsGrid 
     metadata={metadata} 
     dataSource="materialProperties"  // Not "machineSettings"
   />
   ```

---

## Migration Guide

### From Accordion Version

If you're updating from the accordion/collapsible version:

**1. Remove Props:**
```tsx
// OLD
<MetricsGrid
  metadata={metadata}
  dataSource="materialProperties"
  defaultExpandedCategories={['thermal', 'mechanical']}  // ❌ Remove
/>

// NEW
<MetricsGrid
  metadata={metadata}
  dataSource="materialProperties"
  // No defaultExpandedCategories needed
/>
```

**2. Update Tests:**
- Replace `screen.getByRole('button')` with `screen.getByRole('heading', { level: 3 })`
- Remove tests for category expansion/collapse
- Remove tests for emoji icons
- Remove tests for category descriptions/percentages in UI

**3. Update Expectations:**
- All categories now always visible
- Headers are h3 elements, not buttons
- No expand/collapse state management
- Color coding always applied

### Adding New Categories

**1. Update CATEGORY_CONFIG:**

```typescript
// In MetricsGrid.tsx
const CATEGORY_CONFIG = {
  // ... existing categories
  
  // Add new category
  my_new_category: {
    color: '#YOUR_HEX_COLOR',
    label: 'My New Category Label'
  }
};
```

**2. Use in YAML:**

```yaml
materialProperties:
  my_new_category:
    percentage: 10
    properties:
      myProperty:
        value: 100
        unit: 'unit'
```

**3. Add Tests:**

```typescript
test('should support my new category', () => {
  const metadata = {
    materialProperties: {
      my_new_category: {
        percentage: 10,
        properties: { /* ... */ }
      }
    }
  };
  
  render(<MetricsGrid metadata={metadata} dataSource="materialProperties" />);
  expect(screen.getByText('My New Category Label')).toBeInTheDocument();
});
```

### Property Title Mapping

Some property names are automatically abbreviated:

```typescript
const PROPERTY_TITLE_MAP = {
  'thermalConductivity': 'Therm. Cond.',
  'thermalExpansion': 'Therm. Exp.',
  'tensileStrength': 'Tensile Str.',
  // ... add more mappings as needed
};
```

To add new mappings:

1. Edit `PROPERTY_TITLE_MAP` in `MetricsGrid.tsx`
2. Add test in "Property Title Mapping" test suite
3. Verify abbreviation displays correctly

---

## Best Practices

### 1. Use Meaningful Percentages

Percentages should reflect the relative importance of each category:

```yaml
# Good - percentages sum to 100%
thermal_response:
  percentage: 40    # Most important
mechanical_response:
  percentage: 35    # Second most important
laser_interaction:
  percentage: 25    # Least important

# Also acceptable - percentages don't have to sum to 100
thermal_response:
  percentage: 60    # High importance
mechanical_response:
  percentage: 30    # Medium importance
```

Categories are sorted by percentage (highest first).

### 2. Include Confidence Scores

Confidence scores help users understand data reliability:

```yaml
thermalConductivity:
  value: 237
  unit: 'W/m·K'
  confidence: 92    # 0-100, higher is better
  description: 'Measured at room temperature'
```

### 3. Provide Descriptions

While not displayed in the UI, descriptions are valuable for:
- Future reference
- Documentation generation
- Search functionality
- Tooltips (if added later)

```yaml
thermal_response:
  percentage: 35
  description: 'Heat-related material characteristics including conductivity and expansion'
  properties: { ... }
```

### 4. Use Min/Max for Ranges

When properties have ranges, include min/max:

```yaml
thermalConductivity:
  value: 237          # Typical value
  unit: 'W/m·K'
  min: 200            # Minimum
  max: 250            # Maximum
  confidence: 92
```

### 5. Consistent Units

Use standard SI units when possible:

- Temperature: °C or K
- Pressure: MPa or GPa
- Length: mm or μm
- Thermal conductivity: W/m·K
- Density: g/cm³

### 6. Category Selection

Choose categories that make sense for your material:

**Metals:** thermal, mechanical, electrical, surface  
**Polymers:** thermal, mechanical, chemical, environmental  
**Ceramics:** thermal, mechanical, optical_laser, chemical  
**Composites:** mechanical, compositional, physical_structural

Don't feel obligated to use all 9 categories - use only what's relevant.

---

## API Reference

### MetricsGrid Component

```typescript
<MetricsGrid
  metadata={ArticleMetadata}           // Required: Article metadata with properties
  dataSource="materialProperties"      // Required: 'materialProperties' | 'machineSettings'
  title="Custom Title"                 // Optional: Override default title
  description="Description text"       // Optional: Section description
  titleFormat="comparison"             // Optional: 'default' | 'comparison'
  layout="auto"                        // Optional: 'grid' | 'list' | 'auto'
  showTitle={true}                     // Optional: Show/hide section title
  className="custom-class"             // Optional: Additional CSS classes
  baseHref="/materials"                // Optional: Base href for links
  searchable={true}                    // Optional: Enable search functionality
  categoryFilter={['thermal']}         // Optional: Filter to specific categories
/>
```

### Interfaces

```typescript
interface ArticleMetadata {
  title: string;
  slug: string;
  materialProperties?: {
    [categoryId: string]: PropertyCategory;
  };
  machineSettings?: {
    [key: string]: PropertyValue | PropertyWithUnits;
  };
}

interface PropertyCategory {
  label: string;
  percentage: number;
  description: string;
  properties: {
    [key: string]: PropertyValue | PropertyWithUnits;
  };
}

interface PropertyValue {
  value: string | number;
  unit?: string;
  confidence?: number;
  description?: string;
  min?: number;
  max?: number;
  source?: string;
}

interface PropertyWithUnits {
  value: string | number;
  units: string;  // Note: plural 'units' instead of 'unit'
  confidence?: number;
  description?: string;
}
```

---

## Future Enhancements

Potential improvements being considered:

1. **Tooltips:** Show descriptions on hover
2. **Filtering UI:** Visual category filter controls
3. **Search:** Filter properties by name or value
4. **Comparison Mode:** Side-by-side material comparison
5. **Export:** Download properties as CSV/JSON
6. **Units Conversion:** Toggle between imperial/metric
7. **Property Graphs:** Visual representation of ranges
8. **Confidence Indicators:** Visual badges for high/medium/low confidence

---

## Related Documentation

- [METRICSCARD_CATEGORIZED_TESTING.md](./METRICSCARD_CATEGORIZED_TESTING.md) - Original test documentation
- [MIGRATION_CATEGORIZED_PROPERTIES.md](./MIGRATION_CATEGORIZED_PROPERTIES.md) - Detailed migration guide
- [LAYOUT_UPDATE_COMPLETE.md](./LAYOUT_UPDATE_COMPLETE.md) - Layout integration details
- [FRONTMATTER_STRUCTURE_EVALUATION.md](./FRONTMATTER_STRUCTURE_EVALUATION.md) - YAML structure analysis

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review test cases for examples
3. Inspect browser console for errors
4. Verify YAML structure matches examples

**Common Commands:**

```bash
# Run dev server
npm run dev

# Run tests
npm test

# Run specific test file
npm test -- tests/components/MetricsGrid.categorized.test.tsx

# Build for production
npm run build
```

---

**Document Version:** 2.0  
**Last Reviewed:** December 2024  
**Status:** ✅ Current (reflects production code)
