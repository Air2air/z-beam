"use client";

/**
 * SIMPLIFIED MetricsCard Component
 * 
 * Reductions from original (424 lines):
 * - Extracted cleanupFloat to @/app/utils/formatting (reusable)
 * - Extracted generateSearchUrl to @/app/utils/searchUtils (reusable)
 * - Extracted ProgressBar to separate component (reusable)
 * - Removed 140+ lines of inline helper functions
 * - Maintained all functionality and accessibility features
 * 
 * Result: ~250 lines (41% reduction)
 * Benefits: Better code organization, reusable utilities, cleaner component
 */

import React from 'react';
import Link from 'next/link';
import { MetricsCardProps } from '@/types';
import { cleanupFloat } from '../../utils/formatting';
import { generateSearchUrl } from '../../utils/searchUtils';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { SITE_CONFIG } from '../../utils/constants';
import './accessibility.css';

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
  const finalHref = href || (searchable ? generateSearchUrl(title, value, fullPropertyName, unit) : undefined);
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
      className="metric-card-article h-full flex flex-col"
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
      itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
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
      <div id={descId} className="metric-card-description sr-only">
        {hasValidRange 
          ? `Metric showing ${fullPropertyName || title} with value ${displayValue} ${displayUnit}, ranging from ${cleanedMin} to ${cleanedMax} ${displayUnit}`
          : `Metric showing ${fullPropertyName || title} with value ${displayValue} ${displayUnit}`
        }
        {isClickable && '. Press Enter or Space to search for this metric.'}
      </div>
      
      {/* Metric title at top */}
      <header className="metric-card-header mb-2 text-center">
        <h4 
          id={titleId} 
          className="metric-label text-xs md:text-sm text-white/90 font-medium"
          data-property={fullPropertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
          data-component="metric-title"
          itemProp="name"
        >
          {title}
        </h4>
      </header>
      
      {/* Progress bar section (vertical) or value display */}
      {hasValidRange ? (
        <section className="metric-card-content flex-1 min-h-0" aria-label="Metric visualization">
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
        <section className="metric-card-content flex-1 flex items-center justify-center">
          <div className="metric-value-container text-2xl md:text-3xl text-white/90 font-semibold text-center">
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
              itemType={`${SITE_CONFIG.schema.context}/${SITE_CONFIG.schema.propertyValueType}`}
              className="metric-value-data"
            >
              {displayValue}
            </data>
            {displayUnit && (
              <span title={displayUnit} className="metric-unit text-sm md:text-base text-white/70 ml-1">
                {displayUnit}
              </span>
            )}
          </div>
        </section>
      )}
      
    </article>
  );

  // Create background colors with different opacities for normal and hover states
  const bgColor = `${color}40`; // 40 = ~25% opacity in hex for normal state
  const hoverBgColor = `${color}80`; // 80 = ~50% opacity in hex for hover state
  
  // Enhanced styles with accessibility features
  const focusStyles = 'focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-2';
  const clickableClasses = isClickable 
    ? `cursor-pointer hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 ease-out ${focusStyles}` 
    : '';

  // Ensure minimum touch target size (44px minimum)
  const minTouchTarget = 'min-h-[44px] min-w-[44px]';

  return finalHref ? (
    <Link
      href={finalHref}
      className={`metric-card-wrapper metric-card-link rounded-lg p-1.5 md:p-2 block h-32 md:h-40 ${clickableClasses} ${minTouchTarget} ${className}`}
      style={{ 
        backgroundColor: bgColor,
        '--hover-bg-color': hoverBgColor,
        transition: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'all 0.3s ease-out'
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
      className={`metric-card-wrapper metric-card-static rounded-lg p-1.5 md:p-2 h-32 md:h-40 transition-all duration-300 ease-out ${minTouchTarget} ${className}`}
      style={{ 
        backgroundColor: bgColor,
        transition: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'all 0.3s ease-out'
      }}
      role="presentation"
    >
      {cardContent}
    </div>
  );
}
