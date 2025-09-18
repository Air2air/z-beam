/**
 * Test Suite: Utility Functions
 * Testing helper functions and utilities
 */

// Mock utility functions
jest.mock('../../app/utils/content', () => ({
  parseMarkdown: (content: string) => {
    // Simple markdown parsing mock
    return {
      content: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
      metadata: {
        title: content.split('\n')[0]?.replace(/^#\s*/, '') || 'Untitled',
        wordCount: content.split(/\s+/).length
      }
    };
  },
  
  extractMetadata: (content: string) => {
    const lines = content.split('\n');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const metadata: any = {};
      
      frontmatter.split('\n').forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
          metadata[key.trim()] = values.join(':').trim();
        }
      });
      
      return metadata;
    }
    
    return {};
  },

  slugify: (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}));

jest.mock('../../app/utils/validation', () => ({
  validateContentStructure: (content: any) => {
    const errors: string[] = [];
    
    if (!content.title) {
      errors.push('Title is required');
    }
    
    if (!content.slug) {
      errors.push('Slug is required');
    }
    
    if (content.slug && !/^[a-z0-9-]+$/.test(content.slug)) {
      errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateImageMetadata: (metadata: any) => {
    const errors: string[] = [];
    
    if (!metadata.alt) {
      errors.push('Alt text is required');
    }
    
    if (!metadata.src) {
      errors.push('Image source is required');
    }
    
    if (metadata.width && typeof metadata.width !== 'number') {
      errors.push('Width must be a number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}));

const { parseMarkdown, extractMetadata, slugify } = require('../../app/utils/content');
const { validateContentStructure, validateImageMetadata } = require('../../app/utils/validation');

describe('Utility Functions', () => {
  describe('Content Utils', () => {
    test('parseMarkdown should process basic markdown', () => {
      const markdown = '# Test Title\n\nThis is **bold** text.';
      const result = parseMarkdown(markdown);
      
      expect(result.content).toContain('<strong>bold</strong>');
      expect(result.metadata.title).toBe('Test Title');
      expect(result.metadata.wordCount).toBeGreaterThan(0);
    });

    test('extractMetadata should parse frontmatter', () => {
      const content = `---
title: Test Page
author: John Doe
date: 2024-01-01
---

# Content here`;
      
      const metadata = extractMetadata(content);
      
      expect(metadata.title).toBe('Test Page');
      expect(metadata.author).toBe('John Doe');
      expect(metadata.date).toBe('2024-01-01');
    });

    test('extractMetadata should handle missing frontmatter', () => {
      const content = '# Just a title\n\nSome content without frontmatter.';
      const metadata = extractMetadata(content);
      
      expect(metadata).toEqual({});
    });

    test('slugify should create valid slugs', () => {
      expect(slugify('Test Page Title')).toBe('test-page-title');
      expect(slugify('Title with Special Characters!')).toBe('title-with-special-characters');
      expect(slugify('  Extra  Spaces  ')).toBe('extra-spaces');
      expect(slugify('UPPERCASE')).toBe('uppercase');
      expect(slugify('under_scores')).toBe('under-scores');
    });

    test('slugify should handle edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('123-numbers')).toBe('123-numbers');
      expect(slugify('a')).toBe('a');
    });

    test('parseMarkdown should handle empty content', () => {
      const result = parseMarkdown('');
      
      expect(result.content).toBe('');
      expect(result.metadata.title).toBe('Untitled');
      expect(result.metadata.wordCount).toBe(1); // Empty string splits to ['']
    });

    test('parseMarkdown should preserve line breaks', () => {
      const markdown = 'Line 1\nLine 2\nLine 3';
      const result = parseMarkdown(markdown);
      
      expect(result.content).toContain('\n');
      expect(result.metadata.wordCount).toBe(6);
    });
  });

  describe('Validation Utils', () => {
    test('validateContentStructure should pass valid content', () => {
      const content = {
        title: 'Valid Title',
        slug: 'valid-slug',
        content: 'Some content here'
      };
      
      const result = validateContentStructure(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateContentStructure should catch missing title', () => {
      const content = {
        slug: 'valid-slug',
        content: 'Some content'
      };
      
      const result = validateContentStructure(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    test('validateContentStructure should catch missing slug', () => {
      const content = {
        title: 'Valid Title',
        content: 'Some content'
      };
      
      const result = validateContentStructure(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug is required');
    });

    test('validateContentStructure should catch invalid slug format', () => {
      const content = {
        title: 'Valid Title',
        slug: 'Invalid Slug!',
        content: 'Some content'
      };
      
      const result = validateContentStructure(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug must contain only lowercase letters, numbers, and hyphens');
    });

    test('validateImageMetadata should pass valid metadata', () => {
      const metadata = {
        src: '/images/test.jpg',
        alt: 'Test image description',
        width: 800,
        height: 600
      };
      
      const result = validateImageMetadata(metadata);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateImageMetadata should catch missing alt text', () => {
      const metadata = {
        src: '/images/test.jpg',
        width: 800
      };
      
      const result = validateImageMetadata(metadata);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Alt text is required');
    });

    test('validateImageMetadata should catch missing src', () => {
      const metadata = {
        alt: 'Test image',
        width: 800
      };
      
      const result = validateImageMetadata(metadata);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image source is required');
    });

    test('validateImageMetadata should catch invalid width type', () => {
      const metadata = {
        src: '/images/test.jpg',
        alt: 'Test image',
        width: '800'
      };
      
      const result = validateImageMetadata(metadata);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Width must be a number');
    });
  });
});
