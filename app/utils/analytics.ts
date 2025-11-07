/**
 * Google Analytics 4 Event Tracking Utilities
 * 
 * Provides type-safe event tracking for GA4 custom events.
 * Uses gtag.js window API injected by @next/third-parties GoogleAnalytics component.
 */

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

/**
 * Generic event tracking function
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else {
    // Log to console in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, eventParams);
    }
  }
};

/**
 * Track dataset download events
 */
export interface DatasetDownloadParams {
  format: 'json' | 'csv' | 'txt';
  category?: string;
  subcategory?: string;
  materialName?: string;
  fileSize?: number;
}

export const trackDatasetDownload = ({
  format,
  category,
  subcategory,
  materialName,
  fileSize,
}: DatasetDownloadParams) => {
  trackEvent('dataset_download', {
    event_category: 'Dataset',
    event_label: materialName || `${category}-${subcategory}`,
    format,
    category,
    subcategory,
    material_name: materialName,
    file_size: fileSize,
    value: 1, // For conversion tracking
  });
};

/**
 * Track FAQ interactions
 */
export interface FAQClickParams {
  materialName: string;
  question: string;
  questionIndex: number;
  isExpanding: boolean;
}

export const trackFAQClick = ({
  materialName,
  question,
  questionIndex,
  isExpanding,
}: FAQClickParams) => {
  trackEvent('faq_interaction', {
    event_category: 'FAQ',
    event_label: materialName,
    material_name: materialName,
    question,
    question_index: questionIndex,
    action: isExpanding ? 'expand' : 'collapse',
    value: isExpanding ? 1 : 0, // Track expansions for engagement
  });
};
