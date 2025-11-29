/**
 * Dataset Quality Validation
 * 
 * Enforces Dataset Quality Policy (docs/01-core/DATASET_QUALITY_POLICY.md)
 * 
 * Ensures datasets are only displayed when data quality meets minimum standards:
 * - Tier 1 (CRITICAL): All 8 machine settings parameters complete with min/max
 * - Tier 2 (IMPORTANT): 80%+ material property completeness
 * - Tier 3 (OPTIONAL): Safety, regulatory, vendor data
 * 
 * Used by:
 * - scripts/generate-datasets.ts (skip incomplete datasets)
 * - app/utils/jsonld-helper.ts (conditional Dataset schema)
 * - app/datasets/page.tsx (filter material listings)
 */

/**
 * Tier 1 REQUIRED parameters (machine settings)
 * ALL must have min/max values for dataset visibility
 */
export const TIER1_REQUIRED_PARAMETERS = [
  'powerRange',
  'wavelength',
  'spotSize',
  'repetitionRate',
  'pulseWidth',
  'scanSpeed',
  'passCount',
  'overlapRatio'
] as const;

/**
 * Tier 2 IMPORTANT parameters (material properties)
 * Should have 80%+ completeness for quality
 */
export const TIER2_IMPORTANT_PROPERTIES = {
  thermal: ['meltingPoint', 'thermalConductivity', 'heatCapacity'],
  optical: ['absorptivity', 'reflectivity', 'emissivity'],
  mechanical: ['density', 'hardness', 'tensileStrength'],
  chemical: ['composition', 'oxidationResistance']
} as const;

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  tier2Completeness: number;
  warnings: string[];
  reason?: string;
}

/**
 * Validate a single parameter has min/max values
 */
function hasMinMaxValues(paramData: any): boolean {
  if (!paramData || typeof paramData !== 'object') {
    return false;
  }
  
  return (
    typeof paramData.min === 'number' &&
    typeof paramData.max === 'number' &&
    !isNaN(paramData.min) &&
    !isNaN(paramData.max)
  );
}

/**
 * Calculate Tier 2 (material properties) completeness percentage
 */
function calculateTier2Completeness(materialProperties: any): number {
  if (!materialProperties || typeof materialProperties !== 'object') {
    return 0;
  }
  
  let totalProperties = 0;
  let completeProperties = 0;
  
  // Check each category
  Object.entries(TIER2_IMPORTANT_PROPERTIES).forEach(([category, properties]) => {
    const categoryData = materialProperties[category];
    if (!categoryData) return;
    
    properties.forEach(prop => {
      totalProperties++;
      const propData = categoryData[prop];
      if (propData && propData.value !== undefined && propData.value !== null) {
        completeProperties++;
      }
    });
  });
  
  if (totalProperties === 0) return 0;
  return Math.round((completeProperties / totalProperties) * 100);
}

/**
 * Validate dataset completeness for generation
 * Used by scripts/generate-datasets.ts
 * 
 * @param materialSlug - Material identifier (for logging)
 * @param machineSettings - Machine settings object from YAML
 * @param materialProperties - Optional material properties for Tier 2 check
 * @returns Validation result with missing parameters and warnings
 */
export function validateDatasetCompleteness(
  materialSlug: string,
  machineSettings: any,
  materialProperties?: any
): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Tier 1: Check all required parameters have min/max
  for (const param of TIER1_REQUIRED_PARAMETERS) {
    const paramData = machineSettings?.[param];
    if (!hasMinMaxValues(paramData)) {
      missing.push(param);
    }
  }
  
  // Calculate Tier 2 completeness
  const tier2Completeness = materialProperties 
    ? calculateTier2Completeness(materialProperties)
    : 0;
  
  // Add warnings for low Tier 2 completeness
  if (tier2Completeness > 0 && tier2Completeness < 80) {
    warnings.push(`Low material property completeness: ${tier2Completeness}%`);
  }
  
  return {
    valid: missing.length === 0,
    missing,
    tier2Completeness,
    warnings,
    reason: missing.length > 0 
      ? `Missing required parameters: ${missing.join(', ')}`
      : undefined
  };
}

/**
 * Validate dataset for JSON-LD schema inclusion
 * Used by app/utils/jsonld-helper.ts and schema generators
 * 
 * @param data - Material/settings data with machineSettings and materialProperties
 * @returns Validation result
 */
export function validateDatasetForSchema(data: any): ValidationResult {
  if (!data) {
    return {
      valid: false,
      missing: [],
      tier2Completeness: 0,
      warnings: [],
      reason: 'No data provided'
    };
  }
  
  const machineSettings = data.machineSettings || data.frontmatter?.machineSettings;
  const materialProperties = data.materialProperties || data.frontmatter?.materialProperties;
  const materialName = data.materialName || data.name || 'unknown';
  
  if (!machineSettings) {
    return {
      valid: false,
      missing: [],
      tier2Completeness: 0,
      warnings: [],
      reason: 'No machine settings available'
    };
  }
  
  return validateDatasetCompleteness(materialName, machineSettings, materialProperties);
}

/**
 * Check if a material has a complete dataset
 * Used by app/datasets/page.tsx for filtering
 * 
 * @param material - Material object with machineSettings
 * @returns true if dataset is complete and should be displayed
 */
export function hasCompleteDataset(material: any): boolean {
  const validation = validateDatasetForSchema(material);
  return validation.valid;
}

/**
 * Get dataset quality metrics for reporting
 * Used for build-time quality dashboard
 * 
 * @param materials - Array of all materials
 * @returns Quality metrics object
 */
export interface DatasetQualityMetrics {
  totalMaterials: number;
  completeDatasets: number;
  incompleteDatasets: number;
  completionRate: number;
  missingByParameter: Record<string, number>;
  avgTier2Completeness: number;
}

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
 * Format quality metrics for console output
 */
export function formatQualityReport(metrics: DatasetQualityMetrics): string {
  const lines = [
    '┌─────────────────────────────────────────────────┐',
    '│        DATASET QUALITY REPORT                   │',
    '├─────────────────────────────────────────────────┤',
    `│ Total Materials: ${metrics.totalMaterials.toString().padEnd(31)} │`,
    `│ Complete Datasets: ${metrics.completeDatasets} (${metrics.completionRate}%)${' '.repeat(Math.max(0, 21 - metrics.completeDatasets.toString().length - metrics.completionRate.toString().length))}│`,
    `│ Incomplete Datasets: ${metrics.incompleteDatasets} (${100 - metrics.completionRate}%)${' '.repeat(Math.max(0, 19 - metrics.incompleteDatasets.toString().length - (100 - metrics.completionRate).toString().length))}│`,
    '│                                                 │',
    '│ Missing Parameters:                             │'
  ];
  
  // Add parameter counts
  Object.entries(metrics.missingByParameter).forEach(([param, count]) => {
    if (count > 0) {
      const warning = count > 10 ? ' ⚠️' : '';
      const line = `│   • ${param}: ${count} materials${warning}`;
      lines.push(line.padEnd(50) + '│');
    }
  });
  
  // Add Tier 2 average
  const tier2Status = metrics.avgTier2Completeness >= 80 ? '✅' : '⚠️';
  lines.push('│                                                 │');
  lines.push(`│ Tier 2 Average Completeness: ${metrics.avgTier2Completeness}% ${tier2Status}${' '.repeat(Math.max(0, 11 - metrics.avgTier2Completeness.toString().length))}│`);
  lines.push('└─────────────────────────────────────────────────┘');
  
  return lines.join('\n');
}
