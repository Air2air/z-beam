import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageTitle } from '@/app/components/Title/PageTitle';

describe('PageTitle Component', () => {
  describe('Basic Rendering', () => {
    it('should render title correctly', () => {
      render(<PageTitle title="Test Title" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
    });

    it('should render pageDescription when provided', () => {
      render(
        <PageTitle 
          title="Test Title" 
          pageDescription="This is a test description"
        />
      );
      
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('should not render description element when pageDescription is not provided', () => {
      const { container } = render(<PageTitle title="Test Title" />);
      const descriptionElement = container.querySelector('#page-title-test-title-description');
      expect(descriptionElement).not.toBeInTheDocument();
    });
  });

  describe('Heading Levels', () => {
    it('should render h1 for page level', () => {
      render(<PageTitle title="Page Title" level="page" />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render h2 for section level', () => {
      render(<PageTitle title="Section Title" level="section" />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should render h3 for card level', () => {
      render(<PageTitle title="Card Title" level="card" />);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should default to page level when not specified', () => {
      render(<PageTitle title="Default Title" />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <PageTitle 
          title="Accessible Title"
          pageDescription="Accessible description"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('aria-level', '1');
    });

    it('should link description with aria-describedby when pageDescription provided', () => {
      const { container } = render(
        <PageTitle 
          title="Test Title"
          pageDescription="Test description"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      const ariaDescribedby = heading.getAttribute('aria-describedby');
      
      expect(ariaDescribedby).toBeTruthy();
      
      const descriptionElement = container.querySelector(`#${ariaDescribedby}`);
      expect(descriptionElement).toHaveTextContent('Test description');
    });

    it('should support custom aria-label', () => {
      render(
        <PageTitle 
          title="Title"
          aria-label="Custom accessible label"
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('aria-label', 'Custom accessible label');
    });

    it('should have proper tabIndex for keyboard navigation', () => {
      render(<PageTitle title="Keyboard Nav Title" level="page" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Right Content', () => {
    it('should render default button for page level when rightContent not provided', () => {
      render(<PageTitle title="Page Title" level="page" />);
      expect(screen.getByText("Let's talk")).toBeInTheDocument();
    });

    it('should render custom rightContent when provided', () => {
      render(
        <PageTitle 
          title="Custom Title"
          rightContent={<button>Custom Button</button>}
        />
      );
      
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
      expect(screen.queryByText("Let's talk")).not.toBeInTheDocument();
    });

    it('should not render button for non-page levels', () => {
      render(<PageTitle title="Section Title" level="section" />);
      expect(screen.queryByText("Let's talk")).not.toBeInTheDocument();
    });
  });

  describe('ID Generation', () => {
    it('should generate unique ID when not provided', () => {
      const { container } = render(<PageTitle title="Auto ID Title" />);
      const heading = container.querySelector('h1');
      const id = heading?.getAttribute('id');
      
      expect(id).toBeTruthy();
      expect(id).toMatch(/^page-title-/);
    });

    it('should use custom ID when provided', () => {
      render(<PageTitle title="Custom ID Title" id="custom-title-id" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'custom-title-id');
    });

    it('should generate description ID based on title ID', () => {
      const { container } = render(
        <PageTitle 
          title="Test"
          id="test-title"
          pageDescription="Test description"
        />
      );
      
      const description = container.querySelector('#test-title-description');
      expect(description).toHaveAttribute('id', 'test-title-description');
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      render(<PageTitle title="Styled Title" className="custom-class" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('custom-class');
    });

    it('should have proper wrapper structure', () => {
      const { container } = render(
        <PageTitle 
          title="Wrapper Test"
          pageDescription="Description"
        />
      );
      
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('w-full');
    });
  });

  describe('SEO and Schema', () => {
    it('should include itemProp for page level', () => {
      render(<PageTitle title="SEO Title" level="page" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('itemProp', 'headline');
    });

    it('should not include itemProp for non-page levels', () => {
      render(<PageTitle title="Section Title" level="section" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).not.toHaveAttribute('itemProp');
    });
  });

  describe('Prop Naming (Breaking Change)', () => {
    it('should use pageDescription prop (not description)', () => {
      render(
        <PageTitle 
          title="Migration Test"
          pageDescription="New prop name"
        />
      );
      
      expect(screen.getByText('New prop name')).toBeInTheDocument();
    });

    it('should not error when pageDescription is undefined', () => {
      expect(() => {
        render(<PageTitle title="No Description" />);
      }).not.toThrow();
    });
  });
});
