/**
 * @file SectionTitle.test.tsx
 * @description Tests for SectionTitle component
 * 
 * Tests cover:
 * - Basic rendering with title
 * - Subtitle rendering
 * - Description rendering with correct styling
 * - Icon rendering
 * - Thumbnail with fallback behavior
 * - Thumbnail link functionality
 * - Accessibility compliance
 * - Alignment options
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('SectionTitle', () => {
  describe('Basic Rendering', () => {
    it('renders title correctly', () => {
      render(<SectionTitle title="Test Title" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
    });

    it('generates ID from title', () => {
      render(<SectionTitle title="My Test Section" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'section-my-test-section');
    });

    it('uses custom ID when provided', () => {
      render(<SectionTitle title="Test" id="custom-id" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('Subtitle', () => {
    it('renders subtitle when provided', () => {
      render(<SectionTitle title="Title" subtitle="Subtitle text" />);
      expect(screen.getByText('Subtitle text')).toBeInTheDocument();
    });

    it('has correct role for subtitle', () => {
      render(<SectionTitle title="Title" subtitle="Subtitle text" />);
      const subtitle = screen.getByText('Subtitle text');
      expect(subtitle).toHaveAttribute('role', 'doc-subtitle');
    });

    it('does not render subtitle when not provided', () => {
      render(<SectionTitle title="Title" />);
      expect(screen.queryByRole('doc-subtitle')).not.toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('renders description when provided', () => {
      render(<SectionTitle title="Title" description="Description text" />);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('applies text-primary class to description', () => {
      render(<SectionTitle title="Title" description="Description text" />);
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-primary');
    });

    it('applies text-base class to description', () => {
      render(<SectionTitle title="Title" description="Description text" />);
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-base');
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      render(<SectionTitle title="Title" icon={<TestIcon />} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('marks icon as aria-hidden', () => {
      const TestIcon = () => <svg data-testid="test-icon" />;
      render(<SectionTitle title="Title" icon={<TestIcon />} />);
      const iconWrapper = screen.getByTestId('test-icon').parentElement;
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Thumbnail', () => {
    it('renders thumbnail image when provided', () => {
      const { container } = render(<SectionTitle title="Title" thumbnail="/test-image.jpg" />);
      const img = container.querySelector('img[src="/test-image.jpg"]');
      expect(img).toBeInTheDocument();
    });

    it('renders fallback logo when no thumbnail provided', () => {
      const { container } = render(<SectionTitle title="Title" />);
      const img = container.querySelector('img[src="/images/logo/logo-zbeam.png"]');
      expect(img).toBeInTheDocument();
    });

    it('has correct dimensions class', () => {
      const { container } = render(<SectionTitle title="Title" thumbnail="/test-image.jpg" />);
      const img = container.querySelector('img[src="/test-image.jpg"]');
      const thumbnailContainer = img?.parentElement;
      expect(thumbnailContainer).toHaveClass('w-24', 'h-14');
    });

    it('has rounded class without border', () => {
      const { container } = render(<SectionTitle title="Title" thumbnail="/test-image.jpg" />);
      const img = container.querySelector('img[src="/test-image.jpg"]');
      const thumbnailContainer = img?.parentElement;
      expect(thumbnailContainer).toHaveClass('rounded');
      expect(thumbnailContainer).not.toHaveClass('border');
    });
  });

  describe('Thumbnail Link', () => {
    it('wraps thumbnail in link when thumbnailLink provided', () => {
      render(
        <SectionTitle 
          title="Title" 
          thumbnail="/test-image.jpg" 
          thumbnailLink="/materials/metal/aluminum"
        />
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/materials/metal/aluminum');
    });

    it('has correct aria-label on link', () => {
      render(
        <SectionTitle 
          title="Title" 
          thumbnail="/test-image.jpg" 
          thumbnailLink="/materials/metal/aluminum"
          thumbnailAlt="Aluminum"
        />
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'View Aluminum page');
    });

    it('has thumbnail container when linked', () => {
      const { container } = render(
        <SectionTitle 
          title="Title" 
          thumbnail="/test-image.jpg" 
          thumbnailLink="/materials/metal/aluminum"
        />
      );
      const img = container.querySelector('img[src="/test-image.jpg"]');
      const thumbnailContainer = img?.parentElement;
      expect(thumbnailContainer).toBeInTheDocument();
      expect(thumbnailContainer).toHaveClass('cursor-pointer');
    });

    it('marks thumbnail as aria-hidden when not linked', () => {
      const { container } = render(<SectionTitle title="Title" thumbnail="/test-image.jpg" />);
      const img = container.querySelector('img[src="/test-image.jpg"]');
      // Navigate up: img -> thumbnail-inner -> thumbnail-wrapper -> aria-hidden div
      const thumbnailWrapper = img?.parentElement?.parentElement;
      expect(thumbnailWrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Alignment', () => {
    it('defaults to left alignment', () => {
      render(<SectionTitle title="Title" />);
      const textContainer = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(textContainer).toHaveClass('text-left');
    });

    it('supports center alignment', () => {
      render(<SectionTitle title="Title" alignment="center" />);
      const textContainer = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(textContainer).toHaveClass('text-center');
    });

    it('supports right alignment', () => {
      render(<SectionTitle title="Title" alignment="right" />);
      const textContainer = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(textContainer).toHaveClass('text-right');
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<SectionTitle title="Title" aria-label="Custom aria label" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('aria-label', 'Custom aria label');
    });

    it('links heading to subtitle via aria-describedby', () => {
      render(<SectionTitle title="Title" subtitle="Subtitle" />);
      const heading = screen.getByRole('heading', { level: 2 });
      const subtitle = screen.getByText('Subtitle');
      expect(heading).toHaveAttribute('aria-describedby', subtitle.id);
    });
  });

  describe('Spacing', () => {
    it('has mb-6 bottom margin', () => {
      render(<SectionTitle title="Title" />);
      const container = screen.getByRole('heading', { level: 2 }).parentElement?.parentElement;
      expect(container).toHaveClass('mb-6');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<SectionTitle title="Title" className="custom-class" />);
      const container = screen.getByRole('heading', { level: 2 }).parentElement?.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });
});
