/**
 * Dataset Sync Detection Tests
 * 
 * Tests the proactive frontmatter change detection system.
 * 
 * Features tested:
 * - Frontmatter file discovery
 * - MD5 hash-based change detection
 * - Cache file persistence
 * - Material slug extraction
 * - Sync status reporting
 */

const fs = require('fs');
const path = require('path');
const {
  detectFrontmatterChanges,
  getDatasetSyncStatus,
  needsRegeneration,
  getDatasetsToRegenerate,
  updateSyncCache
} = require('../../app/datasets');

describe('Dataset Sync Detection - File Discovery', () => {
  
  test('should find all frontmatter files', () => {
    const status = getDatasetSyncStatus();
    
    // Should detect frontmatter files
    expect(status.totalFiles).toBeGreaterThan(0);
    expect(status.changes.length).toBeGreaterThan(0);
  });
  
  test('should extract material slug from filename', () => {
    const status = getDatasetSyncStatus();
    
    // Should have affected datasets
    expect(status.outdatedDatasets.length).toBeGreaterThan(0);
    expect(status.outdatedDatasets).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^[a-z0-9-]+$/) // Slug format
      ])
    );
  });
  
  test('should detect both materials and settings files', () => {
    const status = getDatasetSyncStatus();
    
    // Should detect files from both directories
    const hasMaterials = status.changes.some(c => 
      c.file.includes('laser-cleaning.yaml')
    );
    const hasSettings = status.changes.some(c => 
      c.file.includes('-settings.yaml')
    );
    
    expect(hasMaterials).toBe(true);
    expect(hasSettings).toBe(true);
  });
});

describe('Dataset Sync Detection - Change Detection', () => {
  
  test('should detect change types (added/modified/deleted)', () => {
    const status = getDatasetSyncStatus();
    
    // Should have change type for each file
    status.changes.forEach(change => {
      expect(['added', 'modified', 'deleted']).toContain(change.type);
      expect(change.file).toBeTruthy();
    });
  });
  
  test('should report sync status correctly', () => {
    const status = getDatasetSyncStatus();
    
    // Should have valid sync status
    expect(typeof status.inSync).toBe('boolean');
    expect(typeof status.lastSync).toBe('string');
    expect(typeof status.totalFiles).toBe('number');
    expect(Array.isArray(status.changes)).toBe(true);
    expect(Array.isArray(status.outdatedDatasets)).toBe(true);
  });
  
  test('should calculate datasets needing regeneration', () => {
    const status = getDatasetSyncStatus();
    const needsRegen = needsRegeneration();
    
    // If there are changes, should need regeneration
    if (status.changes.length > 0) {
      expect(needsRegen).toBe(true);
      expect(status.outdatedDatasets.length).toBeGreaterThan(0);
    }
  });
  
  test('should list specific datasets to regenerate', () => {
    const datasets = getDatasetsToRegenerate();
    
    // Should return array of slugs
    expect(Array.isArray(datasets)).toBe(true);
    
    if (datasets.length > 0) {
      // Each should be a valid slug
      datasets.forEach(slug => {
        expect(slug).toMatch(/^[a-z0-9-]+$/);
      });
    }
  });
});

describe('Dataset Sync Detection - Cache Management', () => {
  
  test('should have cache file after status check', () => {
    getDatasetSyncStatus();
    
    const cachePath = path.join(process.cwd(), '.dataset-sync-cache.json');
    expect(fs.existsSync(cachePath)).toBe(true);
  });
  
  test('should read and parse cache file', () => {
    getDatasetSyncStatus();
    
    const cachePath = path.join(process.cwd(), '.dataset-sync-cache.json');
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    
    // Cache should have valid structure
    expect(cache.lastSync).toBeTruthy();
    expect(cache.version).toBe('1.0');
    expect(typeof cache.files).toBe('object');
  });
  
  test('should track file hashes in cache', () => {
    getDatasetSyncStatus();
    
    const cachePath = path.join(process.cwd(), '.dataset-sync-cache.json');
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    
    // Should have file entries with hashes
    const fileKeys = Object.keys(cache.files);
    expect(fileKeys.length).toBeGreaterThan(0);
    
    fileKeys.forEach(key => {
      expect(cache.files[key]).toMatch(/^[a-f0-9]{32}$/); // MD5 hash
    });
  });
});

describe('Dataset Sync Detection - Material Slug Mapping', () => {
  
  test('should map materials frontmatter to slug', () => {
    const status = getDatasetSyncStatus();
    
    const materialChanges = status.changes.filter(c => 
      c.file.includes('laser-cleaning.yaml')
    );
    
    if (materialChanges.length > 0) {
      // Each material file should map to a dataset
      materialChanges.forEach(change => {
        const slug = change.file
          .replace(/.*\//, '')
          .replace('-laser-cleaning.yaml', '');
        
        expect(status.outdatedDatasets).toContain(slug);
      });
    }
  });
  
  test('should map settings frontmatter to slug', () => {
    const status = getDatasetSyncStatus();
    
    const settingsChanges = status.changes.filter(c => 
      c.file.includes('-settings.yaml')
    );
    
    if (settingsChanges.length > 0) {
      // Each settings file should map to a dataset
      settingsChanges.forEach(change => {
        const slug = change.file
          .replace(/.*\//, '')
          .replace('-settings.yaml', '');
        
        expect(status.outdatedDatasets).toContain(slug);
      });
    }
  });
  
  test('should deduplicate affected datasets', () => {
    const datasets = getDatasetsToRegenerate();
    const unique = [...new Set(datasets)];
    
    // Should have no duplicates
    expect(datasets.length).toBe(unique.length);
  });
});

describe('Dataset Sync Detection - Integration', () => {
  
  test('should work with quality metrics', () => {
    const status = getDatasetSyncStatus();
    
    // Sync detection should not interfere with quality checks
    expect(status).toBeDefined();
    expect(() => {
      require('../../app/datasets').getDatasetQualityMetrics([]);
    }).not.toThrow();
  });
  
  test('should work with validation', () => {
    const status = getDatasetSyncStatus();
    
    // Sync detection should not interfere with validation
    expect(status).toBeDefined();
    expect(() => {
      require('../../app/datasets').validateDatasetForSchema({});
    }).not.toThrow();
  });
  
  test('should provide consistent results on repeated calls', () => {
    const status1 = getDatasetSyncStatus();
    const status2 = getDatasetSyncStatus();
    
    // Should return same results (cache unchanged)
    expect(status1.totalFiles).toBe(status2.totalFiles);
    expect(status1.changes.length).toBe(status2.changes.length);
    expect(status1.outdatedDatasets).toEqual(status2.outdatedDatasets);
  });
});
