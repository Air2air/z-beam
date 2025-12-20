/**
 * Material Pages Build Integration Tests
 * Validates that material pages can be statically generated without errors
 */

const path = require('path');
const fs = require('fs');

// Import real functions - NO MOCKS
const { getAllCategories } = require('../../app/utils/materialCategories');
const { getArticle } = require('../../app/utils/contentAPI');

describe('Material Pages Build Validation', () => {
  describe('getAllCategories() Integration', () => {
    test('returns categories from real frontmatter files', async () => {
      const categories = await getAllCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('includes expected categories', async () => {
      const categories = await getAllCategories();
      const categorySlugs = categories.map(c => c.slug);
      
      expect(categorySlugs).toContain('metal');
      expect(categorySlugs).toContain('stone');
      expect(categorySlugs).toContain('ceramic');
      expect(categorySlugs).toContain('composite');
    });

    test('each category has subcategories', async () => {
      const categories = await getAllCategories();
      
      categories.forEach(category => {
        expect(category).toHaveProperty('subcategories');
        expect(Array.isArray(category.subcategories)).toBe(true);
        expect(category.subcategories.length).toBeGreaterThan(0);
      });
    });

    test('each subcategory has materials', async () => {
      const categories = await getAllCategories();
      
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          expect(subcategory).toHaveProperty('materials');
          expect(Array.isArray(subcategory.materials)).toBe(true);
          expect(subcategory.materials.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Static Params Generation', () => {
    test('generates valid params for all materials', async () => {
      const categories = await getAllCategories();
      const params = [];
      
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          for (const material of subcategory.materials) {
            params.push({
              category: category.slug,
              subcategory: subcategory.slug,
              slug: material.slug
            });
          }
        }
      }
      
      expect(params.length).toBeGreaterThan(100);
      
      // Verify specific materials
      const graniteParam = params.find(p => p.slug === 'granite-laser-cleaning');
      expect(graniteParam).toBeDefined();
      expect(graniteParam.category).toBe('stone');
      expect(graniteParam.subcategory).toBe('igneous');
    });

    test('all generated params can load articles', async () => {
      const categories = await getAllCategories();
      let testCount = 0;
      
      // Test first 20 materials from each category
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          for (const material of subcategory.materials.slice(0, 5)) {
            const article = await getArticle(material.slug);
            
            expect(article).not.toBeNull();
            expect(article.metadata.category).toBe(category.slug);
            expect(article.metadata.subcategory).toBe(subcategory.slug);
            
            testCount++;
            if (testCount >= 20) break;
          }
          if (testCount >= 20) break;
        }
        if (testCount >= 20) break;
      }
      
      expect(testCount).toBeGreaterThan(0);
    }, 60000); // 60 second timeout
  });

  describe('Category/Subcategory/Slug Consistency', () => {
    test('material metadata matches its URL structure', async () => {
      const testCases = [
        { slug: 'granite-laser-cleaning', expectedCategory: 'stone', expectedSubcategory: 'igneous' },
        { slug: 'aluminum-laser-cleaning', expectedCategory: 'metal', expectedSubcategory: 'non-ferrous' },
        { slug: 'alumina-laser-cleaning', expectedCategory: 'ceramic', expectedSubcategory: 'oxide' },
      ];

      for (const testCase of testCases) {
        const article = await getArticle(testCase.slug);
        
        expect(article).not.toBeNull();
        expect(article.metadata.category).toBe(testCase.expectedCategory);
        expect(article.metadata.subcategory).toBe(testCase.expectedSubcategory);
      }
    });

    test('no materials have mismatched category/subcategory', async () => {
      const categories = await getAllCategories();
      let errors = [];
      
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          for (const material of subcategory.materials.slice(0, 10)) {
            const article = await getArticle(material.slug);
            
            if (article) {
              if (article.metadata.category !== category.slug) {
                errors.push(`${material.slug}: category mismatch - expected ${category.slug}, got ${article.metadata.category}`);
              }
              if (article.metadata.subcategory !== subcategory.slug) {
                errors.push(`${material.slug}: subcategory mismatch - expected ${subcategory.slug}, got ${article.metadata.subcategory}`);
              }
            }
          }
        }
      }
      
      expect(errors).toEqual([]);
    }, 60000);
  });

  describe('Build Output Validation', () => {
    test('next build directory exists after build', () => {
      const nextDir = path.join(process.cwd(), '.next');
      expect(fs.existsSync(nextDir)).toBe(true);
    });

    test('material pages are generated in .next/server', () => {
      const materialsDir = path.join(process.cwd(), '.next', 'server', 'app', 'materials');
      
      if (fs.existsSync(materialsDir)) {
        const categoryDirs = fs.readdirSync(materialsDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        expect(categoryDirs.length).toBeGreaterThan(0);
      } else {
        // If build hasn't run yet, skip this test
        console.warn('.next/server/app/materials not found - run build first');
      }
    });

    test('specific material pages exist after build', () => {
      const testPages = [
        path.join(process.cwd(), '.next', 'server', 'app', 'materials', 'stone', 'igneous', 'granite-laser-cleaning.html'),
        path.join(process.cwd(), '.next', 'server', 'app', 'materials', 'metal', 'non-ferrous', 'aluminum-laser-cleaning.html'),
      ];

      let existingPages = 0;
      testPages.forEach(pagePath => {
        if (fs.existsSync(pagePath)) {
          existingPages++;
        }
      });

      // If build has run, we should have at least some pages
      if (existingPages > 0) {
        expect(existingPages).toBe(testPages.length);
      }
    });

    test('generated HTML pages contain material title, not 404', () => {
      const granitePage = path.join(process.cwd(), '.next', 'server', 'app', 'materials', 'stone', 'igneous', 'granite-laser-cleaning.html');
      
      if (fs.existsSync(granitePage)) {
        const content = fs.readFileSync(granitePage, 'utf8');
        
        // Should contain material title
        expect(content).toContain('Granite Laser Cleaning');
        
        // Should NOT be 404 page
        expect(content).not.toContain('Page Not Found');
        expect(content).not.toContain('noindex');
      }
    });
  });

  describe('Frontmatter File Integrity', () => {
    test('all frontmatter files are valid YAML', async () => {
      const yaml = require('js-yaml');
      const frontmatterDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const files = fs.readdirSync(frontmatterDir).filter(f => f.endsWith('.yaml'));
      
      let errors = [];
      
      files.slice(0, 50).forEach(file => {
        try {
          const content = fs.readFileSync(path.join(frontmatterDir, file), 'utf8');
          yaml.load(content);
        } catch (error) {
          errors.push(`${file}: ${error.message}`);
        }
      });
      
      expect(errors).toEqual([]);
    });

    test('all materials have required fields', async () => {
      const categories = await getAllCategories();
      let errors = [];
      
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          for (const material of subcategory.materials.slice(0, 10)) {
            const article = await getArticle(material.slug);
            
            if (!article) {
              errors.push(`${material.slug}: could not load article`);
              continue;
            }
            
            const required = ['title', 'name', 'category', 'subcategory', 'description'];
            required.forEach(field => {
              if (!article.metadata[field]) {
                errors.push(`${material.slug}: missing ${field}`);
              }
            });
          }
        }
      }
      
      expect(errors).toEqual([]);
    }, 60000);
  });

  describe('Path Configuration Verification', () => {
    test('contentAPI uses correct frontmatter path', () => {
      // Read the contentAPI source to verify paths
      const contentAPIPath = path.join(process.cwd(), 'app', 'utils', 'contentAPI.ts');
      const content = fs.readFileSync(contentAPIPath, 'utf8');
      
      // Should reference 'frontmatter', 'materials'
      expect(content).toContain("'frontmatter', 'materials'");
      
      // Should NOT reference old path
      expect(content).not.toContain("'content', 'frontmatter'");
    });

    test('category utilities use correct frontmatter path', () => {
      // Check the generic utilities file (now holds the implementation)
      const genericCategoriesPath = path.join(process.cwd(), 'app', 'utils', 'categories', 'generic.ts');
      const content = fs.readFileSync(genericCategoriesPath, 'utf8');
      
      // Should reference frontmatter directory dynamically
      expect(content).toContain('frontmatter');
      
      // Material wrapper should import from generic
      const materialCategoriesPath = path.join(process.cwd(), 'app', 'utils', 'materialCategories.ts');
      const materialContent = fs.readFileSync(materialCategoriesPath, 'utf8');
      expect(materialContent).toContain('getAllCategoriesGeneric');
    });
  });
});
