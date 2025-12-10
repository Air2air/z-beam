// app/components/Schedule/ScheduleCalendar.tsx
"use client";

import { useEffect } from "react";
import { InlineWidget } from "react-calendly";
import { trackEvent } from "@/app/utils/analytics";

export function ScheduleCalendar() {
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
  }, []);

  return (
    <div className="calendly-inline-widget-container">
      <InlineWidget
        url={SCHEDULE_URL}
        styles={{
          height: '700px',
          minWidth: '320px',
        }}
        pageSettings={{
          backgroundColor: '394150',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: 'ff8500',
          textColor: 'f3f4f6',
        }}
      />
    </div>
  );
}
