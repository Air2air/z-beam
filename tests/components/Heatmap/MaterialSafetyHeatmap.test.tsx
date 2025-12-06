// tests/components/Heatmap/MaterialSafetyHeatmap.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MaterialSafetyHeatmap } from '@/app/components/Heatmap/MaterialSafetyHeatmap';

// Mock BaseHeatmap to test MaterialSafetyHeatmap's prop transformation
jest.mock('@/app/components/Heatmap/BaseHeatmap', () => ({
  BaseHeatmap: (props: any) => (
    <div data-testid="base-heatmap">
      <span data-testid="title">{props.title}</span>
      <span data-testid="score-type">{props.scoreType}</span>
      <span data-testid="factor-count">{props.factorCards?.length || 0}</span>
      <span data-testid="power-min">{props.powerRange.min}</span>
      <span data-testid="power-max">{props.powerRange.max}</span>
      <span data-testid="power-current">{props.powerRange.current}</span>
    </div>
  ),
}));

const defaultProps = {
  materialName: 'Aluminum',
  powerRange: { min: 0, max: 200, current: 100 },
  pulseRange: { min: 0, max: 1000, current: 500 },
  optimalPower: [80, 120] as [number, number],
  optimalPulse: [200, 400] as [number, number],
  materialProperties: {
    thermalConductivity: 237,
    thermalDiffusivity: 97,
    meltingPoint: 933,
    laserDamageThreshold: 1.8,
  },
};

describe('MaterialSafetyHeatmap Component', () => {
  describe('Rendering', () => {
    it('should render with correct title including material name', () => {
      render(<MaterialSafetyHeatmap {...defaultProps} />);
      
      expect(screen.getByTestId('title')).toHaveTextContent('Aluminum Material Safety');
    });

    it('should use safety score type', () => {
      render(<MaterialSafetyHeatmap {...defaultProps} />);
      
      expect(screen.getByTestId('score-type')).toHaveTextContent('safety');
    });

    it('should pass power range to BaseHeatmap', () => {
      render(<MaterialSafetyHeatmap {...defaultProps} />);
      
      expect(screen.getByTestId('power-min')).toHaveTextContent('0');
      expect(screen.getByTestId('power-max')).toHaveTextContent('200');
      expect(screen.getByTestId('power-current')).toHaveTextContent('100');
    });
  });

  describe('Factor Cards', () => {
    it('should provide factor cards for safety analysis', () => {
      render(<MaterialSafetyHeatmap {...defaultProps} />);
      
      // Should have multiple factor cards for safety analysis
      const factorCount = parseInt(screen.getByTestId('factor-count').textContent || '0');
      expect(factorCount).toBeGreaterThan(0);
    });
  });

  describe('Material Properties Integration', () => {
    it('should accept material properties for score calculation', () => {
      const propsWithFullMaterial = {
        ...defaultProps,
        materialProperties: {
          thermalConductivity: 237,
          thermalDiffusivity: 97,
          meltingPoint: 933,
          boilingPoint: 2792,
          laserDamageThreshold: 1.8,
          ablationThreshold: 2.5,
          thermalShockResistance: 250,
          absorptivity: 0.08,
          laserReflectivity: 0.92,
        },
      };
      
      render(<MaterialSafetyHeatmap {...propsWithFullMaterial} />);
      
      expect(screen.getByTestId('base-heatmap')).toBeInTheDocument();
    });

    it('should handle missing optional properties gracefully', () => {
      const minimalProps = {
        ...defaultProps,
        materialProperties: {},
      };
      
      render(<MaterialSafetyHeatmap {...minimalProps} />);
      
      expect(screen.getByTestId('base-heatmap')).toBeInTheDocument();
    });
  });

  describe('Optional Props', () => {
    it('should accept thumbnail prop', () => {
      render(
        <MaterialSafetyHeatmap 
          {...defaultProps} 
          thumbnail="/images/aluminum.jpg"
        />
      );
      
      expect(screen.getByTestId('base-heatmap')).toBeInTheDocument();
    });

    it('should accept materialLink prop', () => {
      render(
        <MaterialSafetyHeatmap 
          {...defaultProps} 
          materialLink="/materials/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );
      
      expect(screen.getByTestId('base-heatmap')).toBeInTheDocument();
    });
  });
});
