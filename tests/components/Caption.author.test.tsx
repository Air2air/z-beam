/**
 * Test Suite: Caption Component Author Object Handling
 * Tests the fix for React rendering error with author objects
 */

import { render } from '@testing-library/react';
import { CaptionImage } from '../../app/components/Caption/CaptionImage';
import { CaptionContent } from '../../app/components/Caption/CaptionContent';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('Caption Components Author Object Handling', () => {
  const mockFrontmatter = {
    title: 'Test Material',
    name: 'test-material',
    images: {
      micro: {
        url: 'test-image.jpg'
      }
    }
  };

  describe('CaptionImage Component', () => {
    test('should handle string author in seoData', () => {
      const seoData = {
        materialType: 'steel',
        description: 'Test description',
        author: 'John Doe'
      };

      const { container } = render(
        <CaptionImage 
          imageSource="test.jpg"
          frontmatter={mockFrontmatter}
          materialName="steel"
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toHaveAttribute('content', 'John Doe');
    });

    test('should handle object author in seoData', () => {
      const seoData = {
        materialType: 'steel',
        description: 'Test description',
        author: {
          id: 'author123',
          name: 'Jane Smith',
          sex: 'F',
          title: 'Senior Engineer',
          country: 'USA',
          expertise: ['Laser Technology'],
          image: 'profile.jpg'
        }
      };

      const { container } = render(
        <CaptionImage 
          imageSource="test.jpg"
          frontmatter={mockFrontmatter}
          materialName="steel"
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toHaveAttribute('content', 'Jane Smith');
    });

    test('should handle missing author name in object', () => {
      const seoData = {
        materialType: 'steel',
        description: 'Test description',
        author: {
          id: 'author123',
          // name is missing
          sex: 'F',
          title: 'Senior Engineer'
        }
      };

      const { container } = render(
        <CaptionImage 
          imageSource="test.jpg"
          frontmatter={mockFrontmatter}
          materialName="steel"
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toHaveAttribute('content', 'Unknown Author');
    });

    test('should not render author meta when author is undefined', () => {
      const seoData = {
        materialType: 'steel',
        description: 'Test description'
        // author is undefined
      };

      const { container } = render(
        <CaptionImage 
          imageSource="test.jpg"
          frontmatter={mockFrontmatter}
          materialName="steel"
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toBeNull();
    });
  });

  describe('CaptionContent Component', () => {
    test('should handle string author in seoData', () => {
      const seoData = {
        description: 'Test description',
        keywords: ['test', 'laser'],
        author: 'Dr. Smith'
      };

      const { container } = render(
        <CaptionContent 
          content="Test content"
          beforeText="Before"
          afterText="After"
          materialName="steel"
          frontmatter={mockFrontmatter}
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toHaveAttribute('content', 'Dr. Smith');
    });

    test('should handle object author in seoData', () => {
      const seoData = {
        description: 'Test description',
        keywords: ['test', 'laser'],
        author: {
          id: 'author456',
          name: 'Dr. Sarah Chen',
          sex: 'F',
          title: 'Research Director',
          country: 'Canada',
          expertise: ['Surface Treatment', 'Laser Physics'],
          image: 'sarah-chen.jpg'
        }
      };

      const { container } = render(
        <CaptionContent 
          content="Test content"
          beforeText="Before"
          afterText="After"
          materialName="aluminum"
          frontmatter={mockFrontmatter}
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toHaveAttribute('content', 'Dr. Sarah Chen');
    });

    test('should provide fallback for author object without name', () => {
      const seoData = {
        description: 'Test description',
        keywords: ['test', 'laser'],
        author: {
          id: 'author789',
          title: 'Engineer'
          // name is missing
        }
      };

      const { container } = render(
        <CaptionContent 
          content="Test content"
          beforeText="Before"
          afterText="After"
          materialName="titanium"
          frontmatter={mockFrontmatter}
          seoData={seoData}
        />
      );

      const authorMeta = container.querySelector('meta[itemProp="author"]');
      expect(authorMeta).toHaveAttribute('content', 'Unknown Author');
    });

    test('should not crash with complex author objects', () => {
      const seoData = {
        description: 'Test description',
        author: {
          id: 'complex-author',
          name: 'Complex Author',
          nested: {
            property: 'value',
            array: [1, 2, 3]
          },
          expertise: ['Advanced Lasers', 'Materials Science']
        }
      };

      expect(() => {
        render(
          <CaptionContent 
            content="Test content"
            beforeText="Before"
            afterText="After"
            materialName="brass"
            frontmatter={mockFrontmatter}
            seoData={seoData}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Author Object Type Safety', () => {
    test('should correctly identify string vs object authors', () => {
      const stringAuthor = 'Simple Author';
      const objectAuthor = { name: 'Object Author', id: '123' };

      expect(typeof stringAuthor).toBe('string');
      expect(typeof objectAuthor).toBe('object');
      
      // Test the same logic used in components
      const stringResult = typeof stringAuthor === 'string' 
        ? stringAuthor 
        : (stringAuthor as any)?.name || 'Unknown Author';
      
      const objectResult = typeof objectAuthor === 'string' 
        ? objectAuthor 
        : (objectAuthor as any)?.name || 'Unknown Author';

      expect(stringResult).toBe('Simple Author');
      expect(objectResult).toBe('Object Author');
    });
  });
});