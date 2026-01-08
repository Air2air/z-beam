/**
 * Variable Measured Builder - Shared utility for constructing PropertyValue arrays
 * 
 * Purpose: Eliminate 5+ duplicate implementations of variableMeasured construction
 * Used by: SchemaFactory, dataset generators, API routes
 */

/**
 * Schema.org PropertyValue interface for variableMeasured
 * Different from frontmatter PropertyValue - this is for JSON-LD structured data
 */
export interface SchemaPropertyValue {
  '@type': 'PropertyValue';
  propertyID?: string;
  name: string;
  value?: string | number; // Optional initially, required before serialization
  unitText?: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  dateModified?: string;
  citation?: {
    '@type': 'CreativeWork';
    name: string;
  };
}

/**
 * Build Schema.org PropertyValue objects from material properties
 * 
 * @param materialProperties - Material properties from frontmatter
 * @param machineSettings - Optional machine settings from frontmatter
 * @returns Array of PropertyValue objects for variableMeasured
 */
export function buildVariableMeasured(
  materialProperties?: Record<string, any>,
  machineSettings?: Record<string, any>
): SchemaPropertyValue[] {
  const measurements: SchemaPropertyValue[] = [];
  
  // Add machine settings first (operator convenience)
  if (machineSettings) {
    const settingsMap: Record<string, { label: string; description: string }> = {
      powerRange: { label: 'Power Range', description: 'Laser power output' },
      pulseWidth: { label: 'Pulse Width', description: 'Pulse duration' },
      frequency: { label: 'Frequency', description: 'Pulse repetition rate' },
      wavelength: { label: 'Wavelength', description: 'Laser wavelength' },
      spotSize: { label: 'Spot Size', description: 'Laser beam diameter' },
      scanSpeed: { label: 'Scan Speed', description: 'Beam movement speed' },
      fluence: { label: 'Fluence', description: 'Energy per unit area' },
      scanPattern: { label: 'Scan Pattern', description: 'Beam path pattern' }
    };
    
    Object.entries(machineSettings).forEach(([key, data]: [string, any]) => {
      const setting = settingsMap[key];
      if (setting && data?.value !== undefined && data?.unit) {
        measurements.push({
          '@type': 'PropertyValue',
          propertyID: key,
          name: setting.label,
          value: data.value,
          unitText: data.unit,
          description: setting.description
        });
      }
    });
  }
  
  // Add material properties
  if (materialProperties) {
    Object.entries(materialProperties).forEach(([_categoryKey, categoryData]: [string, any]) => {
      // Handle both structures: with .properties and without
      const propsToProcess = categoryData?.properties || categoryData;
      
      // Skip if categoryData is just metadata
      if (typeof propsToProcess === 'object' && !Array.isArray(propsToProcess)) {
        Object.entries(propsToProcess).forEach(([propKey, propData]: [string, any]) => {
          // Skip metadata fields
          if (isMetadataField(propKey)) return;
          
          // Skip if no value
          if (!hasMeaningfulValue(propData)) return;
          
          // Create PropertyValue object
          const propertyValue = buildPropertyValue(propKey, propData);
          if (propertyValue) {
            measurements.push(propertyValue);
          }
        });
      }
    });
  }
  
  return measurements;
}

/**
 * Check if field is metadata (not a property)
 */
function isMetadataField(key: string): boolean {
  const metadataFields = ['label', 'description', 'percentage', 'unit', 'source'];
  return metadataFields.includes(key);
}

/**
 * Check if property data has a meaningful value
 */
function hasMeaningfulValue(propData: any): boolean {
  if (!propData) return false;
  if (typeof propData !== 'object') return false;
  
  const value = propData.value ?? propData.min ?? propData.max;
  return value !== undefined && value !== null && value !== '';
}

/**
 * Build a single PropertyValue object from property data
 */
function buildPropertyValue(propKey: string, propData: any): SchemaPropertyValue | null {
  if (!propData) return null;
  
  const propertyValue: SchemaPropertyValue = {
    '@type': 'PropertyValue',
    propertyID: propKey,
    name: formatPropertyName(propKey, propData)
  };
  
  // Value (required)
  if (propData.value !== undefined) {
    propertyValue.value = propData.value;
  } else if (propData.min !== undefined || propData.max !== undefined) {
    // Use min or max if value not available
    propertyValue.value = propData.min ?? propData.max;
  } else {
    return null; // No value available
  }
  
  // Unit
  if (propData.unit) {
    propertyValue.unitText = propData.unit;
  }
  
  // Min/Max values
  if (propData.min !== undefined) {
    propertyValue.minValue = propData.min;
  }
  if (propData.max !== undefined) {
    propertyValue.maxValue = propData.max;
  }
  
  // Description
  if (propData.description) {
    propertyValue.description = propData.description;
  }
  
  // CRITICAL: Never add citation field to PropertyValue
  // Citations belong at Dataset level, not property level
  // This prevents "TypeError: e.map is not a function" errors
  
  return propertyValue;
}

/**
 * Format property name for display
 */
function formatPropertyName(key: string, data: any): string {
  // Use label if available
  if (data.label) return data.label;
  
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Build variableMeasured for contaminant data
 * 
 * @param composition - Chemical composition data
 * @param safetyData - Safety information
 * @param laserProps - Laser interaction properties
 */
export function buildContaminantVariableMeasured(
  composition?: any,
  safetyData?: any,
  laserProps?: any
): SchemaPropertyValue[] {
  const measurements: SchemaPropertyValue[] = [];
  
  // Add composition data
  if (composition) {
    Object.entries(composition).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        measurements.push({
          '@type': 'PropertyValue',
          propertyID: `composition_${key}`,
          name: formatPropertyName(key, {}),
          value: value,
          description: 'Chemical composition property'
        });
      }
    });
  }
  
  // Add safety data
  if (safetyData) {
    Object.entries(safetyData).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        measurements.push({
          '@type': 'PropertyValue',
          propertyID: `safety_${key}`,
          name: formatPropertyName(key, {}),
          value: value,
          description: 'Safety data property'
        });
      }
    });
  }
  
  // Add laser properties
  if (laserProps) {
    Object.entries(laserProps).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        measurements.push({
          '@type': 'PropertyValue',
          propertyID: key,
          name: formatPropertyName(key, {}),
          value: value,
          description: 'Laser property for contamination removal'
        });
      }
    });
  }
  
  return measurements;
}

/**
 * Filter and deduplicate measurements
 * 
 * Removes duplicates based on propertyID, keeps first occurrence
 */
export function deduplicateMeasurements(measurements: SchemaPropertyValue[]): SchemaPropertyValue[] {
  const seen = new Set<string>();
  return measurements.filter(m => {
    const id = m.propertyID || m.name;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * Validate PropertyValue structure
 * 
 * Ensures no string citations and required fields present
 */
export function validatePropertyValue(prop: SchemaPropertyValue): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (prop['@type'] !== 'PropertyValue') {
    errors.push('Missing or invalid @type');
  }
  
  if (!prop.name) {
    errors.push('Missing required field: name');
  }
  
  if (prop.value === undefined) {
    errors.push('Missing required field: value');
  }
  
  // CRITICAL: Check for string citation (common error)
  if ('citation' in prop) {
    if (typeof (prop as any).citation === 'string') {
      errors.push('Citation must not be string - remove from PropertyValue');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate array of PropertyValue objects
 */
export function validateVariableMeasured(measurements: SchemaPropertyValue[]): { 
  isValid: boolean; 
  errors: Array<{ index: number; errors: string[] }> 
} {
  const errors: Array<{ index: number; errors: string[] }> = [];
  
  measurements.forEach((measurement, index) => {
    const validation = validatePropertyValue(measurement);
    if (!validation.isValid) {
      errors.push({
        index,
        errors: validation.errors
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
