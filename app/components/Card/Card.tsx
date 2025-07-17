// app/components/Card.tsx
// Safe component creation - follows enforcement rules

import React from 'react';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
  href?: string; // Optional for links
  imageUrl?: string; // Optional for images
  imageAlt?: string; // Optional for image alt text
  title?: string; // Optional for card title
  description?: string; // Optional for card description
}

/**
 * Card Component
 * 
 * ENFORCEMENT SAFETY:
 * - Uses variants instead of hardcoded styles
 * - Follows consistent prop patterns
 * - Designed for reusability
 * - Single source of truth for card styling
 * 
 * Replaces hardcoded patterns like:
 * - bg-white rounded-lg shadow-lg p-6
 * - bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow
 */
export function Card({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  interactive = false,
  onClick,
  as: Component = 'div'
}: CardProps) {
  
  // Base styles - common across all variants
  const baseStyles = 'bg-white rounded-lg transition-shadow duration-300';
  
  // Variant styles - specific to each variant
  const variantStyles = {
    default: 'shadow-md',
    elevated: 'shadow-lg',
    outlined: 'border border-gray-200 shadow-sm',
    flat: 'shadow-none border border-gray-100'
  };
  
  // Size styles (padding)
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  // Interactive styles
  const interactiveStyles = interactive ? 'hover:shadow-lg cursor-pointer' : '';
  
  // Combine all styles
  const componentStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${interactiveStyles} ${className}`;
  
  return (
    <Component
      className={componentStyles}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// Export default for easier imports
export default Card;
