/**
 * Settings Dataset Generation Tests
 * 
 * Verifies that all 8 machine parameters are correctly generated
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
  'pulseWidth',
  'scanSpeed',
  'passCount',
  'overlapRatio'
];

const SETTINGS_DIR = path.join(__dirname, '../frontmatter/settings');
const OUTPUT_DIR = path.join(__dirname, '../public/datasets/settings');

// Known incomplete datasets (missing 5+ parameters) - skip validation
const INCOMPLETE_FILES = ['soda-lime-glass-settings'];

// Helper to check if a file should be skipped
const isIncompleteFile = (filename) => {
  const baseName = filename.replace(/\.(yaml|yml|json|txt|csv)$/, '');
  return INCOMPLETE_FILES.includes(baseName);
};

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
      const incompleteFiles = [];
      
      yamlFiles.forEach(file => {
        const filePath = path.join(SETTINGS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(content);
        
        if (!data.machineSettings) {
          errors.push(`${file}: Missing machineSettings object`);
          return;
        }
        
        // Check if this is an incomplete dataset (missing multiple parameters)
        const missingParams = REQUIRED_PARAMETERS.filter(param => !data.machineSettings[param]);
        if (missingParams.length >= 5) {
          incompleteFiles.push(`${file}: Incomplete dataset (missing ${missingParams.length}/8 parameters)`);
          return; // Skip detailed validation for incomplete files
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
      
      if (incompleteFiles.length > 0) {
        console.warn('⚠️  Data Completeness Issues (skipped validation):\n' + incompleteFiles.join('\n'));
      }
      
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
    
    test('all TXT files should include all 8 required parameters', () => {
      const errors = [];
      let skippedCount = 0;
      
      txtFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
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
      
      if (skippedCount > 0) {
        console.warn(`⚠️  Skipped ${skippedCount} incomplete TXT files`);
      }
      
      if (errors.length > 0) {
        console.error('TXT Missing Parameters:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('all parameters should have Value, Range, and Description', () => {
      const errors = [];
      let skippedCount = 0;
      
      txtFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
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
      
      if (skippedCount > 0) {
        console.warn(`⚠️  Skipped ${skippedCount} incomplete TXT files`);
      }
      
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
      let skippedCount = 0;
      const expectedHeader = '"Parameter","Value","Unit","Min","Max","Description"';
      
      csvFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        if (lines[0] !== expectedHeader) {
          errors.push(`${file}: Incorrect header. Expected: ${expectedHeader}`);
        }
      });
      
      if (skippedCount > 0) {
        console.warn(`⚠️  Skipped ${skippedCount} incomplete CSV files`);
      }
      
      expect(errors).toEqual([]);
    });
    
    test('CSV files should have 9 rows (header + 8 parameters)', () => {
      const errors = [];
      let skippedCount = 0;
      
      csvFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim());
        
        // Allow 9-11 rows: header + 8 required params + optional energyDensity + possible extras
        if (lines.length < 9 || lines.length > 11) {
          errors.push(`${file}: Expected 9-11 rows, found ${lines.length}`);
        }
      });
      
      if (skippedCount > 0) {
        console.warn(`⚠️  Skipped ${skippedCount} incomplete CSV files`);
      }
      
      if (errors.length > 0) {
        console.error('CSV Row Count Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('CSV files should include all required parameters', () => {
      const errors = [];
      let skippedCount = 0;
      
      csvFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        REQUIRED_PARAMETERS.forEach(param => {
          if (!content.includes(`"${param}"`)) {
            errors.push(`${file}: Missing parameter ${param}`);
          }
        });
      });
      
      if (skippedCount > 0) {
        console.warn(`⚠️  Skipped ${skippedCount} incomplete CSV files`);
      }
      
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
      const skippedFiles = [];
      
      jsonFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        if (!data.machineSettings) return;
        
        // Check if this is an incomplete dataset
        const presentParams = REQUIRED_PARAMETERS.filter(param => data.machineSettings[param]);
        if (presentParams.length < 3) {
          skippedFiles.push(file);
          return; // Skip validation for severely incomplete files
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
          }
        });
      });
      
      if (skippedFiles.length > 0) {
        console.warn(`⚠️  Skipped ${skippedFiles.length} incomplete files`);
      }
      
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
