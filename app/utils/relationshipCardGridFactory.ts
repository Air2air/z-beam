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
   * Entity name for metadata extraction context
   */
  entityName: string;
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
  } = options;

  const items = relationshipData?.items;
  const section = relationshipData?._section;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`createRelationshipCardGrid: missing or empty relationship items for ${entityType}:${entityName}`);
  }

  if (!section?.sectionTitle || !section?.sectionDescription) {
    throw new Error(`createRelationshipCardGrid: missing _section.sectionTitle/sectionDescription for ${entityType}:${entityName}`);
  }

  return {
    component: CardGrid,
    condition: true,
    props: {
      items: toCardGridItems(items, entityType),
      title: section.sectionTitle,
      description: section.sectionDescription,
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
      });
    })
    .filter(Boolean) as SectionConfig[];
}
