"use client";

import React from 'react';
import { MetricsCard as SingleMetricsCard } from './MetricsCard';
import { ArticleMetadata, PropertyWithUnits, MetricsCardProps } from '../../../types';
import { extractMachineSettingsFromFrontmatter } from '../../utils/metricsCardHelpers';
import { getIntelligentSectionHeader } from '../../utils/gridTitleMapping';
import './accessibility.css';

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
  titleFormat?: 'default' | 'comparison';
  layout?: keyof typeof GRID_LAYOUTS;
  maxCards?: number;
  showTitle?: boolean;
  className?: string;
  baseHref?: string;
  searchable?: boolean; // Enable search functionality for all cards
}

// Helper function to extract cards from frontmatter data
function extractCardsFromFrontmatter(
  metadata: ArticleMetadata, 
  dataSource: 'materialProperties' | 'machineSettings' = 'machineSettings'
): MetricsCardProps[] {
  const cards: MetricsCardProps[] = [];

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

    // Name mapping for custom display titles
    const TITLE_MAPPING: Record<string, string> = {
      'fluenceThreshold': 'Fluence',
      'thermalConductivity': 'Therm. Cond.',
      'thermalExpansion': 'Therm. Exp.',
      'thermalDiffusivity': 'Therm. Diff.',
      'tensileStrength': 'Ten. Strength',
      'youngsModulus': 'Y. Modulus',
      'overlapRatio': 'Overlap',
      'meltingPoint': 'Melting Point',
      'powerRange': 'Power Range',
      'pulseWidth': 'Pulse Width',
      'repetitionRate': 'Repetition',
      'scanSpeed': 'Scan'
    };
    
    // Format title using mapping or convert camelCase to readable
    const title = TITLE_MAPPING[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Extract value, unit, min, max from nested object structure or fallback to flat structure
    let displayValue: string;
    let numericValue: number | undefined;
    let unit = '';
    
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
        // Try to extract numeric value from first element
        numericValue = value.length > 0 ? Number(value[0]) : undefined;
      } else if (value.numeric !== undefined) {
        // Standard structure: { numeric: 80, units: '%', min: 60, max: 100 }
        displayValue = String(value.numeric);
        numericValue = Number(value.numeric);
        unit = value.units || value.unit || '';
      } else if (value.value !== undefined) {
        // Alternative structure: { value: 7.85, unit: 'g/cm³', min: 0.53, max: 22.6 }
        displayValue = String(value.value);
        numericValue = Number(value.value);
        unit = value.unit || value.units || '';
      } else if (value.current !== undefined) {
        displayValue = String(value.current);
        numericValue = Number(value.current);
        unit = value.unit || value.units || '';
      } else {
        // For complex objects, try to convert to string
        displayValue = value.toString && typeof value.toString === 'function' ? value.toString() : JSON.stringify(value);
        numericValue = undefined;
      }
    } else {
      // Simple value
      displayValue = String(value);
      numericValue = Number(value);
    }
    
    // Fallback: try separate unit key approach if no unit found in object
    if (!unit) {
      const unitKey = `${key}Unit`;
      unit = sourceData[unitKey] || '';
    }
    
    // Extract min/max values from nested object structure or fallback to flat structure
    let min: number | undefined;
    let max: number | undefined;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Extract from standard structure (numeric/units/min/max)
      min = value.min !== null && value.min !== undefined ? Number(value.min) : undefined;
      max = value.max !== null && value.max !== undefined ? Number(value.max) : undefined;
      
      // Handle range arrays if present
      if (value.range && Array.isArray(value.range) && value.range.length === 2) {
        min = Number(value.range[0]);
        max = Number(value.range[1]);
      }
    }
    
    // Fallback: try separate min/max keys if not found in object
    if (min === undefined || max === undefined) {
      const minKey = `${key}Min`;
      const maxKey = `${key}Max`;
      min = min ?? (sourceData[minKey] ? Number(sourceData[minKey]) : undefined);
      max = max ?? (sourceData[maxKey] ? Number(sourceData[maxKey]) : undefined);
    }
    
    // Add fallback min/max values for common metrics if still not found
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
    
    cards.push({
      key,
      title,
      value: numericValue !== undefined && !isNaN(numericValue) ? numericValue : displayValue,
      unit,
      min,
      max,
      color,
      href: undefined, // Can add search link logic here if needed
      fullPropertyName: key // Store the original property name for search
    } as MetricsCardProps);
  });

  return cards;
}

// MetricsGrid component - renders a grid of MetricsCard components
export function MetricsGrid({
  metadata,
  dataSource = 'machineSettings',
  title,
  description,
  titleFormat = 'default',
  layout = 'auto',
  maxCards = 8,
  showTitle = true,
  className = '',
  baseHref,
  searchable = true // Default to true for clickable cards
}: MetricsGridProps) {
  
  // Extract cards from frontmatter
  const cards = extractCardsFromFrontmatter(metadata, dataSource);
  
  // Generate intelligent title using centralized section header mapping
  const displayTitle = titleFormat === 'comparison' && !title
    ? getIntelligentSectionHeader(dataSource, 'comparison', metadata)
    : title;
  
  // Limit cards if maxCards is specified
  const limitedCards = maxCards ? cards.slice(0, maxCards) : cards;
  
  // Generate unique IDs for accessibility
  const sectionId = `metrics-section-${dataSource}`;
  const titleId = `metrics-title-${dataSource}`;
  const descId = `metrics-desc-${dataSource}`;
  const gridId = `metrics-grid-${dataSource}`;
  
  // If no cards, show accessible empty state
  if (limitedCards.length === 0) {
    return (
      <section 
        id={sectionId}
        className="text-center py-8 text-gray-500 dark:text-gray-400"
        role="status"
        aria-live="polite"
      >
        <p>No {dataSource === 'materialProperties' ? 'material properties' : 'machine settings'} available</p>
      </section>
    );
  }

  return (
    <section 
      id={sectionId}
      className={`metrics-grid-container ${className}`}
      role="region"
      aria-labelledby={showTitle && displayTitle ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      
      {/* Enhanced header with proper semantic structure */}
      {showTitle && displayTitle && (
        <header className="mb-6">
          <h3 id={titleId} className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {displayTitle}
          </h3>
          {description && (
            <p id={descId} className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </header>
      )}
      
      {/* Grid with comprehensive accessibility */}
      <div 
        id={gridId}
        className={`grid gap-4 ${GRID_LAYOUTS[layout]}`}
        role="list"
        aria-label={`${displayTitle || 'Metrics'} grid containing ${limitedCards.length} metric${limitedCards.length !== 1 ? 's' : ''}`}
        
        // Keyboard navigation support
        onKeyDown={(e) => {
          const cards = Array.from(e.currentTarget.querySelectorAll('[role="listitem"] article'));
          const currentIndex = cards.findIndex(card => card.contains(document.activeElement));
          
          let nextIndex = currentIndex;
          
          switch (e.key) {
            case 'ArrowRight':
              nextIndex = Math.min(currentIndex + 1, cards.length - 1);
              break;
            case 'ArrowLeft':
              nextIndex = Math.max(currentIndex - 1, 0);
              break;
            case 'ArrowDown':
              // Move down one row (approximate)
              const colsPerRow = Math.floor(e.currentTarget.offsetWidth / 200); // Estimate
              nextIndex = Math.min(currentIndex + colsPerRow, cards.length - 1);
              break;
            case 'ArrowUp':
              // Move up one row (approximate)
              const colsPerRowUp = Math.floor(e.currentTarget.offsetWidth / 200);
              nextIndex = Math.max(currentIndex - colsPerRowUp, 0);
              break;
            case 'Home':
              nextIndex = 0;
              break;
            case 'End':
              nextIndex = cards.length - 1;
              break;
            default:
              return; // Don't prevent default for other keys
          }
          
          if (nextIndex !== currentIndex) {
            e.preventDefault();
            (cards[nextIndex] as HTMLElement)?.focus();
          }
        }}
      >
        {limitedCards.map((card, index) => (
          <div 
            key={card.key}
            role="listitem"
            aria-setsize={limitedCards.length}
            aria-posinset={index + 1}
          >
            <SingleMetricsCard
              {...card}
              searchable={searchable}
            />
          </div>
        ))}
      </div>
      
      {/* Skip to next section link */}
      {limitedCards.length > 0 && (
        <div className="sr-only">
          <a href="#next-section" className="focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 rounded">
            Skip metrics grid
          </a>
        </div>
      )}
      
    </section>
  );
}