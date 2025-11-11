// app/utils/metricsCardHelpers.ts
// Utilities for extracting and transforming machine settings data for MetricsCard

import { ArticleMetadata, PropertyWithUnits, GenericMetricConfig, GenericMetricData, MetricAutoDiscoveryConfig } from '../../types';

/**
 * Extract any numeric values from frontmatter metadata - GENERIC VERSION
 * This function can work with any frontmatter keys that contain numeric values
 */
export function extractGenericMetricsFromFrontmatter(
  metadata: ArticleMetadata,
  configs?: GenericMetricConfig[],
  autoDiscoveryConfig?: MetricAutoDiscoveryConfig
): GenericMetricData[] {
  const extractedMetrics: GenericMetricData[] = [];
  
  // If specific configs are provided, extract those metrics
  if (configs && configs.length > 0) {
    for (const config of configs) {
      const metricData = extractMetricFromKey(metadata, config);
      if (metricData) {
        extractedMetrics.push(metricData);
      }
    }
  } else {
    // Auto-discovery mode: find all numeric values in the frontmatter
    const discoveredMetrics = autoDiscoverNumericMetrics(metadata, autoDiscoveryConfig);
    extractedMetrics.push(...discoveredMetrics);
  }
  
  // Sort by priority (lower numbers = higher priority)
  return extractedMetrics.sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

/**
 * Extract a specific metric from frontmatter using a config
 */
function extractMetricFromKey(metadata: ArticleMetadata, config: GenericMetricConfig): GenericMetricData | null {
  const value = getNestedProperty(metadata, config.key);
  if (value === undefined || value === null) return null;
  
  let numericValue: number | string;
  let unit: string | undefined;
  let minValue: number | undefined;
  let maxValue: number | undefined;
  const rawValue = value;
  
  // Handle PropertyWithUnits objects or YAML structured data
  if (typeof value === 'object' && value !== null && ('numeric' in value || 'text' in value || 'value' in value)) {
    const propValue = value as PropertyWithUnits | any;
    numericValue = propValue.numeric ?? propValue.text ?? propValue.value;
    unit = propValue.units ?? propValue.unit;
    minValue = propValue.range?.min ?? propValue.min;
    maxValue = propValue.range?.max ?? propValue.max;
  } 
  // Handle simple numeric values
  else if (typeof value === 'number') {
    numericValue = value;
    unit = config.defaultUnit;
  } 
  // Handle string values that might contain numbers
  else if (typeof value === 'string') {
    const parsed = parseNumericFromString(value);
    if (parsed.numeric !== undefined) {
      numericValue = parsed.numeric;
      unit = parsed.unit || config.defaultUnit;
    } else {
      return null; // Not a numeric value
    }
  } else {
    return null; // Unsupported value type
  }
  
  // Calculate trend if min/max are available
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (typeof numericValue === 'number' && minValue !== undefined && maxValue !== undefined) {
    const range = maxValue - minValue;
    const position = (numericValue - minValue) / range;
    if (position > 0.7) trend = 'up';
    else if (position < 0.3) trend = 'down';
  }
  
  return {
    key: config.key,
    title: config.title,
    value: numericValue,
    unit,
    description: config.description,
    priority: config.priority || 5,
    colorScheme: config.colorScheme || 'gray',
    customColor: config.customColor,
    trend,
    minValue,
    maxValue,
    rawValue
  };
}

/**
 * Auto-discover numeric metrics from any frontmatter object
 */
function autoDiscoverNumericMetrics(
  metadata: ArticleMetadata, 
  config?: MetricAutoDiscoveryConfig
): GenericMetricData[] {
  const metrics: GenericMetricData[] = [];
  const processedKeys = new Set<string>();
  
  // Default configuration
  const autoConfig: Required<MetricAutoDiscoveryConfig> = {
    includeKeys: [],
    excludeKeys: ['id', 'slug', 'title', 'description', 'datePublished', 'lastModified', ...config?.excludeKeys || []],
    includePatterns: [],
    excludePatterns: ['.*Min$', '.*Max$', '.*Unit$', '.*Units$', ...config?.excludePatterns || []],
    maxMetrics: config?.maxMetrics || 10,
    defaultPriority: config?.defaultPriority || 5,
    includeNested: config?.includeNested ?? true
  };
  
  // Process each property in metadata
  processObjectForMetrics(metadata, '', autoConfig, metrics, processedKeys, 0);
  
  return metrics.slice(0, autoConfig.maxMetrics);
}

/**
 * Recursively process an object to find numeric metrics
 */
function processObjectForMetrics(
  obj: any,
  prefix: string,
  config: Required<MetricAutoDiscoveryConfig>,
  metrics: GenericMetricData[],
  processedKeys: Set<string>,
  depth: number
): void {
  if (!obj || typeof obj !== 'object' || depth > 3) return;
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (processedKeys.has(fullKey)) continue;
    processedKeys.add(fullKey);
    
    // Check exclusion rules
    if (shouldExcludeKey(fullKey, config)) continue;
    
    // Check inclusion rules (if specified)
    if (config.includeKeys.length > 0 && !config.includeKeys.includes(fullKey)) continue;
    
    // Try to extract numeric value
    const metricData = extractNumericFromValue(fullKey, value, config.defaultPriority);
    if (metricData) {
      metrics.push(metricData);
    }
    
    // Recursively process nested objects if enabled
    if (config.includeNested && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      processObjectForMetrics(value, fullKey, config, metrics, processedKeys, depth + 1);
    }
  }
}

/**
 * Check if a key should be excluded based on patterns
 */
function shouldExcludeKey(key: string, config: Required<MetricAutoDiscoveryConfig>): boolean {
  // Check explicit exclude keys
  if (config.excludeKeys.includes(key)) return true;
  
  // Check exclude patterns
  for (const pattern of config.excludePatterns) {
    if (new RegExp(pattern).test(key)) return true;
  }
  
  // Check include patterns (if specified)
  if (config.includePatterns.length > 0) {
    const matchesPattern = config.includePatterns.some(pattern => new RegExp(pattern).test(key));
    if (!matchesPattern) return true;
  }
  
  return false;
}

/**
 * Extract numeric data from a value, regardless of its type
 */
function extractNumericFromValue(key: string, value: any, priority: number): GenericMetricData | null {
  let numericValue: number | string | undefined;
  let unit: string | undefined;
  let minValue: number | undefined;
  let maxValue: number | undefined;
  
  // Handle PropertyWithUnits objects or YAML structured data
  if (typeof value === 'object' && value !== null && ('numeric' in value || 'text' in value || 'value' in value)) {
    const propValue = value as PropertyWithUnits | any;
    numericValue = propValue.numeric ?? propValue.text ?? propValue.value;
    unit = propValue.units ?? propValue.unit;
    minValue = propValue.range?.min ?? propValue.min;
    maxValue = propValue.range?.max ?? propValue.max;
  }
  // Handle simple numbers
  else if (typeof value === 'number') {
    numericValue = value;
    unit = inferUnitsFromKey(key);
  }
  // Handle strings that might contain numbers
  else if (typeof value === 'string') {
    const parsed = parseNumericFromString(value);
    if (parsed.numeric !== undefined) {
      numericValue = parsed.numeric;
      unit = parsed.unit || inferUnitsFromKey(key);
    } else {
      return null;
    }
  } else {
    return null;
  }
  
  // Skip if we couldn't extract a numeric value
  if (numericValue === undefined) return null;
  
  // Calculate trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (typeof numericValue === 'number' && minValue !== undefined && maxValue !== undefined) {
    const range = maxValue - minValue;
    const position = (numericValue - minValue) / range;
    if (position > 0.7) trend = 'up';
    else if (position < 0.3) trend = 'down';
  }
  
  return {
    key,
    title: formatKeyAsTitle(key),
    value: numericValue,
    unit,
    description: generateDescription(key, unit),
    priority,
    colorScheme: inferColorScheme(key),
    trend,
    minValue,
    maxValue,
    rawValue: value
  };
}

/**
 * Get nested property from object using dot notation
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Parse numeric value and unit from a string
 */
function parseNumericFromString(text: string): { numeric?: number; unit?: string } {
  if (typeof text !== 'string') return {};
  
  // Try to match number with optional unit
  const match = text.match(/^([\d.,-]+)\s*([a-zA-Z/%°μ]+)?/);
  if (!match) return {};
  
  const numStr = match[1].replace(/,/g, ''); // Remove commas
  const numeric = parseFloat(numStr);
  const unit = match[2]?.trim();
  
  return isNaN(numeric) ? {} : { numeric, unit };
}

/**
 * Format a camelCase or snake_case key as a human-readable title
 */
export function formatKeyAsTitle(key: string): string {
  // Handle dot notation first
  const cleaned = key.split('.').pop() || key;
  
  return cleaned
    // Handle camelCase and snake_case  
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Infer color scheme based on key name
 */
function inferColorScheme(key: string): string {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('power') || lowerKey.includes('energy')) return 'red';
  if (lowerKey.includes('wavelength') || lowerKey.includes('frequency')) return 'purple';
  if (lowerKey.includes('speed') || lowerKey.includes('velocity')) return 'green';
  if (lowerKey.includes('size') || lowerKey.includes('diameter') || lowerKey.includes('width')) return 'blue';
  if (lowerKey.includes('temperature') || lowerKey.includes('thermal')) return 'yellow';
  if (lowerKey.includes('pressure') || lowerKey.includes('force')) return 'indigo';
  
  return 'gray';
}

/**
 * Infer appropriate units based on key name patterns
 */
function inferUnitsFromKey(key: string): string | undefined {
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('power')) return 'W';
  if (lowerKey.includes('wavelength')) return 'nm';
  if (lowerKey.includes('pulse') || lowerKey.includes('duration')) return 'ns';
  if (lowerKey.includes('frequency') || lowerKey.includes('rate')) return 'Hz';
  if (lowerKey.includes('speed') || lowerKey.includes('velocity')) return 'mm/s';
  if (lowerKey.includes('size') || lowerKey.includes('diameter')) return 'mm';
  if (lowerKey.includes('fluence')) return 'J/cm²';
  if (lowerKey.includes('temperature')) return '°C';
  if (lowerKey.includes('pressure')) return 'Pa';
  if (lowerKey.includes('percentage') || lowerKey.includes('percent')) return '%';
  
  return undefined;
}

/**
 * Generate a description based on the key name and unit
 */
function generateDescription(key: string, unit?: string): string {
  const title = formatKeyAsTitle(key);
  const baseDesc = `${title} measurement`;
  
  if (unit) {
    return `${baseDesc} (${unit})`;
  }
  
  return baseDesc;
}

/**
 * LEGACY FUNCTIONS - Maintained for backward compatibility
 * Extract machine settings or properties from article frontmatter and transform to PropertyWithUnits format
 */
export function extractMachineSettingsFromFrontmatter(metadata: ArticleMetadata, dataSource: 'properties' | 'machineSettings' = 'machineSettings'): Record<string, PropertyWithUnits> {
  const extractedData: Record<string, PropertyWithUnits> = {};
  
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
          extractedData[key] = {
            numeric: typeof value === 'number' ? value : parseNumericValue(value),
            text: String(value),
            units: inferUnits(key),
          };
        } else if (typeof value === 'object' && value !== null) {
          extractedData[key] = value as PropertyWithUnits;
        }
      });
    }
    
    // Transform flattened settings to PropertyWithUnits format
    Object.entries(settingsData).forEach(([key, setting]) => {
      if (setting && typeof setting === 'object') {
        extractedData[key] = setting as PropertyWithUnits;
      }
    });
  }
  
  // Extract data from the specified source (machineSettings or properties)
  const rawData = dataSource === 'properties' ? metadata.properties : metadata.machineSettings;
  if (rawData && typeof rawData === 'object') {
    
    // Check if this is new YAML format (has structured data with value/unit/min/max)
    const isNewFormat = Object.values(rawData).some(setting => 
      setting && typeof setting === 'object' && 'value' in setting
    );
    
    if (isNewFormat) {
      // New YAML format: direct structured data
      Object.entries(rawData).forEach(([key, setting]) => {
        if (setting && typeof setting === 'object') {
          const settingObj = setting as any;
          extractedData[key] = {
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
        const value = rawData[frontmatterKey];
        const unit = rawData[`${frontmatterKey}Unit`];
        const min = rawData[`${frontmatterKey}Min`];
        const max = rawData[`${frontmatterKey}Max`];
        
        if (value !== undefined) {
          // Ensure unit is a string
          const unitStr = typeof unit === 'string' ? unit : inferUnits(frontmatterKey);
          
          // Ensure min/max are numbers
          const minNum = typeof min === 'number' ? min : parseNumericValue(min);
          const maxNum = typeof max === 'number' ? max : parseNumericValue(max);
          
          extractedData[settingKey] = {
            numeric: typeof value === 'number' ? value : parseNumericValue(value),
            text: `${value}${unitStr ? ` ${unitStr}` : ''}`,
            units: unitStr,
            range: (minNum !== undefined && maxNum !== undefined) ? { min: minNum, max: maxNum } : undefined
          };
        }
      });
    }
  }
  
  return extractedData;
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
 * Parse numeric value from string or number (legacy function)
 */
function parseNumericValue(value: any): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseNumericFromString(value);
    return parsed.numeric;
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
 * Infer units based on parameter key patterns (legacy function)
 */
function inferUnits(key: string): string | undefined {
  return inferUnitsFromKey(key);
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
export function createMachineSettingsForMetricsCard(metadata: ArticleMetadata, dataSource: 'properties' | 'machineSettings' = 'machineSettings') {
  const extractedSettings = extractMachineSettingsFromFrontmatter(metadata, dataSource);
  
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