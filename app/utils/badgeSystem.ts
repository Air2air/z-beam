// app/utils/badgeSystem.ts
// Unified Badge System - Consolidates badgeUtils.ts, badgeDataLoader.ts, badgeSymbolLoader.ts, materialBadgeUtils.ts
// Follows GROK principles: minimal changes, preserves all functionality, maintains backward compatibility

import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
const matter = require('gray-matter');
import { MaterialType, BadgeData, BadgeSymbolData, MaterialBadgeData, BadgeColor } from '@/types';
import { safeMatch, extractSafeValue } from './stringHelpers';
import { badgeCache, materialCache, fileCache, colorCache } from './performanceCache';

// Type-safe cache references
const typedBadgeCache = badgeCache as any; // Will be properly typed when we update performanceCache

// =============================================================================
// PERFORMANCE HELPERS (File I/O with caching)
// =============================================================================

/**
 * Read file with performance caching
 */
function readFileWithCache(filePath: string): string | null {
  try {
    // Check cache first
    const cachedContent = fileCache.get(filePath);
    if (cachedContent) return cachedContent;

    // Read file and cache result
    const content = fs.readFileSync(filePath, 'utf8');
    fileCache.set(filePath, content);
    return content;
  } catch (error) {
    return null;
  }
}

// Known element symbols mapped to atomic numbers (consolidated from materialBadgeUtils)
const ELEMENTS: Record<string, number> = {
  'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8,
  'F': 9, 'Ne': 10, 'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15,
  'S': 16, 'Cl': 17, 'Ar': 18, 'K': 19, 'Ca': 20, 'Ti': 22, 'Fe': 26,
  'Cu': 29, 'Zn': 30, 'Ag': 47, 'Au': 79
};

// =============================================================================
// CORE BADGE FUNCTIONS (Consolidated)
// =============================================================================

/**
 * Maps material types to colors for badges
 * Consolidated from badgeUtils.ts - Now with performance caching
 * Server-side version with caching support
 */
import { getMaterialColor as getBaseColor } from './badgeColors';

export function getMaterialColor(materialType?: string): BadgeColor {
  if (!materialType) return "blue";

  // Check cache first for performance
  const cacheKey = `color_${materialType.toLowerCase()}`;
  const cachedColor = colorCache.get(cacheKey);
  if (cachedColor) return cachedColor as BadgeColor;

  // Use the base implementation
  const color = getBaseColor(materialType);
  
  // Cache the result for future use
  colorCache.set(cacheKey, color);
  
  return color;
}

/**
 * Get gradient style based on material type
 * Consolidated from materialBadgeUtils.ts
 */
export function getMaterialGradient(materialType: MaterialType): string {
  switch (materialType) {
    case 'element':
      return 'bg-gradient-to-br from-blue-500 to-purple-600';
    case 'compound':
    case 'ceramic':
      return 'bg-gradient-to-br from-amber-500 to-red-600';
    case 'polymer':
      return 'bg-gradient-to-br from-green-500 to-teal-600';
    case 'alloy':
      return 'bg-gradient-to-br from-gray-500 to-gray-600';
    case 'composite':
      return 'bg-gradient-to-br from-indigo-500 to-cyan-600';
    default:
      return 'bg-gradient-to-br from-blue-500 to-purple-600';
  }
}

// =============================================================================
// BADGE DATA LOADING (Consolidated from badgeDataLoader + badgeSymbolLoader)
// =============================================================================

/**
 * Load badge data from frontmatter content
 * Consolidated from badgeDataLoader.ts
 */
export async function loadBadgeDataFromFrontmatter(slug: string): Promise<BadgeData | null> {
  try {
    const frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components', 
      'frontmatter',
      `${slug}.md`
    );
    
    if (fs.existsSync(frontmatterPath)) {
      const fileContent = readFileWithCache(frontmatterPath);
      if (!fileContent) return null;
      
      const { data } = matter(fileContent);
      
      if (data.chemicalProperties) {
        return {
          symbol: data.chemicalProperties.symbol,
          formula: data.chemicalProperties.formula,
          materialType: data.chemicalProperties.materialType,
          atomicNumber: data.chemicalProperties.atomicNumber,
          slug
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading badge data for ${slug}:`, error);
    return null;
  }
}

/**
 * Load badge symbol data from badgesymbol content folder
 * Consolidated from badgeSymbolLoader.ts
 */
export async function loadBadgeSymbolData(slug: string): Promise<BadgeSymbolData | null> {
  try {
    const badgeSymbolPath = path.join(
      process.cwd(),
      'content',
      'components',
      'badgesymbol',
      `${slug}.md`
    );
    
    if (fs.existsSync(badgeSymbolPath)) {
      const fileContent = readFileWithCache(badgeSymbolPath);
      if (!fileContent) return null;
      
      const { data } = matter(fileContent);
      
      return {
        symbol: data.symbol,
        materialType: data.materialType,
        atomicNumber: data.atomicNumber,
        formula: data.formula,
        description: data.description
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading badge symbol data for ${slug}:`, error);
    return null;
  }
}

/**
 * Load all available badge symbol data
 * Consolidated from badgeSymbolLoader.ts
 */
export async function loadAllBadgeSymbolData(): Promise<Record<string, BadgeSymbolData>> {
  const badgeSymbolData: Record<string, BadgeSymbolData> = {};
  
  try {
    const badgeSymbolDir = path.join(
      process.cwd(),
      'content',
      'components',
      'badgesymbol'
    );
    
    if (fs.existsSync(badgeSymbolDir)) {
      const files = fs.readdirSync(badgeSymbolDir);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const slug = file.replace('.md', '');
          const data = await loadBadgeSymbolData(slug);
          if (data) {
            badgeSymbolData[slug] = data;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading all badge symbol data:', error);
  }
  
  return badgeSymbolData;
}

// =============================================================================
// UNIFIED BADGE DATA EXTRACTION (Consolidated from badgeUtils + materialBadgeUtils)
// =============================================================================

/**
 * Extract first element symbol from chemical formula
 * Helper from materialBadgeUtils.ts
 */
function extractSymbolFromFormula(formula: unknown): string {
  const match = safeMatch(formula, /([A-Z][a-z]?)/);
  return match ? match[0] : '';
}

/**
 * Create abbreviation from material name
 * Helper from materialBadgeUtils.ts
 */
function abbreviateName(name: string): string {
  if (!name) return '';
  return name.substring(0, 2).toUpperCase();
}

/**
 * Unified badge data extraction from article/item metadata
 * Consolidates getBadgeData from both badgeUtils.ts and materialBadgeUtils.ts
 */
export function getBadgeData(
  item: { 
    badge?: BadgeData; 
    metadata?: Record<string, unknown>; 
    frontmatter?: Record<string, unknown>; 
    slug?: string; 
    category?: string;
    [key: string]: unknown;
  }, 
  options: { showBadge?: boolean; forceBadge?: boolean } = {}
): BadgeData | MaterialBadgeData | null {
  const { showBadge = true, forceBadge = false } = options;
  const metadata = item.metadata || {};
  const slug = item.slug || '';
  
  // If showBadge is false and we're not forcing, don't show a badge
  if (!showBadge && !forceBadge) return null;
  
  // If explicit badge data is provided, use it
  if (item.badge) return { ...item.badge, slug };
  
  // Check cached data first
  if (slug) {
    const cachedBadge = getBadgeDataBySlug(slug);
    if (cachedBadge) return cachedBadge;
  }
  
  // Extract from metadata.chemicalProperties
  if (metadata.chemicalProperties) {
    const props = metadata.chemicalProperties as Record<string, any>;
    
    if (props.symbol || props.formula) {
      const badgeData: BadgeData = {
        symbol: props.symbol as string,
        formula: props.formula as string,
        atomicNumber: props.atomicNumber as number,
        materialType: (props.materialType || metadata.category || 'other') as MaterialType,
        color: getMaterialColor(props.materialType as string || metadata.category as string),
        slug
      };
      
      if (slug) cacheBadgeData(slug, badgeData);
      return badgeData;
    }
  }
  
  // Extract from metadata directly
  if (metadata.symbol || metadata.formula || metadata.chemicalSymbol || metadata.chemicalFormula) {
    const symbol = metadata.symbol || metadata.chemicalSymbol;
    const formula = metadata.formula || metadata.chemicalFormula || 
                   (metadata.properties as any)?.chemicalFormula ||
                   (metadata.composition as any)?.[0]?.formula;
    
    let atomicNumber = metadata.atomicNumber;
    if (!atomicNumber && symbol && ELEMENTS[symbol as string]) {
      atomicNumber = ELEMENTS[symbol as string];
    }
    
    // Determine material type
    let materialType: MaterialType = 'other';
    if ((metadata.properties as any)?.materialType) {
      materialType = (metadata.properties as any).materialType as MaterialType;
    } else if (metadata.category) {
      const category = (metadata.category as string).toLowerCase();
      if (category === 'ceramic') materialType = 'ceramic';
      else if (category === 'polymer') materialType = 'polymer';
      else if (category === 'metal' || category === 'alloy') materialType = 'alloy';
      else if (category === 'composite') materialType = 'composite';
    }
    
    // Infer material type from data
    if (materialType === 'other') {
      if (atomicNumber) materialType = 'element';
      else if (formula) materialType = 'compound';
    }
    
    const badgeData: BadgeData = {
      symbol: symbol as string | undefined,
      formula: formula as string | undefined,
      atomicNumber: atomicNumber as number | undefined,
      materialType,
      color: getMaterialColor(materialType),
      slug
    };
    
    if (slug) cacheBadgeData(slug, badgeData);
    return badgeData;
  }
  
  // Extract from frontmatter
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
        
        if (slug) cacheBadgeData(slug, badgeData);
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
      
      if (slug) cacheBadgeData(slug, badgeData);
      return badgeData;
    }
  }
  
  // Last resort: generate from name if available
  if (!item.badge && metadata.subject) {
    const symbol = abbreviateName(extractSafeValue(metadata.subject));
    if (symbol) {
      const badgeData: BadgeData = {
        symbol,
        materialType: 'other',
        color: getMaterialColor('other'),
        slug
      };
      
      if (slug) cacheBadgeData(slug, badgeData);
      return badgeData;
    }
  }
  
  return null;
}

// =============================================================================
// BADGE CACHING SYSTEM (from badgeUtils.ts)
// =============================================================================

/**
 * Store badge data for a specific slug
 */
export function cacheBadgeData(slug: string, badgeData: BadgeData): void {
  if (!slug) return;
  typedBadgeCache.set(slug, badgeData);
}

/**
 * Get badge data for a specific slug
 */
export function getBadgeDataBySlug(slug: string): BadgeData | null {
  if (!slug) return null;
  return typedBadgeCache.get(slug) || null;
}

// =============================================================================
// UNIFIED BADGE DATA LOADER (Consolidates all loading methods)
// =============================================================================

/**
 * Unified badge data loader that tries all available sources
 * Replaces individual loader functions with single comprehensive method
 */
export async function loadBadgeData(slug: string): Promise<BadgeData | null> {
  try {
    // Check cache first
    const cached = getBadgeDataBySlug(slug);
    if (cached) return cached;
    
    // Try frontmatter first
    const frontmatterData = await loadBadgeDataFromFrontmatter(slug);
    if (frontmatterData) {
      cacheBadgeData(slug, frontmatterData);
      return frontmatterData;
    }
    
    // Try badge symbol data
    const symbolData = await loadBadgeSymbolData(slug);
    if (symbolData) {
      const badgeData: BadgeData = {
        symbol: symbolData.symbol,
        formula: symbolData.formula,
        atomicNumber: symbolData.atomicNumber,
        materialType: symbolData.materialType,
        color: getMaterialColor(symbolData.materialType),
        slug
      };
      
      cacheBadgeData(slug, badgeData);
      return badgeData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading badge data for ${slug}:`, error);
    return null;
  }
}

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================

// Export individual functions to maintain backward compatibility
export {
  // From badgeUtils.ts
  getBadgeData as getBadgeDataLegacy,
  
  // From badgeDataLoader.ts  
  loadBadgeDataFromFrontmatter as loadBadgeDataOriginal,
  
  // From badgeSymbolLoader.ts
  loadBadgeSymbolData as loadBadgeSymbolDataOriginal,
  loadAllBadgeSymbolData as loadAllBadgeSymbolDataOriginal,
  
  // From materialBadgeUtils.ts
  getBadgeData as getMaterialBadgeData,
  getMaterialGradient as getMaterialGradientOriginal
};

// Default export for primary loader function
export default loadBadgeData;
