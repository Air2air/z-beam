/**
 * @file breadcrumbs.test.ts
 * @purpose Tests for breadcrumb generation utility
 */

import { generateBreadcrumbs, breadcrumbsToSchema } from '@/app/utils/breadcrumbs';
import { ArticleMetadata } from '@/types';

describe('Breadcrumbs', () => {
  describe('generateBreadcrumbs', () => {
    it('should always start with Home', () => {
      const result = generateBreadcrumbs(null, '/');
      expect(result[0]).toEqual({ label: 'Home', href: '/' });
    });

    it('should use explicit breadcrumb from frontmatter', () => {
      const frontmatter = {
        breadcrumb: [
          { label: 'Home', href: '/' },
          { label: 'Materials', href: '/materials' },
          { label: 'Aluminum', href: '/materials/aluminum' },
        ],
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/aluminum');
      expect(result).toEqual(frontmatter.breadcrumb);
    });

    it('should filter invalid breadcrumb items', () => {
      const frontmatter = {
        breadcrumb: [
          { label: 'Home', href: '/' },
          { label: 'Valid', href: '/valid' },
          { label: 123 } as any, // Invalid - no href
          null as any, // Invalid
          { href: '/no-label' } as any, // Invalid - no label
        ],
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/test');
      expect(result.length).toBe(2);
      expect(result[0].label).toBe('Home');
      expect(result[1].label).toBe('Valid');
    });

    it('should generate from category and subcategory', () => {
      const frontmatter = {
        category: 'metal',
        subcategory: 'ferrous',
        name: 'Steel',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/metal/ferrous/steel');
      
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Metal', href: '/materials/metal' },
        { label: 'Ferrous', href: '/materials/metal/ferrous' },
        { label: 'Steel', href: '/materials/metal/ferrous/steel' },
      ]);
    });

    it('should handle category without subcategory', () => {
      const frontmatter = {
        category: 'ceramic',
        name: 'Alumina',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/ceramic/alumina');
      
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Ceramic', href: '/materials/ceramic' },
        { label: 'Alumina', href: '/materials/ceramic/alumina' },
      ]);
    });

    it('should fallback to pathname segment when no name', () => {
      const frontmatter = {
        category: 'metal',
        subcategory: 'ferrous',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/metal/ferrous/stainless-steel');
      
      expect(result[result.length - 1]).toEqual({
        label: 'Stainless Steel',
        href: '/materials/metal/ferrous/stainless-steel',
      });
    });

    it('should normalize category and subcategory to lowercase slugs', () => {
      const frontmatter = {
        category: 'Rare Earth',
        subcategory: 'High Strength',
        name: 'Test Material',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/test');
      
      expect(result[1].href).toContain('/rare-earth');
      expect(result[2].href).toContain('/high-strength');
    });

    it('should parse from URL when no frontmatter', () => {
      const result = generateBreadcrumbs(null, '/about');
      
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ]);
    });

    it('should handle multi-segment URLs', () => {
      const result = generateBreadcrumbs(null, '/materials/metal/ferrous');
      
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Materials', href: '/materials' },
        { label: 'Metal', href: '/materials/metal' },
        { label: 'Ferrous', href: '/materials/metal/ferrous' },
      ]);
    });

    it('should add Articles for unknown routes', () => {
      const result = generateBreadcrumbs(null, '/some-article');
      
      expect(result).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: 'Some Article', href: '/some-article' },
      ]);
    });

    it('should not add Articles for known static routes', () => {
      const staticRoutes = ['about', 'contact', 'services', 'rental', 'partners', 'search'];
      
      staticRoutes.forEach(route => {
        const result = generateBreadcrumbs(null, `/${route}`);
        expect(result.length).toBe(2);
        expect(result[1].label).toBe(route.charAt(0).toUpperCase() + route.slice(1));
        expect(result.some(crumb => crumb.label === 'Articles')).toBe(false);
      });
    });

    it('should handle root path', () => {
      const result = generateBreadcrumbs(null, '/');
      expect(result).toEqual([{ label: 'Home', href: '/' }]);
    });

    it('should handle empty pathname', () => {
      const result = generateBreadcrumbs(null, '');
      expect(result).toEqual([{ label: 'Home', href: '/' }]);
    });

    it('should capitalize words in labels', () => {
      const result = generateBreadcrumbs(null, '/laser-beam-welding');
      
      expect(result[result.length - 1].label).toBe('Laser Beam Welding');
    });

    it('should handle multi-word categories', () => {
      const frontmatter = {
        category: 'rare earth',
        name: 'Neodymium',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/test');
      
      expect(result[1].label).toBe('Rare Earth');
      expect(result[1].href).toBe('/materials/rare-earth');
    });
  });

  describe('breadcrumbsToSchema', () => {
    it('should generate valid Schema.org BreadcrumbList', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Materials', href: '/materials' },
        { label: 'Metal', href: '/materials/metal' },
      ];

      const schema = breadcrumbsToSchema(breadcrumbs, 'https://z-beam.com');
      
      expect(schema).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://z-beam.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Materials',
            item: 'https://z-beam.com/materials',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Metal',
            item: 'https://z-beam.com/materials/metal',
          },
        ],
      });
    });

    it('should handle single breadcrumb', () => {
      const breadcrumbs = [{ label: 'Home', href: '/' }];
      const schema = breadcrumbsToSchema(breadcrumbs, 'https://z-beam.com');
      
      expect((schema as any).itemListElement.length).toBe(1);
      expect((schema as any).itemListElement[0].position).toBe(1);
    });

    it('should handle empty breadcrumbs array', () => {
      const schema = breadcrumbsToSchema([], 'https://z-beam.com');
      
      expect((schema as any).itemListElement).toEqual([]);
    });

    it('should use correct base URL', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Test', href: '/test' },
      ];

      const schema = breadcrumbsToSchema(breadcrumbs, 'https://example.com');
      
      expect((schema as any).itemListElement[0].item).toBe('https://example.com/');
      expect((schema as any).itemListElement[1].item).toBe('https://example.com/test');
    });

    it('should maintain breadcrumb order', () => {
      const breadcrumbs = [
        { label: 'First', href: '/first' },
        { label: 'Second', href: '/second' },
        { label: 'Third', href: '/third' },
      ];

      const schema = breadcrumbsToSchema(breadcrumbs, 'https://z-beam.com') as any;
      
      schema.itemListElement.forEach((item: any, index: number) => {
        expect(item.position).toBe(index + 1);
        expect(item.name).toBe(breadcrumbs[index].label);
      });
    });
  });
});
