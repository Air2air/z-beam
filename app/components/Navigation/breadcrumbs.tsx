// app/components/breadcrumbs.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { BreadcrumbItem, BreadcrumbsProps } from "@/types";
import { capitalizeWords } from "../../utils/formatting";
import { SITE_CONFIG } from "@/app/config/site";

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
  const [isEmbedded, setIsEmbedded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      setIsEmbedded(true);
    }
  }, []);

  if (isEmbedded) {
    return null;
  }
  
  // Priority 1: Use frontmatter-provided breadcrumb data
  let allBreadcrumbs: BreadcrumbItem[];
  
  if (breadcrumbData && breadcrumbData.length > 0) {
    allBreadcrumbs = breadcrumbData;
  } else {
    // Priority 2: Generate from URL (fallback)
    allBreadcrumbs = generateBreadcrumbsFromUrl(pathname);
  }
  
  return (
    <nav className="flex breadcrumb-padding" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
      <ol className="inline-flex flex-wrap items-center breadcrumb-list">
        {allBreadcrumbs.map((crumb, index) => {
          const isLast = index === allBreadcrumbs.length - 1;
          
          return (
            <li 
              key={crumb.href + '-' + index} 
              className="breadcrumb-item inline-flex items-center"
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              {/* Hidden absolute URL for Schema.org */}
              <meta itemProp="item" content={crumb.href.startsWith('http') ? crumb.href : `${SITE_CONFIG.url}${crumb.href}`} />
              <meta itemProp="position" content={String(index + 1)} />
              
              {isLast ? (
                // Last item: link with aria-current="page" per W3C spec
                <Link
                  href={crumb.href}
                  aria-current="page"
                  onClick={(e) => e.preventDefault()}
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : crumb.isCrossNav ? (
                // Cross-navigation link (e.g., Materials → Settings): distinct styling
                <Link
                  href={crumb.href}
                  className="font-medium"
                  title={`View ${crumb.label}`}
                >
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : crumb.href ? (
                // Other items are normal links
                <Link href={crumb.href}>
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : (
                // Item without href (fallback)
                <span itemProp="name">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
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
  
  let currentPathAccumulator = ""; // To build hrefs correctly
  
  segments.forEach((segment, index) => {
    currentPathAccumulator += `/${segment}`;
    
    // Generate the label (e.g., "my-material" -> "My Material")
    const label = capitalizeWords(segment);
    
    allBreadcrumbs.push({ href: currentPathAccumulator, label });
  });
  
  return allBreadcrumbs;
}