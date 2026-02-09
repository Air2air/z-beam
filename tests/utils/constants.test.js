// tests/utils/constants.test.js
// Tests for application constants

import { 
  SITE_CONFIG, 
  ANIMATION_CONFIG, 
  COMPONENT_DEFAULTS, 
  BREAKPOINTS 
} from '@/config';

describe('Constants', () => {
  describe('SITE_CONFIG', () => {
    test('should have required properties', () => {
      expect(SITE_CONFIG).toHaveProperty('name');
      expect(SITE_CONFIG).toHaveProperty('description');
      expect(SITE_CONFIG).toHaveProperty('url');
    });

    test('should have correct site name', () => {
      expect(SITE_CONFIG.name).toBe('Z-Beam Laser Cleaning');
    });

    test('should have descriptive site description', () => {
      expect(SITE_CONFIG.description).toBe('San Francisco Bay Area industrial laser cleaning equipment rental with training and support. Serving Silicon Valley, East Bay, Peninsula, North Bay, and secondary coverage throughout California. Self-service laser systems for rust removal, surface prep, and coating removal.');
    });

    test('should return localhost URL in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Re-require the module to get fresh environment evaluation
      jest.resetModules();
      const { SITE_CONFIG: devConfig } = require('../../app/utils/constants');
      
      expect(devConfig.url).toBe('http://localhost:3000');
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should return production URL in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Re-require the module to get fresh environment evaluation
      jest.resetModules();
      const { SITE_CONFIG: prodConfig } = require('../../app/utils/constants');
      
      expect(prodConfig.url).toBe('https://www.z-beam.com');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('ANIMATION_CONFIG', () => {
    test('should have durations configuration', () => {
      expect(ANIMATION_CONFIG.durations).toEqual({
        fast: 0.3,
        normal: 0.6,
        slow: 1.0,
      });
    });

    test('should have delays configuration', () => {
      expect(ANIMATION_CONFIG.delays).toEqual({
        none: 0,
        short: 0.1,
        medium: 0.2,
        long: 0.3,
      });
    });

    test('should have easing configuration', () => {
      expect(ANIMATION_CONFIG.easing).toEqual({
        easeOut: [0.04, 0.62, 0.23, 0.98],
        easeIn: [0.4, 0, 1, 1],
        easeInOut: [0.4, 0, 0.2, 1],
      });
    });

    test('should have numeric duration values', () => {
      Object.values(ANIMATION_CONFIG.durations).forEach(duration => {
        expect(typeof duration).toBe('number');
        expect(duration).toBeGreaterThan(0);
      });
    });

    test('should have numeric delay values', () => {
      Object.values(ANIMATION_CONFIG.delays).forEach(delay => {
        expect(typeof delay).toBe('number');
        expect(delay).toBeGreaterThanOrEqual(0);
      });
    });

    test('should have properly formatted easing arrays', () => {
      Object.values(ANIMATION_CONFIG.easing).forEach(easing => {
        expect(Array.isArray(easing)).toBe(true);
        expect(easing).toHaveLength(4);
        easing.forEach(value => {
          expect(typeof value).toBe('number');
        });
      });
    });
  });

  describe('COMPONENT_DEFAULTS', () => {
    test('should have image defaults', () => {
      expect(COMPONENT_DEFAULTS.image).toEqual({
        loadingTimeMs: 300,
        placeholder: '/images/placeholder.jpg',
      });
    });

    test('should have pagination defaults', () => {
      expect(COMPONENT_DEFAULTS.pagination).toEqual({
        itemsPerPage: 12,
      });
    });

    test('should have card defaults', () => {
      expect(COMPONENT_DEFAULTS.card).toEqual({
        imageHeight: 128,
        borderRadius: 'rounded-md',
      });
    });

    test('should have valid image loading time', () => {
      expect(COMPONENT_DEFAULTS.image.loadingTimeMs).toBeGreaterThan(0);
      expect(typeof COMPONENT_DEFAULTS.image.loadingTimeMs).toBe('number');
    });

    test('should have valid placeholder path', () => {
      expect(COMPONENT_DEFAULTS.image.placeholder).toMatch(/^\/images\/.+\.(jpg|jpeg|png|webp)$/);
    });

    test('should have valid items per page', () => {
      expect(COMPONENT_DEFAULTS.pagination.itemsPerPage).toBeGreaterThan(0);
      expect(typeof COMPONENT_DEFAULTS.pagination.itemsPerPage).toBe('number');
    });

    test('should have valid image height', () => {
      expect(COMPONENT_DEFAULTS.card.imageHeight).toBeGreaterThan(0);
      expect(typeof COMPONENT_DEFAULTS.card.imageHeight).toBe('number');
    });

    test('should have valid Tailwind border radius class', () => {
      expect(COMPONENT_DEFAULTS.card.borderRadius).toMatch(/^rounded-/);
    });
  });

  describe('BREAKPOINTS', () => {
    test('should have all standard breakpoints', () => {
      expect(BREAKPOINTS).toEqual({
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      });
    });

    test('should have proper pixel format', () => {
      Object.values(BREAKPOINTS).forEach(breakpoint => {
        expect(breakpoint).toMatch(/^\d+px$/);
      });
    });

    test('should be in ascending order', () => {
      const values = Object.values(BREAKPOINTS).map(bp => parseInt(bp));
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });

    test('should start with reasonable mobile-first breakpoint', () => {
      expect(parseInt(BREAKPOINTS.sm)).toBeGreaterThanOrEqual(320);
    });

    test('should have desktop breakpoint', () => {
      expect(parseInt(BREAKPOINTS.lg)).toBeGreaterThanOrEqual(1024);
    });
  });

  describe('Configuration coherence', () => {
    test('animation durations should be in logical order', () => {
      expect(ANIMATION_CONFIG.durations.fast).toBeLessThan(ANIMATION_CONFIG.durations.normal);
      expect(ANIMATION_CONFIG.durations.normal).toBeLessThan(ANIMATION_CONFIG.durations.slow);
    });

    test('animation delays should be in logical order', () => {
      expect(ANIMATION_CONFIG.delays.none).toBeLessThan(ANIMATION_CONFIG.delays.short);
      expect(ANIMATION_CONFIG.delays.short).toBeLessThan(ANIMATION_CONFIG.delays.medium);
      expect(ANIMATION_CONFIG.delays.medium).toBeLessThan(ANIMATION_CONFIG.delays.long);
    });

    test('image loading time should be reasonable', () => {
      expect(ANIMATION_CONFIG.durations.fast * 1000).toBeLessThanOrEqual(COMPONENT_DEFAULTS.image.loadingTimeMs);
    });

    test('pagination items per page should be reasonable', () => {
      expect(COMPONENT_DEFAULTS.pagination.itemsPerPage).toBeGreaterThanOrEqual(6);
      expect(COMPONENT_DEFAULTS.pagination.itemsPerPage).toBeLessThanOrEqual(50);
    });
  });
});
