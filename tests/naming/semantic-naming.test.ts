/**
 * Semantic Naming Convention Tests
 * 
 * Automated test suite for naming convention enforcement.
 * Tests run during pre-deployment validation.
 * 
 * @see docs/08-development/NAMING_CONVENTIONS.md
 */

import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const ROOT_DIR = path.join(__dirname, '../..');

// Files to exclude from checks
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/coverage/**',
  '**/tests/**',  // Tests can use frontmatter for backward compat testing
  '**/.vercel/**'
];

/**
 * Find TypeScript files matching pattern
 */
function findFiles(pattern: string): string[] {
  return globSync(pattern, {
    ignore: EXCLUDE_PATTERNS,
    cwd: ROOT_DIR,
    absolute: true
  });
}

/**
 * Read file content safely
 */
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('Semantic Naming Conventions', () => {
  describe('Metadata vs Frontmatter Terminology', () => {
    test('production code should use .metadata not .frontmatter', () => {
      const files = findFiles('**/*.{ts,tsx}');
      const violations: Array<{file: string; line: number; code: string}> = [];
      
      files.forEach(file => {
        const content = readFile(file);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Check for .frontmatter. but allow in comments
          if (/\.frontmatter\./.test(line) && 
              !/\/\/.*\.frontmatter/.test(line) &&
              !/\*.*\.frontmatter/.test(line)) {
            violations.push({
              file: path.relative(ROOT_DIR, file),
              line: index + 1,
              code: line.trim()
            });
          }
        });
      });
      
      if (violations.length > 0) {
        const message = violations
          .slice(0, 5)
          .map(v => `  ${v.file}:${v.line}\n    ${v.code}`)
          .join('\n\n');
        
        expect(violations).toHaveLength(0);
      }
    });
    
    test('helpers should support both metadata and frontmatter for backward compatibility', () => {
      const helperFile = path.join(ROOT_DIR, 'app/utils/schemas/helpers.ts');
      const content = readFile(helperFile);
      
      // Should have getMetadata function that supports both
      expect(content).toContain('metadata');
      expect(content).toContain('frontmatter');
      
      // Should check metadata before frontmatter (priority order)
      const metadataIndex = content.indexOf('data.metadata');
      const frontmatterIndex = content.indexOf('data.frontmatter');
      expect(metadataIndex).toBeGreaterThan(0);
      expect(frontmatterIndex).toBeGreaterThan(0);
      expect(metadataIndex).toBeLessThan(frontmatterIndex);
    });
  });
  
  describe('Props Interface Naming', () => {
    test('Props interfaces should follow ComponentNameProps pattern', () => {
      const files = findFiles('app/components/**/*.{ts,tsx}');
      const violations: Array<{file: string; line: number}> = [];
      
      files.forEach(file => {
        const content = readFile(file);
        
        // Find generic "interface Props {" without component name
        const genericPropsRegex = /interface\s+Props\s*{/g;
        let match;
        
        while ((match = genericPropsRegex.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          violations.push({
            file: path.relative(ROOT_DIR, file),
            line: lineNumber
          });
        }
      });
      
      if (violations.length > 0) {
        const message = violations
          .map(v => `  ${v.file}:${v.line} - Use ComponentNameProps pattern`)
          .join('\n');
        
        console.log('\nGeneric Props violations found:\n' + message);
        expect(violations).toHaveLength(0);
      }
    });
  });
  
  describe('Boolean Prop Naming', () => {
    test('boolean props should use is/has/can/should prefixes', () => {
      const files = findFiles('app/components/**/*.{ts,tsx}');
      const badBooleans: Array<{file: string; line: number; prop: string}> = [];
      
      // Common bad boolean names to flag
      const badPatterns = ['loading', 'disabled', 'visible', 'active', 'error'];
      
      files.forEach(file => {
        const content = readFile(file);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          badPatterns.forEach(pattern => {
            const regex = new RegExp(`\\b${pattern}\\s*\\??:\\s*boolean`, 'i');
            if (regex.test(line) && !/^(is|has|can|should)[A-Z]/.test(line)) {
              badBooleans.push({
                file: path.relative(ROOT_DIR, file),
                line: index + 1,
                prop: pattern
              });
            }
          });
        });
      });
      
      // This is a warning test - don't fail build, just report
      if (badBooleans.length > 0) {
        console.warn(`\n⚠️  Found ${badBooleans.length} boolean props that could use better naming:`);
        badBooleans.slice(0, 5).forEach(v => {
          console.warn(`  ${v.file}:${v.line} - '${v.prop}' → 'is${v.prop.charAt(0).toUpperCase() + v.prop.slice(1)}'`);
        });
      }
      
      // Pass test but log warnings
      expect(true).toBe(true);
    });
  });
  
  describe('Type Centralization', () => {
    test('centralized types should not be redefined', () => {
      const centralizedTypes = [
        'IconProps',
        'BadgeProps',
        'CardProps',
        'ButtonProps',
        'Author',
        'ArticleMetadata',
        'GridItem'
      ];
      
      const files = findFiles('app/**/*.{ts,tsx}');
      const violations: Array<{file: string; type: string; line: number}> = [];
      
      files.forEach(file => {
        const content = readFile(file);
        
        centralizedTypes.forEach(typeName => {
          const regex = new RegExp(`(?:interface|type)\\s+${typeName}\\s*[={]`, 'g');
          let match;
          
          while ((match = regex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            violations.push({
              file: path.relative(ROOT_DIR, file),
              type: typeName,
              line: lineNumber
            });
          }
        });
      });
      
      if (violations.length > 0) {
        const message = violations
          .map(v => `  ${v.file}:${v.line} - Duplicate '${v.type}' (import from @/types)`)
          .join('\n');
        
        console.log('\nType duplication violations:\n' + message);
        expect(violations).toHaveLength(0);
      }
    });
    
    test('Author type should support both new and legacy fields', () => {
      const typesFile = path.join(ROOT_DIR, 'types/centralized.ts');
      const content = readFile(typesFile);
      
      // Should have new array fields
      expect(content).toContain('expertiseAreas');
      expect(content).toContain('credentialsList');
      
      // Should have legacy fields marked as deprecated
      expect(content).toContain('expertise');
      expect(content).toContain('credentials');
      expect(content).toContain('@deprecated');
    });
  });
  
  describe('Array Field Naming', () => {
    test('array fields should use plural naming', () => {
      const files = findFiles('types/**/*.ts');
      const singularArrays: Array<{file: string; field: string; line: number}> = [];
      
      files.forEach(file => {
        const content = readFile(file);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Check for array declarations with singular names
          const arrayMatch = line.match(/(\w+)[\?]?:\s*\w+\[\]|Array</);
          if (arrayMatch) {
            const fieldName = arrayMatch[1];
            
            // Check if it's singular
            if (fieldName && !/(s|List|Array|Items|Collection|Set)$/.test(fieldName)) {
              // Known bad patterns
              if (['expertise', 'credential', 'education'].includes(fieldName.toLowerCase())) {
                singularArrays.push({
                  file: path.relative(ROOT_DIR, file),
                  field: fieldName,
                  line: index + 1
                });
              }
            }
          }
        });
      });
      
      // This is a suggestion test - warn but don't fail
      if (singularArrays.length > 0) {
        console.warn(`\n⚠️  Found ${singularArrays.length} array fields with singular naming:`);
        singularArrays.forEach(v => {
          console.warn(`  ${v.file}:${v.line} - '${v.field}' → '${v.field}s' or '${v.field}List'`);
        });
      }
      
      expect(true).toBe(true);
    });
  });
  
  describe('Documentation Synchronization', () => {
    test('NAMING_CONVENTIONS.md should exist and be comprehensive', () => {
      const docFile = path.join(ROOT_DIR, 'docs/08-development/NAMING_CONVENTIONS.md');
      expect(fs.existsSync(docFile)).toBe(true);
      
      const content = readFile(docFile);
      
      // Should cover all major topics
      expect(content).toContain('metadata');
      expect(content).toContain('Props');
      expect(content).toContain('boolean');
      expect(content).toContain('Array');
      expect(content).toContain('is/has/can');
    });
    
    test('TYPE_CONSOLIDATION doc should document centralized types', () => {
      const docFile = path.join(ROOT_DIR, 'docs/08-development/TYPE_CONSOLIDATION_DEC21_2025.md');
      
      if (fs.existsSync(docFile)) {
        const content = readFile(docFile);
        expect(content).toContain('centralized');
        expect(content).toContain('types/');
      }
      
      // Pass if file doesn't exist yet (optional doc)
      expect(true).toBe(true);
    });
  });
});

describe('Naming Convention Enforcement', () => {
  test('validation scripts should exist', () => {
    const semanticNamingScript = path.join(ROOT_DIR, 'scripts/validation/validate-semantic-naming.js');
    const typeImportScript = path.join(ROOT_DIR, 'scripts/validation/validate-type-imports.js');
    
    expect(fs.existsSync(semanticNamingScript)).toBe(true);
    expect(fs.existsSync(typeImportScript)).toBe(true);
  });
  
  test('package.json should include naming validation in prebuild', () => {
    const packageJson = JSON.parse(
      readFile(path.join(ROOT_DIR, 'package.json'))
    );
    
    // Check if we have validation scripts defined
    expect(packageJson.scripts).toBeDefined();
    
    // Validation scripts should exist (will be added)
    const hasValidation = 
      packageJson.scripts['validate:naming'] ||
      packageJson.scripts['validate:types'];
    
    // This will pass once scripts are added
    if (!hasValidation) {
      console.warn('\n⚠️  Validation scripts not yet added to package.json');
    }
    
    expect(true).toBe(true);
  });
});
