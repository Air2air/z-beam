/**
 * Test Suite: MetricsCard Component (Consolidated)
 * Tests for unified MetricsCard handling materialProperties and machineSettings
 * Includes null safety and wrapper component removal verification
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  MetricsCard,
  PrimaryMetricsCard,
  CompactMetricsCard,
  MinimalMetricsCard,
  GenericMetricsCard,
  CustomMetricsCard,
  createMetricConfigs,
  type MetricsCardProps
} from '../../app/components/MetricsCard/MetricsCard';
import { ArticleMetadata, GenericMetricConfig } from '../../types';

// Mock data for testing
const mockMetadataWithMachineSettings: ArticleMetadata = {
  id: 'test-material',
  slug: 'test-material',
  title: 'Test Material',
  description: 'Test description',
  machineSettings: {
    powerRange: {
      numeric: 80,
      units: '%',
      min: 60,
      max: 100
    },
    wavelength: {
      numeric: 1064,
      units: 'nm',
      range: { min: 355, max: 2940 }
    },
    fluenceRange: {
      numeric: 2.5,
      units: 'J/cm²'
    },
    // Test null values for null safety
    pulseDuration: null as any,
    spotSize: undefined as any
  }
};

const mockMetadataWithMaterialProperties: ArticleMetadata = {
  id: 'test-material-props',
  slug: 'test-material-props',
  title: 'Test Material Properties',
  description: 'Test description',
  materialProperties: {
    density: {
      numeric: 2.7,
      units: 'g/cm³'
    },
    meltingPoint: {
      numeric: 1200,
      units: '°C'
    },
    // Test null values for null safety
    thermalConductivity: null as any,
    hardness: undefined as any
  }
};

const mockMetadataEmpty: ArticleMetadata = {
  id: 'empty-material',
  slug: 'empty-material',
  title: 'Empty Material',
  description: 'No settings'
};

describe('MetricsCard Component - Consolidated Functionality', () => {
  afterEach(cleanup);

  describe('Core MetricsCard with dataSource prop', () => {
    it('should render machine settings when dataSource="machineSettings"', () => {
      render(
        <MetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          title="Machine Settings"
          baseHref="/test"
        />
      );
      
      expect(screen.getByText('Machine Settings')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument(); // Power value
      expect(screen.getByText('%')).toBeInTheDocument(); // Power unit
    });

    it('should render material properties when dataSource="materialProperties"', () => {
      render(
        <MetricsCard
          metadata={mockMetadataWithMaterialProperties}
          dataSource="materialProperties"
          title="Material Properties"
          baseHref="/test"
        />
      );
      
      expect(screen.getByText('Material Properties')).toBeInTheDocument();
      expect(screen.getByText('2.7')).toBeInTheDocument(); // Density value
      expect(screen.getByText('g/cm³')).toBeInTheDocument(); // Density unit
    });

    it('should handle empty metadata gracefully', () => {
      render(
        <MetricsCard
          metadata={mockMetadataEmpty}
          dataSource="machineSettings"
          title="Empty Settings"
        />
      );
      
      expect(screen.getByText('Empty Settings')).toBeInTheDocument();
      expect(screen.getByText(/No matching machine settings found/i)).toBeInTheDocument();
    });
  });

  describe('Null Safety and Error Handling', () => {
    it('should handle null values without crashing', () => {
      // This test verifies the fix for the TypeError: Cannot read properties of null (reading 'toString')
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <MetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          title="Null Safety Test"
        />
      );
      
      // Should not have thrown any errors
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      // Should display em dash for null values
      expect(screen.getByText('—')).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    it('should display fallback values for undefined properties', () => {
      render(
        <MetricsCard
          metadata={mockMetadataWithMaterialProperties}
          dataSource="materialProperties"
          title="Undefined Values Test"
        />
      );
      
      // Should handle undefined values gracefully and show fallback
      expect(screen.getByText('Material Properties')).toBeInTheDocument();
      // Should not crash and should handle missing values
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    });
  });

  describe('Component Variants with dataSource support', () => {
    it('should render PrimaryMetricsCard with machine settings', () => {
      render(
        <PrimaryMetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          baseHref="/test"
        />
      );
      
      expect(screen.getByText('Primary Settings')).toBeInTheDocument();
      expect(screen.getByText('Essential parameters for this material')).toBeInTheDocument();
    });

    it('should render CompactMetricsCard with material properties', () => {
      render(
        <CompactMetricsCard
          metadata={mockMetadataWithMaterialProperties}
          dataSource="materialProperties"
          baseHref="/test"
        />
      );
      
      expect(screen.getByText('Key Parameters')).toBeInTheDocument();
    });

    it('should render MinimalMetricsCard without title', () => {
      render(
        <MinimalMetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          baseHref="/test"
        />
      );
      
      // Should not show the title (showTitle=false)
      expect(screen.queryByText('Essential Settings')).not.toBeInTheDocument();
    });
  });

  describe('Generic and Custom MetricsCard functionality', () => {
    it('should render GenericMetricsCard with auto-discovery', () => {
      const metadataWithNumericProps = {
        ...mockMetadataWithMachineSettings,
        customNumeric: 42,
        anotherValue: {
          numeric: 123.45,
          units: 'units'
        }
      };

      render(
        <GenericMetricsCard
          metadata={metadataWithNumericProps}
          dataSource="machineSettings"
          title="Auto-Discovered Metrics"
          baseHref="/test"
        />
      );
      
      expect(screen.getByText('Auto-Discovered Metrics')).toBeInTheDocument();
    });

    it('should render CustomMetricsCard with specific configurations', () => {
      const customConfigs: GenericMetricConfig[] = [
        {
          key: 'density',
          title: 'Material Density',
          description: 'Physical density measurement',
          priority: 1,
          colorScheme: 'blue'
        }
      ];

      render(
        <CustomMetricsCard
          metadata={mockMetadataWithMaterialProperties}
          dataSource="materialProperties"
          metricConfigs={customConfigs}
          title="Custom Metrics"
          baseHref="/test"
        />
      );
      
      expect(screen.getByText('Custom Metrics')).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    it('should create metric configs with createMetricConfigs helper', () => {
      const configs = createMetricConfigs(
        ['density', 'meltingPoint'],
        {
          defaultPriority: 2,
          defaultColorScheme: 'green',
          titleFormatter: (key) => key.toUpperCase(),
          descriptionFormatter: (key) => `Description for ${key}`
        }
      );

      expect(configs).toHaveLength(2);
      expect(configs[0].key).toBe('density');
      expect(configs[0].title).toBe('DENSITY');
      expect(configs[0].description).toBe('Description for density');
      expect(configs[0].priority).toBe(2);
      expect(configs[0].colorScheme).toBe('green');
    });
  });

  describe('Layout and Display Options', () => {
    it('should respect layout prop', () => {
      render(
        <MetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          layout="grid-3"
          title="Grid Layout Test"
        />
      );
      
      expect(screen.getByText('Grid Layout Test')).toBeInTheDocument();
    });

    it('should respect maxCards prop', () => {
      render(
        <MetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          maxCards={2}
          title="Max Cards Test"
        />
      );
      
      expect(screen.getByText('Max Cards Test')).toBeInTheDocument();
      // Should limit display to maxCards count
    });

    it('should respect showTitle prop', () => {
      render(
        <MetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          title="Hidden Title"
          showTitle={false}
        />
      );
      
      expect(screen.queryByText('Hidden Title')).not.toBeInTheDocument();
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with simple mode for legacy support', () => {
      const cardData = [
        {
          key: 'power',
          title: 'Power',
          value: 80,
          unit: '%',
          color: 'blue'
        }
      ];

      render(
        <MetricsCard
          metadata={mockMetadataWithMachineSettings}
          dataSource="machineSettings"
          cards={cardData}
          mode="simple"
          title="Simple Mode"
        />
      );
      
      expect(screen.getByText('Simple Mode')).toBeInTheDocument();
    });
  });
});

describe('MetricsCard Consolidation Verification', () => {
  afterEach(cleanup);

  it('should NOT import removed wrapper components', () => {
    // This test verifies that the wrapper components are no longer available
    // If this test fails, it means the consolidation was not complete
    
    // These imports should not exist anymore after consolidation
    expect(() => {
      require('../../app/components/MetricsCard/MetricsProperties');
    }).toThrow();

    expect(() => {
      require('../../app/components/MetricsCard/MetricsMachineSettings');
    }).toThrow();
  });

  it('should provide all functionality through main MetricsCard component', () => {
    // Test that machine settings functionality works
    render(
      <MetricsCard
        metadata={mockMetadataWithMachineSettings}
        dataSource="machineSettings"
        title="Machine Settings via MetricsCard"
      />
    );
    
    expect(screen.getByText('Machine Settings via MetricsCard')).toBeInTheDocument();
    
    cleanup();
    
    // Test that material properties functionality works
    render(
      <MetricsCard
        metadata={mockMetadataWithMaterialProperties}
        dataSource="materialProperties"
        title="Material Properties via MetricsCard"
      />
    );
    
    expect(screen.getByText('Material Properties via MetricsCard')).toBeInTheDocument();
  });
});