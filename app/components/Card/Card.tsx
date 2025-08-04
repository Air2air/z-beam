// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import { useState } from "react";
import Link from "next/link";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { Thumbnail } from "../Thumbnail/Thumbnail";

// Global card configuration with a single variant
const CARD_CONFIG = {
  // Layout
  padding: "p-4",
  imageHeight: "aspect-[16/9] h-28", // Combine aspect ratio with min-height

  // Typography
  titleClass:
    "text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200",
  descriptionClass:
    "text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2",

  // Appearance
  cardClass:
    "bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:bg-gray-800 dark:border-gray-700",
};

// New standardized interface for badge data
interface BadgeData {
  symbol?: string;
  atomicNumber?: number | string;
  formula?: string;
  materialType?: string;
  color?: string;
}

export interface CardProps {
  href: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  tags?: string[];
  badge?: BadgeData | null; // Allow null
  showBadge?: boolean;
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
  tags = [],
  badge,
  showBadge = false,
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
  // Extract chemical properties and prepare badge data
  const getBadgeData = (): BadgeData | null => {
    // If showBadge is false, don't show a badge
    if (!showBadge) return null;
    
    // If explicit badge data is provided, use it
    if (badge) return badge;
    
    // Extract from metadata if available
    if (metadata?.chemicalProperties) {
      const props = metadata.chemicalProperties;
      
      // Only return badge data if we have at least a symbol or formula
      if (props.symbol || props.formula) {
        return {
          symbol: props.symbol,
          formula: props.formula,
          atomicNumber: props.atomicNumber,
          materialType: props.materialType || metadata.category,
          color: getMaterialColor(props.materialType || metadata.category)
        };
      }
    }
    
    return null;
  };

  const badgeData = getBadgeData();

  // Helper function to map material types to colors
  function getMaterialColor(materialType?: string): string {
    if (!materialType) return "blue";

    const typeMap: Record<string, string> = {
      metal: "blue",
      ceramic: "green",
      polymer: "purple",
      composite: "yellow",
      semiconductor: "red",
      compound: "gray",
    };

    return typeMap[materialType.toLowerCase()] || "blue";
  }

  return (
    <Link
      href={href}
      className={`
        group block ${CARD_CONFIG.cardClass} h-full ${className}
      `}
      style={height ? { height } : {}}
    >
      <article className="flex flex-col h-full">
        {/* Image Container with fixed height */}
        <div
          className={`relative w-full ${CARD_CONFIG.imageHeight} overflow-hidden bg-gray-50 dark:bg-gray-800`}
        >
          <Thumbnail
            src={image || imageUrl}
            alt={imageAlt || name || title}
            fallbackSrc="/images/Site/Logo/logo_.png"
            objectFit="cover"
            priority={false}
            onError={() => {
              // Error handling logic if needed
            }}
          />

          {/* Chemical Symbol Badge (if applicable) */}
          {badgeData && (
            <BadgeSymbol
              chemicalSymbol={badgeData.symbol}
              atomicNumber={badgeData.atomicNumber}
              chemicalFormula={badgeData.formula}
              materialType={badgeData.materialType}
              variant="card"
              color={badgeData.color}
            />
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
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-auto pt-4 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}


