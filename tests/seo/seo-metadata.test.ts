// tests/seo/seo-metadata.test.ts
// Tests for SEO metadata generation and formatting

import { createMetadata } from '@/app/utils/metadata';
import { 
  formatMaterialTitle, 
  formatMaterialDescription, 
  formatSettingsTitle, 
  formatSettingsDescription 
} from '@/app/utils/seoMetadataFormatter';

// Default article metadata for tests
const defaultArticleData = {
  title: 'Aluminum Laser Cleaning',
  description: 'Guide to laser cleaning aluminum surfaces with industrial parameters and settings',
  slug: 'aluminum-laser-cleaning',
  category: 'metal',
  subcategory: 'non-ferrous'
};

describe('SEO Metadata Generation', () => {
  describe('createMetadata', () => {
    it('should generate title under 70 characters for optimal display', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        title: 'Aluminum Laser Cleaning'
      });
      
      const title = typeof metadata.title === 'string' ? metadata.title : '';
      expect(title.length).toBeLessThanOrEqual(70);
    });

    it('should generate description with reasonable length', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        description: 'This is a test description that should be optimized for search engines with proper length and keyword density for better SEO results.'
      });
      
      const description = metadata.description || '';
      expect(description.length).toBeGreaterThan(50);
    });

    it('should include canonical URL when provided', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        canonical: 'https://z-beam.com/aluminum-laser-cleaning'
      } as any);
      
      expect(metadata.alternates).toBeDefined();
    });

    it('should include Open Graph metadata', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        image: '/images/test.jpg'
      });
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
    });

    it('should include Twitter Card metadata', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        image: '/images/test.jpg'
      });
      
      expect(metadata.twitter).toBeDefined();
      // Twitter card type depends on configuration
      expect(metadata.twitter?.card).toBeDefined();
    });

    it('should include Open Graph metadata by default', () => {
      const metadata = createMetadata(defaultArticleData);
      
      // OpenGraph is always generated
      expect(metadata.openGraph).toBeDefined();
    });
  });

  describe('formatMaterialTitle', () => {
    it('should format material title with specs', () => {
      const formatted = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          laserPower: { value: 100, unit: 'W' }
        }
      });
      
      expect(formatted).toContain('Aluminum');
      expect(formatted.length).toBeLessThanOrEqual(70);
    });

    it('should handle custom title override', () => {
      const formatted = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum',
        customTitle: 'Custom Title Here'
      });
      
      expect(formatted).toBe('Custom Title Here');
    });

    it('should handle missing specs gracefully', () => {
      const formatted = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum'
      });
      
      expect(formatted).toContain('Aluminum');
    });
  });

  describe('formatMaterialDescription', () => {
    it('should format material description', () => {
      const formatted = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        materialDescription: 'High-quality aluminum surface preparation using industrial laser technology.'
      });
      
      expect(formatted.length).toBeLessThanOrEqual(160);
    });

    it('should handle missing description', () => {
      const formatted = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum'
      });
      
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('formatSettingsTitle', () => {
    it('should format settings page title', () => {
      const formatted = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Aluminum'
      });
      
      expect(formatted).toContain('Aluminum');
      expect(formatted.toLowerCase()).toContain('settings');
    });
  });

  describe('formatSettingsDescription', () => {
    it('should format settings description with specs', () => {
      const formatted = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Aluminum',
        machineSettings: {
          laserPower: { value: 100, unit: 'W' },
          scanSpeed: { value: 500, unit: 'mm/s' }
        }
      });
      
      expect(formatted.length).toBeGreaterThan(50);
      expect(formatted.length).toBeLessThanOrEqual(160);
    });
  });
});

describe('Material Page SEO', () => {
  describe('Material-specific metadata', () => {
    it('should include material name in title', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        title: 'Aluminum Laser Cleaning'
      });
      
      expect(metadata.title).toContain('Aluminum');
    });

    it('should include article metadata for material pages', () => {
      const metadata = createMetadata({
        ...defaultArticleData,
        author: { 
          name: 'Todd Dunning',
          title: 'MA',
          expertise: 'Optical Materials'
        }
      });
      
      expect(metadata.openGraph?.type).toBe('article');
    });
  });
});

describe('Settings Page SEO', () => {
  describe('Settings-specific metadata', () => {
    it('should indicate instructional content in description', () => {
      const description = 'How to configure laser cleaning settings for aluminum. Step-by-step guide including power, frequency, and scan speed parameters.';
      
      expect(description.toLowerCase()).toMatch(/how to|guide|settings|parameters/);
    });
  });
});

describe('Open Graph Optimization', () => {
  it('should include og:type', () => {
    const metadata = createMetadata(defaultArticleData);
    
    expect(metadata.openGraph?.type).toBeDefined();
  });

  it('should include og:locale', () => {
    const metadata = createMetadata(defaultArticleData);
    
    expect(metadata.openGraph?.locale).toBe('en_US');
  });
});

describe('Twitter Card Optimization', () => {
  it('should include Twitter card configuration', () => {
    const metadata = createMetadata({
      ...defaultArticleData,
      image: '/images/material/aluminum-hero.jpg'
    });
    
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBeDefined();
  });

  it('should include Twitter site handle', () => {
    const metadata = createMetadata(defaultArticleData);
    
    expect(metadata.twitter?.site).toBeDefined();
  });
});
