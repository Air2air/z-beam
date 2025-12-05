/**
 * Frontmatter Change Detection and Dataset Synchronization
 * 
 * Monitors frontmatter files for changes and triggers dataset regeneration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { FrontmatterChange, DatasetSyncStatus } from './types';

const CACHE_FILE = '.dataset-sync-cache.json';
const MATERIALS_DIR = path.join(process.cwd(), 'frontmatter', 'materials');
const SETTINGS_DIR = path.join(process.cwd(), 'frontmatter', 'settings');

interface FileCache {
  hash: string;
  mtime: number;
}

interface SyncCache {
  lastSync: string;
  files: Record<string, FileCache>;
  changes: FrontmatterChange[];
}

/**
 * Calculate file hash for change detection
 */
function calculateFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Load sync cache from disk
 */
function loadSyncCache(): SyncCache {
  const cachePath = path.join(process.cwd(), CACHE_FILE);
  
  if (fs.existsSync(cachePath)) {
    try {
      const content = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(content);
    } catch (_error) {
      console.warn('Failed to load sync cache, creating new one');
    }
  }
  
  return {
    lastSync: new Date().toISOString(),
    files: {},
    changes: []
  };
}

/**
 * Save sync cache to disk
 */
function saveSyncCache(cache: SyncCache): void {
  const cachePath = path.join(process.cwd(), CACHE_FILE);
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Get all frontmatter files
 */
function getAllFrontmatterFiles(): string[] {
  const files: string[] = [];
  
  if (fs.existsSync(MATERIALS_DIR)) {
    const materialFiles = fs.readdirSync(MATERIALS_DIR)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
      .map(f => path.join(MATERIALS_DIR, f));
    files.push(...materialFiles);
  }
  
  if (fs.existsSync(SETTINGS_DIR)) {
    const settingsFiles = fs.readdirSync(SETTINGS_DIR)
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
      .map(f => path.join(SETTINGS_DIR, f));
    files.push(...settingsFiles);
  }
  
  return files;
}

/**
 * Extract material slug from filename
 */
function getMaterialSlugFromFile(filePath: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  
  // Remove -settings suffix if present
  if (basename.endsWith('-settings')) {
    return basename.replace('-settings', '');
  }
  
  // Remove -laser-cleaning suffix if present
  if (basename.endsWith('-laser-cleaning')) {
    return basename.replace('-laser-cleaning', '');
  }
  
  return basename;
}

/**
 * Detect changes in frontmatter files
 */
export function detectFrontmatterChanges(): FrontmatterChange[] {
  const cache = loadSyncCache();
  const changes: FrontmatterChange[] = [];
  const currentFiles = getAllFrontmatterFiles();
  const currentFileSet = new Set(currentFiles);
  const cachedFileSet = new Set(Object.keys(cache.files));
  
  // Check for added files
  for (const file of currentFiles) {
    if (!cachedFileSet.has(file)) {
      changes.push({
        type: 'added',
        file,
        timestamp: new Date(),
        affectedDatasets: [getMaterialSlugFromFile(file)]
      });
    }
  }
  
  // Check for deleted files
  for (const file of Object.keys(cache.files)) {
    if (!currentFileSet.has(file)) {
      changes.push({
        type: 'deleted',
        file,
        timestamp: new Date(),
        affectedDatasets: [getMaterialSlugFromFile(file)]
      });
    }
  }
  
  // Check for modified files
  for (const file of currentFiles) {
    if (cachedFileSet.has(file)) {
      const currentHash = calculateFileHash(file);
      const cachedHash = cache.files[file].hash;
      
      if (currentHash !== cachedHash) {
        changes.push({
          type: 'modified',
          file,
          timestamp: new Date(),
          affectedDatasets: [getMaterialSlugFromFile(file)]
        });
      }
    }
  }
  
  return changes;
}

/**
 * Get dataset synchronization status
 */
export function getDatasetSyncStatus(): DatasetSyncStatus {
  const cache = loadSyncCache();
  const changes = detectFrontmatterChanges();
  const outdatedDatasets = new Set<string>();
  
  // Collect all affected datasets
  changes.forEach(change => {
    change.affectedDatasets.forEach(slug => outdatedDatasets.add(slug));
  });
  
  return {
    inSync: changes.length === 0,
    outdatedDatasets: Array.from(outdatedDatasets),
    lastSync: new Date(cache.lastSync),
    pendingChanges: changes
  };
}

/**
 * Update sync cache after dataset regeneration
 */
export function updateSyncCache(): void {
  const cache = loadSyncCache();
  const currentFiles = getAllFrontmatterFiles();
  
  // Update file hashes and mtimes
  cache.files = {};
  currentFiles.forEach(file => {
    const stats = fs.statSync(file);
    cache.files[file] = {
      hash: calculateFileHash(file),
      mtime: stats.mtimeMs
    };
  });
  
  // Clear changes and update sync time
  cache.changes = [];
  cache.lastSync = new Date().toISOString();
  
  saveSyncCache(cache);
}

/**
 * Check if datasets need regeneration
 */
export function needsRegeneration(): boolean {
  const status = getDatasetSyncStatus();
  return !status.inSync;
}

/**
 * Get list of datasets that need regeneration
 */
export function getDatasetsToRegenerate(): string[] {
  const status = getDatasetSyncStatus();
  return status.outdatedDatasets;
}

/**
 * Format sync status for console output
 */
export function formatSyncStatus(status: DatasetSyncStatus): string {
  if (status.inSync) {
    return '✅ All datasets in sync with frontmatter';
  }
  
  const lines = [
    '⚠️  Dataset synchronization needed',
    '',
    `📊 Status:`,
    `   • Last sync: ${status.lastSync.toLocaleString()}`,
    `   • Pending changes: ${status.pendingChanges.length}`,
    `   • Affected datasets: ${status.outdatedDatasets.length}`,
    ''
  ];
  
  if (status.pendingChanges.length > 0) {
    lines.push('📝 Recent changes:');
    status.pendingChanges.slice(0, 10).forEach(change => {
      const icon = change.type === 'added' ? '➕' : 
                   change.type === 'deleted' ? '➖' : '✏️';
      lines.push(`   ${icon} ${change.type.toUpperCase()}: ${path.basename(change.file)}`);
    });
    
    if (status.pendingChanges.length > 10) {
      lines.push(`   ... and ${status.pendingChanges.length - 10} more`);
    }
  }
  
  lines.push('');
  lines.push('🔄 Run dataset generation to sync:');
  lines.push('   npm run generate:datasets');
  
  return lines.join('\n');
}

/**
 * Watch frontmatter directory for changes (for development)
 */
export function watchFrontmatterChanges(callback: (changes: FrontmatterChange[]) => void): void {
  const dirs = [MATERIALS_DIR, SETTINGS_DIR].filter(d => fs.existsSync(d));
  
  dirs.forEach(dir => {
    fs.watch(dir, { recursive: false }, (eventType, filename) => {
      if (filename && (filename.endsWith('.yaml') || filename.endsWith('.yml'))) {
        // Debounce: wait a bit for file operations to complete
        setTimeout(() => {
          const changes = detectFrontmatterChanges();
          if (changes.length > 0) {
            callback(changes);
          }
        }, 1000);
      }
    });
  });
  
  console.log('👀 Watching frontmatter directories for changes...');
}
