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
  iconLeft,
  iconRight,
  fullWidth = false,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Three variants matching site design:
  // 1. Primary: Orange background, white text (main CTA)
  // 2. Secondary: White background, orange text (Let's Talk style)
  // 3. Outline: Border only, no fill (Dataset downloader style) - uses className for colors
  const variantClasses = {
    primary: 'bg-brand-orange text-white hover:bg-brand-orange-dark focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03]',
    secondary: 'bg-white text-brand-orange hover:bg-gray-100 focus-visible:ring-white focus-visible:ring-offset-brand-orange shadow-lg hover:shadow-xl transform hover:scale-[1.03]',
    outline: 'bg-transparent text-white border border-opacity-50 hover:border-opacity-100 focus-visible:ring-2 focus-visible:ring-offset-gray-100 transition-all',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl',
    minimal: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline focus-visible:ring-blue-500 shadow-none hover:shadow-none transform-none hover:scale-100'
  };
  
  // Fixed sizes for consistency - no responsive variations
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs min-h-[32px]',
    md: 'px-2.5 py-1 text-sm min-h-[40px]',
    lg: 'px-5 py-2 text-base min-h-[48px]'
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
  
  // Default arrow icon for backward compatibility with showIcon
  const defaultArrowIcon = (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      className={iconSizeClasses[size]}
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
  );
  
  // Determine which icons to render
  // iconLeft has right padding (mr-1.5), iconRight has left padding (ml-1.5)
  const leftIcon = iconLeft ? (
    <span className={`inline-flex items-center ${iconSizeClasses[size]} mr-1.5`}>
      {iconLeft}
    </span>
  ) : null;
  
  const rightIcon = iconRight ? (
    <span className={`inline-flex items-center ${iconSizeClasses[size]} ml-1.5`}>
      {iconRight}
    </span>
  ) : showIcon && href ? (
    <span className={`inline-flex items-center ${iconSizeClasses[size]} ml-1.5`}>
      {defaultArrowIcon}
    </span>
  ) : null;
  
  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        aria-label={ariaLabel}
      >
        {leftIcon}
        {children}
        {rightIcon}
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
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
