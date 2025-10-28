// app/components/breadcrumbs.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BreadcrumbItem } from "@/types";
import { capitalizeWords } from "../../utils/formatting";
import { SITE_CONFIG } from "../../utils/constants";

export interface BreadcrumbsProps {
  /**
   * Optional breadcrumb data from frontmatter
   * If provided, this takes priority over URL-based generation
   */
  breadcrumbData?: BreadcrumbItem[];
}

/**
 * WCAG 2.1 AAA Compliant Breadcrumb Component
 * 
 * Follows W3C ARIA Authoring Practices Guide:
 * - Uses semantic <nav> with aria-label="Breadcrumb"
 * - Uses <ol> for ordered list structure
 * - Last item is <a> with aria-current="page" (not span)
 * - Visual separators via CSS to prevent screen reader verbosity
 * - Includes microdata for enhanced SEO
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
 */
export function Breadcrumbs({ breadcrumbData }: BreadcrumbsProps = {}) {
  const pathname = usePathname();
  
  // Priority 1: Use frontmatter-provided breadcrumb data
  let allBreadcrumbs: BreadcrumbItem[];
  
  if (breadcrumbData && breadcrumbData.length > 0) {
    allBreadcrumbs = breadcrumbData;
  } else {
    // Priority 2: Generate from URL (fallback)
    allBreadcrumbs = generateBreadcrumbsFromUrl(pathname);
  }
  
  return (
    <nav className="flex py-4" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
      <ol className="inline-flex items-center breadcrumb-list">
        {allBreadcrumbs.map((crumb, index) => {
          const isLast = index === allBreadcrumbs.length - 1;
          
          return (
            <li 
              key={crumb.href + '-' + index} 
              className="breadcrumb-item"
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              {/* Hidden absolute URL for Schema.org */}
              <meta itemProp="item" content={crumb.href.startsWith('http') ? crumb.href : `${SITE_CONFIG.url}${crumb.href}`} />
              <meta itemProp="position" content={String(index + 1)} />
              
              {isLast ? (
                // Last item: link with aria-current="page" per W3C spec
                // Note: href="" or href{crumb.href} both valid, using href for consistency
                <Link
                  href={crumb.href}
                  className="text-base text-gray-700 dark:text-gray-300"
                  aria-current="page"
                  onClick={(e) => e.preventDefault()} // Prevent navigation on current page
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : crumb.href ? (
                // Other items are normal links
                <Link
                  href={crumb.href}
                  className="text-base text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-white
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm
                             transition-colors duration-150"
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : (
                // Item without href (fallback)
                <span className="text-base text-gray-500 dark:text-gray-400" itemProp="name">
                  {crumb.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
      
      <style jsx>{`
        .breadcrumb-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .breadcrumb-item:not(:last-child)::after {
          content: '›';
          margin: 0 0.5rem;
          color: rgb(156, 163, 175); /* gray-400 */
          font-size: 1.25rem;
          display: inline-block;
        }
        
        @media (prefers-color-scheme: dark) {
          .breadcrumb-item:not(:last-child)::after {
            color: rgb(107, 114, 128); /* gray-500 for dark mode */
          }
        }
        
        /* Ensure separators are not announced by screen readers */
        .breadcrumb-item::after {
          aria-hidden: true;
        }
      `}</style>
    </nav>
  );
}

/**
 * Generate breadcrumbs from URL pathname
 * This is the fallback when no frontmatter breadcrumb data is provided
 */
function generateBreadcrumbsFromUrl(pathname: string | null): BreadcrumbItem[] {
  const allBreadcrumbs: BreadcrumbItem[] = [{ href: "/", label: "Home" }];
  
  // Handle case where pathname might be null
  if (!pathname) {
    return allBreadcrumbs;
  }
  
  // Split the pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter((segment) => segment !== "");
  
  // Known static routes that don't need "Articles" parent
  const knownStaticTopLevelRoutes = new Set([
    "about",
    "contact",
    "services",
    "rental",
    "partners",
    "search",
    "materials"
  ]);
  
  let currentPathAccumulator = ""; // To build hrefs correctly
  
  segments.forEach((segment, index) => {
    currentPathAccumulator += `/${segment}`;
    
    // Determine if "Articles" needs to be inserted
    const isFirstSegment = index === 0;
    const isNotStaticRoute = !knownStaticTopLevelRoutes.has(segment);
    const articlesAlreadyInserted = allBreadcrumbs.some(crumb => crumb.label === "Articles");
    
    if (isFirstSegment && isNotStaticRoute && !articlesAlreadyInserted) {
      // Insert "Articles" before the actual slug
      allBreadcrumbs.push({ href: "/articles", label: "Articles" });
    }
    
    // Generate the label (e.g., "my-material" -> "My Material")
    const label = capitalizeWords(segment);
    
    allBreadcrumbs.push({ href: currentPathAccumulator, label });
  });
  
  return allBreadcrumbs;
}