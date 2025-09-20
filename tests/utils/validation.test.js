// tests/utils/validation.test.js
// Tests for validation utilities

import {
  validateContentStructure,
  validateImageMetadata
} from '../../app/utils/validation';

describe('Validation utilities', () => {
  describe('validateContentStructure', () => {
    test('should validate valid content structure', () => {
      const validContent = {
        title: 'Test Property',
        slug: 'test-property',
        content: 'Some content about the property'
      };
      
      const result = validateContentStructure(validContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject content without title', () => {
      const invalidContent = {
        slug: 'test-property',
        content: 'Some content'
      };
      
      const result = validateContentStructure(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    test('should reject content without slug', () => {
      const invalidContent = {
        title: 'Test Property',
        content: 'Some content'
      };
      
      const result = validateContentStructure(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug is required');
    });

    test('should reject invalid slug format', () => {
      const invalidContent = {
        title: 'Test Property',
        slug: 'Test Property!', // invalid characters
        content: 'Some content'
      };
      
      const result = validateContentStructure(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug must contain only lowercase letters, numbers, and hyphens');
    });

    test('should accept valid slug formats', () => {
      const validSlugs = ['test-property', 'property-123', 'simple', 'multi-word-slug'];
      
      validSlugs.forEach(slug => {
        const content = {
          title: 'Test',
          slug: slug,
          content: 'Content'
        };
        
        const result = validateContentStructure(content);
        expect(result.isValid).toBe(true);
      });
    });

    test('should reject invalid slug formats', () => {
      const invalidSlugs = ['Test-Property', 'test_property', 'test property', 'test.property', ''];
      
      invalidSlugs.forEach(slug => {
        const content = {
          title: 'Test',
          slug: slug,
          content: 'Content'
        };
        
        const result = validateContentStructure(content);
        if (slug === '') {
          expect(result.errors).toContain('Slug is required');
        } else {
          expect(result.errors).toContain('Slug must contain only lowercase letters, numbers, and hyphens');
        }
      });
    });

    test('should handle multiple validation errors', () => {
      const invalidContent = {};
      
      const result = validateContentStructure(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Slug is required');
    });

    test('should allow extra properties', () => {
      const contentWithExtras = {
        title: 'Test Property',
        slug: 'test-property',
        content: 'Some content',
        author: 'John Doe',
        date: '2023-01-01',
        categories: ['real-estate', 'property']
      };
      
      const result = validateContentStructure(contentWithExtras);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateImageMetadata', () => {
    test('should validate valid image metadata', () => {
      const validMetadata = {
        src: '/images/property.jpg',
        alt: 'Beautiful property exterior',
        width: 800,
        height: 600
      };
      
      const result = validateImageMetadata(validMetadata);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject metadata without alt text', () => {
      const invalidMetadata = {
        src: '/images/property.jpg',
        width: 800,
        height: 600
      };
      
      const result = validateImageMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Alt text is required');
    });

    test('should reject metadata without src', () => {
      const invalidMetadata = {
        alt: 'Beautiful property',
        width: 800,
        height: 600
      };
      
      const result = validateImageMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image source is required');
    });

    test('should accept minimal required metadata', () => {
      const minimalMetadata = {
        src: '/images/property.jpg',
        alt: 'Property image'
      };
      
      const result = validateImageMetadata(minimalMetadata);
      expect(result.isValid).toBe(true);
    });

    test('should reject non-numeric width', () => {
      const invalidMetadata = {
        src: '/images/property.jpg',
        alt: 'Property image',
        width: '800px' // string instead of number
      };
      
      const result = validateImageMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Width must be a number');
    });

    test('should reject non-numeric height', () => {
      const invalidMetadata = {
        src: '/images/property.jpg',
        alt: 'Property image',
        height: '600px' // string instead of number
      };
      
      const result = validateImageMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Height must be a number');
    });

    test('should handle multiple validation errors', () => {
      const invalidMetadata = {
        width: '800px',
        height: '600px'
      };
      
      const result = validateImageMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Alt text is required');
      expect(result.errors).toContain('Image source is required');
      expect(result.errors).toContain('Width must be a number');
      expect(result.errors).toContain('Height must be a number');
    });

    test('should allow extra properties', () => {
      const metadataWithExtras = {
        src: '/images/property.jpg',
        alt: 'Property image',
        width: 800,
        height: 600,
        className: 'property-image',
        loading: 'lazy',
        style: { borderRadius: '8px' }
      };
      
      const result = validateImageMetadata(metadataWithExtras);
      expect(result.isValid).toBe(true);
    });

    test('should accept zero dimensions', () => {
      const metadataWithZero = {
        src: '/images/property.jpg',
        alt: 'Property image',
        width: 0,
        height: 0
      };
      
      const result = validateImageMetadata(metadataWithZero);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Validation result interface', () => {
    test('should return consistent result structure', () => {
      const validContent = {
        title: 'Test',
        slug: 'test'
      };
      
      const result = validateContentStructure(validContent);
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    test('should return empty errors array for valid input', () => {
      const validMetadata = {
        src: '/test.jpg',
        alt: 'Test image'
      };
      
      const result = validateImageMetadata(validMetadata);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return non-empty errors array for invalid input', () => {
      const invalidContent = {};
      
      const result = validateContentStructure(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach(error => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle null input for content structure', () => {
      const result = validateContentStructure(null);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle undefined input for content structure', () => {
      const result = validateContentStructure(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle null input for image metadata', () => {
      const result = validateImageMetadata(null);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle undefined input for image metadata', () => {
      const result = validateImageMetadata(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle empty string values', () => {
      const contentWithEmptyStrings = {
        title: '',
        slug: '',
        content: ''
      };
      
      const result = validateContentStructure(contentWithEmptyStrings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Slug is required');
    });

    test('should handle whitespace-only values', () => {
      const contentWithWhitespace = {
        title: '   ',
        slug: '   ',
        content: '   '
      };
      
      const result = validateContentStructure(contentWithWhitespace);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Slug is required');
    });
  });
});
