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

// Component types  
export type {
  ComponentVariant,
  ComponentSize,
  BaseInteractiveProps,
  BaseContentProps,
  BaseImageProps,
  BaseLinkProps,
  UIBadgeProps,
  FadeInProps,
  BreadcrumbItem,
  BreadcrumbsProps,
  TableProps
} from '../components/ui';
