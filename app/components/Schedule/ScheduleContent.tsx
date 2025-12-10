'use client';

import dynamic from 'next/dynamic';

// Dynamic import for scheduling widget (client-side only)
const ScheduleCalendar = dynamic(
  () => import('./ScheduleCalendar').then((mod) => mod.ScheduleCalendar),
  { ssr: false }
);

export function ScheduleContent() {
  return <ScheduleCalendar />;
}
