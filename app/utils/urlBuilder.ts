/**
 * Centralized URL building utilities
 * 
 * This module provides a single source of truth for URL structure across the application.
 * All components (cards, sitemaps, JSON-LD, breadcrumbs, etc.) should use these functions
 * instead of hardcoding URL patterns.
 */

import { SITE_CONFIG } from './constants';

export type ContentType = 'material' | 'service' | 'article' | 'page';

export interface UrlBuildOptions {
  category?: string;
  subcategory?: string;
  slug: string;
  absolute?: boolean;
}

export interface MaterialMetadata {
  category?: string;
  subcategory?: string;
  slug: string;
  [key: string]: unknown;
}

/**
 * Determines the content type from metadata
 */
export function getContentType(metadata?: Record<string, unknown>): ContentType {
  if (!metadata) return 'page';
  
  // Check if it's a material (has category and subcategory)
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
 * // Material with category/subcategory
 * buildUrl({ category: 'metal', subcategory: 'ferrous', slug: 'steel-laser-cleaning' })
 * // => '/materials/metal/ferrous/steel-laser-cleaning'
 * 
 * @example
 * // Material with absolute URL
 * buildUrl({ category: 'wood', subcategory: 'hardwood', slug: 'oak-laser-cleaning', absolute: true })
 * // => 'https://www.z-beam.com/materials/wood/hardwood/oak-laser-cleaning'
 * 
 * @example
 * // Simple page (no category/subcategory)
 * buildUrl({ slug: 'contact' })
 * // => '/contact'
 */
export function buildUrl(options: UrlBuildOptions): string {
  const { category, subcategory, slug, absolute = false } = options;
  
  let path: string;
  
  // Material with full hierarchy
  if (category && subcategory) {
    path = `/materials/${category}/${subcategory}/${slug}`;
  }
  // Fallback to flat URL (services, articles, pages)
  else {
    path = `/${slug}`;
  }
  
  return absolute ? `${SITE_CONFIG.url}${path}` : path;
}

/**
 * Builds a URL from article metadata
 * Automatically detects content type and builds appropriate URL
 * 
 * @param metadata - Article metadata object
 * @param absolute - Whether to return absolute URL
 * @returns Relative or absolute URL
 * 
 * @example
 * buildUrlFromMetadata({ 
 *   category: 'metal', 
 *   subcategory: 'ferrous', 
 *   slug: 'steel-laser-cleaning' 
 * })
 * // => '/materials/metal/ferrous/steel-laser-cleaning'
 */
export function buildUrlFromMetadata(
  metadata: MaterialMetadata,
  absolute: boolean = false
): string {
  return buildUrl({
    category: metadata.category,
    subcategory: metadata.subcategory,
    slug: metadata.slug,
    absolute
  });
}

/**
 * Builds a category page URL
 * 
 * @example
 * buildCategoryUrl('metal')
 * // => '/materials/metal'
 */
export function buildCategoryUrl(category: string, absolute: boolean = false): string {
  const path = `/materials/${category}`;
  return absolute ? `${SITE_CONFIG.url}${path}` : path;
}

/**
 * Builds a subcategory page URL
 * 
 * @example
 * buildSubcategoryUrl('metal', 'ferrous')
 * // => '/materials/metal/ferrous'
 */
export function buildSubcategoryUrl(
  category: string,
  subcategory: string,
  absolute: boolean = false
): string {
  const path = `/materials/${category}/${subcategory}`;
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
export function validateUrl(url: string, metadata: MaterialMetadata): boolean {
  const expected = buildUrlFromMetadata(metadata, url.startsWith('http'));
  return url === expected;
}

/**
 * Gets all possible URL patterns for documentation/testing
 */
export function getUrlPatterns(): Record<ContentType, string> {
  return {
    material: '/materials/[category]/[subcategory]/[slug]',
    service: '/[slug]',
    article: '/[slug]',
    page: '/[slug]'
  };
}
