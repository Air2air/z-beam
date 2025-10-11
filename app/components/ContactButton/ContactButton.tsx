// app/components/ContactButton/ContactButton.tsx
// Reusable Contact button component extracted from CTA

'use client';

import Link from 'next/link';
import { ContactButtonProps } from '@/types';
import { SITE_CONFIG } from '@/app/config';

/**
 * ContactButton - Reusable button for navigating to contact page
 * 
 * @param variant - Visual style: 'primary' (CTA - white on orange), 'inverted' (Title - orange on white), 'secondary' (blue), 'minimal' (simple)
 * @param size - Button size: 'sm', 'md', 'lg'
 * @param showIcon - Whether to display the arrow icon
 * @param className - Additional CSS classes
 * @param fullWidth - Whether button should take full width
 */
export function ContactButton({
  variant = 'primary',
  size = 'md',
  showIcon = true,
  className = '',
  fullWidth = false,
  children = SITE_CONFIG.cta.buttonText,
  'aria-label': ariaLabel = 'Go to contact form page',
}: ContactButtonProps) {
  
  // Variant styles - primary matches exact CTA button styling
  const variantClasses = {
    primary: 'bg-white text-brand-orange hover:bg-gray-100 focus:ring-white focus:ring-offset-brand-orange shadow-lg hover:shadow-xl transform hover:scale-105',
    inverted: 'bg-brand-orange text-white hover:bg-orange-600 focus:ring-brand-orange focus:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-900',
    minimal: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500',
  };
  
  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm min-h-[36px]',
    md: 'px-4 py-2 sm:px-6 sm:py-2.5 text-sm md:text-base min-h-[44px]',
    lg: 'px-6 py-3 sm:px-8 sm:py-3 text-base lg:text-lg min-h-[48px]',
  };
  
  // Icon size based on button size
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4 md:w-5 md:h-5',
    lg: 'w-5 h-5 md:w-6 md:h-6',
  };
  
  // Base classes
  const baseClasses = 'btn inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Combine all classes
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <Link
      href="/contact"
      className={combinedClasses}
      aria-label={ariaLabel}
    >
      {children}
      {showIcon && (
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
      )}
    </Link>
  );
}

export default ContactButton;
