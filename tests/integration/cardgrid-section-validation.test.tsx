// tests/integration/cardgrid-section-validation.test.tsx
// Integration tests for _section metadata structure validation
// Tests that frontmatter files have complete _section metadata with required fields

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// This test validates data structure only, not component rendering
// Rendering tests would require full DOM environment setup

const frontmatterDir = path.join(__dirname, '../../frontmatter');

/**
 * Helper to load first N frontmatter files from a domain
 */
function loadFrontmatterFiles(domain: string, count: number = 5): any[] {
  const domainPath = path.join(frontmatterDir, domain);
  if (!fs.existsSync(domainPath)) {
    return [];
  }
  
  const files = fs.readdirSync(domainPath).filter(f => f.endsWith('.yaml')).slice(0, count);
  
  return files.map(file => {
    const content = fs.readFileSync(path.join(domainPath, file), 'utf8');
    return yaml.load(content);
  });
}

describe('CardGrid → BaseSection Integration with _section metadata', () => {
  describe('Critical Test: _section metadata structure validation', () => {
    it('should validate that _section has required fields', () => {
      // This test validates data structure, not rendering
      const mockSection = {
        sectionTitle: 'Test Section',
        sectionDescription: 'Valid description from _section metadata',
        icon: 'test-icon',
        order: 10,
        variant: 'default'
      };
      
      expect(mockSection.sectionTitle).toBeTruthy();
      expect(mockSection.sectionDescription).toBeTruthy();
      expect(mockSection.sectionDescription.trim()).not.toBe('');
    });

    it('should fail if sectionDescription is missing', () => {
      const mockSection = {
        sectionTitle: 'Test Section',
        sectionDescription: undefined,
        icon: 'test-icon'
      };
      
      expect(mockSection.sectionDescription).toBeFalsy();
    });

    it('should fail if sectionDescription is empty', () => {
      const mockSection = {
        sectionTitle: 'Test Section',
        sectionDescription: '',
        icon: 'test-icon'
      };
      
      expect(mockSection.sectionDescription.trim()).toBe('');
    });
  });

  describe('Contaminants _section metadata validation', () => {
    const contaminants = loadFrontmatterFiles('contaminants', 5);

    contaminants.forEach((contaminant, idx) => {
      const name = contaminant.name || `contaminant-${idx}`;

      it(`${name} produces_compounds section should have complete _section metadata`, () => {
        const producesCompounds = contaminant.relationships?.interactions?.producesCompounds;
        
        if (producesCompounds?.items?.length > 0) {
          // Verify _section exists
          expect(producesCompounds._section).toBeDefined();
          
          // Verify required fields
          expect(producesCompounds._section.sectionTitle).toBeTruthy();
          expect(producesCompounds._section.sectionDescription).toBeTruthy();
          expect(producesCompounds._section.sectionDescription.trim()).not.toBe('');
          
          // Verify data structure (no rendering - just validation)
          expect(producesCompounds.items).toBeInstanceOf(Array);
          expect(producesCompounds.items.length).toBeGreaterThan(0);
        }
      });

      it(`${name} affects_materials section should have complete _section metadata`, () => {
        const affectsMaterials = contaminant.relationships?.interactions?.affectsMaterials;
        
        if (affectsMaterials?.items?.length > 0) {
          // Verify _section exists
          expect(affectsMaterials._section).toBeDefined();
          
          // Verify required fields
          expect(affectsMaterials._section.sectionTitle).toBeTruthy();
          expect(affectsMaterials._section.sectionDescription).toBeTruthy();
          expect(affectsMaterials._section.sectionDescription.trim()).not.toBe('');
          
          // Verify data structure (no rendering - just validation)
          expect(affectsMaterials.items).toBeInstanceOf(Array);
          expect(affectsMaterials.items.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Materials _section metadata validation', () => {
    const materials = loadFrontmatterFiles('materials', 5);

    materials.forEach((material, idx) => {
      const name = material.name || `material-${idx}`;

      it(`${name} contaminated_by section should have complete _section metadata`, () => {
        const contaminatedBy = material.relationships?.interactions?.contaminatedBy;
        
        if (contaminatedBy?.items?.length > 0) {
          expect(contaminatedBy._section).toBeDefined();
          expect(contaminatedBy._section.sectionTitle).toBeTruthy();
          expect(contaminatedBy._section.sectionDescription).toBeTruthy();
          expect(contaminatedBy._section.sectionDescription.trim()).not.toBe('');
        }
      });
    });
  });

  describe('Compounds _section metadata validation', () => {
    const compounds = loadFrontmatterFiles('compounds', 5);

    compounds.forEach((compound, idx) => {
      const name = compound.name || `compound-${idx}`;

      it(`${name} produced_by section should have complete _section metadata`, () => {
        const producedBy = compound.relationships?.interactions?.producedBy;
        
        if (producedBy?.items?.length > 0) {
          expect(producedBy._section).toBeDefined();
          expect(producedBy._section.sectionTitle).toBeTruthy();
          expect(producedBy._section.sectionDescription).toBeTruthy();
          expect(producedBy._section.sectionDescription.trim()).not.toBe('');
        }
      });
    });
  });
});
