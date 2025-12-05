/**
 * Centralized URL building utilities
 * 
 * This module provides a single source of truth for URL structure across the application.
 * All components (cards, sitemaps, JSON-LD, breadcrumbs, etc.) should use these functions
 * instead of hardcoding URL patterns.
 */

import { SITE_CONFIG } from './constants';

export type ContentType = 'material' | 'service' | 'article' | 'page' | 'product' | 'equipment' | 'custom';

/**
 * Normalizes a string for use in URLs
 * Converts to lowercase, replaces spaces with hyphens, and strips parentheses
 * MANDATORY: All slugs must have parentheses stripped for clean URLs
 * 
 * @param value - String to normalize
 * @returns Normalized URL-safe string with no parentheses
 * 
 * @example
 * normalizeForUrl('Metal Alloy') // => 'metal-alloy'
 * normalizeForUrl('Stainless Steel') // => 'stainless-steel'
 * normalizeForUrl('Aluminum (Al)') // => 'aluminum-al'
 * normalizeForUrl('ABS (Plastic)') // => 'abs-plastic'
 */
export function normalizeForUrl(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, '')      // MANDATORY: Strip all parentheses
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Collapse multiple hyphens
    .replace(/^-|-$/g, '');    // Trim leading/trailing hyphens
}

export interface UrlBuildOptions {
  rootPath?: string;      // e.g., 'materials', 'products', 'equipment'
  category?: string;
  subcategory?: string;
  slug: string;
  absolute?: boolean;
}

export interface ContentMetadata {
  rootPath?: string;      // Root path for hierarchical content
  category?: string;
  subcategory?: string;
  slug: string;
  articleType?: string;   // For determining content type
  [key: string]: unknown;
}

/**
 * Determines the content type from metadata
 */
export function getContentType(metadata?: Record<string, unknown>): ContentType {
  if (!metadata) return 'page';
  
  // Check for explicit rootPath (most reliable)
  if (metadata.rootPath) {
    if (metadata.rootPath === 'materials') return 'material';
    if (metadata.rootPath === 'products') return 'product';
    if (metadata.rootPath === 'equipment') return 'equipment';
    return 'custom';
  }
  
  // Legacy: Check if it's a material (has category and subcategory)
  if (metadata.category && metadata.subcategory) {
    return 'material';
  }
  
  // Check if it's a service
  if (metadata.articleType === 'service' || metadata.category === 'services') {
    return 'service';
  }
  
  // Check if it's an article
  if (metadata.articleType === 'article') {
    return 'article';
  }
  
  return 'page';
}

/**
 * Builds a URL based on content type and metadata
 * 
 * @param options - URL building options
 * @returns Relative or absolute URL
 * 
 * @example
 * // Hierarchical content with rootPath
 * buildUrl({ rootPath: 'materials', category: 'metal', subcategory: 'ferrous', slug: 'steel-laser-cleaning' })
 * // => '/materials/metal/ferrous/steel-laser-cleaning'
 * 
 * @example
 * // Future: Products with hierarchy
 * buildUrl({ rootPath: 'products', category: 'lasers', subcategory: 'portable', slug: 'netalux-compact' })
 * // => '/products/lasers/portable/netalux-compact'
 * 
 * @example
 * // Legacy: Material (infers rootPath='materials')
 * buildUrl({ category: 'wood', subcategory: 'hardwood', slug: 'oak-laser-cleaning' })
 * // => '/materials/wood/hardwood/oak-laser-cleaning'
 * 
 * @example
 * // Simple flat page
 * buildUrl({ slug: 'contact' })
 * // => '/contact'
 */
export function buildUrl(options: UrlBuildOptions): string {
  const { rootPath, category, subcategory, slug, absolute = false } = options;
  
  let path: string;
  
  // Hierarchical URL: rootPath/category/subcategory/slug
  if (category && subcategory) {
    const root = rootPath || 'materials'; // Default to 'materials' for backward compatibility
    // Normalize category and subcategory to lowercase with hyphens for URL consistency
    const normalizedCategory = normalizeForUrl(category);
    const normalizedSubcategory = normalizeForUrl(subcategory);
    path = `/${root}/${normalizedCategory}/${normalizedSubcategory}/${slug}`;
  }
  // Flat URL: /slug (services, articles, pages)
  else {
    path = `/${slug}`;
  }
  
  return absolute ? `${SITE_CONFIG.url}${path}` : path;
}

/**
 * Builds a URL from content metadata
 * Automatically detects content type and builds appropriate URL
 * 
 * @param metadata - Content metadata object
 * @param absolute - Whether to return absolute URL
 * @returns Relative or absolute URL
 * 
 * @example
 * // Material
 * buildUrlFromMetadata({ 
 *   rootPath: 'materials',
 *   category: 'metal', 
 *   subcategory: 'ferrous', 
 *   slug: 'steel-laser-cleaning' 
 * })
 * // => '/materials/metal/ferrous/steel-laser-cleaning'
 * 
 * @example
 * // Future: Product
 * buildUrlFromMetadata({ 
 *   rootPath: 'products',
 *   category: 'lasers', 
 *   subcategory: 'portable', 
 *   slug: 'netalux-compact' 
 * })
 * // => '/products/lasers/portable/netalux-compact'
 */
export function buildUrlFromMetadata(
  metadata: ContentMetadata,
  absolute: boolean = false
): string {
  return buildUrl({
    rootPath: metadata.rootPath,
    category: metadata.category,
    subcategory: metadata.subcategory,
    slug: metadata.slug,
    absolute
  });
}

/**
 * Builds a category page URL
 * 
 * @param rootPath - Root path (e.g., 'materials', 'products')
 * @param category - Category slug
 * @param absolute - Whether to return absolute URL
 * 
 * @example
 * buildCategoryUrl('materials', 'metal')
 * // => '/materials/metal'
 * 
 * @example
 * buildCategoryUrl('products', 'lasers')
 * // => '/products/lasers'
 */
export function buildCategoryUrl(
  rootPath: string,
  category: string,
  absolute: boolean = false
): string {
  const path = `/${rootPath}/${category}`;
  return absolute ? `${SITE_CONFIG.url}${path}` : path;
}

/**
 * Builds a subcategory page URL
 * 
 * @param rootPath - Root path (e.g., 'materials', 'products')
 * @param category - Category slug
 * @param subcategory - Subcategory slug
 * @param absolute - Whether to return absolute URL
 * 
 * @example
 * buildSubcategoryUrl('materials', 'metal', 'ferrous')
 * // => '/materials/metal/ferrous'
 * 
 * @example
 * buildSubcategoryUrl('products', 'lasers', 'portable')
 * // => '/products/lasers/portable'
 */
export function buildSubcategoryUrl(
  rootPath: string,
  category: string,
  subcategory: string,
  absolute: boolean = false
): string {
  const path = `/${rootPath}/${category}/${subcategory}`;
  return absolute ? `${SITE_CONFIG.url}${path}` : path;
}

/**
 * Extracts URL components from a slug or path
 * Useful for parsing existing URLs
 * 
 * @example
 * parseUrl('/materials/metal/ferrous/steel-laser-cleaning')
 * // => { category: 'metal', subcategory: 'ferrous', slug: 'steel-laser-cleaning' }
 */
export function parseUrl(url: string): UrlBuildOptions {
  const cleanUrl = url.replace(SITE_CONFIG.url, '').replace(/^\//, '');
  const parts = cleanUrl.split('/');
  
  if (parts[0] === 'materials' && parts.length === 4) {
    return {
      category: parts[1],
      subcategory: parts[2],
      slug: parts[3]
    };
  }
  
  return {
    slug: parts[parts.length - 1]
  };
}

/**
 * Validates that a URL matches the expected structure
 * Used by validation scripts
 */
export function validateUrl(url: string, metadata: ContentMetadata): boolean {
  const expected = buildUrlFromMetadata(metadata, url.startsWith('http'));
  return url === expected;
}

/**
 * Gets all possible URL patterns for documentation/testing
 */
export function getUrlPatterns(): Record<ContentType, string> {
  return {
    material: '/materials/[category]/[subcategory]/[slug]',
    product: '/products/[category]/[subcategory]/[slug]',
    equipment: '/equipment/[category]/[subcategory]/[slug]',
    custom: '/[rootPath]/[category]/[subcategory]/[slug]',
    service: '/[slug]',
    article: '/[slug]',
    page: '/[slug]'
  };
}
