// app/utils/validation.ts
// Validation utilities for forms and data

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validates a required field (not empty)
 */
export function isRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validates minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Validates maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Validates if value is a positive number
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Validates if value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates a slug format (lowercase, alphanumeric, hyphens)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Form validation helper type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation schema type
 */
export type ValidationRule = (value: any) => string | null;

/**
 * Runs multiple validation rules on a value
 */
export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  
  for (const rule of rules) {
    const error = rule(value);
    if (error) {
      errors.push(error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Common validation rule creators
 */
export const ValidationRules = {
  required: (fieldName: string): ValidationRule => 
    (value) => isRequired(value) ? null : `${fieldName} is required`,
  
  email: (): ValidationRule =>
    (value) => isValidEmail(value) ? null : 'Please enter a valid email address',
  
  minLength: (min: number, fieldName: string): ValidationRule =>
    (value) => hasMinLength(value, min) ? null : `${fieldName} must be at least ${min} characters`,
  
  maxLength: (max: number, fieldName: string): ValidationRule =>
    (value) => hasMaxLength(value, max) ? null : `${fieldName} must be no more than ${max} characters`,
  
  positiveNumber: (fieldName: string): ValidationRule =>
    (value) => isPositiveNumber(value) ? null : `${fieldName} must be a positive number`,
  
  range: (min: number, max: number, fieldName: string): ValidationRule =>
    (value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return isInRange(num, min, max) ? null : `${fieldName} must be between ${min} and ${max}`;
    },
};
