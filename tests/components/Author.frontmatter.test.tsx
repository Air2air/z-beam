// tests/integration/author-frontmatter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Author } from '@/app/components/Author/Author';
import { ArticleMetadata } from '@/types/centralized';
import { SITE_CONFIG } from '@/config';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, priority, fill, blurDataURL, fetchPriority, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Author Component with Frontmatter Data', () => {
  const mockFrontmatter: ArticleMetadata = {
    title: 'Float Glass Laser Cleaning',
    description: 'Laser cleaning parameters for Float Glass',
    slug: 'float-glass-laser-cleaning',
    author: {
      id: 1,
      name: 'Yi-Chun Lin',
      title: 'Ph.D.',
      country: 'Taiwan',
      expertiseAreas: ['Laser Materials Processing'],
      image: '/images/author/yi-chun-lin.jpg',
      email: 'yi-chun.lin@example.com',
      affiliation: 'Research Institute'
    }
  };

  test('should render author information from frontmatter data', () => {
    render(
      <Author
        frontmatter={mockFrontmatter}
        showAvatar={true}
        showCredentials={true}
        showCountry={true}
        showSpecialties={true}
        className="test-author"
      />
    );

    // Check if author name is rendered
    expect(screen.getByText('Yi-Chun Lin')).toBeInTheDocument();
    
    // Check if author title/credentials are shown
    expect(screen.getByText('Ph.D.')).toBeInTheDocument();
    
    // Check if country is shown
    expect(screen.getByText(/Taiwan/)).toBeInTheDocument();
    
    // Check if expertise is shown
    expect(screen.getByText(/Laser Materials Processing/)).toBeInTheDocument();
  });

  test('should handle missing author data gracefully', () => {
    const frontmatterWithoutAuthor: ArticleMetadata = {
      title: 'Test Article',
      slug: 'test-article'
    };

    const { container } = render(
      <Author
        frontmatter={frontmatterWithoutAuthor}
        showAvatar={true}
        showCredentials={true}
      />
    );

    // Should render fallback author from SITE_CONFIG when no author data is provided
    expect(container.textContent).toContain(SITE_CONFIG.author);
  });

  test('should use frontmatter.author exclusively (no individual props)', () => {
    render(
      <Author
        frontmatter={mockFrontmatter}
        showAvatar={true}
        showCredentials={true}
        showCountry={true}
        showSpecialties={true}
      />
    );

    // Verify data comes from frontmatter.author
    expect(screen.getByText('Yi-Chun Lin')).toBeInTheDocument();
    expect(screen.getByText('Ph.D.')).toBeInTheDocument();
    expect(screen.getByText(/Taiwan/)).toBeInTheDocument();
    expect(screen.getByText(/Laser Materials Processing/)).toBeInTheDocument();
  });

  test('should support display option toggles', () => {
    // Test with all options disabled
    render(
      <Author
        frontmatter={mockFrontmatter}
        showAvatar={false}
        showCredentials={false}
        showCountry={false}
        showSpecialties={false}
      />
    );

    // Author name should still be shown
    expect(screen.getByText('Yi-Chun Lin')).toBeInTheDocument();
  });

  test('should validate frontmatter-only architecture', () => {
    const props = {
      frontmatter: mockFrontmatter,
      showAvatar: true,
      showCredentials: true,
      showCountry: true,
      showSpecialties: true,
      className: 'test-class'
    };

    // Should not have any individual author props at the top level
    expect(props).not.toHaveProperty('name');
    expect(props).not.toHaveProperty('title');
    expect(props).not.toHaveProperty('image');
    
    // Should have frontmatter data with author field
    expect(props.frontmatter?.author).toBeDefined();
    expect(typeof props.frontmatter?.author === 'object' && props.frontmatter?.author?.name).toBe('Yi-Chun Lin');
  });
});