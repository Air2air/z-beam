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
 * Generate breadcrumb navigation from metadata with fullPath support
 * 
 * Priority:
 * 1. Explicit breadcrumb array from metadata (if complete)
 * 2. Build from fullPath if breadcrumbs are incomplete (missing categories)
 * 3. Fallback to Home only
 * 
 * @param metadata - Article metadata from YAML
 * @param pathname - Current URL pathname (unused, kept for backward compatibility)
 * @returns Array of breadcrumb items with label and href
 */
export function generateBreadcrumbs(
  metadata: Partial<ArticleMetadata> | null,
  _pathname: string
): BreadcrumbItem[] | null {
  // Use explicit breadcrumb array from metadata
  const breadcrumbArray = metadata?.breadcrumb;
  
  if (breadcrumbArray && Array.isArray(breadcrumbArray)) {
    // Validate that breadcrumb items have required fields
    const validBreadcrumbs = breadcrumbArray.filter(
      (item: any) => item && typeof item.label === 'string' && typeof item.href === 'string'
    );
    
    if (validBreadcrumbs.length > 0) {
      return validBreadcrumbs;
    }
  }
  
  // Return null to signal Breadcrumbs component to generate from URL
  return null;
}

/**
 * Build breadcrumbs from fullPath by extracting categories
 * Example: /settings/metal/non-ferrous/aluminum-settings
 * Returns: Home → Settings → Metal → Non-Ferrous → Aluminum
 */
function _buildBreadcrumbsFromPath(fullPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  const segments = fullPath.split('/').filter(Boolean);
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Convert segment to label (capitalize, replace hyphens)
    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Remove common suffixes from last segment if present
    if (i === segments.length - 1) {
      label = label
        .replace(/ Laser Cleaning$/, '')
        .replace(/ Settings$/, '');
    }
    
    // For the last segment, use empty href (current page)
    const href = i === segments.length - 1 ? '' : currentPath;
    
    breadcrumbs.push({ label, href });
  }
  
  return breadcrumbs;
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
