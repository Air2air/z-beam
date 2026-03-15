import { loadStaticPageFrontmatter } from '../../app/utils/staticPageLoader';
import fs from 'fs';
import path from 'path';

import {
  EQUIPMENT_RENTAL_PRICING,
} from '@/app/config/site';
import { STATIC_PAGE_KEYS } from '@/app/utils/pages/staticPageRegistry';

describe('staticPageLoader', () => {
  describe('loadStaticPageFrontmatter', () => {
    it('should load basic page YAML frontmatter with standard structure', () => {
      const result = loadStaticPageFrontmatter('contact');
      
      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('pageDescription');
      expect(typeof result.pageTitle).toBe('string');
      expect(typeof result.pageDescription).toBe('string');
    });



    it('should include metadata fields from YAML', () => {
      const result = loadStaticPageFrontmatter('contact');
      
      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('pageDescription');
    });

    it('should handle pages with or without content cards', () => {
      const result = loadStaticPageFrontmatter('contact');
      
      // ContentCards are optional in new YAML structure
      if (result.contentCards) {
        expect(Array.isArray(result.contentCards)).toBe(true);
      }
    });

    it('should handle all registered static pages consistently', () => {
      const pageDirectories = STATIC_PAGE_KEYS;

      pageDirectories.forEach(directory => {
        const result = loadStaticPageFrontmatter(directory);
        expect(result).toHaveProperty('pageTitle');
        expect(result).toHaveProperty('pageDescription');
        expect(typeof result.pageTitle).toBe('string');
        expect(typeof result.pageDescription).toBe('string');
      });
    });

    it('should load homepage frontmatter from the shared app root contract', () => {
      const result = loadStaticPageFrontmatter('home') as {
        title: string;
        featuredSections?: Array<{ slug: string }>;
      };

      expect(result.title).toBe('Laser Cleaning Equipment Rentals and Services');
      expect(Array.isArray(result.featuredSections)).toBe(true);
      expect(result.featuredSections?.some(section => section.slug === 'applications')).toBe(true);
    });

    it('should enrich services pricing copy from site config', () => {
      const result = loadStaticPageFrontmatter('services') as {
        pageDescription: string;
        images?: { hero?: { url?: string }; og?: { url?: string }; twitter?: { url?: string } };
        schema?: { offers?: { price?: string } };
        openGraph?: { description?: string };
        twitter?: { description?: string };
      };

      expect(result.pageDescription).toBe('');
      expect(result.schema?.offers?.price).toBe(String(EQUIPMENT_RENTAL_PRICING.packages.residential.hourlyRate));
      expect(result.openGraph?.description).toContain(`$${EQUIPMENT_RENTAL_PRICING.packages.residential.hourlyRate}/hr`);
      expect(result.twitter?.description).toContain(`$${EQUIPMENT_RENTAL_PRICING.packages.industrial.hourlyRate}/hr`);
    });

    it('should allow contact, services, and equipment to omit visible hero images while keeping social images', () => {
      const pages = ['contact', 'services', 'equipment'] as const;

      pages.forEach(pageKey => {
        const result = loadStaticPageFrontmatter(pageKey);

        expect(result.images?.hero).toBeUndefined();
        expect(result.images?.og?.url).toBeTruthy();
        expect(result.images?.twitter?.url).toBeTruthy();
      });
    });

    it('should keep pricing literals out of services yaml source', () => {
      const yamlPath = path.join(process.cwd(), 'app', 'services', 'page.yaml');
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');

      expect(yamlContent).not.toContain('$190/hr');
      expect(yamlContent).not.toContain('$270/hr');
      expect(yamlContent).not.toContain('price: "190"');
    });



    it('should maintain consistent return type structure', () => {
      const result = loadStaticPageFrontmatter('contact');

      // Should have standard YAML frontmatter structure
      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('pageDescription');
      expect(typeof result.pageTitle).toBe('string');
      expect(typeof result.pageDescription).toBe('string');
    });
  });
});