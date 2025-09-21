/**
 * Validation Utility Functions
 * For validating content structure and data
 */

import { ValidationResult, ContentStructure, ImageMetadata } from '@/types';

export function validateContentStructure(content: ContentStructure): ValidationResult {
  const errors: string[] = [];
  
  if (!content || !content.title || !content.title.trim()) {
    errors.push('Title is required');
  }
  
  if (!content || !content.slug || !content.slug.trim()) {
    errors.push('Slug is required');
  }
  
  if (content?.slug && content.slug.trim() && !/^[a-z0-9-]+$/.test(content.slug.trim())) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateImageMetadata(metadata: ImageMetadata): ValidationResult {
  const errors: string[] = [];
  
  if (!metadata || !metadata.alt || !metadata.alt.trim()) {
    errors.push('Alt text is required');
  }
  
  if (!metadata || !metadata.src || !metadata.src.trim()) {
    errors.push('Image source is required');
  }
  
  if (metadata?.width && typeof metadata.width !== 'number') {
    errors.push('Width must be a number');
  }
  
  if (metadata?.height && typeof metadata.height !== 'number') {
    errors.push('Height must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
