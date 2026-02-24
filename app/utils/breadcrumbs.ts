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
 * Priority:
 * 1. Explicit `breadcrumb` array in metadata (authoritative)
 * 2. Auto-derived from `fullPath` when no explicit array is present —
 *    `fullPath` is a required field that encodes the full URL hierarchy,
 *    so breadcrumbs can always be deterministically constructed from it.
 * 
 * @param metadata - Article metadata from YAML with optional breadcrumb array
 * @param _pathname - Current URL pathname (unused, kept for backward compatibility)
 * @returns Array of breadcrumb items or null if no valid breadcrumbs
 */
export function generateBreadcrumbs(
  metadata: Partial<ArticleMetadata> | null,
  _pathname: string
): BreadcrumbItem[] | null {
  // Priority 1: Explicit breadcrumb array in metadata
  const breadcrumbArray = metadata?.breadcrumb;
  
  if (breadcrumbArray && Array.isArray(breadcrumbArray)) {
    const validBreadcrumbs = breadcrumbArray.filter(
      (item: any) => item && typeof item.label === 'string' && typeof item.href === 'string'
    );
    
    if (validBreadcrumbs.length > 0) {
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
  }

  // Priority 2: Auto-derive from fullPath (always present on content pages)
  // Use 'in' narrowing since fullPath/pageTitle aren't on ArticleMetadata type
  // but are present at runtime on all content frontmatter objects
  if (metadata && 'fullPath' in metadata && typeof metadata.fullPath === 'string' && metadata.fullPath) {
    const pageTitle = 'pageTitle' in metadata && typeof metadata.pageTitle === 'string'
      ? metadata.pageTitle
      : undefined;
    return deriveBreadcrumbsFromPath(metadata.fullPath as string, pageTitle);
  }

  return null;
}

/**
 * Derive breadcrumb trail from a URL path.
 * Converts `/materials/metal/non-ferrous/aluminum-laser-cleaning` into:
 *   Home → Materials → Metal → Non-Ferrous → Aluminum Laser Cleaning
 */
function deriveBreadcrumbsFromPath(
  fullPath: string,
  pageTitle?: string
): BreadcrumbItem[] | null {
  const segments = fullPath.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  let accumulatedPath = '';

  for (let i = 0; i < segments.length; i++) {
    accumulatedPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    // Use explicit pageTitle for the leaf node if available
    const label = isLast && pageTitle
      ? pageTitle
      : toTitleCase(segments[i]);
    breadcrumbs.push({ label, href: accumulatedPath });
  }

  return breadcrumbs;
}

/**
 * Convert a hyphenated URL slug to Title Case label.
 * e.g., "non-ferrous" → "Non-Ferrous", "peek-laser-cleaning" → "Peek Laser Cleaning"
 */
function toTitleCase(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
