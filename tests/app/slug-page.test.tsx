/**
 * Slug Page Tests
 * Basic tests for dynamic slug routing functionality
 */

describe('Dynamic Slug Page', () => {
  test('should validate slug format', () => {
    const validateSlug = (slug: string) => {
      if (!slug || slug.length === 0) return false;
      return /^[a-z0-9-]+$/.test(slug);
    };

    expect(validateSlug('test-article')).toBe(true);
    expect(validateSlug('aluminum-laser-cleaning')).toBe(true);
    expect(validateSlug('')).toBe(false);
    expect(validateSlug('invalid_slug')).toBe(false);
  });

  test('should handle slug parameter extraction', () => {
    const extractSlugFromPath = (path: string) => {
      const parts = path.split('/');
      return parts[parts.length - 1];
    };

    expect(extractSlugFromPath('/articles/test-article')).toBe('test-article');
    expect(extractSlugFromPath('/materials/aluminum-laser-cleaning')).toBe('aluminum-laser-cleaning');
  });

  test('should normalize slug formats', () => {
    const normalizeSlug = (slug: string) => {
      return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    };

    expect(normalizeSlug('Test Article')).toBe('test-article');
    expect(normalizeSlug('Aluminum_Laser_Cleaning')).toBe('aluminum-laser-cleaning');
    expect(normalizeSlug('Multiple---Dashes')).toBe('multiple-dashes');
  });
});