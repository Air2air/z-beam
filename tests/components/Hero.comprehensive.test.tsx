/**
 * Hero Component Tests (Simplified)
 * Tests the simplified Hero component functionality
 * 
 * CHANGES FROM ORIGINAL:
 * - No manual image preloading (Next.js Image handles it)
 * - Props are frontmatter-only (no direct image/video props)
 * - Only 2 state variables (imageLoaded, isInView)
 * - Video is simple string ID from frontmatter.video
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Hero } from '../../app/components/Hero/Hero';
import { SITE_CONFIG } from '../../app/utils/constants';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, onLoadStart, ...props }: any) => {
    // Simulate image loading behavior without React hooks in mock factory
    setTimeout(() => {
      if (onLoadStart) onLoadStart();
      if (onLoad) onLoad();
    }, 10);

    return (
      <img
        src={src}
        alt={alt}
        data-testid="next-image"
        data-priority={props.priority}
        data-fill={props.fill}
        {...props}
      />
    );
  },
}));

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock IntersectionObserver to trigger immediately
    mockIntersectionObserver.mockImplementation((callback) => ({
      observe: jest.fn((element) => {
        // Immediately trigger the callback with isIntersecting: true
        callback([{ isIntersecting: true }]);
      }),
      disconnect: jest.fn(),
    }));
  });

  describe('Basic Rendering', () => {
    it('should render basic hero with default props', () => {
      render(<Hero />);
      
      const hero = screen.getByRole('region');
      expect(hero).toBeInTheDocument();
      expect(hero).toHaveClass('theme-dark');
    });

    it('should apply fullwidth variant correctly', () => {
      render(<Hero variant="fullwidth" />);
      
      const hero = screen.getByRole('banner'); // fullwidth uses banner role
      expect(hero).toBeInTheDocument();
      expect(hero).toHaveClass('w-full');
    });

    it('should apply theme classes correctly', () => {
      render(<Hero theme="light" />);
      
      const hero = screen.getByRole('region');
      expect(hero).toHaveClass('theme-light');
    });

    it('should render children content', () => {
      render(
        <Hero>
          <div data-testid="hero-content">Hero content</div>
        </Hero>
      );
      
      expect(screen.getByTestId('hero-content')).toBeInTheDocument();
    });
  });

  describe('Video Integration', () => {
    it('should render YouTube video with standard parameters', () => {
      render(<Hero frontmatter={{ video: '123456' }} />);
      
      const iframe = screen.getByTitle('Video content');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/123456'));
      // Standard parameters are always included in simplified component
      expect(iframe).toHaveAttribute('src', expect.stringContaining('autoplay=1'));
      expect(iframe).toHaveAttribute('src', expect.stringContaining('mute=1'));
      expect(iframe).toHaveAttribute('src', expect.stringContaining('loop=1'));
    });

    it('should handle video from frontmatter string', () => {
      const frontmatter = { video: '789012' };
      render(<Hero frontmatter={frontmatter} />);
      
      const iframe = screen.getByTitle('Video content');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/789012'));
    });

    it('should have lazy loading attribute', () => {
      render(<Hero frontmatter={{ video: '123456' }} />);
      
      const iframe = screen.getByTitle('Video content');
      expect(iframe).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Image Integration', () => {
    it('should render image from frontmatter with Next.js Image component', async () => {
      render(<Hero frontmatter={{ image: '/test-hero.jpg' }} />);
      
      await waitFor(() => {
        const image = screen.getByTestId('next-image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/test-hero.jpg');
        expect(image).toHaveAttribute('alt', 'Hero background image');
      });
    });

    it('should use structured image from frontmatter', () => {
      const frontmatter = { images: { hero: { url: '/structured-hero.jpg', alt: 'Custom alt text' } } };
      render(<Hero frontmatter={frontmatter} />);
      
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', '/structured-hero.jpg');
      expect(image).toHaveAttribute('alt', 'Custom alt text');
    });

    it('should show placeholder when not in view', () => {
      // Mock IntersectionObserver to not trigger
      mockIntersectionObserver.mockImplementation((callback) => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
      }));

      render(<Hero frontmatter={{ image: '/hero.jpg' }} />);
      
      // Should show placeholder div with animate-pulse while not in view
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      expect(section.firstChild).toHaveClass('animate-pulse');
    });

    it('should handle default logo when no image provided', () => {
      render(<Hero />);
      
      const logo = screen.getByAltText(`${SITE_CONFIG.shortName} company logo`);
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/images/site/logo/logo_.png');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections', () => {
      render(<Hero />);
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-label', 'Hero section');
    });

    it('should generate contextual aria-labels from frontmatter title', () => {
      const frontmatter = { title: 'Industrial Cleaning' };
      render(<Hero frontmatter={frontmatter} />);
      
      const section = screen.getByLabelText('Hero section for Industrial Cleaning');
      expect(section).toBeInTheDocument();
    });

    it('should provide accessible video title and aria-label from frontmatter', () => {
      const frontmatter = { title: 'Industrial Cleaning', video: '123456' };
      render(<Hero frontmatter={frontmatter} />);
      
      const iframe = screen.getByTitle('Video content for Industrial Cleaning');
      expect(iframe).toHaveAttribute('aria-label', 'Video content for Industrial Cleaning - Video player');
    });

    it('should generate alt text from frontmatter for images', () => {
      const frontmatter = { title: 'Industrial Cleaning', image: '/hero.jpg' };
      render(<Hero frontmatter={frontmatter} />);
      
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Hero image for Industrial Cleaning');
    });

    it('should use custom alt text from frontmatter.images.hero.alt', () => {
      const frontmatter = { images: { hero: { url: '/hero.jpg', alt: 'Custom hero alt text' } } };
      render(<Hero frontmatter={frontmatter} />);
      
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Custom hero alt text');
    });

    it('should have accessible default logo', () => {
      render(<Hero />);
      
      const logo = screen.getByAltText(`${SITE_CONFIG.shortName} company logo`);
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('should set priority for fullwidth heroes', async () => {
      render(<Hero variant="fullwidth" frontmatter={{ image: '/hero.jpg' }} />);
      
      await waitFor(() => {
        const image = screen.getByTestId('next-image');
        expect(image).toHaveAttribute('data-priority', 'true');
      });
    });

    it('should not set priority for default heroes', async () => {
      render(<Hero frontmatter={{ image: '/hero.jpg' }} />);
      
      await waitFor(() => {
        const image = screen.getByTestId('next-image');
        expect(image).toHaveAttribute('data-priority', 'false');
      });
    });

    it('should use Intersection Observer for lazy loading', () => {
      render(<Hero frontmatter={{ image: '/hero.jpg' }} />);
      
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should provide placeholder while not in view', () => {
      // Mock IntersectionObserver to not trigger
      mockIntersectionObserver.mockImplementation((callback) => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
      }));

      render(<Hero frontmatter={{ image: '/hero.jpg' }} />);
      
      // Should show animate-pulse div while not in view
      const section = screen.getByRole('region');
      expect(section.firstChild).toHaveClass('animate-pulse');
    });
  });

  describe('Fallback Behavior', () => {
    it('should show default logo when no media provided', () => {
      render(<Hero />);
      
      const logo = screen.getByAltText(`${SITE_CONFIG.shortName} company logo`);
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/images/site/logo/logo_.png');
    });

    it('should prioritize video over image', () => {
      render(
        <Hero 
          frontmatter={{
            video: '123456',
            image: '/hero.jpg'
          }}
        />
      );
      
      expect(screen.getByTitle(/Video content/)).toBeInTheDocument();
      expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    });

    it('should show video when provided regardless of fallback image', async () => {
      render(
        <Hero 
          frontmatter={{
            video: 'valid-id',
            image: '/fallback.jpg'
          }}
        />
      );
      
      // Should show video, not image
      const iframe = screen.getByTitle(/Video content/);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/valid-id'));
      expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    });
  });
});