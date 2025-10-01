// app/components/Caption/CaptionImage.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';

interface CaptionImageProps {
  imageSource?: string;
  materialName?: string;
  alt?: string;
  seoData?: {
    author?: string | { name: string };
  };
}

export function CaptionImage({ imageSource, materialName, alt, seoData }: CaptionImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Generate SEO-optimized alt text
  const optimizedAlt = alt || 
    (imageSource 
      ? `${materialName || 'Material'} surface analysis - laser cleaning results`
      : 'No image available');

  if (!imageSource) {
    return (
      <div className="flex items-center justify-center bg-gray-600 h-[450px] rounded-lg">
        <Image
          src="/images/Site/Logo/logo_.png"
          alt="Z-Beam logo"
          width={60}
          height={60}
          className="opacity-50"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading indicator */}
      {imageLoading && !imageError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-600 z-10 rounded-lg"
          role="status"
        >
          <div className="rounded-full h-8 w-8 border-b-2 border-white animate-spin" />
          <span className="sr-only">Loading image...</span>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-700 z-10 rounded-lg"
          role="alert"
        >
          <span className="text-white text-sm">Image failed to load</span>
        </div>
      )}

      {/* Image */}
      <Image
        src={imageSource}
        alt={optimizedAlt}
        width={800}
        height={450}
        className="w-full h-auto rounded-lg"
        priority={false}
        quality={85}
        itemProp="contentUrl"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
      
      {/* SEO metadata */}
      <meta itemProp="description" content={optimizedAlt} />
      {materialName && <meta itemProp="name" content={`${materialName} Surface Analysis`} />}
      {seoData?.author && (
        <meta 
          itemProp="author" 
          content={typeof seoData.author === 'string' ? seoData.author : seoData.author.name} 
        />
      )}
    </div>
  );
}
