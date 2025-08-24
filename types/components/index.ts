// types/components/index.ts
// Central exports for component types

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

// UI component types
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
} from './ui';

// Re-exports for convenience
export type { CardProps as ComponentCardProps } from './card';
export type { BadgeSymbolProps as ComponentBadgeProps } from './badge';
