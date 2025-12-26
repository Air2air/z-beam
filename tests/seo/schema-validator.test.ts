/**
 * Schema Validator Tests
 * Tests for runtime JSON-LD validation
 */

import {
  validateSchema,
  validateGraphSchemas,
  validateAndLogSchema,
  type SchemaValidationResult
} from '@/app/utils/validators/schemaValidator';

describe('Schema Validator', () => {
  describe('validateSchema', () => {
    it('returns invalid for null schema', () => {
      const result = validateSchema(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Schema is null or undefined');
    });

    it('returns invalid for undefined schema', () => {
      const result = validateSchema(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Schema is null or undefined');
    });

    it('returns invalid for non-object schema', () => {
      const result = validateSchema('not an object');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Schema is not a valid object');
    });

    it('warns for missing @type', () => {
      const result = validateSchema({ name: 'Test' });
      
      expect(result.warnings).toContain('Missing @type property');
    });

    it('returns error for invalid Schema.org type', () => {
      const result = validateSchema({ '@type': 'Material' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid @type "Material"');
    });

    it('validates Article required properties', () => {
      const result = validateSchema({ '@type': 'Article' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "headline" property for Article');
      expect(result.errors).toContain('Missing required "author" property for Article');
      expect(result.errors).toContain('Missing required "datePublished" property for Article');
    });

    it('passes valid Article schema', () => {
      const result = validateSchema({
        '@type': 'Article',
        headline: 'Test Article',
        author: { '@type': 'Person', name: 'Test Author', jobTitle: 'Writer' },
        datePublished: '2024-01-15',
        dateModified: '2024-01-16',
        about: 'Topic'
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates TechArticle required properties', () => {
      const result = validateSchema({ '@type': 'TechArticle' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "headline" property for TechArticle');
    });

    it('validates Product required properties', () => {
      const result = validateSchema({ '@type': 'Product' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "name" property for Product');
      expect(result.errors).toContain('Missing required "description" property for Product');
    });

    it('warns for Product missing offers', () => {
      const result = validateSchema({
        '@type': 'Product',
        name: 'Test Product',
        description: 'A test product'
      });
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Product missing offers (price/availability information)');
      expect(result.warnings).toContain('Product missing brand');
    });

    it('warns for Product offers missing Google requirements', () => {
      const result = validateSchema({
        '@type': 'Product',
        name: 'Test Product',
        description: 'A test product',
        offers: { price: 100 },
        brand: { name: 'Test' }
      });
      
      expect(result.warnings).toContain('Product offers missing hasMerchantReturnPolicy (required for Google rich results)');
      expect(result.warnings).toContain('Product offers missing shippingDetails (required for Google rich results)');
    });

    it('validates HowTo required properties', () => {
      const result = validateSchema({ '@type': 'HowTo' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "name" property for HowTo');
      expect(result.errors).toContain('Missing required "step" property for HowTo');
    });

    it('validates Dataset required properties', () => {
      const result = validateSchema({ '@type': 'Dataset' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "name" property for Dataset');
      expect(result.errors).toContain('Missing required "description" property for Dataset');
    });

    it('validates FAQPage required properties', () => {
      const result = validateSchema({ '@type': 'FAQPage' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "mainEntity" property for FAQPage');
    });

    it('validates Person required properties', () => {
      const result = validateSchema({ '@type': 'Person' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "name" property for Person');
    });

    it('validates BreadcrumbList required properties', () => {
      const result = validateSchema({ '@type': 'BreadcrumbList' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "itemListElement" property for BreadcrumbList');
    });

    it('validates WebPage required properties', () => {
      const result = validateSchema({ '@type': 'WebPage' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "name" property for WebPage');
      expect(result.errors).toContain('Missing required "url" property for WebPage');
    });

    it('validates VideoObject required properties', () => {
      const result = validateSchema({ '@type': 'VideoObject' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required "name" property for VideoObject');
      expect(result.errors).toContain('Missing required "thumbnailUrl" property for VideoObject');
      expect(result.errors).toContain('Missing required "uploadDate" property for VideoObject');
    });

    it('validates VideoObject uploadDate format', () => {
      const result = validateSchema({
        '@type': 'VideoObject',
        name: 'Test Video',
        description: 'A video',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        uploadDate: '2024-01-15' // Invalid - missing timezone
      });
      
      expect(result.errors).toContain('VideoObject uploadDate must be ISO 8601 format with timezone (e.g., 2024-01-15T00:00:00Z)');
    });

    it('accepts valid VideoObject uploadDate with Z timezone', () => {
      const result = validateSchema({
        '@type': 'VideoObject',
        name: 'Test Video',
        description: 'A video',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        uploadDate: '2024-01-15T00:00:00Z'
      });
      
      expect(result.isValid).toBe(true);
    });

    it('accepts valid VideoObject uploadDate with offset timezone', () => {
      const result = validateSchema({
        '@type': 'VideoObject',
        name: 'Test Video',
        description: 'A video',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        uploadDate: '2024-01-15T00:00:00+00:00'
      });
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('E-E-A-T Validation', () => {
    it('warns for Article author missing expertise signals', () => {
      const result = validateSchema({
        '@type': 'Article',
        headline: 'Test',
        author: { '@type': 'Person', name: 'Test Author' },
        datePublished: '2024-01-15'
      });
      
      expect(result.warnings).toContain('Author missing expertise signals (jobTitle or description)');
    });

    it('passes Article author with jobTitle', () => {
      const result = validateSchema({
        '@type': 'Article',
        headline: 'Test',
        author: { '@type': 'Person', name: 'Test', jobTitle: 'Expert' },
        datePublished: '2024-01-15',
        dateModified: '2024-01-15',
        about: 'Test topic'
      });
      
      expect(result.warnings.filter(w => w.includes('expertise'))).toHaveLength(0);
    });

    it('warns for Article missing dateModified', () => {
      const result = validateSchema({
        '@type': 'Article',
        headline: 'Test',
        author: { name: 'Test', jobTitle: 'Expert' },
        datePublished: '2024-01-15'
      });
      
      expect(result.warnings).toContain('Missing dateModified (freshness signal)');
    });

    it('warns for Article missing authority signals', () => {
      const result = validateSchema({
        '@type': 'Article',
        headline: 'Test',
        author: { name: 'Test', jobTitle: 'Expert' },
        datePublished: '2024-01-15',
        dateModified: '2024-01-15'
      });
      
      expect(result.warnings).toContain('Missing citation or about property (authority signal)');
    });

    it('validates TechnicalArticle E-E-A-T signals', () => {
      const result = validateSchema({
        '@type': 'TechnicalArticle',
        headline: 'Test',
        author: { name: 'Test' },
        datePublished: '2024-01-15'
      });
      
      expect(result.warnings).toContain('Author missing expertise signals (jobTitle or description)');
      expect(result.warnings).toContain('Missing dateModified (freshness signal)');
    });
  });

  describe('validateGraphSchemas', () => {
    it('validates single schema without @graph', () => {
      const result = validateGraphSchemas({ '@type': 'Article' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Missing required');
    });

    it('returns error for non-array @graph', () => {
      const result = validateGraphSchemas({ '@graph': 'not an array' });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('@graph must be an array');
    });

    it('validates multiple schemas in @graph', () => {
      const result = validateGraphSchemas({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Article' },
          { '@type': 'Product' }
        ]
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('[0]'))).toBe(true);
      expect(result.errors.some(e => e.includes('[1]'))).toBe(true);
    });

    it('passes valid @graph structure', () => {
      const result = validateGraphSchemas({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            name: 'Test Page',
            url: 'https://example.com'
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home' }]
          }
        ]
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('collects warnings from all schemas', () => {
      const result = validateGraphSchemas({
        '@graph': [
          { '@type': 'Product', name: 'Test', description: 'Test' },
          { '@type': 'Product', name: 'Test2', description: 'Test2' }
        ]
      });
      
      expect(result.warnings.filter(w => w.includes('missing offers'))).toHaveLength(2);
    });
  });

  describe('validateAndLogSchema', () => {
    it('returns validation result', () => {
      const result = validateAndLogSchema({ '@type': 'Article' }, 'Test', false);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('validates graph schemas', () => {
      const result = validateAndLogSchema({
        '@graph': [{ '@type': 'WebPage', name: 'Test', url: 'https://test.com' }]
      }, 'Test Graph', false);
      
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Schema Type Validation', () => {
  const validSchemas = [
    { type: 'Article', schema: { '@type': 'Article', headline: 'T', author: { name: 'A' }, datePublished: '2024' } },
    { type: 'Product', schema: { '@type': 'Product', name: 'P', description: 'D' } },
    { type: 'HowTo', schema: { '@type': 'HowTo', name: 'H', step: [] } },
    { type: 'Dataset', schema: { '@type': 'Dataset', name: 'D', description: 'Desc' } },
    { type: 'FAQPage', schema: { '@type': 'FAQPage', mainEntity: [] } },
    { type: 'Person', schema: { '@type': 'Person', name: 'John' } },
    { type: 'BreadcrumbList', schema: { '@type': 'BreadcrumbList', itemListElement: [] } },
    { type: 'WebPage', schema: { '@type': 'WebPage', name: 'Page', url: 'https://test.com' } },
  ];

  validSchemas.forEach(({ type, schema }) => {
    it(`passes valid ${type} with required properties`, () => {
      const result = validateSchema(schema);
      expect(result.isValid).toBe(true);
    });
  });

  const invalidTypes = ['Material', 'LaserProcess', 'MachineSettings'];
  
  invalidTypes.forEach(type => {
    it(`rejects invalid type: ${type}`, () => {
      const result = validateSchema({ '@type': type });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid @type');
    });
  });
});
