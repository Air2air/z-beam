import { fireEvent, render, screen } from '@testing-library/react';

import { ContactLeadSection } from '@/app/components/Contact/ContactLeadSection';
import { trackContactPageGoogleAdsConversion, trackEvent } from '@/app/utils/analytics';

jest.mock('@/app/utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackContactPageGoogleAdsConversion: jest.fn(),
}));

describe('ContactLeadSection', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('tracks a Contact page view when rendered', () => {
    render(<ContactLeadSection />);

    expect(trackEvent).toHaveBeenCalledWith('contact_page_viewed', {
      event_category: 'Contact',
      event_label: 'Contact Page',
      page_location: '/contact',
    });
    expect(trackContactPageGoogleAdsConversion).toHaveBeenCalledTimes(1);
  });

  it('does not re-fire the Google Ads conversion on a same-session remount', () => {
    const firstRender = render(<ContactLeadSection />);
    firstRender.unmount();

    render(<ContactLeadSection />);

    expect(trackContactPageGoogleAdsConversion).toHaveBeenCalledTimes(1);
  });

  it('tracks the Workiz embed load once', () => {
    render(<ContactLeadSection />);

    const iframe = screen.getByTitle('Contact Form');
    fireEvent.load(iframe);
    fireEvent.load(iframe);

    expect(trackEvent).toHaveBeenCalledWith('contact_form_embed_loaded', {
      event_category: 'Contact',
      event_label: 'Workiz Contact Form',
      page_location: '/contact',
      provider: 'workiz',
      method: 'iframe',
    });

    const embedCalls = (trackEvent as jest.Mock).mock.calls.filter(
      ([eventName]) => eventName === 'contact_form_embed_loaded'
    );
    expect(embedCalls).toHaveLength(1);
  });
});