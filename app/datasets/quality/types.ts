/**
 * Types for Dataset Quality Metrics
 */

export interface DatasetQualityMetrics {
  totalMaterials: number;
  completeDatasets: number;
  incompleteDatasets: number;
  completionRate: number;
  avgTier2Completeness: number;
  missingByParameter: Record<string, number>;
}
