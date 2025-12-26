import React from 'react';
import { Button } from '../Button';
import type { SectionContainerProps } from '@/types/centralized';

export function SectionContainer({
  title,
  description,
  bgColor = 'transparent',
  horizPadding = false,
  radius = false,
  icon,
  action,
  actionText,
  actionUrl,
  className = '',
  variant = 'default',
  children,
}: SectionContainerProps) {
  const sectionId = title ? title.toLowerCase().replace(/\s+/g, '-') : 'section';
  
  // Support legacy actionText/actionUrl props
  const finalAction = action || (actionText && actionUrl ? (
    <Button variant="primary" size="md" href={actionUrl} showIcon>
      {actionText}
    </Button>
  ) : null);
  
  // Handle variant-based styling
  if (variant === 'dark') {
    return (
      <section
        className={`bg-gradient-to-br from-gray-800 to-gray-700 rounded-md px-4 md:px-5 py-4 md:py-5 mb-6 sm:mb-8 ${className}`.trim()}
        aria-labelledby={title ? `section-${sectionId}` : undefined}
      >
        {title && (
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              {icon}
              <div>
                <h2 id={`section-${sectionId}`} className="text-xl font-semibold">
                  {title}
                </h2>
                {description && <p className="text-sm text-gray-300 mt-1">{description}</p>}
              </div>
            </div>
            {finalAction}
          </div>
        )}
        {children}
      </section>
    );
  }
  
  // Map bgColor to Tailwind classes
  const bgColorClasses = {
    transparent: '',
    default: 'bg-white',
    body: 'bg-gray-50',
    'gray-50': 'bg-gray-50',
    'gray-100': 'bg-gray-100',
    'gradient-dark': 'bg-gradient-to-br from-gray-800 to-gray-700',
  };
  
  const bgClass = bgColorClasses[bgColor] || '';
  const paddingClass = horizPadding ? 'px-4 md:px-5' : '';
  const radiusClass = radius ? 'rounded-md' : '';
  const baseClass = 'py-3 sm:py-4';
  
  return (
    <section
      className={`${baseClass} ${bgClass} ${paddingClass} ${radiusClass} ${className}`.trim()}
      aria-labelledby={title ? `section-${sectionId}` : undefined}
    >
      {title && (
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h2 id={`section-${sectionId}`} className="text-xl font-semibold">
                {title}
              </h2>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
          </div>
          {finalAction}
        </div>
      )}
      {children}
    </section>
  );
}

export default SectionContainer;
