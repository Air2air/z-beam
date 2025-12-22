// tests/utils/helpers.test.js
// Tests for helper utility functions

import {
  cn,
  getVariantClasses,
  generateMaterialAltText,
  safeGet,
  debounce,
  throttle,
  delay,
  isBrowser,
  prefersReducedMotion,
  generateId,
  fileToBase64,
  getContrastRatio
} from '@/app/utils/helpers';

// Mock browser globals for testing
const mockMatchMedia = (matches) => ({
  matches,
  media: '(prefers-reduced-motion: reduce)',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

describe('Helper utilities', () => {
  describe('cn (className combiner)', () => {
    test('should combine multiple valid class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
      expect(cn('btn', 'btn-primary', 'active')).toBe('btn btn-primary active');
    });

    test('should filter out falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, 'class3', false, '')).toBe('class1 class2 class3');
      expect(cn('btn', false && 'hidden', true && 'visible')).toBe('btn visible');
    });

    test('should handle empty input', () => {
      expect(cn()).toBe('');
      expect(cn(null, undefined, false, '')).toBe('');
    });

    test('should handle single class', () => {
      expect(cn('single-class')).toBe('single-class');
    });

    test('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('btn', isActive && 'active', isDisabled && 'disabled'))
        .toBe('btn active');
    });
  });

  describe('getVariantClasses', () => {
    test('should return default primary and md classes', () => {
      const result = getVariantClasses();
      expect(result).toContain('bg-orange-600');
      expect(result).toContain('text-white');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
    });

    test('should handle all variant types', () => {
      expect(getVariantClasses('primary')).toContain('bg-orange-600');
      expect(getVariantClasses('secondary')).toContain('bg-gray-200');
      expect(getVariantClasses('outline')).toContain('border');
      expect(getVariantClasses('ghost')).toContain('text-gray-600');
    });

    test('should handle all size types', () => {
      expect(getVariantClasses('primary', 'sm')).toContain('px-2 py-1 text-sm');
      expect(getVariantClasses('primary', 'md')).toContain('px-4 py-2 text-base');
      expect(getVariantClasses('primary', 'lg')).toContain('px-6 py-3 text-lg');
      expect(getVariantClasses('primary', 'xl')).toContain('px-8 py-4 text-xl');
    });

    test('should combine variant and size classes correctly', () => {
      const result = getVariantClasses('outline', 'lg');
      expect(result).toContain('border');
      expect(result).toContain('border-gray-300');
      expect(result).toContain('px-6');
      expect(result).toContain('py-3');
      expect(result).toContain('text-lg');
    });
  });

  describe('generateMaterialAltText', () => {
    test('should generate alt text for default card context', () => {
      expect(generateMaterialAltText('Steel')).toBe('Steel laser cleaning material card');
      expect(generateMaterialAltText('Aluminum')).toBe('Aluminum laser cleaning material card');
    });

    test('should generate alt text for hero context', () => {
      expect(generateMaterialAltText('Rust', 'hero'))
        .toBe('Hero image of Rust laser cleaning process');
    });

    test('should generate alt text for thumbnail context', () => {
      expect(generateMaterialAltText('Paint', 'thumbnail'))
        .toBe('Thumbnail showing Paint laser cleaning');
    });

    test('should generate alt text for card context explicitly', () => {
      expect(generateMaterialAltText('Oxide', 'card'))
        .toBe('Oxide laser cleaning material card');
    });

    test('should handle materials with special characters', () => {
      expect(generateMaterialAltText('Stainless Steel')).toBe('Stainless Steel laser cleaning material card');
      expect(generateMaterialAltText('Zinc-Coated Metal')).toBe('Zinc-Coated Metal laser cleaning material card');
    });
  });

  describe('safeGet', () => {
    test('should get nested properties safely', () => {
      const obj = {
        user: {
          profile: {
            name: 'John Doe',
            age: 30
          }
        }
      };

      expect(safeGet(obj, 'user.profile.name', 'default')).toBe('John Doe');
      expect(safeGet(obj, 'user.profile.age', 0)).toBe(30);
    });

    test('should return default value for missing properties', () => {
      const obj = { user: { name: 'John' } };

      expect(safeGet(obj, 'user.profile.name', 'default')).toBe('default');
      expect(safeGet(obj, 'user.age', 25)).toBe(25);
      expect(safeGet(obj, 'missing.deeply.nested', 'fallback')).toBe('fallback');
    });

    test('should handle null and undefined objects', () => {
      expect(safeGet(null, 'any.path', 'default')).toBe('default');
      expect(safeGet(undefined, 'any.path', 'default')).toBe('default');
    });

    test('should handle primitive values in path', () => {
      const obj = { user: 'string value' };
      expect(safeGet(obj, 'user.profile.name', 'default')).toBe('default');
    });

    test('should handle empty path', () => {
      const obj = { value: 'test' };
      expect(safeGet(obj, '', 'default')).toBe('default');
    });

    test('should handle array indices', () => {
      const obj = { items: ['first', 'second', 'third'] };
      expect(safeGet(obj, 'items.1', 'default')).toBe('second');
      expect(safeGet(obj, 'items.10', 'default')).toBe('default');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });

    test('should cancel previous calls when called again', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      jest.advanceTimersByTime(50);
      debouncedFn('second');
      jest.advanceTimersByTime(50);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    test('should handle multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should execute function immediately on first call', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1');
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });

    test('should ignore subsequent calls within throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      throttledFn('second');
      throttledFn('third');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');
    });

    test('should allow execution after throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      jest.advanceTimersByTime(100);
      throttledFn('second');
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('first');
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should resolve after specified delay', async () => {
      const promise = delay(1000);
      let resolved = false;

      promise.then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      jest.advanceTimersByTime(1000);
      
      await promise;
      expect(resolved).toBe(true);
    });

    test('should work with async/await', async () => {
      const start = Date.now();
      const delayPromise = delay(500);
      
      jest.advanceTimersByTime(500);
      await delayPromise;
      
      // Test that the promise resolved (no error thrown)
      expect(true).toBe(true);
    });
  });

  describe('isBrowser', () => {
    test('should return true in jsdom environment', () => {
      // Jest/jsdom provides window by default
      expect(isBrowser()).toBe(true);
    });

    test('should work with typeof window check', () => {
      // The function checks typeof window !== 'undefined'
      // In jsdom this should be true
      expect(typeof window !== 'undefined').toBe(true);
      expect(isBrowser()).toBe(true);
    });
  });

  describe('prefersReducedMotion', () => {
    test('should return false when not in browser', () => {
      // Save original window
      const originalWindow = global.window;
      
      // Temporarily remove window
      delete global.window;
      expect(prefersReducedMotion()).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });

    test('should return true when user prefers reduced motion', () => {
      // Mock matchMedia to return true
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn(() => mockMatchMedia(true));
      
      expect(prefersReducedMotion()).toBe(true);
      
      // Restore
      window.matchMedia = originalMatchMedia;
    });

    test('should return false when user does not prefer reduced motion', () => {
      // Mock matchMedia to return false
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn(() => mockMatchMedia(false));
      
      expect(prefersReducedMotion()).toBe(false);
      
      // Restore
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('generateId', () => {
    test('should generate unique IDs with default prefix', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toMatch(/^id-/);
      expect(id2).toMatch(/^id-/);
      expect(id1).not.toBe(id2);
    });

    test('should use custom prefix', () => {
      const id = generateId('component');
      expect(id).toMatch(/^component-/);
    });

    test('should generate IDs of consistent format', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test-[a-z0-9]{9}$/);
    });

    test('should generate multiple unique IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });
  });

  describe('fileToBase64', () => {
    test('should convert file to base64', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader
      const mockReader = {
        readAsDataURL: jest.fn(),
        result: 'data:text/plain;base64,dGVzdCBjb250ZW50',
        onload: null,
        onerror: null
      };

      global.FileReader = jest.fn(() => mockReader);

      const promise = fileToBase64(mockFile);
      
      // Simulate successful reading
      mockReader.onload();
      
      const result = await promise;
      expect(result).toBe('data:text/plain;base64,dGVzdCBjb250ZW50');
      expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    test('should reject on file read error', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const error = new Error('File read error');
      
      const mockReader = {
        readAsDataURL: jest.fn(),
        result: null,
        onload: null,
        onerror: null
      };

      global.FileReader = jest.fn(() => mockReader);

      const promise = fileToBase64(mockFile);
      
      // Simulate error
      mockReader.onerror(error);
      
      await expect(promise).rejects.toBe(error);
    });
  });

  describe('getContrastRatio', () => {
    test('should calculate contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeGreaterThan(20); // Black and white have high contrast
    });

    test('should calculate contrast ratio for similar colors', () => {
      const ratio = getContrastRatio('#444444', '#555555');
      expect(ratio).toBeLessThan(2); // Similar colors have low contrast
    });

    test('should handle hex colors correctly', () => {
      const ratio1 = getContrastRatio('#ff0000', '#00ff00');
      const ratio2 = getContrastRatio('#0000ff', '#ffff00');
      
      expect(typeof ratio1).toBe('number');
      expect(typeof ratio2).toBe('number');
      expect(ratio1).toBeGreaterThan(0);
      expect(ratio2).toBeGreaterThan(0);
    });

    test('should be symmetrical', () => {
      const ratio1 = getContrastRatio('#123456', '#abcdef');
      const ratio2 = getContrastRatio('#abcdef', '#123456');
      
      expect(ratio1).toBe(ratio2);
    });

    test('should handle same colors', () => {
      const ratio = getContrastRatio('#444444', '#444444');
      expect(ratio).toBe(1); // Same colors have ratio of 1
    });

    test('should handle uppercase and lowercase hex', () => {
      const ratio1 = getContrastRatio('#FFFFFF', '#000000');
      const ratio2 = getContrastRatio('#ffffff', '#000000');
      
      expect(ratio1).toBe(ratio2);
    });
  });

  describe('Integration tests', () => {
    test('should work together for common use cases', () => {
      // Combining className utilities
      const buttonClass = cn(
        getVariantClasses('primary', 'lg'),
        'mt-4',
        true && 'active'
      );
      
      expect(buttonClass).toContain('bg-orange-600');
      expect(buttonClass).toContain('px-6');
      expect(buttonClass).toContain('mt-4');
      expect(buttonClass).toContain('active');
    });

    test('should handle nested object access with safe utilities', () => {
      const config = {
        theme: {
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280'
          }
        }
      };

      const primaryColor = safeGet(config, 'theme.colors.primary', '#000000');
      const missingColor = safeGet(config, 'theme.colors.tertiary', '#ffffff');
      
      expect(primaryColor).toBe('#3b82f6');
      expect(missingColor).toBe('#ffffff');
      
      const contrast = getContrastRatio(primaryColor, missingColor);
      expect(contrast).toBeGreaterThan(1);
    });

    test('should generate consistent material content', () => {
      const materials = ['Steel', 'Aluminum', 'Rust'];
      const altTexts = materials.map(material => generateMaterialAltText(material, 'hero'));
      
      altTexts.forEach((altText, index) => {
        expect(altText).toContain(materials[index]);
        expect(altText).toContain('Hero image');
        expect(altText).toContain('laser cleaning process');
      });
    });
  });
});
