'use client';

import React from 'react';

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
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  height?: number;
  className?: string;
  showTitle?: boolean; // For compatibility, not used
  searchable?: boolean; // For compatibility, not used
}

/**
 * PropertyBars - Compact three-bar visualization for properties
 * 
 * Can be used as a drop-in replacement for MetricsGrid with same API:
 *   <PropertyBars metadata={metadata} dataSource="materialProperties" />
 *   <PropertyBars metadata={metadata} dataSource="machineSettings" />
 * 
 * Or with direct properties array:
 *   <PropertyBars properties={extractPropertiesFromMetadata(metadata)} />
 * 
 * @param properties - Array of properties with value, min, max, optional unit
 * @param metadata - Material/machine metadata (alternative to properties)
 * @param dataSource - Which properties to extract from metadata
 * @param columns - Responsive column counts (default: 3/4/6)
 * @param height - Bar height in pixels (default: 70px)
 * @param className - Additional CSS classes
 */
export function PropertyBars({ 
  properties: propsProperties,
  metadata,
  dataSource = 'materialProperties',
  columns = { mobile: 3, tablet: 4, desktop: 6 },
  height = 70,
  className = ''
}: PropertyBarsProps) {
  
  // Extract properties from metadata if not provided directly
  const properties = propsProperties || 
    (metadata ? extractPropertiesFromMetadata(metadata, dataSource) : []);
  
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No properties available</p>
      </div>
    );
  }
  
  const gridClasses = `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;
  
  return (
    <div className={`grid gap-4 ${gridClasses} ${className}`}>
      {properties.map((prop, index) => {
        // Calculate percentage within range for the value bar
        const percentage = ((prop.value - prop.min) / (prop.max - prop.min)) * 100;
        
        // Default color if not provided
        const colorClass = prop.color || 'from-blue-500 to-cyan-500';
        
        return (
          <div 
            key={index}
            className="relative bg-white dark:bg-gray-800 p-2"
          >
            {/* Property name at top */}
            <h4 className="text-xs font-semibold text-center text-gray-900 dark:text-gray-100 mb-1.5">
              {prop.name}
            </h4>
            
            {/* Three-bar visualization with unit badge */}
            <div className="relative flex items-end justify-center gap-3 mb-1" style={{ height: `${height}px` }}>
              {/* Unit badge overlay */}
              {prop.unit && (
                <div className="absolute top-1 left-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] px-1.5 py-0.5 rounded font-medium">
                  {prop.unit}
                </div>
              )}
              
              {/* Min bar */}
              <div className="flex items-end h-full">
                <div 
                  className="w-6 bg-gray-400 dark:bg-gray-500 rounded transition-all duration-700"
                  style={{ height: '40%' }}
                />
              </div>
              
              {/* Value bar (current) */}
              <div className="flex items-end h-full">
                <div 
                  className={`w-6 bg-gradient-to-t ${colorClass} rounded transition-all duration-700`}
                  style={{ height: `${Math.max(percentage, 5)}%` }}
                />
              </div>
              
              {/* Max bar */}
              <div className="flex items-end h-full">
                <div 
                  className="w-6 bg-gray-400 dark:bg-gray-500 rounded transition-all duration-700"
                  style={{ height: '100%' }}
                />
              </div>
            </div>
            
            {/* Labels below bars */}
            <div className="flex items-start justify-center gap-3">
              <div className="w-6 text-center">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {prop.min}
                </div>
              </div>
              <div className="w-6 text-center">
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {prop.value}
                </div>
              </div>
              <div className="w-6 text-center">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {prop.max}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
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
  
  const propertyKeys = selectedProperties || Object.keys(sourceData);
  
  return propertyKeys
    .filter((key) => {
      const prop = sourceData[key];
      return prop && typeof prop.value === 'number';
    })
    .map((key) => {
      const prop = sourceData[key];
      
      return {
        name: formatPropertyName(key),
        value: prop.value,
        min: prop.min || 0,
        max: prop.max || prop.value * 2,
        unit: prop.unit === 'dimensionless' ? undefined : prop.unit,
        color: getColorForProperty(key, dataSource)
      } as PropertyData;
    });
}

// Format property names for display
function formatPropertyName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
    density: 'from-purple-500 to-pink-500',
    hardness: 'from-blue-500 to-cyan-500',
    thermal_conductivity: 'from-orange-500 to-red-500',
    thermalConductivity: 'from-orange-500 to-red-500',
    laser_absorption: 'from-green-500 to-emerald-500',
    laserAbsorption: 'from-green-500 to-emerald-500',
    specific_heat: 'from-indigo-500 to-purple-500',
    specificHeat: 'from-indigo-500 to-purple-500',
    laser_damage_threshold: 'from-yellow-500 to-orange-500',
    laserDamageThreshold: 'from-yellow-500 to-orange-500',
    porosity: 'from-pink-500 to-rose-500',
    reflectivity: 'from-cyan-500 to-blue-500',
    thermal_expansion: 'from-red-500 to-orange-500',
    thermalExpansion: 'from-red-500 to-orange-500',
  };
  
  return colorMap[key] || 'from-gray-500 to-gray-600';
}
