// app/components/Title/Title.tsx
import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  subtitle?: string;
}

export function Title({ 
  children, 
  level = 1, 
  className = '',
  subtitle 
}: TitleProps) {
  const baseClasses = 'font-bold text-gray-900 dark:text-white mb-4';
  
  const levelClasses = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base'
  };
  
  const combinedClasses = `${baseClasses} ${levelClasses[level]} ${className}`.trim();
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <header className="mb-8">
      <Tag className={combinedClasses}>
        {children}
      </Tag>
      {subtitle && (
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          {subtitle}
        </p>
      )}
    </header>
  );
}
