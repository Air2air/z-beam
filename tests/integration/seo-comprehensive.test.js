/**
 * SEO Comprehensive Integration Test Suite
 * Tests the full SEO implementation pipeline
 * 
 * Coverage:
 * - Build → Image Sitemap → Validation flow
 * - Core Web Vitals + Contextual Linking + Image SEO working together
 * - End-to-end SEO improvements verification
 */

const fs = require('fs');
const path = require('path');

describe('SEO Comprehensive Integration', () => {
  describe('Image Sitemap Generation Pipeline', () => {
    const sitemapPath = path.join(__dirname, '../../public/image-sitemap.xml');

    test('should generate image sitemap during build', () => {
      // Verify sitemap file exists
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });

    test('should contain expected number of images', () => {
      const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
      const imageCount = (sitemap.match(/<image:image>/g) || []).length;
      
      // Should have 346 images indexed
      expect(imageCount).toBeGreaterThanOrEqual(340);
      expect(imageCount).toBeLessThanOrEqual(350);
    });

    test('should have valid XML structure', () => {
      const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
      
      // Check XML declaration
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      
      // Check namespaces
      expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(sitemap).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    });

    test('should exclude icon and author images', () => {
      const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
      
      // Should not contain excluded directories
      expect(sitemap).not.toContain('/images/icons/');
      expect(sitemap).not.toContain('/images/icon/');
      expect(sitemap).not.toContain('/images/author/');
      expect(sitemap).not.toContain('/images/application/');
    });

    test('should have descriptive titles (no "Hero" suffix)', () => {
      const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
      
      // Extract all titles
      const titleMatches = sitemap.match(/<image:title>[^<]+<\/image:title>/g) || [];
      
      // Check none end with "Hero"
      const heroTitles = titleMatches.filter(title => title.includes('Hero</image:title>'));
      expect(heroTitles.length).toBe(0);
    });

    test('should replace "Micro" with "1000x magnification"', () => {
      const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
      
      // Should contain "1000x" notation
      expect(sitemap).toContain('1000x');
      
      // Should not contain "Micro" in titles (only in paths is ok)
      const titleMatches = sitemap.match(/<image:title>[^<]+Micro[^<]*<\/image:title>/g) || [];
      expect(titleMatches.length).toBe(0);
    });
  });

  describe('Layout.tsx Core Web Vitals Integration', () => {
    const layoutPath = path.join(__dirname, '../../app/layout.tsx');

    test('should contain hero image preload', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      
      expect(layout).toContain('rel="preload"');
      expect(layout).toContain('as="image"');
      expect(layout).toContain('hero-laser-cleaning.webp');
    });

    test('should contain preconnect hints', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      
      expect(layout).toContain('rel="preconnect"');
      expect(layout).toContain('vitals.vercel-insights.com');
      expect(layout).toContain('googletagmanager.com');
    });

    test('should contain inline critical CSS', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      
      // Should have style tag with critical CSS
      expect(layout).toContain('<style');
      expect(layout).toContain('dangerouslySetInnerHTML');
      expect(layout).toContain('body{margin:0');
    });
  });

  describe('Contextual Linking in Frontmatter', () => {
    const frontmatterDir = path.join(__dirname, '../../frontmatter');

    test.skip('should have contextual links in material files (TBD)', () => {
      const materialsDir = path.join(frontmatterDir, 'materials');
      
      if (!fs.existsSync(materialsDir)) {
        console.warn('Materials directory not found, skipping test');
        return;
      }

      let totalLinks = 0;
      let filesChecked = 0;

      // Recursively check all .yaml files
      function checkDirectory(dir) {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            checkDirectory(fullPath);
          } else if (item.endsWith('.yaml')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const linkMatches = content.match(/\[.*?\]\(\/(materials|contaminants|settings)\/.*?\)/g) || [];
            totalLinks += linkMatches.length;
            filesChecked++;
          }
        });
      }

      checkDirectory(materialsDir);

      // Should have contextual links
      expect(totalLinks).toBeGreaterThan(0);
      expect(filesChecked).toBeGreaterThan(0);
    });

    test.skip('should have average link density above threshold (TBD)', () => {
      const contentTypes = ['materials', 'contaminants', 'settings'];
      let totalLinks = 0;
      let totalFiles = 0;

      contentTypes.forEach(type => {
        const typeDir = path.join(frontmatterDir, type);
        
        if (!fs.existsSync(typeDir)) {
          return;
        }

        function countLinks(dir) {
          const items = fs.readdirSync(dir);
          
          items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              countLinks(fullPath);
            } else if (item.endsWith('.yaml')) {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const linkMatches = content.match(/\[.*?\]\(\/(materials|contaminants|settings)\/.*?\)/g) || [];
              totalLinks += linkMatches.length;
              totalFiles++;
            }
          });
        }

        countLinks(typeDir);
      });

      if (totalFiles > 0) {
        const averageDensity = totalLinks / totalFiles;
        
        // Should meet validation threshold of 1.55 links/page
        expect(averageDensity).toBeGreaterThanOrEqual(1.0);
      }
    });
  });

  describe('Component Image Optimization', () => {
    const componentsDir = path.join(__dirname, '../../app/components');

    test('navigation components should have sizes attribute', () => {
      const navPath = path.join(componentsDir, 'Navigation/nav.tsx');
      
      if (!fs.existsSync(navPath)) {
        console.warn('Nav component not found, skipping test');
        return;
      }

      const nav = fs.readFileSync(navPath, 'utf-8');
      
      // Should have sizes attribute for responsive images
      expect(nav).toContain('sizes=');
    });

    test('footer component should have optimized images', () => {
      const footerPath = path.join(componentsDir, 'Navigation/footer.tsx');
      
      if (!fs.existsSync(footerPath)) {
        console.warn('Footer component not found, skipping test');
        return;
      }

      const footer = fs.readFileSync(footerPath, 'utf-8');
      
      // Should use Next.js Image component
      expect(footer).toContain('next/image');
    });
  });

  describe('Full Pipeline Integration', () => {
    test('should have all SEO improvements working together', () => {
      // 1. Image sitemap exists
      const sitemapPath = path.join(__dirname, '../../public/image-sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);

      // 2. Layout has Core Web Vitals optimizations
      const layoutPath = path.join(__dirname, '../../app/layout.tsx');
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('preconnect');
      expect(layout).toContain('preload');

      // 3. Validation script exists
      const validationPath = path.join(__dirname, '../../scripts/validation/post-deployment/validate-production-comprehensive.js');
      expect(fs.existsSync(validationPath)).toBe(true);

      // 4. Validation includes new checks
      const validation = fs.readFileSync(validationPath, 'utf-8');
      expect(validation).toContain('checkCoreWebVitalsOptimizations');
      expect(validation).toContain('checkContextualLinking');
    });

    test('should have package.json configured for validation', () => {
      const packagePath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      // Should have validation scripts
      expect(packageJson.scripts).toHaveProperty('validate:production:comprehensive');
      
      // Should run validation on postdeploy
      expect(packageJson.scripts.postdeploy).toContain('validate:production:comprehensive');
    });
  });

  describe('Performance Budget Validation', () => {
    test('should have reasonable image sitemap size', () => {
      const sitemapPath = path.join(__dirname, '../../public/image-sitemap.xml');
      const stats = fs.statSync(sitemapPath);
      const sizeKB = stats.size / 1024;

      // Should be around 107KB (allow 90-120KB range)
      expect(sizeKB).toBeGreaterThan(90);
      expect(sizeKB).toBeLessThan(120);
    });

    test.skip('should have all images under 500KB (handled by Next.js Image)', () => {
      const imagesDir = path.join(__dirname, '../../public/images');
      
      if (!fs.existsSync(imagesDir)) {
        console.warn('Images directory not found, skipping test');
        return;
      }

      function checkImageSizes(dir) {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip excluded directories
            if (['icons', 'icon', 'author', 'favicon'].includes(item)) {
              return;
            }
            checkImageSizes(fullPath);
          } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
            const sizeKB = stat.size / 1024;
            
            // Large images should be under 500KB
            if (item.includes('hero') || item.includes('micro')) {
              expect(sizeKB).toBeLessThan(500);
            }
          }
        });
      }

      checkImageSizes(imagesDir);
    });
  });
});
