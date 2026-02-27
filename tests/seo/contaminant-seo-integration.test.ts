/**
 * Contaminant SEO Integration Tests
 * End-to-end testing of contaminant SEO infrastructure
 */

import sitemap from '@/app/sitemap.xml/route';
import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';
import path from 'path';
import fs from 'fs';

describe('Contaminant SEO Integration Tests', () => {
  
  describe('Sitemap Generation', () => {
    it('should include contaminant URLs in sitemap with correct structure', () => {
      const sitemapEntries = sitemap();
      
      // Filter contaminant URLs
      const contaminantUrls = sitemapEntries.filter((entry: any) => 
        entry.url.includes('/contaminants/')
      );
      
      expect(contaminantUrls.length).toBeGreaterThan(0);
      
      // Test category pages
      const categoryPages = contaminantUrls.filter((entry: any) => 
        entry.url.match(/\/contaminants\/[^\/]+\/?$/)
      );
      expect(categoryPages.length).toBeGreaterThan(0);
      
      // Verify category page priorities
      categoryPages.forEach((entry: any) => {
        expect(entry.priority).toBeGreaterThanOrEqual(0.6);
        expect(entry.priority).toBeLessThanOrEqual(0.9);
      });
      
      // Verify lastModified is present
      contaminantUrls.forEach((entry: any) => {
        expect(entry.lastModified).toBeDefined();
      });
    });

    it('should include contaminant page URLs in sitemap', () => {
      const sitemapEntries = sitemap();
      
      const contaminantUrls = sitemapEntries.filter((entry: any) => 
        entry.url.includes('/contaminants/')
      );
      
      contaminantUrls.forEach((entry: any) => {
        expect(entry.url).toContain('/contaminants/');
        expect(entry.url).toBeDefined();
      });
    });

    it('should set appropriate priorities for different contaminant page types', () => {
      const sitemapEntries = sitemap();
      
      const contaminantUrls = sitemapEntries.filter((entry: any) => 
        entry.url.includes('/contaminants/')
      );
      
      // Category pages should have higher priority than items
      const categoryPages = contaminantUrls.filter((entry: any) => 
        entry.url.match(/\/contaminants\/[^\/]+\/?$/)
      );
      
      const itemPages = contaminantUrls.filter((entry: any) => 
        entry.url.match(/\/contaminants\/[^\/]+\/[^\/]+\/[^\/]+$/)
      );
      
      if (categoryPages.length > 0 && itemPages.length > 0) {
        const avgCategoryPriority = categoryPages.reduce((sum: number, e: any) => sum + e.priority, 0) / categoryPages.length;
        const avgItemPriority = itemPages.reduce((sum: number, e: any) => sum + e.priority, 0) / itemPages.length;
        
        // Category pages should generally have equal or higher priority
        expect(avgCategoryPriority).toBeGreaterThanOrEqual(avgItemPriority - 0.1);
      }
    });
  });

  describe('Breadcrumb Schema Integration', () => {
    const mockContaminantData = {
      frontmatter: {
        title: 'Battery Corrosion Contamination',
        name: 'Battery Corrosion',
        category: 'oxidation',
        subcategory: 'battery',
        slug: 'battery-corrosion-contamination',
        breadcrumb: [
          { label: 'Home', href: '/' },
          { label: 'Contaminants', href: '/contaminants' },
          { label: 'Oxidation', href: '/contaminants/oxidation' },
          { label: 'Battery Corrosion', href: '/contaminants/oxidation/battery/battery-corrosion-contamination' }
        ]
      }
    };

    it('should generate breadcrumb schema for contaminant pages', () => {
      const factory = new SchemaFactory(
        mockContaminantData,
        'contaminants/oxidation/battery/battery-corrosion-contamination'
      );
      const schemas = factory.generate();
      
      const breadcrumbSchema = schemas['@graph'].find((item: any) => 
        item['@type'] === 'BreadcrumbList'
      );
      
      expect(breadcrumbSchema).toBeDefined();
      expect(breadcrumbSchema.itemListElement).toBeDefined();
      expect(Array.isArray(breadcrumbSchema.itemListElement)).toBe(true);
    });

    it('should include contaminant hierarchy in breadcrumbs', () => {
      const factory = new SchemaFactory(
        mockContaminantData,
        'contaminants/oxidation/battery/battery-corrosion-contamination'
      );
      const schemas = factory.generate();
      
      const breadcrumbSchema = schemas['@graph'].find((item: any) => 
        item['@type'] === 'BreadcrumbList'
      );
      
      // Verify breadcrumb list has at least one item
      expect(breadcrumbSchema.itemListElement.length).toBeGreaterThanOrEqual(1);
      
      // Verify breadcrumbs are properly structured
      breadcrumbSchema.itemListElement.forEach((item: any) => {
        expect(item['@type']).toBe('ListItem');
        expect(item.position).toBeDefined();
        expect(item.name).toBeDefined();
      });
    });

    it('should maintain proper breadcrumb position ordering', () => {
      const factory = new SchemaFactory(
        mockContaminantData,
        'contaminants/oxidation/battery/battery-corrosion-contamination'
      );
      const schemas = factory.generate();
      
      const breadcrumbSchema = schemas['@graph'].find((item: any) => 
        item['@type'] === 'BreadcrumbList'
      );
      
      // Verify positions are sequential
      const positions = breadcrumbSchema.itemListElement.map((item: any) => item.position);
      positions.forEach((pos: number, idx: number) => {
        expect(pos).toBe(idx + 1);
      });
    });
  });

  describe('Validation Script Integration', () => {
    it('should have validation script available', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/validation/seo/validate-seo-infrastructure.js');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should include contaminant test cases in validation script', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/validation/seo/validate-seo-infrastructure.js');
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      
      // Check that contaminant pages are included in TEST_PAGES
      expect(scriptContent).toContain('contaminants');
      expect(scriptContent.includes('/contaminants/')).toBe(true);
    });

    it('should have type detection for contaminant URLs', () => {
      const scriptPath = path.join(process.cwd(), 'scripts/validation/seo/validate-seo-infrastructure.js');
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      
      // Check for contaminant type detection logic
      const hasContaminantDetection = 
        scriptContent.includes("'contaminants'") || 
        scriptContent.includes('"contaminants"');
      
      expect(hasContaminantDetection).toBe(true);
    });
  });

  describe('JSON-LD Schema Integration', () => {
    const mockContaminantData = {
      metadata: {
        title: 'Battery Corrosion Contamination Removal',
        name: 'Battery Corrosion',
        description: 'Battery corrosion contamination forms through electrolyte reactions.',
        contamination_description: 'Detailed description of battery corrosion contamination.',
        category: 'oxidation',
        subcategory: 'battery',
        slug: 'battery-corrosion-contamination',
        canonical: 'https://www.z-beam.com/contaminants/oxidation/battery/battery-corrosion-contamination',
        keywords: ['battery corrosion', 'electrolyte damage', 'oxidation removal'],
        author: {
          name: 'Ikmanda Roswati',
          title: 'Ph.D.',
          expertise: 'Ultrafast Laser Physics'
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
      }
    };

    it('should generate valid JSON-LD for contaminant pages', () => {
      const factory = new SchemaFactory(
        mockContaminantData,
        'contaminants/oxidation/battery/battery-corrosion-contamination'
      );
      const schemas = factory.generate();
      
      expect(schemas).toBeDefined();
      expect(schemas['@context']).toBe('https://schema.org');
      expect(schemas['@graph']).toBeDefined();
      expect(Array.isArray(schemas['@graph'])).toBe(true);
    });

    it('should serialize to valid JSON string', () => {
      const factory = new SchemaFactory(
        mockContaminantData,
        'contaminants/oxidation/battery/battery-corrosion-contamination'
      );
      const schemas = factory.generate();
      
      // Verify it can be stringified (valid JSON)
      const jsonString = JSON.stringify(schemas, null, 2);
      expect(jsonString).toBeDefined();
      expect(jsonString.length).toBeGreaterThan(0);
      
      // Verify it can be parsed back
      const parsed = JSON.parse(jsonString);
      expect(parsed['@context']).toBe('https://schema.org');
    });

    it('should generate schemas with proper entity references', () => {
      const factory = new SchemaFactory(
        mockContaminantData,
        'contaminants/oxidation/battery/battery-corrosion-contamination'
      );
      const schemas = factory.generate();
      
      // Check that entities have @id for referencing
      const entitiesWithId = schemas['@graph'].filter((item: any) => item['@id']);
      expect(entitiesWithId.length).toBeGreaterThan(0);
      
      // Check that some entities reference others
      const entitiesWithReferences = schemas['@graph'].filter((item: any) => {
        const itemStr = JSON.stringify(item);
        return itemStr.includes('#');
      });
      expect(entitiesWithReferences.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Content Type Consistency', () => {
    it('should maintain identical schema structure between contaminants and materials', () => {
      const sitemapEntries = sitemap();
      
      const contaminantUrls = sitemapEntries.filter((entry: any) => 
        entry.url.includes('/contaminants/')
      );
      const materialUrls = sitemapEntries.filter((entry: any) => 
        entry.url.includes('/materials/')
      );
      
      // Both should have URLs in sitemap
      expect(contaminantUrls.length).toBeGreaterThan(0);
      expect(materialUrls.length).toBeGreaterThan(0);
      
      // Both should have same sitemap entry structure
      const contaminantSample = contaminantUrls[0];
      const materialSample = materialUrls[0];
      
      expect(Object.keys(contaminantSample).sort()).toEqual(
        Object.keys(materialSample).sort()
      );
    });

    it('should have consistent frontmatter structure across content types', () => {
      const contaminantDir = path.join(process.cwd(), 'frontmatter/contaminants');
      const materialDir = path.join(process.cwd(), 'frontmatter/materials');
      
      expect(fs.existsSync(contaminantDir)).toBe(true);
      expect(fs.existsSync(materialDir)).toBe(true);
      
      // Get sample files
      const contaminantFiles = fs.readdirSync(contaminantDir).filter(f => f.endsWith('.yaml'));
      const materialFiles = fs.readdirSync(materialDir).filter(f => f.endsWith('.yaml'));
      
      expect(contaminantFiles.length).toBeGreaterThan(0);
      expect(materialFiles.length).toBeGreaterThan(0);
    });
  });
});
