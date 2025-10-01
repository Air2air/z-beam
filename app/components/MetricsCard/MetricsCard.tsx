"use client";

import React from 'react';
import Link from 'next/link';
import { MetricsCardProps } from '@/types';
import './accessibility.css';

// Utility function to clean up float values to 2 decimal places
function cleanupFloat(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Return original value if not a valid number
  if (isNaN(numericValue)) {
    return String(value);
  }
  
  // Round to 2 decimal places and remove unnecessary trailing zeros
  const rounded = Math.round(numericValue * 100) / 100;
  return rounded.toString();
}

// Progress bar component for visualizing value within min-max range
interface ProgressBarProps {
  min: number;
  max: number;
  value: number;
  color?: string;
  unit?: string;
  title: string;
  id: string;
  propertyName?: string;
}

// Helper function to generate search URL based on metric title and value
function generateSearchUrl(title: string, value: string | number, fullPropertyName?: string): string {
  const searchValue = String(value).replace(/[^\w\s.-]/g, ''); // Clean the value
  
  // Use full property name if available, otherwise fall back to title-based detection
  const propertyNameForSearch = fullPropertyName || title;
  
  if (fullPropertyName) {
    // If we have the full property name, always use property-based search
    return `/search?property=${encodeURIComponent(propertyNameForSearch)}&value=${encodeURIComponent(searchValue)}`;
  }
  
  // Fallback: title-based detection (original logic)
  const searchTitle = title.toLowerCase().replace(/[^\w\s]/g, ''); // Clean the title
  
  // Comprehensive property keywords including abbreviated forms from MetricsGrid
  const propertyKeywords = [
    // Physical properties
    'temperature', 'pressure', 'density', 'conductivity', 'strength', 'modulus', 'hardness', 'coefficient',
    'thermal', 'therm', 'cond', 'exp', 'diff', 'tensile', 'ten', 'young', 'melting', 'point',
    // Laser/machine properties
    'power', 'range', 'wavelength', 'pulse', 'width', 'repetition', 'frequency', 'spot', 'size',
    'fluence', 'threshold', 'overlap', 'scan', 'speed', 'energy',
    // Material properties
    'absorption', 'reflectivity', 'ablation', 'porosity', 'roughness', 'composition',
    // Units that indicate properties
    'mpa', 'gpa', 'nm', 'μm', 'micron', 'celsius', 'kelvin', 'watt', 'joule', 'gram', 'kg'
  ];
  
  // Check if title contains any property keywords or appears to be a material property
  const isProperty = propertyKeywords.some(keyword => searchTitle.includes(keyword)) ||
                    // Also detect property-like patterns (number + unit combinations)
                    /\b(g\/cm|w\/m|j\/cm|mpa|gpa|nm|μm)\b/.test(searchTitle.toLowerCase());
  
  if (isProperty) {
    // Use property-based search
    return `/search?property=${encodeURIComponent(title)}&value=${encodeURIComponent(searchValue)}`;
  } else {
    // Use general search
    return `/search?q=${encodeURIComponent(searchValue)}`;
  }
}

function ProgressBar({ min, max, value, color = '#4F46E5', unit = '', title, id, propertyName }: ProgressBarProps) {
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
          itemType="https://schema.org/PropertyValue"
        >{cleanValue}</data> {unit}.
        Range: {cleanMin} to {cleanMax} {unit}.
        Progress: {Math.round(percentage)}% of maximum.
      </div>
      
      {/* Current value positioned above the bar at pointer position */}
      <div className="relative w-full mb-1 h-4">
        <div 
          className="absolute text-lg font-bold text-white/90 z-10"
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
            itemType="https://schema.org/PropertyValue"
          >{cleanValue}</data>
        </div>
      </div>
      
      {/* WCAG compliant progress bar */}
      <div className="relative w-full mb-1">
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
            className="h-full opacity-30 rounded-full"
            style={{ backgroundColor: color, width: '100%' }}
            aria-hidden="true"
          />
          {/* Progress fill */}
          <div 
            className="absolute top-0 left-0 h-full opacity-90 rounded-l-full transition-all duration-300"
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
            itemType="https://schema.org/PropertyValue"
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
            itemType="https://schema.org/PropertyValue"
          >{cleanMax}</data>
        </span>
      </div>
      
    </figure>
  );
}

// Single MetricsCard component - represents one metric with progress bar
export function MetricsCard({ 
  title, 
  value, 
  unit = '', 
  color, 
  href, 
  min, 
  max, 
  className = '',
  searchable = false,
  fullPropertyName,
  ...rest // Capture other props including key
}: MetricsCardProps) {
  
  // Convert value to display format with cleanup
  const cleanedValue = cleanupFloat(value);
  const displayValue = cleanedValue;
  const displayUnit = unit || '';
  
  // Extract numeric value for progress calculation (already cleaned)
  const numericValue = parseFloat(cleanedValue);
  const cleanedMin = min !== undefined ? parseFloat(cleanupFloat(min)) : undefined;
  const cleanedMax = max !== undefined ? parseFloat(cleanupFloat(max)) : undefined;
  const hasValidRange = cleanedMin !== undefined && cleanedMax !== undefined && !isNaN(numericValue) && cleanedMin < cleanedMax;
  
  // Generate search URL if searchable is true and no href is provided
  const finalHref = href || (searchable ? generateSearchUrl(title, value, fullPropertyName) : undefined);
  const isClickable = Boolean(finalHref);
  
  // Generate unique IDs for accessibility
  const componentKey = rest.key || title || 'default';
  const cardId = `metric-card-${componentKey}`;
  const titleId = `metric-title-${componentKey}`;
  const valueId = `metric-value-${componentKey}`;
  const descId = `metric-desc-${componentKey}`;

  const cardContent = (
    <article 
      id={cardId}
      className="h-full flex flex-col"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descId}
      tabIndex={isClickable ? 0 : -1}
      data-component="metrics-card"
      data-property={fullPropertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
      data-searchable={isClickable ? 'true' : 'false'}
      data-has-range={hasValidRange ? 'true' : 'false'}
      data-unit={displayUnit}
      data-value={displayValue}
      itemScope
      itemType="https://schema.org/PropertyValue"
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          if (finalHref) {
            window.location.href = finalHref;
          }
        }
      }}
    >
      
      {/* Hidden description for screen readers */}
      <div id={descId} className="sr-only">
        {hasValidRange 
          ? `Metric showing ${fullPropertyName || title} with value ${displayValue} ${displayUnit}, ranging from ${cleanedMin} to ${cleanedMax} ${displayUnit}`
          : `Metric showing ${fullPropertyName || title} with value ${displayValue} ${displayUnit}`
        }
        {isClickable && '. Press Enter or Space to search for this metric.'}
      </div>
      
      {/* Progress bar section */}
      {hasValidRange ? (
        <section className="mb-1" aria-label="Metric visualization">
          <ProgressBar 
            id={componentKey}
            title={title}
            min={cleanedMin!}
            max={cleanedMax!}
            value={numericValue}
            color={color}
            unit={displayUnit}
            propertyName={fullPropertyName}
          />
        </section>
      ) : (
        <div className="h-2 mb-1" aria-hidden="true"></div>
      )}
      
      {/* Value and Title section */}
      <section className="flex-1 flex flex-col justify-center text-center">
        
        {/* Value display (when no progress bar) */}
        {!hasValidRange && (
          <div className="text-lg font-bold text-white/90 mb-1">
            <data 
              id={valueId} 
              value={numericValue || displayValue}
              data-property={fullPropertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
              data-unit={displayUnit}
              data-type="measurement"
              data-context="material_property"
              data-precision={String(displayValue).includes('.') ? String(displayValue).split('.')[1]?.length || 0 : 0}
              data-magnitude={Math.abs(numericValue) >= 1000 ? 'high' : Math.abs(numericValue) >= 1 ? 'medium' : 'low'}
              data-position="primary"
              data-has-range={hasValidRange ? 'true' : 'false'}
              itemProp="value"
              itemType="https://schema.org/PropertyValue"
            >
              {displayValue}
            </data>
            {displayUnit && (
              <span title={displayUnit} className="text-sm text-white/70 ml-1">
                {displayUnit}
              </span>
            )}
          </div>
        )}
        
        {/* Metric title with proper heading level */}
        <h4 
          id={titleId} 
          className="font-bold text-xs text-white/90"
          data-property={fullPropertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
          data-component="metric-title"
          itemProp="name"
        >
          {title}
          {displayUnit && hasValidRange && (
            <span title={displayUnit} className="font-normal ml-1">
              {displayUnit}
            </span>
          )}
        </h4>
        
      </section>
      
    </article>
  );

  // Create background colors with different opacities for normal and hover states
  const bgColor = `${color}40`; // 40 = ~25% opacity in hex for normal state
  const hoverBgColor = `${color}80`; // 80 = ~50% opacity in hex for hover state
  
  // Enhanced styles with accessibility features
  const focusStyles = 'focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-2';
  const clickableClasses = isClickable 
    ? `cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${focusStyles}` 
    : '';

  // Ensure minimum touch target size (44px minimum)
  const minTouchTarget = 'min-h-[44px] min-w-[44px]';

  return finalHref ? (
    <Link
      href={finalHref}
      className={`rounded-lg p-3 block h-24 ${clickableClasses} ${minTouchTarget} ${className}`}
      style={{ 
        backgroundColor: bgColor,
        '--hover-bg-color': hoverBgColor,
        transition: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'all 0.2s'
      } as React.CSSProperties & { '--hover-bg-color': string }}
      
      // Enhanced accessibility attributes
      aria-label={`Navigate to search results for ${fullPropertyName || title}: ${displayValue}${displayUnit}`}
      aria-describedby={descId}
      title={`Search for ${fullPropertyName || title}: ${displayValue}${displayUnit}`}
      
      // Reduced motion and hover support
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.backgroundColor = hoverBgColor;
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.backgroundColor = bgColor;
        }
      }}
    >
      {cardContent}
    </Link>
  ) : (
    <div 
      className={`rounded-lg p-3 h-24 transition-all duration-200 ${minTouchTarget} ${className}`}
      style={{ 
        backgroundColor: bgColor,
        transition: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'all 0.2s'
      }}
      role="presentation"
    >
      {cardContent}
    </div>
  );
}