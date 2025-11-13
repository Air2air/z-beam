/**
 * @component SectionContainer
 * @purpose Base reusable container for sections with integrated title and styling
 * @dependencies None - accepts children for maximum flexibility
 * @accessibility WCAG 2.1 AA with semantic HTML, ARIA landmarks, unique IDs
 * @aiContext Base component for section containers with two variants:
 *           - Default: Lightweight, no padding or background (for RelatedMaterials, etc.)
 *           - Dark: Rich dark gradient with padding (for ParameterRelationships, etc.)
 * 
 * @usage
 * // Direct usage (legacy support)
 * <SectionContainer title="Lanthanide" bgColor="transparent">
 *   <CardGridSSR slugs={lanthanideSlugs} columns={3} />
 * </SectionContainer>
 * 
 * // Preferred: Use variants
 * <SectionContainerDefault title="Related Materials">
 *   <CardGridSSR slugs={slugs} />
 * </SectionContainerDefault>
 */
import React from 'react';
import { Button } from '../Button';
import type { SectionContainerProps } from '@/types/centralized';

export interface SectionContainerBaseProps {
  title?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionUrl?: string;
  className?: string;
  children: React.ReactNode;
}

interface SectionContainerInternalProps extends SectionContainerBaseProps {
  variant?: 'default' | 'dark';
}

export function SectionContainer({
  title,
  icon,
  actionText,
  actionUrl,
  className = '',
  variant = 'default',
  children,
  // Legacy props for backward compatibility
  bgColor,
  horizPadding,
  radius,
  action,
}: SectionContainerInternalProps & Partial<SectionContainerProps>) {
  // Generate unique ID from title for accessibility
  const sectionId = title ? title.toLowerCase().replace(/\s+/g, '-') : 'section';
  
  // Variant-specific styles
  const variantClasses = {
    default: 'section-container-default py-4',
    dark: 'section-container-dark bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg px-4 md:px-5 py-4 md:py-5 mb-8',
  };
  
  // Title color based on variant
  const titleColor = variant === 'dark' ? 'text-white' : 'text-gray-900 dark:text-white';
  
  // Legacy support: if bgColor/horizPadding/radius provided, use old logic
  if (bgColor !== undefined || horizPadding !== undefined || radius !== undefined) {
    const bgColorClasses = {
      transparent: '',
      navbar: 'bg-white dark:bg-gray-800',
      body: 'bg-gray-50 dark:bg-gray-900',
      'gray-50': 'bg-gray-50 dark:bg-gray-800',
      'gray-100': 'bg-gray-100 dark:bg-gray-700',
      'gradient-dark': 'bg-gradient-to-b from-gray-900 to-gray-700',
    };
    
    return (
      <section
        className={`
          section-container
          ${bgColorClasses[bgColor || 'transparent']}
          ${horizPadding ? 'px-4 md:px-5' : ''}
          ${radius ? 'rounded-lg' : ''}
          ${bgColor !== 'transparent' ? 'py-4 md:py-5' : 'py-4'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-labelledby={title ? `section-${sectionId}` : undefined}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {icon}
              <h2
                id={`section-${sectionId}`}
                className={`section-title text-xl font-semibold ${titleColor}`}
              >
                {title}
              </h2>
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
  
  // New variant-based rendering
  return (
    <section
      className={`${variantClasses[variant]} ${className}`.trim()}
      aria-labelledby={title ? `section-${sectionId}` : undefined}
    >
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {icon}
            <h2
              id={`section-${sectionId}`}
              className={`section-title text-xl font-semibold ${titleColor}`}
            >
              {title}
            </h2>
          </div>
          {actionText && actionUrl && (
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                size="md"
                href={actionUrl}
                showIcon={true}
              >
                {actionText}
              </Button>
            </div>
          )}
        </div>
      )}
      
      {children}
    </section>
  );
}

export default SectionContainer;
