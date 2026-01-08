/**
 * @file app/utils/relationshipHelpers.ts
 * @purpose Type-safe data access layer for relationship fields
 * @created December 24, 2025
 * @updated December 29, 2025 - Added backwards compatibility for relationship restructure
 * 
 * Provides centralized, null-safe access to relationship data with consistent
 * error handling and type safety. Eliminates fragile optional chaining patterns
 * scattered across layout files.
 * 
 * Supports both old structure (technical/safety/operational) and new structure
 * (identity/interactions/operational/safety/environmental/detection_monitoring/visual)
 * with automatic fallback during migration period.
 * 
 * @see docs/FRONTMATTER_RELATIONSHIPS_RESTRUCTURE.md
 */

import type { RelationshipSection } from '@/types';

/**
 * Path mapping from new structure to old structure for backwards compatibility
 * 
 * Maps new category.field paths to old category.field paths for fallback lookup
 */
const PATH_FALLBACK_MAP: Record<string, string[]> = {
  // Identity category (new) → technical/chemical_properties (old)
  'identity.material_properties': ['technical.material_properties', 'material_properties', 'materialProperties'],
  'identity.composition': ['technical.composition', 'composition'],
  'identity.characteristics': ['technical.characteristics', 'characteristics'],
  'identity.chemical_properties': ['chemical_properties'],
  'identity.physical_properties': ['operational.physical_properties', 'physical_properties'],
  
  // Interactions category (new) → technical/operational (old)
  'interactions.contaminated_by': ['technical.contaminated_by', 'contaminated_by'],
  'interactions.affects_materials': ['technical.affects_materials', 'affects_materials', 'found_on_materials'],
  'interactions.produces_compounds': ['technical.produces_compounds', 'produces_compounds'],
  'interactions.contamination': ['technical.contamination', 'contamination'],
  'interactions.works_on_materials': ['technical.works_on_materials', 'works_on_materials'],
  'interactions.removes_contaminants': ['technical.removes_contaminants', 'removes_contaminants'],
  'interactions.produced_from_contaminants': ['operational.produced_from_contaminants', 'produced_from_contaminants'],
  'interactions.produced_from_materials': ['operational.produced_from_materials', 'produced_from_materials'],
  
  // Operational category (mostly unchanged)
  'operational.machine_settings': ['technical.machine_settings', 'machine_settings'],
  'operational.common_challenges': ['operational.common_challenges', 'technical.common_challenges', 'common_challenges'],
  'operational.sources_in_laser_cleaning': ['technical.sources_in_laser_cleaning', 'sources_in_laser_cleaning'],
  'operational.typical_concentration_range': ['technical.typical_concentration_range', 'typical_concentration_range'],
  
  // Detection & Monitoring category (new) → technical/detection_monitoring (old)
  'detection_monitoring.detection_methods': ['technical.detection_methods', 'detection_monitoring.detection_methods', 'detection_methods'],
  'detection_monitoring.sensor_types': ['detection_monitoring.sensor_types', 'sensor_types'],
  'detection_monitoring.alarm_setpoints': ['detection_monitoring.alarm_setpoints', 'alarm_setpoints'],
  
  // Safety category (mostly unchanged)
  'safety.health_effects_keywords': ['safety.health_effects_keywords', 'health_effects_keywords'],
  'safety.health_effects': ['safety.health_effects', 'health_effects'],
  'safety.exposure_guidelines': ['safety.exposure_guidelines', 'exposure_guidelines'],
  'safety.exposure_limits': ['safety.exposure_limits', 'exposure_limits'],
  'safety.first_aid': ['safety.first_aid', 'first_aid'],
  'safety.monitoring_required': ['safety.monitoring_required', 'monitoring_required'],
  'safety.regulatory_standards': ['safety.regulatory_standards', 'regulatory_standards', 'regulatory'],
  'safety.emergency_response': ['emergency_response', 'safety.emergency_response'],
  'safety.ppe_requirements': ['safety.ppe_requirements', 'emergency_response.ppe_requirements', 'ppe_requirements'],
  
  // Environmental category (new)
  'environmental.environmental_impact': ['environmental_impact'],
  'environmental.aquatic_toxicity': ['environmental_impact.aquatic_toxicity'],
  'environmental.biodegradability': ['environmental_impact.biodegradability'],
  
  // Visual category (new)
  'visual.appearance_on_categories': ['visual_characteristics', 'appearance_on_categories'],
  'visual.visual_characteristics': ['visual_characteristics'],
};

/**
 * Structured return type for relationship sections
 */
export interface RelationshipSectionData<T = any> {
  items: T[];
  metadata: RelationshipSection;
  presentation?: 'card' | 'badge' | 'list' | 'inline' | 'banner' | 'descriptive';
}

/**
 * Helper to navigate nested path
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Safely access a relationship section from nested object structure
 * 
 * BACKWARDS COMPATIBLE: Automatically tries fallback paths for old structure
 * 
 * @param relationships - The root relationships object from metadata
 * @param path - Dot-notation path to the section (e.g., 'identity.material_properties' or 'technical.material_properties')
 * @returns Structured data with items and metadata, or null if path doesn't exist
 * 
 * @example
 * ```typescript
 * // New structure (preferred)
 * const materialProps = getRelationshipSection(
 *   relationships, 
 *   'identity.material_properties'
 * );
 * 
 * // Old structure (backwards compatible)
 * const materialProps = getRelationshipSection(
 *   relationships, 
 *   'technical.material_properties'
 * );
 * 
 * if (materialProps) {
 *   // Type-safe access to items and metadata
 *   const { items, metadata } = materialProps;
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

  // Try the primary path first
  let current = getNestedValue(relationships, path);
  
  // If not found and path is in fallback map, try fallback paths
  if (!current || !Array.isArray(current.items)) {
    const fallbackPaths = PATH_FALLBACK_MAP[path];
    if (fallbackPaths) {
      for (const fallbackPath of fallbackPaths) {
        current = getNestedValue(relationships, fallbackPath);
        if (current && Array.isArray(current.items)) {
          break;
        }
      }
    }
  }

  // Validate the structure
  if (!current || typeof current !== 'object') {
    return null;
  }

  // Check for required items array
  if (!Array.isArray(current.items)) {
    return null;
  }

  // Check for _section metadata (REQUIRED - fail-fast if missing)
  const metadata = current._section as RelationshipSection | undefined;
  
  if (!metadata) {
    throw new Error(
      `Missing required _section metadata at path: ${path}. ` +
      `All relationship sections MUST have a _section block with sectionTitle, sectionDescription, icon, and order fields.`
    );
  }

  // Return structured data
  return {
    items: current.items as T[],
    metadata: metadata,
    presentation: current.presentation
  };
}

// No default metadata generation - all sections MUST have explicit _section blocks

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
    
    if (!metadata.sectionTitle) {
      errors.push(`Missing required field: sectionTitle in _section at ${path}`);
    }
    if (!metadata.sectionDescription) {
      errors.push(`Missing recommended field: sectionDescription in _section at ${path}`);
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

// ============================================================================
// SIMPLIFIED RELATIONSHIP ACCESSORS (P2 Normalization - Dec 29, 2025)
// ============================================================================

/**
 * Get contaminated_by relationship data with standardized fallback chain
 * 
 * Priority order:
 * 1. relationships.interactions.contaminated_by (canonical)
 * 2. relationships.technical.contaminated_by (fallback)
 * 3. relationships.contaminated_by (legacy)
 */
export function getContaminatedBy(metadata: any): any {
  const relationships = metadata?.relationships;
  return (
    relationships?.interactions?.contaminatedBy ||
    relationships?.interactions?.contaminated_by ||
    relationships?.technical?.contaminatedBy ||
    relationships?.technical?.contaminated_by ||
    relationships?.contaminatedBy ||
    relationships?.contaminated_by ||
    {}
  );
}

/**
 * Get regulatory standards with standardized fallback chain
 * 
 * Priority order:
 * 1. relationships.safety.regulatory_standards.items (canonical array)
 * 2. relationships.regulatory.items (fallback array)
 * 3. relationships.regulatory_standards.items (legacy array)
 * 4. relationships.regulatory_standards (legacy direct)
 * 5. relationships.regulatory (legacy direct)
 * 
 * Maps frontmatter structure to component format:
 * - title → name
 * - metadata.orgFullName → description (cleaner than markdown content)
 * - metadata.url → url
 * - metadata.image → image
 */
export function getRegulatoryStandards(metadata: any): any[] {
  const relationships = metadata?.relationships;
  const rawStandards = (
    relationships?.safety?.regulatory_standards?.items ||
    relationships?.regulatory?.items ||
    relationships?.regulatory_standards?.items ||
    relationships?.regulatory_standards ||
    relationships?.regulatory ||
    []
  );
  
  // Ensure rawStandards is an array before mapping
  const standardsArray = Array.isArray(rawStandards) ? rawStandards : [];
  
  // Map frontmatter structure to component format
  return standardsArray.map((std: any) => {
    // If already in correct format, return as-is
    if (std.name && std.description && !std.metadata) {
      return std;
    }
    
    // Map new frontmatter structure to component format
    // Use orgFullName as description (cleaner than markdown content field)
    // Use organization abbreviation for search (e.g., "FDA" instead of full title)
    return {
      name: std.title || std.name || '',
      description: std.metadata?.orgFullName || std.description || '',
      url: std.metadata?.url || std.url || '',
      image: std.metadata?.image || std.image || '',
      longName: std.metadata?.orgFullName || std.longName || '',
      searchTerm: std.metadata?.organization || std.id || std.title || '',
      id: std.id || '',
      ...std
    };
  });
}

/**
 * Get hero image URL with standardized fallback chain
 * 
 * Priority order:
 * 1. metadata.images.hero.url (canonical)
 * 2. metadata.hero.url (deprecated but supported)
 * 3. metadata.image (legacy string field)
 */
export function getHeroImageUrl(metadata: any): string | undefined {
  return (
    metadata?.images?.hero?.url ||
    metadata?.hero?.url ||
    metadata?.image ||
    undefined
  );
}

/**
 * Get hero image alt text with standardized fallback chain
 * 
 * Priority order:
 * 1. metadata.images.hero.alt (canonical)
 * 2. metadata.hero.alt (deprecated but supported)
 * 3. Fallback to title-based text
 */
export function getHeroImageAlt(metadata: any): string {
  return (
    metadata?.images?.hero?.alt ||
    metadata?.hero?.alt ||
    (metadata?.title ? `Hero image for ${metadata.title}` : 'Hero image')
  );
}

// ============================================================================
// P3 NORMALIZATION: DESCRIPTION & CONTENT TYPE (Dec 29, 2025)
// ============================================================================

/**
 * Get page description with standardized fallback chain
 * 
 * Priority order:
 * 1. metadata.page_description (canonical)
 * 2. metadata.contamination_description (contaminant-specific)
 * 3. metadata.description (deprecated)
 */
export function getDescription(metadata: any): string | undefined {
  return (
    metadata?.page_description ||
    metadata?.contamination_description ||
    metadata?.description ||
    undefined
  );
}

/**
 * Get content type with standardized fallback chain
 * 
 * Priority order:
 * 1. metadata.content_type (canonical)
 * 2. metadata.articleType (deprecated)
 */
export function getContentType(metadata: any): string | undefined {
  return (
    metadata?.content_type ||
    metadata?.articleType ||
    undefined
  );
}
