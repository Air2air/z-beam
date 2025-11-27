/**
 * Test Suite: Container Styles - Responsive CSS Architecture
 * Tests that container styles use centralized responsive.css classes
 * Post-migration from inline Tailwind to named CSS classes
 */

import { STANDARD_CONTAINER, CONTAINER_STYLES } from '@/app/utils/containerStyles';

describe('Container Styles - Responsive CSS Architecture', () => {
  // Valid responsive CSS class names (defined in app/css/responsive.css)
  const VALID_CONTAINER_CLASSES = [
    'container-standard',   // max-w-6xl mx-auto px-4 sm:px-6
    'container-full',       // max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
    'container-narrow',     // max-w-4xl mx-auto px-4 sm:px-6
    'container-centered',   // max-w-2xl mx-auto px-4 sm:px-6
    'container-hero',       // max-w-6xl mx-auto px-4 sm:px-5
  ];

  const VALID_UTILITY_CLASSES = [
    'section-padding',      // py-6 md:py-8
    'px-responsive',        // px-4 sm:px-6 lg:px-8
    'w-full',              // Full width (exception)
  ];

  test('STANDARD_CONTAINER should use centralized responsive class', () => {
    expect(VALID_CONTAINER_CLASSES).toContain(STANDARD_CONTAINER);
  });

  test('STANDARD_CONTAINER should not contain inline responsive patterns', () => {
    const inlinePatterns = ['sm:', 'md:', 'lg:', 'xl:', 'max-w-', 'px-', 'py-', 'mx-'];
    const hasInlinePattern = inlinePatterns.some(pattern => STANDARD_CONTAINER.includes(pattern));
    expect(hasInlinePattern).toBe(false);
  });

  test('all primary CONTAINER_STYLES should use centralized responsive classes', () => {
    const primaryStyles = ['standard', 'main', 'contentOnly', 'section'];
    const invalidStyles: string[] = [];

    primaryStyles.forEach(key => {
      const styleClasses = CONTAINER_STYLES[key as keyof typeof CONTAINER_STYLES];
      const classes = styleClasses.split(' ');
      
      // Should contain at least one valid container class
      const hasValidContainer = classes.some(cls => 
        VALID_CONTAINER_CLASSES.includes(cls) || VALID_UTILITY_CLASSES.includes(cls)
      );
      
      if (!hasValidContainer) {
        invalidStyles.push(`${key}: ${styleClasses}`);
      }
    });

    expect(invalidStyles).toHaveLength(0);
  });

  test('CONTAINER_STYLES.standard should use responsive classes', () => {
    const classes = CONTAINER_STYLES.standard.split(' ');
    const hasResponsiveClass = classes.some(cls => 
      VALID_CONTAINER_CLASSES.includes(cls) || VALID_UTILITY_CLASSES.includes(cls)
    );
    expect(hasResponsiveClass).toBe(true);
  });

  test('CONTAINER_STYLES.main should use responsive classes', () => {
    const classes = CONTAINER_STYLES.main.split(' ');
    const hasResponsiveClass = classes.some(cls => VALID_CONTAINER_CLASSES.includes(cls));
    expect(hasResponsiveClass).toBe(true);
  });

  test('CONTAINER_STYLES.contentOnly should use responsive classes', () => {
    const classes = CONTAINER_STYLES.contentOnly.split(' ');
    const hasResponsiveClass = classes.some(cls => VALID_CONTAINER_CLASSES.includes(cls));
    expect(hasResponsiveClass).toBe(true);
  });

  test('CONTAINER_STYLES.section should use responsive classes', () => {
    const classes = CONTAINER_STYLES.section.split(' ');
    const hasResponsiveClass = classes.some(cls => VALID_CONTAINER_CLASSES.includes(cls));
    expect(hasResponsiveClass).toBe(true);
  });

  test('no container styles should use inline responsive patterns', () => {
    const inlinePatterns = ['sm:', 'md:', 'lg:', 'xl:'];
    const stylesWithInlinePatterns: string[] = [];

    // Check STANDARD_CONTAINER
    inlinePatterns.forEach(pattern => {
      if (STANDARD_CONTAINER.includes(pattern)) {
        stylesWithInlinePatterns.push(`STANDARD_CONTAINER contains ${pattern}`);
      }
    });

    // Check all CONTAINER_STYLES entries
    Object.entries(CONTAINER_STYLES).forEach(([key, styleClasses]) => {
      inlinePatterns.forEach(pattern => {
        if (styleClasses.includes(pattern)) {
          stylesWithInlinePatterns.push(`${key} contains ${pattern}`);
        }
      });
    });

    expect(stylesWithInlinePatterns).toHaveLength(0);
  });

  test('container styles should use centralized responsive classes', () => {
    const missingClasses: string[] = [];

    // STANDARD_CONTAINER should be a valid responsive class
    if (!VALID_CONTAINER_CLASSES.includes(STANDARD_CONTAINER)) {
      missingClasses.push(`STANDARD_CONTAINER (${STANDARD_CONTAINER}) is not a valid responsive class`);
    }

    // Check critical CONTAINER_STYLES use responsive classes
    const criticalStyles = ['standard', 'main', 'contentOnly', 'section'];
    criticalStyles.forEach(key => {
      const styleClasses = CONTAINER_STYLES[key as keyof typeof CONTAINER_STYLES];
      const classes = styleClasses.split(' ');
      
      const hasContainerClass = classes.some(cls => 
        VALID_CONTAINER_CLASSES.includes(cls) || VALID_UTILITY_CLASSES.includes(cls)
      );
      
      if (!hasContainerClass) {
        missingClasses.push(`${key} (${styleClasses}) missing responsive class`);
      }
    });

    expect(missingClasses).toHaveLength(0);
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

  test('article and centered containers should use specialized responsive classes', () => {
    // Article should use container-narrow (max-w-4xl)
    expect(CONTAINER_STYLES.article).toContain('container-narrow');
    
    // Centered should use container-centered (max-w-2xl)
    expect(CONTAINER_STYLES.centered).toContain('container-centered');
  });
});
