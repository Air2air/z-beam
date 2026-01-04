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

    it('should have machine_settings property (not machineSettings)', () => {
      const invalidFiles: string[] = [];
      
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.machineSettings && !data.machine_settings) {
          invalidFiles.push(path.basename(file));
        }
      }
      
      expect(invalidFiles).toEqual([]);
    });

    it('should have valid machine_settings structure', () => {
      const requiredParams = [
        'powerRange',
        'wavelength',
        'spotSize',
        'repetitionRate',
        'energyDensity',
        'pulseWidth',
        'scanSpeed',
        'passCount',
      ];

      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.machine_settings) {
          for (const param of requiredParams) {
            if (data.machine_settings[param]) {
              expect(data.machine_settings[param]).toHaveProperty('description');
              expect(data.machine_settings[param]).toHaveProperty('unit');
              expect(data.machine_settings[param]).toHaveProperty('value');
            }
          }
        }
      }
    });

    it('should have valid author structure', () => {
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        expect(data.author).toBeDefined();
        expect(data.author).toHaveProperty('id');
        expect(data.author).toHaveProperty('name');
        expect(data.author).toHaveProperty('country');
        expect(data.author).toHaveProperty('email');
      }
    });

    it('should have valid breadcrumb structure', () => {
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        expect(Array.isArray(data.breadcrumbs)).toBe(true);
        expect(data.breadcrumbs.length).toBeGreaterThan(0);
        
        for (const crumb of data.breadcrumbs) {
          expect(crumb).toHaveProperty('label');
          expect(crumb).toHaveProperty('href');
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
        expect(data).toHaveProperty('content_type');
        // Accept both 'unified_material' and 'materials'
        expect(['unified_material', 'materials']).toContain(data.content_type);
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
        expect(data).toHaveProperty('content_type');
        // Accept both 'unified_contamination' and 'contaminants'
        expect(['unified_contamination', 'contaminants']).toContain(data.content_type);
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

    it('should have valid schema_version', () => {
      const allFiles = FRONTMATTER_DIRS.flatMap(dir => collectYamlFiles(dir));
      
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        if (data.schema_version) {
          expect(data.schema_version).toMatch(/^\d+\.\d+\.\d+$/);
        }
      }
    });
  });

  describe('Type Safety', () => {
    it('should not have unexpected camelCase where snake_case is expected', () => {
      const settingsFiles = collectYamlFiles(path.join(process.cwd(), 'frontmatter/settings'));
      const violations: string[] = [];
      
      for (const file of settingsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const data = yaml.load(content) as any;
        
        // Check for common camelCase violations
        const camelCaseFields = ['machineSettings', 'contentType', 'schemaVersion'];
        for (const field of camelCaseFields) {
          if (data[field] !== undefined) {
            violations.push(`${path.basename(file)}: has ${field} (should be snake_case)`);
          }
        }
      }
      
      expect(violations).toEqual([]);
    });
  });
});
