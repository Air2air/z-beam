// app/utils/errorSystem.ts
// Unified Error Handling System - Follows GROK principles for fail-fast architecture
// Provides specific exception types with clear messages, no fallbacks in production

/**
 * Base error class for all Z-Beam specific errors
 */
export abstract class ZBeamError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'configuration' | 'validation' | 'security' | 'generation' | 'api';
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly suggestions?: string[]
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Get actionable error information for debugging
   */
  getErrorInfo() {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      context: this.context,
      suggestions: this.suggestions,
      stack: this.stack
    };
  }
}

/**
 * Configuration-related errors - fail fast on setup issues
 */
export class ConfigurationError extends ZBeamError {
  readonly code = 'CONFIG_ERROR';
  readonly category = 'configuration' as const;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      context,
      [
        'Check environment variables and configuration files',
        'Verify all required dependencies are installed',
        'Review GROK_INSTRUCTIONS.md for setup requirements'
      ]
    );
  }
}

/**
 * Validation errors - input/data validation failures
 */
export class ValidationError extends ZBeamError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation' as const;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      context,
      [
        'Validate input data format and types',
        'Check required fields are present',
        'Ensure data meets expected schema'
      ]
    );
  }
}

/**
 * Security-related errors - unsafe operations or inputs
 */
export class SecurityError extends ZBeamError {
  readonly code = 'SECURITY_ERROR';
  readonly category = 'security' as const;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      context,
      [
        'Review input for unsafe patterns',
        'Check path traversal and injection attempts',
        'Verify user permissions and access controls'
      ]
    );
  }
}

/**
 * Content generation errors - issues in content processing
 */
export class GenerationError extends ZBeamError {
  readonly code = 'GENERATION_ERROR';
  readonly category = 'generation' as const;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      context,
      [
        'Check content source files exist and are readable',
        'Verify YAML frontmatter is valid',
        'Ensure content meets processing requirements'
      ]
    );
  }
}

/**
 * API-related errors - external API or network issues
 */
export class ApiError extends ZBeamError {
  readonly code = 'API_ERROR';
  readonly category = 'api' as const;
  
  constructor(
    message: string, 
    public readonly statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      { ...context, statusCode },
      [
        'Check API endpoint availability',
        'Verify authentication credentials',
        'Review rate limiting and quotas',
        'Consider implementing retry logic for transient failures'
      ]
    );
  }
}

// =============================================================================
// VALIDATION UTILITIES (Fail-Fast Implementation)
// =============================================================================

/**
 * Validates slug parameter with security checks
 * Throws SecurityError for unsafe patterns, ValidationError for invalid format
 */
export function validateSlug(slug: unknown, context = 'slug validation'): string {
  // Type validation
  if (!slug || typeof slug !== 'string') {
    throw new ValidationError(
      `Invalid slug type: expected string, got ${typeof slug}`,
      { slug, context }
    );
  }
  
  // Security validation - prevent path traversal
  if (slug.includes('..') || slug.startsWith('/') || slug.includes('\\')) {
    throw new SecurityError(
      `Unsafe slug pattern detected: ${slug}`,
      { slug, context }
    );
  }
  
  // Format validation
  if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
    throw new ValidationError(
      `Invalid slug format: ${slug}. Only alphanumeric, hyphens, and underscores allowed`,
      { slug, context }
    );
  }
  
  // Length validation
  if (slug.length > 100) {
    throw new ValidationError(
      `Slug too long: ${slug.length} characters (max: 100)`,
      { slug: slug.substring(0, 20) + '...', length: slug.length, context }
    );
  }
  
  return slug;
}

/**
 * Validates environment configuration at startup
 * Throws ConfigurationError for missing or invalid configuration
 */
export function validateEnvironment(): void {
  const required = [
    'NODE_ENV',
    'NEXT_PUBLIC_SITE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missing.join(', ')}`,
      { missing, available: Object.keys(process.env).filter(k => k.startsWith('NEXT_')) }
    );
  }
  
  // Validate NODE_ENV
  const validEnvironments = ['development', 'production', 'test'];
  if (!validEnvironments.includes(process.env.NODE_ENV!)) {
    throw new ConfigurationError(
      `Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be one of: ${validEnvironments.join(', ')}`,
      { current: process.env.NODE_ENV, valid: validEnvironments }
    );
  }
}

/**
 * Validates that an object has required properties
 * Throws ValidationError for missing or invalid properties
 */
export function validateRequiredProperties<T extends Record<string, unknown>>(
  obj: unknown,
  requiredProps: string[],
  context = 'object validation'
): T {
  if (!obj || typeof obj !== 'object') {
    throw new ValidationError(
      `Expected object, got ${typeof obj}`,
      { type: typeof obj, context }
    );
  }
  
  const data = obj as Record<string, unknown>;
  const missing = requiredProps.filter(prop => !(prop in data) || data[prop] === undefined);
  
  if (missing.length) {
    throw new ValidationError(
      `Missing required properties: ${missing.join(', ')}`,
      { missing, available: Object.keys(data), context }
    );
  }
  
  return data as T;
}

/**
 * Validates file path security
 * Throws SecurityError for unsafe paths, ValidationError for invalid format
 */
export function validateFilePath(filePath: unknown, allowedBasePaths: string[] = []): string {
  if (!filePath || typeof filePath !== 'string') {
    throw new ValidationError(
      `Invalid file path type: expected string, got ${typeof filePath}`,
      { filePath: String(filePath) }
    );
  }
  
  // Security checks
  if (filePath.includes('..') || filePath.includes('\\')) {
    throw new SecurityError(
      `Unsafe file path pattern: ${filePath}`,
      { filePath }
    );
  }
  
  // Path traversal protection
  const normalizedPath = filePath.replace(/\/+/g, '/');
  if (normalizedPath !== filePath) {
    throw new SecurityError(
      `Path traversal attempt detected: ${filePath}`,
      { filePath, normalized: normalizedPath }
    );
  }
  
  // Base path validation if provided
  if (allowedBasePaths.length > 0) {
    const isAllowed = allowedBasePaths.some(basePath => 
      normalizedPath.startsWith(basePath)
    );
    
    if (!isAllowed) {
      throw new SecurityError(
        `File path outside allowed directories: ${filePath}`,
        { filePath, allowedPaths: allowedBasePaths }
      );
    }
  }
  
  return normalizedPath;
}

// =============================================================================
// SAFE OPERATION WRAPPER
// =============================================================================

/**
 * Wraps operations with standardized error handling
 * For API routes and critical operations - maintains fail-fast principle
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  context: string,
  options: {
    allowRetry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const { allowRetry = false, maxRetries = 3, retryDelay = 1000 } = options;
  
  let lastError: Error | undefined;
  let attempt = 0;
  
  do {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      // Don't retry validation, security, or configuration errors
      if (error instanceof ValidationError || 
          error instanceof SecurityError || 
          error instanceof ConfigurationError) {
        throw error;
      }
      
      // Don't retry if not allowed or max attempts reached
      if (!allowRetry || attempt >= maxRetries) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  } while (attempt < maxRetries);
  
  // If we get here, all retries failed
  throw new GenerationError(
    `Operation failed after ${attempt} attempts: ${lastError?.message}`,
    { context, attempts: attempt, originalError: lastError?.name }
  );
}

/**
 * Type guard to check if error is a Z-Beam error
 */
export function isZBeamError(error: unknown): error is ZBeamError {
  return error instanceof ZBeamError;
}

/**
 * Extracts actionable error information for logging/debugging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  code?: string;
  category?: string;
  context?: Record<string, unknown>;
  suggestions?: string[];
  stack?: string;
} {
  if (isZBeamError(error)) {
    return error.getErrorInfo();
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  }
  
  return {
    message: String(error)
  };
}
