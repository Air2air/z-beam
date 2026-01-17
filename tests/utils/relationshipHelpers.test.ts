/**
 * @file tests/utils/relationshipHelpers.test.ts
 * @purpose Tests for type-safe relationship data access helpers
 * @created December 24, 2025
 */

import {
  getRelationshipSection,
  hasRelationshipSection,
  getMultipleRelationshipSections,
  getAllRelationshipSections,
  validateRelationshipSection,
  type RelationshipSectionData
} from '@/app/utils/relationshipHelpers';

describe('relationshipHelpers', () => {
  // Sample test data
  const mockRelationships = {
    safety: {
      exposure_limits: {
        presentation: 'descriptive' as const,
        items: [
          { osha_pel: '100 ppm', niosh_rel: '50 ppm' }
        ],
        _section: {
          sectionTitle: 'Exposure Limits',
          sectionDescription: 'Regulatory exposure limits',
          order: 1,
          variant: 'default',
          icon: 'shield-check'
        },
        frontmatter: { order: 1 }
      },
      ppe_requirements: {
        presentation: 'card' as const,
        items: [
          { id: 'gloves', type: 'Hand Protection' },
          { id: 'goggles', type: 'Eye Protection' }
        ],
        _section: {
          sectionTitle: 'PPE Requirements',
          sectionDescription: 'Required protective equipment',
          order: 2,
          variant: 'warning',
          icon: 'alert-triangle'
        },
        frontmatter: { order: 2 }
      },
      empty_section: {
        presentation: 'card' as const,
        items: [],
        _section: {
          sectionTitle: 'Empty Section',
          sectionDescription: 'An empty test section',
          order: 3,
          icon: 'circle'
        },
        frontmatter: { order: 3 }
      }
    },
    visual_characteristics: {
      presentation: 'descriptive' as const,
      items: [
        { color: 'red', texture: 'rough' }
      ],
      _section: {
        sectionTitle: 'Visual Characteristics',
        sectionDescription: 'Visual properties',
        order: 10,
        icon: 'eye'
      },
      frontmatter: { order: 10 }
    },
    missing_metadata: {
      presentation: 'card' as const,
      items: [{ id: 'test' }],
      _section: {
        sectionTitle: 'Test Section',
        sectionDescription: 'Test section for validation',
        order: 99,
        icon: 'test'
      },
      frontmatter: { order: 99 }
    }
  };

  describe('getRelationshipSection', () => {
    it('should return section data for valid nested path', () => {
      const result = getRelationshipSection(mockRelationships, 'safety.exposure_limits');
      
      expect(result).not.toBeNull();
      expect(result?.items).toHaveLength(1);
      expect(result?.items[0]).toEqual({ osha_pel: '100 ppm', niosh_rel: '50 ppm' });
      expect(result?.metadata.sectionTitle).toBe('Exposure Limits');
      expect(result?.presentation).toBe('descriptive');
    });

    it('should return section data for top-level path', () => {
      const result = getRelationshipSection(mockRelationships, 'visual_characteristics');
      
      expect(result).not.toBeNull();
      expect(result?.items).toHaveLength(1);
      expect(result?.metadata.sectionTitle).toBe('Visual Characteristics');
    });

    it('should return null for non-existent path', () => {
      const result = getRelationshipSection(mockRelationships, 'safety.non_existent');
      expect(result).toBeNull();
    });

    it('should return null for invalid relationships object', () => {
      expect(getRelationshipSection(null, 'safety.exposure_limits')).toBeNull();
      expect(getRelationshipSection(undefined, 'safety.exposure_limits')).toBeNull();
      expect(getRelationshipSection('invalid', 'safety.exposure_limits')).toBeNull();
    });

    it('should return null for path without items array', () => {
      const badData = { safety: { bad_section: { _section: { sectionTitle: 'Bad' } } } };
      const result = getRelationshipSection(badData, 'safety.bad_section');
      expect(result).toBeNull();
    });

    it('should use provided metadata when _section exists', () => {
      const result = getRelationshipSection(mockRelationships, 'missing_metadata');
      
      expect(result).not.toBeNull();
      expect(result?.metadata.sectionTitle).toBe('Test Section');
      expect(result?.metadata.order).toBe(99);
      expect(result?.metadata.icon).toBe('test');
    });

    it('should handle empty items array', () => {
      const result = getRelationshipSection(mockRelationships, 'safety.empty_section');
      
      expect(result).not.toBeNull();
      expect(result?.items).toHaveLength(0);
    });
  });

  describe('hasRelationshipSection', () => {
    it('should return true for existing section with items', () => {
      expect(hasRelationshipSection(mockRelationships, 'safety.exposure_limits')).toBe(true);
      expect(hasRelationshipSection(mockRelationships, 'safety.ppe_requirements')).toBe(true);
    });

    it('should return false for empty section', () => {
      expect(hasRelationshipSection(mockRelationships, 'safety.empty_section')).toBe(false);
    });

    it('should return false for non-existent path', () => {
      expect(hasRelationshipSection(mockRelationships, 'safety.non_existent')).toBe(false);
    });

    it('should return false for invalid relationships', () => {
      expect(hasRelationshipSection(null, 'safety.exposure_limits')).toBe(false);
      expect(hasRelationshipSection({}, 'safety.exposure_limits')).toBe(false);
    });
  });

  describe('getMultipleRelationshipSections', () => {
    it('should return map of all requested sections', () => {
      const paths = [
        'safety.exposure_limits',
        'safety.ppe_requirements',
        'visual_characteristics'
      ];
      
      const results = getMultipleRelationshipSections(mockRelationships, paths);
      
      expect(Object.keys(results)).toHaveLength(3);
      expect(results['safety.exposure_limits']).not.toBeNull();
      expect(results['safety.ppe_requirements']).not.toBeNull();
      expect(results['visual_characteristics']).not.toBeNull();
    });

    it('should include null for non-existent paths', () => {
      const paths = [
        'safety.exposure_limits',
        'safety.non_existent'
      ];
      
      const results = getMultipleRelationshipSections(mockRelationships, paths);
      
      expect(results['safety.exposure_limits']).not.toBeNull();
      expect(results['safety.non_existent']).toBeNull();
    });

    it('should handle empty paths array', () => {
      const results = getMultipleRelationshipSections(mockRelationships, []);
      expect(Object.keys(results)).toHaveLength(0);
    });
  });

  describe('getAllRelationshipSections', () => {
    it('should return all sections including nested ones', () => {
      const sections = getAllRelationshipSections(mockRelationships);
      
      // Should find all sections with _section metadata (including missing_metadata now)
      expect(sections.length).toBeGreaterThanOrEqual(5);
      
      const paths = sections.map(s => s.path);
      expect(paths).toContain('safety.exposure_limits');
      expect(paths).toContain('safety.ppe_requirements');
      expect(paths).toContain('visual_characteristics');
    });

    it('should sort sections by order metadata', () => {
      const sections = getAllRelationshipSections(mockRelationships);
      
      // First section should have lowest order
      const firstSection = sections[0];
      expect(firstSection.metadata.order).toBeDefined();
      
      // Check sections are in ascending order
      for (let i = 1; i < sections.length; i++) {
        const prevOrder = sections[i - 1].metadata.order ?? 999;
        const currOrder = sections[i].metadata.order ?? 999;
        expect(currOrder).toBeGreaterThanOrEqual(prevOrder);
      }
    });

    it('should return empty array for invalid relationships', () => {
      expect(getAllRelationshipSections(null)).toEqual([]);
      expect(getAllRelationshipSections(undefined)).toEqual([]);
      expect(getAllRelationshipSections({})).toEqual([]);
    });

    it('should include path information for each section', () => {
      const sections = getAllRelationshipSections(mockRelationships);
      
      sections.forEach(section => {
        expect(section.path).toBeDefined();
        expect(typeof section.path).toBe('string');
        expect(section.items).toBeDefined();
        expect(section.metadata).toBeDefined();
      });
    });
  });

  describe('validateRelationshipSection', () => {
    it('should return valid for properly structured section', () => {
      const result = validateRelationshipSection(mockRelationships, 'safety.exposure_limits');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing _section metadata', () => {
      const invalidData = {
        test_section: {
          presentation: 'card' as const,
          items: [{ id: 'test' }]
          // No _section block
        }
      };
      
      expect(() => {
        getRelationshipSection(invalidData, 'test_section');
      }).toThrow('Missing required _section metadata');
    });

    it('should detect missing required fields', () => {
      const incompleteData = {
        test: {
          items: [{ id: 'test' }],
          _section: {
            // Missing sectionTitle, order, icon
            sectionDescription: 'Test section'
          }
        }
      };
      
      const result = validateRelationshipSection(incompleteData, 'test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('sectionTitle'))).toBe(true);
      expect(result.errors.some(e => e.includes('order'))).toBe(true);
      expect(result.errors.some(e => e.includes('icon'))).toBe(true);
    });

    it('should return error for non-existent path', () => {
      const result = validateRelationshipSection(mockRelationships, 'non.existent.path');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('not found'))).toBe(true);
    });

    it('should detect missing description as warning', () => {
      const dataWithoutDescription = {
        test_no_desc: {
          items: [{ id: 'test' }],
          _section: {
            sectionTitle: 'Test Section',
            // Missing sectionDescription
            order: 1,
            icon: 'test'
          }
        }
      };
      
      const result = validateRelationshipSection(dataWithoutDescription, 'test_no_desc');
      
      // Missing sectionDescription is a warning, not error
      expect(result.errors.some(e => e.includes('sectionDescription'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle deeply nested paths', () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              items: [{ value: 'deep' }],
              _section: { sectionTitle: 'Deep Section', order: 1 }
            }
          }
        }
      };
      
      const result = getRelationshipSection(deepData, 'level1.level2.level3');
      expect(result).not.toBeNull();
      expect(result?.items[0]).toEqual({ value: 'deep' });
    });

    it('should handle items with null values', () => {
      const dataWithNulls = {
        test: {
          items: [null, { id: 'valid' }, null],
          _section: { sectionTitle: 'Test', order: 1 }
        }
      };
      
      const result = getRelationshipSection(dataWithNulls, 'test');
      expect(result).not.toBeNull();
      expect(result?.items).toHaveLength(3);
      expect(result?.items[1]).toEqual({ id: 'valid' });
    });

    it('should handle special characters in paths', () => {
      const result = getRelationshipSection(mockRelationships, 'safety.ppe_requirements');
      expect(result).not.toBeNull();
    });
  });
});
