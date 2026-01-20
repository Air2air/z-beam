'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Settings } from 'lucide-react';

type ConsentPreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_STORAGE_KEY = 'z-beam-cookie-consent';
const CONSENT_VERSION = '1.0';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has been given
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    
    if (!storedConsent) {
      // Show banner after a short delay (better UX)
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed.version === CONSENT_VERSION) {
          // Apply stored preferences
          applyConsent(parsed.preferences);
        } else {
          // Version changed, request new consent
          setShowBanner(true);
        }
      } catch (_e) {
        setShowBanner(true);
      }
    }
  }, []);

  const applyConsent = (prefs: ConsentPreferences) => {
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
        ad_user_data: prefs.marketing ? 'granted' : 'denied',
        ad_personalization: prefs.marketing ? 'granted' : 'denied',
      });
    }

    // Store preferences
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      preferences: prefs,
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    applyConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    applyConsent(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    applyConsent(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm transition-opacity"
        onClick={() => !showDetails && setShowBanner(false)}
      />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:max-w-md z-[9999] animate-slide-up">
        <div className="bg-white dark:bg-gray-800 shadow-2xl md:rounded-md border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Cookie Settings
              </h3>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {!showDetails ? (
              // Simple view
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and provide 
                  personalized content. By clicking "Accept All", you consent to our use of cookies.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="w-full bg-orange-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 px-4 rounded-md transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="w-full text-orange-600 dark:text-orange-400 hover:underline text-sm py-2"
                  >
                    Customize Settings
                  </button>
                </div>
              </>
            ) : (
              // Detailed view
              <>
                <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Necessary Cookies */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Necessary Cookies
                        </h4>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                      Essential for the website to function. These cookies enable core functionality 
                      such as security, network management, and accessibility.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-orange-600 dark:text-blue-400" />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Analytics Cookies
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={() => togglePreference('analytics')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                      Help us understand how visitors interact with our website. We use Google Analytics 
                      to collect anonymous data about page views, user behavior, and site performance.
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Marketing Cookies
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={() => togglePreference('marketing')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                      Used to track visitors across websites for marketing purposes. These cookies 
                      enable personalized advertising and remarketing campaigns.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSavePreferences}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="w-full text-gray-600 dark:text-gray-400 hover:underline text-sm py-2"
                  >
                    Back
                  </button>
                </div>

                {/* Privacy Policy Link */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Read our{' '}
                  <a 
                    href="/legal/privacy" 
                    className="text-orange-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a 
                    href="/legal/cookie-policy" 
                    className="text-orange-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cookie Policy
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// Export function to programmatically open cookie settings
export function openCookieSettings() {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.location.reload();
}
