/**
 * Test Suite: Container Styles - Width Consistency
 * Tests that all container styles use standardized max-w-5xl width
 */

import { STANDARD_CONTAINER, CONTAINER_STYLES } from '@/app/utils/containerStyles';

describe('Container Styles - Width Consistency', () => {
  const EXPECTED_MAX_WIDTH = 'max-w-6xl';
  const EXPECTED_PADDING = 'px-4';

  test('STANDARD_CONTAINER should use max-w-6xl', () => {
    expect(STANDARD_CONTAINER).toContain(EXPECTED_MAX_WIDTH);
  });

  test('STANDARD_CONTAINER should have consistent padding', () => {
    expect(STANDARD_CONTAINER).toContain(EXPECTED_PADDING);
  });

  test('all primary CONTAINER_STYLES entries should use max-w-6xl', () => {
    // These styles should use max-w-6xl for content pages
    const primaryStyles = ['standard', 'main', 'contentOnly', 'section'];
    
    // These styles have legitimate exceptions
    const exceptions = ['article', 'centered', 'fullWidth'];
    
    const invalidStyles: string[] = [];

    Object.entries(CONTAINER_STYLES).forEach(([key, styleClasses]) => {
      // Skip known exceptions
      if (exceptions.includes(key)) return;
      
      // Primary styles must use max-w-6xl
      if (primaryStyles.includes(key) && !styleClasses.includes(EXPECTED_MAX_WIDTH)) {
        invalidStyles.push(`${key}: ${styleClasses}`);
      }
    });

    expect(invalidStyles).toHaveLength(0);

    if (invalidStyles.length > 0) {
      console.error('Primary container styles not using max-w-6xl:', invalidStyles);
    }
  });

  test('CONTAINER_STYLES.standard should use max-w-6xl', () => {
    expect(CONTAINER_STYLES.standard).toContain(EXPECTED_MAX_WIDTH);
  });

  test('CONTAINER_STYLES.main should use max-w-6xl', () => {
    expect(CONTAINER_STYLES.main).toContain(EXPECTED_MAX_WIDTH);
  });

  test('CONTAINER_STYLES.contentOnly should use max-w-6xl', () => {
    expect(CONTAINER_STYLES.contentOnly).toContain(EXPECTED_MAX_WIDTH);
  });

  test('CONTAINER_STYLES.section should use max-w-6xl', () => {
    expect(CONTAINER_STYLES.section).toContain(EXPECTED_MAX_WIDTH);
  });

  test('no container styles should use max-w-5xl or max-w-7xl', () => {
    const oldWidths = ['max-w-5xl', 'max-w-7xl'];
    const stylesWithOldWidths: string[] = [];

    // Check STANDARD_CONTAINER
    oldWidths.forEach(width => {
      if (STANDARD_CONTAINER.includes(width)) {
        stylesWithOldWidths.push(`STANDARD_CONTAINER contains ${width}`);
      }
    });

    // Check all CONTAINER_STYLES entries (except exceptions)
    const exceptions = ['article', 'centered', 'fullWidth'];
    Object.entries(CONTAINER_STYLES).forEach(([key, styleClasses]) => {
      if (exceptions.includes(key)) return;
      
      oldWidths.forEach(width => {
        if (styleClasses.includes(width)) {
          stylesWithOldWidths.push(`${key} contains ${width}`);
        }
      });
    });

    expect(stylesWithOldWidths).toHaveLength(0);

    if (stylesWithOldWidths.length > 0) {
      console.error('Container styles using deprecated widths:', stylesWithOldWidths);
    }
  });

  test('container styles should have consistent structure', () => {
    const requiredClasses = [
      'mx-auto',      // Center the container
      'max-w-6xl',    // Standard width
      'px-4'          // Standard padding
    ];

    const missingClasses: string[] = [];

    // Check STANDARD_CONTAINER
    requiredClasses.forEach(className => {
      if (!STANDARD_CONTAINER.includes(className)) {
        missingClasses.push(`STANDARD_CONTAINER missing ${className}`);
      }
    });

    // Check critical CONTAINER_STYLES entries
    ['standard', 'main', 'contentOnly'].forEach(key => {
      const styleClasses = CONTAINER_STYLES[key as keyof typeof CONTAINER_STYLES];
      requiredClasses.forEach(className => {
        if (!styleClasses.includes(className)) {
          missingClasses.push(`${key} missing ${className}`);
        }
      });
    });

    expect(missingClasses).toHaveLength(0);

    if (missingClasses.length > 0) {
      console.error('Container styles missing required classes:', missingClasses);
    }
  });

  test('all container styles should be strings', () => {
    expect(typeof STANDARD_CONTAINER).toBe('string');

    Object.entries(CONTAINER_STYLES).forEach(([key, value]) => {
      expect(typeof value).toBe('string');
    });
  });

  test('container styles should not have trailing/leading whitespace', () => {
    expect(STANDARD_CONTAINER.trim()).toBe(STANDARD_CONTAINER);

    Object.entries(CONTAINER_STYLES).forEach(([key, value]) => {
      expect(value.trim()).toBe(value);
    });
  });
});
