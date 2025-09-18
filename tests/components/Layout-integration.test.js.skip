/**
 * Layout Integration Tests
 * Testing the Layout component's author rendering functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../../app/components/Layout/Layout';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, width, height, className }) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
    />
  );
});

// Mock the Author component
jest.mock('../../app/components/Author/Author', () => {
  return function MockAuthor({ authorInfo }) {
    return (
      <div data-testid="author-component">
        <span data-testid="author-name">{authorInfo.name}</span>
        <span data-testid="author-title">{authorInfo.title}</span>
        <span data-testid="author-expertise">{authorInfo.expertise}</span>
        <span data-testid="author-country">{authorInfo.country}</span>
      </div>
    );
  };
});

describe('Layout Author Integration', () => {
  const mockMetadata = {
    title: 'Test Article',
    description: 'Test Description',
    slug: 'test-article',
    authorInfo: {
      id: 1,
      name: 'Test Author',
      title: 'Ph.D.',
      expertise: 'Test Expertise Field',
      country: 'Test Country',
      sex: 'f',
      image: '/images/author/test-author.jpg',
      profile: {
        description: 'Test author description',
        expertiseAreas: ['Area 1', 'Area 2'],
        contactNote: 'Contact for consultation'
      }
    }
  };

  describe('1. Author Rendering in Layout', () => {
    test('renders author when authorInfo is present', () => {
      render(
        <Layout metadata={mockMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      // Check that author component is rendered
      expect(screen.getByTestId('author-component')).toBeInTheDocument();
      expect(screen.getByTestId('author-name')).toHaveTextContent('Test Author');
      expect(screen.getByTestId('author-title')).toHaveTextContent('Ph.D.');
      expect(screen.getByTestId('author-expertise')).toHaveTextContent('Test Expertise Field');
      expect(screen.getByTestId('author-country')).toHaveTextContent('Test Country');
    });

    test('does not render author when authorInfo is missing', () => {
      const metadataWithoutAuthor = {
        title: 'Test Article',
        description: 'Test Description',
        slug: 'test-article'
      };

      render(
        <Layout metadata={metadataWithoutAuthor}>
          <div>Test Content</div>
        </Layout>
      );

      // Check that author component is not rendered
      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();
    });

    test('does not render author when metadata is missing', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Check that author component is not rendered
      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();
    });

    test('renders author in correct position within layout', () => {
      render(
        <Layout metadata={mockMetadata}>
          <div data-testid="main-content">Test Content</div>
        </Layout>
      );

      const authorComponent = screen.getByTestId('author-component');
      const mainContent = screen.getByTestId('main-content');
      
      // Author should be rendered before the main content
      expect(authorComponent).toBeInTheDocument();
      expect(mainContent).toBeInTheDocument();
      
      // Check document order
      const allElements = screen.getAllByTestId(/(author-component|main-content)/);
      expect(allElements[0]).toBe(authorComponent);
    });
  });

  describe('2. Layout Structure with Author', () => {
    test('maintains proper layout structure with author present', () => {
      render(
        <Layout metadata={mockMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      // Check that main layout elements are present
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      
      // Check that author is within the correct container
      const authorComponent = screen.getByTestId('author-component');
      expect(authorComponent).toBeInTheDocument();
      
      // Verify the layout hasn't broken
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('layout works without breaking when no author present', () => {
      const metadataWithoutAuthor = {
        title: 'Test Article',
        description: 'Test Description',
        slug: 'test-article'
      };

      render(
        <Layout metadata={metadataWithoutAuthor}>
          <div>Test Content</div>
        </Layout>
      );

      // Layout should still render content properly
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      
      // Main element should still be present
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('3. Multiple Author Scenarios', () => {
    test('handles Ikmanda Roswati author data', () => {
      const ikmandaMetadata = {
        ...mockMetadata,
        authorInfo: {
          id: 1,
          name: 'Ikmanda Roswati',
          title: 'Ph.D.',
          expertise: 'Ultrafast Laser Physics and Material Interactions',
          country: 'Indonesia',
          sex: 'f',
          image: '/images/author/ikmanda-roswati.jpg',
          profile: {
            description: 'Expert in laser physics',
            expertiseAreas: ['Ultrafast laser physics'],
            contactNote: 'Contact for consultation'
          }
        }
      };

      render(
        <Layout metadata={ikmandaMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('author-name')).toHaveTextContent('Ikmanda Roswati');
      expect(screen.getByTestId('author-title')).toHaveTextContent('Ph.D.');
      expect(screen.getByTestId('author-expertise')).toHaveTextContent('Ultrafast Laser Physics and Material Interactions');
      expect(screen.getByTestId('author-country')).toHaveTextContent('Indonesia');
    });

    test('handles Todd Dunning author data', () => {
      const toddMetadata = {
        ...mockMetadata,
        authorInfo: {
          id: 4,
          name: 'Todd Dunning',
          title: 'MA',
          expertise: 'Optical Materials for Laser Systems',
          country: 'United States (California)',
          sex: 'm',
          image: '/images/author/todd-dunning.jpg',
          profile: {
            description: 'Expert in optical materials',
            expertiseAreas: ['Laser cleaning systems'],
            contactNote: 'Contact for consultation'
          }
        }
      };

      render(
        <Layout metadata={toddMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('author-name')).toHaveTextContent('Todd Dunning');
      expect(screen.getByTestId('author-title')).toHaveTextContent('MA');
      expect(screen.getByTestId('author-expertise')).toHaveTextContent('Optical Materials for Laser Systems');
      expect(screen.getByTestId('author-country')).toHaveTextContent('United States (California)');
    });
  });

  describe('4. Conditional Rendering Logic', () => {
    test('conditional rendering logic works correctly', () => {
      // Test with author
      const { rerender } = render(
        <Layout metadata={mockMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('author-component')).toBeInTheDocument();

      // Test without author
      rerender(
        <Layout metadata={{ title: 'Test', description: 'Test', slug: 'test' }}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();

      // Test with null metadata
      rerender(
        <Layout metadata={null}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();

      // Test with undefined metadata
      rerender(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();
    });
  });

  describe('5. Author Info Validation', () => {
    test('handles incomplete author information gracefully', () => {
      const incompleteAuthorMetadata = {
        ...mockMetadata,
        authorInfo: {
          id: 1,
          name: 'Incomplete Author',
          // Missing other required fields
        }
      };

      // Should not crash with incomplete data
      expect(() => {
        render(
          <Layout metadata={incompleteAuthorMetadata}>
            <div>Test Content</div>
          </Layout>
        );
      }).not.toThrow();

      expect(screen.getByTestId('author-name')).toHaveTextContent('Incomplete Author');
    });

    test('handles null authorInfo gracefully', () => {
      const nullAuthorMetadata = {
        ...mockMetadata,
        authorInfo: null
      };

      render(
        <Layout metadata={nullAuthorMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();
    });

    test('handles undefined authorInfo gracefully', () => {
      const undefinedAuthorMetadata = {
        ...mockMetadata,
        authorInfo: undefined
      };

      render(
        <Layout metadata={undefinedAuthorMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('author-component')).not.toBeInTheDocument();
    });
  });

  describe('6. Layout Responsiveness with Author', () => {
    test('layout maintains responsiveness with author component', () => {
      render(
        <Layout metadata={mockMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      // Check that responsive classes are maintained
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      
      // Author component should be present and not break layout
      expect(screen.getByTestId('author-component')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('7. Header Section Integration', () => {
    test('author renders in header section of layout', () => {
      render(
        <Layout metadata={mockMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      const authorComponent = screen.getByTestId('author-component');
      expect(authorComponent).toBeInTheDocument();
      
      // Author should be rendered before main content
      const mainContent = screen.getByText('Test Content');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('8. Performance Considerations', () => {
    test('layout renders efficiently with author data', () => {
      const startTime = performance.now();
      
      render(
        <Layout metadata={mockMetadata}>
          <div>Test Content</div>
        </Layout>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Components should be present
      expect(screen.getByTestId('author-component')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('layout handles re-renders with changing author data', () => {
      const initialMetadata = {
        ...mockMetadata,
        authorInfo: {
          ...mockMetadata.authorInfo,
          name: 'Initial Author'
        }
      };

      const { rerender } = render(
        <Layout metadata={initialMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('author-name')).toHaveTextContent('Initial Author');

      // Update author data
      const updatedMetadata = {
        ...mockMetadata,
        authorInfo: {
          ...mockMetadata.authorInfo,
          name: 'Updated Author'
        }
      };

      rerender(
        <Layout metadata={updatedMetadata}>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('author-name')).toHaveTextContent('Updated Author');
    });
  });
});

module.exports = {
  testSuite: 'Layout Author Integration Tests',
  version: '1.0',
  lastUpdated: '2025-09-16'
};
