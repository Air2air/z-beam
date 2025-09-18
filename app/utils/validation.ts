/**
 * Validation Utility Functions
 * For validating content structure and data
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ContentStructure {
  title?: string;
  slug?: string;
  content?: string;
  [key: string]: any;
}

interface ImageMetadata {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  [key: string]: any;
}

export function validateContentStructure(content: ContentStructure): ValidationResult {
  const errors: string[] = [];
  
  if (!content.title) {
    errors.push('Title is required');
  }
  
  if (!content.slug) {
    errors.push('Slug is required');
  }
  
  if (content.slug && !/^[a-z0-9-]+$/.test(content.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateImageMetadata(metadata: ImageMetadata): ValidationResult {
  const errors: string[] = [];
  
  if (!metadata.alt) {
    errors.push('Alt text is required');
  }
  
  if (!metadata.src) {
    errors.push('Image source is required');
  }
  
  if (metadata.width && typeof metadata.width !== 'number') {
    errors.push('Width must be a number');
  }
  
  if (metadata.height && typeof metadata.height !== 'number') {
    errors.push('Height must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
