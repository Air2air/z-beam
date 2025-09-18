// types/families/index.ts
// Centralized exports for type families

// Base props and foundational interfaces
export type {
  BaseInteractiveProps,
  BaseContentProps,
  BaseImageProps,
  BaseLinkProps,
  FadeInProps,
  BreadcrumbItem
} from './BaseProps';

// Page-related types and metadata
export type {
  PageProps,
  TagPageProps,
  PropertyPageProps,
  PageParams,
  SearchParams as PageSearchParams,
  LayoutProps,
  ArticleMetadata,
  AuthorInfo
} from './PageTypes';

// Component-specific types
export type {
  ComponentVariant,
  ComponentSize,
  BadgeData,
  BadgeVariant,
  BadgeColor,
  UIBadgeProps,
  MaterialProperties,
  CompositionData,
  ComponentData,
  ContentItem,
  SearchResultItem as ComponentSearchResultItem,
  BreadcrumbsProps
} from './ComponentTypes';

// API-related types
export type {
  ApiResponse,
  SearchApiResponse,
  MaterialsApiResponse,
  MaterialItem,
  DebugApiResponse,
  DebugItem,
  SearchResultItem as ApiSearchResultItem,
  PaginationParams,
  FilterParams,
  SearchParams as ApiSearchParams
} from './ApiTypes';
