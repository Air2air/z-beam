"use client";

import React from 'react';
import { SECTION_HEADER_CLASSES } from '@/app/config/site';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
  id?: string;
  icon?: React.ReactNode;
  description?: string;
}

export function SectionTitle({
  title,
  subtitle,
  alignment = 'left',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  className = '',
  id,
  icon,
  description,
}: SectionTitleProps) {
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Remove parentheses, brackets, and special chars from chemical formulas before generating ID
  const headingId = id || `section-${title.toLowerCase().replace(/[()[\]]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  const subtitleId = subtitle ? `${headingId}-subtitle` : undefined;

  return (
    <div className={`flex items-center justify-between gap-4 mb-6 ${className}`}>
      <div className={`flex-1 ${alignmentClasses[alignment]}`}>
        <h2
          id={headingId}
          className={`${SECTION_HEADER_CLASSES.title} flex items-center gap-2`}
          aria-label={ariaLabel}
          aria-describedby={subtitleId || ariaDescribedby}
        >
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        
        {subtitle && (
          <p id={subtitleId} className={`text-sm text-muted mt-2 ${alignmentClasses[alignment]}`} role="doc-subtitle">
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className={`text-base text-primary mt-2 ${alignmentClasses[alignment]}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default SectionTitle;
