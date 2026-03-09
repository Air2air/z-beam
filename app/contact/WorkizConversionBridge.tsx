'use client';

import { useEffect } from 'react';
import { trackThankYouPageConversion } from '@/app/utils/analytics';

const TRACKED_SESSION_KEY = 'zbeam_workiz_conversion_tracked';
const SUCCESS_KEYWORDS = ['success', 'submitted', 'submission', 'thank', 'confirmation', 'complete'];

function isTrustedWorkizOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === 'sendajob.com'
      || hostname.endsWith('.sendajob.com')
      || hostname === 'workiz.com'
      || hostname.endsWith('.workiz.com');
  } catch {
    return false;
  }
}

function messageHasSubmissionSignal(data: unknown): boolean {
  if (typeof data === 'undefined' || data === null) {
    return false;
  }

  const serialized = typeof data === 'string' ? data.toLowerCase() : JSON.stringify(data).toLowerCase();
  return SUCCESS_KEYWORDS.some((keyword) => serialized.includes(keyword));
}

function trackOncePerSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (sessionStorage.getItem(TRACKED_SESSION_KEY) === '1') {
      return;
    }

    sessionStorage.setItem(TRACKED_SESSION_KEY, '1');
    trackThankYouPageConversion();
  } catch {
    // If storage is unavailable, still attempt to fire conversion.
    trackThankYouPageConversion();
  }
}

export default function WorkizConversionBridge() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedWorkizOrigin(event.origin)) {
        return;
      }

      if (!messageHasSubmissionSignal(event.data)) {
        return;
      }

      trackOncePerSession();
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
