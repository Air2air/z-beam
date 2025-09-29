// app/components/DataMetrics/DataMetrics.tsx
// Unified data metrics component consolidating MetricsCard, MetricsGrid, and StatCard functionality
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ArticleMetadata, 
  CardData, 
  GenericMetricConfig, 
  GenericMetricData, 
  MetricAutoDiscoveryConfig,
  QualityMetrics,
  MetricsGridProps 
} from '@/types';

// Import existing MetricsCard functionality
import { 
  MetricsCard, 
  MetricsCardProps,
  GenericMetricsCard,
  CustomMetricsCard,
  createMetricConfigs
} from '../MetricsCard/MetricsCard';

// Statistical data interface (from StatCard)
export interface StatData {
  value: number | string;
  label: string;
  title?: string;
  description?: string;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  comparison?: {
    label: string;
    value: number | string;
    unit?: string;
  };
  format?: 'number' | 'percentage' | 'currency' | 'decimal';
  precision?: number;
}

// Unified DataMetrics props combining all functionality
export interface DataMetricsProps {
  // Core data sources
  metadata?: ArticleMetadata;
  qualityMetrics?: QualityMetrics;
  statisticalData?: StatData[];
  cards?: CardData[];
  
  // Display configuration
  mode?: 'metrics' | 'grid' | 'stats' | 'hybrid' | 'auto';
  title?: string;
  description?: string;
  className?: string;
  
  // Layout options
  layout?: 'auto' | 'grid-2' | 'grid-3' | 'grid-4';
  maxCards?: number;
  gridCols?: string;
  
  // Filtering and selection
  excludeKeys?: string[];
  priorityFilter?: number[];
  excludeMetrics?: string[];
  
  // Statistical features
  showTrendIcon?: boolean;
  showComparison?: boolean;
  statLayout?: 'vertical' | 'horizontal' | 'grid';
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info' | string;
  
  // Generic metrics (from MetricsCard)
  metricConfigs?: GenericMetricConfig[];
  autoDiscovery?: MetricAutoDiscoveryConfig;
  useGenericExtraction?: boolean;
  
  // Navigation
  baseHref?: string;
  href?: string;
  
  // Advanced configuration
  dataSource?: 'properties' | 'machineSettings' | 'qualityMetrics' | 'auto';
  showTitle?: boolean;
}

// Color schemes for different data types
const DATA_COLOR_SCHEMES = {
  metrics: 'blue',
  grid: 'gray', 
  stats: 'indigo',
  quality: 'green',
  machine: 'purple',
  properties: 'yellow',
  default: 'gray'
};

// Format values with null safety (enhanced from MetricsCard)
const formatDataValue = (value: number | string | null | undefined, unit?: string, format?: string) => {
  if (value == null) {
    return 'N/A';
  }
  
  if (typeof value === 'number') {
    let formatted: string;
    
    switch (format) {
      case 'percentage':
        formatted = `${(value * 100).toFixed(2)}%`;
        break;
      case 'currency':
        formatted = `$${value.toFixed(2)}`;
        break;
      case 'decimal':
        formatted = value.toFixed(2);
        break;
      default:
        formatted = value % 1 === 0 ? value.toString() : value.toFixed(2);
    }
    
    return unit ? `${formatted} ${unit}` : formatted;
  }
  
  return unit ? `${value} ${unit}` : value.toString();
};

// Convert QualityMetrics to CardData format
const convertQualityMetricsToCards = (
  qualityMetrics: QualityMetrics,
  excludeMetrics: string[] = [],
  maxCards: number = 6
): CardData[] => {
  return Object.entries(qualityMetrics)
    .filter(([key]) => !excludeMetrics.includes(key))
    .slice(0, maxCards)
    .map(([key, value]) => ({
      key,
      title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value || 'N/A',
      unit: '',
      color: DATA_COLOR_SCHEMES.quality
    }));
};

// Convert StatData to CardData format
const convertStatDataToCards = (statisticalData: StatData[]): CardData[] => {
  return statisticalData.map((stat, index) => ({
    key: stat.label || `stat-${index}`,
    title: stat.title || stat.label,
    value: stat.value,
    unit: stat.unit,
    color: DATA_COLOR_SCHEMES.stats
  }));
};

/**
 * Unified DataMetrics Component
 * Consolidates functionality from MetricsCard, MetricsGrid, and StatCard
 */
export function DataMetrics({
  // Data sources
  metadata,
  qualityMetrics,
  statisticalData,
  cards,
  
  // Display configuration
  mode = 'auto',
  title,
  description,
  className = '',
  
  // Layout
  layout = 'auto',
  maxCards = 6,
  gridCols = 'grid-cols-2 md:grid-cols-4',
  
  // Filtering
  excludeKeys = [],
  priorityFilter = [1, 2, 3, 4, 5],
  excludeMetrics = [],
  
  // Statistical features
  showTrendIcon = true,
  showComparison = true,
  statLayout = 'vertical',
  colorScheme,
  
  // Generic metrics
  metricConfigs,
  autoDiscovery,
  useGenericExtraction = false,
  
  // Navigation
  baseHref,
  href,
  
  // Advanced
  dataSource = 'auto',
  showTitle = true
}: DataMetricsProps) {
  
  // Determine the best mode based on available data
  const effectiveMode = React.useMemo(() => {
    if (mode !== 'auto') return mode;
    
    if (statisticalData && statisticalData.length > 0) return 'stats';
    if (qualityMetrics && Object.keys(qualityMetrics).length > 0) return 'grid';
    if (metadata) return 'metrics';
    if (cards) return 'metrics';
    
    return 'metrics';
  }, [mode, statisticalData, qualityMetrics, metadata, cards]);
  
  // Prepare data based on mode
  const consolidatedCards = React.useMemo(() => {
    let dataCards: CardData[] = [];
    
    // Add cards from different sources
    if (cards) {
      dataCards = [...dataCards, ...cards];
    }
    
    if (qualityMetrics && (effectiveMode === 'grid' || effectiveMode === 'hybrid')) {
      const qualityCards = convertQualityMetricsToCards(qualityMetrics, excludeMetrics, maxCards);
      dataCards = [...dataCards, ...qualityCards];
    }
    
    if (statisticalData && (effectiveMode === 'stats' || effectiveMode === 'hybrid')) {
      const statCards = convertStatDataToCards(statisticalData);
      dataCards = [...dataCards, ...statCards];
    }
    
    return dataCards.slice(0, maxCards);
  }, [cards, qualityMetrics, statisticalData, effectiveMode, excludeMetrics, maxCards]);
  
  // For pure MetricsGrid functionality (simple quality metrics)
  if (effectiveMode === 'grid' && qualityMetrics && !metadata) {
    const filteredMetrics = Object.entries(qualityMetrics)
      .filter(([key]) => !excludeMetrics.includes(key))
      .slice(0, maxCards);
    
    if (filteredMetrics.length === 0) return null;
    
    return (
      <div className={`data-metrics-grid ${className}`}>
        {showTitle && title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h3>
        )}
        <div className={`grid gap-2 w-full ${maxCards === 2 ? 'grid-cols-2' : `grid-cols-${maxCards}`}`}>
          {filteredMetrics.map(([key, value]) => (
            <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </dt>
              <dd className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {formatDataValue(value)}
              </dd>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // For metrics mode, use existing MetricsCard functionality
  if (effectiveMode === 'metrics' || effectiveMode === 'hybrid') {
    // If we have generic extraction or custom configs, use CustomMetricsCard
    if (useGenericExtraction || metricConfigs) {
      return (
        <CustomMetricsCard
          metadata={metadata || {} as ArticleMetadata}
          baseHref={baseHref}
          metricConfigs={metricConfigs}
          title={title}
          className={className}
          layout={layout}
        />
      );
    }
    
    // Use regular MetricsCard
    return (
      <MetricsCard
        metadata={metadata || {} as ArticleMetadata}
        baseHref={baseHref}
        title={title}
        description={description}
        layout={layout}
        maxCards={maxCards}
        priorityFilter={priorityFilter}
        showTitle={showTitle}
        className={className}
        dataSource={dataSource as any}
        cards={consolidatedCards}
        mode={consolidatedCards.length > 0 ? 'simple' : 'advanced'}
        gridCols={gridCols}
      />
    );
  }
  
  // For statistical mode with rich formatting (StatCard-like functionality)
  if (effectiveMode === 'stats' && statisticalData) {
    return (
      <div className={`data-metrics-stats ${className}`}>
        {showTitle && title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h3>
        )}
        <div className={`grid gap-4 ${layout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' : layout === 'grid-3' ? 'grid-cols-1 md:grid-cols-3' : layout === 'grid-4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {statisticalData.slice(0, maxCards).map((stat, index) => (
            <div key={stat.label || index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title || stat.label}
                </h4>
                {showTrendIcon && stat.trend && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    stat.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'} {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {formatDataValue(stat.value, stat.unit, stat.format)}
              </div>
              {stat.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {stat.description}
                </p>
              )}
              {showComparison && stat.comparison && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  vs {formatDataValue(stat.comparison.value, stat.comparison.unit)} {stat.comparison.label}
                </div>
              )}
              {stat.change !== undefined && (
                <div className={`text-xs mt-1 ${
                  stat.change > 0 ? 'text-green-600 dark:text-green-400' :
                  stat.change < 0 ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}% change
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Fallback to simple card display
  return (
    <div className={`data-metrics-fallback ${className}`}>
      {showTitle && title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
      )}
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No data available to display
      </div>
    </div>
  );
}

// Convenience components for backward compatibility
export function DataMetricsGrid(props: MetricsGridProps) {
  return (
    <DataMetrics
      mode="grid"
      qualityMetrics={props.qualityMetrics}
      maxCards={props.maxCards}
      excludeMetrics={props.excludeMetrics}
      className={props.className}
    />
  );
}

export function DataMetricsStats({ 
  statisticalData, 
  title, 
  className,
  maxCards = 6,
  layout = 'auto' 
}: { 
  statisticalData: StatData[];
  title?: string;
  className?: string;
  maxCards?: number;
  layout?: DataMetricsProps['layout'];
}) {
  return (
    <DataMetrics
      mode="stats"
      statisticalData={statisticalData}
      title={title}
      className={className}
      maxCards={maxCards}
      layout={layout}
    />
  );
}

// Export all types for consumers
export type {
  DataMetricsProps as DataMetricsPropsType,
  StatData as StatDataType
};

// Re-export MetricsCard and StatCard functionality for migration
export {
  GenericMetricsCard,
  CustomMetricsCard,
  createMetricConfigs
} from '../MetricsCard/MetricsCard';

export {
  StatCard,
  type StatCardProps,
  type StatCardConfig
} from '../Card/StatCard';

export default DataMetrics;