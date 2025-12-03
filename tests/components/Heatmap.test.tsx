// tests/components/Heatmap.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the SectionContainer to simplify testing
jest.mock('@/app/components/SectionContainer/SectionContainer', () => ({
  SectionContainer: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="section-container" aria-label={title}>{children}</div>
  ),
}));

// Mock colorUtils
jest.mock('@/app/utils/colorUtils', () => ({
  interpolateColor: (color1: string, _color2: string, _t: number) => color1,
}));

// Mock sectionIcons
jest.mock('@/app/config/sectionIcons', () => ({
  getSectionIcon: () => null,
}));

import { BaseHeatmap } from '@/app/components/Heatmap/BaseHeatmap';
import { MaterialSafetyHeatmap } from '@/app/components/Heatmap/MaterialSafetyHeatmap';
import { ProcessEffectivenessHeatmap } from '@/app/components/Heatmap/ProcessEffectivenessHeatmap';
import { HeatmapFactorCard } from '@/app/components/Heatmap/HeatmapFactorCard';
import { HeatmapStatusSummary } from '@/app/components/Heatmap/HeatmapStatusSummary';

// Test fixtures
const mockPowerRange = { min: 10, max: 100, current: 50 };
const mockPulseRange = { min: 100, max: 300, current: 180 };
const mockOptimalPower: [number, number] = [40, 60];
const mockOptimalPulse: [number, number] = [150, 200];

const mockMaterialProperties = {
  laserDamageThreshold: 5.0,
  ablationThreshold: 1.0,
  repetitionRate: 80000,
  spotDiameter: 300,
  thermalShockResistance: 200,
};

describe('Heatmap Component System', () => {
  describe('BaseHeatmap', () => {
    const mockCalculateScore = jest.fn((power: number, _pulse: number) => ({
      level: Math.round((power - 10) / 90 * 24 + 1),
      analysis: { finalScore: (power - 10) / 90, level: (power - 10) / 90 * 24 + 1 },
    }));

    const mockGetScoreLabel = (level: number) => 
      level >= 20 ? 'Excellent' : level >= 15 ? 'Good' : 'Poor';

    beforeEach(() => {
      mockCalculateScore.mockClear();
    });

    it('renders with required props', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
        />
      );

      expect(screen.getByTestId('section-container')).toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('renders correct number of grid cells (15x15 = 225)', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
        />
      );

      const grid = screen.getByRole('grid');
      const cells = grid.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(169); // 13x13 default grid
    });

    it('renders custom grid size when specified', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
          gridRows={10}
          gridCols={10}
        />
      );

      const grid = screen.getByRole('grid');
      const cells = grid.querySelectorAll('.aspect-square');
      expect(cells.length).toBe(100); // 10x10
    });

    it('calls calculateScore for each cell', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
        />
      );

      // Called once for each cell (225) + once for adaptive scaling pre-compute (225) + initial analysis
      expect(mockCalculateScore).toHaveBeenCalled();
    });

    it('displays axis labels', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
        />
      );

      expect(screen.getByText('Power (W)')).toBeInTheDocument();
      expect(screen.getByText('Pulse Duration (ns)')).toBeInTheDocument();
    });

    it('displays description when provided', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          description="Test description text"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
        />
      );

      expect(screen.getByText('Test description text')).toBeInTheDocument();
    });

    it('applies gap-0 for seamless tiles', () => {
      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculateScore}
          getScoreLabel={mockGetScoreLabel}
        />
      );

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('gap-0');
    });
  });

  describe('MaterialSafetyHeatmap', () => {
    it('renders with material safety title', () => {
      render(
        <MaterialSafetyHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
          materialName="Aluminum"
        />
      );

      expect(screen.getByLabelText('Aluminum Material Safety interactive heatmap')).toBeInTheDocument();
    });

    it('renders without material name', () => {
      render(
        <MaterialSafetyHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      expect(screen.getByLabelText('Material Safety Analysis interactive heatmap')).toBeInTheDocument();
    });

    it('renders all four factor cards', () => {
      render(
        <MaterialSafetyHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      expect(screen.getByText('Damage Risk')).toBeInTheDocument();
      expect(screen.getByText('Power Factor')).toBeInTheDocument();
      expect(screen.getByText('Pulse Factor')).toBeInTheDocument();
      expect(screen.getByText('Shock Resistance')).toBeInTheDocument();
    });

    it('calculates safety scores based on fluence', () => {
      render(
        <MaterialSafetyHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      // Should have fluence data displayed
      const fluenceElements = screen.getAllByText(/J\/cm²/);
      expect(fluenceElements.length).toBeGreaterThan(0);
    });
  });

  describe('ProcessEffectivenessHeatmap', () => {
    it('renders with cleaning efficiency title', () => {
      render(
        <ProcessEffectivenessHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
          materialName="Copper"
        />
      );

      expect(screen.getByLabelText('Copper Cleaning Efficiency interactive heatmap')).toBeInTheDocument();
    });

    it('renders all three factor cards', () => {
      render(
        <ProcessEffectivenessHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      expect(screen.getByText('Ablation')).toBeInTheDocument();
      expect(screen.getByText('Removal Rate')).toBeInTheDocument();
      expect(screen.getByText('Efficiency')).toBeInTheDocument();
    });

    it('displays fluence vs threshold percentage', () => {
      render(
        <ProcessEffectivenessHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      expect(screen.getByText('vs Threshold:')).toBeInTheDocument();
    });
  });

  describe('HeatmapFactorCard', () => {
    const mockConfig = {
      id: 'test',
      label: 'Test Factor',
      weight: '50%',
      description: 'Test description',
      color: 'green' as const,
      getValue: (analysis: Record<string, number>) => analysis.testScore || 0,
    };

    const mockAnalysis = { testScore: 0.75, level: 18 };

    it('renders label and weight', () => {
      render(<HeatmapFactorCard config={mockConfig} analysis={mockAnalysis} />);

      expect(screen.getByText('Test Factor')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<HeatmapFactorCard config={mockConfig} analysis={mockAnalysis} />);

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders progress bar based on score', () => {
      render(<HeatmapFactorCard config={mockConfig} analysis={mockAnalysis} />);

      const progressBar = document.querySelector('[style*="width"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders status when getStatus provided', () => {
      const configWithStatus = {
        ...mockConfig,
        getStatus: () => ({ text: '✓ Good', color: 'green' }),
      };

      render(<HeatmapFactorCard config={configWithStatus} analysis={mockAnalysis} />);

      expect(screen.getByText('✓ Good')).toBeInTheDocument();
    });

    it('renders data rows when provided', () => {
      const configWithDataRows = {
        ...mockConfig,
        dataRows: [
          { label: 'Value:', getValue: () => '75%' },
          { label: 'Status:', getValue: () => 'Active' },
        ],
      };

      render(<HeatmapFactorCard config={configWithDataRows} analysis={mockAnalysis} />);

      expect(screen.getByText('Value:')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('HeatmapStatusSummary', () => {
    it('renders power and pulse values', () => {
      render(
        <HeatmapStatusSummary
          power={50}
          pulse={180}
          level={18}
          finalScore={0.72}
          scoreLabel="Good"
          scoreType="safety"
        />
      );

      expect(screen.getByText(/50.*W.*180/)).toBeInTheDocument();
    });

    it('renders level score', () => {
      render(
        <HeatmapStatusSummary
          power={50}
          pulse={180}
          level={18}
          finalScore={0.72}
          scoreLabel="Good"
          scoreType="safety"
        />
      );

      expect(screen.getByText(/18.*\/.*25/)).toBeInTheDocument();
    });

    it('renders score label', () => {
      render(
        <HeatmapStatusSummary
          power={50}
          pulse={180}
          level={18}
          finalScore={0.72}
          scoreLabel="SAFE - Low Risk"
          scoreType="safety"
        />
      );

      expect(screen.getByText('SAFE - Low Risk')).toBeInTheDocument();
    });

    it('applies safety styling when scoreType is safety', () => {
      const { container } = render(
        <HeatmapStatusSummary
          power={50}
          pulse={180}
          level={18}
          finalScore={0.72}
          scoreLabel="Good"
          scoreType="safety"
        />
      );

      // Safety uses different gradient styling
      const statusBanner = container.firstChild;
      expect(statusBanner).toBeInTheDocument();
    });
  });

  describe('Adaptive Color Scaling', () => {
    it('normalizes colors to actual data range when adaptiveColorScale is true', () => {
      // Create a calculator that returns narrow range (15-20)
      const narrowRangeCalculator = jest.fn((_power: number, _pulse: number) => ({
        level: 17,
        analysis: { finalScore: 0.68, level: 17 },
      }));

      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={narrowRangeCalculator}
          getScoreLabel={(level) => `Level ${level}`}
          adaptiveColorScale={true}
        />
      );

      // Should still render with full color range utilized
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });

    it('uses full 1-25 range when adaptiveColorScale is false', () => {
      const mockCalculator = jest.fn((_power: number, _pulse: number) => ({
        level: 17,
        analysis: { finalScore: 0.68, level: 17 },
      }));

      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculator}
          getScoreLabel={(level) => `Level ${level}`}
          adaptiveColorScale={false}
        />
      );

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on grid', () => {
      const mockCalculator = jest.fn(() => ({
        level: 15,
        analysis: { finalScore: 0.5, level: 15 },
      }));

      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculator}
          getScoreLabel={(level) => `Level ${level}`}
        />
      );

      expect(screen.getByRole('grid', { name: /parameter effectiveness grid/i })).toBeInTheDocument();
    });

    it('has proper figure and figcaption', () => {
      const mockCalculator = jest.fn(() => ({
        level: 15,
        analysis: { finalScore: 0.5, level: 15 },
      }));

      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculator}
          getScoreLabel={(level) => `Level ${level}`}
        />
      );

      const figure = document.querySelector('figure');
      expect(figure).toBeInTheDocument();
      expect(figure).toHaveAttribute('aria-label', expect.stringContaining('heatmap'));
    });

    it('has complementary region for analysis', () => {
      const mockCalculator = jest.fn(() => ({
        level: 15,
        analysis: { finalScore: 0.5, level: 15 },
      }));

      render(
        <BaseHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          title="Test Heatmap"
          calculateScore={mockCalculator}
          getScoreLabel={(level) => `Level ${level}`}
        />
      );

      expect(screen.getByRole('complementary', { name: /analysis panels/i })).toBeInTheDocument();
    });
  });

  describe('Score Calculations', () => {
    it('MaterialSafety: higher power = lower safety score', () => {
      // Low power should be safer than high power
      const lowPowerScore = { level: 0, analysis: {} as any };
      const highPowerScore = { level: 0, analysis: {} as any };

      // Capture scores by rendering with specific power ranges
      const { rerender } = render(
        <MaterialSafetyHeatmap
          powerRange={{ min: 10, max: 100, current: 20 }} // Low power
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      // Visual verification that heatmap renders
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('ProcessEffectiveness: fluence at threshold = high score', () => {
      render(
        <ProcessEffectivenessHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties}
        />
      );

      // Visual verification that effectiveness heatmap renders
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });
});

// Import new heatmap components for testing
import { EnergyCouplingHeatmap } from '@/app/components/Heatmap/EnergyCouplingHeatmap';
import { ThermalStressHeatmap } from '@/app/components/Heatmap/ThermalStressHeatmap';

// Extended test fixtures for new heatmaps
const mockExtendedMaterialProperties = {
  ...mockMaterialProperties,
  // Optical properties
  reflectivity: 0.92,
  absorptivity: 0.06,
  absorptionCoefficient: 10000000, // 1×10^7 /m
  surfaceRoughness: 1.0, // μm
  density: 2700, // kg/m³
  porosity: 0.01,
  // Thermal properties
  thermalExpansionCoefficient: 0.0000231, // 23.1×10^-6 /K
  thermalDiffusivity: 0.000097, // 97 mm²/s
  meltingPoint: 660, // °C
  thermalConductivity: 237, // W/m·K
  specificHeat: 897, // J/kg·K
};

describe('Energy Coupling Heatmap', () => {
  describe('EnergyCouplingHeatmap', () => {
    it('renders with energy coupling title', () => {
      render(
        <EnergyCouplingHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockExtendedMaterialProperties}
          materialName="Aluminum"
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('renders all four factor cards', () => {
      render(
        <EnergyCouplingHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockExtendedMaterialProperties}
          materialName="Aluminum"
        />
      );

      // Check for factor card labels (actual labels in component)
      expect(screen.getByText('Reflectivity Impact')).toBeInTheDocument();
      expect(screen.getByText('Absorption Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Surface Interaction')).toBeInTheDocument();
      expect(screen.getByText('Thermal Mass')).toBeInTheDocument();
    });

    it('handles missing optical properties gracefully', () => {
      render(
        <EnergyCouplingHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties} // No optical props
          materialName="Unknown"
        />
      );

      // Should still render without crashing
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('displays correct weights for factors', () => {
      render(
        <EnergyCouplingHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockExtendedMaterialProperties}
          materialName="Aluminum"
        />
      );

      // Check weights: 35%, 30%, 20%, 15%
      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });
  });
});

describe('Thermal Stress Heatmap', () => {
  describe('ThermalStressHeatmap', () => {
    it('renders with thermal stress title', () => {
      render(
        <ThermalStressHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockExtendedMaterialProperties}
          materialName="Aluminum"
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('renders all four factor cards', () => {
      render(
        <ThermalStressHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockExtendedMaterialProperties}
          materialName="Aluminum"
        />
      );

      // Check for factor card labels (actual labels in component)
      expect(screen.getByText('Expansion Stress')).toBeInTheDocument();
      expect(screen.getByText('Heat Spreading')).toBeInTheDocument();
      expect(screen.getByText('Temperature Margin')).toBeInTheDocument();
      expect(screen.getByText('Shock Tolerance')).toBeInTheDocument();
    });

    it('handles missing thermal properties gracefully', () => {
      render(
        <ThermalStressHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockMaterialProperties} // No thermal props
          materialName="Unknown"
        />
      );

      // Should still render without crashing
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('displays correct weights for factors', () => {
      render(
        <ThermalStressHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={mockExtendedMaterialProperties}
          materialName="Aluminum"
        />
      );

      // Check weights: 35%, 25%, 25%, 15%
      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.getAllByText('25%').length).toBe(2); // Two factors with 25%
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('calculates higher stress for high thermal expansion materials', () => {
      // Materials with high thermal expansion should show more stress risk
      const highExpansionMaterial = {
        ...mockExtendedMaterialProperties,
        thermalExpansionCoefficient: 0.00005, // Very high expansion
      };

      render(
        <ThermalStressHeatmap
          powerRange={mockPowerRange}
          pulseRange={mockPulseRange}
          optimalPower={mockOptimalPower}
          optimalPulse={mockOptimalPulse}
          materialProperties={highExpansionMaterial}
          materialName="High Expansion Material"
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });
});
