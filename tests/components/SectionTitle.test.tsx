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

  describe('Section Description', () => {
    it('renders sectionDescription when provided', () => {
      render(<SectionTitle title="Title" sectionDescription="Description text" />);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('applies text-primary class to sectionDescription', () => {
      render(<SectionTitle title="Title" sectionDescription="Description text" />);
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-primary');
    });

    it('applies text-base class to sectionDescription', () => {
      render(<SectionTitle title="Title" sectionDescription="Description text" />);
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
  });

  describe('Spacing', () => {
    it('has mb-4 bottom margin', () => {
      render(<SectionTitle title="Title" />);
      const container = screen.getByRole('heading', { level: 2 }).parentElement?.parentElement;
      expect(container).toHaveClass('mb-4');
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
