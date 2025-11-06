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

    it('should return Home only when no explicit breadcrumb', () => {
      const frontmatter = {
        category: 'metal',
        subcategory: 'ferrous',
        name: 'Steel',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/metal/ferrous/steel');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only without explicit breadcrumb', () => {
      const frontmatter = {
        category: 'ceramic',
        name: 'Alumina',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/ceramic/alumina');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only without explicit breadcrumb array', () => {
      const frontmatter = {
        category: 'metal',
        subcategory: 'ferrous',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/materials/metal/ferrous/stainless-steel');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only without explicit breadcrumb', () => {
      const frontmatter = {
        category: 'Rare Earth',
        subcategory: 'High Strength',
        name: 'Test Material',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/test');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only when no frontmatter', () => {
      const result = generateBreadcrumbs(null, '/about');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only for multi-segment URLs without frontmatter', () => {
      const result = generateBreadcrumbs(null, '/materials/metal/ferrous');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only for unknown routes', () => {
      const result = generateBreadcrumbs(null, '/some-article');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only for static routes without frontmatter', () => {
      const staticRoutes = ['about', 'contact', 'services', 'rental', 'partners', 'search'];
      
      staticRoutes.forEach(route => {
        const result = generateBreadcrumbs(null, `/${route}`);
        // Current implementation only uses explicit breadcrumb from frontmatter
        expect(result.length).toBe(1);
        expect(result[0].label).toBe('Home');
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

    it('should return Home only without frontmatter', () => {
      const result = generateBreadcrumbs(null, '/laser-beam-welding');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
    });

    it('should return Home only without explicit breadcrumb', () => {
      const frontmatter = {
        category: 'rare earth',
        name: 'Neodymium',
      } as Partial<ArticleMetadata>;

      const result = generateBreadcrumbs(frontmatter, '/test');
      
      // Current implementation only uses explicit breadcrumb from frontmatter
      expect(result).toEqual([
        { label: 'Home', href: '/' },
      ]);
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
