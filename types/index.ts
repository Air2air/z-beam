// types/index.ts
// CENTRALIZED TYPE EXPORTS - Single Source of Truth

// =============================================
// TYPE FAMILIES (Recommended for new imports)
// =============================================
// Use these organized type families for better maintainability:
// import { PageProps, ArticleMetadata } from '@/types/families';
// import { BaseInteractiveProps, FadeInProps } from '@/types/families/BaseProps';
// import { ComponentVariant, BadgeData } from '@/types/families/ComponentTypes';
// import { ApiResponse, SearchApiResponse } from '@/types/families/ApiTypes';

// Type families re-export for convenience
export * from './families';

// =============================================
// LEGACY CENTRALIZED EXPORTS (Maintained for compatibility)
// =============================================

// Primary exports from centralized types (these take precedence)
export type {
  // Author types (YAML-based)
  AuthorInfo,
  AuthorProps,
  
  // Core content types
  ArticleMetadata,
  ComponentData,
  LayoutProps,
  HeroProps,
  
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
  TagPageProps,
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

// Additional core article types
export type {
  MaterialMetadata,
  ApplicationMetadata,
  RegionMetadata,
  ThesaurusMetadata,
  ArticlePost,
  MaterialPost,
  ApplicationPost,
  RegionPost,
  ThesaurusPost,
  AuthorPost,
  ContentType,
  FilterCriteria
} from './core/article';