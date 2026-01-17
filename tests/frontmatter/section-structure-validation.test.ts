/**
 * @jest-environment node
 * 
 * Tests for Mandatory Section Structure Requirements
 * 
 * MANDATORY REQUIREMENT:
 * Every section in frontmatter MUST contain:
 * - sectionTitle (string)
 * - sectionDescription (string)
 * 
 * NOTE: sectionMetadata is DEPRECATED as of Jan 2026 and is no longer required.
 * 
 * Test Coverage:
 * 1. Validate all material frontmatter sections have required fields
 * 2. Validate all contaminant frontmatter sections have required fields
 * 3. Validate all compound frontmatter sections have required fields
 * 4. Ensure sectionTitle is non-empty string
 * 5. Ensure sectionDescription is non-empty string
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface SectionStructure {
  sectionTitle?: string;
  sectionDescription?: string;
  /** @deprecated sectionMetadata is no longer required as of Jan 2026 */
  sectionMetadata?: Record<string, unknown>;
}

interface ValidationResult {
  filePath: string;
  sectionPath: string;
  missingFields: string[];
  emptyFields: string[];
}

/**
 * Recursively find all _section objects in frontmatter
 */
function findSections(
  obj: any,
  currentPath: string = '',
  sections: Array<{ path: string; section: SectionStructure }> = []
): Array<{ path: string; section: SectionStructure }> {
  if (!obj || typeof obj !== 'object') return sections;

  if (obj._section && typeof obj._section === 'object') {
    sections.push({
      path: currentPath,
      section: obj._section as SectionStructure
    });
  }

  for (const [key, value] of Object.entries(obj)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    findSections(value, newPath, sections);
  }

  return sections;
}

/**
 * Validate a single section structure
 */
function validateSection(section: SectionStructure): {
  missingFields: string[];
  emptyFields: string[];
} {
  const missingFields: string[] = [];
  const emptyFields: string[] = [];

  // Check for required fields (sectionMetadata deprecated as of Jan 2026)
  if (!('sectionTitle' in section)) {
    missingFields.push('sectionTitle');
  } else if (typeof section.sectionTitle === 'string' && section.sectionTitle.trim() === '') {
    emptyFields.push('sectionTitle');
  }

  if (!('sectionDescription' in section)) {
    missingFields.push('sectionDescription');
  } else if (typeof section.sectionDescription === 'string' && section.sectionDescription.trim() === '') {
    emptyFields.push('sectionDescription');
  }

  return { missingFields, emptyFields };
}

/**
 * Load and validate all frontmatter files in a directory
 */
function validateFrontmatterDirectory(dirPath: string): ValidationResult[] {
  const violations: ValidationResult[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return violations;
  }

  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.yaml'));

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = yaml.load(content) as Record<string, unknown>;

    const sections = findSections(frontmatter);

    for (const { path: sectionPath, section } of sections) {
      const { missingFields, emptyFields } = validateSection(section);

      if (missingFields.length > 0 || emptyFields.length > 0) {
        violations.push({
          filePath: file,
          sectionPath,
          missingFields,
          emptyFields
        });
      }
    }
  }

  return violations;
}

describe('Mandatory Section Structure Validation', () => {
  describe('Material Frontmatter Sections', () => {
    it('should have sectionTitle and sectionDescription in all sections', () => {
      const materialsDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const violations = validateFrontmatterDirectory(materialsDir);

      if (violations.length > 0) {
        const errorMessage = violations.map(v => 
          `File: ${v.filePath}\n` +
          `Section: ${v.sectionPath}\n` +
          `Missing fields: ${v.missingFields.join(', ')}\n` +
          `Empty fields: ${v.emptyFields.join(', ')}\n`
        ).join('\n---\n');

        throw new Error(
          `Found ${violations.length} section(s) with missing or empty required fields:\n\n${errorMessage}`
        );
      }

      expect(violations).toEqual([]);
    });

    it('should have non-empty sectionTitle in all sections', () => {
      const materialsDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const files = fs.readdirSync(materialsDir).filter(f => f.endsWith('.yaml'));

      for (const file of files) {
        const filePath = path.join(materialsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const frontmatter = yaml.load(content) as Record<string, unknown>;
        const sections = findSections(frontmatter);

        for (const { path: sectionPath, section } of sections) {
          expect(section.sectionTitle).toBeDefined();
          expect(typeof section.sectionTitle).toBe('string');
          expect(section.sectionTitle!.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it('should have non-empty sectionDescription in all sections', () => {
      const materialsDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const files = fs.readdirSync(materialsDir).filter(f => f.endsWith('.yaml'));

      for (const file of files) {
        const filePath = path.join(materialsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const frontmatter = yaml.load(content) as Record<string, unknown>;
        const sections = findSections(frontmatter);

        for (const { path: sectionPath, section } of sections) {
          expect(section.sectionDescription).toBeDefined();
          expect(typeof section.sectionDescription).toBe('string');
          expect(section.sectionDescription!.trim().length).toBeGreaterThan(0);
        }
      }
    });

    // sectionMetadata validation removed - deprecated as of Jan 2026
  });

  describe('Contaminant Frontmatter Sections', () => {
    it('should have sectionTitle and sectionDescription in all sections', () => {
      const contaminantsDir = path.join(process.cwd(), 'frontmatter', 'contaminants');
      const violations = validateFrontmatterDirectory(contaminantsDir);

      if (violations.length > 0) {
        const errorMessage = violations.map(v => 
          `File: ${v.filePath}\n` +
          `Section: ${v.sectionPath}\n` +
          `Missing fields: ${v.missingFields.join(', ')}\n` +
          `Empty fields: ${v.emptyFields.join(', ')}\n`
        ).join('\n---\n');

        throw new Error(
          `Found ${violations.length} section(s) with missing or empty required fields:\n\n${errorMessage}`
        );
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Compound Frontmatter Sections', () => {
    it('should have sectionTitle and sectionDescription in all sections', () => {
      const compoundsDir = path.join(process.cwd(), 'frontmatter', 'compounds');
      const violations = validateFrontmatterDirectory(compoundsDir);

      if (violations.length > 0) {
        const errorMessage = violations.map(v => 
          `File: ${v.filePath}\n` +
          `Section: ${v.sectionPath}\n` +
          `Missing fields: ${v.missingFields.join(', ')}\n` +
          `Empty fields: ${v.emptyFields.join(', ')}\n`
        ).join('\n---\n');

        throw new Error(
          `Found ${violations.length} section(s) with missing or empty required fields:\n\n${errorMessage}`
        );
      }

      expect(violations).toEqual([]);
    });
  });

  describe('Section Structure Requirements', () => {
    it('should enforce mandatory section structure across all domains', () => {
      const domains = ['materials', 'contaminants', 'compounds'];
      const allViolations: Array<{ domain: string; violations: ValidationResult[] }> = [];

      for (const domain of domains) {
        const domainDir = path.join(process.cwd(), 'frontmatter', domain);
        const violations = validateFrontmatterDirectory(domainDir);
        
        if (violations.length > 0) {
          allViolations.push({ domain, violations });
        }
      }

      if (allViolations.length > 0) {
        const errorMessage = allViolations.map(({ domain, violations }) => {
          const domainErrors = violations.map(v => 
            `  File: ${v.filePath}\n` +
            `  Section: ${v.sectionPath}\n` +
            `  Missing: ${v.missingFields.join(', ') || 'none'}\n` +
            `  Empty: ${v.emptyFields.join(', ') || 'none'}`
          ).join('\n\n');

          return `Domain: ${domain}\n${domainErrors}`;
        }).join('\n\n---\n\n');

        throw new Error(
          `MANDATORY REQUIREMENT VIOLATION:\n\n` +
          `All sections must have sectionTitle and sectionDescription.\n\n` +
          `Found violations in ${allViolations.length} domain(s):\n\n${errorMessage}`
        );
      }

      expect(allViolations).toEqual([]);
    });
  });

  // Section Metadata Requirements tests removed - sectionMetadata deprecated as of Jan 2026
  // Previously tested: relationshipType, group, and domain fields within sectionMetadata

  describe('Required Section Coverage Validation', () => {
    /**
     * CRITICAL TEST: Ensures that specific sections that MUST have _section metadata
     * actually have it. This catches cases where sections exist in frontmatter but
     * are missing the _section block entirely.
     * 
     * This test was added after discovering polyethylene-laser-cleaning.yaml had
     * laserMaterialInteraction section without _section metadata, which caused
     * runtime errors in BaseSection component.
     */
    it('should have _section metadata for all required properties sections in materials', () => {
      const materialsDir = path.join(process.cwd(), 'frontmatter', 'materials');
      const files = fs.readdirSync(materialsDir).filter(f => f.endsWith('.yaml'));
      
      const requiredPropertySections = [
        'materialCharacteristics',
        'laserMaterialInteraction'
      ];
      
      const violations: Array<{ file: string; section: string; issue: string }> = [];

      for (const file of files) {
        const filePath = path.join(materialsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const frontmatter = yaml.load(content) as Record<string, any>;

        if (frontmatter.properties && typeof frontmatter.properties === 'object') {
          for (const sectionName of requiredPropertySections) {
            const section = frontmatter.properties[sectionName];
            
            // If section exists, it MUST have _section metadata
            if (section && typeof section === 'object') {
              if (!section._section) {
                violations.push({
                  file,
                  section: `properties.${sectionName}`,
                  issue: 'Section exists but missing _section metadata block'
                });
              } else {
                // Validate _section has required fields
                if (!section._section.sectionTitle) {
                  violations.push({
                    file,
                    section: `properties.${sectionName}`,
                    issue: 'Missing _section.sectionTitle'
                  });
                }
                if (!section._section.sectionDescription) {
                  violations.push({
                    file,
                    section: `properties.${sectionName}`,
                    issue: 'Missing _section.sectionDescription'
                  });
                }
              }
            }
          }
        }
      }

      if (violations.length > 0) {
        const errorMessage = violations.map(v => 
          `File: ${v.file}\n` +
          `Section: ${v.section}\n` +
          `Issue: ${v.issue}\n`
        ).join('\n---\n');

        throw new Error(
          `CRITICAL: Found ${violations.length} required section(s) missing _section metadata:\n\n` +
          `This causes runtime errors in BaseSection component!\n\n${errorMessage}`
        );
      }

      expect(violations).toEqual([]);
    });

    it('should have _section metadata for all relationship sections', () => {
      const domains = ['materials', 'contaminants', 'compounds'];
      const violations: Array<{ domain: string; file: string; section: string; issue: string }> = [];

      for (const domain of domains) {
        const domainDir = path.join(process.cwd(), 'frontmatter', domain);
        if (!fs.existsSync(domainDir)) continue;

        const files = fs.readdirSync(domainDir).filter(f => f.endsWith('.yaml'));

        for (const file of files) {
          const filePath = path.join(domainDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const frontmatter = yaml.load(content) as Record<string, any>;

          if (frontmatter.relationships && typeof frontmatter.relationships === 'object') {
            // Check each relationship group
            for (const [groupName, group] of Object.entries(frontmatter.relationships)) {
              if (group && typeof group === 'object' && !Array.isArray(group)) {
                // Check each section within the group
                for (const [sectionName, section] of Object.entries(group)) {
                  if (section && typeof section === 'object' && !Array.isArray(section)) {
                    // If it has items array, it's a section that needs _section metadata
                    if ('items' in section || '_section' in section) {
                      if (!section._section) {
                        violations.push({
                          domain,
                          file,
                          section: `relationships.${groupName}.${sectionName}`,
                          issue: 'Section missing _section metadata block'
                        });
                      } else {
                        if (!section._section.sectionTitle) {
                          violations.push({
                            domain,
                            file,
                            section: `relationships.${groupName}.${sectionName}`,
                            issue: 'Missing _section.sectionTitle'
                          });
                        }
                        if (!section._section.sectionDescription) {
                          violations.push({
                            domain,
                            file,
                            section: `relationships.${groupName}.${sectionName}`,
                            issue: 'Missing _section.sectionDescription'
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (violations.length > 0) {
        const errorMessage = violations.map(v => 
          `Domain: ${v.domain}\n` +
          `File: ${v.file}\n` +
          `Section: ${v.section}\n` +
          `Issue: ${v.issue}\n`
        ).join('\n---\n');

        throw new Error(
          `CRITICAL: Found ${violations.length} relationship section(s) missing _section metadata:\n\n` +
          `This causes runtime errors in BaseSection component!\n\n${errorMessage}`
        );
      }

      expect(violations).toEqual([]);
    });
  });
});
