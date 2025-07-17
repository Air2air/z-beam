// Create a centralized ImageLoader component
// filepath: /app/components/UI/OptimizedImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  fill = true,
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const isCloudinary = src?.startsWith("https://res.cloudinary.com");

  if (error || !src) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <svg className="w-12 h-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          {/* Placeholder SVG path */}
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      onError={() => setError(true)}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={isCloudinary}
    />
  );
}