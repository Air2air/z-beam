// app/utils/client-safe.ts
// Client-safe utility functions for components

import { getGridClasses, createSectionHeader, createCategoryHeader, type GridColumns, type GridGap } from './gridConfig';

// Export grid utilities from centralized location
export { getGridClasses, createSectionHeader, createCategoryHeader, type GridColumns, type GridGap };

export function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Safe string extraction with null/undefined protection
export function extractSafeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && value !== null) {
    if ('value' in value && typeof (value as any).value === 'string') {
      return (value as any).value;
    }
    
    if ('name' in value && typeof (value as any).name === 'string') {
      return (value as any).name;
    }
    
    if ('title' in value && typeof (value as any).title === 'string') {
      return (value as any).title;
    }
  }
  
  return String(value);
}

export function safeIncludes(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}