// app/utils/badgeUtils.ts
import { MaterialType, BadgeData } from '../../types/core';

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
export function getBadgeData(item: { badge?: BadgeData; metadata?: Record<string, unknown>; frontmatter?: Record<string, unknown>; slug?: string; category?: string }, options: { showBadge?: boolean, forceBadge?: boolean } = {}): BadgeData | null {
  const { showBadge = true, forceBadge = false } = options;
  const metadata = item.metadata || {};
  const slug = item.slug || '';
  
  // If showBadge is false and we're not forcing, don't show a badge
  if (!showBadge && !forceBadge) return null;
  
  // If explicit badge data is provided, use it
  if (item.badge) return { ...item.badge, slug };
  
  // Extract from metadata if available
  if (metadata.chemicalProperties) {
    const props = metadata.chemicalProperties as Record<string, any>;
    
    // Only return badge data if we have at least a symbol or formula
    if (props.symbol || props.formula) {
      const badgeData: BadgeData = {
        symbol: props.symbol as string,
        formula: props.formula as string,
        atomicNumber: props.atomicNumber as number,
        materialType: (props.materialType || metadata.category || 'other') as MaterialType,
        color: getMaterialColor(props.materialType as string || metadata.category as string),
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
    const badgeData: BadgeData = {
      symbol: metadata.symbol as string | undefined,
      formula: metadata.formula as string | undefined,
      atomicNumber: metadata.atomicNumber as number | undefined,
      materialType: (metadata.materialType || metadata.category || 'other') as MaterialType,
      color: getMaterialColor(metadata.materialType as string || metadata.category as string),
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
    const fm = item.frontmatter as Record<string, any>;
    
    if (fm.chemicalProperties) {
      const props = fm.chemicalProperties as Record<string, any>;
      
      if (props.symbol || props.formula) {
        const badgeData: BadgeData = {
          symbol: props.symbol as string,
          formula: props.formula as string,
          atomicNumber: props.atomicNumber as number,
          materialType: (props.materialType || fm.category || 'other') as MaterialType,
          color: getMaterialColor(props.materialType as string || fm.category as string),
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
        symbol: fm.symbol as string | undefined,
        formula: fm.formula as string | undefined,
        atomicNumber: fm.atomicNumber as number | undefined,
        materialType: (fm.materialType || fm.category || 'other') as MaterialType,
        color: getMaterialColor(fm.materialType as string || fm.category as string),
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
}

/**
 * Get badge data for a specific slug
 */
export function getBadgeDataBySlug(slug: string): BadgeData | null {
  if (!slug) return null;
  return badgeCache[slug] || null;
}
