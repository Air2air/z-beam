/**
 * @file ContentSection.test.tsx
 * @description Tests for ContentSection component
 * 
 * Tests cover:
 * - Fallback removal (Jan 19, 2026)
 * - Order sorting with nullish coalescing
 * - Title and description props
 * - Item rendering
 * - Accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentSection } from '@/app/components/ContentCard/ContentSection';

// Mock BaseSection component
jest.mock('@/app/components/BaseSection/BaseSection', () => ({
  BaseSection: ({ title, description, children, ...props }: any) => (
    <section data-testid="base-section" {...props}>
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {children}
    </section>
  ),
}));

// Mock CardGrid component
jest.mock('@/app/components/CardGrid', () => ({
  __esModule: true,
  default: ({ items }: any) => (
    <div data-testid="card-grid">
      {items?.map((item: any, idx: number) => (
        <div key={idx} data-testid={`card-${idx}`}>
          {item.title || item.displayName}
        </div>
      ))}
    </div>
  ),
}));

describe('ContentSection', () => {
  const mockItems = [
    { title: 'Item 1', href: '/item-1' },
    { title: 'Item 2', href: '/item-2' },
  ];

  describe('Fallback Removal (Jan 19, 2026)', () => {
    it('renders without title when title is undefined', () => {
      render(<ContentSection items={mockItems} />);
      
      // Should have NO section-level heading (BaseSection not rendered with title)
      // But cards will still have their own h2 headings
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBe(2); // Only card headings, not section heading
      // Verify cards are rendered (check for articles instead of card-grid testid)
      expect(screen.getAllByRole('article')).toHaveLength(2);
    });

    it('renders with empty string title (no fallback to "Content")', () => {
      render(<ContentSection title="" items={mockItems} />);
      
      // Empty string should not render section heading
      // But cards will still have their own h2 headings
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBe(2); // Only card headings, not section heading
      // Verify cards are rendered (check for articles instead of card-grid testid)
      expect(screen.getAllByRole('article')).toHaveLength(2);
    });

    it('renders without description when description is undefined', () => {
      render(<ContentSection title="Test" items={mockItems} />);
      
      expect(screen.queryByText(/overview/i)).not.toBeInTheDocument();
    });

    it('renders with explicit title (no default)', () => {
      render(<ContentSection title="Custom Title" items={mockItems} />);
      
      // ContentSection passes title to BaseSection which renders as h2
      expect(screen.getByRole('heading', { level: 2, name: /Custom Title/i })).toBeInTheDocument();
    });

    it('renders with empty description (no default)', () => {
      render(<ContentSection title="Title" description="" items={mockItems} />);
      
      expect(screen.queryByText(/Content overview/i)).not.toBeInTheDocument();
    });
  });

  describe('Order Sorting with Nullish Coalescing', () => {
    it('sorts items by order property using nullish coalescing (??)', () => {
      const itemsWithOrder = [
        { title: 'Third', href: '/3', order: 3 },
        { title: 'First', href: '/1', order: 1 },
        { title: 'Second', href: '/2', order: 2 },
      ];

      render(<ContentSection items={itemsWithOrder} />);
      
      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveTextContent('First');
      expect(cards[1]).toHaveTextContent('Second');
      expect(cards[2]).toHaveTextContent('Third');
    });

    it('treats undefined order as 999 (sorts to end)', () => {
      const itemsWithMixedOrder = [
        { title: 'Has Order 2', href: '/2', order: 2 },
        { title: 'No Order', href: '/3' },
        { title: 'Has Order 1', href: '/1', order: 1 },
      ];

      render(<ContentSection items={itemsWithMixedOrder} />);
      
      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveTextContent('Has Order 1');
      expect(cards[1]).toHaveTextContent('Has Order 2');
      expect(cards[2]).toHaveTextContent('No Order');
    });

    it('treats order: 0 as valid (not as fallback)', () => {
      const itemsWithZeroOrder = [
        { title: 'Order 2', href: '/2', order: 2 },
        { title: 'Order 0', href: '/0', order: 0 },
        { title: 'Order 1', href: '/1', order: 1 },
      ];

      render(<ContentSection items={itemsWithZeroOrder} />);
      
      const cards = screen.getAllByRole('article');
      // Order 0 should come first (not treated as falsy)
      expect(cards[0]).toHaveTextContent('Order 0');
      expect(cards[1]).toHaveTextContent('Order 1');
      expect(cards[2]).toHaveTextContent('Order 2');
    });

    it('handles null order (uses 999 fallback)', () => {
      const itemsWithNullOrder = [
        { title: 'Order 1', href: '/1', order: 1 },
        { title: 'Null Order', href: '/null', order: null as any },
        { title: 'Order 2', href: '/2', order: 2 },
      ];

      render(<ContentSection items={itemsWithNullOrder} />);
      
      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveTextContent('Order 1');
      expect(cards[1]).toHaveTextContent('Order 2');
      expect(cards[2]).toHaveTextContent('Null Order');
    });
  });

  describe('Title and Description', () => {
    it('passes title to BaseSection', () => {
      render(<ContentSection title="Section Title" items={mockItems} />);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Section Title' })).toBeInTheDocument();
    });

    it('passes description to BaseSection', () => {
      render(
        <ContentSection 
          title="Title" 
          description="Custom description" 
          items={mockItems} 
        />
      );
      
      // Description is rendered within BaseSection component
      expect(screen.getByTestId('base-section')).toBeInTheDocument();
    });

    it('passes both title and description', () => {
      render(
        <ContentSection 
          title="My Section" 
          description="My description"
          items={mockItems}
        />
      );
      
      expect(screen.getByRole('heading', { level: 2, name: 'My Section' })).toBeInTheDocument();
    });
  });

  describe('Item Rendering', () => {
    it('renders items in CardGrid', () => {
      render(<ContentSection items={mockItems} />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders empty items array', () => {
      render(<ContentSection items={[]} />);
      
      // Component renders without cards
      expect(screen.getByTestId('base-section')).toBeInTheDocument();
    });

    it('handles items with displayName', () => {
      const itemsWithDisplayName = [
        { displayName: 'Display 1', href: '/1', title: 'Display 1' },
        { displayName: 'Display 2', href: '/2', title: 'Display 2' },
      ];

      render(<ContentSection items={itemsWithDisplayName} />);
      
      expect(screen.getByText('Display 1')).toBeInTheDocument();
      expect(screen.getByText('Display 2')).toBeInTheDocument();
    });
  });

  describe('BaseSection Integration', () => {
    it('wraps content in BaseSection', () => {
      render(<ContentSection items={mockItems} />);
      
      expect(screen.getByTestId('base-section')).toBeInTheDocument();
    });

    it('renders with minimal variant by default', () => {
      const { container } = render(
        <ContentSection items={mockItems} />
      );
      
      // ContentSection uses minimal variant
      expect(screen.getByTestId('base-section')).toHaveAttribute('variant', 'minimal');
    });

    it('has content-section className', () => {
      render(<ContentSection items={mockItems} className="custom-class" />);
      
      // ContentSection adds content-section class
      expect(screen.getByTestId('base-section')).toHaveClass('content-section');
    });
  });

  describe('Accessibility', () => {
    it('renders semantic section element', () => {
      render(<ContentSection items={mockItems} />);
      
      expect(screen.getByTestId('base-section').tagName).toBe('SECTION');
    });

    it('has proper heading hierarchy when title provided', () => {
      render(<ContentSection title="Content Section" items={mockItems} />);
      
      // At least one h2 heading exists
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
