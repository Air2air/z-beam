/**
 * Content Type Detection Utility
 * 
 * Centralized content type detection to avoid scattered string checks throughout the codebase.
 * This utility provides a single source of truth for determining content types from slugs/paths.
 * 
 * @module contentTypeDetection
 */

import type { ContentType } from '@/types';

/**
 * Detect content type from a URL slug or path
 * 
 * @param slug - The URL slug/path (e.g., 'materials/metal/ferrous/steel')
 * @returns The detected content type or null for non-content pages
 * 
 * @example
 * ```typescript
 * getContentType('materials/metal/ferrous/steel') // returns 'materials'
 * getContentType('contaminants/oxidation/ferrous/rust-oxidation') // returns 'contaminants'
 * getContentType('settings/metal/ferrous/steel-settings') // returns 'settings'
 * getContentType('compounds/toxic-gas/acid-gas') // returns 'compounds'
 * getContentType('about') // returns null
 * ```
 */
export function getContentType(slug: string): ContentType | null {
  if (!slug) return null;
  
  const normalizedSlug = slug.toLowerCase();
  
  if (normalizedSlug.startsWith('materials/')) return 'materials';
  if (normalizedSlug.startsWith('settings/')) return 'settings';
  if (normalizedSlug.startsWith('contaminants/')) return 'contaminants';
  if (normalizedSlug.startsWith('compounds/')) return 'compounds';
  if (normalizedSlug.startsWith('applications/')) return 'applications';
  
  return null;
}

/**
 * Check if a slug represents a material page
 * 
 * @param slug - The URL slug/path
 * @returns True if the slug is for a material page
 */
export function isMaterialPage(slug: string): boolean {
  return getContentType(slug) === 'materials';
}

/**
 * Check if a slug represents a settings page
 * 
 * @param slug - The URL slug/path
 * @returns True if the slug is for a settings page
 */
export function isSettingsPage(slug: string): boolean {
  return getContentType(slug) === 'settings';
}

/**
 * Check if a slug represents a contaminant page
 * 
 * @param slug - The URL slug/path
 * @returns True if the slug is for a contaminant page
 */
export function isContaminantPage(slug: string): boolean {
  return getContentType(slug) === 'contaminants';
}

/**
 * Check if a slug represents a compound page
 * 
 * @param slug - The URL slug/path
 * @returns True if the slug is for a compound page
 */
export function isCompoundPage(slug: string): boolean {
  return getContentType(slug) === 'compounds';
}

/**
 * Check if a slug represents an application page
 * 
 * @param slug - The URL slug/path
 * @returns True if the slug is for an application page
 */
export function isApplicationPage(slug: string): boolean {
  return getContentType(slug) === 'applications';
}

/**
 * Get the root path for a content type
 * 
 * @param contentType - The content type
 * @returns The root path (e.g., 'materials', 'contaminants') or empty string for null
 */
export function getRootPath(contentType: ContentType | null): string {
  return contentType || '';
}

/**
 * Parse a slug into its component parts
 * 
 * @param slug - The URL slug/path (e.g., 'materials/metal/ferrous/steel')
 * @returns Object with parsed components
 * 
 * @example
 * ```typescript
 * parseSlug('materials/metal/ferrous/steel')
 * // returns { contentType: 'materials', category: 'metal', subcategory: 'ferrous', item: 'steel' }
 * 
 * parseSlug('contaminants/oxidation/ferrous')
 * // returns { contentType: 'contaminants', category: 'oxidation', subcategory: 'ferrous', item: undefined }
 * 
 * parseSlug('about')
 * // returns { contentType: null }
 * ```
 */
export function parseSlug(slug: string): {
  contentType: ContentType | null;
  category?: string;
  subcategory?: string;
  item?: string;
} {
  if (!slug) {
    return { contentType: null };
  }
  
  const parts = slug.split('/').filter(Boolean);
  const contentType = getContentType(slug);
  
  if (!contentType) {
    return { contentType: null };
  }
  
  // Remove content type prefix from parts
  const contentParts = parts.slice(1);
  
  return {
    contentType,
    category: contentParts[0],
    subcategory: contentParts[1],
    item: contentParts[2]
  };
}
