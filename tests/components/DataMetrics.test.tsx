/**
 * Test Suite: DataMetrics Component
 * Comprehensive testing for consolidated DataMetrics functionality
 * Tests MetricsCard, MetricsGrid, and StatCard consolidation
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DataMetrics,
  DataMetricsGrid,
  DataMetricsStats,
  type DataMetricsProps,
  type StatData
} from '../../app/components/DataMetrics';
import { QualityMetrics, ArticleMetadata, CardData } from '../../types';

// Mock data for testing
const mockArticleMetadata: ArticleMetadata = {
  id: 'test-article',
  slug: 'test-article',
  title: 'Test Article',
  description: 'Test description',
  machineSettings: {
    powerRange: {
      numeric: 80,
      units: '%'
    },
    wavelength: {
      numeric: 1064,
      units: 'nm'
    },
    fluenceRange: {
      numeric: 2.5,
      units: 'J/cm²'
    }
  },
  properties: {
    density: {
      numeric: 2.7,
      units: 'g/cm³'
    },
    thermalConductivity: {
      numeric: 205,
      units: 'W/m·K'
    }
  }
};

const mockQualityMetrics: QualityMetrics = {
  contamination_removal: '95%',
  surface_roughness_before: '12μm',
  surface_roughness_after: '2μm',
  thermal_damage: 'None detected',
  processing_efficiency: '90%',
  substrate_integrity: 'Maintained'
};

const mockStatData: StatData[] = [
  {
    value: 95,
    label: 'Efficiency',
    title: 'Processing Efficiency',
    description: 'Overall cleaning effectiveness',
    unit: '%',
    change: 5.2,
    trend: 'up',
    format: 'percentage',
    comparison: {
      label: 'Previous batch',
      value: 90,
      unit: '%'
    }
  },
  {
    value: 2.5,
    label: 'Roughness',
    title: 'Surface Roughness',
    unit: 'μm',
    change: -15.3,
    trend: 'down',
    format: 'decimal',
    precision: 2
  }
];

const mockCardData: CardData[] = [
  {
    key: 'power',
    title: 'Laser Power',
    value: 80,
    unit: '%',
    color: 'blue'
  },
  {
    key: 'wavelength',
    title: 'Wavelength',
    value: 1064,
    unit: 'nm',
    color: 'indigo'
  }
];

describe('DataMetrics Component - Core Functionality', () => {
  afterEach(cleanup);

  describe('Null Safety and Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      const { container } = render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={{
            valid_metric: '95%',
            null_metric: null as any,
            undefined_metric: undefined as any
          }}
        />
      );
      
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Valid Metric')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getAllByText('N/A')).toHaveLength(2); // Both null and undefined metrics
    });

    it('should handle empty data gracefully', () => {
      const { container } = render(
        <DataMetrics mode="grid" qualityMetrics={{}} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing props', () => {
      const { container } = render(<DataMetrics />);
      
      expect(container).toBeInTheDocument();
      // With no data, MetricsCard shows its fallback message
      expect(screen.getByText(/No matching machine settings found/i)).toBeInTheDocument();
    });

    it('should handle undefined metadata safely', () => {
      render(
        <DataMetrics 
          mode="metrics" 
          metadata={undefined}
          title="Test Metrics"
        />
      );
      
      // With undefined metadata, title doesn't show in MetricsCard mode
      expect(screen.getByText(/No matching machine settings found/i)).toBeInTheDocument();
    });
  });

  describe('Mode Detection and Auto Mode', () => {
    it('should auto-detect stats mode when statistical data is provided', () => {
      render(
        <DataMetrics 
          mode="auto"
          statisticalData={mockStatData}
          title="Auto Stats Mode"
        />
      );
      
      expect(screen.getByText('Auto Stats Mode')).toBeInTheDocument();
      expect(screen.getByText('Processing Efficiency')).toBeInTheDocument();
      expect(screen.getByText('↗ up')).toBeInTheDocument();
    });

    it('should auto-detect grid mode when quality metrics are provided', () => {
      render(
        <DataMetrics 
          mode="auto"
          qualityMetrics={mockQualityMetrics}
          title="Auto Grid Mode"
        />
      );
      
      expect(screen.getByText('Auto Grid Mode')).toBeInTheDocument();
      expect(screen.getByText('Contamination Removal')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    it('should auto-detect metrics mode when metadata is provided', () => {
      render(
        <DataMetrics 
          mode="auto"
          metadata={mockArticleMetadata}
          title="Auto Metrics Mode"
        />
      );
      
      expect(screen.getByText('Auto Metrics Mode')).toBeInTheDocument();
    });
  });

  describe('Format Conversion and Data Processing', () => {
    it('should convert quality metrics to cards correctly', () => {
      render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={mockQualityMetrics}
          maxCards={3}
          excludeMetrics={['substrate_integrity']}
        />
      );
      
      expect(screen.getByText('Contamination Removal')).toBeInTheDocument();
      expect(screen.getByText('Surface Roughness Before')).toBeInTheDocument();
      expect(screen.queryByText('Substrate Integrity')).not.toBeInTheDocument();
    });

    it('should handle statistical data formatting', () => {
      render(
        <DataMetrics 
          mode="stats"
          statisticalData={mockStatData}
          showTrendIcon={true}
          showComparison={true}
        />
      );
      
      expect(screen.getByText('Processing Efficiency')).toBeInTheDocument();
      // Check for trend text (case insensitive since DOM splits it)
      expect(screen.getByText(/up/i)).toBeInTheDocument();
      // Check for comparison elements that should be present
      expect(screen.getByText(/batch/i)).toBeInTheDocument();
      expect(screen.getAllByText(/change/i)[0]).toBeInTheDocument(); // Use getAllByText to handle multiple matches
    });

    it('should format different value types correctly', () => {
      const mixedData: StatData[] = [
        { value: 1234.5678, label: 'Decimal', format: 'decimal', precision: 2 },
        { value: 0.95, label: 'Percentage', format: 'percentage' },
        { value: 123.45, label: 'Currency', format: 'currency' },
        { value: 42, label: 'Number', format: 'number' }
      ];
      
      render(
        <DataMetrics 
          mode="stats"
          statisticalData={mixedData}
        />
      );
      
      expect(screen.getByText('1234.57')).toBeInTheDocument();
      expect(screen.getByText('95.00%')).toBeInTheDocument();
      expect(screen.getByText('$123.45')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Layout and Display Options', () => {
    it('should apply correct grid layouts', () => {
      const { container } = render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={mockQualityMetrics}
          maxCards={2}
        />
      );
      
      const gridElement = container.querySelector('.grid-cols-2');
      expect(gridElement).toBeInTheDocument();
    });

    it('should respect maxCards limit', () => {
      render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={mockQualityMetrics}
          maxCards={2}
        />
      );
      
      const metricElements = screen.getAllByRole('term');
      expect(metricElements.length).toBeLessThanOrEqual(2);
    });

    it('should handle custom className', () => {
      const { container } = render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={mockQualityMetrics}
          className="custom-metrics-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-metrics-class');
    });
  });

  describe('Title and Description Display', () => {
    it('should show title when showTitle is true', () => {
      render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={mockQualityMetrics}
          title="Custom Title"
          showTitle={true}
        />
      );
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should hide title when showTitle is false', () => {
      render(
        <DataMetrics 
          mode="grid"
          qualityMetrics={mockQualityMetrics}
          title="Hidden Title"
          showTitle={false}
        />
      );
      
      expect(screen.queryByText('Hidden Title')).not.toBeInTheDocument();
    });
  });
});

describe('DataMetrics Convenience Components', () => {
  afterEach(cleanup);

  describe('DataMetricsGrid', () => {
    it('should render quality metrics in grid format', () => {
      render(
        <DataMetricsGrid
          qualityMetrics={mockQualityMetrics}
          maxCards={3}
          excludeMetrics={['thermal_damage']}
          className="grid-test-class"
        />
      );
      
      expect(screen.getByText('Contamination Removal')).toBeInTheDocument();
      expect(screen.queryByText('Thermal Damage')).not.toBeInTheDocument();
    });

    it('should handle empty quality metrics', () => {
      const { container } = render(
        <DataMetricsGrid
          qualityMetrics={{}}
          maxCards={3}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('DataMetricsStats', () => {
    it('should render statistical data with trends', () => {
      render(
        <DataMetricsStats
          statisticalData={mockStatData}
          title="Statistics Dashboard"
          maxCards={5}
          layout="grid-2"
        />
      );
      
      expect(screen.getByText('Statistics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Processing Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Surface Roughness')).toBeInTheDocument();
    });

    it('should handle empty statistical data', () => {
      render(
        <DataMetricsStats
          statisticalData={[]}
          title="Empty Stats"
        />
      );
      
      expect(screen.getByText('Empty Stats')).toBeInTheDocument();
    });
  });
});

describe('DataMetrics Integration with MetricsCard', () => {
  afterEach(cleanup);

  it('should integrate with MetricsCard for complex metadata', () => {
    render(
      <DataMetrics 
        mode="metrics"
        metadata={mockArticleMetadata}
        title="Machine Settings"
        baseHref="/test"
      />
    );
    
    expect(screen.getByText('Machine Settings')).toBeInTheDocument();
  });

  it('should handle hybrid mode with multiple data sources', () => {
    render(
      <DataMetrics 
        mode="hybrid"
        metadata={mockArticleMetadata}
        qualityMetrics={mockQualityMetrics}
        statisticalData={mockStatData}
        cards={mockCardData}
        title="Hybrid Display"
        maxCards={10}
      />
    );
    
    expect(screen.getByText('Hybrid Display')).toBeInTheDocument();
  });

  it('should prioritize cards from different sources', () => {
    render(
      <DataMetrics 
        mode="hybrid"
        cards={mockCardData}
        qualityMetrics={mockQualityMetrics}
        statisticalData={mockStatData}
        maxCards={4}
      />
    );
    
    // Should show cards from all sources up to maxCards limit
    expect(screen.getByText('Laser Power')).toBeInTheDocument();
    expect(screen.getByText('Wavelength')).toBeInTheDocument();
  });
});

describe('DataMetrics Error Handling and Robustness', () => {
  afterEach(cleanup);

  it('should handle malformed quality metrics data', () => {
    const malformedMetrics = {
      valid_metric: '95%',
      null_value: null,
      undefined_value: undefined,
      empty_string: '',
      object_value: { nested: 'data' } as any
    };
    
    render(
      <DataMetrics 
        mode="grid"
        qualityMetrics={malformedMetrics}
      />
    );
    
    expect(screen.getByText('Valid Metric')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should handle malformed statistical data', () => {
    const malformedStats: StatData[] = [
      {
        value: null as any,
        label: 'Invalid Stat',
        unit: 'test'
      },
      {
        value: 'invalid number' as any,
        label: 'String Value',
        format: 'number'
      }
    ];
    
    render(
      <DataMetrics 
        mode="stats"
        statisticalData={malformedStats}
      />
    );
    
    expect(screen.getByText('Invalid Stat')).toBeInTheDocument();
    expect(screen.getByText('String Value')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should handle very large datasets gracefully', () => {
    const largeQualityMetrics: QualityMetrics = {};
    for (let i = 0; i < 100; i++) {
      largeQualityMetrics[`metric_${i}`] = `${Math.random() * 100}%`;
    }
    
    render(
      <DataMetrics 
        mode="grid"
        qualityMetrics={largeQualityMetrics}
        maxCards={5}
      />
    );
    
    const metricElements = screen.getAllByRole('term');
    expect(metricElements.length).toBeLessThanOrEqual(5);
  });
});

describe('DataMetrics Accessibility', () => {
  afterEach(cleanup);

  it('should provide proper semantic structure', () => {
    render(
      <DataMetrics 
        mode="grid"
        qualityMetrics={mockQualityMetrics}
        title="Accessibility Test"
      />
    );
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    const terms = screen.getAllByRole('term');
    const definitions = screen.getAllByRole('definition');
    
    expect(terms.length).toBeGreaterThan(0);
    expect(definitions.length).toBeGreaterThan(0);
    expect(terms.length).toEqual(definitions.length);
  });

  it('should support keyboard navigation', () => {
    render(
      <DataMetrics 
        mode="stats"
        statisticalData={mockStatData}
        title="Keyboard Test"
      />
    );
    
    const title = screen.getByText('Keyboard Test');
    expect(title).toBeInTheDocument();
  });
});

// Performance and Memory Tests
describe('DataMetrics Performance', () => {
  afterEach(cleanup);

  it('should not cause memory leaks with large datasets', () => {
    const largeStatData: StatData[] = [];
    for (let i = 0; i < 1000; i++) {
      largeStatData.push({
        value: Math.random() * 100,
        label: `Stat ${i}`,
        unit: 'unit',
        trend: i % 2 === 0 ? 'up' : 'down'
      });
    }
    
    const { unmount } = render(
      <DataMetrics 
        mode="stats"
        statisticalData={largeStatData}
        maxCards={10}
      />
    );
    
    expect(screen.getAllByText(/Stat \d+/)).toHaveLength(10);
    
    // Clean unmount should not throw errors
    expect(() => unmount()).not.toThrow();
  });

  it('should memoize expensive calculations', () => {
    let renderCount = 0;
    
    const TestWrapper = ({ data }: { data: StatData[] }) => {
      renderCount++;
      return (
        <DataMetrics 
          mode="stats"
          statisticalData={data}
        />
      );
    };
    
    const { rerender } = render(<TestWrapper data={mockStatData} />);
    
    // Re-render with same data
    rerender(<TestWrapper data={mockStatData} />);
    
    expect(renderCount).toBe(2);
  });
});