# Replacing Contact Form with Workiz Booking Widget

## Overview

This guide explains how to replace the current custom ContactForm component with Workiz's native booking widget, which provides a unified experience for scheduling consultations and submitting inquiries.

## Current Architecture

### Existing Contact Form
- **Location**: `app/components/Contact/ContactForm.tsx`
- **API**: `app/api/contact/route.ts`
- **Page**: `app/contact/page.tsx`
- **Features**:
  - Custom React form with validation
  - Email/phone/message fields
  - API endpoint for form submissions
  - Accessibility features (WCAG 2.1 AA compliant)

### Existing Workiz Integration
- **Component**: `app/components/Schedule/WorkizWidget.tsx`
- **Booking URL**: `https://online-booking.workiz.com/?ac=a92273bb2e08e9ada5fbf60a0243f8a863a000f6bdd5c583c0f98ae74aef35fb`
- **Current Use**: Scheduling page (`/schedule`)

## Workiz Online Booking Widget

### What It Does
Workiz provides an embeddable booking portal that:
- ✅ Collects customer information (name, email, phone)
- ✅ Allows service selection
- ✅ Provides calendar for scheduling
- ✅ Creates jobs directly in Workiz
- ✅ Sends confirmation emails
- ✅ Handles rescheduling/cancellations
- ✅ Mobile-responsive interface

### Advantages Over Custom Form
1. **Direct Integration**: Data goes straight to Workiz (no middleware)
2. **Job Creation**: Automatically creates job records
3. **Scheduling**: Built-in calendar interface
4. **Customer Management**: Auto-creates customer records
5. **Notifications**: Built-in email/SMS confirmations
6. **No Backend Required**: Eliminates need for `/api/contact` route
7. **Maintenance**: Workiz handles updates and security

## Implementation Options

### Option 1: Replace Contact Form Entirely (Recommended)

Replace the custom ContactForm with WorkizWidget on the contact page.

**Pros:**
- Unified booking/inquiry system
- Less code to maintain
- Direct Workiz integration
- Professional scheduling interface

**Cons:**
- Users must select a service type
- Slightly longer form (includes scheduling)

### Option 2: Hybrid Approach

Keep custom form for quick inquiries, add Workiz widget for consultations.

**Pros:**
- Quick contact option available
- Detailed booking for consultations
- Flexibility for different inquiry types

**Cons:**
- More components to maintain
- Split user experience
- API endpoint still needed

### Option 3: Contact Form Submits to Workiz API

Keep custom form UI, submit data to Workiz via API.

**Pros:**
- Maintains current UX
- Data still goes to Workiz
- Custom validation

**Cons:**
- Requires Workiz API integration
- More complex implementation
- API key management needed

## Recommended Implementation: Option 1

### Step 1: Update Environment Variables

Add Workiz configuration to `.env.local`:

```bash
# Workiz Online Booking Portal
NEXT_PUBLIC_WORKIZ_BOOKING_URL=https://online-booking.workiz.com/?ac=a92273bb2e08e9ada5fbf60a0243f8a863a000f6bdd5c583c0f98ae74aef35fb

# Optional: Workiz Company ID (if using JavaScript SDK)
NEXT_PUBLIC_WORKIZ_COMPANY_ID=your-company-id
```

### Step 2: Update Contact Page

Replace ContactForm with WorkizWidget:

```tsx
// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from "../components/JsonLD/JsonLD";
import { loadStaticPage } from '@/app/utils/staticPageLoader';
import { ArticleMetadata } from "@/types";
import dynamicImport from "next/dynamic";
import Link from "next/link";

import { SITE_CONFIG, GRID_GAP_RESPONSIVE } from "@/app/config/site";

// Import WorkizWidget instead of ContactForm
const WorkizWidget = dynamicImport(
  () =>
    import("../components/Schedule/WorkizWidget").then((mod) => ({
      default: mod.WorkizWidget,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

import { ContactInfo } from "../components/Contact/ContactInfo";

export const metadata = {
  title: "Get a Free Quote | Bay Area Laser Cleaning | Z-Beam",
  description:
    "Precision laser cleaning quotes for aerospace, marine, automotive & heritage projects. No chemicals, no substrate damage. Same-day response. Bay Area mobile service.",
  // ... rest of metadata
};

export default function ContactPage() {
  const pageMetadata = loadStaticPage<ArticleMetadata>('contact.yaml');

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Z-Beam Laser Cleaning",
    description: "Schedule a consultation or request a quote for precision laser cleaning services",
    url: `${SITE_CONFIG.url}/contact`,
    // ... rest of schema
  };

  return (
    <>
      <JsonLD data={contactSchema} />
      <Layout
        title="Schedule a Consultation"
        description="Book your free laser cleaning consultation or request a custom quote"
        rightContent={
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-brand-orange hover:bg-brand-orange-dark focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03] px-2.5 py-1 text-base min-h-[40px]"
            style={{ color: '#2d3441' }}
          >
            View Services
            <span className="inline-flex items-center w-5 h-5 ml-1.5">
              <svg
                aria-hidden="true"
                role="presentation"
                focusable="false"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        }
        metadata={
          {
            ...pageMetadata,
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Contact", href: "/contact" },
            ],
          } as unknown as ArticleMetadata
        }
        slug="contact"
      >
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${GRID_GAP_RESPONSIVE} mt-8`}>
          {/* Workiz Booking Widget - Primary Column */}
          <div className="lg:col-span-1">
            <WorkizWidget 
              height="800px" 
              className="rounded-lg shadow-xl"
            />
            
            {/* Optional: Additional Instructions */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">What to Expect</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Select the service you're interested in</li>
                <li>✓ Choose a convenient date and time</li>
                <li>✓ Provide project details</li>
                <li>✓ Receive instant confirmation</li>
                <li>✓ We'll follow up within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Contact Info - Secondary Column */}
          <div className="lg:col-span-1">
            <ContactInfo />
            
            {/* Optional: Quick Contact Card */}
            <div className="mt-6 p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Need Immediate Assistance?</h3>
              <div className="space-y-3">
                <a 
                  href="tel:+14155550123" 
                  className="flex items-center text-lg hover:text-brand-orange transition-colors"
                >
                  📞 (415) 555-0123
                </a>
                <a 
                  href="mailto:info@z-beam.com" 
                  className="flex items-center text-lg hover:text-brand-orange transition-colors"
                >
                  ✉️ info@z-beam.com
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Available Mon-Fri, 9 AM - 5 PM PST
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
```

### Step 3: Update WorkizWidget Component (Optional Enhancements)

Add additional features to the WorkizWidget component:

```tsx
// app/components/Schedule/WorkizWidget.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface WorkizWidgetProps {
  companyId?: string;
  height?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showLoadingMessage?: boolean;
  prefilledData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function WorkizWidget({ 
  companyId, 
  height = '700px',
  className = '',
  theme = 'dark',
  showLoadingMessage = true,
  prefilledData
}: WorkizWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Build widget URL with optional prefilled data
  let widgetUrl = process.env.NEXT_PUBLIC_WORKIZ_BOOKING_URL || 
    'https://online-booking.workiz.com/?ac=a92273bb2e08e9ada5fbf60a0243f8a863a000f6bdd5c583c0f98ae74aef35fb';

  // Add prefilled data as URL parameters if provided
  if (prefilledData) {
    const params = new URLSearchParams();
    if (prefilledData.name) params.set('name', prefilledData.name);
    if (prefilledData.email) params.set('email', prefilledData.email);
    if (prefilledData.phone) params.set('phone', prefilledData.phone);
    
    const queryString = params.toString();
    if (queryString) {
      widgetUrl += (widgetUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      console.log('Workiz booking widget loaded successfully');
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.error('Failed to load Workiz booking widget');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Set timeout for loading state
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        console.warn('Workiz widget load timeout');
      }
    }, 10000); // 10 second timeout

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [isLoading]);

  return (
    <div className={`workiz-widget-container relative ${className}`}>
      {/* Loading State */}
      {isLoading && showLoadingMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-gray-300">Loading booking calendar...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg z-10 p-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">Unable to load booking calendar</p>
            <a 
              href={widgetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange hover:underline"
            >
              Open booking portal in new window →
            </a>
          </div>
        </div>
      )}

      {/* Workiz Iframe */}
      <iframe
        ref={iframeRef}
        src={widgetUrl}
        width="100%"
        height={height}
        frameBorder="0"
        style={{
          border: 'none',
          borderRadius: '8px',
          minHeight: height,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        title="Workiz Booking Portal"
        loading="lazy"
        allow="geolocation; camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />

      {/* Fallback for no JavaScript */}
      <noscript>
        <div className="p-8 text-center bg-gray-800 rounded-lg">
          <p className="text-gray-300 mb-4">
            JavaScript is required to view the booking calendar.
          </p>
          <a 
            href={widgetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange hover:underline"
          >
            Open booking portal in new window →
          </a>
        </div>
      </noscript>
    </div>
  );
}

// Type definitions
declare global {
  interface Window {
    WorkizWidget?: {
      init: (config: { container: HTMLElement; companyId?: string }) => void;
    };
  }
}
```

### Step 4: Clean Up Unused Files (Optional)

If fully replacing the custom contact form, you can remove:

```bash
# Move to archive or delete
app/components/Contact/ContactForm.tsx
app/api/contact/route.ts
tests/components/Contact.accessibility.test.tsx (contact form specific tests)
```

**Note:** Keep `ContactInfo.tsx` as it provides static contact information.

### Step 5: Update Navigation/CTAs

Update any links or buttons that point to the contact form:

```tsx
// Example: Update CTA text
<Link href="/contact">
  Schedule a Consultation  {/* Changed from "Contact Us" */}
</Link>
```

## Configuration Options

### Workiz Widget Customization

The Workiz online booking portal supports URL parameters for customization:

```
https://online-booking.workiz.com/?ac=[YOUR_AUTH_CODE]
  &name=John+Doe              # Prefill name
  &email=john@example.com     # Prefill email
  &phone=4155550123           # Prefill phone
  &service=123                # Preselect service ID
  &hideHeader=true            # Hide Workiz branding
  &theme=dark                 # Set theme (if supported)
```

### Service Types in Workiz

Ensure your Workiz account has appropriate service types configured:
- ✓ Free Consultation (30 min)
- ✓ Site Assessment (60 min)
- ✓ Custom Quote Request
- ✓ Emergency Service
- ✓ Follow-up Consultation

## Testing Checklist

- [ ] Widget loads correctly on `/contact` page
- [ ] All service types appear in dropdown
- [ ] Calendar shows available time slots
- [ ] Form validation works (required fields)
- [ ] Submission creates job in Workiz
- [ ] Customer record created/updated in Workiz
- [ ] Confirmation email sent to customer
- [ ] Mobile responsive (test on phone)
- [ ] Loading states work correctly
- [ ] Error handling works (test with network throttling)
- [ ] Accessibility (keyboard navigation, screen reader)

## Analytics & Tracking

Add tracking for Workiz widget interactions:

```tsx
// app/contact/page.tsx
useEffect(() => {
  // Track widget view
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'workiz_widget_viewed', {
      page_path: '/contact',
      widget_type: 'booking'
    });
  }
}, []);
```

## Troubleshooting

### Widget Not Loading
1. Check `NEXT_PUBLIC_WORKIZ_BOOKING_URL` is set correctly
2. Verify authentication code (`ac=...`) is valid
3. Check browser console for CSP errors
4. Test URL directly in browser

### Form Submissions Not Creating Jobs
1. Verify Workiz account is active
2. Check service types are configured
3. Test with Workiz support sandbox
4. Review Workiz activity log

### Mobile Display Issues
1. Set appropriate `height` prop (e.g., '100vh' for mobile)
2. Test on actual devices (not just dev tools)
3. Consider responsive height: `height={isMobile ? '100vh' : '800px'}`

## Cost Considerations

- **Workiz Plan**: Online Booking feature included in Standard plan ($49/mo) and above
- **No API Costs**: Direct embed doesn't use API quota
- **Form Submissions**: Unlimited within plan limits

## Migration Strategy

### Phase 1: Parallel Testing (Week 1)
- Keep both ContactForm and WorkizWidget live
- A/B test with 50/50 traffic split
- Monitor submission rates and user feedback

### Phase 2: Primary Switch (Week 2)
- Make WorkizWidget primary on `/contact`
- Keep ContactForm as fallback
- Monitor for issues

### Phase 3: Full Migration (Week 3)
- Remove ContactForm component
- Remove `/api/contact` endpoint
- Update all CTAs and documentation

## Support Resources

- **Workiz Online Booking**: https://support.workiz.com/hc/en-us/sections/360004895033-Online-Booking
- **Workiz Widget Documentation**: Contact Workiz support for embed documentation
- **API Integration**: https://api.workiz.com/docs (if using custom form + API)

## Next Steps

1. ✅ Review implementation options
2. ⬜ Choose Option 1 (Replace) or Option 2 (Hybrid)
3. ⬜ Update `.env.local` with Workiz URL
4. ⬜ Implement changes to `contact/page.tsx`
5. ⬜ Test booking flow end-to-end
6. ⬜ Update CTAs and navigation
7. ⬜ Deploy to production
8. ⬜ Monitor submissions in Workiz dashboard
