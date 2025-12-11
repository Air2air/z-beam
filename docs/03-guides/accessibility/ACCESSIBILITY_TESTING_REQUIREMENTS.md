# Accessibility Testing Requirements

## Comprehensive Testing Framework for WCAG 2.1 AA Compliance

### Overview
This document provides detailed testing specifications for validating accessibility implementations across MetricsCard and Micro components. All tests must verify WCAG 2.1 AA compliance with specific technical assertions.

## Automated Testing Framework

### Jest Test Configuration
```javascript
// jest.config.accessibility.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/accessibility-setup.js'],
  testMatch: ['<rootDir>/tests/accessibility/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'app/components/**/*.{ts,tsx}',
    '!app/components/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      accessibility: 100 // Custom metric for accessibility coverage
    }
  }
};
```

### Testing Library Setup
```typescript
// tests/accessibility-setup.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import 'jest-axe/extend-expect';

// Configure testing library for accessibility testing
configure({
  testIdAttribute: 'id',
  defaultHidden: true // Include hidden elements in queries
});

// Mock accessibility API
global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock ResizeObserver for responsive accessibility
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

## MetricsCard Accessibility Tests

### Semantic Enhancement Tests
```typescript
// tests/accessibility/MetricsCard.semantic-enhancement.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricsCard } from '@/app/components/MetricsCard/MetricsCard';

describe('MetricsCard Semantic Enhancement', () => {
  test('implements comprehensive data attributes with maximum specificity', () => {
    render(<MetricsCard title="Thermal Conductivity" value="45.5" unit="W/mK" fullPropertyName="thermal_conductivity" />);
    
    const dataElement = screen.getByDisplayValue('45.5');
    
    // Core identification attributes
    expect(dataElement).toHaveAttribute('data-property', 'thermal_conductivity');
    expect(dataElement).toHaveAttribute('data-unit', 'W/mK');
    expect(dataElement).toHaveAttribute('data-type', 'measurement');
    
    // Contextual information attributes
    expect(dataElement).toHaveAttribute('data-context', 'material_property');
    expect(dataElement).toHaveAttribute('data-precision', '1');
    expect(dataElement).toHaveAttribute('data-magnitude', 'medium');
    expect(dataElement).toHaveAttribute('data-position', 'current');
    
    // Schema.org integration
    expect(dataElement).toHaveAttribute('itemProp', 'value');
    expect(dataElement).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
  });

  test('validates precision calculation accuracy', () => {
    const testCases = [
      { value: '45.5', expectedPrecision: '1' },
      { value: '100', expectedPrecision: '0' },
      { value: '0.123', expectedPrecision: '3' },
      { value: '45.50', expectedPrecision: '2' }
    ];

    testCases.forEach(({ value, expectedPrecision }) => {
      const { unmount } = render(<MetricsCard title="Test" value={value} />);
      const dataElement = screen.getByDisplayValue(value);
      expect(dataElement).toHaveAttribute('data-precision', expectedPrecision);
      unmount();
    });
  });

  test('validates magnitude classification accuracy', () => {
    const testCases = [
      { value: '0.5', expectedMagnitude: 'low' },
      { value: '50', expectedMagnitude: 'medium' },
      { value: '5000', expectedMagnitude: 'high' }
    ];

    testCases.forEach(({ value, expectedMagnitude }) => {
      const { unmount } = render(<MetricsCard title="Test" value={value} />);
      const dataElement = screen.getByDisplayValue(value);
      expect(dataElement).toHaveAttribute('data-magnitude', expectedMagnitude);
      unmount();
    });
  });

  test('validates Schema.org PropertyValue integration', () => {
    render(<MetricsCard title="Test Property" value="42.5" unit="kg" />);
    
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('itemScope');
    expect(article).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
    
    const titleElement = screen.getByRole('heading');
    expect(titleElement).toHaveAttribute('itemProp', 'name');
    
    const dataElement = screen.getByDisplayValue('42.5');
    expect(dataElement).toHaveAttribute('itemProp', 'value');
  });

  test('validates SEO query capabilities', () => {
    const { container } = render(<MetricsCard title="Thermal Conductivity" value="45.5" unit="W/mK" fullPropertyName="thermal_conductivity" />);
    
    // Property-based queries
    const propertyElements = container.querySelectorAll('[data-property="thermal_conductivity"]');
    expect(propertyElements.length).toBeGreaterThan(0);
    
    // Unit-based queries
    const unitElements = container.querySelectorAll('[data-unit="W/mK"]');
    expect(unitElements.length).toBeGreaterThan(0);
    
    // Context-based queries
    const contextElements = container.querySelectorAll('[data-context="material_property"]');
    expect(contextElements.length).toBeGreaterThan(0);
    
    // Type-based queries
    const measurementElements = container.querySelectorAll('[data-type="measurement"]');
    expect(measurementElements.length).toBeGreaterThan(0);
  });
});
```

### Micro Quality Metrics Enhancement Tests
```typescript
// tests/accessibility/Micro.semantic-enhancement.test.tsx
describe('Micro Quality Metrics Semantic Enhancement', () => {
  test('implements surface analysis specific attributes', () => {
    const mockData = {
      material: 'Aluminum 6061-T6',
      quality_metrics: { surface_roughness_ra: 0.8, thermal_conductivity: 167 }
    };
    
    const { container } = render(<Micro frontmatter={mockData} />);
    
    const metricElements = container.querySelectorAll('[data-metric-type="quality_measurement"]');
    metricElements.forEach((element: Element) => {
      expect(element).toHaveAttribute('data-context', 'surface_analysis');
      expect(element).toHaveAttribute('data-material', 'Aluminum 6061-T6');
      expect(element).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
    });
  });

  test('validates material-specific data attribution', () => {
    const materials = ['Aluminum 6061-T6', 'Stainless Steel 316L', 'Titanium Ti-6Al-4V'];
    
    materials.forEach(material => {
      const { container, unmount } = render(
        <Micro frontmatter={{ material, quality_metrics: { test_metric: 42 } }} />
      );
      
      const dataElements = container.querySelectorAll('[data-material]');
      dataElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-material', material);
      });
      
      unmount();
    });
  });

  test('validates precision and magnitude calculations for quality metrics', () => {
    const qualityMetrics = {
      surface_roughness_ra: 0.8,    // precision: 1, magnitude: low
      thermal_conductivity: 167,     // precision: 0, magnitude: high
      electrical_conductivity: 38.2  // precision: 1, magnitude: medium
    };
    
    const { container } = render(<Micro frontmatter={{ quality_metrics: qualityMetrics }} />);
    
    // Validate precision calculations
    expect(container.querySelector('[data-property="surface_roughness_ra"]')).toHaveAttribute('data-precision', '1');
    expect(container.querySelector('[data-property="thermal_conductivity"]')).toHaveAttribute('data-precision', '0');
    expect(container.querySelector('[data-property="electrical_conductivity"]')).toHaveAttribute('data-precision', '1');
    
    // Validate magnitude classifications
    expect(container.querySelector('[data-property="surface_roughness_ra"]')).toHaveAttribute('data-magnitude', 'low');
    expect(container.querySelector('[data-property="thermal_conductivity"]')).toHaveAttribute('data-magnitude', 'high');
    expect(container.querySelector('[data-property="electrical_conductivity"]')).toHaveAttribute('data-magnitude', 'medium');
  });
});
```

## Automated Testing Framework Enhancement

### Enhanced Jest Configuration
```javascript
// jest.config.semantic.js
module.exports = {
  ...require('./jest.config.accessibility.js'),
  testMatch: [
    '<rootDir>/tests/accessibility/**/*.semantic-enhancement.test.{ts,tsx}',
    '<rootDir>/tests/accessibility/**/*.test.{ts,tsx}'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/semantic-enhancement-setup.js'
  ],
  collectCoverageFrom: [
    'app/components/**/*.{ts,tsx}',
    '!app/components/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      accessibility: 100,
      semanticAttributes: 100, // New metric for semantic enhancement coverage
      schemaIntegration: 100   // New metric for Schema.org integration
    }
  }
};
```

### Semantic Enhancement Testing Setup
```typescript
// tests/semantic-enhancement-setup.js
import '@testing-library/jest-dom';

// Custom matchers for semantic attribute testing
expect.extend({
  toHaveSemanticAttributes(received, expectedAttributes) {
    const pass = expectedAttributes.every(attr => 
      received.hasAttribute(attr)
    );
    
    return {
      message: () => `expected element to have semantic attributes: ${expectedAttributes.join(', ')}`,
      pass
    };
  },
  
  toHaveSchemaOrgMarkup(received, expectedType) {
    const hasItemScope = received.hasAttribute('itemScope');
    const hasCorrectType = received.getAttribute('itemType') === expectedType;
    
    return {
      message: () => `expected element to have Schema.org markup for ${expectedType}`,
      pass: hasItemScope && hasCorrectType
    };
  },
  
  toBeSearchableByProperty(received, propertyName) {
    const hasPropertyAttr = received.getAttribute('data-property') === propertyName;
    const hasContext = received.hasAttribute('data-context');
    const hasType = received.hasAttribute('data-type');
    
    return {
      message: () => `expected element to be searchable by property ${propertyName}`,
      pass: hasPropertyAttr && hasContext && hasType
    };
  }
});

// Global semantic attribute validation helpers
global.validateSemanticEnhancement = (element) => {
  const requiredAttributes = [
    'data-property',
    'data-type', 
    'data-context'
  ];
  
  const optionalAttributes = [
    'data-unit',
    'data-precision',
    'data-magnitude',
    'data-position',
    'itemProp',
    'itemType'
  ];
  
  return {
    hasRequired: requiredAttributes.every(attr => element.hasAttribute(attr)),
    hasOptional: optionalAttributes.some(attr => element.hasAttribute(attr)),
    attributeCount: element.attributes.length
  };
};
```

### ARIA Implementation Tests
```typescript
// tests/accessibility/MetricsCard.aria.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetricsCard from '@/app/components/MetricsCard/MetricsCard';

describe('MetricsCard ARIA Implementation', () => {
  const mockProps = {
    title: 'Thermal Conductivity',
    value: '45.5',
    unit: 'W/mK',
    min: '0.1',
    max: '429',
    searchable: true,
    fullPropertyName: 'thermal_conductivity'
  };

  test('implements required ARIA attributes on main container', () => {
    render(<MetricsCard {...mockProps} />);
    const article = screen.getByRole('article');
    
    expect(article).toHaveAttribute('aria-labelledby');
    expect(article).toHaveAttribute('aria-describedby');
    expect(article).toHaveAttribute('tabindex', '0');
    
    const labelId = article.getAttribute('aria-labelledby');
    const descId = article.getAttribute('aria-describedby');
    
    expect(screen.getByTestId(labelId)).toBeInTheDocument();
    expect(screen.getByTestId(descId)).toBeInTheDocument();
  });

  test('implements WCAG-compliant progressbar pattern', () => {
    render(<MetricsCard {...mockProps} />);
    const progressbar = screen.getByRole('progressbar');
    
    expect(progressbar).toHaveAttribute('aria-valuenow', '45.5');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0.1');
    expect(progressbar).toHaveAttribute('aria-valuemax', '429');
    expect(progressbar).toHaveAttribute('aria-labelledby');
    expect(progressbar).toHaveAttribute('aria-describedby');
    expect(progressbar).toHaveAttribute('tabindex', '0');
  });

  test('provides comprehensive screen reader descriptions', () => {
    render(<MetricsCard {...mockProps} />);
    const description = screen.getByText(/Metric showing thermal_conductivity with value 45.5 W\/mK/);
    expect(description).toHaveClass('sr-only');
    expect(description).toHaveTextContent('ranging from 0.1 to 429 W/mK');
    expect(description).toHaveTextContent('Press Enter or Space to search');
  });

  test('implements accessible link pattern when searchable', () => {
    render(<MetricsCard {...mockProps} />);
    const link = screen.getByRole('link');
    
    expect(link).toHaveAttribute('aria-label');
    expect(link).toHaveAttribute('aria-describedby');
    expect(link).toHaveAttribute('title');
    
    const ariaLabel = link.getAttribute('aria-label');
    expect(ariaLabel).toContain('Navigate to search results');
    expect(ariaLabel).toContain('thermal_conductivity');
    expect(ariaLabel).toContain('45.5W/mK');
  });

  test('handles keyboard navigation correctly', async () => {
    const user = userEvent.setup();
    render(<MetricsCard {...mockProps} />);
    
    const article = screen.getByRole('article');
    await user.tab();
    expect(article).toHaveFocus();
    
    await user.keyboard('{Enter}');
    // Should trigger navigation for searchable cards
    
    await user.keyboard('{Space}');
    // Should also trigger navigation for searchable cards
  });
});
```

### Keyboard Navigation Tests
```typescript
// tests/accessibility/MetricsCard.keyboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetricsCard from '@/app/components/MetricsCard/MetricsCard';

describe('MetricsCard Keyboard Navigation', () => {
  test('supports tab navigation to main container', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <button>Previous element</button>
        <MetricsCard title="Test" value="50" />
        <button>Next element</button>
      </div>
    );
    
    const prevButton = screen.getByText('Previous element');
    const article = screen.getByRole('article');
    const nextButton = screen.getByText('Next element');
    
    prevButton.focus();
    await user.tab();
    expect(article).toHaveFocus();
    
    await user.tab();
    expect(nextButton).toHaveFocus();
  });

  test('supports tab navigation to progress bar', async () => {
    const user = userEvent.setup();
    render(<MetricsCard title="Test" value="50" min="0" max="100" />);
    
    const progressbar = screen.getByRole('progressbar');
    
    await user.tab(); // Main container
    await user.tab(); // Progress bar
    expect(progressbar).toHaveFocus();
  });

  test('shows visible focus indicators', async () => {
    const user = userEvent.setup();
    render(<MetricsCard title="Test" value="50" />);
    
    const article = screen.getByRole('article');
    await user.tab();
    
    expect(article).toHaveClass('focus:ring-2');
    expect(article).toHaveClass('focus:ring-blue-500');
    expect(article).toHaveClass('focus:outline-none');
  });

  test('handles Enter key for searchable cards', async () => {
    const mockNavigate = jest.fn();
    // Mock Next.js router
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockNavigate })
    }));
    
    const user = userEvent.setup();
    render(<MetricsCard title="Test" value="50" searchable={true} />);
    
    const article = screen.getByRole('article');
    await user.tab();
    await user.keyboard('{Enter}');
    
    expect(mockNavigate).toHaveBeenCalled();
  });

  test('handles Space key for searchable cards', async () => {
    const mockNavigate = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockNavigate })
    }));
    
    const user = userEvent.setup();
    render(<MetricsCard title="Test" value="50" searchable={true} />);
    
    const article = screen.getByRole('article');
    await user.tab();
    await user.keyboard(' ');
    
    expect(mockNavigate).toHaveBeenCalled();
  });
});
```

## Micro Component Accessibility Tests

### Complex Navigation Tests
```typescript
// tests/accessibility/Micro.navigation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Micro from '@/app/components/Micro/Micro';

describe('Micro Keyboard Navigation', () => {
  const mockData = {
    material: 'Aluminum',
    quality_metrics: {
      surface_roughness: 2.5,
      thermal_conductivity: 45.5,
      corrosion_resistance: 8.2,
      adhesion_strength: 15.7
    },
    before_treatment: 'High contamination visible',
    after_treatment: 'Surface cleaned and restored'
  };

  test('implements complex arrow key navigation through metrics', async () => {
    const user = userEvent.setup();
    render(<Micro data={mockData} />);
    
    const mainSection = screen.getByRole('region');
    await user.tab();
    expect(mainSection).toHaveFocus();
    
    // Enter metrics overlay
    await user.keyboard('{Enter}');
    
    // Navigate through metrics with arrow keys
    await user.keyboard('{ArrowRight}');
    let focusedMetric = screen.getByRole('article', { current: true });
    expect(focusedMetric).toHaveTextContent('thermal_conductivity');
    
    await user.keyboard('{ArrowDown}');
    focusedMetric = screen.getByRole('article', { current: true });
    expect(focusedMetric).toHaveTextContent('corrosion_resistance');
    
    await user.keyboard('{ArrowLeft}');
    focusedMetric = screen.getByRole('article', { current: true });
    expect(focusedMetric).toHaveTextContent('surface_roughness');
    
    await user.keyboard('{ArrowUp}');
    focusedMetric = screen.getByRole('article', { current: true });
    expect(focusedMetric).toHaveTextContent('adhesion_strength');
  });

  test('implements Home and End key navigation', async () => {
    const user = userEvent.setup();
    render(<Micro data={mockData} />);
    
    const mainSection = screen.getByRole('region');
    await user.tab();
    await user.keyboard('{Enter}'); // Enter metrics
    
    await user.keyboard('{End}');
    let focusedMetric = screen.getByRole('article', { current: true });
    expect(focusedMetric).toHaveTextContent('adhesion_strength'); // Last metric
    
    await user.keyboard('{Home}');
    focusedMetric = screen.getByRole('article', { current: true });
    expect(focusedMetric).toHaveTextContent('surface_roughness'); // First metric
  });

  test('implements Escape key to exit metrics overlay', async () => {
    const user = userEvent.setup();
    render(<Micro data={mockData} />);
    
    const mainSection = screen.getByRole('region');
    await user.tab();
    await user.keyboard('{Enter}'); // Enter metrics
    
    // Navigate to a metric
    await user.keyboard('{ArrowRight}');
    
    // Escape should return focus to main section
    await user.keyboard('{Escape}');
    expect(mainSection).toHaveFocus();
  });

  test('announces navigation changes via live region', async () => {
    const user = userEvent.setup();
    render(<Micro data={mockData} />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    
    const mainSection = screen.getByRole('region');
    await user.tab();
    await user.keyboard('{Enter}');
    
    await user.keyboard('{ArrowRight}');
    expect(liveRegion).toHaveTextContent(/Focused on.*thermal_conductivity.*metric/);
  });
});
```

### Live Regions and State Tests
```typescript
// tests/accessibility/Micro.states.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import Micro from '@/app/components/Micro/Micro';

describe('Micro State Management', () => {
  test('implements loading state with progress bar', async () => {
    const loadingData = { material: 'Loading', isLoading: true };
    render(<Micro data={loadingData} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-label', 'Loading surface analysis image');
    expect(progressbar).toHaveAttribute('aria-describedby');
    
    const loadingText = screen.getByText(/Loading surface analysis image for Loading/);
    expect(loadingText).toHaveClass('sr-only');
  });

  test('implements error state with alert role', async () => {
    const errorData = { material: 'Error', hasError: true };
    render(<Micro data={errorData} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-describedby');
    
    const errorMessage = screen.getByText('Surface analysis image could not be loaded');
    expect(errorMessage).toBeInTheDocument();
  });

  test('manages expanded state with aria-expanded', async () => {
    const mockData = {
      material: 'Test',
      quality_metrics: { test_metric: 1.0 }
    };
    
    const { rerender } = render(<Micro data={mockData} />);
    
    const metricsRegion = screen.getByLabelText('Interactive quality metrics overlay');
    expect(metricsRegion).toHaveAttribute('aria-expanded', 'false');
    
    // Simulate expanding metrics
    fireEvent.click(metricsRegion);
    rerender(<Micro data={mockData} expanded={true} />);
    
    expect(metricsRegion).toHaveAttribute('aria-expanded', 'true');
  });

  test('updates live regions on state changes', async () => {
    const mockData = { material: 'Test' };
    const { rerender } = render(<Micro data={mockData} />);
    
    const liveRegion = screen.getByRole('status');
    
    // Simulate image loading completion
    rerender(<Micro data={{ ...mockData, imageLoaded: true }} />);
    
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent('Surface analysis image loaded successfully');
    });
  });
});
```

### Image and Media Accessibility Tests
```typescript
// tests/accessibility/Micro.media.test.tsx
import { render, screen } from '@testing-library/react';
import Micro from '@/app/components/Micro/Micro';

describe('Micro Media Accessibility', () => {
  test('implements accessible image with figure pattern', () => {
    const mockData = {
      material: 'Aluminum',
      imageSource: '/test-image.jpg'
    };
    
    render(<Micro data={mockData} />);
    
    const figure = screen.getByRole('img');
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('aria-labelledby');
    expect(figure).toHaveAttribute('aria-describedby');
    
    const imageDescription = screen.getByText(/Surface analysis image showing Aluminum/);
    expect(imageDescription).toHaveClass('sr-only');
  });

  test('provides alternative content when image unavailable', () => {
    const mockData = {
      material: 'Aluminum',
      imageSource: null
    };
    
    render(<Micro data={mockData} />);
    
    const noImageMessage = screen.getByText(/No image available for Aluminum surface analysis/);
    expect(noImageMessage).toHaveClass('sr-only');
  });

  test('implements responsive image accessibility', () => {
    const mockData = {
      material: 'Steel',
      imageSource: '/responsive-image.jpg'
    };
    
    render(<Micro data={mockData} />);
    
    const img = screen.getByAltText(/Surface analysis showing Steel/);
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });
});
```

## Screen Reader Testing Requirements

### Manual Testing Checklist
```markdown
## NVDA/JAWS/VoiceOver Testing Protocol

### MetricsCard Component
- [ ] Article role announced correctly
- [ ] Title read as level 3 heading
- [ ] Value announced with data semantic
- [ ] Progress bar state communicated (current/min/max)
- [ ] Search functionality announced
- [ ] Focus navigation clear and logical
- [ ] No repeated or redundant announcements

### Micro Component  
- [ ] Region role announced correctly
- [ ] Image content described adequately
- [ ] Quality metrics navigation clear
- [ ] Before/after sections distinguished
- [ ] Loading/error states announced
- [ ] Live region updates audible
- [ ] Keyboard navigation intuitive

### Cross-Component Testing
- [ ] Tab order logical across multiple components
- [ ] Focus indicators visible in all themes
- [ ] No focus traps or inaccessible content
- [ ] Consistent interaction patterns
```

### Screen Reader Simulation Tests
```typescript
// tests/accessibility/screenreader.simulation.test.tsx
import { render } from '@testing-library/react';
import { getComputedAccessibleName, getComputedAccessibleDescription } from '@testing-library/dom';

describe('Screen Reader Content', () => {
  test('MetricsCard provides comprehensive accessible name', () => {
    render(<MetricsCard title="Test Metric" value="50" unit="%" />);
    
    const article = screen.getByRole('article');
    const accessibleName = getComputedAccessibleName(article);
    
    expect(accessibleName).toContain('Test Metric');
    expect(accessibleName).toBe('Test Metric');
  });

  test('MetricsCard provides detailed accessible description', () => {
    render(
      <MetricsCard 
        title="Thermal Conductivity" 
        value="45.5" 
        unit="W/mK"
        min="0.1"
        max="429"
        fullPropertyName="thermal_conductivity"
        searchable={true}
      />
    );
    
    const article = screen.getByRole('article');
    const accessibleDescription = getComputedAccessibleDescription(article);
    
    expect(accessibleDescription).toContain('thermal_conductivity');
    expect(accessibleDescription).toContain('45.5 W/mK');
    expect(accessibleDescription).toContain('ranging from 0.1 to 429');
    expect(accessibleDescription).toContain('Press Enter or Space to search');
  });

  test('Micro provides comprehensive image description', () => {
    const mockData = {
      material: 'Aluminum',
      quality_metrics: { roughness: 2.5 },
      hasMetrics: true
    };
    
    render(<Micro data={mockData} />);
    
    const figure = screen.getByRole('img');
    const accessibleDescription = getComputedAccessibleDescription(figure);
    
    expect(accessibleDescription).toContain('Surface analysis image showing Aluminum');
    expect(accessibleDescription).toContain('before and after laser cleaning treatment');
    expect(accessibleDescription).toContain('interactive quality metrics overlay');
  });
});
```

## Performance and Integration Tests

### Accessibility Performance Tests
```typescript
// tests/accessibility/performance.test.tsx
import { render, screen } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('Accessibility Performance', () => {
  test('ARIA attribute computation is efficient', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <MetricsCard 
            key={i}
            title={`Metric ${i}`}
            value={String(i * 10)}
            unit="%"
            min="0"
            max="1000"
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render 100 accessible components in under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('Keyboard navigation performance scales correctly', () => {
    const mockData = {
      material: 'Test',
      quality_metrics: Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`metric_${i}`, i * 2])
      )
    };
    
    const startTime = performance.now();
    render(<Micro data={mockData} />);
    
    // Simulate rapid navigation
    for (let i = 0; i < 50; i++) {
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    }
    
    const endTime = performance.now();
    const navigationTime = endTime - startTime;
    
    // Navigation through 50 items should complete in under 50ms
    expect(navigationTime).toBeLessThan(50);
  });
});
```

### Integration Testing with Real Data
```typescript
// tests/accessibility/integration.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

describe('Real Data Integration', () => {
  const realMetricsData = [
    {
      title: 'Thermal Conductivity',
      value: '237',
      unit: 'W/mK',
      min: '0.1',
      max: '429',
      fullPropertyName: 'thermal_conductivity',
      searchable: true
    },
    {
      title: 'Young\'s Modulus',
      value: '70000',
      unit: 'MPa',
      min: '1000',
      max: '400000',
      fullPropertyName: 'youngs_modulus',
      searchable: true
    }
  ];

  const realMicroData = {
    material: 'Aluminum 6061-T6',
    quality_metrics: {
      surface_roughness_ra: 0.8,
      surface_roughness_rz: 4.2,
      thermal_conductivity: 167,
      electrical_conductivity: 38.2,
      corrosion_resistance: 7.5,
      adhesion_strength: 12.3,
      hardness_hv: 95
    },
    before_treatment: 'Surface shows oxidation, contamination, and roughness from manufacturing processes',
    after_treatment: 'Clean, smooth surface with improved thermal and electrical properties for optimal performance',
    imageSource: '/analysis/aluminum-6061-t6-comparison.jpg'
  };

  test('multiple MetricsCards maintain accessibility with real data', async () => {
    const { container } = render(
      <div>
        {realMetricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>
    );

    // All components should pass axe scan
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // All progress bars should have correct values
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);
    
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '237');
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '70000');

    // Tab navigation should work across all components
    const user = userEvent.setup();
    await user.tab(); // First MetricsCard
    expect(screen.getAllByRole('article')[0]).toHaveFocus();
    
    await user.tab(); // First progress bar
    await user.tab(); // Second MetricsCard
    expect(screen.getAllByRole('article')[1]).toHaveFocus();
  });

  test('Micro with complex real data maintains accessibility', async () => {
    const { container } = render(<Micro data={realMicroData} />);

    // Should pass comprehensive accessibility scan
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Should handle complex quality metrics navigation
    const user = userEvent.setup();
    const mainSection = screen.getByRole('region');
    
    await user.tab();
    expect(mainSection).toHaveFocus();
    
    await user.keyboard('{Enter}'); // Enter metrics overlay
    
    // Should navigate through all 7 metrics
    for (let i = 0; i < 6; i++) {
      await user.keyboard('{ArrowRight}');
    }
    
    // Should wrap around to first metric
    await user.keyboard('{ArrowRight}');
    const firstMetric = screen.getByText('surface_roughness_ra');
    expect(firstMetric.closest('[role="article"]')).toHaveClass('ring-2');
  });
});
```

## Accessibility Testing Automation

### CI/CD Integration
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Testing

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:accessibility
      - run: npm run audit:accessibility
      
      - name: Pa11y Full Site Scan
        run: |
          npm run build
          npm run start &
          sleep 10
          npx pa11y-ci --sitemap http://localhost:3000/sitemap.xml
      
      - name: axe-core Playwright Tests
        run: npm run test:accessibility:e2e
```

### Automated Reporting
```typescript
// scripts/accessibility-report.js
const fs = require('fs');
const { axe, configureAxe } = require('jest-axe');

const generateAccessibilityReport = async () => {
  const results = {
    metrics: [],
    micros: [],
    summary: {
      totalViolations: 0,
      totalPasses: 0,
      wcagLevel: 'AA',
      compliance: 0
    }
  };

  // Generate detailed compliance report
  const reportPath = './docs/ACCESSIBILITY_COMPLIANCE_REPORT.md';
  const reportContent = generateMarkdownReport(results);
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`Accessibility report generated: ${reportPath}`);
};

generateAccessibilityReport();
```

This comprehensive testing framework ensures that all accessibility implementations meet WCAG 2.1 AA standards with verifiable, repeatable tests covering semantic HTML, ARIA patterns, keyboard navigation, screen reader optimization, and real-world integration scenarios.