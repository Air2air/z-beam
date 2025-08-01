// app/components/Thumbnail/Thumbnail.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

// This component should NOT import Card or anything that imports Card

interface ThumbnailProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function Thumbnail({
  src,
  alt,
  width = 800,
  height = 450,
  fallbackSrc = "/images/Site/Logo/logo_.png",
  className = "",
  priority = false,
  onError,
}: ThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    console.log("Image failed to load, using fallback");
    setImgSrc(fallbackSrc);
    setImgError(true);

    if (onError) {
      onError(
        new Event("error") as unknown as React.SyntheticEvent<HTMLImageElement>
      );
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imgSrc || fallbackSrc ? (
        <Image
          src={imgSrc || fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover"
          priority={priority}
          onError={handleImageError}
          unoptimized={imgError}
        />
      ) : (
        <Image
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover"
          unoptimized={true}
        />
      )}
    </div>
  );
}
