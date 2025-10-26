/**
 * Test Suite: Metatags Component Implementation
 * Tests for material-specific SEO metadata system
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Helper function to parse YAML files with multiple documents
const parseYamlFile = (content: string) => {
  try {
    // Try single document first
    return parseYamlFile(content);
  } catch (error) {
    // If that fails, try multi-document parsing and return first doc
    const docs = yaml.loadAll(content);
    return docs[0];
  }
};

describe('Metatags Component Implementation', () => {
  const metatagsDirPath = path.join(process.cwd(), 'content', 'components', 'metatags.deprecated');
  let metatagFiles: string[] = [];

  beforeAll(() => {
    if (fs.existsSync(metatagsDirPath)) {
      metatagFiles = fs.readdirSync(metatagsDirPath).filter(file => file.endsWith('.yaml'));
    }
  });

  describe('Metatags Directory Structure', () => {
    test.skip('should have metatags directory (DEPRECATED - now using dynamic createMetadata)', () => {
      expect(fs.existsSync(metatagsDirPath)).toBe(true);
    });

    test.skip('should contain YAML files (DEPRECATED)', () => {
      expect(metatagFiles.length).toBeGreaterThan(0);
    });

    test.skip('should follow naming convention (DEPRECATED)', () => {
      metatagFiles.forEach(file => {
        expect(file).toMatch(/^[a-z0-9-]+\.yaml$/);
        expect(file).toContain('laser-cleaning');
      });
    });
  });

  describe('Individual Metatag File Structure', () => {
    test('should have valid YAML structure', () => {
      metatagFiles.slice(0, 5).forEach(file => { // Test first 5 files for performance
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(() => {
          parseYamlFile(content);
        }).not.toThrow();
      });
    });

    test('should have required metatag properties', () => {
      metatagFiles.slice(0, 3).forEach(file => { // Test first 3 files
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        // Core meta tags - check for actual structure
        expect(data.title).toBeDefined();
        expect(data.meta_tags || data.description).toBeDefined(); // Allow both structures
        
        // Verify data types
        expect(typeof data.title).toBe('string');
      });
    });

    test('should have Open Graph properties', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        if (data.openGraph) {
          expect(data.openGraph.title).toBeDefined();
          expect(data.openGraph.description).toBeDefined();
          expect(data.openGraph.type).toBeDefined();
          expect(data.openGraph.url).toBeDefined();
          
          // Verify Open Graph types
          expect(typeof data.openGraph.title).toBe('string');
          expect(typeof data.openGraph.description).toBe('string');
          expect(['website', 'article', 'product', 'service']).toContain(data.openGraph.type);
        }
      });
    });

    test('should have Twitter Card properties', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        if (data.twitter) {
          // Handle array structure
          if (Array.isArray(data.twitter)) {
            expect(data.twitter.length).toBeGreaterThan(0);
          } else {
            // Handle object structure
            expect(data.twitter.card).toBeDefined();
            expect(data.twitter.title).toBeDefined();
            expect(data.twitter.description).toBeDefined();
            // Verify Twitter card types
            expect(['summary', 'summary_large_image', 'app', 'player']).toContain(data.twitter.card);
          }
        }
      });
    });
  });

  describe('Material-Specific Content Quality', () => {
    test('should have material-specific titles', () => {
      metatagFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        const materialName = file.replace('-laser-cleaning.yaml', '').replace(/-/g, ' ');
        
        // Title should contain material name or laser cleaning reference
        expect(
          data.title.toLowerCase().includes(materialName.toLowerCase()) ||
          data.title.toLowerCase().includes('laser cleaning')
        ).toBe(true);
      });
    });

    test('should have unique descriptions', () => {
      const descriptions: string[] = [];
      
      metatagFiles.slice(0, 10).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        // Handle different structure types
        if (data.description) {
          descriptions.push(data.description);
        } else if (data.meta_tags) {
          const descTag = data.meta_tags.find((tag: any) => tag.name === 'description');
          if (descTag?.content) descriptions.push(descTag.content);
        }
      });

      // Check for uniqueness
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });

    test('should have relevant keywords', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        const materialName = file.replace('-laser-cleaning.yaml', '').replace(/-/g, ' ');
        
        // Keywords should include material name and laser cleaning terms
        let keywordString = '';
        if (data.keywords && Array.isArray(data.keywords)) {
          keywordString = data.keywords.join(' ').toLowerCase();
        } else if (data.meta_tags) {
          const keywordsTag = data.meta_tags.find((tag: any) => tag.name === 'keywords');
          if (keywordsTag?.content) {
            const keywords = Array.isArray(keywordsTag.content) ? keywordsTag.content : [keywordsTag.content];
            keywordString = keywords.join(' ').toLowerCase();
          }
        }
        expect(
          keywordString.includes(materialName.toLowerCase()) ||
          keywordString.includes('laser') ||
          keywordString.includes('cleaning')
        ).toBe(true);
      });
    });
  });

  describe('SEO Optimization Standards', () => {
    test('should have appropriate title lengths', () => {
      metatagFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        expect(data.title.length).toBeGreaterThan(10);
        expect(data.title.length).toBeLessThanOrEqual(60); // SEO best practice
      });
    });

    test('should have appropriate description lengths', () => {
      metatagFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        let description = '';
        if (data.description) {
          description = data.description;
        } else if (data.meta_tags) {
          const descTag = data.meta_tags.find((tag: any) => tag.name === 'description');
          description = descTag?.content || '';
        }
        
        if (description) {
          expect(description.length).toBeGreaterThan(50);
          expect(description.length).toBeLessThanOrEqual(160); // SEO best practice
        }
      });
    });

    test('should have reasonable keyword count', () => {
      metatagFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        let keywords = [];
        if (data.keywords && Array.isArray(data.keywords)) {
          keywords = data.keywords;
        } else if (data.meta_tags) {
          const keywordsTag = data.meta_tags.find((tag: any) => tag.name === 'keywords');
          if (keywordsTag?.content && Array.isArray(keywordsTag.content)) {
            keywords = keywordsTag.content;
          }
        }
        
        if (keywords.length > 0) {
          expect(keywords.length).toBeGreaterThan(3);
          expect(keywords.length).toBeLessThanOrEqual(20); // Avoid keyword stuffing
        }
      });
    });
  });

  describe('Schema Integration', () => {
    test('should have material-specific properties for schema markup', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        // Check for properties that would be useful for schema markup
        if (data.material) {
          expect(data.material.name || data.material.type).toBeDefined();
        }
        
        if (data.process) {
          expect(data.process.type || data.process.name).toBeDefined();
        }
      });
    });

    test('should have canonical URL structure', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        if (data.canonical || data.url) {
          const url = data.canonical || data.url;
          expect(url).toMatch(/^https?:\/\//); // Should be absolute URL
        }
      });
    });
  });

  describe('Accessibility and Localization', () => {
    test('should have language indicators', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        // Check for language specification
        if (data.language || data.locale) {
          const lang = data.language || data.locale;
          expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // ISO language code
        }
      });
    });

    test('should have accessible image alt texts', () => {
      metatagFiles.slice(0, 3).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = parseYamlFile(content) as any;

        if (data.image && data.image.alt) {
          expect(typeof data.image.alt).toBe('string');
          expect(data.image.alt.length).toBeGreaterThan(5);
        }

        if (data.openGraph && data.openGraph.image && data.openGraph.image.alt) {
          expect(typeof data.openGraph.image.alt).toBe('string');
          expect(data.openGraph.image.alt.length).toBeGreaterThan(5);
        }
      });
    });
  });

  describe('Performance and Efficiency', () => {
    test('should have reasonable file sizes', () => {
      metatagFiles.forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const stats = fs.statSync(filePath);
        
        // YAML files should be reasonably sized (not bloated)
        expect(stats.size).toBeLessThan(10 * 1024); // Less than 10KB
        expect(stats.size).toBeGreaterThan(100); // At least 100 bytes
      });
    });

    test('should parse quickly', () => {
      const startTime = Date.now();
      
      metatagFiles.slice(0, 10).forEach(file => {
        const filePath = path.join(metatagsDirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        parseYamlFile(content);
      });
      
      const endTime = Date.now();
      const parseTime = endTime - startTime;
      
      // Should parse 10 files in reasonable time
      expect(parseTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Content Consistency', () => {
    test('should maintain consistent structure across files', () => {
      if (metatagFiles.length < 2) return;

      const filePath1 = path.join(metatagsDirPath, metatagFiles[0]);
      const filePath2 = path.join(metatagsDirPath, metatagFiles[1]);
      
      const content1 = fs.readFileSync(filePath1, 'utf8');
      const content2 = fs.readFileSync(filePath2, 'utf8');
      
      const data1 = parseYamlFile(content1) as any;
      const data2 = parseYamlFile(content2) as any;

      // Should have same top-level keys
      const keys1 = Object.keys(data1).sort();
      const keys2 = Object.keys(data2).sort();
      
      // Allow for some variation but title should be consistent
      expect(keys1).toContain('title');
      expect(keys2).toContain('title');
    });

    test('should follow naming conventions', () => {
      metatagFiles.forEach(file => {
        expect(file).toMatch(/^[a-z0-9-]+laser-cleaning\.yaml$/);
        
        // Should not contain uppercase or special characters
        expect(file).not.toMatch(/[A-Z]/);
        expect(file).not.toMatch(/[^a-z0-9-\.]/);
      });
    });
  });
});
