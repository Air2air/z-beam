// app/components/Thumbnail/Thumbnail.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

// Instead of importing ObjectFit
type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

// Component configuration
const THUMBNAIL_CONFIG = {
  fallbackPadding: "p-8", // Generous padding for fallback images/logos
  regularPadding: "p-0", // No padding for regular images
  fallbackBg: "bg-gray-100 dark:bg-gray-600",
  fallbackObjectFit: "contain" as ObjectFit, // Ensure logos are fully visible
  regularObjectFit: "cover" as ObjectFit, // Regular images should fill the space
};

// This component should NOT import Card or anything that imports Card

interface ThumbnailProps {
  src?: string;
  alt: string;
  materialSlug?: string; // Add materialSlug for hero images
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit; // Default for regular images
  fallbackObjectFit?: ObjectFit; // Specific for fallback
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  width?: number; // For image resource sizing
  height?: number; // For image resource sizing
  fallbackPadding?: string; // Optional override for fallback padding
}

export function Thumbnail({
  src,
  alt,
  materialSlug,
  fallbackSrc = "/images/Site/Logo/logo_.png",
  className = "",
  priority = false,
  objectFit = "cover", // Default for regular images
  fallbackObjectFit, // Specific objectFit for fallback images
  onError,
  width,
  height,
  fallbackPadding, // Allow override via props
}: ThumbnailProps) {
  // Determine the source with materialSlug fallback
  const effectiveSrc = src || (materialSlug ? `/images/Material/${materialSlug}_hero.jpg` : undefined);
  
  // Debug logging
  console.log('Thumbnail Debug:', {
    originalSrc: src,
    materialSlug,
    effectiveSrc,
    fallbackSrc
  });
  
  const [imageState, setImageState] = useState<{
    src: string | undefined;
    error: boolean;
  }>({
    src: effectiveSrc,
    error: false,
  });

  const handleImageError = () => {
    setImageState({
      src: fallbackSrc,
      error: true,
    });

    if (onError) {
      onError(
        new Event("error") as unknown as React.SyntheticEvent<HTMLImageElement>
      );
    }
  };

  // Determine if we're showing a fallback image
  const isFallbackImage =
    imageState.error ||
    imageState.src === fallbackSrc ||
    !imageState.src;

  // Use appropriate objectFit based on whether it's a fallback image
  const effectiveObjectFit = isFallbackImage
    ? (fallbackObjectFit || THUMBNAIL_CONFIG.fallbackObjectFit)
    : objectFit;

  // Map the effective objectFit to corresponding Tailwind class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
  }[effectiveObjectFit];

  // Use appropriate padding
  const paddingClass = isFallbackImage
    ? (fallbackPadding || THUMBNAIL_CONFIG.fallbackPadding)
    : THUMBNAIL_CONFIG.regularPadding;

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
      {imageState.src || fallbackSrc ? (
        <Image
          src={imageState.src || fallbackSrc}
          alt={alt}
          fill={true}
          width={width} // Used for image resource size, not layout
          height={height} // Used for image resource size, not layout
          className={`
            ${objectFitClass}
            ${paddingClass}
          `}
          priority={priority}
          onError={handleImageError}
          unoptimized={imageState.error}
          sizes="100vw"
          style={{ objectFit: effectiveObjectFit }}
        />
      ) : (
        <Image
          src={fallbackSrc}
          alt={alt}
          fill={true}
          className={`
            ${objectFitClass}
            ${paddingClass}
          `}
          unoptimized={true}
          sizes="100vw"
          style={{
            objectFit: effectiveObjectFit,
          }}
        />
      )}
    </div>
  );
}
