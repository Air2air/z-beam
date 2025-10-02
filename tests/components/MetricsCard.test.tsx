/**
 * Test Suite: MetricsCard Component (Simplified Version)
 * Tests for the simplified MetricsCard with extracted utilities and ProgressBar
 * 
 * SIMPLIFIED COMPONENT CHANGES:
 * - Extracted cleanupFloat to @/app/utils/formatting
 * - Extracted generateSearchUrl to @/app/utils/searchUtils
 * - Extracted ProgressBar to @/app/components/ProgressBar/ProgressBar
 * - MetricsCard is now ~220 lines (48% reduction from 424 lines)
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsCard } from '../../app/components/MetricsCard/MetricsCard';
import { MetricsGrid } from '../../app/components/MetricsCard/MetricsGrid';

// NOTE: Utility functions (cleanupFloat, generateSearchUrl) are now in separate modules
// with their own comprehensive test files:
// - tests/utils/formatting.test.ts
// - tests/utils/searchUtils.test.ts
// ProgressBar component has its own test file:
// - tests/components/ProgressBar.test.tsx

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
      expect(screen.getByText('°C')).toBeInTheDocument(); // One unit display (in value area for basic cards)
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
      // With semantic enhancement, value appears multiple times (progress bar, data elements, etc.)
      expect(screen.getAllByText('80')).toHaveLength(2); // Current value in progress bar and main data element
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
      expect(link).toHaveAttribute('href', '/search?property=Thermal%20Conductivity&value=150&unit=W%2FmK');
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
      expect(link).toHaveAttribute('href', '/search?property=Melting%20Temperature&value=1200&unit=%C2%B0C');
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
      // Title attribute is kept for accessibility even with explicit href
      expect(link).toHaveAttribute('title', 'Search for Temperature: 500°C');
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
      expect(link).toHaveClass('hover:shadow-xl'); // Updated from hover:shadow-lg in simplified component
      expect(link).toHaveClass('hover:scale-[1.03]'); // Updated from hover:scale-105
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
      // Should not have clickable MetricsCard links (skip links for accessibility may exist)
      expect(screen.queryByRole('link', { name: /search for/i })).not.toBeInTheDocument();
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