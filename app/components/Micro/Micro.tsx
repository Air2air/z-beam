/**
 * @component Micro
 * @purpose Displays material images with technical metadata and machine settings
 * @dependencies SectionContainer, @/types (MicroProps, FrontmatterType), useMicroParsing, MetricsCard
 * @related MetricsCard/MetricsCard.tsx, MicroImage.tsx, MicroContent.tsx
 * @complexity Medium (154 lines, handles image loading and metadata parsing)
 * @aiContext Use MicroProps from @/types. Pass frontmatter.micro data structure.
 *           Component auto-parses different micro formats (YAML, object, string).
 */
// app/components/Micro/Micro.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useMicroParsing } from './useMicroParsing';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { MicroDataStructure, MicroProps } from '@/types';
import { BaseSection } from '../BaseSection/BaseSection';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { SITE_CONFIG } from '@/app/config/site';
import { capitalizeFirst } from '@/app/utils/formatting';
import './micro-accessibility.css';

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

export function Micro({ frontmatter, config }: MicroProps) {
  const microContent = frontmatter?.micro || (frontmatter as any)?.components?.micro;
  
  // Call hooks unconditionally - MUST be before any early returns
  const parsedMicro = useMicroParsing(microContent as any);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const microRef = useRef<HTMLElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!microRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(microRef.current);
    return () => observer.disconnect();
  }, []);
  
  // Early return AFTER all hooks - check if micro is just a string with before/after structure
  if (!microContent) {
    return null;
  }
  
  // Handle case where micro might be just {before: "text", after: "text"} without other fields
  const isMicroObject = typeof microContent === 'object' && microContent !== null;
  const hasImageData = isMicroObject && (
    (microContent as any).images?.micro?.url || 
    (microContent as any).imageUrl?.url
  );
  
  // Get image source from frontmatter or micro object
  const imageSource = frontmatter?.images?.micro?.url || 
    (isMicroObject && hasImageData ? ((microContent as MicroDataStructure).images?.micro?.url || (microContent as MicroDataStructure).imageUrl?.url) : null);
  
  // Return null if no image or image failed to load
  if (!imageSource || imageError) {
    return null;
  }
  
  const { className = '' } = config || {};

  // Simplified micro data - use parsed micro data
  const microData: MicroDataStructure = {
    ...(isMicroObject ? (microContent as MicroDataStructure) : {}),
    title: (isMicroObject ? (microContent as MicroDataStructure).title : undefined) || frontmatter?.title,
    description: (isMicroObject ? (microContent as MicroDataStructure).description : undefined) || frontmatter?.description,
    material: (isMicroObject ? (microContent as MicroDataStructure).material : undefined) || frontmatter?.name,
    // Add parsed before/after text from the hook
    before: parsedMicro.before,
    after: parsedMicro.after,
    qualityMetrics: parsedMicro.qualityMetrics,
  };

  const materialName = microData.material || 'material';
  const capitalizedMaterial = capitalizeFirst(materialName);

  return (
    <BaseSection 
      title={`${capitalizedMaterial} 500-1000x surface magnification`}
      description="Microscopic surface analysis and contamination details"
      bgColor="transparent"
      radius={false}
    >
      {/* Image Section */}
      {imageSource && (
        <figure 
          ref={microRef}
          className={`seo-micro relative aspect-[16/9] overflow-hidden rounded-md ${className}`}
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
                sizes="(max-width: 768px) 100vw, 800px"
                className="w-full h-full object-cover"
                priority={false}
                quality={85}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />

              {/* Quality Metrics Overlay */}
              {microData.qualityMetrics && imageLoaded && (
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <div className={`grid-micro ${GRID_GAP_RESPONSIVE}`}>
                    {Object.entries(microData.qualityMetrics)
                      .filter(([key]) => key !== 'substrate_integrity')
                      .map(([key, value]) => (
                        <div 
                          key={key} 
                          className="bg-secondary bg-opacity-90 p-3 rounded-md backdrop-blur-sm"
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
                              data-material={microData.material || 'unknown'}
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
        {(microData.before || microData.after) && (
          <div className={`grid-2col-md ${GRID_GAP_RESPONSIVE}`}>
            {microData.before && (
              <div className="p-4 md:p-5 card-background rounded-md">
                <h4>
                  Before Treatment
                </h4>
                <div className="text-secondary text-sm">
                  <MarkdownRenderer content={emphasizeFirstSentence(microData.before)} />
                </div>
              </div>
            )}
            {microData.after && (
              <div className="p-4 md:p-5 card-background rounded-md">
                <h4>
                  After Treatment
                </h4>
                <div className="text-secondary text-sm">
                  <MarkdownRenderer content={emphasizeFirstSentence(microData.after)} />
                </div>
              </div>
            )}
          </div>
        )}
    </BaseSection>
  );
}
