// tests/utils/stringHelpers.test.js
// Tests for string helper utilities

import {
  extractSafeValue,
  toSafeString,
  safeIncludes,
  safeMatch
} from '@/app/utils/stringHelpers';

describe('String Helper utilities', () => {
  describe('extractSafeValue', () => {
    test('should return string values as-is', () => {
      expect(extractSafeValue('hello world')).toBe('hello world');
      expect(extractSafeValue('')).toBe('');
      expect(extractSafeValue('123')).toBe('123');
      expect(extractSafeValue('special chars: !@#$%')).toBe('special chars: !@#$%');
    });

    test('should extract string from single-property object', () => {
      expect(extractSafeValue({ title: 'Test Title' })).toBe('Test Title');
      expect(extractSafeValue({ formula: 'C2H4O' })).toBe('C2H4O');
      expect(extractSafeValue({ content: 'Article content here' })).toBe('Article content here');
      expect(extractSafeValue({ name: '' })).toBe('');
    });

    test('should return JSON string for multi-property objects', () => {
      const multiObj = { title: 'Test', author: 'John' };
      expect(extractSafeValue(multiObj)).toBe('{"title":"Test","author":"John"}');
      
      const complexObj = { 
        properties: { 
          title: 'Complex', 
          nested: { value: 'deep' } 
        } 
      };
      expect(extractSafeValue(complexObj)).toBe('{"properties":{"title":"Complex","nested":{"value":"deep"}}}');
    });

    test('should return JSON string for empty objects', () => {
      expect(extractSafeValue({})).toBe('{}');
    });

    test('should handle nested object with non-string value', () => {
      expect(extractSafeValue({ count: 42 })).toBe('{"count":42}');
      expect(extractSafeValue({ active: true })).toBe('{"active":true}');
      expect(extractSafeValue({ data: null })).toBe('{"data":null}');
      expect(extractSafeValue({ items: [] })).toBe('{"items":[]}');
      expect(extractSafeValue({ config: {} })).toBe('{"config":{}}');
    });

    test('should handle null and undefined', () => {
      expect(extractSafeValue(null)).toBe('');
      expect(extractSafeValue(undefined)).toBe('');
    });

    test('should convert primitive types to strings', () => {
      expect(extractSafeValue(123)).toBe('123');
      expect(extractSafeValue(0)).toBe(''); // 0 is falsy, so returns empty string
      expect(extractSafeValue(true)).toBe('true');
      expect(extractSafeValue(false)).toBe(''); // false is falsy, so returns empty string
    });

    test('should handle arrays', () => {
      expect(extractSafeValue(['item1', 'item2'])).toBe('["item1","item2"]');
      expect(extractSafeValue([])).toBe('[]');
      expect(extractSafeValue([1, 2, 3])).toBe('[1,2,3]');
    });

    test('should handle complex nested structures from YAML', () => {
      // Common YAML parsing patterns
      const yamlParsed1 = { title: { formula: 'Chemical Formula' } };
      expect(extractSafeValue(yamlParsed1)).toBe('{"title":{"formula":"Chemical Formula"}}');

      const yamlParsed2 = { description: 'Simple description' };
      expect(extractSafeValue(yamlParsed2)).toBe('Simple description');
    });
  });

  describe('toSafeString', () => {
    test('should be an alias for extractSafeValue', () => {
      const testValues = [
        'string value',
        { title: 'nested string' },
        { multi: 'prop', object: 'test' },
        123,
        null,
        undefined,
        true,
        []
      ];

      testValues.forEach(value => {
        expect(toSafeString(value)).toBe(extractSafeValue(value));
      });
    });

    test('should handle all the same cases as extractSafeValue', () => {
      expect(toSafeString('direct string')).toBe('direct string');
      expect(toSafeString({ title: 'nested' })).toBe('nested');
      expect(toSafeString({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
      expect(toSafeString(null)).toBe('');
      expect(toSafeString(42)).toBe('42');
    });
  });

  describe('safeIncludes', () => {
    test('should work with direct string values', () => {
      expect(safeIncludes('hello world', 'world')).toBe(true);
      expect(safeIncludes('hello world', 'test')).toBe(false);
      expect(safeIncludes('JavaScript is awesome', 'Script')).toBe(true);
      expect(safeIncludes('', 'anything')).toBe(false);
      expect(safeIncludes('test', '')).toBe(true); // empty string is in any string
    });

    test('should work with single-property objects', () => {
      expect(safeIncludes({ title: 'Test Article' }, 'Article')).toBe(true);
      expect(safeIncludes({ title: 'Test Article' }, 'Blog')).toBe(false);
      expect(safeIncludes({ content: 'This is content about chemistry' }, 'chemistry')).toBe(true);
      expect(safeIncludes({ formula: 'H2O' }, 'H2')).toBe(true);
    });

    test('should work with multi-property objects (searches JSON)', () => {
      const multiObj = { title: 'Test', author: 'John Doe' };
      expect(safeIncludes(multiObj, 'Test')).toBe(true);
      expect(safeIncludes(multiObj, 'John')).toBe(true);
      expect(safeIncludes(multiObj, 'title')).toBe(true); // key names are included in JSON
      expect(safeIncludes(multiObj, 'nonexistent')).toBe(false);
    });

    test('should work with primitive types', () => {
      expect(safeIncludes(123, '12')).toBe(true);
      expect(safeIncludes(123, '23')).toBe(true);
      expect(safeIncludes(123, '45')).toBe(false);
      expect(safeIncludes(true, 'true')).toBe(true);
      expect(safeIncludes(false, 'false')).toBe(false); // false becomes empty string
    });

    test('should handle null and undefined', () => {
      expect(safeIncludes(null, 'anything')).toBe(false);
      expect(safeIncludes(undefined, 'anything')).toBe(false);
      expect(safeIncludes(null, '')).toBe(true); // empty string is in empty string
      expect(safeIncludes(undefined, '')).toBe(true);
    });

    test('should handle case sensitivity', () => {
      expect(safeIncludes('Hello World', 'hello')).toBe(false);
      expect(safeIncludes('Hello World', 'Hello')).toBe(true);
      expect(safeIncludes({ title: 'Article Title' }, 'title')).toBe(false);
      expect(safeIncludes({ title: 'Article Title' }, 'Title')).toBe(true);
    });

    test('should handle arrays', () => {
      expect(safeIncludes(['item1', 'item2'], 'item1')).toBe(true);
      expect(safeIncludes(['item1', 'item2'], 'item3')).toBe(false);
      expect(safeIncludes([], 'anything')).toBe(false);
    });
  });

  describe('safeMatch', () => {
    test('should work with direct string values', () => {
      const match1 = safeMatch('hello123world', /\d+/);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('123');
      
      expect(safeMatch('no numbers here', /\d+/)).toBe(null);
      
      const match2 = safeMatch('test@example.com', /\w+@\w+\.\w+/);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('test@example.com');
      
      expect(safeMatch('', /anything/)).toBe(null);
    });

    test('should work with single-property objects', () => {
      const match1 = safeMatch({ title: 'Version 2.1.0' }, /\d+\.\d+\.\d+/);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('2.1.0');
      
      expect(safeMatch({ title: 'No version here' }, /\d+\.\d+\.\d+/)).toBe(null);
      
      const match2 = safeMatch({ email: 'user@domain.com' }, /@\w+\./);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('@domain.');
    });

    test('should work with multi-property objects (searches JSON)', () => {
      const multiObj = { version: '1.2.3', name: 'test-package' };
      
      const match1 = safeMatch(multiObj, /\d+\.\d+\.\d+/);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('1.2.3');
      
      const match2 = safeMatch(multiObj, /test-\w+/);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('test-package');
      
      expect(safeMatch(multiObj, /nonexistent/)).toBe(null);
    });

    test('should work with primitive types', () => {
      const match1 = safeMatch(12345, /\d{3}/);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('123');
      
      const match2 = safeMatch(true, /true/);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('true');
      
      expect(safeMatch(false, /false/)).toBe(null); // false becomes empty string
      expect(safeMatch(42, /[a-z]/)).toBe(null);
    });

    test('should handle null and undefined', () => {
      expect(safeMatch(null, /anything/)).toBe(null);
      expect(safeMatch(undefined, /anything/)).toBe(null);
      
      const match1 = safeMatch(null, /^$/);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('');
      
      const match2 = safeMatch(undefined, /^$/);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('');
    });

    test('should handle global and multiline regex flags', () => {
      const match1 = safeMatch('abc123def456', /\d+/g);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('123'); // First match only
      
      const match2 = safeMatch({ content: 'line1\nline2\nline3' }, /^line/m);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('line');
    });

    test('should capture groups correctly', () => {
      const match = safeMatch('Email: test@example.com', /(\w+)@(\w+)\.(\w+)/);
      expect(match).not.toBe(null);
      expect(match[0]).toBe('test@example.com');
      expect(match[1]).toBe('test');
      expect(match[2]).toBe('example');
      expect(match[3]).toBe('com');
      
      const objMatch = safeMatch({ contact: 'phone: 123-456-7890' }, /(\d{3})-(\d{3})-(\d{4})/);
      expect(objMatch).not.toBe(null);
      expect(objMatch[0]).toBe('123-456-7890');
      expect(objMatch[1]).toBe('123');
      expect(objMatch[2]).toBe('456');
      expect(objMatch[3]).toBe('7890');
    });

    test('should handle complex regex patterns', () => {
      // URL pattern
      const urlPattern = /https?:\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
      const urlMatch = safeMatch('Visit https://example.com/path', urlPattern);
      expect(urlMatch).not.toBe(null);
      expect(urlMatch[0]).toBe('https://example.com/path');
      
      // Date pattern
      const datePattern = /(\d{4})-(\d{2})-(\d{2})/;
      const dateMatch = safeMatch({ date: '2023-12-25' }, datePattern);
      expect(dateMatch).not.toBe(null);
      expect(dateMatch[0]).toBe('2023-12-25');
      expect(dateMatch[1]).toBe('2023');
      expect(dateMatch[2]).toBe('12');
      expect(dateMatch[3]).toBe('25');
    });

    test('should handle arrays', () => {
      const match1 = safeMatch(['version', '1.2.3', 'release'], /\d+\.\d+\.\d+/);
      expect(match1).not.toBe(null);
      expect(match1[0]).toBe('1.2.3');
      
      expect(safeMatch([], /anything/)).toBe(null);
      
      const match2 = safeMatch([1, 2, 3], /\d/);
      expect(match2).not.toBe(null);
      expect(match2[0]).toBe('1');
    });
  });

  describe('Integration and edge cases', () => {
    test('should handle deeply nested YAML-like structures', () => {
      const complexYaml = {
        article: {
          meta: {
            title: 'Advanced Chemistry: H2SO4 Analysis',
            tags: ['chemistry', 'analysis']
          }
        }
      };

      const jsonStr = extractSafeValue(complexYaml);
      expect(safeIncludes(complexYaml, 'Chemistry')).toBe(true);
      expect(safeIncludes(complexYaml, 'H2SO4')).toBe(true);
      
      const match = safeMatch(complexYaml, /H2SO4/);
      expect(match).not.toBe(null);
      expect(match[0]).toBe('H2SO4');
      
      expect(safeMatch(complexYaml, /\w+@/)).toBe(null);
    });

    test('should maintain consistency across all functions', () => {
      const testValues = [
        'simple string',
        { title: 'nested string' },
        { multiple: 'props', in: 'object' },
        null,
        undefined,
        123,
        true,
        ['array', 'items']
      ];

      testValues.forEach(value => {
        const extracted = extractSafeValue(value);
        const safeStr = toSafeString(value);
        
        // toSafeString should match extractSafeValue
        expect(safeStr).toBe(extracted);
        
        // safeIncludes should work on the extracted string
        const hasContent = extracted.length > 0;
        if (hasContent) {
          const firstChar = extracted[0];
          expect(safeIncludes(value, firstChar)).toBe(true);
        }
        
        // safeMatch should work on the extracted string
        if (extracted.includes('true')) {
          const match = safeMatch(value, /true/);
          expect(match).not.toBe(null);
          expect(match[0]).toBe('true');
        }
      });
    });

    test('should handle special characters and encoding', () => {
      const specialChars = 'Special: äöü, 中文, 🔬, ©®™';
      expect(extractSafeValue(specialChars)).toBe(specialChars);
      expect(safeIncludes(specialChars, '🔬')).toBe(true);
      
      const match = safeMatch(specialChars, /中文/);
      expect(match).not.toBe(null);
      expect(match[0]).toBe('中文');
      
      const objWithSpecial = { formula: 'H₂SO₄' };
      expect(safeIncludes(objWithSpecial, 'H₂')).toBe(true);
      
      const specialMatch = safeMatch(objWithSpecial, /H₂SO/);
      expect(specialMatch).not.toBe(null);
      expect(specialMatch[0]).toBe('H₂SO');
    });

    test('should handle very large objects efficiently', () => {
      const largeObj = {};
      for (let i = 0; i < 100; i++) {
        largeObj[`key${i}`] = `value${i}`;
      }
      
      const result = extractSafeValue(largeObj);
      expect(typeof result).toBe('string');
      expect(result.includes('key50')).toBe(true);
      expect(safeIncludes(largeObj, 'value25')).toBe(true);
    });
  });
});
