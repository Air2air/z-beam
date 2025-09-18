// types/components/ui.ts
// User interface component types

import { BaseInteractiveProps, BreadcrumbItem } from '../centralized';

/**
 * Component variant types for consistent theming
 */
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Component size types for consistent sizing
 */
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Base props for components that display content
 */
export interface BaseContentProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Base props for components that display images
 */
export interface BaseImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

/**
 * Base props for link components
 */
export interface BaseLinkProps {
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
}

/**
 * Enhanced badge component props
 */
export interface UIBadgeProps extends BaseInteractiveProps {
  text: string;
  variant?: ComponentVariant;
  size?: ComponentSize;
  bgColorClass?: string;
  textColorClass?: string;
}

/**
 * Animation component props
 */
export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  amount?: 'some' | 'all' | number;
  once?: boolean;
  className?: string;
}

/**
 * Navigation breadcrumb interfaces
 */
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}
