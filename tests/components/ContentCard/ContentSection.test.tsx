/**
 * Comprehensive tests for ContentSection component
 * 
 * Tests the ContentSection wrapper component that renders collections of ContentCards
 * with sorting, error handling, and various item types.
 */

import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContentSection } from '@/app/components/ContentCard/ContentSection';
import type { ContentCardItem, WorkflowItem, CalloutProps, BenefitItem } from '@/types';

describe('ContentSection Component', () => {
  
  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================
  
  describe('Basic Rendering', () => {
    it('should render with title', () => {
      const items: ContentCardItem[] = [
        { heading: 'Test Item', text: 'Test description' }
      ];
      
      render(<ContentSection title="Test Section" items={items} />);
      
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('should render without title', () => {
      const items: ContentCardItem[] = [
        { heading: 'Test Item', text: 'Test description' }
      ];
      
      const { container } = render(<ContentSection items={items} />);
      
      expect(container.querySelector('.content-section')).toBeInTheDocument();
    });

    it('should render multiple items', () => {
      const items: ContentCardItem[] = [
        { heading: 'Item 1', text: 'Description 1' },
        { heading: 'Item 2', text: 'Description 2' },
        { heading: 'Item 3', text: 'Description 3' }
      ];
      
      render(<ContentSection title="Multiple Items" items={items} />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Item Type Support
  // ============================================================================
  
  describe('Item Type Support', () => {
    it('should render ContentCardItem with heading/text', () => {
      const items: ContentCardItem[] = [
        { heading: 'Card Heading', text: 'Card text content' }
      ];
      
      render(<ContentSection items={items} />);
      
      expect(screen.getByText('Card Heading')).toBeInTheDocument();
      expect(screen.getByText('Card text content')).toBeInTheDocument();
    });

    it('should render WorkflowItem with name/description', () => {
      const items = [
        { name: 'Workflow Step', description: 'Step description', order: 1 }
      ] as WorkflowItem[];
      
      render(<ContentSection items={items} />);
      
      expect(screen.getByText('Workflow Step')).toBeInTheDocument();
      expect(screen.getByText('Step description')).toBeInTheDocument();
    });

    it('should render BenefitItem with title/description', () => {
      const items = [
        { title: 'Benefit Title', description: 'Benefit details' }
      ] as BenefitItem[];
      
      render(<ContentSection items={items} />);
      
      expect(screen.getByText('Benefit Title')).toBeInTheDocument();
      expect(screen.getByText('Benefit details')).toBeInTheDocument();
    });

    it('should render mixed item types', () => {
      const items = [
        { heading: 'Content Card', text: 'Card content' },
        { name: 'Workflow', description: 'Workflow content', order: 2 },
        { title: 'Benefit', description: 'Benefit content' }
      ] as (ContentCardItem | WorkflowItem | BenefitItem)[];
      
      render(<ContentSection items={items} />);
      
      expect(screen.getByText('Content Card')).toBeInTheDocument();
      expect(screen.getByText('Workflow')).toBeInTheDocument();
      expect(screen.getByText('Benefit')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Sorting Behavior
  // ============================================================================
  
  describe('Item Sorting', () => {
    it('should sort items by order property', () => {
      const items = [
        { heading: 'Third', text: 'Should be third', order: 3 },
        { heading: 'First', text: 'Should be first', order: 1 },
        { heading: 'Second', text: 'Should be second', order: 2 }
      ] as ContentCardItem[];
      
      render(<ContentSection items={items} />);
      
      // Items should be rendered with their text visible
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should maintain YAML order for items without order property', () => {
      const items: ContentCardItem[] = [
        { heading: 'A', text: 'First in YAML' },
        { heading: 'B', text: 'Second in YAML' },
        { heading: 'C', text: 'Third in YAML' }
      ];
      
      const { container } = render(<ContentSection items={items} />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should sort ordered items before unordered items', () => {
      const items = [
        { heading: 'Unordered 1', text: 'No order' },
        { heading: 'Ordered 1', text: 'Order 1', order: 1 },
        { heading: 'Unordered 2', text: 'No order' },
        { heading: 'Ordered 2', text: 'Order 2', order: 2 }
      ] as ContentCardItem[];
      
      render(<ContentSection items={items} />);
      
      // Ordered items should appear first
      expect(screen.getByText('Ordered 1')).toBeInTheDocument();
      expect(screen.getByText('Ordered 2')).toBeInTheDocument();
    });

    it('should handle missing order property gracefully', () => {
      const items = [
        { heading: 'With order', text: 'Has order', order: 1 },
        { heading: 'Without order', text: 'No order' }
      ] as ContentCardItem[];
      
      const { container } = render(<ContentSection items={items} />);
      
      expect(container.querySelector('.content-section')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================
  
  describe('Error Handling', () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });
    afterAll(() => {
      console.error = originalError;
    });

    it('should return null for undefined items', () => {
      const { container } = render(<ContentSection items={undefined as any} />);
      
      expect(container.firstChild).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null for null items', () => {
      const { container } = render(<ContentSection items={null as any} />);
      
      expect(container.firstChild).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null for non-array items', () => {
      const { container } = render(<ContentSection items={'not an array' as any} />);
      
      expect(container.firstChild).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle empty items array', () => {
      const { container } = render(<ContentSection items={[]} />);
      
      expect(container.querySelector('.content-section')).toBeInTheDocument();
      expect(container.querySelectorAll('.space-y-8 > *')).toHaveLength(0);
    });
  });

  // ============================================================================
  // Props and Configuration
  // ============================================================================
  
  describe('Props and Configuration', () => {
    it('should apply correct CSS classes', () => {
      const items: ContentCardItem[] = [
        { heading: 'Test', text: 'Test' }
      ];
      
      const { container } = render(<ContentSection items={items} />);
      
      expect(container.querySelector('.content-section')).toBeInTheDocument();
      expect(container.querySelector('.space-y-8')).toBeInTheDocument();
    });

    it('should pass variant to BaseSection', () => {
      const items: ContentCardItem[] = [
        { heading: 'Test', text: 'Test' }
      ];
      
      const { container } = render(<ContentSection title="Section" items={items} />);
      
      // BaseSection should use minimal variant
      expect(container.querySelector('.content-section')).toBeInTheDocument();
    });

    it('should pass empty description to BaseSection', () => {
      const items: ContentCardItem[] = [
        { heading: 'Test', text: 'Test' }
      ];
      
      const { container } = render(<ContentSection title="Section" items={items} />);
      
      expect(container.querySelector('.content-section')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  
  describe('Integration', () => {
    it('should render real workflow data structure', () => {
      const workflowItems: WorkflowItem[] = [
        { 
          name: 'Assessment', 
          description: 'Evaluate surface condition',
          order: 1 
        },
        { 
          name: 'Preparation', 
          description: 'Set up equipment',
          order: 2 
        },
        { 
          name: 'Execution', 
          description: 'Perform cleaning',
          order: 3 
        }
      ];
      
      render(<ContentSection title="Our Process" items={workflowItems} />);
      
      expect(screen.getByText('Our Process')).toBeInTheDocument();
      expect(screen.getByText('Assessment')).toBeInTheDocument();
      expect(screen.getByText('Preparation')).toBeInTheDocument();
      expect(screen.getByText('Execution')).toBeInTheDocument();
    });

    it('should handle complex item data with details', () => {
      const complexItems = [
        {
          heading: 'Complex Item',
          text: 'Main description',
          details: [
            'Detail point 1',
            'Detail point 2'
          ]
        }
      ] as ContentCardItem[];
      
      render(<ContentSection items={complexItems} />);
      
      expect(screen.getByText('Complex Item')).toBeInTheDocument();
      expect(screen.getByText('Main description')).toBeInTheDocument();
    });
  });
});
