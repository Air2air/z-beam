/**
 * Entity Lookup Utilities
 * 
 * Functions for loading entity frontmatter and resolving card data with context.
 * Supports ID-based lookup across materials, compounds, contaminants, and settings.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { EntityFrontmatter, CardVariant, CardSchema } from '@/types';

// ============================================
// ENTITY LOOKUP
// ============================================

/**
 * Content type directories for entity lookup
 */
const CONTENT_TYPE_DIRS: Record<string, string> = {
  materials: 'frontmatter/materials',
  compounds: 'frontmatter/compounds',
  contaminants: 'frontmatter/contaminants',
  settings: 'frontmatter/settings',
};

/**
 * Load entity frontmatter by ID
 * Searches across all content types to find the entity
 * 
 * @param entityId - Entity identifier (e.g., 'steel-laser-cleaning', 'acrolein-compound')
 * @param contentType - Optional content type hint to speed up lookup
 * @returns Entity frontmatter or null if not found
 */
export function loadEntityFrontmatter(
  entityId: string,
  contentType?: string
): EntityFrontmatter | null {
  // If content type provided, try that first
  if (contentType && CONTENT_TYPE_DIRS[contentType]) {
    const entity = tryLoadEntity(CONTENT_TYPE_DIRS[contentType], entityId);
    if (entity) return entity;
  }
  
  // Search all content types
  for (const dir of Object.values(CONTENT_TYPE_DIRS)) {
    const entity = tryLoadEntity(dir, entityId);
    if (entity) return entity;
  }
  
  console.warn(`Entity not found: ${entityId}`);
  return null;
}

/**
 * Try to load entity from specific directory
 */
function tryLoadEntity(dir: string, entityId: string): EntityFrontmatter | null {
  try {
    const filePath = path.join(process.cwd(), dir, `${entityId}.yaml`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const frontmatter = yaml.load(fileContents) as EntityFrontmatter;
    
    return frontmatter;
  } catch (error) {
    // File doesn't exist or parse error - continue searching
    return null;
  }
}

// ============================================
// CARD DATA RESOLUTION
// ============================================

/**
 * Resolve card data for entity with context fallback
 * 
 * @param entityId - Entity identifier
 * @param context - Card context (e.g., 'contamination_context', 'default')
 * @param contentType - Optional content type hint
 * @returns Card variant data or null if entity/card not found
 */
export function resolveCardData(
  entityId: string,
  context: string = 'default',
  contentType?: string
): CardVariant | null {
  const entity = loadEntityFrontmatter(entityId, contentType);
  
  if (!entity || !entity.card) {
    console.warn(`No card data found for entity: ${entityId}`);
    return null;
  }
  
  // Try requested context, fallback to default
  const cardVariant = entity.card[context] || entity.card.default;
  
  if (!cardVariant) {
    console.warn(`No card variant found for entity ${entityId} with context ${context}`);
    return null;
  }
  
  return cardVariant;
}

/**
 * Resolve URL from entity's fullPath
 * 
 * @param entityId - Entity identifier
 * @param contentType - Optional content type hint
 * @returns URL path from entity's fullPath field
 */
export function resolveEntityUrl(
  entityId: string,
  contentType?: string
): string {
  const entity = loadEntityFrontmatter(entityId, contentType);
  
  if (!entity || !entity.fullPath) {
    console.warn(`No fullPath found for entity: ${entityId}`);
    return '#';
  }
  
  return entity.fullPath;
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Load multiple entities in one operation
 * More efficient than calling loadEntityFrontmatter multiple times
 * 
 * @param entityIds - Array of entity identifiers
 * @param contentType - Optional content type hint (applies to all)
 * @returns Map of entityId to EntityFrontmatter
 */
export function loadEntitiesBatch(
  entityIds: string[],
  contentType?: string
): Map<string, EntityFrontmatter> {
  const entities = new Map<string, EntityFrontmatter>();
  
  for (const entityId of entityIds) {
    const entity = loadEntityFrontmatter(entityId, contentType);
    if (entity) {
      entities.set(entityId, entity);
    }
  }
  
  return entities;
}

/**
 * Resolve card data for multiple entities
 * 
 * @param entityIds - Array of entity identifiers
 * @param context - Card context for all entities
 * @param contentType - Optional content type hint
 * @returns Map of entityId to CardVariant
 */
export function resolveCardDataBatch(
  entityIds: string[],
  context: string = 'default',
  contentType?: string
): Map<string, CardVariant> {
  const cardData = new Map<string, CardVariant>();
  
  const entities = loadEntitiesBatch(entityIds, contentType);
  
  for (const [entityId, entity] of entities) {
    if (entity.card) {
      const variant = entity.card[context] || entity.card.default;
      if (variant) {
        cardData.set(entityId, variant);
      }
    }
  }
  
  return cardData;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if entity exists
 * 
 * @param entityId - Entity identifier
 * @param contentType - Optional content type hint
 * @returns true if entity exists, false otherwise
 */
export function entityExists(
  entityId: string,
  contentType?: string
): boolean {
  return loadEntityFrontmatter(entityId, contentType) !== null;
}

/**
 * Validate all entity IDs in relationship items
 * Returns list of orphaned IDs (entities that don't exist)
 * 
 * @param entityIds - Array of entity identifiers to validate
 * @param contentType - Optional content type hint
 * @returns Array of orphaned entity IDs
 */
export function findOrphanedIds(
  entityIds: string[],
  contentType?: string
): string[] {
  const orphaned: string[] = [];
  
  for (const entityId of entityIds) {
    if (!entityExists(entityId, contentType)) {
      orphaned.push(entityId);
    }
  }
  
  return orphaned;
}

/**
 * Validate card schema structure
 * 
 * @param card - Card schema to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateCardSchema(card: CardSchema): string[] {
  const errors: string[] = [];
  
  // Must have default variant
  if (!card.default) {
    errors.push('Missing required "default" variant');
    return errors;
  }
  
  // Validate each variant
  for (const [variantName, variant] of Object.entries(card)) {
    if (!variant) continue;
    
    // Required fields
    if (!variant.heading) {
      errors.push(`Variant "${variantName}" missing required field "heading"`);
    }
    if (!variant.subtitle) {
      errors.push(`Variant "${variantName}" missing required field "subtitle"`);
    }
    if (!variant.badge) {
      errors.push(`Variant "${variantName}" missing required field "badge"`);
    } else {
      if (!variant.badge.text) {
        errors.push(`Variant "${variantName}" badge missing "text"`);
      }
      if (!variant.badge.variant) {
        errors.push(`Variant "${variantName}" badge missing "variant"`);
      }
      const validBadgeVariants = ['success', 'warning', 'danger', 'info', 'technical'];
      if (variant.badge.variant && !validBadgeVariants.includes(variant.badge.variant)) {
        errors.push(`Variant "${variantName}" has invalid badge variant: ${variant.badge.variant}`);
      }
    }
    if (!variant.metric) {
      errors.push(`Variant "${variantName}" missing required field "metric"`);
    } else {
      if (!variant.metric.value) {
        errors.push(`Variant "${variantName}" metric missing "value"`);
      }
      if (!variant.metric.legend) {
        errors.push(`Variant "${variantName}" metric missing "legend"`);
      }
    }
    if (!variant.severity) {
      errors.push(`Variant "${variantName}" missing required field "severity"`);
    } else {
      const validSeverities = ['critical', 'high', 'moderate', 'low'];
      if (!validSeverities.includes(variant.severity)) {
        errors.push(`Variant "${variantName}" has invalid severity: ${variant.severity}`);
      }
    }
  }
  
  return errors;
}
