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
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm'
  };
  
  const combinedClasses = `${baseClasses} ${levelClasses[level]} ${className}`.trim();
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <header className="mb-8 mt-6">
      <Tag className={combinedClasses}>
        {children}
      </Tag>
      {subtitle && (
        <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
          {subtitle}
        </p>
      )}
    </header>
  );
}
