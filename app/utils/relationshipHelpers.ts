/**
 * @file app/utils/relationshipHelpers.ts
 * @purpose Type-safe data access layer for relationship fields
 * @created December 24, 2025
 * 
 * Provides centralized, null-safe access to relationship data with consistent
 * error handling and type safety. Eliminates fragile optional chaining patterns
 * scattered across layout files.
 */

import type { RelationshipSection } from '@/types';

/**
 * Structured return type for relationship sections
 */
export interface RelationshipSectionData<T = any> {
  items: T[];
  metadata: RelationshipSection;
  presentation?: 'card' | 'badge' | 'list' | 'inline' | 'banner' | 'descriptive';
}

/**
 * Safely access a relationship section from nested object structure
 * 
 * @param relationships - The root relationships object from metadata
 * @param path - Dot-notation path to the section (e.g., 'safety.exposure_limits')
 * @returns Structured data with items and metadata, or null if path doesn't exist
 * 
 * @example
 * ```typescript
 * const exposureLimits = getRelationshipSection(
 *   relationships, 
 *   'safety.exposure_limits'
 * );
 * 
 * if (exposureLimits) {
 *   // Type-safe access to items and metadata
 *   const { items, metadata } = exposureLimits;
 * }
 * ```
 */
export function getRelationshipSection<T = any>(
  relationships: any,
  path: string
): RelationshipSectionData<T> | null {
  if (!relationships || typeof relationships !== 'object') {
    return null;
  }

  // Navigate the path safely
  const parts = path.split('.');
  let current = relationships;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return null;
    }
    current = current[part];
  }

  // Validate the structure
  if (!current || typeof current !== 'object') {
    return null;
  }

  // Check for required items array
  if (!Array.isArray(current.items)) {
    return null;
  }

  // Check for _section metadata (optional but recommended)
  const metadata = current._section as RelationshipSection | undefined;

  // Return structured data
  return {
    items: current.items as T[],
    metadata: metadata || getDefaultMetadata(path),
    presentation: current.presentation
  };
}

/**
 * Generate default metadata for sections without _section block
 * Uses path to create reasonable defaults
 */
function getDefaultMetadata(path: string): RelationshipSection {
  const lastPart = path.split('.').pop() || path;
  
  // Convert snake_case to Title Case
  const title = lastPart
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title,
    description: undefined,
    order: 999, // Put at end if no order specified
    variant: 'default',
    icon: 'box'
  };
}

/**
 * Check if a relationship section exists and has items
 * 
 * @param relationships - The root relationships object
 * @param path - Dot-notation path to check
 * @returns true if section exists with non-empty items array
 * 
 * @example
 * ```typescript
 * if (hasRelationshipSection(relationships, 'safety.exposure_limits')) {
 *   // Section exists and has items
 * }
 * ```
 */
export function hasRelationshipSection(
  relationships: any,
  path: string
): boolean {
  const section = getRelationshipSection(relationships, path);
  return section !== null && section.items.length > 0;
}

/**
 * Get multiple relationship sections at once
 * Useful for batch operations
 * 
 * @param relationships - The root relationships object
 * @param paths - Array of dot-notation paths
 * @returns Map of path to section data (null if not found)
 * 
 * @example
 * ```typescript
 * const sections = getMultipleRelationshipSections(relationships, [
 *   'safety.exposure_limits',
 *   'safety.ppe_requirements',
 *   'physical_properties'
 * ]);
 * 
 * sections['safety.exposure_limits']?.items.forEach(...);
 * ```
 */
export function getMultipleRelationshipSections<T = any>(
  relationships: any,
  paths: string[]
): Record<string, RelationshipSectionData<T> | null> {
  const result: Record<string, RelationshipSectionData<T> | null> = {};
  
  for (const path of paths) {
    result[path] = getRelationshipSection<T>(relationships, path);
  }
  
  return result;
}

/**
 * Get all relationship sections (both grouped and top-level)
 * Useful for dynamic rendering
 * 
 * @param relationships - The root relationships object
 * @returns Array of section data with path information
 * 
 * @example
 * ```typescript
 * const allSections = getAllRelationshipSections(relationships);
 * allSections.forEach(({ path, items, metadata }) => {
 *   // Render each section dynamically
 * });
 * ```
 */
export function getAllRelationshipSections(
  relationships: any
): Array<RelationshipSectionData & { path: string }> {
  if (!relationships || typeof relationships !== 'object') {
    return [];
  }

  const sections: Array<RelationshipSectionData & { path: string }> = [];

  function traverse(obj: any, pathPrefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (!value || typeof value !== 'object') continue;

      const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;

      // If it has items array, it's a section
      if (typeof value === 'object' && value !== null && 'items' in value && Array.isArray((value as any).items)) {
        const sectionData = getRelationshipSection(relationships, currentPath);
        if (sectionData) {
          sections.push({
            ...sectionData,
            path: currentPath
          });
        }
      } else {
        // Otherwise, might be a group - recurse
        traverse(value, currentPath);
      }
    }
  }

  traverse(relationships);

  // Sort by metadata order
  return sections.sort((a, b) => {
    const orderA = a.metadata.order ?? 999;
    const orderB = b.metadata.order ?? 999;
    return orderA - orderB;
  });
}

/**
 * Validate that a section has proper structure
 * Used for development-time checks
 * 
 * @param relationships - The root relationships object
 * @param path - Dot-notation path to validate
 * @returns Validation result with errors if any
 */
export function validateRelationshipSection(
  relationships: any,
  path: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const section = getRelationshipSection(relationships, path);
  
  if (!section) {
    errors.push(`Section not found at path: ${path}`);
    return { isValid: false, errors };
  }

  // Check for _section metadata
  const parts = path.split('.');
  let current = relationships;
  for (const part of parts) {
    current = current[part];
  }

  if (!current._section) {
    errors.push(`Missing _section metadata at path: ${path}`);
  } else {
    const metadata = current._section;
    
    if (!metadata.title) {
      errors.push(`Missing required field: title in _section at ${path}`);
    }
    if (!metadata.description) {
      errors.push(`Missing recommended field: description in _section at ${path}`);
    }
    if (typeof metadata.order !== 'number') {
      errors.push(`Missing required field: order in _section at ${path}`);
    }
    if (!metadata.icon) {
      errors.push(`Missing required field: icon in _section at ${path}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
