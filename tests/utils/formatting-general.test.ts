// tests/utils/formatting-general.test.ts
import {
  formatDate,
  slugify,
  truncateText,
  capitalizeFirst,
  kebabToTitle,
  formatRelativeDate,
  stripHtml,
  toSentenceCase,
  isValidUrl,
  formatFileSize,
  stripParenthesesFromSlug,
  stripParenthesesFromImageUrl,
  urlEncodeParentheses,
  capitalizeWords,
  slugToDisplayName
} from '@/app/utils/formatting';

describe('Formatting utilities', () => {
  const RealDate = Date;
  
  beforeEach(() => {
    // Fix the current date for relative date tests
    const mockDate = new Date('2024-01-15T10:00:00Z');
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length) {
          return new RealDate(...args);
        }
        return mockDate;
      }
      
      static now() {
        return mockDate.getTime();
      }
    };
  });

  afterEach(() => {
    global.Date = RealDate;
  });

  describe('formatDate', () => {
    test('should format date correctly', () => {
      const result = formatDate('2023-12-25');
      expect(result).toBe('December 25, 2023');
    });

    test('should handle different date formats', () => {
      expect(formatDate('2023-01-01')).toBe('January 1, 2023');
      expect(formatDate('2023-12-31T23:59:59Z')).toBe('December 31, 2023');
    });

    test('should handle ISO date strings', () => {
      const result = formatDate('2023-06-15T14:30:00.000Z');
      expect(result).toBe('June 15, 2023');
    });
  });

  describe('slugify', () => {
    test('should convert text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('This & That')).toBe('this-and-that');
    });

    test('should handle special characters', () => {
      expect(slugify('Test@#$%^&*()!')).toBe('test-and');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });

    test('should ALWAYS strip parentheses from slugs (MANDATORY)', () => {
      expect(slugify('Aluminum (Al)')).toBe('aluminum-al');
      expect(slugify('ABS (Plastic)')).toBe('abs-plastic');
      expect(slugify('Material (Acronym) Process')).toBe('material-acronym-process');
      expect(slugify('Test(NoSpaces)')).toBe('testnospaces');
      expect(slugify('(Leading) Text')).toBe('leading-text');
      expect(slugify('Text (Trailing)')).toBe('text-trailing');
    });

    test('should handle empty and edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('---')).toBe('');
    });

    test('should remove consecutive dashes', () => {
      expect(slugify('Test--Multiple--Dashes')).toBe('test-multiple-dashes');
    });

    test('should trim leading and trailing dashes', () => {
      expect(slugify('-leading')).toBe('leading');
      expect(slugify('trailing-')).toBe('trailing');
      expect(slugify('-both-')).toBe('both');
    });
  });

  describe('truncateText', () => {
    test('should truncate text when over limit', () => {
      const text = 'This is a very long text that should be truncated';
      expect(truncateText(text, 20)).toBe('This is a very long...');
    });

    test('should not truncate when under limit', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    test('should handle exact length match', () => {
      const text = 'Exactly twenty chars';
      expect(truncateText(text, 20)).toBe('Exactly twenty chars');
    });

    test('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('capitalizeFirst', () => {
    test('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('WORLD')).toBe('WORLD');
    });

    test('should handle edge cases', () => {
      expect(capitalizeFirst('')).toBe('');
      expect(capitalizeFirst('a')).toBe('A');
    });

    test('should handle non-string input gracefully', () => {
      expect(capitalizeFirst(null)).toBe(null);
      expect(capitalizeFirst(undefined)).toBe(undefined);
    });
  });

  describe('kebabToTitle', () => {
    test('should convert kebab case to title case', () => {
      expect(kebabToTitle('hello-world')).toBe('Hello World');
      expect(kebabToTitle('multi-word-title')).toBe('Multi Word Title');
    });

    test('should handle single words', () => {
      expect(kebabToTitle('hello')).toBe('Hello');
    });

    test('should handle empty string', () => {
      expect(kebabToTitle('')).toBe('');
    });
  });

  describe('formatRelativeDate', () => {
    test('should format relative dates correctly', () => {
      // Today
      expect(formatRelativeDate('2024-01-15')).toBe('Today');
      
      // Yesterday
      expect(formatRelativeDate('2024-01-14')).toBe('Yesterday');
      
      // Days ago
      expect(formatRelativeDate('2024-01-13')).toBe('2 days ago');
      expect(formatRelativeDate('2024-01-10')).toBe('5 days ago');
      
      // Weeks ago
      expect(formatRelativeDate('2024-01-08')).toBe('1 weeks ago');
      expect(formatRelativeDate('2024-01-01')).toBe('2 weeks ago');
    });

    test('should handle months and years', () => {
      // Months ago
      expect(formatRelativeDate('2023-12-15')).toBe('1 months ago');
      expect(formatRelativeDate('2023-11-15')).toBe('2 months ago');
      
      // Years ago
      expect(formatRelativeDate('2023-01-15')).toBe('1 years ago');
      expect(formatRelativeDate('2022-01-15')).toBe('2 years ago');
    });
  });

  describe('stripHtml', () => {
    test('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello world</p>')).toBe('Hello world');
      expect(stripHtml('<div><span>Nested</span> content</div>')).toBe('Nested content');
    });

    test('should handle self-closing tags', () => {
      expect(stripHtml('Line break<br/>here')).toBe('Line breakhere');
      expect(stripHtml('Image<img src="test.jpg" alt="test"/>here')).toBe('Imagehere');
    });

    test('should handle text without HTML', () => {
      expect(stripHtml('Plain text')).toBe('Plain text');
    });

    test('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('toSentenceCase', () => {
    test('should convert to sentence case', () => {
      expect(toSentenceCase('HELLO WORLD')).toBe('Hello world');
      expect(toSentenceCase('hello world')).toBe('Hello world');
    });

    test('should handle edge cases', () => {
      expect(toSentenceCase('')).toBe('');
      expect(toSentenceCase('a')).toBe('A');
    });

    test('should handle non-string input', () => {
      expect(toSentenceCase(null)).toBe(null);
      expect(toSentenceCase(undefined)).toBe(undefined);
    });
  });

  describe('isValidUrl', () => {
    test('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://test.org')).toBe(true);
      expect(isValidUrl('ftp://files.com')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    test('should handle relative URLs', () => {
      expect(isValidUrl('/relative/path')).toBe(false);
      expect(isValidUrl('relative/path')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    test('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('should handle fractional sizes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1.5)).toBe('1.5 KB');
    });

    test('should handle small byte counts', () => {
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1)).toBe('1 Bytes');
    });
  });

  describe('stripParenthesesFromSlug', () => {
    test('should remove parentheses from slugs', () => {
      expect(stripParenthesesFromSlug('material-(acronym)-process')).toBe('material-acronym-process');
      expect(stripParenthesesFromSlug('test-(value)')).toBe('test-value');
    });

    test('should handle slugs without parentheses', () => {
      expect(stripParenthesesFromSlug('normal-slug')).toBe('normal-slug');
    });

    test('should handle empty and null input', () => {
      expect(stripParenthesesFromSlug('')).toBe('');
      expect(stripParenthesesFromSlug(null)).toBe(null);
      expect(stripParenthesesFromSlug(undefined)).toBe(undefined);
    });
  });

  describe('stripParenthesesFromImageUrl', () => {
    test('should remove parentheses from image URLs', () => {
      expect(stripParenthesesFromImageUrl('/images/material-(acronym)-hero.jpg'))
        .toBe('/images/material-acronym-hero.jpg');
      expect(stripParenthesesFromImageUrl('/path/image-(test).png'))
        .toBe('/path/image-test.png');
    });

    test('should handle URLs without parentheses', () => {
      expect(stripParenthesesFromImageUrl('/images/normal-image.jpg'))
        .toBe('/images/normal-image.jpg');
    });

    test('should handle edge cases', () => {
      expect(stripParenthesesFromImageUrl('')).toBe('');
      expect(stripParenthesesFromImageUrl(null)).toBe(null);
    });
  });

  describe('urlEncodeParentheses', () => {
    test('should encode parentheses for URLs', () => {
      expect(urlEncodeParentheses('image-(test).jpg')).toBe('image-%28test%29.jpg');
      expect(urlEncodeParentheses('/path/file(with)parens.jpg')).toBe('/path/file%28with%29parens.jpg');
    });

    test('should handle URLs without parentheses', () => {
      expect(urlEncodeParentheses('/normal/path.jpg')).toBe('/normal/path.jpg');
    });

    test('should handle edge cases', () => {
      expect(urlEncodeParentheses('')).toBe('');
      expect(urlEncodeParentheses(null)).toBe(null);
    });
  });

  describe('capitalizeWords', () => {
    test('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('multi-word-title')).toBe('Multi Word Title');
    });

    test('should handle mixed separators', () => {
      expect(capitalizeWords('hello-world test')).toBe('Hello World Test');
    });

    test('should handle edge cases', () => {
      expect(capitalizeWords('')).toBe('');
      expect(capitalizeWords('single')).toBe('Single');
    });

    test('should handle non-string input', () => {
      expect(capitalizeWords(null)).toBe(null);
      expect(capitalizeWords(undefined)).toBe(undefined);
    });
  });

  describe('slugToDisplayName', () => {
    test('should convert simple slugs to display names', () => {
      expect(slugToDisplayName('aluminum')).toBe('Aluminum');
      expect(slugToDisplayName('titanium-alloy')).toBe('Titanium Alloy');
    });

    test('should handle multi-word materials', () => {
      expect(slugToDisplayName('silicon-carbide')).toBe('Silicon Carbide');
      expect(slugToDisplayName('silicon-nitride')).toBe('Silicon Nitride');
      expect(slugToDisplayName('aluminum-oxide')).toBe('Aluminum Oxide');
      expect(slugToDisplayName('stainless-steel')).toBe('Stainless Steel');
    });

    test('should extract material names before process words', () => {
      expect(slugToDisplayName('aluminum-laser-cleaning')).toBe('Aluminum');
      expect(slugToDisplayName('titanium-cleaning-process')).toBe('Titanium');
      expect(slugToDisplayName('silicon-carbide-laser-processing')).toBe('Silicon Carbide');
    });

    test('should handle complex multi-word materials with processes', () => {
      expect(slugToDisplayName('stainless-steel-laser-cleaning')).toBe('Stainless Steel');
      expect(slugToDisplayName('carbon-fiber-cleaning')).toBe('Carbon Fiber');
    });

    test('should handle edge cases', () => {
      expect(slugToDisplayName('')).toBe('');
      expect(slugToDisplayName('single')).toBe('Single');
    });

    test('should handle slugs without known patterns', () => {
      expect(slugToDisplayName('custom-material-name')).toBe('Custom Material Name');
    });
  });

  describe('Integration tests', () => {
    test('should chain formatting functions correctly', () => {
      const title = 'My Article Title';
      const slug = slugify(title);
      const displayName = slugToDisplayName(slug);
      
      expect(slug).toBe('my-article-title');
      expect(displayName).toBe('My Article Title');
    });

    test('should handle complex material processing workflows', () => {
      const materialSlug = 'silicon-carbide-laser-cleaning';
      const materialName = slugToDisplayName(materialSlug);
      const capitalizedName = capitalizeWords(materialName);
      
      expect(materialName).toBe('Silicon Carbide');
      expect(capitalizedName).toBe('Silicon Carbide');
    });

    test('should format content for display', () => {
      const htmlContent = '<p>This is <strong>formatted</strong> content</p>';
      const plainText = stripHtml(htmlContent);
      const truncated = truncateText(plainText, 20);
      
      expect(plainText).toBe('This is formatted content');
      expect(truncated).toBe('This is formatted co...');
    });
  });
});
