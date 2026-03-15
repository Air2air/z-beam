'use client';

import { useEffect, useRef } from 'react';

import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { trackContactPageGoogleAdsConversion, trackEvent } from '@/app/utils/analytics';

import { ContactInfo } from './ContactInfo';
const WORKIZ_CONTACT_FORM_URL = 'https://st.sendajob.com/MY/servicerequest/bc0bbe1e44d7eda5aed87bb3ababd7c52a171de4_f.html';
const CONTACT_PAGE_CONVERSION_SESSION_KEY = 'z-beam:contact-page-conversion-tracked';

function hasTrackedContactPageConversion() {
  try {
    return window.sessionStorage.getItem(CONTACT_PAGE_CONVERSION_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markContactPageConversionTracked() {
  try {
    window.sessionStorage.setItem(CONTACT_PAGE_CONVERSION_SESSION_KEY, '1');
  } catch {
    // Ignore storage failures and still attempt to fire the configured conversion.
  }
}

export function ContactLeadSection() {
  const hasTrackedViewRef = useRef(false);
  const hasTrackedIframeLoadRef = useRef(false);

  useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    trackEvent('contact_page_viewed', {
      event_category: 'Contact',
      event_label: 'Contact Page',
      page_location: '/contact',
    });

    if (!hasTrackedContactPageConversion()) {
      markContactPageConversionTracked();
      trackContactPageGoogleAdsConversion();
    }
  }, []);

  const handleIframeLoad = () => {
    if (hasTrackedIframeLoadRef.current) {
      return;
    }

    hasTrackedIframeLoadRef.current = true;
    trackEvent('contact_form_embed_loaded', {
      event_category: 'Contact',
      event_label: 'Workiz Contact Form',
      page_location: '/contact',
      provider: 'workiz',
      method: 'iframe',
    });
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${GRID_GAP_RESPONSIVE} mt-8 items-start`}>
      <div className="bg-gray-800 p-6 mb-6 rounded-md shadow-md">
        <iframe
          src={WORKIZ_CONTACT_FORM_URL}
          width="100%"
          height="650"
          scrolling="auto"
          style={{ border: 'none', display: 'block', borderRadius: '0.375rem' }}
          title="Contact Form"
          onLoad={handleIframeLoad}
        />
      </div>

      <ContactInfo />
    </div>
  );
}