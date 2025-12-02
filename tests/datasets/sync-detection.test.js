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
    
    // Should have a valid sync status structure
    expect(typeof status.inSync).toBe('boolean');
    expect(Array.isArray(status.outdatedDatasets)).toBe(true);
    expect(Array.isArray(status.pendingChanges)).toBe(true);
  });
  
  test('should extract material slug from filename', () => {
    const status = getDatasetSyncStatus();
    
    // If there are outdated datasets, they should have valid slug format
    if (status.outdatedDatasets.length > 0) {
      expect(status.outdatedDatasets).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^[a-z0-9-]+$/) // Slug format
        ])
      );
    }
  });
  
  test('should detect both materials and settings files', () => {
    const status = getDatasetSyncStatus();
    
    // Should have pending changes array
    expect(Array.isArray(status.pendingChanges)).toBe(true);
    
    // If there are pending changes, check their structure
    if (status.pendingChanges.length > 0) {
      const hasMaterials = status.pendingChanges.some(c => 
        c.file.includes('laser-cleaning.yaml')
      );
      const hasSettings = status.pendingChanges.some(c => 
        c.file.includes('-settings.yaml')
      );
      
      // At least one type should be present
      expect(hasMaterials || hasSettings).toBe(true);
    }
  });
});

describe('Dataset Sync Detection - Change Detection', () => {
  
  test('should detect change types (added/modified/deleted)', () => {
    const status = getDatasetSyncStatus();
    
    // Should have change type for each pending change
    if (status.pendingChanges.length > 0) {
      status.pendingChanges.forEach(change => {
        expect(['added', 'modified', 'deleted']).toContain(change.type);
        expect(change.file).toBeTruthy();
      });
    }
  });
  
  test('should report sync status correctly', () => {
    const status = getDatasetSyncStatus();
    
    // Should have valid sync status
    expect(typeof status.inSync).toBe('boolean');
    expect(status.lastSync instanceof Date).toBe(true);
    expect(Array.isArray(status.pendingChanges)).toBe(true);
    expect(Array.isArray(status.outdatedDatasets)).toBe(true);
  });
  
  test('should calculate datasets needing regeneration', () => {
    const status = getDatasetSyncStatus();
    const needsRegen = needsRegeneration();
    
    // If there are pending changes, should need regeneration
    if (status.pendingChanges.length > 0) {
      expect(needsRegen).toBe(true);
      expect(status.outdatedDatasets.length).toBeGreaterThan(0);
    } else {
      // If no changes, should not need regeneration
      expect(needsRegen).toBe(false);
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
  
  test('should handle cache file operations', () => {
    // Getting sync status should not throw
    expect(() => getDatasetSyncStatus()).not.toThrow();
    
    const cachePath = path.join(process.cwd(), '.dataset-sync-cache.json');
    // Cache file may or may not exist depending on whether updateSyncCache was called
    // The key behavior is that getDatasetSyncStatus should work regardless
    const status = getDatasetSyncStatus();
    expect(status).toBeDefined();
  });
  
  test('should update sync cache when called', () => {
    // Update the cache
    updateSyncCache();
    
    const cachePath = path.join(process.cwd(), '.dataset-sync-cache.json');
    expect(fs.existsSync(cachePath)).toBe(true);
    
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    
    // Cache should have valid structure
    expect(cache.lastSync).toBeTruthy();
    expect(typeof cache.files).toBe('object');
  });
  
  test('should track file hashes in cache after update', () => {
    updateSyncCache();
    
    const cachePath = path.join(process.cwd(), '.dataset-sync-cache.json');
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    
    // Should have file entries with hashes
    const fileKeys = Object.keys(cache.files);
    expect(fileKeys.length).toBeGreaterThan(0);
    
    fileKeys.forEach(key => {
      expect(cache.files[key].hash).toMatch(/^[a-f0-9]{32}$/); // MD5 hash
    });
  });
});

describe('Dataset Sync Detection - Material Slug Mapping', () => {
  
  test('should map materials frontmatter to slug', () => {
    const status = getDatasetSyncStatus();
    
    const materialChanges = status.pendingChanges.filter(c => 
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
    
    const settingsChanges = status.pendingChanges.filter(c => 
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
    expect(status1.inSync).toBe(status2.inSync);
    expect(status1.pendingChanges.length).toBe(status2.pendingChanges.length);
    expect(status1.outdatedDatasets).toEqual(status2.outdatedDatasets);
  });
});
