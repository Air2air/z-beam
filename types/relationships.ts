// types/relationships.ts
// Consolidated relationship types and accessor utilities

export type RelationshipCategory = 
  | 'contaminatedBy'
  | 'detectionMonitoring'
  | 'interactions'
  | 'safety'
  | 'operational'
  | 'technical'
  | 'discovery'
  | 'descriptive'
  | 'visual'
  | 'environmental'
  | 'identity';

export type RelationshipKey = 
  | '_metadata'
  | 'chemicalProperties'
  | 'commonChallenges'
  | 'contaminatedBy'
  | 'detectionMonitoring'
  | 'emergencyResponse'
  | 'environmentalImpact'
  | 'exposureLimits'
  | 'fireExplosionRisk'
  | 'fumesGenerated'
  | 'healthEffects'
  | 'laserMaterialInteraction'
  | 'machineSettings'
  | 'particulateGeneration'
  | 'physicalProperties'
  | 'reactivity'
  | 'regulatoryClassification'
  | 'removesContaminants'
  | 'storageRequirements'
  | 'substrateCompatibilityWarnings'
  | 'synonymsIdentifiers'
  | 'toxicGasRisk'
  | 'ventilationRequirements'
  | 'visibilityHazard'
  | 'worksOnMaterials'
  // Material relationships
  | 'relatedMaterials'
  // Contaminant relationships
  | 'producesCompounds'
  | 'affectsMaterials'
  | 'appearanceOnCategories'
  // Compound relationships
  | 'producedFromContaminants'
  | 'producedFromMaterials'
  // Shared relationships
  | 'regulatoryStandards'
  | 'industryApplications'
  | 'ppeRequirements'
  | 'visualCharacteristics'
  | 'laserProperties';

export interface SectionMetadata {
  // Displayed in active section containers
  sectionTitle?: string;
  sectionDescription?: string;

  // Non-display metadata retained in frontmatter/context
  // (do not render sectionMetadata text in active section containers)
  icon?: string;
  order?: number;
  variant?: string;
  sectionMetadata?: string;
}

export interface RelationshipData<T = any> {
  presentation?: 'card' | 'descriptive' | 'list';
  items?: T[];
  _section?: SectionMetadata;
}

// Generic denormalized relationship item (base interface)
export interface DenormalizedRelationshipItem {
  id: string;
  name?: string;
  title?: string;
  category: string;
  subcategory?: string;
  url: string;
  image: string;
  description?: string;
}

// Domain-specific relationship types
export interface MaterialRelationshipItem extends DenormalizedRelationshipItem {
  frequency?: string;
  difficulty?: string;
}

// Application discovery.relatedMaterials contract (no item-level description)
export interface ApplicationRelatedMaterialItem extends Omit<DenormalizedRelationshipItem, 'description'> {}

// Application interactions.contaminatedBy contract (no item-level description)
export interface ApplicationContaminantItem extends Omit<DenormalizedRelationshipItem, 'description'> {}

export interface CompoundRelationshipItem extends DenormalizedRelationshipItem {
  phase?: string;
  hazardLevel?: string;
  concentration?: string;
}

export interface ContaminantRelationshipItem extends DenormalizedRelationshipItem {
  severity?: string;
  commonness?: string;
}

/**
 * Get relationship items from nested structure
 * @param relationships - Full relationships object from frontmatter
 * @param category - Relationship category (interactions, safety, etc.)
 * @param key - Specific relationship key (contaminatedBy, producesCompounds, etc.)
 * @returns Array of relationship items or empty array
 */
export function getRelationshipItems<T = any>(
  relationships: any,
  category: RelationshipCategory,
  key: RelationshipKey
): T[] | undefined {
  const items = relationships?.[category]?.[key]?.items;
  return Array.isArray(items) ? (items as T[]) : undefined;
}

/**
 * Get relationship section metadata
 * @param relationships - Full relationships object from frontmatter
 * @param category - Relationship category
 * @param key - Specific relationship key
 * @returns Section metadata or undefined
 */
export function getRelationshipSection(
  relationships: any,
  category: RelationshipCategory,
  key: RelationshipKey
): SectionMetadata | undefined {
  return relationships?.[category]?.[key]?._section;
}

/**
 * Get full relationship data (items + section)
 * @param relationships - Full relationships object from frontmatter
 * @param category - Relationship category
 * @param key - Specific relationship key
 * @returns Relationship data object
 */
export function getRelationshipData<T = any>(
  relationships: any,
  category: RelationshipCategory,
  key: RelationshipKey
): RelationshipData<T> | undefined {
  return relationships?.[category]?.[key];
}

/**
 * Check if relationship has items
 * @param relationships - Full relationships object
 * @param category - Relationship category
 * @param key - Specific relationship key
 * @returns True if items exist and have length > 0
 */
export function hasRelationshipItems(
  relationships: any,
  category: RelationshipCategory,
  key: RelationshipKey
): boolean {
  const items = getRelationshipItems(relationships, category, key);
  return !!items && items.length > 0;
}
