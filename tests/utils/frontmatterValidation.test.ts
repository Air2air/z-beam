/**
 * @file tests/utils/frontmatterValidation.test.ts
 * @purpose Tests for frontmatter validation utilities
 * @created December 24, 2025
 */

import {
  validateFrontmatterRelationships,
  validateMultipleFrontmatter,
  type FileValidationResult
} from '@/app/utils/frontmatterValidation';

describe('frontmatterValidation', () => {
  // Sample valid frontmatter
  const validFrontmatter = {
    id: 'test-material',
    name: 'Test Material',
    relationships: {
      safety: {
        exposure_limits: {
          presentation: 'descriptive',
          items: [
            { osha_pel: '100 ppm', niosh_rel: '50 ppm' }
          ],
          _section: {
            title: 'Exposure Limits',
            section_description: 'Regulatory exposure limits',
            order: 1,
            variant: 'default',
            icon: 'shield-check'
          }
        },
        ppe_requirements: {
          presentation: 'card',
          items: [
            { id: 'gloves', type: 'Hand Protection' },
            { id: 'goggles', type: 'Eye Protection' }
          ],
          _section: {
            title: 'PPE Requirements',
            section_description: 'Required protective equipment',
            order: 2,
            variant: 'warning',
            icon: 'alert-triangle'
          }
        }
      }
    }
  };

  describe('validateFrontmatterRelationships', () => {
    it('should pass validation for valid frontmatter', () => {
      const result = validateFrontmatterRelationships(validFrontmatter, 'test.yaml');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.file).toBe('test.yaml');
    });

    it('should handle null frontmatter', () => {
      const result = validateFrontmatterRelationships(null, 'null.yaml');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('null or undefined');
    });

    it('should warn about missing relationships field', () => {
      const noRelationships = {
        id: 'test',
        name: 'Test'
      };
      
      const result = validateFrontmatterRelationships(noRelationships, 'no-rel.yaml');
      
      expect(result.valid).toBe(true); // Warning, not error
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('No relationships field');
    });

    it('should warn about empty relationships', () => {
      const emptyRelationships = {
        id: 'test',
        name: 'Test',
        relationships: {}
      };
      
      const result = validateFrontmatterRelationships(emptyRelationships, 'empty-rel.yaml');
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('contains no sections');
    });

    it('should warn about missing _section metadata', () => {
      const missingMetadata = {
        relationships: {
          test_section: {
            items: [{ id: 'test' }]
            // No _section block
          }
        }
      };
      
      const result = validateFrontmatterRelationships(missingMetadata, 'missing-metadata.yaml');
      
      expect(result.warnings.some(w => w.message.includes('Missing _section metadata'))).toBe(true);
    });

    it('should warn about missing required _section fields', () => {
      const incompleteMetadata = {
        relationships: {
          test_section: {
            items: [{ id: 'test' }],
            _section: {
              // Missing title, order, icon
              section_description: 'Test'
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(incompleteMetadata, 'incomplete.yaml');
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.message.includes('title'))).toBe(true);
      expect(result.warnings.some(w => w.message.includes('order'))).toBe(true);
      expect(result.warnings.some(w => w.message.includes('icon'))).toBe(true);
    });

    it('should detect null items in array', () => {
      const nullItems = {
        relationships: {
          test_section: {
            items: [{ id: 'valid' }, null, { id: 'another' }],
            _section: {
              title: 'Test',
              order: 1,
              icon: 'box'
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(nullItems, 'null-items.yaml');
      
      expect(result.errors.some(e => e.message.includes('null or undefined'))).toBe(true);
    });

    it('should warn about empty items array', () => {
      const emptyItems = {
        relationships: {
          test_section: {
            items: [],
            _section: {
              title: 'Empty',
              description: 'Empty section',
              order: 1,
              icon: 'box'
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(emptyItems, 'empty-items.yaml');
      
      expect(result.warnings.some(w => w.message.includes('empty items array'))).toBe(true);
    });

    it('should warn about card presentation without id field', () => {
      const missingId = {
        relationships: {
          test_section: {
            presentation: 'card',
            items: [{ name: 'Test' }], // Missing id
            _section: {
              title: 'Test Cards',
              order: 1,
              icon: 'box'
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(missingId, 'missing-id.yaml');
      
      expect(result.warnings.some(w => w.message.includes('missing id field'))).toBe(true);
    });

    it('should handle nested relationship sections', () => {
      const nested = {
        relationships: {
          safety: {
            exposure_limits: {
              items: [{ value: 'test' }],
              _section: {
                title: 'Exposure Limits',
                order: 1,
                icon: 'shield-check'
              }
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(nested, 'nested.yaml');
      
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMultipleFrontmatter', () => {
    it('should validate multiple files', () => {
      const files = {
        'file1.yaml': validFrontmatter,
        'file2.yaml': {
          relationships: {
            test: {
              items: [null],
              _section: { title: 'Test', order: 1, icon: 'box' }
            }
          }
        }
      };
      
      const results = validateMultipleFrontmatter(files);
      
      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
    });

    it('should handle empty file list', () => {
      const results = validateMultipleFrontmatter({});
      expect(results).toHaveLength(0);
    });

    it('should include filename in each result', () => {
      const files = {
        'test1.yaml': validFrontmatter,
        'test2.yaml': validFrontmatter
      };
      
      const results = validateMultipleFrontmatter(files);
      
      expect(results[0].file).toBe('test1.yaml');
      expect(results[1].file).toBe('test2.yaml');
    });
  });

  describe('validation result structure', () => {
    it('should include all required fields', () => {
      const result = validateFrontmatterRelationships(validFrontmatter, 'test.yaml');
      
      expect(result).toHaveProperty('file');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should include suggestions in errors', () => {
      const result = validateFrontmatterRelationships(null, 'null.yaml');
      
      expect(result.errors[0]).toHaveProperty('severity');
      expect(result.errors[0]).toHaveProperty('path');
      expect(result.errors[0]).toHaveProperty('message');
      expect(result.errors[0]).toHaveProperty('suggestion');
      expect(result.errors[0].severity).toBe('error');
    });

    it('should include suggestions in warnings', () => {
      const noRel = { id: 'test' };
      const result = validateFrontmatterRelationships(noRel, 'no-rel.yaml');
      
      expect(result.warnings[0]).toHaveProperty('severity');
      expect(result.warnings[0]).toHaveProperty('path');
      expect(result.warnings[0]).toHaveProperty('message');
      expect(result.warnings[0].severity).toBe('warning');
    });
  });

  describe('edge cases', () => {
    it('should handle malformed relationship structure', () => {
      const malformed = {
        relationships: 'not an object'
      };
      
      const result = validateFrontmatterRelationships(malformed, 'malformed.yaml');
      
      // Should handle gracefully, not crash
      expect(result).toBeDefined();
      expect(result.valid).toBe(true); // No sections found, but no error
    });

    it('should handle deeply nested sections', () => {
      const deep = {
        relationships: {
          level1: {
            level2: {
              level3: {
                items: [{ id: 'deep' }],
                _section: {
                  title: 'Deep',
                  order: 1,
                  icon: 'box'
                }
              }
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(deep, 'deep.yaml');
      expect(result.valid).toBe(true);
    });

    it('should handle mixed valid and invalid sections', () => {
      const mixed = {
        relationships: {
          valid_section: {
            items: [{ id: 'test' }],
            _section: {
              title: 'Valid',
              description: 'Valid section',
              order: 1,
              icon: 'box'
            }
          },
          invalid_section: {
            items: [null],
            _section: {
              title: 'Invalid',
              order: 2,
              icon: 'box'
            }
          }
        }
      };
      
      const result = validateFrontmatterRelationships(mixed, 'mixed.yaml');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
