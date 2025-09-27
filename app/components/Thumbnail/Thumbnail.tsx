// app/components/Thumbnail/Thumbnail.tsx
"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Article, ArticleMetadata } from "@/types";

type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

interface ThumbnailProps {
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  width?: number;
  height?: number;
  frontmatter?: ArticleMetadata; // Use standardized type
}

export function Thumbnail({
  alt,
  className = "",
  priority = false,
  objectFit = "cover",
  width,
  height,
  frontmatter
}: ThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    // Use frontmatter data directly - no API calls needed
    // If no frontmatter is provided, don't fetch anything (GROK: simplification)
    if (frontmatter?.images?.hero?.url) {
      setImageUrl(frontmatter.images.hero.url);
    } else {
      setImageUrl("");
    }
  }, [frontmatter]);

  // Map objectFit to Tailwind class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down"
  }[objectFit];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill={true}
          width={width}
          height={height}
          className={objectFitClass}
          priority={priority}
          unoptimized={true}
          sizes="100vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-600">
          <Image
            src="/images/Site/Logo/logo_.png"
            alt="No image available"
            width={60}
            height={60}
            className="object-contain opacity-50"
            unoptimized={true}
          />
        </div>
      )}
    </div>
  );
}
