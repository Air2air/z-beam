// app/components/Thumbnail/Thumbnail.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbnailProps } from "@/types";

// ThumbnailProps now imported from centralized types

export function Thumbnail({
  alt,
  className = "",
  priority = false,
  objectFit = "cover",
  width,
  height,
  frontmatter
}: ThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get image URL directly without state/useEffect delay
  const imageUrl = frontmatter?.images?.hero?.url || "";

  // Map objectFit to Tailwind class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down"
  }[objectFit];

  // Show default logo if no URL or image failed to load
  const showDefault = !imageUrl || imageError;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {!showDefault ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill={true}
          width={width}
          height={height}
          className={objectFitClass}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          quality={priority ? 85 : 75}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-tertiary">
          <Image
            src="/images/logo/logo-zbeam.png"
            alt="No image available"
            width={60}
            height={60}
            className="object-contain opacity-50"
          />
        </div>
      )}
    </div>
  );
}
