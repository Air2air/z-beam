/**
 * @component MaterialCard
 * @purpose Material article card with thumbnail image, badge, and metadata display
 * @dependencies @/types (CardProps, ArticleMetadata, BadgeData), Thumbnail, BadgeSymbol
 * @related CardGrid.tsx, Thumbnail/Thumbnail.tsx, BadgeSymbol/BadgeSymbol.tsx
 * @complexity Low (140 lines, single standard variant)
 * @aiContext Import CardProps from @/types. Badge is optional.
 *           frontmatter contains article metadata. href is required for navigation.
 */
// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import Link from "next/link";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { BadgeData, ArticleMetadata, CardProps } from "@/types";
import { SITE_CONFIG } from "../../utils/constants";

// MaterialCard configuration with variant support
const CARD_CONFIG = {
  default: {
    // Layout
    padding: "px-3 py-3 md:px-4 md:py-2.5",
    imageHeight: "h-[6.75rem] md:h-[7.5rem]", // Fixed height for default cards
    cardHeight: "h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem]", // Default height
    
    // Typography
    titleClass: "card-title text-base truncate text-primary font-medium",
    descriptionClass: "text-primary text-xs line-clamp-2",
    
    // Appearance
    cardClass: "rounded-lg shadow-md overflow-hidden",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-300 ease-out",
  },
  featured: {
    // Layout
    padding: "px-3 py-3 md:px-4 md:py-2.5",
    imageHeight: "h-full", // Full height for featured cards - image expands to fill card
    cardHeight: "h-full min-h-[8rem] md:min-h-[10rem] lg:min-h-[12rem]", // Increased height for featured cards (Services/Equipment Rental)
    
    // Typography
    titleClass: "card-title text-base truncate text-primary font-medium",
    descriptionClass: "text-primary text-xs line-clamp-2",
    
    // Appearance
    cardClass: "rounded-lg shadow-md overflow-hidden",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-300 ease-out",
  }
} as const;

export function MaterialCard({
  frontmatter,
  href,
  badge, // Re-enabled for BadgeSymbol support
  className = "",
  variant = "default",
}: CardProps) {
  // Select configuration based on variant with fallback to default
  const config = CARD_CONFIG[variant] || CARD_CONFIG.default;
  
  // Extract slug from href (e.g., "/materials/silicon-nitride" -> "silicon-nitride")
  const slug = href?.split('/').pop() || '';
  
  // Get data from frontmatter only
  const title = frontmatter?.title || '';
  const subject = frontmatter?.subject || ''; // Use subject instead of name
  const imageAlt = frontmatter?.images?.hero?.alt || '';
  
  // Create absolute URL for Schema.org (relative href won't work for SEO)
  const absoluteUrl = href?.startsWith('http') ? href : `${SITE_CONFIG.url}${href || ''}`;
  
  // Check if this is a featured card by examining the className
  return (
    <Link
      href={href}
      className={`
        group block card-hover-interactive ${config.cardClass} ${config.cardHeight} ${className} ${config.hoverEffect} ${config.transitionClass}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
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
        <meta itemProp="url" content={absoluteUrl} />
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
        {/* Image metadata */}
        {frontmatter?.images?.hero?.url && (
          <meta 
            itemProp="image" 
            content={
              frontmatter.images.hero.url.startsWith('http') 
                ? frontmatter.images.hero.url 
                : `${SITE_CONFIG.url}${frontmatter.images.hero.url}`
            } 
          />
        )}
        {/* Author metadata */}
        {frontmatter?.author && (
          <meta 
            itemProp="author" 
            content={typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author.name} 
          />
        )}
        
        {/* Full Height Image Container */}
        <section className={`relative w-full ${config.imageHeight} overflow-hidden bg-secondary`} aria-label="Material image">
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

          {/* Material Title Bar - displays material name with navigation indicator */}
          <header className={`${config.titleBarClass} ${config.padding} z-10`} role="banner" aria-label="Material card title">
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
              </div>
              
              {/* Navigation arrow indicator */}
              <svg 
                className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-out flex-shrink-0" 
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

// Export with semantic name and maintain backwards compatibility
export { MaterialCard as Card };
