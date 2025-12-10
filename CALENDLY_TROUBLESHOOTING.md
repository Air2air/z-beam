# Calendly Widget Troubleshooting Guide

**Issue**: Calendly widget showing as "logged out" on production (www.z-beam.com)

## Quick Fix Commands

```bash
# 1. Verify local URL is working
npm run validate:calendly

# 2. Sync local URL to Vercel (requires Vercel CLI)
npm run sync:calendly

# 3. Or manually update in Vercel dashboard
open https://vercel.com/air2air/z-beam/settings/environment-variables
```

## Current Status

- ✅ Environment variable `NEXT_PUBLIC_CALENDLY_URL` is set in Vercel  
- ✅ Local `.env` has: `https://calendly.com/z-beam/30min`
- ✅ Calendly account exists: https://calendly.com/z-beam
- ✅ Local validation: URL is accessible and working
- ❌ Widget appears logged out on production

## Most Likely Cause

**Vercel environment variable doesn't match local `.env` file**

The Calendly URL in Vercel might be:
- Different than the local URL
- Pointing to a deleted/deactivated event
- Not set correctly for all environments (production/preview/development)

## Root Cause

The Calendly widget shows as "logged out" when:
1. **Event doesn't exist** - The `/30min` event may not be created
2. **Event is unpublished** - Event exists but is not active
3. **Account subscription issue** - Free tier limitations or expired subscription
4. **Account logged out** - Calendly account needs re-authentication

## Steps to Fix

### 1. Log into Calendly Dashboard

Visit: https://calendly.com/login

Log in with your z-beam Calendly account credentials.

### 2. Check Event Types

Once logged in, go to: https://calendly.com/event_types/user/me

Look for an event named "30min" or similar.

### 3. Verify Event Status

For each event, check:
- ✅ Event is **Active/Published** (not draft or deactivated)
- ✅ Event URL matches what's in your environment variable
- ✅ Event is public (not private/secret)

### 4. Get Correct Event URL

If the event exists:
- Copy the public URL (e.g., `https://calendly.com/z-beam/consultation`)
- Note: It may not be called "30min" - check what it's actually named

If no event exists:
- Create a new event type
- Set duration to 30 minutes
- Configure availability
- Publish the event
- Copy the public URL

### 5. Update Environment Variable

**If URL has changed**, update in Vercel:

1. Go to: https://vercel.com/air2air/z-beam/settings/environment-variables
2. Find `NEXT_PUBLIC_CALENDLY_URL`
3. Update the value to the correct event URL
4. Save and redeploy

**Also update locally**:

```bash
# Edit .env file
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/z-beam/YOUR-ACTUAL-EVENT-NAME
```

### 6. Verify on Production

After redeployment, visit:
- https://www.z-beam.com/schedule
- https://www.z-beam.com/consultation

The Calendly widget should now display correctly.

## Common Issues

### Issue: "This page is not available"
**Cause**: Event slug doesn't exist or is wrong
**Fix**: Verify event URL in Calendly dashboard matches environment variable

### Issue: "Log in to schedule"
**Cause**: Event is private or account needs authentication
**Fix**: 
- Make event public in Calendly settings
- Ensure event is published (not draft)

### Issue: "Account suspended"
**Cause**: Calendly subscription expired or payment issue
**Fix**: Check billing in Calendly dashboard

## Testing Locally

To test the widget locally:

```bash
# Start dev server
npm run dev

# Visit
http://localhost:3000/schedule
```

The widget should load if:
- `.env` has correct `NEXT_PUBLIC_CALENDLY_URL`
- Event is public and published

## Alternative: Check Event Types via Browser

1. Log into Calendly: https://calendly.com/login
2. Click on "Event Types" in the sidebar
3. Look for active events
4. Click on an event → "Copy Link" to get the public URL
5. Update environment variables with correct URL

## Technical Details

**Widget Component**: `app/components/Schedule/ScheduleCalendar.tsx`

```tsx
const SCHEDULE_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/z-beam/30min";
```

**Environment Variable**: `NEXT_PUBLIC_CALENDLY_URL`
- Must be set in Vercel for production
- Must start with `NEXT_PUBLIC_` to be accessible in browser
- Format: `https://calendly.com/username/event-name`

## Support Resources

- Calendly Documentation: https://help.calendly.com
- Calendly API Docs: https://developer.calendly.com
- React Calendly Package: https://github.com/tcampb/react-calendly

---

**Last Updated**: December 10, 2025
