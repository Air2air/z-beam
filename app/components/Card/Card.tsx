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
import { SITE_CONFIG } from "../../utils/constants";
import { getCardVariant } from "@/app/config/card-variants";

export function MaterialCard({
  frontmatter,
  href,
  badge, // Re-enabled for BadgeSymbol support
  className = "",
  variant = "default",
}: CardProps) {
  // Select configuration based on variant with fallback to default
  const config = getCardVariant(variant);
  
  // Extract slug from href (e.g., "/materials/silicon-nitride" -> "silicon-nitride")
  const slug = href?.split('/').pop() || '';
  
  // Get data from frontmatter only
  const title = frontmatter?.title || '';
  const subject = frontmatter?.subject || ''; // Use subject instead of name
  const imageAlt = frontmatter?.images?.hero?.alt || '';
  
  // Create absolute URL for SEO Infrastructure structured data (relative href won't work)
  const absoluteUrl = href?.startsWith('http') ? href : `${SITE_CONFIG.url}${href || ''}`;
  
  // Get severity from frontmatter metadata for color-coding
  const severity = (frontmatter as any)?.severity;
  const isDomainLinkage = variant === 'domain-linkage';
  
  // Apply severity-based styling for domain linkage cards (matching risk card style)
  const domainLinkageStyles = isDomainLinkage && severity
    ? severity === 'low'
      ? {
          text: 'text-green-400',
          bg: 'bg-green-900/20',
          border: 'border-green-500',
        }
      : severity === 'moderate'
      ? {
          text: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-500',
        }
      : severity === 'high' || severity === 'severe'
      ? {
          text: 'text-red-400',
          bg: 'bg-red-900/20',
          border: 'border-red-500',
        }
      : {
          text: 'text-gray-400',
          bg: 'bg-gray-900/20',
          border: 'border-gray-500',
        }
    : isDomainLinkage
    ? {
        text: 'text-gray-400',
        bg: 'bg-gray-900/20',
        border: 'border-gray-500',
      }
    : null;
  
  // Apply standard severity-based border for non-domain-linkage cards
  const severityClasses = !isDomainLinkage && severity 
    ? severity === 'low' 
      ? 'border-2 border-green-500/50 hover:border-green-500 hover:shadow-green-500/30' 
      : severity === 'moderate' 
      ? 'border-2 border-yellow-500/50 hover:border-yellow-500 hover:shadow-yellow-500/30' 
      : severity === 'high' || severity === 'severe'
      ? 'border-2 border-red-500/50 hover:border-red-500 hover:shadow-red-500/30'
      : ''
    : '';
  
  // Check if this is a featured card by examining the className
  return (
    <Link
      href={href}
      className={`
        group card-base ${config.cardHeight} ${className} ${config.hoverEffect} transition-smooth
        card-focus ${severityClasses}
        ${isDomainLinkage && domainLinkageStyles ? `rounded-md border p-4 ${domainLinkageStyles.text} ${domainLinkageStyles.bg} ${domainLinkageStyles.border}` : ''}
      `}
      aria-label={`View details for ${subject || title}`}
    >
      <article 
        className={isDomainLinkage ? "" : "absolute-inset"}
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
        
        {isDomainLinkage ? (
          /* Domain Linkage Card - Risk card style with icon and severity display */
          <div className="flex items-center gap-3 mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="lucide lucide-alert-triangle w-6 h-6" 
              aria-hidden="true"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <div className="text-sm text-gray-400">{subject || title}</div>
              {severity && (
                <div className="text-xl font-semibold capitalize">{severity}</div>
              )}
            </div>
          </div>
        ) : (
          /* Standard Material Card - Image with overlay */
          <div className={`relative w-full h-full bg-secondary`}>
            <Thumbnail
              alt={imageAlt || subject || title || (frontmatter?.subject ? frontmatter.subject : 'Image')}
              frontmatter={frontmatter}
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
        )}
      </article>
    </Link>
  );
}

// Export with semantic name and maintain backwards compatibility
export { MaterialCard as Card };
