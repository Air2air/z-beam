"use client";

import React from 'react';
import Link from 'next/link';

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

// Progress bar component for visualizing value within min-max range
interface ProgressBarProps {
  min: number;
  max: number;
  value: number;
  color?: string;
  unit?: string;
}

function ProgressBar({ min, max, value, color = '#4F46E5', unit = '' }: ProgressBarProps) {
  // Calculate percentage position (0-100)
  const percentage = Math.min(Math.max((value - min) / (max - min) * 100, 0), 100);
  
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
  
  return (
    <div className="w-full">
      {/* Current value positioned above the bar at pointer position */}
      <div className="relative w-full mb-1 h-4">
        <div 
          className="absolute text-lg font-bold text-white/90 z-10"
          style={{ 
            left: alignmentStyle.left,
            transform: alignmentStyle.transform,
            top: '-8px' 
          }}
        >
          {value}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative w-full mb-1">
        <div className="w-full h-3 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
          {/* Background track */}
          <div 
            className="h-full opacity-30 rounded-full"
            style={{ backgroundColor: color, width: '100%' }}
          />
          {/* Progress fill */}
          <div 
            className="absolute top-0 left-0 h-full opacity-90 rounded-l-full transition-all duration-300"
            style={{ backgroundColor: color, width: `${percentage}%` }}
          />
        </div>
        {/* Current value indicator */}
        <div 
          className="absolute top-0 h-3 w-0.5 bg-white dark:bg-white/90 transform -translate-x-0.25 shadow-md rounded-full"
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      {/* Min and Max values positioned under the bar */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-white/50">
          {min}
        </span>
        <span className="text-xs font-medium text-white/50">
          {max}
        </span>
      </div>
    </div>
  );
}

// Interface for a single metrics card
export interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color: string;
  href?: string;
  min?: number;
  max?: number;
  className?: string;
  searchable?: boolean; // If true, makes the card clickable to search for the value
  fullPropertyName?: string; // Full property name for more accurate search queries
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
  fullPropertyName
}: MetricsCardProps) {
  
  // Convert value to display format
  const displayValue = String(value);
  const displayUnit = unit || '';
  
  // Extract numeric value for progress calculation
  const numericValue = parseFloat(displayValue.replace(/[^\d.-]/g, ''));
  const hasValidRange = min !== undefined && max !== undefined && !isNaN(numericValue) && min < max;
  
  // Generate search URL if searchable is true and no href is provided
  const finalHref = href || (searchable ? generateSearchUrl(title, value, fullPropertyName) : undefined);
  const isClickable = Boolean(finalHref);

  const cardContent = (
    <div className="h-full flex flex-col">
      {/* Progress bar across the top with min/max values */}
      {hasValidRange ? (
        <div className="mb-1">
          <ProgressBar 
            min={min!}
            max={max!}
            value={numericValue}
            color={color}
            unit={displayUnit}
          />
        </div>
      ) : (
        // Spacer when no progress bar
        <div className="h-2 mb-1"></div>
      )}
      
      {/* Value and Title with unit */}
      <div className="flex-1 flex flex-col justify-center text-center">
        {/* Only show value if no progress bar, otherwise just show title */}
        {!hasValidRange && (
          <div className="text-lg font-bold text-white/90 mb-1">
            {displayValue}
            {displayUnit && <span className="text-sm text-white/70 ml-1">{displayUnit}</span>}
          </div>
        )}
        <h3 className="font-bold text-xs text-white/90">
          {title}{displayUnit && <span className="font-normal"> {displayUnit}</span>}
        </h3>
      </div>
    </div>
  );

  // Create background colors with different opacities for normal and hover states
  const bgColor = `${color}40`; // 40 = ~25% opacity in hex for normal state
  const hoverBgColor = `${color}80`; // 80 = ~50% opacity in hex for hover state
  
  // Add cursor pointer and hover effects for clickable cards
  const clickableClasses = isClickable ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : '';

  return finalHref ? (
    <Link
      href={finalHref}
      className={`rounded-lg p-3 block h-24 ${clickableClasses} ${className}`}
      style={{ 
        backgroundColor: bgColor,
        '--hover-bg-color': hoverBgColor
      } as React.CSSProperties & { '--hover-bg-color': string }}
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
      title={searchable && !href ? `Search for ${title}: ${displayValue}${displayUnit}` : undefined}
    >
      {cardContent}
    </Link>
  ) : (
    <div 
      className={`rounded-lg p-3 h-24 transition-all duration-200 ${className}`}
      style={{ 
        backgroundColor: bgColor 
      }}
    >
      {cardContent}
    </div>
  );
}