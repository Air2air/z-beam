// tests/accessibility/MetricsCard.comprehensive.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import MetricsCard from '@/app/components/MetricsCard/MetricsCard';

expect.extend(toHaveNoViolations);

describe('MetricsCard Comprehensive Accessibility', () => {
  const mockProps = {
    title: 'Thermal Conductivity',
    value: '45.5',
    unit: 'W/mK',
    min: '0.1',
    max: '429',
    searchable: true,
    searchRoute: '/search',
    fullPropertyName: 'thermal_conductivity'
  };

  describe('WCAG 2.1 AA Compliance', () => {
    test('passes axe accessibility scan with zero violations', async () => {
      const { container } = render(<MetricsCard {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('implements semantic HTML structure correctly', () => {
      render(<MetricsCard {...mockProps} />);
      
      // Main container is semantic article
      const article = screen.getByRole('article');
      expect(article.tagName).toBe('ARTICLE');
      
      // Title is proper heading
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Thermal Conductivity');
      
      // Value uses semantic data element
      const dataElement = screen.getByDisplayValue('45.5');
      expect(dataElement.tagName).toBe('DATA');
      expect(dataElement).toHaveAttribute('value', '45.5');
      
      // Progress visualization is figure
      const figure = screen.getByRole('img');
      expect(figure.tagName).toBe('FIGURE');
    });

    test('implements complete ARIA attribute pattern', () => {
      render(<MetricsCard {...mockProps} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby');
      expect(article).toHaveAttribute('aria-describedby');
      expect(article).toHaveAttribute('tabindex', '0');
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '45.5');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0.1');
      expect(progressbar).toHaveAttribute('aria-valuemax', '429');
      expect(progressbar).toHaveAttribute('aria-labelledby');
      expect(progressbar).toHaveAttribute('aria-describedby');
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label');
      expect(link).toHaveAttribute('aria-describedby');
      expect(link).toHaveAttribute('title');
    });

    test('provides comprehensive screen reader content', () => {
      render(<MetricsCard {...mockProps} />);
      
      // Main description includes all necessary context
      const description = screen.getByText(/Metric showing thermal_conductivity with value 45.5 W\/mK, ranging from 0.1 to 429 W\/mK/);
      expect(description).toHaveClass('sr-only');
      expect(description).toHaveTextContent('Press Enter or Space to search for this metric');
      
      // Progress description is detailed
      const progressDesc = screen.getByText(/Current value: 45.5 W\/mK/);
      expect(progressDesc).toHaveClass('sr-only');
      expect(progressDesc).toHaveTextContent('Range: 0.1 to 429 W/mK');
      expect(progressDesc).toHaveTextContent('Progress: 11% of maximum');
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports complete tab navigation sequence', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <button>Previous element</button>
          <MetricsCard {...mockProps} />
          <button>Next element</button>
        </div>
      );
      
      const prevButton = screen.getByText('Previous element');
      const article = screen.getByRole('article');
      const progressbar = screen.getByRole('progressbar');
      const nextButton = screen.getByText('Next element');
      
      // Complete tab sequence
      prevButton.focus();
      await user.tab();
      expect(article).toHaveFocus();
      
      await user.tab();
      expect(progressbar).toHaveFocus();
      
      await user.tab();
      expect(nextButton).toHaveFocus();
    });

    test('handles Enter key activation for searchable cards', async () => {
      const mockPush = jest.fn();
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush })
      }));
      
      const user = userEvent.setup();
      render(<MetricsCard {...mockProps} />);
      
      const article = screen.getByRole('article');
      await user.tab();
      await user.keyboard('{Enter}');
      
      expect(mockPush).toHaveBeenCalledWith('/search?thermal_conductivity=45.5');
    });

    test('handles Space key activation for searchable cards', async () => {
      const mockPush = jest.fn();
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush })
      }));
      
      const user = userEvent.setup();
      render(<MetricsCard {...mockProps} />);
      
      const article = screen.getByRole('article');
      await user.tab();
      await user.keyboard(' ');
      
      expect(mockPush).toHaveBeenCalledWith('/search?thermal_conductivity=45.5');
    });

    test('shows high-contrast focus indicators', async () => {
      const user = userEvent.setup();
      render(<MetricsCard {...mockProps} />);
      
      const article = screen.getByRole('article');
      await user.tab();
      
      expect(article).toHaveClass('focus:ring-2');
      expect(article).toHaveClass('focus:ring-blue-500');
      expect(article).toHaveClass('focus:outline-none');
    });
  });

  describe('Progressive Enhancement', () => {
    test('works without JavaScript for basic content', () => {
      render(<MetricsCard title="Test" value="50" unit="%" />);
      
      // Core content should be accessible even without JS
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    test('handles missing optional props gracefully', () => {
      render(<MetricsCard title="Test" value="50" />);
      
      // Should not break accessibility with minimal props
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby');
      expect(article).toHaveAttribute('aria-describedby');
    });

    test('gracefully handles search functionality absence', () => {
      render(<MetricsCard title="Test" value="50" searchable={false} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('tabindex', '-1'); // Not interactive
      
      // Should not include search instructions
      const description = screen.queryByText(/Press Enter or Space to search/);
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Error States and Edge Cases', () => {
    test('handles invalid numeric values gracefully', () => {
      render(<MetricsCard title="Test" value="invalid" min="0" max="100" />);
      
      // Should not break accessibility with invalid values
      const progressbar = screen.queryByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', 'invalid');
    });

    test('handles missing range values', () => {
      render(<MetricsCard title="Test" value="50" />);
      
      // Should provide appropriate description without range
      const description = screen.getByText(/Metric showing Test with value 50/);
      expect(description).not.toHaveTextContent('ranging from');
    });

    test('handles extremely long property names', () => {
      const longName = 'very_long_property_name_that_might_cause_layout_issues_in_accessibility_implementation';
      render(<MetricsCard title="Test" value="50" fullPropertyName={longName} />);
      
      const description = screen.getByText(new RegExp(longName));
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });
  });

  describe('Multiple Instance Interaction', () => {
    test('maintains unique IDs across multiple instances', () => {
      const { container } = render(
        <div>
          <MetricsCard title="Metric 1" value="50" />
          <MetricsCard title="Metric 2" value="75" />
          <MetricsCard title="Metric 3" value="25" />
        </div>
      );
      
      // All articles should have unique aria-labelledby attributes
      const articles = screen.getAllByRole('article');
      const labelIds = articles.map(article => article.getAttribute('aria-labelledby'));
      const uniqueIds = new Set(labelIds);
      
      expect(uniqueIds.size).toBe(labelIds.length);
    });

    test('maintains proper tab order across multiple instances', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <MetricsCard title="Metric 1" value="50" searchable={true} />
          <MetricsCard title="Metric 2" value="75" searchable={false} />
          <MetricsCard title="Metric 3" value="25" searchable={true} />
        </div>
      );
      
      const articles = screen.getAllByRole('article');
      const progressbars = screen.getAllByRole('progressbar');
      
      // Tab through all focusable elements
      await user.tab(); // First article (searchable)
      expect(articles[0]).toHaveFocus();
      
      await user.tab(); // First progressbar
      expect(progressbars[0]).toHaveFocus();
      
      await user.tab(); // Second progressbar (article not focusable)
      expect(progressbars[1]).toHaveFocus();
      
      await user.tab(); // Third article (searchable)
      expect(articles[2]).toHaveFocus();
      
      await user.tab(); // Third progressbar
      expect(progressbars[2]).toHaveFocus();
    });
  });

  describe('Performance and Scaling', () => {
    test('renders efficiently with many instances', () => {
      const startTime = performance.now();
      
      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <MetricsCard
              key={i}
              title={`Metric ${i}`}
              value={String(i * 10)}
              unit="%"
              min="0"
              max="1000"
              fullPropertyName={`metric_${i}`}
              searchable={i % 2 === 0}
            />
          ))}
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 100 components efficiently
      expect(renderTime).toBeLessThan(200); // Reasonable threshold
      
      // All should have proper accessibility
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(100);
      
      const progressbars = screen.getAllByRole('progressbar');
      expect(progressbars).toHaveLength(100);
    });
  });
});