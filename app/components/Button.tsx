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
  onClick
}: ButtonProps) {
  
  // Base styles - common across all variants
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200';
  
  // Variant styles - specific to each variant
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500', 
    tertiary: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Combine all styles
  const componentStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  
  return (
    <button
      className={componentStyles}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

// Export default for easier imports
export default Button;
