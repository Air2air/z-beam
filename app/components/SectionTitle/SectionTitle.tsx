"use client";

import React from 'react';
import { SECTION_HEADER_CLASSES } from '@/app/config/site';
import { renderMarkdown } from '@/app/utils/markdown';

export interface SectionTitleProps {
  title: string;
  alignment?: 'left' | 'center' | 'right';
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
  id?: string;
  icon?: React.ReactNode;
  sectionDescription?: string;
}

export function SectionTitle({
  title,
  alignment = 'left',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  className = '',
  id,
  icon,
  sectionDescription,
}: SectionTitleProps) {
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Remove parentheses, brackets, and special chars from chemical formulas before generating ID
  const headingId = id ?? `section-${title.toLowerCase().replace(/[()[\]]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;


  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className={`flex-1 ${alignmentClasses[alignment]}`}>
        <h2
          id={headingId}
          className={`${SECTION_HEADER_CLASSES.title} flex items-center`}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
        >
          {icon && <span className="pr-2" aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        
        {sectionDescription && (
          <div 
            className={`text-base text-primary mt-2 prose prose-sm max-w-none ${alignmentClasses[alignment]}`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(sectionDescription) }}
          />
        )}
      </div>
    </div>
  );
}

export default SectionTitle;
