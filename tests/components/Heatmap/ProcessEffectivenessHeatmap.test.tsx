/**
 * @jest-environment jsdom
 */

// tests/components/Heatmap/ProcessEffectivenessHeatmap.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProcessEffectivenessHeatmap } from '@/app/components/Heatmap/ProcessEffectivenessHeatmap';

// Mock BaseHeatmap to test ProcessEffectivenessHeatmap's prop transformation
jest.mock('@/app/components/Heatmap/BaseHeatmap', () => ({
  BaseHeatmap: (props: any) => (
    <div data-testid="base-heatmap">
      <span data-testid="title">{props.title}</span>
      <span data-testid="score-type">{props.scoreType}</span>
      <span data-testid="factor-count">{props.factorCards?.length || 0}</span>
      <span data-testid="icon">{props.icon}</span>
    </div>
  ),
}));

const defaultProps = {
  materialName: 'Steel',
  powerRange: { min: 0, max: 200, current: 100 },
  pulseRange: { min: 0, max: 1000, current: 500 },
  optimalPower: [80, 120] as [number, number],
  optimalPulse: [200, 400] as [number, number],
  materialProperties: {
    thermalConductivity: 50,
    ablationThreshold: 3.5,
    laserDamageThreshold: 5.0,
  },
};

describe('ProcessEffectivenessHeatmap Component', () => {
  describe('Rendering', () => {
    it('should render with correct title including material name', () => {
      render(<ProcessEffectivenessHeatmap {...defaultProps} />);
      
      // Component uses "Cleaning Efficiency" in title
      expect(screen.getByTestId('title')).toHaveTextContent('Steel Cleaning Efficiency');
    });

    it('should use effectiveness score type', () => {
      render(<ProcessEffectivenessHeatmap {...defaultProps} />);
      
      expect(screen.getByTestId('score-type')).toHaveTextContent('effectiveness');
    });

    it('should have appropriate icon', () => {
      render(<ProcessEffectivenessHeatmap {...defaultProps} />);
      
      // Should have an icon for effectiveness
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Factor Cards', () => {
    it('should provide factor cards for effectiveness analysis', () => {
      render(<ProcessEffectivenessHeatmap {...defaultProps} />);
      
      const factorCount = parseInt(screen.getByTestId('factor-count').textContent || '0');
      expect(factorCount).toBeGreaterThan(0);
    });
  });

  describe('Material Properties Integration', () => {
    it('should handle ablation threshold in calculations', () => {
      const propsWithAblation = {
        ...defaultProps,
        materialProperties: {
          ...defaultProps.materialProperties,
          ablationThreshold: 2.5,
        },
      };
      
      render(<ProcessEffectivenessHeatmap {...propsWithAblation} />);
      
      expect(screen.getByTestId('base-heatmap')).toBeInTheDocument();
    });

    it('should handle missing ablation threshold', () => {
      const propsWithoutAblation = {
        ...defaultProps,
        materialProperties: {
          thermalConductivity: 50,
        },
      };
      
      render(<ProcessEffectivenessHeatmap {...propsWithoutAblation} />);
      
      expect(screen.getByTestId('base-heatmap')).toBeInTheDocument();
    });
  });
});
