# Categorized Properties Quick Reference Card

## 🎯 At a Glance

### Structure
```yaml
materialProperties:
  [category]:
    label: "Category Name"
    description: "Description"
    percentage: XX.X
    properties:
      [property]:
        value: [number|string]
        unit: "unit"
        confidence: [0-100]
        description: "Description"
        min: [number]
        max: [number]
```

### 9 Categories

| Icon | Category | % | Example Properties |
|------|----------|---|-------------------|
| 🔥 | thermal | 29.1 | thermalConductivity, meltingPoint, specificHeat |
| ⚙️ | mechanical | 18.2 | density, hardness, tensileStrength |
| 💡 | optical_laser | 16.4 | laserAbsorption, ablationThreshold, reflectivity |
| 🎨 | surface | 9.1 | porosity, surfaceRoughness, surfaceEnergy |
| ⚡ | electrical | 7.3 | electricalConductivity, electricalResistivity |
| 🧪 | chemical | 5.5 | chemicalStability, oxidationResistance |
| 🌍 | environmental | 5.5 | moistureContent, weatherResistance |
| 🔬 | compositional | 5.5 | crystallineStructure, celluloseContent |
| 📐 | physical_structural | 3.6 | density, viscosity |

## 📝 Common Commands

```bash
# Development
npm run dev                              # Start dev server
npm test MetricsGrid.categorized         # Run tests

# Validation
yamllint content/frontmatter/*.yaml
python scripts/validate-categorized-properties.py

# Migration
python scripts/categorize-properties.py  # Auto-migrate files
```

## 🔧 Component Usage

```tsx
// Basic
<MetricsGrid 
  metadata={metadata} 
  dataSource="materialProperties"
/>

// With filtering
<MetricsGrid 
  metadata={metadata} 
  dataSource="materialProperties"
  categoryFilter={['thermal', 'mechanical']}
  defaultExpandedCategories={['thermal']}
/>
```

## 🎨 Category Colors

```typescript
thermal: '#FF6B6B'          // Red
mechanical: '#4ECDC4'       // Teal  
optical_laser: '#FFE66D'    // Yellow
surface: '#95E1D3'          // Mint
electrical: '#F38181'       // Pink
chemical: '#AA96DA'         // Purple
environmental: '#67B279'    // Green
compositional: '#C490D1'    // Lavender
physical_structural: '#A8DADC' // Light blue
```

## 📋 Property Abbreviations

```typescript
thermalConductivity → Therm. Cond.
thermalExpansion → Therm. Exp.
tensileStrength → Ten. Strength
youngsModulus → Y. Modulus
laserAbsorption → Laser Abs.
ablationThreshold → Ablation Th.
electricalConductivity → Elec. Cond.
crystallineStructure → Crystal
```

## ✅ Validation Checklist

- [ ] Each category has label, description, percentage
- [ ] Each property has value, unit, confidence, description
- [ ] No properties outside category groups
- [ ] YAML syntax valid
- [ ] Tests pass
- [ ] Frontend renders correctly

## 🚨 Common Errors

**Missing category metadata:**
```yaml
# ❌ Wrong
thermal:
  properties: {...}

# ✅ Correct
thermal:
  label: "Thermal Properties"
  description: "Heat-related characteristics"
  percentage: 29.1
  properties: {...}
```

**Orphaned properties:**
```yaml
# ❌ Wrong
materialProperties:
  density: {...}  # Outside category
  thermal: {...}

# ✅ Correct
materialProperties:
  mechanical:
    properties:
      density: {...}  # Inside category
```

## 📚 Quick Links

- [Complete Docs](./CATEGORIZED_PROPERTIES_README.md)
- [Frontend Guide](./CATEGORIZED_PROPERTIES_FRONTEND_IMPLEMENTATION.md)
- [Migration Guide](./MIGRATION_CATEGORIZED_PROPERTIES.md)
- [Testing Guide](./METRICSCARD_CATEGORIZED_TESTING.md)
- [Sample File](../content/frontmatter/aluminum-test-categorized.yaml)

## 🔍 Property Mapping

| Property | Category | Unit |
|----------|----------|------|
| thermalConductivity | thermal | W/m·K |
| meltingPoint | thermal | °C |
| density | mechanical | g/cm³ |
| hardness | mechanical | HV |
| laserAbsorption | optical_laser | % |
| reflectivity | optical_laser | % |
| porosity | surface | % |
| electricalConductivity | electrical | MS/m |
| crystallineStructure | compositional | none |

## 💡 Tips

1. **Sort by percentage** - Categories auto-sort by importance
2. **Default expanded** - thermal, mechanical, optical_laser
3. **Collapsible** - Click headers to toggle
4. **Filterable** - Use categoryFilter prop
5. **Accessible** - Full ARIA support
6. **Responsive** - 2-5 columns based on screen size

## 🎯 Testing

```bash
# Run specific tests
npm test MetricsGrid.categorized

# With coverage
npm test -- --coverage

# Watch mode  
npm test MetricsGrid -- --watch

# Validate YAML
python scripts/validate-single-file.py [file]
```

## 📊 Statistics

- **Total Materials**: 122 files
- **Categories**: 9 scientific domains
- **Properties**: 20+ per material
- **Test Coverage**: >90%
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+

---

**Version**: 2.0.0 | **Updated**: Oct 14, 2025 | **Status**: ✅ Production Ready
