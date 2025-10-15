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
  propertyName,
  valueTextColor = 'text-gray-900/70'
}: ProgressBarProps) {
  // Clean up numeric values to 2 decimal places
  const cleanMin = parseFloat(cleanupFloat(min));
  const cleanMax = parseFloat(cleanupFloat(max));
  const cleanValue = parseFloat(cleanupFloat(value));
  
  // Calculate percentage position (0-100) - inverted for vertical (bottom to top)
  const percentage = Math.min(Math.max((cleanValue - cleanMin) / (cleanMax - cleanMin) * 100, 0), 100);
  
  // Calculate constrained position for the value wrapper
  // Ensure the wrapper stays within bounds by clamping between 15% and 85%
  // This accounts for the wrapper's height to prevent overflow
  const clampedPercentage = Math.min(Math.max(percentage, 15), 85);
  
  const progressId = `progress-${id}`;
  const labelId = `progress-label-${id}`;
  const descId = `progress-desc-${id}`;
  
  return (
    <figure className="h-full flex items-stretch" role="img" aria-labelledby={labelId} aria-describedby={descId}>
      
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
      
      {/* Main value on the left - positioned at indicator */}
      <div className="progress-value-container relative pr-2 min-w-[60px] h-full overflow-visible">
        {/* Value wrapper - clamped within container bounds */}
        <div 
          className={`progress-value-wrapper absolute right-2 flex flex-col items-center p-1 min-w-[50px] ${
            percentage <= 10 ? 'rounded-tl-sm rounded-tr-sm rounded-bl-sm' : 
            percentage >= 90 ? 'rounded-tl-sm rounded-bl-sm rounded-br-sm' : 
            'rounded-sm'
          }`}
          style={{ bottom: `${clampedPercentage}%`, transform: 'translateY(50%)', backgroundColor: color }}
        >
          <div className="progress-value-inner flex flex-col items-center">
            <div className={`progress-metric-value metric-value text-sm md:text-base ${valueTextColor} font-semibold text-center leading-none`}>
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
            {unit && (
              <span className={`progress-unit text-[10px] ${valueTextColor} mt-0 leading-none text-center`}>
                {unit}
              </span>
            )}
          </div>
        </div>
        
        {/* Arrow pointer - always aligned with actual indicator bar position */}
        <div
          className="absolute right-2 w-0 h-0"
          style={{ bottom: `${percentage}%`, transform: 'translateY(50%)' }}
        >
          {percentage <= 10 ? (
            // Bottom arrow with flat bottom
            <div className="border-l-[8px] border-t-[8px] border-t-transparent" style={{ transform: 'translateY(-100%)', borderLeftColor: color }}></div>
          ) : percentage >= 90 ? (
            // Top arrow with flat top
            <div className="border-l-[8px] border-b-[8px] border-b-transparent" style={{ transform: 'translateY(0)', borderLeftColor: color }}></div>
          ) : (
            // Middle arrow (standard triangle pointing right)
            <div className="border-[8px] border-transparent" style={{ transform: 'translateY(-50%)', borderLeftColor: color }}></div>
          )}
        </div>
      </div>
      
      {/* WCAG compliant vertical progress bar */}
      <div className="progress-bar-container relative flex-shrink-0 w-3 md:w-4">
        <div 
          id={progressId}
          role="progressbar"
          aria-valuenow={cleanValue}
          aria-valuemin={cleanMin}
          aria-valuemax={cleanMax}
          aria-labelledby={labelId}
          aria-describedby={descId}
          tabIndex={0}
          className="progress-bar-track h-full w-full bg-white/20 dark:bg-white/10 overflow-hidden focus:ring-2 focus:ring-blue-500 focus:outline-none"
          data-property={propertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
          data-percentage={Math.round(percentage)}
          data-component="progress-bar"
          itemProp="value"
        >
          {/* Background track */}
          <div 
            className="progress-bar-background w-full h-full opacity-25"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          {/* Progress fill - from bottom */}
          <div 
            className="progress-bar-fill absolute bottom-0 left-0 w-full opacity-100 transition-all duration-300"
            style={{ backgroundColor: color, height: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
        {/* Current value indicator */}
        <div 
          className="progress-bar-indicator absolute left-0 w-full h-0.5 bg-white dark:bg-white/90 shadow-md"
          style={{ bottom: `${percentage}%`, transform: 'translateY(50%)' }}
          aria-hidden="true"
        />
      </div>
      
      {/* Range values on the right */}
      <div className="progress-range-container flex flex-col justify-between items-start pl-2 py-1 min-w-[50px]" aria-hidden="true" style={{ color }}>
        <span className="progress-range-max text-xs leading-none">
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
        <span className="progress-range-min text-xs leading-none">
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
      </div>
      
    </figure>
  );
}
