// app/components/Caption/Caption.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCaptionParsing, CaptionData, ParsedCaptionData } from './useCaptionParsing';
import { MetricsGrid } from './MetricsGrid';
import { AuthorInfo, CaptionDataStructure, FrontmatterType, CaptionProps } from '@/types';
import './enhanced-seo-caption.css';

export function Caption({ content, frontmatter, config }: CaptionProps) {
  const captionData = useCaptionParsing(content);
  const { className = '' } = config || {};
  
  // State management for image loading and accessibility
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const captionRef = useRef<HTMLElement>(null);

  // Intersection Observer for lazy loading and performance optimization
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

    if (captionRef.current) {
      observer.observe(captionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Simplified data processing - merge content with frontmatter
  const enhancedData: CaptionDataStructure = typeof content === 'object' ? {
    // Direct assignment from content
    ...(content as CaptionDataStructure),
    
    // Fallback to frontmatter when needed
    title: (content as CaptionDataStructure).title || frontmatter?.title,
    description: (content as CaptionDataStructure).description || frontmatter?.description,
    keywords: (content as CaptionDataStructure).keywords || frontmatter?.keywords,
    material: content.material || frontmatter?.name,
    
    // Author data handling
    author_object: (content as CaptionDataStructure).author_object || 
      frontmatter?.author_object || 
      (typeof frontmatter?.author === 'object' ? frontmatter.author : 
       typeof frontmatter?.author === 'string' ? { name: frontmatter.author } : 
       { name: 'Z-Beam Research Team' }),
    
    // Technical and chemical properties merging
    technicalSpecifications: {
      ...frontmatter?.technicalSpecifications,
      ...(content as CaptionDataStructure).technicalSpecifications,
    },
    chemicalProperties: {
      ...frontmatter?.chemicalProperties,
      ...(content as CaptionDataStructure).chemicalProperties,
    },
    
    // Images handling
    images: (content as CaptionDataStructure).images || 
      (frontmatter?.images ? { micro: frontmatter.images.micro } : undefined),
    
    // Use parsed text content
    before_text: captionData.beforeText,
    after_text: captionData.afterText,
    
  } : {
    // Handle string content
    title: frontmatter?.title || 'Material Analysis',
    description: frontmatter?.description || 'Surface analysis results',
    material: frontmatter?.name || 'material',
    before_text: typeof content === 'string' ? content : undefined,
    author_object: frontmatter?.author_object || 
      (typeof frontmatter?.author === 'object' ? frontmatter.author : 
       typeof frontmatter?.author === 'string' ? { name: frontmatter.author } : 
       { name: 'Z-Beam Research Team' }),
    images: frontmatter?.images ? { micro: frontmatter.images.micro } : undefined,
  };

  const materialName = enhancedData.material || 'material';
  const capitalizedMaterial = materialName.charAt(0).toUpperCase() + materialName.slice(1);
  const analysisId = `analysis-${materialName}-${Date.now()}`;

  // Image source handling with fallbacks
  const imageSource = enhancedData.images?.micro?.url;

  // Reset loading states when image source changes
  useEffect(() => {
    if (imageSource) {
      setImageLoaded(false);
      setImageError(false);
      setImageLoading(true);
      
      // Preload the image
      const img = new window.Image();
      img.onload = () => {
        setImageLoaded(true);
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
      img.src = imageSource;
    } else {
      setImageLoaded(false);
      setImageError(false);
      setImageLoading(false);
    }
  }, [imageSource]);

  // Generate accessible alt text with multiple fallbacks
  const getAccessibleAlt = (): string => {
    if (enhancedData.accessibility?.alt_text_detailed) {
      return enhancedData.accessibility.alt_text_detailed;
    }
    if (enhancedData.images?.micro?.alt) {
      return enhancedData.images.micro.alt;
    }
    return `${capitalizedMaterial} surface analysis comparison showing before and after laser cleaning results`;
  };

  // Generate accessible aria-label for section
  const getAriaLabel = (): string => {
    return `Surface analysis section for ${capitalizedMaterial} laser cleaning treatment`;
  };

  // Generate comprehensive JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": enhancedData.seo_data?.schema_type || "TechArticle",
    "@id": `#${analysisId}`,
    "headline": enhancedData.title || `${capitalizedMaterial} Laser Cleaning Analysis`,
    "description": enhancedData.description || `Professional laser cleaning analysis of ${materialName} with detailed technical specifications and quality metrics`,
    "author": {
      "@type": "Person",
      "name": enhancedData.author_object?.name || "Z-Beam Research Team",
      "jobTitle": enhancedData.author_object?.title,
      "affiliation": enhancedData.author_object?.affiliation,
      "email": enhancedData.author_object?.email,
      "expertise": enhancedData.author_object?.expertise
    },
    "about": {
      "@type": "Material",
      "name": capitalizedMaterial,
      "materialComposition": enhancedData.chemicalProperties?.composition,
      "chemicalFormula": enhancedData.chemicalProperties?.formula
    },
    "image": {
      "@type": "ImageObject",
      "url": enhancedData.images?.micro?.url,
      "caption": `${capitalizedMaterial} surface analysis showing before and after laser cleaning results`,
      "width": enhancedData.images?.micro?.width || 800,
      "height": enhancedData.images?.micro?.height || 450,
      "encodingFormat": enhancedData.images?.micro?.format || "JPEG"
    },
    "inLanguage": enhancedData.accessibility?.caption_language || "en",
    "datePublished": enhancedData.metadata?.generated || new Date().toISOString(),
    "dateModified": enhancedData.seo_data?.last_modified || enhancedData.metadata?.generated || new Date().toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "Z-Beam"
    },
    "keywords": enhancedData.keywords,
    "mainEntity": {
      "@type": "Substance",
      "name": capitalizedMaterial,
      "hasProperty": enhancedData.quality_metrics ? [
        {
          "@type": "PropertyValue",
          "name": "Contamination Removal",
          "value": enhancedData.quality_metrics.contamination_removal
        },
        {
          "@type": "PropertyValue", 
          "name": "Surface Roughness Before",
          "value": enhancedData.quality_metrics.surface_roughness_before
        },
        {
          "@type": "PropertyValue",
          "name": "Surface Roughness After", 
          "value": enhancedData.quality_metrics.surface_roughness_after
        }
      ] : undefined
    }
  };

  return (
    <section 
      ref={captionRef}
      className={`enhanced-seo-caption ${className}`}
      itemScope 
      itemType="https://schema.org/TechArticle"
      aria-label={getAriaLabel()}
      role="region"
    >
      {/* JSON-LD Structured Data - invisible to users, visible to search engines */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Main Content */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          {capitalizedMaterial} Surface Micrograph
        </h3>
        <figure 
          className="caption-container" 
          itemScope 
          itemType="https://schema.org/ImageObject"
        >
        {imageSource && isInView ? (
          <div className="relative">
            {/* Performance-optimized Next.js Image component */}
            <Image
              src={imageSource}
              alt={getAccessibleAlt()}
              width={enhancedData.images?.micro?.width || 800}
              height={enhancedData.images?.micro?.height || 450}
              className="w-full h-[300px] md:h-[400px] object-cover rounded-lg shadow-lg"
              itemProp="contentUrl"
              priority={false} // Caption images are typically below-fold
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 800px"
              onLoad={() => {
                setImageLoaded(true);
                setImageLoading(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              onLoadStart={() => setImageLoading(true)}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
            />

            {/* Loading indicator overlay with screen reader support */}
            {imageLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10"
                role="status"
                aria-live="polite"
                aria-label="Loading surface analysis image"
              >
                <div className="rounded-full h-8 w-8 border-b-2 border-white" aria-hidden="true"></div>
                <span className="sr-only">Loading surface analysis image...</span>
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
                  <div className="text-sm opacity-75">Surface analysis image could not be loaded</div>
                  <span className="sr-only">Error: Surface analysis image failed to load</span>
                </div>
              </div>
            )}

            {/* Quality Metrics overlaid on image with accessibility */}
            {enhancedData.quality_metrics && imageLoaded && (
              <div 
                className="absolute bottom-4 left-0 right-0 w-full px-4"
                role="region"
                aria-label="Quality metrics overlay"
                tabIndex={0}
              >
                <MetricsGrid 
                  qualityMetrics={enhancedData.quality_metrics}
                  maxCards={2}
                  excludeMetrics={['substrate_integrity']}
                />
              </div>
            )}
          </div>
        ) : imageSource && !isInView ? (
          // Placeholder while not in view for performance
          <div className="w-full h-[300px] md:h-[400px] bg-gray-800 rounded-lg" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg"></div>
          </div>
        ) : (
          // Fallback when no image available
          <div 
            className="w-full h-[300px] md:h-[400px] flex items-center justify-center bg-gray-600 rounded-lg"
            aria-label="No surface analysis image available"
          >
            <Image
              src="/images/Site/Logo/logo_.png"
              alt="Z-Beam company logo"
              width={120}
              height={72}
              className="opacity-30 object-contain"
              priority={false}
            />
          </div>
        )}
        
        <figcaption className="mt-4 pb-4 mb-2 text-sm max-w-none">
          {(enhancedData.before_text || enhancedData.after_text) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enhancedData.before_text && (
                <div className="px-2">
                  <h4 
                    className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"
                    id={`before-treatment-${analysisId}`}
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" aria-hidden="true"></span>
                    Before Treatment
                  </h4>
                  <p 
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 md:mb-0"
                    aria-labelledby={`before-treatment-${analysisId}`}
                  >
                    {enhancedData.before_text}
                  </p>
                </div>
              )}
              
              {enhancedData.after_text && (
                <div className="px-2">
                  <h4 
                    className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"
                    id={`after-treatment-${analysisId}`}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true"></span>
                    After Treatment
                  </h4>
                  <p 
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                    aria-labelledby={`after-treatment-${analysisId}`}
                  >
                    {enhancedData.after_text}
                  </p>
                </div>
              )}
            </div>
          ) : captionData.renderedContent ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {captionData.renderedContent}
            </p>
          ) : null}
        </figcaption>
      </figure>
      </div>

    </section>
  );
}

export type { CaptionDataStructure, FrontmatterType, CaptionProps, ParsedCaptionData };
