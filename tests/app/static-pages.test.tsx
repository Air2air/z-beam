/**
 * Static Pages Content Loading Tests
 * 
 * Ensures that static pages (services, rental, partners, about, contact)
 * load their content properly from YAML/markdown sources
 */

import { loadPageData } from '@/app/utils/contentAPI';
import fs from 'fs';
import path from 'path';

describe('Static Pages Content Loading', () => {
  describe('Services Page', () => {
    it('should load services metadata from YAML', async () => {
      const { metadata } = await loadPageData('services');
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.slug).toBe('services');
    });

    it('should load services content component', async () => {
      const { components } = await loadPageData('services');
      
      expect(components).toBeDefined();
      expect(Object.keys(components).length).toBeGreaterThan(0);
      expect(components.text).toBeDefined();
    });

    it('should have services text markdown file', () => {
      const textPath = path.join(process.cwd(), 'content/components/text/services.md');
      expect(fs.existsSync(textPath)).toBe(true);
    });
  });

  describe('Rental Page', () => {
    it('should load rental metadata from YAML', async () => {
      const { metadata } = await loadPageData('rental');
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Equipment Rental');
      expect(metadata.description).toContain('Professional laser cleaning equipment rental');
      expect(metadata.slug).toBe('rental');
    });

    it('should load rental content component', async () => {
      const { components } = await loadPageData('rental');
      
      expect(components).toBeDefined();
      expect(Object.keys(components).length).toBeGreaterThan(0);
      expect(components.text).toBeDefined();
    });

    it('should have rental text markdown file', () => {
      const textPath = path.join(process.cwd(), 'content/components/text/rental.md');
      expect(fs.existsSync(textPath)).toBe(true);
    });
  });

  describe('Partners Page', () => {
    it('should load partners metadata from YAML', async () => {
      const { metadata } = await loadPageData('partners');
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toContain('Partners');
      expect(metadata.slug).toBe('partners');
    });

    it('should have partners YAML file', () => {
      const yamlPath = path.join(process.cwd(), 'content/pages/partners.yaml');
      expect(fs.existsSync(yamlPath)).toBe(true);
    });

    it('should have partner entries with logo and url fields', async () => {
      const { metadata } = await loadPageData('partners');
      
      if (metadata.partners && Array.isArray(metadata.partners)) {
        expect(metadata.partners.length).toBeGreaterThan(0);
        
        const firstPartner = metadata.partners[0];
        expect(firstPartner).toHaveProperty('name');
        expect(firstPartner).toHaveProperty('logo');
        expect(firstPartner).toHaveProperty('url');
      }
    });
  });

  describe('About Page', () => {
    it('should load about page data', async () => {
      const { metadata } = await loadPageData('about');
      
      // About page should return metadata even if empty
      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe('object');
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
      const { metadata, components } = await loadPageData('services');
      
      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe('object');
      expect(components).toBeDefined();
      expect(typeof components).toBe('object');
    });

    it('should handle non-existent pages gracefully', async () => {
      const { metadata, components } = await loadPageData('non-existent-page');
      
      expect(metadata).toBeDefined();
      expect(components).toBeDefined();
      expect(Object.keys(components)).toHaveLength(0);
    });
  });

  describe('YAML Files Validation', () => {
    it('should have all required YAML files', () => {
      const yamlFiles = ['services.yaml', 'rental.yaml', 'partners.yaml'];
      const pagesDir = path.join(process.cwd(), 'content/pages');
      
      yamlFiles.forEach(file => {
        const filePath = path.join(pagesDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have valid YAML structure', () => {
      const yamlFiles = ['services.yaml', 'rental.yaml', 'partners.yaml'];
      const pagesDir = path.join(process.cwd(), 'content/pages');
      
      yamlFiles.forEach(file => {
        const filePath = path.join(pagesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should not be empty
        expect(content.length).toBeGreaterThan(0);
        
        // Should have title
        expect(content).toContain('title:');
        
        // Should have description
        expect(content).toContain('description:');
      });
    });
  });

  describe('Text Components Validation', () => {
    it('should have required text markdown files', () => {
      const textFiles = ['services.md', 'rental.md'];
      const textDir = path.join(process.cwd(), 'content/components/text');
      
      textFiles.forEach(file => {
        const filePath = path.join(textDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have valid markdown structure', () => {
      const textFiles = ['services.md', 'rental.md'];
      const textDir = path.join(process.cwd(), 'content/components/text');
      
      textFiles.forEach(file => {
        const filePath = path.join(textDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Should not be empty
        expect(content.length).toBeGreaterThan(0);
        
        // Should have at least one heading
        expect(content).toMatch(/#\s+/);
      });
    });
  });

  describe('Page Rendering Prevention', () => {
    it('should not show "being prepared" message when content exists', async () => {
      const { components } = await loadPageData('services');
      
      // If components is defined and has content, page should render
      expect(Object.keys(components).length).toBeGreaterThan(0);
    });

    it('should have text component for all static pages', async () => {
      const pagesWithText = ['services', 'rental'];
      
      for (const page of pagesWithText) {
        const { components } = await loadPageData(page);
        expect(components.text).toBeDefined();
        expect(components.text.content).toBeTruthy();
      }
    });
  });
});
