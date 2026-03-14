/**
 * Test for Priority 1 (Service Schema) and Priority 4 (TechnicalArticle Schema) Implementation
 * Validates that the new schema generators produce valid JSON-LD output
 */

import { generateServiceSchema, generateTechnicalArticleSchema } from '@/lib/schema/generators';
import type { ServiceSchemaOptions, TechnicalArticleSchemaOptions } from '@/lib/schema/generators';

describe('Enhanced Schema Generators', () => {
  describe('Priority 1: Service Schema', () => {
    it('should generate valid Service schema for rental services', () => {
      const serviceOptions: ServiceSchemaOptions = {
        name: 'Laser Cleaning Equipment Rental',
        description: 'Professional laser cleaning equipment rental delivered to your location in California with training and support.',
        serviceType: 'Equipment Rental Service',
        provider: {
          name: 'Z-Beam Laser Cleaning',
          url: 'https://www.z-beam.com'
        },
        areaServed: ['California', 'Nevada', 'Oregon'],
        availableChannel: {
          url: 'https://www.z-beam.com/services',
          name: 'Equipment Rental Portal'
        },
        offers: {
          price: '390',
          priceCurrency: 'USD',
          availability: 'InStock'
        }
      };

      const schema = generateServiceSchema(serviceOptions);
      
      expect(schema).toHaveProperty('@context', 'https://schema.org');
      expect(schema).toHaveProperty('@type', 'Service');
      expect(schema).toHaveProperty('@id', '#service');
      expect(schema).toHaveProperty('name', serviceOptions.name);
      expect(schema).toHaveProperty('serviceType', serviceOptions.serviceType);
      expect(schema).toHaveProperty('provider');
      expect(schema).toHaveProperty('areaServed');
      expect(schema).toHaveProperty('offers');
    });

    it('should handle minimal service options', () => {
      const minimalOptions: ServiceSchemaOptions = {
        name: 'Basic Service',
        description: 'Basic service description',
        serviceType: 'Industrial Service',
        provider: {
          name: 'Z-Beam',
          url: 'https://www.z-beam.com'
        },
        areaServed: ['California']
      };

      const schema = generateServiceSchema(minimalOptions);
      
      expect(schema).toHaveProperty('@type', 'Service');
      expect(schema).toHaveProperty('name', 'Basic Service');
      expect(schema).not.toHaveProperty('offers');
      expect(schema).not.toHaveProperty('availableChannel');
    });
  });

  describe('Priority 4: TechnicalArticle Schema', () => {
    it('should generate valid TechnicalArticle schema for safety content', () => {
      const articleOptions: TechnicalArticleSchemaOptions = {
        headline: 'Laser Cleaning Safety Guidelines',
        description: 'Comprehensive safety protocols for industrial laser cleaning operations.',
        author: {
          name: 'Z-Beam Safety Team',
          url: 'https://www.z-beam.com/about'
        },
        datePublished: '2024-01-15T09:00:00-08:00',
        dateModified: '2024-12-01T10:00:00-08:00',
        publisher: {
          name: 'Z-Beam Laser Cleaning',
          logo: '/images/logo.png'
        },
        mainEntityOfPage: 'https://www.z-beam.com/safety',
        image: '/images/og-safety.jpg',
        articleBody: 'Comprehensive guide covering industrial laser cleaning safety protocols.'
      };

      const schema = generateTechnicalArticleSchema(articleOptions);
      
      expect(schema).toHaveProperty('@context', 'https://schema.org');
      expect(schema).toHaveProperty('@type', 'TechnicalArticle');
      expect(schema).toHaveProperty('@id', 'https://www.z-beam.com/safety#technicalarticle');
      expect(schema).toHaveProperty('headline', articleOptions.headline);
      expect(schema).toHaveProperty('author');
      expect(schema).toHaveProperty('publisher');
      expect(schema).toHaveProperty('datePublished', articleOptions.datePublished);
    });

    it('should handle technical articles with minimal data', () => {
      const minimalOptions: TechnicalArticleSchemaOptions = {
        headline: 'Technical Guide',
        description: 'A technical guide',
        author: {
          name: 'Technical Author'
        },
        datePublished: '2024-01-01T00:00:00Z',
        publisher: {
          name: 'Publisher'
        },
        mainEntityOfPage: 'https://example.com/guide'
      };

      const schema = generateTechnicalArticleSchema(minimalOptions);
      
      expect(schema).toHaveProperty('@type', 'TechnicalArticle');
      expect(schema).toHaveProperty('headline', 'Technical Guide');
      expect(schema).not.toHaveProperty('image');
      expect(schema).not.toHaveProperty('articleBody');
    });
  });

  describe('Schema JSON-LD Validation', () => {
    it('should produce valid JSON when serialized', () => {
      const serviceSchema = generateServiceSchema({
        name: 'Test Service',
        description: 'Test Description',
        serviceType: 'Test Type',
        provider: { name: 'Test Provider', url: 'https://test.com' },
        areaServed: ['California']
      });

      expect(() => JSON.stringify(serviceSchema)).not.toThrow();
      
      const serialized = JSON.stringify(serviceSchema, null, 2);
      expect(serialized).toContain('"@context": "https://schema.org"');
      expect(serialized).toContain('"@type": "Service"');
    });

    it('should produce valid JSON for technical articles', () => {
      const articleSchema = generateTechnicalArticleSchema({
        headline: 'Test Article',
        description: 'Test Description',
        author: { name: 'Test Author' },
        datePublished: '2024-01-01T00:00:00Z',
        publisher: { name: 'Test Publisher' },
        mainEntityOfPage: 'https://test.com/article'
      });

      expect(() => JSON.stringify(articleSchema)).not.toThrow();
      
      const serialized = JSON.stringify(articleSchema, null, 2);
      expect(serialized).toContain('"@context": "https://schema.org"');
      expect(serialized).toContain('"@type": "TechnicalArticle"');
    });
  });
});