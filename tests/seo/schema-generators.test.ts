/**
 * SEO Schema Generators Tests
 * Comprehensive test coverage for JSON-LD schema generators
 */

import { createContext, wrapInGraph } from '@/app/utils/schemas/generators';
import { generateArticleSchema, generateSpeakableSchema, type ArticleSchemaOptions } from '@/app/utils/schemas/generators/article';
import { generateHowToSchema, type HowToSchemaOptions, type HowToStep } from '@/app/utils/schemas/generators/howto';
import { generateDatasetSchema, type DatasetSchemaOptions } from '@/app/utils/schemas/generators/dataset';
import { generateProductSchema, type ProductSchemaOptions } from '@/app/utils/schemas/generators/product';
import { generateWebPageSchema, generateBreadcrumbSchema, generateFAQSchema, type WebPageSchemaOptions, type BreadcrumbSchemaOptions, type FAQSchemaOptions } from '@/app/utils/schemas/generators/common';

// Create test context helper
const createTestContext = (slug = 'test-page') => createContext(slug, 'https://z-beam.com');

describe('SEO Schema Generators', () => {
  
  describe('createContext', () => {
    it('creates valid context with all required fields', () => {
      const context = createTestContext('aluminum');
      
      expect(context).toHaveProperty('baseUrl', 'https://z-beam.com');
      expect(context).toHaveProperty('pageUrl', 'https://z-beam.com/aluminum');
      expect(context).toHaveProperty('currentDate');
      expect(context).toHaveProperty('slug', 'aluminum');
    });

    it('handles nested slugs correctly', () => {
      const context = createContext('materials/metals/aluminum');
      
      expect(context.pageUrl).toContain('materials/metals/aluminum');
    });

    it('uses default base URL when not provided', () => {
      const context = createContext('test');
      
      expect(context.baseUrl).toBeDefined();
      expect(context.baseUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('wrapInGraph', () => {
    it('wraps multiple schemas in @graph structure', () => {
      const schemas = [
        { '@type': 'Article', headline: 'Test' },
        { '@type': 'Product', name: 'Test Product' }
      ];
      
      const wrapped = wrapInGraph(schemas);
      
      expect(wrapped).toHaveProperty('@context', 'https://schema.org');
      expect(wrapped).toHaveProperty('@graph');
      expect(wrapped['@graph']).toHaveLength(2);
    });

    it('filters out null/undefined schemas', () => {
      const schemas = [
        { '@type': 'Article', headline: 'Test' },
        null,
        undefined,
        { '@type': 'Product', name: 'Test Product' }
      ];
      
      const wrapped = wrapInGraph(schemas);
      
      expect(wrapped['@graph']).toHaveLength(2);
    });
  });

  describe('generateArticleSchema', () => {
    const articleOptions: ArticleSchemaOptions = {
      context: createTestContext('aluminum'),
      title: 'Laser Cleaning Aluminum',
      description: 'Complete guide to laser cleaning aluminum surfaces',
      author: {
        name: 'Expert Author',
        title: 'Materials Specialist'
      }
    };

    it('generates valid Article schema', () => {
      const schema = generateArticleSchema(articleOptions);
      
      expect(schema['@type']).toBe('TechnicalArticle');
      expect(schema).toHaveProperty('headline', articleOptions.title);
      expect(schema).toHaveProperty('description', articleOptions.description);
    });

    it('includes author information', () => {
      const schema = generateArticleSchema(articleOptions);
      
      expect(schema.author).toBeDefined();
    });

    it('includes dates', () => {
      const schema = generateArticleSchema(articleOptions);
      
      expect(schema).toHaveProperty('datePublished');
      expect(schema).toHaveProperty('dateModified');
    });

    it('handles missing optional fields gracefully', () => {
      const minimalOptions: ArticleSchemaOptions = {
        context: createTestContext('test'),
        title: 'Test Article',
        description: 'Test description'
      };
      
      const schema = generateArticleSchema(minimalOptions);
      
      expect(schema['@type']).toBe('TechnicalArticle');
      expect(schema).toHaveProperty('headline');
    });

    it('includes publisher information', () => {
      const schema = generateArticleSchema(articleOptions);
      
      expect(schema).toHaveProperty('publisher');
    });

    it('includes article URL', () => {
      const schema = generateArticleSchema(articleOptions);
      
      expect(schema).toHaveProperty('url');
      expect(schema.url).toContain('z-beam.com');
    });
  });

  describe('generateHowToSchema', () => {
    const howToOptions: HowToSchemaOptions = {
      context: createTestContext('aluminum-settings'),
      name: 'How to Clean Aluminum with Laser',
      description: 'Step-by-step guide for laser cleaning aluminum',
      machineSettings: {
        laserPower: { value: '200', unit: 'W', description: 'Optimal power setting' },
        wavelength: { value: '1064', unit: 'nm', description: 'Laser wavelength' }
      }
    };

    it('generates valid HowTo schema', () => {
      const schema = generateHowToSchema(howToOptions);
      
      expect(schema['@type']).toBe('HowTo');
      expect(schema).toHaveProperty('name');
      expect(schema.name).toContain('Aluminum');
    });

    it('generates steps from machine settings', () => {
      const schema = generateHowToSchema(howToOptions);
      
      expect(schema.step).toBeDefined();
      expect(Array.isArray(schema.step)).toBe(true);
      expect(schema.step.length).toBeGreaterThan(0);
    });

    it('uses custom steps when provided', () => {
      const customSteps: HowToStep[] = [
        { name: 'Prepare surface', text: 'Clean the surface of debris' },
        { name: 'Configure laser', text: 'Set power to optimal level' }
      ];
      
      const optionsWithSteps: HowToSchemaOptions = {
        ...howToOptions,
        customSteps
      };
      
      const schema = generateHowToSchema(optionsWithSteps);
      
      expect(schema.step).toHaveLength(2);
      expect(schema.step[0].name).toBe('Prepare surface');
    });

    it('includes proper step structure', () => {
      const schema = generateHowToSchema(howToOptions);
      
      if (schema.step && schema.step.length > 0) {
        expect(schema.step[0]['@type']).toBe('HowToStep');
        expect(schema.step[0]).toHaveProperty('position');
        expect(schema.step[0]).toHaveProperty('text');
      }
    });

    it('includes totalTime', () => {
      const schema = generateHowToSchema(howToOptions);
      
      expect(schema).toHaveProperty('totalTime');
    });
  });

  describe('generateDatasetSchema', () => {
    const datasetOptions: DatasetSchemaOptions = {
      context: createTestContext('aluminum'),
      name: 'Aluminum Material Properties Dataset',
      description: 'Comprehensive dataset of aluminum properties for laser cleaning',
      materialProperties: {
        thermal: {
          meltingPoint: { value: 660.3, unit: '°C' },
          conductivity: { value: 237, unit: 'W/m·K' }
        }
      }
    };

    it('generates valid Dataset schema', () => {
      const schema = generateDatasetSchema(datasetOptions);
      
      expect(schema['@type']).toBe('Dataset');
      expect(schema).toHaveProperty('name');
      expect(schema.name).toContain('Aluminum');
    });

    it('includes license information', () => {
      const schema = generateDatasetSchema(datasetOptions);
      
      expect(schema).toHaveProperty('license');
      expect(schema.license).toContain('creativecommons.org');
    });

    it('includes distribution info', () => {
      const schema = generateDatasetSchema(datasetOptions);
      
      expect(schema.distribution).toBeDefined();
    });

    it('includes measurement variables', () => {
      const schema = generateDatasetSchema(datasetOptions);
      
      expect(schema.variableMeasured).toBeDefined();
      expect(Array.isArray(schema.variableMeasured)).toBe(true);
    });

    it('handles machine settings for settings pages', () => {
      const settingsOptions: DatasetSchemaOptions = {
        context: createTestContext('aluminum-settings'),
        name: 'Aluminum Laser Settings',
        machineSettings: {
          laserPower: { value: '200-300', unit: 'W' },
          wavelength: { value: '1064', unit: 'nm' }
        }
      };
      
      const schema = generateDatasetSchema(settingsOptions);
      
      expect(schema['@type']).toBe('Dataset');
      expect(schema.variableMeasured).toBeDefined();
    });
  });

  describe('generateProductSchema', () => {
    const productOptions: ProductSchemaOptions = {
      context: createTestContext('aluminum'),
      name: 'Aluminum',
      description: 'Industrial-grade aluminum for laser cleaning applications',
      category: 'Metals',
      subcategory: 'Light Metals',
      applications: ['Automotive', 'Aerospace']
    };

    it('generates valid Product schema', () => {
      const schema = generateProductSchema(productOptions);
      
      expect(schema['@type']).toBe('Product');
      expect(schema).toHaveProperty('name', productOptions.name);
      expect(schema).toHaveProperty('description', productOptions.description);
    });

    it('includes category information', () => {
      const schema = generateProductSchema(productOptions);
      
      // Category is included in the schema structure
      expect(schema).toHaveProperty('category');
    });

    it('handles material properties', () => {
      const optionsWithProps: ProductSchemaOptions = {
        ...productOptions,
        materialProperties: {
          physical: {
            density: { value: 2.7, unit: 'g/cm³' }
          }
        }
      };
      
      const schema = generateProductSchema(optionsWithProps);
      
      expect(schema).toHaveProperty('additionalProperty');
    });

    it('includes brand reference', () => {
      const schema = generateProductSchema(productOptions);
      
      expect(schema).toHaveProperty('brand');
      expect(schema.brand).toHaveProperty('@type', 'Brand');
    });

    it('includes offers with availability', () => {
      const schema = generateProductSchema(productOptions);
      
      expect(schema).toHaveProperty('offers');
      expect(schema.offers).toHaveProperty('@type', 'AggregateOffer');
    });

    it('includes required pricing for rich snippets', () => {
      const schema = generateProductSchema(productOptions);
      
      // Google requires these fields for Product rich snippets
      expect(schema.offers).toHaveProperty('lowPrice');
      expect(schema.offers).toHaveProperty('highPrice');
      expect(schema.offers).toHaveProperty('priceCurrency', 'USD');
      expect(schema.offers).toHaveProperty('availability');
      expect(typeof schema.offers.lowPrice).toBe('number');
      expect(typeof schema.offers.highPrice).toBe('number');
      expect(schema.offers.lowPrice).toBeGreaterThan(0);
      expect(schema.offers.highPrice).toBeGreaterThan(schema.offers.lowPrice);
    });

    it('uses SITE_CONFIG pricing for service offers', () => {
      const schema = generateProductSchema(productOptions);
      
      expect(schema.offers.lowPrice).toBe(190);
      expect(schema.offers.highPrice).toBe(270);
      expect(schema.offers.priceSpecification).toBeDefined();
      expect(schema.offers.priceSpecification.unitText).toBe('hour');
    });
  });

  describe('generateWebPageSchema', () => {
    const webPageOptions: WebPageSchemaOptions = {
      context: createTestContext('about'),
      title: 'About Z-Beam',
      description: 'Learn about Z-Beam laser cleaning services'
    };

    it('generates valid WebPage schema', () => {
      const schema = generateWebPageSchema(webPageOptions);
      
      expect(schema['@type']).toBe('WebPage');
      expect(schema).toHaveProperty('name', webPageOptions.title);
      expect(schema).toHaveProperty('description', webPageOptions.description);
    });

    it('includes dates', () => {
      const schema = generateWebPageSchema(webPageOptions);
      
      expect(schema).toHaveProperty('datePublished');
      expect(schema).toHaveProperty('dateModified');
    });

    it('references parent WebSite', () => {
      const schema = generateWebPageSchema(webPageOptions);
      
      expect(schema.isPartOf).toBeDefined();
      expect(schema.isPartOf['@type']).toBe('WebSite');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    const breadcrumbOptions: BreadcrumbSchemaOptions = {
      context: createTestContext('aluminum'),
      items: [
        { name: 'Home', url: 'https://z-beam.com' },
        { name: 'Materials', url: 'https://z-beam.com/materials' },
        { name: 'Aluminum', url: 'https://z-beam.com/materials/aluminum' }
      ]
    };

    it('generates valid BreadcrumbList schema', () => {
      const schema = generateBreadcrumbSchema(breadcrumbOptions);
      
      expect(schema['@type']).toBe('BreadcrumbList');
    });

    it('includes correct number of items', () => {
      const schema = generateBreadcrumbSchema(breadcrumbOptions);
      
      expect(schema.itemListElement).toHaveLength(3);
    });

    it('has correct positions', () => {
      const schema = generateBreadcrumbSchema(breadcrumbOptions);
      
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
    });

    it('includes proper ListItem structure', () => {
      const schema = generateBreadcrumbSchema(breadcrumbOptions);
      
      schema.itemListElement.forEach((item: any) => {
        expect(item['@type']).toBe('ListItem');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('item');
      });
    });
  });

  describe('Schema Integration', () => {
    it('all schemas have consistent @type format', () => {
      const context = createTestContext('test');
      const schemas = [
        generateArticleSchema({ context, title: 'Test', description: 'Test' }),
        generateProductSchema({ context, name: 'Test', description: 'Test', category: 'Test' }),
        generateWebPageSchema({ context, title: 'Test', description: 'Test' })
        // Note: DatasetSchema may return null with minimal props, so we test it separately
      ];
      
      schemas.forEach(schema => {
        expect(schema).not.toBeNull();
        expect(schema['@type']).toBeDefined();
        expect(typeof schema['@type']).toBe('string');
      });
    });

    it('multiple schemas can be combined in graph', () => {
      const context = createTestContext('materials/aluminum');
      
      const article = generateArticleSchema({ context, title: 'Test', description: 'Test' });
      const product = generateProductSchema({ context, name: 'Test', description: 'Test', category: 'Test' });
      
      const graph = wrapInGraph([article, product]);
      
      expect(graph['@graph']).toHaveLength(2);
      expect(graph['@context']).toBe('https://schema.org');
    });
    
    it('dataset schema can be added when properly configured', () => {
      const context = createTestContext('materials/aluminum');
      
      const datasetWithProps = generateDatasetSchema({ 
        context, 
        name: 'Test Dataset',
        materialProperties: {
          thermal: { meltingPoint: { value: 660, unit: '°C' } }
        }
      });
      
      expect(datasetWithProps).not.toBeNull();
      expect(datasetWithProps['@type']).toBe('Dataset');
    });
  });

  describe('FAQPage Schema', () => {
    it('generates valid FAQPage schema with questions', () => {
      const context = createTestContext('materials/aluminum');
      const faq = generateFAQSchema({
        context,
        name: 'Aluminum Laser Cleaning',
        items: [
          { question: 'What is laser cleaning?', answer: 'Laser cleaning is a non-contact, eco-friendly process.' },
          { question: 'Is it safe for aluminum?', answer: 'Yes, laser cleaning is safe for aluminum surfaces.' }
        ]
      });
      
      expect(faq).not.toBeNull();
      expect(faq['@type']).toBe('FAQPage');
      expect(faq.mainEntity).toHaveLength(2);
    });

    it('formats FAQ items as Question/Answer pairs', () => {
      const context = createTestContext('test');
      const faq = generateFAQSchema({
        context,
        name: 'Test FAQ',
        items: [{ question: 'Test Q?', answer: 'Test A' }]
      });
      
      expect(faq.mainEntity[0]['@type']).toBe('Question');
      expect(faq.mainEntity[0].name).toBe('Test Q?');
      expect(faq.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
      expect(faq.mainEntity[0].acceptedAnswer.text).toBe('Test A');
    });

    it('returns null for empty FAQ items', () => {
      const context = createTestContext('test');
      const faq = generateFAQSchema({
        context,
        name: 'Empty FAQ',
        items: []
      });
      
      expect(faq).toBeNull();
    });

    it('includes proper @id for FAQ page', () => {
      const context = createTestContext('help/faq');
      const faq = generateFAQSchema({
        context,
        name: 'Help FAQ',
        items: [{ question: 'Q?', answer: 'A' }]
      });
      
      expect(faq['@id']).toContain('#faq');
      expect(faq.inLanguage).toBe('en-US');
    });
  });

  describe('SpeakableSpecification Schema', () => {
    it('generates article with speakable specification', () => {
      const context = createTestContext('materials/aluminum');
      const article = generateArticleSchema({
        context,
        title: 'Aluminum Laser Cleaning Guide',
        description: 'Complete guide to cleaning aluminum with lasers',
        speakable: {
          useDefaults: true
        }
      });
      
      expect(article.speakable).toBeDefined();
      expect(article.speakable['@type']).toBe('SpeakableSpecification');
      expect(article.speakable.cssSelector).toContain('[data-speakable=\"headline\"]');
    });

    it('allows custom CSS selectors for speakable content', () => {
      const context = createTestContext('guide');
      const article = generateArticleSchema({
        context,
        title: 'Test Article',
        description: 'Test',
        speakable: {
          cssSelector: ['.custom-intro', '.key-points'],
          useDefaults: false
        }
      });
      
      expect(article.speakable.cssSelector).toContain('.custom-intro');
      expect(article.speakable.cssSelector).toContain('.key-points');
      expect(article.speakable.cssSelector).not.toContain('[data-speakable=\"headline\"]');
    });

    it('combines default and custom selectors', () => {
      const context = createTestContext('test');
      const article = generateArticleSchema({
        context,
        title: 'Test',
        description: 'Test',
        speakable: {
          cssSelector: ['.my-custom-selector'],
          useDefaults: true
        }
      });
      
      expect(article.speakable.cssSelector).toContain('.my-custom-selector');
      expect(article.speakable.cssSelector).toContain('[data-speakable=\"headline\"]');
    });

    it('generates standalone speakable schema', () => {
      const speakable = generateSpeakableSchema(['.intro', '.summary', 'h1']);
      
      expect(speakable['@type']).toBe('SpeakableSpecification');
      expect(speakable.cssSelector).toHaveLength(3);
      expect(speakable.cssSelector).toContain('h1');
    });

    it('omits speakable when not specified', () => {
      const context = createTestContext('test');
      const article = generateArticleSchema({
        context,
        title: 'Test',
        description: 'Test'
      });
      
      expect(article.speakable).toBeUndefined();
    });
  });
});
