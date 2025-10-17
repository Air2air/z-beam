/**
 * @component Card
 * @purpose Ind  featured: {
    // Layout
    padding: "p-3 md:p-4",
    imageHeight: "h-full", // Full height image
    cardHeight: "h-full min-h-[16rem]", // Fixed min-height across all breakpoints - not responsive
    
    // Typography
    titleClass: "card-title text-xl text-white truncate",
    descriptionClass: "text-gray-200 text-sm line-clamp-3",rticle card with thumbnail, badge, and metadata display
 * @dependencies @/types (CardProps, ArticleMetadata, BadgeData), Thumbnail, BadgeSymbol
 * @related CardGrid.tsx, Thumbnail/Thumbnail.tsx, BadgeSymbol/BadgeSymbol.tsx
 * @complexity Low (140 lines, 4 variants: standard, compact, featured, preview)
 * @aiContext Import CardProps from @/types. Use variant prop for styling. Badge is optional.
 *           frontmatter contains article metadata. href is required for navigation.
 */
// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import Link from "next/link";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { BadgeData, ArticleMetadata, CardProps } from "@/types";

// Card variant configurations
const CARD_VARIANTS = {
  standard: {
    // Layout
    padding: "p-2 md:p-3",
    imageHeight: "h-[11rem] md:h-[13rem]", // Responsive image - taller on larger screens
    cardHeight: "h-full min-h-[9rem] md:min-h-[11rem] lg:min-h-[12rem]", // Responsive card height - smaller on mobile
    
    // Typography
    titleClass: "card-title text-base text-white truncate",
    descriptionClass: "text-gray-200 text-xs line-clamp-2",
    
    // Appearance
    cardClass: "rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-300 ease-out",
  },
  featured: {
    // Layout
    padding: "p-3 md:p-4",
    imageHeight: "h-full", // Full height image
    cardHeight: "h-full min-h-[16rem]", // Fixed min-height across all breakpoints - not responsive
    
    // Typography
    titleClass: "card-title text-xl text-white truncate",
    descriptionClass: "text-gray-200 text-sm line-clamp-3",
    
    // Appearance
    cardClass: "rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-400 ease-out",
  },
} as const;

type CardVariant = keyof typeof CARD_VARIANTS;

export function Card({
  frontmatter,
  href,
  badge, // Re-enabled for BadgeSymbol support
  className = "",
  variant = "standard", // Default to standard variant
}: CardProps) {
  // Get variant configuration
  const config = CARD_VARIANTS[variant];
  
  // Extract slug from href (e.g., "/materials/silicon-nitride" -> "silicon-nitride")
  const slug = href?.split('/').pop() || '';
  
  // Get data from frontmatter only
  const title = frontmatter?.title || '';
  const subject = frontmatter?.subject || ''; // Use subject instead of name
  const imageAlt = frontmatter?.images?.hero?.alt || '';
  
  // Check if this is a featured card by examining the className
  return (
    <Link
      href={href}
      className={`
        group block card-hover-interactive ${config.cardClass} ${config.cardHeight} ${className} ${config.hoverEffect} ${config.transitionClass}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      `}
      aria-label={`View details for ${subject || title}`}
    >
      <article 
        className="relative flex flex-col h-full card-container" 
        role="article"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* Schema.org metadata */}
        <meta itemProp="url" content={href} />
        <meta itemProp="headline" content={subject || title} />
        {frontmatter?.description && (
          <meta itemProp="description" content={frontmatter.description} />
        )}
        {/* Date metadata */}
        {frontmatter?.datePublished && (
          <meta itemProp="datePublished" content={frontmatter.datePublished} />
        )}
        {frontmatter?.lastModified && (
          <meta itemProp="dateModified" content={frontmatter.lastModified} />
        )}
        
        {/* Full Height Image Container */}
        <section className={`relative w-full ${config.imageHeight} overflow-hidden bg-gray-50 dark:bg-gray-800`} aria-label="Material image">
          <Thumbnail
            alt={imageAlt || subject || title || (frontmatter?.subject ? frontmatter.subject : 'Image')}
            frontmatter={frontmatter}
            objectFit="cover"
            priority={false}
          />

          {/* BadgeSymbol overlay for cards */}
          {badge && badge.symbol && (
            <div className="absolute top-2 right-2 z-20">
              <BadgeSymbol
                content=""
                config={{
                  symbol: badge.symbol,
                  materialType: badge.materialType,
                  atomicNumber: typeof badge.atomicNumber === 'number' ? badge.atomicNumber : 
                               typeof badge.atomicNumber === 'string' ? parseInt(badge.atomicNumber) : undefined,
                  formula: badge.formula,
                  variant: "card"
                }}
              />
            </div>
          )}

          {/* Title Bar Overlay with 80% opacity */}
          <header className={`${config.titleBarClass} ${config.padding} z-10`} role="banner">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                <h3 
                  className={`${config.titleClass}`} 
                  id={`card-title-${slug}`}
                  itemProp="name"
                >
                  {/* Prioritize subject over title */}
                  {subject || title}
                </h3>
                
                {/* Display dates with time elements if available */}
                {(frontmatter?.datePublished || frontmatter?.lastModified) && (
                  <div className="text-xs text-gray-300 mt-1">
                    {frontmatter?.datePublished && (
                      <time dateTime={frontmatter.datePublished}>
                        {new Date(frontmatter.datePublished).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </time>
                    )}
                    {frontmatter?.lastModified && frontmatter.lastModified !== frontmatter.datePublished && (
                      <>
                        <span className="mx-1">•</span>
                        <time dateTime={frontmatter.lastModified} title="Last updated">
                          Updated {new Date(frontmatter.lastModified).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </time>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Arrow-right icon */}
              <svg 
                className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-out flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="presentation"
                focusable="false"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
          </header>
        </section>
      </article>
    </Link>
  );
}
