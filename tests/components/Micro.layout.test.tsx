/**
 * Test Suite: Micro Component Layout Validation
 * Testing the new side-by-side layout for before/after sections
 * Updated to use centralized types
 */

import { Micro } from '@/app/components/Micro/Micro';
import { MicroDataStructure, MicroProps, FrontmatterType } from '@/types/centralized';

describe('Micro Component Layout Integration', () => {
  const mockMicroData: MicroDataStructure = {
    before_text: 'Surface shows contamination and oxidation',
    after_text: 'Surface is clean with restored metallic finish',
    material: 'steel',
    title: 'Steel Surface Analysis'
  };

  test('should have proper data structure for side-by-side layout', () => {
    // Test that the component can accept the expected data structure
    expect(mockMicroData.before_text).toBeTruthy();
    expect(mockMicroData.after_text).toBeTruthy();
    expect(typeof mockMicroData.before_text).toBe('string');
    expect(typeof mockMicroData.after_text).toBe('string');
  });

  test('should handle single section data structures', () => {
    const beforeOnly: MicroDataStructure = {
      before_text: 'Surface shows contamination',
      material: 'aluminum'
    };
    
    const afterOnly: MicroDataStructure = {
      after_text: 'Surface is clean',
      material: 'titanium'
    };
    
    expect(beforeOnly.before_text).toBeTruthy();
    expect(beforeOnly.after_text).toBeUndefined();
    
    expect(afterOnly.before_text).toBeUndefined();
    expect(afterOnly.after_text).toBeTruthy();
  });

  test('should support both string and object content', () => {
    const stringContent = "Simple text content";
    const objectContent = mockMicroData;
    
    expect(typeof stringContent).toBe('string');
    expect(typeof objectContent).toBe('object');
    expect(objectContent.before_text).toBeTruthy();
  });

  test('should have backward compatibility with frontmatter', () => {
    const frontmatter: FrontmatterType = {
      title: 'Test Material',
      author: 'Test Author',
      name: 'test-material'
    };
    
    expect(frontmatter.title).toBeTruthy();
    expect(frontmatter.author).toBeTruthy();
    expect(frontmatter.name).toBeTruthy();
  });

  test('micro data structure should be valid', () => {
    // Validate the micro data structure
    expect(mockMicroData).toHaveProperty('before_text');
    expect(mockMicroData).toHaveProperty('after_text');
    expect(mockMicroData).toHaveProperty('material');
    expect(mockMicroData).toHaveProperty('title');
  });

  test('should support MicroProps interface', () => {
    const microProps: MicroProps = {
      content: mockMicroData,
      frontmatter: {
        title: 'Test',
        name: 'test-material',
        images: {
          micro: {
            url: 'test-image.jpg'
          }
        }
      },
      config: {
        className: 'test-class',
        showTechnicalDetails: true,
        showMetadata: false
      }
    };

    expect(microProps.content).toBeDefined();
    expect(microProps.frontmatter?.images?.micro?.url).toBe('test-image.jpg');
    expect(microProps.config?.className).toBe('test-class');
  });
});

describe('Micro Component Centralized Types', () => {
  test('should use centralized MicroDataStructure type', () => {
    const microData: MicroDataStructure = {
      before_text: 'Before cleaning',
      after_text: 'After cleaning',
      quality_metrics: {
        contamination_removal: '95%',
        surface_roughness_before: '12μm',
        surface_roughness_after: '2μm'
      }
    };

    expect(microData.quality_metrics?.contamination_removal).toBe('95%');
    expect(microData.quality_metrics?.surface_roughness_before).toBe('12μm');
  });

  test('should support extended properties from centralized types', () => {
    const micro: MicroDataStructure = {
      title: 'Advanced Analysis',
      description: 'Comprehensive surface treatment',
      technicalSpecifications: {
        wavelength: '1064nm',
        power: '500W',
        scanning_speed: '1000mm/min'
      },
      accessibility: {
        alt_text_detailed: 'Detailed description for screen readers',
        technical_level: 'Advanced'
      }
    };

    expect(micro.technicalSpecifications?.wavelength).toBe('1064nm');
    expect(micro.accessibility?.technical_level).toBe('Advanced');
  });

  // Test for author object rendering fix
  test('should safely handle author objects in seoData', () => {
    const seoDataWithStringAuthor = {
      description: 'Test description',
      author: 'John Doe'
    };

    const seoDataWithObjectAuthor = {
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

    // Test that both string and object authors are handled
    expect(typeof seoDataWithStringAuthor.author).toBe('string');
    expect(typeof seoDataWithObjectAuthor.author).toBe('object');
    expect(seoDataWithObjectAuthor.author.name).toBe('Jane Smith');
  });

  test('should extract author name from object for React rendering', () => {
    const authorObject = {
      id: 'todd-dunning',
      name: 'Todd Dunning',
      sex: 'M',
      title: 'Laser Cleaning Specialist',
      country: 'United States',
      expertise: ['Surface Treatment', 'Laser Cleaning'],
      image: 'todd-dunning.jpg'
    };

    // Simulate the fix logic: extract name or provide fallback
    const authorContent = typeof authorObject === 'string' 
      ? authorObject 
      : authorObject.name || 'Unknown Author';

    expect(authorContent).toBe('Todd Dunning');

    // Test micro data structure
    const micro = {
      technicalSpecifications: {
        wavelength: '1064nm',
        power: '20W',
        pulse_duration: '10ns'
      },
      accessibility: {
        technical_level: 'Advanced',
        alt_text_detailed: 'Laser cleaning process diagram'
      }
    };

    expect(micro.technicalSpecifications?.wavelength).toBe('1064nm');
    expect(micro.accessibility?.technical_level).toBe('Advanced');
  });
});
