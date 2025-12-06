// tests/sitemap/sitemap.test.ts
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Sitemap Validation', () => {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter/materials');
  const sitemapPath = path.join(process.cwd(), 'app/sitemap.ts');

  describe('Sitemap File Existence', () => {
    it('should have a sitemap.ts file', () => {
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });

    it('should have frontmatter directory', () => {
      expect(fs.existsSync(frontmatterDir)).toBe(true);
    });
  });

  describe('Sitemap Content Validation', () => {
    it('should dynamically read frontmatter files', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Check for required imports
      expect(sitemapContent).toContain("import fs from 'fs'");
      expect(sitemapContent).toContain("import path from 'path'");
      
      // Check for dynamic material route generation
      expect(sitemapContent).toContain('frontmatterDir');
      expect(sitemapContent).toContain('fs.readdirSync');
      expect(sitemapContent).toContain('materialPageRoutes');
    });

    it('should include all static routes', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      const requiredRoutes = [
        '/about',
        '/services',
        '/rental',
        '/partners',
        '/contact',
        '/search'
      ];

      requiredRoutes.forEach(route => {
        expect(sitemapContent).toContain(`\`\${baseUrl}${route}\``);
      });
    });

    it('should generate hierarchical material routes', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Should use URL builder functions for material routes
      expect(sitemapContent).toContain("buildCategoryUrl('materials'");
      expect(sitemapContent).toContain("buildSubcategoryUrl('materials'");
      expect(sitemapContent).toContain("buildUrlFromMetadata");
    });
  });

  describe('Frontmatter Files Coverage', () => {
    it('should have YAML files in frontmatter directory', () => {
      const files = fs.readdirSync(frontmatterDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml'));
      
      expect(yamlFiles.length).toBeGreaterThan(0);
      console.log(`\n✓ Found ${yamlFiles.length} material files that will be included in sitemap`);
    });

    it('should follow naming convention for material files', () => {
      const files = fs.readdirSync(frontmatterDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml'));
      
      yamlFiles.forEach(file => {
        // Should end with -laser-cleaning.yaml
        expect(file).toMatch(/-laser-cleaning\.yaml$/);
      });
    });

    it('should extract category and subcategory from YAML files', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Sitemap should parse YAML frontmatter using regex
      expect(sitemapContent).toContain('categoryMatch');
      expect(sitemapContent).toContain('subcategoryMatch');
      expect(sitemapContent).toContain('fileContent.match');
    });
  });

  describe('Sitemap Generation Logic', () => {
    it('should handle missing frontmatter directory gracefully', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Should have try-catch error handling
      expect(sitemapContent).toContain('try {');
      expect(sitemapContent).toContain('catch (error)');
      expect(sitemapContent).toContain('console.error');
    });

    it('should set appropriate priorities for different page types', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Material pages should have high priority (0.8)
      expect(sitemapContent).toContain('priority: 0.8');
      
      // Subcategory pages should have priority (0.75)
      expect(sitemapContent).toContain('priority: 0.75');
      
      // Category pages should have priority (0.7)
      expect(sitemapContent).toContain('priority: 0.7');
    });

    it('should use file modification time for lastModified', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      expect(sitemapContent).toContain('fs.statSync');
      expect(sitemapContent).toContain('stats.mtime');
    });
  });

  describe('SEO Best Practices', () => {
    it('should have changeFrequency defined for all routes', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      expect(sitemapContent).toContain('changeFrequency:');
    });

    it('should have priority values between 0 and 1', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      const priorityMatches = sitemapContent.match(/priority:\s*([\d.]+)/g);
      expect(priorityMatches).toBeTruthy();
      
      priorityMatches?.forEach(match => {
        const value = parseFloat(match.split(':')[1].trim());
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('should have home page with highest priority', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Home page should be priority 1.0
      expect(sitemapContent).toContain('priority: 1.0');
    });
  });

  describe('Type Safety', () => {
    it('should define or import SitemapEntry type', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      // Type can be defined locally or imported
      expect(sitemapContent).toMatch(/interface SitemapEntry|import.*SitemapEntry/);
      expect(sitemapContent).toContain('SitemapEntry[]');
    });

    it('should export default sitemap function', () => {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      
      expect(sitemapContent).toContain('export default function sitemap()');
    });
  });
});
