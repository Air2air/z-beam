# Workiz + Zoom Virtual Consultation Setup

## Overview

Workiz booking widget handles all appointment scheduling (services, rentals, and consultations). For virtual consultations, Zoom meeting links are added manually after booking.

## Customer Booking Flow

1. **Customer visits** `/schedule` page
2. **Selects service type** in Workiz widget:
   - Free Virtual Consultation (30 min)
   - Onsite Estimate
   - Equipment Rental
   - Service Booking
3. **Books appointment** - Workiz creates job in dashboard
4. **Receives confirmation** - Email with booking details
5. **Receives Zoom link** - Separate email with meeting details (manual process)

## Admin Workflow for Virtual Consultations

### Step 1: Monitor New Bookings

**Check Workiz Dashboard:**
- Log into https://app.workiz.com
- Go to **Calendar** or **Jobs**
- Look for bookings with job type: "Virtual Consultation"

**Email Notifications:**
- Workiz sends email when new booking created
- Subject: "New booking: [Customer Name] - Virtual Consultation"

### Step 2: Create Zoom Meeting

**Option A: Personal Meeting Room (Quick)**
```
1. Use your permanent Zoom room
2. Link: https://zoom.us/j/YOUR_PMI
3. Same link for all consultations
4. Easy but less professional
```

**Option B: Scheduled Meeting (Recommended)**
```
1. Go to zoom.us → Schedule Meeting
2. Set date/time matching Workiz booking
3. Generate unique meeting link
4. More professional, unique per customer
```

**Meeting Settings:**
- ✅ Enable waiting room
- ✅ Require password
- ✅ Enable video for host and participant
- ✅ Enable screen sharing (for demos)
- ✅ Record automatically (optional - for notes)

### Step 3: Add Zoom Link to Workiz Job

**In Workiz Dashboard:**
```
1. Open the consultation job
2. Click "Edit" or "Add Note"
3. Add Zoom meeting details:
   
   📹 Virtual Consultation Details:
   
   Join Zoom Meeting:
   https://zoom.us/j/1234567890?pwd=xxxxxx
   
   Meeting ID: 123 456 7890
   Passcode: xxxxxx
   
   Tips for best experience:
   - Test camera/microphone before meeting
   - Have photos of materials ready
   - Note any specific questions
   
4. Save job notes
```

### Step 4: Send Zoom Link to Customer

**Option A: Email from Workiz**
```
1. In job details, click "Email Customer"
2. Use template or write custom message
3. Include Zoom link from job notes
4. Send 24-48 hours before meeting
```

**Option B: Direct Email**
```
Subject: Your Z-Beam Virtual Consultation - Zoom Details

Hi [Customer Name],

Thank you for scheduling a consultation with Z-Beam!

Here are your meeting details:

📅 Date: [Date from Workiz]
🕐 Time: [Time from Workiz]
⏱️  Duration: 30 minutes

📹 Join Zoom Meeting:
https://zoom.us/j/1234567890?pwd=xxxxxx

Meeting ID: 123 456 7890
Passcode: xxxxxx

What to Prepare:
• Photos of materials/surfaces to clean
• Dimensions of work area
• Any specific contamination concerns
• Questions about laser cleaning process

Need to reschedule? Reply to this email or call us at [phone].

Looking forward to speaking with you!

Best regards,
Z-Beam Team
```

**Option C: SMS via Workiz (If Enabled)**
```
Hi [Name]! Your Z-Beam consultation is [Date] at [Time]. 
Join Zoom: https://zoom.us/j/xxxxx (Meeting ID: xxxxx, Pass: xxxxx). 
See you soon!
```

### Step 5: Pre-Meeting Reminder

**24 Hours Before:**
- Send reminder via Workiz or email
- Include Zoom link again
- Confirm they received details

**1 Hour Before:**
- Optional SMS reminder
- Quick link check

## Workiz Job Type Configuration

### Setup Virtual Consultation Job Type

**In Workiz Dashboard:**
```
Settings → Online Booking → Job Types → Add New

Job Type Name: Free Virtual Consultation
Duration: 30 minutes
Price: $0.00
Lead Type: Consultation
Description: "Free 30-minute video consultation to discuss 
             your laser cleaning needs. Zoom link sent after booking."

Custom Fields (Optional):
- Consultation Type: [Equipment Inquiry / Service Quote / General Info]
- Materials to Discuss: [Text field]
- Photo Upload: [File upload]
```

### Other Job Types to Configure

**Onsite Estimate**
- Duration: 60 minutes
- Price: $0 or $50 (refunded with service)
- Location: Customer site
- Notes: "Our team will visit your location"

**Equipment Rental**
- Duration: 1 day / 1 week / 1 month
- Price: Variable based on equipment
- Requires: Deposit, training

**Service Booking**
- Duration: Variable
- Price: Quote-based
- Requires: Initial consultation or estimate

## Email Templates

### Template 1: Virtual Consultation Confirmation

```markdown
Subject: Virtual Consultation Confirmed - [Date/Time]

Hi [Customer Name],

Your virtual consultation with Z-Beam is confirmed!

📅 **Appointment Details:**
- Date: [Date]
- Time: [Time] [Timezone]
- Duration: 30 minutes
- Type: Video Call (Zoom)

📹 **Join Meeting:**
Zoom link will be sent 24 hours before your appointment.

📋 **What to Prepare:**
- Photos of materials you need to clean
- Surface area dimensions (approximate)
- Any contamination concerns or challenges
- Questions about laser cleaning technology

Need to reschedule? Contact us at [phone/email].

Thank you for choosing Z-Beam!
```

### Template 2: Zoom Link Delivery (24hrs before)

```markdown
Subject: Tomorrow: Your Z-Beam Consultation - Zoom Link Inside

Hi [Customer Name],

Your virtual consultation is tomorrow!

⏰ **Meeting Time:**
[Date] at [Time] [Timezone]

📹 **Join Zoom Meeting:**
https://zoom.us/j/1234567890?pwd=xxxxxx

Meeting ID: 123 456 7890
Passcode: xxxxxx

**Quick Tips:**
✓ Test your camera and microphone
✓ Have photos ready to share
✓ Join 2-3 minutes early
✓ Stable internet connection recommended

**What We'll Cover:**
• Your specific cleaning challenges
• Material compatibility
• Equipment recommendations  
• Pricing and timeline
• Next steps

Questions? Reply to this email or call [phone].

See you tomorrow!
```

### Template 3: No-Show Follow-Up

```markdown
Subject: We Missed You - Reschedule Your Z-Beam Consultation

Hi [Customer Name],

We missed you at today's scheduled consultation.

We understand things come up! We'd love to reschedule at your convenience.

Click here to book a new time:
https://www.z-beam.com/schedule

Or reply to this email with your preferred dates/times.

Looking forward to connecting soon!
```

## Automation Options (Future)

### Option 1: Zapier Automation

**Workflow:**
```
Trigger: New Workiz Booking (Job Type = Virtual Consultation)
  ↓
Action: Create Zoom Meeting (scheduled at booking time)
  ↓
Action: Update Workiz Job (add Zoom link to notes)
  ↓
Action: Send Email (customer with Zoom details)
  ↓
Action: Create Calendar Event (Google Calendar with Zoom link)
```

**Cost:** $20-30/month Zapier plan

### Option 2: Make.com (Integromat)

Similar workflow to Zapier but potentially lower cost.

### Option 3: Custom API Integration

For high volume, build custom integration:
- Workiz API: https://developer.workiz.com
- Zoom API: https://developers.zoom.us
- Auto-create and sync meetings

## Best Practices

### ✅ Do:
- Send Zoom link 24-48 hours before meeting
- Test Zoom setup before first consultation
- Enable waiting room for security
- Record consultations (with permission) for notes
- Follow up with no-shows within 24 hours
- Keep consistent meeting format and structure

### ❌ Don't:
- Send Zoom link too early (customer may lose email)
- Use personal Zoom room for all meetings (less professional)
- Forget to update Workiz job with meeting notes
- Schedule back-to-back without buffer time
- Forget to send reminder day before

## Troubleshooting

### Customer Didn't Receive Zoom Link
1. Check spam/junk folder
2. Verify email in Workiz is correct
3. Resend via SMS if urgent
4. Call customer directly as backup

### Zoom Link Not Working
1. Verify meeting was created for correct date/time
2. Check if meeting already expired
3. Generate new link if needed
4. Send updated link immediately

### Customer Can't Join Zoom
1. Send direct phone number as backup
2. Test Zoom link yourself
3. Have customer try from different browser/device
4. Use phone audio as fallback

### No-Show Rate Too High
1. Send 24-hour reminder
2. Add 1-hour SMS reminder
3. Require phone confirmation
4. Consider small deposit for commitment

## Metrics to Track

**In Workiz Dashboard:**
- Total virtual consultations booked
- Show rate (attended vs no-show)
- Conversion rate (consultation → service booking)
- Average consultation duration
- Customer satisfaction ratings

**In Zoom:**
- Meeting attendance
- Average meeting length
- Recording storage usage

## Quick Reference

| Task | Where | How |
|------|-------|-----|
| View new bookings | Workiz Dashboard | Calendar or Jobs tab |
| Create Zoom meeting | zoom.us | Schedule Meeting |
| Add Zoom to job | Workiz job details | Edit notes/description |
| Email customer | Workiz or direct | Email customer button |
| Send reminder | Workiz or email | 24hrs before meeting |
| Join consultation | Zoom | Start meeting 2 min early |
| Update job status | Workiz | Mark complete, add notes |

## Support Resources

- **Workiz Help:** https://help.workiz.com
- **Zoom Support:** https://support.zoom.us
- **Z-Beam Internal:** [Your internal docs/wiki]

---

**Last Updated:** December 13, 2025  
**Process Owner:** [Your name/role]  
**Review Frequency:** Quarterly or when process changes
