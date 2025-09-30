// tests/accessibility/MetricsCard.semantic-enhancement.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricsCard } from '../../app/components/MetricsCard/MetricsCard';

describe('MetricsCard Semantic Enhancement Tests', () => {
  const mockProps = {
    title: 'Thermal Conductivity',
    value: '45.5',
    unit: 'W/mK',
    min: '0.1',
    max: '429',
    searchable: true,
    fullPropertyName: 'thermal_conductivity',
    key: 'test-metric'
  };

  describe('Maximum Specificity Data Attributes', () => {
    test('implements comprehensive data attributes on main value element', () => {
      render(<MetricsCard {...mockProps} />);
      
      // Find the main data element (in progress bar context)
      const dataElements = screen.getAllByDisplayValue('45.5');
      const mainDataElement = dataElements.find(el => 
        el.getAttribute('data-type') === 'measurement'
      );
      
      expect(mainDataElement).toHaveAttribute('value', '45.5');
      expect(mainDataElement).toHaveAttribute('data-property', 'thermal_conductivity');
      expect(mainDataElement).toHaveAttribute('data-unit', 'W/mK');
      expect(mainDataElement).toHaveAttribute('data-type', 'measurement');
      expect(mainDataElement).toHaveAttribute('data-context', 'material_property');
      expect(mainDataElement).toHaveAttribute('data-precision', '1');
      expect(mainDataElement).toHaveAttribute('data-magnitude', 'medium');
      expect(mainDataElement).toHaveAttribute('data-position', 'current');
      expect(mainDataElement).toHaveAttribute('itemProp', 'value');
      expect(mainDataElement).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
    });

    test('implements range-specific attributes on min/max values', () => {
      render(<MetricsCard {...mockProps} />);
      
      const minDataElement = screen.getByDisplayValue('0.1');
      expect(minDataElement).toHaveAttribute('data-type', 'range_minimum');
      expect(minDataElement).toHaveAttribute('data-position', 'minimum');
      expect(minDataElement).toHaveAttribute('data-precision', '1');
      expect(minDataElement).toHaveAttribute('data-magnitude', 'low');
      expect(minDataElement).toHaveAttribute('itemProp', 'minValue');
      
      const maxDataElement = screen.getByDisplayValue('429');
      expect(maxDataElement).toHaveAttribute('data-type', 'range_maximum');
      expect(maxDataElement).toHaveAttribute('data-position', 'maximum');
      expect(maxDataElement).toHaveAttribute('data-precision', '0');
      expect(maxDataElement).toHaveAttribute('data-magnitude', 'high');
      expect(maxDataElement).toHaveAttribute('itemProp', 'maxValue');
    });

    test('calculates precision correctly for different value formats', () => {
      const testCases = [
        { value: '45.5', expectedPrecision: '1' },
        { value: '100', expectedPrecision: '0' },
        { value: '0.123', expectedPrecision: '3' },
        { value: '45.50', expectedPrecision: '2' }
      ];

      testCases.forEach(({ value, expectedPrecision }) => {
        const { unmount } = render(
          <MetricsCard {...mockProps} value={value} />
        );
        
        const dataElement = screen.getByDisplayValue(value);
        expect(dataElement).toHaveAttribute('data-precision', expectedPrecision);
        
        unmount();
      });
    });

    test('calculates magnitude correctly for different value ranges', () => {
      const testCases = [
        { value: '0.5', expectedMagnitude: 'low' },
        { value: '50', expectedMagnitude: 'medium' },
        { value: '5000', expectedMagnitude: 'high' }
      ];

      testCases.forEach(({ value, expectedMagnitude }) => {
        const { unmount } = render(
          <MetricsCard {...mockProps} value={value} />
        );
        
        const dataElement = screen.getByDisplayValue(value);
        expect(dataElement).toHaveAttribute('data-magnitude', expectedMagnitude);
        
        unmount();
      });
    });
  });

  describe('Component-Level Semantic Attributes', () => {
    test('implements comprehensive article-level attributes', () => {
      render(<MetricsCard {...mockProps} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('data-component', 'metrics-card');
      expect(article).toHaveAttribute('data-property', 'thermal_conductivity');
      expect(article).toHaveAttribute('data-searchable', 'true');
      expect(article).toHaveAttribute('data-has-range', 'true');
      expect(article).toHaveAttribute('data-unit', 'W/mK');
      expect(article).toHaveAttribute('data-value', '45.5');
      expect(article).toHaveAttribute('itemScope');
      expect(article).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
    });

    test('implements progress bar semantic attributes', () => {
      render(<MetricsCard {...mockProps} />);
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('data-property', 'thermal_conductivity');
      expect(progressbar).toHaveAttribute('data-percentage', '11'); // (45.5-0.1)/(429-0.1) * 100
      expect(progressbar).toHaveAttribute('data-component', 'progress-bar');
      expect(progressbar).toHaveAttribute('itemProp', 'value');
    });

    test('implements title semantic attributes', () => {
      render(<MetricsCard {...mockProps} />);
      
      const title = screen.getByRole('heading', { level: 4 });
      expect(title).toHaveAttribute('data-property', 'thermal_conductivity');
      expect(title).toHaveAttribute('data-component', 'metric-title');
      expect(title).toHaveAttribute('itemProp', 'name');
    });
  });

  describe('Schema.org Integration', () => {
    test('implements complete PropertyValue schema', () => {
      render(<MetricsCard {...mockProps} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('itemScope');
      expect(article).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
      
      // Check that child elements have appropriate itemProp attributes
      const titleElement = screen.getByRole('heading', { level: 4 });
      expect(titleElement).toHaveAttribute('itemProp', 'name');
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('itemProp', 'value');
    });

    test('supports structured data extraction', () => {
      const { container } = render(<MetricsCard {...mockProps} />);
      
      // Test that structured data can be extracted programmatically
      const schemaElement = container.querySelector('[itemScope][itemType*="PropertyValue"]');
      expect(schemaElement).toBeInTheDocument();
      
      const nameElement = schemaElement?.querySelector('[itemProp="name"]');
      expect(nameElement).toHaveTextContent('Thermal Conductivity');
      
      const valueElements = schemaElement?.querySelectorAll('[itemProp="value"]');
      expect(valueElements?.length).toBeGreaterThan(0);
    });
  });

  describe('SEO and Machine Readability', () => {
    test('provides comprehensive property identification', () => {
      const { container } = render(<MetricsCard {...mockProps} />);
      
      // All data elements should have consistent property identification
      const dataElements = container.querySelectorAll('data[data-property="thermal_conductivity"]');
      expect(dataElements.length).toBeGreaterThan(0);
      
      dataElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-unit', 'W/mK');
        expect(element).toHaveAttribute('data-context', 'material_property');
      });
    });

    test('enables property-based queries through attributes', () => {
      const { container } = render(<MetricsCard {...mockProps} />);
      
      // Test that elements can be queried by property type
      const thermalConductivityElements = container.querySelectorAll('[data-property="thermal_conductivity"]');
      expect(thermalConductivityElements.length).toBeGreaterThan(0);
      
      // Test that elements can be queried by measurement type
      const measurementElements = container.querySelectorAll('[data-type="measurement"]');
      expect(measurementElements.length).toBeGreaterThan(0);
      
      // Test that elements can be queried by context
      const materialPropertyElements = container.querySelectorAll('[data-context="material_property"]');
      expect(materialPropertyElements.length).toBeGreaterThan(0);
    });

    test('supports unit-based queries', () => {
      const { container } = render(<MetricsCard {...mockProps} />);
      
      const unitElements = container.querySelectorAll('[data-unit="W/mK"]');
      expect(unitElements.length).toBeGreaterThan(0);
      
      unitElements.forEach(element => {
        expect(element).toHaveAttribute('data-property', 'thermal_conductivity');
      });
    });
  });

  describe('Conditional Enhancement', () => {
    test('handles missing fullPropertyName gracefully', () => {
      const propsWithoutFullName = { 
        ...mockProps, 
        fullPropertyName: undefined 
      };
      
      render(<MetricsCard {...propsWithoutFullName} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('data-property', 'thermal_conductivity'); // Should use cleaned title
    });

    test('handles non-searchable cards appropriately', () => {
      render(<MetricsCard {...mockProps} searchable={false} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('data-searchable', 'false');
      expect(article).toHaveAttribute('tabindex', '-1');
    });

    test('handles cards without range data', () => {
      const propsWithoutRange = { 
        ...mockProps, 
        min: undefined, 
        max: undefined 
      };
      
      render(<MetricsCard {...propsWithoutRange} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('data-has-range', 'false');
      
      // Should not have min/max data elements
      expect(screen.queryByDisplayValue('0.1')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('429')).not.toBeInTheDocument();
    });
  });

  describe('Performance Impact Validation', () => {
    test('renders enhanced markup efficiently', () => {
      const startTime = performance.now();
      
      render(<MetricsCard {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Enhanced markup should still render quickly
      expect(renderTime).toBeLessThan(50); // 50ms threshold
    });

    test('maintains reasonable markup size', () => {
      const { container } = render(<MetricsCard {...mockProps} />);
      
      const htmlSize = container.innerHTML.length;
      
      // Enhanced markup should be under reasonable size limit
      expect(htmlSize).toBeLessThan(5000); // 5KB threshold for single component
    });
  });
});