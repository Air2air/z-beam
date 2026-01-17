// tests/utils/searchUtils.test.js
const {
  normalizeString,
  normalizeTag,
  getDisplayName,
  getBadgeFromItem,
  getChemicalProperties
} = require('../../app/utils/searchUtils');

// Import getMaterialColor from its canonical location
const { getMaterialColor } = require('../../app/utils/badgeSystem');

describe('Search Utils', () => {
  describe('getMaterialColor', () => {
    test('should return correct colors for material types', () => {
      expect(getMaterialColor('metal')).toBe('blue');
      expect(getMaterialColor('alloy')).toBe('blue');
      expect(getMaterialColor('element')).toBe('blue');
      expect(getMaterialColor('ceramic')).toBe('green');
      expect(getMaterialColor('polymer')).toBe('purple');
      expect(getMaterialColor('composite')).toBe('orange');
      expect(getMaterialColor('semiconductor')).toBe('red');
      expect(getMaterialColor('compound')).toBe('gray');
      expect(getMaterialColor('other')).toBe('gray'); // badgeColors.ts returns 'gray' for 'other'
    });

    test('should handle case insensitive input', () => {
      expect(getMaterialColor('METAL')).toBe('blue');
      expect(getMaterialColor('Ceramic')).toBe('green');
      expect(getMaterialColor('POLYMER')).toBe('purple');
    });

    test('should default to blue for unknown materials', () => {
      expect(getMaterialColor('unknown')).toBe('blue');
      expect(getMaterialColor('invalid')).toBe('blue');
      expect(getMaterialColor('')).toBe('blue');
    });

    test('should handle undefined input', () => {
      expect(getMaterialColor()).toBe('blue');
      expect(getMaterialColor(null)).toBe('blue');
      expect(getMaterialColor(undefined)).toBe('blue');
    });
  });

  describe('normalizeString', () => {
    test('should normalize strings correctly', () => {
      expect(normalizeString('Hello World')).toBe('hello world');
      expect(normalizeString('  UPPERCASE  ')).toBe('uppercase');
      expect(normalizeString('Mixed-Case_String')).toBe('mixed-case_string');
    });

    test('should handle empty and undefined inputs', () => {
      expect(normalizeString('')).toBe('');
      expect(normalizeString()).toBe('');
      expect(normalizeString(null)).toBe('');
      expect(normalizeString(undefined)).toBe('');
    });

    test('should preserve special characters', () => {
      expect(normalizeString('Al₂O₃')).toBe('al₂o₃');
      expect(normalizeString('Si₃N₄')).toBe('si₃n₄');
    });
  });

  describe('normalizeTag', () => {
    test('should capitalize first letter of each word', () => {
      expect(normalizeTag('laser cleaning')).toBe('Laser Cleaning');
      expect(normalizeTag('INDUSTRIAL MANUFACTURING')).toBe('Industrial Manufacturing');
      expect(normalizeTag('precision-cleaning')).toBe('Precision-Cleaning');
    });

    test('should handle single words', () => {
      expect(normalizeTag('ceramic')).toBe('Ceramic');
      expect(normalizeTag('METAL')).toBe('Metal');
      expect(normalizeTag('polymer')).toBe('Polymer');
    });

    test('should handle empty strings', () => {
      expect(normalizeTag('')).toBe('');
      expect(normalizeTag('   ')).toBe('');
    });

    test('should trim whitespace', () => {
      expect(normalizeTag('  laser cleaning  ')).toBe('Laser Cleaning');
    });
  });

  describe('getDisplayName', () => {
    test('should prioritize name field', () => {
      const item = {
        name: 'Primary Name',
        title: 'Secondary Title',
        frontmatter: { name: 'Metadata Name', title: 'Metadata Title' },
        slug: 'test-slug'
      };

      expect(getDisplayName(item)).toBe('Primary Name');
    });

    test('should fallback to metadata name', () => {
      const item = {
        title: 'Secondary Title',
        frontmatter: { name: 'Metadata Name', title: 'Metadata Title' },
        slug: 'test-slug'
      };

      expect(getDisplayName(item)).toBe('Metadata Name');
    });

    test('should fallback to metadata title', () => {
      const item = {
        title: 'Secondary Title',
        frontmatter: { title: 'Metadata Title' },
        slug: 'test-slug'
      };

      expect(getDisplayName(item)).toBe('Metadata Title');
    });

    test('should fallback to title', () => {
      const item = {
        title: 'Secondary Title',
        slug: 'test-slug'
      };

      expect(getDisplayName(item)).toBe('Secondary Title');
    });

    test('should generate name from slug', () => {
      const item = {
        slug: 'silicon-carbide-cleaning'
      };

      expect(getDisplayName(item)).toBe('Silicon Carbide Cleaning');
    });

    test('should handle items with no identifying information', () => {
      const item = {};
      expect(getDisplayName(item)).toBe('Unnamed Item');
    });
  });

  describe('getBadgeFromItem', () => {
    test('should return existing badge if present', () => {
      const existingBadge = {
        symbol: 'Al',
        formula: 'Al₂O₃',
        materialType: 'ceramic',
        color: 'green'
      };

      const item = {
        badge: existingBadge,
        frontmatter: { subject: 'different' }
      };

      expect(getBadgeFromItem(item)).toBe(existingBadge);
    });

    test('should create badge for alumina', () => {
      const item = {
        frontmatter: {
          subject: 'alumina',
          category: 'ceramic'
        }
      };

      const result = getBadgeFromItem(item);

      expect(result).toEqual({
        symbol: 'Al',
        formula: 'Al₂O₃',
        materialType: 'ceramic',
        color: 'green'
      });
    });

    test('should create badge for silicon nitride', () => {
      const item = {
        frontmatter: {
          subject: 'silicon nitride',
          category: 'ceramic'
        }
      };

      const result = getBadgeFromItem(item);

      expect(result).toEqual({
        symbol: 'Si',
        formula: 'Si₃N₄',
        materialType: 'ceramic',
        color: 'green'
      });
    });

    test('should handle commentMetadata subject', () => {
      const item = {
        frontmatter: {
          commentMetadata: {
            Subject: 'Alumina'
          },
          category: 'ceramic'
        }
      };

      const result = getBadgeFromItem(item);

      expect(result).toEqual({
        symbol: 'Al',
        formula: 'Al₂O₃',
        materialType: 'ceramic',
        color: 'green'
      });
    });

    test('should create generic badge from category', () => {
      const item = {
        frontmatter: {
          category: 'polymer'
        }
      };

      const result = getBadgeFromItem(item);

      expect(result).toEqual({
        materialType: 'polymer',
        color: 'purple'
      });
    });

    test('should handle direct category on item', () => {
      const item = {
        category: 'metal'
      };

      const result = getBadgeFromItem(item);

      expect(result).toEqual({
        materialType: 'alloy', // metal maps to alloy
        color: 'blue'
      });
    });

    test('should return null for items without badge information', () => {
      const item = {};
      expect(getBadgeFromItem(item)).toBeNull();
    });
  });

  describe('getChemicalProperties', () => {
    test('should return existing chemical properties from metadata', () => {
      const existingProps = {
        symbol: 'Ti',
        formula: 'TiO₂',
        materialType: 'ceramic'
      };

      const item = {
        frontmatter: {
          chemicalProperties: existingProps
        }
      };

      expect(getChemicalProperties(item)).toBe(existingProps);
    });

    test('should return chemical properties from metadata', () => {
      const metadataProps = {
        symbol: 'Zr',
        formula: 'ZrO₂',
        materialType: 'ceramic'
      };

      const item = {
        frontmatter: {
          chemicalProperties: metadataProps
        }
      };

      expect(getChemicalProperties(item)).toEqual(metadataProps);
    });

    test('should construct properties from individual metadata fields', () => {
      const item = {
        frontmatter: {
          chemicalSymbol: 'Cu',
          chemicalFormula: 'CuO',
          materialType: 'compound'
        }
      };

      const result = getChemicalProperties(item);

      expect(result).toEqual({
        symbol: 'Cu',
        formula: 'CuO',
        materialType: 'compound'
      });
    });

    test('should use formula as fallback for chemicalFormula', () => {
      const item = {
        frontmatter: {
          chemicalSymbol: 'Fe',
          formula: 'Fe₂O₃',
          category: 'compound'
        }
      };

      const result = getChemicalProperties(item);

      expect(result).toEqual({
        symbol: 'Fe',
        formula: 'Fe₂O₃',
        materialType: 'compound'
      });
    });

    test('should infer properties for known materials', () => {
      const aluminaItem = {
        frontmatter: {
          subject: 'alumina',
          category: 'ceramic'
        }
      };

      const result = getChemicalProperties(aluminaItem);

      expect(result).toEqual({
        symbol: 'Al',
        formula: 'Al₂O₃',
        materialType: 'ceramic'
      });
    });

    test('should infer properties for silicon nitride', () => {
      const item = {
        frontmatter: {
          subject: 'Silicon Nitride',
          category: 'ceramic'
        }
      };

      const result = getChemicalProperties(item);

      expect(result).toEqual({
        symbol: 'Si',
        formula: 'Si₃N₄',
        materialType: 'ceramic'
      });
    });

    test('should return null for items without chemical information', () => {
      const item = {
        frontmatter: {
          title: 'Some Article'
        }
      };

      expect(getChemicalProperties(item)).toBeNull();
    });

    test('should handle case insensitive subject matching', () => {
      const item = {
        frontmatter: {
          subject: 'ALUMINA',
          category: 'ceramic'
        }
      };

      const result = getChemicalProperties(item);

      expect(result).toEqual({
        symbol: 'Al',
        formula: 'Al₂O₃',
        materialType: 'ceramic'
      });
    });
  });

  describe('material type mapping', () => {
    test('should map metal to alloy', () => {
      const item = { frontmatter: { category: 'metal' } };
      const badge = getBadgeFromItem(item);
      expect(badge.materialType).toBe('alloy');
    });

    test('should map plastic to polymer', () => {
      const item = { frontmatter: { category: 'plastic' } };
      const badge = getBadgeFromItem(item);
      expect(badge.materialType).toBe('polymer');
    });

    test('should map unknown types to other', () => {
      const item = { frontmatter: { category: 'unknown-material' } };
      const badge = getBadgeFromItem(item);
      expect(badge.materialType).toBe('other');
    });
  });
});
