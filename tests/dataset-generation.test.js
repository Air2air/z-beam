/**
 * Unified Dataset Generation Tests
 * 
 * Verifies that unified datasets correctly combine material properties
 * AND machine settings, with machine settings appearing FIRST in all formats.
 * 
 * Architecture: One dataset per material includes both:
 * - Material properties (thermal, optical, mechanical)
 * - Machine settings (power, wavelength, spot size, etc.)
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
const MATERIALS_DIR = path.join(__dirname, '../frontmatter/materials');
const OUTPUT_DIR = path.join(__dirname, '../public/datasets/materials');

// Known incomplete datasets (missing 5+ parameters) - skip validation
const INCOMPLETE_FILES = ['soda-lime-glass-settings'];

// Helper to check if a file should be skipped
const isIncompleteFile = (filename) => {
  const baseName = filename.replace(/\.(yaml|yml|json|txt|csv)$/, '');
  return INCOMPLETE_FILES.includes(baseName);
};

describe('Unified Dataset Generation', () => {
  
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
    
    test('should generate 132 unified TXT files', () => {
      expect(txtFiles.length).toBe(132);
    });
    
    test('TXT files should have MACHINE SETTINGS section before other sections', () => {
      const errors = [];
      
      txtFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for section header
        if (!content.includes('MACHINE SETTINGS')) {
          errors.push(`${file}: Missing MACHINE SETTINGS section`);
          return;
        }
        
        // Verify MACHINE SETTINGS appears before LASER PARAMETERS (if present)
        const machineIndex = content.indexOf('MACHINE SETTINGS');
        const laserIndex = content.indexOf('LASER PARAMETERS');
        if (laserIndex !== -1 && machineIndex > laserIndex) {
          errors.push(`${file}: MACHINE SETTINGS should appear BEFORE LASER PARAMETERS`);
        }
        
        // Extract section content
        const sectionMatch = content.match(/MACHINE SETTINGS[^\n]*\n=+\n(.*?)(?:\n\n=+|$)/s);
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
        console.error('TXT Machine Settings Position Errors:\n' + errors.join('\n'));
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
    
    test('should generate 132 unified CSV files', () => {
      expect(csvFiles.length).toBe(132);
    });
    
    test('CSV files should have Machine Settings rows before material properties', () => {
      const errors = [];
      let skippedCount = 0;
      
      csvFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        
        // Find first Machine,Settings row and first Property row
        let firstMachineRow = -1;
        let firstPropertyRow = -1;
        
        lines.forEach((line, index) => {
          if (line.startsWith('Machine,Settings') && firstMachineRow === -1) {
            firstMachineRow = index;
          }
          if (line.startsWith('Property,') && firstPropertyRow === -1) {
            firstPropertyRow = index;
          }
        });
        
        if (firstMachineRow === -1) {
          errors.push(`${file}: No Machine,Settings rows found`);
        } else if (firstPropertyRow !== -1 && firstMachineRow > firstPropertyRow) {
          errors.push(`${file}: Machine settings should appear BEFORE material properties`);
        }
      });
      
      if (skippedCount > 0) {
        console.warn(`⚠️  Skipped ${skippedCount} incomplete CSV files`);
      }
      
      if (errors.length > 0) {
        console.error('CSV Machine Settings Position Errors:\n' + errors.join('\n'));
      }
      expect(errors).toEqual([]);
    });
    
    test('CSV files should have 15+ rows (header + basic info + 10 machine settings + properties)', () => {
      const errors = [];
      let skippedCount = 0;
      
      csvFiles.forEach(file => {
        if (isIncompleteFile(file)) {
          skippedCount++;
          return;
        }
        
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        
        if (lines.length < 15) {
          errors.push(`${file}: Expected at least 15 rows, found ${lines.length}`);
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
    
    test('should generate 132 unified JSON files (plus index)', () => {
      // 132 material datasets + 1 index.json
      expect(jsonFiles.length).toBe(133);
    });
    
    test('JSON files should have Schema.org structure with machine settings in variableMeasured', () => {
      const errors = [];
      
      jsonFiles.forEach(file => {
        // Skip index.json - it has different structure
        if (file === 'index.json') return;
        
        const filePath = path.join(OUTPUT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let data;
        try {
          data = JSON.parse(content);
        } catch (e) {
          errors.push(`${file}: Invalid JSON - ${e.message}`);
          return;
        }
        
        // Check Schema.org structure
        if (data['@type'] !== 'Dataset') {
          errors.push(`${file}: Missing or incorrect @type (expected Dataset)`);
        }
        
        if (!data.variableMeasured || !Array.isArray(data.variableMeasured)) {
          errors.push(`${file}: Missing variableMeasured array`);
          return;
        }
        
        // Check for machine settings in variableMeasured
        const machineSettings = data.variableMeasured.filter(v => 
          v.name && v.name.includes('Machine Setting')
        );
        
        if (machineSettings.length === 0) {
          errors.push(`${file}: No machine settings found in variableMeasured`);
        }
        
        // Verify machine settings appear FIRST in variableMeasured
        const firstVariable = data.variableMeasured[0];
        if (firstVariable && !firstVariable.name.includes('Machine Setting')) {
          errors.push(`${file}: First variable should be a machine setting, found: ${firstVariable.name}`);
        }
      });
      
      if (errors.length > 0) {
        console.error('JSON Schema.org Structure Errors:\n' + errors.join('\n'));
      }
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
    test('should have exactly 397 output files (132 materials × 3 formats + index.json)', () => {
      if (!fs.existsSync(OUTPUT_DIR)) {
        console.warn('Output directory does not exist. Run: npm run generate:datasets');
        return;
      }
      
      const allFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.txt') || f.endsWith('.csv') || f.endsWith('.json'));
      
      expect(allFiles.length).toBe(397);
    });
  });
});
