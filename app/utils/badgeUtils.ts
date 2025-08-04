// app/utils/badgeUtils.ts
import { MaterialType, MaterialBadgeData } from '../types/materials';

export interface BadgeData extends MaterialBadgeData {
  slug?: string;
}

/**
 * Maps material types to colors for badges
 */
export function getMaterialColor(materialType?: string): string {
  if (!materialType) return "blue";

  const typeMap: Record<string, string> = {
    metal: "blue",
    ceramic: "green",
    polymer: "purple",
    composite: "yellow",
    semiconductor: "red",
    compound: "gray",
    element: "teal",
    alloy: "indigo",
    other: "blue",
  };

  return typeMap[materialType.toLowerCase()] || "blue";
}

/**
 * Extracts badge data from an item (article, card, etc.) based on its metadata and slug
 * This centralizes badge logic so it can be used by both Card and Article components
 */
export function getBadgeData(item: any, options: { showBadge?: boolean, forceBadge?: boolean } = {}): BadgeData | null {
  const { showBadge = true, forceBadge = false } = options;
  const metadata = item.metadata || {};
  const title = item.title || item.name || 'Unnamed';
  const slug = item.slug || '';
  
  // If showBadge is false and we're not forcing, don't show a badge
  if (!showBadge && !forceBadge) return null;
  
  // If explicit badge data is provided, use it
  if (item.badge) return { ...item.badge, slug };
  
  // Extract from metadata if available
  if (metadata.chemicalProperties) {
    const props = metadata.chemicalProperties;
    
    if (process.env.NODE_ENV === 'development') {
    }
    
    // Only return badge data if we have at least a symbol or formula
    if (props.symbol || props.formula) {
      const badgeData: BadgeData = {
        symbol: props.symbol,
        formula: props.formula,
        atomicNumber: props.atomicNumber,
        materialType: (props.materialType || metadata.category || 'other') as MaterialType,
        color: getMaterialColor(props.materialType || metadata.category),
        slug
      };
      
      // Cache the badge data for this slug
      if (slug) {
        cacheBadgeData(slug, badgeData);
      }
      
      return badgeData;
    }
  }
  
  // Try to extract from metadata directly if chemicalProperties object isn't available
  if (metadata.symbol || metadata.formula) {
    if (process.env.NODE_ENV === 'development') {
        symbol: metadata.symbol,
        formula: metadata.formula,
        materialType: metadata.materialType || metadata.category
      });
    }
    
    const badgeData: BadgeData = {
      symbol: metadata.symbol,
      formula: metadata.formula,
      atomicNumber: metadata.atomicNumber,
      materialType: (metadata.materialType || metadata.category || 'other') as MaterialType,
      color: getMaterialColor(metadata.materialType || metadata.category),
      slug
    };
    
    // Cache the badge data for this slug
    if (slug) {
      cacheBadgeData(slug, badgeData);
    }
    
    return badgeData;
  }
  
  // Check frontmatter if available
  if (item.frontmatter) {
    const fm = item.frontmatter;
    
    if (fm.chemicalProperties) {
      const props = fm.chemicalProperties;
      
      if (props.symbol || props.formula) {
        const badgeData: BadgeData = {
          symbol: props.symbol,
          formula: props.formula,
          atomicNumber: props.atomicNumber,
          materialType: (props.materialType || fm.category || 'other') as MaterialType,
          color: getMaterialColor(props.materialType || fm.category),
          slug
        };
        
        // Cache the badge data for this slug
        if (slug) {
          cacheBadgeData(slug, badgeData);
        }
        
        return badgeData;
      }
    }
    
    // Direct chemical properties in frontmatter
    if (fm.symbol || fm.formula) {
      const badgeData: BadgeData = {
        symbol: fm.symbol,
        formula: fm.formula,
        atomicNumber: fm.atomicNumber,
        materialType: (fm.materialType || fm.category || 'other') as MaterialType,
        color: getMaterialColor(fm.materialType || fm.category),
        slug
      };
      
      // Cache the badge data for this slug
      if (slug) {
        cacheBadgeData(slug, badgeData);
      }
      
      return badgeData;
    }
  }
  
  // Check if we already have cached data for this slug
  if (slug) {
    const cachedBadge = getBadgeDataBySlug(slug);
    if (cachedBadge) {
      return cachedBadge;
    }
  }
  
  return null;
}

/**
 * Cache for storing badge data by slug
 * This allows us to associate badges with content across different views
 */
const badgeCache: Record<string, BadgeData> = {};

/**
 * Store badge data for a specific slug
 */
export function cacheBadgeData(slug: string, badgeData: BadgeData): void {
  if (!slug) return;
  badgeCache[slug] = badgeData;
  
  if (process.env.NODE_ENV === 'development') {
  }
}

/**
 * Get badge data for a specific slug
 */
export function getBadgeDataBySlug(slug: string): BadgeData | null {
  if (!slug) return null;
  return badgeCache[slug] || null;
}
