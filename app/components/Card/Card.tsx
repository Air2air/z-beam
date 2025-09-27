// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import Link from "next/link";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { BadgeData, ArticleMetadata } from "@/types";

// Global card configuration with a single variant
const CARD_CONFIG = {
  // Layout
  padding: "p-2",
  imageHeight: "aspect-[16/9] h-20", // Combine aspect ratio with min-height

  // Typography
  titleClass:
    "text-base font-semibold",
  descriptionClass:
    "text-gray-600 dark:text-gray-300 text-xs line-clamp-2",

  // Appearance
  cardClass:
    "rounded-lg shadow-md overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
};

export interface CardProps {
  frontmatter?: ArticleMetadata;
  href: string;
  badge?: BadgeData | null; // Allow null
  className?: string;
  height?: string;
}

export function Card({
  frontmatter,
  href,
  badge, // Re-enabled for BadgeSymbol support
  className = "",
  height,
}: CardProps) {
  // Extract slug from href (e.g., "/materials/silicon-nitride" -> "silicon-nitride")
  const slug = href?.split('/').pop() || '';
  
  // Get data from frontmatter only
  const title = frontmatter?.title || '';
  const subject = frontmatter?.subject || ''; // Use subject instead of name
  const imageAlt = frontmatter?.images?.hero?.alt || '';
  
  // For frontmatter files, we need to handle the path correctly
  // const isFrontmatterPath = (path: string | undefined) => {
  //   return path && path.includes('content/components/frontmatter/');
  // };
  
  // Determine material slug for image - use passed materialSlug, or extract from metadata.subject or slug
  // const effectiveMaterialSlug = 
  //   // If materialSlug is a frontmatter path, use it directly
  //   (materialSlug && isFrontmatterPath(materialSlug)) ? materialSlug :
  //   // Otherwise use the normal options
  //   materialSlug || 
  //   (metadata?.subject ? metadata.subject.toLowerCase() : null) || 
  //   (slug.includes('-') ? slug.split('-')[0].toLowerCase() : slug.toLowerCase());
  
  // Check if this is a featured card by examining the className
  return (
    <Link
      href={href}
      className={`
        group block ${CARD_CONFIG.cardClass} h-full ${className} hover:shadow-lg transition-all duration-200
      `}
      style={height ? { height } : {}}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <article className="flex flex-col h-full">
        {/* Image Container with dynamic height based on featured status */}
        <div
          className={`relative w-full ${CARD_CONFIG.imageHeight} overflow-hidden bg-gray-50 dark:bg-gray-800 card-image-container`}
        >
          <Thumbnail
            alt={imageAlt || subject || title || (frontmatter?.subject ? frontmatter.subject : 'Image')}
            frontmatter={frontmatter}
            objectFit="cover"
            priority={false}
          />

          {/* BadgeSymbol overlay for cards */}
          {badge && badge.symbol && (
            <div className="absolute top-2 right-2 z-10">
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
        </div>

        {/* Card Content */}
        <div className={`${CARD_CONFIG.padding} flex-grow flex flex-col`}>
          <h3 className={CARD_CONFIG.titleClass}>
            {/* Prioritize subject over title */}
            {subject || title}
          </h3>

        </div>
      </article>
    </Link>
  );
}
