/**
 * JSON-LD Enforcement Tests
 * 
 * Ensures all JSON-LD structured data is dynamically generated from frontmatter,
 * preventing hardcoded JSON-LD in page components.
 * 
 * Architecture Rule: JSON-LD must ALWAYS be generated dynamically by:
 * 1. StaticPage component (for static pages)
 * 2. Article layout components (for blog posts)
 * 3. Schema utilities (for specialized content)
 * 
 * NEVER hardcode JSON-LD directly in page.tsx files.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('JSON-LD Architecture Enforcement', () => {
  // Get all page.tsx files in app directory
  const appDir = join(process.cwd(), 'app');
  
  /**
   * Recursively find all page.tsx files
   */
  function findPageFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip node_modules, .next, and other build directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        files.push(...findPageFiles(fullPath));
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  const pageFiles = findPageFiles(appDir);

  describe('No Hardcoded JSON-LD in Page Components', () => {
    pageFiles.forEach(filePath => {
      const relativePath = filePath.replace(process.cwd(), '');
      
      it(`${relativePath} should not contain hardcoded JSON-LD`, () => {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for hardcoded JSON-LD patterns
        const violations: string[] = [];
        
        // Pattern 1: <script type="application/ld+json">
        if (content.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/)) {
          violations.push('Contains hardcoded <script type="application/ld+json"> tag');
        }
        
        // Pattern 2: Direct JSON-LD assignment with dangerouslySetInnerHTML
        if (content.includes('dangerouslySetInnerHTML') && content.includes('JSON.stringify')) {
          violations.push('Contains dangerouslySetInnerHTML with JSON.stringify (likely JSON-LD)');
        }
        
        // Pattern 3: Import of *-jsonld.ts utility files (legacy pattern)
        if (content.match(/import.*from.*['"](\.\.\/)?.*jsonld['"]/)) {
          violations.push('Imports from *-jsonld.ts utility file (legacy pattern)');
        }
        
        // Pattern 4: createJsonLd or similar function calls
        if (content.match(/create\w*JsonLd\s*\(/)) {
          violations.push('Calls create*JsonLd() function (should use StaticPage dynamic generation)');
        }
        
        // Allow exceptions for specific files that SHOULD have JSON-LD
        const allowedFiles = [
          '/app/layout.tsx',           // Root layout with organization schema
          '/app/components/JsonLD/',   // JSON-LD component itself
          '/app/utils/schemas/',       // Schema utility functions
        ];
        
        const isAllowed = allowedFiles.some(allowed => relativePath.includes(allowed));
        
        if (!isAllowed && violations.length > 0) {
          const errorMessage = 
            `${relativePath} violates JSON-LD architecture:\n` +
            violations.map(v => `  - ${v}`).join('\n') +
            '\n\nJSON-LD must be generated dynamically by StaticPage or schema utilities.\n' +
            'See docs/architecture/JSON_LD_ARCHITECTURE.md for correct patterns.';
          
          expect(violations.length).toBe(0); // This will fail with a clear message
          throw new Error(errorMessage); // Fallback in case expect doesn't throw
        }
      });
    });
  });

  describe('Layout Component Structure', () => {
    it('Layout should render content cards for pages', () => {
      const layoutPath = join(appDir, 'components/Layout/Layout.tsx');
      const content = readFileSync(layoutPath, 'utf-8');
      
      // Check that Layout accepts and renders content
      expect(content).toContain('children');
      expect(content).toContain('title');
      expect(content).toContain('description');
    });
  });

  describe('Page Component Patterns', () => {
    const staticPages = [
      'app/partners/page.tsx',
      'app/services/page.tsx',
      'app/rental/page.tsx',
      'app/netalux/page.tsx'
    ];

    staticPages.forEach(pagePath => {
      it(`${pagePath} should use Layout component`, () => {
        const fullPath = join(process.cwd(), pagePath);
        const content = readFileSync(fullPath, 'utf-8');
        
        expect(content).toContain('Layout');
        expect(content).toContain('slug=');
      });

      it(`${pagePath} should load YAML configuration`, () => {
        const fullPath = join(process.cwd(), pagePath);
        const content = readFileSync(fullPath, 'utf-8');
        
        // Should load configuration from YAML
        expect(content).toContain('yaml');
        expect(content).toContain('pageConfig');
      });
    });
  });
});
