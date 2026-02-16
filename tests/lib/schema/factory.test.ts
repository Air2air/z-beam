/**
 * Schema Factory Test Suite
 * Comprehensive validation of the unified schema factory pattern
 * Tests both factory methods and backward compatibility
 */

import { SchemaFactory } from '@/lib/schema/factory';
import { generateServiceSchema, generateTechnicalArticleSchema } from '@/lib/schema/generators';
import type { ServiceSchemaOptions, TechnicalArticleSchemaOptions } from '@/lib/schema/factory';

describe('Schema Factory Pattern', () => {
  describe('Factory Pattern Implementation', () => {
    it('should create Service schema using factory pattern', () => {
      const serviceOptions: ServiceSchemaOptions = {
        name: 'Factory Pattern Service',
        description: 'Service created via factory pattern',
        serviceType: 'Industrial Cleaning',
        provider: {
          name: 'Z-Beam Laser Cleaning',
          url: 'https://www.z-beam.com'
        },
        areaServed: ['California', 'Nevada'],
        offers: {
          price: '500',
          priceCurrency: 'USD',
          availability: 'InStock'
        }
      };

      const schema = SchemaFactory.create('Service', serviceOptions);
      
      expect(schema).toHaveProperty('@context', 'https://schema.org');
      expect(schema).toHaveProperty('@type', 'Service');
      expect(schema).toHaveProperty('name', 'Factory Pattern Service');
      expect(schema).toHaveProperty('serviceType', 'Industrial Cleaning');
      expect(schema).toHaveProperty('provider');
      expect(schema).toHaveProperty('offers');
    });

    it('should create TechnicalArticle schema using factory pattern', () => {
      const articleOptions: TechnicalArticleSchemaOptions = {
        name: 'Factory Article',
        description: 'Article description',
        headline: 'Factory Pattern Technical Article',
        author: {
          name: 'Technical Writer',
          url: 'https://www.z-beam.com/author'
        },
        datePublished: '2024-02-10T09:00:00-08:00',
        publisher: {
          name: 'Z-Beam Laser Cleaning'
        },
        mainEntityOfPage: 'https://www.z-beam.com/tech-guide'
      };

      const schema = SchemaFactory.create('TechnicalArticle', articleOptions);
      
      expect(schema).toHaveProperty('@context', 'https://schema.org');
      expect(schema).toHaveProperty('@type', 'TechnicalArticle');
      expect(schema).toHaveProperty('headline', 'Factory Pattern Technical Article');
      expect(schema).toHaveProperty('author');
      expect(schema).toHaveProperty('publisher');
    });

    it('should create complete page graph with factory', () => {
      const entitySchema = SchemaFactory.create('Service', {
        name: 'Test Service',
        description: 'Test description',
        serviceType: 'Test',
        provider: { name: 'Test Provider', url: 'https://test.com' },
        areaServed: ['California']
      });

      const breadcrumbItems = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' }
      ];

      const pageGraph = SchemaFactory.createPageGraph(
        entitySchema,
        breadcrumbItems,
        'Test Page',
        '/test'
      );

      expect(pageGraph).toHaveProperty('@context', 'https://schema.org');
      expect(pageGraph).toHaveProperty('@graph');
      expect(pageGraph['@graph']).toHaveLength(3);
      expect(pageGraph['@graph'][0]).toHaveProperty('@type', 'Service');
      expect(pageGraph['@graph'][1]).toHaveProperty('@type', 'BreadcrumbList');
      expect(pageGraph['@graph'][2]).toHaveProperty('@type', 'WebPage');
    });

    it('should handle all schema types through factory', () => {
      // Test BreadcrumbList
      const breadcrumb = SchemaFactory.create('BreadcrumbList', {
        items: [{ name: 'Home', href: '/' }]
      });
      expect(breadcrumb).toHaveProperty('@type', 'BreadcrumbList');

      // Test FAQPage
      const faq = SchemaFactory.create('FAQPage', {
        faqs: [{ question: 'Test?', answer: 'Yes' }]
      });
      expect(faq).toHaveProperty('@type', 'FAQPage');

      // Test LocalBusiness
      const business = SchemaFactory.create('LocalBusiness', {});
      expect(business).toHaveProperty('@type', 'LocalBusiness');

      // Test WebPage
      const webpage = SchemaFactory.create('WebPage', {
        pageName: 'Test Page',
        pathname: '/test'
      });
      expect(webpage).toHaveProperty('@type', 'WebPage');
    });

    it('should throw error for unsupported schema type', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid type
        SchemaFactory.create('InvalidType', {});
      }).toThrow('Unsupported schema type: InvalidType');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing Service generator', () => {
      const serviceOptions: ServiceSchemaOptions = {
        name: 'Backward Compatible Service',
        description: 'Testing backward compatibility',
        serviceType: 'Equipment Rental',
        provider: {
          name: 'Z-Beam',
          url: 'https://www.z-beam.com'
        },
        areaServed: ['California']
      };

      const factorySchema = SchemaFactory.create('Service', serviceOptions);
      const legacySchema = generateServiceSchema(serviceOptions);

      expect(factorySchema).toEqual(legacySchema);
    });

    it('should maintain compatibility with existing TechnicalArticle generator', () => {
      const articleOptions: TechnicalArticleSchemaOptions = {
        name: 'Compatible Article',
        description: 'Testing compatibility',
        headline: 'Backward Compatible Article',
        author: { name: 'Author' },
        datePublished: '2024-01-01T00:00:00Z',
        publisher: { name: 'Publisher' },
        mainEntityOfPage: 'https://example.com/article'
      };

      const factorySchema = SchemaFactory.create('TechnicalArticle', articleOptions);
      const legacySchema = generateTechnicalArticleSchema(articleOptions);

      expect(factorySchema).toEqual(legacySchema);
    });
  });

  describe('Schema Validation Coverage', () => {
    it('should generate valid JSON-LD for all schema types', () => {
      const schemas = [
        SchemaFactory.create('Service', {
          name: 'Test Service',
          description: 'Test',
          serviceType: 'Test',
          provider: { name: 'Test', url: 'https://test.com' },
          areaServed: ['CA']
        }),
        SchemaFactory.create('TechnicalArticle', {
          name: 'Test',
          description: 'Test',
          headline: 'Test Article',
          author: { name: 'Author' },
          datePublished: '2024-01-01T00:00:00Z',
          publisher: { name: 'Publisher' },
          mainEntityOfPage: 'https://test.com/article'
        }),
        SchemaFactory.create('Product', {
          name: 'Test Product',
          description: 'Test product description'
        }),
        SchemaFactory.create('HowTo', {
          name: 'Test How-To',
          description: 'Test guide',
          steps: [{ name: 'Step 1', text: 'Do this' }]
        })
      ];

      schemas.forEach(schema => {
        expect(() => JSON.stringify(schema)).not.toThrow();
        const serialized = JSON.stringify(schema);
        expect(serialized).toContain('@type');
      });
    });

    it('should include required schema.org context for all schemas', () => {
      const serviceSchema = SchemaFactory.create('Service', {
        name: 'Test Service',
        description: 'Test',
        serviceType: 'Test',
        provider: { name: 'Test', url: 'https://test.com' },
        areaServed: ['CA']
      });

      const articleSchema = SchemaFactory.create('TechnicalArticle', {
        name: 'Test',
        description: 'Test',
        headline: 'Test Article',
        author: { name: 'Author' },
        datePublished: '2024-01-01T00:00:00Z',
        publisher: { name: 'Publisher' },
        mainEntityOfPage: 'https://test.com/article'
      });

      expect(serviceSchema).toHaveProperty('@context', 'https://schema.org');
      expect(articleSchema).toHaveProperty('@context', 'https://schema.org');
    });
  });

  describe('Performance Optimization', () => {
    it('should generate schemas efficiently', () => {
      const startTime = performance.now();
      
      // Generate multiple schemas
      for (let i = 0; i < 100; i++) {
        SchemaFactory.create('Service', {
          name: `Service ${i}`,
          description: `Description ${i}`,
          serviceType: 'Test Service',
          provider: { name: 'Test Provider', url: 'https://test.com' },
          areaServed: ['California']
        });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should generate 100 schemas in less than 100ms (1ms per schema average)
      expect(totalTime).toBeLessThan(100);
    });
  });
});