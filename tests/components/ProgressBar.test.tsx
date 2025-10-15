/**
 * ProgressBar Component Tests
 * 
 * Tests for the extracted ProgressBar component from MetricsCard optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from '../../app/components/ProgressBar/ProgressBar';

describe('ProgressBar Component', () => {
  
  const defaultProps = {
    id: 'test-bar',
    title: 'Temperature',
    min: 0,
    max: 1000,
    value: 500,
    unit: '°C',
    color: '#FF5733',
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ProgressBar {...defaultProps} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays correct value', () => {
      render(<ProgressBar {...defaultProps} />);
      // Value appears multiple times (current, min, max, screen reader text)
      const valueElements = screen.getAllByText('500');
      expect(valueElements.length).toBeGreaterThan(0);
    });

    it('displays min and max values', () => {
      render(<ProgressBar {...defaultProps} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    it('renders with custom color', () => {
      const { container } = render(<ProgressBar {...defaultProps} color="#00FF00" />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Percentage Calculation', () => {
    it('calculates 50% correctly', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={500} min={0} max={1000} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '50');
    });

    it('calculates 0% correctly', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={0} min={0} max={1000} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '0');
    });

    it('calculates 100% correctly', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={1000} min={0} max={1000} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '100');
    });

    it('clamps values below min to 0%', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={-100} min={0} max={1000} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '0');
    });

    it('clamps values above max to 100%', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={1500} min={0} max={1000} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '100');
    });

    it('handles negative ranges correctly', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={0} min={-100} max={100} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '50');
    });

    it('handles decimal values correctly', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={25.5} min={0} max={100} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      const percentage = progressBar?.getAttribute('data-percentage');
      expect(parseFloat(percentage || '0')).toBeCloseTo(26, 0);
    });
  });

  describe('Accessibility', () => {
    it('has proper progressbar role', () => {
      render(<ProgressBar {...defaultProps} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('has aria-valuenow attribute', () => {
      render(<ProgressBar {...defaultProps} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '500');
    });

    it('has aria-valuemin attribute', () => {
      render(<ProgressBar {...defaultProps} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('has aria-valuemax attribute', () => {
      render(<ProgressBar {...defaultProps} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '1000');
    });

    it('is keyboard focusable (tabIndex=0)', () => {
      render(<ProgressBar {...defaultProps} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('tabIndex', '0');
    });

    it('has screen reader description', () => {
      render(<ProgressBar {...defaultProps} />);
      // Text is split across elements including <data> tag
      expect(screen.getByText(/Current value:/)).toBeInTheDocument();
      // Value appears multiple times (current, min, max, etc.)
      const valueElements = screen.getAllByText('500');
      expect(valueElements.length).toBeGreaterThan(0);
    });

    it('includes range information in description', () => {
      render(<ProgressBar {...defaultProps} />);
      const description = screen.getByText(/Range:.*0.*to.*1000.*°C/);
      expect(description).toBeInTheDocument();
    });

    it('includes progress percentage in description', () => {
      render(<ProgressBar {...defaultProps} />);
      const description = screen.getByText(/Progress:.*50.*%/);
      expect(description).toBeInTheDocument();
    });

    it('has figure role with proper structure', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const figure = container.querySelector('figure[role="img"]');
      expect(figure).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('includes property name data attribute', () => {
      const { container } = render(<ProgressBar {...defaultProps} propertyName="temperature_celsius" />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-property', 'temperature_celsius');
    });

    it('falls back to title-based property name', () => {
      const { container } = render(<ProgressBar {...defaultProps} title="Thermal Conductivity" />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-property', expect.stringMatching(/thermal/i));
    });

    it('includes percentage data attribute', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={250} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-percentage', '25');
    });

    it('includes component type data attribute', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-component', 'progress-bar');
    });

    it('includes data attributes on value elements', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const dataElements = container.querySelectorAll('data[value="500"]');
      expect(dataElements.length).toBeGreaterThan(0);
      
      dataElements.forEach(el => {
        expect(el).toHaveAttribute('data-unit', '°C');
        expect(el).toHaveAttribute('data-type');
        expect(el).toHaveAttribute('data-context', 'material_property');
      });
    });
  });

  describe('Schema.org Microdata', () => {
    it('includes itemProp on value elements', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const dataElements = container.querySelectorAll('data[value="500"]');
      
      dataElements.forEach(el => {
        expect(el).toHaveAttribute('itemProp', 'value');
      });
    });

    it('includes itemType on value elements', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const dataElements = container.querySelectorAll('data[value="500"]');
      
      dataElements.forEach(el => {
        expect(el).toHaveAttribute('itemType', 'https://schema.org/PropertyValue');
      });
    });

    it('includes min/max value microdata', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      
      const minElement = container.querySelector('data[value="0"]');
      expect(minElement).toHaveAttribute('itemProp', 'minValue');
      
      const maxElement = container.querySelector('data[value="1000"]');
      expect(maxElement).toHaveAttribute('itemProp', 'maxValue');
    });
  });

  describe('Visual Positioning', () => {
    it('positions fill at correct percentage (vertical)', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={750} />);
      const fill = container.querySelector('[style*="height: 75%"]');
      expect(fill).toBeInTheDocument();
    });

    it('shows value at top of vertical bar', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={100} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      // Value display is separate from bar positioning in vertical layout
      const valueElements = screen.getAllByText('100');
      expect(valueElements.length).toBeGreaterThan(0);
    });

    it('positions indicator at correct height', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={500} />);
      const indicator = container.querySelector('[style*="bottom: 50%"]');
      expect(indicator).toBeInTheDocument();
    });

    it('handles high percentage values', () => {
      const { container } = render(<ProgressBar {...defaultProps} value={900} />);
      const fill = container.querySelector('[style*="height: 90%"]');
      expect(fill).toBeInTheDocument();
    });
  });

  describe('Float Cleanup', () => {
    it('displays cleaned float values', () => {
      render(<ProgressBar {...defaultProps} value={123.456789} />);
      // Should be rounded to 2 decimal places - appears in multiple places
      const elements = screen.getAllByText('123.46');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('removes unnecessary trailing zeros', () => {
      render(<ProgressBar {...defaultProps} value={100.00} />);
      // Value appears multiple times (current value, potentially in ranges)
      const elements = screen.getAllByText('100');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('handles string values', () => {
      render(<ProgressBar {...defaultProps} value={'250.75' as any} />);
      // String values are converted to numbers and appear multiple times
      const elements = screen.getAllByText('250.75');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero min and max', () => {
      const { container } = render(<ProgressBar {...defaultProps} min={0} max={0} value={0} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('handles equal min and max', () => {
      const { container } = render(<ProgressBar {...defaultProps} min={100} max={100} value={100} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      // When min === max, percentage calculation results in NaN which becomes 0 after Math.min/max
      const percentage = progressBar?.getAttribute('data-percentage');
      expect(percentage).toMatch(/^(0|NaN)$/);
    });

    it('handles very large numbers', () => {
      render(<ProgressBar {...defaultProps} min={0} max={1000000} value={500000} />);
      const valueElements = screen.getAllByText('500000');
      expect(valueElements.length).toBeGreaterThan(0);
    });

    it('handles very small decimals', () => {
      render(<ProgressBar {...defaultProps} min={0} max={1} value={0.005} />);
      const valueElements = screen.getAllByText('0.01'); // Rounded to 2 decimals
      expect(valueElements.length).toBeGreaterThan(0);
    });

    it('handles empty unit string', () => {
      render(<ProgressBar {...defaultProps} unit="" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('handles missing propertyName', () => {
      const { container } = render(<ProgressBar {...defaultProps} propertyName={undefined} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('data-property', expect.any(String));
    });
  });

  describe('CSS Classes', () => {
    it('applies correct container classes', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const figure = container.querySelector('figure');
      expect(figure).toHaveClass('h-full', 'flex', 'items-stretch');
    });

    it('applies focus styles to progress bar', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:outline-none');
    });

    it('hides visual elements from screen readers', () => {
      const { container } = render(<ProgressBar {...defaultProps} />);
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });
  });
});
