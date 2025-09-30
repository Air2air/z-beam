// tests/components/ArticleGrid.test.tsx
// Comprehensive test suite for the unified ArticleGrid system

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ArticleGrid } from '../../app/components/ArticleGrid/ArticleGrid';
import { SearchResultItem, Article } from '@/types';

// Mock dependencies
jest.mock('../../app/components/Card/Card', () => ({
  Card: ({ frontmatter, href, badge, className }: any) => (
    <div 
      data-testid="card" 
      data-title={frontmatter?.title}
      data-href={href}
      data-badge={badge?.symbol}
      className={className}
    >
      {frontmatter?.title}
    </div>
  )
}));

jest.mock('../../app/utils/formatting', () => ({
  slugToDisplayName: (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

jest.mock('../../app/utils/gridConfig', () => ({
  getGridClasses: ({ columns, gap }: any) => `grid-cols-${columns} gap-${gap}`,
  createSectionHeader: (title: string) => ({ title }),
  createCategoryHeader: (title: string, count: number) => ({ title: `${title} (${count})` })
}));

describe('ArticleGrid - Unified Grid System', () => {
  const mockItems = [
    {
      slug: 'test-item-1',
      title: 'Test Item 1',
      description: 'Description 1',
      href: '/test-item-1',
      category: 'Test Category'
    },
    {
      slug: 'test-item-2', 
      title: 'Test Item 2',
      description: 'Description 2',
      href: '/test-item-2',
      category: 'Test Category'
    }
  ];

  const mockSearchResults: SearchResultItem[] = [
    {
      id: '1',
      slug: 'search-result-1',
      title: 'Search Result 1',
      description: 'Search Description 1',
      type: 'article',
      href: '/search-result-1'
    }
  ];

  describe('Basic Rendering', () => {
    test('renders with items prop', () => {
      render(<ArticleGrid items={mockItems} />);
      expect(screen.getByText('Test Item 1')).toBeDefined();
      expect(screen.getByText('Test Item 2')).toBeDefined();
    });

    test('renders with slugs prop', () => {
      render(<ArticleGrid slugs={['test-slug-1', 'test-slug-2']} />);
      expect(screen.getByText('Test Slug 1')).toBeDefined();
      expect(screen.getByText('Test Slug 2')).toBeDefined();
    });

    test('renders with searchResults prop', () => {
      render(<ArticleGrid searchResults={mockSearchResults} />);
      expect(screen.getByText('Search Result 1')).toBeDefined();
    });

    test('renders with title', () => {
      render(<ArticleGrid items={mockItems} title="Test Grid Title" />);
      expect(screen.getByText('Test Grid Title')).toBeDefined();
    });
  });

  describe('Grid Modes', () => {
    test('simple mode renders basic grid', () => {
      render(<ArticleGrid items={mockItems} mode="simple" />);
      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(2);
    });

    test('search-results mode handles search data', () => {
      render(
        <ArticleGrid 
          searchResults={mockSearchResults} 
          mode="search-results"
        />
      );
      expect(screen.getByText('Search Result 1')).toBeDefined();
    });
  });

  describe('Grid Configuration', () => {
    test('applies correct column configuration', () => {
      const { container } = render(
        <ArticleGrid items={mockItems} columns={4} />
      );
      const gridElement = container.querySelector('.grid-cols-4');
      expect(gridElement).toBeTruthy();
    });

    test('applies correct gap configuration', () => {
      const { container } = render(
        <ArticleGrid items={mockItems} gap="lg" />
      );
      const gridElement = container.querySelector('.gap-lg');
      expect(gridElement).toBeTruthy();
    });
  });

  describe('Badge Support', () => {
    test('renders badges when showBadgeSymbols is true', () => {
      const itemsWithBadges = [
        {
          ...mockItems[0],
          badge: { symbol: 'Al', materialType: 'alloy' }
        }
      ];
      
      render(
        <ArticleGrid 
          items={itemsWithBadges} 
          showBadgeSymbols={true}
        />
      );
      
      const card = screen.getByTestId('card');
      expect(card.getAttribute('data-badge')).toBe('Al');
    });

    test('hides badges when showBadgeSymbols is false', () => {
      const itemsWithBadges = [
        {
          ...mockItems[0],
          badge: { symbol: 'Al', materialType: 'alloy' }
        }
      ];
      
      render(
        <ArticleGrid 
          items={itemsWithBadges} 
          showBadgeSymbols={false}
        />
      );
      
      const card = screen.getByTestId('card');
      expect(card.getAttribute('data-badge')).toBeNull();
    });
  });

  describe('Backward Compatibility', () => {
    test('works as SearchResultsGrid', () => {
      const { SearchResultsGrid } = require('../../app/components/SearchResults/SearchResultsGrid');
      render(<SearchResultsGrid searchResults={mockSearchResults} />);
      expect(screen.getByText('Search Result 1')).toBeDefined();
    });

    test('works as UnifiedArticleGrid', () => {
      const { UnifiedArticleGrid } = require('../../app/components/ArticleGrid');
      render(<UnifiedArticleGrid items={mockItems} />);
      expect(screen.getByText('Test Item 1')).toBeDefined();
    });

    test('works as CategoryGroupedGrid', () => {
      const { CategoryGroupedGrid } = require('../../app/components/ArticleGrid');
      render(<CategoryGroupedGrid items={mockItems} mode="category-grouped" />);
      expect(screen.getByText('Test Item 1')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('handles empty items gracefully', () => {
      render(<ArticleGrid items={[]} />);
      expect(screen.queryByTestId('card')).toBeNull();
    });

    test('handles missing titles gracefully', () => {
      const itemsWithoutTitles = [
        {
          slug: 'no-title-item',
          description: 'Item without title'
        }
      ];
      
      render(<ArticleGrid items={itemsWithoutTitles} />);
      expect(screen.getByText('No Title Item')).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('renders large lists efficiently', () => {
      const largeItemList = Array.from({ length: 100 }, (_, i) => ({
        slug: `item-${i}`,
        title: `Item ${i}`,
        description: `Description ${i}`
      }));
      
      const startTime = performance.now();
      render(<ArticleGrid items={largeItemList} />);
      const endTime = performance.now();
      
      // Should render 100 items in reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getAllByTestId('card')).toHaveLength(100);
    });
  });
});

describe('ArticleGrid SSR Support', () => {
  // Server-side rendering tests would go here
  test('ArticleGridSSR export exists', () => {
    const { ArticleGridSSR } = require('../../app/components/ArticleGrid');
    expect(ArticleGridSSR).toBeDefined();
  });
});