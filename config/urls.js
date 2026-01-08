/**
 * Centralized URL Configuration (CommonJS for Node.js scripts)
 * 
 * Single source of truth for all site URLs across scripts.
 * Provides environment-aware URL resolution for development and production.
 * 
 * @module config/urls
 */

/**
 * Site URL configuration object
 */
const SITE_CONFIG = {
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
   * @returns {string} Base URL for current environment
   */
  getBaseUrl() {
    if (typeof process !== 'undefined') {
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
      }
      if (process.env.BASE_URL) {
        return process.env.BASE_URL;
      }
    }
    return this.production.base;
  },
  
  /**
   * Get current API URL
   * @returns {string} API URL for current environment
   */
  getApiUrl() {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return this.production.api;
  },
  
  /**
   * Check if running in production environment
   * @returns {boolean} True if production, false otherwise
   */
  isProduction() {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  },
};

/**
 * Convenience export - Current base URL
 * @example
 * const { BASE_URL } = require('./config/urls');
 * const sitemapUrl = `${BASE_URL}/sitemap.xml`;
 */
const BASE_URL = SITE_CONFIG.getBaseUrl();

/**
 * Convenience export - Current API URL
 */
const API_URL = SITE_CONFIG.getApiUrl();

/**
 * Convenience export - Production environment check
 */
const IS_PRODUCTION = SITE_CONFIG.isProduction();

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BASE_URL instead
 */
const SITE_URL = BASE_URL;

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BASE_URL instead
 */
const TARGET_URL = BASE_URL;

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BASE_URL instead
 */
const DEFAULT_URL = BASE_URL;

module.exports = {
  SITE_CONFIG,
  BASE_URL,
  API_URL,
  IS_PRODUCTION,
  SITE_URL,
  TARGET_URL,
  DEFAULT_URL,
};
