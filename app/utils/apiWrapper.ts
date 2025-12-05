// app/utils/apiWrapper.ts
// Simple performance logging
const logPerformance = (operation: string, duration: number, context?: any) => {
  if (duration > 1000) {
    console.warn(`🐌 Performance: ${operation} took ${duration}ms`, context);
  } else {
    console.debug(`⚡ Performance: ${operation} took ${duration}ms`, context);
  }
};
// GROK-Compliant API Route Wrapper - Standardizes error handling across all API routes
// Follows fail-fast principles with comprehensive error reporting

import { NextRequest, NextResponse } from 'next/server';
import { isZBeamError, getErrorDetails, ApiError } from './errorSystem';

// Local interface for this specific API wrapper
interface ApiWrapperConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  validateInput?: boolean;
  enableCaching?: boolean;
  rateLimitMs?: number;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
  suggestions?: string[];
  timestamp: string;
  requestId?: string;
}

// Request tracking for debugging
const requestTracker = new Map<string, { startTime: number; endpoint: string }>();

/**
 * GROK-compliant API wrapper that standardizes error handling
 * No fallbacks, no silent failures - fail fast with clear messages
 */
export async function apiWrapper<T = any>(
  handler: (req: NextRequest) => Promise<T>,
  config: ApiWrapperConfig = {}
): Promise<(request: NextRequest, context?: any) => Promise<NextResponse>> {
  return async (request: NextRequest, _context?: any): Promise<NextResponse> => {
    const startTime = performance.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const endpoint = request.url.split('?')[0];
    
    // Track request for debugging
    requestTracker.set(requestId, { startTime, endpoint });
    
    try {
      // Pre-flight validation (fail-fast)
      if (config.requireAuth) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
          throw new ApiError('Authentication required', 401, { 
            requestId, 
            endpoint,
            suggestion: 'Include Authorization header with valid token'
          });
        }
      }

      // Rate limiting check (fail-fast)
      if (config.rateLimitMs) {
        const lastRequest = requestTracker.get(`${endpoint}_last`);
        if (lastRequest && (Date.now() - lastRequest.startTime) < config.rateLimitMs) {
          throw new ApiError('Rate limit exceeded', 429, {
            requestId,
            endpoint,
            rateLimitMs: config.rateLimitMs,
            suggestion: `Wait ${config.rateLimitMs}ms between requests`
          });
        }
        requestTracker.set(`${endpoint}_last`, { startTime: Date.now(), endpoint });
      }

      // Execute handler
      const result = await handler(request);
      const responseTime = performance.now() - startTime;

      // Log successful request
      logPerformance(`API Success: ${endpoint}`, responseTime, {
        requestId,
        method: request.method,
        statusCode: 200
      });

      // Clean up tracking
      requestTracker.delete(requestId);

      // Standardized success response
      const response: ApiResponse<T> = {
        data: result,
        timestamp: new Date().toISOString(),
        requestId
      };

      const headers: Record<string, string> = {
        'X-Request-ID': requestId,
        'X-Response-Time': `${responseTime.toFixed(2)}ms`
      };

      // Add caching headers if enabled
      if (config.enableCaching) {
        headers['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=60';
      }

      return NextResponse.json(response, {
        status: 200,
        headers
      });

    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      // Handle Z-Beam specific errors
      if (isZBeamError(error)) {
        const errorDetails = getErrorDetails(error);
        
        console.error(`API Error: ${endpoint}`, error, {
          requestId,
          method: request.method,
          responseTime,
          errorCode: errorDetails.code,
          errorCategory: errorDetails.category
        });

        const errorResponse: ApiResponse = {
          error: errorDetails.message,
          code: errorDetails.code || 'UNKNOWN_ERROR',
          suggestions: [
            ...(errorDetails.suggestions || []),
            `Request ID: ${requestId} for debugging`
          ],
          timestamp: new Date().toISOString(),
          requestId
        };

        // Get status code from ApiError if available
        const statusCode = (error as any).statusCode || 500;

        return NextResponse.json(errorResponse, {
          status: statusCode,
          headers: {
            'X-Request-ID': requestId,
            'X-Error-Code': errorDetails.code || 'UNKNOWN_ERROR',
            'X-Response-Time': `${responseTime.toFixed(2)}ms`
          }
        });
      }

      // Handle API-specific errors
      if (error instanceof ApiError) {
        console.error(`API Error: ${endpoint}`, error, {
          requestId,
          method: request.method,
          responseTime,
          statusCode: error.statusCode
        });

        const errorResponse: ApiResponse = {
          error: error.message,
          code: error.code,
          suggestions: [
            'Check API documentation for proper request format',
            'Verify all required parameters are provided',
            `Request ID: ${requestId} for debugging`
          ],
          timestamp: new Date().toISOString(),
          requestId
        };

        return NextResponse.json(errorResponse, {
          status: error.statusCode || 500,
          headers: {
            'X-Request-ID': requestId,
            'X-Error-Code': error.code,
            'X-Response-Time': `${responseTime.toFixed(2)}ms`
          }
        });
      }

      // Handle unexpected errors (fail-fast with full context)
      const unexpectedError = new ApiError(
        `Unexpected API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        {
          requestId,
          endpoint,
          method: request.method,
          originalError: error instanceof Error ? error.stack : String(error)
        }
      );

      console.error(`Unexpected API Error: ${endpoint}`, unexpectedError, {
        requestId,
        method: request.method,
        responseTime,
        originalError: error
      });

      const errorResponse: ApiResponse = {
        error: unexpectedError.message,
        code: unexpectedError.code,
        suggestions: [
          'This appears to be an unexpected system error',
          'Please check server logs for more details',
          'Contact support if the issue persists',
          `Request ID: ${requestId} for debugging`
        ],
        timestamp: new Date().toISOString(),
        requestId
      };

      return NextResponse.json(errorResponse, {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Error-Code': unexpectedError.code,
          'X-Response-Time': `${responseTime.toFixed(2)}ms`
        }
      });
    } finally {
      // Always clean up tracking
      requestTracker.delete(requestId);
      
      // Clean up old rate limit entries (prevent memory leaks)
      if (requestTracker.size > 1000) {
        const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes
        for (const [key, value] of requestTracker.entries()) {
          if (value.startTime < cutoff) {
            requestTracker.delete(key);
          }
        }
      }
    }
  };
}

// Utility function for request tracking analysis
export function getApiMetrics(): {
  activeRequests: number;
  trackedEndpoints: string[];
  oldestRequest?: { endpoint: string; age: number };
} {
  const now = Date.now();
  const endpoints = new Set<string>();
  let oldestRequest: { endpoint: string; age: number } | undefined;

  for (const [key, value] of requestTracker.entries()) {
    if (!key.includes('_last')) {
      endpoints.add(value.endpoint);
      const age = now - value.startTime;
      
      if (!oldestRequest || age > oldestRequest.age) {
        oldestRequest = { endpoint: value.endpoint, age };
      }
    }
  }

  return {
    activeRequests: Array.from(requestTracker.keys()).filter(k => !k.includes('_last')).length,
    trackedEndpoints: Array.from(endpoints),
    oldestRequest
  };
}
