// app/utils/statCardHelpers.ts
// Utilities for converting frontmatter data to StatCard format

import { StatData } from '../components/DataMetrics/DataMetrics';
import { ArticleMetadata } from '@/types';

// Extract property statistics from frontmatter
export interface PropertyStatConfig {
  propertyKey: string;
  label?: string;
  title?: string; // Display title (overrides label)
  description?: string; // Additional context
  format?: StatData['format'];
  precision?: number;
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showComparison?: boolean;
}

// Extract a single property stat from frontmatter
export function extractPropertyStat(
  metadata: ArticleMetadata,
  config: PropertyStatConfig
): StatData | null {
  const { 
    propertyKey, 
    label, 
    title,
    description,
    format = 'decimal', 
    precision = 1, 
    showComparison = true 
  } = config;
  
  // Check if the property exists in frontmatter.properties
  const properties = metadata?.properties as any;
  if (!properties) return null;
  
  const value = properties[propertyKey];
  const unit = properties[`${propertyKey}Unit`];
  const min = properties[`${propertyKey}Min`];
  const max = properties[`${propertyKey}Max`];
  
  if (value === undefined) return null;
  
  // Calculate comparison if min/max are available
  let comparison: StatData['comparison'] | undefined;
  if (showComparison && min !== undefined && max !== undefined) {
    const range = max - min;
    const average = (min + max) / 2;
    comparison = {
      label: 'Range Average',
      value: average,
      unit
    };
  }
  
  // Calculate trend based on position in range
  let trend: StatData['trend'] | undefined;
  if (min !== undefined && max !== undefined) {
    const normalizedPosition = (value - min) / (max - min);
    if (normalizedPosition > 0.7) trend = 'up';
    else if (normalizedPosition < 0.3) trend = 'down';
    else trend = 'stable';
  }
  
  return {
    value,
    label: label || formatPropertyLabel(propertyKey),
    title,
    description,
    unit,
    format,
    precision,
    comparison,
    trend
  };
}

// Extract machine setting statistics from frontmatter
export function extractMachineSettingStat(
  metadata: ArticleMetadata,
  config: PropertyStatConfig
): StatData | null {
  const { 
    propertyKey, 
    label, 
    title,
    description,
    format = 'decimal', 
    precision = 1, 
    showComparison = true 
  } = config;
  
  // Check if the property exists in frontmatter.machineSettings
  const settings = metadata?.machineSettings as any;
  if (!settings) return null;
  
  const value = settings[propertyKey];
  const unit = settings[`${propertyKey}Unit`];
  const min = settings[`${propertyKey}Min`];
  const max = settings[`${propertyKey}Max`];
  
  if (value === undefined) return null;
  
  // Calculate comparison if min/max are available
  let comparison: StatData['comparison'] | undefined;
  if (showComparison && min !== undefined && max !== undefined) {
    const range = max - min;
    const average = (min + max) / 2;
    comparison = {
      label: 'Range Average',
      value: average,
      unit
    };
  }
  
  // Calculate trend based on position in range
  let trend: StatData['trend'] | undefined;
  if (min !== undefined && max !== undefined) {
    const normalizedPosition = (value - min) / (max - min);
    if (normalizedPosition > 0.7) trend = 'up';
    else if (normalizedPosition < 0.3) trend = 'down';
    else trend = 'stable';
  }
  
  return {
    value,
    label: label || formatPropertyLabel(propertyKey),
    title,
    description,
    unit,
    format,
    precision,
    comparison,
    trend
  };
}

// Convert property key to human-readable label
function formatPropertyLabel(key: string): string {
  const labelMap: Record<string, string> = {
    // Properties
    'density': 'Density',
    'densityMin': 'Min Density',
    'densityMax': 'Max Density',
    'thermalConductivity': 'Thermal Conductivity',
    'thermalConductivityMin': 'Min Thermal Conductivity',
    'thermalConductivityMax': 'Max Thermal Conductivity',
    'hardness': 'Hardness',
    'hardnessMin': 'Min Hardness',
    'hardnessMax': 'Max Hardness',
    'meltingPoint': 'Melting Point',
    'boilingPoint': 'Boiling Point',
    'specificHeat': 'Specific Heat',
    'tensileStrength': 'Tensile Strength',
    'youngsModulus': 'Young\'s Modulus',
    
    // Machine Settings
    'powerRange': 'Power',
    'powerRangeMin': 'Min Power',
    'powerRangeMax': 'Max Power',
    'wavelength': 'Wavelength',
    'wavelengthMin': 'Min Wavelength',
    'wavelengthMax': 'Max Wavelength',
    'pulseDuration': 'Pulse Duration',
    'pulseDurationMin': 'Min Pulse Duration',
    'pulseDurationMax': 'Max Pulse Duration',
    'spotSize': 'Spot Size',
    'spotSizeMin': 'Min Spot Size',
    'spotSizeMax': 'Max Spot Size',
    'repetitionRate': 'Repetition Rate',
    'repetitionRateMin': 'Min Repetition Rate',
    'repetitionRateMax': 'Max Repetition Rate',
    'fluenceRange': 'Fluence',
    'fluenceRangeMin': 'Min Fluence',
    'fluenceRangeMax': 'Max Fluence'
  };
  
  return labelMap[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Create multiple stats from frontmatter properties
export function createPropertyStats(
  metadata: ArticleMetadata,
  configs: PropertyStatConfig[]
): StatData[] {
  return configs
    .map(config => extractPropertyStat(metadata, config))
    .filter((stat): stat is StatData => stat !== null);
}

// Create multiple stats from frontmatter machine settings
export function createMachineSettingStats(
  metadata: ArticleMetadata,
  configs: PropertyStatConfig[]
): StatData[] {
  return configs
    .map(config => extractMachineSettingStat(metadata, config))
    .filter((stat): stat is StatData => stat !== null);
}

// Convenience function to create common property stat configs
export const commonPropertyStats = {
  density: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'density',
    label: label || 'Density',
    title,
    description: description || 'Material density measurement',
    format: 'decimal',
    precision: 1
  }),
  
  thermalConductivity: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'thermalConductivity',
    label: label || 'Thermal Conductivity',
    title,
    description: description || 'Heat transfer efficiency through material',
    format: 'decimal',
    precision: 1
  }),
  
  hardness: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'hardness',
    label: label || 'Hardness',
    title,
    description: description || 'Material resistance to surface indentation',
    format: 'number',
    precision: 0
  }),
  
  tensileStrength: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'tensileStrength',
    label: label || 'Tensile Strength',
    title,
    description: description || 'Maximum stress material can withstand under tension',
    format: 'number',
    precision: 0
  })
};

// Convenience function to create common machine setting stat configs
export const commonMachineSettingStats = {
  power: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'powerRange',
    label: label || 'Laser Power',
    title,
    description: description || 'Optimal laser power setting for this material',
    format: 'decimal',
    precision: 1
  }),
  
  wavelength: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'wavelength',
    label: label || 'Wavelength',
    title,
    description: description || 'Laser wavelength for optimal absorption',
    format: 'decimal',
    precision: 1
  }),
  
  pulseDuration: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'pulseDuration',
    label: label || 'Pulse Duration',
    title,
    description: description || 'Laser pulse duration for controlled material removal',
    format: 'decimal',
    precision: 1
  }),
  
  spotSize: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'spotSize',
    label: label || 'Spot Size',
    title,
    description: description || 'Laser beam spot size for precision cleaning',
    format: 'decimal',
    precision: 2
  }),
  
  repetitionRate: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'repetitionRate',
    label: label || 'Rep Rate',
    title,
    description: description || 'Laser pulse repetition frequency',
    format: 'decimal',
    precision: 1
  }),
  
  fluence: (label?: string, title?: string, description?: string): PropertyStatConfig => ({
    propertyKey: 'fluenceRange',
    label: label || 'Fluence',
    title,
    description: description || 'Energy density per pulse for effective cleaning',
    format: 'decimal',
    precision: 2
  })
};

// Get color scheme based on property type
export function getPropertyColorScheme(propertyKey: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const colorMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    // Physical properties - info
    'density': 'info',
    'hardness': 'info',
    'meltingPoint': 'info',
    'boilingPoint': 'info',
    
    // Thermal properties - warning (heat related)
    'thermalConductivity': 'warning',
    'specificHeat': 'warning',
    
    // Mechanical properties - success (performance)
    'tensileStrength': 'success',
    'youngsModulus': 'success',
    
    // Laser settings - default
    'powerRange': 'default',
    'wavelength': 'default',
    'pulseDuration': 'default',
    'spotSize': 'default',
    'repetitionRate': 'default',
    'fluenceRange': 'default'
  };
  
  return colorMap[propertyKey] || 'default';
}