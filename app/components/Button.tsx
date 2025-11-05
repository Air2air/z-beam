// app/components/Button.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ButtonProps } from '@/types';

// Unified Button component with Link support

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  href,
  showIcon = false,
  fullWidth = false,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
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
  
  // Fixed sizes for consistency - no responsive variations
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  };
  
  // Icon size based on button size
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Icon component for links
  const Icon = showIcon && href ? (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      className={`ml-2 ${iconSizeClasses[size]}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ) : null;
  
  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        aria-label={ariaLabel}
      >
        {children}
        {Icon}
      </Link>
    );
  }
  
  // Render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
