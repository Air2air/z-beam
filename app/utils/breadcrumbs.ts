// app/utils/breadcrumbs.ts
/**
 * @purpose Centralized breadcrumb handling from explicit frontmatter
 * @usage Import generateBreadcrumbs() and pass frontmatter + pathname
 * @priority Explicit breadcrumb array in frontmatter only
 */

import { ArticleMetadata, BreadcrumbItem } from '@/types';

/**
 * Generate breadcrumb navigation from explicit frontmatter only
 * 
 * All breadcrumbs must be explicitly defined in YAML frontmatter.
 * No auto-generation or URL parsing fallbacks.
 * 
 * @param frontmatter - Article metadata from YAML frontmatter
 * @param pathname - Current URL pathname (unused, kept for backward compatibility)
 * @returns Array of breadcrumb items with label and href
 */
export function generateBreadcrumbs(
  frontmatter: Partial<ArticleMetadata> | null,
  pathname: string
): BreadcrumbItem[] {
  // Default fallback: Home only
  const defaultBreadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  // Use explicit breadcrumb array from frontmatter
  if (frontmatter?.breadcrumb && Array.isArray(frontmatter.breadcrumb)) {
    // Validate that breadcrumb items have required fields
    const validBreadcrumbs = frontmatter.breadcrumb.filter(
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
