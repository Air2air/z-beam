// tests/components/HeatBuildup/HeatBuildup.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeatBuildup } from '@/app/components/HeatBuildup';

// Mock SectionContainer and SectionTitle
jest.mock('@/app/components/SectionContainer/SectionContainer', () => ({
  SectionContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="section-container" className={className}>{children}</div>
  ),
}));

jest.mock('@/app/components/SectionTitle/SectionTitle', () => ({
  SectionTitle: ({ title, sectionDescription }: { title: string; sectionDescription?: string }) => (
    <div data-testid="section-title">
      <h2>{title}</h2>
      {sectionDescription && <p>{sectionDescription}</p>}
    </div>
  ),
}));

// Mock HeatAnalysisCards - actual component takes statusData and factors, not materialName
jest.mock('@/app/components/HeatBuildup/HeatAnalysisCards', () => ({
  HeatAnalysisCards: ({ statusData, factors }: { 
    statusData: { peakTemp: number; currentTemp: number; maxSafeTemp: number; damageTemp: number };
    factors: Array<{ label: string; score: number }>;
  }) => (
    <div data-testid="heat-analysis-cards">
      <div>Peak: {statusData?.peakTemp ?? 0}°C</div>
      <div>Factors: {factors?.length ?? 0}</div>
    </div>
  ),
}));

const defaultProps = {
  materialName: 'Aluminum',
  power: 100,
  repRate: 50,
  scanSpeed: 500,
  passCount: 4,
  thermalDiffusivity: 97,
};

describe('HeatBuildup Component', () => {
  describe('Rendering', () => {
    it('should render the component container', () => {
      render(<HeatBuildup {...defaultProps} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should render the title', () => {
      render(<HeatBuildup {...defaultProps} />);
      
      // Title includes material name: "Aluminum Heat Buildup"
      expect(screen.getByText('Aluminum Heat Buildup')).toBeInTheDocument();
    });

    it('should render analysis cards', () => {
      render(<HeatBuildup {...defaultProps} />);
      
      expect(screen.getByTestId('heat-analysis-cards')).toBeInTheDocument();
      // Mock now renders statusData, so check for Peak temperature display
      expect(screen.getByText(/Peak:/)).toBeInTheDocument();
    });
  });

  describe('Material Properties', () => {
    it('should accept different material names', () => {
      render(<HeatBuildup {...defaultProps} materialName="Steel" />);
      
      // Title includes material name
      expect(screen.getByText('Steel Heat Buildup')).toBeInTheDocument();
    });

    it('should handle different thermal diffusivity values', () => {
      // Low thermal diffusivity (plastic-like)
      render(<HeatBuildup {...defaultProps} thermalDiffusivity={0.1} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should use default thermal diffusivity when not provided', () => {
      const propsWithoutDiffusivity = {
        materialName: 'Unknown',
        power: 100,
        repRate: 50,
        scanSpeed: 500,
        passCount: 4,
      };
      
      render(<HeatBuildup {...propsWithoutDiffusivity} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });
  });

  describe('Parameter Handling', () => {
    it('should accept power parameter', () => {
      render(<HeatBuildup {...defaultProps} power={150} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should accept repetition rate parameter', () => {
      render(<HeatBuildup {...defaultProps} repRate={100} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should accept scan speed parameter', () => {
      render(<HeatBuildup {...defaultProps} scanSpeed={1000} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should accept pass count parameter', () => {
      render(<HeatBuildup {...defaultProps} passCount={6} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });
  });

  describe('Optional Props', () => {
    it('should accept heroImage prop', () => {
      render(
        <HeatBuildup 
          {...defaultProps} 
          heroImage="/images/aluminum-hero.jpg"
        />
      );
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should accept materialLink prop', () => {
      render(
        <HeatBuildup 
          {...defaultProps} 
          materialLink="/materials/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero power', () => {
      render(<HeatBuildup {...defaultProps} power={0} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should handle high repetition rates', () => {
      render(<HeatBuildup {...defaultProps} repRate={200} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should handle single pass', () => {
      render(<HeatBuildup {...defaultProps} passCount={1} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });

    it('should handle many passes', () => {
      render(<HeatBuildup {...defaultProps} passCount={10} />);
      
      expect(screen.getByTestId('section-container')).toBeInTheDocument();
    });
  });
});
