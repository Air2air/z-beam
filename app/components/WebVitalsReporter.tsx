// app/components/WebVitalsReporter.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '../web-vitals';

/**
 * Web Vitals Reporter Component
 * 
 * This component initializes Core Web Vitals reporting when mounted.
 * Must be a client component to access browser APIs.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize web vitals reporting once on mount
    reportWebVitals();
  }, []);

  // This component doesn't render anything
  return null;
}
