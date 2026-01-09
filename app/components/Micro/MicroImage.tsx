// app/components/Micro/MicroImage.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { SITE_CONFIG } from '@/app/config/site';
import { DIMENSION_CLASSES } from '@/app/config/dimensions';

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

  // Generate SEO-optimized alt text from available frontmatter data
  const optimizedAlt = alt || 
    (imageSource 
      ? `${materialName || 'Material'} microscopic surface analysis at 500-1000x magnification showing laser cleaning results`
      : 'No microscopic image available');

  if (!imageSource) {
    return (
      <div className={`flex items-center justify-center bg-tertiary ${DIMENSION_CLASSES.micro.image} rounded-md`}>
        <Image
          src="/images/logo/logo-zbeam.png"
          alt={`${SITE_CONFIG.shortName} logo`}
          width={60}
          height={60}
          className="text-orange-500"
          style={{ filter: 'brightness(0) saturate(100%) invert(53%) sepia(89%) saturate(2476%) hue-rotate(1deg) brightness(103%) contrast(101%)' }}
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
