// types/components/list.ts
// List component types

import { CardListItem, CardProps } from './card';
import { ArticleMetadata, BadgeData } from '../core';
// Import SearchResultItem from centralized source
import type { SearchResultItem } from '../centralized';

/**
 * List component properties
 */
export interface ListProps {
  /** Array of slugs to load */
  slugs?: string[];
  
  /** Pre-configured items */
  items?: CardListItem[];
  
  /** List title */
  title?: string;
  
  /** Heading (alias for title) */
  heading?: string;
  
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  
  /** Filter criteria */
  filterBy?: string;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Processed list item
 * Used internally after loading article data
 */
export interface ProcessedListItem {
  /** Content slug */
  slug: string;
  
  /** Display title */
  title: string;
  
  /** Description */
  description: string;
  
  /** Badge configuration */
  badge?: BadgeData;
  
  /** Image URL */
  imageUrl?: string;
  
  /** Category */
  category: string;
  
  /** Article type */
  articleType: string;
  
  /** Chemical symbol */
  chemicalSymbol?: string;
  
  /** Atomic number */
  atomicNumber?: number;
  
  /** Chemical formula */
  chemicalFormula?: string;
  
  /** Featured flag */
  featured?: boolean;
  
  /** Full material data */
  materialData?: {
    metadata: ArticleMetadata;
    components: Record<string, unknown> | null;
  };
  
  /** Badge symbol data */
  badgeSymbolData?: BadgeData;
}

/**
 * Search results grid properties
 */
export interface SearchResultsGridProps {
  /** Search result items */
  items: SearchResultItem[];
  
  /** Number of columns */
  columns: 1 | 2 | 3 | 4;
}

/**
 * Section card list properties
 */
export interface SectionCardListProps {
  /** Card data array */
  cards?: SectionCardData[];
  
  /** Section heading */
  heading?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Show only featured items */
  featured?: boolean;
}

/**
 * Section card data
 */
export interface SectionCardData {
  /** Card ID */
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
