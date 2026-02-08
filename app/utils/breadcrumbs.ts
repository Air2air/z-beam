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
import { normalizeForUrl } from './urlBuilder';

/**
 * Generate breadcrumb navigation from metadata
 * 
 * @param metadata - Article metadata from YAML with explicit breadcrumb array
 * @param _pathname - Current URL pathname (unused, kept for backward compatibility)
 * @returns Array of breadcrumb items or null if no valid breadcrumbs
 */
export function generateBreadcrumbs(
  metadata: Partial<ArticleMetadata> | null,
  _pathname: string
): BreadcrumbItem[] | null {
  const breadcrumbArray = metadata?.breadcrumb;
  
  if (!breadcrumbArray || !Array.isArray(breadcrumbArray)) {
    return null;
  }

  // Filter valid breadcrumb items
  const validBreadcrumbs = breadcrumbArray.filter(
    (item: any) => item && typeof item.label === 'string' && typeof item.href === 'string'
  );
  
  if (validBreadcrumbs.length === 0) {
    return null;
  }
  
  // Ensure pageTitle is the last breadcrumb if pageTitle and fullPath exist
  if (
    metadata && 
    'pageTitle' in metadata && 
    typeof metadata.pageTitle === 'string' && 
    metadata.pageTitle &&
    'fullPath' in metadata && 
    typeof metadata.fullPath === 'string' &&
    metadata.fullPath
  ) {
    ensurePageTitleAsLastBreadcrumb(validBreadcrumbs, metadata.pageTitle, metadata.fullPath);
  }
  
  return validBreadcrumbs;
}

/**
 * Ensure pageTitle is the last breadcrumb item
 */
function ensurePageTitleAsLastBreadcrumb(
  breadcrumbs: BreadcrumbItem[],
  pageTitle: string,
  fullPath?: string
): void {
  // If last breadcrumb already has the pageTitle, don't modify
  if (breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].label === pageTitle) {
    return;
  }

  const currentPath = normalizeHref(fullPath);
  
  // Find existing pageTitle breadcrumb
  const existingIndex = breadcrumbs.findIndex(crumb => crumb.label === pageTitle);
  
  if (existingIndex !== -1) {
    // Remove existing pageTitle and add to end
    breadcrumbs.splice(existingIndex, 1);
  }
  
  // Add or replace last breadcrumb with pageTitle
  if (breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].href === currentPath) {
    breadcrumbs[breadcrumbs.length - 1].label = pageTitle;
  } else {
    breadcrumbs.push({ label: pageTitle, href: currentPath });
  }
}

/**
 * Normalize href path for consistency
 */
function normalizeHref(path?: string): string {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
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
