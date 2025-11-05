// app/components/Title/Title.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { TitleProps } from '@/types';
import { SITE_CONFIG } from '../../utils/constants';
import { Button } from '../Button';

/**
 * WCAG 2.1 AAA Compliant Title Component with Enhanced Accessibility
 * - Semantic HTML structure with proper heading hierarchy
 * - ARIA landmarks and comprehensive screen reader support
 * - Keyboard navigation and focus management
 * - Structured data for enhanced searchability
 * - High contrast and reduced motion support
 * 
 * @param level - Semantic level mapping:
 *   - 'page': Creates h1 (Main page title) - should be unique per page
 *   - 'section': Creates h2 (Major sections) - for content organization
 *   - 'card': Creates h3 (Sub-sections/cards) - for component headers
 */
export function Title({
  title,
  level = 'section',
  alignment = 'left',
  className = '',
  id,
  subtitle,
  rightContent,
  
  // WCAG & Accessibility Props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-labelledby': ariaLabelledby,
  role,
  tabIndex,
  
  // Search & SEO Props
  searchKeywords = [],
  category,
  priority = 'medium',
  
  // Navigation Props
  skipLink = false,
  landmark = false,
  nextHeaderId,
  prevHeaderId,
  
  // Content Props
  context,
  
  // Event Handlers
  onFocus,
  onBlur,
  onKeyDown,
  
  ...rest
}: TitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Map level to both HTML tag and styling with ARIA levels
  const levelConfig = {
    'page': {
      tag: 'h1' as const,
      classes: 'tracking-tight text-white',
      ariaLevel: 1,
      role: 'heading',
      landmark: 'banner'
    },
    'section': {
      tag: 'h2' as const,
      classes: 'tracking-tight text-gray-100',
      ariaLevel: 2,
      role: 'heading',
      landmark: 'region'
    },
    'card': {
      tag: 'h3' as const,
      classes: 'tracking-tight text-gray-200',
      ariaLevel: 3,
      role: 'heading',
      landmark: null
    }
  };
  
  // Get config for current level
  const config = levelConfig[level];
  const Tag = config.tag;
  
  // Generate deterministic unique ID with semantic prefix (no random components for SSR consistency)
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
  const titleHash = title.split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) & 0x7fffffff, 0).toString(36);
  const titleId = id || `${level}-title-${normalizedTitle}-${titleHash}`;
  
  // Generate IDs for related elements
  const subtitleId = subtitle ? `${titleId}-subtitle` : undefined;
  const skipLinkId = skipLink ? `${titleId}-skip` : undefined;
  
  // Base classes for all titles with enhanced accessibility
  const baseClasses = 'text-white transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900';
  
  // Alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  };
  
  // Priority classes for enhanced searchability
  const priorityClasses = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low'
  };
  
  // Combine all classes
  const combinedClasses = [
    baseClasses,
    config.classes,
    alignmentClasses[alignment],
    priorityClasses[priority],
    className
  ].filter(Boolean).join(' ');
  
  // Enhanced keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'j': // Vim-style navigation
        if (nextHeaderId) {
          event.preventDefault();
          const nextTitle = document.getElementById(nextHeaderId);
          nextTitle?.focus();
        }
        break;
      case 'ArrowUp':
      case 'k': // Vim-style navigation
        if (prevHeaderId) {
          event.preventDefault();
          const prevTitle = document.getElementById(prevHeaderId);
          prevTitle?.focus();
        }
        break;
      case 'Home':
        event.preventDefault();
        // Focus first title of same level
        const firstTitle = document.querySelector(`h${config.ariaLevel}`) as HTMLElement;
        firstTitle?.focus();
        break;
      case 'End':
        event.preventDefault();
        // Focus last title of same level
        const titles = document.querySelectorAll(`h${config.ariaLevel}`);
        const lastTitle = titles[titles.length - 1] as HTMLElement;
        lastTitle?.focus();
        break;
    }
    
    // Call custom handler if provided
    onKeyDown?.(event);
  };
  
  // Generate comprehensive structured data
  const structuredData = {
    '@type': 'WebPageElement',
    '@id': `#${titleId}`,
    'name': title,
    'description': subtitle,
    'headline': level === 'page' ? title : undefined,
    'about': context,
    'keywords': searchKeywords.join(', '),
    'mainContentOfPage': level === 'page',
    'isPartOf': {
      '@type': 'WebPage',
      'name': typeof window !== 'undefined' && document.title ? document.title : 'Web Page'
    },
    'position': config.ariaLevel,
    'audience': category ? {
      '@type': 'Audience',
      'audienceType': category
    } : undefined
  };
  
  // Add structured data to page head
  useEffect(() => {
    if (typeof window !== 'undefined' && searchKeywords.length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': SITE_CONFIG.schema.context,
        ...structuredData
      });
      script.id = `structured-data-${titleId}`;
      document.head.appendChild(script);
      
      return () => {
        const existingScript = document.getElementById(`structured-data-${titleId}`);
        existingScript?.remove();
      };
    }
  }, [titleId, searchKeywords, title, subtitle]);
  
  return (
    <>
      {/* Skip link for keyboard navigation */}
      {skipLink && (
        <a 
          href={`#${titleId}`} 
          id={skipLinkId}
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 rounded-md z-50 transition-all"
          onClick={(e) => {
            e.preventDefault();
            titleRef.current?.focus();
          }}
        >
          Skip to {title}
        </a>
      )}
      
      <header 
        className={`w-full mt-2 mb-2 py-2 sm:mt-4 sm:mb-4 sm:py-4 ${landmark ? 'landmark-title' : ''}`}
        role={landmark ? config.landmark || undefined : undefined}
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Tag
              ref={titleRef}
              id={titleId}
              className={combinedClasses}
              role={role || config.role}
              aria-level={config.ariaLevel}
              aria-label={ariaLabel}
              aria-describedby={subtitle ? subtitleId : ariaDescribedby}
              aria-labelledby={ariaLabelledby}
              tabIndex={tabIndex !== undefined ? tabIndex : level === 'page' ? 0 : -1}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
              {...(level === 'page' ? { itemProp: 'headline' } : {})}
              {...rest}
            >
              {title}
            </Tag>
            
            {subtitle && (
              <h3 
                id={subtitleId}
                className="text-gray-400 tracking-tight mt-3 text-sm sm:text-base lg:text-xl"
              >
                {subtitle}
              </h3>
            )}
          </div>
          
          {(rightContent !== undefined ? rightContent : level === 'page') && (
            <div className="flex-shrink-0">
              {rightContent !== undefined ? rightContent : (
                <Button variant="secondary" size="md" href="/contact" showIcon={true}>Let's talk</Button>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}

// Export for backward compatibility
export default Title;
