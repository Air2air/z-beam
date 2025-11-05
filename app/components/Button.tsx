// app/components/Button.tsx
import React from 'react';
import { ButtonProps } from '@/types';

// ButtonProps now imported from centralized types

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'btn inline-flex items-center justify-center rounded-lg transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Three variants matching site design:
  // 1. Primary: Orange background, white text (main CTA)
  // 2. Secondary: White background, orange text (Let's Talk style)
  // 3. Outline: Border only, no fill (Dataset downloader style)
  const variantClasses = {
    primary: 'bg-brand-orange text-white hover:bg-orange-600 focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03]',
    secondary: 'bg-white text-brand-orange hover:bg-gray-100 focus-visible:ring-white focus-visible:ring-offset-brand-orange shadow-lg hover:shadow-xl transform hover:scale-[1.03]',
    outline: 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-orange dark:hover:border-brand-orange hover:text-brand-orange dark:hover:text-brand-orange focus-visible:ring-brand-orange focus-visible:ring-offset-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl',
    minimal: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline focus-visible:ring-blue-500 shadow-none hover:shadow-none transform-none hover:scale-100'
  };
  
  // Updated sizes to match ContactButton with minimum touch targets
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs sm:text-sm min-h-[36px]',
    md: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm md:text-base min-h-[44px]',
    lg: 'px-4 py-3 sm:px-6 sm:py-3 text-base lg:text-lg min-h-[48px]'
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}
