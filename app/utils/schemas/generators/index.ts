/**
 * Unified JSON-LD Schema Generator Module
 * 
 * Modular, reusable schema generators with consistent interfaces
 * All schemas implement E-E-A-T best practices and use Person @id references
 * 
 * @example
 * ```typescript
 * import { generateArticleSchema, generatePersonSchema, createContext } from '@/app/utils/schemas/generators';
 * 
 * const context = createContext('materials/metal/alloy/aluminum');
 * const person = generatePersonSchema({ context, author: { name: 'John Doe' } });
 * const article = generateArticleSchema({ 
 *   context, 
 *   title: 'Aluminum Laser Cleaning',
 *   description: '...'
 * });
 * ```
 */

import { SITE_CONFIG } from '../../constants';
import type { SchemaContext } from './types';

// Export all types
export * from './types';

// Export Person schema and reference creator
export { 
  generatePersonSchema, 
  createAuthorReference,
  type PersonSchemaOptions
} from './person';

// Export content schemas
export {
  generateArticleSchema,
  type ArticleSchemaOptions
} from './article';

export {
  generateProductSchema,
  type ProductSchemaOptions
} from './product';

export {
  generateHowToSchema,
  type HowToSchemaOptions,
  type HowToStep,
  type HowToMachineSettings
} from './howto';

export {
  generateDatasetSchema,
  type DatasetSchemaOptions
} from './dataset';

// Export common schemas
export {
  generateWebPageSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  type WebPageSchemaOptions,
  type BreadcrumbSchemaOptions,
  type FAQSchemaOptions,
  type FAQItem,
  type OrganizationSchemaOptions
} from './common';

/**
 * Create schema context from slug
 */
export function createContext(slug: string, baseUrl?: string): SchemaContext {
  const base = baseUrl || SITE_CONFIG.url || 'https://www.z-beam.com';
  return {
    baseUrl: base,
    pageUrl: `${base}/${slug}`,
    currentDate: new Date().toISOString().split('T')[0],
    slug
  };
}

/**
 * Wrap schemas in @graph structure
 */
export function wrapInGraph(schemas: any[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.filter(Boolean)
  };
}
