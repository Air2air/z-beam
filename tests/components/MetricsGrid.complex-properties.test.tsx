/**
 * MetricsGrid Complex Properties Test
 * Tests the new functionality for handling nested complex properties:
 * - reflectivity (wavelength-specific)
 * - ablationThreshold (pulse-duration specific)
 * - thermalDestruction (point + type)
 */

import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MetricsGrid } from '@/app/components/MetricsCard/MetricsGrid';
import type { ArticleMetadata } from '@/types';

describe('MetricsGrid - Complex Properties Support', () => {
  
  const mockMetadata: ArticleMetadata = {
    title: 'Test Material',
    slug: 'test-material',
    materialProperties: {
      energy_coupling: {
        label: 'Energy Coupling Properties',
        description: 'Test category',
        percentage: 16.4,
        properties: {
          // Simple property (should still work)
          laserAbsorption: {
            value: 4.0,
            unit: '%',
            confidence: 95,
            description: 'Laser absorption',
            min: 0.02,
            max: 100
          },
          // Complex property: reflectivity with wavelength-specific values
          reflectivity: {
            at_1064nm: {
              min: 85,
              max: 98,
              unit: '%'
            },
            at_532nm: {
              min: 70,
              max: 95,
              unit: '%'
            },
            at_355nm: {
              min: 55,
              max: 85,
              unit: '%'
            },
            at_10640nm: {
              min: 95,
              max: 99,
              unit: '%'
            },
            source: 'Handbook of Optical Constants',
            confidence: 85,
            measurement_context: 'Varies by laser wavelength'
          },
          // Complex property: ablationThreshold with pulse-duration values
          ablationThreshold: {
            nanosecond: {
              min: 2.0,
              max: 8.0,
              unit: 'J/cm²'
            },
            picosecond: {
              min: 0.1,
              max: 2.0,
              unit: 'J/cm²'
            },
            femtosecond: {
              min: 0.14,
              max: 1.7,
              unit: 'J/cm²'
            },
            source: 'Marks et al. 2022',
            confidence: 90,
            measurement_context: 'Varies by pulse duration'
          },
          // Complex property: thermalDestruction with point and type
          thermalDestruction: {
            point: {
              value: 933.47,
              unit: 'K',
              min: -38.8,
              max: 3422,
              confidence: 95,
              description: 'Thermal destruction point'
            },
            type: 'melting'
          }
        }
      }
    }
  };

  it('should display simple properties correctly', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Check simple property is displayed (title and unit are in separate elements)
    // Value '4' may appear multiple times in the vertical layout
    expect(screen.getByText('Laser Absorption')).toBeInTheDocument();
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
  });

  it('should extract all reflectivity wavelength values', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Should show 4 reflectivity cards
    expect(screen.getByText('Reflectivity @ 1064nm')).toBeInTheDocument();
    expect(screen.getByText('Reflectivity @ 532nm')).toBeInTheDocument();
    expect(screen.getByText('Reflectivity @ 355nm')).toBeInTheDocument();
    expect(screen.getByText('Reflectivity @ 10.6μm')).toBeInTheDocument();
  });

  it('should calculate midpoint values for range-only properties', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Reflectivity at 1064nm: (85 + 98) / 2 = 91.5
    const reflectivity1064Cards = screen.getAllByText(/91\.5/);
    expect(reflectivity1064Cards.length).toBeGreaterThan(0);
  });

  it('should extract all ablation threshold pulse-duration values', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Should show 3 ablation threshold cards (titles are split across elements)
    expect(screen.getAllByText(/Ablation Threshold \(ns\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ablation Threshold \(ps\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ablation Threshold \(fs\)/).length).toBeGreaterThan(0);
  });

  it('should extract thermal destruction point', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Should show thermal destruction card (title text, unit in separate span)
    // Use regex to find text that may be split across elements
    expect(screen.getAllByText(/Thermal Destruction/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/933\.47/).length).toBeGreaterThan(0);
  });

  it('should preserve unit information for complex properties', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Check units are displayed (in separate span elements)
    // Just verify cards exist and basic structure is present
    const laserAbsorptionTitle = screen.getByText('Laser Absorption');
    expect(laserAbsorptionTitle).toBeInTheDocument();
    
    // Verify J/cm² units appear for ablation thresholds (in separate spans)
    const allText = screen.getAllByText(/J\/cm²/);
    expect(allText.length).toBeGreaterThan(0); // At least some energy unit displays
  });

  it('should create correct number of total cards', () => {
    const { container } = render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Count total cards: 1 simple + 4 reflectivity + 3 ablation + 1 thermal = 9 cards
    const cards = container.querySelectorAll('[data-component="metrics-card"]');
    expect(cards.length).toBe(9);
  });

  it('should handle missing nested values gracefully', () => {
    const incompleteMetadata: ArticleMetadata = {
      title: 'Incomplete Material',
      slug: 'incomplete',
      materialProperties: {
        energy_coupling: {
          label: 'Energy Coupling',
          description: 'Test',
          percentage: 10,
          properties: {
            reflectivity: {
              at_1064nm: {
                min: 85,
                max: 98,
                unit: '%'
              },
              // Missing other wavelengths
              source: 'Test'
            }
          }
        }
      }
    };

    render(
      <MetricsGrid
        metadata={incompleteMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Should only show the one wavelength that exists
    expect(screen.getByText('Reflectivity @ 1064nm')).toBeInTheDocument();
    expect(screen.queryByText('Reflectivity @ 532nm')).not.toBeInTheDocument();
  });

  it('should preserve category colors for complex properties', () => {
    const { container } = render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // All cards should have a background color applied (energy_coupling category color)
    // Background color is on the Link/div container, not the inner element
    const cards = container.querySelectorAll('a[href], div[role="presentation"]');
    expect(cards.length).toBeGreaterThan(0);
    let cardsWithColor = 0;
    cards.forEach(card => {
      const style = (card as HTMLElement).style.backgroundColor;
      if (style && style.length > 0) {
        cardsWithColor++;
      }
    });
    expect(cardsWithColor).toBeGreaterThan(0); // At least some cards have background colors
  });

  it('should handle progress bars for complex properties with ranges', () => {
    render(
      <MetricsGrid
        metadata={mockMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Reflectivity cards should have progress bars (they have min/max)
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should not break simple property rendering', () => {
    const simpleMetadata: ArticleMetadata = {
      title: 'Simple Material',
      slug: 'simple',
      materialProperties: {
        material_properties: {
          label: 'Material Properties',
          description: 'Test',
          percentage: 40,
          properties: {
            density: {
              value: 2.7,
              unit: 'g/cm³',
              confidence: 98,
              description: 'Density',
              min: 0.53,
              max: 22.6
            },
            hardness: {
              value: 25,
              unit: 'HV',
              confidence: 85,
              description: 'Hardness',
              min: 0.5,
              max: 3500
            }
          }
        }
      }
    };

    render(
      <MetricsGrid
        metadata={simpleMetadata}
        dataSource="materialProperties"
        showTitle={false}
      />
    );

    // Simple properties should still render (may appear multiple times in vertical layout)
    expect(screen.getAllByText(/Density/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.7').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hardness/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('25').length).toBeGreaterThan(0);
  });
});
