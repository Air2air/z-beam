// app/components/Card/Card.tsx
"use client";

import "./styles.scss";
import { useState, useMemo } from "react";
import Link from "next/link";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { getBadgeData } from "../../utils/materialBadgeUtils";
import { MaterialBadgeData } from "../../types/materials";
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

export interface CardProps {
  href: string;
  title: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  tags?: string[];
  badge?: {
    text: string;
    color?: string;
  };
  showBadge?: boolean;
  metadata?: {
    category?: string;
    articleType?: string;
    date?: string;
    chemicalSymbol?: string;
    atomicNumber?: number;
    chemicalFormula?: string;
    tags?: string[];
  };
  materialData?: any;
  className?: string;
  height?: string;
}

export function Card({
  href,
  title,
  description,
  image,
  imageUrl,
  imageAlt,
  tags = [],
  badge,
  showBadge = false,
  metadata,
  materialData,
  className = "",
  height,
}: CardProps) {
  // Use either image or imageUrl with fallback
  const [imgSrc, setImgSrc] = useState<string>(
    image || imageUrl || "/images/Site/Logo/logo_.png"
  );
  const [imgError, setImgError] = useState(false);

  // Handle image error
  const handleImageError = () => {
    console.log("Image failed to load, using fallback");
    setImgSrc("/images/Site/Logo/logo_.png");
    setImgError(true);
  };

  // Extract badge data using the centralized utility
  const badgeData: MaterialBadgeData | null = useMemo(() => {
    // Try to extract from metadata first
    if (metadata?.chemicalSymbol) {
      return {
        symbol: metadata.chemicalSymbol,
        formula: metadata.chemicalFormula,
        atomicNumber: metadata.atomicNumber,
        materialType: metadata.chemicalFormula ? "compound" : "element",
      };
    }

    // If we have raw material data, use the utility
    if (materialData) {
      return getBadgeData(materialData);
    }

    return null;
  }, [metadata, materialData]);

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
            alt={imageAlt || title}
            fallbackSrc="/images/Site/Logo/logo_.png"
            objectFit="cover" // Change from "contain" to "cover"
            priority={false}
            onError={() => {
              // Error handling
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
          <h3 className={CARD_CONFIG.titleClass}>{title}</h3>
          {description && (
            <p className={CARD_CONFIG.descriptionClass}>{description}</p>
          )}
        </div>
      </article>
    </Link>
  );
}

// In Thumbnail.tsx, adjust the THUMBNAIL_CONFIG
const THUMBNAIL_CONFIG = {
  fallbackPadding: "p-4", // Reduced padding for smaller containers
  fallbackBg: "bg-gray-100 dark:bg-gray-700",
};
