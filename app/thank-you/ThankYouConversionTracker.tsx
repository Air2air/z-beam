'use client';

import { useEffect, useRef } from 'react';
import { trackThankYouPageConversion } from '@/app/utils/analytics';

export default function ThankYouConversionTracker() {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    trackThankYouPageConversion();
  }, []);

  return null;
}
