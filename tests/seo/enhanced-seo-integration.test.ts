/**
 * SEO Enhancement Integration Tests
 * Validates the complete enhanced SEO infrastructure for A+ grade
 */

import { 
  generateHomeMetadata, 
  generateAboutMetadata, 
  generateStaticPageMetadata 
} from '@/lib/metadata/generators';
import { 
  generateMaterialMetadata 
} from '@/lib/metadata/dynamic-generators';
import {
  generateFAQSchema,
  generateProductSchema,
  generateHowToSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema
} from '@/lib/schema/generators';
import {
  generateSocialImageMetadata,
  generateImageMetadata,
  DEFAULT_IMAGES,
  IMAGE_DIMENSIONS
} from '@/lib/metadata/image-optimization';

describe('SEO Enhancement Integration', () => {
  describe('Enhanced Metadata Generators', () => {
    test('generateHomeMetadata includes local business schema', () => {
      const metadata = generateHomeMetadata();
      
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
      
      // Check for enhanced structured data
      expect(metadata.other).toBeDefined();
      expect(metadata.other['application-ld+json']).toBeDefined();
      
      const schemaData = JSON.parse(metadata.other['application-ld+json']);
      expect(schemaData['@context']).toBe('https://schema.org');
      expect(schemaData['@graph']).toBeInstanceOf(Array);
      
      // Verify local business schema is included
      const localBusiness = schemaData['@graph'].find((item: any) => item['@type'] === 'LocalBusiness');
      expect(localBusiness).toBeDefined();
      expect(localBusiness.areaServed).toBeDefined();
      expect(localBusiness.geo).toBeDefined();
    });

    test('generateAboutMetadata includes FAQ schema', () => {
      const metadata = generateAboutMetadata();
      
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.other).toBeDefined();
      
      const schemaData = JSON.parse(metadata.other['application-ld+json']);
      
      // Verify FAQ schema is included
      const faqPage = schemaData['@graph'].find((item: any) => item['@type'] === 'FAQPage');
      expect(faqPage).toBeDefined();
      expect(faqPage.mainEntity).toBeInstanceOf(Array);
      expect(faqPage.mainEntity.length).toBeGreaterThan(0);
      
      // Check FAQ structure
      const firstFAQ = faqPage.mainEntity[0];
      expect(firstFAQ['@type']).toBe('Question');
      expect(firstFAQ.name).toBeDefined();
      expect(firstFAQ.acceptedAnswer).toBeDefined();
      expect(firstFAQ.acceptedAnswer['@type']).toBe('Answer');
    });

    test('generateMaterialMetadata includes product schema', () => {
      const metadata = generateMaterialMetadata({
        materialName: 'Aluminum',
        description: 'Professional aluminum laser cleaning services',
        slug: 'aluminum-laser-cleaning',
        category: 'metals',
        keywords: ['aluminum', 'metal cleaning'],
        properties: {
          meltingPoint: '660.32°C',
          density: '2.70 g/cm³'
        }
      });
      
      expect(metadata.title).toContain('Aluminum');
      expect(metadata.description).toBeDefined();
      expect(metadata.other).toBeDefined();
      
      const schemaData = JSON.parse(metadata.other['application-ld+json']);
      
      // Verify product schema
      const product = schemaData['@graph'].find((item: any) => item['@type'] === 'Product');
      expect(product).toBeDefined();
      expect(product.name).toContain('Aluminum');
      expect(product.description).toBeDefined();
      
      // Verify material properties schema
      const material = schemaData['@graph'].find((item: any) => item['@type'] === 'Material');
      expect(material).toBeDefined();
      expect(material.meltingPoint).toBe('660.32°C');
      expect(material.density).toBe('2.70 g/cm³');
      
      // Verify breadcrumb schema
      const breadcrumb = schemaData['@graph'].find((item: any) => item['@type'] === 'BreadcrumbList');
      expect(breadcrumb).toBeDefined();
      expect(breadcrumb.itemListElement).toBeInstanceOf(Array);
    });
  });

  describe('Enhanced Schema Generators', () => {
    test('generateFAQSchema creates proper structure', () => {
      const faqs = [
        {
          question: 'What is laser cleaning?',
          answer: 'Laser cleaning is an advanced surface treatment technology.'
        },
        {
          question: 'Is it safe?',
          answer: 'Yes, when proper safety protocols are followed.'
        }
      ];
      
      const schema = generateFAQSchema(faqs);
      
      expect(schema['@type']).toBe('FAQPage');
      expect(schema['@id']).toBe('#faq');
      expect(schema.mainEntity).toHaveLength(2);
      
      const firstQuestion = schema.mainEntity[0];
      expect(firstQuestion['@type']).toBe('Question');
      expect(firstQuestion.name).toBe('What is laser cleaning?');
      expect(firstQuestion.acceptedAnswer['@type']).toBe('Answer');
    });

    test('generateProductSchema creates proper structure', () => {
      const schema = generateProductSchema({
        name: 'Aluminum Laser Cleaning',
        description: 'Professional aluminum cleaning service',
        category: 'Industrial Service',
        offers: {
          price: '100',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      });
      
      expect(schema['@type']).toBe('Product');
      expect(schema['@id']).toBe('#product');
      expect(schema.name).toBe('Aluminum Laser Cleaning');
      expect(schema.offers).toBeDefined();
      expect(schema.offers['@type']).toBe('Offer');
      expect(schema.offers.seller).toBeDefined();
    });

    test('generateHowToSchema creates proper structure', () => {
      const schema = generateHowToSchema({
        name: 'How to Clean Aluminum with Laser',
        description: 'Step-by-step guide for laser cleaning aluminum',
        steps: [
          {
            name: 'Preparation',
            text: 'Prepare the aluminum surface'
          },
          {
            name: 'Laser Setup',
            text: 'Configure laser parameters'
          }
        ],
        totalTime: 'PT30M',
        estimatedCost: '$100'
      });
      
      expect(schema['@type']).toBe('HowTo');
      expect(schema['@id']).toBe('#howto');
      expect(schema.step).toHaveLength(2);
      expect(schema.totalTime).toBe('PT30M');
      expect(schema.estimatedCost).toBe('$100');
      
      const firstStep = schema.step[0];
      expect(firstStep['@type']).toBe('HowToStep');
      expect(firstStep.position).toBe(1);
    });

    test('generateLocalBusinessSchema includes SF Bay Area data', () => {
      const schema = generateLocalBusinessSchema();
      
      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema['@id']).toBe('#business');
      expect(schema.address.addressLocality).toBe('San Francisco Bay Area');
      expect(schema.areaServed).toBeInstanceOf(Array);
      expect(schema.areaServed.length).toBeGreaterThan(0);
      
      // Check SF Bay Area cities
      const cities = schema.areaServed.map((area: any) => area.name);
      expect(cities).toContain('San Francisco');
      expect(cities).toContain('San Jose');
      expect(cities).toContain('Oakland');
    });
  });

  describe('Image Optimization', () => {
    test('generateSocialImageMetadata creates proper dimensions', () => {
      const images = generateSocialImageMetadata('/test-image.jpg', 'Test Alt Text');
      
      expect(images.openGraph).toBeDefined();
      expect(images.twitter).toBeDefined();
      
      // Check OpenGraph dimensions
      expect(images.openGraph.width).toBe(1200);
      expect(images.openGraph.height).toBe(630);
      expect(images.openGraph.alt).toBe('Test Alt Text');
      
      // Check Twitter dimensions
      expect(images.twitter.width).toBe(1200);
      expect(images.twitter.height).toBe(630);
      expect(images.twitter.alt).toBe('Test Alt Text');
    });

    test('generateImageMetadata handles different dimensions', () => {
      const metadata = generateImageMetadata(
        '/hero-image.jpg',
        'Hero Alt Text',
        IMAGE_DIMENSIONS.hero
      );
      
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(400);
      expect(metadata.alt).toBe('Hero Alt Text');
      expect(metadata.type).toBe('image/png');
    });

    test('DEFAULT_IMAGES provides all page types', () => {
      const expectedPageTypes = ['home', 'materials', 'contaminants', 'settings', 'compounds', 'about', 'contact'];
      
      expectedPageTypes.forEach(pageType => {
        expect(DEFAULT_IMAGES).toHaveProperty(pageType);
        expect(DEFAULT_IMAGES[pageType as keyof typeof DEFAULT_IMAGES].openGraph).toBeDefined();
        expect(DEFAULT_IMAGES[pageType as keyof typeof DEFAULT_IMAGES].twitter).toBeDefined();
      });
    });
  });

  describe('Enhanced Static Page Metadata', () => {
    test('generateStaticPageMetadata includes optimized images', () => {
      const metadata = generateStaticPageMetadata({
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        image: '/test-image.jpg',
        keywords: ['test', 'page'],
        noIndex: false
      });
      
      expect(metadata.openGraph.images).toBeInstanceOf(Array);
      expect(metadata.openGraph.images[0]).toBeDefined();
      expect(metadata.openGraph.images[0].width).toBe(1200);
      expect(metadata.openGraph.images[0].height).toBe(630);
      
      expect(metadata.twitter.images).toBeInstanceOf(Array);
      expect(metadata.twitter.images[0]).toBeDefined();
      expect(metadata.twitter.images[0].width).toBe(1200);
      expect(metadata.twitter.images[0].height).toBe(630);
    });

    test('generateStaticPageMetadata handles noIndex properly', () => {
      const metadata = generateStaticPageMetadata({
        title: 'Private Page',
        description: 'Private description',
        path: '/private',
        noIndex: true
      });
      
      expect(metadata.robots).toBeDefined();
      expect(metadata.robots.index).toBe(false);
      expect(metadata.robots.follow).toBe(false);
    });
  });
});