/**
 * JSON-LD Schema Generators
 * Centralized utilities for generating structured data schemas across static pages
 * Enhanced with FAQPage, Product, HowTo, and LocalBusiness schemas for rich snippets
 * 
 * @deprecated Use SchemaFactory from './factory' for new implementations.
 * This file provides backward compatibility during transition period.
 */

// Re-export all factory functionality for backward compatibility
export {
  SchemaFactory,
  generateServiceSchema,
  generateTechnicalArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateProductSchema,
  generateHowToSchema,
  generateLocalBusinessSchema,
  generateWebPageSchema,
  generatePageSchema,
  type ServiceSchemaOptions,
  type TechnicalArticleSchemaOptions,
  type ProductSchemaOptions,
  type HowToSchemaOptions,
  type BreadcrumbItem,
  type FAQItem,
  type HowToStep
} from './factory';


