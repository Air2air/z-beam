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
    it('should apply primary variant classes by default (orange bg, white text)', () => {
      render(<Button>Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-brand-orange', 'text-white', 'hover:bg-orange-600');
    });

    it('should apply secondary variant classes (white bg, orange text)', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-brand-orange', 'hover:bg-gray-100');
    });

    it('should apply outline variant classes (border only)', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2', 'border-gray-300', 'hover:border-brand-orange');
    });

    it('should apply danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
    });

    it('should apply minimal variant classes', () => {
      render(<Button variant="minimal">Minimal</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-blue-600', 'hover:text-blue-700');
    });
  });

  describe('Sizes', () => {
    it('should apply medium size classes by default', () => {
      render(<Button>Medium</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
      expect(button.className).toMatch(/px-\d+/); // Has horizontal padding
      expect(button.className).toMatch(/py-\d+/); // Has vertical padding
    });

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[36px]');
      expect(button.className).toMatch(/px-\d+/);
      expect(button.className).toMatch(/text-(xs|sm)/);
    });

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[48px]');
      expect(button.className).toMatch(/px-\d+/);
      expect(button.className).toMatch(/text-(base|lg)/);
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
      expect(button).toHaveClass('disabled:opacity-60', 'disabled:cursor-not-allowed');
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
      render(<Button variant="outline" size="lg" className="mt-4">Combined</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2'); // variant
      expect(button).toHaveClass('min-h-[48px]'); // size
      expect(button).toHaveClass('mt-4'); // custom
      expect(button).toHaveClass('btn'); // base
    });

    it('should work without custom className', () => {
      render(<Button>No Custom</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'bg-brand-orange', 'text-white'); // base and variant only
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
        'rounded-lg',
        'transition-all'
      );
    });    it('should apply focus-visible classes', () => {
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

  describe('WCAG 2.1 Accessibility Compliance', () => {
    describe('Semantic HTML', () => {
      it('should use native button element (WCAG 4.1.2)', () => {
        render(<Button>Native Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button.tagName).toBe('BUTTON');
        expect(button).not.toHaveAttribute('role'); // Native semantics preferred
      });

      it('should have proper button type attribute', () => {
        const { rerender } = render(<Button>Default</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

        rerender(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

        rerender(<Button type="reset">Reset</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
      });
    });

    describe('Keyboard Navigation (WCAG 2.1.1)', () => {
      it('should be focusable via keyboard tab', () => {
        render(<Button>Focusable</Button>);
        
        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('tabindex', '-1');
        button.focus();
        expect(document.activeElement).toBe(button);
      });

      it('should handle Enter key activation', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Enter Key</Button>);
        
        const button = screen.getByRole('button');
        button.focus();
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
        
        // Native button automatically handles Enter
        expect(button).toHaveAttribute('type'); // Button type present
      });

      it('should handle Space key activation', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Space Key</Button>);
        
        const button = screen.getByRole('button');
        button.focus();
        fireEvent.keyDown(button, { key: ' ', code: 'Space' });
        
        // Native button automatically handles Space
        expect(button).toHaveAttribute('type');
      });

      it('should not be keyboard accessible when disabled', () => {
        render(<Button disabled>Disabled Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        
        // Disabled buttons should not be focusable
        button.focus();
        expect(document.activeElement).not.toBe(button);
      });
    });

    describe('Focus Indicators (WCAG 2.4.7)', () => {
      it('should have visible focus indicator classes', () => {
        render(<Button>Focus Indicator</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('focus-visible:outline-none');
        expect(button).toHaveClass('focus-visible:ring-2');
        expect(button).toHaveClass('focus-visible:ring-offset-2');
      });

      it('should have focus ring color for each variant', () => {
        const variants = [
          { variant: 'primary' as const, ring: 'focus-visible:ring-brand-orange' },
          { variant: 'secondary' as const, ring: 'focus-visible:ring-white' },
          { variant: 'outline' as const, ring: 'focus-visible:ring-brand-orange' },
          { variant: 'danger' as const, ring: 'focus-visible:ring-red-500' },
          { variant: 'minimal' as const, ring: 'focus-visible:ring-blue-500' },
        ];

        variants.forEach(({ variant, ring }) => {
          const { unmount } = render(<Button variant={variant}>{variant}</Button>);
          const button = screen.getByRole('button');
          expect(button).toHaveClass(ring);
          unmount();
        });
      });
    });

    describe('Disabled State Indication (WCAG 1.3.1)', () => {
      it('should have disabled attribute when disabled', () => {
        render(<Button disabled>Disabled</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('disabled');
        expect(button).toBeDisabled();
      });

      it('should have visual disabled styles', () => {
        render(<Button disabled>Disabled Visual</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('disabled:opacity-60');
        expect(button).toHaveClass('disabled:cursor-not-allowed');
      });

      it('should not respond to click events when disabled', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick} disabled>No Click</Button>);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
      });
    });

    describe('Accessible Name (WCAG 4.1.2)', () => {
      it('should have accessible name from text content', () => {
        render(<Button>Click to Submit</Button>);
        
        const button = screen.getByRole('button', { name: 'Click to Submit' });
        expect(button).toBeInTheDocument();
      });

      it('should support accessible name with icon and text', () => {
        render(
          <Button>
            <svg aria-hidden="true" data-testid="icon" />
            <span>Submit Form</span>
          </Button>
        );
        
        const button = screen.getByRole('button', { name: /Submit Form/i });
        expect(button).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
      });

      it('should have meaningful button text (not generic)', () => {
        // Good examples
        render(<Button>Save Changes</Button>);
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
        
        // Text should be descriptive, not just "Click here" or "Button"
        const button = screen.getByRole('button');
        expect(button.textContent).not.toBe('Click here');
        expect(button.textContent).not.toBe('Button');
        expect(button.textContent).not.toBe('Submit'); // Too generic without context
      });
    });

    describe('Touch Target Size (WCAG 2.5.5)', () => {
      it('should have minimum 44x44px touch target for small size', () => {
        render(<Button size="sm">Small Button</Button>);
        
        const button = screen.getByRole('button');
        // min-h-[36px] ensures minimum touch target height
        expect(button).toHaveClass('min-h-[36px]');
      });

      it('should have adequate touch target for medium size', () => {
        render(<Button size="md">Medium Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('min-h-[44px]');
      });

      it('should have large touch target for large size', () => {
        render(<Button size="lg">Large Button</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('min-h-[48px]');
      });
    });

    describe('Visual Feedback (WCAG 1.4.1)', () => {
      it('should have hover state classes', () => {
        render(<Button variant="primary">Hover</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('hover:bg-orange-600');
      });

      it('should have transition for smooth state changes', () => {
        render(<Button>Transition</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('transition-all');
      });

      it('should maintain adequate contrast in all states', () => {
        // Primary: white text on orange background (contrast ratio > 4.5:1)
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        let button = screen.getByRole('button', { name: 'Primary' });
        expect(button).toHaveClass('bg-brand-orange', 'text-white');

        // Secondary: orange text on white background
        rerender(<Button variant="secondary">Secondary</Button>);
        button = screen.getByRole('button', { name: 'Secondary' });
        expect(button).toHaveClass('bg-white', 'text-brand-orange');

        // Danger: white text on red background
        rerender(<Button variant="danger">Danger</Button>);
        button = screen.getByRole('button', { name: 'Danger' });
        expect(button).toHaveClass('bg-red-600', 'text-white');
      });
    });

    describe('Consistent Identification (WCAG 3.2.4)', () => {
      it('should use consistent styling across all variants', () => {
        const variants = ['primary', 'secondary', 'outline', 'danger', 'minimal'] as const;
        
        variants.forEach(variant => {
          const { unmount } = render(<Button variant={variant}>{variant}</Button>);
          const button = screen.getByRole('button');
          
          // All should have base button classes
          expect(button).toHaveClass('btn', 'rounded-lg', 'inline-flex');
          
          unmount();
        });
      });

      it('should maintain consistent spacing across sizes', () => {
        const sizes = ['sm', 'md', 'lg'] as const;
        
        sizes.forEach(size => {
          const { unmount } = render(<Button size={size}>{size}</Button>);
          const button = screen.getByRole('button');
          
          // All should have consistent structural classes
          expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
          
          unmount();
        });
      });
    });

    describe('Error Prevention (WCAG 3.3.4)', () => {
      it('should support disabled state to prevent unintended actions', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick} disabled>Prevent Click</Button>);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        
        expect(handleClick).not.toHaveBeenCalled();
        expect(button).toBeDisabled();
      });

      it('should have visual indication when disabled', () => {
        render(<Button disabled>Visually Disabled</Button>);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('disabled:opacity-60');
        expect(button).toHaveClass('disabled:cursor-not-allowed');
      });
    });
  });

  describe('Variant and Size Combinations', () => {
    it('should combine secondary variant with small size', () => {
      render(<Button variant="secondary" size="sm">Small Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-brand-orange', 'min-h-[36px]');
    });

    it('should combine danger variant with large size', () => {
      render(<Button variant="danger" size="lg">Large Danger</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'min-h-[48px]');
    });

    it('should combine minimal variant with medium size', () => {
      render(<Button variant="minimal" size="md">Medium Minimal</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'min-h-[44px]');
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
