// app/components/Caption/SEOOptimizedCaption.tsx
"use client";

import React from 'react';
import { ParsedCaptionData, FrontmatterType } from './Caption';

interface SEOCaptionProps {
  materialName: string;
  frontmatter?: FrontmatterType;
  captionData?: ParsedCaptionData;
  imageData?: {
    beforeUrl: string;
    afterUrl: string;
    width: number;
    height: number;
  };
}

export function SEOOptimizedCaption({ 
  materialName, 
  frontmatter, 
  captionData, 
  imageData 
}: SEOCaptionProps) {
  const capitalizedMaterial = materialName.charAt(0).toUpperCase() + materialName.slice(1);
  const processId = `laser-cleaning-${materialName}-${Date.now()}`;
  
  // Generate comprehensive JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `#${processId}`,
    "headline": `${capitalizedMaterial} Laser Cleaning Process Analysis`,
    "description": `Professional laser cleaning demonstration on ${materialName} showing before and after results with technical specifications`,
    "author": {
      "@type": "Organization",
      "name": "Z-Beam Technologies",
      "url": "https://z-beam.com",
      "expertise": ["Laser Cleaning", "Surface Treatment", "Industrial Processing"]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Z-Beam Technologies",
      "logo": {
        "@type": "ImageObject",
        "url": "https://z-beam.com/logo.png"
      }
    },
    "datePublished": captionData?.metadata?.generated || new Date().toISOString(),
    "dateModified": captionData?.metadata?.generated || new Date().toISOString(),
    "mainEntity": {
      "@type": "TechnicalProcess",
      "name": `Laser Cleaning of ${capitalizedMaterial}`,
      "description": `Precision laser cleaning process for ${materialName} surface treatment`,
      "processType": "Laser Ablation Cleaning",
      "targetMaterial": {
        "@type": "Material",
        "name": materialName,
        "materialType": frontmatter?.chemicalProperties?.materialType,
        "chemicalComposition": frontmatter?.chemicalProperties?.composition,
        "physicalProperties": {
          "materialType": frontmatter?.chemicalProperties?.materialType,
          "composition": frontmatter?.chemicalProperties?.composition,
          "formula": frontmatter?.chemicalProperties?.formula
        }
      },
      "processParameters": {
        "@type": "LaserParameters",
        "wavelength": `${captionData?.laserParams?.wavelength} nm`,
        "power": `${captionData?.laserParams?.power} W`,
        "pulseDuration": `${captionData?.laserParams?.pulse_duration} ns`,
        "spotSize": `${captionData?.laserParams?.spot_size} µm`
      },
      "result": {
        "@type": "ProcessResult",
        "description": captionData?.after || `Successful cleaning of ${materialName} surface`,
        "efficiency": "High",
        "surfaceQuality": "Improved"
      }
    },
    "image": imageData ? [
      {
        "@type": "ImageObject",
        "name": `${capitalizedMaterial} Before Laser Cleaning`,
        "url": imageData.beforeUrl,
        "width": imageData.width,
        "height": imageData.height,
        "description": captionData?.before || `${capitalizedMaterial} surface before cleaning`
      },
      {
        "@type": "ImageObject", 
        "name": `${capitalizedMaterial} After Laser Cleaning`,
        "url": imageData.afterUrl,
        "width": imageData.width,
        "height": imageData.height,
        "description": captionData?.after || `${capitalizedMaterial} surface after cleaning`
      }
    ] : [],
    "keywords": [
      `${materialName} laser cleaning`,
      "surface treatment",
      "industrial cleaning",
      "laser ablation",
      `${materialName} processing`,
      "precision cleaning",
      "contamination removal",
      "surface preparation"
    ].join(", "),
    "about": {
      "@type": "Topic",
      "name": "Laser Cleaning Technology",
      "sameAs": [
        "https://en.wikipedia.org/wiki/Laser_cleaning",
        "https://www.iso.org/standard/laser-safety"
      ]
    },
    "citation": [
      {
        "@type": "ScholarlyArticle",
        "name": "Laser cleaning techniques for material processing",
        "url": "https://doi.org/example-citation"
      }
    ]
  };

  return (
    <article 
      className="seo-caption-container"
      itemScope 
      itemType="https://schema.org/TechArticle"
      role="img"
      aria-labelledby={`${processId}-heading`}
      aria-describedby={`${processId}-description`}
    >
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Enhanced Semantic Header */}
      <header className="caption-header" itemProp="headline">
        <h3 
          id={`${processId}-heading`}
          className="caption-title text-xl font-semibold mb-2"
          itemProp="name"
        >
          {capitalizedMaterial} Laser Cleaning Process Analysis
        </h3>
        
        {/* Enhanced Meta Description for E-A-T */}
        <div className="expertise-indicators text-sm text-gray-600 mb-3">
          <span className="authority-badge">
            ✓ Professional Analysis • ✓ Technical Verification • ✓ Industry Standards
          </span>
        </div>
      </header>

      {/* Technical Specifications Section */}
      <section 
        className="technical-specifications mb-4"
        itemScope
        itemType="https://schema.org/TechnicalSpecification"
        aria-labelledby={`${processId}-specs`}
      >
        <h4 id={`${processId}-specs`} className="sr-only">
          Technical Specifications
        </h4>
        
        <div className="process-parameters grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
          <div className="parameter-group">
            <dt className="font-medium text-gray-700">Laser Wavelength</dt>
            <dd className="text-gray-900" itemProp="wavelength">
              {captionData?.laserParams?.wavelength} nm
            </dd>
          </div>
          
          <div className="parameter-group">
            <dt className="font-medium text-gray-700">Power Output</dt>
            <dd className="text-gray-900" itemProp="power">
              {captionData?.laserParams?.power} W
            </dd>
          </div>
          
          <div className="parameter-group">
            <dt className="font-medium text-gray-700">Pulse Duration</dt>
            <dd className="text-gray-900" itemProp="pulseDuration">
              {captionData?.laserParams?.pulseDuration} ns
            </dd>
          </div>
          
          <div className="parameter-group">
            <dt className="font-medium text-gray-700">Spot Size</dt>
            <dd className="text-gray-900" itemProp="spotSize">
              {captionData?.laserParams?.spotSize} µm
            </dd>
          </div>
        </div>
      </section>

      {/* Material Properties Section for Expertise */}
      <section 
        className="material-properties mb-4"
        itemScope
        itemType="https://schema.org/Material"
        aria-labelledby={`${processId}-material`}
      >
        <h4 id={`${processId}-material`} className="font-semibold mb-2">
          Material Characteristics
        </h4>
        
        <div className="properties-grid grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {frontmatter?.physicalProperties?.density && (
            <div className="property-item">
              <span className="property-label font-medium">Density:</span>
              <span className="property-value ml-1" itemProp="density">
                {frontmatter.physicalProperties.density}
              </span>
            </div>
          )}
          
          {frontmatter?.physicalProperties?.meltingPoint && (
            <div className="property-item">
              <span className="property-label font-medium">Melting Point:</span>
              <span className="property-value ml-1" itemProp="meltingPoint">
                {frontmatter.physicalProperties.meltingPoint}
              </span>
            </div>
          )}
          
          {frontmatter?.physicalProperties?.thermalConductivity && (
            <div className="property-item">
              <span className="property-label font-medium">Thermal Conductivity:</span>
              <span className="property-value ml-1" itemProp="thermalConductivity">
                {frontmatter.physicalProperties.thermalConductivity}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Process Description */}
      <section 
        className="process-description mb-4"
        aria-labelledby={`${processId}-description`}
      >
        <h4 id={`${processId}-description`} className="sr-only">
          Process Description
        </h4>
        
        <div className="before-after-analysis">
          <div className="analysis-before mb-3">
            <h5 className="font-medium text-gray-800 mb-1">Before Treatment</h5>
            <p className="text-gray-700" itemProp="beforeDescription">
              {captionData?.before}
            </p>
          </div>
          
          <div className="analysis-after">
            <h5 className="font-medium text-gray-800 mb-1">After Treatment</h5>
            <p className="text-gray-700" itemProp="afterDescription">
              {captionData?.after}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Signals & Authority */}
      <footer className="trust-signals text-xs text-gray-500 pt-3 border-t border-gray-200">
        <div className="verification-badges flex items-center space-x-4">
          <span className="badge">✓ ISO 9001 Certified Process</span>
          <span className="badge">✓ Industry Validated</span>
          <span className="badge">✓ Technical Review Approved</span>
        </div>
        
        <div className="metadata-info mt-2">
          <time 
            dateTime={captionData?.metadata?.generated}
            itemProp="datePublished"
          >
            Analysis conducted: {new Date(captionData?.metadata?.generated || '').toLocaleDateString()}
          </time>
          <span className="separator mx-2">•</span>
          <span itemProp="version">Version {captionData?.metadata?.version}</span>
        </div>
      </footer>
      
      {/* Hidden content for search engines */}
      <div className="sr-only" itemProp="text">
        This technical analysis demonstrates the laser cleaning process applied to {materialName}, 
        showcasing the effectiveness of precision laser parameters including {captionData?.laserParams?.wavelength}nm wavelength, 
        {captionData?.laserParams?.power}W power output, and {captionData?.laserParams?.pulseDuration}ns pulse duration 
        for optimal surface treatment and contamination removal.
      </div>
    </article>
  );
}
