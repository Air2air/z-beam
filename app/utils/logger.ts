// app/utils/logger.ts
// Enhanced centralized logging utility with GROK-compliant structured logging
// Provides actionable error information and maintains fail-fast principles

import { isZBeamError, getErrorDetails, ZBeamError } from './errorSystem';

export interface LogContext {
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    code?: string;
    category?: string;
    suggestions?: string[];
    stack?: string;
  };
  environment: string;
  request?: {
    url?: string;
    method?: string;
    userAgent?: string;
  };
}

export class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private environment = process.env.NODE_ENV || 'unknown';

  /**
   * Enhanced error logging with structured format and actionable information
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      environment: this.environment
    };

    // Enhanced error details for Z-Beam errors
    if (error) {
      const errorDetails = getErrorDetails(error);
      logEntry.error = {
        name: error instanceof Error ? error.constructor.name : 'Unknown',
        message: errorDetails.message,
        code: errorDetails.code,
        category: errorDetails.category,
        suggestions: errorDetails.suggestions,
        stack: this.isDevelopment ? errorDetails.stack : undefined // Only in dev
      };
    }

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`);
      if (isZBeamError(error)) {
        console.error('Error Details:', error.getErrorInfo());
      } else if (error) {
        console.error('Error:', error);
      }
      if (context) console.error('Context:', context);
    } else {
      // In production, send structured logs to external service
      this.sendToExternalLogger(logEntry);
    }
  }

  warn(message: string, context?: LogContext) {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      environment: this.environment
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    } else {
      this.sendToExternalLogger(logEntry);
    }
  }

  info(message: string, context?: LogContext) {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      environment: this.environment
    };

    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    } else {
      this.sendToExternalLogger(logEntry);
    }
  }

  debug(message: string, context?: LogContext) {
    // Only log debug in development
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log operation performance for monitoring
   */
  performance(operation: string, duration: number, context?: LogContext) {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Performance: ${operation} completed in ${duration}ms`,
      context: { ...context, operation, duration },
      environment: this.environment
    };

    if (this.isDevelopment && duration > 1000) {
      console.warn(`[PERF] Slow operation: ${operation} (${duration}ms)`, context);
    } else if (this.isDevelopment) {
      console.debug(`[PERF] ${operation} (${duration}ms)`, context);
    }

    // Always log performance metrics for monitoring
    this.sendToExternalLogger(logEntry);
  }

  /**
   * Log security events (always logged regardless of environment)
   */
  security(message: string, context?: LogContext) {
    const logEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: `SECURITY: ${message}`,
      context,
      environment: this.environment
    };

    // Security events are always logged and sent to external systems
    console.warn(`[SECURITY] ${message}`, context);
    this.sendToExternalLogger(logEntry);
  }

  /**
   * Send logs to external logging service in production
   */
  private sendToExternalLogger(logEntry: StructuredLogEntry) {
    // In production, implement integration with logging service
    // e.g., Sentry, LogRocket, DataDog, etc.
    if (!this.isDevelopment) {
      // Placeholder for external logging
      // console.log(JSON.stringify(logEntry));
    }
  }
}

export const logger = new Logger();

// Utility function for handling async operations with proper error logging
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error);
    return fallback;
  }
};

// Error wrapper for content loading operations
export const safeContentOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string,
  slug?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Content operation failed: ${operationName}`, error, { slug });
    return fallback;
  }
};
