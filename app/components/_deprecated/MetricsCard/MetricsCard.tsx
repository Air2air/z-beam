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
 * - Memoized to prevent unnecessary re-renders (performance optimization)
 * 
 * Result: ~250 lines (41% reduction)
 * Benefits: Better code organization, reusable utilities, cleaner component
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import Link from 'next/link';
import { MetricsCardProps } from '@/types';
import { cleanupFloat } from '../../../utils/formatting';
import { generateSearchUrl } from '../../../utils/searchUtils';
import { ProgressBar } from '../../ProgressBar/ProgressBar';
import { SITE_CONFIG } from '../../../utils/constants';
import './accessibility.css';

// Color theme configuration - New vibrant palette complementing bg-gray-700
const COLOR_THEMES = {
  // Coral Red - warm and energetic
  '#FF6B6B': { titleColor: 'text-white', valueColor: 'text-white' },
  '#EF4444': { titleColor: 'text-white', valueColor: 'text-white' },
  '#DC2626': { titleColor: 'text-white', valueColor: 'text-white' },
  
  // Bright Yellow - optimistic and clear
  '#FFD93D': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  '#FFE66D': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  '#FBBF24': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  
  // Rich Purple-Blue - professional and modern
  '#6C5CE7': { titleColor: 'text-white', valueColor: 'text-white' },
  '#4F46E5': { titleColor: 'text-white', valueColor: 'text-white' },
  '#3B82F6': { titleColor: 'text-white', valueColor: 'text-white' },
  
  // Teal-Emerald - fresh and technical
  '#00D9A3': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  '#10B981': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  
  // Vibrant Violet - creative and distinctive
  '#A855F7': { titleColor: 'text-white', valueColor: 'text-white' },
  '#8B5CF6': { titleColor: 'text-white', valueColor: 'text-white' },
  
  // Warm Orange - energetic complement
  '#FF8C42': { titleColor: 'text-white', valueColor: 'text-white' },
  '#F59E0B': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  
  // Bright Cyan - clean and technical
  '#4ECDC4': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  '#A8DADC': { titleColor: 'text-white', valueColor: 'text-gray-900' },
  
  // New color scheme colors
  '#80343e': { titleColor: 'text-white', valueColor: 'text-white' },
  '#ca963f': { titleColor: 'text-white', valueColor: 'text-white' },
  '#27739d': { titleColor: 'text-white', valueColor: 'text-white' },
  
  // Gray fallback
  '#6B7280': { titleColor: 'text-white', valueColor: 'text-white' },
};

// Get theme for a color, default to light text
const getColorTheme = (color: string) => {
  return COLOR_THEMES[color as keyof typeof COLOR_THEMES] || { titleColor: 'text-white', valueColor: 'text-white' };
};

// Single MetricsCard component - represents one metric with progress bar
// Memoized to prevent unnecessary re-renders when parent re-renders
export const MetricsCard = memo(function MetricsCard({ 
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
  animationDelay = 0,
  ...rest // Capture other props including key
}: MetricsCardProps) {
  
  // Animation state with IntersectionObserver
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4, rootMargin: '0px' } // Trigger when 40% of card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  // Convert value to display format with cleanup
  const cleanedValue = cleanupFloat(value);
  const displayValue = cleanedValue;
  const displayUnit = unit === 'dimensionless' ? '' : (unit || '');
  
  // Get theme based on color
  const theme = getColorTheme(color);
  
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
      data-testid="metrics-card"
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
      <header className="metric-card-header h-[24px] flex items-center justify-center text-center mb-2">
        <h4 
          id={titleId} 
          className={`metric-label text-xs ${theme.titleColor} font-medium leading-tight`}
          data-property={fullPropertyName || title.toLowerCase().replace(/[^\w]/g, '_')}
          data-component="metric-title"
          itemProp="name"
        >
          {title}
        </h4>
      </header>
      
      {/* Progress bar section (vertical) or value display */}
      {hasValidRange ? (
        <section className="metric-card-content h-[71px] min-h-0" aria-label="Metric visualization">
          <ProgressBar 
            id={componentKey}
            title={title}
            min={cleanedMin!}
            max={cleanedMax!}
            value={numericValue}
            color={color}
            unit={displayUnit}
            propertyName={fullPropertyName}
            valueTextColor={theme.valueColor}
          />
        </section>
      ) : (
        <section className="metric-card-content h-[71px] flex items-center justify-center">
          <div className={`metric-value-container text-lg md:text-xl ${theme.valueColor} font-semibold text-center`}>
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
              <span title={displayUnit} className={`metric-unit text-sm ${theme.valueColor} ml-1`}>
                {displayUnit}
              </span>
            )}
          </div>
        </section>
      )}
      
    </article>
  );

  // Create opacity gradient using opacity values from CSS variables
  // Note: CSS variables can't be concatenated in inline styles, so we use fixed opacity values
  // Increased opacity values for more vibrant, saturated appearance
  const bgGradient = `linear-gradient(to bottom, ${color}85, ${color}82, ${color}78, ${color}75, ${color}70)`;
  
  // For smooth hover transition, we'll use a pseudo-element approach via inline styles
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation classes - fade in with reduced delay
  const animationClasses = isInView 
    ? 'opacity-100 translate-y-0' 
    : 'opacity-0 translate-y-4';
  const animationStyles = {
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
    transitionDelay: `${animationDelay}ms`
  };
  
  // Enhanced styles with accessibility features
  const focusStyles = 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none focus-visible:ring-offset-2';
  const clickableClasses = isClickable 
    ? `cursor-pointer card-enhanced-hover ${focusStyles}` 
    : '';

  // Ensure minimum touch target size (44px minimum)
  const minTouchTarget = 'min-h-[44px] min-w-[44px]';

  return finalHref ? (
    <Link
      ref={cardRef as any}
      href={finalHref}
      className={`metric-card-wrapper metric-card-link rounded-lg p-1.5 md:p-2 block h-[105px] relative overflow-hidden ${clickableClasses} ${minTouchTarget} ${animationClasses} ${className}`}
      style={{ 
        backgroundImage: bgGradient,
        ...animationStyles,
        transition: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'transform 0.15s ease-out, box-shadow 0.15s ease-out'
      }}
      
      // Enhanced accessibility attributes
      aria-label={`Navigate to search results for ${fullPropertyName || title}: ${displayValue}${displayUnit}`}
      aria-describedby={descId}
      title={`Search for ${fullPropertyName || title}: ${displayValue}${displayUnit}`}
      
      // Hover state management
      onMouseEnter={() => isClickable && setIsHovered(true)}
      onMouseLeave={() => isClickable && setIsHovered(false)}
    >
      {/* Hover overlay for smooth opacity transition - solid color fill */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-[400ms] ease-out -z-10"
        style={{
          backgroundColor: color,
          opacity: isHovered ? 0.3 : 0
        }}
      />
      {cardContent}
    </Link>
  ) : (
    <div 
      ref={cardRef}
      className={`metric-card-wrapper metric-card-static rounded-lg p-1.5 md:p-2 h-[105px] transition-all duration-300 ease-out ${minTouchTarget} ${animationClasses} ${className}`}
      style={{ 
        backgroundImage: bgGradient,
        ...animationStyles,
        transition: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'all 0.3s ease-out'
      }}
      role="presentation"
    >
      {cardContent}
    </div>
  );
});
