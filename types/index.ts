// types/index.ts
// Central type exports - single source of truth

// Core types (new standardized)
export * from './core';

// Component types - explicit exports to avoid conflicts
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
  LayoutProps,
  LayoutComponentType
} from './components';

// API types - explicit exports to avoid conflicts  
export type {
  ApiResponse,
  SearchApiResponse,
  MaterialsApiResponse,
  MaterialItem,
  DebugApiResponse,
  DebugItem
} from './api';

// API SearchResultItem as distinct from core
export type { SearchResultItem as ApiSearchResultItem } from './api';

// Legacy types for backward compatibility during migration
export interface LegacyBadge {
  variant?: 'outline' | 'subtle' | 'solid';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'small' | 'medium' | 'large';
}

export interface LegacyBadgeData {
  text?: string;
  variant?: LegacyBadge['variant'];
  color?: LegacyBadge['color'];
}

// Legacy ContentItem interface
export interface ContentItem {
  id?: string;
  type?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Legacy types - maintain backward compatibility
export type PageParams = { slug: string };
export type SearchParams = { [key: string]: string | string[] | undefined };

// Convenience re-exports with clear naming
export type {
  // Core types with clear prefixes
  BadgeData as CoreBadgeData,
  ArticleMetadata as CoreArticleMetadata,
  MaterialType as CoreMaterialType,
  SearchResultItem as CoreSearchResultItem
} from './core';

export type {
  // Component types
  CardProps as ComponentCardProps,
  BadgeSymbolProps as ComponentBadgeSymbolProps
} from './components';

export type {
  // API types
  ApiResponse as CoreApiResponse
} from './api';
