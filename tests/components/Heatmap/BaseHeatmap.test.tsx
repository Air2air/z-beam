// tests/components/Heatmap/BaseHeatmap.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BaseHeatmap } from '@/app/components/Heatmap/BaseHeatmap';
import type { BaseHeatmapProps } from '@/types/centralized';

// Mock the BaseSection component
jest.mock('@/app/components/BaseSection/BaseSection', () => ({
  BaseSection: ({ children, title, description }: { children: React.ReactNode; title?: string; description?: string; className?: string }) => (
    <section role="region" aria-label={title || 'Section'}>
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {children}
    </section>
  ),
}));

// Mock AnalysisCards
jest.mock('@/app/components/Heatmap/AnalysisCards', () => ({
  AnalysisCards: ({ factorCards }: { factorCards: any[] }) => (
    <div data-testid="analysis-cards">
      {factorCards.length} factor cards
    </div>
  ),
}));

// Simple score calculator for testing
const mockCalculateScore = (power: number, pulse: number, _props: any) => {
  // Higher power and longer pulse = higher risk = lower level
  const powerFactor = 1 - (power / 200);
  const pulseFactor = 1 - (pulse / 1000);
  const level = Math.max(1, Math.min(25, Math.round((powerFactor + pulseFactor) * 12.5)));
  
  return {
    level,
    analysis: {
      level,
      fluence: power * pulse / 1000,
      finalScore: level / 25,
    },
  };
};

const mockGetScoreLabel = (level: number): string => {
  if (level >= 23) return 'OPTIMAL - Excellent';
  if (level >= 18) return 'GOOD - Safe';
  if (level >= 13) return 'MODERATE - Caution';
  if (level >= 8) return 'WARNING - Risk';
  return 'DANGER - High Risk';
};

const defaultProps: BaseHeatmapProps = {
  powerRange: { min: 0, max: 200, current: 100 },
  pulseRange: { min: 0, max: 1000, current: 500 },
  optimalPower: [80, 120],
  optimalPulse: [200, 400],
  materialProperties: {
    thermalConductivity: 237,
    thermalDiffusivity: 97,
    meltingPoint: 933,
  },
  title: 'Test Safety Heatmap',
  description: 'A test heatmap for unit testing',
  icon: '🔥',
  calculateScore: mockCalculateScore,
  getScoreLabel: mockGetScoreLabel,
  factorCards: [
    {
      id: 'thermal',
      label: 'Thermal Factor',
      icon: '🌡️',
      getValue: (analysis: any) => analysis.fluence || 0,
      format: (v: number) => `${v.toFixed(1)} J/cm²`,
      getStatus: () => 'good' as const,
      description: 'Thermal energy density',
    },
  ],
};

describe('BaseHeatmap Component', () => {
  describe('Rendering', () => {
    it('should render the heatmap container', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      expect(screen.getByRole('region', { name: 'Test Safety Heatmap' })).toBeInTheDocument();
    });

    it('should render the title and description', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      expect(screen.getByText('Test Safety Heatmap')).toBeInTheDocument();
      expect(screen.getByText('A test heatmap for unit testing')).toBeInTheDocument();
    });

    it('should render the heatmap grid', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAttribute('aria-label', 'Parameter effectiveness grid');
    });

    it('should render axis labels', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      expect(screen.getByText('Pulse Duration (ns)')).toBeInTheDocument();
      expect(screen.getByText('Power (W)')).toBeInTheDocument();
    });

    it('should render analysis cards', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      expect(screen.getByTestId('analysis-cards')).toBeInTheDocument();
    });
  });

  describe('Grid Cells', () => {
    it('should render correct number of cells based on gridRows and gridCols', () => {
      const { container } = render(
        <BaseHeatmap {...defaultProps} gridRows={5} gridCols={5} />
      );
      
      const cells = container.querySelectorAll('.heatmap-cell');
      expect(cells.length).toBe(25); // 5 * 5
    });

    it('should render default 13x13 grid when not specified', () => {
      const { container } = render(<BaseHeatmap {...defaultProps} />);
      
      const cells = container.querySelectorAll('.heatmap-cell');
      expect(cells.length).toBe(169); // 13 * 13
    });

    it('should apply hover styles to cells', () => {
      const { container } = render(
        <BaseHeatmap {...defaultProps} gridRows={3} gridCols={3} />
      );
      
      const cells = container.querySelectorAll('.heatmap-cell');
      const firstCell = cells[0];
      
      // Check hover classes are present
      expect(firstCell.className).toContain('hover:border-white');
      expect(firstCell.className).toContain('hover:scale-110');
      expect(firstCell.className).toContain('cursor-pointer');
    });

    it('should have background color on each cell', () => {
      const { container } = render(
        <BaseHeatmap {...defaultProps} gridRows={3} gridCols={3} />
      );
      
      const cells = container.querySelectorAll('.heatmap-cell');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ backgroundColor: expect.any(String) });
      });
    });
  });

  describe('Hover Interactions', () => {
    it('should update status bar on cell hover', async () => {
      const { container } = render(
        <BaseHeatmap {...defaultProps} gridRows={3} gridCols={3} />
      );
      
      const cells = container.querySelectorAll('.heatmap-cell');
      const firstCell = cells[0];
      
      fireEvent.mouseEnter(firstCell);
      
      // Status bar should show status keyword
      await waitFor(() => {
        const statusBar = screen.getByRole('status');
        expect(statusBar).toBeInTheDocument();
      });
    });

    it('should show fluence value in status bar', async () => {
      render(<BaseHeatmap {...defaultProps} gridRows={3} gridCols={3} />);
      
      // The status bar should display fluence
      expect(screen.getByText(/Fluence:/)).toBeInTheDocument();
    });

    it('should show distance from optimal', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      expect(screen.getByText(/From optimal:/)).toBeInTheDocument();
    });
  });

  describe('Axis Scales', () => {
    it('should render power scale values', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      // Power scale should show values from min to max
      const powerScale = screen.getByRole('list', { name: 'Power scale' });
      expect(powerScale).toBeInTheDocument();
    });

    it('should render pulse duration scale values', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      const pulseScale = screen.getByRole('list', { name: 'Pulse duration scale' });
      expect(pulseScale).toBeInTheDocument();
    });
  });

  describe('Color Mapping', () => {
    it('should apply different colors based on score levels', () => {
      const { container } = render(
        <BaseHeatmap {...defaultProps} gridRows={5} gridCols={5} />
      );
      
      const cells = container.querySelectorAll('.heatmap-cell');
      const colors = new Set<string>();
      
      cells.forEach((cell) => {
        const style = window.getComputedStyle(cell);
        colors.add(style.backgroundColor);
      });
      
      // Should have multiple different colors (gradient)
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible grid role', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label');
    });

    it('should have accessible figure element', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      const figure = screen.getByRole('figure');
      expect(figure).toHaveAttribute('aria-label');
    });

    it('should have live region for status updates', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom grid dimensions', () => {
      const { container } = render(
        <BaseHeatmap {...defaultProps} gridRows={10} gridCols={8} />
      );
      
      const cells = container.querySelectorAll('.heatmap-cell');
      expect(cells.length).toBe(80); // 10 * 8
    });

    it('should render with thumbnail and material link', () => {
      render(
        <BaseHeatmap 
          {...defaultProps} 
          thumbnail="/images/test.jpg"
          materialLink="/materials/test"
        />
      );
      
      // Component should render without errors
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should support custom score type', () => {
      render(
        <BaseHeatmap {...defaultProps} scoreType="effectiveness" />
      );
      
      expect(screen.getByTestId('analysis-cards')).toBeInTheDocument();
    });
  });

  describe('Factor Cards', () => {
    it('should pass factor cards to analysis panel', () => {
      render(<BaseHeatmap {...defaultProps} />);
      
      expect(screen.getByText('1 factor cards')).toBeInTheDocument();
    });

    it('should render without factor cards', () => {
      render(<BaseHeatmap {...defaultProps} factorCards={[]} />);
      
      expect(screen.getByText('0 factor cards')).toBeInTheDocument();
    });
  });
});
