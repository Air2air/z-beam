// app/components/Schedule/ScheduleCalendar.tsx
"use client";

import { useEffect } from "react";
import { trackEvent } from "@/app/utils/analytics";

export function ScheduleCalendar() {
  // Calendly scheduling URL - using direct URL for reliability
  // This ensures the widget always loads even if env var isn't set
  const SCHEDULE_URL = "https://calendly.com/z-beam/30min";

  useEffect(() => {
    // Track when users view the scheduling calendar
    trackEvent("schedule_calendar_viewed", {
      event_category: "Schedule",
      event_label: "Consultation",
    });

    // Load Calendly widget script directly (more reliable than react-calendly)
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize widget after script loads
    script.onload = () => {
      // Widget auto-initializes from data-url attribute
      console.log('Calendly widget loaded');
    };

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="calendly-inline-widget-container">
      {/* Using official Calendly embed method instead of react-calendly */}
      <div 
        className="calendly-inline-widget"
        data-url={`${SCHEDULE_URL}?background_color=394150&text_color=f3f4f6&primary_color=ff8500`}
        style={{
          minWidth: '320px',
          height: '700px',
        }}
      />
    </div>
  );
}
