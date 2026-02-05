// app/utils/metadataExtractor.ts
// Smart metadata extraction for different entity types

export type EntityType = 'material' | 'contaminant' | 'compound' | 'setting';

/**
 * Extract metadata for card display based on entity type
 * @param item - Relationship item with denormalized data
 * @param type - Entity type (material, contaminant, compound, setting)
 * @returns Metadata object for CardGrid display
 */
export function extractCardMetadata(
  item: any,
  type: EntityType
): Record<string, any> {
  const extractors: Record<EntityType, (item: any) => Record<string, any>> = {
    material: (item) => ({
      frequency: item.frequency,
      difficulty: item.difficulty,
    }),
    contaminant: (item) => ({
      severity: item.severity,
      category: item.category,
    }),
    compound: (item) => ({
      phase: item.phase,
      hazard_level: item.hazardLevel,
    }),
    setting: (item) => ({
      application: item.application,
      suitability: item.suitability,
    }),
  };

  return extractors[type]?.(item) || {};
}

/**
 * Transform denormalized relationship item to CardGrid item
 * @param item - Relationship item with full denormalized data
 * @param type - Entity type for metadata extraction
 * @returns CardGrid-compatible item
 */
export function toCardGridItem(item: any, type: EntityType) {
  return {
    slug: item.id,
    href: item.url,
    title: item.title || item.name,
    imageUrl: item.image,
    imageAlt: item.title || item.name,
    category: item.category,
    metadata: extractCardMetadata(item, type),
  };
}

/**
 * Transform array of denormalized items to CardGrid items
 * @param items - Array of relationship items
 * @param type - Entity type for metadata extraction
 * @returns Array of CardGrid-compatible items
 */
export function toCardGridItems(items: any[], type: EntityType) {
  return items.map(item => toCardGridItem(item, type));
}
