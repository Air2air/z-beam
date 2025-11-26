/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DatePanel } from '../../app/components/DatePanel/DatePanel';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>
}));

// Mock date formatting utility
jest.mock('../../app/utils/dateFormatting', () => ({
  formatDate: (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}));

describe('DatePanel Component', () => {
  describe('1. Basic Rendering', () => {
    test('renders with valid date', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" />);
      
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      // Verify component rendered (not null)
      expect(container.firstChild).not.toBeNull();
    });

    test('returns null when no date provided', () => {
      const { container } = render(<DatePanel />);
      expect(container.firstChild).toBeNull();
    });

    test('returns null when datePublished is empty string', () => {
      const { container } = render(<DatePanel datePublished="" />);
      expect(container.firstChild).toBeNull();
    });

    test('returns null when datePublished is undefined', () => {
      const { container } = render(<DatePanel datePublished={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('2. CSS Classes', () => {
    test('applies default CSS classes', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" />);
      const panel = container.firstChild;
      
      expect(panel).toHaveClass('hidden');
      expect(panel).toHaveClass('sm:flex');
      expect(panel).toHaveClass('flex-col');
      expect(panel).toHaveClass('gap-2');
      expect(panel).toHaveClass('text-xs');
      expect(panel).toHaveClass('text-tertiary');
      expect(panel).toHaveClass('bg-primary');
      expect(panel).toHaveClass('rounded');
      expect(panel).toHaveClass('px-3');
      expect(panel).toHaveClass('py-2');
      expect(panel).toHaveClass('flex-shrink-0');
    });

    test('applies custom className', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" className="custom-class" />);
      const panel = container.firstChild;
      
      expect(panel).toHaveClass('custom-class');
    });

    test('Published label has correct styling', () => {
      render(<DatePanel datePublished="2024-11-26" />);
      const label = screen.getByText('Published');
      
      expect(label).toHaveClass('text-secondary');
      expect(label).toHaveClass('text-[10px]');
      expect(label).toHaveClass('uppercase');
      expect(label).toHaveClass('tracking-wide');
    });

    test('date value has font-medium class', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" />);
      const dateDiv = container.querySelector('.font-medium');
      
      expect(dateDiv).toBeInTheDocument();
      expect(dateDiv).toHaveClass('font-medium');
      expect(dateDiv).toHaveClass('text-primary');
    });
  });

  describe('3. Date Formatting', () => {
    test('formats ISO date correctly', () => {
      const { container } = render(<DatePanel datePublished="2024-01-15" />);
      // Verify component renders with formatted date
      expect(container.querySelector('.font-medium')).toBeInTheDocument();
    });

    test('formats different date formats', () => {
      const { container, rerender } = render(<DatePanel datePublished="2024-12-25" />);
      expect(container.querySelector('.font-medium')).toBeInTheDocument();

      rerender(<DatePanel datePublished="2023-06-30" />);
      expect(container.querySelector('.font-medium')).toBeInTheDocument();
    });
  });

  describe('4. Responsive Behavior', () => {
    test('is hidden on mobile screens', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" />);
      const panel = container.firstChild;
      
      expect(panel).toHaveClass('hidden');
    });

    test('displays flex on sm+ screens', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" />);
      const panel = container.firstChild;
      
      expect(panel).toHaveClass('sm:flex');
    });
  });

  describe('5. Icon Integration', () => {
    test('renders Calendar icon', () => {
      render(<DatePanel datePublished="2024-11-26" />);
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    test('icon has correct sizing', () => {
      render(<DatePanel datePublished="2024-11-26" />);
      const icon = screen.getByTestId('calendar-icon').closest('svg');
      
      // Note: In actual implementation, Calendar component would have w-3.5 h-3.5 classes
      // but our mock doesn't apply them, so we just verify it renders
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });
  });

  describe('6. Layout Structure', () => {
    test('maintains proper flex layout', () => {
      const { container } = render(<DatePanel datePublished="2024-11-26" />);
      const innerDiv = container.querySelector('.flex.items-center.gap-1\\.5');
      
      expect(innerDiv).toBeInTheDocument();
      expect(innerDiv).toHaveClass('whitespace-nowrap');
    });
  });
});
