// types/components/badge.ts
// Badge component types extending core badge types

import { 
  BadgeData, 
  BadgeSymbolData, 
  BadgeDisplayProps, 
  BadgeProps,
  MaterialType,
  BadgeVariant 
} from '../core/badge';

/**
 * Badge Symbol component properties
 * Combines legacy and new interfaces
 */
export interface BadgeSymbolProps {
  /** Content string (for compatibility) */
  content: string;
  
  /** Badge configuration */
  config?: BadgeSymbolData & BadgeDisplayProps;
  
  /** Alternative: direct data prop */
  data?: BadgeSymbolData;
  
  /** Alternative: slug to load data */
  slug?: string;
  
  /** Display variant */
  variant?: BadgeVariant;
  
  /** Position for overlay */
  position?: string;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Material badge utilities interface
 */
export interface MaterialBadgeUtils {
  /** Get material color based on type */
  getMaterialColor(materialType?: string): string;
  
  /** Get badge data from item */
  getBadgeData(item: any, options?: { showBadge?: boolean; forceBadge?: boolean }): BadgeData | null;
  
  /** Get material gradient */
  getMaterialGradient(materialType: MaterialType): string;
  
  /** Cache badge data */
  cacheBadgeData(slug: string, badgeData: BadgeData): void;
  
  /** Get cached badge data */
  getBadgeDataBySlug(slug: string): BadgeData | null;
}

/**
 * Chemical properties interface
 */
export interface ChemicalProperties {
  /** Chemical symbol */
  symbol?: string;
  
  /** Chemical formula */
  formula?: string;
  
  /** Material type */
  materialType?: string;
  
  /** Atomic number */
  atomicNumber?: number | string;
  
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Badge loader result
 */
export interface BadgeLoaderResult {
  /** Loaded badge data */
  data: BadgeData | null;
  
  /** Loading error if any */
  error?: string;
  
  /** Whether data was loaded from cache */
  fromCache?: boolean;
}
