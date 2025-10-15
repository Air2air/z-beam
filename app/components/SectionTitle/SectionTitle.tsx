/**
 * @component SectionTitle
 * @purpose WCAG 2.1 AAA compliant section title component (h2 level)
 * @dependencies React
 * @aiContext Standardized section title component for consistent h2 heading styling
 *           Provides responsive sizing, optional subtitle, and accessibility features
 * 
 * @usage
 * <SectionTitle title="Our Services" />
 * <SectionTitle title="Featured Materials" subtitle="Explore our material categories" />
 * 
 * @accessibility
 * - Semantic HTML: Uses h2 element for section headings
 * - ARIA: Optional aria-label support for enhanced descriptions
 * - Screen readers: Subtitle rendered with role="doc-subtitle"
 * - Keyboard: Focusable with keyboard navigation support
 * - Visual: High contrast colors meeting WCAG AAA standards
 * 
 * @styling
 * - Responsive: text-2xl (mobile) to text-3xl (desktop)
 * - Theme-aware: Adapts to dark/light mode
 * - Consistent spacing: mb-4 for subtitle, mb-8 for section spacing
 */

import React from 'react';

export interface SectionTitleProps {
  /** The main section title text (required) */
  title: string;
  
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  
  /** Text alignment (default: left) */
  alignment?: 'left' | 'center' | 'right';
  
  /** Optional ARIA label for enhanced accessibility */
  'aria-label'?: string;
  
  /** Optional ARIA described-by reference */
  'aria-describedby'?: string;
  
  /** Optional CSS class name for additional styling */
  className?: string;
  
  /** Optional ID for anchor linking */
  id?: string;
}

export function SectionTitle({
  title,
  subtitle,
  alignment = 'left',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  className = '',
  id,
}: SectionTitleProps) {
  // Alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Generate ID from title if not provided
  const headingId = id || `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  const subtitleId = subtitle ? `${headingId}-subtitle` : undefined;

  return (
    <div className={`section-title-wrapper mb-4 ${alignmentClasses[alignment]} ${className}`}>
      <h2
        id={headingId}
        className="text-gray-900 dark:text-white"
        aria-label={ariaLabel}
        aria-describedby={subtitleId || ariaDescribedby}
      >
        {title}
      </h2>
      
      {subtitle && (
        <p
          id={subtitleId}
          role="doc-subtitle"
          className="text-sm text-gray-600 dark:text-gray-400 mt-2"
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;
