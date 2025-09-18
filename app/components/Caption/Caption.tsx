// app/components/Caption/Caption.tsx
"use client";

import React from 'react';
import { useCaptionParsing, CaptionData, ParsedCaptionData } from './useCaptionParsing';
import { AuthorInfo } from '../../../types';
import './enhanced-seo-caption.css';

// Enhanced Caption Data Structure
interface EnhancedCaptionData {
  before_text?: string;
  after_text?: string;
  material?: string;
  laser_parameters?: {
    wavelength?: number;
    power?: number;
    pulse_duration?: number;
    spot_size?: string;
    frequency?: number;
    energy_density?: number;
    scanning_speed?: string;
    beam_profile?: string;
    pulse_overlap?: number;
  };
  quality_metrics?: {
    contamination_removal?: string;
    surface_roughness_before?: string;
    surface_roughness_after?: string;
    thermal_damage?: string;
    substrate_integrity?: string;
    processing_efficiency?: string;
  };
  author_object?: {
    name?: string;
    email?: string;
    affiliation?: string;
    title?: string;
    expertise?: string[];
  };
  chemicalProperties?: {
    composition?: string;
    surface_treatment?: string;
    contamination_type?: string;
    materialType?: string;
    formula?: string;
    surface_finish?: string;
    corrosion_resistance?: string;
    density?: string;
    meltingPoint?: string;
    thermalConductivity?: string;
  };
  technicalSpecifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
    beam_delivery?: string;
    focus_diameter?: string;
    processing_atmosphere?: string;
  };
  metadata?: {
    generated?: string;
    format?: string;
    version?: string;
    analysis_method?: string;
    magnification?: string;
    field_of_view?: string;
    image_resolution?: string;
  };
  images?: {
    micro?: {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
      format?: string;
      caption?: string;
    };
  };
  accessibility?: {
    alt_text_detailed?: string;
    caption_language?: string;
    technical_level?: string;
    visual_description?: string;
  };
  keywords?: string[];
  title?: string;
  description?: string;
  seo_data?: {
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    schema_type?: string;
    last_modified?: string;
  };
}

// Legacy frontmatter interface for backward compatibility
interface FrontmatterType {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string | AuthorInfo;
  name?: string;
  images?: {
    micro?: {
      url?: string;
    };
  };
  author_object?: {
    name: string;
    email?: string;
    affiliation?: string;
    title?: string;
    expertise?: string[];
  };
  technicalSpecifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
  };
  chemicalProperties?: {
    composition?: string;
    surface_treatment?: string;
    contamination_type?: string;
    materialType?: string;
    formula?: string;
    density?: string;
    meltingPoint?: string;
    thermalConductivity?: string;
  };
}

interface CaptionProps {
  content: string | CaptionData;
  image?: string;
  frontmatter?: FrontmatterType;
  config?: {
    className?: string;
    showTechnicalDetails?: boolean;
    showMetadata?: boolean;
  };
}

export function Caption({ content, image, frontmatter, config }: CaptionProps) {
  const captionData = useCaptionParsing(content);
  const { className = '' } = config || {};

  // Convert any input to enhanced format for unified processing
  const enhancedData: EnhancedCaptionData = typeof content === 'object' ? {
    // Use any to bypass type checking for the conversion
    ...(content as any),
    
    // Merge with frontmatter data for backward compatibility
    title: (content as any).title || frontmatter?.title,
    description: (content as any).description || frontmatter?.description,
    keywords: (content as any).keywords || frontmatter?.keywords,
    material: content.material || frontmatter?.name,
    
    // Author data - prefer new format, fallback to frontmatter
    author_object: (content as any).author_object || frontmatter?.author_object || 
      (typeof frontmatter?.author === 'object' ? frontmatter.author : 
       typeof frontmatter?.author === 'string' ? { name: frontmatter.author } : 
       { name: 'Z-Beam Research Team' }),
    
    // Technical specifications - merge old and new
    technicalSpecifications: {
      ...frontmatter?.technicalSpecifications,
      ...(content as any).technicalSpecifications,
    },
    
    // Chemical properties - merge old and new  
    chemicalProperties: {
      ...frontmatter?.chemicalProperties,
      ...(content as any).chemicalProperties,
    },
    
    // Images - prefer content, fallback to frontmatter
    images: (content as any).images || (frontmatter?.images ? {
      micro: frontmatter.images.micro
    } : undefined),
    
    // Convert laser parameters to proper format
    laser_parameters: captionData.laserParams ? {
      ...captionData.laserParams,
      spot_size: captionData.laserParams.spot_size?.toString() || "1.0mm",
      scanning_speed: frontmatter?.technicalSpecifications?.scanning_speed || "500 mm/min",
      beam_profile: "gaussian",
      pulse_overlap: undefined,
    } : undefined,
    
    // Use parsed content for text fields
    before_text: captionData.beforeText,
    after_text: captionData.afterText,
    
  } : {
    // Handle legacy string content
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
      
      {/* Quality Metrics */}
      {enhancedData.quality_metrics && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Quality Assessment Results
          </h3>
          <div className="metrics-grid grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(enhancedData.quality_metrics).map(([key, value]) => (
              <div key={key} className="metric-card bg-white p-4 rounded-lg border">
                <dt className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  {key.replace(/_/g, ' ')}
                </dt>
                <dd className="metric-value text-2xl font-bold text-gray-900 mt-1">
                  {value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <img
            src={enhancedData.images.micro.url}
            alt={enhancedData.accessibility?.alt_text_detailed || 
                 enhancedData.images.micro.alt ||
                 `${capitalizedMaterial} surface analysis comparison`}
            width={enhancedData.images.micro.width || 800}
            height={enhancedData.images.micro.height || 450}
            className="w-full h-auto rounded-lg shadow-lg"
            itemProp="contentUrl"
          />
        )}
        
        <figcaption className="mt-6 prose max-w-none">
          {enhancedData.before_text && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Before Treatment
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {enhancedData.before_text}
              </p>
            </div>
          )}
          
          {enhancedData.after_text && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                After Treatment
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {enhancedData.after_text}
              </p>
            </div>
          )}
          
          {!enhancedData.before_text && !enhancedData.after_text && captionData.renderedContent && (
            <p className="text-gray-700 leading-relaxed">
              {captionData.renderedContent}
            </p>
          )}
        </figcaption>
      </figure>
      </div>

      {/* Machine Settings */}
      {(enhancedData.technicalSpecifications || enhancedData.laser_parameters) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Machine Settings
          </h3>
          <div className="specs-grid grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {enhancedData.laser_parameters && Object.entries(enhancedData.laser_parameters).map(([key, value]) => (
              <div key={key} className="spec-item">
                <dt className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {value}
                  {key === 'wavelength' && 'nm'}
                  {key === 'power' && 'W'}
                  {key === 'pulse_duration' && 'ns'}
                  {key === 'frequency' && 'Hz'}
                  {key === 'energy_density' && 'J/cm²'}
                </dd>
              </div>
            ))}
            {enhancedData.technicalSpecifications && Object.entries(enhancedData.technicalSpecifications).map(([key, value]) => (
              <div key={key} className="spec-item">
                <dt className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {value}
                </dd>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}

export type { EnhancedCaptionData, FrontmatterType, CaptionProps, ParsedCaptionData };
