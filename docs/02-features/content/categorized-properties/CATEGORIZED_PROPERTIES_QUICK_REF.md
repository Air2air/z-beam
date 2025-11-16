# Categorized Properties - Quick Reference Card

⚡ **Fast reference for common tasks**

## Running Tests

```bash
# Run categorized properties tests
npm test -- tests/components/MetricsGrid.categorized.test.tsx

# All tests passing: 22/22 ✅
```

## Adding to Layout

```tsx
import MetricsGrid from '@/app/components/MetricsCard/MetricsGrid';

<MetricsGrid
  metadata={metadata}
  dataSource="materialProperties"
  showTitle={true}
/>
```

## YAML Structure

```yaml
---
materialProperties:
  material_properties:              # Standard category
    label: Material Properties      # ← Required
    percentage: 40
    description: 'Intrinsic properties'
    properties:
      density:
        value: 2.7
        unit: 'g/cm³'
        confidence: 95
  structural_response:              # Standard category
    label: Structural Response Properties
    percentage: 35
    properties: { ... }
  energy_coupling:                  # Standard category
    label: Energy Coupling Properties
    percentage: 25
    properties: { ... }
---
```

## Category IDs & Colors

**3 Standardized Categories:**

| Category ID | Color | Label |
|------------|-------|-------|
| `material_properties` | `#A8DADC` | Material Properties |
| `structural_response` | `#4ECDC4` | Structural Response |
| `energy_coupling` | `#FFE66D` | Energy Coupling |

## Common Issues

**❌ Colors not showing?**
- Use legacy names: `thermal_response` not `thermal`
- Include `#` in colors: `#FF6B6B` not `FF6B6B`

**❌ Category not appearing?**
- Add `percentage` field
- Check `properties` is not empty
- Use `dataSource="materialProperties"`

## UI Features

✅ Always-visible categories (no collapse)  
✅ Simple h3 headers (no buttons)  
✅ Color-coded property cards  
✅ Responsive 2-5 column grid  
✅ Sorted by percentage (descending)  
❌ No emoji icons  
❌ No descriptions in UI  
❌ No property counts  

## Documentation

📖 **Complete Guide:** `docs/CATEGORIZED_PROPERTIES_GUIDE.md`  
📊 **Test Update Summary:** `docs/TESTS_AND_DOCS_CONSOLIDATION_COMPLETE.md`

## Test Pattern

```typescript
test('should display categories', () => {
  render(
    <MetricsGrid 
      metadata={mockMetadata} 
      dataSource="materialProperties" 
    />
  );
  
  // Categories are h3 headings
  expect(screen.getByRole('heading', { 
    level: 3, 
    name: 'Thermal Properties' 
  })).toBeInTheDocument();
});
```

---

**Status:** ✅ Production Ready  
**Tests:** 22/22 Passing  
**Last Updated:** December 2024
