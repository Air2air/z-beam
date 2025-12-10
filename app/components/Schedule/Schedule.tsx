/**
 * @component Schedule
 * @purpose Displays scheduling options (Consultation + Contact)
 * @dependencies SimpleCard
 * @aiContext Hardcoded scheduling options grid
 * 
 * @usage
 * <Schedule />
 */
import React from 'react';
import { SimpleCard } from './SimpleCard';

export function Schedule() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SimpleCard
        title="Schedule Consultation"
        description="Schedule a free consultation with experts"
        href="/schedule"
        imageUrl="/images/schedule-card.svg"
        imageAlt="Schedule Consultation"
      />
      <SimpleCard
        title="Contact Us"
        description="Get a quote or ask questions"
        href="/contact"
        imageUrl="/images/contact-card.svg"
        imageAlt="Contact us via email or phone"
      />
    </div>
  );
}

export default Schedule;
