/**
 * Card Component - Schema.org URL Tests
 * 
 * Tests that Card component generates absolute canonical URLs
 * for Schema.org microdata (itemProp="url" and itemProp="image")
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../../app/components/Card/Card';
import { SITE_CONFIG } from '../../app/utils/constants';

// Mock dependencies
jest.mock('../../app/components/Thumbnail/Thumbnail', () => ({
  Thumbnail: () => <div data-testid="thumbnail">Thumbnail</div>
}));

jest.mock('../../app/components/BadgeSymbol/BadgeSymbol', () => ({
  BadgeSymbol: () => <div data-testid="badge">Badge</div>
}));

describe('Card Component - Schema.org URL Generation', () => {
  const mockFrontmatter = {
    title: 'Aluminum Laser Cleaning',
    subject: 'Aluminum',
    description: 'Test description for aluminum',
    images: {
      hero: {
        url: '/images/materials/aluminum-hero.jpg',
        alt: 'Aluminum surface'
      }
    },
    datePublished: '2025-01-15',
    lastModified: '2025-01-20',
    author: 'Test Author'
  };

  describe('URL Metadata', () => {
    it('should generate absolute URL for itemProp="url" with relative href', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const urlMeta = container.querySelector('meta[itemProp="url"]');
      expect(urlMeta).toBeInTheDocument();
      expect(urlMeta?.getAttribute('content')).toBe(
        `${SITE_CONFIG.url}/metal/non-ferrous/aluminum-laser-cleaning`
      );
    });

    it('should use absolute URL as-is for itemProp="url" with full href', () => {
      const absoluteHref = 'https://www.z-beam.com/metal/non-ferrous/aluminum-laser-cleaning';
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href={absoluteHref}
        />
      );

      const urlMeta = container.querySelector('meta[itemProp="url"]');
      expect(urlMeta).toBeInTheDocument();
      expect(urlMeta?.getAttribute('content')).toBe(absoluteHref);
    });

    it('should start URL with canonical domain (www.z-beam.com) in production', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const urlMeta = container.querySelector('meta[itemProp="url"]');
      const content = urlMeta?.getAttribute('content') || '';
      
      // Should use SITE_CONFIG.url as base (localhost in dev, www.z-beam.com in prod)
      expect(content).toContain(SITE_CONFIG.url);
      expect(content).toContain('/metal/non-ferrous/aluminum-laser-cleaning');
    });
  });

  describe('Image Metadata', () => {
    it('should generate absolute URL for itemProp="image" with relative path', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const imageMeta = container.querySelector('meta[itemProp="image"]');
      expect(imageMeta).toBeInTheDocument();
      expect(imageMeta?.getAttribute('content')).toBe(
        `${SITE_CONFIG.url}/images/materials/aluminum-hero.jpg`
      );
    });

    it('should use absolute image URL as-is', () => {
      const absoluteImageUrl = 'https://cdn.example.com/image.jpg';
      const frontmatterWithAbsoluteImage = {
        ...mockFrontmatter,
        images: {
          hero: {
            url: absoluteImageUrl,
            alt: 'Aluminum surface'
          }
        }
      };

      const { container } = render(
        <Card 
          frontmatter={frontmatterWithAbsoluteImage}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const imageMeta = container.querySelector('meta[itemProp="image"]');
      expect(imageMeta).toBeInTheDocument();
      expect(imageMeta?.getAttribute('content')).toBe(absoluteImageUrl);
    });

    it('should start image URL with canonical domain for relative paths', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const imageMeta = container.querySelector('meta[itemProp="image"]');
      const content = imageMeta?.getAttribute('content') || '';
      
      // Should use SITE_CONFIG.url as base (localhost in dev, www.z-beam.com in prod)
      expect(content).toContain(SITE_CONFIG.url);
      expect(content).toContain('/images/materials/aluminum-hero.jpg');
    });

    it('should handle missing image gracefully', () => {
      const frontmatterNoImage = {
        ...mockFrontmatter,
        images: undefined
      };

      const { container } = render(
        <Card 
          frontmatter={frontmatterNoImage}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const imageMeta = container.querySelector('meta[itemProp="image"]');
      expect(imageMeta).not.toBeInTheDocument();
    });
  });

  describe('Other Metadata', () => {
    it('should include author metadata', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toBeInTheDocument();
      expect(authorMeta?.getAttribute('content')).toBe('Test Author');
    });

    it('should include headline metadata', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const headlineMeta = container.querySelector('meta[itemProp="headline"]');
      expect(headlineMeta).toBeInTheDocument();
      expect(headlineMeta?.getAttribute('content')).toBe('Aluminum');
    });

    it('should include description metadata', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const descMeta = container.querySelector('meta[itemProp="description"]');
      expect(descMeta).toBeInTheDocument();
      expect(descMeta?.getAttribute('content')).toBe('Test description for aluminum');
    });
  });

  describe('Schema.org Article Type', () => {
    it('should have Article itemType', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const article = container.querySelector('article[itemType="https://schema.org/Article"]');
      expect(article).toBeInTheDocument();
    });

    it('should have itemScope on article element', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const article = container.querySelector('article[itemScope]');
      expect(article).toBeInTheDocument();
    });
  });

  describe('URL Format Validation', () => {
    it('should use HTTP/HTTPS protocol', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const urlMeta = container.querySelector('meta[itemProp="url"]');
      const content = urlMeta?.getAttribute('content') || '';
      expect(content).toMatch(/^https?:/); // HTTP in dev, HTTPS in prod
    });

    it('should not have trailing slash on URLs', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const urlMeta = container.querySelector('meta[itemProp="url"]');
      const content = urlMeta?.getAttribute('content') || '';
      expect(content).not.toMatch(/\/$/);
    });

    it('should use www subdomain in production URLs', () => {
      const { container } = render(
        <Card 
          frontmatter={mockFrontmatter}
          href="/metal/non-ferrous/aluminum-laser-cleaning"
        />
      );

      const urlMeta = container.querySelector('meta[itemProp="url"]');
      const content = urlMeta?.getAttribute('content') || '';
      
      if (content.includes('z-beam.com')) {
        expect(content).toContain('www.z-beam.com');
      }
    });
  });
});
