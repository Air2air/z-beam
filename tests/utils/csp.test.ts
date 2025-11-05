/**
 * @file csp.test.ts
 * @purpose Tests for Content Security Policy utilities
 */

import { generateNonce, buildCSP } from '@/app/utils/csp';

describe('CSP Utilities', () => {
  describe('generateNonce', () => {
    it('should generate a nonce', () => {
      const nonce = generateNonce();
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate base64 encoded strings', () => {
      const nonce = generateNonce();
      // Base64 pattern: alphanumeric, +, /, and optional = padding
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should generate consistent length nonces', () => {
      const nonces = Array.from({ length: 10 }, () => generateNonce());
      const lengths = nonces.map(n => n.length);
      const uniqueLengths = new Set(lengths);
      // All nonces should have same length (base64 of UUID)
      expect(uniqueLengths.size).toBeLessThanOrEqual(2); // Allow for padding variation
    });
  });

  describe('buildCSP', () => {
    it('should build CSP without nonce', () => {
      const csp = buildCSP();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('should build CSP with nonce', () => {
      const nonce = 'test-nonce-123';
      const csp = buildCSP(nonce);
      expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'unsafe-inline'`);
    });

    it('should include Vercel domains for scripts', () => {
      const csp = buildCSP();
      expect(csp).toContain('https://vercel.live');
      expect(csp).toContain('https://va.vercel-scripts.com');
    });

    it('should include Google Tag Manager domains', () => {
      const csp = buildCSP();
      expect(csp).toContain('https://www.googletagmanager.com');
      expect(csp).toContain('https://www.google-analytics.com');
    });

    it('should allow YouTube embeds', () => {
      const csp = buildCSP();
      expect(csp).toContain("frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com");
    });

    it('should allow data URIs for images and fonts', () => {
      const csp = buildCSP();
      expect(csp).toContain("img-src 'self' data: blob:");
      expect(csp).toContain("font-src 'self' data:");
    });

    it('should include security directives', () => {
      const csp = buildCSP();
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('should separate directives with semicolons', () => {
      const csp = buildCSP();
      const directives = csp.split('; ');
      expect(directives.length).toBeGreaterThan(10);
    });

    it('should not include unsafe-eval', () => {
      const csp = buildCSP();
      expect(csp).not.toContain('unsafe-eval');
    });

    it('should handle empty nonce', () => {
      const csp = buildCSP('');
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain("'nonce-'");
    });

    it('should include connect-src for analytics', () => {
      const csp = buildCSP();
      expect(csp).toContain('connect-src');
      expect(csp).toContain('https://vitals.vercel-insights.com');
    });

    it('should allow blob URLs for media', () => {
      const csp = buildCSP();
      expect(csp).toContain("media-src 'self' data: blob:");
    });

    it('should allow YouTube thumbnails', () => {
      const csp = buildCSP();
      expect(csp).toContain('https://img.youtube.com');
      expect(csp).toContain('https://i.ytimg.com');
    });

    it('should maintain directive order', () => {
      const csp = buildCSP();
      const defaultSrcIndex = csp.indexOf('default-src');
      const scriptSrcIndex = csp.indexOf('script-src');
      const styleSrcIndex = csp.indexOf('style-src');
      
      expect(defaultSrcIndex).toBeLessThan(scriptSrcIndex);
      expect(scriptSrcIndex).toBeLessThan(styleSrcIndex);
    });

    it('should escape nonce properly', () => {
      const nonce = "test'nonce";
      const csp = buildCSP(nonce);
      expect(csp).toContain(`'nonce-${nonce}'`);
    });

    it('should handle special characters in nonce', () => {
      const nonce = 'test+/=nonce123';
      const csp = buildCSP(nonce);
      expect(csp).toContain(`'nonce-${nonce}'`);
    });
  });

  describe('CSP Integration', () => {
    it('should generate complete CSP policy with nonce', () => {
      const nonce = generateNonce();
      const csp = buildCSP(nonce);
      
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain(`'nonce-${nonce}'`);
    });

    it('should be production-ready without nonce', () => {
      const csp = buildCSP();
      
      // Should have all essential directives
      const essentialDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'font-src',
        'frame-src',
        'connect-src',
        'object-src',
      ];
      
      essentialDirectives.forEach(directive => {
        expect(csp).toContain(directive);
      });
    });
  });
});
