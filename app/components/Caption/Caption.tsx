// app/components/Caption/Caption.tsx
"use client";

import React from 'react';
import { useCaptionParsing, CaptionData, ParsedCaptionData } from './useCaptionParsing';
import { MetricsGrid } from './MetricsGrid';
import { AuthorInfo, CaptionDataStructure, FrontmatterType, CaptionProps } from '../../../types/centralized';
import './enhanced-seo-caption.css';

export function Caption({ content, image, frontmatter, config }: CaptionProps) {
  const captionData = useCaptionParsing(content);
  const { className = '' } = config || {};

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
      "url": image || enhancedData.images?.micro?.url,
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
      className={`enhanced-seo-caption ${className}`}
      itemScope 
      itemType="https://schema.org/TechArticle"
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
        {enhancedData.images?.micro?.url && (
          <div className="relative">
            <img
              src={enhancedData.images.micro.url}
              alt={enhancedData.accessibility?.alt_text_detailed || 
                   enhancedData.images.micro.alt ||
                   `${capitalizedMaterial} surface analysis comparison`}
              width={enhancedData.images.micro.width || 800}
              height={enhancedData.images.micro.height || 450}
              className="w-full h-[300px] md:h-[400px] object-cover rounded-lg shadow-lg"
              itemProp="contentUrl"
            />
            {/* Quality Metrics overlaid on image */}
            {enhancedData.quality_metrics && (
              <div className="absolute bottom-4 left-0 right-0 w-full">
                <MetricsGrid 
                  qualityMetrics={enhancedData.quality_metrics}
                  maxCards={2}
                  excludeMetrics={['substrate_integrity']}
                />
              </div>
            )}
          </div>
        )}
        
        <figcaption className="mt-4 pb-4 mb-2 text-sm max-w-none">
          {(enhancedData.before_text || enhancedData.after_text) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enhancedData.before_text && (
                <div className="px-2">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Before Treatment
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 md:mb-0">
                    {enhancedData.before_text}
                  </p>
                </div>
              )}
              
              {enhancedData.after_text && (
                <div className="px-2">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    After Treatment
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
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
