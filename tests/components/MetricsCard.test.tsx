/**
 * Test Suite: MetricsCard Component (Simple Version)
 * Tests for the unified simple MetricsCard with search functionality
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsCard, type MetricsCardProps } from '../../app/components/MetricsCard/MetricsCard';
import { MetricsGrid, type MetricsGridProps } from '../../app/components/MetricsCard/MetricsGrid';

describe('MetricsCard Simple Component', () => {
  afterEach(cleanup);

  describe('Basic MetricsCard Functionality', () => {
    it('should render with basic props', () => {
      render(
        <MetricsCard
          title="Temperature"
          value={500}
          unit="°C"
          color="#4F46E5"
        />
      );
      
      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getAllByText('°C')).toHaveLength(2); // One in value area, one in title
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('should render with progress bar when min/max provided', () => {
      render(
        <MetricsCard
          title="Power"
          value={80}
          unit="%"
          color="#4F46E5"
          min={0}
          max={100}
        />
      );
      
      expect(screen.getByText('Power')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
      // When progress bar is present, value appears only once (on the progress bar)
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render as clickable link when searchable=true', () => {
      render(
        <MetricsCard
          title="Thermal Conductivity"
          value={150}
          unit="W/mK"
          color="#4F46E5"
          searchable={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/search?property=Thermal%20Conductivity&value=150');
      expect(link).toHaveAttribute('title', 'Search for Thermal Conductivity: 150W/mK');
    });

    it('should generate property-based search URL for property keywords', () => {
      render(
        <MetricsCard
          title="Melting Temperature"
          value={1200}
          unit="°C"
          color="#4F46E5"
          searchable={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?property=Melting%20Temperature&value=1200');
    });

    it('should generate general search URL for non-property titles', () => {
      render(
        <MetricsCard
          title="Material Grade"
          value="Al6061"
          color="#4F46E5"
          searchable={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?q=Al6061');
    });

    it('should prioritize explicit href over searchable URL', () => {
      render(
        <MetricsCard
          title="Temperature"
          value={500}
          unit="°C"
          color="#4F46E5"
          href="/custom-page"
          searchable={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/custom-page');
      expect(link).not.toHaveAttribute('title');
    });

    it('should not be clickable when searchable=false', () => {
      render(
        <MetricsCard
          title="Temperature"
          value={500}
          unit="°C"
          color="#4F46E5"
          searchable={false}
        />
      );
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      const card = screen.getByText('Temperature').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effects for clickable cards', () => {
      render(
        <MetricsCard
          title="Clickable Metric"
          value={100}
          color="#4F46E5"
          searchable={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('cursor-pointer');
      expect(link).toHaveClass('hover:shadow-lg');
      expect(link).toHaveClass('hover:scale-105');
    });
  });

  describe('MetricsGrid Integration', () => {
    const mockMetadata = {
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
          units: 'nm'
        }
      }
    };

    it('should render MetricsGrid with searchable cards', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata as any}
          dataSource="machineSettings"
          title="Test Grid"
          searchable={true}
        />
      );
      
      expect(screen.getByText('Test Grid')).toBeInTheDocument();
      // Should have clickable links for the cards
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should render MetricsGrid with non-searchable cards', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata as any}
          dataSource="machineSettings"
          title="Test Grid"
          searchable={false}
        />
      );
      
      expect(screen.getByText('Test Grid')).toBeInTheDocument();
      // Should not have clickable links for the cards
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should default searchable to true', () => {
      render(
        <MetricsGrid
          metadata={mockMetadata as any}
          dataSource="machineSettings"
          title="Test Grid"
        />
      );
      
      expect(screen.getByText('Test Grid')).toBeInTheDocument();
      // Should have clickable links by default
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});