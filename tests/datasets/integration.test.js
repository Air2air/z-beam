/**
 * Dataset Module Integration Tests
 * 
 * Tests end-to-end workflows combining multiple features:
 * - Validation + Quality Metrics
 * - Sync Detection + Regeneration Planning
 * - Quality Policy Enforcement + Reporting
 */

const {
  // Validation
  validateDatasetForSchema,
  validateDatasetCompleteness,
  hasCompleteDataset,
  
  // Metrics
  getDatasetQualityMetrics,
  calculateAggregateStats,
  
  // Sync
  getDatasetSyncStatus,
  needsRegeneration,
  getDatasetsToRegenerate,
  
  // Reporting
  formatQualityReport,
  
  // Constants
  TIER1_REQUIRED_PARAMETERS
} = require('../../app/datasets');

describe('Dataset Integration - Validation to Metrics Pipeline', () => {
  
  test('should validate dataset and calculate metrics', () => {
    // Create test material with complete dataset
    const completeMaterial = {
      name: 'Test Material',
      machineSettings: {
        powerRange: { value: 100, unit: 'W', min: 20, max: 200 },
        wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 },
        spotSize: { value: 50, unit: 'μm', min: 10, max: 100 },
        repetitionRate: { value: 50, unit: 'kHz', min: 20, max: 100 },
        pulseWidth: { value: 10, unit: 'ns', min: 5, max: 50 },
        scanSpeed: { value: 500, unit: 'mm/s', min: 100, max: 1000 },
        passCount: { value: 3, unit: 'passes', min: 1, max: 10 },
        overlapRatio: { value: 50, unit: '%', min: 10, max: 80 }
      }
    };
    
    // Validate
    const validation = validateDatasetCompleteness(
      'test-material',
      completeMaterial.machineSettings
    );
    expect(validation.valid).toBe(true);
    
    // Calculate metrics
    const metrics = getDatasetQualityMetrics([completeMaterial]);
    expect(metrics.totalMaterials).toBe(1);
    expect(metrics.completeDatasets).toBe(1);
    expect(metrics.completionRate).toBe(100);
  });
  
  test('should detect incomplete datasets in metrics', () => {
    const incompleteMaterial = {
      name: 'Incomplete Material',
      machineSettings: {
        powerRange: { value: 100, unit: 'W', min: 20, max: 200 },
        wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 }
        // Missing 6 required parameters
      }
    };
    
    // Validate
    const validation = validateDatasetCompleteness(
      'incomplete-material',
      incompleteMaterial.machineSettings
    );
    expect(validation.valid).toBe(false);
    expect(validation.missing.length).toBe(6);
    
    // Calculate metrics
    const metrics = getDatasetQualityMetrics([incompleteMaterial]);
    expect(metrics.totalMaterials).toBe(1);
    expect(metrics.completeDatasets).toBe(0);
    expect(metrics.incompleteDatasets).toBe(1);
    expect(metrics.completionRate).toBe(0);
  });
});

describe('Dataset Integration - Quality Policy Enforcement', () => {
  
  test('should enforce all 8 Tier 1 parameters', () => {
    expect(TIER1_REQUIRED_PARAMETERS).toEqual([
      'powerRange',
      'wavelength',
      'spotSize',
      'repetitionRate',
      'pulseWidth',
      'scanSpeed',
      'passCount',
      'overlapRatio'
    ]);
  });
  
  test('should validate Schema.org Dataset inclusion requirements', () => {
    const completeDataset = {
      machineSettings: {
        powerRange: { value: 100, unit: 'W', min: 20, max: 200 },
        wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 },
        spotSize: { value: 50, unit: 'μm', min: 10, max: 100 },
        repetitionRate: { value: 50, unit: 'kHz', min: 20, max: 100 },
        pulseWidth: { value: 10, unit: 'ns', min: 5, max: 50 },
        scanSpeed: { value: 500, unit: 'mm/s', min: 100, max: 1000 },
        passCount: { value: 3, unit: 'passes', min: 1, max: 10 },
        overlapRatio: { value: 50, unit: '%', min: 10, max: 80 }
      }
    };
    
    const result = validateDatasetForSchema(completeDataset);
    expect(result.valid).toBe(true);
    // valid=true means it can be included in Schema.org
  });
  
  test('should reject incomplete datasets from Schema.org', () => {
    const incompleteDataset = {
      machineSettings: {
        powerRange: { value: 100, unit: 'W', min: 20, max: 200 }
        // Missing 7 required parameters
      }
    };
    
    const result = validateDatasetForSchema(incompleteDataset);
    expect(result.valid).toBe(false);
    // valid=false means it should NOT be included in Schema.org
  });
});

describe('Dataset Integration - Sync Detection to Regeneration', () => {
  
  test('should detect changes and identify affected datasets', () => {
    const status = getDatasetSyncStatus();
    
    // Should have a valid sync status
    expect(typeof status.inSync).toBe('boolean');
    expect(Array.isArray(status.outdatedDatasets)).toBe(true);
    
    // Should identify datasets needing regeneration if not in sync
    if (!status.inSync && status.pendingChanges.length > 0) {
      const needsRegen = needsRegeneration();
      expect(needsRegen).toBe(true);
      
      const datasets = getDatasetsToRegenerate();
      expect(datasets.length).toBeGreaterThan(0);
    }
  });
  
  test('should provide regeneration guidance', () => {
    const status = getDatasetSyncStatus();
    
    // Status should be actionable
    expect(typeof status.inSync).toBe('boolean');
    expect(Array.isArray(status.outdatedDatasets)).toBe(true);
    
    if (!status.inSync) {
      // Should tell user what to do
      expect(status.outdatedDatasets.length).toBeGreaterThan(0);
    }
  });
});

describe('Dataset Integration - Quality Reporting', () => {
  
  test('should generate formatted quality report', () => {
    const materials = [
      {
        name: 'Complete Material',
        machineSettings: {
          powerRange: { value: 100, unit: 'W', min: 20, max: 200 },
          wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 },
          spotSize: { value: 50, unit: 'μm', min: 10, max: 100 },
          repetitionRate: { value: 50, unit: 'kHz', min: 20, max: 100 },
          pulseWidth: { value: 10, unit: 'ns', min: 5, max: 50 },
          scanSpeed: { value: 500, unit: 'mm/s', min: 100, max: 1000 },
          passCount: { value: 3, unit: 'passes', min: 1, max: 10 },
          overlapRatio: { value: 50, unit: '%', min: 10, max: 80 }
        }
      },
      {
        name: 'Incomplete Material',
        machineSettings: {
          powerRange: { value: 100, unit: 'W', min: 20, max: 200 }
        }
      }
    ];
    
    const metrics = getDatasetQualityMetrics(materials);
    const report = formatQualityReport(metrics);
    
    // Report should contain key information
    expect(report).toContain('DATASET QUALITY REPORT');
    expect(report).toContain('Total Materials: 2');
    expect(report).toContain('Complete Datasets: 1');
    expect(report).toContain('Incomplete Datasets: 1');
  });
  
  test('should calculate aggregate statistics', () => {
    const materials = [
      {
        machineSettings: {
          powerRange: { value: 100, unit: 'W', min: 20, max: 200 }
        },
        faq: [{ question: 'Q1', answer: 'A1' }]
      },
      {
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 }
        },
        faq: [{ question: 'Q2', answer: 'A2' }, { question: 'Q3', answer: 'A3' }]
      }
    ];
    
    const stats = calculateAggregateStats(materials);
    
    expect(stats.totalVariables).toBe(2); // powerRange, wavelength
    expect(stats.totalFAQs).toBe(3);
    // avgFAQsPerMaterial is not returned by calculateAggregateStats
    // Check avgVariablesPerMaterial instead
    expect(stats.avgVariablesPerMaterial).toBe(1);
  });
});

describe('Dataset Integration - Module Exports', () => {
  
  test('should export all validation functions', () => {
    const module = require('../../app/datasets');
    
    expect(typeof module.validateDatasetForSchema).toBe('function');
    expect(typeof module.validateDatasetCompleteness).toBe('function');
    expect(typeof module.hasCompleteDataset).toBe('function');
  });
  
  test('should export all metrics functions', () => {
    const module = require('../../app/datasets');
    
    expect(typeof module.getDatasetQualityMetrics).toBe('function');
    expect(typeof module.calculateAggregateStats).toBe('function');
  });
  
  test('should export all sync functions', () => {
    const module = require('../../app/datasets');
    
    expect(typeof module.detectFrontmatterChanges).toBe('function');
    expect(typeof module.getDatasetSyncStatus).toBe('function');
    expect(typeof module.needsRegeneration).toBe('function');
    expect(typeof module.getDatasetsToRegenerate).toBe('function');
  });
  
  test('should export all reporting functions', () => {
    const module = require('../../app/datasets');
    
    expect(typeof module.formatQualityReport).toBe('function');
    expect(typeof module.formatQualityJSON).toBe('function');
  });
  
  test('should export constants', () => {
    const module = require('../../app/datasets');
    
    expect(Array.isArray(module.TIER1_REQUIRED_PARAMETERS)).toBe(true);
    expect(module.TIER1_REQUIRED_PARAMETERS.length).toBe(8);
  });
});

describe('Dataset Integration - Backward Compatibility', () => {
  
  test('should maintain compatibility with old import paths', () => {
    // Old path should still work via wrappers
    const oldModule = require('../../app/utils/datasetValidation');
    
    expect(typeof oldModule.validateDatasetForSchema).toBe('function');
    expect(typeof oldModule.getDatasetQualityMetrics).toBe('function');
  });
  
  test('should provide same functionality from both paths', () => {
    const newModule = require('../../app/datasets');
    const oldModule = require('../../app/utils/datasetValidation');
    
    // Both should export the same functions
    expect(typeof newModule.validateDatasetForSchema).toBe(
      typeof oldModule.validateDatasetForSchema
    );
  });
});
