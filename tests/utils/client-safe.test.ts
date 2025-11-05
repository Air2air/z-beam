/**
 * @file client-safe.test.ts
 * @purpose Tests for client-safe utility functions
 */

import {
  slugToDisplayName,
  extractSafeValue,
  safeIncludes,
} from '@/app/utils/client-safe';

describe('Client-Safe Utilities', () => {
  describe('slugToDisplayName', () => {
    it('should convert simple slug to display name', () => {
      expect(slugToDisplayName('aluminum')).toBe('Aluminum');
    });

    it('should convert hyphenated slug to title case', () => {
      expect(slugToDisplayName('laser-beam-welding')).toBe('Laser Beam Welding');
    });

    it('should handle multi-word slugs', () => {
      expect(slugToDisplayName('stainless-steel-304')).toBe('Stainless Steel 304');
    });

    it('should handle single character words', () => {
      expect(slugToDisplayName('a-b-c')).toBe('A B C');
    });

    it('should handle slugs with numbers', () => {
      expect(slugToDisplayName('type-304-steel')).toBe('Type 304 Steel');
    });

    it('should handle empty string', () => {
      expect(slugToDisplayName('')).toBe('');
    });

    it('should handle slug without hyphens', () => {
      expect(slugToDisplayName('aluminum')).toBe('Aluminum');
    });

    it('should preserve acronyms correctly', () => {
      expect(slugToDisplayName('nasa-approved')).toBe('Nasa Approved');
    });

    it('should handle trailing/leading hyphens', () => {
      expect(slugToDisplayName('-test-slug-')).toBe(' Test Slug ');
    });

    it('should handle multiple consecutive hyphens', () => {
      expect(slugToDisplayName('test--slug')).toBe('Test  Slug');
    });
  });

  describe('extractSafeValue', () => {
    it('should return string values as-is', () => {
      expect(extractSafeValue('test string')).toBe('test string');
    });

    it('should return empty string for null', () => {
      expect(extractSafeValue(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(extractSafeValue(undefined)).toBe('');
    });

    it('should extract value property from object', () => {
      expect(extractSafeValue({ value: 'test' })).toBe('test');
    });

    it('should extract name property from object', () => {
      expect(extractSafeValue({ name: 'test name' })).toBe('test name');
    });

    it('should extract title property from object', () => {
      expect(extractSafeValue({ title: 'test title' })).toBe('test title');
    });

    it('should prefer value over name', () => {
      expect(extractSafeValue({ value: 'val', name: 'name' })).toBe('val');
    });

    it('should prefer name over title', () => {
      expect(extractSafeValue({ name: 'name', title: 'title' })).toBe('name');
    });

    it('should convert numbers to strings', () => {
      expect(extractSafeValue(42)).toBe('42');
      expect(extractSafeValue(0)).toBe('0');
      expect(extractSafeValue(-10)).toBe('-10');
    });

    it('should convert booleans to strings', () => {
      expect(extractSafeValue(true)).toBe('true');
      expect(extractSafeValue(false)).toBe('false');
    });

    it('should handle objects without value/name/title', () => {
      const result = extractSafeValue({ foo: 'bar', baz: 123 });
      expect(typeof result).toBe('string');
      expect(result).toBe('[object Object]');
    });

    it('should handle empty objects', () => {
      const result = extractSafeValue({});
      expect(typeof result).toBe('string');
    });

    it('should handle arrays', () => {
      const result = extractSafeValue([1, 2, 3]);
      expect(typeof result).toBe('string');
    });

    it('should handle non-string value property', () => {
      const result = extractSafeValue({ value: 123 });
      expect(result).toBe('[object Object]');
    });

    it('should handle non-string name property', () => {
      const result = extractSafeValue({ name: 123 });
      expect(result).toBe('[object Object]');
    });

    it('should handle non-string title property', () => {
      const result = extractSafeValue({ title: 123 });
      expect(result).toBe('[object Object]');
    });
  });

  describe('safeIncludes', () => {
    it('should find substring in text', () => {
      expect(safeIncludes('Hello World', 'World')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(safeIncludes('Hello World', 'world')).toBe(true);
      expect(safeIncludes('hello world', 'WORLD')).toBe(true);
    });

    it('should return false when substring not found', () => {
      expect(safeIncludes('Hello World', 'xyz')).toBe(false);
    });

    it('should return false for empty text', () => {
      expect(safeIncludes('', 'test')).toBe(false);
    });

    it('should return false for empty search term', () => {
      expect(safeIncludes('test', '')).toBe(false);
    });

    it('should return false for both empty', () => {
      expect(safeIncludes('', '')).toBe(false);
    });

    it('should handle null text', () => {
      expect(safeIncludes(null as any, 'test')).toBe(false);
    });

    it('should handle null search term', () => {
      expect(safeIncludes('test', null as any)).toBe(false);
    });

    it('should handle partial matches', () => {
      expect(safeIncludes('Aluminum Alloy', 'min')).toBe(true);
      expect(safeIncludes('Aluminum Alloy', 'loy')).toBe(true);
    });

    it('should handle special characters', () => {
      expect(safeIncludes('Test-123', '-')).toBe(true);
      expect(safeIncludes('Test@Email', '@')).toBe(true);
    });

    it('should find exact matches', () => {
      expect(safeIncludes('Test', 'Test')).toBe(true);
    });

    it('should handle Unicode characters', () => {
      expect(safeIncludes('Café', 'café')).toBe(true);
      expect(safeIncludes('100°C', '°')).toBe(true);
    });
  });
});
