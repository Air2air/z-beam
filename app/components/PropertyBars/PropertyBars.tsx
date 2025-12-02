// Server Component - no client-side interactivity

import React from 'react';
import Link from 'next/link';
import { capitalizeWords } from '@/app/utils/formatting';

// Helper function to format display values with smart precision
function formatDisplayValue(value: number): string {
  // Handle zero
  if (value === 0) {
    return '0';
  }
  
  const absValue = Math.abs(value);
  
  // For very small numbers (scientific notation)
  if (absValue < 0.0001) {
    // Format in scientific notation, removing trailing zeros and unnecessary decimals
    const formatted = value.toExponential(1);
    // Remove .0 from mantissa (e.g., "1.0e-8" -> "1e-8")
    return formatted.replace(/\.0e/, 'e').replace('e+', 'e').replace('e-0', 'e-');
  }
  
  // For very large numbers >= 10,000 (use compact scientific notation)
  if (absValue >= 10000) {
    // Format with minimal precision, remove trailing zeros
    const formatted = value.toExponential(1);
    // Clean up: "1.0e+10" -> "1e10", but keep "1.2e+10" -> "1.2e10"
    return formatted
      .replace(/\.0e/, 'e')  // Remove .0
      .replace('e+', 'e')     // Remove + sign
      .replace(/e0+/, 'e');   // Simplify e01 to e1
  }
  
  // For numbers between 1000 and 10K, use locale formatting with commas (no decimals)
  if (absValue >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  // For integers or numbers very close to integers
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 0.001) {
    return Math.round(value).toString();
  }
  
  // For decimal numbers, use appropriate precision and remove trailing zeros
  let formatted: string;
  if (absValue >= 100) {
    formatted = value.toFixed(0);
  } else if (absValue >= 10) {
    formatted = value.toFixed(1);
  } else if (absValue >= 1) {
    formatted = value.toFixed(2);
  } else if (absValue >= 0.01) {
    // For small decimals (0.01 to 1), show 2-3 decimal places
    formatted = value.toFixed(3);
  } else {
    // For very small decimals (0.0001 to 0.01), show 4 decimal places
    formatted = value.toFixed(4);
  }
  
  // Remove trailing zeros after decimal point
  return formatted.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

interface PropertyData {
  name: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  color?: string;
}

interface PropertyBarsProps {
  // Direct properties array
  properties?: PropertyData[];
  
  // OR use metadata with dataSource (MetricsGrid-compatible API)
  metadata?: any;
  dataSource?: 'materialProperties' | 'machineSettings';
  
  // Display options
  columns?: {
    xs?: number;     // Extra small (mobile)
    sm?: number;     // Small (phablet)
    md?: number;     // Medium (tablet)
    lg?: number;     // Large (desktop)
  };
  height?: number;
  className?: string;
}

/**
 * PropertyBars - Compact three-bar visualization for properties
 * 
 * Pure reusable chart component that renders a grid of property bars.
 * Used by MachineSettings, LaserMaterialInteraction, and MaterialCharacteristics
 * components which handle sectioning and organization.
 * 
 * Can be used with direct properties array:
 *   <PropertyBars properties={extractPropertiesFromMetadata(metadata)} />
 * 
 * Or with metadata extraction:
 *   <PropertyBars metadata={metadata} dataSource="materialProperties" />
 *   <PropertyBars metadata={metadata} dataSource="machineSettings" />
 * 
 * @param properties - Array of properties with value, min, max, optional unit
 * @param metadata - Material/machine metadata (alternative to properties)
 * @param dataSource - Which properties to extract from metadata
 * @param columns - Responsive column counts (default: xs:3, sm:4, md:5, lg:6)
 * @param height - Bar height in pixels (default: 70px)
 * @param className - Additional CSS classes
 */
export function PropertyBars({ 
  properties: propsProperties,
  metadata,
  dataSource = 'materialProperties',
  columns = { xs: 3, sm: 4, md: 5, lg: 6 },
  height = 70,
  className = ''
}: PropertyBarsProps) {
  
  // Extract properties from metadata if not provided directly
  const properties = propsProperties || 
    (metadata ? extractPropertiesFromMetadata(metadata, dataSource) : []);
  
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>No properties available</p>
      </div>
    );
  }
  
  return (
    <PropertyBarsGrid 
      properties={properties}
      columns={columns}
      height={height}
      className={className}
      metadata={metadata}
      dataSource={dataSource}
    />
  );
}

/**
 * PropertyBarsGrid - Internal component that renders the grid of property bars
 */
function PropertyBarsGrid({ 
  properties,
  columns = { xs: 3, sm: 4, md: 5, lg: 6 },
  height = 70,
  className = '',
  metadata,
  dataSource = 'materialProperties'
}: {
  properties: PropertyData[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
  height?: number;
  className?: string;
  metadata?: any;
  dataSource?: 'materialProperties' | 'machineSettings';
}) {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>No properties available</p>
      </div>
    );
  }
  
  // Map column numbers to explicit Tailwind classes (required for purge/JIT)
  const xsColsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };
  
  const smColsMap: Record<number, string> = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  };
  
  const mdColsMap: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  };
  
  const lgColsMap: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };
  
  const xsClass = xsColsMap[columns.xs || 3] || 'grid-cols-3';
  const smClass = smColsMap[columns.sm || 4] || 'sm:grid-cols-4';
  const mdClass = mdColsMap[columns.md || 5] || 'md:grid-cols-5';
  const lgClass = lgColsMap[columns.lg || 6] || 'lg:grid-cols-6';
  
  const gridClasses = `${xsClass} ${smClass} ${mdClass} ${lgClass}`;
  
  return (
    <div className={`grid gap-4 ${gridClasses} ${className}`}>
      {properties.map((prop, index) => {
        // Values are pre-normalized at load time via normalizeNumericValues()
        const { value, min, max } = prop;
        
        // Calculate range
        const range = max - min;
        
        // Skip if invalid range (shouldn't happen with proper normalization)
        if (range <= 0 || !isFinite(range)) {
          return null;
        }
        
        // Calculate percentages for each bar relative to the full range
        // Min bar shows at the min value position (always 0% of range)
        const minPercentage = 5; // Minimum visible height for min indicator
        
        // Value position within the range - clamp between min and 100%
        const rawPercentage = ((value - min) / range) * 100;
        const valuePercentage = Math.max(
          Math.min(rawPercentage, 100),
          minPercentage
        );
        
        // Max is always at 100%
        const maxPercentage = 100;
        
        // Default color if not provided
        const colorClass = prop.color || 'from-blue-500 to-cyan-500';
        
        // Extract the darkest color (the "to" color) from the gradient for the badge
        // Match patterns like "to-cyan-500" or "to-blue-600"
        const badgeColorMatch = colorClass.match(/to-([\w-]+)/);
        const badgeColor = badgeColorMatch ? `bg-${badgeColorMatch[1]}` : 'bg-blue-500';
        
        // Get background color for the value label based on the gradient
        const bgColorClass = getBackgroundColorFromGradient(colorClass);
        
        // Generate settings URL for this property if we're showing material properties
        const settingsUrl = (dataSource === 'materialProperties' && metadata?.category && metadata?.subcategory && metadata?.slug)
          ? `/settings/${metadata.category}/${metadata.subcategory}/${metadata.slug.replace('-laser-cleaning', '-settings')}`
          : undefined;
        
        const CardContent = (
          <>
            {/* Property name at top */}
            <h4 className="text-xs text-secondary font-semibold text-center mb-1.5 text-primary">
              {prop.name}
            </h4>
            
            {/* Three-bar visualization with unit badge and labels */}
            <div className="relative flex items-end justify-between px-4" style={{ height: `${height + 20}px` }}>
              {/* Value badge overlay - uses secondary background with min-width */}
              <div className="absolute top-1 left-1 bg-secondary px-1 py-0.5 rounded font-medium shadow-sm z-10 flex flex-col items-center leading-tight min-w-[2.5rem]">
                <div className="text-sm font-semibold text-primary">{formatDisplayValue(value)}</div>
                {prop.unit && <div className="text-[9px] opacity-80 text-secondary">{prop.unit}</div>}
              </div>
              
              {/* Min bar with label */}
              <div className="flex flex-col items-center gap-1 flex-1" style={{ height: '100%' }}>
                <div className="flex items-end justify-center w-full" style={{ height: `${height}px` }}>
                  <div 
                    className="w-3 bg-secondary rounded-md transition-all duration-700"
                    style={{ height: `${minPercentage}%` }}
                  />
                </div>
                <div className="text-xs font-normal whitespace-nowrap text-secondary">
                  {formatDisplayValue(min)}
                </div>
              </div>
              
              {/* Value bar (current) with label */}
              <div className="flex flex-col items-center gap-1 flex-1" style={{ height: '100%' }}>
                <div className="flex items-end justify-center w-full" style={{ height: `${height}px` }}>
                  <div 
                    className={`w-3 bg-gradient-to-t ${colorClass} rounded-md transition-all duration-700`}
                    style={{ height: `${valuePercentage}%` }}
                  />
                </div>
                <div className="text-xs font-normal whitespace-nowrap text-primary">
                  {formatDisplayValue(value)}
                </div>
              </div>
              
              {/* Max bar with label */}
              <div className="flex flex-col items-center gap-1 flex-1" style={{ height: '100%' }}>
                <div className="flex items-end justify-center w-full" style={{ height: `${height}px` }}>
                  <div 
                    className="w-3 bg-secondary rounded-md transition-all duration-700"
                    style={{ height: `${maxPercentage}%` }}
                  />
                </div>
                <div className="text-xs font-normal whitespace-nowrap text-secondary">
                  {formatDisplayValue(max)}
                </div>
              </div>
            </div>
          </>
        );
        
        return settingsUrl ? (
          <Link
            key={index}
            href={settingsUrl}
            className="relative bg-primary p-2 rounded block cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={`View ${prop.name} settings`}
          >
            {CardContent}
          </Link>
        ) : (
          <div 
            key={index}
            className="relative bg-primary p-2 rounded"
          >
            {CardContent}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Helper type for grouped properties
 */
/**
 * Extract a single property - values are pre-normalized at load time
 */
function extractSingleProperty(
  key: string,
  prop: any,
  dataSource: 'materialProperties' | 'machineSettings' = 'materialProperties'
): PropertyData | null {
  // Values should be pre-normalized via normalizeNumericValues() at load time
  const value = typeof prop.value === 'number' ? prop.value : Number(prop.value);
  const min = typeof prop.min === 'number' ? prop.min : Number(prop.min) || 0;
  const max = typeof prop.max === 'number' ? prop.max : Number(prop.max) || value * 2;
  
  // Skip invalid entries (missing required value)
  if (!isFinite(value)) {
    return null;
  }

  return {
    name: formatPropertyName(key),
    value: value,
    min: min,
    max: max,
    unit: prop.unit === 'dimensionless' ? undefined : prop.unit,
    color: getColorForProperty(key, dataSource)
  } as PropertyData;
}

/**
 * Helper function to extract properties from metadata
 * Supports both materialProperties and machineSettings data sources
 */
export function extractPropertiesFromMetadata(
  metadata: any,
  dataSource: 'materialProperties' | 'machineSettings' = 'materialProperties',
  selectedProperties?: string[]
): PropertyData[] {
  let sourceData: Record<string, any> = {};
  
  // Extract based on data source
  if (dataSource === 'machineSettings') {
    sourceData = metadata.machineSettings || metadata.settings || {};
  } else {
    // materialProperties - support both flat and categorized structures
    sourceData = metadata.properties || metadata.materialProperties || {};
  }
  
  // If the top-level sourceData does not contain direct property entries
  // (i.e., entries with a numeric `value`), it's common for `materialProperties`
  // to be organized into categories (e.g. material_characteristics, thermal_data).
  // In that case, flatten the nested groups into a single map of properties.
  const hasDirectValues = Object.keys(sourceData).some((k) => {
    const v = sourceData[k];
    return v && (typeof v.value === 'number' || !isNaN(Number(v?.value)));
  });

  if (!hasDirectValues) {
    const flattened: Record<string, any> = {};
    Object.keys(sourceData).forEach((groupKey) => {
      const group = sourceData[groupKey];
      if (group && typeof group === 'object') {
        Object.keys(group).forEach((propKey) => {
          // Skip metadata fields like 'label' and 'percentage'
          if (propKey === 'label' || propKey === 'percentage') return;
          // Avoid overwriting if duplicate keys exist across groups - later groups win
          flattened[propKey] = group[propKey];
        });
      }
    });
    sourceData = flattened;
  }

  const propertyKeys = selectedProperties || Object.keys(sourceData);

  return propertyKeys
    .map((key) => {
      const prop = sourceData[key];
      if (!prop || !(typeof prop.value === 'number' || !isNaN(Number(prop.value)))) {
        return null;
      }
      return extractSingleProperty(key, prop, dataSource);
    })
    .filter((prop): prop is PropertyData => prop !== null);
}

// Format property names for display
function formatPropertyName(key: string): string {
  // Convert camelCase to space separated, then handle underscores
  const splitCamel = key.replace(/([a-z])([A-Z])/g, '$1 $2');
  return capitalizeWords(splitCamel.replace(/[_\s]+/g, ' '));
}

// Get lighter background color variant from gradient color
function getBackgroundColorFromGradient(gradientClass: string): string {
  // Extract the primary color from the gradient (e.g., 'from-purple-500 to-pink-500' -> 'purple')
  const match = gradientClass.match(/from-(\w+)-/);
  if (!match) return 'bg-blue-900/30';
  
  const color = match[1];
  
  // Map gradient colors to their light background variants
  const bgColorMap: Record<string, string> = {
    purple: 'bg-purple-900/30',
    blue: 'bg-blue-900/30',
    orange: 'bg-orange-50',
    green: 'bg-green-900/30',
    indigo: 'bg-indigo-900/30',
    yellow: 'bg-yellow-900/30',
    pink: 'bg-pink-900/30',
    cyan: 'bg-cyan-900/30',
    red: 'bg-red-900/30',
    amber: 'bg-amber-50',
    emerald: 'bg-emerald-900/30',
    teal: 'bg-teal-900/30',
    rose: 'bg-rose-900/30',
    violet: 'bg-violet-900/30',
    lime: 'bg-lime-50',
    sky: 'bg-sky-900/30',
    gray: 'bg-gray-50',
  };
  
  return bgColorMap[color] || 'bg-blue-900/30';
}

// Assign colors based on property type and data source
function getColorForProperty(key: string, dataSource: 'materialProperties' | 'machineSettings' = 'materialProperties'): string {
  // Machine settings get gold/amber colors
  if (dataSource === 'machineSettings') {
    const machineColorMap: Record<string, string> = {
      powerRange: 'from-amber-500 to-yellow-500',
      wavelength: 'from-yellow-500 to-orange-500',
      spotSize: 'from-orange-500 to-amber-500',
      repetitionRate: 'from-amber-600 to-yellow-600',
      pulseWidth: 'from-yellow-600 to-amber-600',
      scanSpeed: 'from-orange-600 to-yellow-600',
      fluence: 'from-amber-500 to-orange-500',
      overlapRatio: 'from-yellow-500 to-amber-500',
      passCount: 'from-orange-500 to-yellow-500',
    };
    return machineColorMap[key] || 'from-amber-500 to-yellow-500';
  }
  
  // Material properties get varied colors
  const colorMap: Record<string, string> = {
    // Structural/Mechanical Properties
    density: 'from-purple-500 to-pink-500',
    hardness: 'from-blue-500 to-cyan-500',
    youngsModulus: 'from-indigo-500 to-blue-500',
    compressiveStrength: 'from-blue-600 to-indigo-600',
    tensileStrength: 'from-cyan-500 to-blue-500',
    flexuralStrength: 'from-blue-500 to-purple-500',
    fractureToughness: 'from-purple-600 to-indigo-600',
    porosity: 'from-pink-500 to-rose-500',
    
    // Thermal Properties
    thermal_conductivity: 'from-orange-500 to-red-500',
    thermalConductivity: 'from-orange-500 to-red-500',
    specific_heat: 'from-indigo-500 to-purple-500',
    specificHeat: 'from-indigo-500 to-purple-500',
    thermal_expansion: 'from-red-500 to-orange-500',
    thermalExpansion: 'from-red-500 to-orange-500',
    thermalDiffusivity: 'from-orange-600 to-red-600',
    thermalDestruction: 'from-red-600 to-orange-600',
    thermalShockResistance: 'from-orange-500 to-amber-500',
    thermalDestructionPoint: 'from-red-500 to-rose-500',
    
    // Optical/Laser Properties
    laser_absorption: 'from-green-500 to-emerald-500',
    laserAbsorption: 'from-green-500 to-emerald-500',
    absorptionCoefficient: 'from-emerald-500 to-green-500',
    absorptivity: 'from-green-600 to-teal-600',
    laser_damage_threshold: 'from-yellow-500 to-orange-500',
    laserDamageThreshold: 'from-yellow-500 to-orange-500',
    ablationThreshold: 'from-amber-500 to-yellow-500',
    reflectivity: 'from-cyan-500 to-blue-500',
    laserReflectivity: 'from-cyan-600 to-blue-600',
    
    // Electrical Properties
    electricalResistivity: 'from-violet-500 to-purple-500',
    
    // Chemical/Environmental Properties
    corrosionResistance: 'from-teal-500 to-cyan-500',
    oxidationResistance: 'from-lime-500 to-green-500',
    vaporPressure: 'from-sky-500 to-cyan-500',
  };
  
  return colorMap[key] || 'from-gray-500 to-gray-600';
}
