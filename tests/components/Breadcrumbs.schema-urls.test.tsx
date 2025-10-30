/**
 * Breadcrumbs Component - Schema.org URL Tests
 * 
 * Tests that Breadcrumbs component generates absolute canonical URLs
 * for Schema.org microdata (itemProp="item")
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Breadcrumbs } from '@/app/components/Navigation/breadcrumbs';
import { SITE_CONFIG } from '@/app/utils/constants';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/metal/non-ferrous/aluminum-laser-cleaning'
}));

describe('Breadcrumbs Component - Schema.org URL Generation', () => {
  const mockBreadcrumbData = [
    { label: 'Home', href: '/' },
    { label: 'Metal', href: '/metal' },
    { label: 'Non-Ferrous', href: '/metal/non-ferrous' },
    { label: 'Aluminum Laser Cleaning', href: '/metal/non-ferrous/aluminum-laser-cleaning' }
  ];

  describe('URL Metadata', () => {
    it('should generate absolute URLs for all breadcrumb items', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      expect(itemMetas).toHaveLength(4);

      itemMetas.forEach((meta, index) => {
        const expectedUrl = `${SITE_CONFIG.url}${mockBreadcrumbData[index].href}`;
        expect(meta.getAttribute('content')).toBe(expectedUrl);
      });
    });

    it('should include position metadata for each item', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const positionMetas = container.querySelectorAll('meta[itemProp="position"]');
      expect(positionMetas).toHaveLength(4);

      positionMetas.forEach((meta, index) => {
        expect(meta.getAttribute('content')).toBe(String(index + 1));
      });
    });

    it('should use canonical domain (www.z-beam.com) for all URLs', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      
      itemMetas.forEach(meta => {
        const content = meta.getAttribute('content') || '';
        if (content.includes('z-beam.com')) {
          expect(content).toContain('www.z-beam.com');
        }
      });
    });

    it('should handle absolute URLs without modification', () => {
      const absoluteBreadcrumbs = [
        { label: 'Home', href: 'https://www.z-beam.com/' },
        { label: 'Metal', href: 'https://www.z-beam.com/metal' }
      ];

      const { container } = render(
        <Breadcrumbs breadcrumbData={absoluteBreadcrumbs} />
      );

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      
      expect(itemMetas[0].getAttribute('content')).toBe('https://www.z-beam.com/');
      expect(itemMetas[1].getAttribute('content')).toBe('https://www.z-beam.com/metal');
    });
  });

  describe('BreadcrumbList Schema', () => {
    it('should have BreadcrumbList itemType on nav element', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const nav = container.querySelector('nav[itemType="https://schema.org/BreadcrumbList"]');
      expect(nav).toBeInTheDocument();
    });

    it('should have itemScope on nav element', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const nav = container.querySelector('nav[itemScope]');
      expect(nav).toBeInTheDocument();
    });

    it('should have ListItem itemType for each breadcrumb', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const listItems = container.querySelectorAll('li[itemType="https://schema.org/ListItem"]');
      expect(listItems).toHaveLength(4);
    });

    it('should have itemScope on each list item', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const listItems = container.querySelectorAll('li[itemScope]');
      expect(listItems).toHaveLength(4);
    });
  });

  describe('Breadcrumb Labels', () => {
    it('should display correct labels with itemProp="name"', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const names = container.querySelectorAll('span[itemProp="name"]');
      expect(names).toHaveLength(4);
      
      expect(names[0]).toHaveTextContent('Home');
      expect(names[1]).toHaveTextContent('Metal');
      expect(names[2]).toHaveTextContent('Non-Ferrous');
      expect(names[3]).toHaveTextContent('Aluminum Laser Cleaning');
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should have aria-label="Breadcrumb" on nav element', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const nav = container.querySelector('nav[aria-label="Breadcrumb"]');
      expect(nav).toBeInTheDocument();
    });

    it('should mark last item with aria-current="page"', () => {
      render(<Breadcrumbs breadcrumbData={mockBreadcrumbData} />);

      const lastLink = screen.getByText('Aluminum Laser Cleaning').closest('a');
      expect(lastLink).toHaveAttribute('aria-current', 'page');
    });

    it('should use semantic <ol> for breadcrumb list', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const orderedList = container.querySelector('ol');
      expect(orderedList).toBeInTheDocument();
    });
  });

  describe('URL Format Validation', () => {
    it('should use HTTPS protocol for all URLs', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      
      itemMetas.forEach(meta => {
        const content = meta.getAttribute('content') || '';
        expect(content).toMatch(/^https:/);
      });
    });

    it('should not double-slash URLs', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      
      itemMetas.forEach(meta => {
        const content = meta.getAttribute('content') || '';
        expect(content).not.toMatch(/\/\//g); // No double slashes except in https://
        expect(content).toMatch(/^https:\/\/[^/]+/); // HTTPS should be the only //
      });
    });

    it('should handle root path correctly', () => {
      const { container } = render(
        <Breadcrumbs breadcrumbData={mockBreadcrumbData} />
      );

      const firstItem = container.querySelector('meta[itemProp="item"]');
      expect(firstItem?.getAttribute('content')).toBe(`${SITE_CONFIG.url}/`);
    });
  });

  describe('Generated Breadcrumbs (from URL)', () => {
    it('should generate breadcrumbs from pathname when no data provided', () => {
      const { container } = render(<Breadcrumbs />);

      // Should generate from mocked pathname: /metal/non-ferrous/aluminum-laser-cleaning
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      expect(itemMetas.length).toBeGreaterThan(0);
    });

    it('should use absolute URLs in generated breadcrumbs', () => {
      const { container } = render(<Breadcrumbs />);

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      
      itemMetas.forEach(meta => {
        const content = meta.getAttribute('content') || '';
        expect(content).toMatch(/^https:\/\//);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty breadcrumb data', () => {
      const { container } = render(<Breadcrumbs breadcrumbData={[]} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument(); // Component should still render
    });

    it('should handle single breadcrumb item', () => {
      const singleBreadcrumb = [
        { label: 'Home', href: '/' }
      ];

      const { container } = render(<Breadcrumbs breadcrumbData={singleBreadcrumb} />);

      const itemMetas = container.querySelectorAll('meta[itemProp="item"]');
      expect(itemMetas).toHaveLength(1);
      expect(itemMetas[0].getAttribute('content')).toBe(`${SITE_CONFIG.url}/`);
    });

    it('should handle breadcrumb without href', () => {
      const breadcrumbsNoHref = [
        { label: 'Home', href: '/' },
        { label: 'No Link', href: '' }
      ];

      const { container } = render(<Breadcrumbs breadcrumbData={breadcrumbsNoHref} />);

      // Should still render without errors
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });
});
