// app/components/Title/Title.tsx
import React from 'react';
import { TitleProps } from '@/types';

export function Title({ 
  children, 
  frontmatter,
  level = 1, 
  className = '',
  subtitle,
  title
}: TitleProps) {
  const baseClasses = 'font-bold text-gray-900 dark:text-white mb-4';
  
  const levelClasses = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm'
  };
  
  const combinedClasses = `${baseClasses} ${levelClasses[level]} ${className}`.trim();
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Frontmatter-first approach: prioritize frontmatter.title
  const displayTitle = frontmatter?.title || title || children || 'Article';
  const displaySubtitle = frontmatter?.description || subtitle;

  return (
    <header className="mb-8 mt-6">
      <Tag className={combinedClasses}>
        {String(displayTitle)}
      </Tag>
      {displaySubtitle && (
        <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
          {String(displaySubtitle)}
        </p>
      )}
    </header>
  );
}
