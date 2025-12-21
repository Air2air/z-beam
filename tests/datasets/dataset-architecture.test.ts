/**
 * Dataset Architecture Tests
 * Enforces mandatory dataset consolidation requirements:
 * 1. Materials + Settings = Single unified dataset
 * 2. Contaminants + Compounds = Single unified dataset
 * 3. All datasets have required fields (variableMeasured ≥20, citations ≥3, distribution)
 */

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Add format validators (uri, email, etc.)

describe('Dataset Architecture Requirements', () => {
  const DATASETS_DIR = path.join(process.cwd(), 'public/datasets');
  const MATERIALS_DIR = path.join(DATASETS_DIR, 'materials');
  const CONTAMINANTS_DIR = path.join(DATASETS_DIR, 'contaminants');
  const SETTINGS_DIR = path.join(DATASETS_DIR, 'settings');
  const COMPOUNDS_DIR = path.join(DATASETS_DIR, 'compounds');

  const materialSchema = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'schemas/dataset-material.json'), 'utf8')
  );
  const contaminantSchema = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'schemas/dataset-contaminant.json'), 'utf8')
  );

  const validateMaterial = ajv.compile(materialSchema);
  const validateContaminant = ajv.compile(contaminantSchema);

  function getJsonFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  }

  describe('🔴 MANDATORY: Dataset Consolidation', () => {
    it('MUST NOT have separate settings directory', () => {
      const settingsFiles = getJsonFiles(SETTINGS_DIR);
      expect(settingsFiles).toEqual([]);
      expect(fs.existsSync(SETTINGS_DIR)).toBe(false);
    });

    it('MUST NOT have separate compounds directory', () => {
      const compoundFiles = getJsonFiles(COMPOUNDS_DIR);
      expect(compoundFiles).toEqual([]);
      expect(fs.existsSync(COMPOUNDS_DIR)).toBe(false);
    });

    it('MUST have materials directory with unified datasets', () => {
      expect(fs.existsSync(MATERIALS_DIR)).toBe(true);
      const materialFiles = getJsonFiles(MATERIALS_DIR);
      expect(materialFiles.length).toBeGreaterThan(100);
    });

    it('MUST have contaminants directory with unified datasets', () => {
      expect(fs.existsSync(CONTAMINANTS_DIR)).toBe(true);
      const contaminantFiles = getJsonFiles(CONTAMINANTS_DIR);
      expect(contaminantFiles.length).toBeGreaterThan(50);
    });
  });

  describe('🔴 MANDATORY: Material Dataset Requirements', () => {
    const materialFiles = getJsonFiles(MATERIALS_DIR);

    it('ALL material datasets MUST have variableMeasured with ≥20 items', () => {
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        const count = data.variableMeasured?.length || 0;
        
        if (count < 20) {
          violations.push(`${file}: ${count} variables (need ≥20)`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL material datasets MUST have citations with ≥3 items', () => {
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        const count = data.citation?.length || 0;
        
        if (count < 3) {
          violations.push(`${file}: ${count} citations (need ≥3)`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL material datasets MUST have distribution array (JSON, CSV, TXT)', () => {
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        const dist = data.distribution || [];
        
        if (dist.length < 3) {
          violations.push(`${file}: ${dist.length} formats (need 3: JSON, CSV, TXT)`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL material datasets MUST have measurementTechnique', () => {
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        
        if (!data.measurementTechnique || data.measurementTechnique.length < 10) {
          violations.push(`${file}: Missing or too short`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL material datasets MUST have machineSettings in material object', () => {
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        
        if (!data.material?.machineSettings) {
          violations.push(`${file}: Missing material.machineSettings`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL material datasets MUST have required machine settings parameters', () => {
      const requiredParams = ['powerRange', 'wavelength', 'spotSize', 'repetitionRate', 'pulseWidth', 'scanSpeed'];
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        const settings = data.material?.machineSettings || {};
        
        for (const param of requiredParams) {
          if (!settings[param]) {
            violations.push(`${file}: Missing ${param}`);
          }
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL material datasets MUST pass JSON schema validation', () => {
      const violations: string[] = [];
      
      for (const file of materialFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf8'));
        const valid = validateMaterial(data);
        
        if (!valid) {
          const errors = validateMaterial.errors?.map(e => `${e.instancePath} ${e.message}`).join(', ');
          violations.push(`${file}: ${errors}`);
        }
      }
      
      if (violations.length > 0) {
        console.log('\nSchema validation errors:', violations.slice(0, 5));
      }
      
      expect(violations).toEqual([]);
    });
  });

  describe('🔴 MANDATORY: Contaminant Dataset Requirements', () => {
    const contaminantFiles = getJsonFiles(CONTAMINANTS_DIR);

    it('ALL contaminant datasets MUST have variableMeasured with ≥20 items', () => {
      const violations: string[] = [];
      
      for (const file of contaminantFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(CONTAMINANTS_DIR, file), 'utf8'));
        const count = data.variableMeasured?.length || 0;
        
        if (count < 20) {
          violations.push(`${file}: ${count} variables (need ≥20)`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL contaminant datasets MUST have citations with ≥3 items', () => {
      const violations: string[] = [];
      
      for (const file of contaminantFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(CONTAMINANTS_DIR, file), 'utf8'));
        const count = data.citation?.length || 0;
        
        if (count < 3) {
          violations.push(`${file}: ${count} citations (need ≥3)`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL contaminant datasets MUST have distribution array', () => {
      const violations: string[] = [];
      
      for (const file of contaminantFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(CONTAMINANTS_DIR, file), 'utf8'));
        const dist = data.distribution || [];
        
        if (dist.length < 3) {
          violations.push(`${file}: ${dist.length} formats (need 3)`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL contaminant datasets MUST have measurementTechnique', () => {
      const violations: string[] = [];
      
      for (const file of contaminantFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(CONTAMINANTS_DIR, file), 'utf8'));
        
        if (!data.measurementTechnique || data.measurementTechnique.length < 10) {
          violations.push(`${file}: Missing or too short`);
        }
      }
      
      expect(violations).toEqual([]);
    });

    it('ALL contaminant datasets MUST pass JSON schema validation', () => {
      const violations: string[] = [];
      
      for (const file of contaminantFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(CONTAMINANTS_DIR, file), 'utf8'));
        const valid = validateContaminant(data);
        
        if (!valid) {
          const errors = validateContaminant.errors?.map(e => `${e.instancePath} ${e.message}`).join(', ');
          violations.push(`${file}: ${errors}`);
        }
      }
      
      if (violations.length > 0) {
        console.log('\nSchema validation errors:', violations.slice(0, 5));
      }
      
      expect(violations).toEqual([]);
    });
  });

  describe('📊 Quality Metrics', () => {
    it('should report dataset consolidation status', () => {
      const materialsCount = getJsonFiles(MATERIALS_DIR).length;
      const contaminantsCount = getJsonFiles(CONTAMINANTS_DIR).length;
      const settingsCount = getJsonFiles(SETTINGS_DIR).length;
      const compoundsCount = getJsonFiles(COMPOUNDS_DIR).length;
      
      console.log('\n📊 Dataset Architecture Status:');
      console.log(`  ✅ Materials (unified): ${materialsCount} datasets`);
      console.log(`  ✅ Contaminants (unified): ${contaminantsCount} datasets`);
      console.log(`  ❌ Settings (deprecated): ${settingsCount} files (should be 0)`);
      console.log(`  ❌ Compounds (deprecated): ${compoundsCount} files (should be 0)`);
      console.log(`  📈 Total unified: ${materialsCount + contaminantsCount} datasets`);
      console.log(`  🎯 Target: 230+ datasets with 100% schema compliance`);
      
      expect(settingsCount).toBe(0);
      expect(compoundsCount).toBe(0);
      expect(materialsCount + contaminantsCount).toBeGreaterThan(200);
    });
  });
});
