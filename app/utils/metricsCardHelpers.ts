// app/utils/metricsCardHelpers.ts
// Utilities for extracting and transforming machine settings data for MetricsCard

import { ArticleMetadata, PropertyWithUnits } from '@/types';

/**
 * Extract machine settings from article frontmatter and transform to PropertyWithUnits format
 */
export function extractMachineSettingsFromFrontmatter(metadata: ArticleMetadata): Record<string, PropertyWithUnits> {
  const machineSettings: Record<string, PropertyWithUnits> = {};
  
  // First, check if machineSettings exists in metadata
  const rawSettings = metadata.machineSettings;
  if (rawSettings) {
    // Handle both direct property access and nested settings structure
    let settingsData: any = rawSettings;
    
    // If it's wrapped in a settings array structure (like in YAML)
    if (rawSettings.settings && Array.isArray(rawSettings.settings)) {
      // Flatten the settings array structure
      const flatSettings: Record<string, any> = {};
      
      rawSettings.settings.forEach((section: any) => {
        if (section.rows && Array.isArray(section.rows)) {
          section.rows.forEach((row: any) => {
            if (row.parameter && row.value !== undefined) {
              const key = parameterNameToKey(row.parameter);
              flatSettings[key] = {
                numeric: parseNumericValue(row.value),
                text: String(row.value),
                units: extractUnit(row.value, row.range),
                range: parseRange(row.range),
                category: row.category
              };
            }
          });
        }
      });
      
      settingsData = flatSettings;
    } else if (typeof rawSettings === 'object') {
      // Handle direct object properties
      Object.entries(rawSettings).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string') {
          machineSettings[key] = {
            numeric: typeof value === 'number' ? value : parseNumericValue(value),
            text: String(value),
            units: inferUnits(key),
          };
        } else if (typeof value === 'object' && value !== null) {
          machineSettings[key] = value as PropertyWithUnits;
        }
      });
    }
    
    // Transform flattened settings to PropertyWithUnits format
    Object.entries(settingsData).forEach(([key, setting]) => {
      if (setting && typeof setting === 'object') {
        machineSettings[key] = setting as PropertyWithUnits;
      }
    });
  }
  
  // Extract machine settings from YAML component data or frontmatter
  const rawMachineSettings = metadata.machineSettings;
  if (rawMachineSettings && typeof rawMachineSettings === 'object') {
    
    // Check if this is new YAML format (has structured data with value/unit/min/max)
    const isNewFormat = Object.values(rawMachineSettings).some(setting => 
      setting && typeof setting === 'object' && 'value' in setting
    );
    
    if (isNewFormat) {
      // New YAML format: direct structured data
      Object.entries(rawMachineSettings).forEach(([key, setting]) => {
        if (setting && typeof setting === 'object') {
          const settingObj = setting as any;
          machineSettings[key] = {
            numeric: settingObj.value,
            text: `${settingObj.value}${settingObj.unit ? ` ${settingObj.unit}` : ''}`,
            units: settingObj.unit,
            range: (settingObj.min !== undefined && settingObj.max !== undefined) ? 
              { min: settingObj.min, max: settingObj.max } : undefined
          };
        }
      });
    } else {
      // Legacy frontmatter format
      const directMachineSettingsMap = {
        powerRange: 'power',
        wavelength: 'wavelength', 
        pulseDuration: 'pulseWidth',
        repetitionRate: 'frequency',
        spotSize: 'spotSize',
        fluenceRange: 'fluence'
      };
      
      Object.entries(directMachineSettingsMap).forEach(([frontmatterKey, settingKey]) => {
        const value = rawMachineSettings[frontmatterKey];
        const unit = rawMachineSettings[`${frontmatterKey}Unit`];
        const min = rawMachineSettings[`${frontmatterKey}Min`];
        const max = rawMachineSettings[`${frontmatterKey}Max`];
        
        if (value !== undefined) {
          // Ensure unit is a string
          const unitStr = typeof unit === 'string' ? unit : inferUnits(frontmatterKey);
          
          // Ensure min/max are numbers
          const minNum = typeof min === 'number' ? min : parseNumericValue(min);
          const maxNum = typeof max === 'number' ? max : parseNumericValue(max);
          
          machineSettings[settingKey] = {
            numeric: typeof value === 'number' ? value : parseNumericValue(value),
            text: `${value}${unitStr ? ` ${unitStr}` : ''}`,
            units: unitStr,
            range: (minNum !== undefined && maxNum !== undefined) ? { min: minNum, max: maxNum } : undefined
          };
        }
      });
    }
  }
  
  return machineSettings;
}

/**
 * Convert parameter names to consistent keys
 */
function parameterNameToKey(parameter: string): string {
  return parameter
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/range$/, '')
    .replace(/duration$/, 'width')
    .replace(/repetitionrate/, 'frequency')
    .replace(/scanningspeed/, 'speed');
}

/**
 * Parse numeric value from string or number
 */
function parseNumericValue(value: any): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : undefined;
  }
  return undefined;
}

/**
 * Extract unit from value or range string
 */
function extractUnit(value: any, range?: string): string | undefined {
  const text = String(value);
  
  // Common units patterns
  const unitPatterns = [
    /(\w+)$/,  // Unit at end
    /(W|nm|ns|kHz|Hz|mm\/s|mm|μm|J\/cm²|%)$/i,
    /(watts?|nanometers?|nanoseconds?|hertz|millimeters?|micrometers?|joules?)$/i
  ];
  
  for (const pattern of unitPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const unit = match[1];
      // Skip if it looks like part of a number
      if (!/^\d/.test(unit)) {
        return unit;
      }
    }
  }
  
  // Try to extract from range if available
  if (range) {
    const rangeMatch = range.match(/(W|nm|ns|kHz|Hz|mm\/s|mm|μm|J\/cm²|%)/i);
    if (rangeMatch) return rangeMatch[1];
  }
  
  return undefined;
}

/**
 * Parse range string into min/max values
 */
function parseRange(range?: string): { min: number; max: number; units?: string } | undefined {
  if (!range) return undefined;
  
  const rangeMatch = range.match(/([\d.]+)\s*-\s*([\d.]+)\s*(\w+)?/);
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
      units: rangeMatch[3]
    };
  }
  
  return undefined;
}

/**
 * Infer units based on parameter key patterns
 */
function inferUnits(key: string): string | undefined {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('power')) return 'W';
  if (lowerKey.includes('wavelength')) return 'nm';
  if (lowerKey.includes('pulse') || lowerKey.includes('duration')) return 'ns';
  if (lowerKey.includes('frequency') || lowerKey.includes('rate')) return 'Hz';
  if (lowerKey.includes('speed') || lowerKey.includes('velocity')) return 'mm/s';
  if (lowerKey.includes('size') || lowerKey.includes('diameter')) return 'mm';
  if (lowerKey.includes('fluence')) return 'J/cm²';
  
  return undefined;
}

/**
 * Get common machine setting configurations for MetricsCard
 */
export const COMMON_MACHINE_SETTINGS = [
  {
    key: 'power',
    title: 'Power',
    description: 'Laser power output for material processing',
    priority: 1,
    colorScheme: 'blue'
  },
  {
    key: 'wavelength',
    title: 'Wavelength',
    description: 'Optical wavelength for material interaction',
    priority: 1,
    colorScheme: 'indigo'
  },
  {
    key: 'pulseduration',
    title: 'Pulse Duration',
    description: 'Temporal width of laser pulses',
    priority: 1,
    colorScheme: 'purple'
  },
  {
    key: 'frequency',
    title: 'Frequency',
    description: 'Pulse repetition rate',
    priority: 2,
    colorScheme: 'green'
  },
  {
    key: 'fluence',
    title: 'Fluence',
    description: 'Energy density per pulse',
    priority: 2,
    colorScheme: 'yellow'
  },
  {
    key: 'spotsize',
    title: 'Spot Size',
    description: 'Focused beam diameter',
    priority: 2,
    colorScheme: 'red'
  }
];

/**
 * Create a MachineSettings object compatible with the MetricsCard component
 */
export function createMachineSettingsForMetricsCard(metadata: ArticleMetadata) {
  const extractedSettings = extractMachineSettingsFromFrontmatter(metadata);
  
  return {
    power: extractedSettings.power,
    wavelength: extractedSettings.wavelength,
    pulseWidth: extractedSettings.pulseWidth,  // Fixed: was pulseduration
    frequency: extractedSettings.frequency,
    spotSize: extractedSettings.spotSize,      // Fixed: was spotsize
    speed: extractedSettings.speed,
    fluence: extractedSettings.fluence,
    ...extractedSettings // Include any other extracted settings
  };
}