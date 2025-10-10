// app/api/performance/cache/route.ts
// Performance monitoring endpoint for cache analytics
// Follows GROK principles: actionable insights, fail-fast validation

import { NextRequest, NextResponse } from 'next/server';
import { CacheMonitor } from '../../../utils/performanceCache';
import { validateEnvironment, ApiError } from '../../../utils/errorSystem';
import { logger } from '../../../utils/logger';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Validate environment for performance monitoring
    validateEnvironment();
    
    // Get comprehensive cache report
    const report = CacheMonitor.getCacheReport();
    
    // Add runtime performance data
    const performanceData = {
      ...report,
      endpoint: '/api/performance/cache',
      responseTime: performance.now() - startTime,
      timestamp: new Date().toISOString(),
      nodeMemory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    // Log performance metrics
    logger.performance('Cache performance report generated', performance.now() - startTime, {
      cacheCount: report.caches.length,
      totalMemoryUsage: report.totalMemoryUsage,
      recommendationCount: report.recommendations.length
    });
    
    return NextResponse.json(performanceData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store', // Don't cache performance data
        'X-Performance-Time': `${performance.now() - startTime}ms`
      }
    });
    
  } catch (error) {
    const apiError = error instanceof ApiError ? error : 
      new ApiError(`Performance monitoring failed: ${error}`, 500);
    
    logger.error('Cache performance monitoring error', {
      error,
      endpoint: '/api/performance/cache',
      responseTime: performance.now() - startTime
    });
    
    return NextResponse.json({
      error: apiError.message,
      code: apiError.code,
      suggestions: [
        'Check if performance cache system is properly initialized',
        'Verify cache monitoring is running',
        'Review server memory and resource availability'
      ],
      timestamp: new Date().toISOString()
    }, { 
      status: apiError.statusCode || 500,
      headers: {
        'X-Error-Code': apiError.code,
        'X-Performance-Time': `${performance.now() - startTime}ms`
      }
    });
  }
}

// Optional: Add cache control operations
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    validateEnvironment();
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'clear':
        // Clear all caches (development/testing only)
        const { badgeCache, materialCache, fileCache, colorCache } = await import('../../../utils/performanceCache');
        badgeCache.clear();
        materialCache.clear();
        fileCache.clear();
        colorCache.clear();
        
        logger.performance('All caches cleared via API', performance.now() - startTime);
        
        return NextResponse.json({
          message: 'All caches cleared successfully',
          timestamp: new Date().toISOString()
        });
        
      case 'cleanup':
        // Force cleanup of expired entries
        CacheMonitor.getCacheReport(); // This triggers cleanup internally
        
        logger.performance('Cache cleanup triggered via API', performance.now() - startTime);
        
        return NextResponse.json({
          message: 'Cache cleanup completed',
          timestamp: new Date().toISOString()
        });
        
      default:
        throw new ApiError(`Unknown action: ${action}`, 400);
    }
    
  } catch (error) {
    const apiError = error instanceof ApiError ? error : 
      new ApiError(`Cache operation failed: ${error}`, 500);
    
    logger.error('Cache operation error', {
      error,
      endpoint: '/api/performance/cache',
      method: 'POST',
      responseTime: performance.now() - startTime
    });
    
    return NextResponse.json({
      error: apiError.message,
      code: apiError.code,
      suggestions: [
        'Verify the action parameter is valid (clear, cleanup)',
        'Check cache system permissions and initialization',
        'Review request body format and content'
      ],
      timestamp: new Date().toISOString()
    }, { 
      status: apiError.statusCode || 500,
      headers: {
        'X-Error-Code': apiError.code
      }
    });
  }
}
