// Server Component - no client-side interactivity
import React from 'react';
import type { BadgeProps } from '@/types';

export function Badge({ 
  text,
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const variantClasses: Record<string, string> = {
    primary: 'bg-orange-100 text-orange-800300',
    secondary: 'bg-gray-100 text-muted',
    success: 'bg-green-100 text-green-800300',
    warning: 'bg-yellow-100 text-yellow-800300',
    danger: 'bg-red-100 text-red-800300',
    info: 'bg-cyan-100 text-cyan-800300',
    outline: 'border border-gray-300 text-gray-700',
    subtle: 'bg-gray-50 text-gray-600',
    solid: 'bg-gray-800 text-white',
    card: 'bg-white border border-gray-200 text-gray-800',
  };
  
  const sizeClasses: Record<string, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
    xl: 'text-lg px-4 py-2',
  };
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {children || text}
    </span>
  );
}
