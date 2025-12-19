# Workiz Widget Dark Mode Solutions

## The Reality: Workiz Controls Widget Appearance

**Important:** Workiz widgets are embedded iframes, meaning **Workiz controls all styling** inside the widget. You cannot directly apply CSS to change the widget's appearance from your website.

## Current Status

❌ **Workiz does NOT natively support dark mode** (as of December 2025)  
⚠️ **You cannot force dark mode** on their widget via CSS  
✅ **You CAN control the container** around the widget  

## What We've Implemented

The component now includes a `theme` prop that:
1. Attempts to pass a `?theme=dark` parameter to Workiz (may not work)
2. Provides a foundation if Workiz adds dark mode support later

```tsx
<WorkizWidget 
  companyId="your_id"
  theme="dark"  // Try this, but Workiz may ignore it
/>
```

## Solution Options

### Option 1: Wrap Widget in Dark-Mode Container (RECOMMENDED)

Create a visual transition that makes the white widget less jarring:

```tsx
// In app/booking/page.tsx
<div className="bg-gray-900 p-6 rounded-md">
  <div className="bg-white rounded-md overflow-hidden">
    <WorkizWidget 
      companyId={process.env.NEXT_PUBLIC_WORKIZ_COMPANY_ID}
      height="700px"
    />
  </div>
  <p className="text-gray-400 text-xs mt-2 text-center">
    Booking calendar powered by Workiz
  </p>
</div>
```

### Option 2: Force Light Mode Section

Keep the booking section in light mode even when site is dark:

```tsx
// In app/booking/page.tsx
<div className="booking-section light-mode-only">
  <div className="bg-white dark:bg-white rounded-md p-6">
    <WorkizWidget 
      companyId={process.env.NEXT_PUBLIC_WORKIZ_COMPANY_ID}
      height="700px"
    />
  </div>
</div>
```

Then add this CSS:

```css
/* In your global CSS or component styles */
.light-mode-only {
  color-scheme: light;
  background-color: white;
}

.light-mode-only * {
  color-scheme: light;
}
```

### Option 3: Disable Dark Mode on Booking Page

Force the entire booking page to light mode:

```tsx
// In app/booking/page.tsx
export default async function BookingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Disable dark mode classes for this page */}
      <Layout
        // ... existing props
        className="force-light-mode"
      >
        {/* ... existing content */}
      </Layout>
    </div>
  );
}
```

### Option 4: Contact Workiz Support

Ask Workiz to add dark mode support:

**Email:** support@workiz.com  
**Subject:** Feature Request - Dark Mode for Booking Widget  

**Template Message:**
```
Hi Workiz Team,

We're using your booking widget on our website (https://z-beam.com/booking) 
and would love to see dark mode support added to better match our site's theme.

Could you:
1. Add native dark mode to the widget
2. Support a ?theme=dark URL parameter
3. Provide CSS customization options

This would greatly improve the user experience for our customers.

Thank you!
```

### Option 5: Build Custom Booking Form (Advanced)

If dark mode is critical, build a custom form that **submits to Workiz API**:

```tsx
// Custom booking form that matches your dark mode
<form onSubmit={submitToWorkizAPI}>
  {/* Your styled form fields */}
</form>
```

Then use Workiz API to create bookings programmatically. Check Workiz documentation for API access.

## Testing Different Scenarios

### Test 1: Theme Parameter
```tsx
<WorkizWidget 
  companyId="your_id"
  theme="dark"
/>
```
**Check:** Does Workiz respond to `?theme=dark` parameter?

### Test 2: Color Scheme CSS
```css
iframe {
  color-scheme: dark;
}
```
**Check:** Does this hint affect iframe content? (Usually no)

### Test 3: Workiz Dashboard Settings
**Check:** Log into Workiz → Settings → Branding
- Look for theme/appearance options
- Check if they offer dark mode toggle
- Upload dark logo if available

## Best Practice Recommendation

For now, use **Option 1** (wrap in dark container with visual buffer):

```tsx
// app/booking/page.tsx
<SectionContainer
  title="Select a Time"
  bgColor="body"
  radius={true}
  horizPadding={true}
>
  {/* Add subtle dark wrapper */}
  <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-md">
    <div className="bg-white rounded-md shadow-inner overflow-hidden">
      <WorkizWidget 
        companyId={process.env.NEXT_PUBLIC_WORKIZ_COMPANY_ID}
        height="700px"
      />
    </div>
    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
      Booking calendar in light mode (powered by Workiz)
    </p>
  </div>
</SectionContainer>
```

## Future-Proofing

The component is now ready for dark mode if Workiz adds support:

```tsx
// When Workiz adds dark mode support, just change:
<WorkizWidget 
  theme="dark"  // Will automatically work when supported
/>

// Or make it dynamic:
<WorkizWidget 
  theme={isDarkMode ? 'dark' : 'light'}
/>
```

## Check for Updates

Periodically check:
- Workiz changelog: https://help.workiz.com/changelog
- Workiz embed documentation for new parameters
- Contact Workiz support for roadmap updates

## Alternative Booking Solutions

If dark mode is a dealbreaker, consider alternative booking solutions with native dark mode support.

## Summary

✅ **What You Can Do:**
- Style the container around the widget
- Force light mode for booking section
- Contact Workiz to request dark mode

❌ **What You Cannot Do:**
- Apply CSS to iframe content (cross-origin restriction)
- Force dark mode on Workiz widget
- Modify Workiz widget appearance directly

📧 **Best Action:** Contact Workiz support and request dark mode feature

---

**Last Updated:** December 7, 2025  
**Workiz Dark Mode Status:** Not supported natively
