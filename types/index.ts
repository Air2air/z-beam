// types/index.ts
// UNIFIED TYPE EXPORTS - Single import source for all Z-Beam types
// This file consolidates all types from centralized.ts

// Re-export everything from centralized.ts (SINGLE SOURCE OF TRUTH)
// EXCEPT SectionMetadata which is exported from relationships.ts to avoid duplicate
export * from './centralized';

// ============================================================================
// RELATIONSHIP TYPES AND UTILITIES (NEW - Feb 4, 2026)
// ============================================================================
// Consolidated relationship types and accessor functions
// Note: SectionMetadata from relationships.ts takes precedence over centralized.ts
export type { 
  RelationshipCategory, 
  RelationshipKey, 
  SectionMetadata,  // Takes precedence over centralized.ts version
  RelationshipData,
  DenormalizedRelationshipItem,
  MaterialRelationshipItem,
  CompoundRelationshipItem,
  ContaminantRelationshipItem
} from './relationships';

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
// DOMAIN LINKAGES TYPES - REMOVED (Dec 22, 2025)
// ============================================================================
// The domain_linkages architecture was replaced with top-level relationships structure.
// All relationship data now lives under frontmatter.relationships.* instead of domain_linkages.*
// DomainLinkageSection component removed as obsolete.

// ============================================================================
// CARD SCHEMA TYPES (NEW - Dec 22, 2025)
// ============================================================================
// Card presentation schema for all entities with context-specific variants
// Note: RelationshipKey exported from relationships.ts instead to avoid duplicate
export type {
  CardBadge,
  CardMetric,
  CardSeverity,
  CardVariant,
  CardSchema,
  PresentationType,
  RelationshipSection,
  RelationshipItem,
  // RelationshipKey,  // Commented out - use from relationships.ts
  FrontmatterRelationshipsNew,
  EntityFrontmatter,
} from './card-schema';

export {
  SEVERITY_COLORS,
  detectCardContext,
  isCardSchema,
  isCardVariant,
  isRelationshipKey,
} from './card-schema';

// ============================================================================
// FRONTMATTER RELATIONSHIPS TYPES (NEW UNIFIED SCHEMA)
// ============================================================================
// New unified schema - all relationship data under 'relationships' parent key
export type {
  RelationshipEntry,
  LaserProperties,
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
// - Navigation types (NavItem, BreadcrumbItem, FooterNavItem, etc.)export * from './settings';
