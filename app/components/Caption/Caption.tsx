/**
 * @component Caption
 * @purpose Displays material images with technical metadata and machine settings
 * @dependencies @/types (CaptionProps, FrontmatterType), useCaptionParsing, MetricsCard
 * @related MetricsCard/MetricsCard.tsx, CaptionImage.tsx, CaptionContent.tsx
 * @complexity Medium (154 lines, handles image loading and metadata parsing)
 * @aiContext Use CaptionProps from @/types. Pass frontmatter.caption data structure.
 *           Component auto-parses different caption formats (YAML, object, string).
 */
// app/components/Caption/Caption.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCaptionParsing, CaptionData } from './useCaptionParsing';
import { CaptionDataStructure, FrontmatterType, CaptionProps } from '@/types';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { SITE_CONFIG } from '../../utils/constants';
import './seo-caption.css';
import './caption-accessibility.css';

export function Caption({ frontmatter, config }: CaptionProps) {
  const captionContent = frontmatter?.caption;
  
  if (!captionContent) {
    return null;
  }
  
  const parsedCaption = useCaptionParsing(captionContent as any);
  const { className = '' } = config || {};
  
  // Simplified state - only what's essential
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const captionRef = useRef<HTMLElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!captionRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(captionRef.current);
    return () => observer.disconnect();
  }, []);

  // Simplified caption data
  const captionData: CaptionDataStructure = {
    ...(captionContent as CaptionDataStructure),
    title: (captionContent as CaptionDataStructure).title || frontmatter?.title,
    description: (captionContent as CaptionDataStructure).description || frontmatter?.description,
    material: (captionContent as CaptionDataStructure).material || frontmatter?.name,
  };

  const materialName = captionData.material || 'material';
  const capitalizedMaterial = materialName.charAt(0).toUpperCase() + materialName.slice(1);
  const imageSource = captionData.images?.micro?.url || captionData.imageUrl?.url;

  return (
    <section 
      ref={captionRef}
      className={`seo-caption ${className}`}
      itemScope 
      itemType={`${SITE_CONFIG.schema.context}/TechArticle`}
      role="region"
    >
      {/* Header - Using SectionTitle for consistency */}
      <SectionTitle 
        title={captionData.title || `Material Properties - ${capitalizedMaterial}`}
      />

      {/* Image Section */}
      {imageSource && isInView && (
        <figure className="relative mb-6 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={imageSource}
            alt={`${capitalizedMaterial} surface analysis`}
            width={800}
            height={450}
            className="w-full h-full object-cover"
            priority={false}
            quality={85}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Quality Metrics Overlay */}
          {captionData.quality_metrics && imageLoaded && (
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(captionData.quality_metrics)
                  .filter(([key]) => key !== 'substrate_integrity')
                  .map(([key, value]) => (
                    <div 
                      key={key} 
                      className="bg-gray-800 bg-opacity-90 p-3 rounded-lg backdrop-blur-sm"
                    >
                      <dt className="text-xs text-gray-400 uppercase mb-1">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-sm text-white">
                        <data 
                          value={value}
                          data-property={key}
                          data-metric-type="quality_measurement"
                          data-context="surface_analysis"
                          data-material={captionData.material || 'unknown'}
                          data-precision={String(value).includes('.') ? String(value).split('.')[1]?.length || 0 : 0}
                          data-magnitude={Math.abs(Number(value)) >= 100 ? 'high' : Math.abs(Number(value)) >= 1 ? 'medium' : 'low'}
                          itemProp="value"
                          itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
                        >
                          {String(value)}
                        </data>
                      </dd>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </figure>
      )}

      {/* Before/After Content */}
      {(captionData.beforeText || captionData.afterText) && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {captionData.beforeText && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-base md:text-lg mb-3 text-yellow-600 dark:text-yellow-400">
                Before Treatment
              </h3>
              <p className="text-sm text-gray-300">{captionData.beforeText}</p>
            </div>
          )}
          {captionData.afterText && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-base md:text-lg mb-3 text-yellow-600 dark:text-yellow-400">
                After Treatment
              </h3>
              <p className="text-sm text-gray-300">{captionData.afterText}</p>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {captionData.description && (
        <div className="mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">{captionData.description}</p>
        </div>
      )}
    </section>
  );
}
