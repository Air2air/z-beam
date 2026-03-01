/**
 * @file tests/seo/robots.test.ts
 * @purpose Verify robots.ts generates correct crawl directives
 *
 * Tests cover:
 * - Correct allow/disallow rules for public vs private routes
 * - Sitemap URL pointing to correct location
 * - Host directive using SITE_CONFIG.url
 * - Content domains (materials, contaminants, etc.) are crawlable
 */

import robots from '@/app/robots';
import { SITE_CONFIG } from '@/app/config/site';

describe('robots.ts', () => {
  let result: ReturnType<typeof robots>;

  beforeAll(() => {
    result = robots();
  });

  describe('Structure', () => {
    it('returns a valid robots config object', () => {
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('includes a rules array', () => {
      expect(Array.isArray(result.rules)).toBe(true);
      expect(result.rules.length).toBeGreaterThan(0);
    });

    it('includes a sitemap directive', () => {
      expect(result.sitemap).toBeDefined();
    });

    it('includes a host directive', () => {
      expect(result.host).toBeDefined();
    });
  });

  describe('Allow rules', () => {
    it('allows root path / for all crawlers', () => {
      const rule = result.rules[0];
      const allowed = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
      expect(allowed).toContain('/');
    });

    it('userAgent targets all crawlers (*)', () => {
      const rule = result.rules[0];
      expect(rule.userAgent).toBe('*');
    });
  });

  describe('Disallow rules — private routes', () => {
    let disallowed: string[];

    beforeAll(() => {
      const rule = result.rules[0];
      disallowed = Array.isArray(rule.disallow)
        ? (rule.disallow as string[])
        : [rule.disallow as string];
    });

    it('disallows /api/', () => {
      expect(disallowed).toContain('/api/');
    });

    it('disallows /admin/', () => {
      expect(disallowed).toContain('/admin/');
    });

    it('disallows /_next/ internals', () => {
      expect(disallowed).toContain('/_next/');
    });

    it('disallows /search with query strings', () => {
      expect(disallowed).toContain('/search?*');
    });

    it('disallows /private/', () => {
      expect(disallowed).toContain('/private/');
    });
  });

  describe('Content domain accessibility', () => {
    let disallowed: string[];

    beforeAll(() => {
      const rule = result.rules[0];
      disallowed = Array.isArray(rule.disallow)
        ? (rule.disallow as string[])
        : [rule.disallow as string];
    });

    it('does NOT disallow /materials/', () => {
      expect(disallowed).not.toContain('/materials/');
    });

    it('does NOT disallow /contaminants/', () => {
      expect(disallowed).not.toContain('/contaminants/');
    });

    it('does NOT disallow /compounds/', () => {
      expect(disallowed).not.toContain('/compounds/');
    });

    it('does NOT disallow /settings/', () => {
      expect(disallowed).not.toContain('/settings/');
    });

    it('does NOT disallow /applications/', () => {
      expect(disallowed).not.toContain('/applications/');
    });
  });

  describe('Sitemap', () => {
    let sitemapUrl: string;

    beforeAll(() => {
      sitemapUrl = Array.isArray(result.sitemap)
        ? result.sitemap[0]
        : (result.sitemap as string);
    });

    it('sitemap URL points to /sitemap-index.xml', () => {
      expect(sitemapUrl).toMatch(/\/sitemap-index\.xml$/);
    });

    it('sitemap URL uses the production base URL from SITE_CONFIG', () => {
      expect(sitemapUrl).toContain(SITE_CONFIG.url);
    });

    it('sitemap URL is an absolute URL', () => {
      expect(sitemapUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('Host directive', () => {
    it('host matches SITE_CONFIG.url', () => {
      expect(result.host).toBe(SITE_CONFIG.url);
    });

    it('host is an absolute URL', () => {
      expect(result.host).toMatch(/^https?:\/\//);
    });
  });

  describe('Crawl behaviour', () => {
    it('sets a crawlDelay to avoid overloading the server', () => {
      const rule = result.rules[0];
      expect(rule.crawlDelay).toBeDefined();
      expect(typeof rule.crawlDelay).toBe('number');
      expect(rule.crawlDelay).toBeGreaterThan(0);
    });
  });
});
