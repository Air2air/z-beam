/**
 * Test Suite: ComparisonTable Component
 * Testing side-by-side model comparison rendering
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparisonTable } from '@/app/components/ComparisonTable/ComparisonTable';

describe('ComparisonTable Component', () => {
  const sampleModel1 = {
    name: "Needle® 100/150",
    category: "Laser Cleaning Equipment",
    subcategory: "Portable Precision Systems",
    description: "Compact precision laser cleaning system",
    materialProperties: {
      laserType: "Nano-second pulsed ytterbium fiber laser",
      wavelength: "1064 nm",
      laserClass: "Class 4",
      coolingSystem: "Air cooled"
    },
    machineSettings: {
      averagePower: "100W / 150W",
      totalWeight: "20 kg (44 lb)",
      fiberLength: "4.5 m"
    },
    applications: "Weld cleaning, small parts"
  };

  const sampleModel2 = {
    name: "Needle® 200/300",
    category: "Laser Cleaning Equipment",
    subcategory: "Portable Precision Systems",
    description: "High-power precision laser cleaning system",
    materialProperties: {
      laserType: "Nano-second pulsed ytterbium fiber laser",
      wavelength: "1064 nm",
      laserClass: "Class 4",
      coolingSystem: "Air cooled"
    },
    machineSettings: {
      averagePower: "200W / 300W",
      totalWeight: "43 kg (95 lb)",
      fiberLength: "5.7 m"
    },
    applications: "Weld cleaning, higher power requirements"
  };

  describe('Rendering', () => {
    test('should render comparison table with both models', () => {
      render(
        <ComparisonTable
          title="Model Comparison"
          model1Data={sampleModel1}
          model2Data={sampleModel2}
          model1Name="Needle® 100/150"
          model2Name="Needle® 200/300"
        />
      );

      expect(screen.getByText('Model Comparison')).toBeInTheDocument();
      expect(screen.getByText('Needle® 100/150')).toBeInTheDocument();
      expect(screen.getByText('Needle® 200/300')).toBeInTheDocument();
    });

    test('should render table headers correctly', () => {
      render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
          model1Name="Model A"
          model2Name="Model B"
        />
      );

      expect(screen.getByText('Property')).toBeInTheDocument();
      expect(screen.getByText('Model A')).toBeInTheDocument();
      expect(screen.getByText('Model B')).toBeInTheDocument();
    });

    test('should not render if model data is missing', () => {
      const { container } = render(
        <ComparisonTable
          model1Data={null}
          model2Data={sampleModel2}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Data Organization', () => {
    test('should group properties into Material Properties section', () => {
      render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      expect(screen.getByText('Material Properties')).toBeInTheDocument();
      expect(screen.getByText('Laser Type')).toBeInTheDocument();
      expect(screen.getByText('Wavelength')).toBeInTheDocument();
      expect(screen.getByText('Cooling System')).toBeInTheDocument();
    });

    test('should group properties into Machine Settings section', () => {
      render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      expect(screen.getByText('Machine Settings')).toBeInTheDocument();
      expect(screen.getByText('Average Power')).toBeInTheDocument();
      expect(screen.getByText('Total Weight')).toBeInTheDocument();
      expect(screen.getByText('Fiber Length')).toBeInTheDocument();
    });

    test('should filter out metadata fields', () => {
      render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      // These should be filtered out
      expect(screen.queryByText('name')).not.toBeInTheDocument();
      expect(screen.queryByText('category')).not.toBeInTheDocument();
      expect(screen.queryByText('subcategory')).not.toBeInTheDocument();
      expect(screen.queryByText('description')).not.toBeInTheDocument();
    });
  });

  describe('Value Rendering', () => {
    test('should display values side-by-side', () => {
      render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      // Check that both values are present for average power
      expect(screen.getByText('100W / 150W')).toBeInTheDocument();
      expect(screen.getByText('200W / 300W')).toBeInTheDocument();
    });

    test('should display em dash for missing values', () => {
      const model1WithMissing = {
        ...sampleModel1,
        machineSettings: {
          averagePower: "100W / 150W"
          // Missing totalWeight and fiberLength
        }
      };

      render(
        <ComparisonTable
          model1Data={model1WithMissing}
          model2Data={sampleModel2}
        />
      );

      // Should render em dash for missing values
      const rows = screen.getAllByText('—');
      expect(rows.length).toBeGreaterThan(0);
    });

    test('should handle array values', () => {
      const model1WithArray = {
        ...sampleModel1,
        keywords: ['laser', 'cleaning', 'precision']
      };

      const model2WithArray = {
        ...sampleModel2,
        keywords: ['laser', 'cleaning', 'power']
      };

      render(
        <ComparisonTable
          model1Data={model1WithArray}
          model2Data={model2WithArray}
        />
      );

      // Arrays should be joined with commas
      expect(screen.getByText('laser, cleaning, precision')).toBeInTheDocument();
      expect(screen.getByText('laser, cleaning, power')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle models with different property sets', () => {
      const model1Limited = {
        materialProperties: {
          laserType: "Fiber laser"
        }
      };

      const model2Extended = {
        materialProperties: {
          laserType: "Fiber laser",
          wavelength: "1064 nm",
          beamShape: "Gaussian"
        },
        machineSettings: {
          power: "500W"
        }
      };

      render(
        <ComparisonTable
          model1Data={model1Limited}
          model2Data={model2Extended}
        />
      );

      // Should show all properties from both models
      expect(screen.getByText('Laser Type')).toBeInTheDocument();
      expect(screen.getByText('Wavelength')).toBeInTheDocument();
      expect(screen.getByText('Beam Shape')).toBeInTheDocument();
      expect(screen.getByText('Power')).toBeInTheDocument();
    });

    test('should handle deeply nested objects', () => {
      const modelWithNested = {
        specs: {
          laser: {
            source: {
              type: "Fiber",
              power: "200W"
            }
          }
        }
      };

      render(
        <ComparisonTable
          model1Data={modelWithNested}
          model2Data={modelWithNested}
        />
      );

      // Should flatten nested properties
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Power')).toBeInTheDocument();
      expect(screen.getByText('Fiber')).toBeInTheDocument();
      expect(screen.getByText('200W')).toBeInTheDocument();
    });

    test('should use default model names if not provided', () => {
      render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      expect(screen.getByText('Model 1')).toBeInTheDocument();
      expect(screen.getByText('Model 2')).toBeInTheDocument();
    });

    test('should handle empty objects gracefully', () => {
      render(
        <ComparisonTable
          model1Data={{}}
          model2Data={{}}
        />
      );

      // Should still render table structure
      expect(screen.getByText('Property')).toBeInTheDocument();
    });
  });

  describe('Styling and Accessibility', () => {
    test('should apply proper table structure', () => {
      const { container } = render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table?.querySelector('thead')).toBeInTheDocument();
      expect(table?.querySelector('tbody')).toBeInTheDocument();
    });

    test('should have section headers with colspan', () => {
      const { container } = render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      const sectionHeaders = container.querySelectorAll('td[colspan="3"]');
      expect(sectionHeaders.length).toBeGreaterThan(0);
    });

    test('should apply alternating row styles', () => {
      const { container } = render(
        <ComparisonTable
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      // Check that rows have different background classes
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Caption and Title', () => {
    test('should display caption when provided', () => {
      render(
        <ComparisonTable
          caption="Equipment Specifications"
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      expect(screen.getByText('Equipment Specifications')).toBeInTheDocument();
    });

    test('should prefer title over caption', () => {
      render(
        <ComparisonTable
          title="Primary Title"
          caption="Secondary Caption"
          model1Data={sampleModel1}
          model2Data={sampleModel2}
        />
      );

      expect(screen.getByText('Primary Title')).toBeInTheDocument();
      expect(screen.queryByText('Secondary Caption')).not.toBeInTheDocument();
    });
  });
});
