# Workiz Booking Widget Integration

This document explains how to configure the Workiz booking portal widget on the Z-Beam booking page.

## Quick Setup

### 1. Get Your Workiz Company ID

1. Log into your Workiz account at https://app.workiz.com
2. Navigate to **Settings** > **Online Booking** (or **Customer Portal**)
3. Find your **Company ID** or **Booking URL**
4. Copy the company ID (it's usually in the URL or embed code)

### 2. Configure Environment Variable

Add to your `.env.local` file:

```env
NEXT_PUBLIC_WORKIZ_COMPANY_ID=your_company_id_here
```

### 3. Update Widget Component (if needed)

The widget component is located at: `app/components/Booking/WorkizWidget.tsx`

#### If Workiz provides an iframe URL:
The component is already configured for iframe embed. Just update your company ID.

#### If Workiz provides a script tag:
Replace the iframe section in `WorkizWidget.tsx` with:

```tsx
// In the component, uncomment Method 2 and comment out Method 1
<div 
  id="workiz-booking-widget" 
  data-company-id={companyId}
  style={{ minHeight: height }}
></div>
```

And update the script source in the `useEffect`:

```tsx
script.src = 'https://YOUR_SUBDOMAIN.workiz.com/widget.js';
// OR
script.src = 'https://app.workiz.com/booking-widget.js';
```

## Embed Methods

Workiz typically offers two embed methods:

### Method 1: Direct Iframe (Default)
```html
<iframe src="https://app.workiz.com/booking/YOUR_COMPANY_ID"></iframe>
```
✅ **Already configured** in the component

### Method 2: JavaScript Widget
```html
<script src="https://app.workiz.com/widget.js"></script>
<div id="workiz-booking"></div>
```
🔧 Requires updating the component (see above)

## Customization Options

### Widget Height
Change the height prop in `app/booking/page.tsx`:

```tsx
<WorkizWidget 
  companyId={process.env.NEXT_PUBLIC_WORKIZ_COMPANY_ID}
  height="800px"  // Adjust as needed
/>
```

### Styling
Add custom classes in `WorkizWidget.tsx`:

```tsx
<iframe
  className="shadow-lg rounded-lg"
  // ... other props
/>
```

### Mobile Responsiveness
The widget is already responsive, but you can adjust the container in `page.tsx`:

```tsx
<div className="lg:col-span-2 min-h-[500px] md:min-h-[700px]">
  <WorkizWidget ... />
</div>
```

## Common Issues

### Issue: Widget not loading
**Solution:** 
- Check browser console for errors
- Verify company ID is correct
- Ensure Workiz booking is enabled in your account
- Check if there are CORS restrictions

### Issue: Wrong booking form appears
**Solution:**
- Verify the company ID matches your Workiz account
- Check if you have multiple booking forms in Workiz
- Contact Workiz support to confirm your booking portal URL

### Issue: Widget cuts off content
**Solution:**
- Increase the `height` prop
- Check if Workiz widget has internal scrolling
- Use browser dev tools to inspect the iframe content

### Issue: Dark mode not working
**Solution:**
- Workiz controls the widget styling
- You may need to contact Workiz to enable dark mode
- Alternatively, wrap the widget in a light-mode container:

```tsx
<div className="bg-white p-4 rounded-lg">
  <WorkizWidget ... />
</div>
```

## Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000/booking
```

### Production Testing
Deploy to Vercel and test:
```bash
vercel --prod
```

## Fallback Options

If JavaScript is disabled, users see a fallback message with a direct link to the Workiz booking page:

```tsx
<noscript>
  <a href="https://app.workiz.com/booking/YOUR_COMPANY_ID">
    Open booking portal →
  </a>
</noscript>
```

## Workiz Features Available

The widget typically includes:
- ✅ Calendar selection
- ✅ Service type selection
- ✅ Customer information form
- ✅ Email confirmations
- ✅ SMS reminders (if configured)
- ✅ Payment processing (if enabled)
- ✅ Rescheduling/cancellation

## Security Considerations

- ✅ Company ID is public (safe to expose)
- ✅ Workiz handles all data securely
- ✅ No sensitive information stored in your app
- ✅ HTTPS required in production

## Support

### Workiz Support
- Documentation: https://help.workiz.com
- Support: support@workiz.com
- Phone: Check your Workiz dashboard

### Z-Beam Implementation
For issues specific to the Z-Beam integration, check:
- Component: `app/components/Booking/WorkizWidget.tsx`
- Page: `app/booking/page.tsx`
- Environment: `.env.local`

## Next Steps

1. ✅ Configure environment variable
2. ✅ Test locally
3. ✅ Deploy to staging/production
4. ✅ Test booking flow end-to-end
5. ✅ Configure Workiz notifications and reminders
6. ✅ Update marketing materials with new booking link

---

**Last Updated:** December 7, 2025  
**Component Version:** 1.0.0
