// app/components/Schedule/ScheduleCTA.tsx
'use client';

import Link from 'next/link';
import { CalendarIcon } from '@/app/components/Buttons';
import { trackEvent } from '@/app/utils/analytics';

interface ScheduleCTAProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function BookingCTA({ variant = 'default', className = '' }: ScheduleCTAProps) {
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
        href="/schedule"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors ${className}`}
      >
        <CalendarIcon className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
        Schedule Service
      </Link>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-800 rounded-md p-8 text-center ${className}`}>
      <CalendarIcon className="w-12 h-12 sm:w-8 sm:h-8 mx-auto mb-4" />
      <h3 className="text-2xl text-secondary font-bold mb-2">
        Ready to Get Started?
      </h3>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Schedule a consultation or service appointment with our laser cleaning experts. 
        Get personalized recommendations for your specific application.
      </p>
      <Link
        href="/schedule"
        onClick={handleClick}
        className="inline-block bg-white text-orange-600 px-8 py-3 rounded-md font-semibold hover:bg-orange-50 transition-colors"
      >
        Schedule Appointment
      </Link>
    </div>
  );
}
