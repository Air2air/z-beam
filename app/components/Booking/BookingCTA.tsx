// app/components/Booking/BookingCTA.tsx
'use client';

import Link from 'next/link';
import { FiCalendar } from 'react-icons/fi';
import { trackEvent } from '@/app/utils/analytics';

interface BookingCTAProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function BookingCTA({ variant = 'default', className = '' }: BookingCTAProps) {
  const handleClick = () => {
    trackEvent('booking_cta_clicked', {
      event_category: 'Booking',
      event_label: 'CTA Click',
      variant,
    });
  };

  if (variant === 'compact') {
    return (
      <Link
        href="/booking"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${className}`}
      >
        <FiCalendar className="w-5 h-5" />
        Book Consultation
      </Link>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center ${className}`}>
      <FiCalendar className="w-12 h-12 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2">
        Ready to Get Started?
      </h3>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Book a free 30-minute consultation with our laser cleaning experts. 
        Get personalized recommendations for your specific application.
      </p>
      <Link
        href="/booking"
        onClick={handleClick}
        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
      >
        Schedule Your Consultation
      </Link>
    </div>
  );
}
