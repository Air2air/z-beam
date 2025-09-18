// types/components/index.ts
// Central exports for component types

// Author types
export type {
  AuthorInfo,
  AuthorProps
} from './author';

// Card types
export type {
  CardProps,
  CardListItem,
  SectionCardData
} from './card';

// List types  
export type {
  ListProps,
  ProcessedListItem,
  SearchResultsGridProps,
  SearchResultItem,
  SectionCardListProps,
  SectionCardData as ListSectionCardData
} from './list';

// Badge types
export type {
  BadgeSymbolProps,
  MaterialBadgeUtils,
  ChemicalProperties,
  BadgeLoaderResult
} from './badge';

// Layout types
export type {
  LayoutProps,
  LayoutComponentType
} from './layout';

// Import from centralized for consolidated interfaces
export type { BaseInteractiveProps, BreadcrumbItem } from '../centralized';

// UI component types
export type {
  ComponentVariant,
  ComponentSize,
  BaseContentProps,
  BaseImageProps,
  BaseLinkProps,
  UIBadgeProps,
  FadeInProps,
  BreadcrumbsProps
} from './ui';

// Re-exports for convenience
export type { CardProps as ComponentCardProps } from './card';
export type { BadgeSymbolProps as ComponentBadgeProps } from './badge';
export type { AuthorInfo as ComponentAuthorData } from './author';
