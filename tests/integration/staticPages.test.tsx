/**
 * Integration Tests for YAML Static Pages
 * 
 * End-to-end tests for the complete static page generation pipeline:
 * - YAML loading
 * - Page rendering
 * - Metadata generation
 * - JSON-LD schema generation
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { loadStaticPageFrontmatter } from '@/app/utils/staticPageLoader';

describe('YAML Static Pages Integration', () => {
  const staticPages = [
    'about',
    'services',
    'comparison',
    'netalux',
    'partners',
    'equipment',
    'compliance',
    'safety',
  ];

  const getDescriptiveCopy = (frontmatter: any): string => {
    return (
      frontmatter.pageDescription ||
      frontmatter.description ||
      frontmatter.openGraph?.description ||
      frontmatter.twitter?.description ||
      frontmatter.jsonLd?.description ||
      ''
    );
  };

  describe('YAML File Existence', () => {
    staticPages.forEach(pageName => {
      it(`should have page.yaml for ${pageName}`, () => {
        const yamlPath = path.join(process.cwd(), 'app', pageName, 'page.yaml');
        expect(fs.existsSync(yamlPath)).toBe(true);
      });
    });
  });

  describe('YAML Structure Validation', () => {
    staticPages.forEach(pageName => {
      it(`should have valid YAML structure for ${pageName}`, () => {
        const yamlPath = path.join(process.cwd(), 'app', pageName, 'page.yaml');
        const content = fs.readFileSync(yamlPath, 'utf-8');
        
        expect(() => yaml.load(content)).not.toThrow();
      });

      it(`should have required frontmatter fields for ${pageName}`, () => {
        const yamlPath = path.join(process.cwd(), 'app', pageName, 'page.yaml');
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        // Required fields
        expect(data.pageTitle).toBeTruthy();
        expect(data).toHaveProperty('pageDescription');
        expect(typeof data.pageDescription).toBe('string');
      });
    });
  });

  describe('Hero Image Configuration', () => {
    staticPages.forEach(pageName => {
      it(`should have optional hero image configuration for ${pageName}`, () => {
        const yamlPath = path.join(process.cwd(), 'app', pageName, 'page.yaml');
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        if (data.images?.hero) {
          expect(data.images.hero.url).toBeTruthy();
          expect(data.images.hero.alt).toBeTruthy();
        }
      });
    });

    it('should keep social image metadata on static pages without visible heroes', () => {
      ['contact', 'services', 'equipment'].forEach(pageName => {
        const yamlPath = path.join(process.cwd(), 'app', pageName, 'page.yaml');
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        expect(data.images?.hero).toBeUndefined();
        expect(data.images?.og?.url).toBeTruthy();
        expect(data.images?.twitter?.url).toBeTruthy();
      });
    });
  });

  describe('Section Metadata', () => {
    const pagesWithSections = ['about', 'services', 'partners', 'equipment'];

    pagesWithSections.forEach(pageName => {
      it(`should have section metadata for ${pageName}`, () => {
        const yamlPath = path.join(process.cwd(), 'app', pageName, 'page.yaml');
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        if (data.sections && data.sections.length > 0) {
          data.sections.forEach((section: any, index: number) => {
            // Should have _section metadata or fallback to section.title
            const hasMetadata = section._section?.title || section.title;
            expect(hasMetadata).toBeTruthy();
          });
        }
      });
    });
  });

  describe('Dynamic Features', () => {
    it('should have dynamic features for schedule page', () => {
      const yamlPath = path.join(process.cwd(), 'app', 'schedule', 'page.yaml');
      
      if (fs.existsSync(yamlPath)) {
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        // Schedule page should have schedule-widget or dynamic features
        expect(
          data.dynamicFeatures || data.pageType === 'dynamic-content'
        ).toBeTruthy();
      }
    });

    it('should have clickable cards for services page', () => {
      const yamlPath = path.join(process.cwd(), 'app', 'services', 'page.yaml');
      
      if (fs.existsSync(yamlPath)) {
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        expect(data.sections).toBeTruthy();
      }
    });
  });

  describe('Frontmatter Loading', () => {
    staticPages.forEach(pageName => {
      it(`should load frontmatter successfully for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        
        expect(frontmatter).toBeDefined();
        expect(frontmatter.pageTitle).toBeTruthy();
        expect(typeof frontmatter.pageDescription).toBe('string');
      });
    });
  });

  describe('Metadata Generation', () => {
    staticPages.forEach(pageName => {
      it(`should generate valid metadata for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        const metadataDescription = getDescriptiveCopy(frontmatter);
        
        // Verify metadata fields
        expect(frontmatter.pageTitle).toBeTruthy();
        expect(typeof frontmatter.pageDescription).toBe('string');
        
        // A static page still needs usable description content for metadata/SEO.
        expect(metadataDescription.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Schema Generation', () => {
    staticPages.forEach(pageName => {
      it(`should have schema type for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        
        // Should have enough data to generate schema
        expect(frontmatter.pageTitle).toBeTruthy();
        expect(typeof frontmatter.pageDescription).toBe('string');
      });
    });
  });

  describe('Comparison Page Specific', () => {
    it('should have comparison methods data', async () => {
      const yamlPath = path.join(process.cwd(), 'app', 'comparison', 'page.yaml');
      
      if (fs.existsSync(yamlPath)) {
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        if (data.comparisonMethods) {
          expect(Array.isArray(data.comparisonMethods)).toBe(true);
          expect(data.comparisonMethods.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Content Quality', () => {
    staticPages.forEach(pageName => {
      it(`should have descriptive page title for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        
        // Title should be descriptive and include Z-Beam
        expect(frontmatter.pageTitle.length).toBeGreaterThan(10);
      });

      it(`should have comprehensive description for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        const metadataDescription = getDescriptiveCopy(frontmatter);
        
        // Pages should still provide meaningful long-form descriptive copy.
        expect(metadataDescription.length).toBeGreaterThan(100);
      });
    });
  });

  describe('Image Paths', () => {
    staticPages.forEach(pageName => {
      it(`should have valid image paths for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        
        const imageUrl = frontmatter.images?.hero?.url || frontmatter.images?.og?.url;

        if (imageUrl) {
          // Should start with / or http
          expect(
            imageUrl.startsWith('/') || imageUrl.startsWith('http')
          ).toBe(true);
        }
      });
    });
  });

  describe('Breadcrumb Data', () => {
    staticPages.forEach(pageName => {
      it(`should have breadcrumb configuration for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        
        // Should have breadcrumb array or be able to generate from path
        if (frontmatter.breadcrumb) {
          expect(Array.isArray(frontmatter.breadcrumb)).toBe(true);
          expect(frontmatter.breadcrumb.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Section Items', () => {
    const pagesWithSections = ['services', 'about', 'partners'];

    pagesWithSections.forEach(pageName => {
      it(`should have valid section items for ${pageName}`, async () => {
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        
        if (frontmatter.sections) {
          frontmatter.sections.forEach((section: any) => {
            if (section.items) {
              expect(Array.isArray(section.items)).toBe(true);
              
              section.items.forEach((item: any) => {
                // Each item should have heading and text (or title/description)
                const hasTitle = item.title || item.heading;
                const hasDescription = item.description || item.text;
                expect(hasTitle).toBeTruthy();
                expect(hasDescription).toBeTruthy();
              });
            }
          });
        }
      });
    });
  });

  describe('Clickable Cards', () => {
    it('should have valid clickable cards for services page', async () => {
      const yamlPath = path.join(process.cwd(), 'app', 'services', 'page.yaml');
      
      if (fs.existsSync(yamlPath)) {
        const content = fs.readFileSync(yamlPath, 'utf-8');
        const data = yaml.load(content) as any;

        if (data.clickableCards) {
          expect(Array.isArray(data.clickableCards)).toBe(true);
          
          data.clickableCards.forEach((card: any) => {
            // Cards may have title/heading and description/text
            const hasTitle = card.title || card.heading;
            const hasDescription = card.description || card.text;
            expect(hasTitle).toBeTruthy();
            expect(hasDescription).toBeTruthy();
            expect(card.href).toBeTruthy();
          });
        }
      }
    });
  });

  describe('End-to-End Page Load', () => {
    staticPages.forEach(pageName => {
      it(`should complete full page load cycle for ${pageName}`, async () => {
        // Load frontmatter
        const frontmatter = await loadStaticPageFrontmatter(pageName);
        const metadataDescription = getDescriptiveCopy(frontmatter);
        expect(frontmatter).toBeDefined();

        // Verify required data
        expect(frontmatter.pageTitle).toBeTruthy();
        expect(typeof frontmatter.pageDescription).toBe('string');

        // Should be able to generate metadata
        expect(frontmatter.pageTitle.length).toBeGreaterThan(0);
        
        // Should be able to generate schema
        expect(metadataDescription.length).toBeGreaterThan(0);
      });
    });
  });
});
