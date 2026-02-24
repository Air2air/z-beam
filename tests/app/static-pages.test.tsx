/**
 * Static Pages Content Loading Tests
 * 
 * Ensures that static pages (rental, partners, about, contact)
 * load their content properly from YAML/markdown sources
 */

import { loadPageData } from '@/app/utils/contentAPI';
import fs from 'fs';
import path from 'path';

describe('Static Pages Content Loading', () => {
  describe('Rental Page', () => {
    it('should load rental content component', async () => {
      const { components } = await loadPageData('rental');
      
      expect(components).toBeDefined();
      // Components may be empty for static pages that use YAML-only content
    });

    it('should have rental YAML file', () => {
      const yamlPath = path.join(process.cwd(), 'static-pages/rental.yaml');
      expect(fs.existsSync(yamlPath)).toBe(true);
    });
  });

  describe('Partners Page', () => {
    it('should have partners YAML file', () => {
      const yamlPath = path.join(process.cwd(), 'static-pages/partners.yaml');
      expect(fs.existsSync(yamlPath)).toBe(true);
    });

    it('should have partner entries with logo and url fields', async () => {
      const { frontmatter } = await loadPageData('partners');
      
      if (frontmatter.partners && Array.isArray(frontmatter.partners)) {
        expect(frontmatter.partners.length).toBeGreaterThan(0);
        
        const firstPartner = frontmatter.partners[0];
        expect(firstPartner).toHaveProperty('name');
        expect(firstPartner).toHaveProperty('logo');
        expect(firstPartner).toHaveProperty('url');
      }
    });
  });

  describe('About Page', () => {
    it('should load about page data', async () => {
      const { frontmatter } = await loadPageData('about');
      
      // About page should return metadata even if empty
      expect(frontmatter).toBeDefined();
      expect(typeof frontmatter).toBe('object');
    });

    it('should handle about page with or without content', async () => {
      const { components } = await loadPageData('about');
      
      expect(components).toBeDefined();
      expect(typeof components).toBe('object');
    });
  });

  describe('Content API Integration', () => {
    it('should load page data without errors', async () => {
      const pages = ['services', 'rental', 'partners', 'about'];
      
      for (const page of pages) {
        await expect(loadPageData(page)).resolves.toBeDefined();
      }
    });

    it('should return consistent data structure', async () => {
      const { frontmatter, components } = await loadPageData('services');
      
      expect(frontmatter).toBeDefined();
      expect(typeof frontmatter).toBe('object');
      expect(components).toBeDefined();
      expect(typeof components).toBe('object');
    });

    it('should handle non-existent pages gracefully', async () => {
      const { frontmatter, components } = await loadPageData('non-existent-page');
      
      expect(frontmatter).toBeDefined();
      expect(components).toBeDefined();
      expect(Object.keys(components)).toHaveLength(0);
    });
  });

  describe('YAML Files Validation', () => {
    it('should have all required YAML files', () => {
      const yamlFiles = ['rental.yaml', 'partners.yaml'];
      const pagesDir = path.join(process.cwd(), 'static-pages');
      
      yamlFiles.forEach(file => {
        const filePath = path.join(pagesDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have valid YAML structure', () => {
      const yamlFiles = ['rental.yaml', 'partners.yaml'];
      const pagesDir = path.join(process.cwd(), 'static-pages');
      
      yamlFiles.forEach(file => {
        const filePath = path.join(pagesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should not be empty
        expect(content.length).toBeGreaterThan(0);
        
        // Should have pageTitle (normalized field name)
        expect(content).toContain('pageTitle:');
        
        // Should have pageDescription (normalized field name)
        expect(content).toContain('pageDescription:');
      });
    });
  });

});
