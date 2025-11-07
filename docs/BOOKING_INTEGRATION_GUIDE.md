# Google Booking & Workiz Integration Guide

## Overview

This guide outlines the implementation of appointment scheduling functionality for Z-Beam, integrating Google Calendar booking with Workiz field management software to enable visitors to book consultation appointments directly from the website.

## Solution Options

### Option 1: Google Calendar Appointment Scheduling (Recommended)

**Pros:**
- Native Google Workspace integration
- Free with Google Workspace
- Clean, professional booking interface
- Automatic calendar syncing
- Email confirmations and reminders
- Mobile-friendly
- Can integrate with Workiz via Zapier/Make

**Cons:**
- Requires Google Workspace account
- Limited customization
- Basic features compared to dedicated booking platforms

### Option 2: Calendly + Workiz Integration

**Pros:**
- More robust booking features
- Better customization options
- Advanced scheduling logic
- Native Workiz integration available
- Payment collection capability
- Team scheduling

**Cons:**
- Additional cost ($8-16/user/month)
- Third-party dependency

### Option 3: Workiz Native Booking

**Pros:**
- Direct integration (no middleware)
- All data stays in Workiz
- Automatic job creation
- Customer record creation

**Cons:**
- Less polished booking interface
- May require custom development
- Limited calendar view options

## Recommended Implementation: Google Calendar + Workiz via Automation

### Phase 1: Google Calendar Appointment Scheduling Setup

#### 1. Enable Google Calendar Appointment Scheduling

```bash
# Prerequisites:
# - Google Workspace account (Business Starter or higher)
# - Admin access to Google Workspace
```

**Steps:**
1. Go to [Google Calendar](https://calendar.google.com)
2. Click **Settings** → **Appointment schedules**
3. Click **Create** to set up a new appointment type
4. Configure:
   - **Name**: "Laser Cleaning Consultation"
   - **Duration**: 30 minutes (or 60 minutes)
   - **Location**: Video call (Google Meet) or On-site
   - **Buffer time**: 15 minutes between appointments
   - **Booking window**: 1-30 days in advance
   - **Max bookings per day**: 4-6
   - **Form fields**: Name, Email, Phone, Company, Project Details

#### 2. Get the Booking Page URL

After setup, Google provides a shareable booking link:
```
https://calendar.google.com/calendar/appointments/schedules/[YOUR-SCHEDULE-ID]
```

### Phase 2: Embed Booking Calendar on Website

#### Option A: Direct Embed (Simplest)

```tsx
// app/components/Booking/BookingCalendar.tsx
'use client';

export function BookingCalendar() {
  return (
    <div className="booking-calendar-container">
      <iframe
        src="https://calendar.google.com/calendar/appointments/schedules/[YOUR-SCHEDULE-ID]?gv=true"
        style={{ border: 0 }}
        width="100%"
        height="600"
        frameBorder="0"
        title="Book a Consultation"
      />
    </div>
  );
}
```

**Usage:**
```tsx
// app/contact/page.tsx or app/booking/page.tsx
import { BookingCalendar } from '../components/Booking/BookingCalendar';

export default function BookingPage() {
  return (
    <Layout title="Book a Consultation">
      <BookingCalendar />
    </Layout>
  );
}
```

#### Option B: Modal/Popup Integration

```tsx
// app/components/Booking/BookingModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export function BookingModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Book Consultation
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl">
            <Dialog.Title className="text-2xl font-bold p-6 border-b">
              Book Your Consultation
            </Dialog.Title>
            
            <div className="p-6">
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/[YOUR-SCHEDULE-ID]?gv=true"
                style={{ border: 0 }}
                width="100%"
                height="600"
                frameBorder="0"
                title="Book a Consultation"
              />
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
```

#### Option C: Custom Integration with Google Calendar API

For more control, use Google Calendar API:

```typescript
// app/utils/googleCalendar.ts
import { google } from 'googleapis';

const calendar = google.calendar('v3');

export async function getAvailableSlots(date: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  const response = await calendar.freebusy.query({
    auth,
    requestBody: {
      timeMin: new Date(date).toISOString(),
      timeMax: new Date(date + 86400000).toISOString(),
      items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
    },
  });

  return response.data.calendars?.[process.env.GOOGLE_CALENDAR_ID!]?.busy || [];
}

export async function createAppointment(details: {
  name: string;
  email: string;
  phone: string;
  company: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const event = await calendar.events.insert({
    auth,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: `Consultation: ${details.company || details.name}`,
      description: `
        Contact: ${details.name}
        Email: ${details.email}
        Phone: ${details.phone}
        Company: ${details.company}
        Notes: ${details.notes || 'N/A'}
      `,
      start: {
        dateTime: details.startTime,
        timeZone: 'America/New_York', // Adjust to your timezone
      },
      end: {
        dateTime: details.endTime,
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: details.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: `consultation-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
    conferenceDataVersion: 1,
  });

  return event.data;
}
```

### Phase 3: Workiz Integration

#### Method 1: Zapier Integration (No-Code, Recommended)

**Setup:**

1. **Create Zapier Account** (free tier available)

2. **Configure Trigger:**
   - Trigger: "Google Calendar - New Event"
   - Calendar: Select your consultation calendar
   - Filter: Only events with specific text (e.g., "Consultation")

3. **Configure Action:**
   - Action: "Workiz - Create Job"
   - Map fields:
     ```
     Job Type: Consultation
     Customer Name: {{ Event.Attendees.Name }}
     Customer Email: {{ Event.Attendees.Email }}
     Customer Phone: {{ Event.Description.Phone }} (extract from description)
     Scheduled Date: {{ Event.Start }}
     Notes: {{ Event.Description }}
     Source: Website Booking
     ```

4. **Additional Actions (Optional):**
   - Send SMS confirmation to customer
   - Create task for sales team
   - Send internal Slack notification

**Zapier Zap Flow:**
```
Google Calendar (New Event)
  ↓
Filter (Only "Consultation" events)
  ↓
Formatter (Extract phone from description)
  ↓
Workiz (Create or Update Customer)
  ↓
Workiz (Create Job)
  ↓
Gmail (Send confirmation email)
  ↓
Slack (Notify team)
```

#### Method 2: Make (formerly Integromat) Integration

Similar to Zapier but more powerful:

```
Scenario Flow:
1. Watch Google Calendar Events
2. Parse event data
3. HTTP Request to Workiz API
   - POST /v1/customers
   - POST /v1/jobs
4. Send confirmation email
```

#### Method 3: Custom Webhook Integration

```typescript
// app/api/booking/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const event = await request.json();

  // Extract booking details from Google Calendar webhook
  const bookingDetails = {
    customerName: event.attendees?.[0]?.displayName,
    customerEmail: event.attendees?.[0]?.email,
    scheduledDate: event.start.dateTime,
    duration: 30, // minutes
    notes: event.description,
  };

  // Create job in Workiz
  const workizResponse = await fetch('https://api.workiz.com/api/v1/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WORKIZ_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      JobType: 'Consultation',
      ScheduledDate: bookingDetails.scheduledDate,
      Customer: {
        FirstName: bookingDetails.customerName?.split(' ')[0],
        LastName: bookingDetails.customerName?.split(' ').slice(1).join(' '),
        Email: bookingDetails.customerEmail,
      },
      Notes: bookingDetails.notes,
      Source: 'Website Booking',
    }),
  });

  const workizJob = await workizResponse.json();

  // Track in analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'booking_created', {
      event_category: 'Booking',
      event_label: 'Consultation',
      value: 1,
    });
  }

  return NextResponse.json({
    success: true,
    jobId: workizJob.JobID,
  });
}
```

### Phase 4: Enhanced User Experience

#### Add Booking CTA to Key Pages

```tsx
// app/components/Booking/BookingCTA.tsx
'use client';

import Link from 'next/link';
import { FiCalendar } from 'react-icons/fi';

export function BookingCTA() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
      <FiCalendar className="w-12 h-12 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2">
        Ready to Get Started?
      </h3>
      <p className="text-blue-100 mb-6">
        Book a free 30-minute consultation with our laser cleaning experts
      </p>
      <Link
        href="/booking"
        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
      >
        Schedule Consultation
      </Link>
    </div>
  );
}
```

**Add to strategic locations:**
- Material pages (after FAQs)
- Services page (after service descriptions)
- Contact page (alternative to contact form)
- Homepage (hero section or bottom CTA)

#### Analytics Tracking

```typescript
// app/utils/analytics.ts (add to existing file)

export interface BookingInteractionParams {
  action: 'view_calendar' | 'select_time' | 'submit_booking' | 'booking_confirmed';
  appointmentType?: string;
  selectedDate?: string;
  selectedTime?: string;
}

export const trackBookingInteraction = ({
  action,
  appointmentType,
  selectedDate,
  selectedTime,
}: BookingInteractionParams) => {
  trackEvent('booking_interaction', {
    event_category: 'Booking',
    event_label: appointmentType || 'Consultation',
    action,
    selected_date: selectedDate,
    selected_time: selectedTime,
    value: action === 'booking_confirmed' ? 1 : 0,
  });
};
```

## Implementation Roadmap

### Week 1: Setup & Configuration
- [ ] Set up Google Workspace calendar
- [ ] Configure appointment scheduling
- [ ] Create booking page route (`/booking`)
- [ ] Implement basic iframe embed
- [ ] Test booking flow

### Week 2: Workiz Integration
- [ ] Set up Zapier account
- [ ] Create Google Calendar → Workiz automation
- [ ] Test job creation in Workiz
- [ ] Configure email notifications
- [ ] Set up error handling

### Week 3: Enhanced UX
- [ ] Add BookingCTA component
- [ ] Place CTAs on key pages
- [ ] Implement analytics tracking
- [ ] Add loading states
- [ ] Mobile responsive testing

### Week 4: Testing & Launch
- [ ] End-to-end testing
- [ ] Customer journey testing
- [ ] Documentation
- [ ] Launch announcement
- [ ] Monitor for issues

## Environment Variables

```bash
# .env.local

# Google Calendar API (if using custom integration)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Workiz API (if using direct integration)
WORKIZ_API_TOKEN=your-workiz-api-token
WORKIZ_COMPANY_ID=your-company-id

# Zapier Webhook (if using webhook method)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
```

## Cost Analysis

### Option 1: Google Calendar + Zapier (Recommended)
- Google Workspace: $6-12/user/month (already have?)
- Zapier: Free (100 tasks/month) or $19.99/month (750 tasks)
- **Total: $0-32/month**

### Option 2: Calendly + Native Workiz Integration
- Calendly: $8-16/user/month
- Workiz: Existing subscription
- **Total: $8-16/month**

### Option 3: Custom Development
- Development time: 40-60 hours
- Maintenance: 2-4 hours/month
- **Total: One-time cost, ongoing maintenance**

## Security Considerations

1. **Data Protection:**
   - Never expose API keys in client-side code
   - Use server-side routes for API calls
   - Validate all webhook signatures

2. **Calendar Privacy:**
   - Only share availability, not existing events
   - Use separate calendar for bookings
   - Configure buffer times

3. **Customer Data:**
   - Comply with GDPR/privacy laws
   - Secure data transmission (HTTPS)
   - Clear privacy policy for booking data

## Testing Checklist

- [ ] Book appointment successfully
- [ ] Receive confirmation email
- [ ] Event appears in Google Calendar
- [ ] Job created in Workiz with correct data
- [ ] Customer can reschedule/cancel
- [ ] Mobile booking works properly
- [ ] Analytics tracking fires correctly
- [ ] Error handling works (full calendar, etc.)

## Monitoring & Maintenance

**Weekly:**
- Check for failed Zapier tasks
- Monitor booking completion rate
- Review customer feedback

**Monthly:**
- Analyze booking analytics
- Update availability if needed
- Review automation efficiency

## Next Steps

1. **Immediate:** Set up Google Calendar appointment scheduling
2. **Week 1:** Create `/booking` page with embedded calendar
3. **Week 2:** Configure Zapier → Workiz integration
4. **Week 3:** Add booking CTAs throughout site
5. **Week 4:** Launch and monitor

## Resources

- [Google Calendar Appointment Scheduling](https://support.google.com/calendar/answer/10729749)
- [Workiz API Documentation](https://api.workiz.com/docs)
- [Zapier Google Calendar Integration](https://zapier.com/apps/google-calendar/integrations)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Support

For implementation assistance:
- Google Workspace: [Google Support](https://support.google.com/a)
- Workiz: [Workiz Support](https://support.workiz.com)
- Zapier: [Zapier Help Center](https://help.zapier.com)
