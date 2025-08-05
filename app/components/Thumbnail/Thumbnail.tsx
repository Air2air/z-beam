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
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  width?: number;
  height?: number;
  frontmatter?: any; // The frontmatter contains all image path information
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function Thumbnail({
  src,
  alt,
  fallbackSrc = THUMBNAIL_CONFIG.fallbackImage,
  className = "",
  priority = false,
  objectFit = "cover",
  width,
  height,
  frontmatter,
  onError
}: ThumbnailProps) {
  // Helper function to process image paths
  const processImagePath = (path: string | undefined) => {
    if (!path) return undefined;
    
    // If path starts with a slash, it's already a path
    if (path.startsWith('/')) return path;
    
    // If it includes a file extension, assume it's a relative path
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(path)) return `/images/${path}`;
    
    // Otherwise, just use the path as a base filename in the images directory
    return `/images/${path}.jpg`;
  };
  
  // Determine image source, prioritizing frontmatter
  let imageSrc = src;
  
  // Add debugging
  console.log('Thumbnail props:', { src, alt, frontmatter });
  
  if (!imageSrc && frontmatter?.images?.hero?.url) {
    // Use the hero image URL from frontmatter
    imageSrc = frontmatter.images.hero.url;
    console.log('Using hero image from frontmatter:', imageSrc);
  }
  
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
  
  // Debug final image source
  console.log('Final image source:', finalSrc);

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
