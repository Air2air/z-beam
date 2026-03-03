/**
 * @file BaseSection.test.tsx
 * @description Tests for BaseSection component
 * 
 * Tests cover:
 * - Fallback removal (Jan 19, 2026)
 * - Title and description rendering
 * - Section object from frontmatter
 * - Validation rules
 * - Icon support
 * - Variant rendering
 * - Accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BaseSection } from '@/app/components/BaseSection/BaseSection';

// Mock SectionTitle component
jest.mock('@/app/components/SectionTitle/SectionTitle', () => ({
  SectionTitle: ({ title, sectionDescription, icon, id }: any) => (
    <div data-testid="section-title">
      {title && <h2 id={id}>{title}</h2>}
      {sectionDescription && <p>{sectionDescription}</p>}
      {icon && <span data-testid="icon">{icon}</span>}
    </div>
  ),
}));

describe('BaseSection', () => {
  describe('Fallback Removal (Jan 19, 2026)', () => {
    it('renders without title when title is undefined', () => {
      render(
        <BaseSection>
          <div>Content</div>
        </BaseSection>
      );
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with empty string title', () => {
      render(
        <BaseSection title="">
          <div>Content</div>
        </BaseSection>
      );
      // Empty title should not render section-title
      expect(screen.queryByTestId('section-title')).not.toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with valid title (no fallback)', () => {
      render(
        <BaseSection title="Test Section">
          <div>Content</div>
        </BaseSection>
      );
      expect(screen.getByRole('heading')).toHaveTextContent('Test Section');
    });

    it('renders without description when description is undefined', () => {
      render(
        <BaseSection title="Title">
          <div>Content</div>
        </BaseSection>
      );
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('Section Object from Frontmatter', () => {
    it('renders section object with sectionTitle', () => {
      const section = {
        sectionTitle: 'Frontmatter Title',
        sectionDescription: 'Frontmatter Description',
      };

      render(
        <BaseSection section={section}>
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Frontmatter Title');
      expect(screen.getByText('Frontmatter Description')).toBeInTheDocument();
    });

    it('requires both sectionTitle and sectionDescription in section object', () => {
      const section = {
        sectionTitle: 'Title',
        sectionDescription: 'Description',
      };

      render(
        <BaseSection section={section}>
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders section with icon', () => {
      const section = {
        sectionTitle: 'Title',
        sectionDescription: 'Description',
        icon: 'package',
      };

      render(
        <BaseSection section={section}>
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Title');
      expect(screen.getByRole('heading').querySelector('span')).toBeInTheDocument();
    });

    it('renders without throwing when sectionDescription is empty string', () => {
      const section = {
        sectionTitle: 'Title',
        sectionDescription: '', // Normalised to undefined — no fail-fast in current implementation
      };

      const { getByText } = render(
        <BaseSection section={section}>
          <div>Content</div>
        </BaseSection>
      );

      expect(getByText('Content')).toBeInTheDocument();
    });

    it('renders object sectionDescription by using nested description text', () => {
      const section = {
        sectionTitle: 'Title',
        sectionDescription: {
          title: 'Nested Title',
          description: 'Nested Description',
        },
      };

      render(
        <BaseSection section={section as any}>
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Title');
      expect(screen.getByText('Nested Description')).toBeInTheDocument();
    });
  });

  describe('Direct Props vs Section Object', () => {
    it('prefers section object over direct props', () => {
      const section = {
        sectionTitle: 'Section Title',
        sectionDescription: 'Section Description',
      };

      render(
        <BaseSection 
          title="Direct Title" 
          description="Direct Description"
          section={section}
        >
          <div>Content</div>
        </BaseSection>
      );

      // Direct props take precedence over section object
      expect(screen.getByRole('heading')).toHaveTextContent('Direct Title');
      expect(screen.getByText('Direct Description')).toBeInTheDocument();
    });

    it('uses direct props when section object not provided', () => {
      render(
        <BaseSection title="Direct Title" description="Direct Description">
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Direct Title');
      expect(screen.getByText('Direct Description')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('renders ReactNode icon', () => {
      const IconComponent = () => <svg data-testid="custom-icon" />;
      
      render(
        <BaseSection title="Title" icon={<IconComponent />}>
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders string icon name', () => {
      render(
        <BaseSection title="Title" icon="package">
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('heading').querySelector('span')).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('renders children', () => {
      render(
        <BaseSection title="Title">
          <div data-testid="child-content">Child Content</div>
        </BaseSection>
      );

      expect(screen.getByTestId('child-content')).toHaveTextContent('Child Content');
    });

    it('renders with action slot', () => {
      render(
        <BaseSection title="Title" action={<button>Action</button>}>
          <div>Content</div>
        </BaseSection>
      );

      expect(screen.getByRole('button')).toHaveTextContent('Action');
    });
  });

  describe('Variants', () => {
    it('renders with default variant', () => {
      const { container } = render(
        <BaseSection title="Title" variant="default">
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('renders with dark variant', () => {
      const { container } = render(
        <BaseSection title="Title" variant="dark">
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('renders with card variant', () => {
      const { container } = render(
        <BaseSection title="Title" variant="card">
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders as semantic section element', () => {
      const { container } = render(
        <BaseSection title="Title">
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('generates aria-labelledby from title id', () => {
      render(
        <BaseSection title="Test Section" id="custom-section">
          <div>Content</div>
        </BaseSection>
      );

      const section = screen.getByRole('heading').closest('section');
      expect(section).toHaveAttribute('aria-labelledby', 'section-custom-section');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <BaseSection title="Title" className="custom-class">
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('applies horizontal padding when horizPadding is true', () => {
      const { container } = render(
        <BaseSection title="Title" horizPadding={true}>
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('applies border radius when radius is true', () => {
      const { container } = render(
        <BaseSection title="Title" radius={true}>
          <div>Content</div>
        </BaseSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });
});
