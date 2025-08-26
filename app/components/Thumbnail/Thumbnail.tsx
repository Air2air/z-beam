// app/components/Thumbnail/Thumbnail.tsx
"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Article } from "@/types/core";
import { Card } from "../Card/Card";
import { logger } from "../../utils/logger";

type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

interface ThumbnailProps {
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  width?: number;
  height?: number;
  slug?: string; // Add slug to fetch data directly
  frontmatter?: {
    images?: {
      hero?: { url: string };
    };
    [key: string]: unknown;
  }; // Specific structure for images
}

export function Thumbnail({
  alt,
  className = "",
  priority = false,
  objectFit = "cover",
  width,
  height,
  slug,
  frontmatter
}: ThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we already have frontmatter, use it directly
    if (frontmatter?.images?.hero?.url) {
      setImageUrl(frontmatter.images.hero.url);
      return;
    }

    // If we have a slug, fetch the data directly
    if (slug && !frontmatter) {
      setLoading(true);
      fetch(`/api/articles/${slug}`)
        .then(response => response.json())
        .then(data => {
          if (data?.metadata?.images?.hero?.url) {
            setImageUrl(data.metadata.images.hero.url);
          } else {
            setImageUrl("");
          }
        })
        .catch(error => {
          logger.error("Error fetching thumbnail data", error, { slug });
          setImageUrl("");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug, frontmatter]);

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
      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-600">
          <Image
            src="/images/Site/Logo/logo_.png"
            alt="Loading..."
            width={60}
            height={60}
            className="object-contain opacity-50"
            unoptimized={true}
          />
        </div>
      ) : imageUrl ? (
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
