/**
 * Dataset Module - Public API
 * 
 * Centralized dataset management for Z-Beam laser cleaning platform
 * @module app/datasets
 */

// Core validation
export {
  validateTier1,
  validateTier2,
  validateTier3,
  validateComplete,
  validateComplete as validateDatasetCompleteness, // Backward compatibility alias
  validateDatasetForSchema,
  hasCompleteDataset,
  hasMinMaxValues,
  calculateTier2Completeness,
  calculateTier3Completeness,
  TIER1_REQUIRED_PARAMETERS,
  TIER2_IMPORTANT_PROPERTIES,
  TIER3_OPTIONAL_FIELDS
} from './core/validation';

// Metrics calculation
export {
  getDatasetQualityMetrics,
  calculateAggregateStats,
  compareMetrics
} from './core/metrics';

// Frontmatter sync
export {
  detectFrontmatterChanges,
  getDatasetSyncStatus,
  updateSyncCache,
  needsRegeneration,
  getDatasetsToRegenerate,
  formatSyncStatus,
  watchFrontmatterChanges
} from './core/sync';

// Quality reporting
export {
  formatQualityReport,
  formatQualityJSON,
  generateQualityDashboard,
  createQualitySummary,
  QUALITY_POLICY
} from './quality/reporting';

// Types
export type {
  MaterialDataset,
  MachineSettingParam,
  MaterialProperty,
  ValidationResult,
  DatasetQualityMetrics,
  GenerationOptions,
  GenerationResult,
  BatchGenerationResult,
  FrontmatterChange,
  DatasetSyncStatus
} from './core/types';
