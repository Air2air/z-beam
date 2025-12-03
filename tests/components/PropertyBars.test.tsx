/**
 * PropertyBars Component Tests
 * Tests the three-bar visualization component - pure chart component without sectioning
 */

import { render, screen } from '@testing-library/react';
import { PropertyBars } from '@/app/components/PropertyBars/PropertyBars';
import { ArticleMetadata } from '@/types/centralized';

describe('PropertyBars Component', () => {
  describe('Basic Rendering', () => {
    it('should render properties with bars and labels', () => {
      const metadata: ArticleMetadata = {
        slug: 'test-material',
        title: 'Test Material',
        materialProperties: {
          density: {
            value: 2650,
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          },
          hardness: {
            value: 9,
            min: 1,
            max: 10,
            unit: 'Mohs',
          },
        },
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Check property labels are rendered
      expect(screen.getByText('Density')).toBeInTheDocument();
      expect(screen.getByText('Hardness')).toBeInTheDocument();
    });

    it('should display units in badges', () => {
      const metadata: ArticleMetadata = {
        slug: 'test-material',
        title: 'Test Material',
        materialProperties: {
          density: {
            value: 2650,
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          },
        },
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      expect(screen.getByText('kg/m³')).toBeInTheDocument();
    });

    it('should render with machine settings data source', () => {
      const metadata: ArticleMetadata = {
        slug: 'test-material',
        title: 'Test Material',
        machineSettings: {
          power: {
            value: 50,
            min: 10,
            max: 100,
            unit: 'W',
          },
          frequency: {
            value: 20,
            min: 10,
            max: 100,
            unit: 'kHz',
          },
        },
      };

      render(<PropertyBars metadata={metadata} dataSource="machineSettings" />);

      expect(screen.getByText('Power')).toBeInTheDocument();
      expect(screen.getByText('Frequency')).toBeInTheDocument();
    });
  });

  describe('Grouped Properties', () => {
    const groupedMetadata: ArticleMetadata = {
      slug: 'silicon-carbide',
      title: 'Silicon Carbide',
      materialProperties: {
        'Material Characteristics': {
          label: 'Material Characteristics',
          density: {
            value: 3210,
            min: 3100,
            max: 3300,
            unit: 'kg/m³',
          },
          hardness: {
            value: 9.5,
            min: 9,
            max: 10,
            unit: 'Mohs',
          },
        },
        'Laser-Material Interaction': {
          label: 'Laser-Material Interaction',
          absorptionCoefficient: {
            value: 104,
            min: 100,
            max: 108,
            unit: 'cm⁻¹',
          },
          laserAbsorption: {
            value: 0.4,
            min: 0.3,
            max: 0.5,
            unit: 'fraction',
          },
        },
      },
    };
  });

  describe('Visual Elements', () => {
    it('should render three bars per property (min, value, max)', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
        materialProperties: {
          density: {
            value: 2650,
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          },
        },
      };

      const { container } = render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Each property should have three bar elements (min, value, max)
      // Look for the bar wrapper structure with w-4 classes (updated styling)
      const bars = container.querySelectorAll('.w-4');
      expect(bars.length).toBeGreaterThanOrEqual(3); // At least 3 bars for one property
    });

    it('should display value in badge above unit', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
        materialProperties: {
          density: {
            value: 2650,
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          },
        },
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Should show the value (formatted with comma) - use getAllByText since it appears in badge and label
      expect(screen.getAllByText('2,650').length).toBeGreaterThan(0);
      // Should show the unit
      expect(screen.getByText('kg/m³')).toBeInTheDocument();
    });

    it('should apply gray-600 background to badges', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
        materialProperties: {
          density: {
            value: 2650,
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          },
        },
      };

      const { container } = render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Check for secondary background class on badge
      const badges = container.querySelectorAll('.bg-secondary');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing properties gracefully', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Should render without crashing
      expect(screen.queryByText('Density')).not.toBeInTheDocument();
    });

    it('should handle empty properties object', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
        materialProperties: {},
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Should render without crashing
      expect(screen.queryByText('Density')).not.toBeInTheDocument();
    });

    it('should skip properties without value field', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
        materialProperties: {
          density: {
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          } as any, // Missing value
        },
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      // Should not render density without value
      expect(screen.queryByText('Density')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render property labels for screen readers', () => {
      const metadata: ArticleMetadata = {
        slug: 'test',
        title: 'Test',
        materialProperties: {
          density: {
            value: 2650,
            min: 1800,
            max: 3200,
            unit: 'kg/m³',
          },
        },
      };

      render(<PropertyBars metadata={metadata} dataSource="materialProperties" />);

      const label = screen.getByText('Density');
      expect(label).toBeInTheDocument();
    });
  });
});
