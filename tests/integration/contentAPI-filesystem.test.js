/**
 * Content API File System Integration Tests
 * Tests real file system operations without mocks to catch path configuration issues
 */

const path = require('path');
const fs = require('fs');

// Import real contentAPI - NO MOCKS
const { getArticle, getAllArticleSlugs, loadMetadata } = require('../../app/utils/contentAPI');

describe('ContentAPI File System Integration', () => {
  describe('Directory Structure Validation', () => {
    test('frontmatter/materials directory exists and is readable', () => {
      const frontmatterDir = path.join(process.cwd(), 'frontmatter', 'materials');
      expect(fs.existsSync(frontmatterDir)).toBe(true);
      
      // Verify it's a directory
      const stats = fs.statSync(frontmatterDir);
      expect(stats.isDirectory()).toBe(true);
    });

    test('frontmatter/materials contains YAML files', () => {
      const frontmatterDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const files = fs.readdirSync(frontmatterDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml'));
      
      expect(yamlFiles.length).toBeGreaterThan(0);
      expect(yamlFiles.length).toBeGreaterThan(100); // We have 132+ materials
    });

    test('specific test materials exist', () => {
      const frontmatterDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const testMaterials = [
        'granite-laser-cleaning.yaml',
        'aluminum-laser-cleaning.yaml',
        'steel-laser-cleaning.yaml',
        'copper-laser-cleaning.yaml'
      ];

      testMaterials.forEach(material => {
        const materialPath = path.join(frontmatterDir, material);
        expect(fs.existsSync(materialPath)).toBe(true);
      });
    });

    test('OLD content/frontmatter directory should NOT be used', () => {
      const oldDir = path.join(process.cwd(), 'content', 'frontmatter');
      
      // If it exists, it should be empty or have very few files
      if (fs.existsSync(oldDir)) {
        const files = fs.readdirSync(oldDir).filter(f => f.endsWith('.yaml'));
        expect(files.length).toBe(0); // Should be empty after migration
      }
    });
  });

  describe('getArticle() Real File Loading', () => {
    test('can load granite-laser-cleaning material', async () => {
      const article = await getArticle('granite-laser-cleaning');
      
      expect(article).not.toBeNull();
      expect(article).toBeDefined();
      expect(article.metadata).toBeDefined();
      expect(article.metadata.title).toBe('Granite Laser Cleaning');
      expect(article.metadata.category).toBe('stone');
      expect(article.metadata.subcategory).toBe('igneous');
    });

    test('can load aluminum-laser-cleaning material', async () => {
      const article = await getArticle('aluminum-laser-cleaning');
      
      expect(article).not.toBeNull();
      expect(article.metadata).toBeDefined();
      expect(article.metadata.title).toBe('Aluminum Laser Cleaning');
      expect(article.metadata.category).toBe('metal');
      expect(article.metadata.subcategory).toBe('non-ferrous');
    });

    test('can load ceramic material (alumina)', async () => {
      const article = await getArticle('alumina-laser-cleaning');
      
      expect(article).not.toBeNull();
      expect(article.metadata).toBeDefined();
      expect(article.metadata.title).toBe('Alumina Laser Cleaning');
      expect(article.metadata.category).toBe('ceramic');
      expect(article.metadata.subcategory).toBe('oxide');
    });

    test('can load composite material', async () => {
      const article = await getArticle('carbon-fiber-reinforced-polymer-laser-cleaning');
      
      expect(article).not.toBeNull();
      expect(article.metadata).toBeDefined();
      expect(article.metadata.category).toBe('composite');
      expect(article.metadata.subcategory).toBe('fiber-reinforced');
    });

    test('returns null for non-existent material', async () => {
      const article = await getArticle('non-existent-material-xyz-123');
      
      expect(article).toBeNull();
    });

    test('loaded articles have required metadata fields', async () => {
      const article = await getArticle('granite-laser-cleaning');
      
      expect(article.metadata).toHaveProperty('title');
      expect(article.metadata).toHaveProperty('material_description');
      expect(article.metadata).toHaveProperty('category');
      expect(article.metadata).toHaveProperty('subcategory');
      expect(article.metadata).toHaveProperty('name');
    });
  });

  describe('getAllArticleSlugs() Real File Discovery', () => {
    test('returns array of slugs from actual files', async () => {
      const slugs = await getAllArticleSlugs();
      
      expect(Array.isArray(slugs)).toBe(true);
      expect(slugs.length).toBeGreaterThan(100); // We have 132+ materials
    });

    test('includes known material slugs', async () => {
      const slugs = await getAllArticleSlugs();
      
      expect(slugs).toContain('granite-laser-cleaning');
      expect(slugs).toContain('aluminum-laser-cleaning');
      expect(slugs).toContain('steel-laser-cleaning');
      expect(slugs).toContain('copper-laser-cleaning');
    });

    test('all returned slugs can be loaded', async () => {
      const slugs = await getAllArticleSlugs();
      
      // Test first 10 slugs to avoid slow test
      const testSlugs = slugs.slice(0, 10);
      
      for (const slug of testSlugs) {
        const article = await getArticle(slug);
        expect(article).not.toBeNull();
      }
    }, 30000); // 30 second timeout for loading multiple files
  });

  describe('loadMetadata() Direct File Reading', () => {
    test('loads granite frontmatter data', async () => {
      const data = await loadMetadata('granite-laser-cleaning');
      
      expect(data).toBeDefined();
      expect(data.name).toBe('Granite');
      expect(data.category).toBe('stone');
      expect(data.subcategory).toBe('igneous');
      expect(data.title).toBe('Granite Laser Cleaning');
    });

    test('loads aluminum frontmatter data', async () => {
      const data = await loadMetadata('aluminum-laser-cleaning');
      
      expect(data).toBeDefined();
      expect(data.name).toBe('Aluminum');
      expect(data.category).toBe('metal');
    });

    test('returns empty object for non-existent file', async () => {
      const data = await loadMetadata('non-existent-material');
      
      expect(data).toEqual({});
    });
  });

  describe('Category/Subcategory Data Integrity', () => {
    test('all materials have category and subcategory fields', async () => {
      const slugs = await getAllArticleSlugs();
      
      // Test sample of materials
      const sampleSlugs = slugs.slice(0, 20);
      
      for (const slug of sampleSlugs) {
        const data = await loadMetadata(slug);
        
        expect(data.category).toBeDefined();
        expect(data.category).not.toBe('');
        expect(data.subcategory).toBeDefined();
        expect(data.subcategory).not.toBe('');
      }
    }, 30000);

    test('category/subcategory values are normalized (lowercase with dashes)', async () => {
      const article = await getArticle('granite-laser-cleaning');
      
      // After normalization
      expect(article.metadata.category).toBe('stone');
      expect(article.metadata.subcategory).toBe('igneous');
      
      // Should not have spaces or uppercase
      expect(article.metadata.category).not.toMatch(/[A-Z\s]/);
      expect(article.metadata.subcategory).not.toMatch(/[A-Z\s]/);
    });
  });

  describe('Image Path Validation', () => {
    test('material images exist in public/images/material/', async () => {
      const article = await getArticle('granite-laser-cleaning');
      
      if (article.metadata.images && article.metadata.images.hero) {
        const imagePath = article.metadata.images.hero.url;
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    });

    test('sample of materials have valid image paths', async () => {
      const testMaterials = [
        'granite-laser-cleaning',
        'aluminum-laser-cleaning',
        'copper-laser-cleaning'
      ];

      for (const slug of testMaterials) {
        const article = await getArticle(slug);
        
        if (article && article.metadata.images && article.metadata.images.hero) {
          const imagePath = article.metadata.images.hero.url;
          const fullPath = path.join(process.cwd(), 'public', imagePath);
          
          expect(fs.existsSync(fullPath)).toBe(true);
        }
      }
    });
  });
});
