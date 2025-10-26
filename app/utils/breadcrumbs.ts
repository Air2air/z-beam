// app/utils/breadcrumbs.ts
/**
 * @purpose Centralized breadcrumb generation from frontmatter, category, or URL
 * @usage Import generateBreadcrumbs() and pass frontmatter + pathname
 * @priority 1. frontmatter.breadcrumb, 2. category/subcategory, 3. URL parsing
 */

import { ArticleMetadata, BreadcrumbItem } from '@/types';
import { capitalizeWords } from './formatting';

/**
 * Generate breadcrumb navigation from frontmatter, category, or URL fallback
 * 
 * Priority order:
 * 1. Explicit breadcrumb array in frontmatter
 * 2. Auto-generate from category/subcategory/name
 * 3. Parse from URL pathname
 * 
 * @param frontmatter - Article metadata from YAML frontmatter
 * @param pathname - Current URL pathname (e.g., /aluminum-laser-cleaning)
 * @returns Array of breadcrumb items with label and href
 */
export function generateBreadcrumbs(
  frontmatter: Partial<ArticleMetadata> | null,
  pathname: string
): BreadcrumbItem[] {
  // Always start with Home
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  // Priority 1: Explicit breadcrumb array from frontmatter
  if (frontmatter?.breadcrumb && Array.isArray(frontmatter.breadcrumb)) {
    // Validate that breadcrumb items have required fields
    const validBreadcrumbs = frontmatter.breadcrumb.filter(
      (item: any) => item && typeof item.label === 'string' && typeof item.href === 'string'
    );
    
    if (validBreadcrumbs.length > 0) {
      // Replace Home if first item is Home, otherwise append
      if (validBreadcrumbs[0].label === 'Home') {
        return validBreadcrumbs;
      }
      return [...breadcrumbs, ...validBreadcrumbs.slice(1)];
    }
  }
  
  // Priority 2: Auto-generate from category/subcategory/name
  if (frontmatter?.category) {
    // Add category page
    const categoryLabel = capitalizeWords(frontmatter.category);
    const categorySlug = frontmatter.category.toLowerCase().replace(/\s+/g, '-');
    breadcrumbs.push({ 
      label: categoryLabel, 
      href: `/materials/${categorySlug}` 
    });
    
    // Add subcategory page if present
    if (frontmatter.subcategory) {
      const subcategoryLabel = capitalizeWords(frontmatter.subcategory);
      const subcategorySlug = frontmatter.subcategory.toLowerCase().replace(/\s+/g, '-');
      breadcrumbs.push({ 
        label: subcategoryLabel, 
        href: `/materials/${categorySlug}/${subcategorySlug}` 
      });
    }
    
    // Add material name (current page)
    if (frontmatter.name) {
      breadcrumbs.push({ 
        label: frontmatter.name, 
        href: pathname 
      });
    } else {
      // Fallback: use last segment of pathname as label
      const segments = pathname.split('/').filter(s => s);
      const lastSegment = segments[segments.length - 1];
      if (lastSegment) {
        breadcrumbs.push({
          label: capitalizeWords(lastSegment),
          href: pathname
        });
      }
    }
    
    return breadcrumbs;
  }
  
  // Priority 3: Parse from URL pathname (fallback)
  return generateBreadcrumbsFromUrl(pathname);
}

/**
 * Generate breadcrumbs from URL pathname
 * This is the fallback when no frontmatter is available
 * 
 * @param pathname - Current URL pathname
 * @returns Array of breadcrumb items
 */
function generateBreadcrumbsFromUrl(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  if (!pathname || pathname === '/') {
    return breadcrumbs;
  }
  
  // Split pathname into segments
  const segments = pathname.split('/').filter(segment => segment !== '');
  
  // Known static routes that don't need "Articles" parent
  const knownStaticRoutes = new Set([
    'about',
    'contact',
    'services',
    'rental',
    'partners',
    'search',
    'materials'
  ]);
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Insert "Articles" before first segment if not a static route
    const isFirstSegment = index === 0;
    const isNotStaticRoute = !knownStaticRoutes.has(segment);
    const articlesNotInserted = !breadcrumbs.some(crumb => crumb.label === 'Articles');
    
    if (isFirstSegment && isNotStaticRoute && articlesNotInserted) {
      breadcrumbs.push({ label: 'Articles', href: '/articles' });
    }
    
    // Add current segment
    const label = capitalizeWords(segment);
    breadcrumbs.push({ label, href: currentPath });
  });
  
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
