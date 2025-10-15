# MetricsGrid Testing Guide - Categorized Properties

## Overview
This guide covers testing strategies for the refactored MetricsGrid component with categorized material properties support.

## Test Files

### Primary Test Suite
**Location**: `/tests/components/MetricsGrid.categorized.test.tsx`

This comprehensive test suite covers all aspects of the new categorized structure:
- PropertyValue interface validation
- PropertyCategory interface validation  
- Category rendering and display
- Collapsible category sections
- Category filtering
- Category sorting by percentage
- Machine settings (flat structure)
- Accessibility compliance
- Props validation

### Legacy Test Suite
**Location**: `/tests/components/MetricsGrid.test.tsx`

Covers legacy QualityMetrics structure (still supported for backward compatibility).

## Test Sample Data

### Sample Categorized YAML
**Location**: `/content/components/frontmatter/aluminum-test-categorized.yaml`

A complete example demonstrating:
- All 7 active property categories
- Proper PropertyValue structure
- Category metadata (label, description, percentage)
- Machine settings in flat structure
- Full property details (value, unit, confidence, description, min, max)

## Running Tests

### Run All MetricsGrid Tests
```bash
npm test MetricsGrid
```

### Run Categorized Tests Only
```bash
npm test MetricsGrid.categorized
```

### Run with Coverage
```bash
npm test -- --coverage --collectCoverageFrom='app/components/MetricsCard/MetricsGrid.tsx'
```

### Watch Mode
```bash
npm test MetricsGrid -- --watch
```

## Test Structure

### 1. Interface Validation Tests

**PropertyValue Interface**
```typescript
describe('PropertyValue Interface', () => {
  test('should have correct structure', () => {
    const value: PropertyValue = {
      value: 237,
      unit: 'W/m·K',
      confidence: 92,
      description: 'Thermal conductivity',
      min: 6.0,
      max: 429.0
    };
    expect(value.value).toBe(237);
    expect(value.confidence).toBe(92);
  });
});
```

**PropertyCategory Interface**
```typescript
describe('PropertyCategory Interface', () => {
  test('should have correct structure', () => {
    const category: PropertyCategory = {
      label: 'Thermal Properties',
      description: 'Heat-related characteristics',
      percentage: 29.1,
      properties: { /* ... */ }
    };
    expect(category.percentage).toBeGreaterThan(0);
  });
});
```

### 2. Rendering Tests

**Category Headers**
```typescript
test('should render category headers', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
  expect(screen.getByText('Thermal Properties')).toBeInTheDocument();
  expect(screen.getByText('29.1%')).toBeInTheDocument();
});
```

**Property Cards**
```typescript
test('should render property cards within categories', () => {
  render(
    <MetricsGrid 
      metadata={mockMetadata} 
      dataSource="materialProperties"
      defaultExpandedCategories={['thermal']}
    />
  );
  const cards = screen.getAllByTestId('metrics-card');
  expect(cards.length).toBeGreaterThan(0);
});
```

### 3. Interaction Tests

**Category Expansion**
```typescript
test('should toggle category expansion', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
  const button = screen.getByRole('button', { name: /thermal properties/i });
  
  expect(button).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});
```

**Category Filtering**
```typescript
test('should filter to specific categories', () => {
  render(
    <MetricsGrid 
      metadata={mockMetadata}
      dataSource="materialProperties"
      categoryFilter={['thermal']}
    />
  );
  expect(screen.getByText('Thermal Properties')).toBeInTheDocument();
  expect(screen.queryByText('Mechanical Properties')).not.toBeInTheDocument();
});
```

### 4. Accessibility Tests

**ARIA Attributes**
```typescript
test('should have proper ARIA roles', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
  expect(screen.getByRole('region')).toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(2);
  expect(screen.getAllByRole('list')).toBeDefined();
});
```

**Keyboard Navigation**
```typescript
test('should support keyboard navigation', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
  const button = screen.getByRole('button', { name: /thermal/i });
  button.focus();
  expect(document.activeElement).toBe(button);
});
```

### 5. Sorting Tests

**Category Sorting by Percentage**
```typescript
test('should sort categories by percentage descending', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
  const headers = screen.getAllByRole('button');
  expect(headers[0]).toHaveTextContent('Thermal Properties'); // 29.1%
  expect(headers[1]).toHaveTextContent('Mechanical Properties'); // 18.2%
});
```

### 6. Machine Settings Tests

**Flat Structure Support**
```typescript
test('should render machine settings without categories', () => {
  render(<MetricsGrid metadata={mockMetadata} dataSource="machineSettings" />);
  expect(screen.queryByRole('button', { name: /properties/i })).not.toBeInTheDocument();
  const cards = screen.getAllByTestId('metrics-card');
  expect(cards.length).toBeGreaterThan(0);
});
```

## Mock Data Structure

### Minimal Test Data
```typescript
const minimalMetadata: ArticleMetadata = {
  title: 'Test Material',
  slug: 'test',
  materialProperties: {
    thermal: {
      label: 'Thermal Properties',
      description: 'Heat-related characteristics',
      percentage: 29.1,
      properties: {
        thermalConductivity: {
          value: 237,
          unit: 'W/m·K',
          confidence: 92,
          description: 'Thermal conductivity',
          min: 6.0,
          max: 429.0
        }
      }
    }
  }
};
```

### Complete Test Data
See `/content/components/frontmatter/aluminum-test-categorized.yaml` for full example with:
- 7 property categories
- Multiple properties per category
- Full PropertyValue structure
- Machine settings

## Testing Checklist

### Component Functionality
- [ ] Category headers render correctly
- [ ] Property cards render within categories
- [ ] Category icons and colors display
- [ ] Percentage badges show correctly
- [ ] Property counts are accurate
- [ ] Categories expand/collapse on click
- [ ] Default expanded categories work
- [ ] Category filtering works
- [ ] Categories sort by percentage
- [ ] Empty state displays when no data

### Data Structure
- [ ] PropertyValue interface validation
- [ ] PropertyCategory interface validation
- [ ] MaterialProperties interface validation
- [ ] Machine settings flat structure works
- [ ] All 9 category types supported

### Accessibility
- [ ] Proper ARIA roles (region, button, list)
- [ ] ARIA labels on grids
- [ ] ARIA expanded states
- [ ] ARIA controls attributes
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Screen reader compatibility

### Props
- [ ] All MetricsGridProps accepted
- [ ] Minimal props work
- [ ] categoryFilter works
- [ ] defaultExpandedCategories works
- [ ] layout options work
- [ ] showTitle works
- [ ] searchable works

### Edge Cases
- [ ] Empty categories handled
- [ ] Missing properties handled
- [ ] Null/undefined values handled
- [ ] String property values work
- [ ] Properties without min/max work
- [ ] Single category displays correctly
- [ ] No expanded categories displays correctly

## Coverage Goals

Target coverage for MetricsGrid.tsx:
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

### Current Coverage
Run coverage report:
```bash
npm test MetricsGrid.categorized -- --coverage --collectCoverageFrom='app/components/MetricsCard/MetricsGrid.tsx'
```

## Integration Testing

### With Real Frontmatter
```bash
# Test with actual categorized YAML file
npm run dev
# Visit: http://localhost:3000/materials/aluminum-test-categorized
```

### Visual Regression Testing
```bash
# Take screenshots of category states
npm run test:visual -- --component MetricsGrid
```

## Common Test Patterns

### Testing Category Configuration
```typescript
const CATEGORY_IDS = [
  'thermal', 'mechanical', 'optical_laser',
  'surface', 'electrical', 'chemical',
  'environmental', 'compositional', 'physical_structural'
];

CATEGORY_IDS.forEach(categoryId => {
  test(`should support ${categoryId} category`, () => {
    // Test each category type
  });
});
```

### Testing Property Title Abbreviations
```typescript
const PROPERTY_MAPPINGS = {
  'thermalConductivity': 'Therm. Cond.',
  'tensileStrength': 'Ten. Strength',
  'laserAbsorption': 'Laser Abs.'
};

Object.entries(PROPERTY_MAPPINGS).forEach(([key, abbr]) => {
  test(`should abbreviate ${key} to ${abbr}`, () => {
    // Test title mapping
  });
});
```

### Testing Multiple Categories
```typescript
const categories = ['thermal', 'mechanical', 'optical_laser'];
categories.forEach(cat => {
  test(`should render ${cat} category`, () => {
    // Test category rendering
  });
});
```

## Debugging Tests

### View Rendered Output
```typescript
import { debug } from '@testing-library/react';

test('debug test', () => {
  const { debug } = render(<MetricsGrid {...props} />);
  debug(); // Prints HTML to console
});
```

### Check Test Data
```typescript
test('inspect data', () => {
  console.log('Metadata:', JSON.stringify(mockMetadata, null, 2));
  render(<MetricsGrid metadata={mockMetadata} dataSource="materialProperties" />);
});
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run MetricsGrid Tests
  run: npm test MetricsGrid.categorized -- --ci --coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: metricsGrid
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm test MetricsGrid -- --bail --findRelatedTests
```

## Troubleshooting

### Test Failures

**"Cannot find module"**
```bash
# Clear Jest cache
npm test -- --clearCache
```

**"Mock not working"**
```typescript
// Ensure mocks are before imports
jest.mock('../../app/components/SectionTitle/SectionTitle', () => ({
  SectionTitle: ({ title }: { title: string }) => <h2>{title}</h2>
}));
```

**"Type errors"**
```bash
# Check TypeScript compilation
npm run type-check
```

### Coverage Gaps
```bash
# Generate detailed coverage report
npm test -- --coverage --coverageReporters=html
# Open: coverage/index.html
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what users see and do
2. **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
3. **Test accessibility**: Every test should verify ARIA attributes
4. **Mock external dependencies**: Keep tests isolated and fast
5. **Use real data structures**: Match production data format
6. **Test edge cases**: Empty states, null values, single items
7. **Verify TypeScript types**: Ensure type safety in tests

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Accessibility Testing](https://testing-library.com/docs/queries/byrole)
- [Component Testing Guide](/docs/COMPONENT_TESTING_GUIDE.md)

## Next Steps

1. Run existing tests: `npm test MetricsGrid.categorized`
2. Check coverage: `npm test -- --coverage`
3. Test with real data: Visit test material page
4. Add integration tests for Layout component
5. Add visual regression tests
6. Set up CI/CD testing pipeline
