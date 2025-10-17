/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SearchWrapper from '../../app/search/search-wrapper';
import { Article } from '@/types';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock SearchClient component
jest.mock('../../app/search/search-client', () => {
  return function MockSearchClient() {
    return <div data-testid="search-client">Search Client</div>;
  };
});

// Mock Layout component to capture title and subtitle
jest.mock('../../app/components/Layout/Layout', () => ({
  Layout: ({ title, subtitle, children }: any) => (
    <div data-testid="layout">
      <h1 data-testid="layout-title">{title}</h1>
      <p data-testid="layout-subtitle">{subtitle}</p>
      {children}
    </div>
  ),
}));

const { useSearchParams } = require('next/navigation');

describe('SearchWrapper Subtitle Tests', () => {
  const mockArticles: Article[] = [
    {
      slug: 'material-1',
      name: 'Material 1',
      title: 'Material 1',
      description: 'Test material',
      metadata: {},
    },
    {
      slug: 'material-2',
      name: 'Material 2',
      title: 'Material 2',
      description: 'Test material',
      metadata: {},
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property Search Subtitle Format', () => {
    it('should display subtitle with ± symbol for property searches', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'specificHeat';
          if (key === 'value') return '840';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      
      // Should contain ± symbol
      expect(subtitle.textContent).toContain('±');
      
      // Should contain the property value
      expect(subtitle.textContent).toContain('840');
      
      // Should follow format: "N materials found with Property of ± Value"
      expect(subtitle.textContent).toMatch(/\d+ materials? found with .+ of ± \d+/);
    });

    it('should format property name with spaces (camelCase to Title Case)', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'specificHeat';
          if (key === 'value') return '840';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      
      // "specificHeat" should become "Specific Heat"
      expect(subtitle.textContent).toContain('Specific Heat');
    });

    it('should handle property with unit when unit is extracted', async () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'thermalConductivity';
          if (key === 'value') return '52';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      // Simulate unit extraction event from SearchClient
      const event = new CustomEvent('searchResultsUpdated', {
        detail: { count: 5, unit: 'W/m·K' },
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const subtitle = screen.getByTestId('layout-subtitle');
        expect(subtitle.textContent).toContain('W/m·K');
        expect(subtitle.textContent).toMatch(/5 materials found with .+ of ± 52 W\/m·K:/);
      });
    });

    it('should show correct singular/plural for material count', async () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'density';
          if (key === 'value') return '7.1';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      // Test with 1 material
      let event = new CustomEvent('searchResultsUpdated', {
        detail: { count: 1, unit: 'g/cm³' },
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const subtitle = screen.getByTestId('layout-subtitle');
        expect(subtitle.textContent).toContain('1 material found');
        expect(subtitle.textContent).not.toContain('1 materials');
      });

      // Test with multiple materials
      event = new CustomEvent('searchResultsUpdated', {
        detail: { count: 7, unit: 'g/cm³' },
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const subtitle = screen.getByTestId('layout-subtitle');
        expect(subtitle.textContent).toContain('7 materials found');
      });
    });

    it('should end subtitle with colon', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'meltingPoint';
          if (key === 'value') return '1530';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      expect(subtitle.textContent).toMatch(/:$/);
    });

    it('should handle property names with multiple capital letters', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'CO2Absorption';
          if (key === 'value') return '0.5';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      
      // Should properly space capitals
      expect(subtitle.textContent).toContain('C O2 Absorption');
    });
  });

  describe('Text Search Subtitle Format', () => {
    it('should display search query for text searches', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'q') return 'aluminum';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      expect(subtitle.textContent).toBe('Search results for "aluminum"');
      expect(subtitle.textContent).not.toContain('±');
    });
  });

  describe('No Search Subtitle', () => {
    it('should display default browse message when no search active', () => {
      useSearchParams.mockReturnValue({
        get: () => null,
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      expect(subtitle.textContent).toBe('Browse all available materials and articles');
    });
  });

  describe('Search Title', () => {
    it('should always display "Search" as title', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'specificHeat';
          if (key === 'value') return '840';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const title = screen.getByTestId('layout-title');
      expect(title.textContent).toBe('Search');
      expect(title.textContent).not.toContain('result');
    });

    it('should display "Search" for text searches', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'q') return 'test query';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const title = screen.getByTestId('layout-title');
      expect(title.textContent).toBe('Search');
    });

    it('should display "Search" when no search active', () => {
      useSearchParams.mockReturnValue({
        get: () => null,
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const title = screen.getByTestId('layout-title');
      expect(title.textContent).toBe('Search');
    });
  });

  describe('Result Count Updates', () => {
    it('should update count when SearchClient dispatches event', async () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'density';
          if (key === 'value') return '7.1';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      // Dispatch result update event
      const event = new CustomEvent('searchResultsUpdated', {
        detail: { count: 12, unit: 'g/cm³' },
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const subtitle = screen.getByTestId('layout-subtitle');
        expect(subtitle.textContent).toContain('12 materials found');
      });
    });

    it('should show total count when no search is active', async () => {
      useSearchParams.mockReturnValue({
        get: () => null,
      });

      const manyArticles = Array.from({ length: 126 }, (_, i) => ({
        slug: `material-${i}`,
        name: `Material ${i}`,
        title: `Material ${i}`,
        description: 'Test material',
        metadata: {},
      }));

      render(<SearchWrapper initialArticles={manyArticles} />);

      // Should show browse message, not count
      const subtitle = screen.getByTestId('layout-subtitle');
      expect(subtitle.textContent).toBe('Browse all available materials and articles');
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('should handle property values with decimals', () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'thermalExpansion';
          if (key === 'value') return '11.5';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const subtitle = screen.getByTestId('layout-subtitle');
      expect(subtitle.textContent).toContain('± 11.5');
    });

    it('should handle units with special characters', async () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'specificHeat';
          if (key === 'value') return '840';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      // Simulate unit with special characters
      const event = new CustomEvent('searchResultsUpdated', {
        detail: { count: 7, unit: 'J/(kg·K)' },
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const subtitle = screen.getByTestId('layout-subtitle');
        expect(subtitle.textContent).toContain('J/(kg·K)');
        expect(subtitle.textContent).toContain('±');
      });
    });

    it('should handle missing unit gracefully', async () => {
      useSearchParams.mockReturnValue({
        get: (key: string) => {
          if (key === 'property') return 'hardness';
          if (key === 'value') return '180';
          return null;
        },
      });

      render(<SearchWrapper initialArticles={mockArticles} />);

      const event = new CustomEvent('searchResultsUpdated', {
        detail: { count: 5, unit: '' },
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const subtitle = screen.getByTestId('layout-subtitle');
        // Should still show ± without extra space before colon
        expect(subtitle.textContent).toMatch(/± 180:/);
      });
    });
  });
});
