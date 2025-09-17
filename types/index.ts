// types/index.ts
// CENTRALIZED TYPE EXPORTS - Single Source of Truth

// Primary exports from centralized types (these take precedence)
export type {
  // Author types (YAML-based)
  AuthorInfo,
  AuthorProps,
  
  // Core content types
  ArticleMetadata,
  ComponentData,
  LayoutProps,
  
  // UI component types
  ComponentVariant,
  ComponentSize,
  BadgeData,
  BadgeVariant,
  BadgeColor,
  
  // Base component props
  BaseInteractiveProps,
  BaseContentProps,
  BaseImageProps,
  
  // Page and API types
  PageProps,
  ApiResponse,
  SearchResultItem,
  
  // Material types
  MaterialProperties,
  CompositionData,
  
  // Utility types
  ContentItem,
  BreadcrumbItem,
  FadeInProps,
  
  // Legacy compatibility
  Metadata,
  Article,
  Author,
  Badge,
  MaterialPost,
  PageParams,
  SearchParams
} from './centralized';

// Component types - specific exports to avoid conflicts
export type {
  CardProps,
  CardListItem,
  SectionCardData,
  ListProps,
  ProcessedListItem,
  SearchResultsGridProps,
  SectionCardListProps,
  BadgeSymbolProps,
  MaterialBadgeUtils,
  ChemicalProperties,
  BadgeLoaderResult,
  LayoutComponentType
} from './components';

// API types (prefixed to avoid conflicts)
export type {
  ApiResponse as CoreApiResponse,
  SearchApiResponse,
  MaterialsApiResponse,
  MaterialItem,
  DebugApiResponse,
  DebugItem,
  SearchResultItem as ApiSearchResultItem
} from './api';

// Core types (legacy, use sparingly)
export type {
  MaterialType,
  BadgeSymbolData
} from './core';
