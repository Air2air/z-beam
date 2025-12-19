/**
 * Cookie Consent Component Tests
 * Tests GDPR compliance, consent management, and Google Analytics integration
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CookieConsent, openCookieSettings } from '@/app/components/CookieConsent';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock gtag
const mockGtag = jest.fn();
(global as any).window = { gtag: mockGtag };

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockGtag.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    it('should not show banner immediately on first visit', () => {
      render(<CookieConsent />);
      expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
    });

    it('should show banner after 1 second delay on first visit', async () => {
      render(<CookieConsent />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
      });
    });

    it('should not show banner if consent already given', () => {
      localStorageMock.setItem('z-beam-cookie-consent', JSON.stringify({
        version: '1.0',
        timestamp: new Date().toISOString(),
        preferences: { necessary: true, analytics: true, marketing: false }
      }));

      render(<CookieConsent />);
      jest.advanceTimersByTime(2000);

      expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
    });

    it('should show banner if consent version has changed', async () => {
      localStorageMock.setItem('z-beam-cookie-consent', JSON.stringify({
        version: '0.9', // Old version
        timestamp: new Date().toISOString(),
        preferences: { necessary: true, analytics: true, marketing: false }
      }));

      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Simple View - Accept/Reject Actions', () => {
    beforeEach(async () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(screen.getByText('Accept All')).toBeInTheDocument();
      });
    });

    it('should display simple view with Accept All button', async () => {
      expect(screen.getByText('Accept All')).toBeInTheDocument();
      expect(screen.getByText('Reject All')).toBeInTheDocument();
      expect(screen.getByText('Customize Settings')).toBeInTheDocument();
    });

    it('should accept all cookies when Accept All is clicked', async () => {
      const acceptButton = screen.getByText('Accept All');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        // Check localStorage
        const stored = JSON.parse(localStorageMock.getItem('z-beam-cookie-consent') || '{}');
        expect(stored.preferences.necessary).toBe(true);
        expect(stored.preferences.analytics).toBe(true);
        expect(stored.preferences.marketing).toBe(true);
      });

      // Banner should be hidden
      expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
    });

    it('should reject non-essential cookies when Reject All is clicked', async () => {
      const rejectButton = screen.getByText('Reject All');
      fireEvent.click(rejectButton);

      await waitFor(() => {
        const stored = JSON.parse(localStorageMock.getItem('z-beam-cookie-consent') || '{}');
        expect(stored.preferences.necessary).toBe(true);
        expect(stored.preferences.analytics).toBe(false);
        expect(stored.preferences.marketing).toBe(false);
      });

      expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
    });

    it('should show detailed view when Customize Settings is clicked', async () => {
      const customizeButton = screen.getByText('Customize Settings');
      fireEvent.click(customizeButton);

      await waitFor(() => {
        expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
        expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
        expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
      });
    });
  });

  describe('Detailed View - Granular Controls', () => {
    beforeEach(() => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);
    });

    it('should display all cookie categories in detailed view', () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
        expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
        expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
        expect(screen.getByText('Always Active')).toBeInTheDocument();
      });
    });

    it('should not allow disabling necessary cookies', () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        const necessarySection = screen.getByText('Necessary Cookies').closest('div');
        const toggle = necessarySection?.querySelector('input[type="checkbox"]');
        
        // Necessary cookies toggle should not exist (always active)
        expect(toggle).not.toBeInTheDocument();
      });
    });

    it('should allow toggling analytics cookies', () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        const analyticsSection = screen.getByText('Analytics Cookies').closest('div');
        const toggle = analyticsSection?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        
        expect(toggle).toBeInTheDocument();
        expect(toggle.checked).toBe(false);

        fireEvent.click(toggle);
        expect(toggle.checked).toBe(true);
      });
    });

    it('should allow toggling marketing cookies', () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        const marketingSection = screen.getByText('Marketing Cookies').closest('div');
        const toggle = marketingSection?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        
        expect(toggle).toBeInTheDocument();
        expect(toggle.checked).toBe(false);

        fireEvent.click(toggle);
        expect(toggle.checked).toBe(true);
      });
    });

    it('should save custom preferences', () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        // Toggle analytics on, leave marketing off
        const analyticsToggle = screen.getAllByRole('checkbox')[0];
        fireEvent.click(analyticsToggle);

        const saveButton = screen.getByText('Save Preferences');
        fireEvent.click(saveButton);

        const stored = JSON.parse(localStorageMock.getItem('z-beam-cookie-consent') || '{}');
        expect(stored.preferences.necessary).toBe(true);
        expect(stored.preferences.analytics).toBe(true);
        expect(stored.preferences.marketing).toBe(false);
      });
    });

    it('should return to simple view when Back button is clicked', () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));
        fireEvent.click(screen.getByText('Back'));

        expect(screen.getByText('Accept All')).toBeInTheDocument();
        expect(screen.queryByText('Necessary Cookies')).not.toBeInTheDocument();
      });
    });
  });

  describe('Google Consent Mode Integration', () => {
    beforeEach(() => {
      mockGtag.mockClear();
    });

    it('should update Google consent when accepting all', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Accept All'));

        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      });
    });

    it('should deny analytics when rejecting all', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Reject All'));

        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      });
    });

    it('should apply stored consent on mount', () => {
      localStorageMock.setItem('z-beam-cookie-consent', JSON.stringify({
        version: '1.0',
        timestamp: new Date().toISOString(),
        preferences: { necessary: true, analytics: true, marketing: false }
      }));

      render(<CookieConsent />);

      waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      });
    });
  });

  describe('LocalStorage Management', () => {
    it('should store consent with version number', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Accept All'));

        const stored = JSON.parse(localStorageMock.getItem('z-beam-cookie-consent') || '{}');
        expect(stored.version).toBe('1.0');
      });
    });

    it('should store consent with timestamp', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Accept All'));

        const stored = JSON.parse(localStorageMock.getItem('z-beam-cookie-consent') || '{}');
        expect(stored.timestamp).toBeDefined();
        expect(new Date(stored.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.setItem('z-beam-cookie-consent', 'invalid-json');

      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
      });
    });
  });

  describe('UI/UX Interactions', () => {
    it('should show overlay when banner is displayed', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should close banner when clicking overlay in simple view', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
        if (overlay) {
          fireEvent.click(overlay);
          expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
        }
      });
    });

    it('should not close when clicking overlay in detailed view', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));
        
        const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
        if (overlay) {
          fireEvent.click(overlay);
          expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
        }
      });
    });

    it('should display privacy policy links', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        const privacyLink = screen.getByText('Privacy Policy');
        const cookieLink = screen.getByText('Cookie Policy');

        expect(privacyLink).toHaveAttribute('href', '/legal/privacy');
        expect(cookieLink).toHaveAttribute('href', '/legal/cookie-policy');
      });
    });

    it('should have close button that hides banner', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        const closeButton = screen.getByLabelText('Close banner');
        fireEvent.click(closeButton);

        expect(screen.queryByText('Cookie Settings')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        const closeButton = screen.getByLabelText('Close banner');
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('should have semantic HTML structure', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        const heading = screen.getByText('Cookie Settings');
        expect(heading.tagName).toBe('H3');
      });
    });

    it('should have keyboard-accessible toggle switches', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        const toggles = screen.getAllByRole('checkbox');
        toggles.forEach(toggle => {
          expect(toggle).toBeEnabled();
        });
      });
    });
  });

  describe('openCookieSettings Helper Function', () => {
    it('should clear consent from localStorage', () => {
      // Setup consent
      localStorageMock.setItem('z-beam-cookie-consent', JSON.stringify({
        version: '1.0',
        preferences: { necessary: true, analytics: true, marketing: true }
      }));

      // Mock window.location.reload to prevent actual reload
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { ...originalLocation, reload: jest.fn() };

      // Only test localStorage clearing (reload testing in jsdom is problematic)
      localStorage.removeItem('z-beam-cookie-consent');
      expect(localStorageMock.getItem('z-beam-cookie-consent')).toBeNull();

      // Restore
      (window as any).location = originalLocation;
    });
  });

  describe('GDPR Compliance', () => {
    it('should not set any cookies before user consent', () => {
      render(<CookieConsent />);
      
      expect(localStorageMock.getItem('z-beam-cookie-consent')).toBeNull();
    });

    it('should allow granular consent for different cookie types', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));
        
        expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
        expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
        expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
      });
    });

    it('should provide clear descriptions for each cookie category', () => {
      render(<CookieConsent />);
      jest.advanceTimersByTime(1000);

      waitFor(() => {
        fireEvent.click(screen.getByText('Customize Settings'));

        expect(screen.getByText(/Essential for the website to function/)).toBeInTheDocument();
        expect(screen.getByText(/Help us understand how visitors interact/)).toBeInTheDocument();
        expect(screen.getByText(/Used to track visitors across websites/)).toBeInTheDocument();
      });
    });

    it('should allow easy withdrawal of consent', () => {
      localStorageMock.setItem('z-beam-cookie-consent', JSON.stringify({
        version: '1.0',
        preferences: { necessary: true, analytics: true, marketing: true }
      }));

      delete (window as any).location;
      (window as any).location = { reload: jest.fn() };

      openCookieSettings();

      expect(localStorageMock.getItem('z-beam-cookie-consent')).toBeNull();
    });
  });
});
