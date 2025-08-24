// types/components/card.ts
// Card component types extending core types

import { BadgeData, ArticleMetadata } from '../core';

/**
 * Card component properties
 * Standardized interface for all card components
 */
export interface CardProps {
  /** Navigation href */
  href: string;
  
  /** Card title */
  title: string;
  
  /** Display name (takes precedence over title) */
  name?: string;
  
  /** Card description */
  description?: string;
  
  /** Image URL (legacy) */
  image?: string;
  
  /** Image URL (preferred) */
  imageUrl?: string;
  
  /** Image alt text */
  imageAlt?: string;
  
  /** Material slug for image fallbacks */
  materialSlug?: string;
  
  /** Content tags */
  tags?: string[];
  
  /** Badge configuration */
  badge?: BadgeData | null;
  
  /** Article metadata */
  metadata?: ArticleMetadata;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Fixed height */
  height?: string;
  
  /** Frontmatter data (legacy support) */
  frontmatterData?: Record<string, unknown>;
  
  /** Whether card is featured */
  featured?: boolean;
}

/**
 * Card list item
 * Used in list components
 */
export interface CardListItem {
  /** Content slug */
  slug: string;
  
  /** Display title */
  title?: string;
  
  /** Description */
  description?: string;
  
  /** Image URL */
  image?: string;
  
  /** Badge text/config */
  badge?: string | BadgeData;
  
  /** Whether item is featured */
  featured?: boolean;
  
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Section card data
 */
export interface SectionCardData {
  /** Unique ID */
  id: number;
  
  /** Card title */
  title?: string;
  
  /** Content slug */
  slug: string;
  
  /** Description */
  description: string;
  
  /** Image URL */
  imageUrl: string;
  
  /** Featured flag */
  featured?: boolean;
}
