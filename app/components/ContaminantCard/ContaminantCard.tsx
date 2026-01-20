/**
 * @component ContaminantCard
 * @purpose Specialized card component for contaminants displaying category and context in thumbnail
 * @dependencies @/types (CardProps, ArticleMetadata), Card component
 * @related Card.tsx, CardGrid.tsx, ContaminantsLayout.tsx
 * @complexity Low (extends base Card with contaminant-specific metadata display)
 * @aiContext Use for contaminant displays with category and context information in thumbnail area
 */
"use client";

import Link from "next/link";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { CardProps } from "@/types";
import { SITE_CONFIG } from "@/app/config/site";
import { getCardVariant } from "@/app/config/card-variants";

export interface ContaminantCardProps extends Omit<CardProps, 'variant'> {
  // Inherits all CardProps except variant (always uses 'relationship' style)
  showCategory?: boolean;  // Toggle category display (default: true)
  showContext?: boolean;   // Toggle context/description display (default: true)
  showIcon?: boolean;      // Toggle icon display (default: true)
}

export function ContaminantCard({
  frontmatter,
  href,
  badge,
  className = "",
  imageUrl: _explicitImageUrl,
  imageAlt: _explicitImageAlt,
  showCategory = true,
  showContext = true,
  showIcon = true
}: ContaminantCardProps) {
  // Use relationship variant configuration for metadata display
  const config = getCardVariant('relationship');
  
  // Safety check: href is required for Link component
  if (!href) {
    console.error('ContaminantCard component received undefined href for:', frontmatter?.title);
    return null;
  }
  
  // Extract metadata
  const title = frontmatter?.title;
  const subject = frontmatter?.subject;
  const description = frontmatter?.description;
  const category = frontmatter?.category;
  
  // Create absolute URL for SEO
  const absoluteUrl = href?.startsWith('http') ? href : `${SITE_CONFIG.url}${href}`;
  
  // Format category for display
  const formattedCategory = category?.replace(/_/g, ' ').replace(/-/g, ' ');
  
  // Get category icon based on category type
  const getCategoryIcon = (cat: string | undefined) => {
    if (!cat) return '⚠️';
    const lower = cat.toLowerCase();
    if (lower.includes('organic') || lower.includes('bio')) return '🧪';
    if (lower.includes('metal') || lower.includes('iron') || lower.includes('steel')) return '⚙️';
    if (lower.includes('dust') || lower.includes('particle')) return '💨';
    if (lower.includes('chemical') || lower.includes('compound')) return '🔬';
    if (lower.includes('oil') || lower.includes('grease')) return '🛢️';
    if (lower.includes('paint') || lower.includes('coating')) return '🎨';
    if (lower.includes('rust') || lower.includes('corrosion')) return '🔴';
    if (lower.includes('plastic') || lower.includes('polymer')) return '♻️';
    return '⚠️';
  };
  
  const categoryIcon = getCategoryIcon(category);
  
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
        {/* SEO Infrastructure: Schema.org structured data */}
        <meta itemProp="url" content={absoluteUrl} />
        <meta itemProp="headline" content={subject || title} />
        {description && (
          <meta itemProp="description" content={description} />
        )}
        {frontmatter?.datePublished && (
          <meta itemProp="datePublished" content={frontmatter.datePublished} />
        )}
        {frontmatter?.lastModified && (
          <meta itemProp="dateModified" content={frontmatter.lastModified} />
        )}
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
        {frontmatter?.author && (
          <meta 
            itemProp="author" 
            content={typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author.name} 
          />
        )}
        
        {/* Contaminant metadata display in thumbnail area - Minimal with Icons */}
        <div className={`relative w-full h-full bg-tertiary`}>
          <div className="absolute-inset flex flex-col justify-center items-center p-4 text-center space-y-3">
            {/* Icon */}
            {showIcon && category && (
              <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                {categoryIcon}
              </div>
            )}
            
            {/* Category */}
            {showCategory && formattedCategory && (
              <div className="text-sm text-primary font-bold">
                {formattedCategory}
              </div>
            )}
            
            {/* Context/Description */}
            {showContext && description && (
              <div className="text-xs text-primary/70 leading-relaxed line-clamp-2 px-2">
                {description}
              </div>
            )}
            
            {/* Fallback if no data */}
            {!category && !description && (
              <div className="text-primary/50 text-sm">
                No metadata available
              </div>
            )}
          </div>

          {/* BadgeSymbol overlay (optional) */}
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
          
          {/* Title bar overlay */}
          <div 
            className={`${config.titleBarClass} ${config.transitionClass} ${config.padding}`}
          >
            <h3 
              className={config.titleClass}
              itemProp="name"
            >
              {subject || title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}
