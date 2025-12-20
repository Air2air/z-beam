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
// Note: Using relative path here as this file IS the canonical @/types entry point
// eslint-disable-next-line no-restricted-imports
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
  FrontmatterBase,
  MaterialFrontmatter,
  ArticleFrontmatter,
  ExtendedFrontmatter,
  ComponentData,
  ContentCard,
  SchemaData,
  // Service offering types (for frontmatter)
  ServiceOffering,
  ServiceOfferingMaterialSpecific
} from '../app/utils/schemas/generators/types';

// ============================================================================
// DOMAIN LINKAGES TYPES (LEGACY - Use frontmatter-relationships instead)
// ============================================================================
// Types for the domain_linkages system - bidirectional cross-domain relationships
// Note: domain-linkages.ts exists but may not export these types
// Commenting out to fix TS2306 error
// export type {
//   BaseRelationship,
//   MaterialLinkage,
//   ContaminantLinkage,
//   CompoundLinkage,
//   SettingsLinkage,
//   RegulatoryLinkage,
//   PPELinkage,
//   Relationship,
//   Relationships,
//   RelationshipSectionProps,
//   DomainType,
// } from './domain-linkages';

// ============================================================================
// FRONTMATTER RELATIONSHIPS TYPES (NEW UNIFIED SCHEMA)
// ============================================================================
// New unified schema - all relationship data under 'relationships' parent key
export type {
  RelationshipEntry,
  LaserProperties,
  MachineSettings,
  MachineSetting,
  MaterialProperties,
  PPERequirements,
  CompositionEntry,
  VisualCharacteristics,
  ChemicalProperties,
  Reactivity,
  EnvironmentalImpact,
  RegulatoryClassification,
  ExposureLimits,
  WorkplaceExposure,
  EmergencyResponse,
  StorageRequirements,
  Application,
  Characteristics,
  FrontmatterRelationships,
  FrontmatterData,
} from './frontmatter-relationships';

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
// - Micro system types (MicroDataStructure, MicroProps, ParsedMicroData)
// - MetricsGrid types (MetricsGridProps, MetricsCardProps, QualityMetrics)
// - Component props (AuthorProps, TitleProps, LayoutProps, HeroProps, etc.)
// - Article and content types (ArticleMetadata, MaterialMetadata, etc.)
// - Badge and UI types (BadgeData, UIBadgeProps, ComponentSize, etc.)
// - Material & Scientific types (MaterialProperties, ChemicalProperties, MachineSettings)
// - API types (ApiResponse, SearchApiResponse, PaginationParams, etc.)
// - Navigation types (NavItem, BreadcrumbItem, FooterNavItem, etc.)