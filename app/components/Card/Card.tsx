/**
 * @component MaterialCard
 * @purpose Material article card with thumbnail image, badge, and metadata display
 * @dependencies @/types (CardProps, ArticleMetadata, BadgeData), Thumbnail, BadgeSymbol
 * @related CardGrid.tsx, Thumbnail/Thumbnail.tsx, BadgeSymbol/BadgeSymbol.tsx
 * @complexity Low (optimized: config externalized, semantic classes)
 * @aiContext Import CardProps from @/types. Badge is optional.
 *           frontmatter contains article metadata. href is required for navigation.
 */
// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import Link from "next/link";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { CardProps } from "@/types";
import { SITE_CONFIG } from "@/config/site";
import { getCardVariant } from "@/app/config/card-variants";

export function MaterialCard({
  frontmatter,
  href,
  badge, // Re-enabled for BadgeSymbol support
  className = "",
  variant = "default",
  imageUrl: explicitImageUrl,
  imageAlt: explicitImageAlt
}: CardProps) {
  // Select configuration based on variant with fallback to default
  const config = getCardVariant(variant);
  
  // Extract slug from href (e.g., "/materials/silicon-nitride" -> "silicon-nitride")
  const slug = href?.split('/').pop() || '';
  
  // Safety check: href is required for Link component
  if (!href) {
    console.error('Card component received undefined href for:', frontmatter?.title || 'unknown');
    return null;
  }
  
  // Use explicit props first (for serialization), then fallback to frontmatter
  const title = frontmatter?.title || '';
  const subject = frontmatter?.subject || ''; // Use subject instead of name
  const imageUrl = explicitImageUrl || frontmatter?.images?.hero?.url || '';
  const imageAlt = explicitImageAlt || frontmatter?.images?.hero?.alt || '';
  
  // Create absolute URL for SEO Infrastructure structured data (relative href won't work)
  const absoluteUrl = href?.startsWith('http') ? href : `${SITE_CONFIG.url}${href || ''}`;
  
  // Check if this is a featured card by examining the className
  return (
    <Link
      href={href}
      className={`
        group card-base ${config.cardHeight} ${className} ${config.hoverEffect} transition-smooth
        card-focus
      `}
      aria-label={`View details for ${subject || title}`}
    >
      <article 
        className="absolute-inset"
        role="article"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* SEO Infrastructure: Schema.org structured data for rich results */}
        <meta itemProp="url" content={absoluteUrl} />
        <meta itemProp="headline" content={subject || title} />
        {frontmatter?.description && (
          <meta itemProp="description" content={frontmatter.description} />
        )}
        {/* SEO Infrastructure: Date metadata for search engines */}
        {frontmatter?.datePublished && (
          <meta itemProp="datePublished" content={frontmatter.datePublished} />
        )}
        {frontmatter?.lastModified && (
          <meta itemProp="dateModified" content={frontmatter.lastModified} />
        )}
        {/* SEO Infrastructure: Image metadata for search results */}
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
        {/* SEO Infrastructure: Author metadata for E-E-A-T */}
        {frontmatter?.author && (
          <meta 
            itemProp="author" 
            content={typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author.name} 
          />
        )}
        
        {/* Standard Material Card - Image with overlay */}
        <div className={`relative w-full h-full bg-secondary`}>
            <Thumbnail
              alt={imageAlt || subject || title || (frontmatter?.subject ? frontmatter.subject : 'Image')}
              frontmatter={frontmatter}
              imageUrl={imageUrl}
              objectFit="cover"
              priority={false}
            />

            {/* BadgeSymbol overlay for cards */}
            {badge && badge.symbol && (
              <div className="absolute-top-right z-20">
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
              <div className="flex-between">
                <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                  <h3 
                    className={`${config.titleClass} text-truncate`} 
                    id={`card-title-${slug}`}
                    itemProp="name"
                  >
                    {/* Prioritize subject over title */}
                    {subject || title}
                  </h3>
                </div>
                
                {/* Navigation arrow indicator */}
                <svg 
                  className="w-4 h-4 text-primary opacity-80 transition-smooth flex-shrink-0" 
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
          </div>
      </article>
    </Link>
  );
}

// Export with semantic name and maintain backwards compatibility
export { MaterialCard as Card };
