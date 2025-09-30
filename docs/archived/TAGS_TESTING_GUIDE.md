# Tags Component Testing Documentation

## Overview

The Tags component has comprehensive test coverage across multiple dimensions to ensure reliability, performance, and maintainability of both legacy string format and new YAML v2.0 structured data support.

## Test Architecture

### Test Categories

1. **Unit Tests** (`tests/components/Tags.test.tsx`)
   - Component rendering and behavior
   - Configuration option validation
   - Edge case handling
   - Accessibility compliance

2. **Utility Tests** (`tests/utils/tags.test.js`)
   - Tag parsing functions
   - Data transformation logic
   - Cache management
   - Error handling

3. **Integration Tests** (`tests/integration/tags-yaml-v2.test.js`)
   - Full YAML v2.0 feature integration
   - Cross-format compatibility
   - Performance benchmarks
   - Real-world usage scenarios

## Test Coverage Areas

### Functional Testing

#### Data Format Support
- ✅ Legacy comma-separated strings
- ✅ YAML v1.0 basic structure
- ✅ YAML v2.0 enhanced structure
- ✅ Mixed format scenarios
- ✅ Malformed data handling

#### Display Modes
- ✅ Standard flat tag display
- ✅ Categorized tag grouping
- ✅ Metadata information panel
- ✅ Combined feature display

#### Interactive Features
- ✅ Link-based navigation
- ✅ Click handler integration
- ✅ Custom styling application
- ✅ Dynamic configuration

### Technical Testing

#### Performance
- ✅ Large dataset handling (100+ tags)
- ✅ Render time optimization
- ✅ Memory usage efficiency
- ✅ Cache effectiveness

#### Accessibility
- ✅ ARIA label compliance
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Semantic HTML structure

#### Error Handling
- ✅ Null/undefined content
- ✅ Malformed YAML data
- ✅ Missing configuration options
- ✅ Network failures (for server functions)

## Test Data Samples

### Legacy String Format
```javascript
const legacyData = "aluminum, cleaning, laser, aerospace";
```

### YAML v2.0 Complete Structure
```javascript
const yamlV2Data = {
  tags: ['electronics', 'aerospace', 'manufacturing'],
  count: 8,
  categories: {
    industry: ['electronics', 'aerospace', 'manufacturing'],
    process: ['passivation', 'polishing'],
    other: ['expert']
  },
  metadata: {
    format: 'yaml',
    version: '2.0',
    material: 'copper',
    author: 'AI Assistant',
    generated: '2025-09-17T11:50:36.211572'
  }
};
```

### Edge Case Data
```javascript
const edgeCaseData = {
  tags: null,
  categories: {
    industry: ['electronics'],
    process: null,
    other: 'invalid'
  },
  metadata: 'malformed'
};
```

## Running Tests

### Individual Test Suites
```bash
# Component unit tests
npm test tests/components/Tags.test.tsx

# Utility function tests  
npm test tests/utils/tags.test.js

# Integration tests
npm test tests/integration/tags-yaml-v2.test.js
```

### Comprehensive Test Suite
```bash
# Run all tag-related tests
npm test -- --testPathPattern=tags

# Run with coverage
npm test -- --testPathPattern=tags --coverage

# Run performance tests only
npm test -- --testNamePattern="Performance"
```

### Custom Test Runner
```bash
# Run comprehensive test suite with validation
node scripts/test-tags-component.js
```

## Test Scenarios

### Component Behavior Tests

#### Rendering Tests
```javascript
describe('Component Rendering', () => {
  it('should render tags from string content', () => {
    render(<Tags content="aluminum, cleaning" />);
    expect(screen.getByText('Aluminum')).toBeInTheDocument();
  });

  it('should render YAML v2.0 structure', () => {
    render(<Tags content={yamlV2Data} />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });
});
```

#### Configuration Tests
```javascript
describe('Configuration Options', () => {
  it('should apply custom styling', () => {
    render(<Tags content={data} config={{ pillColor: 'bg-red-500' }} />);
    expect(screen.getByRole('link')).toHaveClass('bg-red-500');
  });

  it('should show metadata when enabled', () => {
    render(<Tags content={yamlV2Data} config={{ showMetadata: true }} />);
    expect(screen.getByText('Material:')).toBeInTheDocument();
  });
});
```

### Integration Tests

#### Full Feature Integration
```javascript
describe('YAML v2.0 Integration', () => {
  it('should handle complete YAML structure with all features', () => {
    render(
      <Tags 
        content={fullYamlV2Data} 
        config={{ 
          showMetadata: true,
          showCategorized: true,
          title: 'Complete Display'
        }} 
      />
    );

    // Verify all features work together
    expect(screen.getByText('Complete Display')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Material:')).toBeInTheDocument();
  });
});
```

#### Performance Tests
```javascript
describe('Performance', () => {
  it('should handle large datasets efficiently', () => {
    const largeData = generateLargeDataset(100);
    
    const startTime = performance.now();
    render(<Tags content={largeData} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Mocking Strategy

### Next.js Router
```javascript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
```

### Next.js Link Component
```javascript
jest.mock('next/link', () => {
  return function MockLink({ href, children, className }) {
    return <a href={href} className={className}>{children}</a>;
  };
});
```

### File System Operations
```javascript
jest.mock('fs/promises');
jest.mock('fs');

const mockFs = fs;
mockFs.readFile.mockResolvedValue('aluminum, cleaning');
```

## Test Utilities

### Custom Render Helper
```javascript
function renderWithConfig(content, config = {}) {
  return render(<Tags content={content} config={config} />);
}
```

### Data Generators
```javascript
function generateYamlV2Data(options = {}) {
  return {
    tags: options.tags || ['electronics', 'aerospace'],
    count: options.count || 2,
    categories: options.categories || {
      industry: ['electronics', 'aerospace']
    },
    metadata: options.metadata || {
      format: 'yaml',
      version: '2.0'
    }
  };
}
```

### Performance Helpers
```javascript
function measureRenderTime(component) {
  const start = performance.now();
  render(component);
  return performance.now() - start;
}
```

## Continuous Integration

### GitHub Actions Configuration
```yaml
name: Tags Component Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --testPathPattern=tags --coverage
      - run: node scripts/test-tags-component.js
```

### Coverage Requirements
- **Line Coverage**: >95%
- **Branch Coverage**: >90%
- **Function Coverage**: >95%
- **Statement Coverage**: >95%

## Debugging Tests

### Common Issues and Solutions

#### Test Fails: "Cannot find module"
```bash
# Solution: Check Jest configuration and module paths
npm test -- --no-cache
```

#### Mock Not Working
```javascript
// Ensure mocks are in correct order
jest.clearAllMocks(); // in beforeEach
```

#### Performance Test Flaky
```javascript
// Use average of multiple runs
const times = Array.from({ length: 5 }, () => measureRenderTime(component));
const avgTime = times.reduce((a, b) => a + b) / times.length;
expect(avgTime).toBeLessThan(threshold);
```

### Test Debugging Tools
```javascript
// Debug component output
screen.debug(); // Shows rendered HTML

// Debug test data
console.log('Test data:', JSON.stringify(testData, null, 2));

// Debug query results
console.log('Found elements:', screen.getAllByRole('link'));
```

## Maintenance Guidelines

### Adding New Tests
1. Follow existing test structure and naming conventions
2. Include both positive and negative test cases
3. Add performance tests for new features
4. Update documentation with new test scenarios

### Updating Tests for New Features
1. Add tests for new YAML structure fields
2. Test backward compatibility with existing formats
3. Verify performance impact of new features
4. Update integration tests for feature combinations

### Test Data Management
1. Keep test data samples in separate files for reuse
2. Use data generators for large or complex test datasets
3. Maintain realistic test data that matches production usage
4. Document test data structure and purpose

## Quality Gates

### Pre-commit Checks
- All tests must pass
- Coverage thresholds must be met
- No console errors or warnings
- TypeScript compilation must succeed

### Pre-deployment Validation
- Full test suite execution
- Performance benchmarks verification
- Cross-browser compatibility check
- Accessibility audit completion

This comprehensive testing approach ensures the Tags component maintains high quality, performance, and reliability across all supported data formats and usage scenarios.
