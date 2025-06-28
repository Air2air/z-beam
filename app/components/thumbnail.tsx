// app/components/thumbnail.tsx
"use client"; // <-- This makes it a Client Component

import Image from "next/image";

export default function Thumbnail({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        console.error("Image failed to load:", e);
      }}
    />
  );
}
