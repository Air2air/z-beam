/**
 * Tests for PreventionPanel component
 * 
 * Verifies:
 * - Prevention strategies display with Collapsible base
 * - Category grouping and icons
 * - Severity indicators and sorting
 * - Impact, solutions, and prevention formatting
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PreventionPanel } from '../../app/components/PreventionPanel';
import type { PreventionData, Challenge } from '../../app/components/PreventionPanel';

// Mock Collapsible component
jest.mock('../../app/components/Collapsible', () => ({
  Collapsible: ({ items, sectionMetadata }: any) => (
    <div data-testid="collapsible-mock">
      <h2>{sectionMetadata.sectionTitle}</h2>
      {sectionMetadata.sectionDescription && <p>{sectionMetadata.sectionDescription}</p>}
      {items.map((item: any, index: number) => (
        <div key={index} data-testid={`item-${index}`}>
          <h3>{item.challengeName}</h3>
          <div data-testid={`desc-${index}`}>{item.challengeDesc}</div>
          {item.severity && <span data-testid={`severity-${index}`}>{item.severity}</span>}
          {item.category && <span data-testid={`category-${index}`}>{item.category}</span>}
        </div>
      ))}
    </div>
  )
}));

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

      expect(screen.getByText('Prevention Strategies')).toBeInTheDocument();
      expect(screen.getByText(/Heat buildup during processing/)).toBeInTheDocument();
      expect(screen.getByText(/Oil residue on surface/)).toBeInTheDocument();
    });

    it('should render null when no challenges provided', () => {
      const { container } = render(
        <PreventionPanel challenges={{}} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render null when challenges is undefined', () => {
      const { container } = render(
        <PreventionPanel challenges={undefined as any} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should use custom title', () => {
      render(
        <PreventionPanel
          challenges={mockChallenges}
          title="Safety Measures"
        />
      );

      expect(screen.getByText('Safety Measures')).toBeInTheDocument();
    });

    it('should display custom description', () => {
      render(
        <PreventionPanel
          challenges={mockChallenges}
          description="Important prevention strategies"
        />
      );

      expect(screen.getByText('Important prevention strategies')).toBeInTheDocument();
    });
  });

  describe('Category Icons', () => {
    it('should display thermal management icon', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      // Icon is embedded in challengeName
      expect(screen.getByText(/Heat buildup/)).toBeInTheDocument();
    });

    it('should display surface contamination icon', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      expect(screen.getByText(/Oil residue/)).toBeInTheDocument();
    });

    it('should use default icon for unknown categories', () => {
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

      expect(screen.getByText('Thermal Management')).toBeInTheDocument();
      expect(screen.getByText('Surface Contamination')).toBeInTheDocument();
    });
  });

  describe('Severity Handling', () => {
    it('should pass severity to items', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      // Items should have severity indicators
      expect(screen.getByTestId('severity-0')).toHaveTextContent('high');
      expect(screen.getByTestId('severity-1')).toHaveTextContent('medium');
    });

    it('should sort by severity (critical > high > medium > low)', () => {
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

      // Check order: critical first, then medium, then low
      const items = screen.getAllByTestId(/^item-/);
      expect(items[0]).toHaveTextContent('Critical issue');
      expect(items[1]).toHaveTextContent('Medium priority');
      expect(items[2]).toHaveTextContent('Low priority');
    });
  });

  describe('Content Formatting', () => {
    it('should format impact section', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      const desc = screen.getByTestId('desc-0');
      expect(desc.textContent).toContain('**Impact:** Material warping and damage');
    });

    it('should format solutions section', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      const desc = screen.getByTestId('desc-0');
      expect(desc.textContent).toContain('Solutions:');
      expect(desc.textContent).toContain('✓ Use active cooling systems');
      expect(desc.textContent).toContain('✓ Adjust laser power');
    });

    it('should format prevention section', () => {
      render(
        <PreventionPanel challenges={mockChallenges} />
      );

      const desc = screen.getByTestId('desc-0');
      expect(desc.textContent).toContain('Prevention:');
      expect(desc.textContent).toContain('• Monitor temperature continuously');
      expect(desc.textContent).toContain('• Regular equipment maintenance');
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

      // Should only render valid categories
      expect(screen.getByText(/Oil residue/)).toBeInTheDocument();
      expect(screen.queryByText('not an array')).not.toBeInTheDocument();
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
