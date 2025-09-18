// app/components/Caption/Caption.tsx
"use client";

import { CaptionHeader } from './CaptionHeader';
import { CaptionImage } from './CaptionImage';
import { CaptionContent } from './CaptionContent';
import { TechnicalDetails } from './TechnicalDetails';
import { MetadataDisplay } from './MetadataDisplay';
import { useCaptionParsing, CaptionYamlData, ParsedCaptionData } from './useCaptionParsing';
import './styles.css';
import { AuthorInfo } from '../../../types';

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
  };
}

export type { FrontmatterType, ParsedCaptionData };

interface CaptionProps {
  content: string | CaptionYamlData;
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

  // Get material name for heading
  const materialName = typeof captionData.material === 'string' ? captionData.material : 
                      typeof frontmatter?.name === 'string' ? frontmatter.name : 'Material';

  // Determine image source
  const imageSource = image || 
    (frontmatter?.images?.micro?.url ? frontmatter.images.micro.url : undefined);

  // Generate comprehensive SEO data
  const authorName = frontmatter?.author_object?.name || 
    (typeof frontmatter?.author === 'string' ? frontmatter.author : 
     typeof frontmatter?.author === 'object' && frontmatter.author?.name ? frontmatter.author.name : 
     'Z-Beam Research Team');

  const seoData = {
    materialType: frontmatter?.chemicalProperties?.materialType || 'material',
    description: frontmatter?.description || `Surface topography analysis of ${materialName} after laser cleaning treatment`,
    author: authorName,
    wavelength: captionData.laserParams?.wavelength || frontmatter?.technicalSpecifications?.wavelength,
    materialFormula: frontmatter?.chemicalProperties?.formula,
  };

  return (
    <section 
      className="caption-section" 
      itemScope 
      itemType="https://schema.org/AnalysisNewsArticle"
      aria-labelledby="surface-analysis-heading"
    >
      {/* Enhanced JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AnalysisNewsArticle",
            "headline": `${materialName} Surface Topography Analysis`,
            "description": seoData.description,
            "author": {
              "@type": "Person",
              "name": seoData.author,
              "jobTitle": frontmatter?.author_object?.title,
              "expertise": frontmatter?.author_object?.expertise
            },
            "about": {
              "@type": "Material",
              "name": materialName,
              "materialType": seoData.materialType,
              "chemicalFormula": seoData.materialFormula
            },
            "image": {
              "@type": "ImageObject",
              "url": imageSource,
              "caption": `${materialName} surface analysis showing before and after laser cleaning`,
              "width": "800",
              "height": "450"
            },
            "technique": {
              "@type": "DefinedTerm",
              "name": "Laser Cleaning",
              "description": "Surface treatment using focused laser energy for contaminant removal"
            },
            "datePublished": captionData.metadata?.generated || new Date().toISOString(),
            "publisher": {
              "@type": "Organization",
              "name": "Z-Beam"
            }
          })
        }}
      />

      <CaptionHeader 
        materialName={materialName} 
        frontmatter={frontmatter}
        captionData={captionData}
      />
      
      <figure 
        className={`caption-container ${className}`} 
        itemScope 
        itemType="https://schema.org/ImageObject"
        role="img"
        aria-labelledby="surface-analysis-heading"
        aria-describedby="surface-analysis-description"
      >
        <CaptionImage 
          imageSource={imageSource} 
          frontmatter={frontmatter}
          materialName={materialName}
          seoData={seoData}
        />
        
        <figcaption 
          id="surface-analysis-description"
          className="caption-text p-8"
          itemProp="caption"
        >
                    <CaptionContent
            content={captionData.renderedContent}
            beforeText={captionData.beforeText || ''}
            afterText={captionData.afterText || ''}
            materialName={materialName}
            frontmatter={frontmatter}
            seoData={seoData}
          />
          
          <TechnicalDetails 
            laserParams={captionData.laserParams}
            show={config?.showTechnicalDetails ?? true}
            frontmatter={frontmatter}
          />
          
          <MetadataDisplay 
            metadata={captionData.metadata}
            material={captionData.material}
            show={config?.showMetadata ?? false}
            frontmatter={frontmatter}
          />
        </figcaption>
      </figure>
    </section>
  );
}
