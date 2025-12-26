import React from 'react';
import { Button } from '../Button';
import type { SectionContainerBaseProps } from '@/types/centralized';

interface SectionContainerProps extends SectionContainerBaseProps {
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
}: SectionContainerProps) {
  const sectionId = title ? title.toLowerCase().replace(/\s+/g, '-') : 'section';
  
  const variantClasses = {
    default: 'py-3 sm:py-4',
    dark: 'bg-gradient-to-br from-gray-800 to-gray-700 rounded-md px-4 md:px-5 py-4 md:py-5 mb-6 sm:mb-8',
  };
  
  return (
    <section
      className={`${variantClasses[variant]} ${className}`.trim()}
      aria-labelledby={title ? `section-${sectionId}` : undefined}
    >
      {title && (
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            {icon}
            <h2 id={`section-${sectionId}`} className="text-xl font-semibold">
              {title}
            </h2>
          </div>
          {actionText && actionUrl && (
            <Button variant="primary" size="md" href={actionUrl} showIcon>
              {actionText}
            </Button>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default SectionContainer;
