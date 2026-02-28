/**
 * Centralized Environment Variable Configuration
 * 
 * This file provides type-safe access to all environment variables
 * with validation and sensible defaults.
 * 
 * @module config/env
 */

/**
 * Environment configuration object with type safety
 */
export const ENV = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Base URL configuration
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.z-beam.com',
  
  // Google Analytics
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '',
  GOOGLE_ADS_THANK_YOU_CONVERSION_LABEL:
    process.env.NEXT_PUBLIC_GOOGLE_ADS_THANK_YOU_CONVERSION_LABEL || '',
  
  // Email configuration (server-side only)
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  
  // Optional configuration
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  LOG_LEVEL: process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' | undefined,
  
  // Build-time configuration
  NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION || 'unknown',
} as const;

/**
 * Validate environment variables at startup
 * Throws errors for missing required variables in production
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  
  // Production-only validations
  if (ENV.NODE_ENV === 'production') {
    if (!ENV.GMAIL_USER) {
      errors.push('Missing required environment variable: GMAIL_USER');
    }
    if (!ENV.GMAIL_APP_PASSWORD) {
      errors.push('Missing required environment variable: GMAIL_APP_PASSWORD');
    }
    if (!ENV.BASE_URL || ENV.BASE_URL === 'https://www.z-beam.com') {
      // Already set to production URL, this is fine
    }
  }
  
  // Port validation
  if (ENV.PORT !== undefined && (ENV.PORT < 1 || ENV.PORT > 65535)) {
    errors.push(`Invalid PORT value: ${ENV.PORT}. Must be between 1 and 65535.`);
  }
  
  // Log level validation
  if (ENV.LOG_LEVEL && !['debug', 'info', 'warn', 'error'].includes(ENV.LOG_LEVEL)) {
    errors.push(`Invalid LOG_LEVEL value: ${ENV.LOG_LEVEL}. Must be one of: debug, info, warn, error.`);
  }
  
  // Throw if there are validation errors
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Check if running in production environment
 */
export const isProduction = (): boolean => ENV.NODE_ENV === 'production';

/**
 * Check if running in development environment
 */
export const isDevelopment = (): boolean => ENV.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = (): boolean => ENV.NODE_ENV === 'test';

/**
 * Get the current environment name
 */
export const getEnvironment = (): string => ENV.NODE_ENV;

// Auto-validate on import (can be disabled in tests)
if (typeof window === 'undefined' && !isTest()) {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('Environment validation error:', error);
    // Don't throw in development to allow for easier local setup
    if (isProduction()) {
      throw error;
    }
  }
}
