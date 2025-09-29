"use client";

import React from 'react';
import { MetricsCard as SingleMetricsCard } from './MetricsCard';
import { ArticleMetadata, PropertyWithUnits } from '../../../types';
import { extractMachineSettingsFromFrontmatter } from '../../utils/metricsCardHelpers';

// Enhanced color palette for cards with semantic meanings
const DEFAULT_COLORS = [
  '#4F46E5', // Indigo - Primary
  '#059669', // Emerald - Success/Good
  '#DC2626', // Red - Critical/High
  '#7C3AED', // Violet - Premium
  '#0891B2', // Cyan - Info/Cool
  '#CA8A04', // Yellow - Warning/Attention
  '#EC4899', // Pink - Special
  '#6B7280'  // Gray - Neutral
];

// Color mapping for specific metric types (optional enhancement)
const METRIC_COLOR_MAP: Record<string, string> = {
  // Material Properties
  'density': '#4F46E5',
  'meltingPoint': '#DC2626', 
  'thermalConductivity': '#0891B2',
  'tensileStrength': '#059669',
  'hardness': '#7C3AED',
  
  // Machine Settings  
  'powerRange': '#DC2626',
  'wavelength': '#4F46E5',
  'pulseDuration': '#CA8A04',
  'spotSize': '#059669',
  'repetitionRate': '#0891B2',
  'fluenceRange': '#7C3AED'
};

// Grid layout configurations (added +1 column to each responsive size)
const GRID_LAYOUTS = {
  'auto': 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8',
  'grid-2': 'grid-cols-3 sm:grid-cols-4',
  'grid-3': 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5',
  'grid-4': 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
} as const;

// Interface for the grid container
export interface MetricsGridProps {
  metadata: ArticleMetadata;
  dataSource?: 'materialProperties' | 'machineSettings';
  title?: string;
  description?: string;
  layout?: keyof typeof GRID_LAYOUTS;
  maxCards?: number;
  showTitle?: boolean;
  className?: string;
  baseHref?: string;
}

// Helper function to extract cards from frontmatter data
function extractCardsFromFrontmatter(
  metadata: ArticleMetadata, 
  dataSource: 'materialProperties' | 'machineSettings' = 'machineSettings'
): Array<{
  key: string;
  title: string;
  value: string | number;
  unit?: string;
  min?: number;
  max?: number;
  color: string;
  href?: string;
}> {
  const cards: Array<{
    key: string;
    title: string;
    value: string | number;
    unit?: string;
    min?: number;
    max?: number;
    color: string;
    href?: string;
  }> = [];

  let sourceData: Record<string, any> = {};
  
  if (dataSource === 'materialProperties' && metadata.materialProperties) {
    sourceData = metadata.materialProperties;
  } else if (dataSource === 'machineSettings' && metadata.machineSettings) {
    sourceData = metadata.machineSettings;
  }

  // Extract cards from the source data
  let colorIndex = 0;
  Object.entries(sourceData).forEach(([key, value]) => {
    if (!value) return;
    
    // Skip min/max specific fields as they're handled separately
    if (key.includes('Min') || key.includes('Max') || key.includes('Unit')) return;
    
    // Use semantic color mapping if available, otherwise use sequential colors
    const color = METRIC_COLOR_MAP[key] || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
    colorIndex++;

    // Get unit
    const unitKey = `${key}Unit`;
    const unit = sourceData[unitKey] || '';
    
    // Format title (convert camelCase to readable)
    const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Extract value properly - handle objects, arrays, and primitives
    let displayValue: string;
    let numericValue: number | undefined;
    
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
        // Try to extract numeric value from first element
        numericValue = value.length > 0 ? Number(value[0]) : undefined;
      } else if (value.value !== undefined) {
        displayValue = String(value.value);
        numericValue = Number(value.value);
      } else if (value.current !== undefined) {
        displayValue = String(value.current);
        numericValue = Number(value.current);
      } else if (value.toString && typeof value.toString === 'function') {
        displayValue = value.toString();
      } else {
        displayValue = JSON.stringify(value);
      }
    } else {
      displayValue = String(value);
      numericValue = Number(value);
    }
    
    // Get min/max values - try multiple possible key formats
    const minKey = `${key}Min`;
    const maxKey = `${key}Max`;
    let min = sourceData[minKey] ? Number(sourceData[minKey]) : undefined;
    let max = sourceData[maxKey] ? Number(sourceData[maxKey]) : undefined;
    
    // Also try looking for min/max within the value object itself
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (value.min !== undefined) min = Number(value.min);
      if (value.max !== undefined) max = Number(value.max);
      if (value.range && Array.isArray(value.range) && value.range.length === 2) {
        min = Number(value.range[0]);
        max = Number(value.range[1]);
      }
    }
    
    // Add fallback min/max values for common metrics if not found
    if (min === undefined || max === undefined) {
      const fallbackRanges: Record<string, [number, number]> = {
        'density': [0.8, 8.0],
        'powerRange': [50, 500],
        'temperature': [20, 300],
        'pressure': [0, 100],
        'speed': [0, 1000],
        'thickness': [0.1, 10],
        'width': [1, 100],
        'length': [1, 1000]
      };
      
      if (fallbackRanges[key] && numericValue !== undefined && !isNaN(numericValue)) {
        min = min ?? fallbackRanges[key][0];
        max = max ?? fallbackRanges[key][1];
      }
    }
    
    // If we couldn't extract a numeric value but have min/max, try parsing the display value
    if (isNaN(numericValue || 0) && min !== undefined && max !== undefined) {
      const parsed = parseFloat(displayValue.replace(/[^\d.-]/g, ''));
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }
    
    // Debug log to see what we're getting
    if (key === 'density' || key === 'powerRange') {
      console.log(`Debug ${key}:`, { value, displayValue, numericValue, min, max, minKey, maxKey });
    }
    
    cards.push({
      key,
      title,
      value: numericValue !== undefined && !isNaN(numericValue) ? numericValue : displayValue,
      unit,
      min,
      max,
      color,
      href: undefined // Can add search link logic here if needed
    });
  });

  return cards;
}

// MetricsGrid component - renders a grid of MetricsCard components
export function MetricsGrid({
  metadata,
  dataSource = 'machineSettings',
  title,
  description,
  layout = 'auto',
  maxCards = 8,
  showTitle = true,
  className = '',
  baseHref
}: MetricsGridProps) {
  
  // Extract cards from frontmatter
  const cards = extractCardsFromFrontmatter(metadata, dataSource);
  
  // Limit cards if maxCards is specified
  const limitedCards = maxCards ? cards.slice(0, maxCards) : cards;
  
  // If no cards, show empty state
  if (limitedCards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No {dataSource === 'materialProperties' ? 'material properties' : 'machine settings'} available
      </div>
    );
  }

  return (
    <div className={`metrics-grid-container ${className}`}>
      {/* Title section */}
      {showTitle && title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Grid of cards */}
      <div className={`grid gap-4 ${GRID_LAYOUTS[layout]}`}>
        {limitedCards.map((card) => (
          <SingleMetricsCard
            key={card.key}
            title={card.title}
            value={card.value}
            unit={card.unit}
            color={card.color}
            href={card.href}
            min={card.min}
            max={card.max}
          />
        ))}
      </div>
    </div>
  );
}