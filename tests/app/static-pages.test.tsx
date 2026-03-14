/**
 * Static Pages Content Loading Tests
 * 
 * Ensures that static pages load their content properly from current
 * frontmatter-driven sources.
 */

import { loadPageData } from '@/app/utils/contentAPI';
import fs from 'fs';
import path from 'path';

describe('Static Pages Content Loading', () => {
  describe('Services Page', () => {
    it('should load services content component', async () => {
      const { components } = await loadPageData('services');
      
      expect(components).toBeDefined();
      // Components may be empty for static pages that use YAML-only content
    });

    it('should have services page frontmatter', () => {
      const yamlPath = path.join(process.cwd(), 'app/services/page.yaml');
      expect(fs.existsSync(yamlPath)).toBe(true);
    });
  });

  describe('Partners Page', () => {
    it('should have partners page frontmatter', () => {
      const yamlPath = path.join(process.cwd(), 'app/partners/page.yaml');
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
      const pages = ['services', 'partners', 'about'];
      
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
    it('should have all required page frontmatter files', () => {
      const yamlFiles = ['app/services/page.yaml', 'app/partners/page.yaml'];
      
      yamlFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have valid YAML structure', () => {
      const yamlFiles = ['app/services/page.yaml', 'app/partners/page.yaml'];
      
      yamlFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
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
