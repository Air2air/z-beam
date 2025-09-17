// types/components/ui.ts
// User interface component types

/**
 * Component variant types for consistent theming
 */
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Component size types for consistent sizing
 */
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Base props for all interactive elements
 */
export interface BaseInteractiveProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

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
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Table component props
 */
export interface TableProps {
  content: string;
  config?: {
    showHeader?: boolean;
    caption?: string;
    className?: string;
    variant?: 'default' | 'sectioned' | 'compact';
  };
}
