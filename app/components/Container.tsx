// app/components/Container.tsx
// Optimized reusable container - addresses specific card violations
// Replaces patterns: container styling for white backgrounds with shadows

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  sticky?: boolean;
  as?: 'div' | 'section' | 'article';
}

/**
 * Container Component
 * 
 * OPTIMIZATION-FIRST APPROACH:
 * - Addresses specific card violation patterns identified by enforcement
 * - Reuses existing AuthorCard styling principles
 * - Minimal, focused component that doesn't duplicate existing card functionality
 * - Specifically targets container patterns with white backgrounds and shadows
 */
export function Container({
  children,
  className = '',
  padding = 'md',
  shadow = 'lg',
  sticky = false,
  as: Component = 'div'
}: ContainerProps) {
  
  // Base styles consistent with existing card components
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700';
  
  // Padding variants (targeting the p-6 violations)
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',  // Most common violation pattern
    lg: 'p-8'
  };
  
  // Shadow variants (targeting shadow-lg violations)  
  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg' // Most common violation pattern
  };
  
  // Sticky positioning for search filters etc.
  const stickyStyles = sticky ? 'sticky top-8' : '';
  
  const combinedStyles = `${baseStyles} ${paddingStyles[padding]} ${shadowStyles[shadow]} ${stickyStyles} ${className}`;
  
  return (
    <Component className={combinedStyles}>
      {children}
    </Component>
  );
}
