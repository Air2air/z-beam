// types/settings.ts
// Type safety for machine settings and settings pages
// Enforces camelCase naming standard (ADR-006)

/**
 * Individual machine setting parameter with unit, value, and range
 */
export interface MachineSettingParameter {
  value: number;
  unit: string;
  description: string;
  min?: number;
  max?: number;
  typical?: number;
  notes?: string;
}

/**
 * Complete machine settings configuration
 * All properties use camelCase naming (ADR-006)
 */
export interface MachineSettings {
  wavelength: MachineSettingParameter;
  powerRange: MachineSettingParameter;
  spotSize: MachineSettingParameter;
  repetitionRate: MachineSettingParameter;
  energyDensity: MachineSettingParameter;
  pulseWidth: MachineSettingParameter;
  scanSpeed?: MachineSettingParameter;
  passCount?: MachineSettingParameter;
  focusDepth?: MachineSettingParameter;
  beamQuality?: MachineSettingParameter;
  [key: string]: MachineSettingParameter | undefined;
}

/**
 * Settings YAML frontmatter structure
 * Enforces camelCase property naming
 */
export interface SettingsYAML {
  name: string;
  title: string;
  category: string;
  subcategory: string;
  slug: string;
  description?: string;
  
  // Machine settings (camelCase - ADR-006)
  machineSettings: MachineSettings;
  
  // Material properties (camelCase - ADR-006)
  materialProperties?: {
    physical?: Record<string, MachineSettingParameter>;
    mechanical?: Record<string, MachineSettingParameter>;
    thermal?: Record<string, MachineSettingParameter>;
    optical?: Record<string, MachineSettingParameter>;
  };
  
  // Metadata
  images?: {
    hero?: {
      url: string;
      alt?: string;
    };
    og?: {
      url: string;
      alt?: string;
    };
    twitter?: {
      url: string;
      alt?: string;
    };
  };
  
  // SEO fields (camelCase - ADR-006)
  pageDescription?: string;
  metaDescription?: string;
  fullPath?: string;
  
  // Relationships (camelCase - ADR-006)
  relationships?: {
    interactions?: {
      contaminatedBy?: {
        items: Array<{
          id: string;
          frequency?: string;
          severity?: string;
          typical_context?: string;
        }>;
      };
    };
    operational?: {
      industry_applications?: any;
    };
  };
}

/**
 * Type guard to check if data is valid MachineSettings
 */
export function isMachineSettings(data: unknown): data is MachineSettings {
  if (!data || typeof data !== 'object') return false;
  
  const settings = data as Partial<MachineSettings>;
  
  // Check for required parameters
  return Boolean(
    settings.wavelength &&
    settings.powerRange &&
    settings.spotSize &&
    settings.repetitionRate &&
    settings.energyDensity &&
    settings.pulseWidth
  );
}

/**
 * Type guard to check if parameter is valid MachineSettingParameter
 */
export function isMachineSettingParameter(data: unknown): data is MachineSettingParameter {
  if (!data || typeof data !== 'object') return false;
  
  const param = data as Partial<MachineSettingParameter>;
  
  return Boolean(
    typeof param.value === 'number' &&
    typeof param.unit === 'string' &&
    typeof param.description === 'string'
  );
}

/**
 * Extract machine settings with type safety
 * Replaces unsafe helper function with typed version
 * 
 * @param metadata - Raw metadata object
 * @returns Typed MachineSettings or null
 */
export function getMachineSettings(metadata: unknown): MachineSettings | null {
  if (!metadata || typeof metadata !== 'object') return null;
  
  const data = metadata as any;
  const settings = data.machineSettings;
  
  if (isMachineSettings(settings)) {
    return settings;
  }
  
  return null;
}

/**
 * Validate settings YAML structure at runtime
 * Use for build-time validation and testing
 */
export function validateSettingsYAML(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Settings data must be an object');
    return { valid: false, errors };
  }
  
  const settings = data as Partial<SettingsYAML>;
  
  // Required fields
  if (!settings.name) errors.push('Missing required field: name');
  if (!settings.title) errors.push('Missing required field: title');
  if (!settings.category) errors.push('Missing required field: category');
  if (!settings.slug) errors.push('Missing required field: slug');
  
  // Machine settings validation
  if (!settings.machineSettings) {
    errors.push('Missing required field: machineSettings');
  } else if (!isMachineSettings(settings.machineSettings)) {
    errors.push('Invalid machineSettings structure - missing required parameters');
  }
  
  // Validate individual parameters if machineSettings exists
  if (settings.machineSettings) {
    const required = ['wavelength', 'powerRange', 'spotSize', 'repetitionRate', 'energyDensity', 'pulseWidth'];
    
    for (const param of required) {
      const value = settings.machineSettings[param];
      if (!isMachineSettingParameter(value)) {
        errors.push(`Invalid parameter: machineSettings.${param}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
