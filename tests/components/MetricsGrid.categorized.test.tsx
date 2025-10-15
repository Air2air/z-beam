/**
 * Test Suite: MetricsGrid Component - Categorized Properties
 * Testing the refactored MetricsGrid component with categorized material properties
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricsGrid } from '../../app/components/MetricsCard/MetricsGrid';
import { ArticleMetadata, PropertyCategory, PropertyValue } from '../../types/centralized';

// Mock SectionTitle component
jest.mock('../../app/components/SectionTitle/SectionTitle', () => ({
  SectionTitle: ({ title }: { title: string }) => <h2>{title}</h2>
}));

// Mock MetricsCard component
jest.mock('../../app/components/MetricsCard/MetricsCard', () => ({
  MetricsCard: ({ title, value, unit, color }: any) => (
    <div data-testid="metrics-card">
      <span data-testid="card-title">{title}</span>
      <span data-testid="card-value">{value}</span>
      <span data-testid="card-unit">{unit}</span>
      <span data-testid="card-color">{color}</span>
    </div>
  )
}));

// Mock getIntelligentSectionHeader
jest.mock('../../app/utils/gridTitleMapping', () => ({
  getIntelligentSectionHeader: () => 'Material Properties'
}));

describe('MetricsGrid - Categorized Properties', () => {
  const mockPropertyValue: PropertyValue = {
    value: 237,
    unit: 'W/m·K',
    confidence: 92,
    description: 'Thermal conductivity at 25°C',
    min: 6.0,
    max: 429.0
  };

  const mockThermalCategory: PropertyCategory = {
    label: 'Thermal Properties',
    description: 'Heat-related material characteristics',
    percentage: 29.1,
    properties: {
      thermalConductivity: {
        value: 237,
        unit: 'W/m·K',
        confidence: 92,
        description: 'Thermal conductivity at 25°C',
        min: 6.0,
        max: 429.0
      },
      meltingPoint: {
        value: 660,
        unit: '°C',
        confidence: 99,
        description: 'Solid-to-liquid phase transition',
        min: 30,
        max: 3422
      },
      specificHeat: {
        value: 900,
        unit: 'J/kg·K',
        confidence: 94,
        description: 'Specific heat capacity at 25°C',
        min: 100,
        max: 900
      }
    }
  };

  const mockMechanicalCategory: PropertyCategory = {
    label: 'Mechanical Properties',
    description: 'Strength and structural characteristics',
    percentage: 18.2,
    properties: {
      density: {
        value: 2.7,
        unit: 'g/cm³',
        confidence: 98,
        description: 'Pure aluminum density',
        min: 0.53,
        max: 22.6
      },
      hardness: {
        value: 167,
        unit: 'HV',
        confidence: 95,
        description: 'Vickers hardness',
        min: 0.5,
        max: 3500
      }
    }
  };

  const mockMetadata: ArticleMetadata = {
    title: 'Aluminum Laser Cleaning',
    slug: 'aluminum',
    category: 'Metal',
    materialProperties: {
      thermal: mockThermalCategory,
      mechanical: mockMechanicalCategory
    }
  };

  describe('PropertyValue Interface', () => {
    test('should have correct structure', () => {
      expect(mockPropertyValue.value).toBe(237);
      expect(mockPropertyValue.unit).toBe('W/m·K');
      expect(mockPropertyValue.confidence).toBe(92);
      expect(mockPropertyValue.description).toBeDefined();
      expect(mockPropertyValue.min).toBe(6.0);
      expect(mockPropertyValue.max).toBe(429.0);
    });

    test('should support string values', () => {
      const stringValue: PropertyValue = {
        value: 'FCC',
        unit: 'none',
        confidence: 99,
        description: 'Face-centered cubic crystal structure',
        min: undefined,
        max: undefined
      };

      expect(typeof stringValue.value).toBe('string');
      expect(stringValue.unit).toBe('none');
    });
  });

  describe('PropertyCategory Interface', () => {
    test('should have correct structure', () => {
      expect(mockThermalCategory.label).toBe('Thermal Properties');
      expect(mockThermalCategory.description).toBeDefined();
      expect(mockThermalCategory.percentage).toBe(29.1);
      expect(Object.keys(mockThermalCategory.properties)).toHaveLength(3);
    });

    test('should contain nested properties', () => {
      expect(mockThermalCategory.properties.thermalConductivity).toBeDefined();
      expect(mockThermalCategory.properties.meltingPoint).toBeDefined();
      expect(mockThermalCategory.properties.specificHeat).toBeDefined();
    });

    test('should validate percentage values', () => {
      expect(mockThermalCategory.percentage).toBeGreaterThan(0);
      expect(mockThermalCategory.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('MetricsGrid Rendering', () => {
    test('should render category headers', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
          showTitle
        />
      );

      expect(screen.getByText('Thermal Properties')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Properties')).toBeInTheDocument();
    });

    // Category descriptions removed from UI - test no longer applicable

    // Category percentages removed from UI - test no longer applicable

    // Property counts removed from UI - test no longer applicable

    test('should render empty state when no data', () => {
      const emptyMetadata: ArticleMetadata = {
        title: 'Test',
        slug: 'test',
        materialProperties: {}
      };

      render(
        <MetricsGrid
          metadata={emptyMetadata}
          dataSource="materialProperties"
        />
      );

      expect(screen.getByText('No material properties available')).toBeInTheDocument();
    });
  });

  describe('Category Display', () => {
    test('should display all categories without collapse', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
        />
      );

      // Categories should be headings, not buttons
      expect(screen.getByText('Thermal Properties')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Properties')).toBeInTheDocument();
    });

    test('should display all property cards by default', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
        />
      );

      // All cards should be visible (no collapse)
      const cards = screen.getAllByTestId('metrics-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('should have proper heading structure', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
        />
      );

      // Categories should be h3 headings
      const thermalHeading = screen.getByRole('heading', { name: /thermal properties/i, level: 3 });
      expect(thermalHeading).toBeInTheDocument();
    });
  });  describe('Category Filtering', () => {
    test('should filter to specific categories when filter provided', () => {
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

    test('should show all categories when no filter', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
        />
      );

      expect(screen.getByText('Thermal Properties')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Properties')).toBeInTheDocument();
    });
  });

  describe('Category Sorting', () => {
    test('should sort categories by percentage descending', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
        />
      );

      // Categories are now headings, not buttons
      const categoryHeaders = screen.getAllByRole('heading', { level: 3 });
      const firstCategory = categoryHeaders[0];
      const secondCategory = categoryHeaders[1];

      // Thermal (29.1%) should come before Mechanical (18.2%)
      expect(firstCategory).toHaveTextContent('Thermal Properties');
      expect(secondCategory).toHaveTextContent('Mechanical Properties');
    });
  });

  describe('Machine Settings (Flat Structure)', () => {
    const machineSettingsMetadata: ArticleMetadata = {
      title: 'Test',
      slug: 'test',
      machineSettings: {
        powerRange: {
          value: 100,
          unit: 'W',
          confidence: 92,
          description: 'Optimal average power',
          min: 80,
          max: 120
        },
        wavelength: {
          value: 1064,
          unit: 'nm',
          confidence: 95,
          description: 'Laser wavelength',
          min: 800,
          max: 1200
        }
      }
    };

    test('should render machine settings in flat structure', () => {
      render(
        <MetricsGrid
          metadata={machineSettingsMetadata}
          dataSource="machineSettings"
        />
      );

      const cards = screen.getAllByTestId('metrics-card');
      expect(cards.length).toBe(2);
    });

    test('should not show category headers for machine settings', () => {
      render(
        <MetricsGrid
          metadata={machineSettingsMetadata}
          dataSource="machineSettings"
        />
      );

      expect(screen.queryByRole('button', { name: /properties/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA roles', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
          showTitle
        />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getAllByRole('list')).toHaveLength(2); // 2 property grids
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2); // 2 category headings
    });

    test('should have aria-label on grids', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
        />
      );

      expect(screen.getByRole('list', { name: /thermal properties/i })).toBeInTheDocument();
    });

    test('should have accessible section labels', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata}
          dataSource="materialProperties"
          showTitle
          title="Test Properties"
        />
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'metrics-title-materialProperties');
    });
  });

  describe('Props Validation', () => {
    test('should accept all MetricsGridProps', () => {
      const props = {
        metadata: mockMetadata,
        dataSource: 'materialProperties' as const,
        title: 'Custom Title',
        description: 'Custom Description',
        titleFormat: 'comparison' as const,
        layout: 'auto' as const,
        showTitle: true,
        className: 'custom-class',
        baseHref: '/materials',
        searchable: true,
        categoryFilter: ['thermal']
      };

      expect(() => render(<MetricsGrid {...props} />)).not.toThrow();
    });

    test('should work with minimal props', () => {
      expect(() =>
        render(
          <MetricsGrid
            metadata={mockMetadata}
            dataSource="materialProperties"
          />
        )
      ).not.toThrow();
    });
  });
});

describe('MetricsGrid - Category Configuration', () => {
  test('should support all 9 scientific categories', () => {
    const allCategories = [
      'thermal',
      'mechanical',
      'optical_laser',
      'surface',
      'electrical',
      'chemical',
      'environmental',
      'compositional',
      'physical_structural',
      'other'
    ];

    allCategories.forEach(categoryId => {
      const metadata: ArticleMetadata = {
        title: 'Test',
        slug: 'test',
        materialProperties: {
          [categoryId]: {
            label: `${categoryId} Properties`,
            description: 'Test description',
            percentage: 10,
            properties: {
              testProp: {
                value: 100,
                unit: 'test',
                confidence: 90,
                description: 'Test property'
              }
            }
          } as PropertyCategory
        }
      };

      expect(() =>
        render(
          <MetricsGrid
            metadata={metadata}
            dataSource="materialProperties"
          />
        )
      ).not.toThrow();
    });
  });
});

describe('MetricsGrid - Property Title Mapping', () => {
  test('should abbreviate property titles correctly', () => {
    const metadata: ArticleMetadata = {
      title: 'Test',
      slug: 'test',
      materialProperties: {
        thermal: {
          label: 'Thermal Properties',
          description: 'Test',
          percentage: 100,
          properties: {
            thermalConductivity: {
              value: 237,
              unit: 'W/m·K',
              confidence: 92,
              description: 'Test'
            },
            thermalExpansion: {
              value: 23.1,
              unit: 'μm/m·°C',
              confidence: 90,
              description: 'Test'
            }
          }
        } as PropertyCategory
      }
    };

    render(
      <MetricsGrid
        metadata={metadata}
        dataSource="materialProperties"
      />
    );

    expect(screen.getByText('Thermal Conductivity')).toBeInTheDocument();
    expect(screen.getByText('Thermal Expansion')).toBeInTheDocument();
  });
});
