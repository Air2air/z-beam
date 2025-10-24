/**
 * Performance Utilities
 * Helpers for optimizing Core Web Vitals
 */

/**
 * Debounce function to reduce execution frequency
 * Useful for search inputs, scroll handlers, resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * Useful for scroll handlers that need consistent updates
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Idle Callback polyfill
 * Execute non-critical work when browser is idle
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(callback, 1);

/**
 * Cancel Idle Callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);

/**
 * Prefetch resource when browser is idle
 */
export function prefetchOnIdle(href: string) {
  if (typeof window === 'undefined') return;
  
  requestIdleCallback(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Preconnect to origin when browser is idle
 */
export function preconnectOnIdle(origin: string) {
  if (typeof window === 'undefined') return;
  
  requestIdleCallback(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get current connection type/speed
 */
export function getConnectionSpeed(): 'slow-2g' | '2g' | '3g' | '4g' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection || !connection.effectiveType) return 'unknown';
  
  return connection.effectiveType;
}

/**
 * Check if user is on slow connection
 */
export function isSlowConnection(): boolean {
  const speed = getConnectionSpeed();
  return speed === 'slow-2g' || speed === '2g';
}

/**
 * Get device memory (if available)
 */
export function getDeviceMemory(): number {
  if (typeof window === 'undefined') return 8; // Default assumption
  
  const memory = (navigator as any).deviceMemory;
  return memory || 8;
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  const memory = getDeviceMemory();
  return memory < 4;
}

/**
 * Optimize animation based on device capabilities
 */
export function shouldReduceAnimations(): boolean {
  return prefersReducedMotion() || isLowEndDevice() || isSlowConnection();
}
