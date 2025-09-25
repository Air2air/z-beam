// app/components/Card/StatCard.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardProps } from './Card';
import { Thumbnail } from '../Thumbnail/Thumbnail';
import { BadgeSymbol } from '../BadgeSymbol/BadgeSymbol';

// Statistical data interface
export interface StatData {
  value: number | string;
  label: string;
  title?: string; // Optional display title (overrides label)
  description?: string; // Additional context or explanation
  unit?: string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'stable';
  comparison?: {
    label: string;
    value: number | string;
    unit?: string;
  };
  format?: 'number' | 'percentage' | 'currency' | 'decimal';
  precision?: number; // Number of decimal places
}

// Complete stat card configuration
export interface StatCardConfig {
  title?: string; // Card title (overrides cardProps.title)
  description?: string; // Card description
  primaryStat: StatData;
  secondaryStats?: StatData[];
  showTrendIcon?: boolean;
  showComparison?: boolean;
  statLayout?: 'vertical' | 'horizontal' | 'grid';
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

// Extended props for StatCard
export interface StatCardProps extends Omit<CardProps, 'description'> {
  // Card content
  cardTitle?: string; // Overrides title from CardProps
  cardDescription?: string; // Additional card description
  
  // Statistical data
  primaryStat: StatData;
  secondaryStats?: StatData[];
  
  // Display options
  showTrendIcon?: boolean;
  showComparison?: boolean;
  statLayout?: 'vertical' | 'horizontal' | 'grid';
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

// Format statistical values
const formatStatValue = (
  value: number | string,
  format: StatData['format'] = 'number',
  precision: number = 1,
  unit?: string
): string => {
  if (typeof value === 'string') return `${value}${unit ? ` ${unit}` : ''}`;
  
  switch (format) {
    case 'percentage':
      return `${value.toFixed(precision)}%`;
    case 'currency':
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}`;
    case 'decimal':
      return `${value.toFixed(precision)}${unit ? ` ${unit}` : ''}`;
    case 'number':
    default:
      return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  }
};

// Get trend icon based on change value
const getTrendIcon = (change: number, trend?: 'up' | 'down' | 'stable') => {
  const iconClass = "w-4 h-4 flex items-center justify-center font-bold text-xs";
  
  if (trend === 'stable' || change === 0) {
    return <div className={`${iconClass} bg-gray-400 text-white rounded-full`}>−</div>;
  }
  
  if (change > 0 || trend === 'up') {
    return <div className={`${iconClass} bg-green-500 text-white rounded-full`}>↑</div>;
  }
  
  if (change < 0 || trend === 'down') {
    return <div className={`${iconClass} bg-red-500 text-white rounded-full`}>↓</div>;
  }
  
  return null;
};

// Get color scheme classes
const getColorScheme = (scheme: StatCardProps['colorScheme'] = 'default') => {
  const schemes = {
    default: {
      primary: 'text-gray-900 dark:text-gray-100',
      secondary: 'text-gray-600 dark:text-gray-400',
      accent: 'text-blue-600 dark:text-blue-400',
      background: 'bg-white dark:bg-gray-800'
    },
    success: {
      primary: 'text-green-900 dark:text-green-100',
      secondary: 'text-green-600 dark:text-green-400',
      accent: 'text-green-700 dark:text-green-300',
      background: 'bg-green-50 dark:bg-green-900/20'
    },
    warning: {
      primary: 'text-yellow-900 dark:text-yellow-100',
      secondary: 'text-yellow-600 dark:text-yellow-400',
      accent: 'text-yellow-700 dark:text-yellow-300',
      background: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    error: {
      primary: 'text-red-900 dark:text-red-100',
      secondary: 'text-red-600 dark:text-red-400',
      accent: 'text-red-700 dark:text-red-300',
      background: 'bg-red-50 dark:bg-red-900/20'
    },
    info: {
      primary: 'text-blue-900 dark:text-blue-100',
      secondary: 'text-blue-600 dark:text-blue-400',
      accent: 'text-blue-700 dark:text-blue-300',
      background: 'bg-blue-50 dark:bg-blue-900/20'
    }
  };
  
  return schemes[scheme];
};

// Individual stat display component
const StatDisplay: React.FC<{
  stat: StatData;
  colorScheme: ReturnType<typeof getColorScheme>;
  showTrendIcon: boolean;
  size?: 'small' | 'medium' | 'large';
}> = ({ stat, colorScheme, showTrendIcon, size = 'medium' }) => {
  const sizeClasses = {
    small: { value: 'text-lg font-semibold', label: 'text-xs', title: 'text-sm font-semibold', desc: 'text-xs' },
    medium: { value: 'text-xl font-bold', label: 'text-sm', title: 'text-base font-bold', desc: 'text-xs' },
    large: { value: 'text-2xl font-bold', label: 'text-base', title: 'text-lg font-bold', desc: 'text-sm' }
  };
  
  return (
    <div className="flex flex-col space-y-1">
      {/* Title (if provided, shows above value) */}
      {stat.title && (
        <span className={`${sizeClasses[size].title} ${colorScheme.primary}`}>
          {stat.title}
        </span>
      )}
      
      {/* Value and trend indicators */}
      <div className="flex items-center space-x-2">
        <span className={`${sizeClasses[size].value} ${colorScheme.primary}`}>
          {formatStatValue(stat.value, stat.format, stat.precision, stat.unit)}
        </span>
        {showTrendIcon && stat.change !== undefined && getTrendIcon(stat.change, stat.trend)}
        {stat.change !== undefined && (
          <span className={`text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
          </span>
        )}
      </div>
      
      {/* Label (always shown unless title is provided and they're the same) */}
      {(!stat.title || stat.title !== stat.label) && (
        <span className={`${sizeClasses[size].label} ${colorScheme.secondary} font-medium`}>
          {stat.label}
        </span>
      )}
      
      {/* Description */}
      {stat.description && (
        <p className={`${sizeClasses[size].desc} ${colorScheme.secondary} opacity-75 leading-tight`}>
          {stat.description}
        </p>
      )}
      
      {/* Comparison */}
      {stat.comparison && (
        <div className={`text-xs ${colorScheme.secondary} opacity-75`}>
          vs {formatStatValue(stat.comparison.value, stat.format, stat.precision, stat.comparison.unit)} {stat.comparison.label}
        </div>
      )}
    </div>
  );
};

export function StatCard({
  cardTitle,
  cardDescription,
  primaryStat,
  secondaryStats = [],
  showTrendIcon = true,
  showComparison = true,
  statLayout = 'vertical',
  colorScheme = 'default',
  className = '',
  ...cardProps
}: StatCardProps) {
  const colors = getColorScheme(colorScheme);
  
  // Create a custom Card-like component for stats
  return (
    <Link
      href={cardProps.href}
      className={`
        group block rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden 
        border border-gray-200 dark:border-gray-700 h-full ${className}
      `}
    >
      <article className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative w-full aspect-[16/9] h-20 overflow-hidden bg-gray-50 dark:bg-gray-800">
          <Thumbnail
            alt={cardProps.imageAlt || cardProps.name || cardProps.title || 'Stat Card'}
            slug={cardProps.href?.split('/').pop() || ''}
            objectFit="cover"
            priority={false}
          />

          {/* Badge overlay */}
          {cardProps.badge && cardProps.badge.symbol && (
            <div className="absolute top-2 right-2 z-10">
              <BadgeSymbol
                content=""
                config={{
                  symbol: cardProps.badge.symbol,
                  materialType: cardProps.badge.materialType,
                  atomicNumber: typeof cardProps.badge.atomicNumber === 'number' ? cardProps.badge.atomicNumber : 
                               typeof cardProps.badge.atomicNumber === 'string' ? parseInt(cardProps.badge.atomicNumber) : undefined,
                  formula: cardProps.badge.formula,
                  variant: "card"
                }}
              />
            </div>
          )}
        </div>

        {/* Stats Content */}
        <div className={`p-4 flex-grow flex flex-col space-y-3 ${colors.background}`}>
          {/* Card Title */}
          <div className="mb-2">
            <h3 className="text-base font-semibold group-hover:text-blue-600 transition-colors duration-200">
              {cardTitle || cardProps.name || cardProps.title}
            </h3>
            {cardDescription && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-tight">
                {cardDescription}
              </p>
            )}
          </div>
          
          {/* Primary Stat - Always displayed prominently */}
          <div className="flex-shrink-0">
            <StatDisplay
              stat={primaryStat}
              colorScheme={colors}
              showTrendIcon={showTrendIcon}
              size="large"
            />
          </div>
          
          {/* Secondary Stats */}
          {secondaryStats.length > 0 && (
            <div className={`flex-grow ${statLayout === 'grid' ? 'grid grid-cols-2 gap-3' : 
                                        statLayout === 'horizontal' ? 'flex space-x-4 overflow-x-auto' : 
                                        'flex flex-col space-y-2'}`}>
              {secondaryStats.map((stat, index) => (
                <div key={index} className="flex-shrink-0">
                  <StatDisplay
                    stat={stat}
                    colorScheme={colors}
                    showTrendIcon={showTrendIcon}
                    size={statLayout === 'grid' ? 'small' : 'medium'}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Trend Indicators */}
          {(primaryStat.trend || primaryStat.change !== undefined) && (
            <div className="flex-shrink-0 flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {primaryStat.trend === 'up' && (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center bg-green-500 text-white rounded text-xs font-bold">↗</div>
                    <span className="text-xs text-green-600 font-medium">Trending Up</span>
                  </>
                )}
                {primaryStat.trend === 'down' && (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded text-xs font-bold">↘</div>
                    <span className="text-xs text-red-600 font-medium">Trending Down</span>
                  </>
                )}
                {primaryStat.trend === 'stable' && (
                  <span className="text-xs text-gray-500 font-medium">Stable</span>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// StatData interface is already exported above
