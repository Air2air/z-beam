'use client';

import dynamic from 'next/dynamic';

// Dynamic import for scheduling widget (client-side only)
const WorkizWidget = dynamic(
  () => import('./WorkizWidget').then((mod) => mod.WorkizWidget),
  { ssr: false }
);

export function ScheduleContent() {
  return <WorkizWidget />;
}
