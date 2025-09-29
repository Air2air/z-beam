"use client";

import React from 'react';
import Link from 'next/link';

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
          className="absolute text-lg font-bold text-gray-800 dark:text-gray-200 z-10"
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
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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
          className="absolute top-0 h-3 w-0.5 bg-white dark:bg-gray-100 transform -translate-x-0.25 shadow-md rounded-full"
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      {/* Min and Max values positioned under the bar */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {min}
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
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
  className = '' 
}: MetricsCardProps) {
  
  // Convert value to display format
  const displayValue = String(value);
  const displayUnit = unit || '';
  
  // Extract numeric value for progress calculation
  const numericValue = parseFloat(displayValue.replace(/[^\d.-]/g, ''));
  const hasValidRange = min !== undefined && max !== undefined && !isNaN(numericValue) && min < max;

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
      
      {/* Title with unit in parentheses */}
      <div className="flex-1 flex flex-col justify-center text-center">
        <h3 className="font-medium text-sm leading-tight">
          {title}
          {displayUnit && <span className="text-gray-500 dark:text-gray-400"> {displayUnit}</span>}
        </h3>
      </div>
    </div>
  );

  // Create solid background color
  const bgColor = `${color}40`; // 40 = ~25% opacity in hex for more solid appearance

  return href ? (
    <a
      href={href}
      className={`rounded-lg p-3 block h-24 hover:shadow-lg transition-all duration-200 hover:scale-105 ${className}`}
      style={{ 
        backgroundColor: bgColor 
      }}
    >
      {cardContent}
    </a>
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