/**
 * Tests for contentTypeDetection utility
 * Increases coverage for app/utils/contentTypeDetection.ts
 */

import {
  getContentType,
  isMaterialPage,
  isSettingsPage,
  isContaminantPage,
  isCompoundPage,
  getRootPath,
  parseSlug,
} from '@/app/utils/contentTypeDetection';

describe('contentTypeDetection utilities', () => {
  describe('getContentType', () => {
    it('should detect materials content type', () => {
      expect(getContentType('materials/metal/ferrous/steel')).toBe('materials');
      expect(getContentType('materials/aluminum')).toBe('materials');
    });

    it('should detect contaminants content type', () => {
      expect(getContentType('contaminants/oxidation/ferrous/rust')).toBe('contaminants');
      expect(getContentType('contaminants/rust')).toBe('contaminants');
    });

    it('should detect compounds content type', () => {
      expect(getContentType('compounds/toxic-gas/acid-gas')).toBe('compounds');
      expect(getContentType('compounds/oxide')).toBe('compounds');
    });

    it('should detect settings content type', () => {
      expect(getContentType('settings/metal/ferrous/steel-settings')).toBe('settings');
      expect(getContentType('settings/power')).toBe('settings');
    });

    it('should return null for non-content pages', () => {
      expect(getContentType('about')).toBeNull();
      expect(getContentType('contact')).toBeNull();
      expect(getContentType('search')).toBeNull();
    });

    it('should handle empty string', () => {
      expect(getContentType('')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(getContentType('Materials/steel')).toBe('materials');
      expect(getContentType('CONTAMINANTS/rust')).toBe('contaminants');
    });
  });

  describe('isMaterialPage', () => {
    it('should return true for material pages', () => {
      expect(isMaterialPage('materials/steel')).toBe(true);
      expect(isMaterialPage('materials/metal/ferrous/steel')).toBe(true);
    });

    it('should return false for non-material pages', () => {
      expect(isMaterialPage('contaminants/rust')).toBe(false);
      expect(isMaterialPage('about')).toBe(false);
    });
  });

  describe('isSettingsPage', () => {
    it('should return true for settings pages', () => {
      expect(isSettingsPage('settings/power')).toBe(true);
      expect(isSettingsPage('settings/metal/ferrous/steel-settings')).toBe(true);
    });

    it('should return false for non-settings pages', () => {
      expect(isSettingsPage('materials/steel')).toBe(false);
      expect(isSettingsPage('about')).toBe(false);
    });
  });

  describe('isContaminantPage', () => {
    it('should return true for contaminant pages', () => {
      expect(isContaminantPage('contaminants/rust')).toBe(true);
      expect(isContaminantPage('contaminants/oxidation/ferrous/rust')).toBe(true);
    });

    it('should return false for non-contaminant pages', () => {
      expect(isContaminantPage('materials/steel')).toBe(false);
      expect(isContaminantPage('about')).toBe(false);
    });
  });

  describe('isCompoundPage', () => {
    it('should return true for compound pages', () => {
      expect(isCompoundPage('compounds/oxide')).toBe(true);
      expect(isCompoundPage('compounds/toxic-gas/acid-gas')).toBe(true);
    });

    it('should return false for non-compound pages', () => {
      expect(isCompoundPage('materials/steel')).toBe(false);
      expect(isCompoundPage('about')).toBe(false);
    });
  });

  describe('getRootPath', () => {
    it('should return root path for content types', () => {
      expect(getRootPath('materials')).toBe('materials');
      expect(getRootPath('contaminants')).toBe('contaminants');
      expect(getRootPath('compounds')).toBe('compounds');
      expect(getRootPath('settings')).toBe('settings');
    });

    it('should return empty string for null', () => {
      expect(getRootPath(null)).toBe('');
    });
  });

  describe('parseSlug', () => {
    it('should parse material slug', () => {
      const result = parseSlug('materials/metal/ferrous/steel');
      expect(result).toEqual({
        contentType: 'materials',
        category: 'metal',
        subcategory: 'ferrous',
        item: 'steel',
      });
    });

    it('should parse contaminant slug', () => {
      const result = parseSlug('contaminants/oxidation/ferrous');
      expect(result).toEqual({
        contentType: 'contaminants',
        category: 'oxidation',
        subcategory: 'ferrous',
        item: undefined,
      });
    });

    it('should parse simple slug', () => {
      const result = parseSlug('materials/aluminum');
      expect(result).toEqual({
        contentType: 'materials',
        category: 'aluminum',
        subcategory: undefined,
        item: undefined,
      });
    });

    it('should handle non-content slug', () => {
      const result = parseSlug('about');
      expect(result).toEqual({
        contentType: null,
      });
    });

    it('should handle empty string', () => {
      const result = parseSlug('');
      expect(result).toEqual({
        contentType: null,
      });
    });
  });
});
