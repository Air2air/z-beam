// app/components/Caption/Caption.tsx
"use client";


import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCaptionParsing, CaptionData } from './useCaptionParsing';
import { CaptionDataStructure, FrontmatterType, CaptionProps } from '@/types';
import { Header } from '../Header';
import './enhanced-seo-caption.css';
import './caption-accessibility.css';

export function Caption({ frontmatter, config }: CaptionProps) {
  // Use caption data from frontmatter.caption exclusively
  const captionContent = frontmatter?.caption;
  
  if (!captionContent) {
    return null; // No caption data available
  }
  
  
  const captionData = useCaptionParsing(captionContent as any);
  const { className = '' } = config || {};
  
  // State management for image loading and accessibility
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [focusedMetricIndex, setFocusedMetricIndex] = useState(-1);
  const [metricsExpanded, setMetricsExpanded] = useState(true);
  const [announceMessage, setAnnounceMessage] = useState('');
  const captionRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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

  // Process caption data from frontmatter.caption only
  const enhancedData: CaptionDataStructure = {
    // Use frontmatter.caption as the primary data source
    ...(captionContent as CaptionDataStructure),
    
    // Fallback to general frontmatter when caption-specific data is not available
    title: (captionContent as CaptionDataStructure).title || frontmatter?.title,
    description: (captionContent as CaptionDataStructure).description || frontmatter?.description,
    keywords: (captionContent as CaptionDataStructure).keywords || frontmatter?.keywords,
    material: (captionContent as CaptionDataStructure).material || frontmatter?.name,
    
    // Author data handling
    author_object: (captionContent as CaptionDataStructure).author_object || 
      frontmatter?.author_object || 
      (typeof frontmatter?.author === 'object' ? frontmatter.author : 
       typeof frontmatter?.author === 'string' ? { name: frontmatter.author } : 
       { name: 'Z-Beam Research Team' }),
    
    // Technical and chemical properties merging
    technicalSpecifications: {
      ...frontmatter?.technicalSpecifications,
      ...(captionContent as CaptionDataStructure).technicalSpecifications,
    },
    chemicalProperties: {
      ...frontmatter?.chemicalProperties,
      ...(captionContent as CaptionDataStructure).chemicalProperties,
    },
    
    // Images handling
    images: (captionContent as CaptionDataStructure).images || 
      (frontmatter?.images ? { micro: frontmatter.images.micro } : undefined),
  };

  // Enhanced keyboard navigation for quality metrics
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enhancedData.quality_metrics) return;
    
    const metricsEntries = Object.entries(enhancedData.quality_metrics)
      .filter(([key]) => key !== 'substrate_integrity')
      .slice(0, 2);
    
    const maxIndex = metricsEntries.length - 1;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setFocusedMetricIndex(prev => Math.min(prev + 1, maxIndex));
        setAnnounceMessage(`Focused on ${metricsEntries[Math.min(focusedMetricIndex + 1, maxIndex)]?.[0]?.replace(/_/g, ' ')} metric`);
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setFocusedMetricIndex(prev => Math.max(prev - 1, 0));
        setAnnounceMessage(`Focused on ${metricsEntries[Math.max(focusedMetricIndex - 1, 0)]?.[0]?.replace(/_/g, ' ')} metric`);
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedMetricIndex(0);
        setAnnounceMessage(`Focused on first metric: ${metricsEntries[0]?.[0]?.replace(/_/g, ' ')}`);
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedMetricIndex(maxIndex);
        setAnnounceMessage(`Focused on last metric: ${metricsEntries[maxIndex]?.[0]?.replace(/_/g, ' ')}`);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        setMetricsExpanded(prev => !prev);
        setAnnounceMessage(metricsExpanded ? 'Quality metrics collapsed' : 'Quality metrics expanded');
        break;
        
      case 'Escape':
        event.preventDefault();
        setFocusedMetricIndex(-1);
        captionRef.current?.focus();
        setAnnounceMessage('Focus returned to main caption');
        break;
    }
  }, [enhancedData.quality_metrics, focusedMetricIndex, metricsExpanded]);

  const materialName = enhancedData.material || 'material';
  const capitalizedMaterial = materialName.charAt(0).toUpperCase() + materialName.slice(1);
  const analysisId = `analysis-${materialName}-${Date.now()}`;
  
  // Generate comprehensive accessibility IDs
  const sectionId = `caption-section-${analysisId}`;
  const titleId = `caption-title-${analysisId}`;
  const imageId = `caption-image-${analysisId}`;
  const metricsId = `caption-metrics-${analysisId}`;
  const descriptionId = `caption-desc-${analysisId}`;
  const beforeId = `before-treatment-${analysisId}`;
  const afterId = `after-treatment-${analysisId}`;
  const liveRegionId = `caption-announcements-${analysisId}`;

  // Image source handling with fallbacks
  const imageSource = enhancedData.images?.micro?.url || enhancedData.imageUrl?.url;

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
  
  // Generate comprehensive accessibility description
  const getAccessibilityDescription = (): string => {
    const hasMetrics = enhancedData.quality_metrics && Object.keys(enhancedData.quality_metrics).length > 0;
    const hasBeforeAfter = enhancedData.beforeText && enhancedData.afterText;
    
    let description = `Interactive ${capitalizedMaterial} laser cleaning analysis`;
    if (hasMetrics) description += ' with quality metrics overlay';
    if (hasBeforeAfter) description += ' and before/after comparison';
    description += '. Use arrow keys to navigate metrics, Enter to toggle expansion, Escape to return focus.';
    
    return description;
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
      id={sectionId}
      className={`enhanced-seo-caption ${className}`}
      itemScope 
      itemType="https://schema.org/TechArticle"
      aria-label={getAriaLabel()}
      aria-describedby={`${descriptionId} ${liveRegionId}`}
      role="region"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      
      {/* Live region for screen reader announcements */}
      <div 
        id={liveRegionId}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {announceMessage}
      </div>
      
      {/* Hidden comprehensive description for screen readers */}
      <div id={descriptionId} className="sr-only">
        {getAccessibilityDescription()}
      </div>
      {/* JSON-LD Structured Data - invisible to users, visible to search engines */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Main Content */}
      <div className="mb-8">
        <header>
          <Header 
            level="section"
            title={`Material Properties - ${capitalizedMaterial}`}
            className="text-xl font-bold text-white mb-4"
          />
        </header>
        <figure 
          className="caption-container" 
          itemScope 
          itemType="https://schema.org/ImageObject"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={imageId}
        >
        
        {/* Hidden image description for screen readers */}
        <div id={imageId} className="sr-only">
          {enhancedData.images?.micro?.url 
            ? `Surface analysis image showing ${capitalizedMaterial} before and after laser cleaning treatment with ${enhancedData.quality_metrics ? 'interactive quality metrics overlay' : 'technical details'}`
            : `No image available for ${capitalizedMaterial} surface analysis`
          }
        </div>
        {imageSource && isInView ? (
          <div 
            ref={imageRef}
            className="relative"
            role="img"
            aria-label={getAccessibleAlt()}
          >
            {/* Performance-optimized Next.js Image component */}
            <Image
              src={imageSource}
              alt={getAccessibleAlt()}
              width={enhancedData.images?.micro?.width || 800}
              height={enhancedData.images?.micro?.height || 450}
              className="w-full h-[300px] md:h-[400px] object-cover rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              itemProp="contentUrl"
              priority={false} // Caption images are typically below-fold
              quality={85}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 800px"
              tabIndex={0}
              onLoad={() => {
                setImageLoaded(true);
                setImageLoading(false);
                setAnnounceMessage('Surface analysis image loaded successfully');
              }}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
                setAnnounceMessage('Surface analysis image failed to load');
              }}
              onLoadStart={() => {
                setImageLoading(true);
                setAnnounceMessage('Loading surface analysis image');
              }}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
            />

            {/* Loading indicator overlay with screen reader support */}
            {imageLoading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10"
                role="progressbar"
                aria-label="Loading surface analysis image"
                aria-describedby={`${imageId}-loading`}
                tabIndex={0}
              >
                <div className="rounded-full h-8 w-8 border-b-2 border-white animate-spin" aria-hidden="true"></div>
                <span id={`${imageId}-loading`} className="sr-only">Loading surface analysis image for {capitalizedMaterial}...</span>
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
            {enhancedData.quality_metrics && imageLoaded && metricsExpanded && (
              <div 
                ref={metricsRef}
                id={metricsId}
                className="absolute bottom-4 left-0 right-0 w-full px-4"
                role="region"
                aria-label="Interactive quality metrics overlay"
                aria-describedby={`${metricsId}-desc`}
                aria-expanded={metricsExpanded}
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
              
              {/* Hidden description for screen readers */}
              <div id={`${metricsId}-desc`} className="sr-only">
                Quality metrics overlay with {Object.keys(enhancedData.quality_metrics).length} measurements. 
                Use arrow keys to navigate, Enter to toggle, Escape to exit.
              </div>
                {/* Quality metrics display - inline to remove Caption MetricsGrid dependency */}
                {enhancedData.quality_metrics && Object.keys(enhancedData.quality_metrics).length > 0 && (
                  <div 
                    className="grid grid-cols-2 gap-2 w-full min-w-0 overflow-hidden"
                    role="list"
                    aria-label="Quality metrics list"
                  >
                    {Object.entries(enhancedData.quality_metrics)
                      .filter(([key]) => key !== 'substrate_integrity')
                      .slice(0, 2)
                      .map(([key, value], index) => {
                        const isFocused = focusedMetricIndex === index;
                        const metricId = `metric-${key}-${analysisId}`;
                        const labelId = `metric-label-${key}-${analysisId}`;
                        
                        return (
                          <div 
                            key={key} 
                            className="flex justify-start items-start min-w-0 overflow-hidden"
                            role="listitem"
                          >
                            <div 
                              id={metricId}
                              className={`metric-card bg-gray-800 inline-flex flex-col justify-center items-center text-center backdrop-blur-lg p-2 rounded-lg shadow-lg min-w-0 max-w-full ml-6 transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 ${
                                isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 scale-105' : ''
                              }`}
                              role="article"
                              aria-labelledby={labelId}
                              tabIndex={isFocused ? 0 : -1}
                            >
                              <dt 
                                id={labelId}
                                className="text-xs font-medium text-gray-400 uppercase tracking-wider leading-tight truncate w-full"
                              >
                                {key.replace(/_/g, ' ')}
                              </dt>
                              <dd 
                                className="text-lg font-bold text-gray-100 mt-1 leading-tight -tracking-wide truncate w-full"
                                aria-describedby={labelId}
                              >
                                <data 
                                  value={value}
                                  data-property={key}
                                  data-metric-type="quality_measurement"
                                  data-context="surface_analysis"
                                  data-material={captionData?.material || 'unknown'}
                                  data-precision={String(value).includes('.') ? String(value).split('.')[1]?.length || 0 : 0}
                                  data-magnitude={Math.abs(Number(value)) >= 100 ? 'high' : Math.abs(Number(value)) >= 1 ? 'medium' : 'low'}
                                  itemProp="value"
                                  itemType="https://schema.org/PropertyValue"
                                >{String(value)}</data>
                              </dd>
                              
                              {/* Screen reader description */}
                              <div className="sr-only">
                                Metric: {key.replace(/_/g, ' ')}, Value: {String(value)}
                                {isFocused && ', Currently focused'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        ) : imageSource && !isInView ? (
          // Placeholder while not in view for performance - properly contained
          <div className="relative">
            <div className="w-full h-[300px] md:h-[400px] bg-gray-800 animate-pulse rounded-lg shadow-lg" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg"></div>
            </div>
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
        
        <figcaption 
          className="mt-4 pb-4 mb-2 text-sm max-w-none"
          role="group"
          aria-labelledby={titleId}
        >
          {(enhancedData.beforeText || enhancedData.afterText) ? (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              role="group"
              aria-label="Before and after treatment comparison"
            >
              {enhancedData.beforeText && (
                <section 
                  className="px-2"
                  role="region"
                  aria-labelledby={beforeId}
                >
                  <h4 
                    id={beforeId}
                    className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"
                    role="heading"
                    aria-level={4}
                  >
                    <span 
                      className="w-2 h-2 bg-red-500 rounded-full mr-2" 
                      aria-hidden="true"
                      role="presentation"
                    ></span>
                    Before Treatment
                  </h4>
                  <p 
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 md:mb-0"
                    aria-labelledby={beforeId}
                  >
                    {enhancedData.beforeText}
                  </p>
                </section>
              )}
              
              {enhancedData.afterText && (
                <section 
                  className="px-2"
                  role="region"
                  aria-labelledby={afterId}
                >
                  <h4 
                    id={afterId}
                    className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center"
                    role="heading"
                    aria-level={4}
                  >
                    <span 
                      className="w-2 h-2 bg-green-500 rounded-full mr-2" 
                      aria-hidden="true"
                      role="presentation"
                    ></span>
                    After Treatment
                  </h4>
                  <p 
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                    aria-labelledby={afterId}
                  >
                    {enhancedData.afterText}
                  </p>
                </section>
              )}
            </div>
          ) : captionData.renderedContent ? (
            <p 
              className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
              role="text"
            >
              {captionData.renderedContent}
            </p>
          ) : null}
        </figcaption>
      </figure>
      </div>

    </section>
  );
}
