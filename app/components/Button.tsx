// app/components/Button.tsx
// Safe component creation - follows enforcement rules

import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-pressed'?: boolean;
  id?: string;
  title?: string;
}

/**
 * Button Component
 * 
 * ENFORCEMENT SAFETY:
 * - Uses variants instead of hardcoded styles
 * - Follows consistent prop patterns
 * - Designed for reusability
 * - Single source of truth for button styling
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-pressed': ariaPressed,
  id,
  title
}: ButtonProps) {
  
  // Base styles - common across all variants with enhanced focus indicators
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant styles - specific to each variant with enhanced accessibility
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400', 
    tertiary: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:text-blue-300'
  };
  
  // Size styles with larger touch targets for mobile
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm min-h-[2.25rem]', // 36px minimum height
    md: 'px-4 py-2 text-base min-h-[2.5rem]',   // 40px minimum height  
    lg: 'px-6 py-3 text-lg min-h-[3rem]'        // 48px minimum height
  };
  
  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Combine all styles
  const componentStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  
  return (
    <button
      id={id}
      className={componentStyles}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type={type}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      title={title}
    >
      {children}
    </button>
  );
}

// Export default for easier imports
export default Button;
