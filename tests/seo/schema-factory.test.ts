/**
 * SchemaFactory Tests
 * Comprehensive test coverage for the SchemaFactory class and schema generation
 */

import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';
import {
  getMetadata,
  hasProductData,
  hasMachineSettings,
  hasMaterialProperties,
  hasAuthor,
  hasFAQData,
  hasServiceData,
  hasMultipleProducts,
  hasMultipleServices,
  hasRegulatoryStandards,
  hasVideoData,
  hasImageData
} from '@/app/utils/schemas/helpers';

// Test data fixtures
const baseMaterialData = {
  frontmatter: {
    title: 'Aluminum Laser Cleaning',
    description: 'Professional guide to laser cleaning aluminum surfaces',
    category: 'metal',
    subcategory: 'non-ferrous',
    author: {
      name: 'Dr. Sarah Chen',
      title: 'Ph.D. Materials Science',
      expertise: ['Laser cleaning', 'Material science']
    },
    materialProperties: {
      thermal: {
        meltingPoint: { value: 660, unit: '°C' },
        conductivity: { value: 237, unit: 'W/m·K' }
      }
    },
    machineSettings: {
      wavelength: { value: 1064, unit: 'nm' },
      powerRange: { min: 50, max: 200, unit: 'W' },
      pulseFrequency: { min: 20, max: 100, unit: 'kHz' }
    }
  }
};

const settingsPageData = {
  frontmatter: {
    title: 'Aluminum Laser Settings',
    description: 'Optimal settings for cleaning aluminum',
    name: 'Aluminum',
    machineSettings: {
      wavelength: { value: 1064, unit: 'nm' },
      powerRange: { min: 50, max: 200, unit: 'W' }
    }
  }
};

const servicePageData = {
  frontmatter: {
    title: 'Professional Cleaning Services',
    description: 'Industrial laser cleaning services',
    serviceOffering: {
      enabled: true,
      type: 'professionalCleaning',
      materialSpecific: {
        estimatedHoursMin: 1,
        estimatedHoursTypical: 4,
        targetContaminants: ['rust', 'paint', 'oxide']
      }
    }
  }
};

describe('SchemaFactory', () => {
  describe('Constructor and Context', () => {
    it('creates factory with valid context', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      expect(factory).toBeDefined();
    });

    it('generates pageUrl from slug', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/metal/aluminum');
      const result = factory.generate();
      
      // Check that pageUrl includes the slug
      const webPage = result['@graph'].find((s: any) => s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage');
      expect(webPage?.url).toContain('materials/metal/aluminum');
    });

    it('uses custom baseUrl when provided', () => {
      const factory = new SchemaFactory(baseMaterialData, 'test', 'https://custom.example.com');
      const result = factory.generate();
      
      const webPage = result['@graph'].find((s: any) => s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage');
      expect(webPage?.url).toContain('custom.example.com');
    });
  });

  describe('Schema Generation', () => {
    it('generates @graph structure with @context', () => {
      const factory = new SchemaFactory(baseMaterialData, 'aluminum');
      const result = factory.generate();
      
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@graph']).toBeDefined();
      expect(Array.isArray(result['@graph'])).toBe(true);
    });

    it('always includes WebPage schema', () => {
      const factory = new SchemaFactory({ frontmatter: { title: 'Test' } }, 'test');
      const result = factory.generate();
      
      const webPage = result['@graph'].find((s: any) => 
        s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage'
      );
      expect(webPage).toBeDefined();
    });

    it('generates BreadcrumbList schema', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const breadcrumb = result['@graph'].find((s: any) => s['@type'] === 'BreadcrumbList');
      expect(breadcrumb).toBeDefined();
      expect(breadcrumb?.itemListElement).toBeDefined();
    });

    it('generates Article schema for material pages', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const article = result['@graph'].find((s: any) => s['@type'] === 'Article');
      expect(article).toBeDefined();
      expect(article?.headline).toBe('Aluminum Laser Cleaning');
    });

    it('generates TechArticle schema for settings pages', () => {
      const factory = new SchemaFactory(settingsPageData, 'settings/aluminum');
      const result = factory.generate();
      
      const techArticle = result['@graph'].find((s: any) => s['@type'] === 'TechArticle');
      expect(techArticle).toBeDefined();
    });

    it('generates HowTo schema when machineSettings present', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const howTo = result['@graph'].find((s: any) => s['@type'] === 'HowTo');
      expect(howTo).toBeDefined();
    });

    it('generates Dataset schema when materialProperties present', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const dataset = result['@graph'].find((s: any) => s['@type'] === 'Dataset');
      expect(dataset).toBeDefined();
    });

    it('generates Person schema when author present', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const person = result['@graph'].find((s: any) => s['@type'] === 'Person');
      expect(person).toBeDefined();
      expect(person?.name).toBe('Dr. Sarah Chen');
    });

    it('generates Service schema when serviceOffering enabled', () => {
      const factory = new SchemaFactory(servicePageData, 'services/cleaning');
      const result = factory.generate();
      
      const service = result['@graph'].find((s: any) => s['@type'] === 'Service');
      expect(service).toBeDefined();
    });

    it('generates VideoObject schema for material pages', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const video = result['@graph'].find((s: any) => s['@type'] === 'VideoObject');
      expect(video).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('caches generated schemas', () => {
      const factory = new SchemaFactory(baseMaterialData, 'aluminum');
      
      // Generate twice
      factory.generate();
      const result2 = factory.generate();
      
      // Should still have schemas
      expect(result2['@graph'].length).toBeGreaterThan(0);
    });

    it('clearCache resets the cache', () => {
      const factory = new SchemaFactory(baseMaterialData, 'aluminum');
      factory.generate();
      factory.clearCache();
      
      // getSchema returns null after clear
      expect(factory.getSchema('WebPage')).toBeNull();
    });

    it('getSchema retrieves cached schema by name', () => {
      const factory = new SchemaFactory(baseMaterialData, 'aluminum');
      factory.generate();
      
      const webPage = factory.getSchema('WebPage');
      expect(webPage).toBeDefined();
    });
  });

  describe('Conditional Schema Generation', () => {
    it('skips Article schema on settings pages', () => {
      const factory = new SchemaFactory(settingsPageData, 'settings/aluminum');
      const result = factory.generate();
      
      const article = result['@graph'].find((s: any) => s['@type'] === 'Article');
      expect(article).toBeUndefined();
    });

    it('skips TechArticle on non-settings pages', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const techArticle = result['@graph'].find((s: any) => s['@type'] === 'TechArticle');
      expect(techArticle).toBeUndefined();
    });

    it('skips Service schema without serviceOffering', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      
      const service = result['@graph'].find((s: any) => s['@type'] === 'Service');
      expect(service).toBeUndefined();
    });
  });
});

describe('Schema Helpers', () => {
  describe('getMetadata', () => {
    it('returns metadata when present', () => {
      const data = { metadata: { title: 'Test' } };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });

    it('returns frontmatter when metadata not present', () => {
      const data = { frontmatter: { title: 'Test' } };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });

    it('returns pageConfig as fallback', () => {
      const data = { pageConfig: { title: 'Test' } };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });

    it('returns data itself as last resort', () => {
      const data = { title: 'Test' };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });
  });

  describe('hasProductData', () => {
    it('returns true with needle100_150', () => {
      expect(hasProductData({ needle100_150: {} })).toBe(true);
    });

    it('returns true with needle200_300', () => {
      expect(hasProductData({ needle200_300: {} })).toBe(true);
    });

    it('returns true with jangoSpecs', () => {
      expect(hasProductData({ jangoSpecs: {} })).toBe(true);
    });

    it('returns true with materialProperties in metadata', () => {
      expect(hasProductData({ metadata: { materialProperties: {} } })).toBe(true);
    });

    it('returns true with products array', () => {
      expect(hasProductData({ products: [{}] })).toBe(true);
    });

    it('returns false without product data', () => {
      expect(hasProductData({})).toBe(false);
    });
  });

  describe('hasMachineSettings', () => {
    it('returns true with machineSettings in metadata', () => {
      expect(hasMachineSettings({ metadata: { machineSettings: {} } })).toBe(true);
    });

    it('returns true with machineSettings in frontmatter', () => {
      expect(hasMachineSettings({ frontmatter: { machineSettings: {} } })).toBe(true);
    });

    it('returns true with steps', () => {
      expect(hasMachineSettings({ steps: [] })).toBe(true);
    });

    it('returns false without machine settings', () => {
      expect(hasMachineSettings({})).toBe(false);
    });
  });

  describe('hasMaterialProperties', () => {
    it('returns true with materialProperties', () => {
      expect(hasMaterialProperties({ frontmatter: { materialProperties: {} } })).toBe(true);
    });

    it('returns false without materialProperties', () => {
      expect(hasMaterialProperties({})).toBe(false);
    });
  });

  describe('hasAuthor', () => {
    it('returns true with author in metadata', () => {
      expect(hasAuthor({ metadata: { author: { name: 'Test' } } })).toBe(true);
    });

    it('returns true with author in data', () => {
      expect(hasAuthor({ author: { name: 'Test' } })).toBe(true);
    });

    it('returns false without author', () => {
      expect(hasAuthor({})).toBe(false);
    });
  });

  describe('hasFAQData', () => {
    it('returns true with faq array', () => {
      expect(hasFAQData({ faq: [] })).toBe(true);
    });

    it('returns true with faq in metadata', () => {
      expect(hasFAQData({ metadata: { faq: [] } })).toBe(true);
    });

    it('returns true with outcomeMetrics', () => {
      expect(hasFAQData({ metadata: { outcomeMetrics: {} } })).toBe(true);
    });

    it('returns true with applications', () => {
      expect(hasFAQData({ metadata: { applications: [] } })).toBe(true);
    });

    it('returns true with environmentalImpact', () => {
      expect(hasFAQData({ metadata: { environmentalImpact: {} } })).toBe(true);
    });

    it('returns false without FAQ data', () => {
      expect(hasFAQData({})).toBe(false);
    });
  });

  describe('hasServiceData', () => {
    it('returns true with serviceOffering.enabled', () => {
      expect(hasServiceData({ metadata: { serviceOffering: { enabled: true } } })).toBe(true);
    });

    it('returns true with serviceOffering in data', () => {
      expect(hasServiceData({ serviceOffering: { enabled: true } })).toBe(true);
    });

    it('returns true with services array', () => {
      expect(hasServiceData({ services: [{}] })).toBe(true);
    });

    it('returns true with serviceOfferings array', () => {
      expect(hasServiceData({ serviceOfferings: [{}] })).toBe(true);
    });

    it('returns false with serviceOffering.enabled = false', () => {
      expect(hasServiceData({ metadata: { serviceOffering: { enabled: false } } })).toBe(false);
    });

    it('returns false without service data', () => {
      expect(hasServiceData({})).toBe(false);
    });
  });

  describe('hasMultipleProducts', () => {
    it('returns true with multiple needle specs', () => {
      expect(hasMultipleProducts({ needle100_150: {}, needle200_300: {} })).toBe(true);
    });

    it('returns true with products array > 1', () => {
      expect(hasMultipleProducts({ products: [{}, {}] })).toBe(true);
    });

    it('returns false with single product', () => {
      expect(hasMultipleProducts({ needle100_150: {} })).toBe(false);
    });

    it('returns false without products', () => {
      expect(hasMultipleProducts({})).toBe(false);
    });
  });

  describe('hasMultipleServices', () => {
    it('returns true with multiple services', () => {
      expect(hasMultipleServices({ services: [{}, {}] })).toBe(true);
    });

    it('returns true with multiple serviceOfferings', () => {
      expect(hasMultipleServices({ serviceOfferings: [{}, {}] })).toBe(true);
    });

    it('returns false with single service', () => {
      expect(hasMultipleServices({ services: [{}] })).toBe(false);
    });

    it('returns false without services', () => {
      expect(hasMultipleServices({})).toBe(false);
    });
  });

  describe('hasRegulatoryStandards', () => {
    it('returns true with regulatoryStandards', () => {
      expect(hasRegulatoryStandards({ frontmatter: { regulatoryStandards: [] } })).toBe(true);
    });

    it('returns false without regulatoryStandards', () => {
      expect(hasRegulatoryStandards({})).toBe(false);
    });
  });

  describe('hasVideoData', () => {
    it('returns true with video', () => {
      expect(hasVideoData({ video: {} })).toBe(true);
    });

    it('returns true with youtubeUrl', () => {
      expect(hasVideoData({ youtubeUrl: 'abc123' })).toBe(true);
    });

    it('returns true for material pages (implicit video)', () => {
      expect(hasVideoData({ metadata: { materialProperties: {} } })).toBe(true);
    });

    it('returns true for pages with category', () => {
      expect(hasVideoData({ metadata: { category: 'metal' } })).toBe(true);
    });
  });

  describe('hasImageData', () => {
    it('returns true with images array', () => {
      expect(hasImageData({ images: [] })).toBe(true);
    });

    it('returns true with images in metadata', () => {
      expect(hasImageData({ metadata: { images: [] } })).toBe(true);
    });

    it('returns false without images', () => {
      expect(hasImageData({})).toBe(false);
    });
  });
});

describe('Schema Content Validation', () => {
  describe('WebPage Schema', () => {
    it('includes required properties', () => {
      const factory = new SchemaFactory(baseMaterialData, 'test');
      const result = factory.generate();
      const webPage = result['@graph'].find((s: any) => 
        s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage'
      );
      
      expect(webPage?.['@id']).toContain('#webpage');
      expect(webPage?.url).toBeDefined();
      expect(webPage?.name).toBeDefined();
      expect(webPage?.inLanguage).toBe('en-US');
    });

    it('includes isPartOf WebSite reference', () => {
      const factory = new SchemaFactory(baseMaterialData, 'test');
      const result = factory.generate();
      const webPage = result['@graph'].find((s: any) => 
        s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage'
      );
      
      expect(webPage?.isPartOf?.['@type']).toBe('WebSite');
      expect(webPage?.isPartOf?.['@id']).toContain('#website');
    });
  });

  describe('Article Schema', () => {
    it('includes E-E-A-T signals', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      const article = result['@graph'].find((s: any) => s['@type'] === 'Article');
      
      expect(article?.author).toBeDefined();
      expect(article?.publisher).toBeDefined();
      expect(article?.publisher?.['@type']).toBe('Organization');
    });

    it('includes proper dates', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      const article = result['@graph'].find((s: any) => s['@type'] === 'Article');
      
      expect(article?.datePublished).toBeDefined();
      expect(article?.dateModified).toBeDefined();
    });
  });

  describe('BreadcrumbList Schema', () => {
    it('has properly structured itemListElement', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      const breadcrumb = result['@graph'].find((s: any) => s['@type'] === 'BreadcrumbList');
      
      expect(breadcrumb?.itemListElement).toBeDefined();
      expect(Array.isArray(breadcrumb?.itemListElement)).toBe(true);
      
      if (breadcrumb?.itemListElement?.length > 0) {
        const firstItem = breadcrumb.itemListElement[0];
        expect(firstItem['@type']).toBe('ListItem');
        expect(firstItem.position).toBe(1);
        expect(firstItem.name).toBeDefined();
      }
    });
  });

  describe('HowTo Schema', () => {
    it('includes steps from machine settings', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      const howTo = result['@graph'].find((s: any) => s['@type'] === 'HowTo');
      
      expect(howTo?.step).toBeDefined();
      expect(Array.isArray(howTo?.step)).toBe(true);
    });
  });

  describe('Dataset Schema', () => {
    it('includes distribution and license', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      const dataset = result['@graph'].find((s: any) => s['@type'] === 'Dataset');
      
      if (dataset) {
        expect(dataset.distribution).toBeDefined();
        expect(dataset.license).toBeDefined();
      }
    });
  });

  describe('Person Schema', () => {
    it('includes author expertise', () => {
      const factory = new SchemaFactory(baseMaterialData, 'materials/aluminum');
      const result = factory.generate();
      const person = result['@graph'].find((s: any) => s['@type'] === 'Person');
      
      expect(person?.name).toBe('Dr. Sarah Chen');
      expect(person?.jobTitle).toBe('Ph.D. Materials Science');
    });
  });
});

describe('Edge Cases', () => {
  it('handles empty data gracefully', () => {
    const factory = new SchemaFactory({}, 'test');
    const result = factory.generate();
    
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@graph']).toBeDefined();
  });

  it('handles null/undefined values in data', () => {
    const data = {
      frontmatter: {
        title: 'Test',
        description: null,
        author: undefined
      }
    };
    const factory = new SchemaFactory(data, 'test');
    const result = factory.generate();
    
    expect(result['@graph']).toBeDefined();
  });

  it('handles deeply nested slugs', () => {
    const factory = new SchemaFactory(baseMaterialData, 'materials/metal/alloy/non-ferrous/aluminum');
    const result = factory.generate();
    
    const webPage = result['@graph'].find((s: any) => 
      s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage'
    );
    expect(webPage?.url).toContain('materials/metal/alloy/non-ferrous/aluminum');
  });

  it('handles special characters in title', () => {
    const data = {
      frontmatter: {
        title: 'Test & Title <with> "special" characters',
        description: 'Description'
      }
    };
    const factory = new SchemaFactory(data, 'test');
    const result = factory.generate();
    
    const webPage = result['@graph'].find((s: any) => 
      s['@type'] === 'WebPage' || s['@type'] === 'CollectionPage'
    );
    expect(webPage?.name).toContain('&');
  });
});

describe('ImageObject Schema with License Metadata', () => {
  const imageData = {
    frontmatter: {
      title: 'Aluminum Laser Cleaning',
      description: 'Professional guide to cleaning aluminum',
      images: {
        hero: {
          url: '/images/material/aluminum-laser-cleaning-hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Aluminum being laser cleaned'
        }
      },
      micro: {
        before: 'Aluminum surface before laser cleaning',
        description: 'High-quality professional image'
      },
      author: {
        name: 'Dr. Sarah Chen',
        url: 'https://www.z-beam.com/about/team/sarah-chen'
      }
    }
  };

  it('generates ImageObject with default license metadata', () => {
    const factory = new SchemaFactory(imageData, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    // Should have license URL (Creative Commons)
    expect(imageObject?.license).toBe('https://creativecommons.org/licenses/by/4.0/');
  });

  it('includes acquireLicensePage pointing to contact page', () => {
    const factory = new SchemaFactory(imageData, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    expect(imageObject?.acquireLicensePage).toContain('/contact');
  });

  it('includes default creditText', () => {
    const factory = new SchemaFactory(imageData, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    expect(imageObject?.creditText).toBe('Z-Beam Laser Cleaning');
  });

  it('includes copyrightNotice with current year', () => {
    const factory = new SchemaFactory(imageData, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    const currentYear = new Date().getFullYear().toString();
    expect(imageObject?.copyrightNotice).toContain(currentYear);
    expect(imageObject?.copyrightNotice).toContain('Z-Beam');
    expect(imageObject?.copyrightNotice).toContain('All rights reserved');
  });

  it('uses page author as creator when no image creator specified', () => {
    const factory = new SchemaFactory(imageData, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    expect(imageObject?.creator).toBeDefined();
    expect((imageObject?.creator as any)?.['@type']).toBe('Person');
    expect((imageObject?.creator as any)?.name).toBe('Dr. Sarah Chen');
  });

  it('includes micro from image alt text', () => {
    const factory = new SchemaFactory(imageData, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    // Micro comes from hero image alt text
    expect(imageObject?.micro).toBe('Aluminum being laser cleaned');
  });

  it('uses image-specific license when provided', () => {
    const dataWithCustomLicense = {
      frontmatter: {
        ...imageData.frontmatter,
        images: {
          hero: {
            ...imageData.frontmatter.images.hero,
            license: 'https://example.com/custom-license',
            creditText: 'Custom Credit',
            copyrightNotice: '© 2024 Custom Notice'
          }
        }
      }
    };
    const factory = new SchemaFactory(dataWithCustomLicense, 'materials/aluminum');
    const result = factory.generate();
    const imageObject = result['@graph'].find((s: any) => s['@type'] === 'ImageObject');
    
    expect(imageObject?.license).toBe('https://example.com/custom-license');
    expect(imageObject?.creditText).toBe('Custom Credit');
    expect(imageObject?.copyrightNotice).toBe('© 2024 Custom Notice');
  });
});
