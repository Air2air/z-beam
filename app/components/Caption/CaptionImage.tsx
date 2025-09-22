// app/components/Caption/CaptionImage.tsx
"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
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
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate SEO-optimized alt text
  const optimizedAlt = imageSource ? 
    `${materialName || 'Material'} surface topography analysis showing before and after laser cleaning at ${seoData?.wavelength || 'optimized'} wavelength - high-resolution microscopic comparison` :
    `${materialName || 'Material'} surface analysis placeholder`;

  // Generate comprehensive title attribute
  const imageTitle = `${materialName || 'Material'} Surface Analysis - Laser Cleaning Results`;

  if (!imageSource) {
    return (
      <div className="caption-image-wrapper" ref={imageRef}>
        <div 
          className="flex items-center justify-center bg-gray-600 h-[450px]"
          aria-label="No surface analysis image available"
        >
          <Image
            src="/images/Site/Logo/logo_.png"
            alt="Z-Beam company logo - no image available"
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
    <div className="caption-image-wrapper relative" ref={imageRef}>
      {imageSource && isInView ? (
        <>
          {/* Loading indicator overlay with screen reader support */}
          {imageLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-600 z-10"
              role="status"
              aria-live="polite"
              aria-label="Loading caption image"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" aria-hidden="true"></div>
              <span className="sr-only">Loading caption image...</span>
            </div>
          )}

          {/* Error state overlay with screen reader support */}
          {imageError && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 z-10"
              role="alert"
              aria-live="assertive"
            >
              <div className="text-white text-center">
                <div className="text-sm opacity-75">Caption image could not be loaded</div>
                <span className="sr-only">Error: Caption image failed to load</span>
              </div>
            </div>
          )}

          <Image
            src={imageSource}
            alt={optimizedAlt}
            title={imageTitle}
            width={800}
            height={450}
            className="caption-image"
            priority={false}
            quality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 800px"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
            itemProp="contentUrl"
            onLoad={() => {
              setImageLoading(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            onLoadStart={() => setImageLoading(true)}
          />
          <meta itemProp="description" content={optimizedAlt} />
          <meta itemProp="name" content={imageTitle} />
          <meta itemProp="caption" content={`${materialName} surface before and after laser cleaning analysis`} />
          <meta itemProp="keywords" content={`${materialName}, laser cleaning, surface analysis, topography, microscopic, materials science`} />
          {seoData?.author && <meta itemProp="author" content={seoData.author} />}
        </>
      ) : imageSource && !isInView ? (
        // Placeholder while not in view for performance
        <div className="w-full h-[450px] bg-gray-800 animate-pulse" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700"></div>
        </div>
      ) : null}
    </div>
  );
}
