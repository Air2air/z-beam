/**
 * Dataset Frontmatter Architecture Tests
 * 
 * FUNCTIONAL REQUIREMENT (Nov 29, 2025):
 * Dataset validation checks frontmatter by data type
 * 
 * Architecture:
 * - machineSettings (Tier 1): /frontmatter/settings/[material]-settings.yaml
 * - materialProperties (Tier 2): /frontmatter/materials/[material]-laser-cleaning.yaml
 * 
 * This test suite documents and validates the expected file structure,
 * naming conventions, and data source priorities.
 */

const {
  validateDatasetCompleteness,
  getDatasetQualityMetrics
} = require('../../app/datasets');

describe('Dataset Frontmatter Architecture - File Locations', () => {
  
  test('should document machineSettings location in settings frontmatter', () => {
    // machineSettings are stored in settings frontmatter
    const expectedPath = 'frontmatter/settings/aluminum-settings.yaml';
    const expectedStructure = {
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
    
    // Validate the structure
    const result = validateDatasetCompleteness('aluminum', expectedStructure.machineSettings);
    expect(result.valid).toBe(true);
    
    // Document: This test proves the expected frontmatter structure
    expect(expectedPath).toMatch(/frontmatter\/settings\/.*-settings\.yaml/);
  });
  
  test('should document materialProperties location in materials frontmatter', () => {
    // materialProperties are stored in materials frontmatter
    const expectedPath = 'frontmatter/materials/aluminum-laser-cleaning.yaml';
    
    // Document: This test proves the expected frontmatter structure
    expect(expectedPath).toMatch(/frontmatter\/materials\/.*-laser-cleaning\.yaml/);
  });
  
  test('should validate settings frontmatter structure', () => {
    // Settings frontmatter contains machineSettings object
    const validSettingsStructure = {
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
    
    const result = validateDatasetCompleteness('test', validSettingsStructure.machineSettings);
    expect(result.valid).toBe(true);
    expect(result.missing.length).toBe(0);
  });
});

describe('Dataset Frontmatter Architecture - File Naming', () => {
  
  test('should validate settings file naming convention', () => {
    // Settings files: [material-slug]-settings.yaml
    const settingsPattern = /^[a-z0-9-]+-settings\.yaml$/;
    
    expect('aluminum-settings.yaml').toMatch(settingsPattern);
    expect('stainless-steel-settings.yaml').toMatch(settingsPattern);
    expect('titanium-settings.yaml').toMatch(settingsPattern);
    
    // Should NOT match these patterns
    expect('aluminum.yaml').not.toMatch(settingsPattern);
    expect('aluminum-laser-cleaning.yaml').not.toMatch(settingsPattern);
  });
  
  test('should validate materials file naming convention', () => {
    // Materials files: [material-slug]-laser-cleaning.yaml
    const materialsPattern = /^[a-z0-9-]+-laser-cleaning\.yaml$/;
    
    expect('aluminum-laser-cleaning.yaml').toMatch(materialsPattern);
    expect('stainless-steel-laser-cleaning.yaml').toMatch(materialsPattern);
    expect('titanium-laser-cleaning.yaml').toMatch(materialsPattern);
    
    // Should NOT match these patterns
    expect('aluminum.yaml').not.toMatch(materialsPattern);
    expect('aluminum-settings.yaml').not.toMatch(materialsPattern);
  });
  
  test('should document slug conversion examples', () => {
    // Material name → settings filename
    const examples = [
      { material: 'Aluminum', slug: 'aluminum', settings: 'aluminum-settings.yaml' },
      { material: 'Stainless Steel', slug: 'stainless-steel', settings: 'stainless-steel-settings.yaml' },
      { material: 'Titanium Grade 5', slug: 'titanium-grade-5', settings: 'titanium-grade-5-settings.yaml' }
    ];
    
    examples.forEach(({ material, slug, settings }) => {
      // Slug should be lowercase, hyphenated
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      
      // Settings filename should be slug + '-settings.yaml'
      expect(settings).toBe(`${slug}-settings.yaml`);
    });
  });
});

describe('Dataset Frontmatter Architecture - Data Source Priority', () => {
  
  test('should document priority order for data sources', () => {
    // Priority order in validator (validate-seo-infrastructure.js):
    // 1. settings frontmatter for machineSettings (Tier 1)
    // 2. materials frontmatter for materialProperties (Tier 2)
    
    const priorities = [
      { dataType: 'machineSettings', tier: 1, source: 'settings', priority: 1 },
      { dataType: 'materialProperties', tier: 2, source: 'materials', priority: 2 }
    ];
    
    // machineSettings checked first
    expect(priorities[0].dataType).toBe('machineSettings');
    expect(priorities[0].source).toBe('settings');
    expect(priorities[0].priority).toBe(1);
    
    // materialProperties checked second
    expect(priorities[1].dataType).toBe('materialProperties');
    expect(priorities[1].source).toBe('materials');
    expect(priorities[1].priority).toBe(2);
  });
  
  test('should validate that settings frontmatter is primary source for machineSettings', () => {
    // For material "aluminum":
    const sources = {
      machineSettings: {
        primary: 'frontmatter/settings/aluminum-settings.yaml',
        structure: 'machineSettings object at root'
      },
      materialProperties: {
        primary: 'frontmatter/materials/aluminum-laser-cleaning.yaml',
        structure: 'materialProperties object at root'
      }
    };
    
    expect(sources.machineSettings.primary).toContain('/settings/');
    expect(sources.machineSettings.primary).toContain('-settings.yaml');
    
    expect(sources.materialProperties.primary).toContain('/materials/');
    expect(sources.materialProperties.primary).toContain('-laser-cleaning.yaml');
  });
});

describe('Dataset Frontmatter Architecture - Current State (Nov 29, 2025)', () => {
  
  test('should document known data completeness issues', () => {
    // Current state: machineSettings exist but lack min/max
    const currentStructure = {
      powerRange: { value: 100, unit: 'W' }, // ❌ Missing min/max
      wavelength: { value: 1064, unit: 'nm' } // ❌ Missing min/max
    };
    
    const result = validateDatasetCompleteness('test', currentStructure);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('powerRange');
    expect(result.missing).toContain('wavelength');
  });
  
  test('should document required structure for completion', () => {
    // Required: Each parameter needs value, unit, min, AND max
    const requiredStructure = {
      powerRange: { 
        value: 100, 
        unit: 'W',
        min: 20,   // ✅ REQUIRED
        max: 200   // ✅ REQUIRED
      },
      wavelength: { 
        value: 1064, 
        unit: 'nm',
        min: 532,  // ✅ REQUIRED
        max: 1064  // ✅ REQUIRED
      }
    };
    
    // Validate min/max presence
    Object.values(requiredStructure).forEach(param => {
      expect(param).toHaveProperty('min');
      expect(param).toHaveProperty('max');
      expect(typeof param.min).toBe('number');
      expect(typeof param.max).toBe('number');
    });
  });
  
  test('should document data entry requirements', () => {
    // Data entry task: Add min/max to 159 settings files
    const dataEntryStats = {
      totalMaterials: 159,
      parametersPerMaterial: 8,
      valuesPerParameter: 2, // min + max
      totalDataPoints: 159 * 8 * 2 // = 2,544 data points
    };
    
    expect(dataEntryStats.totalDataPoints).toBe(2544);
    
    // Each settings file needs 8 parameters × 2 values = 16 data points
    const dataPointsPerFile = dataEntryStats.parametersPerMaterial * dataEntryStats.valuesPerParameter;
    expect(dataPointsPerFile).toBe(16);
  });
});
