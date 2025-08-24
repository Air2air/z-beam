// app/utils/logger.ts
// Centralized logging utility for the application

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    // In production, you could send to external logging service
    // e.g., Sentry, LogRocket, etc.
  }

  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
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
