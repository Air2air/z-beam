// app/web-vitals.ts
'use client';

import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';

/**
 * Core Web Vitals Reporter
 * 
 * This sends CWV metrics to Google Analytics 4, which makes them visible in:
 * - Google Search Console (Core Web Vitals report)
 * - Google Analytics (Events)
 * 
 * Key Metrics:
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Interactivity (replaces FID)
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response
 * 
 * Note: FID (First Input Delay) was deprecated in March 2024 and replaced by INP
 */

function sendToGoogleAnalytics({ name, delta, value, id, rating }: Metric) {
  // Check if gtag is available (Google Analytics)
  if (typeof window !== 'undefined' && window.gtag) {
    // Send to GA4 as an event
    window.gtag('event', name, {
      value: delta, // Use delta to track changes between reports
      metric_id: id, // Unique ID for this metric instance
      metric_value: value, // Actual metric value
      metric_rating: rating, // 'good', 'needs-improvement', or 'poor'
      // Debug info (optional, comment out in production)
      metric_delta: delta,
      metric_name: name,
    });

    // Also send to GA4's web vitals dimension (if configured)
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: name,
      value: Math.round(name === 'CLS' ? value * 1000 : value), // CLS is a score, multiply by 1000
      non_interaction: true,
    });
  }

  // Optional: Send to your own analytics endpoint
  // navigator.sendBeacon('/api/analytics', JSON.stringify({ name, delta, value, id, rating }));

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1),
      rating,
      delta,
      id,
    });
  }
}

/**
 * Report all Core Web Vitals to Google Analytics
 * Call this function once when your app loads
 */
export function reportWebVitals() {
  // Core Web Vitals (required for Search Console)
  onLCP(sendToGoogleAnalytics);   // Loading (target: < 2.5s)
  onINP(sendToGoogleAnalytics);   // Interactivity (target: < 200ms) - Replaced FID in March 2024
  onCLS(sendToGoogleAnalytics);   // Visual Stability (target: < 0.1)

  // Additional helpful metrics (not Core Web Vitals)
  onFCP(sendToGoogleAnalytics);   // First Contentful Paint (target: < 1.8s)
  onTTFB(sendToGoogleAnalytics);  // Time to First Byte (target: < 800ms)
}
