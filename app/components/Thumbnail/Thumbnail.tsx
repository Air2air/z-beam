// app/components/Thumbnail/Thumbnail.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

// Instead of importing ObjectFit
type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

// Component configuration
const THUMBNAIL_CONFIG = {
  fallbackImage: "/images/Site/Logo/logo_.png",
  regularPadding: "p-0",
  fallbackPadding: "p-6",
  fallbackBg: "bg-gray-100 dark:bg-gray-600"
};

interface ThumbnailProps {
  src?: string;
  alt: string;
  materialSlug?: string;
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  width?: number;
  height?: number;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function Thumbnail({
  src,
  alt,
  materialSlug,
  fallbackSrc = THUMBNAIL_CONFIG.fallbackImage,
  className = "",
  priority = false,
  objectFit = "cover",
  width,
  height,
  onError
}: ThumbnailProps) {
  // Extract the base name from material slug
  const extractBaseName = (slug: string | undefined) => {
    if (!slug) return undefined;
    
    if (slug.includes('/')) {
      const parts = slug.split('/');
      const filename = parts[parts.length - 1];
      return filename.replace(/\.[^/.]+$/, "");
    }
    
    return slug;
  };
  
  // Build the image path from material slug
  const baseSlug = extractBaseName(materialSlug);
  const materialImagePath = baseSlug ? `/images/${baseSlug}-laser-cleaning-hero.jpg` : undefined;
  
  // Determine which image source to use (in order of priority)
  const imageSrc = materialImagePath || src;
  
  // State to track image loading status
  const [imageError, setImageError] = useState(false);
  
  // Handle image load error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    if (onError) onError(e);
  };
  
  // Determine the final source to display
  const displaySrc = !imageError ? imageSrc : fallbackSrc;
  
  // Determine if we're showing a fallback image
  const isFallbackImage = imageError || !imageSrc;
  
  // Use appropriate padding based on whether it's a fallback image
  const paddingClass = isFallbackImage 
    ? THUMBNAIL_CONFIG.fallbackPadding
    : THUMBNAIL_CONFIG.regularPadding;
    
  // Map the objectFit to corresponding Tailwind class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down"
  }[isFallbackImage ? "contain" : objectFit];

  // Ensure we always have a valid src string
  const finalSrc = displaySrc || fallbackSrc;

  return (
    <div
      className={`
        relative overflow-hidden ${className}
        ${isFallbackImage ? THUMBNAIL_CONFIG.fallbackBg : ""}
      `}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Image
        src={finalSrc}
        alt={isFallbackImage ? `Fallback for ${alt}` : alt}
        fill={true}
        width={width} // Used for image resource size, not layout
        height={height} // Used for image resource size, not layout
        className={`
          ${objectFitClass}
          ${paddingClass}
          ${isFallbackImage ? 'z-0' : 'z-1'}
        `}
        priority={priority}
        onError={handleImageError}
        unoptimized={true} // Set all images to unoptimized for testing
        sizes="100vw"
      />
    </div>
  );
}
