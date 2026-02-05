// app/utils/relationshipCardGridFactory.ts
// Factory for creating CardGrid section configurations from relationship data

import { CardGrid } from '@/app/components/CardGrid';
import type { SectionConfig } from '@/types';
import type { EntityType } from './metadataExtractor';
import { toCardGridItems } from './metadataExtractor';

export interface RelationshipCardGridOptions {
  /**
   * Relationship data from frontmatter (includes items and _section)
   */
  relationshipData: any;
  
  /**
   * Entity type for metadata extraction
   */
  entityType: EntityType;
  
  /**
   * Entity name for fallback titles (e.g., "Aluminum", "Rust")
   */
  entityName: string;
  
  /**
   * Default title if not in _section metadata
   */
  defaultTitle?: string;
  
  /**
   * Default description if not in _section metadata
   */
  defaultDescription?: string;
}

/**
 * Create a CardGrid section configuration from relationship data
 * 
 * This factory handles the common pattern of:
 * 1. Extracting items from relationship data
 * 2. Transforming items to CardGrid format
 * 3. Extracting section metadata
 * 4. Creating section configuration
 * 
 * @param options - Configuration options
 * @returns SectionConfig for BaseContentLayout
 */
export function createRelationshipCardGrid(
  options: RelationshipCardGridOptions
): SectionConfig {
  const {
    relationshipData,
    entityType,
    entityName,
    defaultTitle,
    defaultDescription,
  } = options;

  const items = relationshipData?.items || [];
  const section = relationshipData?._section || {};

  return {
    component: CardGrid,
    condition: items.length > 0,
    props: {
      items: toCardGridItems(items, entityType),
      title: section.sectionTitle || defaultTitle || `Related ${entityType}s`,
      description: section.sectionDescription || defaultDescription || `${entityType} information for ${entityName}`,
      icon: section.icon,
      variant: 'relationship' as const,
    },
  };
}

/**
 * Create multiple CardGrid sections from relationship object
 * 
 * Convenience function for creating multiple CardGrid sections
 * from a relationships object with multiple keys.
 * 
 * @param relationships - Full relationships object
 * @param configs - Array of configuration objects
 * @returns Array of SectionConfig objects
 */
export function createRelationshipCardGrids(
  relationships: any,
  configs: Array<{
    category: string;
    key: string;
    entityType: EntityType;
    entityName: string;
    defaultTitle?: string;
    defaultDescription?: string;
  }>
): SectionConfig[] {
  return configs
    .map(config => {
      const relationshipData = relationships?.[config.category]?.[config.key];
      if (!relationshipData?.items?.length) return null;

      return createRelationshipCardGrid({
        relationshipData,
        entityType: config.entityType,
        entityName: config.entityName,
        defaultTitle: config.defaultTitle,
        defaultDescription: config.defaultDescription,
      });
    })
    .filter(Boolean) as SectionConfig[];
}
