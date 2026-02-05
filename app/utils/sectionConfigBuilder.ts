// app/utils/sectionConfigBuilder.ts
// Fluent builder for constructing section configurations

import type { SectionConfig } from '@/types';
import type { RelationshipCategory, RelationshipKey } from '@/types/relationships';
import { getRelationshipData } from '@/types/relationships';
import { createRelationshipCardGrid } from './relationshipCardGridFactory';
import type { EntityType } from './metadataExtractor';

/**
 * Fluent builder for constructing section configurations
 * 
 * Provides a clean, chainable API for building the sections array
 * used by BaseContentLayout.
 * 
 * @example
 * const sections = new SectionConfigBuilder()
 *   .addRelationshipCardGrid(relationships, 'interactions', 'producesCompounds', 'compound', contaminantName)
 *   .addComponent({ component: SafetyDataPanel, props: {...} })
 *   .addRelationshipCardGrid(relationships, 'interactions', 'affectsMaterials', 'material', contaminantName)
 *   .build();
 */
export class SectionConfigBuilder {
  private sections: SectionConfig[] = [];

  /**
   * Add a relationship CardGrid section
   * 
   * @param relationships - Full relationships object from frontmatter
   * @param category - Relationship category (interactions, safety, etc.)
   * @param key - Relationship key (producesCompounds, affectsMaterials, etc.)
   * @param entityType - Entity type for metadata extraction
   * @param entityName - Entity name for default titles
   * @param defaultTitle - Optional default title
   * @param defaultDescription - Optional default description
   * @returns this (for chaining)
   */
  addRelationshipCardGrid(
    relationships: any,
    category: RelationshipCategory,
    key: RelationshipKey,
    entityType: EntityType,
    entityName: string,
    defaultTitle?: string,
    defaultDescription?: string
  ): this {
    const relationshipData = getRelationshipData(relationships, category, key);
    
    // Skip if no items
    if (!relationshipData?.items?.length) {
      return this;
    }

    const section = createRelationshipCardGrid({
      relationshipData,
      entityType,
      entityName,
      defaultTitle,
      defaultDescription,
    });

    this.sections.push(section);
    return this;
  }

  /**
   * Add a component section unconditionally
   * 
   * @param config - Section configuration
   * @returns this (for chaining)
   */
  addComponent(config: SectionConfig): this {
    this.sections.push(config);
    return this;
  }

  /**
   * Add a component section conditionally
   * 
   * @param condition - Whether to add the section
   * @param config - Section configuration (can be function for lazy evaluation)
   * @returns this (for chaining)
   */
  addConditional(
    condition: boolean | (() => boolean),
    config: SectionConfig | (() => SectionConfig)
  ): this {
    const shouldAdd = typeof condition === 'function' ? condition() : condition;
    if (!shouldAdd) return this;

    const sectionConfig = typeof config === 'function' ? config() : config;
    this.sections.push(sectionConfig);
    return this;
  }

  /**
   * Add multiple sections from array
   * 
   * @param configs - Array of section configurations
   * @returns this (for chaining)
   */
  addMany(configs: SectionConfig[]): this {
    this.sections.push(...configs);
    return this;
  }

  /**
   * Build and return the sections array
   * 
   * @returns Array of section configurations
   */
  build(): SectionConfig[] {
    return this.sections;
  }

  /**
   * Get current number of sections
   * 
   * @returns Number of sections added so far
   */
  count(): number {
    return this.sections.length;
  }

  /**
   * Reset the builder (clear all sections)
   * 
   * @returns this (for chaining)
   */
  reset(): this {
    this.sections = [];
    return this;
  }
}
