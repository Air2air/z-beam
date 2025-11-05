// app/components/ContactButton/Button.tsx
// Reusable Button component for links and actions

'use client';

import Link from 'next/link';
import type { ButtonProps } from '@/types';

/**
 * Button - Reusable button component for links and form actions
 * 
 * @param variant - Visual style: 'primary' (white on orange), 'inverted' (orange on white), 'secondary' (blue), 'minimal' (simple)
 * @param size - Button size: 'sm', 'md', 'lg'
 * @param showIcon - Whether to display the arrow icon (for links)
 * @param className - Additional CSS classes
 * @param fullWidth - Whether button should take full width
 * @param href - If provided, renders as Link, otherwise as button
 * @param type - Button type for form submissions
 * @param disabled - Disable the button
 * @param onClick - Click handler for button elements
 */
export function Button({
  variant = 'primary',
  size = 'md',
  showIcon = true,
  className = '',
  fullWidth = false,
  children = "Let's talk",
  'aria-label': ariaLabel,
  href,
  type = 'button',
  disabled = false,
  onClick,
}: ButtonProps) {
  
  // Variant styles - primary matches exact CTA button styling
  const variantClasses = {
    primary: 'bg-white text-brand-orange hover:bg-gray-100 focus-visible:ring-white focus-visible:ring-offset-brand-orange shadow-lg hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 ease-in-out',
    inverted: 'bg-brand-orange text-white hover:bg-orange-600 focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 ease-in-out',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 focus-visible:ring-offset-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-gray-900',
    minimal: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline focus-visible:ring-blue-500',
  };
  
  // Size styles
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs sm:text-sm min-h-[36px]',
    md: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm md:text-base min-h-[44px]',
    lg: 'px-4 py-3 sm:px-6 sm:py-3 text-base lg:text-lg min-h-[48px]',
  };
  
  // Icon size based on button size
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4 md:w-5 md:h-5',
    lg: 'w-5 h-5 md:w-6 md:h-6',
  };
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  // Combine all classes
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-60 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Icon component
  const Icon = showIcon && href ? (
    <svg
      aria-hidden="true"
      role="presentation"
      focusable="false"
      className={`hidden sm:block ml-1 sm:ml-2 ${iconSizeClasses[size]}`}
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
  
  // Render as button for form submissions
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClasses}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
