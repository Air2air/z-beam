// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import Link from "next/link";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { BadgeData, ArticleMetadata } from "@/types";

// Card variant configurations
const CARD_VARIANTS = {
  standard: {
    // Layout
    padding: "p-2 md:p-3",
    imageHeight: "h-full", // Full height image
    cardHeight: "h-full min-h-[9rem] md:min-h-[11rem] lg:min-h-[12rem]", // Responsive card height - smaller on mobile
    
    // Typography
    titleClass: "text-base font-semibold text-white truncate",
    descriptionClass: "text-gray-200 text-xs line-clamp-2",
    
    // Appearance
    cardClass: "rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700",
    hoverEffect: "hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1",
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
    titleClass: "text-xl font-bold text-white truncate",
    descriptionClass: "text-gray-200 text-sm line-clamp-3",
    
    // Appearance
    cardClass: "rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600",
    hoverEffect: "hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-400 ease-out",
  },
} as const;

type CardVariant = keyof typeof CARD_VARIANTS;

export interface CardProps {
  frontmatter?: ArticleMetadata;
  href: string;
  badge?: BadgeData | null; // Allow null
  className?: string;
  variant?: CardVariant; // Add variant prop
}

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
      `}
      aria-label={`View details for ${subject || title}`}
    >
      <article className="relative flex flex-col h-full card-container" role="article">
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
              <h3 className={`${config.titleClass} flex-1 pr-2 min-w-0 overflow-hidden`} id={`card-title-${slug}`}>
                {/* Prioritize subject over title */}
                {subject || title}
              </h3>
              
              {/* Arrow-right icon */}
              <svg 
                className="w-4 h-4 text-white opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-out" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
                aria-label="Navigate to details"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
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
