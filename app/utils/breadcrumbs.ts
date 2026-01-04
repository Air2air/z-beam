// app/utils/breadcrumbs.ts
/**
 * SEO Infrastructure - Breadcrumb Navigation Generator
 * 
 * Part of the SEO Infrastructure layer that generates navigation hierarchy
 * for both user navigation and search engine understanding.
 * 
 * @purpose Centralized breadcrumb handling from explicit metadata
 * @usage Import generateBreadcrumbs() and pass metadata + pathname
 * @priority Explicit breadcrumb array in metadata only
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 */

import { ArticleMetadata, BreadcrumbItem } from '@/types';

/**
 * Generate breadcrumb navigation from explicit metadata only
 * 
 * All breadcrumbs must be explicitly defined in YAML metadata.
 * No auto-generation or URL parsing fallbacks.
 * 
 * @param metadata - Article metadata from YAML
 * @param pathname - Current URL pathname (unused, kept for backward compatibility)
 * @returns Array of breadcrumb items with label and href
 */
export function generateBreadcrumbs(
  metadata: Partial<ArticleMetadata> | null,
  _pathname: string
): BreadcrumbItem[] {
  // Default fallback: Home only
  const defaultBreadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  // Use explicit breadcrumb array from metadata (check both singular and plural)
  const breadcrumbArray = metadata?.breadcrumbs || metadata?.breadcrumb;
  
  if (breadcrumbArray && Array.isArray(breadcrumbArray)) {
    // Validate that breadcrumb items have required fields
    const validBreadcrumbs = breadcrumbArray.filter(
      (item: any) => item && typeof item.label === 'string' && typeof item.href === 'string'
    );
    
    if (validBreadcrumbs.length > 0) {
      return validBreadcrumbs;
    }
  }
  
  // Return default if no valid breadcrumbs found
  return defaultBreadcrumbs;
}

/**
 * Convert breadcrumbs to schema.org BreadcrumbList JSON-LD
 * 
 * @param breadcrumbs - Array of breadcrumb items
 * @param baseUrl - Site base URL (e.g., https://z-beam.com)
 * @returns Schema.org BreadcrumbList object
 */
export function breadcrumbsToSchema(
  breadcrumbs: BreadcrumbItem[],
  baseUrl: string
): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${baseUrl}${crumb.href}`
    }))
  };
}
