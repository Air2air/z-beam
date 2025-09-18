// types/core/index.ts
// Central type exports for the application

// Core types
export type {
  MaterialType,
  BadgeVariant,
  BadgeData,
  BadgeSymbolData,
  BadgeDisplayProps,
  BadgeProps,
  BadgeConfig,
  MaterialBadgeData
} from './badge';

export type {
  ArticleMetadata,
  ArticleFrontmatter,
  Article,
  PageProps,
  DynamicPageProps,
  StaticPageProps,
  SearchResultItem,
  SearchableArticle
} from './article';

// Import from centralized for consolidated interfaces
export type { BaseInteractiveProps, BreadcrumbItem } from '../centralized';

// Component types  
export type {
  ComponentVariant,
  ComponentSize,
  BaseContentProps,
  BaseImageProps,
  BaseLinkProps,
  UIBadgeProps,
  FadeInProps,
  BreadcrumbsProps
} from '../components/ui';
