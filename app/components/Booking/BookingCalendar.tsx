// app/components/Booking/BookingCalendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/app/utils/analytics';

export function BookingCalendar() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Calendly booking URL - configure in environment variables
  // Get this from: https://calendly.com/event_types/user/me
  const BOOKING_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 
    'https://calendly.com/z-beam-info/30min';

  useEffect(() => {
    // Track when users view the booking calendar
    trackEvent('booking_calendar_viewed', {
      event_category: 'Booking',
      event_label: 'Consultation',
    });
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Track successful calendar load
    trackEvent('booking_calendar_loaded', {
      event_category: 'Booking',
      event_label: 'Consultation',
    });
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted">Loading calendar...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={`${BOOKING_URL}?gv=true`}
        style={{ border: 0 }}
        width="100%"
        height="600"
        frameBorder="0"
        title="Book a Consultation"
        onLoad={handleIframeLoad}
        className="rounded-lg"
      />
      
      {/* Fallback message if calendar doesn't load */}
      <noscript>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-900 mb-4">
            JavaScript is required to use the booking calendar.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Contact Us Instead
          </a>
        </div>
      </noscript>
    </div>
  );
}
