/**
 * @component BaseSection
 * @purpose Unified base component for all section types - consolidates patterns from:
 *          SectionContainer, GridSection, ContentSection, and LinkageSection
 * @aiContext Use BaseSection as the foundation for all content sections
 *           Provides consistent spacing, title/description patterns, variants, and actions
 * 
 * @architecture
 * - Single source of truth for section rendering patterns
 * - Composable with SectionTitle for heading display
 * - Supports multiple variants (default, dark, card, minimal)
 * - Handles optional descriptions with markdown rendering
 * - Provides action slots for buttons/CTAs
 * - Includes proper ARIA labeling and semantic HTML
 * 
 * @usage
 * ```tsx
 * // Basic section
 * <BaseSection title="Related Materials">
 *   <DataGrid items={materials} />
 * </BaseSection>
 * 
 * // Section with description and action
 * <BaseSection 
 *   title="Machine Settings"
 *   description="Optimal laser parameters for this material"
 *   action={<Button href="/contact">Get Custom Settings</Button>}
 * >
 *   <SettingsTable data={settings} />
 * </BaseSection>
 * 
 * // Dark variant with icon
 * <BaseSection 
 *   title="Safety Information"
 *   icon={<AlertTriangle />}
 *   variant="dark"
 * >
 *   <SafetyWarnings warnings={warnings} />
 * </BaseSection>
 * ```
 */

import React from 'react';
import type { BaseSectionProps } from '@/types';
import { toCategorySlug } from '@/app/utils/formatting';
import { SECTION_HEADER_CLASSES } from '@/app/config/site';
import { renderMarkdown } from '@/app/utils/markdown';
import { getSectionIcon } from '@/app/config/sectionIcons';

export function BaseSection({
  title,
  description,
  icon,
  action,
  children,
  variant = 'default',
  alignment = 'left',
  spacing = 'normal',
  bgColor = 'transparent',
  horizPadding = false,
  radius = false,
  className = '',
  id,
  section, // 🔥 NEW: Accept entire _section object for ultimate simplicity
  ...rest
}: BaseSectionProps) {
  // 🔥 ULTIMATE SIMPLICITY: Use section object if provided, fallback to individual props
  const sectionTitle = section?.sectionTitle || title || '';
  const sectionDescription = section?.sectionDescription || description || '';
  const rawIcon = section?.icon || icon;
  
  // Convert string icons to React components using getSectionIcon
  const sectionIcon = typeof rawIcon === 'string' ? getSectionIcon(rawIcon) : rawIcon;

  // 🔥 MANDATORY SECTION REQUIREMENTS (Jan 15, 2026) - Fail-fast validation
  if (!sectionTitle || sectionTitle.trim() === '') {
    throw new Error('BaseSection: sectionTitle is required and cannot be empty');
  }
  if (!sectionDescription || sectionDescription.trim() === '') {
    throw new Error('BaseSection: sectionDescription is required and cannot be empty');
  }

  // Generate section ID from title if not provided
  const sectionId = id || (sectionTitle ? toCategorySlug(sectionTitle) : undefined);
  
  // Alignment classes for title
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right',
  };
  
  // Generate heading ID for accessibility - sectionTitle is guaranteed to have a value here
  const headingId = sectionId || `section-${sectionTitle.toLowerCase().replace(/[()[\]]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  
  // Variant-based styling configurations
  const variantConfig = {
    default: {
      wrapper: 'py-1 sm:py-2',
      titleClass: '',
    },
    dark: {
      wrapper: 'bg-gradient-to-br from-gray-800 to-gray-700 rounded-md px-4 md:px-5 py-4 md:py-5 mb-3 sm:mb-4',
      titleClass: 'text-gray-100',
    },
    card: {
      wrapper: 'bg-white rounded-md shadow-sm border border-gray-200 px-4 md:px-5 py-4 md:py-5',
      titleClass: '',
    },
    minimal: {
      wrapper: '',
      titleClass: '',
    },
  };
  
  // Spacing configurations
  const spacingConfig = {
    none: '',
    tight: 'mb-8',
    normal: 'mb-12',
    loose: 'mb-16',
  };
  
  // Background color classes
  const bgColorClasses = {
    transparent: '',
    default: 'bg-white',
    body: 'bg-gray-50',
    'gray-50': 'bg-gray-50',
    'gray-100': 'bg-gray-100',
    'gradient-dark': 'bg-gradient-to-br from-gray-800 to-gray-700',
  };
  
  const config = variantConfig[variant];
  const bgClass = bgColorClasses[bgColor] || '';
  const paddingClass = horizPadding ? 'px-4 md:px-5' : '';
  const radiusClass = radius ? 'rounded-md' : '';
  const spacingClass = spacingConfig[spacing];
  
  // Combine wrapper classes
  const wrapperClasses = [
    config.wrapper,
    bgClass,
    paddingClass,
    radiusClass,
    spacingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  
  return (
    <section
      id={sectionId}
      className={wrapperClasses}
      aria-labelledby={sectionTitle ? `section-${sectionId}` : undefined}
      {...rest}
    >
      {sectionTitle && (
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className={`flex-1 ${alignmentClasses[alignment]}`}>
            <h2
              id={headingId}
              className={`${SECTION_HEADER_CLASSES.title} flex items-center ${config.titleClass}`}
            >
              {sectionIcon && <span className="pr-2" aria-hidden="true">{sectionIcon}</span>}
              {sectionTitle}
            </h2>
            
            {sectionDescription && (
              <div 
                className={`text-base text-primary mt-2 prose prose-sm max-w-none ${alignmentClasses[alignment]}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(sectionDescription) }}
              />
            )}
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      )}
      
      {/* Render children content */}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
}

export default BaseSection;
