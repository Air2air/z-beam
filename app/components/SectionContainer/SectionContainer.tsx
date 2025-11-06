/**
 * @component SectionContainer
 * @purpose Reusable container for sections with integrated title and styling
 * @dependencies None - accepts children for maximum flexibility
 * @accessibility WCAG 2.1 AA with semantic HTML, ARIA landmarks, unique IDs
 * @aiContext Use this for any section that needs a title and optional background
 *           Similar to Callout component but without image
 *           Simple container with title + children pattern
 * 
 * @usage
 * // Category page - subcategory sections
 * <SectionContainer title="Lanthanide" bgColor="transparent">
 *   <CardGridSSR slugs={lanthanideSlugs} columns={3} />
 * </SectionContainer>
 * 
 * // Home page - featured section with background
 * <SectionContainer title="Featured Solutions" bgColor="navbar">
 *   <CardGridSSR items={featuredItems} columns={2} variant="featured" />
 * </SectionContainer>
 */
import React from 'react';
import type { SectionContainerProps } from '@/types/centralized';

export function SectionContainer({
  title,
  bgColor = 'transparent',
  horizPadding = false,
  radius = false,
  children,
}: SectionContainerProps) {
  
  // Background color classes
  const bgColorClasses = {
    transparent: '',
    navbar: 'bg-white dark:bg-gray-800',
    body: 'bg-gray-50 dark:bg-gray-900',
    'gray-50': 'bg-gray-50 dark:bg-gray-800',
    'gray-100': 'bg-gray-100 dark:bg-gray-700',
  };
  
  // Generate unique ID from title for accessibility
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');
  
  // Title classes
  const titleClasses = 'section-title text-xl font-semibold text-gray-900 dark:text-white mb-6';
  
  return (
    <section
      className={`
        section-container
        ${bgColorClasses[bgColor]}
        ${horizPadding ? 'px-4 md:px-5' : ''}
        ${radius ? 'rounded-lg' : ''}
        ${bgColor !== 'transparent' ? 'py-4 md:py-5' : 'py-4'}
      `.trim().replace(/\s+/g, ' ')}
      aria-labelledby={`section-${sectionId}`}
    >
      <h2
        id={`section-${sectionId}`}
        className={titleClasses}
      >
        {title}
      </h2>
      
      {children}
    </section>
  );
}

export default SectionContainer;
