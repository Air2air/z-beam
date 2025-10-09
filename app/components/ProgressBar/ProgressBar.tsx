/**
 * ProgressBar Component
 * 
 * Extracted from MetricsCard for reusability across the application
 * Visualizes a value within a min-max range with WCAG accessibility compliance
 */

"use client";

import React from 'react';
import { cleanupFloat } from '../../utils/formatting';
import { SITE_CONFIG } from '../../utils/constants';
import type { ProgressBarProps } from '@/types';

export function ProgressBar({ 
  min, 
  max, 
  value, 
  color = '#4F46E5', 
  unit = '', 
  title, 
  id, 
  propertyName 
}: ProgressBarProps) {
  // Clean up numeric values to 2 decimal places
  const cleanMin = parseFloat(cleanupFloat(min));
  const cleanMax = parseFloat(cleanupFloat(max));
  const cleanValue = parseFloat(cleanupFloat(value));
  
  // Calculate percentage position (0-100)
  const percentage = Math.min(Math.max((cleanValue - cleanMin) / (cleanMax - cleanMin) * 100, 0), 100);
  
  // Dynamic alignment based on position to prevent overflow
  const getAlignment = () => {
    if (percentage <= 15) {
      // Near left edge: align left (no transform)
      return { transform: 'none', left: `${percentage}%` };
    } else if (percentage >= 85) {
      // Near right edge: align right (translate full width)
      return { transform: 'translateX(-100%)', left: `${percentage}%` };
    } else {
      // Middle: center align (translate half width)
      return { transform: 'translateX(-50%)', left: `${percentage}%` };
    }
  };
  
  const alignmentStyle = getAlignment();
  const progressId = `progress-${id}`;
  const labelId = `progress-label-${id}`;
  const descId = `progress-desc-${id}`;
  
  return (
    <figure className="w-full" role="img" aria-labelledby={labelId} aria-describedby={descId}>
      
      {/* Screen reader accessible label */}
      <figcaption id={labelId} className="sr-only">
        {title} progress indicator
      </figcaption>
      
      {/* Screen reader description */}
      <div id={descId} className="sr-only">
        Current value: <data 
          value={cleanValue}
          data-property={propertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
          data-unit={unit}
          data-type="measurement"
          data-context="material_property"
          data-precision={String(cleanValue).includes('.') ? String(cleanValue).split('.')[1]?.length || 0 : 0}
          data-magnitude={Math.abs(cleanValue) >= 1000 ? 'high' : Math.abs(cleanValue) >= 1 ? 'medium' : 'low'}
          itemProp="value"
          itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
        >{cleanValue}</data> {unit}.
        Range: {cleanMin} to {cleanMax} {unit}.
        Progress: {Math.round(percentage)}% of maximum.
      </div>
      
      {/* Current value positioned above the bar at pointer position */}
      <div className="relative w-full mb-0.5 md:mb-1 h-3 md:h-4">
        <div 
          className="absolute text-base md:text-lg font-bold text-white/90 z-10"
          aria-hidden="true" // Hide from screen readers (described above)
          style={{ 
            left: alignmentStyle.left,
            transform: alignmentStyle.transform,
            top: '-8px' 
          }}
        >
          <data 
            value={cleanValue}
            data-property={propertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
            data-unit={unit}
            data-type="measurement"
            data-context="material_property"
            data-precision={String(cleanValue).includes('.') ? String(cleanValue).split('.')[1]?.length || 0 : 0}
            data-magnitude={Math.abs(cleanValue) >= 1000 ? 'high' : Math.abs(cleanValue) >= 1 ? 'medium' : 'low'}
            data-position="current"
            itemProp="value"
            itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
          >{cleanValue}</data>
        </div>
      </div>
      
      {/* WCAG compliant progress bar */}
      <div className="relative w-full mb-0.5 md:mb-1">
        <div 
          id={progressId}
          role="progressbar"
          aria-valuenow={cleanValue}
          aria-valuemin={cleanMin}
          aria-valuemax={cleanMax}
          aria-labelledby={labelId}
          aria-describedby={descId}
          tabIndex={0} // Make focusable
          className="w-full h-3 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden focus:ring-2 focus:ring-blue-500 focus:outline-none"
          data-property={propertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
          data-percentage={Math.round(percentage)}
          data-component="progress-bar"
          itemProp="value"
        >
          {/* Background track */}
          <div 
            className="h-full opacity-25 rounded-full"
            style={{ backgroundColor: color, width: '100%' }}
            aria-hidden="true"
          />
          {/* Progress fill */}
          <div 
            className="absolute top-0 left-0 h-full opacity-100 rounded-l-full transition-all duration-300"
            style={{ backgroundColor: color, width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
        {/* Current value indicator */}
        <div 
          className="absolute top-0 h-3 w-0.5 bg-white dark:bg-white/90 transform -translate-x-0.25 shadow-md rounded-full"
          style={{ left: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
      
      {/* Min and Max values positioned under the bar */}
      <div className="flex justify-between items-center" aria-hidden="true">
        <span className="text-xs font-medium text-white/50">
          <data 
            value={cleanMin}
            data-property={propertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
            data-unit={unit}
            data-type="range_minimum"
            data-context="material_property"
            data-precision={String(cleanMin).includes('.') ? String(cleanMin).split('.')[1]?.length || 0 : 0}
            data-magnitude={Math.abs(cleanMin) >= 1000 ? 'high' : Math.abs(cleanMin) >= 1 ? 'medium' : 'low'}
            data-position="minimum"
            itemProp="minValue"
            itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
          >{cleanMin}</data>
        </span>
        <span className="text-xs font-medium text-white/50">
          <data 
            value={cleanMax}
            data-property={propertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
            data-unit={unit}
            data-type="range_maximum"
            data-context="material_property"
            data-precision={String(cleanMax).includes('.') ? String(cleanMax).split('.')[1]?.length || 0 : 0}
            data-magnitude={Math.abs(cleanMax) >= 1000 ? 'high' : Math.abs(cleanMax) >= 1 ? 'medium' : 'low'}
            data-position="maximum"
            itemProp="maxValue"
            itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
          >{cleanMax}</data>
        </span>
      </div>
      
    </figure>
  );
}
