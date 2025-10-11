// app/api/health/route.ts
// Health check endpoint with GROK-compliant error handling demonstration
import { NextRequest, NextResponse } from 'next/server';
import { validateEnvironment, ConfigurationError, isZBeamError, getErrorDetails } from '../../utils/errorSystem';
import { logger } from '../../utils/logger';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Demonstrate fail-fast validation
    validateEnvironment();
    
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        environment: 'pass',
        filesystem: 'pass',
        memory: 'pass'
      }
    };
    
    // Check filesystem access
    try {
      const fs = require('fs');
      fs.accessSync(process.cwd(), fs.constants.R_OK);
    } catch (error) {
      healthStatus.checks.filesystem = 'fail';
      healthStatus.status = 'degraded';
    }
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    if (memUsageMB > 500) { // 500MB threshold
      healthStatus.checks.memory = 'warn';
      healthStatus.status = 'degraded';
    }
    
    const duration = Date.now() - startTime;
    logger.performance('health-check', duration, { status: healthStatus.status });
    
    return NextResponse.json(healthStatus);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Demonstrate enhanced error handling
    if (isZBeamError(error)) {
      const errorDetails = getErrorDetails(error);
      logger.error('Health check failed', { error, duration });
      
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: {
            code: errorDetails.code,
            category: errorDetails.category,
            message: errorDetails.message,
            suggestions: errorDetails.suggestions
          }
        },
        { status: 500 }
      );
    }
    
    // Fallback for unexpected errors
    logger.error('Unexpected health check error', { error, duration });
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred during health check'
        }
      },
      { status: 500 }
    );
  }
}
