/**
 * Tests for new consolidation utilities in formatting.ts
 */

import {
  toCategorySlug,
  normalizePropertyName,
  toTitleCase
} from '../../app/utils/formatting';

describe('Consolidation Utilities', () => {
  describe('toCategorySlug', () => {
    it('converts text to lowercase with hyphens', () => {
      expect(toCategorySlug('Industrial Coatings')).toBe('industrial-coatings');
      expect(toCategorySlug('Metals & Alloys')).toBe('metals-&-alloys');
    });

    it('handles empty strings', () => {
      expect(toCategorySlug('')).toBe('');
    });

    it('trims whitespace', () => {
      expect(toCategorySlug('  Test Category  ')).toBe('test-category');
    });
  });

  describe('normalizePropertyName', () => {
    it('converts to lowercase alphanumeric only', () => {
      expect(normalizePropertyName('Melting Point')).toBe('meltingpoint');
      expect(normalizePropertyName('density_kg_m3')).toBe('densitykgm3');
    });

    it('handles empty strings', () => {
      expect(normalizePropertyName('')).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('converts text to title case', () => {
      expect(toTitleCase('hello-world')).toBe('Hello World');
      expect(toTitleCase('laser cleaning')).toBe('Laser Cleaning');
    });

    it('handles empty strings', () => {
      expect(toTitleCase('')).toBe('');
    });
  });
});
