// app/utils/performanceCache.ts
// Unified Performance Cache System for Z-Beam Project
// Follows GROK principles: fail-fast, minimal changes, performance-focused

// Simple performance logging function
const logPerformance = (operation: string, duration: number, context?: any) => {
  if (duration > 1000) {
    console.warn(`🐌 Performance: ${operation} took ${duration}ms`, context);
  } else {
    console.debug(`⚡ Performance: ${operation} took ${duration}ms`, context);
  }
};

// Cache configuration
const CACHE_CONFIG = {
  // TTL in milliseconds
  badge: 30 * 60 * 1000,      // 30 minutes for badge data
  material: 60 * 60 * 1000,   // 1 hour for material data  
  file: 15 * 60 * 1000,       // 15 minutes for file content
  color: 2 * 60 * 60 * 1000,  // 2 hours for color calculations
  // Memory limits (number of entries)
  maxBadgeEntries: 1000,
  maxMaterialEntries: 500,
  maxFileEntries: 200,
  maxColorEntries: 100
};

import { CacheEntry, CacheMetrics } from '@/types';

class PerformanceCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0, 
    evictions: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    memoryUsage: 0
  };
  
  constructor(
    private name: string,
    private defaultTTL: number,
    private maxEntries: number
  ) {}

  // Set cache entry with TTL and performance tracking
  set(key: string, value: T, customTTL?: number): void {
    const startTime = performance.now();
    
    try {
      const ttl = customTTL || this.defaultTTL;
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Memory management: evict if over limit
      if (this.cache.size >= this.maxEntries) {
        this.evictLRU();
      }

      this.cache.set(key, entry);
      this.updateMetrics('set', performance.now() - startTime);
      
      logPerformance(`Cache SET: ${this.name}/${key}`, performance.now() - startTime, {
        cacheSize: this.cache.size,
        ttl: ttl,
        operation: 'set'
      });
    } catch (error) {
      console.error(`Cache SET error: ${this.name}/${key}`, error);
    }
  }

  // Get cache entry with freshness check
  get(key: string): T | null {
    const startTime = performance.now();
    this.metrics.totalRequests++;
    
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.metrics.misses++;
        this.updateMetrics('miss', performance.now() - startTime);
        return null;
      }

      // Check TTL freshness
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.metrics.evictions++;
        this.updateMetrics('expired', performance.now() - startTime);
        
        logPerformance(`Cache EXPIRED: ${this.name}/${key}`, now - entry.timestamp, {
          age: now - entry.timestamp,
          ttl: entry.ttl
        });
        return null;
      }

      // Update access tracking
      entry.accessCount++;
      entry.lastAccessed = now;
      this.metrics.hits++;
      this.updateMetrics('hit', performance.now() - startTime);
      
      return entry.data;
    } catch (error) {
      console.error(`Cache GET error: ${this.name}/${key}`, error);
      return null;
    }
  }

  // Check if key exists and is fresh
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear expired entries
  cleanup(): number {
    const startTime = performance.now();
    const now = Date.now();
    let cleaned = 0;

    // Convert iterator to array for compatibility
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logPerformance(`Cache CLEANUP: ${this.name}`, performance.now() - startTime, {
        entriesRemoved: cleaned,
        remainingEntries: this.cache.size,
        cleanupTime: performance.now() - startTime
      });
    }

    return cleaned;
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    // Convert iterator to array for compatibility
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
      
      logPerformance(`Cache LRU EVICT: ${this.name}/${oldestKey}`, Date.now() - oldestTime, {
        age: Date.now() - oldestTime,
        cacheSize: this.cache.size
      });
    }
  }

  // Update performance metrics
  private updateMetrics(operation: string, responseTime: number): void {
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
    
    this.metrics.memoryUsage = this.cache.size;
  }

  // Get cache statistics
  getMetrics(): CacheMetrics & { hitRate: number; name: string } {
    const hitRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.hits / this.metrics.totalRequests) * 100 : 0;
    
    return {
      ...this.metrics,
      hitRate,
      name: this.name
    };
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    
    logPerformance(`Cache CLEAR: ${this.name}`, 0, {
      entriesCleared: size
    });
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Global cache instances with specific types
export const badgeCache = new PerformanceCache<any>('badges', CACHE_CONFIG.badge, CACHE_CONFIG.maxBadgeEntries);
export const materialCache = new PerformanceCache<any>('materials', CACHE_CONFIG.material, CACHE_CONFIG.maxMaterialEntries);
export const fileCache = new PerformanceCache<string>('files', CACHE_CONFIG.file, CACHE_CONFIG.maxFileEntries);
export const colorCache = new PerformanceCache<string>('colors', CACHE_CONFIG.color, CACHE_CONFIG.maxColorEntries);

// Preloading strategies
class PreloadManager {
  private static commonMaterials = ['iron', 'steel', 'aluminum', 'copper', 'gold', 'silver', 'titanium'];
  private static commonElements = ['Fe', 'Al', 'Cu', 'Au', 'Ag', 'Ti', 'C', 'Si'];
  
  // Preload common materials during idle time
  static async preloadCommonMaterials(): Promise<void> {
    const startTime = performance.now();
    let loaded = 0;
    
    for (const material of this.commonMaterials) {
      try {
        // Only preload if not already cached
        if (!materialCache.has(material)) {
          // Import loadBadgeData dynamically to avoid circular imports
          const { loadBadgeData } = await import('./badgeSystem');
          const data = await loadBadgeData(material);
          if (data) {
            materialCache.set(material, data);
            loaded++;
          }
        }
      } catch (error) {
        console.error(`Preload failed for material: ${material}`, error);
      }
    }
    
    const loadTime = performance.now() - startTime;
    logPerformance('Material preloading completed', loadTime, {
      materialsLoaded: loaded,
      totalTime: loadTime,
      avgTimePerMaterial: loaded > 0 ? loadTime / loaded : 0
    });
  }

  // Intelligent preloading based on access patterns  
  static schedulePreloading(): void {
    // Preload during browser idle time
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        this.preloadCommonMaterials();
      });
    } else {
      // Fallback for environments without requestIdleCallback
      setTimeout(() => {
        this.preloadCommonMaterials();
      }, 1000);
    }
  }
}

// Cache monitoring and maintenance
class CacheMonitor {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  
  // Start automatic cleanup and monitoring
  static startMonitoring(): void {
    if (this.cleanupInterval) return;
    
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const cleaned = [
        badgeCache.cleanup(),
        materialCache.cleanup(), 
        fileCache.cleanup(),
        colorCache.cleanup()
      ].reduce((sum, count) => sum + count, 0);
      
      if (cleaned > 0) {
        logPerformance('Automatic cache cleanup completed', 0, {
          totalEntriesRemoved: cleaned
        });
      }
    }, 5 * 60 * 1000);
    
    logPerformance('Cache monitoring started', 0, {
      cleanupInterval: '5 minutes'
    });
  }
  
  // Stop monitoring
  static stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logPerformance('Cache monitoring stopped', 0);
    }
  }
  
  // Get comprehensive cache report
  static getCacheReport(): any {
    return {
      timestamp: new Date().toISOString(),
      caches: [
        badgeCache.getMetrics(),
        materialCache.getMetrics(),
        fileCache.getMetrics(),
        colorCache.getMetrics()
      ],
      totalMemoryUsage: badgeCache.size() + materialCache.size() + fileCache.size() + colorCache.size(),
      recommendations: this.getRecommendations()
    };
  }
  
  // Performance recommendations based on cache metrics
  private static getRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = [badgeCache, materialCache, fileCache, colorCache].map(cache => cache.getMetrics());
    
    report.forEach(metrics => {
      if (metrics.hitRate < 50) {
        recommendations.push(`${metrics.name} cache hit rate is low (${metrics.hitRate.toFixed(1)}%) - consider preloading or increasing TTL`);
      }
      if (metrics.evictions > metrics.hits * 0.1) {
        recommendations.push(`${metrics.name} cache has high eviction rate - consider increasing max entries`);
      }
      if (metrics.avgResponseTime > 10) {
        recommendations.push(`${metrics.name} cache response time is high (${metrics.avgResponseTime.toFixed(2)}ms) - check for memory pressure`);
      }
    });
    
    return recommendations;
  }
}

// Initialize performance monitoring
export { PreloadManager, CacheMonitor };

// Auto-start monitoring and preloading
if (typeof window !== 'undefined') {
  // Client-side initialization
  CacheMonitor.startMonitoring();
  PreloadManager.schedulePreloading();
} else {
  // Server-side initialization (lighter monitoring)
  CacheMonitor.startMonitoring();
}
