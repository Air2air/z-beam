// types/index.ts
// UNIFIED TYPE EXPORTS - Single import source for all Z-Beam types
// This file consolidates all types from centralized.ts

// Re-export everything from centralized.ts (SINGLE SOURCE OF TRUTH)
export * from './centralized';

// ============================================================================
// SCHEMA GENERATOR TYPES - From app/utils/schemas/generators/types.ts
// ============================================================================
// These types are used for JSON-LD schema generation
// Export them for use across the application
export type {
  SchemaContext,
  AuthorData,
  ImageData,
  PropertyValue,
  SchemaOrgBase,
  SchemaOrgThing,
  ImageObject,
  PersonObject,
  OrganizationObject,
  ContactPointObject,
  BreadcrumbListObject,
  ListItemObject,
  MaterialPropertyValue,
  MaterialProperties,
  FrontmatterBase,
  MaterialFrontmatter,
  ArticleFrontmatter,
  ExtendedFrontmatter,
  ComponentData,
  ContentCard,
  SchemaData
} from '../app/utils/schemas/generators/types';

// ============================================================================
// YAML COMPONENT TYPES - Intentionally Separate
// ============================================================================
// YAML component types are NOT re-exported here to avoid naming conflicts
// with the main type system. These types are specifically for YAML file 
// parsing and component data structures.
//
// To use YAML types, import directly:
//   import { MaterialData, JsonLdYamlData } from '@/types/yaml-components'
//
// Available YAML types:
//   - MaterialData
//   - JsonLdYamlData
//   - SeoData
//   - MetaTagsYamlData
//   - TableYamlData
//   - MetricsPropertiesYamlData
//   - MetricsMachineSettingsYamlData
// ============================================================================

// Standard Import Pattern:
// import { TypeName } from '@/types'
// 
// This provides access to all centralized types including:
// - Caption system types (CaptionDataStructure, CaptionProps, ParsedCaptionData)
// - MetricsGrid types (MetricsGridProps, MetricsCardProps, QualityMetrics)
// - Component props (AuthorProps, TitleProps, LayoutProps, HeroProps, etc.)
// - Article and content types (ArticleMetadata, MaterialMetadata, etc.)
// - Badge and UI types (BadgeData, UIBadgeProps, ComponentSize, etc.)
// - Material & Scientific types (MaterialProperties, ChemicalProperties, MachineSettings)
// - API types (ApiResponse, SearchApiResponse, PaginationParams, etc.)
// - Navigation types (NavItem, BreadcrumbItem, FooterNavItem, etc.)