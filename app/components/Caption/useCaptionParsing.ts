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

interface ParsedCaptionData {
  renderedContent: string;
  beforeText?: string;
  afterText?: string;
  laserParams?: CaptionYamlData['laser_parameters'];
  metadata?: CaptionYamlData['metadata'];
  material?: string;
}

export type { CaptionYamlData, ParsedCaptionData };

export function useCaptionParsing(content: string | CaptionYamlData): ParsedCaptionData {
  // Handle string content (legacy markdown)
  if (typeof content === 'string') {
    return {
      renderedContent: content,
    };
  }

  // Handle YAML v2.0 structure
  if (content && typeof content === 'object') {
    const yamlData = content as CaptionYamlData;
    let renderedContent = '';
    
    // Process before text
    if (yamlData.before) {
      // Inject laser parameters into the before text
      let beforeText = yamlData.before;
      if (yamlData.laser_parameters) {
        const params = yamlData.laser_parameters;
        beforeText = beforeText
          .replace(/\$\{wavelength\}/g, params.wavelength?.toString() || '')
          .replace(/\$\{power\}/g, params.power?.toString() || '')
          .replace(/\$\{pulse_duration\}/g, params.pulse_duration?.toString() || '')
          .replace(/\$\{spot_size\}/g, params.spot_size?.toString() || '')
          .replace(/\$\{frequency\}/g, params.frequency?.toString() || '')
          .replace(/\$\{energy_density\}/g, params.energy_density?.toString() || '');
      }
      
      renderedContent = beforeText;
    }
    
    // Process after text
    if (yamlData.after) {
      if (renderedContent) renderedContent += '\n\n';
      
      // Inject laser parameters into the after text
      let afterText = yamlData.after;
      if (yamlData.laser_parameters) {
        const params = yamlData.laser_parameters;
        afterText = afterText
          .replace(/\$\{wavelength\}/g, params.wavelength?.toString() || '')
          .replace(/\$\{power\}/g, params.power?.toString() || '')
          .replace(/\$\{pulse_duration\}/g, params.pulse_duration?.toString() || '')
          .replace(/\$\{spot_size\}/g, params.spot_size?.toString() || '')
          .replace(/\$\{frequency\}/g, params.frequency?.toString() || '')
          .replace(/\$\{energy_density\}/g, params.energy_density?.toString() || '');
      }
      
      renderedContent += afterText;
    }
    
    return {
      renderedContent,
      beforeText: yamlData.before,
      afterText: yamlData.after,
      laserParams: yamlData.laser_parameters,
      metadata: yamlData.metadata,
      material: yamlData.material,
    };
  }

  // Fallback for malformed content
  return {
    renderedContent: 'Caption content not available',
  };
}
