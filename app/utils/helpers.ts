// app/utils/helpers.ts
// Common helper functions for React components and app logic

import { ComponentVariant, ComponentSize } from '../../types/core';

/**
 * Combines multiple class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Creates CSS class string based on variant and size
 */
export function getVariantClasses(
  variant: ComponentVariant = 'primary',
  size: ComponentSize = 'md'
): string {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return cn(variantClasses[variant], sizeClasses[size]);
}

/**
 * Generates a consistent image alt text for materials
 */
export function generateMaterialAltText(
  materialName: string,
  context: 'hero' | 'thumbnail' | 'card' = 'card'
): string {
  const contextMap = {
    hero: `Hero image of ${materialName} laser cleaning process`,
    thumbnail: `Thumbnail showing ${materialName} laser cleaning`,
    card: `${materialName} laser cleaning material card`,
  };

  return contextMap[context];
}

/**
 * Safely access nested object properties
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }

  return result ?? defaultValue;
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: unknown[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: unknown[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Creates a delay function for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generates a unique ID for components
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Converts a file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Gets the contrast ratio for accessibility
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  // Simplified contrast ratio calculation
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}
