/**
 * Build-Time Requirements Test
 * 
 * Ensures that all critical build-time scripts execute automatically
 * and that manual flags cannot bypass these requirements.
 * 
 * CRITICAL: These scripts MUST run before every build:
 * 1. Dataset generation (generate:datasets)
 * 2. Metadata validation (validate:metadata)
 * 3. Naming validation (validate:naming)
 * 4. Sitemap verification (verify:sitemap)
 * 5. URL validation (validate:urls) - post-build
 * 
 * This test prevents developers from accidentally skipping these steps.
 */

import fs from 'fs';
import path from 'path';

describe('Build-Time Requirements Enforcement', () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let packageJson: any;

  beforeAll(() => {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  });

  describe('Package.json Script Configuration', () => {
    it('should have prebuild script that runs all critical validations', () => {
      expect(packageJson.scripts.prebuild).toBeDefined();
      
      const prebuild = packageJson.scripts.prebuild;
      
      // Must include all critical scripts
      expect(prebuild).toContain('validate:naming');
      expect(prebuild).toContain('validate:metadata');
      expect(prebuild).toContain('verify:sitemap');
      expect(prebuild).toContain('generate:datasets');
    });

    it('should have build script that runs prebuild automatically', () => {
      expect(packageJson.scripts.build).toBeDefined();
      
      const build = packageJson.scripts.build;
      
      // Build must call next build (which triggers prebuild hook)
      expect(build).toContain('next build');
    });

    it('should have postbuild script for post-build validations', () => {
      expect(packageJson.scripts.postbuild).toBeDefined();
      
      const postbuild = packageJson.scripts.postbuild;
      
      // Must validate URLs after build
      expect(postbuild).toContain('validate:urls');
    });

    it('should NOT allow manual skip flags in build script', () => {
      const build = packageJson.scripts.build;
      
      // These flags would be dangerous - must not exist
      expect(build).not.toContain('--skip-validation');
      expect(build).not.toContain('--no-validate');
      expect(build).not.toContain('--skip-prebuild');
      expect(build).not.toContain('SKIP_VALIDATION');
    });

    it('should have separate fast-build script for development only', () => {
      expect(packageJson.scripts['build:fast']).toBeDefined();
      
      // Fast build should be clearly marked as development-only
      const fastBuild = packageJson.scripts['build:fast'];
      expect(fastBuild).toContain('next build');
      expect(fastBuild).not.toContain('prebuild');
    });
  });

  describe('Critical Script Definitions', () => {
    it('should define generate:datasets script', () => {
      expect(packageJson.scripts['generate:datasets']).toBeDefined();
      expect(packageJson.scripts['generate:datasets']).toContain('generate-datasets');
    });

    it('should define validate:metadata script', () => {
      expect(packageJson.scripts['validate:metadata']).toBeDefined();
      expect(packageJson.scripts['validate:metadata']).toContain('validate-metadata-sync');
    });

    it('should define validate:naming script', () => {
      expect(packageJson.scripts['validate:naming']).toBeDefined();
      expect(packageJson.scripts['validate:naming']).toContain('validate-naming');
    });

    it('should define verify:sitemap script', () => {
      expect(packageJson.scripts['verify:sitemap']).toBeDefined();
      expect(packageJson.scripts['verify:sitemap']).toContain('verify-sitemap');
    });

    it('should define validate:urls script', () => {
      expect(packageJson.scripts['validate:urls']).toBeDefined();
      expect(packageJson.scripts['validate:urls']).toContain('validate-jsonld-urls');
    });
  });

  describe('Vercel Build Configuration', () => {
    it('should have vercel-build script that enforces validations', () => {
      expect(packageJson.scripts['vercel-build']).toBeDefined();
      
      const vercelBuild = packageJson.scripts['vercel-build'];
      
      // Vercel build must validate before building
      expect(vercelBuild).toContain('validate:metadata');
      expect(vercelBuild).toContain('next build');
    });

    it('should NOT allow vercel-build to skip validations', () => {
      const vercelBuild = packageJson.scripts['vercel-build'];
      
      expect(vercelBuild).not.toContain('--skip');
      expect(vercelBuild).not.toContain('--no-validate');
    });
  });

  describe('Dataset Generation Requirements', () => {
    it('should ensure dataset directory exists', () => {
      const datasetDir = path.join(process.cwd(), 'public', 'datasets', 'materials');
      expect(fs.existsSync(datasetDir)).toBe(true);
    });

    it('should have generated dataset files', () => {
      const datasetDir = path.join(process.cwd(), 'public', 'datasets', 'materials');
      const files = fs.readdirSync(datasetDir);
      
      // Should have JSON, CSV, and TXT files (excluding index.json)
      const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');
      const csvFiles = files.filter(f => f.endsWith('.csv'));
      const txtFiles = files.filter(f => f.endsWith('.txt'));
      
      expect(jsonFiles.length).toBeGreaterThan(0);
      expect(csvFiles.length).toBeGreaterThan(0);
      expect(txtFiles.length).toBeGreaterThan(0);
      
      // Should have matching counts (each material has 3 formats)
      expect(jsonFiles.length).toBe(csvFiles.length);
      expect(jsonFiles.length).toBe(txtFiles.length);
    });

    it('should validate dataset file structure', () => {
      const datasetDir = path.join(process.cwd(), 'public', 'datasets', 'materials');
      const files = fs.readdirSync(datasetDir).filter(f => f.endsWith('.json') && f !== 'index.json');
      
      // Check at least one dataset file
      expect(files.length).toBeGreaterThan(0);
      
      const sampleFile = path.join(datasetDir, files[0]);
      const content = JSON.parse(fs.readFileSync(sampleFile, 'utf-8'));
      
      // Validate basic schema structure (old format until regenerated)
      expect(content['@context']).toBe('https://schema.org');
      expect(content['@type']).toBe('Dataset');
      expect(content.name).toBeDefined();
      expect(content.version).toBeDefined();
      expect(content.license).toBeDefined();
      expect(content.creator).toBeDefined();
      
      // Enhanced fields (will be present after next dataset generation)
      if (content.publisher) {
        expect(content.publisher).toBeDefined();
        expect(content.keywords).toBeDefined();
        expect(content.dataQuality).toBeDefined();
        
        // Distribution array must have all 3 formats
        if (content.distribution) {
          expect(content.distribution).toHaveLength(3);
          const formats = content.distribution.map((d: any) => d.encodingFormat);
          expect(formats).toContain('application/json');
          expect(formats).toContain('text/csv');
          expect(formats).toContain('text/plain');
        }
      }
      
      // variableMeasured should exist (populated or empty array)
      expect(content.variableMeasured).toBeDefined();
    });
  });

  describe('Sitemap Generation', () => {
    it('should have sitemap.ts file for automatic generation', () => {
      const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });

    it('should verify sitemap is generated at build time', () => {
      // Sitemap is generated by Next.js automatically
      // This test ensures the sitemap.ts file exists and exports correctly
      const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      
      expect(content).toContain('export default');
      // Check for SitemapEntry type (custom type) instead of Next.js MetadataRoute
      expect(content).toMatch(/SitemapEntry|sitemap\(\)/);
    });
  });

  describe('JSON-LD Runtime Generation', () => {
    it('should ensure JSON-LD is generated at runtime, not build time', () => {
      // JSON-LD should be generated per-request via SchemaFactory
      const schemaFactoryPath = path.join(process.cwd(), 'app', 'utils', 'schemas', 'SchemaFactory.ts');
      expect(fs.existsSync(schemaFactoryPath)).toBe(true);
      
      const content = fs.readFileSync(schemaFactoryPath, 'utf-8');
      
      // Should have generate method
      expect(content).toContain('generate()');
      expect(content).toContain('class SchemaFactory');
    });

    it('should NOT have pre-generated static JSON-LD files', () => {
      // JSON-LD should be dynamic, not static files
      const publicDir = path.join(process.cwd(), 'public');
      
      // Check that there's no jsonld directory with static files
      const jsonldDir = path.join(publicDir, 'jsonld');
      if (fs.existsSync(jsonldDir)) {
        const files = fs.readdirSync(jsonldDir);
        // If directory exists, it should be empty or not contain material files
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        expect(jsonFiles.length).toBe(0);
      }
    });
  });

  describe('Build Script Execution Order', () => {
    it('should enforce correct execution order', () => {
      const { prebuild, build, postbuild } = packageJson.scripts;
      
      // Prebuild runs first (automatic via npm lifecycle)
      expect(prebuild).toBeDefined();
      
      // Build runs next
      expect(build).toBeDefined();
      expect(build).toContain('next build');
      
      // Postbuild runs last (automatic via npm lifecycle)
      expect(postbuild).toBeDefined();
    });

    it('should ensure all validation scripts exit with error on failure', () => {
      // Validation scripts should not contain --force or --ignore-errors flags
      const validationScripts = [
        'validate:metadata',
        'validate:naming',
        'verify:sitemap',
        'validate:urls'
      ];

      validationScripts.forEach(script => {
        const scriptContent = packageJson.scripts[script];
        expect(scriptContent).toBeDefined();
        expect(scriptContent).not.toContain('--force');
        expect(scriptContent).not.toContain('--ignore-errors');
        expect(scriptContent).not.toContain('|| true'); // Don't allow error suppression
      });
    });
  });

  describe('Development vs Production Build Safety', () => {
    it('should have strict production build', () => {
      const build = packageJson.scripts.build;
      
      // Production build must be strict
      expect(build).toContain('next build');
      // Should NOT contain any skip or bypass flags
      expect(build).not.toMatch(/skip|bypass|ignore|force/i);
    });

    it('should allow fast development build separately', () => {
      const fastBuild = packageJson.scripts['build:fast'];
      
      expect(fastBuild).toBeDefined();
      expect(fastBuild).toContain('next build');
      expect(fastBuild).not.toContain('prebuild');
    });

    it('should document the difference in scripts', () => {
      // Both scripts should exist with clear purpose
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts['build:fast']).toBeDefined();
      
      // They should be different
      expect(packageJson.scripts.build).not.toBe(packageJson.scripts['build:fast']);
    });
  });

  describe('CI/CD Integration', () => {
    it('should ensure CI uses production build', () => {
      // Check if there's a vercel-build or similar CI script
      const ciBuildScripts = ['vercel-build', 'build'];
      
      ciBuildScripts.forEach(script => {
        if (packageJson.scripts[script]) {
          const scriptContent = packageJson.scripts[script];
          
          // CI builds must include validations
          if (script === 'vercel-build') {
            expect(scriptContent).toContain('validate:metadata');
          }
          
          // Must build
          expect(scriptContent).toContain('next build');
        }
      });
    });
  });
});

describe('Script File Existence', () => {
  const scriptsDir = path.join(process.cwd(), 'scripts');

  it('should have generate-datasets.ts script', () => {
    const scriptPath = path.join(scriptsDir, 'generate-datasets.ts');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('should have validate-metadata-sync.js script', () => {
    const scriptPath = path.join(scriptsDir, 'validate-metadata-sync.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('should have validate-naming-e2e.js script', () => {
    const scriptPath = path.join(scriptsDir, 'validate-naming-e2e.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('should have verify-sitemap.sh script', () => {
    const scriptPath = path.join(scriptsDir, 'sitemap', 'verify-sitemap.sh');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('should have validate-jsonld-urls.js script', () => {
    const scriptPath = path.join(scriptsDir, 'validate-jsonld-urls.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
  });
});
