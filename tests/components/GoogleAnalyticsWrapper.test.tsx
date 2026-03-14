import { act, render, screen } from '@testing-library/react';

import GoogleAnalyticsWrapper from '@/app/components/GoogleAnalyticsWrapper';

const usePathnameMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}));

describe('GoogleAnalyticsWrapper', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    usePathnameMock.mockReturnValue('/services');
    (window as Window & { gtag?: jest.Mock }).gtag = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('loads immediately on contact route and configures the ads tag', async () => {
    usePathnameMock.mockReturnValue('/contact');

    render(<GoogleAnalyticsWrapper gaId="G-TESTMEASURE" adsId="AW-123456789" />);

    expect(await screen.findByTestId('google-analytics')).toBeInTheDocument();
    expect(window.gtag).toHaveBeenCalledWith('config', 'AW-123456789');
  });

  it('waits for the fallback timer on non-priority routes', () => {
    render(<GoogleAnalyticsWrapper gaId="G-TESTMEASURE" adsId="AW-123456789" />);

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('google-analytics')).toBeInTheDocument();
    expect(window.gtag).toHaveBeenCalledWith('config', 'AW-123456789');
  });
});