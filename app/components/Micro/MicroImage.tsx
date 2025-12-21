// app/components/Micro/MicroImage.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { SITE_CONFIG } from '@/config/site';

interface MicroImageProps {
  imageSource?: string;
  materialName?: string;
  alt?: string;
  seoData?: {
    author?: string | { name: string };
  };
}

export function MicroImage({ imageSource, materialName, alt, seoData }: MicroImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Generate SEO-optimized alt text
  const optimizedAlt = alt || 
    (imageSource 
      ? `${materialName || 'Material'} surface analysis - laser cleaning results`
      : 'No image available');

  if (!imageSource) {
    return (
      <div className="flex items-center justify-center bg-tertiary h-[450px] rounded-md">
        <Image
          src="/images/logo/logo-zbeam.png"
          alt={`${SITE_CONFIG.shortName} logo`}
          width={60}
          height={60}
          className="opacity-50"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div 
      className="relative"
      itemScope
      itemType="https://schema.org/ImageObject"
    >
      {/* Loading indicator */}
      {imageLoading && !imageError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-tertiary z-10 rounded-md"
          role="status"
        >
          <div className="rounded-full h-8 w-8 border-b-2 border-white animate-spin" />
          <span className="sr-only">Loading image...</span>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-primary z-10 rounded-md"
          role="alert"
        >
          <span className="text-primary text-sm">Image failed to load</span>
        </div>
      )}

      {/* Image with ImageObject schema */}
      <Image
        src={imageSource}
        alt={optimizedAlt}
        width={800}
        height={450}
        className="w-full h-auto rounded-md"
        priority={false}
        quality={85}
        itemProp="contentUrl"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
      
      {/* ImageObject schema metadata */}
      <meta itemProp="url" content={imageSource} />
      <meta itemProp="description" content={optimizedAlt} />
      <meta itemProp="encodingFormat" content="image/jpeg" />
      {materialName && <meta itemProp="name" content={`${materialName} Surface Analysis`} />}
      {seoData?.author && (
        <meta 
          itemProp="author" 
          content={typeof seoData.author === 'string' ? seoData.author : seoData.author.name} 
        />
      )}
      <meta itemProp="publisher" content={SITE_CONFIG.shortName} />
    </div>
  );
}
