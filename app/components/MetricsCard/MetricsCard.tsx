"use client";

import React from 'react';
import Link from 'next/link';
import { ArticleMetadata, MachineSettings, SettingData, SettingCardConfig, SettingCardProps, CardData, PropertyWithUnits } from '../../../types';
import { extractMachineSettingsFromFrontmatter, createMachineSettingsForMetricsCard } from '../../utils/metricsCardHelpers';

// Default color palette for simple cards (consolidated from SimpleMetricsCard)
const DEFAULT_COLORS = [
  '#4F46E5', '#7C3AED', '#0891B2', '#059669', '#CA8A04', '#DC2626'
];

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
  
  return (
    <div className="flex items-center gap-2 w-full">
      {/* Min value */}
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {min}{unit && <span className="ml-0.5">{unit}</span>}
      </span>
      
      {/* Progress bar */}
      <div className="flex-1 relative">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-opacity-20 rounded-full"
            style={{ backgroundColor: color, width: '100%' }}
          />
          <div 
            className="absolute top-0 left-0 h-full bg-opacity-80 rounded-full"
            style={{ backgroundColor: color, width: `${percentage}%` }}
          />
        </div>
        {/* Value indicator */}
        <div 
          className="absolute top-0 h-2 w-1 bg-white dark:bg-gray-900 transform -translate-x-0.5"
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      {/* Max value */}
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {max}{unit && <span className="ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// Predefined configurations for common laser machine settings
const MACHINE_SETTINGS_CONFIGS: SettingCardConfig[] = [
  {
    key: 'power',
    title: 'Power',
    description: 'Laser power output for optimal material processing',
    priority: 1,
    colorScheme: 'blue'
  },
  {
    key: 'wavelength',
    title: 'Wavelength',
    description: 'Optical wavelength for material interaction and absorption',
    priority: 1,
    colorScheme: 'indigo'
  },
  {
    key: 'frequency',
    title: 'Frequency',
    description: 'Pulse frequency for processing speed optimization',
    priority: 1,
    colorScheme: 'purple'
  },
  {
    key: 'pulseWidth',
    title: 'Pulse Width',
    description: 'Temporal width of laser pulses for precision control',
    priority: 2,
    colorScheme: 'green'
  },
  {
    key: 'spotSize',
    title: 'Spot Size',
    description: 'Focused beam diameter for spatial resolution control',
    priority: 2,
    colorScheme: 'yellow'
  },
  {
    key: 'speed',
    title: 'Scan Speed',
    description: 'Material processing speed for throughput optimization',
    priority: 2,
    colorScheme: 'red'
  }
];

// Color scheme mappings
const COLOR_SCHEMES = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    accent: 'bg-blue-500',
    text: 'text-blue-900 dark:text-blue-100',
    value: 'text-blue-600 dark:text-blue-300'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-700',
    accent: 'bg-indigo-500',
    text: 'text-indigo-900 dark:text-indigo-100',
    value: 'text-indigo-600 dark:text-indigo-300'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    accent: 'bg-purple-500',
    text: 'text-purple-900 dark:text-purple-100',
    value: 'text-purple-600 dark:text-purple-300'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    accent: 'bg-green-500',
    text: 'text-green-900 dark:text-green-100',
    value: 'text-green-600 dark:text-green-300'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    accent: 'bg-yellow-500',
    text: 'text-yellow-900 dark:text-yellow-100',
    value: 'text-yellow-600 dark:text-yellow-300'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    accent: 'bg-red-500',
    text: 'text-red-900 dark:text-red-100',
    value: 'text-red-600 dark:text-red-300'
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    accent: 'bg-gray-500',
    text: 'text-gray-900 dark:text-gray-100',
    value: 'text-gray-600 dark:text-gray-300'
  }
};

// Extract setting data from machine settings
function extractSettingData(
  machineSettings: MachineSettings,
  config: SettingCardConfig
): SettingData | null {
  const rawValue = machineSettings[config.key];
  if (rawValue === undefined) return null;

  // Handle both PropertyWithUnits and simple values
  let value: number | string;
  let unit: string | undefined;
  let minValue: number | undefined;
  let maxValue: number | undefined;

  if (typeof rawValue === 'object' && rawValue !== null) {
    // PropertyWithUnits structure
    value = rawValue.numeric ?? rawValue.text ?? '';
    unit = rawValue.units;
    minValue = rawValue.range?.min ?? rawValue.min;
    maxValue = rawValue.range?.max ?? rawValue.max;
  } else {
    // Simple value with separate unit/min/max keys (legacy format)
    value = rawValue;
    unit = config.unitKey ? machineSettings[config.unitKey] as string : undefined;
    minValue = config.minKey ? machineSettings[config.minKey] as number : undefined;
    maxValue = config.maxKey ? machineSettings[config.maxKey] as number : undefined;
  }

  // Calculate trend if min/max values are available
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (typeof value === 'number' && minValue !== undefined && maxValue !== undefined) {
    const range = maxValue - minValue;
    const position = (value - minValue) / range;
    if (position > 0.7) trend = 'up';
    else if (position < 0.3) trend = 'down';
  }

  return {
    key: String(config.key),
    title: config.title,
    value,
    unit,
    description: config.description,
    priority: config.priority,
    colorScheme: config.colorScheme,
    trend,
    minValue,
    maxValue
  };
}

// Individual setting card component
function SettingCard({ setting, href }: SettingCardProps) {
  const colors = COLOR_SCHEMES[setting.colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.gray;
  
  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number') {
      const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2);
      return unit ? `${formatted} ${unit}` : formatted;
    }
    return value.toString();
  };

  const cardContent = (
    <div className={`
      relative p-4 rounded-lg border 
      ${colors.bg} ${colors.border}
      group cursor-pointer h-full flex flex-col text-center
    `}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent} rounded-t-lg`}></div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-2 text-center">
          <h3 className={`font-semibold text-sm ${colors.text} text-center`}>
            {setting.title}
          </h3>
        </div>
        
        <div className={`text-2xl font-bold ${colors.value} mb-1 text-center`}>
          {formatValue(setting.value, setting.unit)}
        </div>
        
        <p className={`text-xs ${colors.text} opacity-80 leading-relaxed text-center`}>
          {setting.description}
        </p>
        
        {setting.minValue !== undefined && setting.maxValue !== undefined && (
          <div className="mt-3 pt-2 border-t border-current opacity-20 text-center">
            <div className={`text-xs ${colors.text} opacity-60 text-center`}>
              Range: {formatValue(setting.minValue, setting.unit)} - {formatValue(setting.maxValue, setting.unit)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block h-full">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

const GRID_LAYOUTS = {
  'auto': 'grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  'grid-2': 'grid-cols-1 sm:grid-cols-4',
  'grid-3': 'grid-cols-1 sm:grid-cols-4 lg:grid-cols-5',
  'grid-4': 'grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
};

// Simple metrics mode component (consolidated from SimpleMetricsCard)
interface SimpleMetricsModeProps {
  metadata?: ArticleMetadata;
  cards?: CardData[];
  title?: string;
  className?: string;
  gridCols?: string;
}

function SimpleMetricsMode({
  metadata,
  cards: providedCards,
  title = "Parameters",
  className = "",
  gridCols = "grid-cols-2 md:grid-cols-4"
}: SimpleMetricsModeProps) {
  // If cards are provided directly, use them; otherwise extract from metadata
  let cards: CardData[] = [];
  
  if (providedCards) {
    cards = providedCards;
  } else if (metadata?.machineSettings) {
    const machineSettings = metadata.machineSettings;
    const displayTitle = title === "Parameters" ? "Laser Parameters" : title;
    
    // Direct mapping from frontmatter to cards - no complex transformations
    cards = [
      { 
        key: 'power', 
        title: 'Power', 
        value: machineSettings.powerRange, 
        unit: machineSettings.powerRangeUnit,
        color: DEFAULT_COLORS[0]
      },
      { 
        key: 'wavelength', 
        title: 'Wavelength', 
        value: machineSettings.wavelength, 
        unit: machineSettings.wavelengthUnit,
        color: DEFAULT_COLORS[1]
      },
      { 
        key: 'pulseDuration', 
        title: 'Pulse Duration', 
        value: machineSettings.pulseDuration, 
        unit: machineSettings.pulseDurationUnit,
        color: DEFAULT_COLORS[2]
      },
      { 
        key: 'repetitionRate', 
        title: 'Repetition Rate', 
        value: machineSettings.repetitionRate, 
        unit: machineSettings.repetitionRateUnit,
        color: DEFAULT_COLORS[3]
      },
      { 
        key: 'spotSize', 
        title: 'Spot Size', 
        value: machineSettings.spotSize, 
        unit: machineSettings.spotSizeUnit,
        color: DEFAULT_COLORS[4]
      },
      { 
        key: 'fluence', 
        title: 'Fluence', 
        value: machineSettings.fluenceRange, 
        unit: machineSettings.fluenceRangeUnit,
        color: DEFAULT_COLORS[5]
      }
    ].filter(card => card.value !== undefined);
  }
  
  // Fail-fast: no fallbacks or defaults
  if (!cards || cards.length === 0) {
    return null;
  }

  // Assign default colors to cards that don't have them
  const cardsWithColors = cards.map((card, index) => ({
    ...card,
    color: card.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  return (
    <div className={`metrics-card-container ${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
        </div>
      )}
      
      <div className={`grid ${gridCols} gap-4`}>
        {cardsWithColors.map((card) => {
          // Handle both simple values and PropertyWithUnits objects
          const displayValue = typeof card.value === 'object' && card.value?.text 
            ? card.value.text 
            : String(card.value);
          const displayUnit = typeof card.unit === 'object' && card.unit?.text 
            ? card.unit.text 
            : String(card.unit || '');

          // Helper function to extract numeric value from PropertyWithUnits or string
          const extractNumericValue = (value: string | PropertyWithUnits | undefined): number | undefined => {
            if (!value) return undefined;
            if (typeof value === 'string') {
              const parsed = parseFloat(value);
              return isNaN(parsed) ? undefined : parsed;
            }
            if (typeof value === 'object' && 'text' in value) {
              const parsed = parseFloat(String(value.text));
              return isNaN(parsed) ? undefined : parsed;
            }
            return undefined;
          };

          // Extract min/max values from the numeric fields in machineSettings
          let minValue: number | undefined;
          let maxValue: number | undefined;
          
          if (metadata?.machineSettings) {
            const settings = metadata.machineSettings;
            
            // Map card keys to their corresponding Min/Max field names
            switch (card.key) {
              case 'power':
                minValue = extractNumericValue(settings.powerMin);
                maxValue = extractNumericValue(settings.powerMax);
                break;
              case 'wavelength':
                minValue = extractNumericValue(settings.wavelengthMin);
                maxValue = extractNumericValue(settings.wavelengthMax);
                break;
              case 'pulseDuration':
                minValue = extractNumericValue(settings.pulseDurationMin);
                maxValue = extractNumericValue(settings.pulseDurationMax);
                break;
              case 'repetitionRate':
                minValue = extractNumericValue(settings.repetitionRateMin);
                maxValue = extractNumericValue(settings.repetitionRateMax);
                break;
              case 'spotSize':
                minValue = extractNumericValue(settings.spotSizeMin);
                maxValue = extractNumericValue(settings.spotSizeMax);
                break;
              case 'fluence':
                minValue = extractNumericValue(settings.fluenceMin);
                maxValue = extractNumericValue(settings.fluenceMax);
                break;
            }
          }

          // Extract numeric value from displayValue for progress calculation
          const numericValue = parseFloat(displayValue.replace(/[^\d.-]/g, ''));
          const hasValidRange = minValue !== undefined && maxValue !== undefined && !isNaN(numericValue) && minValue < maxValue;

          const cardContent = (
            <div className="text-center">
              <h3 className="font-semibold text-base mb-3">{card.title}</h3>
              
              {hasValidRange ? (
                // Progress bar layout when min/max values are available
                <div className="space-y-3">
                  <Link 
                    href={`/search?property=${encodeURIComponent(card.title)}&value=${encodeURIComponent(displayValue + (displayUnit ? displayUnit : ''))}`}
                    className="font-bold text-lg cursor-pointer block"
                    title={`Search for materials with ${card.title}: ${displayValue}${displayUnit || ''}`}
                  >
                    {displayValue}
                    {displayUnit && <span className="text-xs font-normal ml-1">{displayUnit}</span>}
                  </Link>
                  <ProgressBar 
                    min={minValue!}
                    max={maxValue!}
                    value={numericValue}
                    color={card.color}
                    unit={displayUnit}
                  />
                </div>
              ) : (
                // Original layout when no range data is available
                <Link 
                  href={`/search?property=${encodeURIComponent(card.title)}&value=${encodeURIComponent(displayValue + (displayUnit ? displayUnit : ''))}`}
                  className="font-bold text-xl mb-2 cursor-pointer block"
                  title={`Search for materials with ${card.title}: ${displayValue}${displayUnit || ''}`}
                >
                  {displayValue}
                  {displayUnit && <span className="text-xs font-normal ml-1">{displayUnit}</span>}
                </Link>
              )}
            </div>
          );

          return card.href ? (
            <a
              key={card.key}
              href={card.href}
              className={`border-2 rounded-lg p-4 block ${card.color}`}
            >
              {cardContent}
            </a>
          ) : (
            <div 
              key={card.key} 
              className={`border-2 rounded-lg p-4 ${card.color}`}
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main MetricsCard component interface
export interface MetricsCardProps {
  metadata: ArticleMetadata;
  baseHref?: string;
  title?: string;
  description?: string;
  layout?: keyof typeof GRID_LAYOUTS;
  maxCards?: number;
  priorityFilter?: number[];
  showTitle?: boolean;
  className?: string;
  dataSource?: 'properties' | 'machineSettings'; // Specify which data to use
  
  // Simple mode props (consolidated from SimpleMetricsCard)
  cards?: CardData[];
  gridCols?: string;
  mode?: 'advanced' | 'simple';
}

// Main MetricsCard component
export function MetricsCard({
  metadata,
  baseHref,
  title = "Machine Settings",
  description,
  layout = 'auto',
  maxCards = 6,
  priorityFilter = [1, 2, 3, 4, 5],
  showTitle = true,
  className = "",
  dataSource = 'machineSettings', // Default to machineSettings for backward compatibility
  // Simple mode props
  cards: providedCards,
  gridCols = "grid-cols-2 md:grid-cols-4",
  mode = 'advanced'
}: MetricsCardProps) {
  
  // Simple mode - consolidated from SimpleMetricsCard
  if (mode === 'simple') {
    return <SimpleMetricsMode 
      metadata={metadata}
      cards={providedCards}
      title={title}
      className={className}
      gridCols={gridCols}
    />;
  }

  // Advanced mode (original functionality)
  // Extract data from frontmatter based on dataSource
  const machineSettings = createMachineSettingsForMetricsCard(metadata, dataSource);
  
  if (!machineSettings || Object.keys(machineSettings).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No machine settings available
      </div>
    );
  }

  const settingCards = MACHINE_SETTINGS_CONFIGS
    .filter(config => priorityFilter.includes(config.priority))
    .map(config => extractSettingData(machineSettings, config))
    .filter((setting): setting is SettingData => setting !== null)
    .slice(0, maxCards);

  if (settingCards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No matching machine settings found
      </div>
    );
  }

  return (
    <div className={`metrics-card-container ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded mt-2"></div>
        </div>
      )}
      
      <div className={`grid gap-4 ${GRID_LAYOUTS[layout]}`}>
        {settingCards.map((setting) => (
          <SettingCard
            key={setting.key}
            setting={setting}
            href={`${baseHref}#${setting.key}`}
          />
        ))}
      </div>
    </div>
  );
}

// Convenience component variants
export function PrimaryMetricsCard({
  metadata,
  baseHref,
  className = ""
}: Pick<MetricsCardProps, 'metadata' | 'baseHref' | 'className'>) {
  return (
    <MetricsCard
      metadata={metadata}
      baseHref={baseHref}
      title="Primary Settings"
      description="Essential laser parameters for this material"
      layout="grid-3"
      maxCards={3}
      priorityFilter={[1]}
      className={className}
    />
  );
}

export function CompactMetricsCard({
  metadata,
  baseHref,
  className = ""
}: Pick<MetricsCardProps, 'metadata' | 'baseHref' | 'className'>) {
  return (
    <MetricsCard
      metadata={metadata}
      baseHref={baseHref}
      title="Key Parameters"
      layout="grid-2"
      maxCards={4}
      priorityFilter={[1, 2]}
      className={className}
    />
  );
}

export function MinimalMetricsCard({
  metadata,
  baseHref,
  className = ""
}: Pick<MetricsCardProps, 'metadata' | 'baseHref' | 'className'>) {
  return (
    <MetricsCard
      metadata={metadata}
      baseHref={baseHref}
      title="Essential Settings"
      layout="grid-3"
      maxCards={3}
      priorityFilter={[1]}
      showTitle={false}
      className={className}
    />
  );
}

// Default export for backward compatibility with SimpleMetricsCard
export default function SimpleMetricsCard(props: Partial<MetricsCardProps> & { metadata?: ArticleMetadata }) {
  return (
    <MetricsCard
      {...props}
      metadata={props.metadata || {} as ArticleMetadata}
      baseHref={props.baseHref || '#'}
      mode="simple"
    />
  );
}

// Export CardData type for backward compatibility
export type { CardData } from '../../../types';