/**
 * Dataset Quality Metrics Calculation
 */

import type { DatasetQualityMetrics, MaterialDataset, ValidationResult } from './types';
import { validateDatasetForSchema, TIER1_REQUIRED_PARAMETERS } from './validation';

/**
 * Get dataset quality metrics for reporting
 * Used for build-time quality dashboard
 */
export function getDatasetQualityMetrics(materials: any[]): DatasetQualityMetrics {
  const missingByParameter: Record<string, number> = {};
  let totalTier2Completeness = 0;
  let completeMaterials = 0;
  
  // Initialize counters
  TIER1_REQUIRED_PARAMETERS.forEach(param => {
    missingByParameter[param] = 0;
  });
  
  // Check each material
  materials.forEach(material => {
    const validation = validateDatasetForSchema(material);
    
    if (validation.valid) {
      completeMaterials++;
    }
    
    // Count missing parameters
    validation.missing.forEach(param => {
      missingByParameter[param]++;
    });
    
    // Sum Tier 2 completeness
    totalTier2Completeness += validation.tier2Completeness;
  });
  
  const totalMaterials = materials.length;
  const incompleteDatasets = totalMaterials - completeMaterials;
  const completionRate = totalMaterials > 0 
    ? Math.round((completeMaterials / totalMaterials) * 100)
    : 0;
  const avgTier2Completeness = totalMaterials > 0
    ? Math.round(totalTier2Completeness / totalMaterials)
    : 0;
  
  return {
    totalMaterials,
    completeDatasets: completeMaterials,
    incompleteDatasets,
    completionRate,
    missingByParameter,
    avgTier2Completeness
  };
}

/**
 * Calculate aggregate statistics across materials
 */
export function calculateAggregateStats(materials: MaterialDataset[]): {
  totalVariables: number;
  totalParameters: number;
  totalFAQs: number;
  avgVariablesPerMaterial: number;
  avgParametersPerMaterial: number;
} {
  let totalVars = 0;
  let totalParams = 0;
  let totalFAQs = 0;
  
  materials.forEach(material => {
    // Count machine settings (variables)
    if (material.machineSettings) {
      totalVars += Object.keys(material.machineSettings).length;
    }
    
    // Count material properties (parameters)
    if (material.materialProperties) {
      Object.values(material.materialProperties).forEach((category: any) => {
        if (category && typeof category === 'object') {
          totalParams += Object.keys(category).length;
        }
      });
    }
    
    // Count FAQs
    if (material.faq) {
      if (Array.isArray(material.faq)) {
        totalFAQs += material.faq.length;
      } else if (typeof material.faq === 'object' && material.faq.questions) {
        totalFAQs += Array.isArray(material.faq.questions) ? material.faq.questions.length : 0;
      }
    }
  });
  
  const count = materials.length || 1;
  
  return {
    totalVariables: totalVars,
    totalParameters: totalParams,
    totalFAQs,
    avgVariablesPerMaterial: Math.round(totalVars / count),
    avgParametersPerMaterial: Math.round(totalParams / count)
  };
}

/**
 * Compare current metrics with previous to detect changes
 */
export function compareMetrics(
  current: DatasetQualityMetrics,
  previous: DatasetQualityMetrics
): {
  improved: boolean;
  completionRateChange: number;
  newCompletions: number;
  newIncompletes: number;
} {
  return {
    improved: current.completionRate > previous.completionRate,
    completionRateChange: current.completionRate - previous.completionRate,
    newCompletions: current.completeDatasets - previous.completeDatasets,
    newIncompletes: current.incompleteDatasets - previous.incompleteDatasets
  };
}
