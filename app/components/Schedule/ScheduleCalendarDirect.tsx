// app/components/Schedule/ScheduleCalendar.tsx
"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/app/utils/analytics";

export function ScheduleCalendar() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Calendly scheduling URL - configure in environment variables
  const SCHEDULE_URL =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    "https://calendly.com/z-beam/30min";

  useEffect(() => {
    // Track when users view the scheduling calendar
    trackEvent("schedule_calendar_viewed", {
      event_category: "Schedule",
      event_label: "Consultation",
    });

    // Load Calendly widget script directly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="calendly-inline-widget-container">
      <div 
        className="calendly-inline-widget"
        data-url={SCHEDULE_URL}
        style={{
          minWidth: '320px',
          height: '700px',
        }}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-[700px]">
          <div className="text-gray-400">Loading calendar...</div>
        </div>
      )}
    </div>
  );
}
