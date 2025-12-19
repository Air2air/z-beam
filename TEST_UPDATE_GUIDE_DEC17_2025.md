# Test Update Guide - Flattened Architecture Migration

**Date**: December 17, 2025  
**Migration**: v4.0.0 (nested) → v5.0.0 (flattened)

---

## Quick Reference

### Before (v4.0.0) ❌
```typescript
metadata.domain_linkages.produces_compounds
metadata.domain_linkages.related_materials
```

### After (v5.0.0) ✅
```typescript
metadata.produces_compounds
metadata.related_materials
```

---

## Test Mock Data Updates

### 1. Contaminant Mocks

**OLD (v4.0.0)**:
```typescript
const mockContaminant = {
  id: 'test-contamination',
  schema_version: '4.0.0',
  domain_linkages: {
    produces_compounds: [...],
    related_materials: [...],
    related_contaminants: [...],
    related_settings: [...]
  }
};
```

**NEW (v5.0.0)**:
```typescript
const mockContaminant = {
  id: 'test-contamination',
  schema_version: '5.0.0',
  // Flattened - top-level fields
  produces_compounds: [
    {
      id: 'carbon-monoxide-compound',
      title: 'Carbon Monoxide',
      url: '/compounds/toxic-gas/asphyxiant/carbon-monoxide-compound',
      image: '/images/compounds/carbon-monoxide.jpg',
      category: 'toxic-gas',
      subcategory: 'asphyxiant',
      frequency: 'very_common',
      severity: 'high',
      hazard_class: 'toxic',
      concentration_range: '10-50 mg/m³'
    }
  ],
  related_materials: [...],
  related_contaminants: [...],
  related_settings: [...]
};
```

### 2. Material Mocks

**OLD (v4.0.0)**:
```typescript
const mockMaterial = {
  id: 'aluminum-laser-cleaning',
  schema_version: '4.0.0',
  domain_linkages: {
    removes_contaminants: [...],
    related_materials: [...],
    related_settings: [...]
  }
};
```

**NEW (v5.0.0)**:
```typescript
const mockMaterial = {
  id: 'aluminum-laser-cleaning',
  schema_version: '5.0.0',
  // Flattened - top-level fields
  removes_contaminants: [
    {
      id: 'rust-contamination',
      title: 'Rust / Iron Oxide',
      url: '/contaminants/metallic/oxidation/rust-contamination',
      image: '/images/contaminant/rust-hero.jpg',
      category: 'metallic',
      subcategory: 'oxidation',
      frequency: 'common',
      severity: 'moderate'
    }
  ],
  related_materials: [...],
  related_settings: [...]
};
```

### 3. Settings Mocks

**NEW (v5.0.0)**:
```typescript
const mockSettings = {
  id: 'test-settings',
  schema_version: '5.0.0',
  // Flattened - top-level fields
  effective_against: [...],  // Contaminants
  related_materials: [...],
  related_contaminants: [...],
  related_settings: [...]
};
```

---

## Component Test Updates

### Layout Component Tests

**File**: `tests/components/ContaminantsLayout.test.tsx`

```typescript
import { render } from '@testing-library/react';
import ContaminantsLayout from '@/app/components/ContaminantsLayout/ContaminantsLayout';

describe('ContaminantsLayout', () => {
  const mockMetadata = {
    id: 'test-contamination',
    title: 'Test Contamination',
    schema_version: '5.0.0',
    
    // FLATTENED structure
    produces_compounds: [
      {
        id: 'test-compound',
        title: 'Test Compound',
        url: '/compounds/category/subcategory/test-compound',
        category: 'toxic-gas',
        severity: 'high'
      }
    ],
    
    related_materials: [
      {
        id: 'test-material',
        title: 'Test Material',
        url: '/materials/category/subcategory/test-material',
        frequency: 'common'
      }
    ],
    
    related_contaminants: [...],
    related_settings: [...]
  };

  it('renders hazardous compounds section', () => {
    const { getByText } = render(
      <ContaminantsLayout 
        metadata={mockMetadata}
        category="organic-residue"
        subcategory="adhesive"
        slug="test-contamination"
      />
    );
    
    expect(getByText('Hazardous Compounds')).toBeInTheDocument();
  });

  it('renders all 4 linkage sections when data present', () => {
    const { getByText } = render(
      <ContaminantsLayout metadata={mockMetadata} {...props} />
    );
    
    // Verify all sections render
    expect(getByText('Hazardous Compounds')).toBeInTheDocument();
    expect(getByText('Compatible Materials')).toBeInTheDocument();
    expect(getByText('Related Contaminants')).toBeInTheDocument();
    expect(getByText('Recommended Settings')).toBeInTheDocument();
  });
});
```

### DataGrid Component Tests

**File**: `tests/components/DataGrid.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { DataGrid } from '@/app/components/DataGrid/DataGrid';
import { materialLinkageToGridItem } from '@/app/utils/gridMappers';
import { sortByFrequency } from '@/app/utils/gridSorters';

describe('DataGrid', () => {
  const mockData = [
    {
      id: 'material-1',
      title: 'Material One',
      url: '/materials/cat/subcat/material-1',
      frequency: 'common'
    },
    {
      id: 'material-2',
      title: 'Material Two',
      url: '/materials/cat/subcat/material-2',
      frequency: 'very_common'
    }
  ];

  it('transforms data using mapper', () => {
    const { container } = render(
      <DataGrid
        data={mockData}
        mapper={materialLinkageToGridItem}
        columns={3}
        variant="default"
      />
    );
    
    expect(container.querySelectorAll('.card')).toHaveLength(2);
  });

  it('sorts data using sorter', () => {
    const { getAllByRole } = render(
      <DataGrid
        data={mockData}
        mapper={materialLinkageToGridItem}
        sorter={sortByFrequency}
        columns={3}
      />
    );
    
    const cards = getAllByRole('article');
    // very_common should be first after sorting
    expect(cards[0]).toHaveTextContent('Material Two');
  });

  it('handles empty data array', () => {
    const { container } = render(
      <DataGrid
        data={[]}
        mapper={materialLinkageToGridItem}
        columns={3}
      />
    );
    
    expect(container.querySelectorAll('.card')).toHaveLength(0);
  });
});
```

### GridSection Component Tests

**File**: `tests/components/GridSection.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { GridSection } from '@/app/components/GridSection/GridSection';

describe('GridSection', () => {
  it('renders title and description', () => {
    const { getByText } = render(
      <GridSection
        title="Test Section"
        description="Test description"
      >
        <div>Child content</div>
      </GridSection>
    );
    
    expect(getByText('Test Section')).toBeInTheDocument();
    expect(getByText('Test description')).toBeInTheDocument();
    expect(getByText('Child content')).toBeInTheDocument();
  });

  it('renders without description', () => {
    const { getByText, queryByText } = render(
      <GridSection title="Test Section">
        <div>Content</div>
      </GridSection>
    );
    
    expect(getByText('Test Section')).toBeInTheDocument();
    expect(queryByText('Test description')).not.toBeInTheDocument();
  });
});
```

---

## Utility Function Tests

### gridMappers Tests

**File**: `tests/utils/gridMappers.test.ts`

```typescript
import {
  compoundToGridItem,
  materialLinkageToGridItem,
  contaminantLinkageToGridItem,
  settingsLinkageToGridItem
} from '@/app/utils/gridMappers';

describe('gridMappers', () => {
  describe('compoundToGridItem', () => {
    it('transforms compound to GridItemSSR format', () => {
      const compound = {
        id: 'carbon-monoxide-compound',
        title: 'Carbon Monoxide',
        url: '/compounds/toxic-gas/asphyxiant/carbon-monoxide-compound',
        image: '/images/compounds/carbon-monoxide.jpg',
        category: 'toxic-gas',
        subcategory: 'asphyxiant',
        frequency: 'very_common',
        severity: 'high',
        hazard_class: 'toxic',
        concentration_range: '10-50 mg/m³'
      };

      const result = compoundToGridItem(compound);

      expect(result).toEqual({
        id: 'carbon-monoxide-compound',
        title: 'Carbon Monoxide',
        url: '/compounds/toxic-gas/asphyxiant/carbon-monoxide-compound',
        image: '/images/compounds/carbon-monoxide.jpg',
        badge: {
          text: 'toxic',
          variant: 'danger'
        },
        subtitle: 'Concentration: 10-50 mg/m³'
      });
    });

    it('handles missing optional fields', () => {
      const compound = {
        id: 'test',
        title: 'Test',
        url: '/test',
        category: 'test'
      };

      const result = compoundToGridItem(compound);

      expect(result.badge).toBeUndefined();
      expect(result.subtitle).toBeUndefined();
    });
  });

  describe('materialLinkageToGridItem', () => {
    it('transforms material linkage correctly', () => {
      const material = {
        id: 'aluminum-laser-cleaning',
        title: 'Aluminum',
        url: '/materials/metal/non-ferrous/aluminum-laser-cleaning',
        image: '/images/material/aluminum-hero.jpg',
        frequency: 'common',
        typical_context: 'Industrial applications'
      };

      const result = materialLinkageToGridItem(material);

      expect(result.badge?.text).toBe('common');
      expect(result.subtitle).toBe('Industrial applications');
    });
  });
});
```

### gridSorters Tests

**File**: `tests/utils/gridSorters.test.ts`

```typescript
import {
  sortBySeverity,
  sortByFrequency,
  sortAlphabetically
} from '@/app/utils/gridSorters';

describe('gridSorters', () => {
  describe('sortBySeverity', () => {
    it('sorts high severity first', () => {
      const items = [
        { severity: 'low' },
        { severity: 'high' },
        { severity: 'moderate' }
      ];

      const sorted = [...items].sort(sortBySeverity);

      expect(sorted.map(i => i.severity)).toEqual(['high', 'moderate', 'low']);
    });

    it('handles missing severity', () => {
      const items = [
        { severity: 'low' },
        { },
        { severity: 'high' }
      ];

      const sorted = [...items].sort(sortBySeverity);

      expect(sorted[0].severity).toBe('high');
    });
  });

  describe('sortByFrequency', () => {
    it('sorts very_common first', () => {
      const items = [
        { frequency: 'occasional' },
        { frequency: 'very_common' },
        { frequency: 'common' }
      ];

      const sorted = [...items].sort(sortByFrequency);

      expect(sorted.map(i => i.frequency)).toEqual(['very_common', 'common', 'occasional']);
    });
  });
});
```

---

## Integration Test Updates

### E2E Material Page Tests

**File**: `tests/e2e/material-page-dataset.test.ts`

```typescript
describe('Material Page Dataset', () => {
  it('includes flattened linkage structure', async () => {
    const metadata = await loadMaterialMetadata('aluminum-laser-cleaning');

    // Verify v5.0.0 structure
    expect(metadata.schema_version).toBe('5.0.0');
    
    // Verify top-level linkage fields (NOT nested)
    expect(metadata).toHaveProperty('removes_contaminants');
    expect(metadata).toHaveProperty('related_materials');
    expect(metadata).toHaveProperty('related_settings');
    
    // Verify OLD structure does NOT exist
    expect(metadata).not.toHaveProperty('domain_linkages');
  });

  it('linkage arrays have correct structure', async () => {
    const metadata = await loadMaterialMetadata('aluminum-laser-cleaning');

    if (metadata.removes_contaminants?.length > 0) {
      const firstContaminant = metadata.removes_contaminants[0];
      
      expect(firstContaminant).toHaveProperty('id');
      expect(firstContaminant).toHaveProperty('title');
      expect(firstContaminant).toHaveProperty('url');
      expect(firstContaminant).toHaveProperty('category');
      expect(firstContaminant).toHaveProperty('subcategory');
    }
  });
});
```

---

## Test Command Reference

```bash
# Run all tests
npm test

# Run specific test file
npm test -- gridMappers.test.ts

# Run tests matching pattern
npm test -- --testPathPattern="utils"

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run only changed tests
npm test -- --onlyChanged
```

---

## Common Issues & Solutions

### Issue: Test expects `domain_linkages` object

**Error**:
```
TypeError: Cannot read property 'produces_compounds' of undefined
```

**Solution**:
```typescript
// Change from:
metadata.domain_linkages.produces_compounds

// To:
metadata.produces_compounds
```

### Issue: Mock data has wrong schema version

**Error**:
```
Expected schema_version to be '5.0.0', received '4.0.0'
```

**Solution**:
Update mock to use `schema_version: '5.0.0'` and flatten structure

### Issue: Component import fails

**Error**:
```
Module not found: SafetyDataPanel
```

**Solution**:
Remove import - component was removed. Use GridSection + DataGrid instead.

---

## Checklist for Test Updates

- [ ] Update all mock data to v5.0.0 structure
- [ ] Remove `domain_linkages` nested object from mocks
- [ ] Add top-level linkage fields to mocks
- [ ] Update component imports (no SafetyDataPanel, no DomainLinkagesContainer)
- [ ] Update assertions to expect flattened structure
- [ ] Add tests for new GridSection component
- [ ] Add tests for new DataGrid component
- [ ] Add tests for gridMappers utilities
- [ ] Add tests for gridSorters utilities
- [ ] Run full test suite and verify all pass
- [ ] Update snapshot tests if needed

---

**Documentation**: `DOCUMENTATION_AND_TEST_UPDATES_DEC17_2025.md`  
**Architecture**: `FLATTENED_ARCHITECTURE_MIGRATION_COMPLETE.md`  
**Spec**: `FRONTMATTER_STRUCTURE_SPECIFICATION.md`
