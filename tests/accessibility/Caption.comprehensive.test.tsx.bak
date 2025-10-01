// tests/accessibility/Caption.comprehensive.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Caption } from '../../app/components/Caption/Caption';

describe('Caption Comprehensive Accessibility', () => {
  const mockData = {
    material: 'Aluminum 6061-T6',
    quality_metrics: {
      surface_roughness_ra: 0.8,
      surface_roughness_rz: 4.2,
      thermal_conductivity: 167,
      electrical_conductivity: 38.2,
      corrosion_resistance: 7.5,
      adhesion_strength: 12.3,
      hardness_hv: 95
    },
    before_treatment: 'Surface shows oxidation, contamination, and roughness from manufacturing processes',
    after_treatment: 'Clean, smooth surface with improved thermal and electrical properties for optimal performance',
    imageSource: '/analysis/aluminum-6061-t6-comparison.jpg'
  };

  describe('WCAG 2.1 AA Compliance', () => {
    test('implements complete semantic HTML structure', () => {
      render(<Caption data={mockData} />);
      
      // Main container is semantic section with region role
      const mainSection = screen.getByRole('region');
      expect(mainSection.tagName).toBe('SECTION');
      expect(mainSection).toHaveAttribute('aria-labelledby');
      expect(mainSection).toHaveAttribute('aria-describedby');
      
      // Title is proper heading
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Aluminum 6061-T6');
      
      // Image container is figure
      const figure = screen.getByRole('img');
      expect(figure.tagName).toBe('FIGURE');
      
      // Quality metrics use list pattern
      const metricsList = screen.getByRole('list');
      expect(metricsList).toHaveAttribute('aria-label', 'Quality metrics list');
      
      const metricsItems = screen.getAllByRole('listitem');
      expect(metricsItems).toHaveLength(7); // Number of metrics
    });

    test('implements comprehensive ARIA attributes', () => {
      render(<Caption data={mockData} />);
      
      // Main section has complete ARIA labeling
      const mainSection = screen.getByRole('region');
      expect(mainSection).toHaveAttribute('aria-labelledby');
      expect(mainSection).toHaveAttribute('aria-describedby');
      expect(mainSection).toHaveAttribute('tabindex', '0');
      
      // Live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      
      // Metrics overlay has expansion state
      const metricsOverlay = screen.getByLabelText('Interactive quality metrics overlay');
      expect(metricsOverlay).toHaveAttribute('aria-expanded');
      expect(metricsOverlay).toHaveAttribute('aria-describedby');
      
      // Each metric article has proper labeling
      const metricArticles = screen.getAllByRole('article');
      metricArticles.forEach(article => {
        expect(article).toHaveAttribute('aria-labelledby');
        expect(article).toHaveAttribute('tabindex');
      });
    });

    test('provides comprehensive screen reader descriptions', () => {
      render(<Caption data={mockData} />);
      
      // Main description covers all functionality
      const mainDescription = screen.getByText(/Surface analysis for Aluminum 6061-T6/);
      expect(mainDescription).toHaveClass('sr-only');
      expect(mainDescription).toHaveTextContent('before and after treatment comparison');
      expect(mainDescription).toHaveTextContent('interactive quality metrics');
      expect(mainDescription).toHaveTextContent('Use Enter to expand');
      
      // Image description is detailed
      const imageDescription = screen.getByText(/Surface analysis image showing Aluminum 6061-T6/);
      expect(imageDescription).toHaveClass('sr-only');
      expect(imageDescription).toHaveTextContent('before and after laser cleaning treatment');
      expect(imageDescription).toHaveTextContent('interactive quality metrics overlay');
      
      // Metrics navigation instructions
      const metricsInstructions = screen.getByText(/Quality metrics overlay with 7 measurements/);
      expect(metricsInstructions).toHaveClass('sr-only');
      expect(metricsInstructions).toHaveTextContent('Use arrow keys to navigate');
      expect(metricsInstructions).toHaveTextContent('Enter to toggle, Escape to exit');
    });
  });

  describe('Complex Keyboard Navigation', () => {
    test('implements complete arrow key navigation pattern', async () => {
      const user = userEvent.setup();
      render(<Caption data={mockData} />);
      
      const mainSection = screen.getByRole('region');
      await user.tab();
      expect(mainSection).toHaveFocus();
      
      // Enter metrics overlay
      await user.keyboard('{Enter}');
      const metricsOverlay = screen.getByLabelText('Interactive quality metrics overlay');
      expect(metricsOverlay).toHaveAttribute('aria-expanded', 'true');
      
      // Navigate through metrics with all arrow keys
      const metricNames = [
        'surface_roughness_ra',
        'surface_roughness_rz', 
        'thermal_conductivity',
        'electrical_conductivity',
        'corrosion_resistance',
        'adhesion_strength',
        'hardness_hv'
      ];
      
      // Test ArrowRight navigation
      for (let i = 1; i < metricNames.length; i++) {
        await user.keyboard('{ArrowRight}');
        const focusedMetric = screen.getByText(metricNames[i].replace(/_/g, ' '));
        expect(focusedMetric.closest('[tabindex="0"]')).toHaveFocus();
      }
      
      // Test ArrowDown navigation (should work same as ArrowRight)
      await user.keyboard('{ArrowDown}');
      const firstMetric = screen.getByText(metricNames[0].replace(/_/g, ' '));
      expect(firstMetric.closest('[tabindex="0"]')).toHaveFocus();
      
      // Test ArrowLeft navigation (reverse)
      await user.keyboard('{ArrowLeft}');
      const lastMetric = screen.getByText(metricNames[metricNames.length - 1].replace(/_/g, ' '));
      expect(lastMetric.closest('[tabindex="0"]')).toHaveFocus();
      
      // Test ArrowUp navigation (should work same as ArrowLeft)
      await user.keyboard('{ArrowUp}');
      const secondLastMetric = screen.getByText(metricNames[metricNames.length - 2].replace(/_/g, ' '));
      expect(secondLastMetric.closest('[tabindex="0"]')).toHaveFocus();
    });

    test('implements Home and End key navigation', async () => {
      const user = userEvent.setup();
      render(<Caption data={mockData} />);
      
      const mainSection = screen.getByRole('region');
      await user.tab();
      await user.keyboard('{Enter}'); // Enter metrics
      
      // Navigate to middle metric
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      
      // Home should go to first metric
      await user.keyboard('{Home}');
      const firstMetric = screen.getByText('surface roughness ra');
      expect(firstMetric.closest('[tabindex="0"]')).toHaveFocus();
      
      // End should go to last metric
      await user.keyboard('{End}');
      const lastMetric = screen.getByText('hardness hv');
      expect(lastMetric.closest('[tabindex="0"]')).toHaveFocus();
    });

    test('implements Escape key to exit metrics overlay', async () => {
      const user = userEvent.setup();
      render(<Caption data={mockData} />);
      
      const mainSection = screen.getByRole('region');
      await user.tab();
      await user.keyboard('{Enter}'); // Enter metrics
      
      // Navigate to a metric
      await user.keyboard('{ArrowRight}');
      
      // Escape should return focus to main section and collapse metrics
      await user.keyboard('{Escape}');
      expect(mainSection).toHaveFocus();
      
      const metricsOverlay = screen.getByLabelText('Interactive quality metrics overlay');
      expect(metricsOverlay).toHaveAttribute('aria-expanded', 'false');
    });

    test('announces navigation changes via live region', async () => {
      const user = userEvent.setup();
      render(<Caption data={mockData} />);
      
      const liveRegion = screen.getByRole('status');
      
      const mainSection = screen.getByRole('region');
      await user.tab();
      await user.keyboard('{Enter}'); // Enter metrics
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent('Quality metrics expanded');
      });
      
      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/Focused on.*surface roughness rz.*metric/);
      });
      
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent('Focus returned to main container');
      });
    });
  });

  describe('Loading and Error States', () => {
    test('implements accessible loading state', () => {
      const loadingData = { ...mockData, isLoading: true };
      render(<Caption data={loadingData} />);
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Loading surface analysis image');
      expect(progressbar).toHaveAttribute('aria-describedby');
      expect(progressbar).toHaveAttribute('tabindex', '0');
      
      const loadingDescription = screen.getByText(/Loading surface analysis image for Aluminum 6061-T6/);
      expect(loadingDescription).toHaveClass('sr-only');
    });

    test('implements accessible error state', () => {
      const errorData = { ...mockData, hasError: true };
      render(<Caption data={errorData} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-describedby');
      
      const errorMessage = screen.getByText('Surface analysis image could not be loaded');
      expect(errorMessage).toBeInTheDocument();
      
      const errorDescription = screen.getByText('Error: Surface analysis image failed to load');
      expect(errorDescription).toHaveClass('sr-only');
    });

    test('handles image loading completion', async () => {
      const { rerender } = render(<Caption data={mockData} />);
      
      // Simulate image loaded
      rerender(<Caption data={{ ...mockData, imageLoaded: true }} />);
      
      const liveRegion = screen.getByRole('status');
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent('Surface analysis image loaded successfully');
      });
    });
  });

  describe('Before/After Treatment Sections', () => {
    test('implements semantic section structure', () => {
      render(<Caption data={mockData} />);
      
      // Both sections should be semantic regions
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThanOrEqual(3); // Main + Before + After
      
      // Before section
      const beforeHeading = screen.getByRole('heading', { name: /Before Treatment/ });
      expect(beforeHeading).toHaveAttribute('aria-level', '4');
      
      // After section  
      const afterHeading = screen.getByRole('heading', { name: /After Treatment/ });
      expect(afterHeading).toHaveAttribute('aria-level', '4');
      
      // Content should be properly associated with headings
      const beforeText = screen.getByText(/Surface shows oxidation/);
      expect(beforeText).toHaveAttribute('aria-labelledby');
      
      const afterText = screen.getByText(/Clean, smooth surface/);
      expect(afterText).toHaveAttribute('aria-labelledby');
    });

    test('uses presentation role for decorative indicators', () => {
      render(<Caption data={mockData} />);
      
      // Color indicators should be marked as presentation
      const indicators = screen.getAllByRole('presentation');
      expect(indicators.length).toBeGreaterThanOrEqual(2); // Before (red) + After (green)
      
      indicators.forEach(indicator => {
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Quality Metrics Accessibility', () => {
    test('implements accessible data representation', () => {
      render(<Caption data={mockData} />);
      
      // Each metric should use semantic data elements
      const dataElements = screen.getAllByDisplayValue(/\d+\.?\d*/);
      expect(dataElements.length).toBeGreaterThan(0);
      
      dataElements.forEach(element => {
        expect(element.tagName).toBe('DATA');
        expect(element).toHaveAttribute('value');
      });
    });

    test('provides individual metric descriptions', () => {
      render(<Caption data={mockData} />);
      
      // Each metric should have screen reader description
      const metricDescriptions = screen.getAllByText(/Metric:.*Value:/);
      expect(metricDescriptions.length).toBe(7); // Number of metrics
      
      metricDescriptions.forEach(desc => {
        expect(desc).toHaveClass('sr-only');
      });
    });

    test('announces focused metric state', async () => {
      const user = userEvent.setup();
      render(<Caption data={mockData} />);
      
      const mainSection = screen.getByRole('region');
      await user.tab();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowRight}');
      
      // Focused metric should announce its state
      const focusedDescription = screen.getByText(/Currently focused/);
      expect(focusedDescription).toHaveClass('sr-only');
    });
  });

  describe('Progressive Enhancement', () => {
    test('works with minimal data', () => {
      const minimalData = { material: 'Test Material' };
      render(<Caption data={minimalData} />);
      
      // Should still provide accessible structure
      const mainSection = screen.getByRole('region');
      expect(mainSection).toHaveAttribute('aria-labelledby');
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Material');
    });

    test('handles missing quality metrics gracefully', () => {
      const noMetricsData = { 
        material: 'Test',
        before_treatment: 'Before',
        after_treatment: 'After'
      };
      render(<Caption data={noMetricsData} />);
      
      // Should not break without metrics
      const mainSection = screen.getByRole('region');
      expect(mainSection).toBeInTheDocument();
      
      // Should not show metrics overlay
      const metricsOverlay = screen.queryByLabelText('Interactive quality metrics overlay');
      expect(metricsOverlay).not.toBeInTheDocument();
    });

    test('handles missing treatment descriptions', () => {
      const noTreatmentData = { 
        material: 'Test',
        quality_metrics: { test_metric: 1.0 }
      };
      render(<Caption data={noTreatmentData} />);
      
      // Should still work with just metrics
      const mainSection = screen.getByRole('region');
      expect(mainSection).toBeInTheDocument();
      
      const metricsOverlay = screen.getByLabelText('Interactive quality metrics overlay');
      expect(metricsOverlay).toBeInTheDocument();
    });
  });

  describe('Performance and Scaling', () => {
    test('handles large number of quality metrics efficiently', () => {
      const manyMetricsData = {
        material: 'Test',
        quality_metrics: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`metric_${i}`, i * 2.5])
        )
      };
      
      const startTime = performance.now();
      render(<Caption data={manyMetricsData} />);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Should render efficiently
      
      // All metrics should be accessible
      const metricArticles = screen.getAllByRole('article');
      expect(metricArticles).toHaveLength(50);
      
      const metricItems = screen.getAllByRole('listitem');
      expect(metricItems).toHaveLength(50);
    });

    test('keyboard navigation scales with metric count', async () => {
      const manyMetricsData = {
        material: 'Test',
        quality_metrics: Object.fromEntries(
          Array.from({ length: 20 }, (_, i) => [`metric_${i}`, i])
        )
      };
      
      const user = userEvent.setup();
      render(<Caption data={manyMetricsData} />);
      
      const mainSection = screen.getByRole('region');
      await user.tab();
      await user.keyboard('{Enter}');
      
      // Test rapid navigation
      const startTime = performance.now();
      for (let i = 0; i < 20; i++) {
        await user.keyboard('{ArrowRight}');
      }
      const endTime = performance.now();
      
      const navigationTime = endTime - startTime;
      expect(navigationTime).toBeLessThan(100); // Should navigate efficiently
    });
  });
});