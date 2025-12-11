/**
 * Test Suite: Centralized Types Validation
 * Testing the centralized type system for consistency and completeness
 */

import {
  Article,
  ArticleMetadata,
  BadgeData,
  ContactFormData,
  QualityMetrics,
  ComponentData,
  LayoutProps,
  MicroDataStructure,
  MicroProps,
  FrontmatterType,
  ParsedMicroData,
  MetricsGridProps,
  Author,
  MaterialType,
  TableProps
} from '@/types/centralized';

describe('Centralized Types - Micro System', () => {
  test('MicroDataStructure should support all required fields', () => {
    const microData: MicroDataStructure = {
      before_text: 'Before analysis text',
      after_text: 'After analysis text',
      material: 'steel',
      title: 'Steel Analysis',
      description: 'Comprehensive steel surface analysis',
      keywords: ['steel', 'laser', 'cleaning'],
      quality_metrics: {
        contamination_removal: '95%',
        surface_roughness_before: '12μm',
        surface_roughness_after: '2μm'
      },
      technicalSpecifications: {
        wavelength: '1064nm',
        power: '500W',
        scanning_speed: '1000mm/min'
      },
      metadata: {
        generated: '2025-09-21',
        format: 'enhanced',
        version: '2.0'
      }
    };

    expect(microData.before_text).toBe('Before analysis text');
    expect(microData.after_text).toBe('After analysis text');
    expect(microData.material).toBe('steel');
    expect(microData.quality_metrics?.contamination_removal).toBe('95%');
    expect(microData.technicalSpecifications?.wavelength).toBe('1064nm');
    expect(microData.metadata?.version).toBe('2.0');
  });

  test('MicroProps should support all component configurations', () => {
    const microProps: MicroProps = {
      frontmatter: {
        micro: {
          before: 'Before text content',
          after: 'After text content'
        },
        images: {
          micro: {
            url: 'test-image.jpg'
          }
        }
      },
      config: {
        showTechnicalDetails: true,
        showMetadata: false
      }
    };

    expect(microProps.frontmatter.micro?.before).toBe('Before text content');
    expect(microProps.frontmatter.micro?.after).toBe('After text content');
    expect(microProps.frontmatter?.images?.micro?.url).toBe('test-image.jpg');
    expect(microProps.config?.showTechnicalDetails).toBe(true);
  });

  test('FrontmatterType should maintain backward compatibility', () => {
    const frontmatter: FrontmatterType = {
      title: 'Legacy Title',
      description: 'Legacy description',
      keywords: ['legacy', 'keywords'],
      author: 'Legacy Author',
      name: 'legacy-material',
      technicalSpecifications: {
        wavelength: '1064nm',
        power: '400W'
      },
      chemicalProperties: {
        composition: 'Fe, C, Mn',
        density: '7.85 g/cm³'
      }
    };

    expect(frontmatter.title).toBe('Legacy Title');
    expect(frontmatter.author).toBe('Legacy Author');
    expect(frontmatter.technicalSpecifications?.wavelength).toBe('1064nm');
    expect(frontmatter.chemicalProperties?.composition).toBe('Fe, C, Mn');
  });

  test('ParsedMicroData should support parsing results', () => {
    const parsedData: ParsedMicroData = {
      renderedContent: 'Rendered micro content',
      before: 'Before text',
      after: 'After text',
      material: 'aluminum',
      isEnhanced: true,
      qualityMetrics: {
        contamination_removal: '98%'
      }
    };

    expect(parsedData.renderedContent).toBe('Rendered micro content');
    expect(parsedData.isEnhanced).toBe(true);
    expect(parsedData.qualityMetrics?.contamination_removal).toBe('98%');
  });
});

describe('Centralized Types - MetricsGrid System', () => {
  test('QualityMetrics should support all standard metrics', () => {
    const metrics: QualityMetrics = {
      contamination_removal: '95%',
      surface_roughness_before: '12μm',
      surface_roughness_after: '2μm',
      thermal_damage: 'None',
      processing_efficiency: '90%',
      substrate_integrity: 'Maintained'
    };

    expect(metrics.contamination_removal).toBe('95%');
    expect(metrics.surface_roughness_before).toBe('12μm');
    expect(metrics.thermal_damage).toBe('None');
  });

  test('QualityMetrics should support custom metrics via index signature', () => {
    const customMetrics: QualityMetrics = {
      contamination_removal: '97%',
      custom_metric_1: 'Custom value 1',
      custom_metric_2: 'Custom value 2'
    };

    expect(customMetrics['custom_metric_1']).toBe('Custom value 1');
    expect(customMetrics['custom_metric_2']).toBe('Custom value 2');
  });

  test('MetricsGridProps should configure grid display', () => {
    const gridProps: MetricsGridProps = {
      metadata: {
        title: 'Test Material',
        slug: 'test-material'
      },
      qualityMetrics: {
        contamination_removal: '95%',
        surface_roughness_after: '2μm'
      },
      maxCards: 3,
      excludeMetrics: ['substrate_integrity'],
      className: 'custom-grid-class'
    };

    expect(gridProps.maxCards).toBe(3);
    expect(gridProps.excludeMetrics).toContain('substrate_integrity');
    expect(gridProps.className).toBe('custom-grid-class');
  });
});

describe('Centralized Types - Component Props', () => {
  test('TableProps should support table configuration', () => {
    const tableProps: TableProps = {
      content: 'Table content',
      config: {
        showHeader: true,
        micro: 'Test Table',
        variant: 'compact'
      },
      striped: true,
      responsive: true
    };

    expect(tableProps.content).toBe('Table content');
    expect(tableProps.config?.variant).toBe('compact');
    expect(tableProps.striped).toBe(true);
  });
});

describe('Centralized Types - Type Safety', () => {
  test('should enforce type constraints', () => {
    // This test verifies that TypeScript will catch type mismatches
    const validMetrics: QualityMetrics = {
      contamination_removal: '95%' // Must be string
    };

    const validProps: MetricsGridProps = {
      metadata: {
        title: 'Test',
        slug: 'test'
      },
      qualityMetrics: validMetrics,
      maxCards: 2 // Must be number
    };

    expect(typeof validMetrics.contamination_removal).toBe('string');
    expect(typeof validProps.maxCards).toBe('number');
  });

  test('should support optional properties', () => {
    const minimalMicro: MicroDataStructure = {
      // All properties are optional
    };

    const minimalProps: MicroProps = {
      frontmatter: {
        micro: {
          before: 'Minimal content'
        }
      }
      // Config is optional
    };

    expect(minimalMicro).toBeDefined();
    expect(minimalProps.frontmatter.micro?.before).toBe('Minimal content');
  });

  test('should maintain interface inheritance', () => {
    const author: Author = {
      name: 'Test Author',
      title: 'Senior Researcher',
      expertise: ['Laser Technology', 'Materials Science'],
      verification_level: 'expert'
    };

    expect(author.name).toBe('Test Author');
    expect(author.expertise).toContain('Laser Technology');
    expect(author.verification_level).toBe('expert');
  });
});

describe('Centralized Types - Export Validation', () => {
  test('should export all required types', () => {
    // This test ensures all types are properly exported from the centralized file
    // The fact that we can import and use these types without errors proves they're exported correctly
    const testMicro: MicroDataStructure = {};
    const testProps: MicroProps = { frontmatter: {} };
    const testMetrics: QualityMetrics = {};
    const testGridProps: MetricsGridProps = { 
      metadata: { title: 'Test', slug: 'test' },
      qualityMetrics: {} 
    };
    
    expect(testMicro).toBeDefined();
    expect(testProps).toBeDefined();
    expect(testMetrics).toBeDefined();
    expect(testGridProps).toBeDefined();
  });

  test('should support complex type combinations', () => {
    const complexMicro: MicroDataStructure = {
      before: 'Complex before text',
      after: 'Complex after text',
      quality_metrics: {
        contamination_removal: '95%',
        surface_roughness_before: '10μm'
      },
      author_object: {
        name: 'Expert Author',
        title: 'Research Lead',
        verification_level: 'expert'
      }
    };

    const complexProps: MicroProps = {
      frontmatter: {
        title: 'Complex Test',
        author: 'Test Author',
        micro: complexMicro
      }
    };

    expect(complexMicro.quality_metrics?.contamination_removal).toBe('95%');
    expect(complexProps.frontmatter?.title).toBe('Complex Test');
  });
});
