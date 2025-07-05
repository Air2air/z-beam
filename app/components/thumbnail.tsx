// app/components/thumbnail.tsx
"use client";

import Image from "next/image";
import { BaseImageProps } from "../types";

// Extend BaseImageProps with required dimension props
interface ThumbnailProps extends BaseImageProps {
  width: number;
  height: number;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function Thumbnail({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  onError,
}: ThumbnailProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load:", e);
    if (onError) {
      onError(e);
    }
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
    />
  );
}
