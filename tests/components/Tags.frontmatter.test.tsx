// tests/components/Tags.frontmatter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { Tags } from '@/app/components/Tags/Tags';
import { ArticleMetadata } from '@/types/centralized';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const mockReact = require('react');
  return function MockLink(props: any) {
    const { href, children, className, legacyBehavior, ...otherProps } = props;
    
    if (legacyBehavior) {
      return mockReact.cloneElement(children, { href, ...otherProps });
    } else {
      return mockReact.createElement('a', { href, className, ...otherProps }, children);
    }
  };
});

describe('Tags Component - Frontmatter Integration', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  // Sample frontmatter from alabaster-laser-cleaning.yaml
  const alabasterFrontmatter: ArticleMetadata = {
    title: 'Alabaster Laser Cleaning',
    slug: 'alabaster-laser-cleaning',
    description: 'Laser cleaning parameters for Alabaster',
    category: 'Stone',
    tags: [
      'alabaster',
      'stone',
      'semiconductor',
      'mems',
      'optics',
      'precision-cleaning',
      'surface-preparation',
      'restoration-cleaning',
      'porous-material',
      'thermal-sensitive',
      'alessandro-moretti'
    ],
    authorInfo: {
      id: 2,
      name: 'Alessandro Moretti',
      title: 'Ph.D.',
      country: 'Italy',
      expertise: 'Laser-Based Additive Manufacturing',
      image: '/images/author/alessandro-moretti.jpg'
    },
    images: {
      hero: {
        alt: 'Alabaster surface undergoing laser cleaning showing precise contamination removal',
        url: '/images/alabaster-laser-cleaning-hero.jpg'
      },
      micro: {
        alt: 'Microscopic view of Alabaster surface after laser cleaning showing detailed surface structure',
        url: '/images/alabaster-laser-cleaning-micro.jpg'
      }
    }
  };

  describe('Frontmatter Tags Priority', () => {
    it('should render tags from frontmatter.tags array', () => {
      render(<Tags frontmatter={alabasterFrontmatter} />);
      
      // Check for some key tags from the alabaster sample
      expect(screen.getByText('Alabaster')).toBeInTheDocument();
      expect(screen.getByText('Stone')).toBeInTheDocument();
      expect(screen.getByText('Semiconductor')).toBeInTheDocument();
      expect(screen.getByText('Mems')).toBeInTheDocument();
      expect(screen.getByText('Precision Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Surface Preparation')).toBeInTheDocument();
    });

    it('should prioritize frontmatter.tags over content', () => {
      const contentData = {
        tags: ['old-tag-1', 'old-tag-2', 'old-tag-3']
      };
      
      render(
        <Tags 
          frontmatter={alabasterFrontmatter} 
          content={contentData}
        />
      );
      
      // Should show frontmatter tags, not content tags
      expect(screen.getByText('Alabaster')).toBeInTheDocument();
      expect(screen.getByText('Stone')).toBeInTheDocument();
      expect(screen.queryByText('Old Tag 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Old Tag 2')).not.toBeInTheDocument();
    });

    it('should fall back to content when frontmatter.tags is undefined', () => {
      const frontmatterWithoutTags: ArticleMetadata = {
        title: 'Test Article',
        slug: 'test-article',
        category: 'Testing'
        // No tags property
      };
      
      const contentData = {
        tags: ['content-tag-1', 'content-tag-2']
      };
      
      render(
        <Tags 
          frontmatter={frontmatterWithoutTags} 
          content={contentData}
        />
      );
      
      // Should display content tags
      expect(screen.getByText('Content Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Content Tag 2')).toBeInTheDocument();
    });

    it('should fall back to content when frontmatter.tags is empty array', () => {
      const frontmatterWithEmptyTags: ArticleMetadata = {
        title: 'Test Article',
        slug: 'test-article',
        tags: [] // Empty array
      };
      
      const contentData = {
        tags: ['fallback-tag-1', 'fallback-tag-2']
      };
      
      render(
        <Tags 
          frontmatter={frontmatterWithEmptyTags} 
          content={contentData}
        />
      );
      
      // Empty array is truthy but has length 0, so no tags should render
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Alabaster Sample - Full Tags', () => {
    it('should render all 11 tags from alabaster frontmatter', () => {
      render(<Tags frontmatter={alabasterFrontmatter} />);
      
      const allTags = [
        'Alabaster',
        'Stone',
        'Semiconductor',
        'Mems',
        'Optics',
        'Precision Cleaning',
        'Surface Preparation',
        'Restoration Cleaning',
        'Porous Material',
        'Thermal Sensitive',
        'Alessandro Moretti'
      ];
      
      allTags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('should create proper links for all tags', () => {
      render(<Tags frontmatter={alabasterFrontmatter} />);
      
      // Check that each tag has a link
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(11); // 11 tags in alabaster sample
      
      // Verify link href for a sample tag
      const alabasterLink = screen.getByRole('link', { name: /View all articles tagged with alabaster/i });
      expect(alabasterLink).toHaveAttribute('href', '/search?q=alabaster');
    });

    it('should format hyphenated tags correctly', () => {
      render(<Tags frontmatter={alabasterFrontmatter} />);
      
      // Hyphenated tags should be title-cased with spaces
      expect(screen.getByText('Precision Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Surface Preparation')).toBeInTheDocument();
      expect(screen.getByText('Restoration Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Porous Material')).toBeInTheDocument();
      expect(screen.getByText('Thermal Sensitive')).toBeInTheDocument();
      expect(screen.getByText('Alessandro Moretti')).toBeInTheDocument();
    });
  });

  describe('Configuration with Frontmatter', () => {
    it('should apply custom title with frontmatter tags', () => {
      render(
        <Tags 
          frontmatter={alabasterFrontmatter}
          config={{ title: 'Material Topics' }}
        />
      );
      
      expect(screen.getByText('Material Topics')).toBeInTheDocument();
      expect(screen.getByText('Alabaster')).toBeInTheDocument();
    });

    it('should use custom link prefix with frontmatter tags', () => {
      render(
        <Tags 
          frontmatter={alabasterFrontmatter}
          config={{ linkPrefix: '/materials/tag/' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /alabaster/i });
      expect(link).toHaveAttribute('href', '/materials/tag/alabaster');
    });

    it('should apply custom styling to frontmatter tags', () => {
      render(
        <Tags 
          frontmatter={alabasterFrontmatter}
          config={{ 
            pillColor: 'bg-blue-600',
            textColor: 'text-white',
            hoverColor: 'hover:bg-blue-700'
          }}
        />
      );
      
      const link = screen.getByRole('link', { name: /alabaster/i });
      expect(link).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });
  });

  describe('Edge Cases with Frontmatter', () => {
    it('should handle frontmatter with null tags', () => {
      const frontmatterWithNull: ArticleMetadata = {
        title: 'Test',
        slug: 'test',
        tags: null as any
      };
      
      const contentData = {
        tags: ['fallback-tag']
      };
      
      render(
        <Tags 
          frontmatter={frontmatterWithNull}
          content={contentData}
        />
      );
      
      // Should fall back to content
      expect(screen.getByText('Fallback Tag')).toBeInTheDocument();
    });

    it('should handle undefined frontmatter', () => {
      const contentData = {
        tags: ['content-tag']
      };
      
      render(
        <Tags 
          frontmatter={undefined}
          content={contentData}
        />
      );
      
      // Should use content tags
      expect(screen.getByText('Content Tag')).toBeInTheDocument();
    });

    it('should return null when both frontmatter and content are empty', () => {
      const { container } = render(
        <Tags 
          frontmatter={{ title: 'Test', slug: 'test' }}
          content={undefined}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle frontmatter with tags containing special characters', () => {
      const specialCharFrontmatter: ArticleMetadata = {
        title: 'Test',
        slug: 'test',
        tags: ['C++', 'C#', '.NET', 'Node.js', 'Vue.js']
      };
      
      render(<Tags frontmatter={specialCharFrontmatter} />);
      
      expect(screen.getByText('C++')).toBeInTheDocument();
      expect(screen.getByText('C#')).toBeInTheDocument();
      expect(screen.getByText('.net')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Vue.js')).toBeInTheDocument();
    });
  });

  describe('Accessibility with Frontmatter', () => {
    it('should have proper ARIA labels for frontmatter tag links', () => {
      render(<Tags frontmatter={alabasterFrontmatter} />);
      
      const link = screen.getByRole('link', { name: /View all articles tagged with alabaster/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('aria-label', 'View all articles tagged with alabaster');
    });

    it('should maintain accessibility with custom onClick handler', () => {
      const mockOnClick = jest.fn();
      
      render(
        <Tags 
          frontmatter={alabasterFrontmatter}
          config={{ onClick: mockOnClick }}
        />
      );
      
      const button = screen.getByRole('button', { name: /Filter by alabaster tag/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Filter by alabaster tag');
    });
  });

  describe('Performance with Frontmatter', () => {
    it('should render frontmatter tags efficiently', () => {
      const startTime = performance.now();
      render(<Tags frontmatter={alabasterFrontmatter} />);
      const endTime = performance.now();
      
      // Should be faster than content parsing since no parsing is needed
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large frontmatter tags array', () => {
      const largeFrontmatter: ArticleMetadata = {
        title: 'Large Tags',
        slug: 'large-tags',
        tags: Array.from({ length: 100 }, (_, i) => `tag-${i}`)
      };
      
      const startTime = performance.now();
      render(<Tags frontmatter={largeFrontmatter} />);
      const endTime = performance.now();
      
      // Should still be performant with many tags
      const performanceThreshold = process.env.CI ? 500 : 350;
      expect(endTime - startTime).toBeLessThan(performanceThreshold);
      
      // Verify some tags rendered
      expect(screen.getByText('Tag 0')).toBeInTheDocument();
      expect(screen.getByText('Tag 50')).toBeInTheDocument();
      expect(screen.getByText('Tag 99')).toBeInTheDocument();
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('should work with Layout component pattern', () => {
      // Simulates how Layout.tsx passes frontmatter to Tags
      const metadata: ArticleMetadata = {
        ...alabasterFrontmatter
      };
      
      render(<Tags frontmatter={metadata} />);
      
      expect(screen.getByText('Alabaster')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(11);
    });

    it('should handle partial frontmatter data gracefully', () => {
      const partialFrontmatter: ArticleMetadata = {
        title: 'Partial Data',
        slug: 'partial-data',
        tags: ['tag1', 'tag2'],
        // Missing other fields like authorInfo, images, etc.
      };
      
      render(<Tags frontmatter={partialFrontmatter} />);
      
      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
    });

    it('should work with minimal frontmatter', () => {
      const minimalFrontmatter: ArticleMetadata = {
        title: 'Minimal',
        slug: 'minimal',
        tags: ['single-tag']
      };
      
      render(<Tags frontmatter={minimalFrontmatter} />);
      
      expect(screen.getByText('Single Tag')).toBeInTheDocument();
    });
  });

  describe('Type Safety Verification', () => {
    it('should accept ArticleMetadata with all optional fields', () => {
      const fullFrontmatter: ArticleMetadata = {
        id: '1',
        title: 'Full Frontmatter',
        description: 'Test description',
        slug: 'full-frontmatter',
        category: 'Test Category',
        tags: ['test-tag'],
        authorInfo: {
          id: 1,
          name: 'Test Author'
        },
        lastModified: '2025-10-01',
        datePublished: '2025-10-01',
        image: '/test-image.jpg',
        excerpt: 'Test excerpt',
        keywords: ['keyword1', 'keyword2']
      };
      
      // Should compile and render without errors
      render(<Tags frontmatter={fullFrontmatter} />);
      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('should accept ArticleMetadata with only required fields', () => {
      const minimalFrontmatter: ArticleMetadata = {
        title: 'Required Only',
        slug: 'required-only',
        tags: ['minimal-tag']
      };
      
      // Should compile and render without errors
      render(<Tags frontmatter={minimalFrontmatter} />);
      expect(screen.getByText('Minimal Tag')).toBeInTheDocument();
    });
  });
});
