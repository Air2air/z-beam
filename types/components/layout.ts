// types/components/layout.ts
// Layout component types

import { ArticleMetadata } from '../core';

/**
 * Layout component properties
 */
export interface LayoutProps {
  /** Parsed components */
  components: Record<string, any> | null;
  
  /** Article metadata */
  metadata?: any;
  
  /** Content slug */
  slug?: string;
  
  /** Page title */
  title?: string;
  
  /** Hide header */
  hideHeader?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Layout component type
 */
export type LayoutComponentType = 
  | 'propertiestable'
  | 'author' 
  | 'badgesymbol'
  | 'content'
  | 'caption'
  | 'bullets'
  | 'table'
  | 'tags';

/**
 * Component configuration
 */
export interface ComponentConfig {
  /** Component content */
  content: string;
  
  /** Component configuration */
  config?: Record<string, unknown>;
}
