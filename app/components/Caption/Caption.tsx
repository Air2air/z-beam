/**
 * @component Caption
 * @purpose Displays material images with technical metadata and machine settings
 * @dependencies SectionContainer, @/types (CaptionProps, FrontmatterType), useCaptionParsing, MetricsCard
 * @related MetricsCard/MetricsCard.tsx, CaptionImage.tsx, CaptionContent.tsx
 * @complexity Medium (154 lines, handles image loading and metadata parsing)
 * @aiContext Use CaptionProps from @/types. Pass frontmatter.caption data structure.
 *           Component auto-parses different caption formats (YAML, object, string).
 */
// app/components/Caption/Caption.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCaptionParsing } from './useCaptionParsing';
import { CaptionDataStructure, CaptionProps } from '@/types';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { SITE_CONFIG } from '../../utils/constants';
import { capitalizeFirst } from '@/app/utils/formatting';
import './caption-accessibility.css';

// Utility function to wrap first sentence in markdown bold syntax
function emphasizeFirstSentence(text: string): string {
  if (!text) return text;
  
  // Find the first period followed by a space or end of string
  const firstSentenceMatch = text.match(/^([^.]+\.)(\s|$)/);
  
  if (firstSentenceMatch) {
    const firstSentence = firstSentenceMatch[1];
    const remainingText = text.slice(firstSentence.length);
    // Wrap first sentence in markdown bold syntax
    return `**${firstSentence}**${remainingText}`;
  }
  
  return text;
}

export function Caption({ frontmatter, config }: CaptionProps) {
  const captionContent = frontmatter?.caption;
  
  // Call hooks unconditionally - MUST be before any early returns
  const parsedCaption = useCaptionParsing(captionContent as any);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
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
  
  // Early return AFTER all hooks - check if caption is just a string with before/after structure
  if (!captionContent) {
    return null;
  }
  
  // Handle case where caption might be just {before: "text", after: "text"} without other fields
  const isCaptionObject = typeof captionContent === 'object' && captionContent !== null;
  const hasImageData = isCaptionObject && (
    (captionContent as any).images?.micro?.url || 
    (captionContent as any).imageUrl?.url
  );
  
  // Also return null if image failed to load
  const imageSource = frontmatter?.images?.micro?.url || 
    (isCaptionObject && hasImageData ? ((captionContent as CaptionDataStructure).images?.micro?.url || (captionContent as CaptionDataStructure).imageUrl?.url) : null);
  
  if (imageSource && imageError) {
    return null;
  }
  
  const { className = '' } = config || {};

  // Simplified caption data - use parsed caption data
  const captionData: CaptionDataStructure = {
    ...(isCaptionObject ? (captionContent as CaptionDataStructure) : {}),
    title: (isCaptionObject ? (captionContent as CaptionDataStructure).title : undefined) || frontmatter?.title,
    description: (isCaptionObject ? (captionContent as CaptionDataStructure).description : undefined) || frontmatter?.description,
    material: (isCaptionObject ? (captionContent as CaptionDataStructure).material : undefined) || frontmatter?.name,
    // Add parsed before/after text from the hook
    before: parsedCaption.before,
    after: parsedCaption.after,
    quality_metrics: parsedCaption.qualityMetrics,
  };

  const materialName = captionData.material || 'material';
  const capitalizedMaterial = capitalizeFirst(materialName);

  return (
    <SectionContainer 
      title={`${capitalizedMaterial} surface magnification`}
      bgColor="transparent"
      radius={false}
    >
      {/* Image Section */}
      {imageSource && (
        <figure 
          ref={captionRef}
          className={`seo-caption relative aspect-[16/9] overflow-hidden rounded-lg ${className}`}
          itemScope 
          itemType={`${SITE_CONFIG.schema.context}/TechArticle`}
        >
          {isInView && (
            <>
              <Image
                src={imageSource}
                alt={`${capitalizedMaterial} surface analysis`}
                width={800}
                height={450}
                className="w-full h-full object-cover"
                priority={false}
                quality={85}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
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
                          className="bg-secondary bg-opacity-90 p-3 rounded-lg backdrop-blur-sm"
                        >
                          <dt className="text-xs text-tertiary uppercase mb-1">
                            {key.replace(/_/g, ' ')}
                          </dt>
                          <dd className="text-sm">
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
            </>
          )}
        </figure>
      )}

        {/* Before/After Content */}
        {(captionData.before || captionData.after) && (
          <div className="grid md:grid-cols-2 gap-6">
            {captionData.before && (
              <div className="p-6 md:p-8 card-background rounded-lg">
                <h4>
                  Before Treatment
                </h4>
                <div className="text-secondary text-sm">
                  <MarkdownRenderer content={emphasizeFirstSentence(captionData.before)} />
                </div>
              </div>
            )}
            {captionData.after && (
              <div className="p-6 md:p-8 card-background rounded-lg">
                <h4>
                  After Treatment
                </h4>
                <div className="text-secondary text-sm">
                  <MarkdownRenderer content={emphasizeFirstSentence(captionData.after)} />
                </div>
              </div>
            )}
          </div>
        )}
    </SectionContainer>
  );
}
