/**
 * @file normalizers.test.ts
 * @purpose Comprehensive tests for data normalizers
 */

import {
  normalizeCategoryFields,
  normalizeAllTextFields,
  normalizeFreshnessTimestamps,
  normalizeRegulatoryStandards,
} from '@/app/utils/normalizers';

describe('Normalizers', () => {
  describe('normalizeCategoryFields', () => {
    it('should normalize TitleCase category to lowercase', () => {
      const data = { category: 'Metal' };
      const result = normalizeCategoryFields(data);
      expect(result.category).toBe('metal');
    });

    it('should handle all supported categories', () => {
      const categories = [
        'Metal', 'Ceramic', 'Composite', 'Polymer', 'Wood',
        'Stone', 'Glass', 'Rare-Earth', 'Natural', 'Semiconductor',
        'Masonry', 'Plastic'
      ];
      
      categories.forEach(cat => {
        const data = { category: cat };
        const result = normalizeCategoryFields(data);
        expect(result.category).toBe(cat.toLowerCase());
      });
    });

    it('should handle already lowercase categories', () => {
      const data = { category: 'metal' };
      const result = normalizeCategoryFields(data);
      expect(result.category).toBe('metal');
    });

    it('should normalize subcategory to lowercase', () => {
      const data = { subcategory: 'Ferrous' };
      const result = normalizeCategoryFields(data);
      expect(result.subcategory).toBe('ferrous');
    });

    it('should normalize both category and subcategory', () => {
      const data = {
        category: 'Metal',
        subcategory: 'Non-Ferrous',
      };
      
      const result = normalizeCategoryFields(data);
      expect(result.category).toBe('metal');
      expect(result.subcategory).toBe('non-ferrous');
    });

    it('should preserve other fields', () => {
      const data = {
        category: 'Ceramic',
        subcategory: 'Oxide',
        name: 'Alumina',
        density: 3.95,
      };
      
      const result = normalizeCategoryFields(data);
      expect(result.name).toBe('Alumina');
      expect(result.density).toBe(3.95);
    });

    it('should handle null/undefined data', () => {
      expect(normalizeCategoryFields(null)).toBeNull();
      expect(normalizeCategoryFields(undefined)).toBeUndefined();
    });

    it('should handle missing category field', () => {
      const data = { name: 'Test' };
      const result = normalizeCategoryFields(data);
      expect(result.name).toBe('Test');
      expect(result.category).toBeUndefined();
    });

    it('should handle non-string subcategory', () => {
      const data = {
        category: 'Metal',
        subcategory: 123 as any,
      };
      
      const result = normalizeCategoryFields(data);
      expect(result.category).toBe('metal');
      expect(result.subcategory).toBe(123);
    });
  });

  describe('normalizeAllTextFields', () => {
    it('should normalize unicode escapes in strings', () => {
      const text = 'Temperature: \\u0394T = 100\\u00B0C';
      const result = normalizeAllTextFields(text);
      expect(result).toContain('Δ');
      expect(result).toContain('°');
    });

    it('should normalize newlines and tabs', () => {
      const text = 'Line 1\\nLine 2\\tTabbed';
      const result = normalizeAllTextFields(text);
      expect(result).toBe('Line 1\nLine 2\tTabbed');
    });

    it('should normalize unicode in objects', () => {
      const data = {
        title: 'Density: 7.85 g/cm\\u00B3',
        temp: '100\\u00B0C',
      };
      
      const result = normalizeAllTextFields(data);
      expect(result.title).toContain('³');
      expect(result.temp).toContain('°');
    });

    it('should normalize unicode in nested objects', () => {
      const data = {
        title: 'Test',
        specs: {
          volume: '1cm\\u00B3',
          area: '5cm\\u00B2',
        },
      };
      
      const result = normalizeAllTextFields(data);
      expect(result.specs.volume).toContain('³');
      expect(result.specs.area).toContain('²');
    });

    it('should normalize unicode in arrays', () => {
      const data = ['\\u00B0C', '\\u03A9', '\\u00B5m'];
      const result = normalizeAllTextFields(data);
      
      expect(result[0]).toContain('°');
      expect(result[1]).toContain('Ω');
      expect(result[2]).toContain('µ');
    });

    it('should handle arrays in objects', () => {
      const data = {
        units: ['cm\\u00B3', 'mm\\u00B2'],
        values: [100, 200],
      };
      
      const result = normalizeAllTextFields(data);
      expect(result.units[0]).toContain('³');
      expect(result.units[1]).toContain('²');
      expect(result.values).toEqual([100, 200]);
    });

    it('should preserve non-string primitives', () => {
      const data = {
        count: 42,
        active: true,
        value: null,
        text: 'Plain text',
      };
      
      const result = normalizeAllTextFields(data);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.value).toBeNull();
      expect(result.text).toBe('Plain text');
    });

    it('should handle null/undefined', () => {
      expect(normalizeAllTextFields(null)).toBeNull();
      expect(normalizeAllTextFields(undefined)).toBeUndefined();
    });

    it('should handle empty objects and arrays', () => {
      expect(normalizeAllTextFields({})).toEqual({});
      expect(normalizeAllTextFields([])).toEqual([]);
    });

    it('should handle deeply nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              text: '100\\u00B0C',
            },
          },
        },
      };
      
      const result = normalizeAllTextFields(data);
      expect(result.level1.level2.level3.text).toContain('°');
    });
  });

  describe('normalizeFreshnessTimestamps', () => {
    const originalDate = Date;
    const mockNow = '2025-11-04T12:00:00.000Z';

    beforeEach(() => {
      global.Date = class extends originalDate {
        constructor() {
          super();
          return new originalDate(mockNow);
        }
        static now() {
          return new originalDate(mockNow).getTime();
        }
        toISOString() {
          return mockNow;
        }
      } as any;
    });

    afterEach(() => {
      global.Date = originalDate;
    });

    it('should add datePublished if missing', () => {
      const data = { title: 'Test' };
      const result = normalizeFreshnessTimestamps(data);
      
      expect(result.datePublished).toBeDefined();
      expect(result.dateModified).toBeDefined();
    });

    it('should initialize dateModified to datePublished', () => {
      const data = {
        datePublished: '2025-01-01T00:00:00.000Z',
      };
      
      const result = normalizeFreshnessTimestamps(data);
      expect(result.dateModified).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should preserve existing timestamps', () => {
      const data = {
        datePublished: '2025-01-01T00:00:00.000Z',
        dateModified: '2025-10-01T00:00:00.000Z',
      };
      
      const result = normalizeFreshnessTimestamps(data);
      expect(result.datePublished).toBe('2025-01-01T00:00:00.000Z');
      expect(result.dateModified).toBe('2025-10-01T00:00:00.000Z');
    });

    it('should handle null/undefined data', () => {
      expect(normalizeFreshnessTimestamps(null)).toBeNull();
      expect(normalizeFreshnessTimestamps(undefined)).toBeUndefined();
    });

    it('should preserve other fields', () => {
      const data = {
        title: 'Test Material',
        category: 'metal',
        density: 7.85,
      };
      
      const result = normalizeFreshnessTimestamps(data);
      expect(result.title).toBe('Test Material');
      expect(result.category).toBe('metal');
      expect(result.density).toBe(7.85);
    });
  });

  describe('normalizeRegulatoryStandards', () => {
    it('should resolve Unknown standard name from id', () => {
      const standards = [
        { name: 'Unknown', id: 'ASTM-A36' },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('ASTM-A36');
    });

    it('should resolve Unknown standard name from abbreviation', () => {
      const standards = [
        { name: 'Unknown', abbreviation: 'ISO-9001' },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('ISO-9001');
    });

    it('should prefer id over abbreviation', () => {
      const standards = [
        { name: 'Unknown', id: 'ASTM-A36', abbreviation: 'A36' },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('ASTM-A36');
    });

    it('should preserve known standard names', () => {
      const standards = [
        { name: 'ASTM A36', id: 'ASTM-A36' },
        { name: 'ISO 9001', id: 'ISO-9001' },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('ASTM A36');
      expect(result[1].name).toBe('ISO 9001');
    });

    it('should handle multiple standards', () => {
      const standards = [
        { name: 'Known Standard', id: 'STD-1' },
        { name: 'Unknown', id: 'STD-2' },
        { name: 'Unknown', abbreviation: 'STD-3' },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('Known Standard');
      expect(result[1].name).toBe('STD-2');
      expect(result[2].name).toBe('STD-3');
    });

    it('should preserve other standard fields', () => {
      const standards = [
        {
          name: 'Unknown',
          id: 'ASTM-A36',
          description: 'Structural steel',
          region: 'US',
        },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('ASTM-A36');
      expect(result[0].description).toBe('Structural steel');
      expect(result[0].region).toBe('US');
    });

    it('should handle non-array input', () => {
      expect(normalizeRegulatoryStandards(null as any)).toBeNull();
      expect(normalizeRegulatoryStandards(undefined as any)).toBeUndefined();
      expect(normalizeRegulatoryStandards({} as any)).toEqual({});
    });

    it('should handle empty array', () => {
      expect(normalizeRegulatoryStandards([])).toEqual([]);
    });

    it('should handle standards without id or abbreviation', () => {
      const standards = [
        { name: 'Unknown' },
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result[0].name).toBe('Unknown'); // Unchanged
    });

    it('should handle non-object array elements', () => {
      const standards = [
        'string standard' as any,
        123 as any,
        null,
      ];
      
      const result = normalizeRegulatoryStandards(standards);
      expect(result).toEqual(['string standard', 123, null]);
    });
  });
});
