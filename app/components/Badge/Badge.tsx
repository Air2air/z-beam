// Server Component - no client-side interactivity
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800300',
    secondary: 'bg-gray-100 text-muted',
    success: 'bg-green-100 text-green-800300',
    warning: 'bg-yellow-100 text-yellow-800300',
    danger: 'bg-red-100 text-red-800300',
    info: 'bg-cyan-100 text-cyan-800300',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
