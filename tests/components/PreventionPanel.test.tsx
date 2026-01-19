/**
 * Tests for PreventionPanel component
 * 
 * Verifies:
 * - Prevention strategies display with native <details> elements
 * - Category grouping and icons
 * - Severity indicators and sorting
 * - Impact, solutions, and prevention formatting
 * 
 * NOTE: Component now uses native <details> instead of Collapsible
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PreventionPanel } from '../../app/components/PreventionPanel';
import type { PreventionData, Challenge } from '../../app/components/PreventionPanel';

describe('PreventionPanel', () => {
  const mockChallenges: PreventionData = {
    thermal_management: [
      {
        challenge: 'Heat buildup during processing',
        impact: 'Material warping and damage',
        solutions: ['Use active cooling systems', 'Adjust laser power'],
        prevention: ['Monitor temperature continuously', 'Regular equipment maintenance'],
        severity: 'high'
      }
    ],
    surface_contamination: [
      {
        challenge: 'Oil residue on surface',
        impact: 'Poor cleaning results',
        solutions: ['Pre-clean with solvent', 'Use higher power'],
        prevention: ['Store materials properly', 'Use protective coatings'],
        severity: 'medium'
      }
    ]
  };

  describe('Rendering', () => {
    it('should render with challenges', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      // Component renders details elements with challenge text
      expect(screen.getByText(/Heat buildup during processing/)).toBeInTheDocument();
      expect(screen.getByText(/Oil residue on surface/)).toBeInTheDocument();
    });

    it('should render details element when challenges provided', () => {
      const { container } = render(
        <PreventionPanel challenges={mockChallenges} />
      );

      const detailsElements = container.querySelectorAll('details');
      // Should have at least one details element for each challenge
      expect(detailsElements.length).toBeGreaterThan(0);
    });

    it('should render placeholder when no challenges provided', () => {
      render(
        <PreventionPanel challenges={{}} />
      );

      expect(screen.getByText(/No prevention strategies available/)).toBeInTheDocument();
    });

    it('should render placeholder when challenges is undefined', () => {
      render(
        <PreventionPanel challenges={undefined as any} />
      );

      expect(screen.getByText(/No prevention strategies available/)).toBeInTheDocument();
    });
  });

  describe('Category Icons', () => {
    it('should display challenge text', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      // Icon is rendered with CheckCircle from lucide
      expect(screen.getByText(/Heat buildup/)).toBeInTheDocument();
    });

    it('should display surface contamination text', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      expect(screen.getByText(/Oil residue/)).toBeInTheDocument();
    });

    it('should render unknown categories gracefully', () => {
      const unknownCategoryChallenge: PreventionData = {
        unknown_category: [
          {
            challenge: 'Test challenge',
            impact: 'Test impact',
            solutions: ['Test solution'],
            prevention: ['Test prevention']
          }
        ]
      };

      render(
        <PreventionPanel challenges={unknownCategoryChallenge} />
      );

      expect(screen.getByText(/Test challenge/)).toBeInTheDocument();
    });
  });

  describe('Category Formatting', () => {
    it('should format category names correctly', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      // Categories are formatted by replacing underscores with spaces
      expect(screen.getByText(/thermal management/i)).toBeInTheDocument();
      expect(screen.getByText(/surface contamination/i)).toBeInTheDocument();
    });
  });

  describe('Severity Handling', () => {
    it('should display severity with challenges', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      // Severity should be displayed in challenge text
      expect(screen.getByText(/high severity/)).toBeInTheDocument();
      expect(screen.getByText(/medium severity/)).toBeInTheDocument();
    });

    it('should handle challenges with severity levels', () => {
      const mixedSeverityChallenges: PreventionData = {
        category1: [
          {
            challenge: 'Low priority',
            impact: 'Minor issue',
            solutions: ['Fix it'],
            prevention: ['Prevent it'],
            severity: 'low'
          }
        ],
        category2: [
          {
            challenge: 'Critical issue',
            impact: 'Major problem',
            solutions: ['Fix now'],
            prevention: ['Prevent now'],
            severity: 'critical'
          }
        ],
        category3: [
          {
            challenge: 'Medium priority',
            impact: 'Moderate issue',
            solutions: ['Fix soon'],
            prevention: ['Prevent soon'],
            severity: 'medium'
          }
        ]
      };

      render(
        <PreventionPanel challenges={mixedSeverityChallenges} />
      );

      // All severity levels should be displayed
      expect(screen.getByText(/critical severity/)).toBeInTheDocument();
      expect(screen.getByText(/medium severity/)).toBeInTheDocument();
      expect(screen.getByText(/low severity/)).toBeInTheDocument();
    });
  });

  describe('Content Formatting', () => {
    it('should display impact section', () => {
      render(
        <PreventionPanel challenges={{ category1: mockChallenges.thermal_management }} />
      );

      expect(screen.getByText('Impact')).toBeInTheDocument();
      expect(screen.getByText('Material warping and damage')).toBeInTheDocument();
    });

    it('should display prevention solutions section', () => {
      render(
        <PreventionPanel challenges={{ category1: mockChallenges.thermal_management }} />
      );

      expect(screen.getByText('Prevention Solutions')).toBeInTheDocument();
      expect(screen.getByText('Use active cooling systems')).toBeInTheDocument();
      expect(screen.getByText('Adjust laser power')).toBeInTheDocument();
    });

    it('should display prevention threshold section', () => {
      render(
        <PreventionPanel challenges={{ category1: mockChallenges.thermal_management }} />
      );

      expect(screen.getByText('Threshold')).toBeInTheDocument();
      expect(screen.getByText(/Monitor temperature continuously/)).toBeInTheDocument();
      expect(screen.getByText(/Regular equipment maintenance/)).toBeInTheDocument();
    });

    it('should handle missing optional fields', () => {
      const minimalChallenge: PreventionData = {
        category1: [
          {
            challenge: 'Minimal challenge',
            impact: '',
            solutions: [],
            prevention: []
          }
        ]
      };

      render(
        <PreventionPanel challenges={minimalChallenge} />
      );

      // Should not crash, just won't show empty sections
      // challengeName includes icon prefix
      expect(screen.getByText(/Minimal challenge/)).toBeInTheDocument();
    });
  });

  describe('Multiple Categories', () => {
    it('should handle multiple challenges in same category', () => {
      const multipleInCategory: PreventionData = {
        thermal_management: [
          {
            challenge: 'Challenge 1',
            impact: 'Impact 1',
            solutions: ['Solution 1'],
            prevention: ['Prevention 1']
          },
          {
            challenge: 'Challenge 2',
            impact: 'Impact 2',
            solutions: ['Solution 2'],
            prevention: ['Prevention 2']
          }
        ]
      };

      render(
        <PreventionPanel challenges={multipleInCategory} />
      );

      expect(screen.getByText(/Challenge 1/)).toBeInTheDocument();
      expect(screen.getByText(/Challenge 2/)).toBeInTheDocument();
    });

    it('should handle non-array category values gracefully', () => {
      const invalidData: any = {
        thermal_management: 'not an array',
        surface_contamination: mockChallenges.surface_contamination
      };

      render(
        <PreventionPanel challenges={invalidData} />
      );

      // Should only render valid categories (surface contamination)
      expect(screen.getByText(/Oil residue/)).toBeInTheDocument();
      // Invalid category should be skipped without crashing
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PreventionPanel
          challenges={mockChallenges}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
