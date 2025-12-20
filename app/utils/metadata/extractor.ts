/**
 * Unified Metadata Extraction Utilities
 * Consolidates 15+ duplicate metadata extraction functions
 */

import type { ArticleMetadata, ContentType } from '@/types/centralized';

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  slug?: string;
  contentType?: ContentType;
  datePublished?: string;
  dateModified?: string;
  author?: Record<string, unknown>;
  images?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PropertyData {
  property: string;
  value: string | number;
  unit?: string;
  confidence?: number;
}

/**
 * Unified Metadata Extractor
 */
export class MetadataExtractor {
  /**
   * Extract metadata from article object
   */
  static fromArticle(article: { metadata?: Record<string, unknown> }): ExtractedMetadata {
    if (!article?.metadata) return {};
    return this.normalize(article.metadata);
  }

  /**
   * Extract metadata from frontmatter data
   */
  static fromFrontmatter(data: unknown): ExtractedMetadata {
    if (!data || typeof data !== 'object') return {};
    return this.normalize(data as Record<string, unknown>);
  }

  /**
   * Extract metadata handling both nested and flat structures
   */
  static fromData(data: unknown): ExtractedMetadata {
    if (!data || typeof data !== 'object') return {};
    
    const obj = data as Record<string, unknown>;
    
    // Handle nested structure (parsed.metadata)
    if (obj.metadata && typeof obj.metadata === 'object') {
      return this.normalize(obj.metadata as Record<string, unknown>);
    }
    
    // Handle flat structure
    return this.normalize(obj);
  }

  /**
   * Normalize metadata to standard structure
   */
  static normalize(raw: Record<string, unknown>): ExtractedMetadata {
    return {
      title: this.getString(raw.title || raw.name),
      description: this.getString(raw.description),
      category: this.getString(raw.category),
      subcategory: this.getString(raw.subcategory),
      slug: this.getString(raw.slug),
      contentType: this.getContentType(raw),
      datePublished: this.getString(raw.datePublished),
      dateModified: this.getString(raw.dateModified),
      author: this.getObject(raw.author),
      images: this.getObject(raw.images),
      ...raw // Include all other fields
    };
  }

  /**
   * Extract properties from metadata
   */
  static getProperties(metadata: Record<string, unknown>): PropertyData[] {
    const properties: PropertyData[] = [];
    
    // Check for materialProperties
    if (metadata.materialProperties && typeof metadata.materialProperties === 'object') {
      const props = metadata.materialProperties as Record<string, unknown>;
      
      for (const [category, categoryData] of Object.entries(props)) {
        if (categoryData && typeof categoryData === 'object') {
          const catObj = categoryData as Record<string, unknown>;
          
          if (catObj.properties && typeof catObj.properties === 'object') {
            const propsObj = catObj.properties as Record<string, Record<string, unknown>>;
            
            for (const [propName, propData] of Object.entries(propsObj)) {
              if (propData && typeof propData === 'object') {
                properties.push({
                  property: propName,
                  value: propData.value as string | number,
                  unit: propData.unit as string | undefined,
                  confidence: propData.confidence as number | undefined
                });
              }
            }
          }
        }
      }
    }
    
    return properties;
  }

  /**
   * Detect content type from metadata
   */
  static getContentType(metadata: Record<string, unknown>): ContentType | undefined {
    // Explicit content_type field
    if (metadata.content_type) {
      const type = String(metadata.content_type);
      if (['materials', 'contaminants', 'compounds', 'settings'].includes(type)) {
        return type as ContentType;
      }
    }
    
    // Infer from structure
    if (metadata.materialProperties || metadata.machineSettings) return 'materials';
    if (metadata.contaminant_type) return 'contaminants';
    if (metadata.compound_type) return 'compounds';
    if (metadata.setting_type) return 'settings';
    
    return undefined;
  }

  /**
   * Extract enrichment data for enhanced display
   */
  static getEnrichmentData(metadata: Record<string, unknown>): Record<string, unknown> {
    return {
      hasProperties: this.hasProperties(metadata),
      hasSettings: this.hasSettings(metadata),
      hasAuthor: !!metadata.author,
      hasFAQ: !!metadata.faq || !!metadata.faqs,
      hasImages: !!metadata.images,
      propertyCount: this.getProperties(metadata).length
    };
  }

  /**
   * Check if metadata has material properties
   */
  static hasProperties(metadata: Record<string, unknown>): boolean {
    return !!(metadata.materialProperties && 
      typeof metadata.materialProperties === 'object' &&
      Object.keys(metadata.materialProperties).length > 0);
  }

  /**
   * Check if metadata has machine settings
   */
  static hasSettings(metadata: Record<string, unknown>): boolean {
    return !!(metadata.machineSettings && 
      typeof metadata.machineSettings === 'object' &&
      Object.keys(metadata.machineSettings).length > 0);
  }

  /**
   * Validate metadata completeness
   */
  static validate(metadata: Record<string, unknown>): {
    valid: boolean;
    missing: string[];
  } {
    const required = ['title', 'slug'];
    const missing = required.filter(field => !metadata[field]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Check if metadata is complete for display
   */
  static isComplete(metadata: Record<string, unknown>): boolean {
    const result = this.validate(metadata);
    return result.valid && !!metadata.description;
  }

  // Helper methods
  private static getString(value: unknown): string | undefined {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return undefined;
  }

  private static getObject(value: unknown): Record<string, unknown> | undefined {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return undefined;
  }
}

/**
 * Legacy function wrappers for backward compatibility
 */

export function getMetadata(data: unknown): ExtractedMetadata {
  return MetadataExtractor.fromData(data);
}

export function extractMetadata(content: Record<string, unknown>): ExtractedMetadata {
  return MetadataExtractor.normalize(content);
}

export function getContentType(metadata?: Record<string, unknown>): ContentType | undefined {
  if (!metadata) return undefined;
  return MetadataExtractor.getContentType(metadata);
}

export function extractPropertiesFromMetadata(metadata: Record<string, unknown>): PropertyData[] {
  return MetadataExtractor.getProperties(metadata);
}

export function parsePropertiesFromMetadata(metadata: Record<string, unknown>): PropertyData[] {
  return MetadataExtractor.getProperties(metadata);
}

export function getEnrichmentMetadata(article: { metadata?: Record<string, unknown> }): Record<string, unknown> {
  if (!article?.metadata) return {};
  return MetadataExtractor.getEnrichmentData(article.metadata);
}
