/**
 * Dataset Quality Policy Tests
 * 
 * Validates enforcement of Dataset Quality Policy (docs/01-core/DATASET_QUALITY_POLICY.md)
 * 
 * Tests ensure:
 * - Tier 1 parameters (8 required with min/max) are validated
 * - Tier 2 material property completeness is calculated
 * - Incomplete datasets are rejected
 * - Quality metrics are accurate
 */

const {
  validateDatasetCompleteness,
  validateDatasetForSchema,
  hasCompleteDataset,
  getDatasetQualityMetrics,
  TIER1_REQUIRED_PARAMETERS
} = require('../app/utils/datasetValidation');

describe('Dataset Quality Policy - Tier 1 Validation', () => {
  
  test('should reject dataset missing ALL Tier 1 parameters', () => {
    const machineSettings = {};
    const result = validateDatasetCompleteness('test-material', machineSettings);
    
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBe(8); // All 8 parameters missing
    expect(result.missing).toEqual(expect.arrayContaining(TIER1_REQUIRED_PARAMETERS));
  });
  
  test('should reject dataset with parameters but missing min/max values', () => {
    const machineSettings = {
      powerRange: { value: 50, unit: 'W' }, // Missing min/max
      wavelength: { value: 1064, unit: 'nm' }, // Missing min/max
      spotSize: { value: 10, unit: 'mm', min: 5, max: 15 } // Has min/max
    };
    
    const result = validateDatasetCompleteness('test-material', machineSettings);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('powerRange');
    expect(result.missing).toContain('wavelength');
    expect(result.missing).not.toContain('spotSize');
  });
  
  test('should accept dataset with ALL Tier 1 parameters complete', () => {
    const machineSettings = {
      powerRange: { value: 50, unit: 'W', min: 20, max: 100 },
      wavelength: { value: 1064, unit: 'nm', min: 1000, max: 1100 },
      spotSize: { value: 10, unit: 'mm', min: 5, max: 15 },
      repetitionRate: { value: 20, unit: 'kHz', min: 10, max: 30 },
      pulseWidth: { value: 100, unit: 'ns', min: 50, max: 200 },
      scanSpeed: { value: 1000, unit: 'mm/s', min: 500, max: 2000 },
      passCount: { value: 3, unit: 'passes', min: 1, max: 5 },
      overlapRatio: { value: 50, unit: '%', min: 30, max: 70 }
    };
    
    const result = validateDatasetCompleteness('test-material', machineSettings);
    
    expect(result.valid).toBe(true);
    expect(result.missing.length).toBe(0);
  });
  
  test('should handle NaN values as invalid', () => {
    const machineSettings = {
      powerRange: { value: 50, unit: 'W', min: NaN, max: 100 }, // Invalid min
      wavelength: { value: 1064, unit: 'nm', min: 1000, max: 1100 },
      spotSize: { value: 10, unit: 'mm', min: 5, max: 15 },
      repetitionRate: { value: 20, unit: 'kHz', min: 10, max: 30 },
      pulseWidth: { value: 100, unit: 'ns', min: 50, max: 200 },
      scanSpeed: { value: 1000, unit: 'mm/s', min: 500, max: 2000 },
      passCount: { value: 3, unit: 'passes', min: 1, max: 5 },
      overlapRatio: { value: 50, unit: '%', min: 30, max: 70 }
    };
    
    const result = validateDatasetCompleteness('test-material', machineSettings);
    
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('powerRange');
  });
});

describe('Dataset Quality Policy - Tier 2 Validation', () => {
  
  test('should calculate 100% Tier 2 completeness with all properties', () => {
    const machineSettings = createCompleteSettings();
    const materialProperties = {
      thermal: {
        meltingPoint: { value: 1500, unit: 'K' },
        thermalConductivity: { value: 100, unit: 'W/mK' },
        heatCapacity: { value: 500, unit: 'J/kgK' }
      },
      optical: {
        absorptivity: { value: 0.5, unit: '' },
        reflectivity: { value: 0.3, unit: '' },
        emissivity: { value: 0.2, unit: '' }
      },
      mechanical: {
        density: { value: 7800, unit: 'kg/m³' },
        hardness: { value: 200, unit: 'HV' },
        tensileStrength: { value: 400, unit: 'MPa' }
      },
      chemical: {
        composition: { value: 'Fe-C', unit: '' },
        oxidationResistance: { value: 'Good', unit: '' }
      }
    };
    
    const result = validateDatasetCompleteness('test-material', machineSettings, materialProperties);
    
    expect(result.valid).toBe(true);
    expect(result.tier2Completeness).toBe(100);
    expect(result.warnings.length).toBe(0);
  });
  
  test('should calculate 50% Tier 2 completeness with half properties', () => {
    const machineSettings = createCompleteSettings();
    const materialProperties = {
      thermal: {
        meltingPoint: { value: 1500, unit: 'K' }
        // Missing thermalConductivity, heatCapacity
      },
      optical: {
        absorptivity: { value: 0.5, unit: '' },
        reflectivity: { value: 0.3, unit: '' }
        // Missing emissivity
      },
      mechanical: {
        density: { value: 7800, unit: 'kg/m³' },
        hardness: { value: 200, unit: 'HV' }
        // Missing tensileStrength
      }
      // Missing chemical category entirely
    };
    
    const result = validateDatasetCompleteness('test-material', machineSettings, materialProperties);
    
    expect(result.valid).toBe(true);
    expect(result.tier2Completeness).toBeGreaterThanOrEqual(50);
    expect(result.tier2Completeness).toBeLessThanOrEqual(60); // ~6/11 properties
  });
  
  test('should warn when Tier 2 completeness < 80%', () => {
    const machineSettings = createCompleteSettings();
    const materialProperties = {
      thermal: {
        meltingPoint: { value: 1500, unit: 'K' }
      }
    };
    
    const result = validateDatasetCompleteness('test-material', machineSettings, materialProperties);
    
    expect(result.valid).toBe(true); // Still valid for Tier 1
    expect(result.tier2Completeness).toBeLessThan(80);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Low material property completeness');
  });
});

describe('Dataset Quality Policy - Schema Validation', () => {
  
  test('should reject schema generation for data without machine settings', () => {
    const data = {
      materialName: 'Test Material',
      materialProperties: { /* some properties */ }
      // No machineSettings
    };
    
    const result = validateDatasetForSchema(data);
    
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('No machine settings available');
  });
  
  test('should reject schema generation for incomplete machine settings', () => {
    const data = {
      materialName: 'Test Material',
      machineSettings: {
        powerRange: { value: 50, unit: 'W' } // Missing min/max
      }
    };
    
    const result = validateDatasetForSchema(data);
    
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });
  
  test('should accept schema generation for complete dataset', () => {
    const data = {
      materialName: 'Test Material',
      machineSettings: createCompleteSettings()
    };
    
    const result = validateDatasetForSchema(data);
    
    expect(result.valid).toBe(true);
  });
  
  test('should handle frontmatter structure', () => {
    const data = {
      frontmatter: {
        machineSettings: createCompleteSettings(),
        materialProperties: {}
      }
    };
    
    const result = validateDatasetForSchema(data);
    
    expect(result.valid).toBe(true);
  });
});

describe('Dataset Quality Policy - Material Filtering', () => {
  
  test('hasCompleteDataset should return false for incomplete', () => {
    const material = {
      name: 'Test Material',
      machineSettings: {
        powerRange: { value: 50, unit: 'W' } // Incomplete
      }
    };
    
    expect(hasCompleteDataset(material)).toBe(false);
  });
  
  test('hasCompleteDataset should return true for complete', () => {
    const material = {
      name: 'Test Material',
      machineSettings: createCompleteSettings()
    };
    
    expect(hasCompleteDataset(material)).toBe(true);
  });
});

describe('Dataset Quality Policy - Quality Metrics', () => {
  
  test('should calculate correct metrics for mixed materials', () => {
    const materials = [
      { name: 'Complete 1', machineSettings: createCompleteSettings() },
      { name: 'Complete 2', machineSettings: createCompleteSettings() },
      { name: 'Incomplete 1', machineSettings: { powerRange: { value: 50, unit: 'W' } } },
      { name: 'Incomplete 2', machineSettings: {} }
    ];
    
    const metrics = getDatasetQualityMetrics(materials);
    
    expect(metrics.totalMaterials).toBe(4);
    expect(metrics.completeDatasets).toBe(2);
    expect(metrics.incompleteDatasets).toBe(2);
    expect(metrics.completionRate).toBe(50);
  });
  
  test('should count missing parameters correctly', () => {
    const materials = [
      { 
        name: 'Missing passCount',
        machineSettings: {
          powerRange: { value: 50, unit: 'W', min: 20, max: 100 },
          wavelength: { value: 1064, unit: 'nm', min: 1000, max: 1100 },
          spotSize: { value: 10, unit: 'mm', min: 5, max: 15 },
          repetitionRate: { value: 20, unit: 'kHz', min: 10, max: 30 },
          pulseWidth: { value: 100, unit: 'ns', min: 50, max: 200 },
          scanSpeed: { value: 1000, unit: 'mm/s', min: 500, max: 2000 },
          overlapRatio: { value: 50, unit: '%', min: 30, max: 70 }
          // Missing passCount
        }
      },
      {
        name: 'Missing wavelength',
        machineSettings: {
          powerRange: { value: 50, unit: 'W', min: 20, max: 100 },
          spotSize: { value: 10, unit: 'mm', min: 5, max: 15 },
          repetitionRate: { value: 20, unit: 'kHz', min: 10, max: 30 },
          pulseWidth: { value: 100, unit: 'ns', min: 50, max: 200 },
          scanSpeed: { value: 1000, unit: 'mm/s', min: 500, max: 2000 },
          passCount: { value: 3, unit: 'passes', min: 1, max: 5 },
          overlapRatio: { value: 50, unit: '%', min: 30, max: 70 }
          // Missing wavelength
        }
      }
    ];
    
    const metrics = getDatasetQualityMetrics(materials);
    
    expect(metrics.missingByParameter.passCount).toBe(1);
    expect(metrics.missingByParameter.wavelength).toBe(1);
  });
});

// Helper function to create complete machine settings
function createCompleteSettings() {
  return {
    powerRange: { value: 50, unit: 'W', min: 20, max: 100 },
    wavelength: { value: 1064, unit: 'nm', min: 1000, max: 1100 },
    spotSize: { value: 10, unit: 'mm', min: 5, max: 15 },
    repetitionRate: { value: 20, unit: 'kHz', min: 10, max: 30 },
    pulseWidth: { value: 100, unit: 'ns', min: 50, max: 200 },
    scanSpeed: { value: 1000, unit: 'mm/s', min: 500, max: 2000 },
    passCount: { value: 3, unit: 'passes', min: 1, max: 5 },
    overlapRatio: { value: 50, unit: '%', min: 30, max: 70 }
  };
}
