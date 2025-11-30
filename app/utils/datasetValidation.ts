/**
 * Dataset Quality Validation
 * 
 * @deprecated Use app/datasets instead
 * This file is a backward-compatible wrapper. New code should import from:
 * import { validateDatasetForSchema, ... } from '@/app/datasets'
 * 
 * Enforces Dataset Quality Policy (docs/01-core/DATASET_QUALITY_POLICY.md)
 */

// Re-export everything from new location for backward compatibility
export {
  validateDatasetForSchema,
  validateComplete as validateDatasetCompleteness,
  validateTier1,
  hasCompleteDataset,
  getDatasetQualityMetrics,
  TIER1_REQUIRED_PARAMETERS,
  TIER2_IMPORTANT_PROPERTIES,
  formatQualityReport,
  calculateTier2Completeness,
  hasMinMaxValues
} from '@/app/datasets';

export type {
  ValidationResult,
  DatasetQualityMetrics
} from '@/app/datasets';
