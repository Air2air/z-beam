// app/components/Schedule/ScheduleCalendar.tsx
"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/app/utils/analytics";

interface WorkizWidgetProps {
  height?: string;
  className?: string;
}

export function ScheduleCalendar({ 
  height = '700px',
  className = ''
}: WorkizWidgetProps = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get Workiz booking URL from environment
  const workizUrl = process.env.NEXT_PUBLIC_WORKIZ_URL || 'https://online-booking.workiz.com/?ac=a92273bb2e08e9ada5fbf60a0243f8a863a000f6bdd5c583c0f98ae74aef35fb';

  useEffect(() => {
    // Track when users view the scheduling calendar
    trackEvent("schedule_calendar_viewed", {
      event_category: "Schedule",
      event_label: "Workiz Booking",
    });
  }, []);

  return (
    <div className={`workiz-widget-container ${className}`}>
      <iframe
        ref={iframeRef}
        src={workizUrl}
        width="100%"
        height={height}
        style={{
          border: 'none',
          display: 'block',
          minHeight: height,
        }}
        title="Workiz Booking Portal"
        loading="lazy"
        allow="geolocation; camera; microphone"
      />

      {/* Fallback for no JavaScript */}
      <noscript>
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            JavaScript is required to load the booking widget.
          </p>
          <a 
            href={workizUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Open Booking Portal →
          </a>
        </div>
      </noscript>
    </div>
  );
}
