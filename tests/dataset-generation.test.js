/**
 * Settings Dataset Generation Tests
 * 
 * Verifies that all 9 machine parameters are correctly generated
 * in JSON, CSV, and TXT formats for all materials.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Required parameters that MUST appear in every settings file
const REQUIRED_PARAMETERS = [
  'powerRange',
  'wavelength',
  'spotSize',
  'repetitionRate',
  'energyDensity',
  'pulseWidth',
  'scanSpeed',
  'passCount',
  'overlapRatio'
];

const SETTINGS_DIR = path.join(__dirname, '../frontmatter/settings');
const OUTPUT_DIR = path.join(__dirname, '../public/datasets/settings');

describe('Settings Dataset Generation', () => {
  
  describe('Source YAML Files', () => {
    let yamlFiles;
    
    beforeAll(() => {
      yamlFiles = fs.readdirSync(SETTINGS_DIR)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    });
    
    test('should have 132 settings YAML files', () => {
      expect(yamlFiles.length).toBe(132);
    });
    
    test('all YAML files should have complete machineSettings', () => {
      const errors = [];
      
      yamlFiles.forEach(file => {
        const filePath = path.join(SETTINGS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(content);
        
        if (!data.machineSettings) {
          errors.push(`${file}: Missing machineSettings object`);
          return;
        }
        
        REQUIRED_PARAMETERS.forEach(param => {
          if (!data.machineSettings[param]) {
            errors.push(`${file}: Missing parameter ${param}`);
          } else {
            const p = data.machineSettings[param];
            if (p.value === undefined) {
              errors.push(`${file}: ${param} missing value`);
            }
            if (!p.unit) {
              errors.push(`${file}: ${param} missing unit`);
            }
            if (p.min === undefined) {
              errors.push(`${file}: ${param} missing min`);
            }
            if (p.max === undefined) {
              errors.push(`${file}: ${param} missing max`);
            }
          }
        });
      });
      
      if (errors.length > 0) {
        console.error('YAML Validation Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('parameter values should be within valid ranges', () => {
      const errors = [];
      
      yamlFiles.forEach(file => {
        const filePath = path.join(SETTINGS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(content);
        
        if (!data.machineSettings) return;
        
        REQUIRED_PARAMETERS.forEach(param => {
          const p = data.machineSettings[param];
          if (p && p.value !== undefined && p.min !== undefined && p.max !== undefined) {
            if (p.value < p.min || p.value > p.max) {
              errors.push(`${file}: ${param} value ${p.value} outside range [${p.min}, ${p.max}]`);
            }
          }
        });
      });
      
      if (errors.length > 0) {
        console.error('Range Validation Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
  });
  
  describe('Generated TXT Files', () => {
    let txtFiles;
    
    beforeAll(() => {
      if (!fs.existsSync(OUTPUT_DIR)) {
        console.warn('Output directory does not exist. Run: npm run generate:datasets');
        return;
      }
      txtFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.txt'));
    });
    
    test('should generate 132 TXT files', () => {
      expect(txtFiles.length).toBe(132);
    });
    
    test('TXT files should not have empty MACHINE SETTINGS section', () => {
      const errors = [];
      
      txtFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for section header
        if (!content.includes('MACHINE SETTINGS')) {
          errors.push(`${file}: Missing MACHINE SETTINGS section`);
          return;
        }
        
        // Extract section content
        const sectionMatch = content.match(/MACHINE SETTINGS[^\n]*\n-+\n(.*?)(?:\n\n[A-Z]|\nGenerated:)/s);
        if (!sectionMatch) {
          errors.push(`${file}: Cannot parse MACHINE SETTINGS section`);
          return;
        }
        
        const sectionContent = sectionMatch[1];
        if (sectionContent.trim().length < 100) {
          errors.push(`${file}: MACHINE SETTINGS section appears empty or too short`);
        }
      });
      
      if (errors.length > 0) {
        console.error('TXT Empty Section Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('all TXT files should include all 9 required parameters', () => {
      const errors = [];
      
      txtFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        REQUIRED_PARAMETERS.forEach(param => {
          // Convert camelCase to UPPER CASE with spaces
          const displayName = param.replace(/([A-Z])/g, ' $1').toUpperCase();
          if (!content.includes(displayName + ':')) {
            errors.push(`${file}: Missing parameter ${param} (${displayName})`);
          }
        });
      });
      
      if (errors.length > 0) {
        console.error('TXT Missing Parameters:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('all parameters should have Value, Range, and Description', () => {
      const errors = [];
      
      txtFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        REQUIRED_PARAMETERS.forEach(param => {
          const displayName = param.replace(/([A-Z])/g, ' $1').toUpperCase();
          const paramMatch = content.match(new RegExp(`${displayName}:([^]*?)(?=\\n[A-Z ]+:|Generated:)`, 's'));
          
          if (paramMatch) {
            const paramContent = paramMatch[1];
            if (!paramContent.includes('Value:')) {
              errors.push(`${file}: ${param} missing Value field`);
            }
            if (!paramContent.includes('Range:')) {
              errors.push(`${file}: ${param} missing Range field`);
            }
            if (!paramContent.includes('Description:')) {
              errors.push(`${file}: ${param} missing Description field`);
            }
          }
        });
      });
      
      if (errors.length > 0) {
        console.error('TXT Field Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
  });
  
  describe('Generated CSV Files', () => {
    let csvFiles;
    
    beforeAll(() => {
      if (!fs.existsSync(OUTPUT_DIR)) return;
      csvFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.csv'));
    });
    
    test('should generate 132 CSV files', () => {
      expect(csvFiles.length).toBe(132);
    });
    
    test('CSV files should have correct header', () => {
      const errors = [];
      const expectedHeader = '"Parameter","Value","Unit","Min","Max","Description"';
      
      csvFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        if (lines[0] !== expectedHeader) {
          errors.push(`${file}: Incorrect header. Expected: ${expectedHeader}`);
        }
      });
      
      expect(errors).toEqual([]);
    });
    
    test('CSV files should have 10 rows (header + 9 parameters)', () => {
      const errors = [];
      
      csvFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim());
        
        if (lines.length !== 10) {
          errors.push(`${file}: Expected 10 rows (header + 9 params), found ${lines.length}`);
        }
      });
      
      if (errors.length > 0) {
        console.error('CSV Row Count Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('CSV files should include all required parameters', () => {
      const errors = [];
      
      csvFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        REQUIRED_PARAMETERS.forEach(param => {
          if (!content.includes(`"${param}"`)) {
            errors.push(`${file}: Missing parameter ${param}`);
          }
        });
      });
      
      if (errors.length > 0) {
        console.error('CSV Missing Parameters:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
  });
  
  describe('Generated JSON Files', () => {
    let jsonFiles;
    
    beforeAll(() => {
      if (!fs.existsSync(OUTPUT_DIR)) return;
      jsonFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.json'));
    });
    
    test('should generate 132 JSON files', () => {
      expect(jsonFiles.length).toBe(132);
    });
    
    test('JSON files should have valid structure', () => {
      const errors = [];
      
      jsonFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let data;
        try {
          data = JSON.parse(content);
        } catch (e) {
          errors.push(`${file}: Invalid JSON - ${e.message}`);
          return;
        }
        
        if (!data.metadata) {
          errors.push(`${file}: Missing metadata object`);
        }
        if (!data.machineSettings) {
          errors.push(`${file}: Missing machineSettings object`);
        }
      });
      
      expect(errors).toEqual([]);
    });
    
    test('JSON files should include all required parameters', () => {
      const errors = [];
      
      jsonFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        if (!data.machineSettings) return;
        
        REQUIRED_PARAMETERS.forEach(param => {
          if (!data.machineSettings[param]) {
            errors.push(`${file}: Missing parameter ${param}`);
          } else {
            const p = data.machineSettings[param];
            if (p.value === undefined) {
              errors.push(`${file}: ${param} missing value`);
            }
            if (!p.unit) {
              errors.push(`${file}: ${param} missing unit`);
            }
          }
        });
      });
      
      if (errors.length > 0) {
        console.error('JSON Missing Fields:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
  });
  
  describe('File Count Validation', () => {
    test('should have exactly 396 output files (132 materials × 3 formats)', () => {
      if (!fs.existsSync(OUTPUT_DIR)) {
        console.warn('Output directory does not exist. Run: npm run generate:datasets');
        return;
      }
      
      const allFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.txt') || f.endsWith('.csv') || f.endsWith('.json'));
      
      expect(allFiles.length).toBe(396);
    });
  });
});
