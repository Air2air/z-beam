/**
 * Tests for centralized URL builder utilities
 */

import {
  buildUrl,
  buildUrlFromMetadata,
  buildCategoryUrl,
  buildSubcategoryUrl,
  parseUrl,
  validateUrl,
  getContentType,
  getUrlPatterns
} from '../../app/utils/urlBuilder';

describe('urlBuilder', () => {
  describe('buildUrl', () => {
    it('builds hierarchical URL for materials with category and subcategory', () => {
      const url = buildUrl({
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      });
      expect(url).toBe('/materials/metal/ferrous/steel-laser-cleaning');
    });

    it('builds flat URL when no category/subcategory provided', () => {
      const url = buildUrl({
        slug: 'contact'
      });
      expect(url).toBe('/contact');
    });

    it('builds absolute URL when absolute=true', () => {
      const url = buildUrl({
        category: 'wood',
        subcategory: 'hardwood',
        slug: 'oak-laser-cleaning',
        absolute: true
      });
      // Should start with site base URL (environment-specific)
      expect(url).toMatch(/^https?:\/\/.+\/materials\/wood\/hardwood\/oak-laser-cleaning$/);
      expect(url).toContain('/materials/wood/hardwood/oak-laser-cleaning');
    });

    it('builds flat absolute URL for non-material pages', () => {
      const url = buildUrl({
        slug: 'about',
        absolute: true
      });
      // Should start with site base URL (environment-specific)
      expect(url).toMatch(/^https?:\/\/.+\/about$/);
      expect(url).toContain('/about');
    });

    it('builds flat URL when only category provided (incomplete hierarchy)', () => {
      const url = buildUrl({
        category: 'metal',
        slug: 'test-page'
      });
      expect(url).toBe('/test-page');
    });
  });

  describe('buildUrlFromMetadata', () => {
    it('builds hierarchical URL from material metadata', () => {
      const metadata = {
        category: 'ceramic',
        subcategory: 'oxide',
        slug: 'alumina-laser-cleaning'
      };
      const url = buildUrlFromMetadata(metadata);
      expect(url).toBe('/materials/ceramic/oxide/alumina-laser-cleaning');
    });

    it('builds flat URL from non-material metadata', () => {
      const metadata = {
        slug: 'services'
      };
      const url = buildUrlFromMetadata(metadata);
      expect(url).toBe('/services');
    });

    it('builds absolute URL when absolute=true', () => {
      const metadata = {
        category: 'composite',
        subcategory: 'fiber-reinforced',
        slug: 'carbon-fiber-laser-cleaning'
      };
      const url = buildUrlFromMetadata(metadata, true);
      expect(url).toMatch(/^https?:\/\/.+\/materials\/composite\/fiber-reinforced\/carbon-fiber-laser-cleaning$/);
      expect(url).toContain('/materials/composite/fiber-reinforced/carbon-fiber-laser-cleaning');
    });
  });

  describe('buildCategoryUrl', () => {
    it('builds relative category URL for materials', () => {
      const url = buildCategoryUrl('materials', 'metal');
      expect(url).toBe('/materials/metal');
    });

    it('builds absolute category URL for materials', () => {
      const url = buildCategoryUrl('materials', 'wood', true);
      expect(url).toMatch(/^https?:\/\/.+\/materials\/wood$/);
      expect(url).toContain('/materials/wood');
    });

    it('builds category URL for other root paths', () => {
      const url = buildCategoryUrl('products', 'lasers');
      expect(url).toBe('/products/lasers');
    });
  });

  describe('buildSubcategoryUrl', () => {
    it('builds relative subcategory URL for materials', () => {
      const url = buildSubcategoryUrl('materials', 'metal', 'ferrous');
      expect(url).toBe('/materials/metal/ferrous');
    });

    it('builds absolute subcategory URL for materials', () => {
      const url = buildSubcategoryUrl('materials', 'wood', 'hardwood', true);
      expect(url).toMatch(/^https?:\/\/.+\/materials\/wood\/hardwood$/);
      expect(url).toContain('/materials/wood/hardwood');
    });

    it('builds subcategory URL for other root paths', () => {
      const url = buildSubcategoryUrl('products', 'lasers', 'portable');
      expect(url).toBe('/products/lasers/portable');
    });
  });

  describe('parseUrl', () => {
    it('parses hierarchical material URL', () => {
      const result = parseUrl('/materials/metal/ferrous/steel-laser-cleaning');
      expect(result).toEqual({
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      });
    });

    it('parses flat URL', () => {
      const result = parseUrl('/contact');
      expect(result).toEqual({
        slug: 'contact'
      });
    });

    it('parses absolute URL', () => {
      // Use buildUrl to get environment-aware absolute URL
      const testUrl = buildUrl({
        category: 'wood',
        subcategory: 'hardwood',
        slug: 'oak-laser-cleaning',
        absolute: true
      });
      const result = parseUrl(testUrl);
      expect(result).toEqual({
        category: 'wood',
        subcategory: 'hardwood',
        slug: 'oak-laser-cleaning'
      });
    });

    it('handles URL with leading slash', () => {
      const result = parseUrl('/materials/ceramic/oxide/alumina-laser-cleaning');
      expect(result).toEqual({
        category: 'ceramic',
        subcategory: 'oxide',
        slug: 'alumina-laser-cleaning'
      });
    });
  });

  describe('validateUrl', () => {
    it('validates correct material URL', () => {
      const metadata = {
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      };
      const url = '/materials/metal/ferrous/steel-laser-cleaning';
      expect(validateUrl(url, metadata)).toBe(true);
    });

    it('validates correct absolute material URL', () => {
      const metadata = {
        category: 'wood',
        subcategory: 'hardwood',
        slug: 'oak-laser-cleaning'
      };
      // Use buildUrlFromMetadata to get environment-aware URL
      const url = buildUrlFromMetadata(metadata, true);
      expect(validateUrl(url, metadata)).toBe(true);
    });

    it('invalidates incorrect material URL', () => {
      const metadata = {
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      };
      const url = '/steel-laser-cleaning'; // Old flat URL
      expect(validateUrl(url, metadata)).toBe(false);
    });

    it('validates correct flat URL for non-material', () => {
      const metadata = {
        slug: 'contact'
      };
      const url = '/contact';
      expect(validateUrl(url, metadata)).toBe(true);
    });
  });

  describe('getContentType', () => {
    it('identifies material content type', () => {
      const metadata = {
        category: 'metal',
        subcategory: 'ferrous'
      };
      expect(getContentType(metadata)).toBe('material');
    });

    it('identifies service content type', () => {
      const metadata = {
        articleType: 'service'
      };
      expect(getContentType(metadata)).toBe('service');
    });

    it('identifies article content type', () => {
      const metadata = {
        articleType: 'article'
      };
      expect(getContentType(metadata)).toBe('article');
    });

    it('defaults to page for unknown type', () => {
      const metadata = {};
      expect(getContentType(metadata)).toBe('page');
    });

    it('handles undefined metadata', () => {
      expect(getContentType(undefined)).toBe('page');
    });
  });

  describe('getUrlPatterns', () => {
    it('returns all URL patterns', () => {
      const patterns = getUrlPatterns();
      expect(patterns).toEqual({
        material: '/materials/[category]/[subcategory]/[slug]',
        product: '/products/[category]/[subcategory]/[slug]',
        equipment: '/equipment/[category]/[subcategory]/[slug]',
        custom: '/[rootPath]/[category]/[subcategory]/[slug]',
        service: '/[slug]',
        article: '/[slug]',
        page: '/[slug]'
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles slugs with special characters', () => {
      const url = buildUrl({
        category: 'metal',
        subcategory: 'non-ferrous',
        slug: 'aluminum-6061-t6-laser-cleaning'
      });
      expect(url).toBe('/materials/metal/non-ferrous/aluminum-6061-t6-laser-cleaning');
    });

    it('handles empty string slug gracefully', () => {
      const url = buildUrl({
        category: 'metal',
        subcategory: 'ferrous',
        slug: ''
      });
      expect(url).toBe('/materials/metal/ferrous/');
    });

    it('builds URL with only subcategory (missing category)', () => {
      const url = buildUrl({
        subcategory: 'hardwood',
        slug: 'oak-laser-cleaning'
      });
      // Should fall back to flat URL since hierarchy is incomplete
      expect(url).toBe('/oak-laser-cleaning');
    });
  });

  describe('Real-World Examples', () => {
    const testCases = [
      {
        name: 'Wood hardwood (legacy - infers materials)',
        metadata: { category: 'wood', subcategory: 'hardwood', slug: 'ash-laser-cleaning' },
        expected: '/materials/wood/hardwood/ash-laser-cleaning'
      },
      {
        name: 'Metal ferrous (explicit rootPath)',
        metadata: { rootPath: 'materials', category: 'metal', subcategory: 'ferrous', slug: 'carbon-steel-laser-cleaning' },
        expected: '/materials/metal/ferrous/carbon-steel-laser-cleaning'
      },
      {
        name: 'Ceramic oxide',
        metadata: { rootPath: 'materials', category: 'ceramic', subcategory: 'oxide', slug: 'alumina-laser-cleaning' },
        expected: '/materials/ceramic/oxide/alumina-laser-cleaning'
      },
      {
        name: 'Future: Product laser',
        metadata: { rootPath: 'products', category: 'lasers', subcategory: 'portable', slug: 'netalux-compact' },
        expected: '/products/lasers/portable/netalux-compact'
      },
      {
        name: 'Future: Equipment industrial',
        metadata: { rootPath: 'equipment', category: 'industrial', subcategory: 'high-power', slug: 'laser-system-5000' },
        expected: '/equipment/industrial/high-power/laser-system-5000'
      }
    ];

    testCases.forEach(({ name, metadata, expected }) => {
      it(`builds correct URL for ${name}`, () => {
        const url = buildUrlFromMetadata(metadata);
        expect(url).toBe(expected);
      });
    });
  });

  describe('Settings Pages with -settings Suffix', () => {
    it('preserves -settings suffix in slug for settings pages', () => {
      const metadata = {
        rootPath: 'settings',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'stainless-steel-settings'
      };
      const url = buildUrlFromMetadata(metadata);
      expect(url).toBe('/settings/metal/ferrous/stainless-steel-settings');
      expect(url).toContain('-settings');
    });

    it('builds absolute URL for settings page with -settings suffix', () => {
      const metadata = {
        rootPath: 'settings',
        category: 'wood',
        subcategory: 'hardwood',
        slug: 'oak-settings'
      };
      const url = buildUrlFromMetadata(metadata, true);
      expect(url).toMatch(/^https?:\/\/.+\/settings\/wood\/hardwood\/oak-settings$/);
      expect(url).toContain('-settings');
    });

    it('validates settings URL preserves -settings suffix', () => {
      const metadata = {
        rootPath: 'settings',
        category: 'ceramic',
        subcategory: 'oxide',
        slug: 'alumina-settings'
      };
      const url = '/settings/ceramic/oxide/alumina-settings';
      expect(validateUrl(url, metadata)).toBe(true);
    });

    it('invalidates settings URL if -settings suffix is missing', () => {
      const metadata = {
        rootPath: 'settings',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-settings'
      };
      const url = '/settings/metal/ferrous/steel'; // Missing -settings
      expect(validateUrl(url, metadata)).toBe(false);
    });

    it('handles multiple settings pages with different categories', () => {
      const testCases = [
        {
          metadata: { rootPath: 'settings', category: 'metal', subcategory: 'ferrous', slug: 'carbon-steel-settings' },
          expected: '/settings/metal/ferrous/carbon-steel-settings'
        },
        {
          metadata: { rootPath: 'settings', category: 'wood', subcategory: 'softwood', slug: 'pine-settings' },
          expected: '/settings/wood/softwood/pine-settings'
        },
        {
          metadata: { rootPath: 'settings', category: 'composite', subcategory: 'fiber-reinforced', slug: 'carbon-fiber-settings' },
          expected: '/settings/composite/fiber-reinforced/carbon-fiber-settings'
        }
      ];

      testCases.forEach(({ metadata, expected }) => {
        const url = buildUrlFromMetadata(metadata);
        expect(url).toBe(expected);
      });
    });
  });

  describe('E2E URL Generation Accuracy', () => {
    it('handles slug with numbers and hyphens', () => {
      const metadata = {
        rootPath: 'materials',
        category: 'metal',
        subcategory: 'non-ferrous',
        slug: 'aluminum-6061-t6-laser-cleaning'
      };
      const url = buildUrlFromMetadata(metadata);
      expect(url).toBe('/materials/metal/non-ferrous/aluminum-6061-t6-laser-cleaning');
    });

    it('handles settings slug with numbers and complex hyphens', () => {
      const metadata = {
        rootPath: 'settings',
        category: 'metal',
        subcategory: 'non-ferrous',
        slug: 'aluminum-6061-settings'
      };
      const url = buildUrlFromMetadata(metadata);
      expect(url).toBe('/settings/metal/non-ferrous/aluminum-6061-settings');
    });

    it('handles very long slug names', () => {
      const metadata = {
        rootPath: 'materials',
        category: 'composite',
        subcategory: 'fiber-reinforced',
        slug: 'carbon-fiber-reinforced-polymer-with-epoxy-resin-laser-cleaning'
      };
      const url = buildUrlFromMetadata(metadata);
      expect(url).toBe('/materials/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-with-epoxy-resin-laser-cleaning');
    });

    it('builds consistent URLs for same metadata', () => {
      const metadata = {
        rootPath: 'materials',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      };
      const url1 = buildUrlFromMetadata(metadata);
      const url2 = buildUrlFromMetadata(metadata);
      expect(url1).toBe(url2);
    });

    it('distinguishes between materials and settings with same base name', () => {
      const materialUrl = buildUrlFromMetadata({
        rootPath: 'materials',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      });
      const settingsUrl = buildUrlFromMetadata({
        rootPath: 'settings',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-settings'
      });
      expect(materialUrl).toBe('/materials/metal/ferrous/steel-laser-cleaning');
      expect(settingsUrl).toBe('/settings/metal/ferrous/steel-settings');
      expect(materialUrl).not.toBe(settingsUrl);
    });

    it('parses settings URL correctly preserving -settings suffix', () => {
      const result = parseUrl('/settings/metal/ferrous/stainless-steel-settings');
      // Note: parseUrl currently only handles materials path, this test documents current behavior
      // If parseUrl needs to handle settings, it would need updating
      expect(result.slug).toBe('stainless-steel-settings');
    });

    it('validates URL structure matches sitemap generation', () => {
      // Test that our URL building matches what sitemap.ts does
      const metadata = {
        rootPath: 'materials',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      };
      const relativeUrl = buildUrlFromMetadata(metadata, false);
      const absoluteUrl = buildUrlFromMetadata(metadata, true);
      
      // Sitemap uses absolute URLs
      expect(absoluteUrl).toContain(relativeUrl);
      expect(absoluteUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('Sitemap Integration', () => {
    it('builds URLs matching sitemap category page pattern', () => {
      const categoryUrl = buildCategoryUrl('materials', 'metal', true);
      expect(categoryUrl).toMatch(/^https?:\/\/.+\/materials\/metal$/);
    });

    it('builds URLs matching sitemap subcategory page pattern', () => {
      const subcategoryUrl = buildSubcategoryUrl('materials', 'metal', 'ferrous', true);
      expect(subcategoryUrl).toMatch(/^https?:\/\/.+\/materials\/metal\/ferrous$/);
    });

    it('builds URLs matching sitemap material page pattern', () => {
      const materialUrl = buildUrlFromMetadata({
        rootPath: 'materials',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-laser-cleaning'
      }, true);
      expect(materialUrl).toMatch(/^https?:\/\/.+\/materials\/metal\/ferrous\/steel-laser-cleaning$/);
    });

    it('builds URLs matching sitemap settings page pattern', () => {
      const settingsUrl = buildUrlFromMetadata({
        rootPath: 'settings',
        category: 'metal',
        subcategory: 'ferrous',
        slug: 'steel-settings'
      }, true);
      expect(settingsUrl).toMatch(/^https?:\/\/.+\/settings\/metal\/ferrous\/steel-settings$/);
    });
  });
});
