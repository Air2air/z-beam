// types/families/ComponentTypes.ts
// Component-specific interfaces and types

import { ReactNode } from 'react';
import { BaseInteractiveProps, BaseContentProps } from './BaseProps';

/**
 * Component variant types for consistent theming
 */
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Component size types for consistent sizing
 */
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Badge data structure
 */
export interface BadgeData {
  text: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize;
}

/**
 * Badge variant types
 */
export type BadgeVariant = 'default' | 'outline' | 'secondary';

/**
 * Badge color types
 */
export type BadgeColor = 'blue' | 'green' | 'purple' | 'orange';

/**
 * UI Badge component props
 */
export interface UIBadgeProps extends BaseInteractiveProps {
  text: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize;
}

/**
 * Material properties
 */
export interface MaterialProperties {
  chemicalFormula?: string;
  materialType?: string;
  density?: string;
  meltingPoint?: string;
  thermalConductivity?: string;
  laserType?: string;
  wavelength?: string;
  fluenceRange?: string;
  [key: string]: string | number | undefined;
}

/**
 * Chemical composition
 */
export interface CompositionData {
  component: string;
  percentage: string;
  type: string;
  formula?: string;
}

/**
 * Component data structure for dynamic loading
 */
export interface ComponentData {
  type: string;
  config?: Record<string, any>;
  content?: string;
}

/**
 * Content item for lists and grids
 */
export interface ContentItem {
  id?: string;
  type?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: any; // Will be more specific in final implementation
}

/**
 * Search result item
 */
export interface SearchResultItem {
  slug: string;
  title: string;
  name?: string;
  description?: string;
  type: string;
  category?: string;
  tags?: string[];
  metadata?: any;
  href: string;
  image?: string;
}

/**
 * Breadcrumbs component props
 */
export interface BreadcrumbsProps {
  items: import('./BaseProps').BreadcrumbItem[];
  className?: string;
}
