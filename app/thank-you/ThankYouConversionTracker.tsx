'use client';

import { useEffect, useRef } from 'react';
import { trackThankYouPageConversion } from '@/app/utils/analytics';

export default function ThankYouConversionTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    if (window.top && window.top !== window.self) {
      try {
        window.top.location.href = window.location.href;
      } catch {
        window.open(window.location.href, '_top');
      }
      return;
    }

    hasTrackedRef.current = true;
    trackThankYouPageConversion();
  }, []);

  return null;
}
