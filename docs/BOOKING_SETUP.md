# Booking System Setup Guide

## Quick Start (15 minutes)

### Step 1: Set Up Google Calendar Appointment Scheduling

1. **Go to Google Calendar**: https://calendar.google.com
2. **Open Settings** → Click gear icon → Settings
3. **Navigate to Appointment Schedules**: Left sidebar → "Appointment schedules"
4. **Create New Schedule**: Click "Create" button

5. **Configure Your Schedule:**
   ```
   Name: Laser Cleaning Consultation
   Duration: 30 minutes
   Location: Google Meet (video call)
   
   Availability:
   - Mon-Fri: 9:00 AM - 5:00 PM
   - Buffer: 15 minutes between meetings
   - Booking window: 1-30 days in advance
   - Max per day: 6 appointments
   
   Form Fields (collect from visitors):
   ✓ Name (required)
   ✓ Email (required)  
   ✓ Phone number
   ✓ Company name
   ✓ Project details (text area)
   ```

6. **Get Your Booking URL:**
   - After creating, click on the schedule
   - Copy the "Booking page link"
   - Format: `https://calendar.google.com/calendar/appointments/schedules/ABC123...`

### Step 2: Add URL to Environment Variables

1. **Create/Edit `.env.local`:**
   ```bash
   NEXT_PUBLIC_GOOGLE_CALENDAR_BOOKING_URL=https://calendar.google.com/calendar/appointments/schedules/YOUR_SCHEDULE_ID
   ```

2. **Restart development server** if running

### Step 3: Test the Booking Page

1. Visit: http://localhost:3000/booking
2. You should see:
   - Left side: Google Calendar booking interface
   - Right side: Information and FAQs
3. Test booking an appointment

### Step 4: Set Up Workiz Integration (via Zapier)

#### Option A: Using Zapier (Recommended - No Code)

1. **Create Zapier Account**: https://zapier.com (free tier works)

2. **Create New Zap:**
   - **Trigger**: "Google Calendar - New Event"
   - **Select Calendar**: Your consultation calendar
   - **Test Trigger**: Book a test appointment

3. **Add Filter (Optional but Recommended):**
   - **Condition**: Only continue if...
   - **Field**: Event Summary
   - **Contains**: "Consultation" or "Laser Cleaning"

4. **Add Action**: "Workiz - Create Job"
   - **Connect Workiz Account**: Enter API credentials
   - **Map Fields:**
     ```
     Job Type: Consultation
     Customer First Name: {{Event.Attendees[0].DisplayName}} (first word)
     Customer Last Name: {{Event.Attendees[0].DisplayName}} (remaining)
     Customer Email: {{Event.Attendees[0].Email}}
     Customer Phone: Extract from {{Event.Description}}
     Scheduled Start: {{Event.Start}}
     Duration: 30 minutes
     Notes: {{Event.Description}}
     Source: Website Booking
     ```

5. **Add Additional Actions (Optional):**
   - Send confirmation SMS
   - Create internal Slack notification
   - Add to CRM

6. **Turn On Zap** → Automation is live!

#### Option B: Using Make (More Advanced)

Similar flow but with more customization options. See full guide in `docs/BOOKING_INTEGRATION_GUIDE.md`

### Step 5: Add Booking CTAs to Your Site

The BookingCTA component is ready to use. Add it to key pages:

**Example 1: After Material FAQs**
```tsx
// app/materials/[category]/[subcategory]/[slug]/page.tsx
import { BookingCTA } from '@/app/components/Booking/BookingCTA';

// After MaterialFAQ component
<MaterialFAQ />
<BookingCTA className="mt-12" />
```

**Example 2: Services Page**
```tsx
// app/services/page.tsx  
import { BookingCTA } from '@/app/components/Booking/BookingCTA';

// At bottom of page
<BookingCTA />
```

**Example 3: Compact Button Version**
```tsx
import { BookingCTA } from '@/app/components/Booking/BookingCTA';

<BookingCTA variant="compact" />
// Renders as: [Calendar Icon] Book Consultation
```

## What You Get

### Booking Page Features
- ✅ Embedded Google Calendar interface
- ✅ Automatic timezone detection
- ✅ Mobile-responsive design
- ✅ Email confirmations
- ✅ Calendar invites (ICS files)
- ✅ Google Meet links
- ✅ Rescheduling/cancellation
- ✅ Analytics tracking

### Workiz Integration (via Zapier)
- ✅ Auto-create jobs in Workiz
- ✅ Auto-create/update customers
- ✅ Include all booking details
- ✅ Source tracking (Website Booking)
- ✅ Scheduled date/time synced

### Analytics Tracking
Events automatically tracked:
- `booking_calendar_viewed` - User views booking page
- `booking_calendar_loaded` - Calendar loads successfully
- `booking_cta_clicked` - User clicks booking CTA

## Testing Checklist

- [ ] Visit `/booking` page
- [ ] Calendar loads correctly
- [ ] Select a time slot
- [ ] Fill out booking form
- [ ] Receive confirmation email
- [ ] Event appears in Google Calendar
- [ ] (If Zapier set up) Job created in Workiz
- [ ] Test rescheduling
- [ ] Test cancellation
- [ ] Check mobile responsiveness

## Troubleshooting

### Calendar not loading?
- Check `NEXT_PUBLIC_GOOGLE_CALENDAR_BOOKING_URL` is set correctly
- Verify URL starts with `https://calendar.google.com/calendar/appointments`
- Check browser console for errors
- Ensure appointment schedule is "Published" in Google Calendar

### No events showing in Workiz?
- Check Zapier task history for errors
- Verify Workiz API credentials
- Ensure field mapping is correct
- Test with a manual trigger in Zapier

### Confirmation emails not sending?
- Check Google Calendar notification settings
- Verify attendee email addresses
- Check spam folder

## Cost Breakdown

- **Google Workspace**: $6-12/user/month (or free with existing account)
- **Zapier**: Free (100 tasks/month) or $19.99/month (750 tasks)
- **Total**: $0-32/month

## Next Steps

1. ✅ Set up Google Calendar appointment scheduling
2. ✅ Add booking URL to `.env.local`
3. ✅ Test booking page locally
4. ⬜ Set up Zapier → Workiz automation
5. ⬜ Add BookingCTA to key pages
6. ⬜ Deploy to production
7. ⬜ Monitor bookings and adjust availability

## Support Resources

- **Google Calendar Help**: https://support.google.com/calendar/answer/10729749
- **Zapier Google Calendar**: https://zapier.com/apps/google-calendar/integrations/workiz
- **Workiz API**: https://api.workiz.com/docs
- **Full Integration Guide**: `docs/BOOKING_INTEGRATION_GUIDE.md`
