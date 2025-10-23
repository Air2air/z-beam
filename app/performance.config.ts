/**
 * Performance Configuration for Core Web Vitals Optimization
 * Based on: https://web.dev/articles/vitals
 */

export const PERFORMANCE_CONFIG = {
  /**
   * LCP (Largest Contentful Paint) Optimization
   * Target: < 2.5s (Good), < 4.0s (Needs Improvement)
   * 
   * Strategies:
   * - fetchPriority="high" on LCP images
   * - Preload critical resources
   * - Optimize image sizes and formats (AVIF/WebP)
   * - Remove render-blocking resources
   */
  lcp: {
    target: 2.5, // seconds
    optimizations: [
      'Hero images use fetchPriority="high"',
      'YouTube thumbnails preloaded',
      'Critical resources preconnected',
      'Image optimization enabled (AVIF/WebP)',
      'YouTube facade prevents blocking',
    ],
  },

  /**
   * INP (Interaction to Next Paint) Optimization
   * Target: < 200ms (Good), < 500ms (Needs Improvement)
   * 
   * Strategies:
   * - Code splitting with dynamic imports
   * - Debounce/throttle event handlers
   * - Optimize JavaScript execution
   * - Use React.memo for expensive components
   */
  inp: {
    target: 200, // milliseconds
    optimizations: [
      'Dynamic imports for ContactForm and ContactButton',
      'React.memo on ContactForm',
      'Lazy loading for below-fold content',
      'Optimized bundle splitting (244KB chunks)',
      'YouTube iframe loads on interaction only',
    ],
  },

  /**
   * CLS (Cumulative Layout Shift) Optimization
   * Target: < 0.1 (Good), < 0.25 (Needs Improvement)
   * 
   * Strategies:
   * - Explicit dimensions on images
   * - Aspect ratio containers
   * - Placeholder for dynamic content
   * - Font loading optimization
   */
  cls: {
    target: 0.1,
    optimizations: [
      'All images use Next.js Image with explicit sizes',
      'Hero uses aspect-[16/9] for stable layout',
      'Blur placeholders prevent layout shift',
      'Fonts preloaded with font-display: swap',
      'Skeleton states for loading content',
    ],
  },

  /**
   * Additional Performance Optimizations
   */
  additional: {
    // Image optimization
    images: {
      formats: ['image/avif', 'image/webp'],
      quality: {
        hero: 85,
        thumbnail: 75,
        icon: 90,
      },
      sizes: {
        mobile: '100vw',
        tablet: '768px',
        desktop: '1200px',
      },
    },

    // Resource hints
    preconnect: [
      'https://vercel.live',
      'https://vitals.vercel-insights.com',
      'https://img.youtube.com',
    ],
    dnsPrefetch: [
      'https://va.vercel-scripts.com',
      'https://www.youtube.com',
    ],

    // Bundle optimization
    chunks: {
      maxSize: 244000, // 244KB
      vendor: 'Split vendor bundle',
      framework: 'Separate React/Next.js',
    },

    // Caching strategy
    cache: {
      images: 'public, max-age=31536000, immutable',
      static: 'public, max-age=31536000, immutable',
      html: 'public, max-age=0, must-revalidate',
    },
  },
};

/**
 * Performance Monitoring Thresholds
 * For use with Vercel Analytics and Lighthouse
 */
export const MONITORING_THRESHOLDS = {
  lcp: {
    good: 2500,
    needsImprovement: 4000,
  },
  inp: {
    good: 200,
    needsImprovement: 500,
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  fcp: {
    good: 1800,
    needsImprovement: 3000,
  },
  ttfb: {
    good: 800,
    needsImprovement: 1800,
  },
};

/**
 * Usage:
 * 
 * import { PERFORMANCE_CONFIG } from '@/app/performance.config';
 * 
 * // In components
 * <Image
 *   fetchPriority="high"
 *   quality={PERFORMANCE_CONFIG.additional.images.quality.hero}
 *   sizes={PERFORMANCE_CONFIG.additional.images.sizes.desktop}
 * />
 */
