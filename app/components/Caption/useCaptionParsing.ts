// app/components/Caption/useCaptionParsing.ts
"use client";

interface CaptionYamlData {
  before?: string;
  after?: string;
  material?: string;
  laser_parameters?: {
    wavelength?: number;
    power?: number;
    pulse_duration?: number;
    spot_size?: number;
    frequency?: number;
    energy_density?: number;
  };
  metadata?: {
    generated?: string;
    format?: string;
    version?: string;
  };
}

// Extended interface for YAML v2.0 data structure with quality metrics and metadata
interface EnhancedCaptionYamlData extends CaptionYamlData {
  before_text?: string;
  after_text?: string;
  quality_metrics?: {
    contamination_removal?: string;
    surface_roughness_before?: string;
    surface_roughness_after?: string;
    thermal_damage?: string;
    substrate_integrity?: string;
    processing_efficiency?: string;
    confidence_score?: number;
    validation_status?: string;
  };
  author_object?: {
    name?: string;
    email?: string;
    affiliation?: string;
    title?: string;
    expertise?: string[];
    credentials?: string[];
    experience_years?: number;
  };
  technical_specifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
    beam_delivery?: string;
    process_parameters?: string;
    safety_requirements?: string;
  };
  material_properties?: {
    composition?: string;
    surface_treatment?: string;
    contamination_type?: string;
    material_type?: string;
    formula?: string;
    surface_finish?: string;
    corrosion_resistance?: string;
    mechanical_properties?: string;
  };
  analysis_methodology?: {
    equipment_used?: string;
    measurement_technique?: string;
    sample_preparation?: string;
    environmental_conditions?: string;
    calibration_standards?: string;
  };
  seo_metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical_url?: string;
    structured_data?: Record<string, unknown>;
  };
  accessibility?: {
    alt_text?: string;
    long_description?: string;
    contrast_requirements?: string;
    screen_reader_notes?: string;
  };
}

// Import centralized ParsedCaptionData type
import { ParsedCaptionData } from '@/types';

// Union type for backward compatibility
type CaptionData = CaptionYamlData | EnhancedCaptionYamlData;

// Phase 2A: Cleaner alias removing "Enhanced" decoration
type CaptionDataV2 = EnhancedCaptionYamlData;

export type { CaptionYamlData, EnhancedCaptionYamlData, CaptionData, CaptionDataV2 };

export function useCaptionParsing(content: string | CaptionData): ParsedCaptionData {
  // Handle string content (legacy markdown)
  if (typeof content === 'string') {
    return {
      renderedContent: content,
      isEnhanced: false,
    };
  }

  // Handle YAML v2.0 structure
  if (content && typeof content === 'object') {
    const yamlData = content as EnhancedCaptionYamlData;
    let renderedContent = '';
    
    // Check if this is v2.0 data (has new extended fields)
    const hasV2Features = !!(
      yamlData.quality_metrics || 
      yamlData.technical_specifications || 
      yamlData.material_properties ||
      yamlData.analysis_methodology ||
      yamlData.seo_metadata
    );
    
    // Process before text (support both old and new field names)
    const beforeText = yamlData.before_text || yamlData.before;
    if (beforeText) {
      // Inject laser parameters into the before text
      let processedBeforeText = beforeText;
      if (yamlData.laser_parameters) {
        const params = yamlData.laser_parameters;
        processedBeforeText = processedBeforeText
          .replace(/\$\{wavelength\}/g, params.wavelength?.toString() || '')
          .replace(/\$\{power\}/g, params.power?.toString() || '')
          .replace(/\$\{pulse_duration\}/g, params.pulse_duration?.toString() || '')
          .replace(/\$\{spot_size\}/g, params.spot_size?.toString() || '')
          .replace(/\$\{frequency\}/g, params.frequency?.toString() || '')
          .replace(/\$\{energy_density\}/g, params.energy_density?.toString() || '');
      }
      
      renderedContent = processedBeforeText;
    }
    
    // Process after text (support both old and new field names)
    const afterText = yamlData.after_text || yamlData.after;
    if (afterText) {
      if (renderedContent) renderedContent += '\n\n';
      
      // Inject laser parameters into the after text
      let processedAfterText = afterText;
      if (yamlData.laser_parameters) {
        const params = yamlData.laser_parameters;
        processedAfterText = processedAfterText
          .replace(/\$\{wavelength\}/g, params.wavelength?.toString() || '')
          .replace(/\$\{power\}/g, params.power?.toString() || '')
          .replace(/\$\{pulse_duration\}/g, params.pulse_duration?.toString() || '')
          .replace(/\$\{spot_size\}/g, params.spot_size?.toString() || '')
          .replace(/\$\{frequency\}/g, params.frequency?.toString() || '')
          .replace(/\$\{energy_density\}/g, params.energy_density?.toString() || '');
      }
      
      renderedContent += processedAfterText;
    }
    
    return {
      renderedContent,
      beforeText,
      afterText,
      laserParams: yamlData.laser_parameters,
      metadata: yamlData.metadata,
      material: yamlData.material,
      isEnhanced: hasV2Features,
      qualityMetrics: yamlData.quality_metrics,
      authorObject: yamlData.author_object,
      technicalSpecs: yamlData.technical_specifications,
      materialProps: yamlData.material_properties,
      methodology: yamlData.analysis_methodology,
      seoMetadata: yamlData.seo_metadata,
      accessibility: yamlData.accessibility,
    };
  }

  // Fallback for malformed content
  return {
    renderedContent: 'Caption content not available',
    isEnhanced: false,
  };
}
