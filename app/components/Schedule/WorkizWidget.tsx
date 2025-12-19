'use client';

import { useEffect, useRef } from 'react';

interface WorkizWidgetProps {
  companyId?: string;
  height?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Workiz Booking Widget Component
 * 
 * Embeds the Workiz booking portal widget.
 * 
 * @param companyId - Your Workiz company ID (optional if set in script)
 * @param height - Height of the widget (default: 600px)
 * @param className - Additional CSS classes
 */
export function WorkizWidget({ 
  companyId, 
  height = '700px',
  className = '',
  theme = 'dark'
}: WorkizWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only load script once
    if (scriptLoadedRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="workiz.com"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      
      // REPLACE WITH YOUR ACTUAL WORKIZ SCRIPT URL
      // Option 1: Direct iframe embed
      // script.src = 'https://app.workiz.com/booking-widget.js';
      
      // Option 2: Custom Workiz URL
      // script.src = 'https://YOUR_SUBDOMAIN.workiz.com/widget.js';
      
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Workiz widget script loaded successfully');
        scriptLoadedRef.current = true;
        
        // Initialize widget if needed
        if (window.WorkizWidget && iframeRef.current) {
          window.WorkizWidget.init({
            container: iframeRef.current,
            companyId: companyId,
          });
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Workiz widget script');
      };
      
      document.body.appendChild(script);
    } else {
      scriptLoadedRef.current = true;
    }

    // Cleanup
    return () => {
      // Optionally remove script on unmount
      // const script = document.querySelector('script[src*="workiz.com"]');
      // if (script) script.remove();
    };
  }, [companyId]);

  // Construct URL with optional theme parameter
  const widgetUrl = new URL(`https://app.workiz.com/booking/${companyId || 'YOUR_COMPANY_ID'}`);
  
  // Try adding theme parameter (may or may not be supported by Workiz)
  if (theme !== 'light') {
    widgetUrl.searchParams.set('theme', theme);
  }

  return (
    <div className={`workiz-widget-container ${className}`}>
      {/* Method 1: Direct iframe embed (most common) */}
      <iframe
        ref={iframeRef}
        src={widgetUrl.toString()}
        width="100%"
        height={height}
        frameBorder="0"
        style={{
          border: 'none',
          borderRadius: '8px',
          minHeight: height,
        }}
        title="Workiz Booking Portal"
        loading="lazy"
        allow="geolocation; camera; microphone"
      />

      {/* Method 2: Script-based widget (alternative) */}
      {/* Uncomment if using script-based approach */}
      {/* 
      <div 
        id="workiz-booking-widget" 
        data-company-id={companyId}
        style={{ minHeight: height }}
      ></div>
      */}

      {/* Loading fallback */}
      <noscript>
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            JavaScript is required to view the booking calendar.
          </p>
          <a 
            href={`https://app.workiz.com/booking/${companyId || 'YOUR_COMPANY_ID'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open booking portal in new window →
          </a>
        </div>
      </noscript>
    </div>
  );
}

// Type definitions for Workiz global object
declare global {
  interface Window {
    WorkizWidget?: {
      init: (config: { container: HTMLElement; companyId?: string }) => void;
    };
  }
}
