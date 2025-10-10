// tests/accessibility/Caption.semantic-enhancement.test.tsx
import { render, screen, waitFor, act } from '@testing-library/react';
import { Caption } from '../../app/components/Caption/Caption';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn((element) => {
    // Immediately trigger the callback with isIntersecting: true
    setTimeout(() => {
      const callback = mockIntersectionObserver.mock.calls[mockIntersectionObserver.mock.calls.length - 1][0];
      if (callback) {
        callback([{ isIntersecting: true, target: element }]);
      }
    }, 0);
  }),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver as any;

// Mock Next.js Image component
jest.mock('next/image', () => {
  const mockReact = require('react');
  
  // Define a mock image component that properly triggers onLoad
  function MockImage({ src, alt, onLoad, onLoadStart, onError, priority, fill, ...props }: any) {
    const imgRef = mockReact.useRef(null);
    
    // Use useEffect to trigger load events after mounting
    mockReact.useEffect(() => {
      console.log('[MockImage] useEffect running, onLoad:', !!onLoad, 'onLoadStart:', !!onLoadStart);
      
      // Trigger onLoadStart first
      if (typeof onLoadStart === 'function') {
        console.log('[MockImage] Calling onLoadStart');
        onLoadStart();
      }
      
      // Then trigger onLoad after a brief delay to simulate loading
      if (typeof onLoad === 'function') {
        const timer = setTimeout(() => {
          console.log('[MockImage] Calling onLoad');
          onLoad();
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [onLoad, onLoadStart]);
    
    return mockReact.createElement('img', {
      ref: imgRef,
      src,
      alt,
      'data-testid': 'caption-image',
      ...props
    });
  }
  
  return {
    __esModule: true,
    default: MockImage,
  };
});

describe('Caption Semantic Enhancement Tests', () => {
  const mockData = {
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

  const mockProps = {
    frontmatter: {
      caption: mockData
    },
    config: {}
  };

  describe('Quality Metrics Semantic Enhancement', () => {
    test('implements comprehensive data attributes for quality metrics', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for metrics to render after image load with longer timeout
      await waitFor(() => {
        const metricDataElements = container.querySelectorAll('data[data-metric-type="quality_measurement"]');
        if (metricDataElements.length === 0) {
          // Debug: log the overlay div to see if metrics are conditionally rendered
          const overlay = container.querySelector('[aria-label="Interactive quality metrics overlay"]');
          console.log('Metrics overlay found:', !!overlay);
          console.log('Has quality metrics in data:', !!mockProps.frontmatter.caption.quality_metrics);
        }
        expect(metricDataElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
      
      // Find quality metric data elements
      const metricDataElements = container.querySelectorAll('data[data-metric-type="quality_measurement"]');
      expect(metricDataElements.length).toBe(7); // Number of quality metrics
      
      metricDataElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-metric-type', 'quality_measurement');
        expect(element).toHaveAttribute('data-context', 'surface_analysis');
        expect(element).toHaveAttribute('data-material', 'Aluminum 6061-T6');
        expect(element).toHaveAttribute('itemProp', 'value');
        expect(element).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
      });
    });

    test('calculates precision correctly for quality metrics', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check specific precision calculations
      const roughnessRaElement = container.querySelector('data[data-property="surface_roughness_ra"]');
      expect(roughnessRaElement).toHaveAttribute('data-precision', '1'); // 0.8 has 1 decimal place
      
      const thermalElement = container.querySelector('data[data-property="thermal_conductivity"]');
      expect(thermalElement).toHaveAttribute('data-precision', '0'); // 167 has 0 decimal places
      
      const roughnessRzElement = container.querySelector('data[data-property="surface_roughness_rz"]');
      expect(roughnessRzElement).toHaveAttribute('data-precision', '1'); // 4.2 has 1 decimal place
    });

    test('calculates magnitude correctly for quality metrics', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check magnitude classifications
      const roughnessElement = container.querySelector('data[data-property="surface_roughness_ra"]');
      expect(roughnessElement).toHaveAttribute('data-magnitude', 'low'); // 0.8 < 1
      
      const thermalElement = container.querySelector('data[data-property="thermal_conductivity"]');
      expect(thermalElement).toHaveAttribute('data-magnitude', 'high'); // 167 >= 100
      
      const electricalElement = container.querySelector('data[data-property="electrical_conductivity"]');
      expect(electricalElement).toHaveAttribute('data-magnitude', 'medium'); // 1 <= 38.2 < 100
    });

    test('provides consistent property naming', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const expectedProperties = [
        'surface_roughness_ra',
        'surface_roughness_rz',
        'thermal_conductivity',
        'electrical_conductivity',
        'corrosion_resistance',
        'adhesion_strength',
        'hardness_hv'
      ];
      
      expectedProperties.forEach(property => {
        const element = container.querySelector(`data[data-property="${property}"]`);
        expect(element).toBeInTheDocument();
        expect(element).toHaveAttribute('data-context', 'surface_analysis');
      });
    });
  });

  describe('Material Context Integration', () => {
    test('includes material information in data attributes', () => {
      const { container } = render(<Caption {...mockProps} />);
      
      const dataElements = container.querySelectorAll('data[data-material]');
      dataElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-material', 'Aluminum 6061-T6');
      });
    });

    test('handles different material names correctly', () => {
      const steelData = {
        ...mockData,
        material: 'Stainless Steel 316L'
      };
      
      const { container } = render(<Caption frontmatter={{ caption: steelData }} config={{}} />);
      
      const dataElements = container.querySelectorAll('data[data-material]');
      dataElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-material', 'Stainless Steel 316L');
      });
    });

    test('handles missing material gracefully', () => {
      const dataWithoutMaterial = { ...mockData };
      delete (dataWithoutMaterial as any).material;
      
      const { container } = render(<Caption frontmatter={{ caption: dataWithoutMaterial }} config={{}} />);
      
      const dataElements = container.querySelectorAll('data[data-material]');
      dataElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-material', 'unknown');
      });
    });
  });

  describe('Schema.org Integration for Surface Analysis', () => {
    test('implements structured data for surface analysis context', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check for Schema.org PropertyValue integration
      const schemaElements = container.querySelectorAll('[itemType="https://schema.org/PropertyValue"]');
      expect(schemaElements.length).toBeGreaterThan(0);
      
      schemaElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('itemProp', 'value');
      });
    });

    test('provides complete property value structure', () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Each metric should have value and property identification
      const metricArticles = container.querySelectorAll('[role="article"]');
      
      metricArticles.forEach((article: Element) => {
        const dataElement = article.querySelector('data[itemProp="value"]');
        if (dataElement) {
          expect(dataElement).toHaveAttribute('data-property');
          expect(dataElement).toHaveAttribute('data-context', 'surface_analysis');
        }
      });
    });
  });

  describe('SEO Enhancement for Surface Analysis', () => {
    test('enables surface analysis specific queries', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // All quality metrics should be queryable by surface analysis context
      const surfaceAnalysisElements = container.querySelectorAll('[data-context="surface_analysis"]');
      expect(surfaceAnalysisElements.length).toBe(7); // All quality metrics
      
      surfaceAnalysisElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-metric-type', 'quality_measurement');
      });
    });

    test('supports material-specific property searches', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should be able to query for aluminum-specific properties
      const aluminumElements = container.querySelectorAll('[data-material*="Aluminum"]');
      expect(aluminumElements.length).toBeGreaterThan(0);
      
      aluminumElements.forEach((element: Element) => {
        expect(element).toHaveAttribute('data-context', 'surface_analysis');
      });
    });

    test('enables precision-based filtering', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should be able to query by precision level
      const highPrecisionElements = container.querySelectorAll('[data-precision="1"]');
      const lowPrecisionElements = container.querySelectorAll('[data-precision="0"]');
      
      expect(highPrecisionElements.length).toBeGreaterThan(0);
      expect(lowPrecisionElements.length).toBeGreaterThan(0);
    });

    test('enables magnitude-based classification', async () => {
      const { container } = render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should have elements in different magnitude classes
      const lowMagnitudeElements = container.querySelectorAll('[data-magnitude="low"]');
      const mediumMagnitudeElements = container.querySelectorAll('[data-magnitude="medium"]');
      const highMagnitudeElements = container.querySelectorAll('[data-magnitude="high"]');
      
      expect(lowMagnitudeElements.length).toBeGreaterThan(0);
      expect(mediumMagnitudeElements.length).toBeGreaterThan(0);
      expect(highMagnitudeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Integration with Semantic Enhancement', () => {
    test('maintains accessibility while adding semantic attributes', async () => {
      render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should still have all accessibility features
      const mainSection = screen.getByRole('region');
      expect(mainSection).toHaveAttribute('aria-labelledby');
      expect(mainSection).toHaveAttribute('aria-describedby');
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      const metricsList = screen.getByRole('list');
      expect(metricsList).toHaveAttribute('aria-label', 'Quality metrics list');
    });

    test('screen reader descriptions include semantic context', async () => {
      render(<Caption {...mockProps} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Hidden descriptions should include comprehensive context
      const descriptions = screen.getAllByText(/Metric:.*Value:/);
      expect(descriptions.length).toBeGreaterThan(0);
      
      descriptions.forEach(desc => {
        expect(desc).toHaveClass('sr-only');
      });
    });
  });

  describe('Performance with Semantic Markup', () => {
    test('renders quality metrics efficiently', () => {
      const startTime = performance.now();
      
      render(<Caption {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render enhanced markup quickly
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });

    test('maintains reasonable markup size with enhancements', () => {
      const { container } = render(<Caption {...mockProps} />);
      
      const htmlSize = container.innerHTML.length;
      
      // Enhanced markup should be under reasonable size limit
      expect(htmlSize).toBeLessThan(15000); // 15KB threshold for complex component
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles empty quality metrics gracefully', () => {
      const dataWithoutMetrics = { ...mockData, quality_metrics: {} };
      
      const { container } = render(<Caption frontmatter={{ caption: dataWithoutMetrics }} config={{}} />);
      
      // Should not have any metric data elements
      const metricElements = container.querySelectorAll('[data-metric-type="quality_measurement"]');
      expect(metricElements.length).toBe(0);
    });

    test('handles null/undefined quality metric values', async () => {
      const dataWithNullValues = {
        ...mockData,
        quality_metrics: {
          surface_roughness_ra: null,
          thermal_conductivity: undefined,
          valid_metric: 45.5
        }
      };
      
      const { container } = render(<Caption frontmatter={{ caption: dataWithNullValues }} config={{}} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should only render valid metrics
      const metricElements = container.querySelectorAll('[data-metric-type="quality_measurement"]');
      expect(metricElements.length).toBe(1); // Only valid_metric
    });

    test('handles non-numeric quality metric values', async () => {
      const dataWithStringValues = {
        ...mockData,
        quality_metrics: {
          surface_condition: 'excellent',
          temperature_rating: 'high',
          numeric_value: 42.5
        }
      };
      
      const { container } = render(<Caption frontmatter={{ caption: dataWithStringValues }} config={{}} />);
      
      // Wait for image to load and metrics to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should handle string values appropriately
      const metricElements = container.querySelectorAll('[data-metric-type="quality_measurement"]');
      expect(metricElements.length).toBe(3);
      
      // String values should have different magnitude classification
      const excellentElement = container.querySelector('[data-property="surface_condition"]');
      expect(excellentElement).toHaveAttribute('data-magnitude', 'low'); // String values < 1
    });
  });
});