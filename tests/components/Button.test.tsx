/**
 * Tests for app/components/Button.tsx - Reusable Button Component
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/app/components/Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render button with children text', () => {
      render(<Button>Click Me</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should render button with default type "button"', () => {
      render(<Button>Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render button with submit type', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render button with reset type', () => {
      render(<Button type="reset">Reset</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant classes by default', () => {
      render(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200', 'text-gray-900', 'hover:bg-gray-300');
    });

    it('should apply danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
    });

    it('should apply inverted variant classes', () => {
      render(<Button variant="inverted">Inverted</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-gray-900', 'hover:bg-gray-100');
    });

    it('should apply minimal variant classes', () => {
      render(<Button variant="minimal">Minimal</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-gray-700', 'hover:bg-gray-100');
    });
  });

  describe('Sizes', () => {
    it('should apply medium size classes by default', () => {
      render(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      render(<Button>Enabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply disabled classes when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler multiple times', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should work without onClick handler', () => {
      render(<Button>No Handler</Button>);
      
      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should combine base, variant, size, and custom classes', () => {
      render(<Button variant="secondary" size="lg" className="mt-4">Combined</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200'); // variant
      expect(button).toHaveClass('px-6'); // size
      expect(button).toHaveClass('mt-4'); // custom
      expect(button).toHaveClass('btn'); // base
    });

    it('should work without custom className', () => {
      render(<Button>No Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'bg-blue-600'); // base and variant only
    });
  });

  describe('Base Classes', () => {
    it('should always apply base button classes', () => {
      render(<Button>Base Classes</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'btn',
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'transition-colors'
      );
    });

    it('should apply focus-visible classes', () => {
      render(<Button>Focus</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-offset-2');
    });
  });

  describe('Accessibility', () => {
    it('should have role button', () => {
      render(<Button>Accessible</Button>);
      
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should be keyboard accessible', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should support screen readers with children content', () => {
      render(<Button>Screen Reader Text</Button>);
      
      const button = screen.getByRole('button', { name: 'Screen Reader Text' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Variant and Size Combinations', () => {
    it('should combine secondary variant with small size', () => {
      render(<Button variant="secondary" size="sm">Small Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200', 'px-3', 'py-1.5');
    });

    it('should combine danger variant with large size', () => {
      render(<Button variant="danger" size="lg">Large Danger</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'px-6', 'py-3');
    });

    it('should combine minimal variant with medium size', () => {
      render(<Button variant="minimal" size="md">Medium Minimal</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'px-4', 'py-2');
    });
  });

  describe('Children Types', () => {
    it('should render string children', () => {
      render(<Button>String Child</Button>);
      expect(screen.getByText('String Child')).toBeInTheDocument();
    });

    it('should render element children', () => {
      render(
        <Button>
          <span data-testid="child-span">Element Child</span>
        </Button>
      );
      expect(screen.getByTestId('child-span')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Button>
          <span>First</span>
          <span>Second</span>
        </Button>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should render with icon and text', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          <span>With Icon</span>
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });
  });
});
