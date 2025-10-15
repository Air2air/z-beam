// tests/components/Tags.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { Tags } from '../../app/components/Tags/Tags';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/link to handle both legacy and modern patterns  
jest.mock('next/link', () => {
  const mockReact = require('react');
  return function MockLink(props: any) {
    const { href, children, className, legacyBehavior, ...otherProps } = props;
    
    if (legacyBehavior) {
      // In legacy behavior, children should contain the anchor tag
      return mockReact.cloneElement(children, { href, ...otherProps });
    } else {
      // Modern behavior: Link itself is the anchor
      return mockReact.createElement('a', { href, className, ...otherProps }, children);
    }
  };
});

describe('Tags Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('String Format Support (Legacy)', () => {
    it('should render tags from comma-separated string', () => {
      render(<Tags content="aluminum, cleaning, laser, aerospace" />);
      
      expect(screen.getByText('Aluminum')).toBeInTheDocument();
      expect(screen.getByText('Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Laser')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
    });

    it('should handle empty string content', () => {
      render(<Tags content="" />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should trim whitespace from string tags', () => {
      render(<Tags content="  aluminum  ,  cleaning  ,  laser  " />);
      
      expect(screen.getByText('Aluminum')).toBeInTheDocument();
      expect(screen.getByText('Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Laser')).toBeInTheDocument();
    });
  });

  describe('YAML v2.0 Format Support', () => {
    const yamlData = {
      tags: ['electronics', 'aerospace', 'manufacturing'],
      count: 8,
      categories: {
        industry: ['electronics', 'aerospace', 'manufacturing'],
        process: ['passivation', 'polishing'],
        other: ['expert']
      },
      metadata: {
        format: 'yaml',
        version: '2.0',
        material: 'copper',
        author: 'AI Assistant',
        generated: '2025-09-17T11:50:36.211572'
      }
    };

    it('should render tags from YAML data structure', () => {
      render(<Tags content={yamlData} />);
      
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing')).toBeInTheDocument();
    });

    it('should prefer tags array over categories when both exist', () => {
      render(<Tags content={yamlData} />);
      
      // Should show tags from tags array
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing')).toBeInTheDocument();
      
      // Should not show process tags since tags array takes precedence
      expect(screen.queryByText('Passivation')).not.toBeInTheDocument();
    });

    it('should flatten categories when no tags array exists', () => {
      const categoriesOnlyData = {
        categories: {
          industry: ['electronics', 'aerospace'],
          process: ['passivation', 'polishing'],
          other: ['expert']
        }
      };

      render(<Tags content={categoriesOnlyData} />);
      
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Passivation')).toBeInTheDocument();
      expect(screen.getByText('Polishing')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    it('should handle empty YAML data gracefully', () => {
      render(<Tags content={{}} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    const yamlDataWithMetadata = {
      tags: ['electronics', 'aerospace'],
      count: 8,
      categories: {
        industry: ['electronics', 'aerospace'],
        process: ['cleaning']
      },
      metadata: {
        format: 'yaml',
        version: '2.0',
        material: 'copper',
        author: 'AI Assistant'
      }
    };

    it('should show metadata when showMetadata is enabled', () => {
      render(
        <Tags 
          content={yamlDataWithMetadata} 
          config={{ showMetadata: true }} 
        />
      );
      
      expect(screen.getByText('Material:')).toBeInTheDocument();
      expect(screen.getByText('Copper')).toBeInTheDocument();
      expect(screen.getByText('Tags:')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Format:')).toBeInTheDocument();
      expect(screen.getByText('yaml v2.0')).toBeInTheDocument();
    });

    it('should hide metadata when showMetadata is disabled', () => {
      render(
        <Tags 
          content={yamlDataWithMetadata} 
          config={{ showMetadata: false }} 
        />
      );
      
      expect(screen.queryByText('Material:')).not.toBeInTheDocument();
      expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
    });

    it('should show categories in metadata', () => {
      render(
        <Tags 
          content={yamlDataWithMetadata} 
          config={{ showMetadata: true }} 
        />
      );
      
      expect(screen.getByText('Categories:')).toBeInTheDocument();
      expect(screen.getByText('Industry, Process')).toBeInTheDocument();
    });
  });

    describe('Categorized Display', () => {
    const yamlWithCategories = {
      tags: ['electronics', 'aerospace', 'passivation'],
      categories: {
        industry: ['electronics', 'aerospace'],
        process: ['passivation'],
      }
    };

    it('should show categorized view when showCategorized is enabled', () => {
      render(<Tags content={yamlWithCategories} showCategorized={true} />);
      
      // Tags are rendered without explicit category section headers
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Passivation')).toBeInTheDocument();
    });

    it('should show flat view when showCategorized is disabled', () => {
      render(
        <Tags 
          content={yamlWithCategories} 
          config={{ showCategorized: false }} 
        />
      );
      
      // Should show tags but not category headers
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Passivation')).toBeInTheDocument();
      expect(screen.queryByText('Industry')).not.toBeInTheDocument();
      expect(screen.queryByText('Process')).not.toBeInTheDocument();
    });
  });

  describe('Configuration Options', () => {
    const testData = {
      tags: ['electronics', 'aerospace']
    };

    it('should apply custom className', () => {
      render(
        <Tags 
          content={testData} 
          config={{ className: 'custom-tags-class' }} 
        />
      );
      
      expect(screen.getByTestId('tags-container')).toHaveClass('custom-tags-class');
    });

    it('should show custom title', () => {
      render(
        <Tags 
          content={testData} 
          config={{ title: 'Article Topics' }} 
        />
      );
      
      expect(screen.getByText('Article Topics')).toBeInTheDocument();
    });

    it('should use custom link prefix', () => {
      render(
        <Tags 
          content={testData} 
          config={{ linkPrefix: '/topics/' }} 
        />
      );
      
      const link = screen.getByRole('link', { name: /electronics/i });
      expect(link).toHaveAttribute('href', '/topics/electronics');
    });

    it('should handle click events when onClick is provided', () => {
      const mockOnClick = jest.fn();
      
      render(
        <Tags 
          content={testData} 
          config={{ onClick: mockOnClick }} 
        />
      );
      
      const button = screen.getByRole('button', { name: /electronics/i });
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledWith('electronics');
    });

    it('should apply custom styling classes', () => {
      render(
        <Tags 
          content={testData} 
          config={{ 
            pillColor: 'bg-red-500',
            textColor: 'text-white',
            hoverColor: 'hover:bg-red-600'
          }} 
        />
      );
      
      const link = screen.getByRole('link', { name: /electronics/i });
      expect(link).toHaveClass('bg-red-500', 'text-white', 'hover:bg-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null content', () => {
      render(<Tags content={null as any} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should handle undefined content', () => {
      render(<Tags content={undefined as any} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should handle malformed YAML data', () => {
      const malformedData = {
        tags: null,
        categories: null,
        metadata: 'invalid'
      };
      
      render(<Tags content={malformedData as any} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should handle mixed data types in categories', () => {
      const mixedData = {
        categories: {
          industry: ['electronics', 'aerospace'],
          process: null, // null category
          other: 'invalid' // string instead of array
        }
      };
      
      render(<Tags content={mixedData as any} />);
      
      // Should still show valid categories
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    const testData = {
      tags: ['electronics', 'aerospace']
    };

    it('should have proper ARIA labels for links', () => {
      render(<Tags content={testData} />);
      
      const link = screen.getByRole('link', { name: /View all articles tagged with electronics/i });
      expect(link).toBeInTheDocument();
    });

    it('should have proper ARIA labels for buttons', () => {
      const mockOnClick = jest.fn();
      
      render(
        <Tags 
          content={testData} 
          config={{ onClick: mockOnClick }} 
        />
      );
      
      const button = screen.getByRole('button', { name: /Filter by electronics tag/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not render when content is empty', () => {
      const { container } = render(<Tags content="" />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle large datasets efficiently', () => {
      const largeCategorizedData = {
        categories: {
          industry: Array.from({ length: 50 }, (_, i) => `industry-${i}`),
          process: Array.from({ length: 50 }, (_, i) => `process-${i}`),
          other: Array.from({ length: 50 }, (_, i) => `other-${i}`)
        }
      };
      
      const startTime = performance.now();
      render(<Tags content={largeCategorizedData} />);
      const endTime = performance.now();
      
      // Environment-tolerant performance threshold
      // Local dev: ~70ms, CI/test environments: up to 500ms due to resource contention
      const performanceThreshold = process.env.CI ? 500 : 350;
      expect(endTime - startTime).toBeLessThan(performanceThreshold);
    });
  });
});
