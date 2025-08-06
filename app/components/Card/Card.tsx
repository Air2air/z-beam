// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import Link from "next/link";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { Thumbnail } from "../Thumbnail/Thumbnail";

// Global card configuration with a single variant
const CARD_CONFIG = {
  // Layout
  padding: "p-2",
  imageHeight: "aspect-[16/9] h-20", // Combine aspect ratio with min-height

  // Typography
  titleClass:
    "text-lg font-semibold group-hover:text-blue-600 transition-colors duration-200",
  descriptionClass:
    "text-gray-600 dark:text-gray-300 text-sm line-clamp-2",

  // Appearance
  cardClass:
    "rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
};

// New standardized interface for badge data
interface BadgeData {
  symbol?: string;
  atomicNumber?: number | string;
  formula?: string;
  materialType?: string;
  color?: string;
  show?: boolean; // Added for simplified flag
}

export interface CardProps {
  href: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  materialSlug?: string; // Add materialSlug for hero images
  tags?: string[];
  badge?: BadgeData | null; // Allow null
  metadata?: {
    category?: string;
    articleType?: string;
    date?: string;
    tags?: string[];
    // Simplified chemical properties object
    chemicalProperties?: {
      symbol?: string;
      formula?: string;
      materialType?: string;
      atomicNumber?: number | string;
    };
    [key: string]: any; // Allow other properties
  };
  className?: string;
  height?: string;
}

export function Card({
  href,
  title,
  name,
  description,
  image,
  imageUrl,
  imageAlt,
  materialSlug,
  tags = [],
  badge,
  metadata,
  className = "",
  height,
}: CardProps) {
  // Validate href to help debug 404 issues
  if (href && typeof href === 'string' && process.env.NODE_ENV === 'development') {
    // Log potential problematic hrefs (blank, hash only, etc)
    if (href === '#' || href === '' || !href.startsWith('/')) {
      console.warn(`Potential invalid href in Card: "${href}" for ${name || title}`);
    }
  }
  // Simplified badge handling - show badges on all cards, using slug-based fallback if needed
  // Extract slug from href (e.g., "/materials/silicon-nitride" -> "silicon-nitride")
  const slug = href?.split('/').pop() || '';
  
  // For frontmatter files, we need to handle the path correctly
  const isFrontmatterPath = (path: string | undefined) => {
    return path && path.includes('content/components/frontmatter/');
  };
  
  // Determine material slug for image - use passed materialSlug, or extract from metadata.subject or slug
  const effectiveMaterialSlug = 
    // If materialSlug is a frontmatter path, use it directly
    (materialSlug && isFrontmatterPath(materialSlug)) ? materialSlug :
    // Otherwise use the normal fallbacks
    materialSlug || 
    (metadata?.subject ? metadata.subject.toLowerCase() : null) || 
    (slug.includes('-') ? slug.split('-')[0].toLowerCase() : slug.toLowerCase());
  
  // Check if this is a featured card by examining the className
  const isFeatured = className?.includes('featured-item');

  return (
    <Link
      href={href}
      className={`
        group block ${CARD_CONFIG.cardClass} h-full ${className}
      `}
      style={height ? { height } : {}}
    >
      <article className="flex flex-col h-full">
        {/* Image Container with dynamic height based on featured status */}
        <div
          className={`relative w-full ${CARD_CONFIG.imageHeight} overflow-hidden bg-gray-50 dark:bg-gray-800 card-image-container`}
        >
          <Thumbnail
            src={image || imageUrl || undefined}
            alt={imageAlt || name || title || (metadata?.subject ? metadata.subject : 'Image')}
            frontmatter={metadata}
            objectFit="cover"
            priority={false}
          />

          {/* Chemical Symbol Badge (show only if not featured) - positioned absolutely */}
          {!isFeatured && (
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
              <BadgeSymbol
                frontmatter={metadata ? { 
                  chemicalProperties: metadata.chemicalProperties 
                } : undefined}
                slug={slug}
              />
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className={`${CARD_CONFIG.padding} flex-grow flex flex-col`}>
          <h3 className={CARD_CONFIG.titleClass}>
            {/* Prioritize name over title */}
            {name || title}
          </h3>
          {description && (
            <p className={CARD_CONFIG.descriptionClass}>{description}</p>
          )}

        </div>
      </article>
    </Link>
  );
}
