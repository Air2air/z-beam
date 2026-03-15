/**
 * Dataset Quality Validation - Core Logic
 * 
 * Enforces Dataset Quality Policy (docs/01-core/DATASET_QUALITY_POLICY.md)
 * Single source of truth for all validation logic
 */

import type { ValidationResult } from './types';
import datasetPolicy from './policy.json';

/**
 * Tier 1 REQUIRED parameters (machine settings)
 * ALL must have min/max values for dataset visibility
 */
export const TIER1_REQUIRED_PARAMETERS = datasetPolicy.tier1RequiredParameters;

/**
 * Tier 2 IMPORTANT parameters (material properties)
 * Should have 80%+ completeness for quality
 * 
 * Note: Frontmatter uses 'material_characteristics' as the category name
 * containing all thermal, optical, mechanical, and chemical properties
 */
export const TIER2_IMPORTANT_PROPERTIES = datasetPolicy.tier2ImportantProperties;

/**
 * Tier 3 OPTIONAL parameters (safety, regulatory, vendor)
 */
export const TIER3_OPTIONAL_FIELDS = [
  'safetyConsiderations',
  'regulatoryStandards',
  'vendorRecommendations',
  'environmentalImpact'
] as const;

/**
 * Validate a single parameter has min/max values
 */
export function hasMinMaxValues(paramData: any): boolean {
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
export function calculateTier2Completeness(materialProperties: any): number {
  if (!materialProperties || typeof materialProperties !== 'object') {
    return 0;
  }
  
  let totalProperties = 0;
  let completeProperties = 0;
  
  // Check each category
  Object.entries(TIER2_IMPORTANT_PROPERTIES).forEach(([category, properties]) => {
    const snakeCaseCategory = category.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
    const categoryData = materialProperties[category] || materialProperties[snakeCaseCategory];
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
 * Calculate Tier 3 (optional fields) completeness percentage
 */
export function calculateTier3Completeness(data: any): number {
  if (!data || typeof data !== 'object') {
    return 0;
  }
  
  let completeFields = 0;
  
  TIER3_OPTIONAL_FIELDS.forEach(field => {
    if (data[field] && 
        (Array.isArray(data[field]) ? data[field].length > 0 : data[field])) {
      completeFields++;
    }
  });
  
  return Math.round((completeFields / TIER3_OPTIONAL_FIELDS.length) * 100);
}

/**
 * Validate Tier 1: All required machine settings parameters
 */
export function validateTier1(machineSettings: any): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  if (!machineSettings || typeof machineSettings !== 'object') {
    return {
      valid: false,
      missing: [...TIER1_REQUIRED_PARAMETERS],
      tier2Completeness: 0,
      warnings: [],
      reason: 'No machine settings provided'
    };
  }
  
  // Check all required parameters have min/max
  for (const param of TIER1_REQUIRED_PARAMETERS) {
    const paramData = machineSettings[param];
    if (!hasMinMaxValues(paramData)) {
      missing.push(param);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    tier2Completeness: 0,
    warnings,
    reason: missing.length > 0 
      ? `Missing required parameters: ${missing.join(', ')}`
      : undefined
  };
}

/**
 * Validate Tier 2: Material properties completeness
 */
export function validateTier2(materialProperties: any): ValidationResult {
  const warnings: string[] = [];
  const tier2Completeness = calculateTier2Completeness(materialProperties);
  
  // Add warnings for low Tier 2 completeness
  if (tier2Completeness > 0 && tier2Completeness < 80) {
    warnings.push(`Low material property completeness: ${tier2Completeness}%`);
  }
  
  return {
    valid: tier2Completeness >= 80,
    missing: [],
    tier2Completeness,
    warnings,
    reason: tier2Completeness < 80 
      ? `Material property completeness below 80%: ${tier2Completeness}%`
      : undefined
  };
}

/**
 * Validate Tier 3: Optional fields (informational only)
 */
export function validateTier3(data: any): ValidationResult {
  const tier3Completeness = calculateTier3Completeness(data);
  const warnings: string[] = [];
  
  if (tier3Completeness < 50) {
    warnings.push(`Optional fields completeness: ${tier3Completeness}%`);
  }
  
  return {
    valid: true, // Tier 3 is always valid (optional)
    missing: [],
    tier2Completeness: 0,
    warnings,
    reason: undefined
  };
}

/**
 * Validate complete dataset (all tiers)
 */
export function validateComplete(
  materialSlug: string,
  machineSettings: any,
  materialProperties?: any,
  additionalData?: any
): ValidationResult {
  const tier1 = validateTier1(machineSettings);
  
  // If Tier 1 fails, dataset is invalid
  if (!tier1.valid) {
    return tier1;
  }
  
  // Check Tier 2 if provided
  let tier2Completeness = 0;
  const warnings: string[] = [...tier1.warnings];
  
  if (materialProperties) {
    const tier2 = validateTier2(materialProperties);
    tier2Completeness = tier2.tier2Completeness;
    warnings.push(...tier2.warnings);
  }
  
  // Check Tier 3 (informational)
  if (additionalData) {
    const tier3 = validateTier3(additionalData);
    warnings.push(...tier3.warnings);
  }
  
  return {
    valid: true,
    missing: [],
    tier2Completeness,
    warnings,
    reason: undefined
  };
}

/**
 * Validate dataset for JSON-LD schema inclusion
 * Used by schema generators and SEO validation
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
  
  const machineSettings = data.machineSettings || data.frontmatter?.machineSettings || data.parameters;
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
  
  return validateComplete(materialName, machineSettings, materialProperties, data);
}

/**
 * Check if a material has a complete dataset (convenience function)
 */
export function hasCompleteDataset(material: any): boolean {
  const validation = validateDatasetForSchema(material);
  return validation.valid;
}
