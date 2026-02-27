/**
 * YAML to TypeScript Integration Tests
 * Validates that YAML frontmatter files parse correctly into TypeScript types
 * and that schema constraints are enforced end-to-end
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

describe('YAML → TypeScript Integration', () => {
  const FRONTMATTER_DIRS = [
    path.join(process.cwd(), 'frontmatter/settings'),
    path.join(process.cwd(), 'frontmatter/materials'),
    path.join(process.cwd(), 'frontmatter/contaminants'),
  ];

  function collectYamlFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectYamlFiles(fullPath));
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  describe('Settings Files', () => {
    const settingsDir = path.join(process.cwd(), 'frontmatter/settings');
    const settingsFiles = collectYamlFiles(settingsDir);

    it('should find at least 100 settings files', () => {
      expect(settingsFiles.length).toBeGreaterThan(100);
    });

    it('should parse all settings files without errors', () => {
      for (const file of settingsFiles) {
        expect(() => {
          const content = fs.readFileSync(file, 'utf8');
          yaml.load(content);
        }).not.toThrow();
      }
    });

    it('should have machineSettings property (camelCase standard)', () => {
      const invalidFiles: string[] = [];
      
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        // Expect camelCase (JavaScript/TypeScript standard)
        if (data.machine_settings && !data.machineSettings) {
          invalidFiles.push(path.basename(file));
        }
      }
      
      expect(invalidFiles).toEqual([]);
    });

    it('should have valid machineSettings structure', () => {
      const requiredParams = [
        'laserPower',
        'wavelength',
        'spotSize',
        'frequency',
        'energyDensity',
        'pulseWidth',
        'scanSpeed',
        'passCount',
      ];

      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        // Check camelCase property
        if (data.machineSettings) {
          for (const param of requiredParams) {
            if (data.machineSettings[param]) {
              expect(data.machineSettings[param]).toHaveProperty('unit');
              expect(data.machineSettings[param]).toHaveProperty('value');
            }
          }
        }
      }
    });

    it('should have valid author structure', () => {
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        // Settings files may have either authorId (source) or author.id (exported)
        const hasAuthorId = 'authorId' in data;
        const hasAuthor = 'author' in data && typeof data.author === 'object';
        expect(hasAuthorId || hasAuthor).toBe(true);
        
        if (hasAuthorId) {
          expect(typeof data.authorId).toBe('number');
        } else if (hasAuthor) {
          expect(data.author.id).toBeDefined();
          expect(typeof data.author.id).toBe('number');
        }
      }
    });

    it('should have valid breadcrumb structure', () => {
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.breadcrumbs) {
          expect(Array.isArray(data.breadcrumbs)).toBe(true);
          expect(data.breadcrumbs.length).toBeGreaterThan(0);
          
          for (const crumb of data.breadcrumbs) {
            expect(crumb).toHaveProperty('label');
            expect(crumb).toHaveProperty('href');
          }
        }
      }
    });
  });

  describe('Materials Files', () => {
    const materialsDir = path.join(process.cwd(), 'frontmatter/materials');
    const materialsFiles = collectYamlFiles(materialsDir);

    it('should find materials files', () => {
      expect(materialsFiles.length).toBeGreaterThan(0);
    });

    it('should parse all materials files without errors', () => {
      for (const file of materialsFiles) {
        expect(() => {
          const content = fs.readFileSync(file, 'utf8');
          yaml.load(content);
        }).not.toThrow();
      }
    });

    it('should have required material properties', () => {
      for (const file of materialsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        // Files now have camelCase contentType (industry standard)
        expect(data).toHaveProperty('contentType');
      }
    });
  });

  describe('Contaminants Files', () => {
    const contaminantsDir = path.join(process.cwd(), 'frontmatter/contaminants');
    const contaminantsFiles = collectYamlFiles(contaminantsDir);

    it('should find contaminants files', () => {
      expect(contaminantsFiles.length).toBeGreaterThan(0);
    });

    it('should parse all contaminants files without errors', () => {
      for (const file of contaminantsFiles) {
        expect(() => {
          const content = fs.readFileSync(file, 'utf8');
          yaml.load(content);
        }).not.toThrow();
      }
    });

    it('should have required contaminant properties', () => {
      for (const file of contaminantsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        // Files now have camelCase contentType (industry standard)
        expect(data).toHaveProperty('contentType');
      }
    });
  });

  describe('Schema Compliance', () => {
    it('should have valid datePublished ISO 8601 format', () => {
      const allFiles = FRONTMATTER_DIRS.flatMap(dir => collectYamlFiles(dir));
      
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.datePublished) {
          expect(() => new Date(data.datePublished)).not.toThrow();
          expect(new Date(data.datePublished).toISOString()).toBeTruthy();
        }
      }
    });

    it('should have valid dateModified ISO 8601 format', () => {
      const allFiles = FRONTMATTER_DIRS.flatMap(dir => collectYamlFiles(dir));
      
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.dateModified) {
          expect(() => new Date(data.dateModified)).not.toThrow();
          expect(new Date(data.dateModified).toISOString()).toBeTruthy();
        }
      }
    });

    it('should have lowercase slug IDs', () => {
      const allFiles = FRONTMATTER_DIRS.flatMap(dir => collectYamlFiles(dir));
      
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.id) {
          expect(data.id).toMatch(/^[a-z0-9-]+$/);
          expect(data.id).toBe(data.id.toLowerCase());
        }
      }
    });

    it('should have valid schemaVersion', () => {
      const allFiles = FRONTMATTER_DIRS.flatMap(dir => collectYamlFiles(dir));
      
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.schemaVersion) {
          expect(data.schemaVersion).toMatch(/^\d+\.\d+\.\d+$/);
        }
      }
    });
  });

  describe('Type Safety', () => {
    it('should use camelCase for software fields (industry standard)', () => {
      const settingsFiles = collectYamlFiles(path.join(process.cwd(), 'frontmatter/settings'));
      const violations: string[] = [];
      
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        // Verify camelCase fields exist (industry standard per JSON, TypeScript, Next.js)
        if (data.content_type !== undefined) {
          violations.push(`${path.basename(file)}: has content_type (should be camelCase: contentType)`);
        }
        if (data.schema_version !== undefined) {
          violations.push(`${path.basename(file)}: has schema_version (should be camelCase: schemaVersion)`);
        }
      }
      
      expect(violations).toEqual([]);
    });
  });
});
