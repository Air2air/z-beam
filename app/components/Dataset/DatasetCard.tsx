'use client';

import React from 'react';
import { Card } from '@/app/components/Card/Card';
import type { DatasetCardProps } from '@/types/centralized';

/**
 * DatasetCard Component
 * 
 * Extends the base Card component with dataset-specific features:
 * - Format badges (JSON/CSV/TXT) with quick download
 * - Data point counter
 * - Category indicators
 * - Maintains all Card functionality (thumbnail, hover, accessibility)
 * 
 * @example
 * ```tsx
 * <DatasetCard
 *   frontmatter={material}
 *   href={`/datasets/materials/${material.slug}`}
 *   formats={[
 *     { format: 'JSON', url: '/datasets/materials/aluminum.json', size: '2.4 KB' },
 *     { format: 'CSV', url: '/datasets/materials/aluminum.csv', size: '1.8 KB' }
 *   ]}
 *   dataPoints={42}
 *   category="Metals"
 *   subcategory="Non-Ferrous"
 * />
 * ```
 */
export function DatasetCard({
  frontmatter,
  href,
  badge,
  className = '',
  variant = 'standard',
  formats = [],
  dataPoints,
  category,
  subcategory,
  onQuickDownload,
}: DatasetCardProps) {
  
  /**
   * Handle format badge click for quick download
   */
  const handleFormatClick = (e: React.MouseEvent, format: string, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onQuickDownload) {
      onQuickDownload(format, url);
    } else {
      // Default behavior: trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop() || `dataset.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Format data point count for display
   */
  const formatDataPoints = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Base Card Component */}
      <Card
        frontmatter={frontmatter}
        href={href}
        badge={badge}
        variant={variant}
        className="h-full"
      />
      
      {/* Material Dataset Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Format Badges - Top Left */}
        {formats.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1 pointer-events-auto z-20">
            {formats.map((format) => (
              <button
                key={format.format}
                onClick={(e) => handleFormatClick(e, format.format, format.url)}
                className="
                  px-2 py-1 text-xs font-semibold rounded
                  bg-blue-600 text-white
                  hover:bg-blue-700 active:bg-blue-800
                  transition-colors duration-150
                  shadow-sm hover:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                "
                aria-label={`Download ${format.format} format${format.size ? ` (${format.size})` : ''}`}
                title={format.size || 'Download'}
              >
                {format.format}
              </button>
            ))}
          </div>
        )}
        
        {/* Data Points Counter - Bottom Left */}
        {dataPoints !== undefined && dataPoints > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <div 
              className="
                px-2 py-1 text-xs font-medium rounded
                bg-white/90 dark:bg-gray-800/90
                text-gray-700 dark:text-gray-200
                backdrop-blur-sm
                shadow-sm
              "
              aria-label={`${dataPoints.toLocaleString()} data points`}
            >
              <span className="inline-flex items-center gap-1">
                <svg 
                  className="w-3 h-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
                <span>{formatDataPoints(dataPoints)}</span>
              </span>
            </div>
          </div>
        )}
        
        {/* Category Badge - Bottom Right */}
        {(category || subcategory) && (
          <div className="absolute bottom-2 right-2 z-10">
            <div 
              className="
                px-2 py-1 text-xs font-medium rounded
                bg-white/90 dark:bg-gray-800/90
                text-gray-700 dark:text-gray-200
                backdrop-blur-sm
                shadow-sm
                text-right
              "
              aria-label={`Category: ${category}${subcategory ? ` - ${subcategory}` : ''}`}
            >
              {subcategory || category}
            </div>
          </div>
        )}
      </div>
      
      {/* Hover State Enhancement */}
      <div 
        className="
          absolute inset-0 rounded-lg
          border-2 border-transparent
          group-hover:border-blue-500
          transition-all duration-200
          pointer-events-none
          z-30
        "
        aria-hidden="true"
      />
    </div>
  );
}

export default DatasetCard;
