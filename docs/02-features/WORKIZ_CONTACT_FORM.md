# Workiz Contact Form Integration

**Last Updated**: January 19, 2026  
**Status**: ✅ Implemented and tested locally

---

## Overview

The Z-Beam contact page integrates a Workiz service request form via iframe embedding. This allows potential customers to submit inquiries directly through Workiz's hosted form, which feeds into their CRM system.

## Implementation

### Contact Page
- **Location**: `/app/contact/page.tsx`
- **URL**: `/contact`
- **Form Provider**: Workiz (sendajob.com)

### Form Versions Available

#### Version 1: Standard Form (Current)
```tsx
<iframe
  src="https://st.sendajob.com/MY/servicerequest/bc0bbe1e44d7eda5aed87bb3ababd7c52a171de4.html"
  width="100%"
  height="800"
  scrolling="auto"
  title="Contact Form"
/>
```
- **Height**: 800px
- **Features**: Full form with all fields

#### Version 2: Compact Form (Alternative)
```tsx
<iframe
  src="https://st.sendajob.com/MY/servicerequest/bc0bbe1e44d7eda5aed87bb3ababd7c52a171de4_f.html"
  width="100%"
  height="650"
  scrolling="auto"
  title="Contact Form"
/>
```
- **Height**: 650px  
- **Features**: Condensed layout

To switch versions, edit `/app/contact/page.tsx` and comment/uncomment the appropriate iframe block.

## Confirmation Page

After form submission, users are redirected to a confirmation page.

- **Location**: `/app/confirmation/page.tsx`
- **URL**: `/confirmation`
- **Features**:
  - Success message with checkmark
  - Contact information for immediate assistance
  - Action buttons (Return Home, View Services)
  - Matches contact form styling

### Workiz Redirect Configuration

In your Workiz dashboard, configure the form to redirect to:
- **Development**: `http://localhost:3000/confirmation`
- **Production**: `https://www.z-beam.com/confirmation`

## Content Security Policy (CSP)

The middleware has been configured to allow Workiz iframe embedding.

### Development Mode
- **Permissive CSP**: Allows all HTTPS/HTTP sources for easier debugging
- **Location**: `/middleware.ts`

### Production Mode
- **Restricted CSP**: Only allows specific Workiz domains:
  - `https://st.sendajob.com`
  - `https://*.sendajob.com` (wildcard for all subdomains)
  - `https://online-booking.workiz.com`
  - `https://app.workiz.com`

### CSP Directives for Workiz
```typescript
"default-src": "'self' https://st.sendajob.com"
"script-src": "... https://st.sendajob.com https://*.sendajob.com"
"style-src": "... https://st.sendajob.com https://*.sendajob.com"
"font-src": "... https://st.sendajob.com https://*.sendajob.com"
"img-src": "... https://st.sendajob.com https://*.sendajob.com"
"connect-src": "... https://st.sendajob.com https://*.sendajob.com"
"frame-src": "... https://st.sendajob.com https://*.sendajob.com"
"form-action": "'self' https://st.sendajob.com https://*.sendajob.com"
```

## Styling

Both the contact form and confirmation page use consistent styling:

```tsx
<div className="bg-gray-800 rounded-md shadow-md overflow-hidden">
  {/* Content */}
</div>
```

This matches the ContactInfo component for visual consistency.

## Local Testing

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to contact page**:
   ```
   http://localhost:3000/contact
   ```

3. **Test confirmation page**:
   ```
   http://localhost:3000/confirmation
   ```

4. **Check browser console** (F12) for any CSP errors

## Troubleshooting

### "Content is blocked" Error

**Symptom**: Gray placeholder with document icon appears instead of form

**Solutions**:
1. **Hard refresh browser**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. **Clear browser cache** and reload
3. **Check CSP in DevTools**:
   - Open Network tab
   - Look for blocked requests to sendajob.com
   - Verify CSP headers in response

### Form Not Loading

**Possible Causes**:
1. **Workiz URL incorrect**: Verify form URL in Workiz dashboard
2. **Form not activated**: Check Workiz account settings
3. **CSP blocking**: Review middleware.ts CSP configuration
4. **Browser extensions**: Disable ad blockers/privacy extensions

### Confirmation Page Not Showing

**Check**:
1. Workiz redirect URL is configured correctly
2. `/app/confirmation/page.tsx` file exists
3. Dev server is running without errors

## Production Deployment

When deploying to production:

1. **Verify CSP configuration** in middleware.ts for production mode
2. **Update Workiz redirect URL** to production domain
3. **Test form submission** on production site
4. **Monitor for CSP violations** in browser console

## Contact Information Display

The ContactInfo component displays:
- General inquiry email and phone
- Technical support contact details
- Business address (Belmont, CA 94002)
- Office hours (Mon-Fri: 9 AM - 5 PM PST)
- Emergency support availability note

Located at: `/app/components/Contact/ContactInfo.tsx`

## SEO Configuration

### Contact Page
- **Title**: "Get a Free Quote | California Laser Cleaning | Z-Beam"
- **Description**: "Precision laser cleaning quotes for aerospace, marine, automotive & heritage projects"
- **Robots**: `noindex, follow`
- **Schema**: ContactPage with LocalBusiness mainEntity

### Confirmation Page
- **Title**: "Thank You for Your Inquiry | Z-Beam"
- **Robots**: `noindex, nofollow`
- No schema required (transient page)

## Future Enhancements

- [ ] Add analytics tracking for form submissions
- [ ] Implement custom success message variants
- [ ] Add form submission notification emails
- [ ] Create admin dashboard for form metrics
- [ ] A/B test different form layouts

## Related Files

- `/app/contact/page.tsx` - Contact page component
- `/app/confirmation/page.tsx` - Confirmation page component  
- `/app/components/Contact/ContactInfo.tsx` - Contact info display
- `/middleware.ts` - CSP configuration
- `/content/pages/contact.yaml` - Page metadata

## Support

For issues with the Workiz integration, contact:
- **Technical Support**: info@z-beam.com
- **Workiz Support**: support@workiz.com
