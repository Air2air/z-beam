/**
 * Contaminant SEO Implementation Tests
 * Verifies that contaminant pages have identical SEO infrastructure to materials/settings
 */

import { createMetadata } from '@/app/utils/metadata';
import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';
import { CONTAMINANT_CATEGORY_METADATA } from '@/app/contaminantMetadata';

describe('Contaminant SEO Implementation', () => {
  
  describe('Metadata Generation', () => {
    const mockContaminantData = {
      title: 'Battery Leakage Corrosion Contamination',
      name: 'Battery Leakage Corrosion',
      description: 'Battery-corrosion contamination forms through electrolyte reactions.',
      contamination_description: 'Battery-corrosion contamination forms through electrolyte reactions in devices.',
      category: 'oxidation',
      subcategory: 'battery',
      slug: 'battery-corrosion-contamination',
      canonical: 'https://www.z-beam.com/contaminants/oxidation/battery/battery-corrosion-contamination',
      keywords: ['battery corrosion', 'electrolyte damage', 'oxidation removal'],
      author: {
        name: 'Ikmanda Roswati',
        title: 'Ph.D.',
        expertise: 'Ultrafast Laser Physics',
      },
      datePublished: '2024-01-15T10:00:00Z',
      images: {
        hero: {
          url: '/images/contamination/battery-corrosion-hero.jpg',
          alt: 'Battery corrosion contamination',
          width: 1200,
          height: 630
        }
      }
    };

    it('should generate complete metadata for contaminant pages', () => {
      const metadata = createMetadata(mockContaminantData);
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toContain('Battery');
      expect(metadata.description).toBeDefined();
      expect(metadata.description.length).toBeGreaterThan(0);
    });

    it('should include OpenGraph metadata for contaminants', () => {
      const metadata = createMetadata(mockContaminantData);
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.images).toBeDefined();
    });

    it('should include Twitter Card metadata for contaminants', () => {
      const metadata = createMetadata(mockContaminantData);
      
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBeDefined();
      expect(metadata.twitter?.title).toBeDefined();
      expect(metadata.twitter?.description).toBeDefined();
    });

    it('should include E-E-A-T signals for contaminants', () => {
      const metadata = createMetadata(mockContaminantData);
      
      expect(metadata.other).toBeDefined();
      expect(metadata.other?.['author']).toBe('Ikmanda Roswati');
      expect(metadata.other?.['author-title']).toBe('Ph.D.');
      expect(metadata.other?.['article:published_time']).toBeDefined();
    });

    it('should generate hreflang alternates for contaminants', () => {
      const metadata = createMetadata(mockContaminantData);
      
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toContain('/contaminants/');
      expect(metadata.alternates?.languages).toBeDefined();
      expect(metadata.alternates?.languages?.['en-US']).toBeDefined();
      expect(metadata.alternates?.languages?.['x-default']).toBeDefined();
    });

    it('should extract hero image for social sharing', () => {
      const metadata = createMetadata(mockContaminantData);
      
      expect(metadata.openGraph?.images).toBeDefined();
      expect(metadata.openGraph?.images?.[0].url).toContain('battery-corrosion-hero.jpg');
      expect(metadata.openGraph?.images?.[0].width).toBe(1200);
      expect(metadata.openGraph?.images?.[0].height).toBe(630);
    });
  });

  describe('JSON-LD Schema Generation', () => {
    const mockContaminantArticle = {
      metadata: {
        title: 'Rust Oxidation Contamination',
        name: 'Rust Oxidation',
        description: 'Rust contamination forms through iron oxidation.',
        category: 'oxidation',
        subcategory: 'ferrous',
        author: {
          id: 'expert',
          name: 'Todd Dunning',
          jobTitle: 'Laser Cleaning Specialist',
        },
        datePublished: '2024-01-15T10:00:00Z',
        images: {
          hero: {
            url: '/images/contamination/rust-hero.jpg',
            alt: 'Rust contamination'
          }
        }
      }
    };

    it('should generate JSON-LD schemas for contaminant pages', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      expect(schemas).toBeDefined();
      expect(schemas['@context']).toBe('https://schema.org');
      expect(schemas['@graph']).toBeDefined();
      expect(Array.isArray(schemas['@graph'])).toBe(true);
    });

    it('should include WebPage schema for contaminants', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      const webPage = schemas['@graph'].find((s: any) => s['@type'] === 'WebPage');
      expect(webPage).toBeDefined();
      expect(webPage?.name).toBeDefined();
      expect(webPage?.url).toContain('/contaminants/');
    });

    it('should include TechnicalArticle schema for contaminants', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      const article = schemas['@graph'].find((s: any) => 
        s['@type'] === 'TechnicalArticle' || s['@type'] === 'Article'
      );
      expect(article).toBeDefined();
      expect(article?.headline).toBeDefined();
      expect(article?.author).toBeDefined();
    });

    it('should include Person schema for contaminant authors', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      const person = schemas['@graph'].find((s: any) => s['@type'] === 'Person');
      expect(person).toBeDefined();
      expect(person?.name).toBeDefined();
      expect(person?.jobTitle).toBeDefined();
    });

    it('should include BreadcrumbList schema for contaminants', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      const breadcrumbs = schemas['@graph'].find((s: any) => s['@type'] === 'BreadcrumbList');
      expect(breadcrumbs).toBeDefined();
      expect(breadcrumbs?.itemListElement).toBeDefined();
      expect(Array.isArray(breadcrumbs?.itemListElement)).toBe(true);
    });

    it('should include Organization schema for contaminants', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      const org = schemas['@graph'].find((s: any) => s['@type'] === 'Organization');
      expect(org).toBeDefined();
      expect(org?.name).toBeDefined();
    });

    it('should maintain consistent URLs across all schemas', () => {
      const factory = new SchemaFactory(
        mockContaminantArticle, 
        'contaminants/oxidation/ferrous/rust-contamination'
      );
      const schemas = factory.generate();
      
      // Filter for page-level schemas (WebPage, Article, BreadcrumbList)
      const contaminantSchemas = schemas['@graph'].filter((s: any) => 
        ['WebPage', 'Article', 'TechnicalArticle', 'BreadcrumbList'].includes(s['@type']) && s.url
      );
      
      contaminantSchemas.forEach((schema: any) => {
        expect(schema.url).toContain('/contaminants/');
      });
      
      // Verify at least one contaminant-specific schema exists
      expect(contaminantSchemas.length).toBeGreaterThan(0);
    });
  });

  describe('Category Metadata', () => {
    it('should have metadata for all contaminant categories', () => {
      expect(CONTAMINANT_CATEGORY_METADATA).toBeDefined();
      expect(Object.keys(CONTAMINANT_CATEGORY_METADATA).length).toBeGreaterThan(0);
    });

    it('should have required fields for each category', () => {
      Object.entries(CONTAMINANT_CATEGORY_METADATA).forEach(([category, metadata]) => {
        expect(metadata.title).toBeDefined();
        expect(metadata.description).toBeDefined();
        expect(metadata.keywords).toBeDefined();
        expect(Array.isArray(metadata.keywords)).toBe(true);
        expect(metadata.schema).toBeDefined();
        expect(metadata.schema['@type']).toBeDefined();
      });
    });

    it('should have professional descriptions without sales language', () => {
      Object.entries(CONTAMINANT_CATEGORY_METADATA).forEach(([category, metadata]) => {
        // Check for forbidden sales-y words
        const forbiddenWords = ['best', 'top', 'leading', 'revolutionary', '#1'];
        const description = metadata.description.toLowerCase();
        
        forbiddenWords.forEach(word => {
          expect(description).not.toContain(word);
        });
      });
    });
  });

  describe('Cross-System Consistency', () => {
    it('should maintain consistent contamination naming across metadata', () => {
      const mockData = {
        title: 'Paint Coating Contamination',
        name: 'Paint Coating',
        category: 'inorganic_coating',
        subcategory: 'paint',
        slug: 'paint-contamination'
      };
      
      const metadata = createMetadata(mockData);
      
      expect(metadata.title).toContain('Paint');
      expect(metadata.openGraph?.title).toContain('Paint');
    });

    it('should use same author format as materials/settings', () => {
      const mockData = {
        title: 'Test Contamination',
        author: {
          name: 'Test Author',
          title: 'Ph.D.',
          expertiseAreas: ['Laser Physics']
        }
      };
      
      const metadata = createMetadata(mockData);
      
      expect(metadata.other?.['author']).toBe('Test Author');
      expect(metadata.other?.['author-title']).toBe('Ph.D.');
      expect(metadata.other?.['author-expertise']).toBe('Laser Physics');
    });
  });

  describe('URL Structure Validation', () => {
    it('should generate correct contaminant URLs', () => {
      const testCases = [
        {
          category: 'oxidation',
          subcategory: 'battery',
          slug: 'battery-corrosion-contamination',
          expected: '/contaminants/oxidation/battery/battery-corrosion-contamination'
        },
        {
          category: 'organic_residue',
          subcategory: 'oil',
          slug: 'industrial-oil-contamination',
          expected: '/contaminants/organic_residue/oil/industrial-oil-contamination'
        }
      ];

      testCases.forEach(({ category, subcategory, slug, expected }) => {
        const canonicalUrl = `https://www.z-beam.com${expected}`;
        const metadata = createMetadata({
          title: 'Test',
          category,
          subcategory,
          slug,
          canonical: canonicalUrl
        });
        
        expect(metadata.alternates?.canonical).toBe(canonicalUrl);
      });
    });
  });

  describe('Performance and Efficiency', () => {
    it('should generate contaminant metadata efficiently (< 100ms)', () => {
      const mockData = {
        title: 'Test Contamination',
        description: 'Test description',
        category: 'oxidation',
        subcategory: 'test'
      };
      
      const startTime = Date.now();
      createMetadata(mockData);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should generate contaminant schemas efficiently (< 200ms)', () => {
      const mockArticle = {
        metadata: {
          title: 'Test Contamination',
          name: 'Test',
          category: 'oxidation'
        }
      };
      
      const startTime = Date.now();
      const factory = new SchemaFactory(mockArticle, 'contaminants/oxidation/test/test-contamination');
      factory.generate();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});
