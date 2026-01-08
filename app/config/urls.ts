/**
 * Centralized URL Configuration
 * 
 * Single source of truth for all site URLs across the application.
 * Provides environment-aware URL resolution for development and production.
 * 
 * @module urls
 */

/**
 * Site URL configuration object
 */
export const SITE_CONFIG = {
  // Production URLs
  production: {
    base: 'https://www.z-beam.com',
    www: 'https://www.z-beam.com',
    api: 'https://www.z-beam.com/api',
  },
  
  // Development URLs
  development: {
    base: 'http://localhost:3000',
    www: 'http://localhost:3000',
    api: 'http://localhost:3000/api',
  },
  
  /**
   * Get current base URL (with environment fallback)
   * @returns Base URL for current environment
   */
  getBaseUrl(): string {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (typeof process !== 'undefined' && process.env.BASE_URL) {
      return process.env.BASE_URL;
    }
    return this.production.base;
  },
  
  /**
   * Get current API URL
   * @returns API URL for current environment
   */
  getApiUrl(): string {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return this.production.api;
  },
  
  /**
   * Check if running in production environment
   * @returns True if production, false otherwise
   */
  isProduction(): boolean {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  },
} as const;

/**
 * Convenience export - Current base URL
 * @example
 * import { BASE_URL } from '@/app/config/urls';
 * const sitemapUrl = `${BASE_URL}/sitemap.xml`;
 */
export const BASE_URL = SITE_CONFIG.getBaseUrl();

/**
 * Convenience export - Current API URL
 */
export const API_URL = SITE_CONFIG.getApiUrl();

/**
 * Convenience export - Production environment check
 */
export const IS_PRODUCTION = SITE_CONFIG.isProduction();

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BASE_URL instead
 */
export const SITE_URL = BASE_URL;

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BASE_URL instead
 */
export const TARGET_URL = BASE_URL;

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BASE_URL instead
 */
export const DEFAULT_URL = BASE_URL;
