// app/utils/normalizers.ts
// Data normalization functions for content processing

import type { CategoryData, TimestampData, RegulatoryStandard } from '@/types';

/**
 * Normalize category and subcategory fields to lowercase with hyphens
 * This ensures consistency across all frontmatter files regardless of original casing
 */
export function normalizeCategoryFields<T extends CategoryData>(data: T | null | undefined): T | null | undefined {
  if (!data) return data;
  
  // Valid category mappings from TitleCase/mixed to lowercase
  const CATEGORY_MAP: Record<string, string> = {
    'Metal': 'metal',
    'Ceramic': 'ceramic',
    'Composite': 'composite',
    'Polymer': 'polymer',
    'Wood': 'wood',
    'Stone': 'stone',
    'Glass': 'glass',
    'Rare-Earth': 'rare-earth',
    'Natural': 'natural',
    'Semiconductor': 'semiconductor',
    'Masonry': 'masonry',
    'Plastic': 'plastic'
  };
  
  // Normalize category
  if (data.category) {
    // First try exact mapping
    if (CATEGORY_MAP[data.category]) {
      data.category = CATEGORY_MAP[data.category];
    } else if (data.category !== data.category.toLowerCase()) {
      // Otherwise just lowercase it
      data.category = data.category.toLowerCase();
    }
  }
  
  // Normalize subcategory (ensure lowercase with hyphens)
  if (data.subcategory && typeof data.subcategory === 'string') {
    data.subcategory = data.subcategory.toLowerCase();
  }
  
  return data;
}

/**
 * Normalize all text fields to handle unicode escape sequences
 */
export function normalizeAllTextFields<T>(data: T | null | undefined): T | null | undefined {
  if (!data) return data;
  
  const normalize = (obj: unknown): unknown => {
    if (typeof obj === 'string') {
      return obj
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(normalize);
    }
    
    if (obj && typeof obj === 'object') {
      const normalized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        normalized[key] = normalize(value);
      }
      return normalized as T;
    }
    
    return obj;
  };
  
  return normalize(data) as T;
}

/**
 * Normalize freshness timestamps (datePublished, dateModified)
 */
export function normalizeFreshnessTimestamps<T extends TimestampData>(data: T | null | undefined): T | null | undefined {
  if (!data) return data;
  
  const now = new Date().toISOString();
  
  // If no datePublished, set it to now
  if (!data.datePublished) {
    data.datePublished = now;
  }
  
  // If no dateModified, set it to datePublished or now
  if (!data.dateModified) {
    data.dateModified = data.datePublished || now;
  }
  
  return data;
}

/**
 * Normalize regulatory standards to resolve "Unknown" names
 */
export function normalizeRegulatoryStandards(standards: RegulatoryStandard[]): RegulatoryStandard[] {
  if (!Array.isArray(standards)) return standards;
  
  return standards.map(standard => {
    if (typeof standard === 'object' && standard !== null && standard.name === 'Unknown') {
      // Try to infer name from other fields
      if (standard.id) {
        return { ...standard, name: standard.id };
      }
      if (standard.abbreviation) {
        return { ...standard, name: standard.abbreviation };
      }
    }
    return standard;
  });
}

/**
 * Normalize numeric values to handle edge cases
 * - Converts scientific notation strings to numbers (e.g., "2.65e-08" → 2.65e-08)
 * - Handles NaN, Infinity, and extremely small values (< 1e-20)
 * - Preserves valid numbers as-is
 */
export function normalizeNumericValue(value: unknown): number | null {
  // Handle null/undefined
  if (value == null) return null;
  
  // Already a valid number
  if (typeof value === 'number') {
    if (!isFinite(value)) return null; // NaN, Infinity, -Infinity
    if (Math.abs(value) < 1e-20) return null; // Extremely small values
    return value;
  }
  
  // Try to parse string values
  if (typeof value === 'string') {
    // Trim whitespace
    const trimmed = value.trim();
    if (trimmed === '') return null;
    
    // Try parsing as number (handles scientific notation)
    const parsed = Number(trimmed);
    
    if (!isFinite(parsed)) return null; // NaN, Infinity
    if (Math.abs(parsed) < 1e-20) return null; // Extremely small values
    
    return parsed;
  }
  
  // For any other type, return null
  return null;
}

/**
 * Normalize property names from snake_case to camelCase
 * This bridges the gap between legacy YAML frontmatter (snake_case) and application code (camelCase)
 * 
 * NOTE: As of January 2026, this is the SINGLE transformation point for snake_case → camelCase.
 * YAML files keep snake_case (external format), TypeScript uses camelCase (internal format).
 * Transformation happens at boundary for clean separation of concerns.
 * 
 * Converts specific top-level property names:
 * - full_path → fullPath
 * - content_type → contentType
 * - page_description → pageDescription
 * - meta_description → metaDescription
 * - date_published → datePublished
 * - machine_settings → machineSettings
 * - material_properties → materialProperties
 * - laser_properties → laserProperties
 * - safety_data → safetyData
 * - removal_by_material → removalByMaterial
 * - visual_characteristics → visualCharacteristics
 * - regulatory_standards → regulatoryStandards
 */
export function normalizePropertyNames<T>(data: T | null | undefined): T | null | undefined {
  if (!data || typeof data !== 'object') return data;
  
  const propertyMap: Record<string, string> = {
    // Structural/metadata fields (Priority: Jan 2026 normalization)
    'full_path': 'fullPath',
    'content_type': 'contentType',
    'schema_version': 'schemaVersion',
    'page_description': 'pageDescription',
    'page_title': 'pageTitle',
    'meta_description': 'metaDescription',
    'contamination_description': 'contaminationDescription',
    'date_published': 'datePublished',
    'date_modified': 'dateModified',
    
    // Property groups (Existing)
    'machine_settings': 'machineSettings',
    'material_properties': 'materialProperties',
    'laser_properties': 'laserProperties',
    'safety_data': 'safetyData',
    'removal_by_material': 'removalByMaterial',
    'visual_characteristics': 'visualCharacteristics',
    'regulatory_standards': 'regulatoryStandards'
  };
  
  const result = { ...data } as Record<string, unknown>;
  
  for (const [snakeCase, camelCase] of Object.entries(propertyMap)) {
    if (snakeCase in result) {
      // Move snake_case to camelCase
      result[camelCase] = result[snakeCase];
      // Keep snake_case for backward compatibility during transition
      // Will be removed in Phase 2 cleanup (not this phase)
    }
  }
  
  return result as T;
}

/**
 * Recursively normalize all numeric values in nested property objects
 * Commonly used for materialProperties, machineSettings, etc.
 */
export function normalizeNumericValues<T>(data: T | null | undefined): T | null | undefined {
  if (!data) return data;
  
  const normalize = (obj: unknown): unknown => {
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(normalize);
    }
    
    // Handle objects
    if (obj && typeof obj === 'object') {
      const normalized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Check if the value looks like a property object with min/value/max/unit
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const propObj = value as Record<string, unknown>;
          
          // If it has min/value/max fields, normalize them
          if ('min' in propObj || 'value' in propObj || 'max' in propObj) {
            const normalizedMin = propObj.min !== undefined ? normalizeNumericValue(propObj.min) : undefined;
            const normalizedValue = propObj.value !== undefined ? normalizeNumericValue(propObj.value) : undefined;
            const normalizedMax = propObj.max !== undefined ? normalizeNumericValue(propObj.max) : undefined;
            
            const result: Record<string, unknown> = { ...propObj };
            
            // Only set normalized values if they're not null (normalization succeeded)
            if (normalizedMin !== null && normalizedMin !== undefined) {
              result.min = normalizedMin;
            }
            if (normalizedValue !== null && normalizedValue !== undefined) {
              result.value = normalizedValue;
            }
            if (normalizedMax !== null && normalizedMax !== undefined) {
              result.max = normalizedMax;
            }
            
            normalized[key] = result;
          } else {
            // Recursively normalize nested objects
            normalized[key] = normalize(value);
          }
        } else {
          // Pass through other values as-is
          normalized[key] = value;
        }
      }
      
      return normalized as T;
    }
    
    // Return primitives as-is
    return obj;
  };
  
  return normalize(data) as T;
}
