// types/families/ComponentTypes.ts
// Component-specific interfaces and types - All importing from centralized source

// Import all component types from centralized source
import type { 
  BadgeVariant, 
  BadgeColor, 
  BadgeSize, 
  ComponentVariant, 
  ComponentSize, 
  BadgeData,
  MaterialProperties,
  CompositionData,
  ComponentData,
  ContentItem,
  SearchResultItem,
  UIBadgeProps,
  BreadcrumbsProps
} from '../centralized';

// Re-export all component types for organized import paths
export type { 
  ComponentVariant, 
  ComponentSize, 
  BadgeVariant, 
  BadgeColor, 
  BadgeSize, 
  BadgeData,
  MaterialProperties,
  CompositionData,
  ComponentData,
  ContentItem,
  SearchResultItem,
  UIBadgeProps,
  BreadcrumbsProps
};
