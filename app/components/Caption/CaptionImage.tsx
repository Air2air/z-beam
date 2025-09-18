// app/components/Caption/CaptionImage.tsx
"use client";

import Image from 'next/image';
import { useState } from 'react';
import { FrontmatterType } from './Caption';

interface CaptionImageProps {
  imageSource?: string;
  frontmatter?: FrontmatterType;
  materialName?: string;
  seoData?: {
    materialType: string;
    description: string;
    author: string;
    wavelength?: string | number;
    materialFormula?: string;
  };
}

export function CaptionImage({ imageSource, frontmatter, materialName, seoData }: CaptionImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Generate SEO-optimized alt text
  const optimizedAlt = imageSource ? 
    `${materialName || 'Material'} surface topography analysis showing before and after laser cleaning at ${seoData?.wavelength || 'optimized'} wavelength - high-resolution microscopic comparison` :
    `${materialName || 'Material'} surface analysis placeholder`;

  // Generate comprehensive title attribute
  const imageTitle = `${materialName || 'Material'} Surface Analysis - Laser Cleaning Results`;

  if (!imageSource) {
    return (
      <div className="caption-image-wrapper">
        <div className="flex items-center justify-center bg-gray-600 h-[450px]">
          <Image
            src="/images/Site/Logo/logo_.png"
            alt="No image available"
            width={60}
            height={60}
            className="object-contain opacity-50"
            unoptimized={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="caption-image-wrapper relative">
      {(imageLoading || imageError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-600 z-10">
          <Image
            src="/images/Site/Logo/logo_.png"
            alt={imageError ? "Image not available" : "Loading..."}
            width={60}
            height={60}
            className="object-contain opacity-50"
            unoptimized={true}
          />
        </div>
      )}
      <Image
        src={imageSource}
        alt={optimizedAlt}
        title={imageTitle}
        width={800}
        height={450}
        className="caption-image"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 800px"
        itemProp="contentUrl"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
      <meta itemProp="description" content={optimizedAlt} />
      <meta itemProp="name" content={imageTitle} />
      <meta itemProp="caption" content={`${materialName} surface before and after laser cleaning analysis`} />
      <meta itemProp="keywords" content={`${materialName}, laser cleaning, surface analysis, topography, microscopic, materials science`} />
      {seoData?.author && <meta itemProp="author" content={seoData.author} />}
    </div>
  );
}
